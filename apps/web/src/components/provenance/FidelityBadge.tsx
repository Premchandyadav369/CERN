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
        return 'bg-blue-950/60 text-blue-300 border-blue-500/40 hover:border-blue-400';
      case 'MONTE CARLO':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/40 hover:border-purple-400';
      case 'TOY':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:border-amber-400';
      case 'ILLUSTRATIVE':
        return 'bg-zinc-900/80 text-zinc-400 border-zinc-600/40 hover:border-zinc-400';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
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
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono font-medium rounded-full border transition-colors cursor-help ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {type}
    </span>
  );
};
