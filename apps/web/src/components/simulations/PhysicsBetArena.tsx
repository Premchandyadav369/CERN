'use client';

import React, { useState, useEffect } from 'react';
import { getLabEli5AndBet, LAB_ELI5_AND_BETS } from '@/data/eli5AndBets';
import { useGlobalStore } from '@/lib/store';
import { playDiscoveryChime, playTemPadClick } from '@/lib/sonifier';
import {
  Zap,
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Shuffle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PhysicsBetArenaProps {
  activeModule: string;
  onSelectModule: (moduleId: string) => void;
}

const ALL_MODULE_IDS = Object.keys(LAB_ELI5_AND_BETS).filter((k) => k !== 'engineering');

export const PhysicsBetArena: React.FC<PhysicsBetArenaProps> = ({
  activeModule,
  onSelectModule,
}) => {
  const betCredits = useGlobalStore((s) => s.betCredits);
  const betStreak = useGlobalStore((s) => s.betStreak);
  const settledBets = useGlobalStore((s) => s.settledBets);
  const placePhysicsBet = useGlobalStore((s) => s.placePhysicsBet);
  const resetBets = useGlobalStore((s) => s.resetBets);
  const hydrateBets = useGlobalStore((s) => s.hydrateBets);
  const eli5Mode = useGlobalStore((s) => s.eli5Mode);

  const [expanded, setExpanded] = useState(true);
  const [wager, setWager] = useState<number>(25);

  useEffect(() => {
    hydrateBets();
  }, [hydrateBets]);

  const spec = getLabEli5AndBet(activeModule);
  const settled = settledBets[spec.id];
  const totalSettledCount = Object.keys(settledBets).length;
  const rank =
    betCredits >= 250
      ? 'NOBEL LAUREATE PREDICTOR'
      : betCredits >= 150
      ? 'CHIEF SHIFT PHYSICIST'
      : 'CERN FELLOW';

  const jumpRandomUnsolved = () => {
    playTemPadClick();
    const unsolved = ALL_MODULE_IDS.filter((id) => !settledBets[id] && id !== activeModule);
    const pool = unsolved.length > 0 ? unsolved : ALL_MODULE_IDS;
    const next = pool[Math.floor(Math.random() * pool.length)];
    if (next) onSelectModule(next);
  };

  return (
    <section
      aria-label="ELI5 Breakdown and Physics Prediction Bet Arena"
      className="bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#FFE600] p-4 lg:p-5 space-y-4"
    >
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-[#FFE600] text-black font-mono font-black text-xs border-2 border-black flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>INTERACTIVE ELI5 + PHYSICS BET ARENA</span>
          </span>
          <span className="px-2 py-0.5 bg-canvas-surface text-cern-cyan font-mono font-bold text-[11px] border border-black">
            {rank}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 bg-black text-[#00FF66] font-black border-2 border-black flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
            <span>{betCredits} BEAM CREDITS</span>
          </span>
          <span className="px-2.5 py-1 bg-black text-amber-300 font-black border-2 border-black flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{betStreak}x STREAK</span>
          </span>
          <button
            type="button"
            onClick={jumpRandomUnsolved}
            className="px-2.5 py-1 bg-cern-blue hover:bg-cern-accent text-white font-bold border-2 border-black flex items-center gap-1 cursor-pointer"
            title="Jump to another lab's prediction bet challenge"
          >
            <Shuffle className="w-3.5 h-3.5 text-cern-cyan" />
            <span>Next Bet Challenge</span>
          </button>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="px-2 py-1 bg-canvas-surface hover:bg-canvas-raised text-white font-bold border-2 border-black flex items-center gap-1 cursor-pointer"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{expanded ? 'Hide' : 'Show'}</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 6 cols: Interactive Plain-English ELI5 Story + Myth Buster */}
          <div className="lg:col-span-6 space-y-3">
            <div className="p-3.5 bg-amber-300 text-black border-2 border-black shadow-[4px_4px_0px_#000] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-black uppercase bg-black text-amber-300 px-2 py-0.5">
                  👶 PLAIN-ENGLISH ELI5 ({eli5Mode ? 'ACTIVE' : 'ALWAYS ON HERE'})
                </span>
              </div>
              <h3 className="text-base font-display font-black leading-tight">{spec.headline}</h3>
              <p className="text-xs sm:text-sm font-sans font-bold leading-relaxed text-black/90">
                {spec.kidAnalogy}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {spec.steps.map((st, idx) => (
                  <div key={st.label} className="p-2 bg-amber-200 border-2 border-black text-xs">
                    <div className="font-mono font-black text-[10px] uppercase text-amber-900">
                      {idx + 1}. {st.label}
                    </div>
                    <p className="font-sans text-[11px] leading-snug mt-0.5 text-black">{st.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-red-950/80 border-2 border-black text-red-100 space-y-1">
                <div className="text-[10px] font-mono font-black uppercase text-red-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Common Myth
                </div>
                <p className="font-sans text-xs">&ldquo;{spec.myth}&rdquo;</p>
              </div>
              <div className="p-2.5 bg-emerald-950/80 border-2 border-black text-emerald-100 space-y-1">
                <div className="text-[10px] font-mono font-black uppercase text-emerald-300 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Real Physics
                </div>
                <p className="font-sans text-xs">{spec.reality}</p>
              </div>
            </div>
          </div>

          {/* Right 6 cols: Interactive Prediction Bet Box */}
          <div className="lg:col-span-6 p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-2">
                <span className="text-xs font-mono font-black uppercase text-[#FFE600] flex items-center gap-1.5">
                  🎯 PREDICT BEFORE TESTING BELOW
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span className="text-text-muted">Wager:</span>
                  {[10, 25, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={Boolean(settled)}
                      onClick={() => setWager(amt)}
                      className={`px-2 py-0.5 font-black border border-black cursor-pointer ${
                        wager === amt
                          ? 'bg-[#FFE600] text-black'
                          : 'bg-canvas-sub text-white hover:bg-zinc-800 disabled:opacity-45'
                      }`}
                    >
                      {amt}⚡
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm font-sans font-bold text-white leading-snug">
                {spec.betQuestion}
              </p>

              <div className="space-y-2">
                {spec.options.map((opt, idx) => {
                  const isPicked = settled?.picked === idx;
                  const isCorrect = idx === spec.correctIndex;
                  let cls = 'bg-canvas-sub hover:bg-canvas-raised border-black text-white';
                  if (settled) {
                    if (isCorrect) cls = 'bg-emerald-950 border-emerald-400 text-emerald-200';
                    else if (isPicked) cls = 'bg-red-950 border-red-400 text-red-200';
                    else cls = 'bg-black/60 border-zinc-800 text-zinc-500';
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={Boolean(settled)}
                      onClick={() => {
                        placePhysicsBet(spec.id, idx, spec.correctIndex, wager);
                        if (idx === spec.correctIndex) {
                          playDiscoveryChime();
                        } else {
                          playTemPadClick();
                        }
                      }}
                      className={`w-full text-left p-2.5 border-2 font-sans text-xs font-bold flex items-center justify-between gap-2 transition-colors ${cls} ${
                        !settled ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span>
                        <strong className="font-mono text-[#FFE600] mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </strong>
                        {opt}
                      </span>
                      {settled && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {settled && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {settled ? (
              <div
                aria-live="polite"
                className={`p-3 border-2 text-xs font-sans space-y-1 ${
                  settled.won
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
                    : 'bg-amber-950/90 border-amber-400 text-amber-100'
                }`}
              >
                <div className="font-mono font-black uppercase">
                  {settled.won
                    ? `🏆 PREDICTION WON (+${settled.wager}⚡ BEAM CREDITS!)`
                    : `📉 WAGER LOST (-${settled.wager}⚡) — VERIFIED PHYSICS PROOF:`}
                </div>
                <p>{spec.winExplanation}</p>
                <p className="text-[11px] font-mono text-cern-cyan pt-1">
                  🧪 Try it live: {spec.experimentPrompt}
                </p>
              </div>
            ) : (
              <div className="p-2.5 bg-canvas-sub border border-black text-[11px] font-mono text-text-muted flex items-center justify-between">
                <span>Pick A, B, or C to double your staked ⚡ credits</span>
                {totalSettledCount > 0 && (
                  <button
                    type="button"
                    onClick={resetBets}
                    className="underline hover:text-white cursor-pointer"
                  >
                    Reset Bank ({totalSettledCount} played)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
