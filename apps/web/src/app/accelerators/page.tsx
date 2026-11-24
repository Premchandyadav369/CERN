'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import acceleratorsData from '../../../../../content/accelerators.json';
import { LhcSimulator } from '@/components/simulations/LhcSimulator';
import { BeamOpticsSandbox } from '@/components/simulations/BeamOpticsSandbox';
import { Value } from '@/components/provenance/Value';
import { Zap, Play, ArrowRight, ExternalLink, Activity, Info, Orbit, HeartPulse } from 'lucide-react';

export default function AcceleratorsPage() {
  const [selectedAcceleratorId, setSelectedAcceleratorId] = useState<string>('lhc');

  const selectedAccelerator =
    acceleratorsData.find((a) => a.id === selectedAcceleratorId) || acceleratorsData[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <span className="inline-block px-2.5 py-1 bg-cern-cyan text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider mb-3">
          /// ACCELERATOR COMPLEX EXPLORER ///
        </span>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
          CERN Accelerator Complex &amp; Beam Dynamics
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
          CERN operates a progressive succession of particle accelerators. Each machine boosts the
          energy of particle beams before injecting them into the next, higher-energy stage or
          delivering them to specialized fixed-target experimental areas.
        </p>
      </div>

      {/* LHC Simulator Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cern-cyan" /> /// Interactive Beam Physics &amp; LHC Simulator ///
          </h2>
        </div>
        <LhcSimulator />
      </section>

      {/* Beam Optics & FODO Lattice Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Orbit className="w-5 h-5 text-sky-400" /> /// Beam Optics &amp; Alternating Gradient Focusing ///
          </h2>
        </div>
        <BeamOpticsSandbox />
      </section>

      {/* Medical Accelerators Cross-Link Banner */}
      <section className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cern-magenta text-white font-mono font-bold text-[10px] border border-black uppercase shadow-[1px_1px_0px_#000]">
              Medical Physics &amp; Accelerators
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              CERN-MEDICIS &amp; Hadron Therapy
            </span>
          </div>
          <h3 className="text-xl font-display font-extrabold text-white">
            Hadron Therapy &amp; Bragg Peak Cancer Treatment Simulator
          </h3>
          <p className="text-xs text-text-secondary font-mono max-w-2xl leading-relaxed">
            See how CERN accelerator beam dynamics directly power hadron therapy centers (CNAO, MedAustron),
            using proton and carbon-12 beams to deliver maximum tumor dose with zero exit dose to healthy brain tissue.
          </p>
        </div>
        <Link
          href="/simulations?module=bragg-peak"
          className="px-5 py-3 bg-cern-magenta hover:bg-pink-600 text-white font-mono font-bold text-xs uppercase border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 shrink-0"
        >
          <HeartPulse className="w-4 h-4" />
          <span>Launch Bragg Peak Simulator</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Accelerators Grid Directory & Inspector */}
      <section className="space-y-6 pt-6 border-t-3 border-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-display font-extrabold text-white">
              /// Catalogue of CERN Accelerators ///
            </h2>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              Select any machine below to inspect operational parameters, RF frequency, and bending dipole field.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] text-cern-cyan font-bold">
            Active: <strong className="text-white">{selectedAccelerator.name}</strong>
          </span>
        </div>

        {/* Selected Accelerator Telemetry HUD */}
        <div className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#00E5FF] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cern-cyan uppercase px-2 py-0.5 bg-black border-2 border-black shadow-[2px_2px_0px_#000]">
                  {selectedAccelerator.type}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-400 text-black font-bold border-2 border-black shadow-[2px_2px_0px_#000]">
                  {selectedAccelerator.status}
                </span>
              </div>
              <h3 className="text-2xl font-display font-extrabold text-white">
                {selectedAccelerator.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {selectedAccelerator.id === 'ad-elena' && (
                <Link
                  href="/simulations?module=antimatter"
                  className="px-3.5 py-2 bg-cern-magenta hover:bg-pink-600 border-2 border-black shadow-[3px_3px_0px_#000] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>ALPHA-g Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {selectedAccelerator.id === 'psb' && (
                <Link
                  href="/simulations?module=bragg-peak"
                  className="px-3.5 py-2 bg-cern-magenta hover:bg-pink-600 border-2 border-black shadow-[3px_3px_0px_#000] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Bragg Peak Hadron Sim</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {selectedAccelerator.id === 'hl-lhc' && (
                <Link
                  href="/simulations?module=crab"
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 border-2 border-black shadow-[3px_3px_0px_#000] text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>Crab Cavity Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {selectedAccelerator.id === 'sps' && (
                <Link
                  href="/simulations?module=awake"
                  className="px-3.5 py-2 bg-cern-cyan hover:bg-cyan-400 border-2 border-black shadow-[3px_3px_0px_#000] text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>AWAKE Wakefield Sim</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {selectedAccelerator.id === 'lhc' && (
                <Link
                  href="/simulations?module=lhc"
                  className="px-3.5 py-2 bg-cern-blue hover:bg-cern-accent border-2 border-black shadow-[3px_3px_0px_#000] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>Full LHC Sim</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cern-cyan" />
                </Link>
              )}
              <a
                href={selectedAccelerator.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-canvas-sub hover:bg-canvas-raised border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
              >
                <span>CERN Report</span>
                <ExternalLink className="w-3.5 h-3.5 text-cern-cyan" />
              </a>
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed max-w-3xl font-sans">
            {selectedAccelerator.purpose}
          </p>

          {/* Machine Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 font-mono text-xs">
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] text-text-muted font-bold block">Max Beam Energy</span>
              <span className="text-sm font-bold text-cern-cyan block mt-0.5 truncate">
                {selectedAccelerator.energy}
              </span>
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] text-text-muted font-bold block">Circumference / Length</span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {selectedAccelerator.circumferenceMeters
                  ? `${selectedAccelerator.circumferenceMeters.toLocaleString()} m`
                  : 'Fixed Target'}
              </span>
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] text-text-muted font-bold block">Bending Dipole Field</span>
              <span className="text-sm font-bold text-amber-300 block mt-0.5">
                {selectedAccelerator.bendingFieldTesla
                  ? `${selectedAccelerator.bendingFieldTesla} Tesla`
                  : 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] text-text-muted font-bold block">RF Cavity Frequency</span>
              <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                {selectedAccelerator.rfFrequencyMhz
                  ? `${selectedAccelerator.rfFrequencyMhz} MHz`
                  : 'Electrostatic'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] text-text-muted font-bold block">Injection Source</span>
              <span className="text-xs font-bold text-sky-300 block mt-0.5 truncate">
                {selectedAccelerator.injectionSource || 'Primary Source'}
              </span>
            </div>
          </div>

          {/* Experiments Served Ribbon */}
          {selectedAccelerator.experimentsServed && selectedAccelerator.experimentsServed.length > 0 && (
            <div className="pt-3 border-t-2 border-black flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-text-muted font-bold mr-1">Experiments / Targets Served:</span>
              {selectedAccelerator.experimentsServed.map((exp: string) => (
                <span
                  key={exp}
                  className="px-2.5 py-1 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] text-text-primary text-[11px] font-bold"
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
                className={`p-4 border-2 border-black transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-canvas-sub border-black shadow-[5px_5px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-canvas-surface shadow-[4px_4px_0px_#000] hover:bg-canvas-sub hover:shadow-[5px_5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                    <span className="text-xs font-mono font-bold text-cern-cyan">{acc.type}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-400 text-black font-bold border-2 border-black shadow-[1px_1px_0px_#000]">
                      {acc.status}
                    </span>
                  </div>

                  <h3 className="text-base font-display font-extrabold text-white">{acc.name}</h3>

                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 font-sans">
                    {acc.purpose}
                  </p>

                  <div className="pt-2 border-t-2 border-black space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-text-muted font-bold">Max Energy:</span>
                      <span className="text-text-primary font-bold">{acc.energy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted font-bold">Particles:</span>
                      <span className="text-text-secondary font-bold">{acc.particles}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t-2 border-black flex items-center justify-between text-[11px] font-mono">
                  <a
                    href={acc.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-cern-cyan hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>CERN Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-text-muted font-bold px-1.5 py-0.5 bg-black border border-black shadow-[1px_1px_0px_#000]">{acc.sourceTier}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Advanced Future Accelerators Showcase */}
      <section className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-cern-cyan uppercase tracking-wider block">
              /// NEXT GENERATION COLLIDERS &amp; ADVANCED R&amp;D ///
            </span>
            <h2 className="text-xl font-display font-extrabold text-white mt-1">
              Future Circular Collider (FCC) &amp; Crab Cavities
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-black border-2 border-black text-emerald-400 font-bold shadow-[2px_2px_0px_#000]">
            Interactive Labs Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-cern-cyan uppercase">90.7 km Tunnel Infrastructure</span>
              <h3 className="text-base font-display font-extrabold text-white">Future Circular Collider (FCC-ee &amp; FCC-hh)</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                Explore the 90.7 km ring model, the 50 MW synchrotron radiation wall-plug limit, and compare precision electroweak Higgs factories against a 100 TeV hadron collider with 16 T dipoles.
              </p>
            </div>
            <Link
              href="/simulations?module=fcc"
              className="inline-flex items-center justify-between px-3.5 py-2 bg-cern-blue hover:bg-cern-accent border-2 border-black shadow-[2px_2px_0px_#000] text-white text-xs font-mono font-bold transition-all"
            >
              <span>Launch FCC 91 km Simulator</span>
              <ArrowRight className="w-4 h-4 text-cern-cyan" />
            </Link>
          </div>

          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Superconducting RF Crabbing</span>
              <h3 className="text-base font-display font-extrabold text-white">HL-LHC Crab Cavity &amp; Bunch Rotation</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                Simulate 400.79 MHz transverse deflecting RF cavities compensating the 500 &mu;rad crossing angle to boost HL-LHC peak luminosity by +170%.
              </p>
            </div>
            <Link
              href="/simulations?module=crab"
              className="inline-flex items-center justify-between px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 border-2 border-black shadow-[2px_2px_0px_#000] text-black text-xs font-mono font-bold transition-all"
            >
              <span>Launch Crab Cavity Simulator</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
