'use client';

import React from 'react';
import { GridSimulator } from '@/components/computing/GridSimulator';
import { Server, Database, Network, ShieldCheck } from 'lucide-react';

export default function ComputingPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase text-cern-cyan font-bold tracking-wider">
            DISTRIBUTED SYSTEMS &amp; EXASCALE COMPUTING
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            WLCG Specifications
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary">
          CERN Data Centre &amp; WLCG Grid
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-3xl leading-relaxed">
          The Worldwide LHC Computing Grid (WLCG) is the world&apos;s largest scientific distributed
          computing infrastructure. It processes, simulates, and analyzes more than 65 petabytes of LHC
          collision data each year across Tier-0, Tier-1, and Tier-2 data centres.
        </p>
      </div>

      {/* Main Interactive Simulator */}
      <section>
        <GridSimulator />
      </section>

      {/* Exascale HL-LHC Computing Challenge */}
      <section className="p-6 bg-canvas-surface border border-canvas-border rounded-panel space-y-4">
        <h2 className="text-lg font-display font-bold text-text-primary">
          The High-Luminosity LHC Computing Frontier
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-text-secondary leading-relaxed font-mono">
          <div className="p-4 bg-canvas-sub border border-canvas-border rounded space-y-1.5">
            <span className="text-cern-cyan font-bold text-sm block">Data Growth: 250+ PB/yr</span>
            <p className="text-text-muted font-sans text-xs">
              HL-LHC instantaneous luminosity increases pile-up to 140–200 collisions per crossing,
              causing event sizes and tracking combinatorics to surge exponentially.
            </p>
          </div>

          <div className="p-4 bg-canvas-sub border border-canvas-border rounded space-y-1.5">
            <span className="text-emerald-400 font-bold text-sm block">Tape Archival Storage</span>
            <p className="text-text-muted font-sans text-xs">
              Cold data sits on automated high-density magnetic tape cartridges inside CERN&apos;s Meyrin
              vaults, consuming zero electrical power while idle.
            </p>
          </div>

          <div className="p-4 bg-canvas-sub border border-canvas-border rounded space-y-1.5">
            <span className="text-amber-400 font-bold text-sm block">Heterogeneous Compute</span>
            <p className="text-text-muted font-sans text-xs">
              Migration of tracking and reconstruction algorithms to GPU coprocessors (such as LHCb Allen
              and CMS Patatrack) to sustain throughput under tight power envelopes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
