'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  calculateRequiredDipoleField,
  calculateMagneticRigidity,
  asimovSignificance,
  calculateSacredTimelineVacuum,
  evaluateLhcPartonLuminosity,
  calculateCherenkovCone,
  calculateNeutrinoOscillation,
  calculateSuperconductingMagnetMetrics,
  validateInteractionConservation,
  LHC_BENDING_RADIUS_M,
} from '@cern-x/sim-core';
import { useGlobalStore } from '@/lib/store';
import { MathFormula } from '@/components/ui/MathFormula';
import { playDiscoveryChime, playTemPadClick } from '@/lib/sonifier';
import {
  Target,
  Trophy,
  Zap,
  CheckCircle2,
  ArrowRight,
  Baby,
  Cpu,
  AlertTriangle,
} from 'lucide-react';

type TierFilter = 'ALL' | '101' | 'BSc' | 'PhD';

const LEGAL_REACTIONS = [
  { id: 'r1', label: 'p + p → μ⁺ + ν_μ  (Broken Baryon)', inIds: ['p', 'p'], outIds: ['mu_plus', 'nu_mu'] },
  { id: 'r2', label: 'n → p + e⁻ + ν̄_e  (Beta Decay)', inIds: ['n'], outIds: ['p', 'e_minus', 'nu_e_bar'] },
  { id: 'r3', label: 'e⁻ + e⁺ → μ⁺ + ν_e  (Wrong Flavor)', inIds: ['e_minus', 'e_plus'], outIds: ['mu_plus', 'nu_e'] },
];

