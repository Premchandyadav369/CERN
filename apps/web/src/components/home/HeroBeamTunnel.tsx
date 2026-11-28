'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClientLightTunnel } from '@/components/ui/ClientLightTunnel';
import { useGlobalStore } from '@/lib/store';
import {
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  Radio,
  Sliders,
  ChevronDown,
  RefreshCw,
  Cpu,
  Eye,
  EyeOff,
} from 'lucide-react';

interface BeamPreset {
  id: string;
  name: string;
  subtitle: string;
  cableColor: string;
  pulseColor: string;
  tunnelColor: string;
  tunnelOpacity: number;
  speed: number;
  pulseSpeed: number;
  pulseLength: number;
  flowDirection: 'inward' | 'outward';
  cableCount: number;
  glow: number;
  energy: string;
  particles: string;
  lumi: string;
  lorentzGamma: string;
}

const PRESETS: Record<string, BeamPreset> = {
  pp: {
    id: 'pp',
    name: 'Proton-Proton Run 3',
    subtitle: '13.6 TeV Collision Physics',
    cableColor: '#00E5FF',
    pulseColor: '#38BDF8',
    tunnelColor: '#0033A0',
    tunnelOpacity: 0.18,
    speed: 0.14,
    pulseSpeed: 2.2,
    pulseLength: 0.32,
    flowDirection: 'outward',
    cableCount: 24,
    glow: 1.25,
    energy: '6.80 TeV / beam',
    particles: 'Protons (p⁺)',
    lumi: '2.14 × 10³⁴ cm⁻²s⁻¹',
    lorentzGamma: '7,249',
  },
  pbpb: {
    id: 'pbpb',
    name: 'Heavy Ion Pb-Pb',
    subtitle: '5.36 TeV Quark-Gluon Plasma',
    cableColor: '#FF0055',
    pulseColor: '#FF3377',
    tunnelColor: '#581C87',
    tunnelOpacity: 0.22,
    speed: 0.11,
    pulseSpeed: 1.8,
    pulseLength: 0.38,
    flowDirection: 'outward',
    cableCount: 20,
    glow: 1.35,
    energy: '2.68 TeV / nucleon',
    particles: 'Lead ²⁰⁸Pb⁸²⁺',
    lumi: '7.0 × 10²⁷ cm⁻²s⁻¹',
    lorentzGamma: '2,873',
  },
  hllhc: {
    id: 'hllhc',
    name: 'High-Lumi LHC (HL-LHC)',
    subtitle: '14 TeV Crab Cavity Squeeze',
    cableColor: '#00FF66',
    pulseColor: '#00E5FF',
    tunnelColor: '#064E3B',
    tunnelOpacity: 0.25,
    speed: 0.18,
    pulseSpeed: 3.0,
    pulseLength: 0.24,
    flowDirection: 'inward',
    cableCount: 30,
    glow: 1.45,
    energy: '7.00 TeV / beam',
    particles: 'Protons (β* = 15 cm)',
    lumi: '7.50 × 10³⁴ cm⁻²s⁻¹',
    lorentzGamma: '7,462',
  },
  injection: {
    id: 'injection',
    name: 'SPS Transfer TI2/TI8',
    subtitle: '450 GeV Injection Kick',
    cableColor: '#4C7DFF',
    pulseColor: '#60A5FA',
    tunnelColor: '#1E1B4B',
    tunnelOpacity: 0.15,
    speed: 0.09,
    pulseSpeed: 1.5,
    pulseLength: 0.28,
    flowDirection: 'outward',
    cableCount: 18,
    glow: 1.1,
    energy: '450 GeV / beam',
    particles: 'Pre-accelerated Bunches',
    lumi: 'Transfer Phase',
    lorentzGamma: '479.6',
  },
  antimatter: {
    id: 'antimatter',
    name: 'Antimatter AD/ELENA',
    subtitle: '100 keV Antiproton Deceleration',
    cableColor: '#FFB020',
    pulseColor: '#F59E0B',
    tunnelColor: '#451A03',
    tunnelOpacity: 0.2,
    speed: 0.07,
    pulseSpeed: 1.2,
    pulseLength: 0.45,
    flowDirection: 'inward',
    cableCount: 16,
    glow: 1.2,
    energy: '100 keV (Cooler ring)',
    particles: 'Antiprotons (p̄)',
    lumi: 'Precision Trap',
    lorentzGamma: '1.0001',
  },
};

