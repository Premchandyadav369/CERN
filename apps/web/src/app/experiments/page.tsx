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
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <span className="inline-block px-2.5 py-1 bg-cern-accent text-white font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider mb-3">
          /// RESEARCH PROGRAMME CATALOGUE ///
        </span>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
          CERN Experimental Ecosystem
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
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
            className={`px-3.5 py-2 border-2 border-black font-mono font-bold uppercase transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] ${
              filterTier === tier
                ? 'bg-cern-blue text-white shadow-[4px_4px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[3px_3px_0px_#000] hover:bg-canvas-raised'
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
            className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#00E5FF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <span className="text-xs font-mono font-bold text-cern-cyan px-2 py-0.5 bg-black border-2 border-black shadow-[2px_2px_0px_#000]">
                  {exp.accelerator}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000] font-bold uppercase ${
                    exp.tier === 'DEEP'
                      ? 'bg-purple-400 text-black shadow-[2px_2px_0px_#FF0055]'
                      : exp.tier === 'INTERACTIVE'
                      ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#00E5FF]'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {exp.tier} TIER
                </span>
              </div>

              <h2 className="text-xl font-display font-extrabold text-white">{exp.name}</h2>

              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted block mb-1 font-bold">
                  Scientific Question
                </span>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  {exp.scientificQuestion}
                </p>
              </div>

              {exp.location && (
                <div className="text-[11px] font-mono text-text-muted font-bold">
                  Location: <span className="text-text-primary">{exp.location}</span>
                </div>
              )}

              {/* Subdetectors count */}
              {exp.subdetectors && (
                <div className="pt-2 border-t-2 border-black">
                  <span className="text-[10px] font-mono uppercase text-text-muted block mb-1.5 font-bold">
                    Subsystems &amp; Instrumentation
                  </span>
                  <div className="space-y-1">
                    {exp.subdetectors.slice(0, 2).map((sub) => (
                      <div key={sub.name} className="text-[11px] font-mono text-text-secondary truncate">
                        • {sub.name}
                      </div>
                    ))}
                    {exp.subdetectors.length > 2 && (
                      <div className="text-[10px] font-mono text-cern-cyan font-bold">
                        + {exp.subdetectors.length - 2} more subsystems
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs font-mono">
              <a
                href={exp.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-text-muted hover:text-white flex items-center gap-1 text-[11px] font-bold"
              >
                <span>CERN Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {exp.tier === 'DEEP' || exp.id === 'cms' ? (
                <Link
                  href={`/detectors?detector=${exp.id === 'cms' ? 'cms' : 'atlas'}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-cern-blue hover:bg-cern-accent border-2 border-black shadow-[2px_2px_0px_#000] text-white font-bold transition-all text-xs"
                >
                  <span>Open Twin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : exp.id === 'antimatter-factory' ? (
                <Link
                  href="/simulations?module=antimatter"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-cern-magenta hover:bg-pink-600 border-2 border-black shadow-[2px_2px_0px_#000] text-white font-bold transition-all text-xs"
                >
                  <span>ALPHA-g Sim</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : exp.id === 'awake' ? (
                <Link
                  href="/simulations?module=awake"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-cern-blue hover:bg-cern-accent border-2 border-black shadow-[2px_2px_0px_#000] text-white font-bold transition-all text-xs"
                >
                  <span>Wakefield Sim</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : exp.id === 'alice' ? (
                <Link
                  href="/simulations?module=alice"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 border-2 border-black shadow-[2px_2px_0px_#000] text-black font-bold transition-all text-xs"
                >
                  <span>QGP Flow Sim</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : exp.id === 'lhcb' ? (
                <Link
                  href="/simulations?module=lhcb"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 border-2 border-black shadow-[2px_2px_0px_#000] text-white font-bold transition-all text-xs"
                >
                  <span>R_K Decay Sim</span>
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
