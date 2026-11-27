'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import projectsData from '../../../../../content/projects.json';
import { CernComplex3DMap } from '@/components/projects/CernComplex3DMap';
import { ColliderScaleOverlay } from '@/components/projects/ColliderScaleOverlay';
import { KnowledgeGraph } from '@/components/knowledge/KnowledgeGraph';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { TechnicalTermDeck } from '@/components/ui/TechTermInfo';
import { SpotlightMotionCard, GsapStaggerSection } from '@/components/motion/CernMotionPrimitives';
import { useGlobalStore } from '@/lib/store';
import {
  Globe,
  Search,
  ArrowRight,
  ExternalLink,
  Compass,
  Cpu,
  HeartPulse,
  Atom,
  Zap,
  Sparkles,
} from 'lucide-react';

interface ProjectEntry {
  id: string;
  name: string;
  category: 'COLLIDERS_FUTURE' | 'EXPERIMENTS' | 'NON_LHC_FACILITIES' | 'COMPUTING_WEB' | 'TECH_MEDICAL';
  status: string;
  years: string;
  location: string;
  physicsMetric: string;
  summary: string;
  eli5: string;
  simLink: string;
  simLabel: string;
  sourceUrl: string;
}

const ALL_PROJECTS = projectsData as ProjectEntry[];

const CATEGORY_TABS = [
  { id: 'ALL', label: `All CERN Projects (${ALL_PROJECTS.length})`, color: 'bg-cern-blue text-white' },
  { id: 'COLLIDERS_FUTURE', label: 'Colliders & Future', color: 'bg-cern-cyan text-black' },
  { id: 'EXPERIMENTS', label: 'Detectors & Physics', color: 'bg-purple-500 text-white' },
  { id: 'NON_LHC_FACILITIES', label: 'Non-LHC Facilities', color: 'bg-amber-400 text-black' },
  { id: 'COMPUTING_WEB', label: 'WWW, ROOT & Grid', color: 'bg-emerald-400 text-black' },
  { id: 'TECH_MEDICAL', label: 'Medical & Aerospace Spin-Offs', color: 'bg-cern-magenta text-white' },
] as const;