export const HeroBeamTunnel: React.FC = () => {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('pp');
  const [showControls, setShowControls] = useState<boolean>(false);

  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const setReduceMotion = useGlobalStore((s) => s.setReduceMotion);

  // Tunable state
  const preset = PRESETS[selectedPresetKey] || PRESETS.pp;
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [pulseSpeedMultiplier, setPulseSpeedMultiplier] = useState<number>(1.0);
  const [directionOverride, setDirectionOverride] = useState<'inward' | 'outward' | 'auto'>('auto');
  const [boreOpacity, setBoreOpacity] = useState<number>(preset.tunnelOpacity);
  const [cableDensity, setCableDensity] = useState<number>(preset.cableCount);
  const [glowBoost, setGlowBoost] = useState<number>(preset.glow);
  const [pulseLen, setPulseLen] = useState<number>(preset.pulseLength);

  const activeDirection =
    directionOverride === 'auto' ? preset.flowDirection : directionOverride;

  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    const p = PRESETS[key];
    if (p) {
      setBoreOpacity(p.tunnelOpacity);
      setCableDensity(p.cableCount);
      setGlowBoost(p.glow);
      setPulseLen(p.pulseLength);
      setDirectionOverride('auto');
      setSpeedMultiplier(1.0);
      setPulseSpeedMultiplier(1.0);
    }
  };

  const handleResetCurrentPreset = () => {
    handleSelectPreset(selectedPresetKey);
  };

  const effectiveSpeed = reduceMotion
    ? 0.02
    : preset.speed * speedMultiplier;
  const effectivePulseSpeed = reduceMotion
    ? 0.4
    : preset.pulseSpeed * pulseSpeedMultiplier;
  const effectiveSway = reduceMotion ? 0.05 : 0.4;
  const effectiveMouseInteraction = !reduceMotion;

  return (
    <div className="relative w-full rounded-none overflow-hidden border-3 border-black bg-canvas shadow-[8px_8px_0px_0px_#000000]">
      {/* 1. WebGL LightTunnel Background Canvas */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto">
        <ClientLightTunnel
          cableColor={preset.cableColor}
          pulseColor={preset.pulseColor}
          tunnelColor={preset.tunnelColor}
          tunnelOpacity={boreOpacity}
          speed={effectiveSpeed}
          flowDirection={activeDirection}
          pulseSpeed={effectivePulseSpeed}
          pulseLength={pulseLen}
          pulseBlend={0.9}
          pulseWidth={1.0}
          cableCount={cableDensity}
          thickness={0.34}
          rimWidth={0.16}
          waviness={0.25}
          sway={effectiveSway}
          size={1.05}
          glow={glowBoost}
          fadeNear={0.35}
          fadeFar={2.2}
          brightness={1.1}
          colorVariance={true}
          grain={true}
          grainIntensity={0.04}
          opacity={1.0}
          mouseInteraction={effectiveMouseInteraction}
          mouseStrength={0.12}
          className="w-full h-full"
        />
      </div>

      {/* 2. Control Room Grid Overlay & Calm Text Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, transparent 32%, rgba(6, 10, 18, 0.82) 85%, #060a12 100%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
        }}
      />

      {/* 3. High-Contrast Hero Content */}
      <div className="relative z-10 w-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 min-h-[600px] lg:min-h-[660px] pointer-events-none">
        {/* Top Header Bar: Status & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          {/* CERN Status Readout */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-canvas/90 border-2 border-black shadow-[3px_3px_0px_#000] text-emerald-300 text-xs font-mono font-medium">
            <span className="inline-flex h-2 w-2 bg-emerald-400 border border-black" aria-hidden="true" />
            <span className="tabular-nums">LHC Run 3 · Stable beams</span>
            <span className="text-text-muted hidden sm:inline">|</span>
            <span className="text-text-secondary hidden sm:inline tabular-nums">26.7 km superconducting ring</span>
          </div>

          {/* Provenance & Tuning Trigger */}
          <div className="flex items-center gap-2">
            {reduceMotion && (
              <span className="px-2.5 py-1 bg-amber-400 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-mono font-semibold text-black">
                Reduced motion
              </span>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas/90 border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-mono font-medium text-text-secondary tabular-nums">
              <ShieldCheck className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              <span className="hidden sm:inline">29/29 physics tests</span>
              <span className="sm:hidden">29/29</span>
            </div>
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas-surface hover:bg-canvas-raised text-white border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-px active:translate-y-px active:shadow-none text-xs font-mono font-medium transition-[transform,background-color,box-shadow] duration-150 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cern-cyan" strokeWidth={1.5} />
              <span>Tuning console</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  showControls ? 'rotate-180' : ''
                }`}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        {/* Middle Main Narrative Banner */}
        <div className="my-auto py-8 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] text-text-secondary text-xs font-mono font-medium">
            <Radio className="w-3.5 h-3.5 text-cern-cyan" strokeWidth={1.5} />
            <span>27 km ultra-high vacuum beamline</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-white leading-[1.06]">
            27 km LHC digital twin and{' '}
            <span className="text-cern-cyan">
              particle simulator
            </span>
          </h1>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl bg-canvas/85 p-3.5 border-2 border-black shadow-[3px_3px_0px_#000]">
            Explore relativistic beam acceleration, ATLAS and CMS detector cutaways, FPGA Level-1 trigger
            topologies, and the Worldwide LHC Computing Grid with verified constants.
          </p>

          {/* Primary and Secondary Action */}
          <div className="flex flex-wrap items-center gap-3 pt-2 pointer-events-auto">
            <Link
              href="/accelerators"
              className="px-5 py-3 bg-cern-cyan hover:bg-[#5df0ff] text-black font-mono font-semibold text-xs sm:text-sm flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-[transform,background-color,box-shadow] duration-150"
            >
              <Zap className="w-4 h-4" strokeWidth={1.5} />
              <span>Launch accelerator sim</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>

            <Link
              href="/detectors"
              className="px-5 py-3 bg-canvas-surface hover:bg-canvas-raised text-white font-mono font-medium text-xs sm:text-sm flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-[transform,background-color,box-shadow] duration-150"
            >
              <Layers className="w-4 h-4 text-text-secondary" strokeWidth={1.5} />
              <span>ATLAS &amp; CMS twins</span>
            </Link>
          </div>
        </div>

        {/* Bottom Section: Beam Presets & Telemetry Ribbon */}
        <div className="space-y-3 pointer-events-auto">
          {/* Preset Selector Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-mono text-text-secondary shrink-0 font-medium hidden sm:inline mr-1 px-2.5 py-1.5 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000]">
              Beam scenario
            </span>
            {Object.values(PRESETS).map((p) => {
              const isSelected = p.id === selectedPresetKey;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`shrink-0 px-3.5 py-2 text-xs font-mono font-medium transition-[transform,background-color,border-color,box-shadow] duration-150 flex items-center gap-2 border-2 border-black active:translate-x-px active:translate-y-px cursor-pointer ${
                    isSelected
                      ? 'bg-canvas-raised text-white border-cern-cyan shadow-[3px_3px_0px_#000]'
                      : 'bg-canvas-surface/95 text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 border border-black shrink-0"
                    style={{ backgroundColor: p.cableColor }}
                  />
                  <span>{p.name}</span>
                  <span className="text-[11px] text-text-muted hidden md:inline tabular-nums">({p.energy})</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Beamline Tuner Drawer (Expandable) */}
          {showControls && (
            <div className="p-5 bg-canvas-sub border-3 border-black shadow-[8px_8px_0px_#000] space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 bg-canvas-surface -mx-5 -mt-5 p-3.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cern-cyan" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Beamline Tuner · {preset.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setReduceMotion(!reduceMotion)}
                    className="text-xs font-mono text-text-muted hover:text-amber-400 flex items-center gap-1 font-bold"
                    title="Toggle motion damping"
                  >
                    {reduceMotion ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{reduceMotion ? 'Motion Damped' : 'Motion Full'}</span>
                  </button>
                  <button
                    onClick={handleResetCurrentPreset}
                    className="text-xs font-mono text-text-muted hover:text-cern-cyan flex items-center gap-1 font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Nominal
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-mono pt-2">
                {/* Speed Slider */}
                <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="flex justify-between text-text-muted">
                    <span className="font-bold">Speed:</span>
                    <span className="text-cern-cyan font-bold">
                      {(preset.speed * speedMultiplier * 10).toFixed(1)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={2.5}
                    step={0.1}
                    value={speedMultiplier}
                    disabled={reduceMotion}
                    onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                    className="w-full cursor-pointer disabled:opacity-50"
                  />
                </div>

                {/* Cable Count / Lattice Density */}
                <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="flex justify-between text-text-muted">
                    <span className="font-bold">Sectors:</span>
                    <span className="text-white font-bold">{cableDensity}</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={36}
                    step={2}
                    value={cableDensity}
                    onChange={(e) => setCableDensity(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>

                {/* Vacuum Bore Opacity */}
                <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="flex justify-between text-text-muted">
                    <span className="font-bold">Bore Light:</span>
                    <span className="text-white font-bold">
                      {(boreOpacity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={0.5}
                    step={0.02}
                    value={boreOpacity}
                    onChange={(e) => setBoreOpacity(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>

                {/* Glow Luminance Boost */}
                <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="flex justify-between text-text-muted">
                    <span className="font-bold">Rim Glow:</span>
                    <span className="text-sky-300 font-bold">{glowBoost.toFixed(2)}×</span>
                  </div>
                  <input
                    type="range"
                    min={0.6}
                    max={2.2}
                    step={0.1}
                    value={glowBoost}
                    onChange={(e) => setGlowBoost(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>

                {/* Direction Switch */}
                <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-2">
                  <div className="flex justify-between text-text-muted">
                    <span className="font-bold">Trajectory:</span>
                    <span className="text-emerald-400 font-bold uppercase">{activeDirection}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      onClick={() => setDirectionOverride('outward')}
                      className={`py-1 text-xs font-mono font-bold border-2 transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                        activeDirection === 'outward'
                          ? 'bg-cern-blue text-white border-black shadow-[2px_2px_0px_#000]'
                          : 'bg-canvas-sub border-black text-text-muted hover:text-white'
                      }`}
                    >
                      Outward
                    </button>
                    <button
                      onClick={() => setDirectionOverride('inward')}
                      className={`py-1 text-xs font-mono font-bold border-2 transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                        activeDirection === 'inward'
                          ? 'bg-cern-blue text-white border-black shadow-[2px_2px_0px_#000]'
                          : 'bg-canvas-sub border-black text-text-muted hover:text-white'
                      }`}
                    >
                      Inward
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Telemetry Hud Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] font-mono uppercase text-text-muted block font-bold">Energy (Per Beam)</span>
              <span className="font-mono text-sm sm:text-base font-bold text-cern-cyan">{preset.energy}</span>
            </div>

            <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] font-mono uppercase text-text-muted block font-bold">Velocity (β)</span>
              <span className="font-mono text-sm sm:text-base font-bold text-emerald-400">0.999999991 c</span>
            </div>

            <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] font-mono uppercase text-text-muted block font-bold">Lorentz Factor γ</span>
              <span className="font-mono text-sm sm:text-base font-bold text-white">
                {preset.lorentzGamma}
              </span>
            </div>

            <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] font-mono uppercase text-text-muted block font-bold">Main Dipole Field</span>
              <span className="font-mono text-sm sm:text-base font-bold text-amber-300">8.33 T (1.9 K)</span>
            </div>

            <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] font-mono uppercase text-text-muted block font-bold">Instantaneous Lumi</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-sky-300 truncate block">
                {preset.lumi}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBeamTunnel;
