'use client';

import React from 'react';
import { useGlobalStore } from '@/lib/store';
import { getManifestRecord } from '@/lib/manifest';
import { X, ExternalLink, ShieldCheck, Database, Calendar, FileCode, AlertTriangle } from 'lucide-react';

export const CitationDrawer: React.FC = () => {
  const isOpen = useGlobalStore((s) => s.citationDrawerOpen);
  const setIsOpen = useGlobalStore((s) => s.setCitationDrawerOpen);
  const activeId = useGlobalStore((s) => s.activeManifestId);
  const setActiveId = useGlobalStore((s) => s.setActiveManifestId);

  if (!isOpen || !activeId) return null;

  const record = getManifestRecord(activeId);

  const handleClose = () => {
    setIsOpen(false);
    setActiveId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg h-full bg-canvas-surface border-l border-canvas-borderStrong p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-canvas-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                    record?.dataClass === 'REAL'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : record?.dataClass === 'PUBLISHED'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {record?.dataClass} DATA
                </span>
                <span className="text-xs text-text-muted font-mono">{record?.sourceTier}</span>
              </div>
              <h2 className="text-lg font-display font-semibold text-text-primary">
                {record?.title || 'Scientific Provenance Record'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-canvas-raised transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Record Details */}
          {record ? (
            <div className="mt-6 space-y-5 text-sm">
              {/* Manifest ID */}
              <div>
                <label className="text-xs text-text-muted uppercase font-mono block mb-1">
                  Manifest Key
                </label>
                <div className="p-2 bg-canvas-sub border border-canvas-border rounded font-mono text-xs text-cern-accent">
                  {record.id}
                </div>
              </div>

              {/* Source Link */}
              <div>
                <label className="text-xs text-text-muted uppercase font-mono block mb-1">
                  Canonical Source URL & Record
                </label>
                <a
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-canvas-raised hover:bg-canvas-sub border border-canvas-border rounded text-text-primary text-xs transition-colors group"
                >
                  <span className="truncate pr-2">{record.sourceUrl}</span>
                  <ExternalLink className="w-4 h-4 shrink-0 text-cern-accent group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {record.doiOrRecordId && (
                <div>
                  <label className="text-xs text-text-muted uppercase font-mono block mb-1">
                    DOI / Document Identifier
                  </label>
                  <div className="p-2 bg-canvas-sub border border-canvas-border rounded font-mono text-xs text-text-secondary">
                    {record.doiOrRecordId}
                  </div>
                </div>
              )}

              {/* Formula */}
              {record.formula && (
                <div>
                  <label className="text-xs text-text-muted uppercase font-mono block mb-1">
                    Physics Equation / Formula
                  </label>
                  <div className="p-2.5 bg-canvas-sub border border-canvas-border rounded font-mono text-xs text-amber-300">
                    {record.formula}
                  </div>
                </div>
              )}

              {/* Known Limitations */}
              <div>
                <label className="text-xs text-amber-400 uppercase font-mono flex items-center gap-1.5 mb-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Known Limitations & Methodology
                </label>
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded text-xs text-text-secondary leading-relaxed">
                  {record.knownLimitations}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 bg-canvas-sub border border-canvas-border rounded">
                  <span className="text-[11px] text-text-muted block">Retrieval Date</span>
                  <span className="font-mono text-xs text-text-secondary">{record.retrievalDate}</span>
                </div>
                <div className="p-2.5 bg-canvas-sub border border-canvas-border rounded">
                  <span className="text-[11px] text-text-muted block">Licence</span>
                  <span className="font-mono text-xs text-text-secondary">{record.license}</span>
                </div>
              </div>

              {record.transformScript && (
                <div>
                  <label className="text-xs text-text-muted uppercase font-mono block mb-1">
                    Processing Script
                  </label>
                  <div className="p-2 bg-canvas-sub border border-canvas-border rounded font-mono text-xs text-text-muted flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-cern-cyan" />
                    <span>{record.transformScript}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 text-center text-text-muted">
              Record not found in current manifest.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-canvas-border text-[11px] text-text-muted">
          <p>
            CERN-X strict provenance policy: Every number rendered on this site is traceable to an
            official, open-access, or reproducible computed record.
          </p>
        </div>
      </div>
    </div>
  );
};
