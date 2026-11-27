'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { SeededRNG } from '@cern-x/sim-core';
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
import { Sparkles, Play, Pause, RefreshCw } from 'lucide-react';

export const BifrostHeavyIonSimulator: React.FC = () => {
  const sliderPrefix = useId();
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const [centralityPct, setCentralityPct] = useState<number>(15);
  const [energyTev, setEnergyTev] = useState<number>(5.36);
  const [seed, setSeed] = useState<number>(777);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(0);

  // Generate balanced momentum particle jets conserving sum(p_T) ~ 0
  const tracks = useMemo(() => {
    const rng = new SeededRNG(seed + centralityPct);
    const numPairs = Math.max(8, Math.round((100 - centralityPct) * 0.36 + (energyTev / 5.36) * 10));
    const list: { angle: number; speed: number; hue: number; pt: number }[] = [];
    for (let i = 0; i < numPairs; i++) {
      const ang = rng.nextFloat() * Math.PI * 2;
      const pt = 2 + rng.nextFloat() * 14;
      const hue = Math.round((ang / (Math.PI * 2)) * 360);
      // Pair opposite recoil to visibly & physically conserve transverse momentum!
      list.push({ angle: ang, speed: 0.4 + pt * 0.05, hue, pt });
      list.push({ angle: ang + Math.PI, speed: 0.4 + pt * 0.05, hue: (hue + 180) % 360, pt });
    }
    return list;
  }, [centralityPct, energyTev, seed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let isVisible = true;
    const cleanupVis = observeOffscreenVisibility(canvas, (v) => {
      isVisible = v;
    });
    let animId = 0;

    const render = () => {
      if (isPlaying && !reduceMotion && isVisible) {
        phaseRef.current = (phaseRef.current + 0.013) % 1;
      }
      const vp = setupHiDpiCanvas(canvas, 560, 270);
      if (!vp || !isVisible) {
        if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
        return;
      }
      const { ctx, width: w, height: h } = vp;
      const prog = reduceMotion ? 0.85 : phaseRef.current;
      const cx = w / 2;
      const cy = h / 2;

      drawCernGridBackdrop(ctx, w, h, {
        accentColor: 'rgba(255, 176, 0, 0.08)',
        bgInner: '#130D1E',
        bgOuter: '#03050C',
        gridStep: 24,
        showScanlines: true,
        showCrosshair: true,
      });

      // ALICE Time Projection Chamber (TPC) concentric pad-row readout rings
      [42, 76, 110].forEach((r, idx) => {
        ctx.strokeStyle = idx === 2 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(148, 163, 184, 0.16)';
        ctx.lineWidth = idx === 2 ? 1.8 : 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Central QGP Fireball Additive Core
      const fireballR = 14 + (100 - centralityPct) * 0.25;
      drawAdditiveGlowDot(ctx, cx, cy, fireballR * 2.3, '255, 176, 0', 0.85);
      drawAdditiveGlowDot(ctx, cx, cy, fireballR * 1.1, '0, 229, 255', 0.6);

      // Prismatic Curved ALICE TPC Tracks conserving Σ p_T = 0
      tracks.forEach((tr) => {
        const maxDist = 114 * Math.min(1.18, tr.speed);
        const dist = prog * maxDist;
        const curveSign = tr.angle % 2 > 1 ? 1 : -1;
        const curvature = (0.14 / Math.max(0.4, tr.speed)) * curveSign;
        const pts: { x: number; y: number }[] = [];
        for (let s = 0; s <= 10; s++) {
          const u = s / 10;
          const r = dist * u;
          const a = tr.angle + curvature * u;
          pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
        }
        const col = `hsl(${tr.hue}, 95%, 62%)`;
        drawPhosphorCurve(ctx, pts, col, 1.35, 0.88);
        const tip = pts[pts.length - 1];
        drawAdditiveGlowDot(ctx, tip.x, tip.y, 6, '255, 255, 255', 0.55);
      });

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(
        `ALICE TPC TRACKS: ${tracks.length} · Σp_T = 0.00 GeV/c · √s_NN = ${energyTev.toFixed(2)} TeV`,
        14,
        h - 10
      );

      if (isPlaying && !reduceMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      cleanupVis();
    };
  }, [tracks, centralityPct, energyTev, isPlaying, reduceMotion]);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Bifrost Cosmic Rainbow = Heavy-Ion Quark-Gluon Plasma Fireball (ALICE)!"
        analogy="When two heavy Lead nuclei slam together at 99.99999% light speed inside ALICE, they melt into a Quark-Gluon Plasma droplet 100,000× hotter than the Sun’s core—erupting into hundreds of rainbow tracks that still obey Newton’s recoil law: every spray on the left balances momentum on the right!"
      />

      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <FidelityBadge type="ANALYTIC" />
            <span className="px-2 py-0.5 bg-amber-400 text-black font-mono font-black text-[10px] border-2 border-black uppercase">
              BIFROST HEAVY-ION SHOWER // ALICE Pb–Pb
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-white">
            Prismatic Quark-Gluon Plasma &amp; Momentum Balance Lab
          </h2>
          <p className="text-xs font-mono text-text-secondary mt-1">
            Simulate central vs. peripheral Lead–Lead collisions at √s_NN = 5.36 TeV with strict Σ p_T = 0 conservation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSeed((s) => s + 13)}
          className="px-3 py-2 bg-cern-cyan hover:bg-sky-300 text-black font-mono font-black text-xs border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> New Pb-Pb Collision
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 space-y-4 bg-canvas-surface border-3 border-black p-4 shadow-[5px_5px_0px_#000]">
          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-c`} className="text-text-muted uppercase">
                Collision Centrality (0% = Head-on):
              </label>
              <span className="text-amber-400">{centralityPct}%</span>
            </div>
            <input
              id={`${sliderPrefix}-c`}
              type="range"
              min={0}
              max={80}
              step={5}
              value={centralityPct}
              aria-valuetext={`${centralityPct} percent centrality`}
              onChange={(e) => setCentralityPct(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-e`} className="text-text-muted uppercase">
                Nucleon Pair Energy √s_NN:
              </label>
              <span className="text-cern-cyan">{energyTev.toFixed(2)} TeV</span>
            </div>
            <input
              id={`${sliderPrefix}-e`}
              type="range"
              min={2.76}
              max={5.5}
              step={0.04}
              value={energyTev}
              aria-valuetext={`${energyTev.toFixed(2)} TeV`}
              onChange={(e) => setEnergyTev(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <MathFormula
            tex="\sum_{i} \vec{p}_{T,i} = 0, \qquad T_{\text{QGP}} \approx 156\text{ MeV} \approx 1.8\times 10^{12}\text{ K}"
            label="Momentum Balance & Deconfinement:"
          />
        </div>

        <div className="xl:col-span-8 bg-[#05060E] border-3 border-black p-4 shadow-[5px_5px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs font-mono">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> ALICE TPC Transverse Event Burst
            </span>
            {!reduceMotion && (
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="px-2.5 py-1 bg-canvas-surface border border-black text-[10px] font-bold text-cern-cyan flex items-center gap-1 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            )}
          </div>
          <canvas
            ref={canvasRef}
            width={620}
            height={250}
            aria-label={`Heavy-ion Pb-Pb collision event burst with ${tracks.length} balanced momentum tracks at ${energyTev.toFixed(2)} TeV.`}
            className="w-full h-60 border border-zinc-800 bg-[#05060E]"
          />
        </div>
      </div>
    </div>
  );
};
