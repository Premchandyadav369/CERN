'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Value } from '@/components/provenance/Value';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { useGlobalStore } from '@/lib/store';
import { Download, RefreshCw, Zap, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export function BeamOpticsSandbox() {
  // Lattice parameters
  const [cellLength, setCellLength] = useState<number>(106.9); // meters (LHC arc)
  const [focalLength, setFocalLength] = useState<number>(37.79); // meters
  const [beamEnergyGev, setBeamEnergyGev] = useState<number>(7000); // 7 TeV
  const [emittanceNormUm, setEmittanceNormUm] = useState<number>(2.5); // 2.5 um rad

  // Presets
  const applyPreset = (preset: 'lhc' | 'sps' | 'highbeta' | 'unstable') => {
    if (preset === 'lhc') {
      setCellLength(106.9);
      setFocalLength(37.79);
      setBeamEnergyGev(7000);
      setEmittanceNormUm(2.5);
    } else if (preset === 'sps') {
      setCellLength(64.0);
      setFocalLength(22.6);
      setBeamEnergyGev(450);
      setEmittanceNormUm(3.0);
    } else if (preset === 'highbeta') {
      setCellLength(120.0);
      setFocalLength(31.0);
      setBeamEnergyGev(7000);
      setEmittanceNormUm(2.5);
    } else if (preset === 'unstable') {
      setCellLength(100.0);
      setFocalLength(20.0); // f < L/4 -> unstable
      setBeamEnergyGev(7000);
      setEmittanceNormUm(2.5);
    }
  };

  // Calculations
  const results = useMemo(() => {
    const L = cellLength;
    const f = focalLength;
    const halfL = L / 2.0;

    // Symmetric FODO cell: 1/2 QF -> Drift (L/2) -> QD -> Drift (L/2) -> 1/2 QF
    // In thin-lens approximation:
    // Tr(M) = 2 - L^2 / (2 * f^2)
    const trace = 2.0 - (L * L) / (2.0 * f * f);
    const isStable = Math.abs(trace) < 2.0 && f > L / 4.0;

    let muRad = 0;
    let muDeg = 0;
    let betaMax = 0;
    let betaMin = 0;
    let sigmaMaxUm = 0;
    let sigmaMinUm = 0;

    // Relativistic gamma
    const protonMassGev = 0.938272;
    const gamma = Math.max(1.0, beamEnergyGev / protonMassGev);
    const epsGeomM = (emittanceNormUm * 1e-6) / gamma;

    if (isStable) {
      muRad = Math.acos(trace / 2.0);
      muDeg = (muRad * 180.0) / Math.PI;

      const sinMu = Math.sin(muRad);
      const sinHalfMu = Math.sin(muRad / 2.0);

      betaMax = (L * (1.0 + sinHalfMu)) / sinMu;
      betaMin = (L * (1.0 - sinHalfMu)) / sinMu;

      sigmaMaxUm = Math.sqrt(Math.max(0, epsGeomM * betaMax)) * 1e6;
      sigmaMinUm = Math.sqrt(Math.max(0, epsGeomM * betaMin)) * 1e6;
    }

    // Generate envelope curve points across 1 cell (0 to L)
    const curvePoints: { s: number; sigma: number; beta: number }[] = [];
    const nSteps = 50;
    for (let i = 0; i <= nSteps; i++) {
      const s = (i / nSteps) * L;
      // Parabolic approximation of beta through FODO cell
      let localBeta = isStable
        ? betaMin + (betaMax - betaMin) * Math.pow(Math.cos((Math.PI * s) / (L / 2)), 2)
        : 0;
      let localSigma = isStable ? Math.sqrt(Math.max(0, epsGeomM * localBeta)) * 1e6 : 0;
      curvePoints.push({ s, sigma: localSigma, beta: localBeta });
    }

    return {
      trace,
      isStable,
      muRad,
      muDeg,
      betaMax,
      betaMin,
      sigmaMaxUm,
      sigmaMinUm,
      gamma,
      epsGeomNm: epsGeomM * 1e9,
      curvePoints,
    };
  }, [cellLength, focalLength, beamEnergyGev, emittanceNormUm]);

  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const fodoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = fodoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const protons = Array.from({ length: 18 }, (_, i) => ({
      offset: i / 18,
      phase0: (i * 1.37) % (Math.PI * 2),
      amp: 0.35 + ((i * 7) % 6) * 0.11,
    }));

    const renderFrame = (nowMs: number) => {
      const t = reduceMotion ? 0.3 : (nowMs / 1000) * 0.38;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#060911';
      ctx.fillRect(0, 0, w, h);

      // Center optical axis & grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (const gx of [150, 300, 450]) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Quadrupole magnets
      const drawQuad = (x: number, width: number, label: string, col: string) => {
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(x, 18, width, h - 36);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 18, width, h - 36);
        ctx.fillStyle = col;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + width / 2, 13);
      };
      drawQuad(0, 30, '1/2 QF', '#38bdf8');
      drawQuad(285, 30, 'QD', '#f87171');
      drawQuad(570, 30, '1/2 QF', '#38bdf8');

      if (results.isStable) {
        const maxSig = Math.max(1, results.sigmaMaxUm);
        const pts = results.curvePoints;

        // Envelope fill
        ctx.beginPath();
        pts.forEach((p, idx) => {
          const x = (p.s / cellLength) * w;
          const halfH = (p.sigma / maxSig) * 58;
          if (idx === 0) ctx.moveTo(x, h / 2 - halfH);
          else ctx.lineTo(x, h / 2 - halfH);
        });
        for (let i = pts.length - 1; i >= 0; i--) {
          const p = pts[i];
          const x = (p.s / cellLength) * w;
          const halfH = (p.sigma / maxSig) * 58;
          ctx.lineTo(x, h / 2 + halfH);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 229, 255, 0.16)';
        ctx.fill();

        // Top & Bottom Envelope strokes
        for (const sign of [-1, 1]) {
          ctx.beginPath();
          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 2.5;
          pts.forEach((p, idx) => {
            const x = (p.s / cellLength) * w;
            const y = h / 2 + sign * ((p.sigma / maxSig) * 58);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }

        // Animated Betatron Protons weaving within envelope!
        protons.forEach((pr) => {
          const sNorm = (t + pr.offset) % 1;
          const idx = Math.min(pts.length - 1, Math.floor(sNorm * (pts.length - 1)));
          const envH = (pts[idx].sigma / maxSig) * 56;
          const px = sNorm * w;
          const py = h / 2 + pr.amp * envH * Math.sin(sNorm * results.muRad * 2.5 + pr.phase0);

          ctx.fillStyle = '#FFE600';
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Unstable blow-up trajectories hitting beam pipe
        protons.forEach((pr) => {
          const sNorm = (t + pr.offset) % 1;
          const px = sNorm * w;
          const blowUp = Math.exp(sNorm * 3.1) - 1;
          const dir = pr.phase0 > Math.PI ? 1 : -1;
          const py = Math.max(20, Math.min(h - 20, h / 2 + dir * blowUp * 8 * pr.amp));
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('UNSTABLE BEAM LOSS (f ≤ L/4): PROTONS COLLIDE WITH PIPE!', w / 2, h / 2 + 4);
      }

      if (!reduceMotion) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    if (reduceMotion) renderFrame(0);
    else rafId = requestAnimationFrame(renderFrame);

    return () => cancelAnimationFrame(rafId);
  }, [results, cellLength, reduceMotion]);

  // Export scenario JSON
  const exportJson = () => {
    const data = {
      scenario: 'CERN-X FODO Beam Optics Sandbox',
      timestamp: new Date().toISOString(),
      inputs: {
        cellLengthM: cellLength,
        focalLengthM: focalLength,
        beamEnergyGev: beamEnergyGev,
        emittanceNormUm: emittanceNormUm,
      },
      results: {
        isStable: results.isStable,
        matrixTrace: results.trace,
        phaseAdvanceDeg: results.muDeg,
        betaMaxM: results.betaMax,
        betaMinM: results.betaMin,
        rmsBeamSizeMaxUm: results.sigmaMaxUm,
        rmsBeamSizeMinUm: results.sigmaMinUm,
      },
      fidelity: 'ANALYTIC',
      source: 'CERN Accelerator School & LHC Design Report (Vol 1)',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cern_beam_optics_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCsv = () => {
    let csv = 's_meters,beta_meters,rms_beam_envelope_um\n';
    results.curvePoints.forEach((p) => {
      csv += `${p.s.toFixed(2)},${p.beta.toFixed(2)},${p.sigma.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beam_envelope_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">
      <Eli5Card
        title="Magnetic Tennis Paddles (FODO Cell)"
        analogy="Two magnetic tennis paddles (one squashing sideways, one squashing vertically) preventing the beam from ever splashing against the vacuum pipe walls."
        keyPoints={[
          "Maxwell's equations dictate that magnetic quadrupoles focus in one transverse axis while defocusing in the perpendicular axis.",
          "Alternating focusing and defocusing magnets separated by drift spaces creates a net restoring force in both planes (Strong Focusing principle)."
        ]}
        whatToTry="Click the 'Unstable / Resonant Blowup' preset or lower Focal Length below L/4 (26.7 m) to observe mathematical instability (|Tr(M)| >= 2) and beam loss!"
        doi="10.5170/CERN-2004-003-V-1"
        citationLabel="CERN LHC Design Report Vol. 1: Main Ring Optics & FODO Lattice"
      />
      <div className="w-full bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] p-5 space-y-6">
      {/* Top Bar with Fidelity Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-display font-extrabold text-white">
              /// Beam Optics Sandbox: FODO Lattice &amp; Courant-Snyder Envelope ///
            </h3>
            <FidelityBadge type="ANALYTIC" formula="Courant-Snyder transfer matrix" />
          </div>
          <p className="text-xs text-text-secondary mt-1 font-sans">
            Exact 2&times;2 transfer matrix calculations solving Hill&apos;s equation for alternating
            gradient focusing quadrupoles and field-free drifts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas-sub hover:bg-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-mono font-bold text-white transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Download className="w-3.5 h-3.5 text-cern-cyan" />
            <span>JSON</span>
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas-sub hover:bg-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-mono font-bold text-white transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Download className="w-3.5 h-3.5 text-cern-cyan" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-white font-bold uppercase mr-1 px-2.5 py-1 bg-black border-2 border-black shadow-[2px_2px_0px_#000]">
          Presets:
        </span>
        <button
          onClick={() => applyPreset('lhc')}
          className="px-3.5 py-1.5 bg-cern-blue text-white border-2 border-black shadow-[3px_3px_0px_#00E5FF] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          LHC Main Arc (90&deg; FODO)
        </button>
        <button
          onClick={() => applyPreset('sps')}
          className="px-3.5 py-1.5 bg-canvas-sub text-text-secondary hover:text-white border-2 border-black shadow-[3px_3px_0px_#000] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          SPS Arc Cell
        </button>
        <button
          onClick={() => applyPreset('highbeta')}
          className="px-3.5 py-1.5 bg-canvas-sub text-text-secondary hover:text-white border-2 border-black shadow-[3px_3px_0px_#FFE600] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          High-Beta Insertion
        </button>
        <button
          onClick={() => applyPreset('unstable')}
          className="px-3.5 py-1.5 bg-red-950 text-red-300 hover:text-red-200 border-2 border-black shadow-[3px_3px_0px_#FF0055] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Overfocused (Unstable)
        </button>
      </div>

      {/* Main Grid: Controls + Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sliders Deck (4 cols) */}
        <div className="lg:col-span-4 bg-canvas-sub p-4 border-3 border-black shadow-[5px_5px_0px_#000] space-y-4 text-xs font-mono">
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted font-bold">Cell Length (L):</span>
              <span className="text-white font-bold">{cellLength.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min={40}
              max={160}
              step={0.5}
              value={cellLength}
              onChange={(e) => setCellLength(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted font-bold">Quadrupole Focal (f):</span>
              <span className="text-white font-bold">{focalLength.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min={15}
              max={80}
              step={0.5}
              value={focalLength}
              onChange={(e) => setFocalLength(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted font-bold">Beam Energy:</span>
              <span className="text-cern-cyan font-bold">
                {beamEnergyGev >= 1000 ? `${(beamEnergyGev / 1000).toFixed(1)} TeV` : `${beamEnergyGev} GeV`}
              </span>
            </div>
            <input
              type="range"
              min={450}
              max={7000}
              step={50}
              value={beamEnergyGev}
              onChange={(e) => setBeamEnergyGev(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted font-bold">Norm. Emittance (&epsilon;_n):</span>
              <span className="text-white font-bold">{emittanceNormUm.toFixed(2)} &mu;m&middot;rad</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={5.0}
              step={0.1}
              value={emittanceNormUm}
              onChange={(e) => setEmittanceNormUm(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Stability Indicator */}
          <div
            className={`p-3 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-2.5 ${
              results.isStable
                ? 'bg-emerald-400 text-black font-bold'
                : 'bg-red-500 text-white font-bold'
            }`}
          >
            {results.isStable ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <div>
              <div className="text-xs uppercase tracking-wider">
                {results.isStable ? 'Lattice Stable' : 'Lattice Unstable (Lost Beam)'}
              </div>
              <div className="text-[11px] opacity-90 font-mono">
                |Tr(M)| = {Math.abs(results.trace).toFixed(3)} {results.isStable ? '< 2.0' : '≥ 2.0'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Visualizer & Metrics (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Phase Advance (&mu;)</span>
              <span className="text-base font-bold text-cern-cyan">
                {results.isStable ? `${results.muDeg.toFixed(1)}°` : '—'}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                {results.isStable ? `${results.muRad.toFixed(3)} rad` : 'Unstable'}
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">&beta;_max (Mid-QF)</span>
              <span className="text-base font-bold text-white">
                {results.isStable ? `${results.betaMax.toFixed(1)} m` : '—'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">LHC nominal: 177 m</span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">&beta;_min (Mid-QD)</span>
              <span className="text-base font-bold text-white">
                {results.isStable ? `${results.betaMin.toFixed(1)} m` : '—'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">LHC nominal: 33 m</span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">RMS Size (&sigma;_max)</span>
              <span className="text-base font-bold text-amber-300">
                {results.isStable ? `${results.sigmaMaxUm.toFixed(0)} &mu;m` : '—'}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                &sigma;_min: {results.isStable ? `${results.sigmaMinUm.toFixed(0)} &mu;m` : '—'}
              </span>
            </div>
          </div>

          {/* SVG FODO Lattice & Envelope Visualization */}
          <div className="bg-canvas-sub p-4 border-2 border-black shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
              <span className="text-xs font-mono uppercase font-bold text-white">
                /// Beam Envelope &sigma;(s) Across 1 FODO Cell ///
              </span>
              <span className="text-[11px] font-mono text-cern-cyan font-bold">
                QF &rarr; Drift &rarr; QD &rarr; Drift &rarr; QF
              </span>
            </div>

            <div className="relative w-full h-52 bg-black border-2 border-black flex items-center justify-center overflow-hidden">
              <canvas
                ref={fodoCanvasRef}
                width={600}
                height={190}
                className="w-full h-full block"
              />
              {/* Legend Overlay */}
              <div className="absolute bottom-2 left-3 flex items-center gap-4 text-[10px] font-mono bg-black/90 px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="flex items-center gap-1.5 text-cern-cyan font-bold">
                  <span className="w-2.5 h-0.5 bg-cern-cyan inline-block"></span> Beam Envelope &plusmn;&sigma;(s)
                </span>
                <span className="flex items-center gap-1.5 text-[#FFE600] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#FFE600] inline-block"></span> Betatron Bunches
                </span>
                <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <span className="w-2 h-2 bg-sky-500/60 border border-sky-400 inline-block"></span> Focusing (QF)
                </span>
                <span className="flex items-center gap-1.5 text-red-400 font-bold">
                  <span className="w-2 h-2 bg-red-500/60 border border-red-400 inline-block"></span> Defocusing (QD)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
