'use client';

import React, { useState } from 'react';
import atlasEventsData from '../../../../../data/real_events/sample_atlas_events.json';
import cmsEventsData from '../../../../../data/real_events/sample_cms_events.json';
import { Value } from '@/components/provenance/Value';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
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
    { id: 'tracker', name: 'Inner Tracking System', category: 'TRACKER', active: true, color: '#FFD166' },
    { id: 'ecal', name: 'Electromagnetic Calorimeter (ECAL)', category: 'ECAL', active: true, color: '#06D6A0' },
    { id: 'hcal', name: 'Hadronic Calorimeter (HCAL)', category: 'HCAL', active: true, color: '#118AB2' },
    { id: 'muon', name: 'Muon Spectrometer', category: 'MUON', active: true, color: '#EF476F' },
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
    <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border border-canvas-border rounded-panel">
      {/* LEFT: Detector & Subsystem Control Deck */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border border-canvas-border rounded-panel p-4 space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-canvas-border">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cern-cyan" /> Subdetector Controls
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              REAL OPEN DATA
            </span>
          </div>

          {/* Detector Switcher (ATLAS vs CMS) */}
          <div>
            <label className="text-[11px] font-mono uppercase text-text-muted block mb-1.5 font-semibold">
              Experiment Model
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => {
                  setDetector('atlas');
                  setSelectedEventIndex(0);
                  setSelectedObjectId(null);
                }}
                className={`py-1.5 rounded border transition-colors ${
                  detector === 'atlas'
                    ? 'bg-cern-blue border-cern-accent text-white font-bold'
                    : 'bg-canvas-sub border-canvas-border text-text-secondary hover:text-text-primary'
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
                className={`py-1.5 rounded border transition-colors ${
                  detector === 'cms'
                    ? 'bg-cern-blue border-cern-accent text-white font-bold'
                    : 'bg-canvas-sub border-canvas-border text-text-secondary hover:text-text-primary'
                }`}
              >
                CMS (Solenoid)
              </button>
            </div>
          </div>

          {/* Real Event Selector */}
          <div>
            <label className="text-[11px] font-mono uppercase text-text-muted block mb-1.5 font-semibold">
              Sample Collision Event
            </label>
            <div className="space-y-1.5">
              {currentEvents.map((evt, idx) => (
                <button
                  key={evt.id}
                  onClick={() => {
                    setSelectedEventIndex(idx);
                    setSelectedObjectId(null);
                  }}
                  className={`w-full text-left p-2 rounded border text-xs font-mono transition-colors ${
                    idx === selectedEventIndex
                      ? 'bg-canvas-raised border-cern-cyan text-text-primary'
                      : 'bg-canvas-sub border-canvas-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="font-semibold">{evt.process}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    Run {evt.runNumber} · Event {evt.eventNumber}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subsystem Toggles */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-text-muted font-semibold">
                Subsystems (Toggle Filter)
              </span>
            </div>
            <div className="space-y-1.5">
              {subsystems.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubsystem(sub.id)}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer text-xs font-mono transition-colors ${
                    sub.active
                      ? 'bg-canvas-raised border-canvas-border text-text-primary'
                      : 'bg-canvas-sub/50 border-canvas-border/50 text-text-muted opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sub.active ? sub.color : '#4B5563' }}
                    />
                    <span>{sub.name}</span>
                  </div>
                  {sub.active ? (
                    <Eye className="w-3.5 h-3.5 text-cern-cyan" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-text-muted" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-amber-300/80 mt-2 font-mono leading-relaxed">
              * Note: Toggling subsystems filters reconstructed event objects; it is an analytical
              visualization filter, not full detector simulation.
            </p>
          </div>
        </div>

        {/* Provenance Badge */}
        <div className="pt-3 border-t border-canvas-border flex items-center justify-between text-xs font-mono">
          <span className="text-text-muted">Dataset:</span>
          <Value manifestId="atlas-higgs-ml-challenge-dataset" value="CERN Open Data" />
        </div>
      </div>

      {/* CENTER: Event Display Viewport (Transverse Projection) */}
      <div className="flex-1 flex flex-col justify-between bg-canvas rounded-panel border border-canvas-border p-4 relative min-h-[460px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-text-primary font-bold">
              {detector.toUpperCase()} TRANSVERSE (R-φ) EVENT DISPLAY
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
              stroke={isMuonActive ? '#EF476F' : '#1C273C'}
              strokeWidth="12"
              strokeOpacity={isMuonActive ? '0.35' : '0.1'}
            />
            {/* Hadronic Calorimeter (HCAL) */}
            <circle
              r="140"
              fill="none"
              stroke={isHcalActive ? '#118AB2' : '#1C273C'}
              strokeWidth="20"
              strokeOpacity={isHcalActive ? '0.45' : '0.1'}
            />
            {/* Electromagnetic Calorimeter (ECAL) */}
            <circle
              r="105"
              fill="none"
              stroke={isEcalActive ? '#06D6A0' : '#1C273C'}
              strokeWidth="14"
              strokeOpacity={isEcalActive ? '0.5' : '0.1'}
            />
            {/* Inner Silicon Tracker */}
            <circle
              r="70"
              fill="none"
              stroke={isTrackerActive ? '#FFD166' : '#1C273C'}
              strokeWidth="8"
              strokeOpacity={isTrackerActive ? '0.6' : '0.1'}
            />
            {/* Beam Pipe */}
            <circle r="12" fill="#0D1422" stroke="#3DD6FF" strokeWidth="1.5" />

            {/* Reconstructed Particle Tracks & Objects */}
            {visibleObjects.map((obj) => {
              const angle = obj.phi;
              const radius = obj.type === 'MUON' ? 180 : obj.type === 'JET' || obj.type === 'B_JET' ? 140 : 105;
              const x2 = radius * Math.cos(angle);
              const y2 = radius * Math.sin(angle);
              const isSelected = obj.id === selectedObjectId;

              const objColor =
                obj.type === 'MUON'
                  ? '#EF476F'
                  : obj.type === 'ELECTRON' || obj.type === 'PHOTON'
                  ? '#06D6A0'
                  : '#118AB2';

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
        <div className="pt-3 border-t border-canvas-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-text-muted">
          <div>
            <span>Run: {activeEvent.runNumber}</span> · <span>Event: {activeEvent.eventNumber}</span> ·{' '}
            <span className="text-cern-cyan">√s = {activeEvent.sqrtSGev / 1000} TeV</span>
          </div>
          <div>
            <span>Reconstructed Mass: </span>
            <span className="text-emerald-400 font-bold">{activeEvent.reconstructedMassGev} GeV</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Particle Object Inspector */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border border-canvas-border rounded-panel p-4 space-y-4">
        <div className="space-y-4">
          <div className="pb-2 border-b border-canvas-border">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cern-accent" /> Object Inspector
            </h3>
          </div>

          {selectedObject ? (
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-canvas-sub rounded border border-canvas-border">
                <span className="text-text-muted">Type:</span>
                <span className="text-cern-cyan font-bold">{selectedObject.type}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-canvas-sub rounded border border-canvas-border">
                <span className="text-text-muted">Transverse p_T:</span>
                <span className="text-text-primary font-bold">{selectedObject.ptGev} GeV/c</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-canvas-sub rounded border border-canvas-border">
                <span className="text-text-muted">Pseudorapidity η:</span>
                <span className="text-text-secondary">{selectedObject.eta}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-canvas-sub rounded border border-canvas-border">
                <span className="text-text-muted">Azimuth φ:</span>
                <span className="text-text-secondary">{selectedObject.phi} rad</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-canvas-sub rounded border border-canvas-border">
                <span className="text-text-muted">Total Energy E:</span>
                <span className="text-text-primary font-bold">{selectedObject.energyGev} GeV</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-canvas-sub rounded border border-canvas-border">
                <span className="text-text-muted">Charge:</span>
                <span className="text-text-secondary">
                  {selectedObject.charge > 0 ? `+${selectedObject.charge}` : selectedObject.charge}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-canvas-sub border border-canvas-border rounded text-xs text-text-muted text-center leading-relaxed font-mono">
              Click any particle track or hit marker on the event display to inspect its measured
              kinematics.
            </div>
          )}

          {/* Detector Comparison Note */}
          <div className="p-3 bg-canvas-sub border border-canvas-border rounded text-[11px] text-text-secondary leading-relaxed">
            <strong>ATLAS vs CMS:</strong> ATLAS uses an air-core toroid for outer muon tracking and
            accordion LAr calorimetry. CMS uses a single high-field 3.8 T solenoid enclosingPbWO4 crystal
            calorimeters. Both provide independent validation of discoveries.
          </div>
        </div>

        <div className="pt-3 border-t border-canvas-border text-[11px] font-mono text-text-muted">
          <span>Source: CERN Open Data 13 TeV Records</span>
        </div>
      </div>
    </div>
  );
};
