import React from 'react';
import Link from 'next/link';
import { HeroBeamTunnel } from '@/components/home/HeroBeamTunnel';
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
  Radio,
  Gauge,
  Sparkles,
  ExternalLink,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col space-y-12 px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* 1. Main Signature Hero: 27km LHC Superconducting Beamline Tunnel (<LightTunnel />) */}
      <section className="w-full">
        <HeroBeamTunnel />
      </section>

      {/* 2. Real-Time Operational Telemetry & Physics Constants Ribbon */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cern-cyan animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase text-text-primary tracking-wider">
              CERN Control Centre (CCC) · Live Operational Baselines
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Cryogenics 1.9 K Nominal
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-canvas-surface border border-canvas-border hover:border-cern-cyan/50 rounded-panel transition-all">
            <span className="text-[11px] font-mono text-text-muted block">Run 3 Beam Energy</span>
            <Value manifestId="lhc-nominal-beam-energy-run3" value={6.8} unit="TeV" digits={1} />
            <span className="text-[10px] font-mono text-text-muted block mt-1">13.6 TeV Center-of-Mass</span>
          </div>

          <div className="p-4 bg-canvas-surface border border-canvas-border hover:border-cern-accent/50 rounded-panel transition-all">
            <span className="text-[11px] font-mono text-text-muted block">Main Dipole Field</span>
            <Value manifestId="lhc-dipole-field-nominal" value={8.33} unit="T" digits={2} />
            <span className="text-[10px] font-mono text-text-muted block mt-1">Nb-Ti Superconducting Coil</span>
          </div>

          <div className="p-4 bg-canvas-surface border border-canvas-border hover:border-pink-500/50 rounded-panel transition-all">
            <span className="text-[11px] font-mono text-text-muted block">Higgs Boson Mass</span>
            <Value manifestId="higgs-boson-mass-pdg" value={125.25} unit="GeV" digits={2} />
            <span className="text-[10px] font-mono text-text-muted block mt-1">PDG 2024 Reference</span>
          </div>

          <div className="p-4 bg-canvas-surface border border-canvas-border hover:border-amber-500/50 rounded-panel transition-all">
            <span className="text-[11px] font-mono text-text-muted block">AI Flagship AMS</span>
            <Value manifestId="triggermind-xgboost-benchmark" value={3.339} digits={3} />
            <span className="text-[10px] font-mono text-text-muted block mt-1">TriggerMind XGBoost L1</span>
          </div>
        </div>
      </section>

      {/* 3. Signature Component 1: Interactive Ring Map */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cern-blue/30 text-cern-cyan border border-cern-blue/50">
                MODULE 01
              </span>
              <h2 className="text-xl font-display font-bold text-text-primary">
                The CERN Accelerator Complex
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Explore the multi-tier injector chain from the Hydrogen bottle through Linac4, PSB, PS, SPS, to the LHC.
            </p>
          </div>
          <Link
            href="/accelerators"
            className="text-xs font-mono text-cern-cyan hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Accelerators Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <RingMap />
      </section>

      {/* 4. Signature Component 2: End-to-End Scientific Pipeline */}
      <section className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/50 text-purple-300 border border-purple-500/40">
                MODULE 02
              </span>
              <h2 className="text-xl font-display font-bold text-text-primary">
                End-to-End Scientific Pipeline
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Trace the trajectory of raw proton bunches through collisions, sensors, triggers, exascale storage, to peer-reviewed discovery.
            </p>
          </div>
          <Link
            href="/open-data"
            className="text-xs font-mono text-purple-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Data Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <PipelineView />
      </section>

      {/* 5. Core Domain Exploration Hub Grid */}
      <section className="space-y-4 pt-4">
        <div>
          <span className="text-xs font-mono uppercase text-cern-cyan tracking-wider font-bold">
            SCIENTIFIC DOMAINS &amp; LABORATORIES
          </span>
          <h2 className="text-xl font-display font-bold text-text-primary mt-0.5">
            Interactive Research Hubs
          </h2>
          <p className="text-xs text-text-muted">
            Direct access to quantitative simulators, detector twins, machine learning benchmarks, and computing architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Accelerators Card */}
          <Link
            href="/accelerators"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-cern-cyan/60 rounded-panel transition-all space-y-3 group shadow-sm hover:shadow-cyan-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-cern-cyan/10 border border-cern-cyan/30 text-cern-cyan">
                <Zap className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-cern-cyan transition-all" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary group-hover:text-cern-cyan transition-colors">
                Accelerators &amp; Beam Physics
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Relativistic kinematics, magnetic rigidity $B\rho$, RF cavity acceleration, and bunch
                crossing luminosity modeling.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cern-cyan font-semibold">7 Accelerators Documented →</div>
          </Link>

          {/* Detector Twins Card */}
          <Link
            href="/detectors"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-cern-accent/60 rounded-panel transition-all space-y-3 group shadow-sm hover:shadow-blue-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-cern-accent/10 border border-cern-accent/30 text-cern-accent">
                <Layers className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-cern-accent transition-all" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary group-hover:text-cern-accent transition-colors">
                ATLAS &amp; CMS Detector Twins
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Layered subsystem cutaways, sensor ionization filters, and real CERN Open Data 13 TeV collision event displays.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cern-accent font-semibold">Real Open Data Collision Events →</div>
          </Link>

          {/* AI Lab Card */}
          <Link
            href="/ai-lab"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-amber-400/60 rounded-panel transition-all space-y-3 group shadow-sm hover:shadow-amber-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary group-hover:text-amber-400 transition-colors">
                AI Lab &amp; LHC-TriggerMind
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Reproducible ML benchmark on public ATLAS simulation data comparing inference latency,
                memory footprint, and AMS.
              </p>
            </div>
            <div className="text-[11px] font-mono text-amber-400 font-semibold">Research Experiment #001 →</div>
          </Link>

          {/* Computing & WLCG Card */}
          <Link
            href="/computing"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-emerald-400/60 rounded-panel transition-all space-y-3 group shadow-sm hover:shadow-emerald-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-emerald-400/10 border border-emerald-400/30 text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary group-hover:text-emerald-400 transition-colors">
                WLCG Grid &amp; Data Centre
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Discrete-event queuing simulator of Tier-0/1/2 pipelines, multi-gigabit replication,
                link failover, and HL-LHC storage.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 font-semibold">170+ Distributed Tier Nodes →</div>
          </Link>

          {/* Discovery Exercise Card */}
          <Link
            href="/simulations?module=discovery"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-pink-400/60 rounded-panel transition-all space-y-3 group shadow-sm hover:shadow-pink-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-pink-400/10 border border-pink-400/30 text-pink-400">
                <Activity className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-pink-400 transition-all" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary group-hover:text-pink-400 transition-colors">
                Discovery Exercise Lab
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Interactive diphoton resonance fitting, continuous background estimation, and Asimov
                significance calculations.
              </p>
            </div>
            <div className="text-[11px] font-mono text-pink-400 font-semibold">5-Sigma Threshold Lab →</div>
          </Link>

          {/* Learn & Glossary Card */}
          <Link
            href="/learn"
            className="p-5 bg-canvas-surface hover:bg-canvas-raised border border-canvas-border hover:border-cern-cyan/60 rounded-panel transition-all space-y-3 group shadow-sm hover:shadow-cyan-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-sky-400/10 border border-sky-400/30 text-sky-400">
                <Atom className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-sky-400 transition-all" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-text-primary group-hover:text-sky-400 transition-colors">
                Physics Glossary &amp; Particles
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                3-tier explanations (Beginner, Undergrad, Researcher) and PDG 2024 particle properties
                and Standard Model decay trees.
              </p>
            </div>
            <div className="text-[11px] font-mono text-sky-400 font-semibold">PDG 2024 Verified Properties →</div>
          </Link>
        </div>
      </section>

      {/* 6. Scientific Provenance & Verification Guarantee */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-canvas-surface via-canvas-raised to-canvas-surface border border-canvas-borderStrong flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="font-display font-bold text-base text-text-primary">
              Cryptographically Verified Scientific Provenance
            </h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Every numeric constant and simulation boundary in CERN-X is linked to an official CERN
            Design Report, Particle Data Group review, or CERN Open Data release. Click the provenance
            tag beside any parameter to inspect primary source citations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <Link
            href="/about"
            className="px-4 py-2 rounded-lg bg-canvas-sub hover:bg-canvas border border-canvas-border text-text-secondary hover:text-text-primary transition-colors"
          >
            Methodology &amp; Limits
          </Link>
          <a
            href="https://github.com/Premchandyadav369/CERN"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-cern-blue hover:bg-cern-accent text-white flex items-center gap-1.5 transition-colors"
          >
            <span>Source Code</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
