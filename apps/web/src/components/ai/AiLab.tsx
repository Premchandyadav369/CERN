'use client';

import React, { useState } from 'react';
import triggerMindResults from '../../../../../research/benchmarks/triggermind_results.json';
import { Value } from '@/components/provenance/Value';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Cpu, Zap, Activity, CheckCircle2, Sliders, ExternalLink, ShieldCheck, FileCode } from 'lucide-react';

export const AiLab: React.FC = () => {
  const [latencyBudgetMs, setLatencyBudgetMs] = useState<number>(0.6); // 0.6 ms latency budget
  const [selectedModelName, setSelectedModelName] = useState<string>('Compact XGBoost');

  const benchmarks = triggerMindResults.benchmarks;
  const featureImportance = triggerMindResults.featureImportance;

  const activeBenchmark =
    benchmarks.find((b) => b.model === selectedModelName) || benchmarks[2];

  return (
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
          <div className="flex items-center justify-between pb-1.5 border-b-2 border-black">
            <span className="text-xs font-mono font-bold uppercase text-text-primary">
              Feature Importance &amp; Explainability (SHAP / Gini)
            </span>
            <span className="text-[11px] font-mono text-text-muted font-bold">6 Key Kinematic Observables</span>
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

          <div className="p-3 bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] font-mono leading-relaxed font-bold">
            <strong className="text-black block mb-0.5 uppercase">/// Mandatory Label ///</strong> Public ATLAS simulation data. Research prototype only;
            not an ATLAS operational trigger algorithm.
          </div>
        </div>

        <div className="pt-3 border-t-2 border-black text-[11px] font-mono text-text-muted">
          <span>Benchmark Registry ID: EXP-001-TRIGGERMIND</span>
        </div>
      </div>
    </div>
  );
};
