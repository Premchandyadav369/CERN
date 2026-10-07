'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import experimentsData from '../../../../../content/experiments.json';
import { Value } from '@/components/provenance/Value';
import { ExternalLink, Layers, ArrowRight, Eye, Atom, CheckCircle2 } from 'lucide-react';

export default function ExperimentsPage() {
  const [filterTier, setFilterTier] = useState<string>('ALL');

  const filteredExperiments =
    filterTier === 'ALL'
      ? experimentsData
      : experimentsData.filter((exp) => exp.tier === filterTier);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase text-cern-accent font-bold tracking-wider">
          RESEARCH PROGRAMME CATALOGUE
        </span>
        <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
          CERN Experimental Ecosystem
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-3xl leading-relaxed">
          CERN&apos;s experimental programme extends far beyond the LHC, spanning the four flagship
          detectors, forward particle search experiments, the Antimatter Factory, radioactive isotope
          spectroscopy, and advanced plasma acceleration.
        </p>
      </div>

      {/* Tier Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
        {['ALL', 'DEEP', 'INTERACTIVE', 'KNOWLEDGE'].map((tier) => (
          <button
            key={tier}
            onClick={() => setFilterTier(tier)}
            className={`px-3 py-1.5 rounded border transition-colors ${
              filterTier === tier
                ? 'bg-cern-blue border-cern-accent text-white font-bold'
                : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {tier === 'ALL' ? 'All Experiments' : `${tier} Fidelity Tier`}
          </button>
        ))}
      </div>

      {/* Experiment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiments.map((exp) => (
          <div
            key={exp.id}
            className="p-5 bg-canvas-surface border border-canvas-border rounded-panel flex flex-col justify-between space-y-4 hover:border-canvas-borderStrong transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cern-cyan">{exp.accelerator}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    exp.tier === 'DEEP'
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                      : exp.tier === 'INTERACTIVE'
                      ? 'bg-blue-950/60 text-blue-300 border border-blue-500/40'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {exp.tier} TIER
                </span>
              </div>

              <h2 className="text-lg font-display font-bold text-text-primary">{exp.name}</h2>

              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted block mb-0.5 font-semibold">
                  Scientific Question
                </span>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {exp.scientificQuestion}
                </p>
              </div>

              {exp.location && (
                <div className="text-[11px] font-mono text-text-muted">
                  Location: <span className="text-text-secondary">{exp.location}</span>
                </div>
              )}

              {/* Subdetectors count */}
              {exp.subdetectors && (
                <div className="pt-2 border-t border-canvas-border">
                  <span className="text-[10px] font-mono uppercase text-text-muted block mb-1 font-semibold">
                    Subsystems &amp; Instrumentation
                  </span>
                  <div className="space-y-1">
                    {exp.subdetectors.slice(0, 2).map((sub) => (
                      <div key={sub.name} className="text-[11px] font-mono text-text-secondary truncate">
                        • {sub.name}
                      </div>
                    ))}
                    {exp.subdetectors.length > 2 && (
                      <div className="text-[10px] font-mono text-text-muted">
                        + {exp.subdetectors.length - 2} more subsystems
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-canvas-border flex items-center justify-between text-xs font-mono">
              <a
                href={exp.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cern-accent hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>CERN Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {exp.tier === 'DEEP' || exp.id === 'cms' ? (
                <Link
                  href={`/detectors?detector=${exp.id === 'cms' ? 'cms' : 'atlas'}`}
                  className="flex items-center gap-1 text-cern-cyan hover:underline font-semibold"
                >
                  <span>Open Twin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
