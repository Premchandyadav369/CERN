'use client';

import React from 'react';
import { DetectorTwin } from '@/components/detectors/DetectorTwin';
import { DetectorMaterialViewer } from '@/components/detectors/DetectorMaterialViewer';
import { Layers, ShieldCheck, Database, Info, Box } from 'lucide-react';

export default function DetectorsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-cern-cyan text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
            /// DETECTOR DIGITAL TWINS &amp; REAL COLLISION EVENTS ///
          </span>
          <span className="text-[10px] font-mono px-2 py-1 bg-emerald-400 text-black font-bold border-2 border-black shadow-[2px_2px_0px_#000]">
            CERN Open Data 13 TeV
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
          ATLAS &amp; CMS Detector Twins
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
          Explore the multi-layered subdetectors that identify, track, and measure collision debris.
          Toggle individual subsystems to see what physical information is lost, and click reconstructed
          tracks to inspect measured transverse momenta ($p_T$), pseudorapidity ($\eta$), and particle IDs.
        </p>
      </div>

      {/* Main Interactive Detector Twin Module */}
      <section>
        <DetectorTwin />
      </section>

      {/* 3D Detector Crystals & Superconductor Materials Inspector */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-amber-300" /> /// 3D Detector Crystal &amp; Superconducting Magnet Inspector ///
          </h2>
        </div>
        <DetectorMaterialViewer />
      </section>

      {/* Comparison Section: The Four Flagship LHC Architectures */}
      <section className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-5">
        <div className="border-b-2 border-black pb-3">
          <h2 className="text-xl font-display font-extrabold text-white">
            /// The Four Pillars of LHC Discovery: Complementary Detector Architectures ///
          </h2>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Independent detector technologies and geometries ensure cross-validation of discoveries and coverage of distinct physics regimes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-text-secondary leading-relaxed">
          <div className="space-y-3 p-4 bg-canvas-sub border-2 border-black shadow-[5px_5px_0px_#00E5FF] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h3 className="font-mono font-bold text-base text-cern-cyan">ATLAS</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-cern-cyan font-bold border-2 border-black shadow-[1px_1px_0px_#000]">General Purpose</span>
            </div>
            <p className="font-sans">
              Employs an outer air-core superconducting toroid magnet system (25 m diameter)
              minimizing multiple scattering for standalone muon spectrometry. Calorimetry uses accordion-geometry
              liquid argon (LAr) samplers with fine shower segmentation.
            </p>
            <div className="pt-2 border-t-2 border-black text-[11px] font-mono text-text-muted font-bold">
              Weight: 7,000 t · Dimensions: 46m × 25m
            </div>
          </div>

          <div className="space-y-3 p-4 bg-canvas-sub border-2 border-black shadow-[5px_5px_0px_#4C7DFF] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h3 className="font-mono font-bold text-base text-cern-accent">CMS</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-cern-accent font-bold border-2 border-black shadow-[1px_1px_0px_#000]">General Purpose</span>
            </div>
            <p className="font-sans">
              Centered on a 3.8 Tesla superconducting solenoid coil containing an all-silicon tracker
              and 75,848 scintillating lead tungstate ($PbWO_4$) crystals. Yields exceptional photon energy
              resolution for resolving narrow Higgs resonances ($H \rightarrow \gamma\gamma$).
            </p>
            <div className="pt-2 border-t-2 border-black text-[11px] font-mono text-text-muted font-bold">
              Weight: 14,000 t · Dimensions: 21m × 15m
            </div>
          </div>

          <div className="space-y-3 p-4 bg-canvas-sub border-2 border-black shadow-[5px_5px_0px_#FF0055] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h3 className="font-mono font-bold text-base text-pink-400">ALICE</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-pink-400 font-bold border-2 border-black shadow-[1px_1px_0px_#000]">Heavy Ion / QGP</span>
            </div>
            <p className="font-sans">
              Engineered for extreme particle density (dN&#123;ch&#125;/d&eta; ~ 2000) in Lead-Lead collisions. Features
              the world&apos;s largest cylindrical Time Projection Chamber (TPC) with continuous GEM readout and
              a 7-layer MAPS Inner Tracking System.
            </p>
            <div className="pt-2 border-t-2 border-black text-[11px] font-mono text-text-muted font-bold">
              Weight: 10,000 t · Dimensions: 26m × 16m
            </div>
          </div>

          <div className="space-y-3 p-4 bg-canvas-sub border-2 border-black shadow-[5px_5px_0px_#FFE600] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h3 className="font-mono font-bold text-base text-amber-400">LHCb</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-amber-400 font-bold border-2 border-black shadow-[1px_1px_0px_#000]">b &amp; c Physics</span>
            </div>
            <p className="font-sans">
              Forward single-arm spectrometer ($2 &lt; \eta &lt; 5$) dedicated to CP violation and ultra-rare
              flavour decays. Features the Vertex Locator (VELO) operating 5.1 mm from colliding beams
              and dual RICH Cherenkov PID detectors.
            </p>
            <div className="pt-2 border-t-2 border-black text-[11px] font-mono text-text-muted font-bold">
              Weight: 5,600 t · Dimensions: 20m × 10m
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
