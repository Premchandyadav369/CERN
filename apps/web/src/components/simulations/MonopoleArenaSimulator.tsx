'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { calculateDiracMonopoleMetrics } from '@cern-x/sim-core';
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
import { Magnet, Play, Pause } from 'lucide-react';

export const MonopoleArenaSimulator: React.FC = () => {
  const sliderPrefix = useId();
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const [diracUnits, setDiracUnits] = useState<number>(1);
  const [fieldT, setFieldT] = useState<number>(3.8);
  const [energyGev, setEnergyGev] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tRef = useRef<number>(0);

  const metrics = useMemo(
    () => calculateDiracMonopoleMetrics(diracUnits, fieldT, energyGev),
    [diracUnits, fieldT, energyGev]
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
      if (isPlaying && !reduceMotion && isVisible) tRef.current = (tRef.current + 0.014) % 1;
      const vp = setupHiDpiCanvas(canvas, 560, 260);
      if (!vp || !isVisible) {
        if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
        return;
      }
      const { ctx, width: w, height: h } = vp;
      const prog = reduceMotion ? 0.9 : tRef.current;
      const cy = h / 2;

      drawCernGridBackdrop(ctx, w, h, {
        accentColor: 'rgba(56, 189, 248, 0.08)',
        bgInner: '#081629',
        bgOuter: '#03060D',
        gridStep: 24,
        showScanlines: true,
        showCrosshair: true,
      });

      // Calibrated MoEDAL Nuclear Track Detector (NTD) Folios on right wall
      const ntdX = w - 24;
      ctx.fillStyle = 'rgba(255, 176, 0, 0.14)';
      ctx.fillRect(ntdX - 4, 24, 10, h - 48);
      ctx.strokeStyle = '#FFB020';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ntdX - 4, 24, 10, h - 48);

      // Solenoid B-field vector symbols
      const bAlpha = Math.min(0.45, 0.12 + (fieldT / 10) * 0.3);
      ctx.strokeStyle = `rgba(56, 189, 248, ${bAlpha})`;
      ctx.lineWidth = 1.1;
      for (let gx = 48; gx < w - 36; gx += 52) {
        for (let gy = 34; gy < h - 30; gy += 48) {
          ctx.beginPath();
          ctx.arc(gx, gy, 6.5, 0, Math.PI * 2);
          ctx.moveTo(gx - 3.5, gy - 3.5);
          ctx.lineTo(gx + 3.5, gy + 3.5);
          ctx.moveTo(gx + 3.5, gy - 3.5);
          ctx.lineTo(gx - 3.5, gy + 3.5);
          ctx.stroke();
        }
      }

      const bendCoeff = Math.min(0.85, (fieldT * 12) / Math.max(15, energyGev));
      const monoCoeff = Math.min(1.25, metrics.deflectionSlopeT * 0.45);

      // 1. Standard Proton Lorentz Track (+e) with Phosphor Curve
      const protonPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= 42; i++) {
        const u = (i / 42) * Math.max(0.08, prog);
        protonPts.push({
          x: 30 + u * (w - 64),
          y: Math.max(22, cy - bendCoeff * 84 * u * u),
        });
      }
      drawPhosphorCurve(ctx, protonPts, '#00E5FF', 2.0, 0.92);
      const pEnd = protonPts[protonPts.length - 1];
      drawAdditiveGlowDot(ctx, pEnd.x, pEnd.y, 12, '0, 229, 255', 0.9);

      // 2. Blazing Dirac Monopole Track (+n g_D) + δ-ray ionization sheath
      const monoPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= 42; i++) {
        const u = (i / 42) * Math.max(0.08, prog);
        monoPts.push({
          x: 30 + u * (w - 64),
          y: Math.min(h - 24, cy + monoCoeff * 92 * u * u),
        });
      }
      const sheathWidth = Math.min(18, 6 + diracUnits * 2.5);
      drawPhosphorCurve(ctx, monoPts, '#FFB000', sheathWidth * 0.42, 0.35);
      drawPhosphorCurve(ctx, monoPts, '#FFE082', 2.6, 1.0);
      const mEnd = monoPts[monoPts.length - 1];
      drawAdditiveGlowDot(ctx, mEnd.x, mEnd.y, 22, '255, 176, 0', 1.0);

      // Emit Cherenkov / Delta-ray ionisation sparks along blazing monopole track
      for (let s = 4; s < monoPts.length; s += 5) {
        const pt = monoPts[s];
        drawAdditiveGlowDot(ctx, pt.x, pt.y - 4 + (s % 3) * 3, 6, '255, 230, 120', 0.55);
      }

      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Proton (+e · Lorentz v × B)', 24, 22);
      ctx.fillStyle = '#FFE082';
      ctx.fillText(
        `Dirac Monopole (+${diracUnits} g_D · ${metrics.ionizingLossRatioVsProton.toFixed(0)}× Brighter Ionization)`,
        24,
        h - 10
      );

      if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      cleanupVis();
    };
  }, [diracUnits, fieldT, energyGev, metrics, isPlaying, reduceMotion]);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Magneto’s Holy Grail: Hunting Pure North-Only Magnets (MoEDAL at CERN)!"
        analogy="Cut any bar magnet in half and you always get another North+South pair. In 1931 Paul Dirac proved that if even ONE standalone magnetic pole ('Monopole') exists anywhere in nature, it explains why electric charge is quantized—and ionizes atoms 4,700× brighter than a proton inside CERN’s MoEDAL plastic trackers!"
      />

      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <FidelityBadge type="ANALYTIC" />
            <span className="px-2 py-0.5 bg-sky-400 text-black font-mono font-black text-[10px] border-2 border-black uppercase">
              LORENTZ &amp; DIRAC MONOPOLE ARENA // CERN MoEDAL
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-white">
            Electromagnetic Deflection vs. Dirac Monopole Parabolic Track
          </h2>
          <p className="text-xs font-mono text-text-secondary mt-1">
            Compare sideways Lorentz bending (q · v × B) against parabolic longitudinal monopole acceleration (g · B).
          </p>
        </div>

        <div className="px-3 py-2 bg-black border-2 border-sky-400 font-mono text-xs">
          Ionization Boost: <strong className="text-[#FFE600]">{metrics.ionizingLossRatioVsProton.toFixed(0)}× MIP</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 space-y-4 bg-canvas-surface border-3 border-black p-4 shadow-[5px_5px_0px_#000]">
          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-n`} className="text-text-muted uppercase">
                Dirac Quantization Charge (n · g_D):
              </label>
              <span className="text-sky-400">n = {diracUnits} ({metrics.effectiveChargeRatio.toFixed(1)} e)</span>
            </div>
            <input
              id={`${sliderPrefix}-n`}
              type="range"
              min={1}
              max={4}
              step={1}
              value={diracUnits}
              aria-valuetext={`${diracUnits} Dirac units`}
              onChange={(e) => setDiracUnits(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-b`} className="text-text-muted uppercase">
                Magnetic Field Strength B:
              </label>
              <span className="text-cern-cyan">{fieldT.toFixed(1)} T</span>
            </div>
            <input
              id={`${sliderPrefix}-b`}
              type="range"
              min={0.5}
              max={10.0}
              step={0.1}
              value={fieldT}
              aria-valuetext={`${fieldT.toFixed(1)} Tesla`}
              onChange={(e) => setFieldT(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-e`} className="text-text-muted uppercase">
                Particle Kinetic Energy:
              </label>
              <span className="text-[#FFE600]">{energyGev} GeV</span>
            </div>
            <input
              id={`${sliderPrefix}-e`}
              type="range"
              min={20}
              max={500}
              step={10}
              value={energyGev}
              aria-valuetext={`${energyGev} GeV`}
              onChange={(e) => setEnergyGev(Number(e.target.value))}
              className="w-full accent-[#FFE600] cursor-pointer"
            />
          </div>

          <MathFormula
            tex="g_D = \frac{e}{2\alpha} \approx 68.5\,e, \qquad \frac{(dE/dx)_{\text{mono}}}{(dE/dx)_p} \approx (68.5\,n)^2"
            label="Dirac Magnetic Charge Quantization:"
          />
        </div>

        <div className="xl:col-span-7 bg-[#050814] border-3 border-black p-4 shadow-[5px_5px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs font-mono">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Magnet className="w-4 h-4 text-sky-400" /> Field Chamber Ionization &amp; Trajectory Signature
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
            width={580}
            height={250}
            aria-label="Animated Proton versus Dirac magnetic monopole ionization and trajectory comparison"
            className="w-full h-60 border border-zinc-800 bg-[#050814]"
          />
        </div>
      </div>
    </div>
  );
};
