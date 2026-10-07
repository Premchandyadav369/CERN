'use client';

import React from 'react';
import { DetectorTwin } from '@/components/detectors/DetectorTwin';
import { Layers, ShieldCheck, Database, Info } from 'lucide-react';

export default function DetectorsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase text-cern-cyan font-bold tracking-wider">
            DETECTOR DIGITAL TWINS &amp; REAL COLLISION EVENTS
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            CERN Open Data 13 TeV
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary">
          ATLAS &amp; CMS Detector Twins
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-3xl leading-relaxed">
          Explore the multi-layered subdetectors that identify, track, and measure collision debris.
          Toggle individual subsystems to see what physical information is lost, and click reconstructed
          tracks to inspect measured transverse momenta ($p_T$), pseudorapidity ($\eta$), and particle IDs.
        </p>
      </div>

      {/* Main Interactive Detector Twin Module */}
      <section>
        <DetectorTwin />
      </section>

      {/* Comparison Section: Complementary Architectures */}
      <section className="p-6 bg-canvas-surface border border-canvas-border rounded-panel space-y-4">
        <h2 className="text-lg font-display font-bold text-text-primary">
          The Two Pillars: Why ATLAS and CMS Cross-Validate Discoveries
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary leading-relaxed">
          <div className="space-y-2 p-4 bg-canvas-sub border border-canvas-border rounded">
            <h3 className="font-mono font-bold text-sm text-cern-cyan">ATLAS Design Strategy</h3>
            <p>
              Employs an enormous outer air-core superconducting toroid magnet system (25 m diameter)
              that minimizes multiple scattering for high-precision standalone muon momentum
              measurement. Calorimetry relies on accordion-geometry liquid argon samplers with exceptional
              radiation hardness and fine lateral granularity.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-canvas-sub border border-canvas-border rounded">
            <h3 className="font-mono font-bold text-sm text-cern-accent">CMS Design Strategy</h3>
            <p>
              Built around a single, ultra-high-field 3.8 Tesla superconducting solenoid coil containing
              an all-silicon tracker and 75,848 scintillating lead tungstate (PbWO4) crystals. The crystals
              yield superior photon energy resolution for resolving the narrow $H \rightarrow \gamma\gamma$
              resonance peak.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
