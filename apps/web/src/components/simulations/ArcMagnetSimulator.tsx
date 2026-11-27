'use client';

import React, { useState, useMemo, useId } from 'react';
import { calculateSuperconductingMagnetMetrics } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { playDiscoveryChime, playQuenchAlarm } from '@/lib/sonifier';
import { Zap, Snowflake, AlertOctagon, ShieldCheck } from 'lucide-react';

export const ArcMagnetSimulator: React.FC = () => {
  const sliderPrefix = useId();
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const completeMission = useGlobalStore((s) => s.completeMission);

  const [material, setMaterial] = useState<'NbTi' | 'Nb3Sn'>('Nb3Sn');
  const [fieldT, setFieldT] = useState<number>(11.5);
  const [tempK, setTempK] = useState<number>(1.9);
  const [apertureMm, setApertureMm] = useState<number>(28);

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
        {/* Controls */}
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

        {/* Circular Holographic Arc Core SVG & Readouts */}
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

          <div className="p-5 bg-[#040914] border-3 border-black shadow-[5px_5px_0px_#000] flex flex-col items-center">
            <svg viewBox="0 0 320 260" className="w-full max-w-md h-64" aria-label="Arc superconducting dipole core diagram">
              {/* Outer cryogenic vessel */}
              <circle cx="160" cy="130" r="112" fill="none" stroke="#1E293B" strokeWidth="10" />
              <circle
                cx="160"
                cy="130"
                r="96"
                fill="none"
                stroke={metrics.quenched ? '#EF4444' : '#00E5FF'}
                strokeWidth="3"
                strokeDasharray="12 6"
                className={!reduceMotion && !metrics.quenched ? 'animate-[spin_18s_linear_infinite]' : ''}
                style={{ transformOrigin: '160px 130px' }}
              />
              {/* 10 Coils around aperture */}
              {Array.from({ length: 10 }, (_, idx) => {
                const ang = (idx / 10) * Math.PI * 2;
                const cx = 160 + Math.cos(ang) * 76;
                const cy = 130 + Math.sin(ang) * 76;
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="11"
                    fill={metrics.quenched ? '#991B1B' : material === 'Nb3Sn' ? '#0EA5E9' : '#2563EB'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                );
              })}
              {/* Inner glowing plasma/beam core */}
              <circle
                cx="160"
                cy="130"
                r={Math.min(48, 16 + apertureMm * 0.45)}
                fill={metrics.quenched ? 'rgba(239,68,68,0.22)' : 'rgba(0,229,255,0.16)'}
                stroke={metrics.quenched ? '#EF4444' : '#38BDF8'}
                strokeWidth="3"
              />
              <circle cx="160" cy="130" r="6" fill="#FFE600" />
              <text x="160" y="134" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                {fieldT.toFixed(1)} T
              </text>
              <text x="160" y="250" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                Lorentz Hoop Load: {metrics.hoopForceKnPerMeter.toFixed(0)} kN/m · Safety Margin:{' '}
                {(metrics.safetyMarginFraction * 100).toFixed(0)}%
              </text>
            </svg>
            <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
              <span className="flex items-center gap-1">
                <Snowflake className="w-3.5 h-3.5 text-sky-400" /> {tempK <= 2.17 ? 'Superfluid He-II Phase' : 'Normal Liquid/Gas He'}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#FFE600]" /> Cable: {material}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
