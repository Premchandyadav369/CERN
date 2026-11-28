import React from 'react';
import Link from 'next/link';
import { BrandKitStudio } from '@/components/brand/BrandKitStudio';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function BrandPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="inline-block px-2.5 py-1 bg-cern-cyan text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
            PARTON VISUAL IDENTITY &amp; APP ICON STUDIO
          </span>
          <Link
            href="/methodology"
            className="px-3 py-1.5 bg-canvas-surface hover:bg-canvas-raised text-white font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Methodology</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <h1 className="text-3xl lg:text-4xl font-display font-black text-white tracking-tight">
          PARTON Brand Logo, App Icons &amp; Asset Downloader
        </h1>
        <p className="text-sm text-text-secondary mt-2 cern-prose leading-relaxed font-sans">
          Preview the full proton-confinement collider emblem and minimal app icon across contrast
          surfaces, test legibility down to 16 px favicons, install the PWA desktop icon, or export
          vector SVGs and high-resolution PNG assets with one click.
        </p>
      </div>

      <Eli5Card
        title="Why Is Our Logo Shaped Like a Glowing Triangle Inside a Magnet Ring?"
        analogy="At CERN, protons look simple from far away, but zoom inside one and Feynman discovered it is packed with three dancing valence quarks held together by rubber-band gluon force lines! When two protons slam head-on at 13.6 TeV, two of those tiny partons collide right at the golden center star."
        keyPoints={[
          '3 Valence Quarks: Represented by the Cyan (Up), Gold (Up), and Magenta (Down) color-confinement nodes.',
          'Gluon Sea Ellipses: Crossed cyan and magenta orbital loops symbolize strong-force exchange inside high-energy protons.',
          'Simple App Icon Variant: Distills the emblem down to clean geometric shapes that stay razor-sharp at 16 px tab size!',
        ]}
        whatToTry="Switch between Collider Emblem, Simple App Icon, and Monochrome Stamp below—then download PNG or SVG sizes directly!"
      />

      <BrandKitStudio />
    </div>
  );
}