export const PhysicsChallengesArena: React.FC = () => {
  const [tierFilter, setTierFilter] = useState<TierFilter>('ALL');
  const completedChallenges = useGlobalStore((s) => s.completedChallenges);
  const completeChallenge = useGlobalStore((s) => s.completeChallenge);
  const hydrateChallenges = useGlobalStore((s) => s.hydrateChallenges);
  const betCredits = useGlobalStore((s) => s.betCredits);
  const hydrateBets = useGlobalStore((s) => s.hydrateBets);

  // Interactive controls for the 8 quantitative challenges
  const [c1EnergyGev, setC1EnergyGev] = useState<number>(5200); // Target: [6500, 7000] GeV (<8.8T safe)
  const [c2Signal, setC2Signal] = useState<number>(22); // Target: Asimov Z0 >= 5.0 against b=45
  const [c3HiggsGev, setC3HiggsGev] = useState<number>(125.25); // Target: STABLE regime (with mt=171)
  const [c4SqrtSTev, setC4SqrtSTev] = useState<number>(1.8); // Target: gg share >= 88% for 125.25 GeV Higgs
  const [c5MomentumGev, setC5MomentumGev] = useState<number>(2.5); // Target: pion emits, kaon dark in C4F10 (n=1.0014) -> ~4.5..9.2 GeV
  const [c6EnergyGev, setC6EnergyGev] = useState<number>(6.0); // Target: P(nu_mu -> nu_tau) >= 0.90 at 732 km CNGS
  const [c7Conductor, setC7Conductor] = useState<'NbTi' | 'Nb3Sn'>('NbTi');
  const [c7TempK, setC7TempK] = useState<number>(2.5); // Target: 12.5 T unquenched
  const [c8ReactionId, setC8ReactionId] = useState<string>('r1');

  useEffect(() => {
    hydrateChallenges();
    hydrateBets();
  }, [hydrateChallenges, hydrateBets]);

  // Real @cern-x/sim-core checks
  const c1DipoleT = calculateRequiredDipoleField(c1EnergyGev, LHC_BENDING_RADIUS_M, 1);
  const c1Rigidity = calculateMagneticRigidity(c1EnergyGev, 1);
  const c1Solved = c1EnergyGev >= 6500 && c1EnergyGev <= 7000 && c1DipoleT <= 8.35;

  const c2Bkg = 45;
  const c2Asimov = asimovSignificance(c2Signal, c2Bkg);
  const c2Solved = c2Asimov >= 5.0;

  const c3Vac = useMemo(() => calculateSacredTimelineVacuum(c3HiggsGev, 171.0, 0.1185), [c3HiggsGev]);
  const c3Solved = c3Vac.regime === 'STABLE';

  const c4Mix = useMemo(() => evaluateLhcPartonLuminosity(125.25, c4SqrtSTev), [c4SqrtSTev]);
  const c4Solved = c4Mix.ggChannelShare >= 0.88;

  const c5Pion = calculateCherenkovCone(c5MomentumGev, 0.13957, 1.0014);
  const c5Kaon = calculateCherenkovCone(c5MomentumGev, 0.49368, 1.0014);
  const c5Solved = c5Pion.emitsCherenkov && !c5Kaon.emitsCherenkov;

  const c6Osc = calculateNeutrinoOscillation(732, c6EnergyGev);
  const c6Solved = c6Osc.probNuMuToNuTau >= 0.9;

  const c7Mag = calculateSuperconductingMagnetMetrics(12.5, 28, c7TempK, c7Conductor);
  const c7Solved = !c7Mag.quenched;

  const c8Picked = LEGAL_REACTIONS.find((r) => r.id === c8ReactionId) ?? LEGAL_REACTIONS[0];
  const c8Cons = validateInteractionConservation(c8Picked.inIds, c8Picked.outIds);
  const c8Solved = c8Cons.conserved;

  const handleClaim = (id: string, ready: boolean, reward: number) => {
    if (!ready) {
      playTemPadClick();
      return;
    }
    playDiscoveryChime();
    completeChallenge(id, reward);
  };

  const CHALLENGES = [
    {
      id: 'ch-lhc-nominal',
      tier: '101' as const,
      reward: 45,
      title: '1. Steer LHC to Run-3 Nominal (6.5–7.0 TeV) Without Quench',
      simHref: '/simulations?module=lhc',
      eli5Goal: 'Slide proton beam energy up into the golden Run-3 zone without asking magnets to bend past 8.35 Tesla!',
      techGoal: 'Satisfy p ∈ [6500, 7000] GeV/c cleanly within NbTi ρ = 2803.95 m design ceiling (B ≤ 8.35 T).',
      formula: 'B = \\frac{p}{0.299792\\,\\rho_{\\text{LHC}}}',
      ready: c1Solved,
      statusText: `p = ${c1EnergyGev} GeV/c → Bρ = ${c1Rigidity.toFixed(0)} T·m | B = ${c1DipoleT.toFixed(2)} T`,
      control: (
        <input
          type="range"
          min={450}
          max={8200}
          step={100}
          value={c1EnergyGev}
          onChange={(e) => setC1EnergyGev(Number(e.target.value))}
          className="w-full accent-cern-cyan cursor-pointer"
          aria-label="Challenge 1 LHC proton energy"
        />
      ),
      warning: c1DipoleT > 8.35 ? '⚠ Over-limit! Field exceeds 8.35 T design limit (NbTi quench risk)!' : null,
    },
    {
      id: 'ch-5sigma-higgs',
      tier: '101' as const,
      reward: 50,
      title: '2. Cross the 5σ Higgs Discovery Threshold (b = 45 Background)',
      simHref: '/simulations?module=discovery',
      eli5Goal: 'Collect enough real signal bumps on top of 45 noisy background bumps until physicists declare a true discovery (5σ)!',
      techGoal: 'Increase signal count s until exact profile-likelihood Asimov significance Z₀ ≥ 5.00 σ.',
      formula: 'Z_0 = \\sqrt{2\\left((s+b)\\ln\\left(1 + \\frac{s}{b}\\right) - s\\right)}',
      ready: c2Solved,
      statusText: `Signal s = ${c2Signal}, Bkg b = ${c2Bkg} → Asimov Z₀ = ${c2Asimov.toFixed(2)} σ`,
      control: (
        <input
          type="range"
          min={5}
          max={80}
          step={1}
          value={c2Signal}
          onChange={(e) => setC2Signal(Number(e.target.value))}
          className="w-full accent-emerald-400 cursor-pointer"
          aria-label="Challenge 2 Signal events"
        />
      ),
      warning: null,
    },
    {
      id: 'ch-legal-decay',
      tier: '101' as const,
      reward: 40,
      title: '3. Approve the Only Physically Legal Particle Decay',
      simHref: '/simulations?module=feynman',
      eli5Goal: 'Two reactions cheat on electric charge or particle family balance—spot the one reaction nature actually allows!',
      techGoal: 'Select the channel conserving Q, baryon number B, and flavor lepton numbers L_e, L_μ, L_τ simultaneously.',
      formula: '\\Delta Q = 0,\\; \\Delta B = 0,\\; \\Delta L_e = \\Delta L_\\mu = 0',
      ready: c8Solved,
      statusText: c8Cons.conserved ? 'ALL QUANTUM NUMBERS CONSERVED (ALLOWED)' : `VIOLATION: ${c8Cons.violations[0]}`,
      control: (
        <div className="flex flex-col gap-1.5">
          {LEGAL_REACTIONS.map((rxn) => (
            <button
              key={rxn.id}
              type="button"
              onClick={() => setC8ReactionId(rxn.id)}
              className={`px-2.5 py-1.5 text-left text-[11px] border-2 border-black font-bold cursor-pointer ${
                c8ReactionId === rxn.id ? 'bg-cern-cyan text-black' : 'bg-canvas-surface text-white'
              }`}
            >
              {rxn.label}
            </button>
          ))}
        </div>
      ),
      warning: !c8Cons.conserved ? `Nature forbids this: ${c8Cons.violations.join('; ')}` : null,
    },
    {
      id: 'ch-vacuum-stable',
      tier: 'BSc' as const,
      reward: 65,
      title: '4. Rescue the Electroweak Vacuum Into Absolute Stability',
      simHref: '/simulations?module=tva-timeline',
      eli5Goal: 'Move the Higgs particle mass heavy enough so our universe sits permanently in a safe bowl forever (not metastable)!',
      techGoal: 'With m_t = 171.0 GeV, tune m_H above the NNLO electroweak boundary so calculateSacredTimelineVacuum() = STABLE.',
      formula: 'm_H > m_H^{\\text{crit}}(m_t = 171\\text{ GeV})',
      ready: c3Solved,
      statusText: `m_H = ${c3HiggsGev.toFixed(2)} GeV → Vacuum Regime: ${c3Vac.regime}`,
      control: (
        <input
          type="range"
          min={112}
          max={135}
          step={0.5}
          value={c3HiggsGev}
          onChange={(e) => setC3HiggsGev(Number(e.target.value))}
          className="w-full accent-amber-400 cursor-pointer"
          aria-label="Challenge 4 Higgs mass GeV"
        />
      ),
      warning: c3Vac.regime === 'REDLINE' ? '⚠ Vacuum Redline! Tunneling instability triggered!' : null,
    },
    {
      id: 'ch-parton-gg',
      tier: 'BSc' as const,
      reward: 70,
      title: '5. Turn Colliding Protons Into a ≥88% Gluon-Gluon Higgs Factory',
      simHref: '/accelerators',
      eli5Goal: 'Crank collider beam energy high enough so Higgs particles form mainly from swirling gluons instead of valence quarks!',
      techGoal: 'Raise √s so Bjorken-x = M_H / √s dips low enough that evaluateLhcPartonLuminosity gives gg share ≥ 88%.',
      formula: 'x \\approx \\frac{125.25\\text{ GeV}}{\\sqrt{s}}, \\qquad \\mathcal{L}_{gg} > 0.88\\,\\mathcal{L}_{\\text{tot}}',
      ready: c4Solved,
      statusText: `√s = ${c4SqrtSTev.toFixed(1)} TeV (x = ${c4Mix.typicalX.toFixed(4)}) → gg Share = ${(c4Mix.ggChannelShare * 100).toFixed(1)}%`,
      control: (
        <input
          type="range"
          min={1.0}
          max={27.0}
          step={0.5}
          value={c4SqrtSTev}
          onChange={(e) => setC4SqrtSTev(Number(e.target.value))}
          className="w-full accent-cern-cyan cursor-pointer"
          aria-label="Challenge 5 Collider center of mass energy TeV"
        />
      ),
      warning: null,
    },
    {
      id: 'ch-rich-window',
      tier: 'BSc' as const,
      reward: 75,
      title: '6. Lock LHCb RICH-1 Pion-Only Cherenkov Band',
      simHref: '/simulations?module=rich-medipix',
      eli5Goal: 'Pick a particle speed where fast light Pions glow bright Cherenkov blue in gas, while heavier Kaons stay completely dark!',
      techGoal: 'Exploit v > c/n in C₄F₁₀ (n = 1.0014): satisfy β_π > 1/n AND β_K ≤ 1/n simultaneously.',
      formula: '\\beta_\\pi > \\frac{1}{n} \\ge \\beta_K \\implies p \\in [2.7,\\; 9.3]\\text{ GeV}/c',
      ready: c5Solved,
      statusText: `p = ${c5MomentumGev.toFixed(1)} GeV/c → π± Glow: ${c5Pion.emitsCherenkov ? 'YES' : 'NO'} | K± Dark: ${!c5Kaon.emitsCherenkov ? 'YES' : 'NO (ALSO GLOWS)'}`,
      control: (
        <input
          type="range"
          min={1.5}
          max={14.0}
          step={0.25}
          value={c5MomentumGev}
          onChange={(e) => setC5MomentumGev(Number(e.target.value))}
          className="w-full accent-purple-400 cursor-pointer"
          aria-label="Challenge 6 RICH momentum GeV"
        />
      ),
      warning: c5Kaon.emitsCherenkov ? 'Both Pions and Kaons glow above ~9.3 GeV/c—discrimination window exceeded!' : null,
    },
    {
      id: 'ch-neutrino-peak',
      tier: 'PhD' as const,
      reward: 85,
      title: '7. Hit ≥90% Muon-to-Tau Neutrino Oscillation Over 732 km (CNGS)',
      simHref: '/simulations?module=neutrinos',
      eli5Goal: 'Tune neutrino beam energy over the 732 km flight from CERN to Italy so almost every muon neutrino shape-shifts into a tau neutrino!',
      techGoal: 'Tune E_ν (GeV) at baseline L = 732 km so 1.267 Δm₃₂² L / E ≈ π/2 maximizes P(ν_μ → ν_τ) ≥ 0.90.',
      formula: 'P(\\nu_\\mu \\to \\nu_\\tau) \\approx \\sin^2(2\\theta_{23})\\sin^2\\!\\left(\\frac{1.267\\,\\Delta m_{32}^2\\,L}{E}\\right)',
      ready: c6Solved,
      statusText: `E_ν = ${c6EnergyGev.toFixed(2)} GeV at 732 km → P(ν_μ→ν_τ) = ${(c6Osc.probNuMuToNuTau * 100).toFixed(1)}%`,
      control: (
        <input
          type="range"
          min={0.6}
          max={12.0}
          step={0.1}
          value={c6EnergyGev}
          onChange={(e) => setC6EnergyGev(Number(e.target.value))}
          className="w-full accent-cern-cyan cursor-pointer"
          aria-label="Challenge 7 Neutrino energy GeV"
        />
      ),
      warning: null,
    },
    {
      id: 'ch-hllhc-nb3sn',
      tier: 'PhD' as const,
      reward: 100,
      title: '8. Hold 12.5 T HL-LHC Quadrupole Field Without Magnet Quench',
      simHref: '/simulations?module=arc-magnet',
      eli5Goal: 'Pick the upgraded HL-LHC superconductor alloy AND chill it below the superfluid helium lambda point!',
      techGoal: 'Keep B = 12.5 T inside unquenched superconducting regime by selecting Nb₃Sn + He-II bath T ≤ 2.17 K.',
      formula: 'B_{\\text{op}} = 12.5\\text{ T} < B_{c2}^{\\text{Nb}_3\\text{Sn}}(T \\le 2.17\\text{ K})',
      ready: c7Solved,
      statusText: `${c7Conductor} at ${c7TempK.toFixed(2)} K → State: ${c7Mag.quenched ? 'QUENCHED!' : 'SUPERCONDUCTING NOMINAL'}`,
      control: (
        <div className="space-y-2">
          <div className="flex gap-2">
            {(['NbTi', 'Nb3Sn'] as const).map((mat) => (
              <button
                key={mat}
                type="button"
                onClick={() => setC7Conductor(mat)}
                className={`flex-1 py-1 border-2 border-black font-bold text-xs cursor-pointer ${
                  c7Conductor === mat ? 'bg-[#FFE600] text-black' : 'bg-canvas-surface text-white'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={1.8}
            max={4.2}
            step={0.05}
            value={c7TempK}
            onChange={(e) => setC7TempK(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
            aria-label="Challenge 8 Cryo temperature Kelvin"
          />
        </div>
      ),
      warning: c7Mag.quenched ? '⚠ Magnet Quenched! NbTi cannot hold 12.5 T and He > 2.17 K breaks superfluid cooling!' : null,
    },
  ];

  const visibleChallenges = CHALLENGES.filter(
    (c) => tierFilter === 'ALL' || c.tier === tierFilter
  );

  return (
    <div className="space-y-6">
      {/* Header + Filter Strip */}
      <div className="p-4 bg-canvas-sub border-3 border-black shadow-[5px_5px_0px_#FFE600] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#FFE600]" />
          <div>
            <h2 className="font-display font-black text-lg text-white uppercase">
              Interactive Physics Challenges ({completedChallenges.length} / {CHALLENGES.length} Cleared)
            </h2>
            <p className="text-xs font-mono text-text-secondary">
              Solve live quantitative CERN &amp; QFT constraints using real @cern-x/sim-core calculations to earn Beam Credits.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 bg-black text-[#00FF66] font-black border-2 border-black flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
            <span>{betCredits}⚡</span>
          </span>
          {(['ALL', '101', 'BSc', 'PhD'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setTierFilter(tier)}
              className={`px-2.5 py-1 border-2 border-black font-black cursor-pointer ${
                tierFilter === tier
                  ? 'bg-cern-cyan text-black'
                  : 'bg-canvas-surface text-text-secondary hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {visibleChallenges.map((ch) => {
          const claimed = completedChallenges.includes(ch.id);
          return (
            <div
              key={ch.id}
              className={`p-5 bg-canvas-surface border-3 border-black space-y-4 flex flex-col justify-between ${
                claimed
                  ? 'shadow-[5px_5px_0px_#00FF66]'
                  : ch.ready
                  ? 'shadow-[5px_5px_0px_#00E5FF]'
                  : 'shadow-[5px_5px_0px_#000]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-2 font-mono text-xs">
                  <span className="px-2 py-0.5 bg-cern-blue text-white font-black border border-black">
                    TIER: {ch.tier}
                  </span>
                  <span className="px-2 py-0.5 bg-black text-[#FFE600] font-black border border-black">
                    +{ch.reward}⚡ REWARD
                  </span>
                </div>

                <h3 className="font-display font-black text-base text-white">{ch.title}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="p-2.5 bg-canvas-sub border border-black space-y-1">
                    <div className="font-mono font-bold text-cern-cyan flex items-center gap-1 uppercase">
                      <Baby className="w-3 h-3" /> ELI5 Goal
                    </div>
                    <p className="text-text-secondary font-sans leading-snug">{ch.eli5Goal}</p>
                  </div>
                  <div className="p-2.5 bg-canvas-sub border border-black space-y-1">
                    <div className="font-mono font-bold text-[#FFE600] flex items-center gap-1 uppercase">
                      <Cpu className="w-3 h-3" /> Technical Target
                    </div>
                    <p className="text-text-secondary font-sans leading-snug">{ch.techGoal}</p>
                  </div>
                </div>

                <div className="p-2 bg-black/50 border border-zinc-800">
                  <MathFormula tex={ch.formula} />
                </div>

                {/* Live Interactive Control */}
                <div className="p-3 bg-canvas-sub border-2 border-black space-y-2 font-mono text-xs">
                  <div className="text-white font-bold">{ch.statusText}</div>
                  {ch.control}
                  {ch.warning && (
                    <div className="p-2 bg-[#250710] border border-cern-magenta text-rose-200 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-cern-magenta shrink-0" />
                      <span>{ch.warning}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2 font-mono text-xs">
                <Link
                  href={ch.simHref}
                  className="text-cern-cyan hover:underline font-bold flex items-center gap-1"
                >
                  <span>Full Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  disabled={claimed}
                  onClick={() => handleClaim(ch.id, ch.ready, ch.reward)}
                  className={`px-3.5 py-2 border-2 border-black font-black uppercase flex items-center gap-1.5 transition-all ${
                    claimed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 cursor-default'
                      : ch.ready
                      ? 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-[3px_3px_0px_#000] cursor-pointer active:translate-y-0.5'
                      : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  {claimed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Solved (+{ch.reward}⚡)</span>
                    </>
                  ) : ch.ready ? (
                    <>
                      <Trophy className="w-4 h-4" />
                      <span>Verify &amp; Claim +{ch.reward}⚡</span>
                    </>
                  ) : (
                    <span>Tune Controls to Target</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
