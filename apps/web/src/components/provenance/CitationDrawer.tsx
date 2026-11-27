'use client';

import React, { useEffect } from 'react';
import { useGlobalStore } from '@/lib/store';
import { getManifestRecord } from '@/lib/manifest';
import { MathFormula } from '@/components/ui/MathFormula';
import { X, ExternalLink, ShieldCheck, AlertTriangle, FileCode } from 'lucide-react';

export const CitationDrawer: React.FC = () => {
  const isOpen = useGlobalStore((s) => s.citationDrawerOpen);
  const setIsOpen = useGlobalStore((s) => s.setCitationDrawerOpen);
  const activeId = useGlobalStore((s) => s.activeManifestId);
  const setActiveId = useGlobalStore((s) => s.setActiveManifestId);

  const handleClose = () => {
    setIsOpen(false);
    setActiveId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !activeId) return null;

  const record = getManifestRecord(activeId);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg h-full bg-canvas-surface border-l-3 border-black p-6 overflow-y-auto shadow-[-8px_0px_0px_0px_#000] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b-3 border-black">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-1 text-xs font-mono font-bold uppercase border-2 border-black shadow-[3px_3px_0px_#000] ${
                    record?.dataClass === 'REAL'
                      ? 'bg-emerald-400 text-black shadow-[3px_3px_0px_#00FF66]'
                      : record?.dataClass === 'PUBLISHED'
                      ? 'bg-cern-cyan text-black shadow-[3px_3px_0px_#00E5FF]'
                      : 'bg-amber-400 text-black shadow-[3px_3px_0px_#FFE600]'
                  }`}
                >
                  {record?.dataClass} DATA
                </span>
                <span className="text-xs text-text-muted font-mono font-bold uppercase tracking-wider px-2 py-0.5 border-2 border-black bg-canvas-sub shadow-[2px_2px_0px_#000]">
                  {record?.sourceTier}
                </span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-white">
                {record?.title || 'Scientific Provenance Record'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 border-2 border-black bg-canvas-sub hover:bg-cern-red text-white transition-all shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Record Details */}
          {record ? (
            <div className="mt-6 space-y-4 text-xs font-mono">
              {/* Manifest Key */}
              <div className="p-3 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000]">
                <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">
                  Manifest Key
                </label>
                <div className="text-cern-cyan font-bold break-all">
                  {record.id}
                </div>
              </div>

              {/* Source Link */}
              <div className="p-3 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000]">
                <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">
                  Canonical Source URL &amp; Record
                </label>
                <a
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-canvas-raised hover:bg-black border-2 border-black text-white text-xs transition-all group shadow-[3px_3px_0px_#000] hover:shadow-[3px_3px_0px_#00E5FF]"
                >
                  <span className="truncate pr-2 font-mono">{record.sourceUrl}</span>
                  <ExternalLink className="w-4 h-4 shrink-0 text-cern-cyan group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {record.doiOrRecordId && (
                <div className="p-3 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000]">
                  <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">
                    DOI / Document Identifier
                  </label>
                  <div className="text-text-secondary font-bold">
                    {record.doiOrRecordId}
                  </div>
                </div>
              )}

              {/* Formula */}
              {record.formula && (
                <div className="p-3 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000]">
                  <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">
                    Physics Equation / Formula
                  </label>
                  <div className="p-2.5 bg-black border-2 border-black shadow-[3px_3px_0px_#FFE600]">
                    <MathFormula tex={record.formula} displayMode />
                  </div>
                </div>
              )}

              {/* Known Limitations */}
              <div className="p-3.5 bg-amber-400 border-2 border-black shadow-[4px_4px_0px_#000] text-black">
                <label className="text-xs uppercase font-extrabold flex items-center gap-1.5 mb-1.5 text-black">
                  <AlertTriangle className="w-4 h-4" /> Known Limitations &amp; Methodology
                </label>
                <p className="font-sans text-xs text-black font-medium leading-relaxed">
                  {record.knownLimitations}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000]">
                  <span className="text-[10px] text-text-muted uppercase block font-bold">Retrieval Date</span>
                  <span className="text-white font-bold">{record.retrievalDate}</span>
                </div>
                <div className="p-2.5 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000]">
                  <span className="text-[10px] text-text-muted uppercase block font-bold">Licence</span>
                  <span className="text-white font-bold">{record.license}</span>
                </div>
              </div>

              {record.transformScript && (
                <div className="p-2.5 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cern-cyan shrink-0" />
                  <span className="text-text-muted text-[11px] truncate font-bold">Script: {record.transformScript}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 p-6 text-center text-text-muted border-2 border-dashed border-black bg-canvas-sub shadow-[3px_3px_0px_#000] font-mono text-xs">
              RECORD NOT FOUND IN CRYPTOGRAPHIC MANIFEST.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t-3 border-black text-xs font-mono text-text-muted">
          <p className="leading-relaxed font-bold">
            CERN-X STRICT PROVENANCE POLICY: EVERY NUMBER RENDERED IS TRACEABLE TO AN OFFICIAL RECORD.
          </p>
        </div>
      </div>
    </div>
  );
};
