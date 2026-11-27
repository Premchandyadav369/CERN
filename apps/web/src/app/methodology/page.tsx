'use client';

import React, { useState, useMemo, useId } from 'react';
import Link from 'next/link';
import {
  calculateRequiredDipoleField,
  calculateMagneticRigidity,
  asimovSignificance,
  simpleSignificance,
  calculateSacredTimelineVacuum,
  LHC_BENDING_RADIUS_M,
} from '@cern-x/sim-core';
import { getAllManifestRecords } from '@/lib/manifest';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { TechnicalTermDeck } from '@/components/ui/TechTermInfo';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { GsapStaggerSection, SpotlightMotionCard } from '@/components/motion/CernMotionPrimitives';
import {
  ShieldCheck,
  Database,
  Cpu,
  CheckCircle2,
  GitBranch,
  Calculator,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface PipelineStep {
  num: string;
  title: string;
  subtitle: string;
  detail: string;
  artifact: string;
}

const END_TO_END_STEPS: PipelineStep[] = [
  {
    num: '01',
    title: 'Primary CERN, PDG & Open Data Ingestion',
    subtitle: 'Strict Source-First Policy',
    detail:
      'Every physical constant, collider spec, and benchmark dataset enters only after documentation in data/manifest.json with DOI / CERN CDS record, licence, retrieval date, and explicit known limitations.',
    artifact: 'data/manifest.json + content/glossary.json',
  },
  {
    num: '02',
    title: 'Zero-Dependency Physics Kernel (@cern-x/sim-core)',
    subtitle: 'Exact Analytic Laws & Deterministic Seeded PRNG',
    detail:
      'All relativistic kinematics, Courant-Snyder optics, Bethe-Bloch energy loss, PMNS neutrino transitions, Higgs vacuum stability, and Poisson fluctuations execute live inside pure TypeScript physics modules.',
    artifact: 'packages/sim-core/src/physics/*.ts',
  },
  {
    num: '03',
    title: 'Automated Verification & Sanity Gates',
    subtitle: 'Unit Tests + Schema Manifest Validator + Smoke Checks',
    detail:
      'Before deployment, vitest runs 27 physics unit checks (e.g., 23,349 T·m LHC rigidity, Z0 resonance peak, neutrino probability conservation = 1.0, PDG metastability), verify_manifest checks schema hashes, and verify_routes audits every route.',
    artifact: '27/27 Physics Assertions · 31+ Routes Verified',
  },
  {
    num: '04',
    title: '3-Depth Pedagogical Translation + ⓘ Info Cards',
    subtitle: 'Beginner · Undergrad · Researcher + True KaTeX',
    detail:
      'Every equation renders cleanly via KaTeX with plain-English ELI5 cards, expandable derivation steps ("Why?"), and interactive ⓘ technical term cards so students and specialists share the exact same verified numbers.',
    artifact: 'MathFormula + Eli5Card + TechnicalTermDeck',
  },
  {
    num: '05',
    title: 'Interactive WebGL 3D, 60 FPS Canvas & WebAudio',
    subtitle: 'Client-Side Live Digital Twins',
    detail:
      'Simulators never play pre-baked fake animation loops: Three.js 3D detectors, 60 FPS proton rings, and optional browser-synthesized WebAudio sonification respond directly to live @cern-x/sim-core outputs.',
    artifact: 'apps/web/src/components/simulations/*',
  },
];

const CORE_EQUATIONS = [
  {
    title: 'LHC Magnetic Rigidity & Dipole Field',
    tex: 'B\\rho = \\frac{p\\;[\\text{GeV}/c]}{0.299792458\\,|Z|}, \\qquad B = \\frac{B\\rho}{\\rho_{\\text{LHC}}}',
    why: 'At 7.0 TeV per proton across LHC bending radius ρ = 2803.95 m, dipole magnets require B ≈ 8.33 T cooled to 1.9 K.',
  },
  {
    title: 'Instantaneous Collider Luminosity',
    tex: '\\mathcal{L} = \\frac{N_1 N_2 n_b f_{\\text{rev}} \\gamma}{4\\pi\\,\\varepsilon_n\\,\\beta^*}\\,F',
    why: 'Higher bunch intensity N, tighter IP squeezing β*, and crab-cavity overlap F multiply rare Higgs & BSM production rates.',
  },
  {
    title: 'Asimov 5σ Discovery Significance',
    tex: 'Z_0 = \\sqrt{2\\left((s+b)\\ln\\!\\left(1 + \\frac{s}{b}\\right) - s\\right)} \\ge 5.0',
    why: 'Profile-likelihood Poisson significance formula from Cowan–Cranmer–Gross–Vitells; outperforms naive s/√b when counts are small.',
  },
  {
    title: 'Electroweak Vacuum Stability Bound (NNLO)',
    tex: 'm_H^{\\text{crit}} \\approx 129.6 + 2.0\\,(m_t - 173.34) - 0.56\\,\\frac{\\alpha_s - 0.1184}{0.0007}\\;\\text{GeV}',
    why: 'Balance between stabilizing Higgs quartic self-coupling λ and destabilizing top-quark Yukawa loop determines whether the cosmic vacuum is stable or metastable.',
  },
  {
    title: 'Bethe-Bloch Hadron Stopping Power',
    tex: '-\\frac{dE}{dx} = 2\\pi N_A r_e^2 m_e c^2 \\rho \\frac{Z}{A}\\frac{z^2}{\\beta^2}\\left[\\ln\\!\\left(\\frac{2 m_e c^2 \\beta^2 \\gamma^2 T_{\\max}}{I^2}\\right) - 2\\beta^2\\right]',
    why: '1/β² singularity deposits a sharp Bragg Peak right before ions stop—enabling precision tumor irradiation at CERN-inspired facilities.',
  },
  {
    title: 'PMNS 3-Flavor Neutrino Transition',
    tex: 'P(\\nu_\\mu \\to \\nu_\\tau) \\approx \\sin^2(2\\theta_{23})\\sin^2\\!\\left(\\frac{1.267\\,\\Delta m^2_{32}\\,L}{E}\\right)',
    why: 'Governs underground quantum flavor interference measured from CERN SPS across 732 km to Gran Sasso (CNGS/OPERA).',
  },
];

export default function MethodologyPage() {
  const sliderPrefix = useId();
  const records = useMemo(() => getAllManifestRecords(), []);
  const [manifestFilter, setManifestFilter] = useState<'ALL' | 'PUBLISHED' | 'COMPUTED'>('ALL');
  const [activeStage, setActiveStage] = useState<number>(0);

  // Live Interactive Physics Verifier Inputs
  const [beamMomGev, setBeamMomGev] = useState<number>(6800);
  const [sigEvents, setSigEvents] = useState<number>(45);
  const [bkgEvents, setBkgEvents] = useState<number>(55);
  const [higgsGev, setHiggsGev] = useState<number>(125.25);

  const verifiedDipoleB = useMemo(
    () => calculateRequiredDipoleField(beamMomGev, LHC_BENDING_RADIUS_M, 1),
    [beamMomGev]
  );
  const verifiedRigidity = useMemo(() => calculateMagneticRigidity(beamMomGev, 1), [beamMomGev]);
  const verifiedAsimovZ = useMemo(() => asimovSignificance(sigEvents, bkgEvents), [sigEvents, bkgEvents]);
  const verifiedNaiveZ = useMemo(() => simpleSignificance(sigEvents, bkgEvents), [sigEvents, bkgEvents]);
  const verifiedVacuum = useMemo(
    () => calculateSacredTimelineVacuum(higgsGev, 172.69, 0.1179),
    [higgsGev]
  );

  const filteredRecords = useMemo(() => {
    if (manifestFilter === 'ALL') return records;
    return records.filter((r) => r.dataClass === manifestFilter);
  }, [records, manifestFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-cern-cyan text-black font-mono font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase">
              END-TO-END ARCHITECTURE &amp; METHODOLOGY
            </span>
            <FidelityBadge type="ANALYTIC" />
          </div>
          <Link
            href="/simulations"
            className="px-3 py-1.5 bg-cern-blue hover:bg-cern-accent text-white font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1"
          >
            <span>Open 33 Live Simulators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <h1 className="text-3xl lg:text-4xl font-display font-black text-white tracking-tight">
          How CERN-X Works End-to-End: Physics, Provenance &amp; Verification
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
          Complete engineering and scientific methodology behind CERN-X—covering primary CERN/PDG sourcing,
          our pure TypeScript computational physics kernel, automated 27-test verification gates, KaTeX math rendering,
          and explicit modeling boundaries.
        </p>
      </div>

      <Eli5Card
        title="How We Prove Every Chart & Animation Is Real Science (Not a Toy Drawing!)"
        analogy="Most science websites use pre-recorded videos or random squiggly lines. CERN-X works like a real mini particle lab inside your browser: official CERN numbers enter a locked manifest recipe, pass 27 automated math exams before the website builds, and recalculate every dot live using exact KaTeX physics formulas!"
        keyPoints={[
          'Zero-Fake-Data Architecture: Every quantity is tagged [REAL], [PUBLISHED], or [COMPUTED].',
          'Shared Physics Kernel: Unit tests check the exact same @cern-x/sim-core code running your interactive sliders.',
          'Honest Simplifications: Every module displays an ANALYTIC, MONTE CARLO, or TOY fidelity badge.',
        ]}
      />

      {/* Section 1: 5-Stage End-to-End Interactive Flow */}
      <section className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <h2 className="text-lg font-display font-black uppercase text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cern-cyan" /> 1. End-to-End Execution Pipeline
          </h2>
          <span className="text-xs font-mono text-text-muted">Click any stage to inspect artifacts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {END_TO_END_STEPS.map((step, idx) => {
            const active = idx === activeStage;
            return (
              <button
                key={step.num}
                type="button"
                aria-expanded={active}
                onClick={() => setActiveStage(idx)}
                className={`p-3 text-left border-2 border-black font-mono transition-all cursor-pointer ${
                  active
                    ? 'bg-cern-blue text-white shadow-[4px_4px_0px_#00E5FF] -translate-y-0.5'
                    : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                }`}
              >
                <div className="text-[10px] font-black text-cern-cyan uppercase">STAGE {step.num}</div>
                <div className="text-xs font-bold mt-1 leading-snug">{step.title}</div>
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000] space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display font-black text-base text-white">
              Stage {END_TO_END_STEPS[activeStage].num}: {END_TO_END_STEPS[activeStage].title}
            </h3>
            <span className="px-2 py-0.5 bg-black text-emerald-400 border border-black font-mono text-[11px] font-bold">
              {END_TO_END_STEPS[activeStage].artifact}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-sans text-text-secondary leading-relaxed">
            {END_TO_END_STEPS[activeStage].detail}
          </p>
        </div>
      </section>

      {/* Section 2: Interactive Live Physics Kernel Sanity Verifier */}
      <section className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-5">
        <div className="border-b-2 border-black pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-display font-black uppercase text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#FFE600]" /> 2. Live Browser Physics Kernel Verifier
            </h2>
            <p className="text-xs font-mono text-text-secondary mt-0.5">
              Execute @cern-x/sim-core directly right here to verify calculations side-by-side with their KaTeX derivations.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-400 text-black font-mono font-black text-xs border-2 border-black">
            LIVE COMPUTATION ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono">
          {/* Rigidity Calculator */}
          <div className="p-4 bg-canvas-sub border-2 border-black space-y-3">
            <label htmlFor={`${sliderPrefix}-mom`} className="text-xs font-black text-cern-cyan block uppercase">
              A. Proton Momentum p: {beamMomGev} GeV/c
            </label>
            <input
              id={`${sliderPrefix}-mom`}
              type="range"
              min={450}
              max={7000}
              step={50}
              value={beamMomGev}
              onChange={(e) => setBeamMomGev(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
            <MathFormula tex="B = \frac{p}{0.299792\,\rho_{\text{LHC}}}" displayMode />
            <div className="p-2.5 bg-black border border-zinc-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Rigidity Bρ:</span>
                <strong className="text-white">{verifiedRigidity.toFixed(1)} T·m</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Required Dipole B:</span>
                <strong className="text-[#FFE600]">{verifiedDipoleB.toFixed(3)} T</strong>
              </div>
            </div>
          </div>

          {/* Asimov Discovery Calculator */}
          <div className="p-4 bg-canvas-sub border-2 border-black space-y-3">
            <div className="space-y-1">
              <label htmlFor={`${sliderPrefix}-sig`} className="text-xs font-black text-cern-magenta block uppercase">
                B. Signal Events (s): {sigEvents} | Bkg (b): {bkgEvents}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id={`${sliderPrefix}-sig`}
                  type="range"
                  min={5}
                  max={120}
                  step={1}
                  value={sigEvents}
                  aria-label="Signal events"
                  onChange={(e) => setSigEvents(Number(e.target.value))}
                  className="w-full accent-cern-magenta cursor-pointer"
                />
                <input
                  type="range"
                  min={10}
                  max={250}
                  step={5}
                  value={bkgEvents}
                  aria-label="Background events"
                  onChange={(e) => setBkgEvents(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
            <MathFormula tex="Z_0 = \sqrt{2\left((s+b)\ln(1+s/b)-s\right)}" displayMode />
            <div className="p-2.5 bg-black border border-zinc-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Exact Asimov Z₀:</span>
                <strong className={verifiedAsimovZ >= 5 ? 'text-emerald-400' : 'text-[#FFE600]'}>
                  {verifiedAsimovZ.toFixed(2)} σ
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Naive s / √b:</span>
                <strong className="text-text-secondary">{verifiedNaiveZ.toFixed(2)} σ</strong>
              </div>
            </div>
          </div>

          {/* Electroweak Vacuum Verifier */}
          <div className="p-4 bg-canvas-sub border-2 border-black space-y-3">
            <label htmlFor={`${sliderPrefix}-mh`} className="text-xs font-black text-[#FFB000] block uppercase">
              C. Higgs Mass m_H: {higgsGev.toFixed(2)} GeV
            </label>
            <input
              id={`${sliderPrefix}-mh`}
              type="range"
              min={108}
              max={136}
              step={0.25}
              value={higgsGev}
              onChange={(e) => setHiggsGev(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <MathFormula tex="m_H^{\text{crit}}(m_t=172.69) \approx 128.70\text{ GeV}" displayMode />
            <div className="p-2.5 bg-black border border-zinc-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Vacuum Phase:</span>
                <strong className="text-[#FFB000]">{verifiedVacuum.regime}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Instability Scale Λ_I:</span>
                <strong className="text-cern-cyan">
                  {verifiedVacuum.regime === 'STABLE'
                    ? '> 10¹⁹ GeV'
                    : `10^${verifiedVacuum.instabilityScaleLog10Gev.toFixed(1)} GeV`}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Complete KaTeX Equations Catalog */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-black uppercase text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" /> 3. Verified Core Equations (KaTeX Ledger)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CORE_EQUATIONS.map((eq) => (
            <div
              key={eq.title}
              className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] space-y-2.5"
            >
              <h3 className="font-mono font-bold text-xs uppercase text-cern-cyan">{eq.title}</h3>
              <div className="p-3 bg-black border-2 border-black">
                <MathFormula tex={eq.tex} displayMode />
              </div>
              <p className="text-xs font-sans text-text-secondary leading-relaxed">{eq.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Cryptographic Manifest Inspector */}
      <section className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div>
            <h2 className="text-lg font-display font-black uppercase text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cern-cyan" /> 4. Cryptographic Provenance Manifest ({records.length} Records)
            </h2>
            <p className="text-xs font-mono text-text-secondary">
              Validated at build time by scripts/verify_manifest.js against schema provenance rules.
            </p>
          </div>
          <div className="flex gap-1.5 font-mono text-xs">
            {(['ALL', 'PUBLISHED', 'COMPUTED'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setManifestFilter(tab)}
                className={`px-3 py-1 border-2 border-black font-bold cursor-pointer ${
                  manifestFilter === tab
                    ? 'bg-cern-cyan text-black'
                    : 'bg-canvas-sub text-text-secondary hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {filteredRecords.map((rec) => (
            <div key={rec.id} className="p-4 bg-canvas-sub border-2 border-black space-y-2 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 bg-black text-emerald-400 border border-black font-bold text-[10px]">
                  [{rec.dataClass}] · {rec.sourceTier}
                </span>
                <span className="text-[10px] text-text-muted">{rec.retrievalDate}</span>
              </div>
              <h3 className="text-sm font-display font-black text-white">{rec.title}</h3>
              {rec.formula && (
                <div className="p-2 bg-black border border-zinc-800">
                  <MathFormula tex={rec.formula} />
                </div>
              )}
              <p className="text-[11px] text-amber-200 font-sans leading-relaxed flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{rec.knownLimitations}</span>
              </p>
              <div className="pt-2 border-t border-black flex items-center justify-between text-[11px]">
                <span className="text-text-muted">ID: {rec.doiOrRecordId}</span>
                <a
                  href={rec.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cern-cyan hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verification Guarantees Strip */}
      <GsapStaggerSection className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs cern-offscreen-section">
        <SpotlightMotionCard className="gsap-stagger-item p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#00FF66] space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-black">
            <CheckCircle2 className="w-4 h-4" /> UNIT TEST SUITE
          </div>
          <p className="text-text-secondary">
            27 analytical &amp; statistical unit tests in vitest execute continuously on @cern-x/sim-core.
          </p>
        </SpotlightMotionCard>
        <SpotlightMotionCard className="gsap-stagger-item p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#00E5FF] space-y-1">
          <div className="flex items-center gap-1.5 text-cern-cyan font-black">
            <GitBranch className="w-4 h-4" /> SEEDED REPRODUCIBILITY
          </div>
          <p className="text-text-secondary">
            Stochastic physics samplers run Mulberry32 deterministic PRNG sequences rather than arbitrary Math.random().
          </p>
        </SpotlightMotionCard>
        <SpotlightMotionCard className="gsap-stagger-item p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#FFE600] space-y-1">
          <div className="flex items-center gap-1.5 text-[#FFE600] font-black">
            <ShieldCheck className="w-4 h-4" /> NON-AFFILIATION &amp; ACCESSIBILITY
          </div>
          <p className="text-text-secondary">
            Independent educational project targeting WCAG 2.2 AA contrast, pause controls, and reduced motion compliance.
          </p>
        </SpotlightMotionCard>
      </GsapStaggerSection>

      {/* Embedded Technical Term Info Cards */}
      <TechnicalTermDeck
        contextId="page-methodology"
        heading="Methodology & Verification Technical Terms (ⓘ Info Cards)"
      />
    </div>
  );
}
