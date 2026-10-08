'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import acceleratorsData from '../../../../../content/accelerators.json';
import { LhcSimulator } from '@/components/simulations/LhcSimulator';
import { BeamOpticsSandbox } from '@/components/simulations/BeamOpticsSandbox';
import { Value } from '@/components/provenance/Value';
import { Zap, Play, ArrowRight, ExternalLink, Activity, Info, Orbit } from 'lucide-react';

export default function AcceleratorsPage() {
  const [selectedAcceleratorId, setSelectedAcceleratorId] = useState<string>('lhc');

  const selectedAccelerator =
    acceleratorsData.find((a) => a.id === selectedAcceleratorId) || acceleratorsData[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div>
        <span className="text-xs font-mono uppercase text-cern-cyan font-bold tracking-wider">
          ACCELERATOR COMPLEX EXPLORER
        </span>
        <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
          CERN Accelerator Complex &amp; Beam Dynamics
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-3xl leading-relaxed">
          CERN operates a progressive succession of particle accelerators. Each machine boosts the
          energy of particle beams before injecting them into the next, higher-energy stage or
          delivering them to specialized fixed-target experimental areas.
        </p>
      </div>

      {/* LHC Simulator Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
            <Zap className="w-4 h-4 text-cern-cyan" /> Interactive Beam Physics &amp; LHC Simulator
          </h2>
        </div>
        <LhcSimulator />
      </section>

      {/* Beam Optics & FODO Lattice Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
            <Orbit className="w-4 h-4 text-sky-400" /> Beam Optics &amp; Alternating Gradient Focusing
          </h2>
        </div>
        <BeamOpticsSandbox />
      </section>

      {/* Accelerators Grid Directory */}
      <section className="space-y-4 pt-4 border-t border-canvas-border">
        <div>
          <h2 className="text-lg font-display font-bold text-text-primary">
            Catalogue of CERN Accelerators
          </h2>
          <p className="text-xs text-text-muted">
            All specifications verified against CERN Official Portals and the LHC Design Report.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {acceleratorsData.map((acc) => {
            const isSelected = acc.id === selectedAcceleratorId;

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAcceleratorId(acc.id)}
                className={`p-4 rounded-panel border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-canvas-raised border-cern-cyan ring-1 ring-cern-cyan'
                    : 'bg-canvas-surface border-canvas-border hover:bg-canvas-raised'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cern-cyan">{acc.type}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      {acc.status}
                    </span>
                  </div>

                  <h3 className="text-base font-display font-bold text-text-primary">{acc.name}</h3>

                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                    {acc.purpose}
                  </p>

                  <div className="pt-2 border-t border-canvas-border space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Max Energy:</span>
                      <span className="text-text-primary font-semibold">{acc.energy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Particles:</span>
                      <span className="text-text-secondary">{acc.particles}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-canvas-border flex items-center justify-between text-[11px] font-mono">
                  <a
                    href={acc.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-cern-accent hover:underline flex items-center gap-1"
                  >
                    <span>CERN Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-text-muted">{acc.sourceTier}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
