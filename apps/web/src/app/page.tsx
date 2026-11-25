import React from 'react';
import Link from 'next/link';
import { HeroBeamTunnel } from '@/components/home/HeroBeamTunnel';
import { ProtonJourneyStepper } from '@/components/home/ProtonJourneyStepper';
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
  ExternalLink,
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
            <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              /// CERN Control Centre (CCC) · Live Operational Baselines ///
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold hidden sm:flex items-center gap-1.5 px-2 py-0.5 border border-black bg-canvas-surface shadow-[1px_1px_0px_#000]">
            <span className="w-2 h-2 rounded-none bg-emerald-400 animate-ping" />
            CRYOGENICS 1.9 K NOMINAL
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#00E5FF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-mono text-text-muted block font-bold uppercase">Run 3 Beam Energy</span>
            <div className="mt-1">
              <Value manifestId="lhc-nominal-beam-energy-run3" value={6.8} unit="TeV" digits={1} />
            </div>
            <span className="text-[10px] font-mono text-text-muted block mt-1.5 font-bold">13.6 TeV Center-of-Mass</span>
          </div>

          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#4C7DFF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-mono text-text-muted block font-bold uppercase">Main Dipole Field</span>
            <div className="mt-1">
              <Value manifestId="lhc-dipole-field-nominal" value={8.33} unit="T" digits={2} />
            </div>
            <span className="text-[10px] font-mono text-text-muted block mt-1.5 font-bold">Nb-Ti Superconducting Coil</span>
          </div>

          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#FF0055] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-mono text-text-muted block font-bold uppercase">Higgs Boson Mass</span>
            <div className="mt-1">
              <Value manifestId="higgs-boson-mass-pdg" value={125.25} unit="GeV" digits={2} />
            </div>
            <span className="text-[10px] font-mono text-text-muted block mt-1.5 font-bold">PDG 2024 Reference</span>
          </div>

          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#FFE600] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <span className="text-[11px] font-mono text-text-muted block font-bold uppercase">AI Flagship AMS</span>
            <div className="mt-1">
              <Value manifestId="triggermind-xgboost-benchmark" value={3.339} digits={3} />
            </div>
            <span className="text-[10px] font-mono text-text-muted block mt-1.5 font-bold">TriggerMind XGBoost L1</span>
          </div>
        </div>
      </section>

      {/* 2.5 End-to-End Interactive Guided Tour: Journey of a Single Proton */}
      <ProtonJourneyStepper />

      {/* 3. Signature Component 1: Interactive Ring Map */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-black pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-cern-blue text-white border-2 border-black shadow-[2px_2px_0px_#000]">
                MODULE 01
              </span>
              <h2 className="text-xl font-display font-extrabold text-white">
                The CERN Accelerator Complex
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Explore the multi-tier injector chain from the Hydrogen bottle through Linac4, PSB, PS, SPS, to the LHC.
            </p>
          </div>
          <Link
            href="/accelerators"
            className="px-3.5 py-2 bg-canvas-surface hover:bg-cern-blue text-white border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[3px_3px_0px_#00E5FF] text-xs font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span>Full Accelerators Guide</span>
            <ArrowRight className="w-3.5 h-3.5 text-cern-cyan" />
          </Link>
        </div>
        <RingMap />
      </section>

      {/* 4. Signature Component 2: End-to-End Scientific Pipeline */}
      <section className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-black pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-purple-700 text-white border-2 border-black shadow-[2px_2px_0px_#000]">
                MODULE 02
              </span>
              <h2 className="text-xl font-display font-extrabold text-white">
                End-to-End Scientific Pipeline
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Trace the trajectory of raw proton bunches through collisions, sensors, triggers, exascale storage, to peer-reviewed discovery.
            </p>
          </div>
          <Link
            href="/open-data"
            className="px-3.5 py-2 bg-canvas-surface hover:bg-purple-800 text-white border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[3px_3px_0px_#FF0055] text-xs font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span>Open Data Explorer</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
          </Link>
        </div>
        <PipelineView />
      </section>

      {/* 5. Core Domain Exploration Hub Grid */}
      <section className="space-y-4 pt-4">
        <div>
          <span className="text-xs font-mono uppercase text-cern-cyan tracking-wider font-bold">
            /// SCIENTIFIC DOMAINS &amp; LABORATORIES ///
          </span>
          <h2 className="text-2xl font-display font-extrabold text-white mt-0.5">
            Interactive Research Hubs
          </h2>
          <p className="text-xs text-text-secondary font-sans">
            Direct access to quantitative simulators, detector twins, machine learning benchmarks, and computing architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Accelerators Card */}
          <Link
            href="/accelerators"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#00E5FF] hover:shadow-[6px_6px_0px_#00E5FF] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-black border-2 border-black text-cern-cyan shadow-[2px_2px_0px_#00E5FF]">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cern-cyan text-black border-2 border-black uppercase shadow-[1px_1px_0px_#000]">
                  Physics Sim
                </span>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white group-hover:text-cern-cyan transition-colors">
                  Accelerators &amp; Beam Physics
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Relativistic kinematics, magnetic rigidity $B\rho$, RF cavity acceleration, and bunch
                  crossing luminosity modeling.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-cern-cyan font-bold pt-2 border-t-2 border-black flex items-center justify-between">
              <span>7 Accelerators Documented</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Detector Twins Card */}
          <Link
            href="/detectors"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#4C7DFF] hover:shadow-[6px_6px_0px_#4C7DFF] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-black border-2 border-black text-cern-accent shadow-[2px_2px_0px_#4C7DFF]">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cern-accent text-white border-2 border-black uppercase shadow-[1px_1px_0px_#000]">
                  Digital Twin
                </span>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white group-hover:text-cern-accent transition-colors">
                  ATLAS &amp; CMS Detector Twins
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Layered subsystem cutaways, sensor ionization filters, and real CERN Open Data 13 TeV collision event displays.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-cern-accent font-bold pt-2 border-t-2 border-black flex items-center justify-between">
              <span>Real 13 TeV Collision Events</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* AI Lab Card */}
          <Link
            href="/ai-lab"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#FFE600] hover:shadow-[6px_6px_0px_#FFE600] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-black border-2 border-black text-amber-400 shadow-[2px_2px_0px_#FFE600]">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-400 text-black border-2 border-black uppercase shadow-[1px_1px_0px_#000]">
                  Benchmark
                </span>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white group-hover:text-amber-400 transition-colors">
                  AI Lab &amp; LHC-TriggerMind
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Reproducible ML benchmark on public ATLAS simulation data comparing inference latency,
                  memory footprint, and AMS.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-amber-400 font-bold pt-2 border-t-2 border-black flex items-center justify-between">
              <span>Research Experiment #001</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Computing & WLCG Card */}
          <Link
            href="/computing"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#00FF66] hover:shadow-[6px_6px_0px_#00FF66] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-black border-2 border-black text-emerald-400 shadow-[2px_2px_0px_#00FF66]">
                  <Server className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-400 text-black border-2 border-black uppercase shadow-[1px_1px_0px_#000]">
                  Exascale
                </span>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white group-hover:text-emerald-400 transition-colors">
                  WLCG Grid &amp; Data Centre
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Discrete-event queuing simulator of Tier-0/1/2 pipelines, multi-gigabit replication,
                  link failover, and HL-LHC storage.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold pt-2 border-t-2 border-black flex items-center justify-between">
              <span>170+ Distributed Tier Nodes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Discovery Exercise Card */}
          <Link
            href="/simulations?module=discovery"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#FF0055] hover:shadow-[6px_6px_0px_#FF0055] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-black border-2 border-black text-pink-400 shadow-[2px_2px_0px_#FF0055]">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-pink-500 text-white border-2 border-black uppercase shadow-[1px_1px_0px_#000]">
                  5-Sigma Lab
                </span>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white group-hover:text-pink-400 transition-colors">
                  Discovery Exercise Lab
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Interactive diphoton resonance fitting, continuous background estimation, and Asimov
                  significance calculations.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-pink-400 font-bold pt-2 border-t-2 border-black flex items-center justify-between">
              <span>5-Sigma Threshold Lab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Learn & Glossary Card */}
          <Link
            href="/learn"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#00E5FF] hover:shadow-[6px_6px_0px_#00E5FF] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-black border-2 border-black text-sky-400 shadow-[2px_2px_0px_#00E5FF]">
                  <Atom className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-400 text-black border-2 border-black uppercase shadow-[1px_1px_0px_#000]">
                  Dictionary
                </span>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white group-hover:text-sky-400 transition-colors">
                  Physics Glossary &amp; Particles
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  3-tier explanations (Beginner, Undergrad, Researcher) and PDG 2024 particle properties
                  and Standard Model decay trees.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-sky-400 font-bold pt-2 border-t-2 border-black flex items-center justify-between">
              <span>PDG 2024 Verified Properties</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 6. Scientific Provenance & Verification Guarantee */}
      <section className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#00FF66] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-400 text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="font-display font-extrabold text-lg text-white">
              Cryptographically Verified Scientific Provenance
            </h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed font-sans">
            Every numeric constant and simulation boundary in CERN-X is linked to an official CERN
            Design Report, Particle Data Group review, or CERN Open Data release. Click the provenance
            tag beside any parameter to inspect primary source citations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <Link
            href="/about"
            className="px-4 py-2.5 bg-canvas-sub hover:bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000] font-bold uppercase transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            Methodology &amp; Limits
          </Link>
          <a
            href="https://github.com/Premchandyadav369/CERN"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-cern-blue hover:bg-cern-accent text-white border-2 border-black shadow-[3px_3px_0px_#00E5FF] font-bold uppercase flex items-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <span>Source Code</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
