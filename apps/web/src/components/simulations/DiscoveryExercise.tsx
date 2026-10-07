'use client';

import React, { useState, useMemo } from 'react';
import { SeededRNG, asimovSignificance, simpleSignificance } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Value } from '@/components/provenance/Value';
import { Sliders, Sparkles, AlertCircle, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';

export const DiscoveryExercise: React.FC = () => {
  const [minPt1Gev, setMinPt1Gev] = useState<number>(35);
  const [minPt2Gev, setMinPt2Gev] = useState<number>(25);
  const [seed, setSeed] = useState<number>(42);
  const [revealed, setRevealed] = useState<boolean>(false);

  // Generate synthetic mass histogram deterministically based on cuts and seed
  const { bins, signalCount, backgroundCount, significance } = useMemo(() => {
    const rng = new SeededRNG(seed);
    const binCounts: number[] = new Array(50).fill(0); // 100 to 150 GeV in 1 GeV bins

    // Exponential background: N ~ exp(-m / 30)
    const rawBackground = 4000;
    // Tighter cuts reduce background faster than signal:
    const cutEfficiencyBg = Math.exp(-(minPt1Gev - 25) * 0.06 - (minPt2Gev - 20) * 0.05);
    const numBgEvents = Math.round(rawBackground * cutEfficiencyBg);

    for (let i = 0; i < numBgEvents; i++) {
      // Sample exponential background in [100, 150]
      const u = rng.nextFloat();
      const m = 100 - 30 * Math.log(1 - u * (1 - Math.exp(-50 / 30)));
      const binIdx = Math.floor(m - 100);
      if (binIdx >= 0 && binIdx < 50) {
        binCounts[binIdx]++;
      }
    }

    // Injected Resonance: Gaussian peak at 125.0 GeV with sigma = 1.8 GeV
    const rawSignal = 180;
    const cutEfficiencySig = Math.max(0.2, 1.0 - (minPt1Gev - 25) * 0.02 - (minPt2Gev - 20) * 0.02);
    const numSigEvents = Math.round(rawSignal * cutEfficiencySig);

    for (let i = 0; i < numSigEvents; i++) {
      const m = rng.gaussian(125.0, 1.8);
      const binIdx = Math.floor(m - 100);
      if (binIdx >= 0 && binIdx < 50) {
        binCounts[binIdx]++;
      }
    }

    // Measure in signal window: [122, 128] GeV (bins 22 to 28)
    const windowSum = binCounts.slice(22, 29).reduce((a, b) => a + b, 0);
    // Background estimation from sidebands [110, 120] and [130, 140]
    const leftSideband = binCounts.slice(10, 20).reduce((a, b) => a + b, 0);
    const rightSideband = binCounts.slice(30, 40).reduce((a, b) => a + b, 0);
    const estimatedBgInWindow = ((leftSideband + rightSideband) / 20) * 7;
    const estimatedSig = Math.max(0, windowSum - estimatedBgInWindow);
    const z = asimovSignificance(estimatedSig, estimatedBgInWindow);

    return {
      bins: binCounts,
      signalCount: Math.round(estimatedSig),
      backgroundCount: Math.round(estimatedBgInWindow),
      significance: z,
    };
  }, [minPt1Gev, minPt2Gev, seed]);

  const maxBin = Math.max(...bins, 1);

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border border-canvas-border rounded-panel">
      {/* Banner: Simulated Exercise */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border border-canvas-border rounded-panel p-4 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-canvas-border">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cern-cyan" /> Event Selection Cuts
            </h3>
            <FidelityBadge type="MONTE CARLO" />
          </div>

          {/* Cut Sliders */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">Leading Photon p_T1:</span>
              <span className="text-cern-cyan font-bold">{minPt1Gev} GeV/c</span>
            </div>
            <input
              type="range"
              min={25}
              max={50}
              step={1}
              value={minPt1Gev}
              onChange={(e) => setMinPt1Gev(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
            <span className="text-[10px] text-text-muted block font-mono">
              Cuts reject soft jets faking photons.
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">Sub-leading Photon p_T2:</span>
              <span className="text-text-primary font-bold">{minPt2Gev} GeV/c</span>
            </div>
            <input
              type="range"
              min={20}
              max={40}
              step={1}
              value={minPt2Gev}
              onChange={(e) => setMinPt2Gev(Number(e.target.value))}
              className="w-full accent-cern-blue cursor-pointer"
            />
          </div>

          {/* Seed Changer */}
          <div>
            <button
              onClick={() => {
                setSeed((prev) => prev + 1);
                setRevealed(false);
              }}
              className="w-full py-2 px-3 rounded border border-canvas-border bg-canvas-sub hover:bg-canvas-raised text-xs font-mono text-text-secondary flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cern-accent" /> Generate New Seeded Run
            </button>
            <span className="text-[10px] text-text-muted block mt-1 font-mono text-center">
              Seed: #{seed} (Deterministic PRNG)
            </span>
          </div>

          {/* Statistical Readouts */}
          <div className="p-3 bg-canvas-sub border border-canvas-border rounded space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-text-muted">Fitted Signal (s):</span>
              <span className="text-cern-cyan font-bold">{signalCount} events</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Estimated Bg (b):</span>
              <span className="text-text-secondary">{backgroundCount} events</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-canvas-border">
              <span className="text-text-muted">Asimov Significance Z:</span>
              <span
                className={`font-bold ${
                  significance >= 5.0 ? 'text-emerald-400' : significance >= 3.0 ? 'text-amber-400' : 'text-text-primary'
                }`}
              >
                {significance.toFixed(2)} σ
              </span>
            </div>
          </div>
        </div>

        {/* Action: Reveal Truth */}
        <div className="pt-3 border-t border-canvas-border">
          <button
            onClick={() => setRevealed(!revealed)}
            className="w-full py-2 px-3 rounded bg-cern-blue hover:bg-cern-accent text-white font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            {revealed ? 'Hide Benchmark Truth' : 'Reveal Truth & Look-Elsewhere'}
          </button>
        </div>
      </div>

      {/* CENTER: Invariant Mass Spectrum Histogram */}
      <div className="flex-1 flex flex-col justify-between bg-canvas rounded-panel border border-canvas-border p-4 relative min-h-[460px] space-y-4">
        {/* Prominent Mandatory Ribbon */}
        <div className="p-2.5 bg-amber-950/40 border border-amber-500/50 rounded flex items-center justify-between text-xs font-mono text-amber-300">
          <span className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            EDUCATIONAL EXERCISE ONLY — NOT A REAL NEW DISCOVERY
          </span>
          <span>Mode: Resonance Reconstruction</span>
        </div>

        {/* Invariant Mass Distribution Histogram Graphic */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="h-64 flex items-end gap-1 px-2 border-b border-l border-canvas-border">
            {bins.map((count, idx) => {
              const heightPercent = (count / maxBin) * 100;
              const massGev = 100 + idx;
              const isHiggsWindow = massGev >= 123 && massGev <= 127;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center group relative cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:block p-1 bg-canvas-raised border border-canvas-border rounded text-[10px] font-mono z-30 pointer-events-none whitespace-nowrap">
                    {massGev} GeV: {count} events
                  </div>

                  <div
                    className={`w-full rounded-t transition-all ${
                      isHiggsWindow
                        ? 'bg-cern-cyan group-hover:bg-cyan-300'
                        : 'bg-canvas-surface border-t border-canvas-border group-hover:bg-slate-700'
                    }`}
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis labels */}
          <div className="flex justify-between px-2 pt-1 text-[11px] font-mono text-text-muted">
            <span>100 GeV</span>
            <span>110 GeV</span>
            <span className="text-cern-cyan font-bold">125 GeV (Peak)</span>
            <span>140 GeV</span>
            <span>150 GeV</span>
          </div>
        </div>

        {/* Revealed Truth Explanation Drawer */}
        {revealed && (
          <div className="p-4 bg-canvas-surface border border-emerald-500/40 rounded space-y-2 text-xs leading-relaxed animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
              <CheckCircle2 className="w-4 h-4" /> Truth Revealed: Injected Standard Model Higgs
            </div>
            <p className="text-text-secondary">
              A synthetic resonance was injected at exactly <strong>125.0 GeV</strong> with a width
              of 1.8 GeV corresponding to typical ATLAS liquid argon electromagnetic calorimeter resolution.
            </p>
            <p className="text-text-muted text-[11px]">
              <strong>The Look-Elsewhere Effect:</strong> If you scan a wide mass range searching for an
              excess, random background fluctuations will inevitably produce localized peaks. A local
              significance of 3σ across many search windows translates to a much lower global significance!
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-canvas-border flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>Observable: M_γγ = √(2·p_T1·p_T2·(cosh(Δη) - cos(Δφ)))</span>
          <Value manifestId="higgs-boson-mass-pdg" value={125.25} unit="GeV" digits={2} />
        </div>
      </div>

      {/* RIGHT: Methodology Drawer */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border border-canvas-border rounded-panel p-4 space-y-4">
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="pb-2 border-b border-canvas-border">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase">
              The 5-Sigma Discovery Standard
            </h3>
          </div>

          <p className="text-text-secondary">
            In particle physics, a discovery requires a statistical significance of <strong>5 standard
            deviations (5σ)</strong>, representing a probability of less than 1 in 3.5 million that the
            observed peak is a random background fluctuation.
          </p>

          <p className="text-text-secondary">
            A <strong>3-sigma (3σ)</strong> result is only termed &quot;evidence for a process&quot;.
          </p>

          <div className="p-3 bg-canvas-sub border border-canvas-border rounded font-mono text-[11px] space-y-1">
            <div className="text-text-muted">Asimov Formula:</div>
            <div className="text-amber-300">Z = √[2((s+b)ln(1+s/b) - s)]</div>
          </div>
        </div>

        <div className="pt-3 border-t border-canvas-border text-[11px] font-mono text-text-muted">
          <span>Formula: Cowan et al. (EPJC 71 (2011) 1554)</span>
        </div>
      </div>
    </div>
  );
};
