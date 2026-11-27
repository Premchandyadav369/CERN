'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import experimentsData from '../../../../../content/experiments.json';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { TechnicalTermDeck } from '@/components/ui/TechTermInfo';
import { SpotlightMotionCard, GsapStaggerSection } from '@/components/motion/CernMotionPrimitives';
import { useGlobalStore } from '@/lib/store';
import { Value } from '@/components/provenance/Value';
import { ExternalLink, Layers, ArrowRight, Eye, Atom, CheckCircle2, Search } from 'lucide-react';

const EXP_ELI5_SUMMARIES: Record<string, string> = {
  atlas: 'A giant 7-story digital camera that snapped photos of the Higgs boson in 2012 and hunts for invisible dark matter.',
  cms: 'ATLAS’s friendly twin rival inside an ultra-strong magnet—independently checking every big physics discovery with sparkling lead-tungstate crystals.',
  alice: 'The Big Bang time machine: smashes heavy Lead atoms together so hard they melt into the 2-trillion-degree quark soup that filled the baby universe.',
  lhcb: 'A sideways spyglass watching super-fast B-mesons decay to solve why our universe is made of matter instead of vanishing with antimatter.',
  'antimatter-factory': 'The only laboratory on Earth that catches antiprotons, builds neutral antimatter atoms, and drops them to see if antimatter falls down like an apple!',
  awake: 'A plasma surf-wave booster that accelerates electrons 100× faster per meter than normal copper cavities—shrinking future giant colliders.',
  cloud: 'Shoots fake cosmic rays into an ultra-clean sky cloud tank to test how outer-space radiation and pollution form raindrops and clouds!',
  'n-tof': 'Races neutrons down a 200-meter underground track to measure how stars forge heavy gold and uranium atoms inside supernovas.',
  faser: 'A sniper telescope tucked half a kilometer behind ATLAS catching ghostly neutrinos and hidden dark-matter particles flying straight out of LHC collisions.',
  isolde: 'CERN’s isotope forge since 1967: slams 1.4 GeV protons into heavy targets, zaps atoms with lasers, and sorts over 1,300 rare radioactive nuclei with giant magnets!',
  na62: 'Measures ultra-rare 1-in-10-billion kaon decays and hunts invisible dark photons in the CERN North Area fixed-target beamlines.',
  'moedal-mapp': 'Hunts exotic one-pole magnets (magnetic monopoles) and milli-charged particles trapped inside plastic sheets & scintillator stacks around Point 8!',
};

const EXP_SIM_LINKS: Record<string, { href: string; label: string; style: string }> = {
  atlas: { href: '/detectors?detector=atlas', label: 'Open 3D Twin', style: 'bg-cern-blue hover:bg-cern-accent text-white' },
  cms: { href: '/detectors?detector=cms', label: 'Open CMS Twin', style: 'bg-cern-blue hover:bg-cern-accent text-white' },
  'antimatter-factory': { href: '/simulations?module=antimatter', label: 'ALPHA-g Sim', style: 'bg-cern-magenta hover:bg-pink-600 text-white' },
  awake: { href: '/simulations?module=awake', label: 'Wakefield Sim', style: 'bg-cern-cyan hover:bg-sky-300 text-black' },
  alice: { href: '/simulations?module=alice', label: 'QGP Flow Sim', style: 'bg-amber-400 hover:bg-amber-300 text-black' },
  lhcb: { href: '/simulations?module=rich-medipix', label: 'RICH & Flavour Sim', style: 'bg-purple-500 hover:bg-purple-400 text-white' },
  cloud: { href: '/simulations?module=cloud-chamber', label: 'Cloud Chamber', style: 'bg-cern-cyan hover:bg-sky-300 text-black' },
  'n-tof': { href: '/simulations?module=isolde', label: 'Nuclear Chart Lab', style: 'bg-emerald-400 hover:bg-emerald-300 text-black' },
  faser: { href: '/simulations?module=dark-matter', label: 'Dark Matter Sim', style: 'bg-purple-600 hover:bg-purple-500 text-white' },
  isolde: { href: '/simulations?module=isolde', label: 'ISOLDE Separator', style: 'bg-amber-400 hover:bg-amber-300 text-black' },
  na62: { href: '/simulations?module=dark-matter', label: 'Rare/Dark Sim', style: 'bg-emerald-400 hover:bg-emerald-300 text-black' },
  'moedal-mapp': { href: '/projects', label: 'All CERN Projects', style: 'bg-cern-cyan hover:bg-sky-300 text-black' },
};

