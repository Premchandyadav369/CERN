'use client';

import React from 'react';
import { GridSimulator } from '@/components/computing/GridSimulator';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { TechnicalTermDeck } from '@/components/ui/TechTermInfo';
import { Server, Database, Network, ShieldCheck } from 'lucide-react';

export default function ComputingPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono uppercase text-black font-bold tracking-wider px-2.5 py-1 bg-cern-cyan border-2 border-black shadow-[2px_2px_0px_#000]">
            DISTRIBUTED SYSTEMS &amp; EXASCALE COMPUTING
          </span>
          <span className="text-[10px] font-mono px-2 py-1 bg-emerald-400 text-black font-bold border-2 border-black shadow-[2px_2px_0px_#000]">
            WLCG Specifications
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
          CERN Data Centre &amp; WLCG Grid
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
          The Worldwide LHC Computing Grid (WLCG) is the world&apos;s largest scientific distributed
          computing infrastructure. It processes, simulates, and analyzes more than 65 petabytes of LHC
          collision data each year across Tier-0, Tier-1, and Tier-2 data centres.
        </p>
      </div>

      <Eli5Card
        title="How 170+ World Supercomputers Share 1 Petabyte of Data Every Second"
        analogy="Think of LHC collisions like 40 million ultra-HD photos taken every single second! No laptop—or even one building—can save all of them. So super-fast triggers delete 99.99% of boring background noise, and a worldwide library network (Tier-0 at CERN → Tier-1 national vaults → Tier-2 universities) lets scientists analyze discoveries anywhere on Earth!"
        keyPoints={[
          'Tier-0 (CERN Meyrin): First digital safety vault recording collision streams onto high-density magnetic tape & fiber.',
          'Tier-1 (13 National Labs): Permanent mirror backups connected over dedicated 100 Gbps optical links.',
          'Tier-2 (160+ Universities): Where PhD researchers run Monte Carlo event jobs on GPUs and CPUs.',
        ]}
        whatToTry="Simulate a sudden Tier-1 fiber outage or raise HL-LHC pile-up below to watch queue congestion spread across the grid!"
        doi="10.1088/1742-6596/331/1/012002"
        citationLabel="WLCG Collaboration, Worldwide LHC Computing Grid Technical Overview"
      />

      {/* Main Interactive Simulator */}
      <section>
        <GridSimulator />
      </section>

      {/* Exascale HL-LHC Computing Challenge */}
      <section className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-5">
        <div className="border-b-2 border-black pb-3">
          <h2 className="text-xl font-display font-extrabold text-white">
            The High-Luminosity LHC Computing Frontier
          </h2>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Key architectural paradigms scaling storage and throughput for HL-LHC data deluge.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-text-secondary leading-relaxed font-mono">
          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#00E5FF] space-y-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <span className="text-cern-cyan font-bold text-sm block">Data Growth: 250+ PB/yr</span>
            <p className="text-text-secondary font-sans text-xs">
              HL-LHC instantaneous luminosity increases pile-up to 140–200 collisions per crossing,
              causing event sizes and tracking combinatorics to surge exponentially.
            </p>
          </div>

          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#00FF66] space-y-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <span className="text-emerald-400 font-bold text-sm block">Tape Archival Storage</span>
            <p className="text-text-secondary font-sans text-xs">
              Cold data sits on automated high-density magnetic tape cartridges inside CERN&apos;s Meyrin
              vaults, consuming zero electrical power while idle.
            </p>
          </div>

          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#FFE600] space-y-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <span className="text-amber-400 font-bold text-sm block">Heterogeneous Compute</span>
            <p className="text-text-secondary font-sans text-xs">
              Migration of tracking and reconstruction algorithms to GPU coprocessors (such as LHCb Allen
              and CMS Patatrack) to sustain throughput under tight power envelopes.
            </p>
          </div>
        </div>
      </section>

      <TechnicalTermDeck contextId="page-computing" heading="Trigger, DAQ & WLCG Computing Terms (ⓘ Info Cards)" />
    </div>
  );
}