export default function ProjectsAtlasPage() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFccProjection, setShowFccProjection] = useState<boolean>(true);
  const [selectedSiteNotice, setSelectedSiteNotice] = useState<string>('IP1 ATLAS (Meyrin) · Depth ~100 m');

  const eli5Mode = useGlobalStore((s) => s.eli5Mode);
  const userLevel = useGlobalStore((s) => s.userLevel);
  const showEli5 = eli5Mode || userLevel === 'BEGINNER';

  const filtered = ALL_PROJECTS.filter((p) => {
    const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.physicsMetric.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-cern-cyan text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
            MASTER ENCYCLOPEDIA &amp; 3D GEO-TUNNEL ATLAS
          </span>
          <span className="px-2 py-1 bg-emerald-400 text-black font-mono font-bold text-[10px] border-2 border-black shadow-[2px_2px_0px_#000]">
            23+ Member States · 17,000+ Scientists Worldwide
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
          Complete CERN Projects, Facilities &amp; Global Spin-Offs
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
          Explore the entire CERN scientific ecosystem—from the 100-meter-deep 27 km LHC and future 91 km FCC
          concept to Antimatter traps, ISOLDE nuclear beams, the invention of the World Wide Web, Medipix3
          space/medical X-ray chips, and hospital cancer accelerators.
        </p>
      </div>

      <Eli5Card
        title="CERN Is Way Bigger Than Just One Tunnel!"
        analogy="Most people know CERN built the LHC, but it’s actually a complete scientific city spanning two countries! Below ground run nested magnetic racetracks from 86 meters up to 27 km wide—while above ground CERN invented the World Wide Web, builds color X-ray cameras for hospitals and astronauts, and trains tomorrow’s cancer-therapy machines."
        keyPoints={[
          'Global Collaboration: Over 17,000 researchers representing 110+ nationalities collaborate openly across borders.',
          'All Data Free & Open: Physics tools like ROOT, Geant4, Zenodo, and Open Data portals empower anyone on Earth.',
          'Spin-Off Impact: From World Wide Web (HTTP/HTML) to Hadron Therapy, Medipix spectral X-rays, and White Rabbit precision timing!',
        ]}
        whatToTry="Drag the 3D Geneva Underground Site Map below, toggle the 91 km Future Circular Collider overlay, and launch live simulations straight from any CERN project card!"
        doi="10.17181/CERN-BROCHURE-FACTS"
        citationLabel="CERN Official Fact Sheet & Knowledge Transfer Portfolio"
      />

      {/* Interactive 3D CERN Terrain & Underground Tunnel Topology */}
      <section className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#00E5FF] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div>
            <h2 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-cern-cyan" /> 3D CERN Underground Complex &amp; FCC Topology
            </h2>
            <p className="text-xs font-mono text-text-muted mt-0.5">
              Active Site Callout: <strong className="text-[#FFE600]">{selectedSiteNotice}</strong>
            </p>
          </div>
          <button
            onClick={() => setShowFccProjection(!showFccProjection)}
            className={`px-3 py-1.5 border-2 border-black font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_#000] transition-all ${
              showFccProjection ? 'bg-cern-magenta text-white' : 'bg-canvas-sub text-text-secondary hover:text-white'
            }`}
          >
            {showFccProjection ? '✓ Showing 91 km FCC Overlay' : '+ Show 91 km FCC Future Ring'}
          </button>
        </div>

        <CernComplex3DMap
          showFccProjection={showFccProjection}
          onSelectSite={(site) => setSelectedSiteNotice(site)}
        />

        {/* Quick CERN Organization Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] text-text-muted uppercase block">Founded</span>
            <strong className="text-white text-sm">29 Sept 1954 (Meyrin)</strong>
          </div>
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] text-text-muted uppercase block">Active Complex</span>
            <strong className="text-cern-cyan text-sm">9 Operational Accelerators</strong>
          </div>
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] text-text-muted uppercase block">Historic Milestones</span>
            <strong className="text-[#FFE600] text-sm">W/Z · Higgs · WWW (1989)</strong>
          </div>
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] text-text-muted uppercase block">Open Data Archive</span>
            <strong className="text-emerald-400 text-sm">&gt;3 Petabytes Public (CC0)</strong>
          </div>
        </div>
      </section>

      {/* True-to-Scale Footprint Overlay */}
      <ColliderScaleOverlay />

      {/* Interactive D3 Scientific Knowledge Constellation */}
      <section className="space-y-3">
        <div className="border-b-2 border-black pb-2">
          <h2 className="text-lg font-display font-extrabold text-white">
            Interactive CERN Scientific Dependency &amp; Spin-Off Graph
          </h2>
        </div>
        <KnowledgeGraph />
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 text-xs font-mono">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-2 border-2 border-black font-bold uppercase whitespace-nowrap transition-all ${
                  isActive
                    ? `${tab.color} shadow-[3px_3px_0px_#000] -translate-x-0.5 -translate-y-0.5`
                    : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FCC, ISOLDE, Medipix, Web..."
            className="w-full pl-9 pr-3 py-2 bg-canvas-surface text-white border-2 border-black font-mono text-xs shadow-[3px_3px_0px_#000] focus:outline-none focus:border-cern-cyan"
          />
        </div>
      </div>

      {/* Master Projects Cards Grid */}
      <GsapStaggerSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((proj) => (
          <SpotlightMotionCard
            key={proj.id}
            className="gsap-stagger-item p-5 bg-canvas-surface border-2 border-black shadow-[5px_5px_0px_#000] hover:shadow-[6px_6px_0px_#00E5FF] transition-shadow"
          >
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2 border-b-2 border-black">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black text-cern-cyan border border-black">
                    {proj.years}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-400 text-black border border-black truncate">
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-lg font-display font-black text-white leading-snug">{proj.name}</h3>

                <div className="p-2 bg-canvas-sub border-2 border-black text-[11px] font-mono text-[#FFE600] font-bold">
                  {proj.physicsMetric}
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    showEli5
                      ? 'p-2.5 bg-amber-300 border-2 border-black text-black font-bold font-sans'
                      : 'text-text-secondary font-sans'
                  }`}
                >
                  {showEli5 ? `👶 ${proj.eli5}` : proj.summary}
                </p>

                <div className="text-[11px] font-mono text-text-muted">
                  Location: <strong className="text-text-primary">{proj.location}</strong>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2">
                <Link
                  href={proj.simLink}
                  className="px-3 py-1.5 bg-cern-blue hover:bg-cern-accent text-white text-xs font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all"
                >
                  <span>{proj.simLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={proj.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono text-cern-cyan hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </SpotlightMotionCard>
        ))}
      </GsapStaggerSection>

      <TechnicalTermDeck contextId="page-projects" heading="CERN Complex & Flagship Facility Terms (ⓘ Info Cards)" />
    </div>
  );
}
