'use client';

import React from 'react';
import { AiLab } from '@/components/ai/AiLab';
import { Cpu, ShieldCheck, Database, FileCode } from 'lucide-react';

export default function AiLabPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
            REPRODUCIBLE RESEARCH BENCHMARK
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            OpenML &amp; CERN Open Data (Record 328)
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary">
          AI Lab: LHC-TriggerMind Benchmark
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-3xl leading-relaxed">
          Low-latency machine learning event selection for High-Luminosity LHC trigger regimes. All
          metrics shown originate from committed Python training scripts with frozen seeds (seed 42),
          documented splits, and confidence intervals.
        </p>
      </div>

      {/* Main Interactive AI Lab Sandbox */}
      <section>
        <AiLab />
      </section>

      {/* Additional Prototype Modules */}
      <section className="p-6 bg-canvas-surface border border-canvas-border rounded-panel space-y-4">
        <h2 className="text-lg font-display font-bold text-text-primary">
          Future AI Research Prototypes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-canvas-sub border border-canvas-border rounded space-y-1.5">
            <span className="text-cern-cyan font-bold block">Resonant Anomaly Detection</span>
            <p className="text-text-muted font-sans text-xs">
              Unsupervised autoencoders benchmarked on the community-vetted LHC Olympics 2020 dataset
              (DOI: 10.5281/zenodo.4536377).
            </p>
          </div>

          <div className="p-4 bg-canvas-sub border border-canvas-border rounded space-y-1.5">
            <span className="text-cern-accent font-bold block">Graph Neural Network Tracking</span>
            <p className="text-text-muted font-sans text-xs">
              Edge-classification GNNs for combinatorial track reconstruction using public TrackML
              silicon hit datasets.
            </p>
          </div>

          <div className="p-4 bg-canvas-sub border border-canvas-border rounded space-y-1.5">
            <span className="text-amber-400 font-bold block">Edge FPGA Model Quantization</span>
            <p className="text-text-muted font-sans text-xs">
              hls4ml compilation converting PyTorch and XGBoost trees into Vivado HLS C++ pipelines
              executing under 2.5 µs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
