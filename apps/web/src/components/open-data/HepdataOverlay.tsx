'use client';

import React, { useState } from 'react';
import publishedData from '../../../../../data/hepdata/published_benchmarks.json';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Download, ExternalLink, Activity, Sparkles, BarChart2 } from 'lucide-react';

export function HepdataOverlay() {
  const [selectedDataset, setSelectedDataset] = useState<'atlas_h_yy' | 'alice_raa'>('atlas_h_yy');

  const dataset =
    selectedDataset === 'atlas_h_yy'
      ? publishedData.datasets.atlas_h_yy
      : publishedData.datasets.alice_raa;

  const downloadCsv = () => {
    let csv = '';
    if (selectedDataset === 'atlas_h_yy') {
      csv = 'mass_gev,data_events,bkg_fit,signal_exp,stat_error\n';
      dataset.points.forEach((p: any) => {
        csv += `${p.mass_mid},${p.data_events},${p.bkg_fit},${p.signal_exp},${p.stat_err}\n`;
      });
    } else {
      csv = 'pt_mid_gev,pt_low,pt_high,raa,stat_error,sys_error\n';
      dataset.points.forEach((p: any) => {
        csv += `${p.pt_mid},${p.pt_low},${p.pt_high},${p.raa},${p.stat},${p.sys}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hepdata_${selectedDataset}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-canvas-surface border border-canvas-border rounded-panel p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-canvas-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-display font-bold text-text-primary">
              HEPData Comparator: Published Collaboration Overlay
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-medium rounded-full border bg-emerald-950/60 text-emerald-300 border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              PUBLISHED RECORD (HEPDATA)
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Compare simulation models and educational toy spectra against gold-standard peer-reviewed
            experimental measurements archived on HEPData.
          </p>
        </div>

        <button
          onClick={downloadCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-xs font-mono text-text-secondary hover:text-text-primary transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Points (CSV)</span>
        </button>
      </div>

      {/* Dataset Selector Tabs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <button
          onClick={() => setSelectedDataset('atlas_h_yy')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded border transition-all ${
            selectedDataset === 'atlas_h_yy'
              ? 'bg-cern-blue border-cern-accent text-white font-bold'
              : 'bg-canvas-sub border-canvas-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>ATLAS H &rarr; &gamma;&gamma; Diphoton Mass (13 TeV)</span>
        </button>

        <button
          onClick={() => setSelectedDataset('alice_raa')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded border transition-all ${
            selectedDataset === 'alice_raa'
              ? 'bg-cern-blue border-cern-accent text-white font-bold'
              : 'bg-canvas-sub border-canvas-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>ALICE Jet Quenching R_AA in Pb-Pb (5.02 TeV)</span>
        </button>
      </div>

      {/* Main Display Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Plot Visualization Deck (8 cols) */}
        <div className="lg:col-span-8 bg-canvas-base p-4 rounded border border-canvas-border space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-text-primary">{dataset.title}</span>
            <span className="text-text-muted">{dataset.citation}</span>
          </div>

          {/* SVG Plot */}
          {selectedDataset === 'atlas_h_yy' ? (
            <div className="relative w-full h-64 bg-canvas-sub/40 rounded border border-canvas-border flex items-center justify-center p-3">
              <svg className="w-full h-full" viewBox="0 0 500 220">
                {/* Axes */}
                <line x1="50" y1="180" x2="480" y2="180" stroke="#475569" strokeWidth="1.5" />
                <line x1="50" y1="20" x2="50" y2="180" stroke="#475569" strokeWidth="1.5" />

                {/* X Axis Labels */}
                <text x="50" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">110</text>
                <text x="135" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">120</text>
                <text x="220" y="198" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">125 (m_H)</text>
                <text x="305" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">130</text>
                <text x="390" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">135</text>
                <text x="475" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">140</text>
                <text x="265" y="215" fill="#cbd5e1" fontSize="11" fontFamily="monospace" textAnchor="middle">Diphoton Invariant Mass m_yy [GeV]</text>

                {/* Y Axis Label */}
                <text x="18" y="100" fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 18 100)">Events / GeV</text>

                {/* Smooth Background Curve */}
                <path
                  d="M 92.5 35 Q 265 105 475 125"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* Background + Signal Curve */}
                <path
                  d="M 92.5 35 Q 170 65 200 70 Q 220 50 235 75 Q 350 115 475 125"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />

                {/* Data Points with Error Bars */}
                {dataset.points.map((pt: any, i: number) => {
                  const x = 50 + ((pt.mass_mid - 110) / 30) * 425;
                  // y scaled: 1500 -> 30px, 500 -> 160px
                  const y = 180 - ((pt.data_events - 500) / 1100) * 150;
                  const errPx = (pt.stat_err / 1100) * 150;

                  return (
                    <g key={i}>
                      {/* Vertical Error Bar */}
                      <line x1={x} y1={y - errPx} x2={x} y2={y + errPx} stroke="#f8fafc" strokeWidth="1.5" />
                      <line x1={x - 3} y1={y - errPx} x2={x + 3} y2={y - errPx} stroke="#f8fafc" strokeWidth="1.5" />
                      <line x1={x - 3} y1={y + errPx} x2={x + 3} y2={y + errPx} stroke="#f8fafc" strokeWidth="1.5" />
                      {/* Circle Point */}
                      <circle cx={x} cy={y} r="3" fill="#f8fafc" />
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-canvas-surface/90 border border-canvas-border p-2 rounded text-[10px] font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-text-primary">
                  <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                  <span>ATLAS Data (36.1 fb&minus;1)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-3 h-0.5 bg-sky-400 inline-block"></span>
                  <span>Signal + Bkg Fit</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-400">
                  <span className="w-3 h-0.5 bg-red-400 border-b border-dashed inline-block"></span>
                  <span>Background Only</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-64 bg-canvas-sub/40 rounded border border-canvas-border flex items-center justify-center p-3">
              <svg className="w-full h-full" viewBox="0 0 500 220">
                {/* Axes */}
                <line x1="50" y1="180" x2="480" y2="180" stroke="#475569" strokeWidth="1.5" />
                <line x1="50" y1="20" x2="50" y2="180" stroke="#475569" strokeWidth="1.5" />

                {/* Baseline R_AA = 1.0 (No Quenching) */}
                <line x1="50" y1="40" x2="480" y2="40" stroke="#64748b" strokeDasharray="3,3" strokeWidth="1.5" />
                <text x="470" y="35" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">No Quenching Baseline (R_AA = 1.0)</text>

                {/* X Axis */}
                <text x="50" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">0</text>
                <text x="135" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">10</text>
                <text x="220" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">20</text>
                <text x="305" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">30</text>
                <text x="390" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">40</text>
                <text x="475" y="198" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">50</text>
                <text x="265" y="215" fill="#cbd5e1" fontSize="11" fontFamily="monospace" textAnchor="middle">Transverse Momentum p_T [GeV/c]</text>

                {/* Y Axis */}
                <text x="18" y="100" fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 18 100)">R_AA</text>
                <text x="42" y="44" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">1.0</text>
                <text x="42" y="112" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">0.5</text>
                <text x="42" y="180" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">0.0</text>

                {/* Jet Quenching Valley Marker */}
                <rect x="75" y="125" width="40" height="45" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
                <text x="95" y="120" fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="middle">Min R_AA ~ 0.16</text>

                {/* ALICE Points with Systematic Boxes and Stat Bars */}
                {dataset.points.map((pt: any, i: number) => {
                  const x = 50 + (pt.pt_mid / 50) * 425;
                  // y scaled: 1.0 -> 40px, 0.0 -> 180px (140px range)
                  const y = 180 - pt.raa * 140;
                  const statPx = pt.stat * 140;
                  const sysPx = pt.sys * 140;

                  return (
                    <g key={i}>
                      {/* Systematic Error Box */}
                      <rect
                        x={x - 4}
                        y={y - sysPx}
                        width="8"
                        height={sysPx * 2}
                        fill="#38bdf8"
                        fillOpacity="0.2"
                        stroke="#38bdf8"
                        strokeWidth="0.8"
                      />
                      {/* Statistical Error Bar */}
                      <line x1={x} y1={y - statPx} x2={x} y2={y + statPx} stroke="#38bdf8" strokeWidth="1.5" />
                      {/* Marker */}
                      <circle cx={x} cy={y} r="2.5" fill="#38bdf8" />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Metadata & Physics Context Deck (4 cols) */}
        <div className="lg:col-span-4 bg-canvas-sub p-4 rounded border border-canvas-border space-y-4 text-xs font-mono">
          <div>
            <span className="text-text-muted uppercase text-[10px] block">Collaboration &amp; Paper</span>
            <span className="text-text-primary font-bold block mt-0.5">{dataset.title}</span>
            <span className="text-cern-cyan block mt-0.5">{dataset.citation}</span>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-canvas-border">
            <div className="flex justify-between">
              <span className="text-text-muted">HEPData Record:</span>
              <span className="text-text-primary font-bold">{dataset.hepdata_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">License:</span>
              <span className="text-emerald-400">CC-BY-4.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Fidelity:</span>
              <span className="text-text-primary font-semibold">Published Collider Data</span>
            </div>
          </div>

          <div className="p-3 bg-canvas-base rounded border border-canvas-border text-[11px] leading-relaxed text-text-secondary space-y-1.5">
            <span className="font-bold text-text-primary block">Physical Interpretation:</span>
            {selectedDataset === 'atlas_h_yy' ? (
              <p>
                The clear resonance peak at 125.09 GeV sits atop a steeply falling non-resonant
                continuum. This observation confirmed the Brout-Englert-Higgs mechanism in the diphoton channel.
              </p>
            ) : (
              <p>
                In central Pb-Pb collisions, high-pT quarks and gluons suffer massive radiative energy
                loss in the hot Quark-Gluon Plasma (QGP), suppressing particle yields to only ~16% of
                binary collision expectation (jet quenching).
              </p>
            )}
          </div>

          <a
            href={`https://doi.org/${dataset.doi}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 rounded bg-canvas-base hover:bg-canvas-raised border border-canvas-border text-xs font-mono text-cern-accent flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Paper on DOI / InSPIRE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
