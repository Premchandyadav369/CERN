'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { calculateDisplacedVertexDecay } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import {
  drawAdditiveGlowDot,
  drawCernGridBackdrop,
  drawPhosphorCurve,
  observeOffscreenVisibility,
  setupHiDpiCanvas,
} from '@/lib/cernVisuals';
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
    let isVisible = true;
    const cleanupVis = observeOffscreenVisibility(canvas, (v) => {
      isVisible = v;
    });
    let animId = 0;

    const render = () => {
      if (isPlaying && !reduceMotion && isVisible) progRef.current = (progRef.current + 0.015) % 1;
      const vp = setupHiDpiCanvas(canvas, 580, 260);
      if (!vp || !isVisible) {
        if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
        return;
      }
      const { ctx, width: w, height: h } = vp;
      const prog = reduceMotion ? 0.92 : progRef.current;
      const ipX = 48;
      const cy = h / 2;

      drawCernGridBackdrop(ctx, w, h, {
        accentColor: 'rgba(192, 132, 252, 0.08)',
        bgInner: '#120826',
        bgOuter: '#04030A',
        gridStep: 24,
        showScanlines: true,
        showCrosshair: false,
      });

      // Radial ATLAS/CMS/VELO Detector Shells (0..14m span)
      const scalePx = (w - 82) / 14;
      const shells = [
        { rStart: 0, rEnd: 1.2, label: 'Silicon VELO', col: 'rgba(0, 229, 255, 0.09)', border: '#00E5FF' },
        { rStart: 1.2, rEnd: 3.8, label: 'ECAL / HCAL', col: 'rgba(255, 230, 0, 0.07)', border: '#FFE600' },
        { rStart: 3.8, rEnd: 12.0, label: 'Muon Spectrometer (4–12 m)', col: 'rgba(255, 0, 85, 0.07)', border: '#FF0055' },
      ];

      shells.forEach((sh) => {
        const sx = ipX + sh.rStart * scalePx;
        const sw = (sh.rEnd - sh.rStart) * scalePx;
        ctx.fillStyle = sh.col;
        ctx.fillRect(sx, 22, sw, h - 50);
        ctx.strokeStyle = sh.border;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.25;
        ctx.strokeRect(sx, 22, sw, h - 50);
        ctx.globalAlpha = 1;
        ctx.fillStyle = sh.border;
        ctx.font = 'bold 9px monospace';
        ctx.fillText(sh.label, sx + 5, h - 12);
      });

      // Primary Vertex background prompt jets
      for (let p = -2; p <= 2; p++) {
        if (p === 0) continue;
        drawPhosphorCurve(
          ctx,
          [{ x: ipX, y: cy }, { x: ipX + 42, y: cy + p * 26 }],
          '#38BDF8',
          1.0,
          0.35
        );
      }

      // Neutral Invisible Long-Lived Particle flight vector
      const vertexX = Math.min(w - 64, ipX + decay.boostedDecayLengthM * scalePx);
      const flightFrac = Math.min(1, prog / 0.55);
      const currX = ipX + (vertexX - ipX) * flightFrac;

      ctx.save();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(ipX, cy);
      ctx.lineTo(currX, cy);
      ctx.stroke();
      ctx.restore();

      // Primary Interaction Point Glow + Head-end LLP pulse
      drawAdditiveGlowDot(ctx, ipX, cy, 16, '0, 229, 255', 0.9);
      drawAdditiveGlowDot(ctx, currX, cy, 10, '192, 132, 252', 0.85);

      // Displaced Secondary Vertex Chromatic Explosion + Curving Daughter Tracks
      if (prog >= 0.55) {
        const burstProg = (prog - 0.55) / 0.45;
        const jitter = isPlaying && !reduceMotion ? Math.sin(prog * 30) * 2.5 : 2;
        drawAdditiveGlowDot(ctx, vertexX + jitter + 2, cy + 1, 20, '0, 229, 255', 0.65);
        drawAdditiveGlowDot(ctx, vertexX - jitter - 2, cy - 1, 20, '255, 0, 85', 0.65);
        drawAdditiveGlowDot(ctx, vertexX, cy, 14, '255, 230, 0', 1.0);

        // Covariance vertex crosshair
        ctx.strokeStyle = 'rgba(255, 230, 0, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(vertexX, cy, 12 + burstProg * 14, 0, Math.PI * 2);
        ctx.stroke();

        const trackLen = Math.min(105, 25 + burstProg * 80);
        [
          { dy: -1, col: '#00FF66' },
          { dy: 1, col: '#FF0055' },
        ].forEach((tr) => {
          const tPts: { x: number; y: number }[] = [];
          for (let s = 0; s <= 18; s++) {
            const u = s / 18;
            const px = Math.min(w - 10, vertexX + u * trackLen);
            const py = cy + tr.dy * trackLen * (0.28 * u + 0.42 * u * u);
            tPts.push({ x: px, y: py });
          }
          drawPhosphorCurve(ctx, tPts, tr.col, 2.0, 0.95);
        });
      }

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`L_lab = ${decay.boostedDecayLengthM.toFixed(2)} m · DISPLACED VERTEX RECONSTRUCTION`, 48, 15);

      if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      cleanupVis();
    };
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
