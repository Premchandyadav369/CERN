'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { calculateDisplacedVertexDecay } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { Activity, Play, Pause } from 'lucide-react';

export const SpiderVertexLab: React.FC = () => {
  const sliderPrefix = useId();
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const [lifetimePs, setLifetimePs] = useState<number>(3500);
  const [llpMassGev, setLlpMassGev] = useState<number>(12.0);
  const [llpEnergyGev, setLlpEnergyGev] = useState<number>(140.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progRef = useRef<number>(0);

  const decay = useMemo(
    () => calculateDisplacedVertexDecay(lifetimePs, llpMassGev, llpEnergyGev),
    [lifetimePs, llpMassGev, llpEnergyGev]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;

    const render = () => {
      if (isPlaying && !reduceMotion) progRef.current = (progRef.current + 0.016) % 1;
      const prog = reduceMotion ? 0.92 : progRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const ipX = 48;
      const cy = h / 2;

      ctx.fillStyle = '#07040F';
      ctx.fillRect(0, 0, w, h);

      // Concentric / Radial Detector Shells (0..14m span -> x = 48..540)
      const scalePx = (w - 80) / 14; // px per meter
      const shells = [
        { rStart: 0, rEnd: 1.2, label: 'Pixel Tracker', col: 'rgba(0, 229, 255, 0.14)', border: '#00E5FF' },
        { rStart: 1.2, rEnd: 3.8, label: 'ECAL / HCAL', col: 'rgba(255, 230, 0, 0.10)', border: '#FFE600' },
        { rStart: 3.8, rEnd: 12.0, label: 'Muon Spectrometer (4–12 m)', col: 'rgba(255, 0, 85, 0.10)', border: '#FF0055' },
      ];

      shells.forEach((sh) => {
        const sx = ipX + sh.rStart * scalePx;
        const sw = (sh.rEnd - sh.rStart) * scalePx;
        ctx.fillStyle = sh.col;
        ctx.fillRect(sx, 20, sw, h - 48);
        ctx.strokeStyle = sh.border;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sx, 20, sw, h - 48);
        ctx.fillStyle = sh.border;
        ctx.font = 'bold 9px monospace';
        ctx.fillText(sh.label, sx + 4, h - 12);
      });

      // Invisible LLP flight up to decay point
      const vertexX = Math.min(w - 60, ipX + decay.boostedDecayLengthM * scalePx);
      const flightFrac = Math.min(1, prog / 0.55);
      const currX = ipX + (vertexX - ipX) * flightFrac;

      ctx.save();
      ctx.setLineDash([7, 5]);
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ipX, cy);
      ctx.lineTo(currX, cy);
      ctx.stroke();
      ctx.restore();

      // IP glow
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ipX, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Secondary Displaced Vertex Glitch Burst + Curved Daughter Tracks
      if (prog >= 0.55) {
        const burstProg = (prog - 0.55) / 0.45;
        // Spider-Verse Chromatic Aberration Glitch rings
        const jitter = isPlaying && !reduceMotion ? Math.sin(prog * 30) * 2.5 : 2;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.55)';
        ctx.beginPath();
        ctx.arc(vertexX + jitter + 2, cy + 1, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 0, 85, 0.65)';
        ctx.beginPath();
        ctx.arc(vertexX - jitter - 2, cy - 1, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFE600';
        ctx.beginPath();
        ctx.arc(vertexX, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Daughter lepton tracks
        const trackLen = Math.min(95, 25 + burstProg * 75);
        [
          { dy: -1, col: '#00FF66' },
          { dy: 1, col: '#FF0055' },
        ].forEach((tr) => {
          ctx.strokeStyle = tr.col;
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.moveTo(vertexX, cy);
          ctx.quadraticCurveTo(
            vertexX + trackLen * 0.5,
            cy + tr.dy * trackLen * 0.25,
            Math.min(w - 10, vertexX + trackLen),
            cy + tr.dy * trackLen * 0.65
          );
          ctx.stroke();
        });
      }

      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`L_lab = ${decay.boostedDecayLengthM.toFixed(2)} m | Dashed: Invisible Neutral LLP`, 52, 14);

      if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [decay, isPlaying, reduceMotion]);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Spider-Verse Dimensional Glitches = Displaced Vertices at ATLAS, CMS & FASER!"
        analogy="Most particles explode instantly at the collision center. But mysterious Long-Lived Particles act like ghosts glitching invisibly across solid iron—flying whole centimeters or meters without leaving a single track, then suddenly erupting into twin muons mid-detector!"
      />

      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <FidelityBadge type="ANALYTIC" />
            <span className="px-2 py-0.5 bg-cern-magenta text-white font-mono font-black text-[10px] border-2 border-black uppercase">
              DISPLACED VERTEX LAB // LLP &amp; FASER
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-white">
            Long-Lived Particle Flight &amp; Displaced Vertex Glitch Chamber
          </h2>
          <p className="text-xs font-mono text-text-secondary mt-1">
            Relativistic Lorentz dilation L = γβcτ₀ across Pixel Tracker, Calorimeters, Muon Chambers, and FASER.
          </p>
        </div>

        <div className="px-3 py-2 bg-black border-2 border-cern-magenta font-mono text-xs shadow-[3px_3px_0px_#00E5FF]">
          Mean Lab Decay: <strong className="text-[#FFE600]">{decay.boostedDecayLengthM.toFixed(2)} m</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 space-y-4 bg-canvas-surface border-3 border-black p-4 shadow-[5px_5px_0px_#000]">
          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-tau`} className="text-text-muted uppercase">
                Proper Lifetime τ₀:
              </label>
              <span className="text-cern-magenta">{lifetimePs.toFixed(0)} ps</span>
            </div>
            <input
              id={`${sliderPrefix}-tau`}
              type="range"
              min={50}
              max={15000}
              step={50}
              value={lifetimePs}
              aria-valuetext={`${lifetimePs} picoseconds`}
              onChange={(e) => setLifetimePs(Number(e.target.value))}
              className="w-full accent-cern-magenta cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-m`} className="text-text-muted uppercase">
                LLP Rest Mass m_X:
              </label>
              <span className="text-cern-cyan">{llpMassGev.toFixed(1)} GeV</span>
            </div>
            <input
              id={`${sliderPrefix}-m`}
              type="range"
              min={1}
              max={100}
              step={0.5}
              value={llpMassGev}
              aria-valuetext={`${llpMassGev} GeV`}
              onChange={(e) => setLlpMassGev(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-e`} className="text-text-muted uppercase">
                Particle Lab Energy E_X:
              </label>
              <span className="text-[#FFE600]">{llpEnergyGev.toFixed(0)} GeV</span>
            </div>
            <input
              id={`${sliderPrefix}-e`}
              type="range"
              min={20}
              max={1200}
              step={10}
              value={llpEnergyGev}
              aria-valuetext={`${llpEnergyGev} GeV`}
              onChange={(e) => setLlpEnergyGev(Number(e.target.value))}
              className="w-full accent-[#FFE600] cursor-pointer"
            />
          </div>

          <MathFormula
            tex="L_{\text{lab}} = \gamma\beta c\tau_0, \quad P(r_1 \le r \le r_2) = e^{-r_1/L_{\text{lab}}} - e^{-r_2/L_{\text{lab}}}"
            label="Boosted Vertex Displacement Law:"
          />
        </div>

        <div className="xl:col-span-8 space-y-4">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">Tracker (&lt;1.2 m)</dt>
              <dd className="text-cern-cyan font-black text-base">{(decay.probInsideTracker * 100).toFixed(1)}%</dd>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">Calorimeter (1.2–3.8 m)</dt>
              <dd className="text-[#FFE600] font-black text-base">{(decay.probInsideCalorimeter * 100).toFixed(1)}%</dd>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">Muon Spec (3.8–12 m)</dt>
              <dd className="text-cern-magenta font-black text-base">{(decay.probInsideMuonSpec * 100).toFixed(1)}%</dd>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">FASER Window (480 m)</dt>
              <dd className="text-emerald-400 font-black text-base">{(decay.probFarForwardFaser * 100).toFixed(2)}%</dd>
            </div>
          </dl>

          <div className="bg-[#07040F] border-3 border-black p-4 shadow-[5px_5px_0px_#000] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cern-magenta" /> Radial Detector Cross-Section (0 m IP → 14 m Cavern Wall)
              </span>
              {!reduceMotion && (
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="px-2 py-0.5 bg-canvas-surface border border-black text-[10px] font-bold text-cern-cyan flex items-center gap-1 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
              )}
            </div>

            <canvas
              ref={canvasRef}
              width={600}
              height={230}
              aria-label={`Animated displaced vertex decay canvas showing flight length ${decay.boostedDecayLengthM.toFixed(2)} meters.`}
              className="w-full h-56 border border-zinc-800 bg-[#07040F]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
