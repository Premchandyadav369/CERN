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
    <header className="sticky top-0 z-40 w-full border-b border-canvas-border bg-canvas/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-mono font-bold text-lg tracking-wider text-text-primary px-2 py-0.5 border border-cern-blue/60 bg-cern-blue/20 rounded">
              CERN-X
            </span>
            <span className="hidden sm:inline-block text-xs font-mono text-text-muted">
              DIGITAL UNIVERSE
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded transition-colors ${
                    isActive
                      ? 'bg-cern-blue text-white font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-canvas-raised'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Utility Bar */}
        <div className="flex items-center gap-3">
          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono bg-canvas-surface hover:bg-canvas-raised border border-canvas-border rounded text-text-secondary hover:text-text-primary transition-colors"
            title="Search pages, particles, datasets (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline-block px-1 bg-canvas-sub border border-canvas-border rounded text-[10px] text-text-muted">
              ⌘K
            </kbd>
          </button>

          {/* Level Switcher (Beginner / Undergrad / Researcher) */}
          <div className="hidden md:flex items-center p-0.5 bg-canvas-surface border border-canvas-border rounded text-[11px] font-mono">
            {(['BEGINNER', 'UNDERGRAD', 'RESEARCHER'] as UserLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setUserLevel(level)}
                className={`px-2 py-0.5 rounded transition-all ${
                  userLevel === level
                    ? 'bg-cern-accent text-white font-bold'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
                title={`Explanatory depth level: ${level}`}
              >
                {level.charAt(0) + level.slice(1, 4).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Data Class Overlay Toggle */}
          <button
            onClick={() => setDataClassOverlay(!dataClassOverlay)}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-mono rounded border transition-colors ${
              dataClassOverlay
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-950'
                : 'bg-canvas-surface border-canvas-border text-text-muted hover:text-text-primary'
            }`}
            title="Toggle provenance color overlay: REAL (Green), PUBLISHED (Blue), COMPUTED (Amber)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">PROVENANCE</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Sub-bar */}
      <div className="xl:hidden flex items-center overflow-x-auto gap-2 px-4 py-1.5 border-t border-canvas-border bg-canvas-surface text-xs scrollbar-none">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              pathname === link.href ? 'bg-cern-blue text-white' : 'text-text-secondary'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
};
