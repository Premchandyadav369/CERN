'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { calculateFromTotalEnergy, PROTON_MASS_GEV, SPEED_OF_LIGHT_M_S } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { Gauge, Play, Pause, Sparkles } from 'lucide-react';

interface RacerSpec {
  id: string;
  name: string;
  energyLabel: string;
  energyGev: number;
  isPhoton?: boolean;
  color: string;
  barClass: string;
}

const RACERS: RacerSpec[] = [
  { id: 'photon', name: 'Photon (Laser Reference)', energyLabel: '1.000000000 c', energyGev: 0, isPhoton: true, color: '#FFE600', barClass: 'bg-[#FFE600]' },
  { id: 'lhc', name: 'LHC Run 3 Proton (6.8 TeV)', energyLabel: '6,800 GeV', energyGev: 6800, color: '#00E5FF', barClass: 'bg-cern-cyan' },
  { id: 'sps', name: 'SPS Injector Proton (450 GeV)', energyLabel: '450 GeV', energyGev: 450, color: '#4C7DFF', barClass: 'bg-cern-accent' },
  { id: 'ps', name: 'PS Proton (26 GeV)', energyLabel: '26 GeV', energyGev: 26, color: '#00FF66', barClass: 'bg-emerald-400' },
  { id: 'linac4', name: 'Linac4 H⁻ Ion (160 MeV)', energyLabel: '1.098 GeV total', energyGev: PROTON_MASS_GEV + 0.16, color: '#FF0055', barClass: 'bg-cern-magenta' },
];

export const ParticleRaceSimulator: React.FC = () => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [customEnergyGev, setCustomEnergyGev] = useState<number>(6800);
  const [isRacing, setIsRacing] = useState<boolean>(true);
  const [tickSec, setTickSec] = useState<number>(0);

  useEffect(() => {
    if (!isRacing || reduceMotion) return;
    const id = setInterval(() => {
      setTickSec((t) => (t + 0.05) % 10);
    }, 50);
    return () => clearInterval(id);
  }, [isRacing, reduceMotion]);

  const customRel = useMemo(() => calculateFromTotalEnergy(customEnergyGev, PROTON_MASS_GEV), [customEnergyGev]);

  const racerData = useMemo(() => {
    const circM = 26658.883;
    return RACERS.map((r) => {
      if (r.isPhoton) {
        return {
          ...r,
          beta: 1.0,
          gamma: Infinity,
          lagBehindLightMm: 0,
          lapsPerSec: SPEED_OF_LIGHT_M_S / circM,
        };
      }
      const st = calculateFromTotalEnergy(r.energyGev, PROTON_MASS_GEV);
      // Distance gap after finishing 1 full 26.66 km LHC lap compared to a photon
      const lagMm = circM * (1 - st.beta) * 1000;
      const lapsPerSec = (st.beta * SPEED_OF_LIGHT_M_S) / circM;
      return {
        ...r,
        beta: st.beta,
        gamma: st.gamma,
        lagBehindLightMm: lagMm,
        lapsPerSec,
      };
    });
  }, []);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Einstein’s Speed Limit: Racing a 6.8 TeV Proton Against a Laser Beam!"
        analogy="Nothing with mass can ever catch a ray of light—so even if CERN pumps a proton with 7,000× more energy inside the LHC, it only goes slightly closer to light speed! Instead, all that energy stretches the proton's relativistic clock down 7,249× slower, turning one lap around Geneva into a near-photo finish just 2.5 millimeters behind light!"
        keyPoints={[
          'Speed Saturation: Going from Linac4 (51.9% c) to PS (99.93% c) takes huge speed jumps, while going from SPS to LHC barely moves 0.0002%!',
          'Lorentz Time Dilation (γ = E / mc²): At 6.8 TeV, 1 second for a proton equals over 2 hours in our control room!',
        ]}
        whatToTry="Drag the Custom Proton Energy slider up toward 6,800 GeV and watch Lorentz Gamma (γ) soar past 7,200 while Speed (β) hits the cosmic 1.00000000 c ceiling!"
        doi="10.5170/CERN-2004-003-V-1"
        citationLabel="Special Relativity Beam Kinematics (@cern-x/sim-core)"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
        {/* Custom Relativistic Clock Explorer (5 cols) */}
        <div className="xl:col-span-5 space-y-4 bg-canvas-surface border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-xs font-mono font-black uppercase text-white flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-cern-cyan" /> Relativistic Clock Lab
            </h3>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">Custom Proton Total Energy:</span>
              <span className="text-cern-cyan">{customEnergyGev.toLocaleString('en-US')} GeV</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={7000}
              step={10}
              value={customEnergyGev}
              onChange={(e) => setCustomEnergyGev(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="p-3 bg-canvas-sub border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">Speed Fraction (β = v/c)</span>
              <strong className="text-white text-sm">{customRel.beta.toFixed(9)} c</strong>
            </div>
            <div className="p-3 bg-canvas-sub border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">Lorentz Gamma (γ)</span>
              <strong className="text-[#FFE600] text-sm">{customRel.gamma.toFixed(1)}×</strong>
            </div>
            <div className="p-3 bg-canvas-sub border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">Lab Wall Clock</span>
              <strong className="text-emerald-400 text-sm">{tickSec.toFixed(2)} s</strong>
            </div>
            <div className="p-3 bg-canvas-sub border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">Proton Proper Clock (τ)</span>
              <strong className="text-cern-magenta text-sm">
                {(tickSec / Math.max(1, customRel.gamma)).toExponential(3)} s
              </strong>
            </div>
          </div>

          <MathFormula
            tex="\beta = \sqrt{1 - \gamma^{-2}}, \quad \Delta t = \gamma\,\Delta\tau"
            label="Lorentz Invariance & Time Dilation:"
          />
        </div>

        {/* 26.66 km CERN Complex Speed Race (7 cols) */}
        <div className="xl:col-span-7 space-y-4 bg-canvas-surface border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-xs font-mono font-black uppercase text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFE600]" /> Live 26.66 km Light-Speed Gap Comparator
            </h3>
            <button
              onClick={() => setIsRacing(!isRacing)}
              className="px-2.5 py-1 bg-canvas-sub border-2 border-black text-[10px] font-mono font-bold text-cern-cyan flex items-center gap-1"
            >
              {isRacing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isRacing ? 'Pause Clocks' : 'Resume Clocks'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {racerData.map((r) => {
              const progressPct = reduceMotion ? r.beta * 100 : ((tickSec * 12 * r.beta) % 100);
              return (
                <div key={r.id} className="p-3 bg-canvas-sub border-2 border-black space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{r.name}</span>
                    <span style={{ color: r.color }} className="font-bold text-[11px]">
                      {r.isPhoton ? 'Exact c (0 mm lag)' : `${r.beta.toFixed(7)} c · Gap/lap: ${r.lagBehindLightMm >= 1000 ? `${(r.lagBehindLightMm / 1000).toFixed(1)} m` : `${r.lagBehindLightMm.toFixed(2)} mm`}`}
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-black border border-black relative overflow-hidden">
                    <motion.div
                      className={`h-full w-full origin-left ${r.barClass}`}
                      animate={{ scaleX: Math.max(0.04, progressPct / 100) }}
                      transition={{ duration: 0.08, ease: 'linear' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
