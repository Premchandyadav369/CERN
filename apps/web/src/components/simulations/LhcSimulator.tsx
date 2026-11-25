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
import { Eli5Card } from '@/components/ui/Eli5Card';
import { Lhc3DRingCanvas } from './Lhc3DRingCanvas';
import { Play, Pause, RotateCcw, Sliders, Info, Zap, Activity, Download } from 'lucide-react';

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

  // Export JSON
  const exportJson = () => {
    const payload = {
      scenario: 'LHC Beam Dynamics & Luminosity Run',
      timestamp: new Date().toISOString(),
      particle: particleType,
      beamEnergyGev,
      bunches,
      bunchIntensityE11,
      betaStarM,
      results: {
        gamma: relState.gamma,
        beta: relState.beta,
        momentumGevC: relState.momentumGevC,
        magneticRigidityTm: bRho,
        dipoleFieldTesla,
        instantaneousLuminosity: lumi,
        pileupMu: pileup,
        centerOfMassEnergyTeV: (beamEnergyGev * 2) / 1000,
      },
      fidelity: 'ANALYTIC',
      source: 'LHC Design Report (CERN-2004-003)',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lhc_run_scenario_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCsv = () => {
    const csv = `parameter,value,unit\nparticle,${particleType},-\nbeam_energy,${beamEnergyGev},GeV\nbunches,${bunches},-\nbunch_intensity,${bunchIntensityE11}e11,protons\nbeta_star,${betaStarM},m\ngamma,${relState.gamma.toFixed(2)},-\nbeta,${relState.beta.toFixed(9)},-\nrigidity,${bRho.toFixed(2)},T*m\ndipole_field,${dipoleFieldTesla.toFixed(3)},T\nluminosity,${lumi.toExponential(4)},cm^-2 s^-1\npileup,${pileup.toFixed(2)},collisions/crossing\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lhc_parameters_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Eli5Card
        title="The 27 km Subatomic Racetrack"
        analogy="The 27 km subatomic racetrack where trains crash into each other to reveal the fundamental Lego blocks of the universe."
        keyPoints={[
          "Two counter-rotating proton beams circulate at 99.9999991% the speed of light, guided in ultra-high vacuum pipes.",
          "Superconducting magnets (8.33 Tesla, cooled with superfluid helium to 1.9 K) curve the beam to steer 2,748 bunches into head-on collisions."
        ]}
        whatToTry="Move the Beam Energy slider from 450 GeV injection to 6,800 GeV and observe the Required Dipole B rise directly with magnetic rigidity."
        doi="10.23730/CYRSP-2019-004.1"
        citationLabel="CERN Yellow Reports: LHC Run 2 Luminosity & Beam Performance"
      />
      <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
      {/* LEFT: Parameter Control Deck */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4 space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3 mb-2">
            <h3 className="text-xs font-mono font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-cern-cyan" /> /// Parameters ///
            </h3>
            <button
              onClick={() => {
                setBeamEnergyGev(6800);
                setBunches(2748);
                setBunchIntensityE11(1.15);
                setBetaStarM(0.3);
              }}
              className="text-[11px] font-mono text-text-muted hover:text-white flex items-center gap-1 font-bold px-1.5 py-0.5 border border-black bg-black"
              title="Reset to nominal Run 3"
            >
              <RotateCcw className="w-3 h-3 text-cern-cyan" /> RESET
            </button>
          </div>

          {/* Particle Selector */}
          <div>
            <label className="text-[11px] font-mono uppercase text-white block mb-1.5 font-bold">
              Particle Species
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => {
                  setParticleType('proton');
                  setBeamEnergyGev(6800);
                }}
                className={`py-2 px-2 text-center border-2 font-bold transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                  particleType === 'proton'
                    ? 'bg-cern-blue border-black text-white shadow-[3px_3px_0px_#00E5FF]'
                    : 'bg-canvas-sub border-black text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                }`}
              >
                Proton (p+)
              </button>
              <button
                onClick={() => {
                  setParticleType('lead');
                  setBeamEnergyGev(54000);
                }}
                className={`py-2 px-2 text-center border-2 font-bold transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                  particleType === 'lead'
                    ? 'bg-cern-magenta border-black text-white shadow-[3px_3px_0px_#FF0055]'
                    : 'bg-canvas-sub border-black text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                }`}
              >
                Lead (Pb82+)
              </button>
            </div>
          </div>

          {/* Beam Energy Slider */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted font-bold">Beam Energy (E):</span>
              <span className="text-cern-cyan font-bold">{beamEnergyGev} GeV</span>
            </div>
            <input
              type="range"
              min={particleType === 'proton' ? 450 : 20000}
              max={particleType === 'proton' ? 7000 : 70000}
              step={particleType === 'proton' ? 50 : 500}
              value={beamEnergyGev}
              onChange={(e) => setBeamEnergyGev(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-mono">
              <span>Injection</span>
              <span>Nominal Max</span>
            </div>
          </div>

          {/* Bunch Count Slider */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted font-bold">Bunches (k):</span>
              <span className="text-white font-bold">{bunches}</span>
            </div>
            <input
              type="range"
              min={1}
              max={2808}
              step={12}
              value={bunches}
              onChange={(e) => setBunches(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Bunch Population Slider */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted font-bold">Intensity / Bunch:</span>
              <span className="text-white font-bold">{bunchIntensityE11.toFixed(2)} × 10¹¹</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.05}
              value={bunchIntensityE11}
              onChange={(e) => setBunchIntensityE11(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Beta* focal parameter */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted font-bold">Focal Squeeze β*:</span>
              <span className="text-emerald-400 font-bold">{(betaStarM * 100).toFixed(0)} cm</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={1.5}
              step={0.05}
              value={betaStarM}
              onChange={(e) => setBetaStarM(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Run / Pause & Export Controls */}
        <div className="pt-3 border-t-2 border-black space-y-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-mono font-bold uppercase border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
              isRunning
                ? 'bg-amber-400 text-black hover:bg-amber-300'
                : 'bg-emerald-400 text-black hover:bg-emerald-300'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause Beam Simulation' : 'Resume Circulation'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportJson}
              className="py-1.5 px-2 bg-canvas-sub hover:bg-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-mono font-bold text-white flex items-center justify-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Download className="w-3.5 h-3.5 text-cern-cyan" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportCsv}
              className="py-1.5 px-2 bg-canvas-sub hover:bg-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-mono font-bold text-white flex items-center justify-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Download className="w-3.5 h-3.5 text-cern-cyan" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* CENTER: Canvas Visualizer */}
      <div className="flex-1 flex flex-col justify-between bg-canvas border-2 border-black shadow-[4px_4px_0px_#000] p-4 relative min-h-[460px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3.5 mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
              /// LHC BEAM CIRCULATION &amp; COLLISION DYNAMICS ///
            </h3>
          </div>
          <FidelityBadge type="ANALYTIC" formula="B = p / (0.29979 * rho)" />
        </div>

        {/* Interactive 3D WebGL Superconducting Ring */}
        <Lhc3DRingCanvas
          beamEnergyGev={beamEnergyGev}
          bunches={bunches}
          betaStarM={betaStarM}
          particleType={particleType}
          isRunning={isRunning}
          betaVelocity={relState.velocityMS / 299792458}
          pileup={pileup}
          dipoleFieldTesla={dipoleFieldTesla}
        />

        {/* Live Kinematic Readout Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t-2 border-black">
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] text-text-muted font-mono uppercase block font-bold">Lorentz Factor γ</span>
            <span className="font-mono text-sm font-bold text-white">
              {relState.gamma.toFixed(1)}
            </span>
          </div>

          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] text-text-muted font-mono uppercase block font-bold">Rigidity B·ρ</span>
            <Value manifestId="lhc-dipole-field-nominal" value={bRho} unit="T·m" digits={1} />
          </div>

          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] text-text-muted font-mono uppercase block font-bold">Required Dipole B</span>
            <Value manifestId="lhc-dipole-field-nominal" value={dipoleFieldTesla} unit="T" digits={2} />
          </div>

          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] text-text-muted font-mono uppercase block font-bold">Inst. Lumi L</span>
            <span className="font-mono text-xs font-bold text-emerald-400 block truncate">
              {lumi.toExponential(2)}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Physics Inspector & Verification */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4 space-y-4">
        <div className="space-y-4">
          <div className="pb-2 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3 mb-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5 tracking-wider">
              <Info className="w-4 h-4 text-cern-cyan" /> /// Inspector ///
            </h3>
          </div>

          {/* Formula Display */}
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-[10px] text-text-muted uppercase block mb-1 font-bold">
                Relativistic Beta:
              </span>
              <div className="text-cern-cyan font-bold">
                β = √(1 - 1/γ²) = {(relState.beta).toFixed(9)}
              </div>
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-[10px] text-text-muted uppercase block mb-1 font-bold">
                Magnetic Rigidity Law:
              </span>
              <div className="text-amber-300 font-bold">
                B·ρ = p / (0.299792 · |Z|) = {bRho.toFixed(1)} T·m
              </div>
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-[10px] text-text-muted uppercase block mb-1 font-bold">
                Poisson Mean Pile-Up ⟨μ⟩:
              </span>
              <div className="text-emerald-400 font-bold">
                ⟨μ⟩ = {pileup.toFixed(1)} collisions / crossing
              </div>
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] text-xs text-text-secondary leading-relaxed font-sans">
              <strong className="text-white block font-mono uppercase mb-1">/// Sanity Check ///</strong>
              Nominal LHC 7 TeV proton requires an 8.33 T dipole field across 1,232 superconducting Nb-Ti magnets cooled to 1.9 K.
            </div>
          </div>
        </div>

        <div className="pt-3 border-t-2 border-black text-xs font-mono text-text-muted font-bold">
          <span>ENGINE: @cern-x/sim-core (Deterministic)</span>
        </div>
      </div>
    </div>
    </div>
  );
};
