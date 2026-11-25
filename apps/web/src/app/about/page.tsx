import React from 'react';
import Link from 'next/link';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { ShieldCheck, AlertTriangle, FileText, ExternalLink, GitBranch, Database } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase bg-cern-cyan text-black px-2 py-0.5 border border-black font-bold tracking-wider shadow-[2px_2px_0px_#000]">
            GOVERNANCE &amp; METHODOLOGY
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight text-text-primary">
          Scientific Honesty, Sources &amp; Provenance
        </h1>
        <p className="text-sm text-text-secondary mt-2 leading-relaxed font-mono">
          Documentation of how CERN-X sources information, validates physics calculations, labels
          simulation fidelity, and ensures reproducible research.
        </p>
      </div>

      <Eli5Card
        title="Why Science Platforms Must Never Make Up Fake Numbers"
        analogy="Think of scientific numbers like ingredients on a food label! Every chart and badge on this website wears a bright sticker telling you whether a number came straight from real CERN detectors ([REAL]), peer-reviewed physics books ([PUBLISHED]), or live equations running in your browser ([COMPUTED])."
        keyPoints={[
          'No Made-Up Demo Bars: Every slider recalculates exact relativistic equations rather than faking animations.',
          'Fidelity Badges: Look for ANALYTIC (exact math), MONTE CARLO (seeded dice rolls), and TOY (simple mental model).',
          'Independent Educational Hub: Built openly to honor CERN Open Science without claiming to be CERN’s official portal.',
        ]}
        whatToTry="Look for the provenance tags beside numbers across the site—clicking them opens the exact journal DOI and dataset citation!"
        doi="10.17181/CERN.OPEN.SCIENCE"
        citationLabel="CERN Open Science Policy & FAIR Data Standards"
      />

      {/* Non-Affiliation Declaration Banner */}
      <div className="p-5 bg-[#FFE600] border-3 border-black text-black shadow-[6px_6px_0px_0px_#000000] space-y-2">
        <div className="flex items-center gap-2 font-mono font-black text-sm uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5 text-black" /> Non-Affiliation Disclaimer
        </div>
        <p className="text-xs font-mono font-bold text-black leading-relaxed">
          CERN-X is an independent educational and research platform developed for open science and
          algorithmic research. It is <strong>NOT affiliated with, officially endorsed by, or operated by
          CERN</strong> (the European Organization for Nuclear Research). Protected CERN logos, marks, and
          proprietary emblems are strictly avoided.
        </p>
      </div>

      {/* The No-Fake-Data Addendum Rules */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-black uppercase text-text-primary">
          1. The Strict &quot;No Fake Data&quot; Policy
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed font-mono">
          In physics, trust is paramount. Every number, series, event, or metric rendered on CERN-X must
          strictly belong to one of three data classes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_0px_#00FF66] space-y-1.5">
            <span className="text-emerald-400 font-black block text-sm uppercase">[REAL]</span>
            <p className="text-[11px] text-text-secondary font-mono leading-relaxed">
              Unmodified data released by CERN Open Data or official collaborations.
            </p>
          </div>
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_0px_#00E5FF] space-y-1.5">
            <span className="text-cern-cyan font-black block text-sm uppercase">[PUBLISHED]</span>
            <p className="text-[11px] text-text-secondary font-mono leading-relaxed">
              Transcribed directly from peer-reviewed journals, TDRs, or accredited databases (PDG, IAEA).
            </p>
          </div>
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_0px_#FFE600] space-y-1.5">
            <span className="text-[#FFE600] font-black block text-sm uppercase">[COMPUTED]</span>
            <p className="text-[11px] text-text-secondary font-mono leading-relaxed">
              Generated on-the-fly using documented, seeded physics formulas or published lattices.
            </p>
          </div>
        </div>
      </section>

      {/* Fidelity Badges Guide */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-black uppercase text-text-primary">
          2. Simulation Fidelity Badges
        </h2>
        <div className="space-y-3 text-xs font-mono">
          <div className="p-3.5 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] flex items-start gap-3">
            <span className="px-2 py-0.5 border border-black font-bold uppercase bg-[#4C7DFF] text-white shadow-[1px_1px_0px_#000] shrink-0">
              ANALYTIC
            </span>
            <p className="text-text-secondary leading-relaxed">
              Derived from closed-form exact mathematical equations (e.g., relativistic momentum-energy
              relations, magnetic rigidity). The equation is directly inspectable.
            </p>
          </div>

          <div className="p-3.5 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] flex items-start gap-3">
            <span className="px-2 py-0.5 border border-black font-bold uppercase bg-[#FF0055] text-white shadow-[1px_1px_0px_#000] shrink-0">
              MONTE CARLO
            </span>
            <p className="text-text-secondary leading-relaxed">
              Stochastic simulation using seeded deterministic pseudo-random variables (e.g., Poisson
              pileup, Breit-Wigner resonance generation).
            </p>
          </div>

          <div className="p-3.5 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] flex items-start gap-3">
            <span className="px-2 py-0.5 border border-black font-bold uppercase bg-[#FFE600] text-black shadow-[1px_1px_0px_#000] shrink-0">
              TOY
            </span>
            <p className="text-text-secondary leading-relaxed">
              Simplified educational approximation for qualitative physical intuition; not a detector
              response prediction.
            </p>
          </div>

          <div className="p-3.5 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] flex items-start gap-3">
            <span className="px-2 py-0.5 border border-black font-bold uppercase bg-zinc-800 text-zinc-300 shadow-[1px_1px_0px_#000] shrink-0">
              ILLUSTRATIVE
            </span>
            <p className="text-text-secondary leading-relaxed">
              Visual explanatory schematic to aid understanding without claiming quantitative
              calibration.
            </p>
          </div>
        </div>
      </section>

      {/* Known Limitations */}
      <section className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
        <h2 className="text-xl font-display font-black uppercase text-text-primary">
          3. Known Scientific Limitations
        </h2>
        <ul className="space-y-2 text-xs text-text-secondary font-mono list-disc pl-5 leading-relaxed">
          <li>
            <strong className="text-text-primary">Post-Trigger Open Data:</strong> Collision events released by CERN Open Data represent
            events that passed the hardware Level-1 and High-Level Triggers; unbiased Level-1 trigger rates
            cannot be derived directly from open collision data.
          </li>
          <li>
            <strong className="text-text-primary">Detector Response:</strong> Client-side browser visualizations model detector
            interactions using analytical parameterizations rather than multi-gigabyte GEANT4 Monte Carlo
            showers.
          </li>
          <li>
            <strong className="text-text-primary">Grid Modeling:</strong> The WLCG simulator models queue dynamics using discrete-event
            queuing approximations rather than live operational telemetry.
          </li>
        </ul>
      </section>
    </div>
  );
}
