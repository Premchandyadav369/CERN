'use client';

import React, { useState } from 'react';
import { useGlobalStore } from '@/lib/store';
import { getManifestRecord } from '@/lib/manifest';
import { ExternalLink, Info, ShieldCheck } from 'lucide-react';

interface ValueProps {
  manifestId: string;
  value: number | string;
  unit?: string;
  digits?: number;
  label?: string;
  className?: string;
}

export const Value: React.FC<ValueProps> = ({
  manifestId,
  value,
  unit,
  digits,
  label,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const dataClassOverlay = useGlobalStore((s) => s.dataClassOverlay);
  const setActiveManifestId = useGlobalStore((s) => s.setActiveManifestId);

  const record = getManifestRecord(manifestId);

  const formattedValue =
    typeof value === 'number' && digits !== undefined
      ? value.toLocaleString('en-US', {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        })
      : value;

  const dataClassColor = () => {
    if (!record) return 'text-text-primary border-zinc-800';
    switch (record.dataClass) {
      case 'REAL':
        return dataClassOverlay
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/80 ring-1 ring-emerald-500/50'
          : 'text-emerald-400 hover:text-emerald-300 border-transparent';
      case 'PUBLISHED':
        return dataClassOverlay
          ? 'bg-blue-950/40 text-blue-300 border-blue-500/80 ring-1 ring-blue-500/50'
          : 'text-blue-300 hover:text-blue-200 border-transparent';
      case 'COMPUTED':
        return dataClassOverlay
          ? 'bg-amber-950/40 text-amber-300 border-amber-500/80 ring-1 ring-amber-500/50'
          : 'text-amber-300 hover:text-amber-200 border-transparent';
      default:
        return 'text-text-primary border-transparent';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveManifestId(manifestId);
  };

  return (
    <span
      className={`relative inline-flex items-baseline gap-1 font-mono cursor-pointer group transition-all duration-150 border-b border-dotted px-1 py-0.5 rounded ${dataClassColor()} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="button"
      tabIndex={0}
      title="Click to view verified scientific source and provenance"
    >
      {label && <span className="text-xs text-text-muted font-sans mr-0.5">{label}:</span>}
      <span className="font-semibold tabular-nums tracking-tight">{formattedValue}</span>
      {unit && <span className="text-xs text-text-muted">{unit}</span>}

      {/* Mini Inspector Popover */}
      {showTooltip && record && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-canvas-raised border border-canvas-borderStrong rounded-panel shadow-2xl z-50 text-left font-sans text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-1 pb-1.5 mb-1.5 border-b border-canvas-border">
            <span className="font-semibold text-text-primary truncate">{record.title}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                record.dataClass === 'REAL'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : record.dataClass === 'PUBLISHED'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {record.dataClass}
            </span>
          </div>

          <p className="text-text-secondary text-[11px] mb-2 leading-relaxed">
            {record.knownLimitations}
          </p>

          <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-1 border-t border-canvas-border">
            <span>Tier: {record.sourceTier.replace('T', '').replace('_', ' ')}</span>
            <span className="flex items-center gap-1 text-cern-accent">
              Click to view source <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      )}
    </span>
  );
};
