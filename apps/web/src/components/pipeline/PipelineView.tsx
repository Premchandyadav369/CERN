'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { ArrowRight, Activity, Zap, Layers, Cpu, Server, BarChart3, Award, ExternalLink } from 'lucide-react';

interface PipelineStage {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  metric: string;
  metricLabel: string;
  route: string;
  description: string;
  equation?: string;
}

const STAGES: PipelineStage[] = [
  {
    id: 'accelerator',
    number: '01',
    title: 'ACCELERATOR',
    subtitle: 'Injector Chain & LHC',
    metric: '6.8 TeV',
    metricLabel: 'Beam Energy',
    route: '/simulations?module=lhc',
    description: 'Protons extracted from hydrogen gas are boosted through Linac4 (160 MeV), PSB (2.0 GeV), PS (26 GeV), and SPS (450 GeV) before injection into the 27 km superconducting LHC ring.',
    equation: 'B·ρ = p / (0.299792 · |Z|)',
  },
  {
    id: 'collision',
    number: '02',
    title: 'COLLISION',
    subtitle: 'Bunch Crossings',
    metric: '40 MHz',
    metricLabel: 'Crossing Frequency',
    route: '/simulations?module=lhc',
    description: '2748 bunches of 115 billion protons cross every 25 nanoseconds inside ATLAS and CMS with center-of-mass collision energy √s = 13.6 TeV.',
    equation: 'L = (N₁ N₂ n_b f_{rev} γ) / (4π ε_n β*) · F',
  },
  {
    id: 'detector',
    number: '03',
    title: 'DETECTOR',
    subtitle: 'Sensor Ionization',
    metric: '100M+',
    metricLabel: 'Readout Channels',
    route: '/detectors?detector=atlas',
    description: 'Debris particles ionize silicon pixels, deposit energy showers in lead-liquid argon calorimeters, and bend in magnetic toroid/solenoid fields.',
    equation: 'F = q(E + v × B)',
  },
  {
    id: 'trigger',
    number: '04',
    title: 'TRIGGER & DAQ',
    subtitle: 'Real-Time Filtering',
    metric: '99.997%',
    metricLabel: 'Rejection Rate',
    route: '/simulations?module=trigger',
    description: 'Custom hardware FPGAs (Level-1) decide in 2.5 µs whether to keep collisions, reducing 40 MHz crossings to 100 kHz. Software HLT farms further filter to 1-2 kHz.',
    equation: 'Rate = ∫ L · (dσ/dp_T) dp_T',
  },
  {
    id: 'storage',
    number: '05',
    title: 'DATA STORAGE',
    subtitle: 'CERN Data Centre',
    metric: '3.75 GB/s',
    metricLabel: 'Ingest Rate',
    route: '/computing',
    description: 'Accepted RAW events (~1.5 MB each) stream directly to automated high-density magnetic tape robots and distributed Ceph/EOS disk pools.',
    equation: 'Throughput = Event Rate × Event Size',
  },
  {
    id: 'wlcg',
    number: '06',
    title: 'WLCG GRID',
    subtitle: 'Distributed Compute',
    metric: '170+',
    metricLabel: 'Global Centres',
    route: '/computing',
    description: 'RAW data is replicated over 100 Gbps optical fiber to Tier-1 national centres and Tier-2 university supercomputing clusters worldwide.',
    equation: 'M/M/c Queuing Dynamics',
  },
  {
    id: 'reconstruction',
    number: '07',
    title: 'RECONSTRUCTION',
    subtitle: 'Physics Objects',
    metric: 'Tracks & Jets',
    metricLabel: 'Output Objects',
    route: '/detectors?detector=atlas',
    description: 'Raw digitized detector hits are reconstructed into particle trajectories, primary collision vertices, isolated leptons, and anti-kT jets.',
    equation: 'd_{ij} = min(p_{Ti}^{2k}, p_{Tj}^{2k}) ΔR_{ij}^2 / R^2',
  },
  {
    id: 'analysis',
    number: '08',
    title: 'AI & ANALYSIS',
    subtitle: 'Statistical Fitting',
    metric: 'AMS = 3.34',
    metricLabel: 'TriggerMind',
    route: '/ai-lab',
    description: 'Physicists apply event selection cuts and machine learning algorithms (XGBoost, GNNs) to extract signal resonances over combinatorial background.',
    equation: 'Z = √[2((s+b)ln(1+s/b) - s)]',
  },
  {
    id: 'discovery',
    number: '09',
    title: 'PUBLICATION',
    subtitle: 'Peer Review & Open Data',
    metric: '5.0 σ',
    metricLabel: 'Discovery Threshold',
    route: '/open-data',
    description: 'Statistical significance is established with rigorous systematic error budgets, published in open-access journals, and released to CERN Open Data.',
    equation: 'p < 2.87 × 10^{-7} (5σ)',
  },
];