export default function ExperimentsPage() {
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const eli5Mode = useGlobalStore((s) => s.eli5Mode);
  const userLevel = useGlobalStore((s) => s.userLevel);
  const showEli5 = eli5Mode || userLevel === 'BEGINNER';

  const filteredExperiments = experimentsData.filter((exp) => {
    const matchesTier = filterTier === 'ALL' || exp.tier === filterTier;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      exp.name.toLowerCase().includes(q) ||
      exp.scientificQuestion.toLowerCase().includes(q) ||
      exp.accelerator.toLowerCase().includes(q);
    return matchesTier && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <span className="inline-block px-2.5 py-1 bg-cern-accent text-white font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider mb-3">
          RESEARCH PROGRAMME CATALOGUE
        </span>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
          CERN Experimental Ecosystem
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
          CERN&apos;s experimental programme extends far beyond the LHC, spanning the four flagship
          detectors, forward particle search experiments, the Antimatter Factory, radioactive isotope
          spectroscopy, and advanced plasma acceleration.
        </p>
      </div>

      <Eli5Card
        title="Why Does CERN Build Different Giant Cameras Around the Same Ring?"
        analogy="Think of ATLAS, CMS, ALICE, and LHCb like four specialized wildlife photographers watching the same jungle—using totally different lenses! Two giant general cameras (ATLAS & CMS) check each other’s Higgs discoveries using completely independent designs, while ALICE films molten primordial soup and LHCb catches ultra-fast antimatter glitches."
        keyPoints={[
          'ATLAS & CMS: General-purpose 360° barrel detectors verifying Higgs & new-physics discoveries independently.',
          'ALICE: Optimized for heavy Lead-ion crashes that recreate the universe 1 microsecond after the Big Bang.',
          'LHCb & Non-LHC (ALPHA, ISOLDE, NA62): Asymmetric forward traps catching tiny matter-vs-antimatter differences.',
        ]}
        whatToTry="Filter experiments by DEEP, INTERACTIVE, or KNOWLEDGE fidelity tiers below to explore specialized detectors beyond the main ring!"
        doi="10.1088/1748-0221/3/08/S08001"
        citationLabel="JINST LHC Experiment & Machine Technical Design Compendium"
      />

      {/* Tier Filter Bar + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-mono">
          {['ALL', 'DEEP', 'INTERACTIVE', 'KNOWLEDGE'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-3.5 py-2 border-2 border-black font-mono font-bold uppercase transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] ${
                filterTier === tier
                  ? 'bg-cern-blue text-white shadow-[4px_4px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                  : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[3px_3px_0px_#000] hover:bg-canvas-raised'
              }`}
            >
              {tier === 'ALL' ? 'All Experiments' : `${tier} Tier`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            aria-label="Search CERN experiments"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ATLAS, CLOUD, QGP..."
            className="w-full pl-9 pr-3 py-2 bg-canvas-surface text-white border-2 border-black font-mono text-xs shadow-[3px_3px_0px_#000] focus:outline-none focus:border-cern-cyan"
          />
        </div>
      </div>

      {/* Experiment Cards Grid */}
      <GsapStaggerSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiments.map((exp) => (
          <SpotlightMotionCard
            key={exp.id}
            className="gsap-stagger-item p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#00E5FF] transition-shadow"
          >
            <div className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <span className="text-xs font-mono font-bold text-cern-cyan px-2 py-0.5 bg-black border-2 border-black shadow-[2px_2px_0px_#000]">
                  {exp.accelerator}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000] font-bold uppercase ${
                    exp.tier === 'DEEP'
                      ? 'bg-purple-400 text-black shadow-[2px_2px_0px_#FF0055]'
                      : exp.tier === 'INTERACTIVE'
                      ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#00E5FF]'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {exp.tier} TIER
                </span>
              </div>

              <h2 className="text-xl font-display font-extrabold text-white">{exp.name}</h2>

              <div>
                <span className="text-[10px] font-mono uppercase text-text-muted block mb-1 font-bold">
                  {showEli5 ? '👶 Plain-English Mission' : 'Scientific Question'}
                </span>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  {showEli5 && EXP_ELI5_SUMMARIES[exp.id]
                    ? EXP_ELI5_SUMMARIES[exp.id]
                    : exp.scientificQuestion}
                </p>
              </div>

              {exp.location && (
                <div className="text-[11px] font-mono text-text-muted font-bold">
                  Location: <span className="text-text-primary">{exp.location}</span>
                </div>
              )}

              {/* Subdetectors count */}
              {exp.subdetectors && (
                <div className="pt-2 border-t-2 border-black">
                  <span className="text-[10px] font-mono uppercase text-text-muted block mb-1.5 font-bold">
                    Subsystems &amp; Instrumentation
                  </span>
                  <div className="space-y-1">
                    {exp.subdetectors.slice(0, 2).map((sub) => (
                      <div key={sub.name} className="text-[11px] font-mono text-text-secondary truncate">
                        • {sub.name}
                      </div>
                    ))}
                    {exp.subdetectors.length > 2 && (
                      <div className="text-[10px] font-mono text-cern-cyan font-bold">
                        + {exp.subdetectors.length - 2} more subsystems
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs font-mono">
              <a
                href={exp.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-text-muted hover:text-white flex items-center gap-1 text-[11px] font-bold"
              >
                <span>CERN Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {EXP_SIM_LINKS[exp.id] && (
                <Link
                  href={EXP_SIM_LINKS[exp.id].href}
                  className={`flex items-center gap-1.5 px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#000] font-bold transition-all text-xs ${EXP_SIM_LINKS[exp.id].style}`}
                >
                  <span>{EXP_SIM_LINKS[exp.id].label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            </div>
          </SpotlightMotionCard>
        ))}
      </GsapStaggerSection>

      <TechnicalTermDeck contextId="page-experiments" heading="Experiments & Physics Channels (ⓘ Info Cards)" />
    </div>
  );
}
