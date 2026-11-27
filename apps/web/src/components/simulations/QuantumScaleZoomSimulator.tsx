'use client';

import React, { useState, useMemo, useId } from 'react';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { useGlobalStore } from '@/lib/store';
import { playDiscoveryChime, playTemPadClick } from '@/lib/sonifier';
import { ZoomIn, Compass } from 'lucide-react';

interface ScaleMilestone {
  exp: number;
  title: string;
  sizeLabel: string;
  cernInstrument: string;
  color: string;
  description: string;
}

const SCALE_MILESTONES: ScaleMilestone[] = [
  {
    exp: 26,
    title: 'Observable Universe Horizon',
    sizeLabel: '10²⁶ m (8.8 × 10²⁶ m)',
    cernInstrument: 'CERN Cosmology & Early-Universe QGP Analogues (ALICE)',
    color: '#A855F7',
    description: 'Macroscopic cosmic web shaped by Higgs phase transitions moments after the Big Bang.',
  },
  {
    exp: 4,
    title: 'Large Hadron Collider Ring',
    sizeLabel: '10⁴ m (8.6 km diameter)',
    cernInstrument: 'LHC 27 km Underground Cryogenic Tunnel',
    color: '#00E5FF',
    description: '100 meters underground across the Swiss–French border housing ATLAS, CMS, ALICE, and LHCb.',
  },
  {
    exp: -10,
    title: 'Hydrogen Atom (Electron Cloud)',
    sizeLabel: '10⁻¹⁰ m (1 Ångström)',
    cernInstrument: 'Antimatter Factory / ALPHA-g Antihydrogen Spectroscopy',
    color: '#38BDF8',
    description: 'CERN’s Antiproton Decelerator traps antihydrogen atoms inside magnetic bottles to test CPT & gravity.',
  },
  {
    exp: -15,
    title: 'Atomic Nucleus (Femtometer)',
    sizeLabel: '10⁻¹⁵ m (1 fm)',
    cernInstrument: 'ISOLDE & ALICE Heavy-Ion Pb-Pb Collisions',
    color: '#FFE600',
    description: 'Protons & neutrons packed tighter than a neutron star; heated in ALICE to free Quarks & Gluons.',
  },
  {
    exp: -18,
    title: 'Proton Inner Quark & Gluon Sea',
    sizeLabel: '10⁻¹⁸ m (Attometer)',
    cernInstrument: 'ATLAS & CMS High-p_T Deep Inelastic Parton Scattering',
    color: '#FF0055',
    description: 'At multi-TeV energies, protons resolve into swirling gluons and ephemeral quark–antiquark pairs.',
  },
  {
    exp: -19,
    title: 'Electroweak / Higgs Probe Limit',
    sizeLabel: '10⁻¹⁹ m (~0.1 zm)',
    cernInstrument: '13.6 TeV LHC Resolution Frontier (ħc / E)',
    color: '#10B981',
    description: 'World’s sharpest quantum microscope: probes substructure 10,000× smaller than an atomic nucleus!',
  },
  {
    exp: -35,
    title: 'Planck Length (Quantum Gravity Floor)',
    sizeLabel: '10⁻³⁵ m',
    cernInstrument: 'Theoretical Quantum Gravity & Extra-Dimension Frontier',
    color: '#F97316',
    description: 'Scale where spacetime itself becomes quantized—16 orders deeper than current collider energy!',
  },
];

