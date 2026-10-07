'use client';

import React, { useState } from 'react';
import atlasEventsData from '../../../../../data/real_events/sample_atlas_events.json';
import cmsEventsData from '../../../../../data/real_events/sample_cms_events.json';
import { Value } from '@/components/provenance/Value';
import { Database, ExternalLink, Download, Filter, Search, Play, CheckCircle2 } from 'lucide-react';

export default function OpenDataPage() {
  const [activeTab, setActiveTab] = useState<'atlas' | 'cms'>('atlas');
  const [filterPt, setFilterPt] = useState<number>(20);

  const currentDataset = activeTab === 'atlas' ? atlasEventsData : cmsEventsData;

  const filteredEvents = currentDataset.events.filter((evt) =>
    evt.physicsObjects.some((o) => o.ptGev >= filterPt)
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
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
          the LHC experiments for research, education, and algorithmic benchmarking.
        </p>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-canvas-border pb-3 text-xs font-mono">
        <button
          onClick={() => setActiveTab('atlas')}
          className={`px-4 py-2 rounded-panel border transition-all ${
            activeTab === 'atlas'
              ? 'bg-cern-blue border-cern-accent text-white font-bold'
              : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
          }`}
        >
          ATLAS 13 TeV Open Data (4-Lepton &amp; Diphoton)
        </button>
        <button
          onClick={() => setActiveTab('cms')}
          className={`px-4 py-2 rounded-panel border transition-all ${
            activeTab === 'cms'
              ? 'bg-cern-blue border-cern-accent text-white font-bold'
              : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
          }`}
        >
          CMS 8 TeV Run 2012B (Dimuon &amp; Dijet)
        </button>
      </div>

      {/* Interactive Analysis Sandbox */}
      <div className="w-full flex flex-col xl:flex-row gap-6 p-5 bg-canvas-sub border border-canvas-border rounded-panel">
        {/* Left Filter Deck */}
        <div className="w-full xl:w-72 bg-canvas-surface p-4 rounded-panel border border-canvas-border space-y-4">
          <h3 className="text-xs font-mono uppercase font-bold text-text-primary flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cern-cyan" /> Client-Side Cut
          </h3>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">Minimum Object p_T:</span>
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

          <div className="p-3 bg-canvas-sub rounded border border-canvas-border text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">Dataset DOI:</span>
              <span className="text-cern-accent truncate">{currentDataset.doi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Passed Filter:</span>
              <span className="text-emerald-400 font-bold">
                {filteredEvents.length} / {currentDataset.events.length} events
              </span>
            </div>
          </div>

          <a
            href={`https://doi.org/${currentDataset.doi}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 rounded bg-canvas-sub hover:bg-canvas-raised border border-canvas-border text-xs font-mono text-cern-accent flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open on CERN Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Right Event Inspector Table */}
        <div className="flex-1 bg-canvas-surface p-4 rounded-panel border border-canvas-border overflow-x-auto">
          <h3 className="text-xs font-mono uppercase font-bold text-text-primary mb-3">
            Loaded Collision Events ({currentDataset.datasetId})
          </h3>

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
              {filteredEvents.map((evt) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
