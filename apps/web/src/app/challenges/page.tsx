'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PhysicsChallengesArena } from '@/components/simulations/PhysicsChallengesArena';
import { LawViolationLab } from '@/components/simulations/LawViolationLab';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { TechnicalTermDeck } from '@/components/ui/TechTermInfo';
import { Trophy, Ban, ArrowRight } from 'lucide-react';

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'laws'>('challenges');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="inline-block px-2.5 py-1 bg-[#FFE600] text-black font-mono font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
            PARTON PHYSICS CHALLENGES &amp; FUNDAMENTAL LAW LIMITS
          </span>
          <Link
            href="/simulations"
            className="px-3 py-1.5 bg-cern-blue hover:bg-cern-accent text-white font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
          >
            <span>Open 33 Full Simulators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <h1 className="text-3xl lg:text-4xl font-display font-black text-white tracking-tight">
          Challenges Arena &amp; Laws You Cannot Break
        </h1>
        <p className="text-sm text-text-secondary mt-2 cern-prose leading-relaxed font-sans">
          Test your physics mastery by solving live parameter constraints verified against `@cern-x/sim-core`,
          then switch to the Law Violation Interlock Lab to see what physically happens—in both ELI5 intuition
          and technical KaTeX math—whenever you try to break fundamental conservation or engineering limits.
        </p>

        {/* Primary Switcher */}
        <div className="mt-5 pt-4 border-t-2 border-black flex flex-wrap gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2.5 border-2 border-black font-black uppercase flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'challenges'
                ? 'bg-[#FFE600] text-black shadow-[4px_4px_0px_#00E5FF] -translate-y-0.5'
                : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Physics Challenges (8 Live Missions)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('laws')}
            className={`px-4 py-2.5 border-2 border-black font-black uppercase flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'laws'
                ? 'bg-cern-magenta text-white shadow-[4px_4px_0px_#FFE600] -translate-y-0.5'
                : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
            }`}
          >
            <Ban className="w-4 h-4" />
            <span>Break Laws &amp; Hard Limitations (8 Barriers)</span>
          </button>
        </div>
      </div>

      <Eli5Card
        title="Why Science Has Unbreakable Speed Limits, Energy Budgets & Quantum Accounting"
        analogy="Think of Nature's laws like the ultimate rulebook of a cosmic video game: you can build bigger magnets or faster triggers, but you can NEVER cheat electric charge, go faster than light, or capture an isolated bare quark. Try pushing a slider past those edges and watch the exact physical catastrophe unfold!"
        keyPoints={[
          'Live Physics Challenges: Solve 8 real CERN parameter puzzles right here to earn +40 to +100 Beam Credits.',
          'Law Violation Guardrails: Every "You Can’t Do That" screen explains both Why (ELI5 story) and How Much (exact KaTeX proof).',
          'Real Kernel Validation: Every check executes deterministically inside @cern-x/sim-core rather than scripted text.',
        ]}
        whatToTry="Start by solving Challenge 1 or Challenge 2 below, then click 'Break Laws & Hard Limitations' to attempt impossible physics!"
      />

      {activeTab === 'challenges' ? <PhysicsChallengesArena /> : <LawViolationLab />}

      <TechnicalTermDeck
        contextId="page-challenges"
        heading="Conservation Laws, Relativistic Limits & Discovery Terms (ⓘ Info Cards)"
      />
    </div>
  );
}
