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

      {/* 2. Cybernetic Control Room Grid Overlay & Vignette */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-canvas via-canvas/60 to-canvas/40"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, transparent 30%, rgba(6, 10, 18, 0.8) 85%, #060a12 100%),
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
        }}
      />

      {/* 3. High-Contrast Hero Content */}
      <div className="relative z-10 w-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 min-h-[640px] lg:min-h-[700px] pointer-events-none">
        {/* Top Header Bar: Status & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          {/* CERN Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-canvas/90 border-2 border-black shadow-[3px_3px_0px_#000] text-emerald-300 text-xs font-mono font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-none h-2.5 w-2.5 bg-emerald-400 border border-black" />
            </span>
            <span className="tracking-wider">LHC RUN 3 : STABLE BEAMS</span>
            <span className="text-text-muted hidden sm:inline">|</span>
            <span className="text-text-secondary hidden sm:inline">26.7 km Superconducting Ring</span>
          </div>

          {/* Provenance & Tests Pill */}
          <div className="flex items-center gap-2">
            {reduceMotion && (
              <span className="px-2.5 py-1 bg-amber-400 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-mono font-bold text-black uppercase">
                Reduced Motion
              </span>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas/90 border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-mono font-bold text-cern-cyan">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">12/12 PHYSICS TESTS</span>
              <span className="sm:hidden">12/12</span>
            </div>
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cern-blue text-white border-2 border-black shadow-[3px_3px_0px_#00E5FF] hover:shadow-[4px_4px_0px_#00E5FF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-mono font-bold transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-cern-cyan" />
              <span>Tuning Console</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  showControls ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Middle Main Narrative Banner */}
        <div className="my-auto py-8 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cern-blue border-2 border-black shadow-[3px_3px_0px_#000] text-white text-xs font-mono font-bold tracking-widest uppercase">
            <Radio className="w-4 h-4 text-cern-cyan animate-pulse" />
            27-Kilometre Ultra-High Vacuum Beamline
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
            The Interactive <br className="hidden sm:block" />
            <span className="text-cern-cyan underline decoration-4 decoration-cern-blue underline-offset-8">
              Digital Universe of CERN
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-text-secondary leading-relaxed max-w-2xl bg-canvas/80 p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
            Explore the particle physics frontier through quantitative digital twins: relativistic
            beam acceleration, ATLAS &amp; CMS multi-layer detector cutaways, FPGA Level-1 trigger
            topologies, and the Worldwide LHC Computing Grid.
          </p>

          {/* Quick Action Navigation CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2 pointer-events-auto">
            <Link
              href="/accelerators"
              className="px-5 py-3 bg-cern-blue hover:bg-cern-accent text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#00E5FF] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <Zap className="w-4 h-4 text-cern-cyan" />
              <span>Launch Accelerator Sim</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/detectors"
              className="px-5 py-3 bg-canvas-surface hover:bg-canvas-raised text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#4C7DFF] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <Layers className="w-4 h-4 text-cern-accent" />
              <span>ATLAS &amp; CMS Twins</span>
            </Link>

            <Link
              href="/ai-lab"
              className="px-4 py-3 bg-canvas-surface hover:bg-canvas-raised text-amber-300 hover:text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#FFE600] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>AI Lab</span>
            </Link>

            <Link
              href="/simulations?module=discovery"
              className="px-4 py-3 bg-canvas-surface hover:bg-canvas-raised text-pink-300 hover:text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#FF0055] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <span className="text-pink-400 font-bold">5σ</span>
              <span>Discovery Lab</span>
            </Link>
          </div>
        </div>

        {/* Bottom Section: Beam Presets & Telemetry Ribbon */}
        <div className="space-y-3 pointer-events-auto">
          {/* Preset Selector Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-mono uppercase text-white shrink-0 font-bold hidden sm:inline mr-1 px-2.5 py-1.5 bg-black border-2 border-black shadow-[2px_2px_0px_#000]">
              Beam Scenario:
            </span>
            {Object.values(PRESETS).map((p) => {
              const isSelected = p.id === selectedPresetKey;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`shrink-0 px-3.5 py-2 text-xs font-mono font-bold transition-all flex items-center gap-2 border-2 border-black active:translate-x-[1px] active:translate-y-[1px] ${
                    isSelected
                      ? 'bg-canvas-raised text-white shadow-[4px_4px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-canvas-surface/90 text-text-secondary hover:text-white shadow-[3px_3px_0px_#000]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 border border-black shrink-0"
                    style={{ backgroundColor: p.cableColor }}
                  />
                  <span>{p.name}</span>
                  <span className="text-[10px] text-text-muted hidden md:inline">({p.energy})</span>
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
                    /// Interactive Beamline Tuner · {preset.name} ///
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
