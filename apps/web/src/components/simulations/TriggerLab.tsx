'use client';

import React, { useState } from 'react';
import { Value } from '@/components/provenance/Value';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Sliders, Cpu, Activity, AlertTriangle, ShieldCheck, Gauge, Download } from 'lucide-react';

export const TriggerLab: React.FC = () => {
  // Threshold sliders
  const [muonPtCutGev, setMuonPtCutGev] = useState<number>(24); // Nominal single muon cut 24-26 GeV
  const [electronPtCutGev, setElectronPtCutGev] = useState<number>(28);
  const [jetPtCutGev, setJetPtCutGev] = useState<number>(100);
  const [metCutGev, setMetCutGev] = useState<number>(120);

  // Compute rates based on empirical power-law QCD background cross sections
  // Rate ~ (pT)^-k
  const baseL1RateKhz = Math.max(
    10,
    Math.min(
      150,
      100 * Math.pow(24 / muonPtCutGev, 2.2) * 0.4 +
        100 * Math.pow(28 / electronPtCutGev, 2.5) * 0.35 +
        100 * Math.pow(100 / jetPtCutGev, 3.0) * 0.25
    )
  );

  // HLT rate in Hz
  const baseHltRateHz = Math.round(baseL1RateKhz * 10 * Math.pow(120 / metCutGev, 1.5));

  // Efficiencies
  const higgsSignalEfficiency = Math.max(
    20,
    Math.min(95, 92 - (muonPtCutGev - 20) * 1.8 - (electronPtCutGev - 20) * 1.2)
  );

  const backgroundRejection = Math.min(
    99.9,
    99.0 + (muonPtCutGev - 20) * 0.05 + (electronPtCutGev - 20) * 0.04
  );

  // Budgets
  const l1BudgetMaxKhz = 100;
  const hltBudgetMaxHz = 2000;
  const isL1OverBudget = baseL1RateKhz > l1BudgetMaxKhz;
  const isHltOverBudget = baseHltRateHz > hltBudgetMaxHz;

  // Export JSON
  const exportJson = () => {
    const payload = {
      scenario: 'L1 & HLT Trigger / DAQ Filter Configuration',
      timestamp: new Date().toISOString(),
      cuts: {
        muonPtCutGev,
        electronPtCutGev,
        jetPtCutGev,
        metCutGev,
      },
      results: {
        l1RateKhz: baseL1RateKhz,
        isL1OverBudget,
        hltRateHz: baseHltRateHz,
        isHltOverBudget,
        higgsSignalEfficiencyPct: higgsSignalEfficiency,
        backgroundRejectionPct: backgroundRejection,
        dailyDataVolumeTb: (baseHltRateHz * 1.5 * 86400) / 1e6,
      },
      fidelity: 'TOY',
      reference: 'ATLAS Trigger TDR (CERN-LHCC-2013-018)',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trigger_menu_scenario_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCsv = () => {
    const csv = `parameter,value,unit\nmuon_pt_cut,${muonPtCutGev},GeV\nelectron_pt_cut,${electronPtCutGev},GeV\njet_pt_cut,${jetPtCutGev},GeV\nmet_cut,${metCutGev},GeV\nl1_rate,${baseL1RateKhz.toFixed(1)},kHz\nhlt_rate,${baseHltRateHz},Hz\nhiggs_efficiency,${higgsSignalEfficiency.toFixed(1)},%\nbackground_rejection,${backgroundRejection.toFixed(2)},%\ndaily_volume,${(((baseHltRateHz * 1.5 * 86400) / 1e6)).toFixed(1)},TB/day\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trigger_menu_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border border-canvas-border rounded-panel">
      {/* LEFT: Trigger Threshold Controls */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border border-canvas-border rounded-panel p-4 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-canvas-border">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cern-cyan" /> Trigger Menu Cuts
            </h3>
            <FidelityBadge type="TOY" />
          </div>

          {/* Single Muon pT Cut */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">Single Muon p_T:</span>
              <span className="text-cern-cyan font-bold">{muonPtCutGev} GeV/c</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={1}
              value={muonPtCutGev}
              onChange={(e) => setMuonPtCutGev(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
            <span className="text-[10px] text-text-muted block font-mono">
              Nominal Run 3 Menu: 24 GeV (isolated)
            </span>
          </div>

          {/* Single Electron pT Cut */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">Single Electron p_T:</span>
              <span className="text-text-primary font-bold">{electronPtCutGev} GeV/c</span>
            </div>
            <input
              type="range"
              min={15}
              max={60}
              step={1}
              value={electronPtCutGev}
              onChange={(e) => setElectronPtCutGev(Number(e.target.value))}
              className="w-full accent-cern-blue cursor-pointer"
            />
            <span className="text-[10px] text-text-muted block font-mono">
              Nominal Run 3 Menu: 28 GeV
            </span>
          </div>

          {/* Jet pT Cut */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">High-p_T Jet:</span>
              <span className="text-text-primary font-bold">{jetPtCutGev} GeV/c</span>
            </div>
            <input
              type="range"
              min={50}
              max={250}
              step={5}
              value={jetPtCutGev}
              onChange={(e) => setJetPtCutGev(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* MET Cut */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">Missing E_T (MET):</span>
              <span className="text-text-primary font-bold">{metCutGev} GeV</span>
            </div>
            <input
              type="range"
              min={60}
              max={200}
              step={5}
              value={metCutGev}
              onChange={(e) => setMetCutGev(Number(e.target.value))}
              className="w-full accent-pink-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Warning Box & Export */}
        <div className="space-y-3 pt-3 border-t border-canvas-border">
          {(isL1OverBudget || isHltOverBudget) && (
            <div className="p-2.5 bg-red-950/40 border border-red-500/50 rounded text-[11px] font-mono text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>
                <strong>Trigger Throttle / Deadtime:</strong> Selected cuts exceed readout bandwidth
                budget! Increase thresholds to avoid buffer loss.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportJson}
              className="py-1 px-2 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-xs font-mono text-text-secondary flex items-center justify-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportCsv}
              className="py-1 px-2 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-xs font-mono text-text-secondary flex items-center justify-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* CENTER: Multi-Stage Trigger Pipeline Graphic & ROC Curve */}
      <div className="flex-1 flex flex-col justify-between bg-canvas rounded-panel border border-canvas-border p-4 relative min-h-[460px] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-text-primary font-bold">
              TRIGGER &amp; DAQ BANDWIDTH FILTER PIPELINE
            </h3>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Crossing Rate: <strong className="text-cern-cyan">40,000,000 Hz (40 MHz)</strong>
          </span>
        </div>

        {/* Pipeline Stage Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Stage 1: Level-1 Hardware Trigger */}
          <div
            className={`p-3.5 rounded border transition-colors ${
              isL1OverBudget
                ? 'bg-red-950/20 border-red-500/50'
                : 'bg-canvas-surface border-canvas-border'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-text-primary">LEVEL-1 (L1)</span>
              <span className="text-[10px] font-mono text-text-muted">FPGA / ASIC</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Rate:</span>
                <span className={`font-bold ${isL1OverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                  {baseL1RateKhz.toFixed(1)} kHz
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Budget:</span>
                <span>{l1BudgetMaxKhz} kHz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Latency:</span>
                <span className="text-text-secondary">2.5 µs</span>
              </div>
            </div>
          </div>

          {/* Stage 2: High-Level Trigger (HLT) */}
          <div
            className={`p-3.5 rounded border transition-colors ${
              isHltOverBudget
                ? 'bg-red-950/20 border-red-500/50'
                : 'bg-canvas-surface border-canvas-border'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-text-primary">HIGH-LEVEL (HLT)</span>
              <span className="text-[10px] font-mono text-text-muted">CPU/GPU Farm</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Rate:</span>
                <span className={`font-bold ${isHltOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                  {baseHltRateHz} Hz
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Budget:</span>
                <span>{hltBudgetMaxHz} Hz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Latency:</span>
                <span className="text-text-secondary">~350 ms</span>
              </div>
            </div>
          </div>

          {/* Stage 3: Tier-0 Storage Ingest */}
          <div className="p-3.5 bg-canvas-surface border border-canvas-border rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-text-primary">TIER-0 STORAGE</span>
              <span className="text-[10px] font-mono text-text-muted">Tape &amp; Disk</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Bandwidth:</span>
                <span className="text-cern-cyan font-bold">
                  {((baseHltRateHz * 1.5) / 1000).toFixed(2)} GB/s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Event Size:</span>
                <span className="text-text-secondary">~1.5 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Daily Vol:</span>
                <span className="text-emerald-400">
                  {((baseHltRateHz * 1.5 * 86400) / 1e6).toFixed(1)} TB/day
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency vs Background Rejection ROC Curve */}
        <div className="p-3 bg-canvas-surface border border-canvas-border rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-text-muted font-semibold">
              Signal Efficiency vs. Background Rejection Trade-Off
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              Rejection: {backgroundRejection.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-canvas-sub h-4 rounded-full overflow-hidden border border-canvas-border flex">
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${higgsSignalEfficiency}%` }}
              title={`Signal Efficiency: ${higgsSignalEfficiency.toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-text-muted mt-1">
            <span>Higgs Signal Efficiency: {higgsSignalEfficiency.toFixed(1)}%</span>
            <span>QCD Background Retained: {(100 - backgroundRejection).toFixed(2)}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-canvas-border text-[11px] font-mono text-text-muted">
          <span>Readout Protocol: ATLAS Trigger TDR (CERN-LHCC-2013-018)</span>
        </div>
      </div>

      {/* RIGHT: Physics Context & Explanation */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border border-canvas-border rounded-panel p-4 space-y-4">
        <div className="space-y-3">
          <div className="pb-2 border-b border-canvas-border">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase">
              The Trigger Challenge
            </h3>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            With bunch crossings occurring every 25 nanoseconds (40 million times a second), the LHC
            produces up to 1 petabyte of raw digitized sensor data per second.
          </p>

          <p className="text-xs text-text-secondary leading-relaxed">
            It is physically impossible to record all raw collisions to storage. The multi-level
            trigger pipeline rejects 99.997% of soft minimum bias collisions within microseconds,
            saving only the 1,000–2,000 most scientifically promising events each second.
          </p>

          <div className="p-3 bg-canvas-sub border border-canvas-border rounded text-[11px] text-amber-300/90 leading-relaxed font-mono">
            <strong>Honesty Note:</strong> Open Data collision files released by CERN only contain
            events that ALREADY passed the trigger. Unbiased Level-1 trigger rates cannot be derived
            from open data.
          </div>
        </div>

        <div className="pt-3 border-t border-canvas-border text-[11px] font-mono text-text-muted">
          <span>Simulation Fidelity: Educational Toy Model</span>
        </div>
      </div>
    </div>
  );
};
