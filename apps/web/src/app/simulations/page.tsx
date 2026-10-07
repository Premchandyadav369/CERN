'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LhcSimulator } from '@/components/simulations/LhcSimulator';
import { TriggerLab } from '@/components/simulations/TriggerLab';
import { DiscoveryExercise } from '@/components/simulations/DiscoveryExercise';
import { Zap, Gauge, Sparkles } from 'lucide-react';

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
      <div>
        <span className="text-xs font-mono uppercase text-cern-cyan font-bold tracking-wider">
          QUANTITATIVE SIMULATION LABORATORY
        </span>
        <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
          Interactive Physics &amp; Experiment Simulators
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-3xl leading-relaxed">
          Executable models running on closed-form relativistic physics, exact magnetic rigidity laws,
          and deterministic seeded pseudo-random processes. No hard-coded animations.
        </p>
      </div>

      {/* Simulator Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-canvas-border pb-3 overflow-x-auto scrollbar-none text-xs font-mono">
        <button
          onClick={() => setActiveTab('lhc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-panel border transition-all ${
            activeTab === 'lhc'
              ? 'bg-cern-blue border-cern-accent text-white font-bold'
              : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <Zap className="w-4 h-4 text-cern-cyan" />
          <span>LHC Beam Dynamics &amp; Luminosity</span>
        </button>

        <button
          onClick={() => setActiveTab('trigger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-panel border transition-all ${
            activeTab === 'trigger'
              ? 'bg-cern-blue border-cern-accent text-white font-bold'
              : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <Gauge className="w-4 h-4 text-amber-400" />
          <span>Trigger &amp; DAQ Pipeline Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('discovery')}
          className={`flex items-center gap-2 px-4 py-2 rounded-panel border transition-all ${
            activeTab === 'discovery'
              ? 'bg-cern-blue border-cern-accent text-white font-bold'
              : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>5-Sigma Discovery Exercise</span>
        </button>
      </div>

      {/* Tab Viewport */}
      <div>
        {activeTab === 'lhc' && <LhcSimulator />}
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
