'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LhcSimulator } from '@/components/simulations/LhcSimulator';
import { TriggerLab } from '@/components/simulations/TriggerLab';
import { DiscoveryExercise } from '@/components/simulations/DiscoveryExercise';
import { BeamOpticsSandbox } from '@/components/simulations/BeamOpticsSandbox';
import { AntimatterSimulator } from '@/components/simulations/AntimatterSimulator';
import { AwakeSimulator } from '@/components/simulations/AwakeSimulator';
import { AliceFlowSimulator } from '@/components/simulations/AliceFlowSimulator';
import { LhcbDecaySimulator } from '@/components/simulations/LhcbDecaySimulator';
import { CrabCavitySimulator } from '@/components/simulations/CrabCavitySimulator';
import { FccSimulator } from '@/components/simulations/FccSimulator';
import { ScienceLiteratureBridge } from '@/components/knowledge/ScienceLiteratureBridge';
import {
  Zap,
  Gauge,
  Sparkles,
  Orbit,
  Atom,
  Flame,
  Activity,
  Layers,
  Compass,
  Radio,
  BookOpen,
} from 'lucide-react';

function SimulationsContent() {
  const searchParams = useSearchParams();
  const initialModule = searchParams.get('module') || 'lhc';
  const [activeTab, setActiveTab] = useState<string>(initialModule);

  useEffect(() => {
    const mod = searchParams.get('module');
    if (mod) setActiveTab(mod);
  }, [searchParams]);

  const tabs = [
    { id: 'lhc', label: 'LHC Dynamics', icon: Zap, color: 'text-cern-cyan', shadow: 'shadow-[4px_4px_0px_#00E5FF]' },
    { id: 'optics', label: 'Beam Optics', icon: Orbit, color: 'text-sky-400', shadow: 'shadow-[4px_4px_0px_#38BDF8]' },
    { id: 'antimatter', label: 'Antimatter & ALPHA-g', icon: Atom, color: 'text-cern-magenta', shadow: 'shadow-[4px_4px_0px_#FF0055]' },
    { id: 'awake', label: 'AWAKE Plasma', icon: Flame, color: 'text-cern-cyan', shadow: 'shadow-[4px_4px_0px_#00E5FF]' },
    { id: 'alice', label: 'ALICE QGP & Flow', icon: Activity, color: 'text-amber-400', shadow: 'shadow-[4px_4px_0px_#FFE600]' },
    { id: 'lhcb', label: 'LHCb Rare Decays', icon: Sparkles, color: 'text-purple-400', shadow: 'shadow-[4px_4px_0px_#C084FC]' },
    { id: 'crab', label: 'HL-LHC Crab Cavity', icon: Layers, color: 'text-emerald-400', shadow: 'shadow-[4px_4px_0px_#00FF66]' },
    { id: 'fcc', label: 'FCC 91km Collider', icon: Compass, color: 'text-cern-cyan', shadow: 'shadow-[4px_4px_0px_#00E5FF]' },
    { id: 'trigger', label: 'Trigger & DAQ', icon: Gauge, color: 'text-amber-400', shadow: 'shadow-[4px_4px_0px_#FFE600]' },
    { id: 'discovery', label: '5-Sigma Discovery', icon: Radio, color: 'text-pink-400', shadow: 'shadow-[4px_4px_0px_#FF0055]' },
    { id: 'literature', label: 'arXiv & Research Bridge', icon: BookOpen, color: 'text-emerald-400', shadow: 'shadow-[4px_4px_0px_#00FF66]' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('module', tabId);
      window.history.replaceState(null, '', url.toString());
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="inline-block px-2.5 py-1 bg-cern-cyan text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
            /// QUANTITATIVE SIMULATION LABORATORY ///
          </div>
          <button
            onClick={() => handleTabChange('literature')}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="View peer-reviewed papers and arXiv preprints for all simulations"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>arXiv &amp; Peer-Reviewed Papers</span>
          </button>
        </div>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
          Interactive Physics &amp; Experiment Simulators
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
          Executable models running on closed-form relativistic physics, exact magnetic rigidity laws,
          Courant-Snyder transfer matrices, and deterministic seeded pseudo-random processes. No hard-coded animations.
        </p>
      </div>

      {/* Simulator Mode Tabs Grid */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto scrollbar-none text-xs font-mono">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 border-2 border-black font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? `bg-cern-blue text-white ${tab.shadow} -translate-x-0.5 -translate-y-0.5`
                  : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[3px_3px_0px_#000] hover:bg-canvas-raised'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Viewport */}
      <div>
        {activeTab === 'lhc' && <LhcSimulator />}
        {activeTab === 'optics' && <BeamOpticsSandbox />}
        {activeTab === 'antimatter' && <AntimatterSimulator />}
        {activeTab === 'awake' && <AwakeSimulator />}
        {activeTab === 'alice' && <AliceFlowSimulator />}
        {activeTab === 'lhcb' && <LhcbDecaySimulator />}
        {activeTab === 'crab' && <CrabCavitySimulator />}
        {activeTab === 'fcc' && <FccSimulator />}
        {activeTab === 'trigger' && <TriggerLab />}
        {activeTab === 'discovery' && <DiscoveryExercise />}
        {activeTab === 'literature' && <ScienceLiteratureBridge />}
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
