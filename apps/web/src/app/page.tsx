import React from 'react';
import Link from 'next/link';
import { HeroBeamTunnel } from '@/components/home/HeroBeamTunnel';
import { ProtonJourneyStepper } from '@/components/home/ProtonJourneyStepper';
import { RingMap } from '@/components/home/RingMap';
import { PipelineView } from '@/components/pipeline/PipelineView';
import { Value } from '@/components/provenance/Value';
import { InlineMathText } from '@/components/ui/MathFormula';
import { TechnicalTermDeck } from '@/components/ui/TechTermInfo';
import { NumberTicker, GsapStaggerSection, SpotlightMotionCard } from '@/components/motion/CernMotionPrimitives';
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
  GitBranch,
  Crown,
  EyeOff,
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
            <Radio className="w-4 h-4 text-cern-cyan" strokeWidth={1.5} />
            <span className="text-xs font-mono font-medium text-text-secondary">
              CERN Control Centre · Operational Baselines
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-medium hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 border border-black bg-canvas-surface shadow-[1px_1px_0px_#000] tabular-nums">
            <span className="w-2 h-2 bg-emerald-400" aria-hidden="true" />
            Cryogenics 1.9 K nominal
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SpotlightMotionCard className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-mono text-text-muted block font-medium">Run 3 beam energy</span>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <NumberTicker value={6.8} decimals={1} suffix=" TeV" className="text-2xl font-mono font-semibold text-cern-cyan tabular-nums" />
              <Value manifestId="lhc-nominal-beam-energy-run3" value="Ref" />
            </div>
            <span className="text-[11px] font-mono text-text-muted block mt-1.5 tabular-nums">13.6 TeV center-of-mass</span>
          </SpotlightMotionCard>

          <SpotlightMotionCard delay={0.04} className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-mono text-text-muted block font-medium">Main dipole field</span>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <NumberTicker value={8.33} decimals={2} suffix=" T" className="text-2xl font-mono font-semibold text-white tabular-nums" />
              <Value manifestId="lhc-dipole-field-nominal" value="Ref" />
            </div>
            <span className="text-[11px] font-mono text-text-muted block mt-1.5">Nb-Ti superconducting coil</span>
          </SpotlightMotionCard>

          <SpotlightMotionCard delay={0.08} className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-mono text-text-muted block font-medium">Higgs boson mass</span>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <NumberTicker value={125.25} decimals={2} suffix=" GeV" className="text-2xl font-mono font-semibold text-white tabular-nums" />
              <Value manifestId="higgs-boson-mass-pdg" value="PDG" />
            </div>
            <span className="text-[11px] font-mono text-text-muted block mt-1.5 tabular-nums">PDG 2024 reference</span>
          </SpotlightMotionCard>

          <SpotlightMotionCard delay={0.12} className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-mono text-text-muted block font-medium">TriggerMind AMS</span>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <NumberTicker value={3.339} decimals={3} className="text-2xl font-mono font-semibold text-white tabular-nums" />
              <Value manifestId="triggermind-xgboost-benchmark" value="Lab" />
            </div>
            <span className="text-[11px] font-mono text-text-muted block mt-1.5">XGBoost L1 benchmark</span>
          </SpotlightMotionCard>
        </div>
      </section>

      {/* 2.5 End-to-End Interactive Guided Tour: Journey of a Single Proton */}
      <ProtonJourneyStepper />

      {/* 3. Signature Component 1: Interactive Ring Map */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-black pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-canvas-raised text-cern-cyan border-2 border-black shadow-[2px_2px_0px_#000]">
                Module 01
              </span>
              <h2 className="text-xl font-display font-semibold text-white">
                The CERN Accelerator Complex
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Explore the multi-tier injector chain from the Hydrogen bottle through Linac4, PSB, PS, SPS, to the LHC.
            </p>
          </div>
          <Link
            href="/accelerators"
            className="px-3.5 py-2 bg-canvas-surface hover:bg-canvas-raised text-white border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-mono font-medium flex items-center gap-1.5 self-start sm:self-auto transition-[transform,background-color] duration-150 active:translate-x-px active:translate-y-px"
          >
            <span>Accelerators guide</span>
            <ArrowRight className="w-3.5 h-3.5 text-cern-cyan" strokeWidth={1.5} />
          </Link>
        </div>
        <RingMap />
      </section>

      {/* 4. Signature Component 2: End-to-End Scientific Pipeline */}
      <section className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-black pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-canvas-raised text-cern-cyan border-2 border-black shadow-[2px_2px_0px_#000]">
                Module 02
              </span>
              <h2 className="text-xl font-display font-semibold text-white">
                End-to-End Scientific Pipeline
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Trace the trajectory of raw proton bunches through collisions, sensors, triggers, exascale storage, to peer-reviewed discovery.
            </p>
          </div>
          <Link
            href="/open-data"
            className="px-3.5 py-2 bg-canvas-surface hover:bg-canvas-raised text-white border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-mono font-medium flex items-center gap-1.5 self-start sm:self-auto transition-[transform,background-color] duration-150 active:translate-x-px active:translate-y-px"
          >
            <span>Open Data explorer</span>
            <ArrowRight className="w-3.5 h-3.5 text-cern-cyan" strokeWidth={1.5} />
          </Link>
        </div>
        <PipelineView />
      </section>

      {/* 5. Core Domain Exploration Hub Grid */}
      <section className="space-y-4 pt-4">
        <div>
          <span className="text-xs font-mono text-cern-cyan font-medium">
            Scientific domains &amp; laboratories
          </span>
          <h2 className="text-2xl font-display font-semibold text-white mt-0.5">
            Interactive Research Hubs
          </h2>
          <p className="text-xs text-text-secondary font-sans">
            Direct access to quantitative simulators, detector twins, machine learning benchmarks, and computing architectures.
          </p>
        </div>

        <GsapStaggerSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Accelerators Card */}
          <Link
            href="/accelerators"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <Zap className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">Physics sim</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  Accelerators &amp; Beam Physics
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  <InlineMathText text="Relativistic kinematics, magnetic rigidity $B\rho$, RF cavity acceleration, and bunch crossing luminosity modeling." />
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>7 accelerators documented</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* Detector Twins Card */}
          <Link
            href="/detectors"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <Layers className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">Digital twin</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  ATLAS &amp; CMS Detector Twins
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Layered subsystem cutaways, sensor ionization filters, and real CERN Open Data 13 TeV collision event displays.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>Real 13 TeV collision events</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* AI Lab Card */}
          <Link
            href="/ai-lab"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <Cpu className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">Benchmark</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  AI Lab &amp; LHC-TriggerMind
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Reproducible ML benchmark on public ATLAS simulation data comparing inference latency,
                  memory footprint, and AMS.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>Research experiment #001</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* Computing & WLCG Card */}
          <Link
            href="/computing"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <Server className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">Exascale</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  WLCG Grid &amp; Data Centre
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Discrete-event queuing simulator of Tier-0/1/2 pipelines, multi-gigabit replication,
                  link failover, and HL-LHC storage.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>170+ distributed tier nodes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* Discovery Exercise Card */}
          <Link
            href="/simulations?module=discovery"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <Activity className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">5-sigma lab</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  Discovery Exercise Lab
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Interactive diphoton resonance fitting, continuous background estimation, and Asimov
                  significance calculations.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>5-sigma threshold lab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* Learn & Glossary Card */}
          <Link
            href="/learn"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <Atom className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">Dictionary</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  Physics Glossary &amp; Particles
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  3-tier explanations (Beginner, Undergrad, Researcher) and PDG 2024 particle properties
                  and Standard Model decay trees.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>PDG 2024 verified properties</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* Feynman S-Matrix & Cloud Chamber Card */}
          <Link
            href="/simulations?module=feynman"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <GitBranch className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">S-matrix + tracks</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  Feynman Lab &amp; Cloud Chamber
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Build Standard Model reactions with live conservation validation and fire live particles
                  through a 60 FPS magnetic vapor chamber.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>QED, Z⁰ pole &amp; cyclotron tracks</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* Higgs Symmetry Breaking Card */}
          <Link
            href="/simulations?module=higgs-ewsb"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <Crown className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">Origin of mass</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  Higgs Symmetry Lab
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Cool the Big Bang universe below 159.5 GeV to watch spontaneous electroweak symmetry breaking
                  switch on particle masses.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>V(φ) potential &amp; Yukawa tuning</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* Dark Matter & Hadron Therapy Card */}
          <Link
            href="/simulations?module=dark-matter"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">Frontier BSM</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  Dark Matter CAST &amp; Mono-Jet Lab
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Tune a 9-Tesla solar axion telescope via helium Primakoff resonance and reconstruct
                  missing transverse energy dark matter recoils.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>Axions &amp; LHC recoil imbalance</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* Complete CERN Projects & 3D Complex Atlas Card */}
          <Link
            href="/projects"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <Compass className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">3D site atlas</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  All CERN Projects &amp; 3D Tunnel Map
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  3D underground LHC + 91 km FCC ring topology and complete directory of 22 CERN
                  facilities, WWW history, ROOT, Geant4, and spin-offs.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>22 projects &amp; 3D geo-tunnels</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* 3D Standard Model & Mass Scale Lab Card */}
          <Link
            href="/simulations?module=sm-3d"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <Atom className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">3D quantum</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  3D Standard Model Explorer
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Complete 17-particle table with live 3D quantum wave states, color-charge quark knots,
                  and Higgs Yukawa mass hierarchy visualization.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>Quarks, leptons, bosons &amp; Higgs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>

          {/* ISOLDE Nuclear & Medipix3 Spin-Off Card */}
          <Link
            href="/simulations?module=isolde"
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:border-cern-cyan/70 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-px active:translate-y-px transition-[transform,border-color] duration-150 space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center bg-canvas-raised border-2 border-black text-text-secondary group-hover:text-cern-cyan transition-colors duration-150">
                  <Database className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-mono text-text-muted">ISOLDE + spin-offs</span>
              </div>
              <div>
                <h3 className="text-base font-display font-semibold text-white group-hover:text-cern-cyan transition-colors duration-150">
                  ISOLDE Nuclear &amp; Medipix3 Labs
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-sans">
                  Explore magic-shell isotopes on the Segrè chart, steer A/q beams through GPS dipole
                  magnets, and scan spectral color X-ray K-edges.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-text-secondary group-hover:text-cern-cyan pt-2 border-t-2 border-black flex items-center justify-between transition-colors duration-150">
              <span>Nuclear landscape &amp; RICH PID</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={1.5} />
            </div>
          </Link>
        </GsapStaggerSection>
      </section>

      {/* 6. Scientific Provenance & Verification Guarantee */}
      <section className="p-6 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-canvas-raised text-emerald-400 border-2 border-black shadow-[2px_2px_0px_#000]">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
            </span>
            <h3 className="font-display font-semibold text-lg text-white">
              Cryptographically Verified Scientific Provenance
            </h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed font-sans">
            Every numeric constant and simulation boundary in PARTON is linked to an official CERN
            Design Report, Particle Data Group review, or CERN Open Data release. Click the provenance
            tag beside any parameter to inspect primary source citations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <Link
            href="/methodology"
            className="px-4 py-2.5 bg-canvas-raised hover:bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000] font-medium transition-colors duration-150 active:translate-x-px active:translate-y-px"
          >
            Methodology &amp; limits
          </Link>
          <a
            href="https://github.com/Premchandyadav369/CERN"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-cern-cyan hover:bg-[#5df0ff] text-black border-2 border-black shadow-[3px_3px_0px_#000] font-semibold flex items-center gap-1.5 transition-colors duration-150 active:translate-x-px active:translate-y-px"
          >
            <span>Source code</span>
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </a>
        </div>
      </section>

      <TechnicalTermDeck contextId="page-home" heading="CERN Core Vocabulary (ⓘ Interactive Symbol Cards)" />
    </div>
  );
}
