'use client';

import React, { useState, useMemo } from 'react';
import { SeededRNG, asimovSignificance, simpleSignificance } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Value } from '@/components/provenance/Value';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { Sliders, Sparkles, AlertCircle, Eye, RefreshCw, CheckCircle2, Download } from 'lucide-react';

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

  // Export CSV
  const exportCsv = () => {
    let csv = 'mass_bin_gev,event_count\n';
    bins.forEach((cnt, idx) => {
      csv += `${100 + idx},${cnt}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discovery_histogram_seed${seed}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const exportJson = () => {
    const payload = {
      exercise: '5-Sigma Resonance Discovery',
      seed,
      cuts: { minPt1Gev, minPt2Gev },
      results: {
        signalFitted: signalCount,
        backgroundEstimated: backgroundCount,
        asimovSignificanceZ: significance,
      },
      bins: bins.map((c, idx) => ({ massGev: 100 + idx, count: c })),
      fidelity: 'MONTE_CARLO_TOY',
      disclaimer: 'Educational exercise, not real LHC data.',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discovery_exercise_seed${seed}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">
      <Eli5Card
        title="Spotting the Golden Pebble on a Sand Mountain"
        analogy="Spotting a tiny real bump on top of a mountain of sand, with a 1-in-3.5-million certainty standard before shouting 'Discovery!'."
        keyPoints={[
          "Trillions of everyday particle interactions produce a smooth mountain of background noise. A new particle appears as a tiny bump atop this background.",
          "Because statistical flukes occur randomly, physicists require 5-sigma certainty (99.99994% confidence) to ensure the bump isn't a statistical phantom."
        ]}
        whatToTry="Adjust Leading and Sub-leading Photon p_T cuts to suppress background noise until the significance meter turns GREEN and exceeds 5.0σ!"
        arxivId="1807.05050"
        doi="10.1016/j.physletb.2018.07.050"
        citationLabel="ATLAS Collaboration: Higgs Diphoton & 4-Lepton Discovery (Phys. Lett. B 2018)"
      />
      <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
      {/* Banner: Simulated Exercise */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3 mb-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5 tracking-wider">
              <Sliders className="w-4 h-4 text-cern-cyan" /> /// Selection Cuts ///
            </h3>
            <FidelityBadge type="MONTE CARLO" />
          </div>

          {/* Cut Sliders */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted font-bold">Leading Photon p_T1:</span>
              <span className="text-cern-cyan font-bold bg-black px-1.5 py-0.5 border-2 border-black shadow-[1px_1px_0px_#00E5FF]">{minPt1Gev} GeV/c</span>
            </div>
            <input
              type="range"
              min={25}
              max={50}
              step={1}
              value={minPt1Gev}
              onChange={(e) => setMinPt1Gev(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 border-2 border-black appearance-none cursor-pointer accent-cern-cyan"
            />
            <span className="text-[10px] text-text-muted block font-mono">
              Cuts reject soft jets faking photons.
            </span>
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted font-bold">Sub-leading Photon p_T2:</span>
              <span className="text-text-primary font-bold bg-black px-1.5 py-0.5 border-2 border-black shadow-[1px_1px_0px_#FFFFFF]">{minPt2Gev} GeV/c</span>
            </div>
            <input
              type="range"
              min={20}
              max={40}
              step={1}
              value={minPt2Gev}
              onChange={(e) => setMinPt2Gev(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 border-2 border-black appearance-none cursor-pointer accent-cern-blue"
            />
          </div>

          {/* Seed Changer */}
          <div>
            <button
              onClick={() => {
                setSeed((prev) => prev + 1);
                setRevealed(false);
              }}
              className="w-full py-2.5 px-3 border-2 border-black bg-canvas-sub hover:bg-canvas-raised active:translate-x-[1px] active:translate-y-[1px] shadow-[3px_3px_0px_#000] active:shadow-none text-xs font-mono font-bold text-text-primary flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cern-accent" /> Generate New Seeded Run
            </button>
            <span className="text-[10px] text-text-muted block mt-1.5 font-mono text-center">
              Seed: #{seed} (Deterministic PRNG)
            </span>
          </div>

          {/* Statistical Readouts */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-text-muted">Fitted Signal (s):</span>
              <span className="text-cern-cyan font-bold">{signalCount} events</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Estimated Bg (b):</span>
              <span className="text-text-secondary">{backgroundCount} events</span>
            </div>
            <div className="flex justify-between pt-1 border-t-2 border-black">
              <span className="text-text-muted font-bold">Asimov Significance Z:</span>
              <span
                className={`font-bold px-1.5 py-0.5 border-2 border-black ${
                  significance >= 5.0
                    ? 'bg-emerald-400 text-black shadow-[1px_1px_0px_#000]'
                    : significance >= 3.0
                    ? 'bg-amber-400 text-black shadow-[1px_1px_0px_#000]'
                    : 'bg-black text-white'
                }`}
              >
                {significance.toFixed(2)} σ
              </span>
            </div>
          </div>
        </div>

        {/* Action: Reveal Truth & Export */}
        <div className="pt-3 border-t-2 border-black space-y-2">
          <button
            onClick={() => setRevealed(!revealed)}
            className="w-full py-2.5 px-3 bg-cern-blue hover:bg-cern-accent active:translate-x-[1px] active:translate-y-[1px] border-2 border-black shadow-[3px_3px_0px_#00E5FF] active:shadow-none text-white font-mono font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            {revealed ? 'Hide Benchmark Truth' : 'Reveal Truth & Look-Elsewhere'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportJson}
              className="py-1.5 px-2 bg-canvas-sub hover:bg-canvas-raised active:translate-x-[1px] active:translate-y-[1px] border-2 border-black shadow-[2px_2px_0px_#000] active:shadow-none text-xs font-mono font-bold text-text-primary flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Download className="w-3 h-3 text-cern-cyan" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportCsv}
              className="py-1.5 px-2 bg-canvas-sub hover:bg-canvas-raised active:translate-x-[1px] active:translate-y-[1px] border-2 border-black shadow-[2px_2px_0px_#000] active:shadow-none text-xs font-mono font-bold text-text-primary flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Download className="w-3 h-3 text-cern-amber" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* CENTER: Invariant Mass Spectrum Histogram */}
      <div className="flex-1 flex flex-col justify-between bg-canvas border-2 border-black shadow-[4px_4px_0px_#000] p-4 relative min-h-[460px] space-y-4">
        {/* Prominent Mandatory Ribbon */}
        <div className="p-3 bg-amber-400 text-black border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between text-xs font-mono font-bold">
          <span className="flex items-center gap-2 tracking-wider">
            <AlertCircle className="w-4 h-4 text-black" />
            EDUCATIONAL EXERCISE ONLY — NOT A REAL NEW DISCOVERY
          </span>
          <span className="bg-black text-amber-300 px-2 py-0.5 border border-black text-[10px]">
            Mode: Resonance Reconstruction
          </span>
        </div>

        {/* Invariant Mass Distribution Histogram Graphic */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="h-64 flex items-end gap-1 px-2 border-b-2 border-l-2 border-black bg-black/20">
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
                  <div className="absolute bottom-full mb-1 hidden group-hover:block p-1.5 bg-black border-2 border-cern-cyan text-white text-[10px] font-mono z-30 pointer-events-none whitespace-nowrap shadow-[2px_2px_0px_#000]">
                    {massGev} GeV: {count} events
                  </div>

                  <div
                    className={`w-full transition-all border border-black ${
                      isHiggsWindow
                        ? 'bg-cern-cyan group-hover:bg-cyan-300 shadow-[2px_2px_0px_#000]'
                        : 'bg-canvas-surface group-hover:bg-slate-700'
                    }`}
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis labels */}
          <div className="flex justify-between px-2 pt-2 text-[11px] font-mono text-text-muted border-t border-black/40">
            <span>100 GeV</span>
            <span>110 GeV</span>
            <span className="text-cern-cyan font-bold bg-cern-cyan/10 px-1 border border-cern-cyan/30">125 GeV (Peak)</span>
            <span>140 GeV</span>
            <span>150 GeV</span>
          </div>
        </div>

        {/* Revealed Truth Explanation Drawer */}
        {revealed && (
          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#00FF66] space-y-2 text-xs leading-relaxed animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> /// Truth Revealed: Injected Standard Model Higgs ///
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

        <div className="pt-2 border-t-2 border-black flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>Observable: M_γγ = √(2·p_T1·p_T2·(cosh(Δη) - cos(Δφ)))</span>
          <Value manifestId="higgs-boson-mass-pdg" value={125.25} unit="GeV" digits={2} />
        </div>
      </div>

      {/* RIGHT: Methodology Drawer */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4 space-y-4">
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="pb-2 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3 mb-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              /// 5-Sigma Discovery Standard ///
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

          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] font-mono text-[11px] space-y-1">
            <div className="text-text-muted font-bold">Asimov Formula:</div>
            <div className="text-amber-300 font-bold">Z = √[2((s+b)ln(1+s/b) - s)]</div>
          </div>
        </div>

        <div className="pt-3 border-t-2 border-black text-[11px] font-mono text-text-muted">
          <span>Formula: Cowan et al. (EPJC 71 (2011) 1554)</span>
        </div>
      </div>
    </div>
    </div>
  );
};
