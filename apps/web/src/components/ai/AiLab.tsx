'use client';

import React, { useState } from 'react';
import triggerMindResults from '../../../../../research/benchmarks/triggermind_results.json';
import { Value } from '@/components/provenance/Value';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { Cpu, Zap, Activity, CheckCircle2, Sliders, ExternalLink, ShieldCheck, FileCode, ArrowRight, TrendingUp } from 'lucide-react';
import { ShapExplainabilityLab } from './ShapExplainabilityLab';

export const AiLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'shap'>('benchmarks');
  const [latencyBudgetMs, setLatencyBudgetMs] = useState<number>(0.6); // 0.6 ms latency budget
  const [selectedModelName, setSelectedModelName] = useState<string>('Compact XGBoost');

  const benchmarks = triggerMindResults.benchmarks;
  const featureImportance = triggerMindResults.featureImportance;

  const activeBenchmark =
    benchmarks.find((b) => b.model === selectedModelName) || benchmarks[2];

  return (
    <div className="space-y-6">
      {/* AI Lab Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-canvas-sub border-3 border-black shadow-[4px_4px_0px_#000]">
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`flex items-center gap-1.5 px-4 py-2 border-2 border-black font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'benchmarks'
                ? 'bg-cern-blue text-white shadow-[2px_2px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
            }`}
          >
            <Cpu className="w-4 h-4 text-cern-cyan" />
            <span>Benchmark Evaluation Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('shap')}
            className={`flex items-center gap-1.5 px-4 py-2 border-2 border-black font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'shap'
                ? 'bg-cern-blue text-white shadow-[2px_2px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-cern-magenta" />
            <span>SHAP Explainability &amp; FPGA Lab</span>
            <span className="ml-1 text-[10px] bg-cern-magenta text-white font-black px-1.5 py-0.2 border border-black">
              NEW
            </span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-text-muted hidden md:inline-block">
          LHC-TriggerMind • CERN Open Data Record 328
        </span>
      </div>

      {/* View 1: Benchmark Matrix Sandbox */}
      {activeTab === 'benchmarks' ? (
        <div className="space-y-4">
          <Eli5Card
            title="Why Trigger AI Needs F1 Racecar Reflexes, Not Just Smart Brains"
            analogy="Imagine trying to catch rare golden baseballs while someone blasts 40 million normal baseballs at you every single second! Even the smartest referee on Earth is useless if they take 1 full second to decide—because millions of balls flew past while they were thinking. LHC-TriggerMind measures BOTH smarts (AMS score) AND split-millisecond speed!"
            keyPoints={[
              'AMS (Approximate Median Significance): How accurately the AI separates hidden Higgs decays from noisy background.',
              'Latency Budget (< 0.6 ms): Decision deadline before detector memory buffers overflow.',
              'FPGA INT8 Quantization: Shrinking giant AI models to tiny integer math lets silicon chips run inside hardware triggers!',
            ]}
            whatToTry="Slide the Latency Budget constraint down toward 0.15 ms to watch slower heavy AI models fail timing budgets while ultra-fast INT8 MLPs stay green—or open the SHAP Lab tab to inspect inside the AI's mind!"
            doi="10.7483/OPENDATA.ATLAS.Z2J9.7M2R"
            citationLabel="ATLAS Higgs Boson ML Challenge Dataset (Open Data Record 328)"
          />
          <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
          {/* LEFT: Experiment & Constraint Configuration */}
          <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cern-cyan" /> AI Experiment Builder
                </h3>
                <FidelityBadge type="MONTE CARLO" />
              </div>

              {/* Model Selector */}
              <div>
                <label className="text-[11px] font-mono uppercase text-text-muted block mb-1.5 font-bold">
                  Evaluated Model Architecture
                </label>
                <div className="space-y-2">
                  {benchmarks.map((b) => {
                    const isSelected = b.model === selectedModelName;
                    const meetsBudget = b.medianLatencyMs <= latencyBudgetMs;

                    return (
                      <button
                        key={b.model}
                        onClick={() => setSelectedModelName(b.model)}
                        className={`w-full p-2.5 border-2 border-black text-left text-xs font-mono transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                          isSelected
                            ? 'bg-canvas-raised shadow-[3px_3px_0px_0px_#00E5FF] text-text-primary'
                            : 'bg-canvas-sub shadow-[2px_2px_0px_0px_#000000] text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{b.model}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 border border-black font-bold uppercase ${
                              meetsBudget
                                ? 'bg-emerald-400 text-black'
                                : 'bg-red-500 text-black'
                            }`}
                          >
                            {meetsBudget ? 'ELIGIBLE' : 'OVER BUDGET'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-text-muted mt-1 font-semibold">
                          <span>AMS: {b.ams.toFixed(3)}</span>
                          <span>Latency: {b.medianLatencyMs} ms</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real Hardware Latency Constraint Slider */}
              <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000]">
                <div className="flex justify-between text-xs font-mono mb-1 font-bold">
                  <span className="text-text-muted uppercase">Target Latency:</span>
                  <span className="text-cern-cyan">{latencyBudgetMs.toFixed(2)} ms</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={1.0}
                  step={0.02}
                  value={latencyBudgetMs}
                  onChange={(e) => setLatencyBudgetMs(Number(e.target.value))}
                  className="w-full accent-cern-cyan cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-mono mt-1 font-bold">
                  <span>0.01 ms (HLT / Farm)</span>
                  <span>1.0 ms (Storage Threshold)</span>
                </div>
              </div>

              {/* Dataset Card Snippet */}
              <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-1.5 text-xs font-mono">
                <span className="text-text-muted uppercase text-[10px] block font-bold">
                  Training Dataset
                </span>
                <div className="text-text-primary font-bold truncate">
                  {triggerMindResults.dataset.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase">
                  {triggerMindResults.dataset.dataClass}
                </div>
                <div className="text-[10px] text-text-muted pt-1 border-t-2 border-black font-semibold">
                  Seed: #{triggerMindResults.dataset.seed} · Split: 70/15/15
                </div>
              </div>
            </div>

            {/* Reproduce Script Link */}
            <div className="pt-3 border-t-2 border-black">
              <a
                href="https://github.com/Premchandyadav369/CERN/blob/main/research/scripts/train_triggermind.py"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 bg-canvas-sub hover:bg-canvas-raised border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 text-text-primary text-xs font-mono font-bold flex items-center justify-center gap-2 transition-transform uppercase"
              >
                <FileCode className="w-3.5 h-3.5 text-cern-cyan" />
                <span>Committed Script</span>
                <ExternalLink className="w-3 h-3 ml-auto text-text-muted" />
              </a>
            </div>
          </div>

          {/* CENTER: Benchmark Comparisons & SHAP Feature Importance */}
          <div className="flex-1 flex flex-col justify-between bg-canvas border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 relative min-h-[460px] space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cern-cyan" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-text-primary font-bold">
                  LHC-TRIGGERMIND FLAGSHIP BENCHMARK EVALUATION
                </h3>
              </div>
              <span className="text-[11px] font-mono text-text-muted">
                Metric: <strong className="text-[#FFE600]">Approximate Median Significance (AMS)</strong>
              </span>
            </div>

            {/* 3 Metric Cards for Active Selected Model */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="text-[10px] text-text-muted font-mono block font-bold uppercase">Physics Discovery AMS</span>
                <div className="text-xl font-mono font-black text-[#FFE600] mt-1">
                  {activeBenchmark.ams.toFixed(3)}
                  <span className="text-xs text-text-muted font-normal">
                    {' '}± {activeBenchmark.amsUncertainty}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted mt-0.5 block font-mono">
                  Regularized with br = 10.0
                </span>
              </div>

              <div className="p-3.5 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="text-[10px] text-text-muted font-mono block font-bold uppercase">Inference Latency</span>
                <div className="text-xl font-mono font-black text-cern-cyan mt-1">
                  {activeBenchmark.medianLatencyMs} ms
                </div>
                <span className="text-[10px] text-text-muted mt-0.5 block font-mono">
                  Throughput: {activeBenchmark.throughputEventsPerSec.toLocaleString()} ev/s
                </span>
              </div>

              <div className="p-3.5 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="text-[10px] text-text-muted font-mono block font-bold uppercase">Memory Footprint</span>
                <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                  {(activeBenchmark.modelSizeBytes / 1024).toFixed(1)} kB
                </div>
                <span className="text-[10px] text-text-muted mt-0.5 block font-mono">
                  Quantization: {activeBenchmark.quantization}
                </span>
              </div>
            </div>

            {/* Explainability: SHAP Feature Importance Table */}
            <div className="p-3.5 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b-2 border-black">
                <span className="text-xs font-mono font-bold uppercase text-text-primary">
                  Feature Importance &amp; Explainability (SHAP / Gini)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-text-muted font-bold hidden sm:inline">6 Key Kinematic Observables</span>
                  <button
                    onClick={() => setActiveTab('shap')}
                    className="text-[10px] font-mono px-2 py-0.5 bg-cern-blue hover:bg-cern-accent text-white font-bold border border-black shadow-[1px_1px_0px_#000] transition-all flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    title="Launch event-by-event SHAP waterfall attribution"
                  >
                    <span>Waterfall Inspector</span>
                    <ArrowRight className="w-3 h-3 text-cern-cyan" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {featureImportance.map((feat) => (
                  <div key={feat.feature} className="space-y-0.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-text-primary font-bold">{feat.feature}</span>
                      <span className="text-cern-cyan font-bold">{(feat.importanceScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-canvas-sub h-2 overflow-hidden border border-black shadow-[1px_1px_0px_#000]">
                      <div
                        className="bg-cern-cyan h-full"
                        style={{ width: `${feat.importanceScore * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-text-muted font-mono leading-tight">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t-2 border-black flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span>Target Architecture: FPGA L1 &amp; CPU/GPU High-Level Trigger Farm</span>
              <Value manifestId="triggermind-xgboost-benchmark" value="Reproducible Benchmark" />
            </div>
          </div>

          {/* RIGHT: Model Card & Integrity Rules */}
          <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 space-y-4">
            <div className="space-y-3 text-xs leading-relaxed font-mono">
              <div className="pb-2 border-b-2 border-black">
                <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Research Model Card
                </h3>
              </div>

              <div>
                <span className="font-mono text-text-muted uppercase text-[10px] block font-bold">
                  Primary Research Objective
                </span>
                <p className="text-text-secondary mt-0.5 text-xs leading-relaxed">
                  Maximize Approximate Median Significance (AMS) on tau-tau Higgs decay candidates under
                  sub-millisecond latency constraints suitable for software trigger farms.
                </p>
              </div>

              <div>
                <span className="font-mono text-text-muted uppercase text-[10px] block font-bold">
                  Why Not Raw XGBoost at Level-1?
                </span>
                <p className="text-text-secondary mt-0.5 text-xs leading-relaxed">
                  Level-1 triggers operate at fixed 2.5 µs latency on hardware FPGAs. While XGBoost achieves
                  highest AMS (3.339), its 0.547 ms latency requires HLT deployment; quantized INT8 MLP
                  (0.115 ms) is preferred for tight latency regimes.
                </p>
              </div>

              <div>
                <span className="font-mono text-text-muted uppercase text-[10px] block font-bold">
                  Reproducibility Contract
                </span>
                <p className="text-text-secondary mt-0.5 text-xs leading-relaxed">
                  Evaluated across 5 random seeded initializations with fixed train/val/test splits (70/15/15)
                  drawn from the official CERN Open Data 13 TeV Monte Carlo sample.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-black text-[11px] font-mono text-text-muted">
              <span>Licensing: CERN Open Hardware / Apache 2.0</span>
            </div>
          </div>
        </div>
        </div>
      ) : (
        <ShapExplainabilityLab />
      )}
    </div>
  );
};
