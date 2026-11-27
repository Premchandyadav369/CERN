'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { calculateSuperconductingMagnetMetrics } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import {
  drawAdditiveGlowDot,
  drawCernGridBackdrop,
  drawPhosphorCurve,
  drawVectorArrow,
  observeOffscreenVisibility,
  setupHiDpiCanvas,
} from '@/lib/cernVisuals';
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
    let isVisible = true;
    const cleanupVis = observeOffscreenVisibility(canvas, (v) => {
      isVisible = v;
    });
    let animId = 0;

    const render = () => {
      if (isPlaying && !reduceMotion && isVisible) phaseRef.current += 0.032;
      const vp = setupHiDpiCanvas(canvas, 540, 290);
      if (!vp || !isVisible) {
        if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
        return;
      }
      const { ctx, width: w, height: h } = vp;
      const t = phaseRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const isSF = tempK <= 2.17;
      const intensity = Math.min(1, fieldT / 16);

      drawCernGridBackdrop(ctx, w, h, {
        accentColor: metrics.quenched ? 'rgba(239, 68, 68, 0.09)' : 'rgba(0, 229, 255, 0.08)',
        bgInner: metrics.quenched ? '#24080C' : '#08182C',
        bgOuter: '#03060D',
        gridStep: 24,
        showScanlines: true,
        showCrosshair: true,
      });

      // Outer Cryostat Iron Yoke Collar (CAD laminated bezel)
      ctx.save();
      const yokeGrad = ctx.createRadialGradient(cx, cy, 74, cx, cy, 122);
      yokeGrad.addColorStop(0, '#0F172A');
      yokeGrad.addColorStop(0.75, '#1E293B');
      yokeGrad.addColorStop(1, '#090D16');
      ctx.fillStyle = yokeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 118, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = metrics.quenched ? '#EF4444' : '#38BDF8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cooling collar annulus with Superfluid He-II quantized vortices OR nucleate boil bubbles
      ctx.strokeStyle = isSF ? 'rgba(0, 229, 255, 0.25)' : 'rgba(251, 146, 60, 0.35)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2 + (isPlaying && !reduceMotion ? t * (isSF ? 0.55 : 0.9) : 0);
        const radJitter = isSF ? 0 : Math.sin(t * 4 + i) * 3.5;
        const rx = cx + Math.cos(ang) * (100 + radJitter);
        const ry = cy + Math.sin(ang) * (100 + radJitter);
        drawAdditiveGlowDot(
          ctx,
          rx,
          ry,
          isSF ? 9 : 11,
          metrics.quenched ? '239, 68, 68' : isSF ? '0, 229, 255' : '251, 146, 60',
          isSF ? 0.72 : 0.85
        );
      }

      // Phosphor Dipole B-Field Streamlines arching across aperture
      for (let loop = -3; loop <= 3; loop++) {
        if (loop === 0) continue;
        const pts: { x: number; y: number }[] = [];
        const spanX = 68;
        const spanY = Math.abs(loop) * 14 + 10;
        const yCenter = cy + loop * 9;
        for (let s = 0; s <= 28; s++) {
          const a = (s / 28) * Math.PI * 2;
          pts.push({
            x: cx + Math.cos(a) * spanX,
            y: yCenter + Math.sin(a) * spanY * 0.42,
          });
        }
        drawPhosphorCurve(
          ctx,
          pts,
          metrics.quenched ? '#EF4444' : '#00E5FF',
          1.2,
          metrics.quenched ? 0.22 : 0.3 + 0.55 * intensity
        );
      }

      // 18 Layered Nb-Ti / Nb3Sn Rutherford Keystone Cables with additive conductor halos
      for (let c = 0; c < 18; c++) {
        const a = (c / 18) * Math.PI * 2;
        const px = cx + Math.cos(a) * 76;
        const py = cy + Math.sin(a) * 76;
        drawAdditiveGlowDot(
          ctx,
          px,
          py,
          12,
          metrics.quenched ? '239, 68, 68' : material === 'Nb3Sn' ? '14, 165, 233' : '59, 130, 246',
          0.6
        );
        ctx.fillStyle = metrics.quenched ? '#991B1B' : material === 'Nb3Sn' ? '#0284C7' : '#1D4ED8';
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(px, py, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Central Cold Bore & Relativistic Proton Beam Aperture Glow
      const boreR = Math.min(48, 16 + apertureMm * 0.45);
      drawAdditiveGlowDot(
        ctx,
        cx,
        cy,
        boreR * 1.45,
        metrics.quenched ? '239, 68, 68' : '0, 229, 255',
        0.65 + intensity * 0.35
      );
      drawAdditiveGlowDot(ctx, cx, cy, 8, '255, 255, 255', 0.9);

      ctx.strokeStyle = metrics.quenched ? '#EF4444' : '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, boreR, 0, Math.PI * 2);
      ctx.stroke();

      // Lorentz Bursting Hoop Pressure Vectors (P_B = B^2 / 2mu_0)
      const arrowLen = 12 + intensity * 24;
      [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((dir) => {
        const sx = cx + Math.cos(dir) * 86;
        const sy = cy + Math.sin(dir) * 86;
        const ex = cx + Math.cos(dir) * (86 + arrowLen);
        const ey = cy + Math.sin(dir) * (86 + arrowLen);
        drawVectorArrow(ctx, sx, sy, ex, ey, '#FFE600', 2.0, 6);
      });

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${fieldT.toFixed(1)} T`, cx, cy - boreR - 8);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(
        `HOOP STRESS: ${metrics.hoopForceKnPerMeter.toFixed(0)} kN/m · SAFETY: ${(metrics.safetyMarginFraction * 100).toFixed(0)}% · ${isSF ? 'He-II SUPERFLUID' : 'He-I BOIL'}`,
        14,
        h - 10
      );

      if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      cleanupVis();
    };
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
