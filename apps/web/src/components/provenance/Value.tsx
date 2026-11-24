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
    if (!record) return 'text-text-primary border-2 border-black bg-canvas-sub shadow-[2px_2px_0px_#000]';
    switch (record.dataClass) {
      case 'REAL':
        return dataClassOverlay
          ? 'bg-emerald-400 text-black font-bold border-2 border-black shadow-[3px_3px_0px_#00FF66]'
          : 'text-emerald-400 hover:text-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#00FF66] bg-canvas-sub';
      case 'PUBLISHED':
        return dataClassOverlay
          ? 'bg-cern-cyan text-black font-bold border-2 border-black shadow-[3px_3px_0px_#00E5FF]'
          : 'text-cern-cyan hover:text-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#00E5FF] bg-canvas-sub';
      case 'COMPUTED':
        return dataClassOverlay
          ? 'bg-amber-400 text-black font-bold border-2 border-black shadow-[3px_3px_0px_#FFE600]'
          : 'text-amber-300 hover:text-white border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#FFE600] bg-canvas-sub';
      default:
        return 'text-text-primary border-2 border-black bg-canvas-sub shadow-[2px_2px_0px_#000]';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveManifestId(manifestId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      setActiveManifestId(manifestId);
    }
  };

  return (
    <span
      className={`relative inline-flex items-baseline gap-1 font-mono cursor-pointer group transition-all duration-120 px-2 py-0.5 rounded-none active:translate-x-[1px] active:translate-y-[1px] ${dataClassColor()} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="button"
      tabIndex={0}
      title="Click to view verified scientific source and provenance"
    >
      {label && <span className="text-xs text-text-muted font-sans mr-0.5">{label}:</span>}
      <span className="font-bold tabular-nums tracking-tight">{formattedValue}</span>
      {unit && <span className="text-xs text-text-muted font-semibold">{unit}</span>}

      {/* Mini Inspector Popover */}
      {showTooltip && record && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-canvas-surface border-3 border-black rounded-none shadow-[6px_6px_0px_#000] z-50 text-left font-sans text-xs pointer-events-none animate-in fade-in duration-100">
          <div className="flex items-center justify-between gap-1 pb-1.5 mb-1.5 border-b-2 border-black bg-canvas-sub -mx-3 -mt-3 p-2.5">
            <span className="font-bold text-white truncate">{record.title}</span>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase border-2 border-black shadow-[1px_1px_0px_#000] ${
                record.dataClass === 'REAL'
                  ? 'bg-emerald-400 text-black'
                  : record.dataClass === 'PUBLISHED'
                  ? 'bg-cern-cyan text-black'
                  : 'bg-amber-400 text-black'
              }`}
            >
              {record.dataClass}
            </span>
          </div>

          <p className="text-text-secondary text-[11px] mb-2 leading-relaxed">
            {record.knownLimitations}
          </p>

          <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-2 border-t-2 border-black">
            <span className="font-semibold text-text-secondary">Tier: {record.sourceTier.replace('T', '').replace('_', ' ')}</span>
            <span className="flex items-center gap-1 text-cern-cyan font-bold">
              View Source →
            </span>
          </div>
        </div>
      )}
    </span>
  );
};
