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

      {/* Accelerators Grid Directory & Inspector */}
      <section className="space-y-6 pt-4 border-t border-canvas-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-display font-bold text-text-primary">
              Catalogue of CERN Accelerators
            </h2>
            <p className="text-xs text-text-muted">
              Select any machine below to inspect operational parameters, RF frequency, and bending dipole field.
            </p>
          </div>
          <span className="text-xs font-mono text-cern-cyan">
            Active: <strong className="text-white">{selectedAccelerator.name}</strong>
          </span>
        </div>

        {/* Selected Accelerator Telemetry HUD */}
        <div className="p-6 rounded-2xl bg-canvas-surface/90 border border-cern-cyan/40 shadow-xl shadow-cyan-950/20 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cern-cyan uppercase">
                  {selectedAccelerator.type}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  {selectedAccelerator.status}
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-white">
                {selectedAccelerator.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={selectedAccelerator.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-cern-blue/30 hover:bg-cern-blue/50 border border-cern-accent/40 text-cern-cyan text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <span>CERN Design Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed max-w-3xl">
            {selectedAccelerator.purpose}
          </p>

          {/* Machine Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-canvas-sub border border-canvas-border">
              <span className="text-[10px] text-text-muted block">Max Beam Energy</span>
              <span className="text-sm font-bold text-cern-cyan block mt-0.5 truncate">
                {selectedAccelerator.energy}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-canvas-sub border border-canvas-border">
              <span className="text-[10px] text-text-muted block">Circumference / Length</span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {selectedAccelerator.circumferenceMeters
                  ? `${selectedAccelerator.circumferenceMeters.toLocaleString()} m`
                  : 'Fixed Target'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-canvas-sub border border-canvas-border">
              <span className="text-[10px] text-text-muted block">Bending Dipole Field</span>
              <span className="text-sm font-bold text-amber-300 block mt-0.5">
                {selectedAccelerator.bendingFieldTesla
                  ? `${selectedAccelerator.bendingFieldTesla} Tesla`
                  : 'N/A'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-canvas-sub border border-canvas-border">
              <span className="text-[10px] text-text-muted block">RF Cavity Frequency</span>
              <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                {selectedAccelerator.rfFrequencyMhz
                  ? `${selectedAccelerator.rfFrequencyMhz} MHz`
                  : 'Electrostatic'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3 rounded-lg bg-canvas-sub border border-canvas-border">
              <span className="text-[10px] text-text-muted block">Injection Source</span>
              <span className="text-xs font-bold text-sky-300 block mt-0.5 truncate">
                {selectedAccelerator.injectionSource || 'Primary Source'}
              </span>
            </div>
          </div>

          {/* Experiments Served Ribbon */}
          {selectedAccelerator.experimentsServed && selectedAccelerator.experimentsServed.length > 0 && (
            <div className="pt-2 border-t border-canvas-border flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="text-text-muted mr-1">Experiments / Targets Served:</span>
              {selectedAccelerator.experimentsServed.map((exp: string) => (
                <span
                  key={exp}
                  className="px-2 py-0.5 rounded bg-canvas-raised border border-canvas-border text-text-primary text-[11px]"
                >
                  {exp}
                </span>
              ))}
            </div>
          )}
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
