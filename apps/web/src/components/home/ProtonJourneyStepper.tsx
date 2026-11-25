'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGlobalStore } from '@/lib/store';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Compass, Play } from 'lucide-react';

interface JourneyStage {
  id: number;
  shortTitle: string;
  title: string;
  energyLabel: string;
  speedBeta: string;
  gammaLabel: string;
  linkHref: string;
  linkLabel: string;
  color: string;
  eli5: string;
  undergrad: string;
  researcher: string;
}

const STAGES: JourneyStage[] = [
  {
    id: 1,
    shortTitle: 'H₂ Bottle',
    title: '01 · Duoplasmatron & H⁻ Ion Source',
    energyLabel: '90 keV',
    speedBeta: '0.014 c',
    gammaLabel: '1.0001',
    linkHref: '/accelerators',
    linkLabel: 'Inspect Injector Chain',
    color: 'bg-sky-400',
    eli5: 'Everything inside the mighty LHC begins inside one ordinary red gas tank of hydrogen! An electric spark knocks electrons around so hydrogen atoms pick up an extra electron and are ready to steer.',
    undergrad: 'H₂ gas is ionized in a microwave/RF plasma chamber to produce negative hydrogen ions (H⁻) extracted at 45 keV before RFQ bunching to 3 MeV.',
    researcher: 'Linac4 H⁻ charge-exchange injection avoids Liouville theorem phase-space dilution at PSB ring injection via carbon stripping foils.',
  },
  {
    id: 2,
    shortTitle: 'Linac4',
    title: '02 · Linac4 Linear Accelerator (86 m)',
    energyLabel: '160 MeV',
    speedBeta: '0.519 c',
    gammaLabel: '1.170',
    linkHref: '/simulations?module=optics',
    linkLabel: 'Open Beam Optics Sandbox',
    color: 'bg-cern-cyan',
    eli5: 'Protons fly down a straight 86-meter copper corridor, getting kicked faster and faster by alternating electric waves until they reach half the speed of light!',
    undergrad: 'Drift-Tube Linac (DTL), Cell-Coupled DTL, and Pi-Mode Structures (PIMS) accelerate H⁻ ions to 160 MeV before stripping both electrons cleanly.',
    researcher: 'Operates at 352.2 MHz; multi-turn charge-exchange painting into the 4 superimposed PSB rings doubles beam brightness for HL-LHC.',
  },
  {
    id: 3,
    shortTitle: 'PSB + PS',
    title: '03 · Proton Synchrotron Booster & PS (26 GeV)',
    energyLabel: '26 GeV',
    speedBeta: '0.99935 c',
    gammaLabel: '27.7',
    linkHref: '/accelerators',
    linkLabel: 'Compare PS & PSB Specs',
    color: 'bg-emerald-400',
    eli5: 'Now the beam enters circular racetracks! Here protons are grouped into neat marbles separated by exactly 25 billionths of a second—the heartbeat of the entire LHC.',
    undergrad: 'PSB lifts energy from 160 MeV → 2 GeV; the 628 m PS ring uses harmonic RF splitting to craft standard 25 ns LHC bunch trains at 26 GeV.',
    researcher: 'Transition crossing γ_tr ≈ 6.1 in the PS requires γ_t-jump quadrupoles to suppress longitudinal microwave instabilities and emittance blow-up.',
  },
  {
    id: 4,
    shortTitle: 'SPS',
    title: '04 · Super Proton Synchrotron (450 GeV)',
    energyLabel: '450 GeV',
    speedBeta: '0.9999978 c',
    gammaLabel: '479.6',
    linkHref: '/engineering',
    linkLabel: 'Explore RF & Vacuum Twin',
    color: 'bg-amber-400',
    eli5: 'CERN’s 7-km underground workhorse boosts protons nearly to 99.9998% light speed before shooting them down deep transfer tunnels into the giant 27-km LHC.',
    undergrad: 'The 6.9 km SPS ring accelerates up to 288 bunches per fill to 450 GeV using 200 MHz traveling-wave RF cavities before fast kicker extraction.',
    researcher: 'SPS also feeds fixed-target North Area experiments, AWAKE plasma wakefield, and NA62 while serving as the final LHC injector (TI2 / TI8 lines).',
  },
  {
    id: 5,
    shortTitle: 'LHC 6.8 TeV',
    title: '05 · LHC Superconducting Ramp (6.8 TeV / beam)',
    energyLabel: '6.8 TeV',
    speedBeta: '0.999999991 c',
    gammaLabel: '7,249',
    linkHref: '/simulations?module=lhc',
    linkLabel: 'Launch LHC Simulator',
    color: 'bg-purple-400',
    eli5: 'Inside 1.9 Kelvin frozen magnets, each proton finishes 11,245 laps per second around the 27-km Geneva ring. Because they move near light speed, Einstein’s relativity slows their internal clock down by 7,249×!',
    undergrad: '1,232 Nb-Ti dipoles ramp to ~8.1–8.33 T as 400 MHz superconducting cavities add 485 keV per revolution over ~20 minutes to reach 6.8 TeV flat-top.',
    researcher: 'Magnetic rigidity Bρ reaches 22,682 T·m at 6.8 TeV; β* is squeezed down to ~30 cm at IP1/IP5 via inner triplet Nb-Ti/Nb₃Sn quadrupoles.',
  },
  {
    id: 6,
    shortTitle: 'Collision',
    title: '06 · IP1 (ATLAS) & IP5 (CMS) 13.6 TeV Crossing',
    energyLabel: '13.6 TeV √s',
    speedBeta: '40 MHz IP',
    gammaLabel: 'μ ≈ 60 pile-up',
    linkHref: '/detectors',
    linkLabel: 'Inspect 3D Collision Twins',
    color: 'bg-cern-magenta',
    eli5: 'Two beams moving opposite ways are squeezed finer than a human hair and collide 40 million times every second! All that speed turns straight into brand-new particles via E = mc².',
    undergrad: 'Counter-rotating 1.6×10¹¹ proton bunches cross at 40 MHz inside giant layered cylindrical detectors (silicon trackers → ECAL → HCAL → muon spectrometers).',
    researcher: 'Peak Run 3 leveled luminosity L ≈ 2.1×10³⁴ cm⁻²s⁻¹ produces ~60 inelastic pp interactions per bunch crossing with ~1.5 ms total drift/readout buffering.',
  },
  {
    id: 7,
    shortTitle: '5σ Discovery',
    title: '07 · L1 Trigger, WLCG Grid & Statistical Proof',
    energyLabel: '1 PB/s → 3 GB/s',
    speedBeta: '3.2 μs FPGA',
    gammaLabel: 'Z₀ ≥ 5.0 σ',
    linkHref: '/simulations?module=discovery',
    linkLabel: 'Run 5-Sigma Discovery Lab',
    color: 'bg-emerald-400',
    eli5: 'Too many photos happen every second to ever save on a hard drive! Ultra-fast AI chips keep only the 1-in-10,000 most exciting collisions, sending them across 170 world supercomputers to spot hidden particles like the Higgs!',
    undergrad: 'Hardware Level-1 FPGA triggers slash 40 MHz down to 100 kHz in microseconds; HLT farms filter to ~3 kHz for permanent WLCG storage and statistical profile-likelihood fits.',
    researcher: 'Only ~10⁻⁴ of inelastic events survive L1+HLT; asymptotic Asimov discovery significance Z₀ > 5σ rejects background-only hypotheses at p < 2.87×10⁻⁷.',
  },
];

