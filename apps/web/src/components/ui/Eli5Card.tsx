'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGlobalStore } from '@/lib/store';
import { ChevronDown, ChevronUp, BookOpen, ExternalLink, Sparkles } from 'lucide-react';

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
}) => {
  const eli5Mode = useGlobalStore((s) => s.eli5Mode);
  const toggleEli5Mode = useGlobalStore((s) => s.toggleEli5Mode);
  const [collapsed, setCollapsed] = useState(false);

  // Directly controlled by eli5Mode (which synchronizes with userLevel === 'BEGINNER' by default),
  // allowing instant switching between ELI5 and standard telemetry in all levels.
  const isGloballyActive = forceShow ?? eli5Mode;

  // If not globally active, provide an opt-in button so users can still discover it
  if (!isGloballyActive) {
    return (
      <div className={`my-3 ${className}`}>
        <button
          onClick={toggleEli5Mode}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-300 hover:bg-amber-400 text-black border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          title="Click to view intuitive ELI5 analogy"
        >
          <span>👶</span>
          <span>View ELI5 Analogy:</span>
          <span className="underline italic">{title}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative border-3 border-black bg-amber-300 text-black shadow-[4px_4px_0px_#000] p-4 font-mono transition-all my-3 ${className}`}
      role="region"
      aria-label={`ELI5 Analogy: ${title}`}
    >
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black/40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-amber-300 font-bold text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
            {badgeText}
          </span>
          <span className="hidden sm:inline-block text-[11px] font-bold text-black/70 bg-amber-200 px-2 py-0.5 border border-black/30">
            Intuitive Mental Model
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-amber-400 hover:bg-amber-500 border border-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
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

      {/* Main Content */}
      {!collapsed && (
        <div className="pt-3 space-y-3">
          <div>
            <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
              <span className="text-lg">💡</span> {title}
            </h4>
            <p className="mt-1.5 text-sm sm:text-base font-sans font-bold leading-relaxed text-black/95">
              {analogy}
            </p>
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
                <strong className="text-white uppercase tracking-wider mr-1.5">Interactive Experiment:</strong>
                {whatToTry}
              </span>
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-amber-300 hover:bg-neutral-800 text-[11px] font-bold border border-black shadow-[1px_1px_0px_#000] transition-colors"
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 hover:bg-amber-500 text-black text-[11px] font-bold border border-black shadow-[1px_1px_0px_#000] transition-colors"
                    title={`Open peer-reviewed publisher DOI: ${doi}`}
                  >
                    <span>DOI</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>
                )}
                <Link
                  href="/simulations?module=literature"
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-cern-blue hover:bg-cern-accent text-white text-[11px] font-bold border border-black shadow-[1px_1px_0px_#000] transition-colors"
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
