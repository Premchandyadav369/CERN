'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { calculateDiracMonopoleMetrics } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;

    const render = () => {
      if (isPlaying && !reduceMotion) tRef.current = (tRef.current + 0.015) % 1;
      const prog = reduceMotion ? 0.9 : tRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;

      ctx.fillStyle = '#050814';
      ctx.fillRect(0, 0, w, h);

      // Magnetic Field Vector Grid (B_z crosses)
      const bAlpha = Math.min(0.45, 0.1 + (fieldT / 10) * 0.3);
      ctx.strokeStyle = `rgba(56, 189, 248, ${bAlpha})`;
      ctx.lineWidth = 1.2;
      for (let gx = 45; gx < w - 20; gx += 48) {
        for (let gy = 30; gy < h - 25; gy += 45) {
          ctx.beginPath();
          ctx.arc(gx, gy, 7, 0, Math.PI * 2);
          ctx.moveTo(gx - 4, gy - 4);
          ctx.lineTo(gx + 4, gy + 4);
          ctx.moveTo(gx + 4, gy - 4);
          ctx.lineTo(gx - 4, gy + 4);
          ctx.stroke();
        }
      }

      const bendCoeff = Math.min(0.85, (fieldT * 12) / Math.max(15, energyGev));
      const monoCoeff = Math.min(1.3, metrics.deflectionSlopeT * 0.45);

      // 1. Standard Proton Lorentz Track (+e)
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      let pEndX = 30;
      let pEndY = cy;
      for (let i = 0; i <= 40; i++) {
        const u = (i / 40) * Math.max(0.08, prog);
        const px = 30 + u * (w - 60);
        const py = Math.max(20, cy - bendCoeff * 85 * u * u);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
        pEndX = px;
        pEndY = py;
      }
      ctx.stroke();

      // Proton head
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pEndX, pEndY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Blazing Dirac Monopole Track (+n * g_D) with volumetric Delta-Ray ionization sheath!
      const sheathWidth = Math.min(24, 9 + diracUnits * 3.5);
      ctx.beginPath();
      let mEndX = 30;
      let mEndY = cy;
      for (let i = 0; i <= 40; i++) {
        const u = (i / 40) * Math.max(0.08, prog);
        const mx = 30 + u * (w - 60);
        const my = Math.min(h - 24, cy + monoCoeff * 95 * u * u);
        if (i === 0) ctx.moveTo(mx, my);
        else ctx.lineTo(mx, my);
        mEndX = mx;
        mEndY = my;
      }
      // Ionization glow halo
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 176, 0, 0.25)';
      ctx.lineWidth = sheathWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // Bright core monopole track
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 4;
      ctx.stroke();

      const mGlow = ctx.createRadialGradient(mEndX, mEndY, 2, mEndX, mEndY, 18);
      mGlow.addColorStop(0, '#FFFFFF');
      mGlow.addColorStop(0.5, '#FFB000');
      mGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = mGlow;
      ctx.beginPath();
      ctx.arc(mEndX, mEndY, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Proton (+e · Lorentz v×B)', 210, 26);
      ctx.fillStyle = '#FFE082';
      ctx.fillText(`Dirac Monopole (+${diracUnits} g_D · ${metrics.ionizingLossRatioVsProton.toFixed(0)}× Brighter Ionization!)`, 145, h - 10);

      if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
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
