'use client';

import React, { useState } from 'react';
import atlasEventsData from '../../../../../data/real_events/sample_atlas_events.json';
import cmsEventsData from '../../../../../data/real_events/sample_cms_events.json';
import { HepdataOverlay } from '@/components/open-data/HepdataOverlay';
import { Eli5Card } from '@/components/ui/Eli5Card';
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
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono uppercase text-black font-bold tracking-wider px-2.5 py-1 bg-cern-cyan border-2 border-black shadow-[2px_2px_0px_#000]">
            /// OPEN SCIENCE &amp; PUBLIC DATASETS ///
          </span>
          <span className="text-[10px] font-mono px-2 py-1 bg-emerald-400 text-black font-bold border-2 border-black shadow-[2px_2px_0px_#000]">
            CC0-1.0 &amp; CC-BY-4.0
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
          CERN Open Data Bridge &amp; Analysis Lab
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
          CERN Open Data provides access to petabytes of collision datasets and simulated samples from
          the LHC experiments for research, education, and algorithmic benchmarking. Every sample in
          this portal is grounded in verifiable DOIs.
        </p>
      </div>

      <Eli5Card
        title="Filtering Gold Nuggets Out of Cosmic Static (Cutflow Selection)"
        analogy="Imagine panning for tiny gold flakes mixed inside a million pebbles of river sand! A 'cutflow' is like stacking smarter sieves: first toss away low-energy sideways pebbles (low p_T), ignore edges of the bucket (high |η|), and keep only collisions adding up right around 125 GeV where the Higgs boson hides!"
        keyPoints={[
          'Transverse Momentum (p_T): How hard particles fly sideways out of the beam pipe—rare heavy decays throw high-p_T tracks!',
          'Pseudorapidity (|η| ≤ 2.5): Keeps tracks aimed straight through the most accurate central silicon layers.',
          'Real CC0 Public Data: Every event you filter here comes from real ATLAS & CMS 13 TeV Open Data DOIs.',
        ]}
        whatToTry="Drag the Minimum p_T slider up from 20 GeV to 45 GeV and watch noisy background events vanish while genuine Z⁰ & Higgs candidates survive!"
        doi="10.7483/OPENDATA.CMS.89E4.W6W8"
        citationLabel="CERN Open Data Portal (CC0 Public Release)"
      />

      {/* Published HEPData Overlay Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cern-cyan" /> /// HEPData Published Collaboration Measurements ///
          </h2>
        </div>
        <HepdataOverlay />
      </section>

      {/* Dataset Selection Tabs */}
      <section className="space-y-4 pt-4 border-t-3 border-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-display font-extrabold text-white">
              /// Client-Side Event Filter &amp; Cutflow ///
            </h2>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              Select kinematic criteria to filter open data events directly in your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab('atlas')}
              className={`px-3.5 py-2 border-2 border-black font-mono font-bold uppercase transition-all ${
                activeTab === 'atlas'
                  ? 'bg-cern-blue border-black text-white shadow-[4px_4px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                  : 'bg-canvas-surface border-black text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
              }`}
            >
              ATLAS 13 TeV (4L &amp; Diphoton)
            </button>
            <button
              onClick={() => setActiveTab('cms')}
              className={`px-3.5 py-2 border-2 border-black font-mono font-bold uppercase transition-all ${
                activeTab === 'cms'
                  ? 'bg-cern-blue border-black text-white shadow-[4px_4px_0px_#4C7DFF] -translate-x-0.5 -translate-y-0.5'
                  : 'bg-canvas-surface border-black text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
              }`}
            >
              CMS 8 TeV (Dimuon &amp; Dijet)
            </button>
          </div>
        </div>

        {/* Interactive Analysis Sandbox */}
        <div className="w-full flex flex-col xl:flex-row gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
          {/* Left Filter Deck */}
          <div className="w-full xl:w-80 bg-canvas-surface p-4 border-2 border-black shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3 mb-2">
              <h3 className="text-xs font-mono uppercase font-bold text-white flex items-center gap-1.5 tracking-wider">
                <Filter className="w-3.5 h-3.5 text-cern-cyan" /> /// Kinematic Cuts ///
              </h3>
              <span className="text-[10px] font-mono text-black font-bold bg-emerald-400 px-2 py-0.5 border-2 border-black shadow-[1px_1px_0px_#000]">
                Active
              </span>
            </div>

            {/* Min pT Slider */}
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-muted font-bold">Min Object p_T:</span>
                <span className="text-cern-cyan font-bold">{filterPt} GeV/c</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={2}
                value={filterPt}
                onChange={(e) => setFilterPt(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            {/* Max |eta| Slider */}
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-muted font-bold">Max Pseudorapidity |&eta;|:</span>
                <span className="text-cern-cyan font-bold">{maxEta.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={2.5}
                step={0.1}
                value={maxEta}
                onChange={(e) => setMaxEta(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            {/* Mass Window Slider */}
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-text-muted font-bold">Mass Window:</span>
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
                  className="w-1/2 cursor-pointer"
                />
                <input
                  type="range"
                  min={95}
                  max={160}
                  step={5}
                  value={massMax}
                  onChange={(e) => setMassMax(Number(e.target.value))}
                  className="w-1/2 cursor-pointer"
                />
              </div>
            </div>

            {/* Cutflow Stats Card */}
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Dataset DOI:</span>
                <span className="text-cern-cyan font-bold truncate max-w-[140px]">{currentDataset.doi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Filter Efficiency:</span>
                <span className="text-emerald-400 font-bold">
                  {((filteredEvents.length / currentDataset.events.length) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-bold">Passed Events:</span>
                <span className="text-emerald-400 font-bold">
                  {filteredEvents.length} / {currentDataset.events.length}
                </span>
              </div>
            </div>

            {/* Export Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={exportFilteredJson}
                className="py-1.5 px-2 bg-canvas-sub hover:bg-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] text-xs font-mono font-bold text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Download className="w-3 h-3 text-cern-cyan" />
                <span>JSON</span>
              </button>
              <button
                onClick={exportFilteredCsv}
                className="py-1.5 px-2 bg-canvas-sub hover:bg-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] text-xs font-mono font-bold text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Download className="w-3 h-3 text-cern-cyan" />
                <span>CSV</span>
              </button>
            </div>

            <a
              href={`https://doi.org/${currentDataset.doi}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 bg-cern-blue hover:bg-cern-accent border-2 border-black shadow-[3px_3px_0px_#00E5FF] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span>Verify on CERN Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-cern-cyan" />
            </a>
          </div>

          {/* Right Event Inspector Table */}
          <div className="flex-1 bg-canvas-surface p-4 border-2 border-black shadow-[4px_4px_0px_#000] overflow-x-auto">
            <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-black">
              <h3 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                /// Filtered Collision Events ({currentDataset.datasetId}) ///
              </h3>
              <span className="text-xs font-mono text-cern-cyan font-bold px-2 py-0.5 bg-black border-2 border-black shadow-[2px_2px_0px_#00E5FF]">
                {filteredEvents.length} events matching
              </span>
            </div>

            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b-2 border-black text-white font-bold bg-canvas-sub">
                  <th className="p-2">Event ID</th>
                  <th className="p-2">Run Number</th>
                  <th className="p-2">Physics Process</th>
                  <th className="p-2">Objects</th>
                  <th className="p-2">Reconstructed Mass</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-canvas-sub transition-colors">
                      <td className="p-2.5 font-bold text-white">{evt.id}</td>
                      <td className="p-2.5 text-text-secondary">{evt.runNumber}</td>
                      <td className="p-2.5 text-cern-cyan font-bold">{evt.process}</td>
                      <td className="p-2.5 text-text-secondary">
                        {evt.physicsObjects.map((o) => o.type).join(', ')}
                      </td>
                      <td className="p-2.5 text-emerald-400 font-bold">
                        {evt.reconstructedMassGev} GeV
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted font-mono font-bold">
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
