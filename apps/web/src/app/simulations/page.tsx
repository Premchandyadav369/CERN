'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
import { BraggPeakSimulator } from '@/components/simulations/BraggPeakSimulator';
import { FeynmanLab } from '@/components/simulations/FeynmanLab';
import { CloudChamberSimulator } from '@/components/simulations/CloudChamberSimulator';
import { HiggsMechanismSimulator } from '@/components/simulations/HiggsMechanismSimulator';
import { DarkMatterHaloscope } from '@/components/simulations/DarkMatterHaloscope';
import { StandardModelLab } from '@/components/simulations/StandardModelLab';
import { IsoldeSimulator } from '@/components/simulations/IsoldeSimulator';
import { MedipixRichSimulator } from '@/components/simulations/MedipixRichSimulator';
import { CosmicHistoryLab } from '@/components/simulations/CosmicHistoryLab';
import { LiveCollisionDirector } from '@/components/simulations/LiveCollisionDirector';
import { ParticleRaceSimulator } from '@/components/simulations/ParticleRaceSimulator';
import { NeutrinoOscillationSimulator } from '@/components/simulations/NeutrinoOscillationSimulator';
import { LhcFillCockpitSimulator } from '@/components/simulations/LhcFillCockpitSimulator';
import { TvaTimelineSimulator } from '@/components/simulations/TvaTimelineSimulator';
import { TvaIntakeDeskSimulator } from '@/components/simulations/TvaIntakeDeskSimulator';
import { ArcMagnetSimulator } from '@/components/simulations/ArcMagnetSimulator';
import { QuantumScaleZoomSimulator } from '@/components/simulations/QuantumScaleZoomSimulator';
import { MirrorDimensionLab } from '@/components/simulations/MirrorDimensionLab';
import { SpiderVertexLab } from '@/components/simulations/SpiderVertexLab';
import { MonopoleArenaSimulator } from '@/components/simulations/MonopoleArenaSimulator';
import { BifrostHeavyIonSimulator } from '@/components/simulations/BifrostHeavyIonSimulator';
import { DetectorMaterialViewer } from '@/components/detectors/DetectorMaterialViewer';
import { ScienceLiteratureBridge } from '@/components/knowledge/ScienceLiteratureBridge';
import { LabExportBar } from '@/components/ui/LabExportBar';
import { TechnicalTermDeck } from '@/components/ui/TechTermInfo';
import { useGlobalStore } from '@/lib/store';
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
  HeartPulse,
  Box,
  GitBranch,
  CloudLightning,
  Crown,
  EyeOff,
  Magnet,
  Scan,
  Waves,
  Clock,
  Scissors,
  ZoomIn,
  Info,
  ShieldCheck,
} from 'lucide-react';

type SimCategory = 'all' | 'marvel' | 'colliders' | 'detectors' | 'quantum' | 'data';

const SIM_CATEGORIES: { id: SimCategory; label: string }[] = [
  { id: 'all', label: 'All Labs (33)' },
  { id: 'marvel', label: 'TVA & Marvel Labs (8)' },
  { id: 'colliders', label: 'Colliders & Optics (7)' },
  { id: 'detectors', label: 'Experiments & Detectors (8)' },
  { id: 'quantum', label: 'Quantum, Neutrinos & BSM (6)' },
  { id: 'data', label: 'Trigger, Medical & AI (4)' },
];