export const QuantumScaleZoomSimulator: React.FC = () => {
  const sliderPrefix = useId();
  const completeMission = useGlobalStore((s) => s.completeMission);
  const [scaleExp, setScaleExp] = useState<number>(-15);

  const handleScaleChange = (exp: number) => {
    setScaleExp(exp);
    playTemPadClick();
    if (exp <= -18.5) {
      completeMission('mission-quantum-zoom');
      playDiscoveryChime();
    }
  };

  const activeMilestone = useMemo(() => {
    let closest = SCALE_MILESTONES[0];
    let minDiff = Infinity;
    for (const m of SCALE_MILESTONES) {
      const d = Math.abs(m.exp - scaleExp);
      if (d < minDiff) {
        minDiff = d;
        closest = m;
      }
    }
    return closest;
  }, [scaleExp]);

  // De Broglie / Heisenberg energy scale E = hbar * c / L (in GeV roughly: 1.973e-16 GeV*m / L)
  const requiredEnergyLog10Gev = -15.705 - scaleExp;

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Ant-Man’s Quantum Realm Dive: 61 Orders of Magnitude at CERN!"
        analogy="Why do we need a giant 27-kilometer ring just to look inside a tiny proton? Because quantum mechanics acts like a camera lens with an inverse rule: the tinier the target you want to photograph (10⁻¹⁹ m), the MORE collision energy you need—turning the LHC into the most powerful microscope humanity has ever built!"
      />

      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <FidelityBadge type="ANALYTIC" />
            <span className="px-2 py-0.5 bg-purple-400 text-black font-mono font-black text-[10px] border-2 border-black uppercase">
              PYM-LOGARITHMIC MICROSCOPE // 10²⁶ m → 10⁻³⁵ m
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-white">
            Quantum Realm Scale Zoom &amp; Compton Microscope
          </h2>
          <p className="text-xs font-mono text-text-secondary mt-1">
            Scrub continuously across cosmic horizons down to quarks, Higgs resolution (10⁻¹⁹ m), and the Planck floor.
          </p>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] text-text-muted uppercase">Active Spatial Resolution</div>
          <div className="text-2xl font-black text-cern-cyan">10^{scaleExp.toFixed(1)} m</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls & Quick Checkpoints */}
        <div className="lg:col-span-5 space-y-4 bg-canvas-surface border-3 border-black p-4 shadow-[5px_5px_0px_#000]">
          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-exp`} className="text-text-muted uppercase">
                Logarithmic Scale Exponent (10^x m):
              </label>
              <span className="text-[#FFE600]">x = {scaleExp.toFixed(1)}</span>
            </div>
            <input
              id={`${sliderPrefix}-exp`}
              type="range"
              min={-35}
              max={26}
              step={0.5}
              value={scaleExp}
              aria-valuetext={`10 to the power ${scaleExp.toFixed(1)} meters`}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span>10⁻³⁵ m (Planck)</span>
              <span>10⁻¹⁵ m (Nucleus)</span>
              <span>10²⁶ m (Cosmos)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-mono font-bold uppercase text-text-muted flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cern-cyan" /> Instant Quantum Jumps
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SCALE_MILESTONES.map((m) => (
                <button
                  key={m.exp}
                  type="button"
                  onClick={() => handleScaleChange(m.exp)}
                  className={`px-3 py-2 text-left border-2 border-black font-mono text-xs flex items-center justify-between cursor-pointer ${
                    activeMilestone.exp === m.exp
                      ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#000]'
                      : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  <span className="font-bold">{m.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-black text-[#FFE600]">
                    10^{m.exp} m
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Concentric Quantum Zoom Target View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-[#050812] border-3 border-black shadow-[5px_5px_0px_#000] flex flex-col items-center space-y-3">
            <div className="w-full flex justify-between items-center text-xs font-mono border-b border-zinc-800 pb-2">
              <span className="text-white font-bold flex items-center gap-1.5">
                <ZoomIn className="w-4 h-4 text-purple-400" /> {activeMilestone.title}
              </span>
              <span className="text-emerald-400 font-bold">
                E_probe ≈ 10^{requiredEnergyLog10Gev.toFixed(1)} GeV
              </span>
            </div>

            <svg viewBox="0 0 340 240" className="w-full h-56" aria-label="Logarithmic concentric scale visualization">
              {[-3, -2, -1, 0, 1, 2, 3].map((delta, i) => {
                const r = 18 + i * 16 + ((Math.abs(scaleExp * 7) + i * 3) % 10);
                return (
                  <circle
                    key={delta}
                    cx="170"
                    cy="120"
                    r={Math.min(108, r)}
                    fill="none"
                    stroke={activeMilestone.color}
                    strokeOpacity={0.22 + (i === 3 ? 0.65 : i * 0.08)}
                    strokeWidth={i === 3 ? '3' : '1.4'}
                    strokeDasharray={i % 2 === 0 ? '6 4' : undefined}
                  />
                );
              })}
              <circle cx="170" cy="120" r="8" fill={activeMilestone.color} />
              <text x="170" y="156" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontFamily="monospace" fontWeight="bold">
                {activeMilestone.sizeLabel}
              </text>
              <text x="170" y="176" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                {activeMilestone.cernInstrument}
              </text>
            </svg>

            <div className="w-full p-3.5 bg-canvas-sub border-2 border-black text-xs font-mono text-text-secondary leading-relaxed">
              <strong className="text-white block mb-1">{activeMilestone.cernInstrument}</strong>
              {activeMilestone.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
