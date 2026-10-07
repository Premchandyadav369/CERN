import React from 'react';
import Link from 'next/link';
import { RingMap } from '@/components/home/RingMap';
import { PipelineView } from '@/components/pipeline/PipelineView';
import { Value } from '@/components/provenance/Value';
import {
  Compass,
  Cpu,
  Layers,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Atom,
  Server,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col space-y-10 px-4 lg:px-8 py-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cern-blue/20 text-cern-accent border border-cern-blue/40">
            CERN-X 1.0
          </span>
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> STRICT PROVENANCE ACTIVE
          </span>
          <span className="text-xs font-mono text-text-muted">
            12/12 Physics Validation Tests Verified
          </span>
        </div>

        <div className="space-y-2 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-text-primary">
            The Interactive Digital Universe of CERN
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            An open-source scientific digital representation of CERN&apos;s accelerators, experimental
            detectors, trigger pipelines, distributed computing, and artificial intelligence research.
            Every number is traceable to an official CERN publication, open dataset, or verified model.
          </p>
        </div>

        {/* Live Operational Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-canvas-surface border border-canvas-border rounded-panel">
            <span className="text-[11px] font-mono text-text-muted block">Run 3 Beam Energy</span>
            <Value manifestId="lhc-nominal-beam-energy-run3" value={6.8} unit="TeV" digits={1} />
          </div>
          <div className="p-3 bg-canvas-surface border border-canvas-border rounded-panel">
            <span className="text-[11px] font-mono text-text-muted block">Main Dipole Field</span>
            <Value manifestId="lhc-dipole-field-nominal" value={8.33} unit="T" digits={2} />
          </div>
          <div className="p-3 bg-canvas-surface border border-canvas-border rounded-panel">
            <span className="text-[11px] font-mono text-text-muted block">Higgs Boson Mass</span>
            <Value manifestId="higgs-boson-mass-pdg" value={125.25} unit="GeV" digits={2} />
          </div>
          <div className="p-3 bg-canvas-surface border border-canvas-border rounded-panel">
            <span className="text-[11px] font-mono text-text-muted block">AI Flagship AMS</span>
            <Value manifestId="triggermind-xgboost-benchmark" value={3.339} digits={3} />
          </div>
        </div>
      </section>

      {/* Signature Component 1: Interactive Ring Map */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-text-primary">
              1. The CERN Accelerator Complex
            </h2>
            <p className="text-xs text-text-muted">
              Explore the injector chain from Hydrogen bottle through Linac4, PSB, PS, SPS, to the LHC.
            </p>
          </div>
        </div>
        <RingMap />
      </section>

      {/* Signature Component 2: End-to-End Scientific Pipeline */}
      <section className="space-y-3 pt-4">
        <PipelineView />
      </section>

      {/* Core Domain Hub Grid */}
      <section className="space-y-4 pt-4">
        <div>
          <h2 className="text-lg font-display font-bold text-text-primary">
            Scientific Exploration Modules
          </h2>
          <p className="text-xs text-text-muted">
            Jump directly into validated simulators and research laboratories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Accelerators Card */}
          <Link
            href="/accelerators"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-canvas-borderStrong rounded-panel transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <Zap className="w-5 h-5 text-cern-cyan" />
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary">
                Accelerators &amp; Beam Physics
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Relativistic kinematics, magnetic rigidity $B\rho$, radiofrequency acceleration, and
                bunch crossing luminosity.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cern-cyan">7 Accelerators Documented →</div>
          </Link>

          {/* Detector Twins Card */}
          <Link
            href="/detectors"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-canvas-borderStrong rounded-panel transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <Layers className="w-5 h-5 text-cern-accent" />
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary">
                ATLAS &amp; CMS Detector Twins
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Layered subsystem cutaways, subsystem filters, and real CERN Open Data 13 TeV collision
                event displays.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cern-accent">Real Open Data Events →</div>
          </Link>

          {/* AI Lab Card */}
          <Link
            href="/ai-lab"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-canvas-borderStrong rounded-panel transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <Cpu className="w-5 h-5 text-amber-400" />
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary">
                AI Lab &amp; LHC-TriggerMind
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Reproducible machine learning benchmark on public ATLAS simulation data, comparing
                latency, memory, and AMS.
              </p>
            </div>
            <div className="text-[11px] font-mono text-amber-400">Research Experiment #001 →</div>
          </Link>

          {/* Computing & WLCG Card */}
          <Link
            href="/computing"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-canvas-borderStrong rounded-panel transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <Server className="w-5 h-5 text-emerald-400" />
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary">
                WLCG Grid &amp; Data Centre
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Discrete-event simulation of Tier-0/1/2 queuing, replication, link failures, and HL-LHC
                storage growth.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">170+ Tier Nodes →</div>
          </Link>

          {/* Discovery Exercise Card */}
          <Link
            href="/simulations?module=discovery"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-canvas-borderStrong rounded-panel transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <Activity className="w-5 h-5 text-pink-400" />
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary">
                Discovery Exercise Lab
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Interactive diphoton resonance fitting, background estimation, and Asimov significance
                evaluation.
              </p>
            </div>
            <div className="text-[11px] font-mono text-pink-400">5-Sigma Threshold →</div>
          </Link>

          {/* Learn & Glossary Card */}
          <Link
            href="/learn"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-canvas-borderStrong rounded-panel transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <Atom className="w-5 h-5 text-cern-cyan" />
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary">
                Physics Glossary &amp; Particles
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                3-tier explanations (Beginner, Undergrad, Researcher) and PDG 2024 particle properties
                and decay trees.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cern-cyan">PDG 2024 Verified →</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
