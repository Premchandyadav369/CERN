'use client';

import React, { useState } from 'react';
import { FidelityBadge as FidelityType } from '@cern-x/content-schema';
import { MathFormula } from '@/components/ui/MathFormula';

interface FidelityBadgeProps {
  type: FidelityType;
  formula?: string;
  className?: string;
}

export const FidelityBadge: React.FC<FidelityBadgeProps> = ({ type, formula, className = '' }) => {
  const [showFormula, setShowFormula] = useState(false);

  const getBadgeStyle = () => {
    switch (type) {
      case 'ANALYTIC':
        return 'bg-cern-blue text-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#00E5FF]';
      case 'MONTE CARLO':
        return 'bg-cern-magenta text-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#FF0055]';
      case 'TOY':
        return 'bg-cern-yellow text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#FFE600]';
      case 'ILLUSTRATIVE':
        return 'bg-zinc-800 text-zinc-100 border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#00FF66]';
      default:
        return 'bg-zinc-800 text-zinc-200 border-2 border-black shadow-[2px_2px_0px_#000]';
    }
  };

  const getExplanation = () => {
    switch (type) {
      case 'ANALYTIC':
        return 'Exact closed-form mathematical equations based on published physics laws.';
      case 'MONTE CARLO':
        return 'Stochastic simulation using seeded deterministic pseudo-random variables.';
      case 'TOY':
        return 'Educational simplification for qualitative physical intuition; not a detector response prediction.';
      case 'ILLUSTRATIVE':
        return 'Visual explanatory schematic; not quantitatively calibrated.';
    }
  };

  const hasTexFormula = Boolean(
    formula && /\\|=|\^|_/.test(formula)
  );

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      <span
        title={getExplanation()}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-none cursor-help transition-all ${getBadgeStyle()}`}
      >
        <span className="w-1.5 h-1.5 rounded-none bg-current opacity-90 border border-black/40" />
        {type}
      </span>
      {formula && (
        <button
          type="button"
          aria-expanded={showFormula}
          onClick={() => setShowFormula((v) => !v)}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-canvas-sub hover:bg-canvas-raised text-cern-cyan border-2 border-black font-mono text-[10px] font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
          title="Toggle live KaTeX physics equation"
        >
          <span>fx</span>
          <span>{showFormula ? 'Hide Law' : 'Equation'}</span>
        </button>
      )}
      {formula && showFormula && (
        <div className="w-full mt-1.5 p-2.5 bg-black border-2 border-black shadow-[3px_3px_0px_#00E5FF]">
          {hasTexFormula ? (
            <MathFormula tex={formula} displayMode />
          ) : (
            <span className="text-xs font-mono text-[#FFE600]">{formula}</span>
          )}
        </div>
      )}
    </span>
  );
};
