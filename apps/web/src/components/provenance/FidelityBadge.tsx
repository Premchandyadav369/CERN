import React from 'react';
import { FidelityBadge as FidelityType } from '@cern-x/content-schema';

interface FidelityBadgeProps {
  type: FidelityType;
  formula?: string;
  className?: string;
}

export const FidelityBadge: React.FC<FidelityBadgeProps> = ({ type, formula, className = '' }) => {
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
        return formula
          ? `Closed-form exact physics formula: ${formula}`
          : 'Exact closed-form mathematical equations based on published physics laws.';
      case 'MONTE CARLO':
        return 'Stochastic simulation using seeded deterministic pseudo-random variables.';
      case 'TOY':
        return 'Educational simplification for qualitative physical intuition; not a detector response prediction.';
      case 'ILLUSTRATIVE':
        return 'Visual explanatory schematic; not quantitatively calibrated.';
    }
  };

  return (
    <span
      title={getExplanation()}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-none cursor-help transition-all active:translate-x-[1px] active:translate-y-[1px] ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-none bg-current opacity-90 border border-black/40" />
      {type}
    </span>
  );
};
