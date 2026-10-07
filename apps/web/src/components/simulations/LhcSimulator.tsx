'use client';

import React, { useState } from 'react';
import {
  calculateFromTotalEnergy,
  PROTON_MASS_GEV,
  LEAD208_MASS_GEV,
  LHC_BENDING_RADIUS_M,
  calculateMagneticRigidity,
  calculateRequiredDipoleField,
  calculateInstantaneousLuminosity,
} from '@cern-x/sim-core';
import { Value } from '@/components/provenance/Value';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Play, Pause, RotateCcw, Sliders, Info, Zap, Activity } from 'lucide-react';

export const LhcSimulator: React.FC = () => {
  // Simulator Parameters
  const [particleType, setParticleType] = useState<'proton' | 'lead'>('proton');
  const [beamEnergyGev, setBeamEnergyGev] = useState<number>(6800);
  const [bunches, setBunches] = useState<number>(2748);
  const [bunchIntensityE11, setBunchIntensityE11] = useState<number>(1.15); // x 10^11
  const [betaStarM, setBetaStarM] = useState<number>(0.3); // 30 cm
  const [isRunning, setIsRunning] = useState<boolean>(true);

  const massGev = particleType === 'proton' ? PROTON_MASS_GEV : LEAD208_MASS_GEV;
  const chargeZ = particleType === 'proton' ? 1 : 82;

  // Real relativistic physics computed deterministically via @cern-x/sim-core
  const relState = calculateFromTotalEnergy(beamEnergyGev, massGev);
  const bRho = calculateMagneticRigidity(relState.momentumGevC, chargeZ);
  const dipoleFieldTesla = calculateRequiredDipoleField(
    relState.momentumGevC,
    LHC_BENDING_RADIUS_M,
    chargeZ
  );

  // Instantaneous luminosity
  const n1 = bunchIntensityE11 * 1e11;
  const n2 = n1;
  const frev = 11245; // Hz revolution frequency for 26.66 km at c
  const normEmittance = 2.2e-6; // 2.2 um*rad
  const lumi = calculateInstantaneousLuminosity({
    n1,
    n2,
    numberOfBunches: bunches,
    revolutionFrequencyHz: frev,
    gamma: relState.gamma,
    normalizedEmittanceM: normEmittance,
    betaStarM: betaStarM,
  });

  // Average pile-up <mu> = (L * sigma_inel) / (n_b * frev)
  const sigmaInelMb = 80e-27; // 80 mb in cm^2
  const pileup = (lumi * sigmaInelMb) / (bunches * frev);

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border border-canvas-border rounded-panel">
      {/* LEFT: Parameter Control Deck */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border border-canvas-border rounded-panel p-4 space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-canvas-border">
            <h3 className="text-xs font-mono font-bold text-text-primary flex items-center gap-1.5 uppercase">
              <Sliders className="w-3.5 h-3.5 text-cern-cyan" /> Beam Parameters
            </h3>
            <button
              onClick={() => {
                setBeamEnergyGev(6800);
                setBunches(2748);
                setBunchIntensityE11(1.15);
                setBetaStarM(0.3);
              }}
              className="text-[11px] font-mono text-text-muted hover:text-text-primary flex items-center gap-1"
              title="Reset to nominal Run 3"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Particle Selector */}
          <div>
            <label className="text-[11px] font-mono uppercase text-text-muted block mb-1.5 font-semibold">
              Particle Species
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => {
                  setParticleType('proton');
                  setBeamEnergyGev(6800);
                }}
                className={`py-1.5 rounded border transition-colors ${
                  particleType === 'proton'
                    ? 'bg-cern-blue border-cern-accent text-white font-bold'
                    : 'bg-canvas-sub border-canvas-border text-text-secondary hover:text-text-primary'
                }`}
              >
                Proton (p+)
              </button>
              <button
                onClick={() => {
                  setParticleType('lead');
                  setBeamEnergyGev(54000);
                }}
                className={`py-1.5 rounded border transition-colors ${
                  particleType === 'lead'
                    ? 'bg-cern-magenta border-pink-400 text-white font-bold'
                    : 'bg-canvas-sub border-canvas-border text-text-secondary hover:text-text-primary'
                }`}
              >
                Lead Ion (Pb82+)
              </button>
            </div>
          </div>

          {/* Beam Energy Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">Beam Energy (E):</span>
              <span className="text-cern-cyan font-bold">{beamEnergyGev} GeV</span>
            </div>
            <input
              type="range"
              min={particleType === 'proton' ? 450 : 20000}
              max={particleType === 'proton' ? 7000 : 70000}
              step={particleType === 'proton' ? 50 : 500}
              value={beamEnergyGev}
              onChange={(e) => setBeamEnergyGev(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-mono mt-0.5">
              <span>Injection ({particleType === 'proton' ? '450 GeV' : '20 TeV'})</span>
              <span>Nominal (7 TeV / 574 TeV)</span>
            </div>
          </div>

          {/* Bunch Count Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">Bunches (k):</span>
              <span className="text-text-primary font-bold">{bunches}</span>
            </div>
            <input
              type="range"
              min={1}
              max={2808}
              step={12}
              value={bunches}
              onChange={(e) => setBunches(Number(e.target.value))}
              className="w-full accent-cern-blue cursor-pointer"
            />
          </div>

          {/* Bunch Population Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">Intensity / Bunch:</span>
              <span className="text-text-primary font-bold">{bunchIntensityE11.toFixed(2)} × 10¹¹</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.05}
              value={bunchIntensityE11}
              onChange={(e) => setBunchIntensityE11(Number(e.target.value))}
              className="w-full accent-cern-accent cursor-pointer"
            />
          </div>

          {/* Beta* focal parameter */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-text-muted">Focal Squeeze β*:</span>
              <span className="text-text-primary font-bold">{(betaStarM * 100).toFixed(0)} cm</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={1.5}
              step={0.05}
              value={betaStarM}
              onChange={(e) => setBetaStarM(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <span className="text-[10px] text-text-muted block mt-0.5 font-mono">
              HL-LHC target: 15 cm | Run 3: 30 cm
            </span>
          </div>
        </div>

        {/* Run / Pause Controls */}
        <div className="pt-3 border-t border-canvas-border flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-mono font-bold transition-colors ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Pause Beam Simulation' : 'Resume Circulation'}
          </button>
        </div>
      </div>

      {/* CENTER: Canvas Visualizer */}
      <div className="flex-1 flex flex-col justify-between bg-canvas rounded-panel border border-canvas-border p-4 relative min-h-[460px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-text-primary font-bold">
              LHC BEAM CIRCULATION &amp; COLLISION DYNAMICS
            </h3>
          </div>
          <FidelityBadge type="ANALYTIC" formula="B = p / (0.29979 * rho)" />
        </div>

        {/* Orbit Visualization Graphic */}
        <div className="w-full h-72 flex items-center justify-center relative overflow-hidden">
          <svg viewBox="0 0 400 400" className="w-72 h-72 select-none">
            {/* 27 km Vacuum Beam Pipes */}
            <circle
              cx="200"
              cy="200"
              r="140"
              fill="none"
              stroke="#131C2E"
              strokeWidth="18"
            />
            <circle
              cx="200"
              cy="200"
              r="140"
              fill="none"
              stroke="#0D1422"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Beam 1 (Clockwise, Cyan) */}
            <circle
              cx="200"
              cy="200"
              r="144"
              fill="none"
              stroke="#3DD6FF"
              strokeWidth="2.5"
              strokeDasharray="80 300"
              className={isRunning ? 'animate-spin' : ''}
              style={{ animationDuration: '3s' }}
            />

            {/* Beam 2 (Counter-Clockwise, Magenta) */}
            <circle
              cx="200"
              cy="200"
              r="136"
              fill="none"
              stroke="#E04FD0"
              strokeWidth="2.5"
              strokeDasharray="80 300"
              className={isRunning ? 'animate-spin' : ''}
              style={{ animationDirection: 'reverse', animationDuration: '3s' }}
            />

            {/* 4 Interaction Points */}
            <circle cx="200" cy="60" r="7" fill="#FF5C5C" />
            <text x="200" y="48" fill="#E8EEF9" fontSize="10" fontWeight="bold" textAnchor="middle">
              ATLAS (IP1)
            </text>

            <circle cx="340" cy="200" r="7" fill="#FF5C5C" />
            <text x="340" y="222" fill="#E8EEF9" fontSize="10" fontWeight="bold" textAnchor="middle">
              ALICE (IP2)
            </text>

            <circle cx="200" cy="340" r="7" fill="#FF5C5C" />
            <text x="200" y="360" fill="#E8EEF9" fontSize="10" fontWeight="bold" textAnchor="middle">
              CMS (IP5)
            </text>

            <circle cx="60" cy="200" r="7" fill="#FF5C5C" />
            <text x="60" y="222" fill="#E8EEF9" fontSize="10" fontWeight="bold" textAnchor="middle">
              LHCb (IP8)
            </text>

            {/* Center Monospace Readout */}
            <text x="200" y="195" fill="#3DD6FF" fontSize="15" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
              {(relState.velocityMS / 299792458).toFixed(8)} c
            </text>
            <text x="200" y="215" fill="#9FB0CC" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">
              √s = {(beamEnergyGev * 2 / 1000).toFixed(2)} TeV
            </text>
          </svg>
        </div>

        {/* Live Kinematic Readout Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-canvas-border">
          <div className="p-2.5 bg-canvas-surface border border-canvas-border rounded">
            <span className="text-[10px] text-text-muted font-mono block">Lorentz Factor γ</span>
            <span className="font-mono text-sm font-bold text-text-primary">
              {relState.gamma.toFixed(1)}
            </span>
          </div>

          <div className="p-2.5 bg-canvas-surface border border-canvas-border rounded">
            <span className="text-[10px] text-text-muted font-mono block">Rigidity B·ρ</span>
            <Value manifestId="lhc-dipole-field-nominal" value={bRho} unit="T·m" digits={1} />
          </div>

          <div className="p-2.5 bg-canvas-surface border border-canvas-border rounded">
            <span className="text-[10px] text-text-muted font-mono block">Required Dipole B</span>
            <Value manifestId="lhc-dipole-field-nominal" value={dipoleFieldTesla} unit="T" digits={2} />
          </div>

          <div className="p-2.5 bg-canvas-surface border border-canvas-border rounded">
            <span className="text-[10px] text-text-muted font-mono block">Inst. Luminosity L</span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              {lumi.toExponential(2)} cm⁻²s⁻¹
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Physics Inspector & Verification */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border border-canvas-border rounded-panel p-4 space-y-4">
        <div className="space-y-4">
          <div className="pb-2 border-b border-canvas-border">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cern-accent" /> Physics Inspector
            </h3>
          </div>

          {/* Formula Display */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-mono text-text-muted block mb-1">
                Relativistic Beta:
              </span>
              <div className="p-2 bg-canvas-sub border border-canvas-border rounded font-mono text-xs text-cern-cyan">
                β = √(1 - 1/γ²) = {(relState.beta).toFixed(9)}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-text-muted block mb-1">
                Magnetic Rigidity Law:
              </span>
              <div className="p-2 bg-canvas-sub border border-canvas-border rounded font-mono text-xs text-amber-300">
                B·ρ = p / (0.299792 · |Z|) = {bRho.toFixed(1)} T·m
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-text-muted block mb-1">
                Poisson Mean Pile-Up ⟨μ⟩:
              </span>
              <div className="p-2 bg-canvas-sub border border-canvas-border rounded font-mono text-xs text-emerald-400">
                ⟨μ⟩ = {pileup.toFixed(1)} collisions / crossing
              </div>
            </div>

            <div className="p-3 bg-canvas-sub border border-canvas-border rounded text-[11px] text-text-secondary leading-relaxed">
              <strong>Sanity Check:</strong> Nominal LHC 7 TeV proton requires an 8.33 T dipole field
              across 1232 superconducting Nb-Ti magnets cooled to 1.9 K.
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-canvas-border text-[11px] font-mono text-text-muted">
          <span>Engine: @cern-x/sim-core (Deterministic)</span>
        </div>
      </div>
    </div>
  );
};
