'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dimuonSlice from '../../../../../data/real_events/processed_dimuon_slice.json';
import { MathFormula } from '@/components/ui/MathFormula';
import { playResonanceTone } from '@/lib/sonifier';
import { BarChart3, Sparkles, Radio, ArrowRight } from 'lucide-react';

interface DimuonEvent {
  id: string;
  runNumber: number;
  lumiBlock: number;
  process: string;
  muon1: { pt: number; eta: number; phi: number; charge: number };
  muon2: { pt: number; eta: number; phi: number; charge: number };
  reconstructedMass: number;
}

const EVENTS = dimuonSlice.sample_events as DimuonEvent[];

export const DimuonSpectrumExplorer: React.FC = () => {
  const [selectedBinMin, setSelectedBinMin] = useState<number>(88);
  const [selectedEventId, setSelectedEventId] = useState<string>(EVENTS[0]?.id || '');
  const [binWidthGev, setBinWidthGev] = useState<number>(2);
  const [minLeadPt, setMinLeadPt] = useState<number>(25);

  const filteredDimuons = useMemo(
    () => EVENTS.filter((e) => Math.max(e.muon1.pt, e.muon2.pt) >= minLeadPt),
    [minLeadPt]
  );

  // Build dynamic histogram bins across [70, 110] GeV around the Z0 -> mu+ mu- pole
  const bins = useMemo(() => {
    const out: { min: number; max: number; count: number; events: DimuonEvent[]; bwTheory: number }[] = [];
    const Mz = 91.1876;
    const Gz = 2.4952;
    for (let m = 70; m < 110; m += binWidthGev) {
      const mCenter = m + binWidthGev / 2;
      const inBin = filteredDimuons.filter((e) => e.reconstructedMass >= m && e.reconstructedMass < m + binWidthGev);
      const bw = 1 / ((mCenter * mCenter - Mz * Mz) ** 2 + (Mz * Gz) ** 2);
      out.push({ min: m, max: m + binWidthGev, count: inBin.length, events: inBin, bwTheory: bw });
    }
    return out;
  }, [filteredDimuons, binWidthGev]);

  const maxCount = Math.max(1, ...bins.map((b) => b.count));
  const maxBw = Math.max(1e-9, ...bins.map((b) => b.bwTheory));
  const selectedBin = bins.find((b) => b.min === selectedBinMin) || bins.find((b) => b.count > 0) || bins[0];
  const inspectedEvent =
    filteredDimuons.find((e) => e.id === selectedEventId) ||
    selectedBin.events[0] ||
    filteredDimuons[0] ||
    EVENTS[0];

  return (
    <section className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cern-cyan" />
            <h2 className="text-lg font-display font-extrabold text-white">
              Real CMS &amp; ATLAS Z⁰ → μ⁺μ⁻ Dimuon Invariant Mass Spectrum
            </h2>
            <span className="px-2 py-0.5 bg-emerald-400 text-black text-[10px] font-mono font-bold border border-black uppercase">
              REAL OPEN DATA ({dimuonSlice.metadata.total_selected} Selected)
            </span>
          </div>
          <p className="text-xs text-text-secondary font-sans mt-1">
            Inspect the reconstructed invariant mass slice around the <strong>91.19 GeV Z⁰ boson pole</strong> from{' '}
            <code className="text-cern-cyan">processed_dimuon_slice.json</code> ({dimuonSlice.metadata.doi}). Click any histogram bar to inspect its real dimuon candidates.
          </p>
        </div>

        <MathFormula
          tex="m_{\mu\mu} = \sqrt{2\,p_{T1}\,p_{T2}\,(\cosh\Delta\eta - \cos\Delta\phi)}"
          derivation="For ultra-relativistic muons (E >> 0.106 GeV), invariant mass reconstructs cleanly from transverse momenta pT, pseudorapidity separation Δeta, and azimuthal angle Δphi."
        />
      </div>

      {/* Cutflow Pipeline Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        {dimuonSlice.cutflow.map((step) => (
          <div key={step.cut} className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] text-text-muted block truncate">{step.cut}</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-cern-cyan text-base">{step.survived.toLocaleString('en-US')}</strong>
              <span className="text-emerald-400 text-[11px] font-bold">
                {(step.efficiency_abs * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Histogram Bars (7 cols) */}
        <div className="lg:col-span-7 p-4 bg-canvas border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-white font-bold uppercase">
              Live Re-Binning ({filteredDimuons.length}/{EVENTS.length} Sampled Events)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted">Bin Width:</span>
              {[1, 2, 4].map((bw) => (
                <button
                  key={bw}
                  onClick={() => setBinWidthGev(bw)}
                  className={`px-1.5 py-0.5 border border-black text-[10px] font-bold ${
                    binWidthGev === bw ? 'bg-cern-cyan text-black' : 'bg-canvas-sub text-text-secondary'
                  }`}
                >
                  {bw} GeV
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono bg-canvas-sub p-2 border border-black">
            <span className="text-text-muted font-bold shrink-0">Lead Muon p_T &ge; {minLeadPt} GeV</span>
            <input
              type="range"
              min={20}
              max={90}
              step={5}
              value={minLeadPt}
              onChange={(e) => setMinLeadPt(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div className="h-52 flex items-end gap-1 pt-6 pb-2 border-b-2 border-black px-1 bg-[#050811] relative">
            {bins.map((bin) => {
              const pct = (bin.count / maxCount) * 100;
              const theoryPct = (bin.bwTheory / maxBw) * 95;
              const isZPeak = bin.min >= 88 && bin.min <= 94;
              const isSelected = bin.min === selectedBin.min;
              return (
                <button
                  key={bin.min}
                  type="button"
                  onClick={() => {
                    setSelectedBinMin(bin.min);
                    if (bin.events[0]) setSelectedEventId(bin.events[0].id);
                    playResonanceTone(bin.min + binWidthGev / 2);
                  }}
                  className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer relative"
                  title={`${bin.min}–${bin.max} GeV: ${bin.count} sampled events`}
                >
                  {/* Breit-Wigner Theory Dot Marker */}
                  <div
                    className="absolute w-1.5 h-1.5 rounded-full bg-cern-magenta border border-black pointer-events-none z-10"
                    style={{ bottom: `calc(${theoryPct}% + 14px)` }}
                  />
                  <div
                    className={`w-full transition-all border border-black ${
                      isSelected
                        ? 'bg-[#FFE600]'
                        : isZPeak
                        ? 'bg-cern-cyan group-hover:bg-white'
                        : 'bg-cern-blue group-hover:bg-sky-400'
                    }`}
                    style={{ height: `${bin.count > 0 ? Math.max(12, pct) : 4}%`, opacity: bin.count > 0 ? 1 : 0.25 }}
                  />
                  <span className="text-[8px] font-mono text-text-muted mt-1">
                    {bin.min % 4 === 0 ? bin.min : ''}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-text-muted">
            <span>Pink dots = PDG Z⁰ Breit-Wigner Fit (91.19 GeV)</span>
            <span>Bin [{selectedBin.min}–{selectedBin.max} GeV] ({selectedBin.count} events)</span>
          </div>
        </div>

        {/* Selected Real Event Inspector (5 cols) */}
        <div className="lg:col-span-5 p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000] space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-bold text-white uppercase flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cern-magenta" /> Real Candidate: {inspectedEvent.id}
            </span>
            <span className="text-[#FFE600] font-black">{inspectedEvent.reconstructedMass} GeV</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(selectedBin.events.length > 0 ? selectedBin.events : EVENTS.slice(0, 4)).slice(0, 5).map((ev) => (
              <button
                key={ev.id}
                onClick={() => {
                  setSelectedEventId(ev.id);
                  playResonanceTone(ev.reconstructedMass);
                }}
                className={`px-2 py-1 border border-black text-[10px] font-bold ${
                  inspectedEvent.id === ev.id ? 'bg-cern-cyan text-black' : 'bg-canvas-surface text-text-secondary'
                }`}
              >
                {ev.id} ({ev.reconstructedMass} GeV)
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-canvas-surface border-2 border-black space-y-1">
              <span className="text-[10px] text-cern-cyan font-bold block">MUON 1 (q = {inspectedEvent.muon1.charge > 0 ? '+1' : '-1'})</span>
              <div>p_T: <strong className="text-white">{inspectedEvent.muon1.pt} GeV</strong></div>
              <div>η: <strong className="text-text-secondary">{inspectedEvent.muon1.eta}</strong></div>
              <div>φ: <strong className="text-text-secondary">{inspectedEvent.muon1.phi} rad</strong></div>
            </div>
            <div className="p-2.5 bg-canvas-surface border-2 border-black space-y-1">
              <span className="text-[10px] text-cern-magenta font-bold block">MUON 2 (q = {inspectedEvent.muon2.charge > 0 ? '+1' : '-1'})</span>
              <div>p_T: <strong className="text-white">{inspectedEvent.muon2.pt} GeV</strong></div>
              <div>η: <strong className="text-text-secondary">{inspectedEvent.muon2.eta}</strong></div>
              <div>φ: <strong className="text-text-secondary">{inspectedEvent.muon2.phi} rad</strong></div>
            </div>
          </div>

          <div className="p-2.5 bg-black border border-black text-[11px] text-emerald-400">
            Run {inspectedEvent.runNumber} · LumiBlock {inspectedEvent.lumiBlock} · Process: {inspectedEvent.process}
          </div>

          <Link
            href={`/detectors?detector=cms&dimuonId=${encodeURIComponent(inspectedEvent.id)}`}
            className="w-full py-2.5 bg-cern-blue hover:bg-cern-accent text-white font-bold uppercase border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-all"
          >
            <span>Inspect {inspectedEvent.id} in 3D CMS Twin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
