'use client';

import React, { useState, useMemo } from 'react';
import { SeededRNG } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { useGlobalStore } from '@/lib/store';
import { playTemPadClick, playTimeChargeSweep, playDiscoveryChime, playQuenchAlarm } from '@/lib/sonifier';
import { ShieldCheck, Scissors, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

interface IntakeCandidate {
  id: string;
  title: string;
  signature: string;
  ptGev: number;
  invariantMassGev: number;
  displacementMm: number;
  metGev: number;
  action: 'KEEP' | 'PRUNE';
  rationale: string;
}

const EVENT_BANK: Omit<IntakeCandidate, 'id'>[] = [
  {
    title: 'Golden 4-Muon Resonance',
    signature: 'H⁰ → ZZ* → μ⁺μ⁻e⁺e⁻',
    ptGev: 64.2,
    invariantMassGev: 125.1,
    displacementMm: 0.02,
    metGev: 6.4,
    action: 'KEEP',
    rationale: 'Clean isolated 4-lepton invariant mass peak right on 125.1 GeV Higgs mass!',
  },
  {
    title: 'Low-p_T QCD Dijet Pileup',
    signature: 'g + q → Soft Jets + π± Halo',
    ptGev: 14.5,
    invariantMassGev: 28.0,
    displacementMm: 0.01,
    metGev: 4.1,
    action: 'PRUNE',
    rationale: 'Minimum-bias QCD background occurs millions of times per second—L1 trigger must prune it to save DAQ bandwidth!',
  },
  {
    title: 'Z0 Calibration Dimuon',
    signature: 'qq̄ → Z⁰ → μ⁺μ⁻',
    ptGev: 45.8,
    invariantMassGev: 91.2,
    displacementMm: 0.01,
    metGev: 3.2,
    action: 'KEEP',
    rationale: 'Textbook Z boson pole at 91.2 GeV—vital for tracker & muon spectrometer calibration!',
  },
  {
    title: 'Beam-Gas Cosmic Halo Noise',
    signature: 'Out-of-time Muon + No IP Vertex',
    ptGev: 9.2,
    invariantMassGev: 11.4,
    displacementMm: 820.0,
    metGev: 1.8,
    action: 'PRUNE',
    rationale: 'Stray non-collision cosmic ray crossing out of bunch-crossing sync—prune immediately!',
  },
  {
    title: 'Displaced Dark-Photon Pair',
    signature: 'γ_D → μ⁺μ⁻ (35 cm Displaced Vertex)',
    ptGev: 52.0,
    invariantMassGev: 44.5,
    displacementMm: 350.0,
    metGev: 18.0,
    action: 'KEEP',
    rationale: 'High-p_T lepton pair emerging mid-tracker from an isolated secondary vertex—prime BSM Long-Lived Particle candidate!',
  },
  {
    title: 'Unisolated Soft Electron Background',
    signature: 'HF Jet Fragmentation',
    ptGev: 7.8,
    invariantMassGev: 15.2,
    displacementMm: 0.12,
    metGev: 5.5,
    action: 'PRUNE',
    rationale: 'Buried inside heavy hadronic calorimeter spray below trigger p_T threshold—prune cleanly!',
  },
];

export const TvaIntakeDeskSimulator: React.FC = () => {
  const completeMission = useGlobalStore((s) => s.completeMission);
  const completedMissions = useGlobalStore((s) => s.completedMissions);

  const [roundIdx, setRoundIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [lastFeedback, setLastFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const eventDeck = useMemo(() => {
    const rng = new SeededRNG(4040 + Math.floor(roundIdx / EVENT_BANK.length));
    return Array.from({ length: EVENT_BANK.length }, (_, idx) => {
      const tpl = EVENT_BANK[(idx + roundIdx) % EVENT_BANK.length];
      const jitter = (rng.nextFloat() - 0.5) * 1.4;
      return {
        ...tpl,
        id: `EVT-${40000 + roundIdx}-${idx}`,
        ptGev: Number(Math.max(4, tpl.ptGev + jitter).toFixed(1)),
      };
    });
  }, [roundIdx]);

  const current = eventDeck[0];
  const clearedMission = completedMissions.includes('mission-tva-intake') || score >= 5;

  const handleDecision = (choice: 'KEEP' | 'PRUNE') => {
    const ok = choice === current.action;
    const nextScore = ok ? score + 1 : score;
    setAttempts((a) => a + 1);
    setScore(nextScore);

    if (ok) {
      if (choice === 'KEEP') playTemPadClick();
      else playTimeChargeSweep();
      if (nextScore >= 5) {
        completeMission('mission-tva-intake');
        playDiscoveryChime();
      }
      setLastFeedback({ ok: true, text: `STAMP ACCEPTED (${choice}): ${current.rationale}` });
    } else {
      playQuenchAlarm();
      setLastFeedback({
        ok: false,
        text: `NEXUS SLIP! Should be ${current.action}: ${current.rationale}`,
      });
    }
    setRoundIdx((r) => r + 1);
  };

  const resetDesk = () => {
    setRoundIdx(0);
    setScore(0);
    setAttempts(0);
    setLastFeedback(null);
  };

  return (
    <div className="space-y-5">
      <Eli5Card
        title="TVA Intake Desk = Real CERN Level-1 Trigger Filtering!"
        analogy="At the LHC, 40 million collisions smash together every second—that would melt every hard drive on Earth in seconds! Just like the TVA deciding which timeline variants to Keep and which to Prune, CERN's ultra-fast FPGA Trigger keeps the 1,000 rarest gold-standard physics events per second and prunes 99.997% of everyday background spray!"
      />

      <div className="p-5 bg-[#1A1006] border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4 cern-tva-scanlines">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <FidelityBadge type="ANALYTIC" />
            <span className="px-2 py-0.5 bg-[#FFB000] text-black font-mono font-black text-[10px] border-2 border-black uppercase">
              TVA INTAKE DESK // 40 MHz L1 TRIGGER TRIAGE
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-[#FFE082]">
            Minuteman Trigger Console: Keep vs. Prune Collisions
          </h2>
          <p className="text-xs font-mono text-[#F5C77E] mt-1">
            Sort incoming detector topologies accurately to reach 5/5 verified trigger clearances and unlock your TVA Minuteman badge.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-2 bg-[#120B05] border-2 border-[#FFB000] text-[#FFE082]">
            CLEARED: <strong className="text-[#FFB000]">{score}</strong> / 5 (Accuracy{' '}
            {attempts > 0 ? Math.round((score / attempts) * 100) : 100}%)
          </div>
          <button
            type="button"
            onClick={resetDesk}
            className="px-3 py-2 bg-[#23160A] hover:bg-[#33200E] border-2 border-black text-[#FFE082] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Active Dossier Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-[#120B05] border-3 border-black p-5 shadow-[6px_6px_0px_#000] space-y-4 cern-tva-scanlines">
          <div className="flex items-center justify-between border-b border-[#4A2E10] pb-2 font-mono text-xs">
            <span className="text-[#FFB000] font-black">INCOMING DOSSIER #{current.id}</span>
            <span className="text-[#D8A55C]">LHC RUN-3 STREAM</span>
          </div>

          <div>
            <h3 className="text-xl font-display font-black text-[#FFE082]">{current.title}</h3>
            <p className="text-sm font-mono text-cern-cyan font-bold mt-1">{current.signature}</p>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-[#1C1107] border-2 border-black">
              <dt className="text-[10px] text-[#D8A55C] uppercase">Leading p_T</dt>
              <dd className="text-[#FFE082] font-black text-base">{current.ptGev} GeV</dd>
            </div>
            <div className="p-2.5 bg-[#1C1107] border-2 border-black">
              <dt className="text-[10px] text-[#D8A55C] uppercase">Inv. Mass</dt>
              <dd className="text-[#FFB000] font-black text-base">{current.invariantMassGev} GeV</dd>
            </div>
            <div className="p-2.5 bg-[#1C1107] border-2 border-black">
              <dt className="text-[10px] text-[#D8A55C] uppercase">Vertex Offset</dt>
              <dd className="text-cern-cyan font-black text-base">{current.displacementMm} mm</dd>
            </div>
            <div className="p-2.5 bg-[#1C1107] border-2 border-black">
              <dt className="text-[10px] text-[#D8A55C] uppercase">Missing E_T</dt>
              <dd className="text-[#FF6B35] font-black text-base">{current.metGev} GeV</dd>
            </div>
          </dl>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleDecision('KEEP')}
              className="py-3 px-4 bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-black text-sm border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>STAMP: KEEP (L1 TRIGGER)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDecision('PRUNE')}
              className="py-3 px-4 bg-[#FF334B] hover:bg-[#FF5266] text-white font-mono font-black text-sm border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>STAMP: PRUNE (DISCARD)</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-[#170F07] border-3 border-black shadow-[5px_5px_0px_#000] space-y-3 font-mono text-xs">
            <h4 className="font-black uppercase text-[#FFB000] border-b border-[#4A2E10] pb-2">
              Standard Trigger Policy Rules
            </h4>
            <ul className="space-y-2 text-[#F5C77E] leading-relaxed">
              <li>• <strong className="text-emerald-400">KEEP</strong> clean isolated leptons/photons near Z⁰ (91 GeV) or H⁰ (125 GeV) poles.</li>
              <li>• <strong className="text-emerald-400">KEEP</strong> high-p_T (&gt;30 GeV) secondary vertices inside tracking volume (LLPs).</li>
              <li>• <strong className="text-[#FF6B35]">PRUNE</strong> soft low-p_T QCD pileup spray and non-collision cosmic beam-gas muons.</li>
            </ul>
          </div>

          {lastFeedback && (
            <div
              className={`p-4 border-3 border-black shadow-[4px_4px_0px_#000] font-mono text-xs flex items-start gap-2.5 ${
                lastFeedback.ok
                  ? 'bg-emerald-950/90 text-emerald-200'
                  : 'bg-red-950/90 text-red-200'
              }`}
            >
              {lastFeedback.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{lastFeedback.text}</span>
            </div>
          )}

          {clearedMission && (
            <div className="p-3 bg-[#FFB000] text-black border-2 border-black font-mono font-black text-xs shadow-[3px_3px_0px_#000]">
              BADGE UNLOCKED: MINUTEMAN TRIGGER ARCHITECT (Check Topbar Trophy Drawer!)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
