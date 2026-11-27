'use client';

import React, { useState, useMemo, useId } from 'react';
import { calculateDiracMonopoleMetrics } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { Magnet } from 'lucide-react';

export const MonopoleArenaSimulator: React.FC = () => {
  const sliderPrefix = useId();
  const [diracUnits, setDiracUnits] = useState<number>(1);
  const [fieldT, setFieldT] = useState<number>(3.8);
  const [energyGev, setEnergyGev] = useState<number>(120);

  const metrics = useMemo(
    () => calculateDiracMonopoleMetrics(diracUnits, fieldT, energyGev),
    [diracUnits, fieldT, energyGev]
  );

  // Build trajectory curves: proton bends circularly in XY plane; Dirac monopole accelerates parabolically along B!
  const paths = useMemo(() => {
    const steps = 40;
    const bendCoeff = Math.min(0.85, (fieldT * 12) / Math.max(15, energyGev));
    const monoCoeff = Math.min(1.3, metrics.deflectionSlopeT * 0.45);

    let protonD = 'M 30 120';
    let monoD = 'M 30 120';
    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      const px = 30 + u * 370;
      const py = 120 - bendCoeff * 75 * u * u;
      const my = 120 + monoCoeff * 95 * u * u;
      protonD += ` L ${px.toFixed(1)} ${Math.max(18, py).toFixed(1)}`;
      monoD += ` L ${px.toFixed(1)} ${Math.min(222, my).toFixed(1)}`;
    }
    return { protonD, monoD };
  }, [fieldT, energyGev, metrics.deflectionSlopeT]);

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

        <div className="xl:col-span-7 bg-[#060913] border-3 border-black p-4 shadow-[5px_5px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs font-mono">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Magnet className="w-4 h-4 text-sky-400" /> Field Chamber Signature Comparison
            </span>
            <span className="text-text-muted">Cyan: Proton (+e) | Amber: Monopole (+{diracUnits} g_D)</span>
          </div>

          <svg viewBox="0 0 430 240" className="w-full h-60 bg-[#04060D] border border-zinc-800" aria-label="Proton versus Dirac magnetic monopole bending comparison">
            <line x1="30" y1="120" x2="410" y2="120" stroke="#334155" strokeDasharray="4 4" />
            <path d={paths.protonD} fill="none" stroke="#00E5FF" strokeWidth="3" />
            <path d={paths.monoD} fill="none" stroke="#FFB000" strokeWidth="3.5" />
            <circle cx="30" cy="120" r="6" fill="#FFFFFF" />
            <text x="275" y="42" fill="#00E5FF" fontSize="10" fontFamily="monospace" fontWeight="bold">
              Standard Proton (Lorentz v×B)
            </text>
            <text x="230" y="212" fill="#FFB000" fontSize="10" fontFamily="monospace" fontWeight="bold">
              Dirac Monopole ({metrics.ionizingLossRatioVsProton.toFixed(0)}× Brighter)
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
