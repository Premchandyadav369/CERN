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
    <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
      {/* LEFT: Trigger Threshold Controls */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3 mb-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5 tracking-wider">
              <Sliders className="w-4 h-4 text-cern-cyan" /> /// Trigger Menu Cuts ///
            </h3>
            <FidelityBadge type="TOY" />
          </div>

          {/* Single Muon pT Cut */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted font-bold">Single Muon p_T:</span>
              <span className="text-cern-cyan font-bold">{muonPtCutGev} GeV/c</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={1}
              value={muonPtCutGev}
              onChange={(e) => setMuonPtCutGev(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 border-2 border-black appearance-none cursor-pointer accent-cern-cyan"
            />
            <span className="text-[10px] text-text-muted block font-mono">
              Nominal Run 3 Menu: 24 GeV (isolated)
            </span>
          </div>

          {/* Single Electron pT Cut */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted font-bold">Single Electron p_T:</span>
              <span className="text-white font-bold">{electronPtCutGev} GeV/c</span>
            </div>
            <input
              type="range"
              min={15}
              max={60}
              step={1}
              value={electronPtCutGev}
              onChange={(e) => setElectronPtCutGev(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 border-2 border-black appearance-none cursor-pointer accent-cern-blue"
            />
            <span className="text-[10px] text-text-muted block font-mono">
              Nominal Run 3 Menu: 28 GeV
            </span>
          </div>

          {/* Jet pT Cut */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted font-bold">High-p_T Jet:</span>
              <span className="text-amber-400 font-bold">{jetPtCutGev} GeV/c</span>
            </div>
            <input
              type="range"
              min={50}
              max={250}
              step={5}
              value={jetPtCutGev}
              onChange={(e) => setJetPtCutGev(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 border-2 border-black appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* MET Cut */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted font-bold">Missing E_T (MET):</span>
              <span className="text-pink-400 font-bold">{metCutGev} GeV</span>
            </div>
            <input
              type="range"
              min={60}
              max={200}
              step={5}
              value={metCutGev}
              onChange={(e) => setMetCutGev(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 border-2 border-black appearance-none cursor-pointer accent-pink-400"
            />
          </div>
        </div>

        {/* Warning Box & Export */}
        <div className="space-y-3 pt-3 border-t-2 border-black">
          {(isL1OverBudget || isHltOverBudget) && (
            <div className="p-3 bg-red-500 text-black border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-mono font-bold flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-black mt-0.5" />
              <span>
                <strong className="text-black uppercase block mb-0.5 font-black">/// Trigger Deadtime Warning ///</strong>
                Selected cuts exceed readout bandwidth budget! Increase thresholds to avoid buffer loss.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportJson}
              className="py-1.5 px-2 bg-canvas-sub hover:bg-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-mono font-bold text-white flex items-center justify-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Download className="w-3.5 h-3.5 text-cern-cyan" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportCsv}
              className="py-1.5 px-2 bg-canvas-sub hover:bg-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-mono font-bold text-white flex items-center justify-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Download className="w-3.5 h-3.5 text-cern-cyan" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* CENTER: Multi-Stage Trigger Pipeline Graphic & ROC Curve */}
      <div className="flex-1 flex flex-col justify-between bg-canvas border-2 border-black shadow-[4px_4px_0px_#000] p-4 relative min-h-[460px] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3.5 mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
              /// TRIGGER &amp; DAQ BANDWIDTH FILTER PIPELINE ///
            </h3>
          </div>
          <span className="text-xs font-mono text-text-muted font-bold">
            CROSSING: <strong className="text-cern-cyan">40 MHz</strong>
          </span>
        </div>

        {/* Pipeline Stage Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Stage 1: Level-1 Hardware Trigger */}
          <div
            className={`p-3.5 border-2 border-black shadow-[3px_3px_0px_#000] transition-colors ${
              isL1OverBudget
                ? 'bg-red-500/20 text-white'
                : 'bg-canvas-surface'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-white uppercase">LEVEL-1 (L1)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black text-cern-cyan border-2 border-black shadow-[1px_1px_0px_#00E5FF]">FPGA/ASIC</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Rate:</span>
                <span className={`font-bold ${isL1OverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                  {baseL1RateKhz.toFixed(1)} kHz
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Budget:</span>
                <span className="text-white font-bold">{l1BudgetMaxKhz} kHz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Latency:</span>
                <span className="text-cern-cyan font-bold">2.5 µs</span>
              </div>
            </div>
          </div>

          {/* Stage 2: High-Level Trigger (HLT) */}
          <div
            className={`p-3.5 border-2 border-black shadow-[3px_3px_0px_#000] transition-colors ${
              isHltOverBudget
                ? 'bg-red-500/20 text-white'
                : 'bg-canvas-surface'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-white uppercase">HIGH-LEVEL (HLT)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black text-amber-400 border-2 border-black shadow-[1px_1px_0px_#FFE600]">CPU/GPU</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Rate:</span>
                <span className={`font-bold ${isHltOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                  {baseHltRateHz} Hz
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Budget:</span>
                <span className="text-white font-bold">{hltBudgetMaxHz} Hz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Latency:</span>
                <span className="text-amber-400 font-bold">~350 ms</span>
              </div>
            </div>
          </div>

          {/* Stage 3: Tier-0 Storage Ingest */}
          <div className="p-3.5 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-white uppercase">TIER-0 STORAGE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black text-emerald-400 border-2 border-black shadow-[1px_1px_0px_#00FF66]">TAPE/DISK</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Bandwidth:</span>
                <span className="text-cern-cyan font-bold">
                  {((baseHltRateHz * 1.5) / 1000).toFixed(2)} GB/s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Event Size:</span>
                <span className="text-white font-bold">~1.5 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Daily Vol:</span>
                <span className="text-emerald-400 font-bold">
                  {((baseHltRateHz * 1.5 * 86400) / 1e6).toFixed(1)} TB/day
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency vs Background Rejection Trade-Off */}
        <div className="p-4 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase text-white font-bold">
              /// Signal Efficiency vs. Background Rejection Trade-Off ///
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Rejection: {backgroundRejection.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-black h-5 border-2 border-black overflow-hidden flex">
            <div
              className="bg-emerald-400 transition-all duration-200 border-r-2 border-black"
              style={{ width: `${higgsSignalEfficiency}%` }}
              title={`Signal Efficiency: ${higgsSignalEfficiency.toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-text-muted font-bold pt-1">
            <span>Higgs Signal Efficiency: {higgsSignalEfficiency.toFixed(1)}%</span>
            <span>QCD Background Retained: {(100 - backgroundRejection).toFixed(2)}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t-2 border-black text-xs font-mono text-text-muted font-bold">
          <span>Readout Protocol: ATLAS Trigger TDR (CERN-LHCC-2013-018)</span>
        </div>
      </div>

      {/* RIGHT: Physics Context & Explanation */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4 space-y-4">
        <div className="space-y-3">
          <div className="pb-2 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3 mb-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              /// The Trigger Challenge ///
            </h3>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-sans">
            With bunch crossings occurring every 25 nanoseconds (40 million times a second), the LHC
            produces up to 1 petabyte of raw digitized sensor data per second.
          </p>

          <p className="text-xs text-text-secondary leading-relaxed font-sans">
            It is physically impossible to record all raw collisions to storage. The multi-level
            trigger pipeline rejects 99.997% of soft minimum bias collisions within microseconds,
            saving only the 1,000–2,000 most scientifically promising events each second.
          </p>

          <div className="p-3 bg-amber-400 text-black border-2 border-black shadow-[3px_3px_0px_#000] text-xs leading-relaxed font-sans">
            <strong className="text-black block font-mono font-bold uppercase mb-1">/// Honesty Note ///</strong>
            Open Data collision files released by CERN only contain events that ALREADY passed the trigger. Unbiased Level-1 trigger rates cannot be derived from open data.
          </div>
        </div>

        <div className="pt-3 border-t-2 border-black text-xs font-mono text-text-muted font-bold">
          <span>Simulation Fidelity: Educational Toy Model</span>
        </div>
      </div>
    </div>
  );
};
