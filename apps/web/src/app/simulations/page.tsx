'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LhcSimulator } from '@/components/simulations/LhcSimulator';
import { TriggerLab } from '@/components/simulations/TriggerLab';
import { DiscoveryExercise } from '@/components/simulations/DiscoveryExercise';
import { BeamOpticsSandbox } from '@/components/simulations/BeamOpticsSandbox';
import { Zap, Gauge, Sparkles, Orbit } from 'lucide-react';

function SimulationsContent() {
  const searchParams = useSearchParams();
  const initialModule = searchParams.get('module') || 'lhc';
  const [activeTab, setActiveTab] = useState<string>(initialModule);

  useEffect(() => {
    const mod = searchParams.get('module');
    if (mod) setActiveTab(mod);
  }, [searchParams]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="inline-block px-2.5 py-1 bg-cern-cyan text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider mb-3">
          /// QUANTITATIVE SIMULATION LABORATORY ///
        </div>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
          Interactive Physics &amp; Experiment Simulators
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
          Executable models running on closed-form relativistic physics, exact magnetic rigidity laws,
          Courant-Snyder transfer matrices, and deterministic seeded pseudo-random processes. No hard-coded animations.
        </p>
      </div>

      {/* Simulator Mode Tabs */}
      <div className="flex items-center gap-3 pb-3 overflow-x-auto scrollbar-none text-xs font-mono">
        <button
          onClick={() => setActiveTab('lhc')}
          className={`flex items-center gap-2 px-4 py-2.5 border-2 border-black font-mono font-bold uppercase transition-all cursor-pointer ${
            activeTab === 'lhc'
              ? 'bg-cern-blue text-white shadow-[4px_4px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
              : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[3px_3px_0px_#000] hover:bg-canvas-raised'
          }`}
        >
          <Zap className="w-4 h-4 text-cern-cyan" />
          <span>LHC Beam Dynamics &amp; Luminosity</span>
        </button>

        <button
          onClick={() => setActiveTab('optics')}
          className={`flex items-center gap-2 px-4 py-2.5 border-2 border-black font-mono font-bold uppercase transition-all cursor-pointer ${
            activeTab === 'optics'
              ? 'bg-cern-blue text-white shadow-[4px_4px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
              : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[3px_3px_0px_#000] hover:bg-canvas-raised'
          }`}
        >
          <Orbit className="w-4 h-4 text-sky-400" />
          <span>Beam Optics &amp; FODO Lattice</span>
        </button>

        <button
          onClick={() => setActiveTab('trigger')}
          className={`flex items-center gap-2 px-4 py-2.5 border-2 border-black font-mono font-bold uppercase transition-all cursor-pointer ${
            activeTab === 'trigger'
              ? 'bg-cern-blue text-white shadow-[4px_4px_0px_#FFE600] -translate-x-0.5 -translate-y-0.5'
              : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[3px_3px_0px_#000] hover:bg-canvas-raised'
          }`}
        >
          <Gauge className="w-4 h-4 text-amber-400" />
          <span>Trigger &amp; DAQ Pipeline Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('discovery')}
          className={`flex items-center gap-2 px-4 py-2.5 border-2 border-black font-mono font-bold uppercase transition-all cursor-pointer ${
            activeTab === 'discovery'
              ? 'bg-cern-blue text-white shadow-[4px_4px_0px_#FF0055] -translate-x-0.5 -translate-y-0.5'
              : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[3px_3px_0px_#000] hover:bg-canvas-raised'
          }`}
        >
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>5-Sigma Discovery Exercise</span>
        </button>
      </div>

      {/* Tab Viewport */}
      <div>
        {activeTab === 'lhc' && <LhcSimulator />}
        {activeTab === 'optics' && <BeamOpticsSandbox />}
        {activeTab === 'trigger' && <TriggerLab />}
        {activeTab === 'discovery' && <DiscoveryExercise />}
      </div>
    </div>
  );
}

export default function SimulationsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center font-mono text-xs text-text-muted">
          Loading Simulation Laboratory...
        </div>
      }
    >
      <SimulationsContent />
    </Suspense>
  );
}
