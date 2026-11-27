'use client';

import React, { useState, useMemo, useEffect } from 'react';
import modelWeights from '../../../../../research/benchmarks/triggermind_model.json';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { useGlobalStore } from '@/lib/store';
import { playParticlePulse, playDiscoveryChime } from '@/lib/sonifier';
import { Cpu, Zap, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DenseLayer {
  type: string;
  in_features: number;
  out_features: number;
  activation: string;
  weights: number[][];
  biases: number[];
}

const FEATURE_META = [
  { key: 'DER_mass_vis', label: 'Visible Invariant Mass (DER_mass_vis)', min: 30, max: 220, step: 1, unit: 'GeV', defaultVal: 122 },
  { key: 'DER_mass_transverse_met_lep', label: 'Transverse Mass W/τ (m_T)', min: 0, max: 140, step: 1, unit: 'GeV', defaultVal: 22 },
  { key: 'DER_pt_h', label: 'Higgs Candidate p_T (DER_pt_h)', min: 5, max: 160, step: 1, unit: 'GeV', defaultVal: 68 },
  { key: 'PRI_tau_pt', label: 'Hadronic Tau p_T', min: 15, max: 120, step: 1, unit: 'GeV', defaultVal: 54 },
  { key: 'PRI_lep_pt', label: 'Lepton p_T', min: 15, max: 110, step: 1, unit: 'GeV', defaultVal: 42 },
  { key: 'PRI_met', label: 'Missing Transverse Energy (MET)', min: 5, max: 130, step: 1, unit: 'GeV', defaultVal: 48 },
];

export const LiveNeuralInference: React.FC = () => {
  const [features, setFeatures] = useState<number[]>(FEATURE_META.map((f) => f.defaultVal));
  const [quantizeInt8, setQuantizeInt8] = useState<boolean>(false);
  const completeMission = useGlobalStore((s) => s.completeMission);

  const inference = useMemo(() => {
    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;

    const mean = modelWeights.normalization.mean;
    const std = modelWeights.normalization.std;
    let act: number[] = features.map((val, idx) => (val - mean[idx]) / std[idx]);

    const layerSnapshots: number[][] = [];
    const layers = modelWeights.layers as DenseLayer[];

    for (const layer of layers) {
      const next: number[] = new Array(layer.out_features).fill(0);
      for (let j = 0; j < layer.out_features; j++) {
        let sum = layer.biases[j] || 0;
        for (let i = 0; i < layer.in_features; i++) {
          let w = layer.weights[i][j];
          if (quantizeInt8) {
            // Simulate symmetric INT8 FPGA quantization step rounding
            w = Math.round(w * 64) / 64;
          }
          sum += act[i] * w;
        }
        if (layer.activation === 'ReLU') {
          next[j] = Math.max(0, sum);
        } else if (layer.activation === 'Sigmoid') {
          next[j] = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, sum))));
        } else {
          next[j] = sum;
        }
      }
      layerSnapshots.push(next);
      act = next;
    }

    const t1 = typeof performance !== 'undefined' ? performance.now() : 0.04;
    const score = act[0] ?? 0.5;
    return {
      score,
      isHiggsSignal: score >= 0.5,
      latencyUs: Math.max(8, Math.round((t1 - t0) * 1000)),
      hidden1: layerSnapshots[0] || [],
      hidden2: layerSnapshots[1] || [],
    };
  }, [features, quantizeInt8]);

  useEffect(() => {
    if (inference.isHiggsSignal) {
      completeMission('mission-ai-trigger');
    }
  }, [inference.isHiggsSignal, completeMission]);

  const applyPreset = (preset: 'higgs' | 'ztautau' | 'qcd') => {
    if (preset === 'higgs') {
      setFeatures([124, 18, 72, 58, 44, 52]);
      playDiscoveryChime();
    } else if (preset === 'ztautau') {
      setFeatures([88, 28, 22, 29, 25, 21]);
      playParticlePulse(520, 0.06, 0.05);
    } else {
      setFeatures([52, 84, 14, 21, 19, 12]);
      playParticlePulse(280, 0.06, 0.05);
    }
  };

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Inside the Brain of an LHC Trigger Neural Network (Real Trained Weights!)"
        analogy="This isn't a fake progress bar—your browser is executing the actual mathematical weights of TriggerMind-MLP-v1 trained on CERN Open Data! Slide the collision properties on the left to watch 32 + 16 virtual neurons light up and decide in microseconds whether to SAVE or DISCARD the event."
        keyPoints={[
          'Z-Score Normalization: Converts physical GeV inputs into standard deviations before hitting Layer 1 (6 → 32 ReLU).',
          'FPGA INT8 Toggle: Emulates hardware bit-quantization used to fit neural networks inside microsecond LHC FPGAs!',
        ]}
        whatToTry="Switch between the Higgs Candidate, Z⁰→ττ Background, and QCD Noise presets, or toggle INT8 Quantization to see neuron weights round to FPGA integers!"
        doi="10.7483/OPENDATA.ATLAS.Z55B.2V8K"
        citationLabel="TriggerMind-MLP-v1 Trained Weights (research/benchmarks/triggermind_model.json)"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
        {/* LEFT: 6 Physical Kinematics Sliders */}
        <div className="xl:col-span-6 space-y-4 bg-canvas-surface border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-xs font-mono font-black uppercase text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cern-cyan" /> Live Collision Event Inputs
            </h3>
            <FidelityBadge type="MONTE CARLO" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
            <button
              onClick={() => applyPreset('higgs')}
              className="py-1.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold border-2 border-black shadow-[2px_2px_0px_#000]"
            >
              H⁰ → ττ Candidate
            </button>
            <button
              onClick={() => applyPreset('ztautau')}
              className="py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold border-2 border-black shadow-[2px_2px_0px_#000]"
            >
              Z⁰ → ττ Background
            </button>
            <button
              onClick={() => applyPreset('qcd')}
              className="py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white font-bold border-2 border-black shadow-[2px_2px_0px_#000]"
            >
              Low-pT QCD Noise
            </button>
          </div>

          <div className="space-y-2.5">
            {FEATURE_META.map((meta, idx) => (
              <div key={meta.key} className="p-2.5 bg-canvas-sub border-2 border-black">
                <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                  <span className="text-text-secondary">{meta.label}</span>
                  <span className="text-cern-cyan">
                    {features[idx]} {meta.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={meta.min}
                  max={meta.max}
                  step={meta.step}
                  value={features[idx]}
                  onChange={(e) => {
                    const next = [...features];
                    next[idx] = Number(e.target.value);
                    setFeatures(next);
                  }}
                  className="w-full accent-cern-cyan cursor-pointer"
                />
              </div>
            ))}
          </div>

          <label className="flex items-center justify-between p-2.5 bg-canvas-sub border-2 border-black cursor-pointer text-xs font-mono">
            <span className="font-bold text-[#FFE600]">Simulate FPGA QINT8 Weight Quantization</span>
            <input
              type="checkbox"
              checked={quantizeInt8}
              onChange={(e) => setQuantizeInt8(e.target.checked)}
              className="w-4 h-4 accent-[#FFE600]"
            />
          </label>
        </div>

        {/* RIGHT: Live Decision + Hidden Layer Activations */}
        <div className="xl:col-span-6 space-y-4 bg-canvas-surface border-2 border-black p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-xs font-mono font-black uppercase text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#FFE600]" /> Real-Time L1 Trigger Decision
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                Exec: ~{inference.latencyUs} μs ({quantizeInt8 ? 'QINT8' : 'FP64'})
              </span>
            </div>

            {/* Decision Banner */}
            <div
              className={`p-4 border-3 border-black shadow-[4px_4px_0px_#000] flex items-center justify-between ${
                inference.isHiggsSignal ? 'bg-emerald-950/70' : 'bg-red-950/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono font-black text-base">
                  {inference.isHiggsSignal ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  )}
                  <span className={inference.isHiggsSignal ? 'text-emerald-400' : 'text-red-400'}>
                    {inference.isHiggsSignal ? 'TRIGGER ACCEPT (HIGGS CANDIDATE)' : 'TRIGGER REJECT (DISCARD)'}
                  </span>
                </div>
                <span className="text-xs font-mono text-text-secondary block">
                  Sigmoid P(Signal) = {(inference.score * 100).toFixed(2)}% (Threshold: 50.0%)
                </span>
              </div>
              <div className="text-2xl font-mono font-black text-white">
                {inference.score.toFixed(3)}
              </div>
            </div>

            {/* Layer 1 Heatmap (32 ReLU Neurons) */}
            <div className="p-3 bg-canvas-sub border-2 border-black space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-text-muted font-bold">
                <span>HIDDEN LAYER 1 (32 ReLU NEURONS)</span>
                <span className="text-cern-cyan">
                  {inference.hidden1.filter((v) => v > 0.01).length}/32 Active
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {inference.hidden1.map((val, i) => {
                  const intensity = Math.min(1, val / 3.5);
                  return (
                    <div
                      key={i}
                      title={`N1_${i}: ${val.toFixed(3)}`}
                      className="h-6 border border-black"
                      style={{
                        backgroundColor:
                          intensity > 0.01 ? `rgba(0, 229, 255, ${0.15 + intensity * 0.85})` : '#0a0f1a',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Layer 2 Heatmap (16 ReLU Neurons) */}
            <div className="p-3 bg-canvas-sub border-2 border-black space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-text-muted font-bold">
                <span>HIDDEN LAYER 2 (16 ReLU NEURONS)</span>
                <span className="text-[#FFE600]">
                  {inference.hidden2.filter((v) => v > 0.01).length}/16 Active
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {inference.hidden2.map((val, i) => {
                  const intensity = Math.min(1, val / 3.5);
                  return (
                    <div
                      key={i}
                      title={`N2_${i}: ${val.toFixed(3)}`}
                      className="h-7 border border-black flex items-center justify-center text-[9px] font-mono text-white"
                      style={{
                        backgroundColor:
                          intensity > 0.01 ? `rgba(255, 230, 0, ${0.15 + intensity * 0.75})` : '#0a0f1a',
                        color: intensity > 0.5 ? '#000' : '#94a3b8',
                      }}
                    >
                      {val.toFixed(1)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t-2 border-black text-[10px] font-mono text-text-muted">
            Model: {modelWeights.format} · Exact weights from research/benchmarks/triggermind_model.json
          </div>
        </div>
      </div>
    </div>
  );
};