function SimulationsContent() {
  const searchParams = useSearchParams();
  const initialModule = searchParams.get('module') || 'lhc';
  const [activeTab, setActiveTab] = useState<string>(initialModule);
  const [selectedCategory, setSelectedCategory] = useState<SimCategory>('all');
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeTabRef = useRef<string>(activeTab);
  activeTabRef.current = activeTab;

  useEffect(() => {
    const mod = searchParams.get('module');
    if (mod && mod !== activeTabRef.current) {
      setActiveTab(mod);
      setSelectedCategory('all');
    }
  }, [searchParams]);

  const tabs = [
    { id: 'lhc', category: 'colliders' as SimCategory, label: 'LHC Dynamics', icon: Zap, color: 'text-cern-cyan', shadow: 'shadow-[4px_4px_0px_#00E5FF]' },
    { id: 'lhc-fill', category: 'colliders' as SimCategory, label: 'LHC 24h Fill Control', icon: Clock, color: 'text-emerald-400', shadow: 'shadow-[4px_4px_0px_#00FF66]' },
    { id: 'collision-director', category: 'colliders' as SimCategory, label: '3D Collision Director', icon: Flame, color: 'text-cern-magenta', shadow: 'shadow-[4px_4px_0px_#FF0055]' },
    { id: 'race', category: 'colliders' as SimCategory, label: 'Relativistic Race', icon: Gauge, color: 'text-[#FFE600]', shadow: 'shadow-[4px_4px_0px_#FFE600]' },
    { id: 'optics', category: 'colliders' as SimCategory, label: 'Beam Optics', icon: Orbit, color: 'text-sky-400', shadow: 'shadow-[4px_4px_0px_#38BDF8]' },
    { id: 'crab', category: 'colliders' as SimCategory, label: 'HL-LHC Crab Cavity', icon: Layers, color: 'text-emerald-400', shadow: 'shadow-[4px_4px_0px_#00FF66]' },
    { id: 'fcc', category: 'colliders' as SimCategory, label: 'FCC 91km Collider', icon: Compass, color: 'text-cern-cyan', shadow: 'shadow-[4px_4px_0px_#00E5FF]' },
    { id: 'antimatter', category: 'detectors' as SimCategory, label: 'Antimatter & ALPHA-g', icon: Atom, color: 'text-cern-magenta', shadow: 'shadow-[4px_4px_0px_#FF0055]' },
    { id: 'awake', category: 'detectors' as SimCategory, label: 'AWAKE Plasma', icon: Flame, color: 'text-cern-cyan', shadow: 'shadow-[4px_4px_0px_#00E5FF]' },
    { id: 'alice', category: 'detectors' as SimCategory, label: 'ALICE QGP & Flow', icon: Activity, color: 'text-amber-400', shadow: 'shadow-[4px_4px_0px_#FFE600]' },
    { id: 'lhcb', category: 'detectors' as SimCategory, label: 'LHCb Rare Decays', icon: Sparkles, color: 'text-purple-400', shadow: 'shadow-[4px_4px_0px_#C084FC]' },
    { id: 'isolde', category: 'detectors' as SimCategory, label: 'ISOLDE Nuclear Lab', icon: Magnet, color: 'text-cern-cyan', shadow: 'shadow-[4px_4px_0px_#00E5FF]' },
    { id: 'rich-medipix', category: 'detectors' as SimCategory, label: 'RICH & Medipix X-Ray', icon: Scan, color: 'text-purple-400', shadow: 'shadow-[4px_4px_0px_#C084FC]' },
    { id: 'cloud-chamber', category: 'detectors' as SimCategory, label: 'Cloud Chamber Lab', icon: CloudLightning, color: 'text-cern-cyan', shadow: 'shadow-[4px_4px_0px_#00E5FF]' },
    { id: 'materials', category: 'detectors' as SimCategory, label: '3D Detector Crystals & Nb₃Sn', icon: Box, color: 'text-amber-300', shadow: 'shadow-[4px_4px_0px_#FFE600]' },
    { id: 'tva-timeline', category: 'marvel' as SimCategory, label: 'TVA Sacred Timeline', icon: Clock, color: 'text-[#FFB000]', shadow: 'shadow-[4px_4px_0px_#FFB000]' },
    { id: 'tva-intake', category: 'marvel' as SimCategory, label: 'TVA 40MHz Intake Desk', icon: Scissors, color: 'text-[#FF334B]', shadow: 'shadow-[4px_4px_0px_#FF334B]' },
    { id: 'arc-magnet', category: 'marvel' as SimCategory, label: 'Arc Cryo Magnet HUD', icon: Zap, color: 'text-cern-cyan', shadow: 'shadow-[4px_4px_0px_#00E5FF]' },
    { id: 'quantum-zoom', category: 'marvel' as SimCategory, label: 'Quantum Realm Zoom', icon: ZoomIn, color: 'text-purple-400', shadow: 'shadow-[4px_4px_0px_#C084FC]' },
    { id: 'mirror-dimensions', category: 'marvel' as SimCategory, label: 'Mirror Extra Dimensions', icon: Orbit, color: 'text-amber-400', shadow: 'shadow-[4px_4px_0px_#FFB000]' },
    { id: 'displaced-vertex', category: 'marvel' as SimCategory, label: 'Spider-Glitch Displaced LLP', icon: Activity, color: 'text-cern-magenta', shadow: 'shadow-[4px_4px_0px_#FF0055]' },
    { id: 'monopole-arena', category: 'marvel' as SimCategory, label: 'Magneto Monopole Arena', icon: Magnet, color: 'text-sky-400', shadow: 'shadow-[4px_4px_0px_#38BDF8]' },
    { id: 'bifrost-rays', category: 'marvel' as SimCategory, label: 'Bifrost Heavy-Ion Shower', icon: Sparkles, color: 'text-amber-300', shadow: 'shadow-[4px_4px_0px_#FFE600]' },
    { id: 'neutrinos', category: 'quantum' as SimCategory, label: 'PMNS Neutrinos', icon: Waves, color: 'text-emerald-400', shadow: 'shadow-[4px_4px_0px_#00FF66]' },
    { id: 'feynman', category: 'quantum' as SimCategory, label: 'Feynman S-Matrix', icon: GitBranch, color: 'text-emerald-400', shadow: 'shadow-[4px_4px_0px_#00FF66]' },
    { id: 'sm-3d', category: 'quantum' as SimCategory, label: '3D Standard Model', icon: Atom, color: 'text-[#FFE600]', shadow: 'shadow-[4px_4px_0px_#FFE600]' },
    { id: 'higgs-ewsb', category: 'quantum' as SimCategory, label: 'Higgs Mexican Hat', icon: Crown, color: 'text-[#FFE600]', shadow: 'shadow-[4px_4px_0px_#FFE600]' },
    { id: 'cosmic', category: 'quantum' as SimCategory, label: 'Cosmic Time Machine', icon: Sparkles, color: 'text-cern-cyan', shadow: 'shadow-[4px_4px_0px_#00E5FF]' },
    { id: 'dark-matter', category: 'quantum' as SimCategory, label: 'Dark Matter CAST & MET', icon: EyeOff, color: 'text-purple-400', shadow: 'shadow-[4px_4px_0px_#C084FC]' },
    { id: 'bragg-peak', category: 'data' as SimCategory, label: 'Hadron Therapy & Bragg Peak', icon: HeartPulse, color: 'text-cern-magenta', shadow: 'shadow-[4px_4px_0px_#FF0055]' },
    { id: 'trigger', category: 'data' as SimCategory, label: 'Trigger & DAQ', icon: Gauge, color: 'text-amber-400', shadow: 'shadow-[4px_4px_0px_#FFE600]' },
    { id: 'discovery', category: 'data' as SimCategory, label: '5-Sigma Discovery', icon: Radio, color: 'text-pink-400', shadow: 'shadow-[4px_4px_0px_#FF0055]' },
    { id: 'literature', category: 'data' as SimCategory, label: 'arXiv & Research Bridge', icon: BookOpen, color: 'text-emerald-400', shadow: 'shadow-[4px_4px_0px_#00FF66]' },
  ];

  const visibleTabs =
    selectedCategory === 'all' ? tabs : tabs.filter((t) => t.category === selectedCategory);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('module', tabId);
      window.history.replaceState(null, '', url.toString());
    }
  };

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeTab, selectedCategory, reduceMotion]);

  const handleCategoryChange = (cat: SimCategory) => {
    setSelectedCategory(cat);
    if (cat !== 'all') {
      const firstInCat = tabs.find((t) => t.category === cat);
      const currentInCat = tabs.some((t) => t.id === activeTab && t.category === cat);
      if (!currentInCat && firstInCat) {
        handleTabChange(firstInCat.id);
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="inline-block px-2.5 py-1 bg-cern-cyan text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
            QUANTITATIVE SIMULATION LABORATORY
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LabExportBar title={`CERN-X-${activeTab}`} shareQuery={{ module: activeTab }} />
            <a
              href="#tech-glossary-deck"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cern-cyan hover:bg-sky-300 text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="Jump to interactive technical term info cards for this module"
            >
              <Info className="w-3.5 h-3.5" />
              <span>ⓘ Terms Guide</span>
            </a>
            <Link
              href="/methodology"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas-surface hover:bg-canvas-raised text-white font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="Inspect end-to-end physics methodology and proofs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Methodology</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                handleTabChange('literature');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              title="View peer-reviewed papers and arXiv preprints for all simulations"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>arXiv Papers</span>
            </button>
          </div>
        </div>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
          Interactive Physics &amp; Experiment Simulators
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
          Executable models running on closed-form relativistic physics, exact magnetic rigidity laws,
          PMNS neutrino flavor mixing, Courant-Snyder transfer matrices, and deterministic seeded processes.
        </p>
      </div>

      {/* Domain Category Filters (kept separate above single-row tablist) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase text-text-muted mr-1">
            Domain Filter:
          </span>
          {SIM_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 py-1.5 border-2 border-black font-mono font-bold text-[11px] uppercase cursor-pointer transition-colors ${
                  active
                    ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-canvas-sub text-text-secondary hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Single-Row Horizontally Scrollable Accessible Tablist */}
        <div
          role="tablist"
          aria-label="CERN Simulation Modules"
          className="cern-tablist-scroller flex flex-nowrap items-center gap-2 pb-2 overflow-x-auto text-xs font-mono"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex-none flex items-center gap-1.5 px-3.5 py-2.5 border-2 border-black font-mono font-bold uppercase transition-transform active:scale-95 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? `bg-cern-blue text-white ${tab.shadow} -translate-x-0.5 -translate-y-0.5`
                    : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[3px_3px_0px_#000] hover:bg-canvas-raised'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color} relative z-10`} />
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="simTabAccent"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-cern-cyan"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Animated Tab Viewport */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'lhc' && <LhcSimulator />}
          {activeTab === 'lhc-fill' && <LhcFillCockpitSimulator />}
          {activeTab === 'collision-director' && <LiveCollisionDirector />}
          {activeTab === 'race' && <ParticleRaceSimulator />}
          {activeTab === 'optics' && <BeamOpticsSandbox />}
          {activeTab === 'antimatter' && <AntimatterSimulator />}
          {activeTab === 'awake' && <AwakeSimulator />}
          {activeTab === 'alice' && <AliceFlowSimulator />}
          {activeTab === 'lhcb' && <LhcbDecaySimulator />}
          {activeTab === 'crab' && <CrabCavitySimulator />}
          {activeTab === 'fcc' && <FccSimulator />}
          {activeTab === 'tva-timeline' && <TvaTimelineSimulator />}
          {activeTab === 'tva-intake' && <TvaIntakeDeskSimulator />}
          {activeTab === 'arc-magnet' && <ArcMagnetSimulator />}
          {activeTab === 'quantum-zoom' && <QuantumScaleZoomSimulator />}
          {activeTab === 'mirror-dimensions' && <MirrorDimensionLab />}
          {activeTab === 'displaced-vertex' && <SpiderVertexLab />}
          {activeTab === 'monopole-arena' && <MonopoleArenaSimulator />}
          {activeTab === 'bifrost-rays' && <BifrostHeavyIonSimulator />}
          {activeTab === 'neutrinos' && <NeutrinoOscillationSimulator />}
          {activeTab === 'feynman' && <FeynmanLab />}
          {activeTab === 'sm-3d' && <StandardModelLab />}
          {activeTab === 'isolde' && <IsoldeSimulator />}
          {activeTab === 'rich-medipix' && <MedipixRichSimulator />}
          {activeTab === 'cloud-chamber' && <CloudChamberSimulator />}
          {activeTab === 'higgs-ewsb' && <HiggsMechanismSimulator />}
          {activeTab === 'cosmic' && <CosmicHistoryLab />}
          {activeTab === 'dark-matter' && <DarkMatterHaloscope />}
          {activeTab === 'bragg-peak' && <BraggPeakSimulator />}
          {activeTab === 'materials' && <DetectorMaterialViewer />}
          {activeTab === 'trigger' && <TriggerLab />}
          {activeTab === 'discovery' && <DiscoveryExercise />}
          {activeTab === 'literature' && <ScienceLiteratureBridge />}
        </motion.div>
      </AnimatePresence>

      {/* Per-Module Technical Term Info Cards */}
      <TechnicalTermDeck
        contextId={activeTab}
        heading={`${tabs.find((t) => t.id === activeTab)?.label || 'Simulator'} — Technical Terms & Symbol Info Cards`}
      />
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