export const ProtonJourneyStepper: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const userLevel = useGlobalStore((s) => s.userLevel);
  const eli5Mode = useGlobalStore((s) => s.eli5Mode);

  const stage = STAGES[activeIdx];
  const showBeginnerCopy = eli5Mode || userLevel === 'BEGINNER';

  return (
    <section className="p-5 sm:p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#00E5FF] space-y-5">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cern-cyan text-black font-mono font-black text-[10px] border-2 border-black uppercase shadow-[2px_2px_0px_#000]">
              INTERACTIVE GUIDED TOUR · 0 TO 13.6 TEV
            </span>
            <span className="text-[11px] font-mono text-text-muted font-bold">
              Synced to: <strong className="text-[#FFE600]">{showBeginnerCopy ? 'ELI5 / BEGINNER' : userLevel}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-cern-cyan" /> End-to-End Journey of a Single Proton
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
            disabled={activeIdx === 0}
            className="px-2.5 py-1.5 bg-canvas-sub text-white border-2 border-black shadow-[2px_2px_0px_#000] disabled:opacity-40 cursor-pointer flex items-center gap-1 font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button
            onClick={() => setActiveIdx((prev) => (prev + 1) % STAGES.length)}
            className="px-3 py-1.5 bg-cern-blue hover:bg-cern-accent text-white border-2 border-black shadow-[2px_2px_0px_#00E5FF] cursor-pointer flex items-center gap-1 font-bold uppercase"
          >
            <span>{activeIdx === STAGES.length - 1 ? 'Restart Tour' : 'Next Stage'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive 7-Stage Pipeline Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STAGES.map((st, idx) => {
          const isCurrent = idx === activeIdx;
          const isVisited = idx < activeIdx;
          return (
            <button
              key={st.id}
              onClick={() => setActiveIdx(idx)}
              className={`p-2.5 border-2 border-black text-left font-mono transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                isCurrent
                  ? `${st.color} text-black shadow-[4px_4px_0px_#000] -translate-x-0.5 -translate-y-0.5 font-black`
                  : isVisited
                  ? 'bg-canvas-sub text-white border-emerald-500/60 shadow-[2px_2px_0px_#000]'
                  : 'bg-canvas-sub text-text-muted hover:text-white shadow-[2px_2px_0px_#000]'
              }`}
            >
              <span className="text-[10px] font-bold uppercase opacity-80">Step 0{st.id}</span>
              <span className="text-xs font-extrabold truncate">{st.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Deep Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center bg-canvas-sub border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
        {/* Left 8 cols: Narrative synchronized to mode */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 text-[11px] font-mono font-black text-black border border-black ${stage.color}`}>
              STAGE 0{stage.id} / 07
            </span>
            <h3 className="text-lg font-display font-black text-white">{stage.title}</h3>
          </div>

          <p className="text-sm font-sans leading-relaxed text-text-primary">
            {showBeginnerCopy
              ? stage.eli5
              : userLevel === 'UNDERGRAD'
              ? stage.undergrad
              : stage.researcher}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3">
            <Link
              href={stage.linkHref}
              className="px-4 py-2 bg-[#FFE600] hover:bg-amber-300 text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{stage.linkLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] font-mono text-text-muted">
              Toggle 👶 ELI5 or Researcher mode in the top bar to transform this explanation!
            </span>
          </div>
        </div>

        {/* Right 4 cols: Live Physics State Telemetry for Selected Stage */}
        <div className="lg:col-span-4 space-y-2 text-xs font-mono bg-black p-3.5 border-2 border-black">
          <div className="text-[10px] font-bold uppercase text-cern-cyan flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Stage Relativistic Snapshot
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-800/80">
            <span className="text-text-muted">Kinetic / Beam Energy:</span>
            <span className="text-[#FFE600] font-black">{stage.energyLabel}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-800/80">
            <span className="text-text-muted">Velocity / Clock:</span>
            <span className="text-cern-cyan font-bold">{stage.speedBeta}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted">Lorentz γ / Context:</span>
            <span className="text-emerald-400 font-bold">{stage.gammaLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
