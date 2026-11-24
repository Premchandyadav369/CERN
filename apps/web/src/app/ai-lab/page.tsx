'use client';

import React from 'react';
import { AiLab } from '@/components/ai/AiLab';
import { Cpu, ShieldCheck, Database, FileCode } from 'lucide-react';

export default function AiLabPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase bg-[#FFE600] text-black px-2 py-0.5 border border-black font-bold tracking-wider shadow-[2px_2px_0px_#000]">
            REPRODUCIBLE RESEARCH BENCHMARK
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-400 text-black border border-black font-bold uppercase shadow-[2px_2px_0px_#000]">
            OpenML &amp; CERN Open Data (Record 328)
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight text-text-primary">
          AI Lab: LHC-TriggerMind Benchmark
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-mono">
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
      <section className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
        <h2 className="text-lg font-display font-black uppercase text-text-primary flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cern-cyan" />
          Future AI Research Prototypes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[4px_4px_0px_#00E5FF] transition-all space-y-2">
            <span className="text-cern-cyan font-bold block uppercase text-sm">Resonant Anomaly Detection</span>
            <p className="text-text-secondary font-mono text-xs leading-relaxed">
              Unsupervised autoencoders benchmarked on the community-vetted LHC Olympics 2020 dataset
              (DOI: 10.5281/zenodo.4536377).
            </p>
          </div>

          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[4px_4px_0px_#4C7DFF] transition-all space-y-2">
            <span className="text-cern-accent font-bold block uppercase text-sm">Graph Neural Network Tracking</span>
            <p className="text-text-secondary font-mono text-xs leading-relaxed">
              Edge-classification GNNs for combinatorial track reconstruction using public TrackML
              silicon hit datasets.
            </p>
          </div>

          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[4px_4px_0px_#FFE600] transition-all space-y-2">
            <span className="text-[#FFE600] font-bold block uppercase text-sm">Edge FPGA Model Quantization</span>
            <p className="text-text-secondary font-mono text-xs leading-relaxed">
              hls4ml compilation converting PyTorch and XGBoost trees into Vivado HLS C++ pipelines
              executing under 2.5 µs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
