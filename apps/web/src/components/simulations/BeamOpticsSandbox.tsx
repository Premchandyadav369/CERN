'use client';

import React, { useState, useMemo } from 'react';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Value } from '@/components/provenance/Value';
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
    <div className="w-full bg-canvas-surface border border-canvas-border rounded-panel p-5 space-y-6">
      {/* Top Bar with Fidelity Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-canvas-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-display font-bold text-text-primary">
              Beam Optics Sandbox: FODO Lattice &amp; Courant-Snyder Envelope
            </h3>
            <FidelityBadge type="ANALYTIC" formula="Courant-Snyder transfer matrix" />
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Exact 2&times;2 transfer matrix calculations solving Hill&apos;s equation for alternating
            gradient focusing quadrupoles and field-free drifts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-text-muted">Presets:</span>
        <button
          onClick={() => applyPreset('lhc')}
          className="px-2.5 py-1 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-cern-cyan font-bold transition-colors"
        >
          LHC Main Arc (90&deg; FODO)
        </button>
        <button
          onClick={() => applyPreset('sps')}
          className="px-2.5 py-1 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-text-secondary hover:text-text-primary transition-colors"
        >
          SPS Arc Cell
        </button>
        <button
          onClick={() => applyPreset('highbeta')}
          className="px-2.5 py-1 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-text-secondary hover:text-text-primary transition-colors"
        >
          High-Beta Insertion
        </button>
        <button
          onClick={() => applyPreset('unstable')}
          className="px-2.5 py-1 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-red-400 hover:text-red-300 transition-colors"
        >
          Overfocused (Unstable)
        </button>
      </div>

      {/* Main Grid: Controls + Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sliders Deck (4 cols) */}
        <div className="lg:col-span-4 bg-canvas-sub p-4 rounded border border-canvas-border space-y-4 text-xs font-mono">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-text-muted">Cell Length (L):</span>
              <span className="text-text-primary font-bold">{cellLength.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min={40}
              max={160}
              step={0.5}
              value={cellLength}
              onChange={(e) => setCellLength(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-text-muted">Quadrupole Focal (f):</span>
              <span className="text-text-primary font-bold">{focalLength.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min={15}
              max={80}
              step={0.5}
              value={focalLength}
              onChange={(e) => setFocalLength(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-text-muted">Beam Energy:</span>
              <span className="text-text-primary font-bold">
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
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-text-muted">Norm. Emittance (&epsilon;_n):</span>
              <span className="text-text-primary font-bold">{emittanceNormUm.toFixed(2)} &mu;m&middot;rad</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={5.0}
              step={0.1}
              value={emittanceNormUm}
              onChange={(e) => setEmittanceNormUm(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          {/* Stability Indicator */}
          <div
            className={`p-3 rounded border flex items-center gap-2.5 ${
              results.isStable
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                : 'bg-red-950/40 border-red-500/40 text-red-400'
            }`}
          >
            {results.isStable ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <div>
              <div className="font-bold">
                {results.isStable ? 'Lattice Stable' : 'Lattice Unstable (Lost Beam)'}
              </div>
              <div className="text-[11px] opacity-80">
                |Tr(M)| = {Math.abs(results.trace).toFixed(3)} {results.isStable ? '< 2.0' : '&ge; 2.0'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Visualizer & Metrics (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-canvas-sub p-3 rounded border border-canvas-border">
              <span className="text-text-muted block text-[11px]">Phase Advance (&mu;)</span>
              <span className="text-base font-bold text-cern-cyan">
                {results.isStable ? `${results.muDeg.toFixed(1)}°` : '—'}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                {results.isStable ? `${results.muRad.toFixed(3)} rad` : 'Unstable'}
              </span>
            </div>

            <div className="bg-canvas-sub p-3 rounded border border-canvas-border">
              <span className="text-text-muted block text-[11px]">&beta;_max (Mid-QF)</span>
              <span className="text-base font-bold text-text-primary">
                {results.isStable ? `${results.betaMax.toFixed(1)} m` : '—'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">LHC nominal: 177 m</span>
            </div>

            <div className="bg-canvas-sub p-3 rounded border border-canvas-border">
              <span className="text-text-muted block text-[11px]">&beta;_min (Mid-QD)</span>
              <span className="text-base font-bold text-text-primary">
                {results.isStable ? `${results.betaMin.toFixed(1)} m` : '—'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">LHC nominal: 33 m</span>
            </div>

            <div className="bg-canvas-sub p-3 rounded border border-canvas-border">
              <span className="text-text-muted block text-[11px]">RMS Beam Size (&sigma;_max)</span>
              <span className="text-base font-bold text-amber-400">
                {results.isStable ? `${results.sigmaMaxUm.toFixed(0)} &mu;m` : '—'}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                &sigma;_min: {results.isStable ? `${results.sigmaMinUm.toFixed(0)} &mu;m` : '—'}
              </span>
            </div>
          </div>

          {/* SVG FODO Lattice & Envelope Visualization */}
          <div className="bg-canvas-sub p-4 rounded border border-canvas-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase font-bold text-text-primary">
                Beam Envelope &sigma;(s) Across 1 FODO Cell
              </span>
              <span className="text-[11px] font-mono text-text-muted">
                QF (Focusing) &rarr; Drift &rarr; QD (Defocusing) &rarr; Drift &rarr; QF
              </span>
            </div>

            {results.isStable ? (
              <div className="relative w-full h-48 bg-canvas-base rounded border border-canvas-border flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="90" x2="600" y2="90" stroke="#334155" strokeDasharray="4,4" strokeWidth="1" />
                  <line x1="150" y1="0" x2="150" y2="180" stroke="#1e293b" strokeWidth="1" />
                  <line x1="300" y1="0" x2="300" y2="180" stroke="#1e293b" strokeWidth="1" />
                  <line x1="450" y1="0" x2="450" y2="180" stroke="#1e293b" strokeWidth="1" />

                  {/* Quadrupole Blocks */}
                  {/* QF half at start */}
                  <rect x="0" y="20" width="30" height="140" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="15" y="15" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">1/2 QF</text>

                  {/* QD at center */}
                  <rect x="285" y="20" width="30" height="140" fill="#ef4444" fillOpacity="0.25" stroke="#f87171" strokeWidth="1.5" />
                  <text x="300" y="15" fill="#f87171" fontSize="10" textAnchor="middle" fontFamily="monospace">QD</text>

                  {/* QF half at end */}
                  <rect x="570" y="20" width="30" height="140" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="585" y="15" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">1/2 QF</text>

                  {/* Beam Envelope Path (Top and Bottom mirrored) */}
                  {(() => {
                    const maxSig = Math.max(1, results.sigmaMaxUm);
                    let topPath = 'M ';
                    let botPath = 'M ';
                    results.curvePoints.forEach((p, idx) => {
                      const x = (p.s / cellLength) * 600;
                      // scale envelope height to max ~60px
                      const h = (p.sigma / maxSig) * 55;
                      const yTop = 90 - h;
                      const yBot = 90 + h;
                      if (idx === 0) {
                        topPath += `${x} ${yTop} `;
                        botPath += `${x} ${yBot} `;
                      } else {
                        topPath += `L ${x} ${yTop} `;
                        botPath += `L ${x} ${yBot} `;
                      }
                    });

                    // Closed polygon for shaded beam profile
                    let polygonPath = topPath;
                    for (let i = results.curvePoints.length - 1; i >= 0; i--) {
                      const p = results.curvePoints[i];
                      const x = (p.s / cellLength) * 600;
                      const h = (p.sigma / maxSig) * 55;
                      polygonPath += `L ${x} ${90 + h} `;
                    }
                    polygonPath += 'Z';

                    return (
                      <>
                        <path d={polygonPath} fill="#06b6d4" fillOpacity="0.18" />
                        <path d={topPath} fill="none" stroke="#22d3ee" strokeWidth="2" />
                        <path d={botPath} fill="none" stroke="#22d3ee" strokeWidth="2" />
                      </>
                    );
                  })()}
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-2 left-3 flex items-center gap-4 text-[10px] font-mono bg-canvas-base/80 px-2 py-1 rounded border border-canvas-border">
                  <span className="flex items-center gap-1.5 text-cern-cyan">
                    <span className="w-2.5 h-0.5 bg-cern-cyan inline-block"></span> Beam Envelope &plusmn;&sigma;(s)
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <span className="w-2 h-2 bg-sky-500/40 border border-sky-400 inline-block"></span> Focusing (QF)
                  </span>
                  <span className="flex items-center gap-1.5 text-red-400">
                    <span className="w-2 h-2 bg-red-500/40 border border-red-400 inline-block"></span> Defocusing (QD)
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-48 bg-canvas-base rounded border border-red-500/30 flex flex-col items-center justify-center text-red-400 text-xs font-mono space-y-1">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <span className="font-bold">UNSTABLE LATTICE GEOMETRY</span>
                <span className="text-[11px] text-text-muted">
                  Focal length f &le; L/4 causes unbounded exponential envelope growth (beam hits beam pipe).
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
