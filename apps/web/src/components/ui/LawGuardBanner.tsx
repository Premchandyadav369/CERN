'use client';

import React from 'react';
import { MathFormula } from '@/components/ui/MathFormula';
import { ShieldAlert, Ban, Flame, Baby, Cpu } from 'lucide-react';

interface LawGuardBannerProps {
  lawName: string;
  severity?: 'VIOLATION' | 'WARNING';
  whatHappens: string;
  eli5Explanation: string;
  technicalExplanation: string;
  formulaTex?: string;
}

/**
 * Reusable Physical Law Interlock callout displaying both ELI5 intuition
 * and technical/KaTeX proof whenever a user pushes past fundamental physics limits.
 */
export const LawGuardBanner: React.FC<LawGuardBannerProps> = ({
  lawName,
  severity = 'VIOLATION',
  whatHappens,
  eli5Explanation,
  technicalExplanation,
  formulaTex,
}) => {
  const isViolation = severity === 'VIOLATION';

  return (
    <div
      role="alert"
      className={`p-4 border-3 border-black space-y-3 ${
        isViolation
          ? 'bg-[#21070F] shadow-[5px_5px_0px_#FF0055]'
          : 'bg-[#1D1505] shadow-[5px_5px_0px_#FFE600]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-2">
        <div className="flex items-center gap-2">
          {isViolation ? (
            <Ban className="w-4 h-4 text-cern-magenta shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-[#FFE600] shrink-0" />
          )}
          <span
            className={`px-2 py-0.5 text-[10px] font-mono font-black uppercase border border-black ${
              isViolation ? 'bg-cern-magenta text-white' : 'bg-[#FFE600] text-black'
            }`}
          >
            {isViolation ? 'LAW VIOLATION INTERLOCKED' : 'HARD PHYSICAL LIMIT'}
          </span>
          <strong className="font-display font-black text-sm text-white uppercase">
            {lawName}
          </strong>
        </div>
      </div>

      {/* Physical Consequence */}
      <div className="p-2.5 bg-black/70 border border-black text-xs font-mono text-amber-200 flex items-start gap-2">
        <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-black text-white uppercase mr-1.5">What Happens Physically:</span>
          <span>{whatHappens}</span>
        </div>
      </div>

      {/* Dual Explanation: ELI5 + Technical */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
          <div className="flex items-center gap-1.5 font-mono font-black text-[11px] text-cern-cyan uppercase">
            <Baby className="w-3.5 h-3.5" /> ELI5 (Simple Intuition)
          </div>
          <p className="text-text-secondary font-sans leading-relaxed">{eli5Explanation}</p>
        </div>

        <div className="p-3 bg-canvas-sub border-2 border-black space-y-1.5">
          <div className="flex items-center gap-1.5 font-mono font-black text-[11px] text-[#FFE600] uppercase">
            <Cpu className="w-3.5 h-3.5" /> Technical Proof &amp; Boundary
          </div>
          <p className="text-text-secondary font-sans leading-relaxed">{technicalExplanation}</p>
          {formulaTex && (
            <div className="pt-1">
              <MathFormula tex={formulaTex} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
