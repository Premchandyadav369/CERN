'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGlobalStore, UserLevel, OPERATOR_MISSIONS } from '@/lib/store';
import {
  Search,
  Eye,
  Award,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Activity,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { playTemPadClick } from '@/lib/sonifier';

const LEVEL_OPTIONS: { id: UserLevel; shortLabel: string; fullLabel: string }[] = [
  { id: 'BEGINNER', shortLabel: '101', fullLabel: 'Beginner (101 Intuition)' },
  { id: 'UNDERGRAD', shortLabel: 'BSc', fullLabel: 'Undergraduate Physics' },
  { id: 'RESEARCHER', shortLabel: 'PhD', fullLabel: 'Researcher Equations' },
];

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const userLevel = useGlobalStore((s) => s.userLevel);
  const setUserLevel = useGlobalStore((s) => s.setUserLevel);
  const eli5Mode = useGlobalStore((s) => s.eli5Mode);
  const toggleEli5Mode = useGlobalStore((s) => s.toggleEli5Mode);
  const dataClassOverlay = useGlobalStore((s) => s.dataClassOverlay);
  const setDataClassOverlay = useGlobalStore((s) => s.setDataClassOverlay);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const setReduceMotion = useGlobalStore((s) => s.setReduceMotion);
  const soundEnabled = useGlobalStore((s) => s.soundEnabled);
  const toggleSoundEnabled = useGlobalStore((s) => s.toggleSoundEnabled);
  const tvaMode = useGlobalStore((s) => s.tvaMode);
  const toggleTvaMode = useGlobalStore((s) => s.toggleTvaMode);
  const setMissionsOpen = useGlobalStore((s) => s.setMissionsOpen);
  const completedMissions = useGlobalStore((s) => s.completedMissions);
  const betCredits = useGlobalStore((s) => s.betCredits);
  const hydrateBets = useGlobalStore((s) => s.hydrateBets);
  const companionOpen = useGlobalStore((s) => s.companionOpen);
  const toggleCompanion = useGlobalStore((s) => s.toggleCompanion);
  const setCommandPaletteOpen = useGlobalStore((s) => s.setCommandPaletteOpen);

  useEffect(() => {
    hydrateBets();
  }, [hydrateBets]);

  const [lhcStatusOpen, setLhcStatusOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Ring Map' },
    { href: '/projects', label: 'Projects' },
    { href: '/accelerators', label: 'Accelerators' },
    { href: '/experiments', label: 'Experiments' },
    { href: '/detectors', label: 'Detectors' },
    { href: '/simulations', label: 'Simulations' },
    { href: '/computing', label: 'Computing' },
    { href: '/engineering', label: 'Engineering' },
    { href: '/ai-lab', label: 'AI Lab' },
    { href: '/open-data', label: 'Open Data' },
    { href: '/learn', label: 'Learn' },
    { href: '/methodology', label: 'Methodology' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b-3 border-black bg-canvas/95 backdrop-blur-md shadow-[0_4px_0_0_#000]">
      {/* Primary Brand & Controls Row */}
      <div className="flex items-center justify-between gap-2 px-3 lg:px-6 h-13">
        {/* Left: Brand & Live Machine Cycle Disclosure */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <AppLogo size={30} />
            <span className="font-mono font-bold text-sm sm:text-base tracking-wider text-white px-2 py-0.5 border-2 border-black bg-cern-blue shadow-[3px_3px_0px_#00E5FF] group-hover:-translate-x-px group-hover:-translate-y-px transition-all">
              CERN-X
            </span>
          </Link>

          {/* Compact LHC Run 3 Status Disclosure */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setLhcStatusOpen((o) => !o)}
              aria-expanded={lhcStatusOpen}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-canvas-surface hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] font-mono text-emerald-400 font-bold whitespace-nowrap cursor-pointer"
              title="View LHC Run 3 Nominal Cycle Telemetry"
            >
              <span className="w-2 h-2 bg-emerald-400 border border-black" />
              <span className="tracking-wider">LHC: 6.8 TeV</span>
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </button>

            {lhcStatusOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-canvas-surface border-2 border-black shadow-[5px_5px_0px_#00E5FF] p-3 text-xs font-mono space-y-2 z-50">
                <div className="flex items-center justify-between border-b border-black pb-1.5">
                  <span className="font-black text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" /> LHC RUN 3 NOMINAL STATE
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-400 text-black font-black">
                    STABLE BEAMS
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Center-of-Mass √s:</span>
                    <span className="text-cern-cyan font-bold">13.6 TeV (2×6.8)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Cycle Phase:</span>
                    <span className="text-white font-bold">Inject → Ramp → Squeeze → Collide</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Cryostat Bath Temp:</span>
                    <span className="text-cern-cyan font-bold">1.90 K (He-II)</span>
                  </div>
                </div>
                <Link
                  href="/simulations?module=lhc-fill"
                  onClick={() => setLhcStatusOpen(false)}
                  className="block w-full text-center py-1.5 bg-cern-blue hover:bg-cern-accent text-white font-bold border-2 border-black text-[11px]"
                >
                  Open 24h Fill Control Simulator →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Utility Controls */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-canvas-surface hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[2px_2px_0px_#00E5FF] text-text-secondary hover:text-white transition-all cursor-pointer"
            title="Search pages, particles, datasets (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-cern-cyan" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden lg:inline-block px-1 bg-black border border-cern-cyan/40 text-[10px] text-cern-cyan font-bold">
              ⌘K
            </kbd>
          </button>

          {/* Level Switcher (101 / BSc / PhD — crisp untruncated badges) */}
          <div
            role="group"
            aria-label="Physics depth level"
            className="hidden sm:flex items-center p-0.5 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] font-mono"
          >
            {LEVEL_OPTIONS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setUserLevel(lvl.id)}
                className={`px-2 py-0.5 font-bold transition-colors cursor-pointer ${
                  userLevel === lvl.id
                    ? 'bg-cern-accent text-white border border-black'
                    : 'border border-transparent text-text-muted hover:text-white'
                }`}
                aria-label={lvl.fullLabel}
                title={lvl.fullLabel}
              >
                {lvl.shortLabel}
              </button>
            ))}
          </div>

          {/* ELI5 Toggle */}
          <button
            type="button"
            onClick={toggleEli5Mode}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] transition-colors cursor-pointer ${
              eli5Mode
                ? 'bg-amber-300 text-black'
                : 'bg-canvas-surface text-text-secondary hover:text-white hover:bg-canvas-raised'
            }`}
            title={eli5Mode ? "ELI5 analogies active" : "Enable ELI5 analogies"}
          >
            <span>ELI5</span>
          </button>

          {/* Reduce Motion Accessibility Toggle */}
          <button
            type="button"
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] transition-colors cursor-pointer ${
              reduceMotion
                ? 'bg-amber-400 text-black'
                : 'bg-canvas-surface text-text-muted hover:text-white hover:bg-canvas-raised'
            }`}
            title={reduceMotion ? 'Reduced motion active (click to restore animation)' : 'Toggle reduced motion'}
          >
            <span className={`w-1.5 h-1.5 ${reduceMotion ? 'bg-black' : 'bg-text-muted'}`} />
            <span className="hidden xl:inline text-[11px]">MOTION</span>
          </button>

          {/* TVA Theme Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={tvaMode}
            onClick={() => {
              playTemPadClick();
              toggleTvaMode();
            }}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-mono font-black border-2 border-black shadow-[2px_2px_0px_#000] transition-colors cursor-pointer ${
              tvaMode
                ? 'bg-[#FFB000] text-black'
                : 'bg-canvas-surface text-[#FFB000] hover:bg-canvas-raised'
            }`}
            title={tvaMode ? 'Disable TVA Retro CRT Theme' : 'Activate TVA Retro CRT Theme'}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">TVA</span>
          </button>

          {/* Docked O.B. / TVA Guide Trigger (replaces floating corner blocker!) */}
          <button
            type="button"
            onClick={() => {
              playTemPadClick();
              toggleCompanion();
            }}
            aria-expanded={companionOpen}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-mono font-black border-2 border-black shadow-[2px_2px_0px_#000] transition-colors cursor-pointer ${
              companionOpen
                ? 'bg-[#FFC947] text-black'
                : 'bg-[#FFB000] text-black hover:bg-[#FFC947]'
            }`}
            title="Open contextual O.B. / TVA lab guide"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">GUIDE</span>
          </button>

          {/* Beam Credits Live Balance Pill */}
          <Link
            href="/simulations"
            className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-mono font-black border-2 border-black bg-black text-[#00FF66] shadow-[2px_2px_0px_#000] hover:bg-zinc-900"
            title="Beam Credits earned from Interactive Physics Bets"
          >
            <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
            <span className="text-[11px]">{betCredits}⚡</span>
          </Link>

          {/* Operator Missions Button */}
          <button
            type="button"
            onClick={() => setMissionsOpen(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono font-bold border-2 border-black bg-[#FFE600] text-black shadow-[2px_2px_0px_#000] hover:bg-yellow-300 cursor-pointer"
            title="Open CERN Operator Missions & Badges"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="text-[11px]">{completedMissions.length}/{OPERATOR_MISSIONS.length}</span>
          </button>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={toggleSoundEnabled}
            className={`p-1.5 border-2 border-black shadow-[2px_2px_0px_#000] transition-colors cursor-pointer ${
              soundEnabled ? 'bg-cern-cyan text-black' : 'bg-canvas-surface text-text-muted hover:text-white'
            }`}
            aria-label={soundEnabled ? 'Mute collider sound' : 'Enable collider sound'}
            title={soundEnabled ? 'Collider Audio ON (click to mute)' : 'Enable optional Collider Audio pulses'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Data Class Provenance Overlay Toggle */}
          <button
            type="button"
            onClick={() => setDataClassOverlay(!dataClassOverlay)}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] transition-colors cursor-pointer ${
              dataClassOverlay
                ? 'bg-emerald-400 text-black'
                : 'bg-canvas-surface text-text-muted hover:text-white hover:bg-canvas-raised'
            }`}
            title="Toggle provenance color overlay: REAL, PUBLISHED, COMPUTED"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">DATA</span>
          </button>
        </div>
      </div>

      {/* Single Semantic Primary Navigation Row (cleanly scrollable on narrow screens, zero clipping at 1280/1440px) */}
      <nav
        aria-label="Primary"
        className="flex items-center overflow-x-auto gap-1 px-3 lg:px-6 py-1.5 border-t-2 border-black bg-canvas-surface text-xs font-mono scrollbar-none"
      >
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={`whitespace-nowrap px-2.5 py-1 border-2 text-[11px] font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-cern-blue border-cern-cyan text-white shadow-[2px_2px_0px_#000]'
                  : 'border-transparent text-text-secondary hover:text-white hover:border-black hover:bg-canvas-raised'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
