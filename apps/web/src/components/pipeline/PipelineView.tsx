'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    <div className="w-full flex flex-col gap-6 p-4 lg:p-6 bg-canvas-sub border border-canvas-border rounded-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-canvas-border gap-2">
        <div>
          <span className="text-xs font-mono uppercase text-cern-cyan tracking-wider font-bold">
            END-TO-END SCIENTIFIC WORKFLOW
          </span>
          <h2 className="text-xl font-display font-bold text-text-primary mt-0.5">
            From Proton Source to Scientific Discovery
          </h2>
        </div>
        <span className="text-xs font-mono text-text-muted">
          Click any phase to inspect details &amp; open simulation
        </span>
      </div>

      {/* Horizontal Interactive Pipeline Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STAGES.map((stg, idx) => {
          const isSelected = stg.id === activeStageId;

          return (
            <React.Fragment key={stg.id}>
              <button
                onClick={() => setActiveStageId(stg.id)}
                className={`shrink-0 text-left p-3 rounded-panel border transition-all ${
                  isSelected
                    ? 'bg-canvas-raised border-cern-cyan ring-1 ring-cern-cyan shadow-lg shadow-cern-cyan/10'
                    : 'bg-canvas-surface border-canvas-border hover:bg-canvas-raised hover:border-canvas-borderStrong text-text-secondary'
                }`}
                style={{ minWidth: '150px' }}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-cern-cyan font-bold">{stg.number}</span>
                  <span className="text-text-muted">{stg.metricLabel}</span>
                </div>
                <div className="font-mono text-xs font-bold text-text-primary truncate">
                  {stg.title}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-1">
                  {stg.metric}
                </div>
              </button>

              {idx < STAGES.length - 1 && (
                <ArrowRight className="w-4 h-4 shrink-0 text-canvas-borderStrong" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Detail Inspection Card */}
      <div className="p-5 bg-canvas-surface border border-canvas-border rounded-panel flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cern-blue/30 text-cern-accent border border-cern-blue/60">
              STAGE {activeStage.number}
            </span>
            <h3 className="text-lg font-display font-bold text-text-primary">
              {activeStage.title}: {activeStage.subtitle}
            </h3>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">
            {activeStage.description}
          </p>

          {activeStage.equation && (
            <div className="p-2.5 bg-canvas-sub border border-canvas-border rounded font-mono text-xs text-amber-300 w-fit">
              {activeStage.equation}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end">
          <Link
            href={activeStage.route}
            className="flex items-center gap-2 py-2.5 px-4 bg-cern-blue hover:bg-cern-accent text-white font-mono text-xs font-semibold rounded transition-colors"
          >
            <span>Open {activeStage.title} Module</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
