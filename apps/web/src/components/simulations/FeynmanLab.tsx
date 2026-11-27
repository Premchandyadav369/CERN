'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  QUANTUM_PARTICLES,
  validateInteractionConservation,
  calculateEeToMumuCrossSectionNb,
} from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { useGlobalStore } from '@/lib/store';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Zap,
  AlertTriangle,
  Sliders,
  Info,
  HelpCircle,
  Play,
  Pause,
} from 'lucide-react';

interface ReactionPreset {
  id: string;
  label: string;
  badge: string;
  incoming: string[];
  outgoing: string[];
  propagator: 'gamma/Z' | 'H/loop' | 'W-' | 'Z*' | 'FORBIDDEN';
  defaultSqrtSGev: number;
  maxSliderGev: number;
  couplingNote: string;
  physicsStory: {
    beginner: string;
    undergrad: string;
    researcher: string;
  };
}

const PRESETS: ReactionPreset[] = [
  {
    id: 'ee_mumu',
    label: 'e⁺e⁻ → γ*/Z⁰ → μ⁺μ⁻',
    badge: 'QED + Z⁰ POLE',
    incoming: ['e-', 'e+'],
    outgoing: ['mu-', 'mu+'],
    propagator: 'gamma/Z',
    defaultSqrtSGev: 91.19,
    maxSliderGev: 140,
    couplingNote: 'Electroweak s-channel annihilation via virtual photon & Z⁰ resonance (LEP Run I)',
    physicsStory: {
      beginner:
        'An electron and its antimatter twin (positron) collide and briefly vanish into pure energy, then transform into a heavier pair of muons!',
      undergrad:
        'Tree-level s-channel QED annihilation supplemented by the weak neutral Z⁰ propagator. Cross section peaks sharply by >200× at √s = M_Z = 91.19 GeV.',
      researcher:
        'dσ/dΩ = (α²/4s)(1 + cos²θ) at low √s; near M_Z the relativistic Breit-Wigner propagator interferes with γ* producing forward-backward asymmetry A_FB.',
    },
  },
  {
    id: 'gg_h_yy',
    label: 'gg → [t loop] → H → γγ',
    badge: 'HIGGS DISCOVERY',
    incoming: ['g', 'g'],
    outgoing: ['gamma', 'gamma'],
    propagator: 'H/loop',
    defaultSqrtSGev: 125.25,
    maxSliderGev: 250,
    couplingNote: 'Gluon fusion via virtual top-quark triangle loop to diphoton resonance (ATLAS/CMS 2012)',
    physicsStory: {
      beginner:
        'Two gluons sticking protons together collide to briefly create a heavy Higgs particle, which flashes into two crisp gamma-ray light beams!',
      undergrad:
        'Since massless gluons and photons do not couple directly to the Higgs scalar, this process occurs strictly at 1-loop quantum level dominated by heavy top quarks and W bosons.',
      researcher:
        'σ(gg → H) × BR(H → γγ ≈ 2.27×10⁻³) provides ~1.5 GeV invariant mass resolution, enabling the July 4, 2012 5.9σ discovery.',
    },
  },
  {
    id: 'beta_decay',
    label: 'd → u + e⁻ + ν̄ₑ',
    badge: 'WEAK CHARGED',
    incoming: ['d'],
    outgoing: ['u', 'e-', 'nubar_e'],
    propagator: 'W-',
    defaultSqrtSGev: 0.94,
    maxSliderGev: 10,
    couplingNote: 'Charged-current quark flavor transition via virtual off-shell W⁻ boson',
    physicsStory: {
      beginner:
        'Inside a neutron, one Down quark flips into an Up quark by throwing off a tiny W⁻ force packet that instantly splits into an electron and an antineutrino.',
      undergrad:
        'Weak beta decay is the only Standard Model tree vertex capable of changing quark flavor via CKM matrix element V_ud while preserving electric charge and lepton number.',
      researcher:
        'Low-energy Fermi effective limit (q² ≪ M_W²) yields G_F/√2 = g²/(8 M_W²), causing the ~878 second free neutron lifetime.',
    },
  },
  {
    id: 'forbidden_lfv',
    label: 'μ⁻ → e⁻ + γ (Forbidden)',
    badge: 'LFV VIOLATION',
    incoming: ['mu-'],
    outgoing: ['e-', 'gamma'],
    propagator: 'FORBIDDEN',
    defaultSqrtSGev: 1.0,
    maxSliderGev: 5,
    couplingNote: 'Hypothetical Charged Lepton Flavor Violation (cLFV) — Forbidden at tree level in SM',
    physicsStory: {
      beginner:
        'Why can’t a heavy muon simply spit out a photon and turn into an electron? Nature protects “electron-ness” and “muon-ness” separately!',
      undergrad:
        'Electric charge Q and spin 1/2 are conserved, AND energy threshold is satisfied (m_μ > m_e), yet separate lepton family numbers ΔL_μ = -1 and ΔL_e = +1 strictly forbid it.',
      researcher:
        'Even including massive neutrino oscillation loops, SM predicts BR(μ → eγ) ~ 10⁻⁵⁴; MEG II searches down to 6×10⁻¹⁴ to probe BSM physics.',
    },
  },
  {
    id: 'forbidden_proton',
    label: 'p⁺ → e⁺ + γ (Forbidden)',
    badge: 'BARYON VIOLATION',
    incoming: ['p'],
    outgoing: ['e+', 'gamma'],
    propagator: 'FORBIDDEN',
    defaultSqrtSGev: 1.0,
    maxSliderGev: 5,
    couplingNote: 'Hypothetical Proton Decay — Conserves Q = +1 but violates Baryon & Lepton number',
    physicsStory: {
      beginner:
        'If protons could decay into lighter particles, every atom in the universe would eventually vanish. Baryon number conservation keeps matter stable!',
      undergrad:
        'Even though total charge +1 and energy kinematics match, baryon number changes by ΔB = -1 and electron lepton number by ΔLₑ = -1.',
      researcher:
        'Grand Unified Theories (GUTs) predict p → e⁺π⁰ mediated by X/Y bosons at ~10¹⁵ GeV; Super-K sets τ_p > 2.4 × 10³⁴ years.',
    },
  },
];

