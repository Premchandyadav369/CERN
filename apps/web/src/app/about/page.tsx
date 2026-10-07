import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, FileText, ExternalLink, GitBranch, Database } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase text-cern-cyan font-bold tracking-wider">
          GOVERNANCE &amp; METHODOLOGY
        </span>
        <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
          Scientific Honesty, Sources &amp; Provenance
        </h1>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
          Documentation of how CERN-X sources information, validates physics calculations, labels
          simulation fidelity, and ensures reproducible research.
        </p>
      </div>

      {/* Non-Affiliation Declaration Banner */}
      <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-panel space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Non-Affiliation Disclaimer
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          CERN-X is an independent educational and research platform developed for open science and
          algorithmic research. It is <strong>NOT affiliated with, officially endorsed by, or operated by
          CERN</strong> (the European Organization for Nuclear Research). Protected CERN logos, marks, and
          proprietary emblems are strictly avoided.
        </p>
      </div>

      {/* The No-Fake-Data Addendum Rules */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">
          1. The Strict &quot;No Fake Data&quot; Policy
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          In physics, trust is paramount. Every number, series, event, or metric rendered on CERN-X must
          strictly belong to one of three data classes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-canvas-surface border border-emerald-500/40 rounded-panel space-y-1">
            <span className="text-emerald-400 font-bold block">[REAL]</span>
            <p className="text-[11px] text-text-muted font-sans leading-relaxed">
              Unmodified data released by CERN Open Data or official collaborations.
            </p>
          </div>
          <div className="p-3 bg-canvas-surface border border-blue-500/40 rounded-panel space-y-1">
            <span className="text-blue-400 font-bold block">[PUBLISHED]</span>
            <p className="text-[11px] text-text-muted font-sans leading-relaxed">
              Transcribed directly from peer-reviewed journals, TDRs, or accredited databases (PDG, IAEA).
            </p>
          </div>
          <div className="p-3 bg-canvas-surface border border-amber-500/40 rounded-panel space-y-1">
            <span className="text-amber-400 font-bold block">[COMPUTED]</span>
            <p className="text-[11px] text-text-muted font-sans leading-relaxed">
              Generated on-the-fly using documented, seeded physics formulas or published lattices.
            </p>
          </div>
        </div>
      </section>

      {/* Fidelity Badges Guide */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">
          2. Simulation Fidelity Badges
        </h2>
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-canvas-surface border border-canvas-border rounded flex items-start gap-3">
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-950/60 text-blue-300 border border-blue-500/40 shrink-0">
              ANALYTIC
            </span>
            <p className="text-text-secondary leading-relaxed">
              Derived from closed-form exact mathematical equations (e.g., relativistic momentum-energy
              relations, magnetic rigidity). The equation is directly inspectable.
            </p>
          </div>

          <div className="p-3 bg-canvas-surface border border-canvas-border rounded flex items-start gap-3">
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-purple-950/60 text-purple-300 border border-purple-500/40 shrink-0">
              MONTE CARLO
            </span>
            <p className="text-text-secondary leading-relaxed">
              Stochastic simulation using seeded deterministic pseudo-random variables (e.g., Poisson
              pileup, Breit-Wigner resonance generation).
            </p>
          </div>

          <div className="p-3 bg-canvas-surface border border-canvas-border rounded flex items-start gap-3">
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 shrink-0">
              TOY
            </span>
            <p className="text-text-secondary leading-relaxed">
              Simplified educational approximation for qualitative physical intuition; not a detector
              response prediction.
            </p>
          </div>

          <div className="p-3 bg-canvas-surface border border-canvas-border rounded flex items-start gap-3">
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-zinc-900 text-zinc-400 border border-zinc-700 shrink-0">
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
      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">
          3. Known Scientific Limitations
        </h2>
        <ul className="space-y-2 text-xs text-text-secondary list-disc pl-5 leading-relaxed">
          <li>
            <strong>Post-Trigger Open Data:</strong> Collision events released by CERN Open Data represent
            events that passed the hardware Level-1 and High-Level Triggers; unbiased Level-1 trigger rates
            cannot be derived directly from open collision data.
          </li>
          <li>
            <strong>Detector Response:</strong> Client-side browser visualizations model detector
            interactions using analytical parameterizations rather than multi-gigabyte GEANT4 Monte Carlo
            showers.
          </li>
          <li>
            <strong>Grid Modeling:</strong> The WLCG simulator models queue dynamics using discrete-event
            queuing approximations rather than live operational telemetry.
          </li>
        </ul>
      </section>
    </div>
  );
}
