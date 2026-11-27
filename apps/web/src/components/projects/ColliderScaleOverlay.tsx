'use client';

import React, { useState } from 'react';
import { Compass } from 'lucide-react';

interface LandmarkComparison {
  id: string;
  label: string;
  lengthKm: number;
  desc: string;
}

const LANDMARKS: LandmarkComparison[] = [
  { id: 'geneva', label: 'Geneva City + Lake Tip (~6 km)', lengthKm: 6.0, desc: 'The 27 km LHC diameter (8.5 km) easily spans the entire Lake Geneva southern basin.' },
  { id: 'manhattan', label: 'Manhattan Island (~21.5 km long)', lengthKm: 21.5, desc: 'FCC’s 28.9 km diameter is wider than the entire island of Manhattan from Battery Park to Inwood!' },
  { id: 'paris', label: 'Paris Périphérique Ring (~11 km dia)', lengthKm: 11.0, desc: 'FCC (28.9 km wide) would surround almost three Paris ring roads.' },
];

export const ColliderScaleOverlay: React.FC = () => {
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>('manhattan');
  const lm = LANDMARKS.find((l) => l.id === selectedLandmarkId) || LANDMARKS[1];

  // SVG viewport: 34 km across -> diameter scale
  const scalePxPerKm = 7.6;

  return (
    <section className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
        <div>
          <h2 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#FFE600]" /> True-to-Scale CERN Ring Footprint Comparator
          </h2>
          <p className="text-xs font-sans text-text-secondary mt-0.5">
            Strict geometric diameter scale from PS (0.20 km) → SPS (2.20 km) → LHC (8.49 km) → Future FCC (28.87 km).
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
          {LANDMARKS.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLandmarkId(l.id)}
              className={`px-2.5 py-1 border-2 border-black font-bold uppercase ${
                selectedLandmarkId === l.id ? 'bg-[#FFE600] text-black' : 'bg-canvas-sub text-text-secondary hover:text-white'
              }`}
            >
              {l.label.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        <div className="lg:col-span-7 bg-[#050811] border-2 border-black p-3 flex items-center justify-center w-full">
          <svg viewBox="0 0 320 240" className="w-full max-w-md min-h-[220px] h-56 block">
            {/* FCC 90.7 km (d = 28.87 km) */}
            <circle cx="160" cy="120" r={(28.87 / 2) * scalePxPerKm} fill="rgba(255,0,85,0.06)" stroke="#FF0055" strokeWidth="2.5" strokeDasharray="5 3" />
            {/* LHC 26.7 km (d = 8.49 km) */}
            <circle cx="160" cy="120" r={(8.49 / 2) * scalePxPerKm} fill="rgba(0,229,255,0.12)" stroke="#00E5FF" strokeWidth="2.5" />
            {/* SPS 6.9 km (d = 2.20 km) */}
            <circle cx="122" cy="134" r={(2.2 / 2) * scalePxPerKm} fill="rgba(76,125,255,0.25)" stroke="#4C7DFF" strokeWidth="2" />
            {/* PS 628 m (d = 0.20 km) visible dot */}
            <circle cx="110" cy="142" r="2.2" fill="#00FF66" />

            {/* Selected City Reference Bar */}
            <line
              x1={160 - (lm.lengthKm / 2) * scalePxPerKm}
              y1="226"
              x2={160 + (lm.lengthKm / 2) * scalePxPerKm}
              y2="226"
              stroke="#FFE600"
              strokeWidth="4"
            />
            <text x="160" y="218" fill="#FFE600" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {lm.label}
            </text>
          </svg>
        </div>

        <div className="lg:col-span-5 space-y-2.5 text-xs font-mono">
          <div className="p-3 bg-canvas-sub border-2 border-black">
            <span className="text-cern-magenta font-bold block">FCC (90.7 km circumference)</span>
            <span className="text-text-secondary">Diameter: 28.87 km · 1 lap @ c = 302.5 μs</span>
          </div>
          <div className="p-3 bg-canvas-sub border-2 border-black">
            <span className="text-cern-cyan font-bold block">LHC (26.66 km circumference)</span>
            <span className="text-text-secondary">Diameter: 8.49 km · 1 lap @ c = 88.9 μs (11,245 Hz)</span>
          </div>
          <div className="p-3 bg-canvas-sub border-2 border-black">
            <span className="text-cern-accent font-bold block">SPS (6.91 km) &amp; PS (0.63 km)</span>
            <span className="text-text-secondary">Diameters: 2.20 km &amp; 0.20 km</span>
          </div>
          <p className="text-[11px] text-[#FFE600] font-sans leading-relaxed pt-1">
            {lm.desc}
          </p>
        </div>
      </div>
    </section>
  );
};
