'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGlobalStore } from '@/lib/store';
import { getLabEli5AndBet } from '@/data/eli5AndBets';
import { playDiscoveryChime, playTemPadClick } from '@/lib/sonifier';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink,
  Sparkles,
  Trophy,
  Zap,
  Flame,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export interface Eli5CardProps {
  title: string;
  analogy: string;
  keyPoints?: string[];
  whatToTry?: string;
  badgeText?: string;
  className?: string;
  forceShow?: boolean;
  arxivId?: string;
  doi?: string;
  citationLabel?: string;
  betContextId?: string;
}

export const Eli5Card: React.FC<Eli5CardProps> = ({
  title,
  analogy,
  keyPoints,
  whatToTry,
  badgeText = "👶 ELI5 • EXPLAIN LIKE I'M 5",
  className = '',
  forceShow,
  arxivId,
  doi,
  citationLabel,
  betContextId,
}) => {
  const eli5Mode = useGlobalStore((s) => s.eli5Mode);
  const toggleEli5Mode = useGlobalStore((s) => s.toggleEli5Mode);
  const betCredits = useGlobalStore((s) => s.betCredits);
  const betStreak = useGlobalStore((s) => s.betStreak);
  const settledBets = useGlobalStore((s) => s.settledBets);
  const placePhysicsBet = useGlobalStore((s) => s.placePhysicsBet);
  const hydrateBets = useGlobalStore((s) => s.hydrateBets);

  const [collapsed, setCollapsed] = useState(false);
  const [innerTab, setInnerTab] = useState<'story' | 'bet' | 'myth'>('story');
  const [wager, setWager] = useState<number>(25);
  const [resolvedCtxId, setResolvedCtxId] = useState<string>(betContextId || 'default');

  useEffect(() => {
    hydrateBets();
    if (betContextId) {
      setResolvedCtxId(betContextId);
      return;
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mod = params.get('module');
      if (mod) {
        setResolvedCtxId(mod);
      } else if (window.location.pathname.includes('engineering')) {
        setResolvedCtxId('engineering');
      } else if (window.location.pathname.includes('detectors')) {
        setResolvedCtxId('collision-director');
      }
    }
  }, [betContextId, hydrateBets]);

  const spec = getLabEli5AndBet(resolvedCtxId);
  const betKey = `${spec.id}:${title.slice(0, 24)}`;
  const settled = settledBets[betKey] || settledBets[spec.id];

  const isGloballyActive = forceShow ?? eli5Mode;

  if (!isGloballyActive) {
    return (
      <div className={`my-3 ${className}`}>
        <button
          type="button"
          onClick={toggleEli5Mode}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-300 hover:bg-amber-400 text-black border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          title="Click to view intuitive ELI5 analogy & Physics Bet"
        >
          <span>👶</span>
          <span>Open ELI5 Story &amp; Bet:</span>
          <span className="underline italic">{title}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative border-3 border-black bg-amber-300 text-black shadow-[4px_4px_0px_#000] p-4 font-mono transition-all my-3 ${className}`}
      role="region"
      aria-label={`ELI5 Interactive Analogy and Bet: ${title}`}
    >
      {/* Top Banner & Interactive Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black/40">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-amber-300 font-bold text-xs uppercase tracking-wider border-2 border-black">
            {badgeText}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-[#00FF66] font-black text-[11px] border border-black">
            <Zap className="w-3 h-3 text-[#FFE600]" />
            <span>{betCredits} Credits</span>
            {betStreak > 0 && (
              <span className="ml-1 text-amber-300 flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-orange-400" /> {betStreak}x
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div role="tablist" aria-label="ELI5 View Mode" className="flex items-center gap-1">
            {[
              { id: 'story' as const, label: '💡 3-Step Story' },
              { id: 'bet' as const, label: settled ? '🏆 Bet Settled' : '🎯 Physics Bet' },
              { id: 'myth' as const, label: '🧠 Myth Buster' },
            ].map((t) => {
              const selected = innerTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    playTemPadClick();
                    setInnerTab(t.id);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-black border-2 border-black cursor-pointer transition-colors ${
                    selected
                      ? 'bg-black text-[#FFE600] border-b-4 border-b-[#00E5FF]'
                      : 'bg-amber-200 hover:bg-amber-400 text-black'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-amber-400 hover:bg-amber-500 border-2 border-black cursor-pointer"
            title={collapsed ? 'Expand explanation' : 'Minimize explanation'}
          >
            {collapsed ? (
              <>
                <span>Expand</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Collapse</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Panels */}
      {!collapsed && (
        <div className="pt-3 space-y-3">
          {innerTab === 'story' && (
            <div role="tabpanel" aria-label="3-Step ELI5 Story" className="space-y-3">
              <div>
                <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
                  <span>💡</span> {title}
                </h4>
                <p className="mt-1.5 text-sm sm:text-base font-sans font-bold leading-relaxed text-black/95">
                  {analogy}
                </p>
              </div>

              {/* 3-Step Visual Chain from Lab Registry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {spec.steps.map((st, idx) => (
                  <div
                    key={st.label}
                    className="p-2.5 bg-black/90 text-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.4)] space-y-1"
                  >
                    <div className="text-[10px] font-black uppercase text-[#FFE600] tracking-wider">
                      STEP {idx + 1} · {st.label}
                    </div>
                    <p className="text-xs font-sans text-slate-200 leading-snug">{st.detail}</p>
                  </div>
                ))}
              </div>

              {keyPoints && keyPoints.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  {keyPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-amber-200/90 border-2 border-black text-xs font-sans text-black leading-snug flex items-start gap-2 shadow-[2px_2px_0px_#000]"
                    >
                      <span className="font-mono font-extrabold text-amber-900 bg-amber-300 w-5 h-5 flex items-center justify-center border border-black shrink-0">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {whatToTry && (
                <div className="p-2.5 bg-black text-amber-300 border-2 border-black text-xs font-mono font-bold flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                  <span className="text-sm">🎮</span>
                  <span>
                    <strong className="text-white uppercase tracking-wider mr-1.5">Try This:</strong>
                    {whatToTry}
                  </span>
                </div>
              )}
            </div>
          )}

          {innerTab === 'bet' && (
            <div role="tabpanel" aria-label="Interactive Physics Prediction Bet" className="p-3 bg-black text-white border-2 border-black space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-700 pb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#FFE600]" />
                  <span className="text-xs font-black uppercase text-[#FFE600]">
                    PREDICT THE CERN EXPERIMENT &amp; WAGER BEAM CREDITS
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-zinc-400">Stake:</span>
                  {[10, 25, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={Boolean(settled)}
                      onClick={() => setWager(amt)}
                      className={`px-2 py-0.5 font-black border border-black cursor-pointer ${
                        wager === amt
                          ? 'bg-[#FFE600] text-black'
                          : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-50'
                      }`}
                    >
                      {amt}⚡
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm font-sans font-bold text-white">{spec.betQuestion}</p>

              <div className="grid grid-cols-1 gap-2">
                {spec.options.map((opt, idx) => {
                  const isPicked = settled?.picked === idx;
                  const isCorrect = idx === spec.correctIndex;
                  let cls = 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white';
                  if (settled) {
                    if (isCorrect) cls = 'bg-emerald-950 border-emerald-400 text-emerald-200';
                    else if (isPicked) cls = 'bg-red-950 border-red-400 text-red-200';
                    else cls = 'bg-zinc-950 border-zinc-800 text-zinc-500';
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

              {settled && (
                <div
                  aria-live="polite"
                  className={`p-2.5 border-2 text-xs font-sans ${
                    settled.won
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100'
                      : 'bg-amber-950/80 border-amber-400 text-amber-100'
                  }`}
                >
                  <strong className="font-mono uppercase mr-1.5">
                    {settled.won ? `🏆 WON +${settled.wager}⚡!` : `📉 LOST -${settled.wager}⚡:`}
                  </strong>
                  {spec.winExplanation}
                </div>
              )}
            </div>
          )}

          {innerTab === 'myth' && (
            <div role="tabpanel" aria-label="Myth vs CERN Reality" className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="p-3 bg-red-950 text-red-100 border-2 border-black space-y-1">
                <div className="text-[10px] font-black uppercase text-red-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Common Sci-Fi Myth
                </div>
                <p className="text-xs font-sans font-bold leading-relaxed">&ldquo;{spec.myth}&rdquo;</p>
              </div>
              <div className="p-3 bg-emerald-950 text-emerald-100 border-2 border-black space-y-1">
                <div className="text-[10px] font-black uppercase text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Real CERN Physics
                </div>
                <p className="text-xs font-sans font-bold leading-relaxed">{spec.reality}</p>
              </div>
            </div>
          )}

          {/* Scientific Grounding & Literature Links */}
          {(arxivId || doi || citationLabel) && (
            <div className="pt-2 border-t-2 border-black/30 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-black font-bold">
                <BookOpen className="w-3.5 h-3.5 text-black" />
                <span className="text-[11px] uppercase tracking-wider text-black/75">Scientific Grounding:</span>
                {citationLabel && (
                  <span className="font-sans text-xs font-extrabold text-black">{citationLabel}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {arxivId && (
                  <a
                    href={`https://arxiv.org/abs/${arxivId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-amber-300 hover:bg-neutral-800 text-[11px] font-bold border border-black"
                    title={`Open preprint arXiv:${arxivId}`}
                  >
                    <span>arXiv:{arxivId}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>
                )}
                {doi && (
                  <a
                    href={`https://doi.org/${doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 hover:bg-amber-500 text-black text-[11px] font-bold border border-black"
                    title={`Open peer-reviewed publisher DOI: ${doi}`}
                  >
                    <span>DOI</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>
                )}
                <Link
                  href="/simulations?module=literature"
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-cern-blue hover:bg-cern-accent text-white text-[11px] font-bold border border-black"
                  title="View full peer-reviewed papers & experimental benchmarks"
                >
                  <Sparkles className="w-3 h-3 text-cern-cyan" />
                  <span>Research Bridge</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