export const PipelineView: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>('accelerator');

  const activeStage = STAGES.find((s) => s.id === activeStageId) || STAGES[0];

  return (
    <div className="w-full flex flex-col gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-black gap-2">
        <div>
          <span className="text-xs font-mono uppercase text-cern-cyan tracking-wider font-bold">
            /// END-TO-END SCIENTIFIC WORKFLOW ///
          </span>
          <h2 className="text-xl font-display font-extrabold text-white mt-0.5">
            From Proton Source to Scientific Discovery
          </h2>
        </div>
        <span className="text-xs font-mono text-text-muted font-bold">
          Click any phase to inspect details &amp; open simulation
        </span>
      </div>

      <Eli5Card
        title="How 40 Million Crashes/Sec Turn Into a Single Nobel Prize Graph"
        analogy="Finding one Higgs boson inside LHC collisions is like listening to a roaring stadium of 40 million people yelling at once, filtering out 99.997% of the noise in 2.5 millionths of a second, mailing only the crispest snapshots around the planet, and counting exact echoes!"
        keyPoints={[
          'Stages 01–03 (Physical): Accelerate protons, smash them inside giant magnetic cameras, and measure ionization sparks.',
          'Stages 04–06 (Digital): FPGAs reject dull background noise in microseconds before streaming data to 170+ world computing centers.',
          'Stages 07–09 (Discovery): Machine learning + 5-sigma statistics prove a brand-new particle exists beyond reasonable doubt.',
        ]}
        whatToTry="Click through Stages 01 → 09 below to jump directly into the simulation or data lab for every single step!"
        doi="10.1016/j.physletb.2012.08.020"
        citationLabel="ATLAS & CMS (2012) Observation of a New Boson at 125 GeV"
      />

      {/* Horizontal Interactive Pipeline Ribbon */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
        {STAGES.map((stg, idx) => {
          const isSelected = stg.id === activeStageId;

          return (
            <React.Fragment key={stg.id}>
              <button
                onClick={() => setActiveStageId(stg.id)}
                className={`shrink-0 text-left p-3.5 border-2 transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                  isSelected
                    ? 'bg-cern-blue border-black text-white shadow-[4px_4px_0px_#00E5FF]'
                    : 'bg-canvas-surface border-black text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                }`}
                style={{ minWidth: '155px' }}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className={`font-bold ${isSelected ? 'text-cern-cyan' : 'text-cern-accent'}`}>
                    {stg.number}
                  </span>
                  <span className="text-[10px] text-text-muted uppercase font-bold">{stg.metricLabel}</span>
                </div>
                <div className="font-mono text-xs font-bold text-white truncate uppercase">
                  {stg.title}
                </div>
                <div className="text-xs font-mono font-bold mt-1 text-emerald-400">
                  {stg.metric}
                </div>
              </button>

              {idx < STAGES.length - 1 && (
                <ArrowRight className="w-4 h-4 shrink-0 text-zinc-600 font-bold" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Detail Inspection Card */}
      <div className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-cern-blue text-white border-2 border-black shadow-[2px_2px_0px_#000] uppercase">
              STAGE {activeStage.number}
            </span>
            <h3 className="text-lg font-display font-extrabold text-white">
              {activeStage.title}: {activeStage.subtitle}
            </h3>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-sans max-w-3xl">
            {activeStage.description}
          </p>

          {activeStage.equation && (
            <div className="p-2.5 bg-black border-2 border-black shadow-[2px_2px_0px_#000] font-mono text-xs text-amber-300 w-fit font-bold">
              {activeStage.equation}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end">
          <Link
            href={activeStage.route}
            className="flex items-center gap-2 py-2.5 px-4 bg-cern-blue hover:bg-cern-accent text-white font-mono text-xs font-bold uppercase border-2 border-black shadow-[3px_3px_0px_#00E5FF] hover:shadow-[4px_4px_0px_#00E5FF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <span>Open {activeStage.title} Module</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