// Available builder choices
const BUILDER_PARTICLES = ['e-', 'e+', 'mu-', 'mu+', 'nu_e', 'nubar_e', 'u', 'd', 'gamma', 'g', 'p', 'W-', 'Z0', 'H'];

export const FeynmanLab: React.FC = () => {
  const userLevel = useGlobalStore((s) => s.userLevel);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const [mode, setMode] = useState<'presets' | 'sandbox'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ee_mumu');
  const [sqrtSGev, setSqrtSGev] = useState<number>(91.19);
  const [sandboxIncoming, setSandboxIncoming] = useState<string[]>(['e-', 'e+']);
  const [sandboxOutgoing, setSandboxOutgoing] = useState<string[]>(['mu-', 'mu+']);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [pulsePhase, setPulsePhase] = useState<number>(0);

  const activePreset = useMemo(
    () => PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0],
    [selectedPresetId]
  );

  // Smooth SVG propagator & leg packet animation loop
  useEffect(() => {
    if (reduceMotion || !isAnimating) return;
    let raf: number;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = (ts - start) / 1000;
      setPulsePhase((elapsed * 0.42) % 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, isAnimating]);

  const currentIncoming = mode === 'presets' ? activePreset.incoming : sandboxIncoming;
  const currentOutgoing = mode === 'presets' ? activePreset.outgoing : sandboxOutgoing;

  const conservation = useMemo(
    () => validateInteractionConservation(currentIncoming, currentOutgoing, sqrtSGev),
    [currentIncoming, currentOutgoing, sqrtSGev]
  );

  // Cross section curve points for e+ e- -> mu+ mu- (log scale from 1 GeV to 140 GeV)
  const crossSectionPlot = useMemo(() => {
    const pts: { e: number; sigma: number; x: number; y: number }[] = [];
    const eMin = 5;
    const eMax = 140;
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const e = eMin + (i / steps) * (eMax - eMin);
      const { withZResonanceNb } = calculateEeToMumuCrossSectionNb(e);
      const logSig = Math.log10(Math.max(withZResonanceNb, 1e-4)); // range roughly -3 to +1.5
      const normY = 1 - Math.min(1, Math.max(0, (logSig - -3.0) / 4.2));
      pts.push({
        e,
        sigma: withZResonanceNb,
        x: 40 + (i / steps) * 320,
        y: 16 + normY * 100,
      });
    }
    return pts;
  }, []);

  const currentEeCrossSection = useMemo(
    () => calculateEeToMumuCrossSectionNb(sqrtSGev),
    [sqrtSGev]
  );

  const handleSelectPreset = (p: ReactionPreset) => {
    setMode('presets');
    setSelectedPresetId(p.id);
    setSqrtSGev(p.defaultSqrtSGev);
  };

  const toggleSandboxLeg = (side: 'in' | 'out', idx: number, id: string) => {
    if (side === 'in') {
      const next = [...sandboxIncoming];
      next[idx] = id;
      setSandboxIncoming(next);
    } else {
      const next = [...sandboxOutgoing];
      next[idx] = id;
      setSandboxOutgoing(next);
    }
  };

  const addOrRemoveLeg = (side: 'in' | 'out', op: 'add' | 'remove') => {
    if (side === 'in') {
      if (op === 'add' && sandboxIncoming.length < 2) setSandboxIncoming([...sandboxIncoming, 'e-']);
      if (op === 'remove' && sandboxIncoming.length > 1) setSandboxIncoming(sandboxIncoming.slice(0, -1));
    } else {
      if (op === 'add' && sandboxOutgoing.length < 3) setSandboxOutgoing([...sandboxOutgoing, 'gamma']);
      if (op === 'remove' && sandboxOutgoing.length > 1) setSandboxOutgoing(sandboxOutgoing.slice(0, -1));
    }
  };

  // Wave path generator for boson lines (supports traveling phase wave)
  const buildWavyPath = (x1: number, y1: number, x2: number, y2: number, cycles = 7, amp = 7, phase = 0) => {
    const steps = 64;
    let d = `M ${x1} ${y1}`;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const envelope = Math.sin(t * Math.PI);
      const offset = Math.sin(t * cycles * Math.PI * 2 - phase * Math.PI * 2) * amp * (0.45 + 0.55 * envelope);
      const px = x1 + dx * t + nx * offset;
      const py = y1 + dy * t + ny * offset;
      d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    return d;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-cern-cyan text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              FEYNMAN S-MATRIX WORKBENCH
            </span>
            <FidelityBadge type="ANALYTIC" />
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
            Interactive Feynman Diagrams &amp; Conservation Laws
          </h2>
          <p className="text-xs text-text-secondary font-mono max-w-2xl">
            Assemble Standard Model reactions or test forbidden processes. Every reaction enforces exact
            quantum numbers (Q, B, Lₑ, L_μ) and relativistic center-of-mass thresholds.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setMode('presets')}
            className={`px-3.5 py-2 border-2 border-black font-bold uppercase cursor-pointer transition-all ${
              mode === 'presets'
                ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#00E5FF]'
                : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
            }`}
          >
            Standard Channels
          </button>
          <button
            onClick={() => setMode('sandbox')}
            className={`px-3.5 py-2 border-2 border-black font-bold uppercase cursor-pointer transition-all ${
              mode === 'sandbox'
                ? 'bg-purple-700 text-white shadow-[3px_3px_0px_#FF0055]'
                : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
            }`}
          >
            Custom Sandbox
          </button>
        </div>
      </div>

      {/* ELI5 Intuition Layer */}
      <Eli5Card
        title="How Particles Trade Forces with Feynman Diagrams"
        analogy="Think of two ice skaters throwing a heavy medicine ball back and forth. Even though they never touch, throwing the ball pushes them apart! In particle physics, particles trade invisible 'force packets' (photons, gluons, W/Z bosons) along lines drawn in space and time."
        keyPoints={[
          'Time flows from Left (Before collision) to Right (After collision).',
          'Arrows pointing right are normal matter; arrows pointing left represent antimatter traveling backward in mathematical time!',
          'Every reaction must balance strict cosmic receipts: Electric Charge, Baryon Number, and Lepton Flavor.',
        ]}
        whatToTry="Select 'μ⁻ → e⁻ + γ (Forbidden)' or lower √s below 0.21 GeV on e⁺e⁻ → μ⁺μ⁻ to watch nature block illegal quantum trades!"
        doi="10.1103/PhysRev.76.769"
        citationLabel="R.P. Feynman (1949), Space-Time Approach to Quantum Electrodynamics"
      />

      {/* Preset Selector OR Custom Builder */}
      {mode === 'presets' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRESETS.map((p) => {
            const isSelected = p.id === selectedPresetId;
            const isForbidden = p.propagator === 'FORBIDDEN';
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-3 border-2 border-black text-left font-mono transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? isForbidden
                      ? 'bg-red-950 text-white shadow-[4px_4px_0px_#FF0055] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-cern-blue text-white shadow-[4px_4px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[3px_3px_0px_#000]'
                }`}
              >
                <span
                  className={`inline-block self-start px-1.5 py-0.5 text-[9px] font-black border border-black ${
                    isForbidden ? 'bg-red-500 text-black' : 'bg-cern-cyan text-black'
                  }`}
                >
                  {p.badge}
                </span>
                <span className="text-xs font-bold leading-tight text-white">{p.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Incoming builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold uppercase text-cern-cyan">Incoming Initial State (Before)</span>
              <div className="flex gap-1">
                <button
                  onClick={() => addOrRemoveLeg('in', 'add')}
                  className="px-2 py-0.5 bg-canvas-sub border border-black text-white font-bold hover:bg-cern-blue cursor-pointer"
                >
                  + Leg
                </button>
                <button
                  onClick={() => addOrRemoveLeg('in', 'remove')}
                  className="px-2 py-0.5 bg-canvas-sub border border-black text-white font-bold hover:bg-red-700 cursor-pointer"
                >
                  - Leg
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {sandboxIncoming.map((pId, idx) => (
                <select
                  key={idx}
                  value={pId}
                  onChange={(e) => toggleSandboxLeg('in', idx, e.target.value)}
                  className="px-3 py-2 bg-canvas-sub text-white border-2 border-black font-mono text-xs font-bold focus:outline-none focus:border-cern-cyan"
                >
                  {BUILDER_PARTICLES.map((opt) => (
                    <option key={opt} value={opt}>
                      {QUANTUM_PARTICLES[opt].symbol} ({QUANTUM_PARTICLES[opt].name})
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          {/* Outgoing builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold uppercase text-amber-400">Outgoing Final State (After)</span>
              <div className="flex gap-1">
                <button
                  onClick={() => addOrRemoveLeg('out', 'add')}
                  className="px-2 py-0.5 bg-canvas-sub border border-black text-white font-bold hover:bg-cern-blue cursor-pointer"
                >
                  + Leg
                </button>
                <button
                  onClick={() => addOrRemoveLeg('out', 'remove')}
                  className="px-2 py-0.5 bg-canvas-sub border border-black text-white font-bold hover:bg-red-700 cursor-pointer"
                >
                  - Leg
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {sandboxOutgoing.map((pId, idx) => (
                <select
                  key={idx}
                  value={pId}
                  onChange={(e) => toggleSandboxLeg('out', idx, e.target.value)}
                  className="px-3 py-2 bg-canvas-sub text-white border-2 border-black font-mono text-xs font-bold focus:outline-none focus:border-amber-400"
                >
                  {BUILDER_PARTICLES.map((opt) => (
                    <option key={opt} value={opt}>
                      {QUANTUM_PARTICLES[opt].symbol} ({QUANTUM_PARTICLES[opt].name})
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Split Stage: Diagram + Conservation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Animated Feynman Canvas & Energy Control */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className={`p-4 bg-[#070B12] border-3 border-black shadow-[6px_6px_0px_#000] relative overflow-hidden`}
          >
            {/* Top Status Pill & Animation Control */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-mono font-bold text-text-muted uppercase">
                Space-Time Diagram (Time →)
              </span>
              <div className="flex items-center gap-2">
                {!reduceMotion && (
                  <button
                    type="button"
                    onClick={() => setIsAnimating((v) => !v)}
                    aria-label={isAnimating ? 'Pause Feynman propagator motion' : 'Play Feynman propagator motion'}
                    className="px-2 py-0.5 bg-canvas-sub hover:bg-canvas-raised text-white font-mono font-bold text-[10px] border-2 border-black flex items-center gap-1 cursor-pointer"
                  >
                    {isAnimating ? <Pause className="w-3 h-3 text-cern-cyan" /> : <Play className="w-3 h-3 text-emerald-400" />}
                    <span>{isAnimating ? 'PAUSE' : 'PLAY'}</span>
                  </button>
                )}
                {conservation.valid ? (
                  <span className="px-2.5 py-0.5 bg-emerald-400 text-black font-mono font-black text-[11px] border-2 border-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ALLOWED S-MATRIX AMPLITUDE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-red-500 text-black font-mono font-black text-[11px] border-2 border-black flex items-center gap-1 animate-pulse">
                    <XCircle className="w-3.5 h-3.5" /> FORBIDDEN / KINEMATICALLY BLOCKED
                  </span>
                )}
              </div>
            </div>

            {/* Interactive SVG Diagram */}
            <svg viewBox="0 0 480 240" className="w-full h-56 sm:h-64 select-none">
              <defs>
                <pattern id="feynmanGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#131C2B" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="480" height="240" fill="url(#feynmanGrid)" />

              {/* Time Flow Axis */}
              <line x1="20" y1="222" x2="455" y2="222" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="410" y="216" fill="#64748B" fontSize="10" fontFamily="monospace" fontWeight="bold">
                TIME →
              </text>

              {/* Vertex Positions */}
              {(() => {
                const v1x = 175;
                const v1y = 120;
                const v2x = 305;
                const v2y = 120;

                const propColor = !conservation.valid
                  ? '#EF4444'
                  : activePreset.propagator === 'H/loop'
                  ? '#10B981'
                  : activePreset.propagator === 'W-'
                  ? '#A855F7'
                  : '#FFE600';

                return (
                  <>
                    {/* Incoming Legs */}
                    {currentIncoming.map((id, idx) => {
                      const yStart =
                        currentIncoming.length === 1 ? 120 : idx === 0 ? 50 : 190;
                      const particle = QUANTUM_PARTICLES[id];
                      const isAnti = id.includes('+') || id.includes('bar');
                      return (
                        <g key={`in-${idx}`}>
                          <line
                            x1="48"
                            y1={yStart}
                            x2={v1x}
                            y2={v1y}
                            stroke={id === 'g' ? '#F97316' : '#00E5FF'}
                            strokeWidth="3.5"
                            strokeDasharray={id === 'g' ? '6 4' : id === 'H' ? '8 5' : undefined}
                          />
                          {/* Arrow midpoint */}
                          <polygon
                            points={
                              isAnti
                                ? '-6,0 5,-5 5,5'
                                : '6,0 -5,-5 -5,5'
                            }
                            fill={id === 'g' ? '#F97316' : '#00E5FF'}
                            transform={`translate(${(48 + v1x) / 2}, ${(yStart + v1y) / 2}) rotate(${
                              (Math.atan2(v1y - yStart, v1x - 48) * 180) / Math.PI
                            })`}
                          />
                          <rect
                            x="14"
                            y={yStart - 13}
                            width="44"
                            height="26"
                            fill="#0F172A"
                            stroke="#00E5FF"
                            strokeWidth="2"
                          />
                          <text
                            x="36"
                            y={yStart + 4}
                            fill="#FFFFFF"
                            fontSize="13"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {particle?.symbol || id}
                          </text>
                        </g>
                      );
                    })}

                    {/* Propagator / Virtual Mediator between V1 and V2 */}
                    {mode === 'presets' && activePreset.id === 'gg_h_yy' ? (
                      <>
                        {/* Top quark loop representation + Higgs dashed line */}
                        <polygon
                          points="175,120 220,85 220,155"
                          fill="rgba(249,115,22,0.12)"
                          stroke="#F97316"
                          strokeWidth="2.5"
                        />
                        <text x="203" y="123" fill="#FB923C" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                          t-loop
                        </text>
                        <line
                          x1="220"
                          y1="120"
                          x2={v2x}
                          y2={v2y}
                          stroke="#10B981"
                          strokeWidth="3.5"
                          strokeDasharray="8 5"
                        />
                        <text x="264" y="108" fill="#10B981" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                          H⁰
                        </text>
                      </>
                    ) : (
                      <>
                        <path
                          d={buildWavyPath(
                            v1x,
                            v1y,
                            v2x,
                            v2y,
                            6,
                            7,
                            !reduceMotion && isAnimating && conservation.valid ? pulsePhase * 2 : 0
                          )}
                          fill="none"
                          stroke={propColor}
                          strokeWidth="3.5"
                        />
                        <text
                          x="240"
                          y="100"
                          fill={propColor}
                          fontSize="12"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {!conservation.valid
                            ? 'BLOCKED ✕'
                            : mode === 'presets'
                            ? activePreset.propagator
                            : 'Virtual Boson'}
                        </text>
                      </>
                    )}

                    {/* Outgoing Legs */}
                    {currentOutgoing.map((id, idx) => {
                      const count = currentOutgoing.length;
                      const yEnd =
                        count === 1 ? 120 : count === 2 ? (idx === 0 ? 50 : 190) : idx === 0 ? 40 : idx === 1 ? 120 : 200;
                      const particle = QUANTUM_PARTICLES[id];
                      const isAnti = id.includes('+') || id.includes('bar');
                      const strokeColor = !conservation.valid
                        ? '#EF4444'
                        : id === 'gamma'
                        ? '#FFE600'
                        : '#A855F7';
                      return (
                        <g key={`out-${idx}`}>
                          <line
                            x1={v2x}
                            y1={v2y}
                            x2="432"
                            y2={yEnd}
                            stroke={strokeColor}
                            strokeWidth="3.5"
                            strokeDasharray={!conservation.valid ? '5 5' : id === 'gamma' ? '3 3' : undefined}
                          />
                          <polygon
                            points={isAnti ? '-6,0 5,-5 5,5' : '6,0 -5,-5 -5,5'}
                            fill={strokeColor}
                            transform={`translate(${(v2x + 432) / 2}, ${(v2y + yEnd) / 2}) rotate(${
                              (Math.atan2(yEnd - v2y, 432 - v2x) * 180) / Math.PI
                            })`}
                          />
                          <rect
                            x="422"
                            y={yEnd - 13}
                            width="44"
                            height="26"
                            fill="#0F172A"
                            stroke={strokeColor}
                            strokeWidth="2"
                          />
                          <text
                            x="444"
                            y={yEnd + 4}
                            fill="#FFFFFF"
                            fontSize="13"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {particle?.symbol || id}
                          </text>
                        </g>
                      );
                    })}

                    {/* Vertices */}
                    <circle
                      cx={v1x}
                      cy={v1y}
                      r={!reduceMotion && isAnimating && conservation.valid && pulsePhase >= 0.3 && pulsePhase <= 0.44 ? 10 : 7}
                      fill="#FFE600"
                      stroke="#000"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx={v2x}
                      cy={v2y}
                      r={!reduceMotion && isAnimating && conservation.valid && pulsePhase >= 0.6 && pulsePhase <= 0.74 ? 10 : 7}
                      fill={conservation.valid ? '#00E5FF' : '#EF4444'}
                      stroke="#000"
                      strokeWidth="2.5"
                    />

                    {/* Living Quantum Amplitude Packets along incoming -> mediator -> outgoing legs */}
                    {!reduceMotion && isAnimating && conservation.valid && (
                      <>
                        {pulsePhase < 0.36 &&
                          currentIncoming.map((id, idx) => {
                            const yStart = currentIncoming.length === 1 ? 120 : idx === 0 ? 50 : 190;
                            const u = pulsePhase / 0.36;
                            const px = 48 + (v1x - 48) * u;
                            const py = yStart + (v1y - yStart) * u;
                            return (
                              <circle
                                key={`pkt-in-${idx}`}
                                cx={px}
                                cy={py}
                                r="5.5"
                                fill={id === 'g' ? '#F97316' : '#00E5FF'}
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                              />
                            );
                          })}
                        {pulsePhase >= 0.34 && pulsePhase <= 0.68 && (
                          <circle
                            cx={v1x + (v2x - v1x) * ((pulsePhase - 0.34) / 0.34)}
                            cy={v1y}
                            r="6.5"
                            fill="#FFE600"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                        )}
                        {pulsePhase > 0.65 &&
                          currentOutgoing.map((id, idx) => {
                            const count = currentOutgoing.length;
                            const yEnd =
                              count === 1 ? 120 : count === 2 ? (idx === 0 ? 50 : 190) : idx === 0 ? 40 : idx === 1 ? 120 : 200;
                            const u = (pulsePhase - 0.65) / 0.35;
                            const px = v2x + (432 - v2x) * u;
                            const py = v2y + (yEnd - v2y) * u;
                            return (
                              <circle
                                key={`pkt-out-${idx}`}
                                cx={px}
                                cy={py}
                                r="5.5"
                                fill={id === 'gamma' ? '#FFE600' : '#A855F7'}
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                              />
                            );
                          })}
                      </>
                    )}
                  </>
                );
              })()}
            </svg>

            {/* Center-of-mass Energy Slider */}
            <div className="mt-3 p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-text-muted uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cern-cyan" /> Center-of-Mass Energy (√s):
                </span>
                <span className="text-cern-cyan text-sm">{sqrtSGev.toFixed(2)} GeV</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={mode === 'presets' ? activePreset.maxSliderGev : 200}
                step={0.05}
                value={sqrtSGev}
                onChange={(e) => setSqrtSGev(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-text-muted">
                <span>Threshold Needed: Σm_out = {conservation.thresholdGev.toFixed(3)} GeV</span>
                <span>Mandelstam s = {(sqrtSGev * sqrtSGev).toFixed(1)} GeV²</span>
              </div>
            </div>
          </div>

          {/* Live Z0 Resonance Curve (e+ e- -> mu+ mu-) */}
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold uppercase text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FFE600]" /> e⁺e⁻ → μ⁺μ⁻ Resonance Profile (QED + Z⁰ Pole)
              </span>
              <span className="text-cern-cyan font-bold">
                σ = {currentEeCrossSection.withZResonanceNb.toFixed(3)} nb
              </span>
            </div>
            <svg viewBox="0 0 400 135" className="w-full h-32 bg-canvas-sub border border-black">
              <polyline
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2.5"
                points={crossSectionPlot.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
              />
              {/* Z boson line at 91.19 GeV */}
              {(() => {
                const zx = 40 + ((91.1876 - 5) / (140 - 5)) * 320;
                const cx = 40 + (Math.min(1, Math.max(0, (sqrtSGev - 5) / (140 - 5)))) * 320;
                return (
                  <>
                    <line x1={zx} y1="8" x2={zx} y2="122" stroke="#FFE600" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={zx + 4} y="20" fill="#FFE600" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      M_Z = 91.2 GeV
                    </text>
                    <line x1={cx} y1="8" x2={cx} y2="122" stroke="#FF0055" strokeWidth="2" />
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Right 5 Cols: Conservation Matrix + Depth Explanation + Micro-Quiz */}
        <div className="lg:col-span-5 space-y-4">
          {/* Conservation Scorecard */}
          <div className="p-4 bg-canvas-surface border-3 border-black shadow-[5px_5px_0px_#000] space-y-3">
            <h3 className="text-sm font-display font-black uppercase text-white border-b-2 border-black pb-2">
              Quantum Number Conservation Ledger
            </h3>

            <div className="space-y-2 text-xs font-mono">
              {[
                { label: 'Electric Charge (ΔQ)', val: conservation.deltaQ, ok: conservation.deltaQ === 0 },
                { label: 'Baryon Number (ΔB)', val: conservation.deltaB, ok: conservation.deltaB === 0 },
                { label: 'Electron Lepton (ΔLₑ)', val: conservation.deltaLe, ok: conservation.deltaLe === 0 },
                { label: 'Muon Lepton (ΔL_μ)', val: conservation.deltaLmu, ok: conservation.deltaLmu === 0 },
                {
                  label: 'Mass-Energy Threshold (√s ≥ Σm)',
                  val: conservation.kinematicallyAllowed ? 'OK' : 'LOW √s',
                  ok: conservation.kinematicallyAllowed,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between p-2 border-2 border-black ${
                    row.ok ? 'bg-canvas-sub text-text-secondary' : 'bg-red-950 text-red-200 border-red-500'
                  }`}
                >
                  <span className="font-bold">{row.label}</span>
                  <span className={`font-black flex items-center gap-1 ${row.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                    {row.ok ? (
                      <>
                        <span>{row.val === 0 ? 'Δ = 0' : row.val}</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>{typeof row.val === 'number' ? `Δ = ${row.val}` : row.val}</span>
                        <XCircle className="w-3.5 h-3.5" />
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {conservation.violations.length > 0 && (
              <div className="p-3 bg-red-500/20 border-2 border-red-500 text-xs font-mono text-red-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-400">
                  <AlertTriangle className="w-4 h-4" /> Physical Diagnostic:
                </div>
                {conservation.violations.map((v, i) => (
                  <div key={i}>• {v}</div>
                ))}
              </div>
            )}
          </div>

          {/* 3-Tier Interactive Explanation */}
          {mode === 'presets' && (
            <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-cern-cyan flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> {userLevel} Depth Explanation
                </span>
              </div>
              <p className="text-xs font-sans text-text-primary leading-relaxed">
                {userLevel === 'BEGINNER'
                  ? activePreset.physicsStory.beginner
                  : userLevel === 'UNDERGRAD'
                  ? activePreset.physicsStory.undergrad
                  : activePreset.physicsStory.researcher}
              </p>
              <div className="pt-2 border-t border-black/40 text-[10px] font-mono text-text-muted">
                {activePreset.couplingNote}
              </div>
            </div>
          )}

          {/* Check-Your-Intuition Micro-Quiz */}
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#FFE600] space-y-2.5">
            <div className="text-xs font-mono font-black uppercase text-[#FFE600] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Predict Before Running: Intuition Check
            </div>
            <p className="text-xs font-sans text-white">
              If an electron (0.511 MeV) and positron (0.511 MeV) collide at √s = 0.15 GeV, can they produce a μ⁺μ⁻ pair (each muon is 0.1057 GeV)?
            </p>
            <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
              {[
                'Yes — because electric charge balances to 0.',
                'No — 0.15 GeV is below the 0.211 GeV rest-mass threshold (2 × m_μ).',
                'Yes — if the photon gives extra mass for free.',
              ].map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuizAnswer(idx)}
                  className={`p-2 border-2 border-black text-left transition-all cursor-pointer ${
                    quizAnswer === idx
                      ? idx === 1
                        ? 'bg-emerald-400 text-black font-bold'
                        : 'bg-red-500 text-black font-bold'
                      : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {quizAnswer !== null && (
              <div className="text-[11px] font-mono text-text-secondary pt-1">
                {quizAnswer === 1
                  ? '✓ Exact! E = mc² requires √s ≥ 2 × 0.1057 = 0.2114 GeV. Drag the √s slider below 0.21 GeV above to watch the channel block!'
                  : '✕ Try dragging the √s slider down to 0.15 GeV on e⁺e⁻ → μ⁺μ⁻ to observe why kinematics blocks it!'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
