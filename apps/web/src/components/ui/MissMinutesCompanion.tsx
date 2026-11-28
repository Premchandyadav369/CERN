'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGlobalStore } from '@/lib/store';
import { playTemPadClick } from '@/lib/sonifier';
import { Clock, X, ArrowRight } from 'lucide-react';

function MissMinutesInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mod = searchParams.get('module');

  const tvaMode = useGlobalStore((s) => s.tvaMode);
  const toggleTvaMode = useGlobalStore((s) => s.toggleTvaMode);
  const hydrateTvaMode = useGlobalStore((s) => s.hydrateTvaMode);
  const open = useGlobalStore((s) => s.companionOpen);
  const setOpen = useGlobalStore((s) => s.setCompanionOpen);

  useEffect(() => {
    hydrateTvaMode();
  }, [hydrateTvaMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const tip = (() => {
    if (pathname.startsWith('/simulations')) {
      if (mod === 'tva-timeline') {
        return {
          badge: 'TEMPORAL LOOM GUIDE',
          text: 'Pull the Top Quark slider right to watch λ(μ) dip toward the Red Line—then hit Detonate Time-Charge or switch to the 3D Temporal Loom!',
          nextHref: '/simulations?module=tva-intake',
          nextLabel: 'Try TVA Intake Desk',
        };
      }
      if (mod === 'tva-intake') {
        return {
          badge: 'MINUTEMAN DISPATCH',
          text: 'LHC sprays 40 million events a second! Stamp KEEP on crisp 125 GeV Higgs or Z⁰ pairs, and PRUNE noisy QCD jets before buffer overflow!',
          nextHref: '/simulations?module=arc-magnet',
          nextLabel: 'Try Arc Magnet HUD',
        };
      }
      if (mod === 'arc-magnet') {
        return {
          badge: 'O.B. CRYO CHECK',
          text: 'Switching from NbTi to Nb₃Sn doubles superconducting field tolerance past 12 Tesla—keep Helium below 2.17 K superfluid or magnets quench!',
          nextHref: '/simulations?module=quantum-zoom',
          nextLabel: 'Dive into Quantum Zoom',
        };
      }
      return {
        badge: 'TVA / O.B. ASSISTANT',
        text: 'Filter by TVA & Marvel Labs above, or toggle TVA MODE in the header to switch the platform into a TemPad CRT terminal!',
        nextHref: '/simulations?module=tva-timeline',
        nextLabel: 'Open Sacred Timeline',
      };
    }
    if (pathname.startsWith('/open-data') || pathname.startsWith('/detectors')) {
      return {
        badge: 'EVENT RECONSTRUCTION GUIDE',
        text: 'Filter real 13 TeV ATLAS & CMS events in Open Data, then click "Inspect in 3D" to reconstruct that exact collision in the 3D Detector Twin!',
        nextHref: '/detectors',
        nextLabel: 'Open 3D Detector Twin',
      };
    }
    return {
      badge: 'TVA / O.B. GUIDE',
      text: 'Welcome to PARTON! Check /methodology for live KaTeX proofs, /brand for downloadable SVG/PNG icons, or press ? for operator shortcuts.',
      nextHref: '/methodology',
      nextLabel: 'View Methodology',
    };
  })();

  // Anchored on-demand top-right disclosure (never occludes bottom-right sliders or cards when closed)
  if (!open) return null;

  return (
    <aside
      role="dialog"
      aria-label="O.B. and TVA Interactive Guide"
      className="fixed top-16 right-4 z-50 w-80 sm:w-96 bg-[#1A1006] border-3 border-black shadow-[6px_6px_0px_#000] p-4 space-y-3 font-mono cern-tva-scanlines"
    >
      <div className="flex items-center justify-between border-b border-[#4A2E10] pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#FFB000] border-2 border-black flex items-center justify-center">
            <Clock className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#FFB000] uppercase tracking-wider">
              {tip.badge}
            </div>
            <div className="text-xs font-bold text-[#FFE082]">
              Miss Minutes // O.B. Helper
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close TVA guide assistant"
          onClick={() => setOpen(false)}
          className="p-1 bg-[#23160A] border border-black text-[#FFE082] hover:bg-black cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs text-[#FFF4DC] leading-relaxed">{tip.text}</p>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            playTemPadClick();
            toggleTvaMode();
          }}
          className={`px-2.5 py-1.5 border-2 border-black text-[11px] font-black cursor-pointer ${
            tvaMode
              ? 'bg-emerald-400 text-black'
              : 'bg-[#FFB000] text-black hover:bg-[#FFC947]'
          }`}
        >
          {tvaMode ? 'TVA THEME: ON' : 'ENABLE TVA THEME'}
        </button>

        <Link
          href={tip.nextHref}
          onClick={() => {
            playTemPadClick();
            setOpen(false);
          }}
          className="px-2.5 py-1.5 bg-[#23160A] hover:bg-[#33200E] border-2 border-[#FFB000] text-[11px] font-bold text-[#FFE082] flex items-center gap-1"
        >
          <span>{tip.nextLabel}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
}

export const MissMinutesCompanion: React.FC = () => (
  <Suspense fallback={null}>
    <MissMinutesInner />
  </Suspense>
);
