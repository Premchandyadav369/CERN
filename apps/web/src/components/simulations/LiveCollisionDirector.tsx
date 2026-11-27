'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Detector3DEventCanvas, DetectorPhysicsObject } from '@/components/detectors/Detector3DEventCanvas';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { MathFormula } from '@/components/ui/MathFormula';
import { playResonanceTone, playDiscoveryChime } from '@/lib/sonifier';
import { SeededRNG } from '@cern-x/sim-core';
import { Zap, Sparkles, Flame, RefreshCw } from 'lucide-react';

type BeamMode = 'pp_136' | 'pbpb_536' | 'fccee_240';
type DecayChannel = 'h_yy' | 'h_4mu' | 'ttbar' | 'z_mumu';

const CHANNEL_SPECS: Record<
  DecayChannel,
  { label: string; massGev: number; summary: string; color: string }
> = {
  h_yy: {
    label: 'H⁰ → γγ (Diphoton)',
    massGev: 125.25,
    summary: 'Two ultra-sharp neutral ECAL photon showers back-to-back with ~62 GeV p_T.',
    color: 'bg-[#FFE600] text-black',
  },
  h_4mu: {
    label: 'H⁰ → ZZ* → 4μ (Golden)',
    massGev: 125.18,
    summary: 'Four clean opposite-sign penetrating muons punching through the outer spectrometer.',
    color: 'bg-cern-magenta text-white',
  },
  ttbar: {
    label: 'tt̄ → bW bW + Jets',
    massGev: 172.69,
    summary: 'High-multiplicity hadronic b-jets plus isolated lepton and large neutrino MET.',
    color: 'bg-cern-cyan text-black',
  },
  z_mumu: {
    label: 'Z⁰ → μ⁺μ⁻ (Z Pole)',
    massGev: 91.19,
    summary: 'Clean opposite-sign muon resonance calibration peak right at 91.2 GeV.',
    color: 'bg-emerald-400 text-black',
  },
};

