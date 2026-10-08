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

      {/* Comparison Section: The Four Flagship LHC Architectures */}
      <section className="p-6 bg-canvas-surface border border-canvas-border rounded-panel space-y-4">
        <div>
          <h2 className="text-lg font-display font-bold text-text-primary">
            The Four Pillars of LHC Discovery: Complementary Detector Architectures
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Independent detector technologies and geometries ensure cross-validation of discoveries and coverage of distinct physics regimes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-text-secondary leading-relaxed">
          <div className="space-y-2 p-4 bg-canvas-sub border border-canvas-border hover:border-cern-cyan/60 rounded transition-all">
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-bold text-sm text-cern-cyan">ATLAS</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cern-cyan/10 text-cern-cyan">General Purpose</span>
            </div>
            <p>
              Employs an outer air-core superconducting toroid magnet system (25 m diameter)
              minimizing multiple scattering for standalone muon spectrometry. Calorimetry uses accordion-geometry
              liquid argon (LAr) samplers with fine shower segmentation.
            </p>
            <div className="pt-2 border-t border-canvas-border text-[11px] font-mono text-text-muted">
              Weight: 7,000 t · Dimensions: 46m × 25m
            </div>
          </div>

          <div className="space-y-2 p-4 bg-canvas-sub border border-canvas-border hover:border-cern-accent/60 rounded transition-all">
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-bold text-sm text-cern-accent">CMS</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cern-accent/10 text-cern-accent">General Purpose</span>
            </div>
            <p>
              Centered on a 3.8 Tesla superconducting solenoid coil containing an all-silicon tracker
              and 75,848 scintillating lead tungstate ($PbWO_4$) crystals. Yields exceptional photon energy
              resolution for resolving narrow Higgs resonances ($H \rightarrow \gamma\gamma$).
            </p>
            <div className="pt-2 border-t border-canvas-border text-[11px] font-mono text-text-muted">
              Weight: 14,000 t · Dimensions: 21m × 15m
            </div>
          </div>

          <div className="space-y-2 p-4 bg-canvas-sub border border-canvas-border hover:border-pink-400/60 rounded transition-all">
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-bold text-sm text-pink-400">ALICE</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-400/10 text-pink-400">Heavy Ion / QGP</span>
            </div>
            <p>
              Engineered for extreme particle density (dN&#123;ch&#125;/d&eta; ~ 2000) in Lead-Lead collisions. Features
              the world&apos;s largest cylindrical Time Projection Chamber (TPC) with continuous GEM readout and
              a 7-layer MAPS Inner Tracking System.
            </p>
            <div className="pt-2 border-t border-canvas-border text-[11px] font-mono text-text-muted">
              Weight: 10,000 t · Dimensions: 26m × 16m
            </div>
          </div>

          <div className="space-y-2 p-4 bg-canvas-sub border border-canvas-border hover:border-amber-400/60 rounded transition-all">
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-bold text-sm text-amber-400">LHCb</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400">b &amp; c Physics</span>
            </div>
            <p>
              Forward single-arm spectrometer ($2 &lt; \eta &lt; 5$) dedicated to CP violation and ultra-rare
              flavour decays. Features the Vertex Locator (VELO) operating 5.1 mm from colliding beams
              and dual RICH Cherenkov PID detectors.
            </p>
            <div className="pt-2 border-t border-canvas-border text-[11px] font-mono text-text-muted">
              Weight: 5,600 t · Dimensions: 20m × 10m
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
