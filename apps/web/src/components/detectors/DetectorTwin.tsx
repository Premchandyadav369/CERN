'use client';

import React, { useState } from 'react';
import atlasEventsData from '../../../../../data/real_events/sample_atlas_events.json';
import cmsEventsData from '../../../../../data/real_events/sample_cms_events.json';
import { Value } from '@/components/provenance/Value';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { Layers, Eye, EyeOff, Info, Disc, Zap, Activity } from 'lucide-react';

interface SubsystemToggle {
  id: string;
  name: string;
  category: 'TRACKER' | 'ECAL' | 'HCAL' | 'MUON';
  active: boolean;
  color: string;
}

export const DetectorTwin: React.FC = () => {
  const [detector, setDetector] = useState<'atlas' | 'cms'>('atlas');
  const [selectedEventIndex, setSelectedEventIndex] = useState<number>(0);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Subsystem active filters
  const [subsystems, setSubsystems] = useState<SubsystemToggle[]>([
    { id: 'tracker', name: 'Inner Tracking System', category: 'TRACKER', active: true, color: '#FFE600' },
    { id: 'ecal', name: 'Electromagnetic Calorimeter (ECAL)', category: 'ECAL', active: true, color: '#00FF66' },
    { id: 'hcal', name: 'Hadronic Calorimeter (HCAL)', category: 'HCAL', active: true, color: '#00E5FF' },
    { id: 'muon', name: 'Muon Spectrometer', category: 'MUON', active: true, color: '#FF0055' },
  ]);

  const toggleSubsystem = (id: string) => {
    setSubsystems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const isTrackerActive = subsystems.find((s) => s.id === 'tracker')?.active ?? true;
  const isEcalActive = subsystems.find((s) => s.id === 'ecal')?.active ?? true;
  const isHcalActive = subsystems.find((s) => s.id === 'hcal')?.active ?? true;
  const isMuonActive = subsystems.find((s) => s.id === 'muon')?.active ?? true;

  const currentEvents = detector === 'atlas' ? atlasEventsData.events : cmsEventsData.events;
  const activeEvent = currentEvents[selectedEventIndex] || currentEvents[0];

  // Filter physics objects based on active subdetectors
  const visibleObjects = activeEvent.physicsObjects.filter((obj) => {
    if (obj.type === 'MUON') return isMuonActive;
    if (obj.type === 'ELECTRON' || obj.type === 'PHOTON') return isEcalActive;
    if (obj.type === 'JET' || obj.type === 'B_JET') return isHcalActive;
    return true;
  });

  const selectedObject = activeEvent.physicsObjects.find((o) => o.id === selectedObjectId);

  return (
    <div className="space-y-4">
      <Eli5Card
        title="Why Giant Detectors Are Built Like 4-Layer Onions"
        analogy="No single camera can photograph every kind of subatomic particle at once! So physicists wrap 4 cylindrical shells around the collision point like nested Russian dolls—each shell stops or measures a completely different family of particles."
        keyPoints={[
          'Inner Tracker (Yellow): Ultra-fine silicon cameras that record curved charged tracks without slowing them down.',
          'ECAL (Green) & HCAL (Cyan): Heavy crystal & steel/brass walls that absorb electrons, photons, and quark jets to weigh their energy.',
          'Muon Spectrometer (Pink): Heavy outer detectors catching penetrating muons—the only charged particles tough enough to punch clean through everything else!',
        ]}
        whatToTry="Uncheck 'ECAL' or 'Muon Spectrometer' on the left control deck to watch those exact particle signatures vanish from the real 13 TeV collision display!"
        doi="10.7483/OPENDATA.ATLAS.2020.4LEPTON"
        citationLabel="ATLAS & CMS Open Data 13 TeV Real Collision Samples"
      />
      <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
      {/* LEFT: Detector & Subsystem Control Deck */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4 space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3 mb-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5 tracking-wider">
              <Layers className="w-4 h-4 text-cern-cyan" /> /// Subdetectors ///
            </h3>
            <span className="text-[10px] font-mono text-black font-bold bg-emerald-400 px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000]">
              REAL DATA
            </span>
          </div>

          {/* Detector Switcher (ATLAS vs CMS) */}
          <div>
            <label className="text-[11px] font-mono uppercase text-text-muted block mb-1.5 font-bold">
              Experiment Model
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => {
                  setDetector('atlas');
                  setSelectedEventIndex(0);
                  setSelectedObjectId(null);
                }}
                className={`py-2 px-1 border-2 border-black font-mono font-bold transition-all cursor-pointer ${
                  detector === 'atlas'
                    ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                }`}
              >
                ATLAS (Toroid)
              </button>
              <button
                onClick={() => {
                  setDetector('cms');
                  setSelectedEventIndex(0);
                  setSelectedObjectId(null);
                }}
                className={`py-2 px-1 border-2 border-black font-mono font-bold transition-all cursor-pointer ${
                  detector === 'cms'
                    ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#4C7DFF] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                }`}
              >
                CMS (Solenoid)
              </button>
            </div>
          </div>

          {/* Real Event Selector */}
          <div>
            <label className="text-[11px] font-mono uppercase text-text-muted block mb-1.5 font-bold">
              Sample Collision Event
            </label>
            <div className="space-y-2">
              {currentEvents.map((evt, idx) => (
                <button
                  key={evt.id}
                  onClick={() => {
                    setSelectedEventIndex(idx);
                    setSelectedObjectId(null);
                  }}
                  className={`w-full text-left p-2.5 border-2 border-black text-xs font-mono transition-all cursor-pointer ${
                    idx === selectedEventIndex
                      ? 'bg-cern-blue/30 border-black text-white shadow-[3px_3px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <div className="font-bold text-white">{evt.process}</div>
                  <div className="text-[10px] text-text-muted mt-0.5 font-mono">
                    Run {evt.runNumber} · Event {evt.eventNumber}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subsystem Toggles */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-text-muted font-bold">
                Subsystems (Toggle Filter)
              </span>
            </div>
            <div className="space-y-1.5">
              {subsystems.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubsystem(sub.id)}
                  className={`flex items-center justify-between p-2 border-2 border-black cursor-pointer text-xs font-mono transition-all ${
                    sub.active
                      ? 'bg-canvas-sub text-white shadow-[2px_2px_0px_#000]'
                      : 'bg-canvas-sub/40 border-black/40 text-text-muted opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 border border-black"
                      style={{ backgroundColor: sub.active ? sub.color : '#4B5563' }}
                    />
                    <span className="font-bold">{sub.name}</span>
                  </div>
                  {sub.active ? (
                    <Eye className="w-3.5 h-3.5 text-cern-cyan" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-text-muted" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-black font-bold mt-2 font-mono leading-relaxed p-2 bg-amber-400 border-2 border-black shadow-[2px_2px_0px_#000]">
              * Note: Toggling subsystems filters reconstructed event objects; it is an analytical
              visualization filter, not full detector simulation.
            </p>
          </div>
        </div>

        {/* Provenance Badge */}
        <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs font-mono">
          <span className="text-text-muted font-bold">Dataset:</span>
          <Value manifestId="atlas-higgs-ml-challenge-dataset" value="CERN Open Data" />
        </div>
      </div>

      {/* CENTER: Event Display Viewport (Transverse Projection) */}
      <div className="flex-1 flex flex-col justify-between bg-canvas border-2 border-black shadow-[4px_4px_0px_#000] p-4 relative min-h-[460px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3 mb-2">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
              /// {detector.toUpperCase()} TRANSVERSE (R-φ) EVENT DISPLAY ///
            </h3>
          </div>
          <FidelityBadge type="ILLUSTRATIVE" />
        </div>

        {/* 2D Cutaway Projection Display */}
        <div className="w-full h-80 flex items-center justify-center relative select-none">
          <svg viewBox="-200 -200 400 400" className="w-80 h-80">
            {/* Concentric Detector Cylinders */}
            {/* Muon Spectrometer Outer Boundary */}
            <circle
              r="180"
              fill="none"
              stroke={isMuonActive ? '#FF0055' : '#1C273C'}
              strokeWidth="12"
              strokeOpacity={isMuonActive ? '0.35' : '0.1'}
            />
            {/* Hadronic Calorimeter (HCAL) */}
            <circle
              r="140"
              fill="none"
              stroke={isHcalActive ? '#00E5FF' : '#1C273C'}
              strokeWidth="20"
              strokeOpacity={isHcalActive ? '0.45' : '0.1'}
            />
            {/* Electromagnetic Calorimeter (ECAL) */}
            <circle
              r="105"
              fill="none"
              stroke={isEcalActive ? '#00FF66' : '#1C273C'}
              strokeWidth="14"
              strokeOpacity={isEcalActive ? '0.5' : '0.1'}
            />
            {/* Inner Silicon Tracker */}
            <circle
              r="70"
              fill="none"
              stroke={isTrackerActive ? '#FFE600' : '#1C273C'}
              strokeWidth="8"
              strokeOpacity={isTrackerActive ? '0.6' : '0.1'}
            />
            {/* Beam Pipe */}
            <circle r="12" fill="#0D1422" stroke="#00E5FF" strokeWidth="2" />

            {/* Reconstructed Particle Tracks & Objects */}
            {visibleObjects.map((obj) => {
              const angle = obj.phi;
              const radius = obj.type === 'MUON' ? 180 : obj.type === 'JET' || obj.type === 'B_JET' ? 140 : 105;
              const x2 = radius * Math.cos(angle);
              const y2 = radius * Math.sin(angle);
              const isSelected = obj.id === selectedObjectId;

              const objColor =
                obj.type === 'MUON'
                  ? '#FF0055'
                  : obj.type === 'ELECTRON' || obj.type === 'PHOTON'
                  ? '#00FF66'
                  : '#00E5FF';

              return (
                <g
                  key={obj.id}
                  onClick={() => setSelectedObjectId(obj.id)}
                  className="cursor-pointer group"
                >
                  {/* Track curve / vector */}
                  <line
                    x1="0"
                    y1="0"
                    x2={x2}
                    y2={y2}
                    stroke={objColor}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    strokeDasharray={obj.type === 'PHOTON' ? '4 2' : undefined}
                    className="transition-all group-hover:stroke-white"
                  />
                  {/* Endpoint hit marker */}
                  <circle
                    cx={x2}
                    cy={y2}
                    r={isSelected ? '6' : '4'}
                    fill={objColor}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  {/* Label */}
                  <text
                    x={x2 * 1.15}
                    y={y2 * 1.15}
                    fill="#E8EEF9"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    {obj.type === 'MUON' ? 'μ' : obj.type === 'ELECTRON' ? 'e' : obj.type === 'PHOTON' ? 'γ' : 'jet'}
                  </text>
                </g>
              );
            })}

            {/* Missing Transverse Energy (MET) Vector */}
            {activeEvent.metGev && (
              <line
                x1="0"
                y1="0"
                x2="-60"
                y2="40"
                stroke="#FFB020"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            )}
          </svg>
        </div>

        {/* Bottom Legend & Event Readouts */}
        <div className="pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-text-muted">
          <div className="bg-canvas-sub px-2 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
            <span>Run: {activeEvent.runNumber}</span> · <span>Event: {activeEvent.eventNumber}</span> ·{' '}
            <span className="text-cern-cyan font-bold">√s = {activeEvent.sqrtSGev / 1000} TeV</span>
          </div>
          <div className="bg-canvas-sub px-2 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
            <span>Reconstructed Mass: </span>
            <span className="text-emerald-400 font-bold">{activeEvent.reconstructedMassGev} GeV</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Particle Object Inspector */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4 space-y-4">
        <div className="space-y-4">
          <div className="pb-2 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3 mb-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5 tracking-wider">
              <Info className="w-4 h-4 text-cern-accent" /> /// Object Inspector ///
            </h3>
          </div>

          {selectedObject ? (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="text-text-muted font-bold">Type:</span>
                <span className="text-cern-cyan font-bold px-1.5 py-0.5 bg-black border-2 border-black shadow-[1px_1px_0px_#00E5FF]">{selectedObject.type}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="text-text-muted font-bold">Transverse p_T:</span>
                <span className="text-text-primary font-bold">{selectedObject.ptGev} GeV/c</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="text-text-muted font-bold">Pseudorapidity η:</span>
                <span className="text-text-secondary">{selectedObject.eta}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="text-text-muted font-bold">Azimuth φ:</span>
                <span className="text-text-secondary">{selectedObject.phi} rad</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="text-text-muted font-bold">Total Energy E:</span>
                <span className="text-text-primary font-bold">{selectedObject.energyGev} GeV</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="text-text-muted font-bold">Charge:</span>
                <span className="text-text-secondary font-bold">
                  {selectedObject.charge > 0 ? `+${selectedObject.charge}` : selectedObject.charge}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] text-xs text-text-muted text-center leading-relaxed font-mono">
              Click any particle track or hit marker on the event display to inspect its measured
              kinematics.
            </div>
          )}

          {/* Detector Comparison Note */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] text-text-secondary leading-relaxed">
            <strong className="text-white block font-mono uppercase mb-1">/// ATLAS vs CMS ///</strong>
            ATLAS uses an air-core toroid for outer muon tracking and
            accordion LAr calorimetry. CMS uses a single high-field 3.8 T solenoid enclosing PbWO4 crystal
            calorimeters. Both provide independent validation of discoveries.
          </div>
        </div>

        <div className="pt-3 border-t-2 border-black text-[11px] font-mono text-text-muted">
          <span>Source: CERN Open Data 13 TeV Records</span>
        </div>
      </div>
    </div>
    </div>
  );
};
