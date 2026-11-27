'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { calculateSuperconductingMagnetMetrics } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { playDiscoveryChime, playQuenchAlarm } from '@/lib/sonifier';
import { Zap, Snowflake, AlertOctagon, ShieldCheck, Play, Pause } from 'lucide-react';

export const ArcMagnetSimulator: React.FC = () => {
  const sliderPrefix = useId();
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const completeMission = useGlobalStore((s) => s.completeMission);

  const [material, setMaterial] = useState<'NbTi' | 'Nb3Sn'>('Nb3Sn');
  const [fieldT, setFieldT] = useState<number>(11.5);
  const [tempK, setTempK] = useState<number>(1.9);
  const [apertureMm, setApertureMm] = useState<number>(28);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(0);

  const metrics = useMemo(
    () => calculateSuperconductingMagnetMetrics(fieldT, apertureMm, tempK, material),
    [fieldT, apertureMm, tempK, material]
  );

  const handleFieldChange = (val: number) => {
    setFieldT(val);
    const check = calculateSuperconductingMagnetMetrics(val, apertureMm, tempK, material);
    if (check.quenched) {
      playQuenchAlarm();
    } else if (material === 'Nb3Sn' && val >= 12.0) {
      completeMission('mission-arc-magnet');
      playDiscoveryChime();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;

    const render = () => {
      if (isPlaying && !reduceMotion) phaseRef.current += 0.03;
      const t = phaseRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = '#040812';
      ctx.fillRect(0, 0, w, h);

      // Outer cryostat steel collar
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(cx, cy, 114, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = metrics.quenched ? '#EF4444' : '#334155';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Superfluid Helium-II cooling channels flowing around the magnet collar
      for (let i = 0; i < 20; i++) {
        const ang = (i / 20) * Math.PI * 2 + (isPlaying && !reduceMotion ? t * 0.4 : 0);
        const rx = cx + Math.cos(ang) * 100;
        const ry = cy + Math.sin(ang) * 100;
        ctx.fillStyle = tempK <= 2.17 ? '#38BDF8' : '#FB923C';
        ctx.beginPath();
        ctx.arc(rx, ry, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Twin-aperture dipole flux streamlines
      const intensity = Math.min(1, fieldT / 16);
      const fluxColor = metrics.quenched
        ? `rgba(239, 68, 68, ${0.4 + 0.3 * Math.sin(t * 2)})`
        : `rgba(0, 229, 255, ${0.35 + 0.55 * intensity})`;
      for (let loop = -3; loop <= 3; loop++) {
        if (loop === 0) continue;
        ctx.strokeStyle = fluxColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        const span = Math.abs(loop) * 19;
        ctx.ellipse(cx, cy + loop * 10, 62, span * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 18 Superconducting Rutherford cables around inner yoke
      for (let c = 0; c < 18; c++) {
        const a = (c / 18) * Math.PI * 2;
        const px = cx + Math.cos(a) * 76;
        const py = cy + Math.sin(a) * 76;
        ctx.fillStyle = metrics.quenched
          ? '#B91C1C'
          : material === 'Nb3Sn'
          ? '#0EA5E9'
          : '#2563EB';
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Central Cold Bore & glowing proton beam core
      const boreR = Math.min(48, 16 + apertureMm * 0.45);
      const beamGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, boreR * 1.4);
      beamGlow.addColorStop(0, metrics.quenched ? 'rgba(239,68,68,0.7)' : 'rgba(0,229,255,0.65)');
      beamGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = beamGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, boreR * 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = metrics.quenched ? '#EF4444' : '#38BDF8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, boreR, 0, Math.PI * 2);
      ctx.stroke();

      // Hoop force outward arrows scaled by P_B
      const arrowLen = 10 + intensity * 18;
      [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((dir) => {
        const sx = cx + Math.cos(dir) * 86;
        const sy = cy + Math.sin(dir) * 86;
        const ex = cx + Math.cos(dir) * (86 + arrowLen);
        const ey = cy + Math.sin(dir) * (86 + arrowLen);
        ctx.strokeStyle = '#FFE600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      });

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${fieldT.toFixed(1)} T`, cx, cy + 4);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`Hoop Load: ${metrics.hoopForceKnPerMeter.toFixed(0)} kN/m | Safety: ${(metrics.safetyMarginFraction * 100).toFixed(0)}%`, 12, h - 10);

      if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [fieldT, tempK, apertureMm, material, metrics, isPlaying, reduceMotion]);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Iron Man’s Arc Ring Meets Real CERN Superconducting Magnets!"
        analogy="Think of each CERN dipole magnet as a freezing-cold Arc Reactor sleeve carrying over 11,800 Amps of zero-resistance current! At 16 Tesla, the invisible magnetic force trying to burst the steel collar outward matches the pressure 6 kilometers deep inside Earth’s oceans—cooled to 1.9 Kelvin, colder than outer space!"
      />

      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <FidelityBadge type="ANALYTIC" />
            <span className="px-2 py-0.5 bg-cern-cyan text-black font-mono font-black text-[10px] border-2 border-black uppercase">
              STARK-CRYO HUD // LHC NbTi &amp; HL-LHC Nb₃Sn
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-white">
            Arc-Toroidal Superconducting Dipole &amp; Quench HUD
          </h2>
          <p className="text-xs font-mono text-text-secondary mt-1">
            Inspect Maxwell magnetic pressure u_B = B² / (2μ₀), Lorentz hoop forces, and superconducting critical boundaries.
          </p>
        </div>

        <div className="flex gap-2 font-mono text-xs">
          {(['NbTi', 'Nb3Sn'] as const).map((mat) => (
            <button
              key={mat}
              type="button"
              onClick={() => setMaterial(mat)}
              className={`px-3 py-2 border-2 border-black font-black cursor-pointer ${
                material === mat
                  ? 'bg-cern-cyan text-black shadow-[3px_3px_0px_#000]'
                  : 'bg-canvas-sub text-text-secondary hover:text-white'
              }`}
            >
              {mat === 'NbTi' ? 'LHC Standard (NbTi · 8.3T)' : 'HL-LHC Upgrade (Nb₃Sn · 16T)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 space-y-4 bg-canvas-surface border-3 border-black p-4 shadow-[5px_5px_0px_#000]">
          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-b`} className="text-text-muted uppercase">
                Target Dipole Field B:
              </label>
              <span className="text-cern-cyan">{fieldT.toFixed(2)} Tesla</span>
            </div>
            <input
              id={`${sliderPrefix}-b`}
              type="range"
              min={1}
              max={22}
              step={0.1}
              value={fieldT}
              aria-valuetext={`${fieldT.toFixed(1)} Tesla`}
              onChange={(e) => handleFieldChange(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-t`} className="text-text-muted uppercase">
                Helium Bath Temperature T:
              </label>
              <span className="text-sky-300">{tempK.toFixed(1)} K</span>
            </div>
            <input
              id={`${sliderPrefix}-t`}
              type="range"
              min={1.5}
              max={15}
              step={0.1}
              value={tempK}
              aria-valuetext={`${tempK.toFixed(1)} Kelvin`}
              onChange={(e) => setTempK(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-r`} className="text-text-muted uppercase">
                Cold Bore Radius r:
              </label>
              <span className="text-[#FFE600]">{apertureMm} mm</span>
            </div>
            <input
              id={`${sliderPrefix}-r`}
              type="range"
              min={15}
              max={60}
              step={1}
              value={apertureMm}
              aria-valuetext={`${apertureMm} millimeters`}
              onChange={(e) => setApertureMm(Number(e.target.value))}
              className="w-full accent-[#FFE600] cursor-pointer"
            />
          </div>

          <MathFormula
            tex="u_B = \frac{B^2}{2\mu_0}, \quad P_B \approx 39.8\,\left(\frac{B}{10\,\text{T}}\right)^2\text{ MPa}"
            label="Maxwell Magnetic Energy & Pressure:"
          />
        </div>

        <div className="xl:col-span-7 space-y-4">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">Superconducting State</dt>
              <dd className="mt-1 font-black flex items-center gap-1">
                {metrics.quenched ? (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertOctagon className="w-4 h-4" /> QUENCHED!
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> SUPERCONDUCTING
                  </span>
                )}
              </dd>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">Energy Density u_B</dt>
              <dd className="text-cern-cyan font-black text-base mt-0.5">
                {metrics.energyDensityMjM3.toFixed(1)} MJ/m³
              </dd>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">Burst Pressure P_B</dt>
              <dd className="text-[#FFE600] font-black text-base mt-0.5">
                {metrics.magneticPressureMpa.toFixed(1)} MPa
              </dd>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">B_crit Limit</dt>
              <dd className="text-purple-300 font-black text-base mt-0.5">
                {metrics.criticalFieldT.toFixed(1)} T
              </dd>
            </div>
          </dl>

          <div className="p-4 bg-[#040812] border-3 border-black shadow-[5px_5px_0px_#000] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800 pb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-sky-400" /> {tempK <= 2.17 ? 'Superfluid He-II Flow' : 'Boiling Gas He'} · {material}
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
              width={560}
              height={260}
              aria-label={`Live animated superconducting dipole cross-section at ${fieldT.toFixed(1)} Tesla and ${tempK.toFixed(1)} Kelvin.`}
              className="w-full h-64 border border-zinc-800 bg-[#040812]"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary">
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-[#FFE600]" /> Yellow arrows: Lorentz bursting forces</span>
              <span>Cyan rings: Superfluid 1.9 K cooling &amp; flux</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