export const LiveCollisionDirector: React.FC = () => {
  const [beamMode, setBeamMode] = useState<BeamMode>('pp_136');
  const [channel, setChannel] = useState<DecayChannel>('h_4mu');
  const [detectorGeom, setDetectorGeom] = useState<'atlas' | 'cms'>('cms');
  const [bFieldScale, setBFieldScale] = useState<number>(3.8);
  const [collisionSeed, setCollisionSeed] = useState<number>(101);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [shotCount, setShotCount] = useState<number>(1);

  const generatedEvent = useMemo(() => {
    const rng = new SeededRNG(collisionSeed);
    const phi0 = rng.nextFloat() * Math.PI * 2;
    const objects: DetectorPhysicsObject[] = [];
    const fieldBoost = Math.max(0.25, bFieldScale / 3.8);
    // Modulate apparent pT curvature inversely when field drops (for pedagogical curvature clarity in 3D canvas)
    const ptScale = 1 / fieldBoost;

    if (channel === 'h_yy') {
      objects.push(
        { id: 'gam-1', type: 'PHOTON', ptGev: Number((62.6 * ptScale).toFixed(1)), eta: 0.32, phi: phi0, energyGev: 65.8, charge: 0 },
        { id: 'gam-2', type: 'PHOTON', ptGev: Number((61.9 * ptScale).toFixed(1)), eta: -0.29, phi: phi0 + Math.PI, energyGev: 64.5, charge: 0 }
      );
    } else if (channel === 'h_4mu') {
      objects.push(
        { id: 'mu-1', type: 'MUON', ptGev: Number((52.0 * ptScale).toFixed(1)), eta: 0.41, phi: phi0, energyGev: 56.4, charge: 1 },
        { id: 'mu-2', type: 'MUON', ptGev: Number((41.5 * ptScale).toFixed(1)), eta: -0.35, phi: phi0 + 2.85, energyGev: 44.1, charge: -1 },
        { id: 'mu-3', type: 'MUON', ptGev: Number((18.4 * ptScale).toFixed(1)), eta: 0.85, phi: phi0 - 1.1, energyGev: 25.4, charge: 1 },
        { id: 'mu-4', type: 'MUON', ptGev: Number((14.2 * ptScale).toFixed(1)), eta: -0.72, phi: phi0 + 1.5, energyGev: 18.0, charge: -1 }
      );
    } else if (channel === 'z_mumu') {
      objects.push(
        { id: 'zmu-1', type: 'MUON', ptGev: Number((46.2 * ptScale).toFixed(1)), eta: 0.25, phi: phi0, energyGev: 47.6, charge: 1 },
        { id: 'zmu-2', type: 'MUON', ptGev: Number((45.0 * ptScale).toFixed(1)), eta: -0.22, phi: phi0 + Math.PI, energyGev: 46.1, charge: -1 }
      );
    } else {
      objects.push(
        { id: 't-mu', type: 'MUON', ptGev: Number((44.0 * ptScale).toFixed(1)), eta: 0.52, phi: phi0, energyGev: 50.1, charge: -1 },
        { id: 't-b1', type: 'B_JET', ptGev: 88.4, eta: -0.3, phi: phi0 + 1.9, energyGev: 92.4, charge: 0 },
        { id: 't-b2', type: 'B_JET', ptGev: 68.2, eta: 0.9, phi: phi0 - 2.1, energyGev: 97.6, charge: 0 },
        { id: 't-j3', type: 'JET', ptGev: 49.0, eta: -0.95, phi: phi0 + 0.65, energyGev: 72.1, charge: 0 },
        { id: 't-j4', type: 'JET', ptGev: 39.5, eta: 0.44, phi: phi0 - 0.85, energyGev: 43.4, charge: 0 }
      );
    }

    // Extra soft spray tracks for heavy-ion Pb-Pb collision
    if (beamMode === 'pbpb_536') {
      for (let k = 0; k < 6; k++) {
        objects.push({
          id: `qgp-jet-${k}`,
          type: 'JET',
          ptGev: 18 + rng.nextFloat() * 22,
          eta: (rng.nextFloat() - 0.5) * 2.2,
          phi: (k / 6) * Math.PI * 2 + rng.nextFloat() * 0.4,
          energyGev: 28 + rng.nextFloat() * 25,
          charge: k % 2 === 0 ? 1 : -1,
        });
      }
    }

    const spec = CHANNEL_SPECS[channel];
    return {
      objects,
      metGev: channel === 'ttbar' ? 68.4 : 4.2,
      massGev: Number((spec.massGev + (rng.nextFloat() - 0.5) * 0.6).toFixed(2)),
    };
  }, [channel, beamMode, bFieldScale, collisionSeed]);

  const fireNewCollision = () => {
    setCollisionSeed((s) => s + 17);
    setShotCount((c) => c + 1);
    setSelectedObjectId(null);
    if (channel === 'h_yy' || channel === 'h_4mu') {
      playDiscoveryChime();
    } else {
      playResonanceTone(generatedEvent.massGev);
    }
  };

  const selectedObj = generatedEvent.objects.find((o) => o.id === selectedObjectId);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Direct Your Own 3D Subatomic Particle Crash Inside ATLAS & CMS!"
        analogy="Think of yourself as the Chief Collider Director inside CERN Control Centre! Pick what beams to smash (Protons, Lead Atoms, or future Electrons), pick a target physics signature like the famous Higgs 4-Muon decay, dial the giant Solenoid Magnet up or down, and hit FIRE BUNCHES to watch fresh tracks explode across 3D space!"
        keyPoints={[
          'Higher Magnet Field B curves low-momentum tracks tighter, letting trackers measure charge and speed precisely.',
          'Pb-Pb Heavy Ions fill the detector with dozens of extra Quark-Gluon Plasma hadron sprays!',
        ]}
        whatToTry="Select 'H⁰ → ZZ* → 4μ (Golden)', adjust Solenoid Field from 1 T up to 8 T to watch muon helices twist, and click 'FIRE BUNCHES'!"
        doi="10.1088/1748-0221/3/08/S08003"
        citationLabel="ATLAS & CMS 3D Event Reconstruction Topology"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
        {/* LEFT CONTROLS */}
        <div className="xl:col-span-4 space-y-4 bg-canvas-surface border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-xs font-mono font-black uppercase text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-cern-magenta" /> Collision Director
            </h3>
            <FidelityBadge type="TOY" />
          </div>

          {/* Beam Mode */}
          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase font-bold block mb-1.5">
              1. Accelerator Beam Species
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              {(
                [
                  { id: 'pp_136', label: 'pp 13.6 TeV' },
                  { id: 'pbpb_536', label: 'Pb-Pb QGP' },
                  { id: 'fccee_240', label: 'FCC-ee ZH' },
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBeamMode(b.id)}
                  className={`py-1.5 px-1 border-2 border-black font-bold transition-all ${
                    beamMode === b.id ? 'bg-cern-cyan text-black' : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Physics Topology */}
          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase font-bold block mb-1.5">
              2. Target Decay Channel
            </span>
            <div className="space-y-1.5">
              {(Object.keys(CHANNEL_SPECS) as DecayChannel[]).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`w-full p-2 border-2 border-black text-left font-mono text-xs transition-all flex items-center justify-between ${
                    channel === ch
                      ? `${CHANNEL_SPECS[ch].color} shadow-[2px_2px_0px_#000]`
                      : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  <span className="font-bold">{CHANNEL_SPECS[ch].label}</span>
                  <span className="text-[10px] font-bold">{CHANNEL_SPECS[ch].massGev} GeV</span>
                </button>
              ))}
            </div>
          </div>

          {/* B-Field Slider & Geometry Switch */}
          <div className="p-2.5 bg-canvas-sub border-2 border-black space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">Detector Magnet (B):</span>
              <span className="text-cern-cyan">{bFieldScale.toFixed(1)} T</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={8.0}
              step={0.1}
              value={bFieldScale}
              onChange={(e) => setBFieldScale(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-1">
              <button
                onClick={() => setDetectorGeom('cms')}
                className={`py-1 border border-black font-bold ${detectorGeom === 'cms' ? 'bg-cern-blue text-white' : 'bg-black text-text-muted'}`}
              >
                CMS Solenoid
              </button>
              <button
                onClick={() => setDetectorGeom('atlas')}
                className={`py-1 border border-black font-bold ${detectorGeom === 'atlas' ? 'bg-cern-blue text-white' : 'bg-black text-text-muted'}`}
              >
                ATLAS Toroids
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={fireNewCollision}
            className="w-full py-3 bg-cern-magenta hover:bg-pink-600 text-white font-mono font-black uppercase text-xs border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current text-[#FFE600]" />
            <span>Fire Bunches (Shot #{shotCount})</span>
          </motion.button>

          <MathFormula tex="R = \frac{p_T}{0.2998\,|q|\,B}" label="Track Helical Curvature:" />
        </div>

        {/* RIGHT 3D CHAMBER + INSPECTOR */}
        <div className="xl:col-span-8 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-canvas-surface border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">Reconstructed Mass</span>
              <strong className="text-[#FFE600] text-base">{generatedEvent.massGev} GeV</strong>
            </div>
            <div className="p-2.5 bg-canvas-surface border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">Reconstructed Objects</span>
              <strong className="text-cern-cyan text-base">{generatedEvent.objects.length} tracks</strong>
            </div>
            <div className="p-2.5 bg-canvas-surface border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">Missing E_T (MET)</span>
              <strong className="text-emerald-400 text-base">{generatedEvent.metGev} GeV</strong>
            </div>
          </div>

          <Detector3DEventCanvas
            detector={detectorGeom}
            visibleObjects={generatedEvent.objects}
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
            isTrackerActive={true}
            isEcalActive={true}
            isHcalActive={true}
            isMuonActive={true}
            metGev={generatedEvent.metGev}
          />

          <div className="p-3 bg-canvas-surface border-2 border-black text-xs font-mono flex flex-wrap items-center justify-between gap-2">
            <span className="text-text-secondary">{CHANNEL_SPECS[channel].summary}</span>
            {selectedObj && (
              <span className="px-2 py-1 bg-black text-cern-cyan font-bold border border-black">
                Selected: {selectedObj.type} · E={selectedObj.energyGev} GeV · q={selectedObj.charge}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
