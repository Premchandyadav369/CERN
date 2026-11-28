'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LabExportBar } from '@/components/ui/LabExportBar';
import { TechnicalTermDeck } from '@/components/ui/TechTermInfo';
import { PhysicsBetArena } from '@/components/simulations/PhysicsBetArena';
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

const SimLoading = () => (
  <div className="w-full h-72 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000] flex flex-col items-center justify-center gap-2 font-mono text-xs text-cern-cyan">
    <div className="w-6 h-6 border-2 border-cern-cyan border-t-transparent rounded-full animate-spin" />
    <span>INITIALIZING INSTRUMENT CHUNK...</span>
  </div>
);

const LhcSimulator = dynamic(() => import('@/components/simulations/LhcSimulator').then((m) => m.LhcSimulator), { loading: SimLoading });
const TriggerLab = dynamic(() => import('@/components/simulations/TriggerLab').then((m) => m.TriggerLab), { loading: SimLoading });
const DiscoveryExercise = dynamic(() => import('@/components/simulations/DiscoveryExercise').then((m) => m.DiscoveryExercise), { loading: SimLoading });
const BeamOpticsSandbox = dynamic(() => import('@/components/simulations/BeamOpticsSandbox').then((m) => m.BeamOpticsSandbox), { loading: SimLoading });
const AntimatterSimulator = dynamic(() => import('@/components/simulations/AntimatterSimulator').then((m) => m.AntimatterSimulator), { loading: SimLoading });
const AwakeSimulator = dynamic(() => import('@/components/simulations/AwakeSimulator').then((m) => m.AwakeSimulator), { loading: SimLoading });
const AliceFlowSimulator = dynamic(() => import('@/components/simulations/AliceFlowSimulator').then((m) => m.AliceFlowSimulator), { loading: SimLoading });
const LhcbDecaySimulator = dynamic(() => import('@/components/simulations/LhcbDecaySimulator').then((m) => m.LhcbDecaySimulator), { loading: SimLoading });
const CrabCavitySimulator = dynamic(() => import('@/components/simulations/CrabCavitySimulator').then((m) => m.CrabCavitySimulator), { loading: SimLoading });
const FccSimulator = dynamic(() => import('@/components/simulations/FccSimulator').then((m) => m.FccSimulator), { loading: SimLoading });
const BraggPeakSimulator = dynamic(() => import('@/components/simulations/BraggPeakSimulator').then((m) => m.BraggPeakSimulator), { loading: SimLoading });
const FeynmanLab = dynamic(() => import('@/components/simulations/FeynmanLab').then((m) => m.FeynmanLab), { loading: SimLoading });
const CloudChamberSimulator = dynamic(() => import('@/components/simulations/CloudChamberSimulator').then((m) => m.CloudChamberSimulator), { loading: SimLoading });
const HiggsMechanismSimulator = dynamic(() => import('@/components/simulations/HiggsMechanismSimulator').then((m) => m.HiggsMechanismSimulator), { loading: SimLoading });
const DarkMatterHaloscope = dynamic(() => import('@/components/simulations/DarkMatterHaloscope').then((m) => m.DarkMatterHaloscope), { loading: SimLoading });
const StandardModelLab = dynamic(() => import('@/components/simulations/StandardModelLab').then((m) => m.StandardModelLab), { loading: SimLoading });
const IsoldeSimulator = dynamic(() => import('@/components/simulations/IsoldeSimulator').then((m) => m.IsoldeSimulator), { loading: SimLoading });
const MedipixRichSimulator = dynamic(() => import('@/components/simulations/MedipixRichSimulator').then((m) => m.MedipixRichSimulator), { loading: SimLoading });
const CosmicHistoryLab = dynamic(() => import('@/components/simulations/CosmicHistoryLab').then((m) => m.CosmicHistoryLab), { loading: SimLoading });
const LiveCollisionDirector = dynamic(() => import('@/components/simulations/LiveCollisionDirector').then((m) => m.LiveCollisionDirector), { loading: SimLoading });
const ParticleRaceSimulator = dynamic(() => import('@/components/simulations/ParticleRaceSimulator').then((m) => m.ParticleRaceSimulator), { loading: SimLoading });
const NeutrinoOscillationSimulator = dynamic(() => import('@/components/simulations/NeutrinoOscillationSimulator').then((m) => m.NeutrinoOscillationSimulator), { loading: SimLoading });
const LhcFillCockpitSimulator = dynamic(() => import('@/components/simulations/LhcFillCockpitSimulator').then((m) => m.LhcFillCockpitSimulator), { loading: SimLoading });
const TvaTimelineSimulator = dynamic(() => import('@/components/simulations/TvaTimelineSimulator').then((m) => m.TvaTimelineSimulator), { loading: SimLoading });
const TvaIntakeDeskSimulator = dynamic(() => import('@/components/simulations/TvaIntakeDeskSimulator').then((m) => m.TvaIntakeDeskSimulator), { loading: SimLoading });
const ArcMagnetSimulator = dynamic(() => import('@/components/simulations/ArcMagnetSimulator').then((m) => m.ArcMagnetSimulator), { loading: SimLoading });
const QuantumScaleZoomSimulator = dynamic(() => import('@/components/simulations/QuantumScaleZoomSimulator').then((m) => m.QuantumScaleZoomSimulator), { loading: SimLoading });
const MirrorDimensionLab = dynamic(() => import('@/components/simulations/MirrorDimensionLab').then((m) => m.MirrorDimensionLab), { loading: SimLoading });
const SpiderVertexLab = dynamic(() => import('@/components/simulations/SpiderVertexLab').then((m) => m.SpiderVertexLab), { loading: SimLoading });
const MonopoleArenaSimulator = dynamic(() => import('@/components/simulations/MonopoleArenaSimulator').then((m) => m.MonopoleArenaSimulator), { loading: SimLoading });
const BifrostHeavyIonSimulator = dynamic(() => import('@/components/simulations/BifrostHeavyIonSimulator').then((m) => m.BifrostHeavyIonSimulator), { loading: SimLoading });
const DetectorMaterialViewer = dynamic(() => import('@/components/detectors/DetectorMaterialViewer').then((m) => m.DetectorMaterialViewer), { loading: SimLoading });
const ScienceLiteratureBridge = dynamic(() => import('@/components/knowledge/ScienceLiteratureBridge').then((m) => m.ScienceLiteratureBridge), { loading: SimLoading });

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
            <LabExportBar title={`PARTON-${activeTab}`} shareQuery={{ module: activeTab }} />
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

      {/* Domain Category Filters */}
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

      {/* Interactive ELI5 Breakdown + Physics Prediction Bet Arena */}
      <PhysicsBetArena activeModule={activeTab} onSelectModule={handleTabChange} />

      {/* Dynamically Lazy-Loaded Active Simulator Viewport */}
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
