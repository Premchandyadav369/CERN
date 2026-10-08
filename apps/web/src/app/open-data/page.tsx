'use client';

import React, { useState } from 'react';
import atlasEventsData from '../../../../../data/real_events/sample_atlas_events.json';
import cmsEventsData from '../../../../../data/real_events/sample_cms_events.json';
import { HepdataOverlay } from '@/components/open-data/HepdataOverlay';
import { Value } from '@/components/provenance/Value';
import { Database, ExternalLink, Download, Filter, Search, Play, CheckCircle2, Layers } from 'lucide-react';

export default function OpenDataPage() {
  const [activeTab, setActiveTab] = useState<'atlas' | 'cms'>('atlas');
  const [filterPt, setFilterPt] = useState<number>(20);
  const [maxEta, setMaxEta] = useState<number>(2.5);
  const [massMin, setMassMin] = useState<number>(60);
  const [massMax, setMassMax] = useState<number>(140);

  const currentDataset = activeTab === 'atlas' ? atlasEventsData : cmsEventsData;

  // Filter events by kinematics
  const filteredEvents = currentDataset.events.filter((evt) => {
    const hasPt = evt.physicsObjects.some((o) => o.ptGev >= filterPt);
    const hasEta = evt.physicsObjects.every((o) => Math.abs(o.eta) <= maxEta);
    const hasMass = evt.reconstructedMassGev >= massMin && evt.reconstructedMassGev <= massMax;
    return hasPt && hasEta && hasMass;
  });

  // Export JSON
  const exportFilteredJson = () => {
    const payload = {
      dataset: currentDataset.datasetId,
      doi: currentDataset.doi,
      exportTimestamp: new Date().toISOString(),
      cuts: { filterPtGev: filterPt, maxEta, massWindowGev: [massMin, massMax] },
      survivedEvents: filteredEvents.length,
      totalEvents: currentDataset.events.length,
      events: filteredEvents,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDataset.datasetId}_filtered.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportFilteredCsv = () => {
    let csv = 'event_id,run_number,process,objects,reconstructed_mass_gev\n';
    filteredEvents.forEach((evt) => {
      const objStr = evt.physicsObjects.map((o) => o.type).join(';');
      csv += `${evt.id},${evt.runNumber},${evt.process},"${objStr}",${evt.reconstructedMassGev}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDataset.datasetId}_filtered.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
            OPEN SCIENCE &amp; PUBLIC DATASETS
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            CC0-1.0 &amp; CC-BY-4.0
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary">
          CERN Open Data Bridge &amp; Analysis Lab
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-3xl leading-relaxed">
          CERN Open Data provides access to petabytes of collision datasets and simulated samples from
          the LHC experiments for research, education, and algorithmic benchmarking. Every sample in
          this portal is grounded in verifiable DOIs.
        </p>
      </div>

      {/* Published HEPData Overlay Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-cern-cyan" /> HEPData Published Collaboration Measurements
          </h2>
        </div>
        <HepdataOverlay />
      </section>

      {/* Dataset Selection Tabs */}
      <section className="space-y-4 pt-4 border-t border-canvas-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-display font-bold text-text-primary">
              Client-Side Event Filter &amp; Cutflow
            </h2>
            <p className="text-xs text-text-muted">
              Select kinematic criteria to filter open data events directly in your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab('atlas')}
              className={`px-3 py-1.5 rounded-panel border transition-all ${
                activeTab === 'atlas'
                  ? 'bg-cern-blue border-cern-accent text-white font-bold'
                  : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
              }`}
            >
              ATLAS 13 TeV (4L &amp; Diphoton)
            </button>
            <button
              onClick={() => setActiveTab('cms')}
              className={`px-3 py-1.5 rounded-panel border transition-all ${
                activeTab === 'cms'
                  ? 'bg-cern-blue border-cern-accent text-white font-bold'
                  : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
              }`}
            >
              CMS 8 TeV (Dimuon &amp; Dijet)
            </button>
          </div>
        </div>

        {/* Interactive Analysis Sandbox */}
        <div className="w-full flex flex-col xl:flex-row gap-6 p-5 bg-canvas-sub border border-canvas-border rounded-panel">
          {/* Left Filter Deck */}
          <div className="w-full xl:w-80 bg-canvas-surface p-4 rounded-panel border border-canvas-border space-y-4">
            <div className="flex items-center justify-between border-b border-canvas-border pb-2">
              <h3 className="text-xs font-mono uppercase font-bold text-text-primary flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cern-cyan" /> Kinematic Cuts
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Active
              </span>
            </div>

            {/* Min pT Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-muted">Min Object p_T:</span>
                <span className="text-cern-cyan font-bold">{filterPt} GeV/c</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={2}
                value={filterPt}
                onChange={(e) => setFilterPt(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
              />
            </div>

            {/* Max |eta| Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-muted">Max Pseudorapidity |&eta;|:</span>
                <span className="text-cern-cyan font-bold">{maxEta.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={2.5}
                step={0.1}
                value={maxEta}
                onChange={(e) => setMaxEta(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
              />
            </div>

            {/* Mass Window Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-muted">Mass Window:</span>
                <span className="text-cern-cyan font-bold">
                  {massMin} - {massMax} GeV
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={20}
                  max={90}
                  step={5}
                  value={massMin}
                  onChange={(e) => setMassMin(Number(e.target.value))}
                  className="w-1/2 accent-cern-cyan cursor-pointer"
                />
                <input
                  type="range"
                  min={95}
                  max={160}
                  step={5}
                  value={massMax}
                  onChange={(e) => setMassMax(Number(e.target.value))}
                  className="w-1/2 accent-cern-cyan cursor-pointer"
                />
              </div>
            </div>

            {/* Cutflow Stats Card */}
            <div className="p-3 bg-canvas-sub rounded border border-canvas-border text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-muted">Dataset DOI:</span>
                <span className="text-cern-accent truncate max-w-[140px]">{currentDataset.doi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Filter Efficiency:</span>
                <span className="text-emerald-400 font-bold">
                  {((filteredEvents.length / currentDataset.events.length) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Passed Events:</span>
                <span className="text-emerald-400 font-bold">
                  {filteredEvents.length} / {currentDataset.events.length}
                </span>
              </div>
            </div>

            {/* Export Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={exportFilteredJson}
                className="py-1.5 px-2 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-xs font-mono text-text-primary flex items-center justify-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>JSON</span>
              </button>
              <button
                onClick={exportFilteredCsv}
                className="py-1.5 px-2 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-xs font-mono text-text-primary flex items-center justify-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </button>
            </div>

            <a
              href={`https://doi.org/${currentDataset.doi}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-xs font-mono text-cern-accent flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Verify on CERN Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right Event Inspector Table */}
          <div className="flex-1 bg-canvas-surface p-4 rounded-panel border border-canvas-border overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase font-bold text-text-primary">
                Filtered Collision Events ({currentDataset.datasetId})
              </h3>
              <span className="text-xs font-mono text-text-muted">
                Showing {filteredEvents.length} matching events
              </span>
            </div>

            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-canvas-border text-text-muted">
                  <th className="pb-2">Event ID</th>
                  <th className="pb-2">Run Number</th>
                  <th className="pb-2">Physics Process</th>
                  <th className="pb-2">Objects</th>
                  <th className="pb-2">Reconstructed Mass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-border/50">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-canvas-sub transition-colors">
                      <td className="py-2.5 font-bold text-text-primary">{evt.id}</td>
                      <td className="py-2.5 text-text-secondary">{evt.runNumber}</td>
                      <td className="py-2.5 text-cern-cyan">{evt.process}</td>
                      <td className="py-2.5 text-text-secondary">
                        {evt.physicsObjects.map((o) => o.type).join(', ')}
                      </td>
                      <td className="py-2.5 text-emerald-400 font-bold">
                        {evt.reconstructedMassGev} GeV
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted">
                      No events survived the kinematic cuts. Try broadening the p_T or mass window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
