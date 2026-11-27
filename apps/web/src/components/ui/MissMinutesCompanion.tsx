'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGlobalStore } from '@/lib/store';
import { playTemPadClick } from '@/lib/sonifier';
import { Clock, X, Sparkles, ArrowRight } from 'lucide-react';

function MissMinutesInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mod = searchParams.get('module');

  const tvaMode = useGlobalStore((s) => s.tvaMode);
  const toggleTvaMode = useGlobalStore((s) => s.toggleTvaMode);
  const hydrateTvaMode = useGlobalStore((s) => s.hydrateTvaMode);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    hydrateTvaMode();
  }, [hydrateTvaMode]);

  const tip = (() => {
    if (pathname.startsWith('/simulations')) {
      if (mod === 'tva-timeline') {
        return {
          badge: 'TEMPORAL LOOM GUIDE',
          text: 'Well howdy, Agent! Pull the Top Quark slider right to watch λ(μ) dip toward the Red Line—then hit Detonate Time-Charge or switch to the 3D Temporal Loom!',
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
          text: 'Switching from NbTi to Nb₃Sn doubles our superconducting field tolerance past 12 Tesla—just keep Helium at 1.9 K superfluid or magnets quench!',
          nextHref: '/simulations?module=quantum-zoom',
          nextLabel: 'Dive into Quantum Zoom',
        };
      }
      return {
        badge: 'TVA / O.B. ASSISTANT',
        text: 'Try the new TVA & Marvel Labs filter above, or flip on TVA MODE in the header to turn the entire CERN-X platform into a TemPad terminal!',
        nextHref: '/simulations?module=tva-timeline',
        nextLabel: 'Open Sacred Timeline',
      };
    }
    return {
      badge: 'TVA / O.B. GUIDE',
      text: 'Welcome to CERN-X! Check /methodology for live verified KaTeX proofs, click any ⓘ card for technical symbol definitions, or launch the 33 labs!',
      nextHref: '/methodology',
      nextLabel: 'View Methodology',
    };
  })();

  return (
    <div className="fixed bottom-5 right-5 z-40 font-mono">
      {open ? (
        <div className="w-80 sm:w-96 bg-[#1A1006] border-3 border-black shadow-[6px_6px_0px_#000] p-4 space-y-3 cern-tva-scanlines">
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
              onClick={() => playTemPadClick()}
              className="px-2.5 py-1.5 bg-[#23160A] hover:bg-[#33200E] border-2 border-[#FFB000] text-[11px] font-bold text-[#FFE082] flex items-center gap-1"
            >
              <span>{tip.nextLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            playTemPadClick();
            setOpen(true);
          }}
          aria-label="Open Miss Minutes and O.B. interactive guide"
          className={`flex items-center gap-2 px-3 py-2.5 bg-[#FFB000] hover:bg-[#FFC947] text-black border-3 border-black shadow-[4px_4px_0px_#000] font-black text-xs cursor-pointer ${
            !reduceMotion ? 'hover:-translate-y-0.5 transition-transform' : ''
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>O.B. / TVA GUIDE</span>
        </button>
      )}
    </div>
  );
}

export const MissMinutesCompanion: React.FC = () => (
  <Suspense fallback={null}>
    <MissMinutesInner />
  </Suspense>
);
