'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGlobalStore, UserLevel } from '@/lib/store';
import {
  Search,
  Eye,
  Activity,
  Layers,
  Cpu,
  Zap,
  Atom,
  BookOpen,
  Sliders,
  ExternalLink,
} from 'lucide-react';

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
  const setCommandPaletteOpen = useGlobalStore((s) => s.setCommandPaletteOpen);

  const navLinks = [
    { href: '/', label: 'Ring Map' },
    { href: '/accelerators', label: 'Accelerators' },
    { href: '/experiments', label: 'Experiments' },
    { href: '/detectors', label: 'Detectors' },
    { href: '/simulations', label: 'Simulations' },
    { href: '/computing', label: 'Computing' },
    { href: '/engineering', label: 'Engineering' },
    { href: '/ai-lab', label: 'AI Lab' },
    { href: '/open-data', label: 'Open Data' },
    { href: '/learn', label: 'Learn' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b-3 border-black bg-canvas/95 backdrop-blur-md shadow-[0_4px_0_0_#000]">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-mono font-bold text-base tracking-wider text-white px-2.5 py-1 border-2 border-black bg-cern-blue shadow-[3px_3px_0px_#00E5FF] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[4px_4px_0px_#00E5FF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
              CERN-X
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono font-bold tracking-widest text-cern-cyan bg-canvas-surface px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000]">
              DIGITAL UNIVERSE
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs font-mono font-bold">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1 rounded-none border-2 transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                    isActive
                      ? 'bg-cern-blue border-black text-white shadow-[3px_3px_0px_#000]'
                      : 'border-transparent text-text-secondary hover:text-white hover:border-black hover:bg-canvas-raised hover:shadow-[3px_3px_0px_#000]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Utility Bar */}
        <div className="flex items-center gap-2.5">
          {/* Live Accelerator Status Beacon */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] text-[11px] font-mono text-emerald-400 font-bold">
            <span className="w-2 h-2 bg-emerald-400 border border-black shadow-[1px_1px_0px_#000] animate-pulse" />
            <span className="tracking-wider">LHC: BEAM 1 &amp; 2 (6.8 TeV)</span>
          </div>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono font-bold bg-canvas-surface hover:bg-canvas-raised border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[3px_3px_0px_#00E5FF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-text-secondary hover:text-white transition-all"
            title="Search pages, particles, datasets (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-cern-cyan" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline-block px-1 bg-black border-2 border-black text-[10px] text-cern-cyan font-bold shadow-[2px_2px_0px_#00E5FF]">
              ⌘K
            </kbd>
          </button>

          {/* Level Switcher (Beginner / Undergrad / Researcher) */}
          <div className="hidden md:flex items-center p-0.5 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] text-[11px] font-mono">
            {(['BEGINNER', 'UNDERGRAD', 'RESEARCHER'] as UserLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setUserLevel(level)}
                className={`px-2 py-0.5 font-bold transition-all ${
                  userLevel === level
                    ? 'bg-cern-accent text-white border-2 border-black shadow-[1px_1px_0px_#000]'
                    : 'border-2 border-transparent text-text-muted hover:text-white'
                }`}
                title={`Explanatory depth level: ${level}`}
              >
                {level.charAt(0) + level.slice(1, 4).toLowerCase()}
              </button>
            ))}
          </div>

          {/* High-Contrast Neobrutalist ELI5 Toggle Button */}
          <button
            onClick={toggleEli5Mode}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
              eli5Mode
                ? 'bg-amber-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-canvas-surface text-text-secondary hover:text-white hover:bg-canvas-raised'
            }`}
            title={eli5Mode ? "ELI5 (Explain Like I'm 5) mode active - click to disable" : "Enable ELI5 (Explain Like I'm 5) intuitive analogies"}
          >
            <span>👶</span>
            <span>ELI5</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                eli5Mode ? 'bg-black animate-pulse' : 'bg-text-muted'
              }`}
            />
          </button>

          {/* Reduce Motion Accessibility Toggle */}
          <button
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
              reduceMotion
                ? 'bg-amber-400 text-black shadow-[3px_3px_0px_#000]'
                : 'bg-canvas-surface text-text-muted hover:text-white hover:bg-canvas-raised'
            }`}
            title={reduceMotion ? 'Reduced motion active (click to restore animation)' : 'Toggle reduced motion'}
          >
            <span className={`w-1.5 h-1.5 ${reduceMotion ? 'bg-black' : 'bg-text-muted'}`} />
            <span className="hidden xl:inline text-[11px]">MOTION</span>
          </button>

          {/* Data Class Overlay Toggle */}
          <button
            onClick={() => setDataClassOverlay(!dataClassOverlay)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
              dataClassOverlay
                ? 'bg-emerald-400 text-black shadow-[3px_3px_0px_#000]'
                : 'bg-canvas-surface text-text-muted hover:text-white hover:bg-canvas-raised'
            }`}
            title="Toggle provenance color overlay: REAL (Green), PUBLISHED (Blue), COMPUTED (Amber)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">PROVENANCE</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Sub-bar */}
      <div className="xl:hidden flex items-center overflow-x-auto gap-2 px-4 py-2 border-t-3 border-black bg-canvas-surface text-xs scrollbar-none">
        <button
          onClick={toggleEli5Mode}
          className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 border-2 border-black font-mono font-bold text-xs transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ${
            eli5Mode
              ? 'bg-amber-300 text-black shadow-[2px_2px_0px_#000]'
              : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
          }`}
          title={eli5Mode ? "ELI5 mode active - click to disable" : "Enable ELI5 analogies"}
        >
          <span>👶</span>
          <span>ELI5</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              eli5Mode ? 'bg-black animate-pulse' : 'bg-text-muted'
            }`}
          />
        </button>
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-2.5 py-1 border-2 text-xs font-mono font-bold transition-all ${
                isActive
                  ? 'bg-cern-blue border-black text-white shadow-[3px_3px_0px_#000]'
                  : 'border-transparent text-text-secondary hover:text-white hover:border-black hover:shadow-[2px_2px_0px_#000]'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
