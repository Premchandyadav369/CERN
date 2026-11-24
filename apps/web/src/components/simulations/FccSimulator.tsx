'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import {
  RotateCcw,
  Sliders,
  Play,
  Pause,
  Download,
  Gauge,
  Activity,
  Zap,
  Flame,
  AlertTriangle,
  CheckCircle,
  Info,
  Layers,
} from 'lucide-react';

export function FccSimulator() {
  // Machine Mode: 'FCC-ee' (lepton) vs 'FCC-hh' (hadron)
  const [machineMode, setMachineMode] = useState<
    'ee-Z' | 'ee-W' | 'ee-H' | 'ee-ttbar' | 'hh-proton' | 'custom'
  >('ee-Z');

  // Physical Parameters
  const [particleSpecies, setParticleSpecies] = useState<'electron' | 'proton'>('electron');
  const [beamEnergyGeV, setBeamEnergyGeV] = useState<number>(45.6); // 45.6 GeV (Z-pole), 120 GeV (Higgs), 182.5 GeV (ttbar), 50000 GeV (FCC-hh)
  const [beamCurrent_mA, setBeamCurrent_mA] = useState<number>(1280); // Beam current in mA
  const [bendingRadius_m, setBendingRadius_m] = useState<number>(10400); // 10.4 km dipole bending radius for 90.7 km tunnel
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Canvas Refs
  const ringCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const arcCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animTimeRef = useRef<number>(0);

  // Physics Calculations: Synchrotron Radiation & Power Budget
  const physics = useMemo(() => {
    // Rest mass in GeV
    const restMassGeV = particleSpecies === 'electron' ? 0.00051099895 : 0.93827208816;
    const gamma = Math.max(1.0, beamEnergyGeV / restMassGeV);

    // Energy loss per turn:
    // U_0 = C_gamma * E^4 / rho
    // For electrons: C_gamma = 8.846e-5 m * GeV^-3 => U_0 [GeV] = 8.846e-5 * E^4 / rho [m]
    // For protons: C_gamma_p = C_gamma_e * (m_e / m_p)^4 ≈ 7.783e-18 m * GeV^-3
    const C_gamma =
      particleSpecies === 'electron' ? 8.84627e-5 : 7.783e-18;

    const energyLossPerTurn_GeV = (C_gamma * Math.pow(beamEnergyGeV, 4)) / bendingRadius_m;
    const energyLossPerTurn_MeV = energyLossPerTurn_GeV * 1000;

    // Synchrotron Radiated Power per beam in Watts:
    // P_sync = U_0 * I_beam = (energyLossPerTurn_GeV * 1e9 eV) * (beamCurrent_mA * 1e-3 A)
    // => P_sync [MW] = energyLossPerTurn_GeV * beamCurrent_mA
    const powerSync_MW = energyLossPerTurn_GeV * beamCurrent_mA;

    // Wall-Plug Limit per beam: 50 MW (100 MW total electrical ceiling)
    const powerLimit_MW = 50.0;
    const powerFractionPct = (powerSync_MW / powerLimit_MW) * 100.0;
    const isOverLimit = powerSync_MW > powerLimit_MW;

    // Maximum sustainable beam current at this energy before exceeding 50 MW:
    const maxCurrent_mA =
      energyLossPerTurn_GeV > 0 ? Math.min(2000, 50.0 / energyLossPerTurn_GeV) : 2000;

    // Critical photon energy:
    // eps_c [keV] = 2.218 * E^3 [GeV] / rho [m] (for electrons)
    let criticalPhotonEnergy_keV = 0;
    if (particleSpecies === 'electron') {
      criticalPhotonEnergy_keV = (2.218 * Math.pow(beamEnergyGeV, 3)) / bendingRadius_m;
    } else {
      // Protons: scaled by (m_e / m_p)^3
      criticalPhotonEnergy_keV =
        ((2.218 * Math.pow(beamEnergyGeV, 3)) / bendingRadius_m) * Math.pow(0.000511 / 0.938, 3);
    }

    // Required Dipole Field B:
    // B [Tesla] = p / (0.299792 * rho) ≈ E / (0.299792 * rho)
    const dipoleFieldTesla = beamEnergyGeV / (0.299792458 * bendingRadius_m);

    // Linear heat load on cryogenic beam screen in W/m:
    // Arc bending length ≈ 2 * pi * rho ≈ 65,345 m
    const arcLengthM = 2 * Math.PI * bendingRadius_m;
    const linearHeatLoad_W_m = (powerSync_MW * 1e6) / arcLengthM;

    return {
      gamma,
      energyLossPerTurn_GeV,
      energyLossPerTurn_MeV,
      powerSync_MW,
      powerLimit_MW,
      powerFractionPct,
      isOverLimit,
      maxCurrent_mA,
      criticalPhotonEnergy_keV,
      dipoleFieldTesla,
      linearHeatLoad_W_m,
    };
  }, [particleSpecies, beamEnergyGeV, beamCurrent_mA, bendingRadius_m]);

  // Presets
  const applyPreset = (preset: 'ee-Z' | 'ee-W' | 'ee-H' | 'ee-ttbar' | 'hh-proton') => {
    setMachineMode(preset);
    if (preset === 'ee-Z') {
      setParticleSpecies('electron');
      setBeamEnergyGeV(45.6);
      setBeamCurrent_mA(1280);
      setBendingRadius_m(10400);
    } else if (preset === 'ee-W') {
      setParticleSpecies('electron');
      setBeamEnergyGeV(80.0);
      setBeamCurrent_mA(147);
      setBendingRadius_m(10400);
    } else if (preset === 'ee-H') {
      setParticleSpecies('electron');
      setBeamEnergyGeV(120.0);
      setBeamCurrent_mA(29);
      setBendingRadius_m(10400);
    } else if (preset === 'ee-ttbar') {
      setParticleSpecies('electron');
      setBeamEnergyGeV(182.5);
      setBeamCurrent_mA(5.4);
      setBendingRadius_m(10400);
    } else if (preset === 'hh-proton') {
      setParticleSpecies('proton');
      setBeamEnergyGeV(50000); // 50 TeV per beam = 100 TeV c.m.
      setBeamCurrent_mA(500);
      setBendingRadius_m(10400);
    }
  };

  // Canvas 1: FCC 90.7 km Ring Schematic Map
  useEffect(() => {
    const canvas = ringCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (isPlaying) {
        animTimeRef.current += 0.03;
      }
      const t = animTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const ringRadius = Math.min(cx, cy) - 24;

      // Background
      ctx.fillStyle = '#060B14';
      ctx.fillRect(0, 0, w, h);

      // Lake Geneva schematic contour
      ctx.fillStyle = 'rgba(14, 116, 144, 0.15)';
      ctx.beginPath();
      ctx.ellipse(cx + 40, cy - 25, 45, 25, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38BDF8';
      ctx.font = '8px monospace';
      ctx.fillText('LAKE GENEVA', cx + 40, cy - 22);

      // Existing LHC 27 km ring for scale comparison
      const lhcRadius = ringRadius * (26.7 / 90.7);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx - 30, cy + 20, lhcRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#64748B';
      ctx.font = '8px monospace';
      ctx.fillText('LHC (27 km)', cx - 30, cy + 20);

      // 90.7 km FCC Ring Outline (Racetrack 8-fold quasi-circular)
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 4 Experimental Caverns (PA, PD, PG, PJ)
      const caverns = [
        { name: 'EXP A', angle: 0 },
        { name: 'EXP D', angle: Math.PI / 2 },
        { name: 'EXP G', angle: Math.PI },
        { name: 'EXP J', angle: (3 * Math.PI) / 2 },
      ];
      caverns.forEach((cav) => {
        const x = cx + Math.cos(cav.angle) * ringRadius;
        const y = cy + Math.sin(cav.angle) * ringRadius;
        ctx.fillStyle = '#FF0055';
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(cav.name, x, y - 8);
      });

      // Circulating Bunches around the 91 km ring
      const numBunches = 6;
      ctx.fillStyle = particleSpecies === 'electron' ? '#00FF66' : '#FFE600';
      for (let i = 0; i < numBunches; i++) {
        const angle = t * 2 + (i * Math.PI * 2) / numBunches;
        const bx = cx + Math.cos(angle) * ringRadius;
        const by = cy + Math.sin(angle) * ringRadius;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FCC-ee / FCC-hh 90.7 km RING', cx, h - 8);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, particleSpecies]);

  // Canvas 2: Dipole Bending Arc & Synchrotron Radiation Fan
  useEffect(() => {
    const canvas = arcCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const t = animTimeRef.current;

      // Background
      ctx.fillStyle = '#060B14';
      ctx.fillRect(0, 0, w, h);

      // Vacuum Bending Arc (radius rho ≈ 10,400 m, visually represented as curved pipe)
      const arcCenterY = 220;
      const arcRadiusVis = 180;

      // Vacuum chamber pipe walls
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(w / 2, arcCenterY, arcRadiusVis, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();

      // Dipole Magnet Yoke outline
      ctx.strokeStyle = '#FFB020';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2, arcCenterY, arcRadiusVis + 15, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();

      // Electron Beam Track curving inside vacuum pipe
      ctx.strokeStyle = particleSpecies === 'electron' ? '#00E5FF' : '#FFE600';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(w / 2, arcCenterY, arcRadiusVis, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();

      // Synchrotron Radiation Tangential Photon Emission Fan
      // Emitted along tangent: angle theta = emissionAngle + pi/2
      const numRays = 8;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < numRays; i++) {
        const phi = -Math.PI * 0.75 + i * 0.12;
        const emitX = w / 2 + Math.cos(phi) * arcRadiusVis;
        const emitY = arcCenterY + Math.sin(phi) * arcRadiusVis;

        // Tangent direction vector
        const tanAngle = phi + Math.PI / 2;
        const rayLen = 50 + Math.sin(t * 5 + i) * 10;
        const targetX = emitX + Math.cos(tanAngle) * rayLen;
        const targetY = emitY + Math.sin(tanAngle) * rayLen;

        // Photon cone color by critical energy:
        // UV (< 1 keV) = cyan, X-ray (1-100 keV) = yellow, Hard X-ray (> 100 keV) = magenta
        const rayColor =
          physics.criticalPhotonEnergy_keV > 500
            ? '#FF0055'
            : physics.criticalPhotonEnergy_keV > 50
            ? '#FFE600'
            : '#00FF66';

        ctx.strokeStyle = rayColor;
        ctx.beginPath();
        ctx.moveTo(emitX, emitY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Absorber collision flash
        ctx.fillStyle = rayColor;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Copper Synchrotron Crotch Absorber & Cooling Line
      ctx.fillStyle = '#B45309';
      ctx.fillRect(w - 70, 20, 14, 80);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Cu CROTCH', w - 63, 110);
      ctx.fillText('ABSORBER', w - 63, 120);

      // Labeling
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Dipole B = ${physics.dipoleFieldTesla.toFixed(2)} T`, 15, 20);
      ctx.fillText(`Photon Cone: θ ≈ 1/γ = ${(1e6 / physics.gamma).toFixed(1)} μrad`, 15, 34);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [physics, particleSpecies, isPlaying]);

  // Export JSON Scenario
  const exportJson = () => {
    const data = {
      experiment: 'CERN Future Circular Collider (FCC) 91 km Synchrotron Power Model',
      timestamp: new Date().toISOString(),
      parameters: {
        machineMode,
        particleSpecies,
        beamEnergyGeV,
        beamCurrent_mA,
        bendingRadius_m,
      },
      results: {
        relativisticGamma: physics.gamma,
        energyLossPerTurn_GeV: physics.energyLossPerTurn_GeV,
        energyLossPerTurn_MeV: physics.energyLossPerTurn_MeV,
        synchrotronRadiatedPower_MW: physics.powerSync_MW,
        wallPlugPowerLimit_MW: physics.powerLimit_MW,
        powerFractionPct: physics.powerFractionPct,
        criticalPhotonEnergy_keV: physics.criticalPhotonEnergy_keV,
        requiredDipoleField_Tesla: physics.dipoleFieldTesla,
        linearHeatLoad_W_m: physics.linearHeatLoad_W_m,
      },
      fidelity: 'ANALYTIC',
      source: 'FCC Feasibility Study & Conceptual Design Report (CERN-ACC-2019-0003)',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fcc_synchrotron_power_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCsv = () => {
    let csv = 'beam_energy_GeV,energy_loss_turn_MeV,power_MW,critical_photon_keV,dipole_field_T\n';
    const maxE = particleSpecies === 'electron' ? 200 : 50000;
    const step = particleSpecies === 'electron' ? 10 : 2500;
    for (let e = 20; e <= maxE; e += step) {
      const u0_gev =
        ((particleSpecies === 'electron' ? 8.846e-5 : 7.783e-18) * Math.pow(e, 4)) /
        bendingRadius_m;
      const p_mw = u0_gev * beamCurrent_mA;
      const ec_kev =
        particleSpecies === 'electron'
          ? (2.218 * Math.pow(e, 3)) / bendingRadius_m
          : ((2.218 * Math.pow(e, 3)) / bendingRadius_m) * Math.pow(0.000511 / 0.938, 3);
      const b_t = e / (0.299792 * bendingRadius_m);
      csv += `${e},${(u0_gev * 1000).toFixed(2)},${p_mw.toFixed(3)},${ec_kev.toFixed(2)},${b_t.toFixed(3)}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fcc_energy_scaling_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">
      <Eli5Card
        title="The 91 km Super-Highway Ring"
        analogy="Why building a highway ring larger than the entire city of Geneva prevents fast particles from wasting all their energy turning sharp corners."
        keyPoints={[
          "When ultra-fast charged particles bend around corners, they spit out intense synchrotron light, losing energy rapidly (proportional to γ⁴ / ρ).",
          "A massive 90.7 km ring makes the curves gentle enough to keep synchrotron losses under the strict 50 MW/beam ceiling, paving the way for 100 TeV discovery physics."
        ]}
        whatToTry="Select 'FCC-ee Higgs (120 GeV)' and see synchrotron radiation hit 39 MW per beam, then switch to 'FCC-hh Protons' to see why heavy protons barely radiate at all!"
        arxivId="1905.05078"
        doi="10.1140/epjst/e2019-900087-0"
        citationLabel="FCC Collaboration: CDR Vol. 3 Hadron Collider (EPJ ST 2019)"
      />
      <div className="w-full bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] p-5 space-y-6">
      {/* Top Bar with Fidelity Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-display font-extrabold text-white">
              /// FCC: 91 km Collider Explorer &amp; Synchrotron Power Calculator ///
            </h3>
            <FidelityBadge
              type="ANALYTIC"
              formula="P_{\text{sync}} = \frac{e^2 c}{6\pi \varepsilon_0} \frac{\gamma^4}{\rho^2} = U_0 \times I_{\text{beam}} \le 50\text{ MW/beam}"
            />
          </div>
          <p className="text-xs text-text-secondary font-mono mt-1">
            Future Circular Collider 90.7 km tunnel exploring FCC-ee electroweak factory stages (Z, W, H, ttbar) and FCC-hh 100 TeV hadron collider.
          </p>
        </div>

        {/* Play/Pause Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 bg-cern-blue hover:bg-cern-accent text-white font-bold uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE RING' : 'RESUME RING'}</span>
          </button>
        </div>
      </div>

      {/* Mode Presets Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-text-muted font-bold mr-1">COLLIDER RUNS:</span>
        <button
          onClick={() => applyPreset('ee-Z')}
          className={`px-3 py-1 border-2 border-black font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all ${
            machineMode === 'ee-Z'
              ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
              : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
          }`}
        >
          FCC-ee (Z-pole 45.6 GeV, 1280 mA)
        </button>
        <button
          onClick={() => applyPreset('ee-W')}
          className={`px-3 py-1 border-2 border-black font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all ${
            machineMode === 'ee-W'
              ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
              : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
          }`}
        >
          FCC-ee (W-pair 80 GeV, 147 mA)
        </button>
        <button
          onClick={() => applyPreset('ee-H')}
          className={`px-3 py-1 border-2 border-black font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all ${
            machineMode === 'ee-H'
              ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
              : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
          }`}
        >
          FCC-ee (ZH Higgs 120 GeV, 29 mA)
        </button>
        <button
          onClick={() => applyPreset('ee-ttbar')}
          className={`px-3 py-1 border-2 border-black font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all ${
            machineMode === 'ee-ttbar'
              ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
              : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
          }`}
        >
          FCC-ee (tt̄ Top 182.5 GeV, 5.4 mA)
        </button>
        <button
          onClick={() => applyPreset('hh-proton')}
          className={`px-3 py-1 border-2 border-black font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all ${
            machineMode === 'hh-proton'
              ? 'bg-cern-magenta text-white shadow-[2px_2px_0px_#000]'
              : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
          }`}
        >
          FCC-hh (Protons 50 TeV / 100 TeV c.m., 16 T Dipoles)
        </button>
      </div>

      {/* Main Grid: Controls (4 cols) + Visualizer & Power HUD (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sliders Deck */}
        <div className="lg:col-span-4 bg-canvas-sub p-4 border-3 border-black shadow-[5px_5px_0px_#000] space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <span className="font-bold text-white uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cern-cyan" />
              Beam &amp; Lattice Parameters
            </span>
            <span className="text-[10px] text-cern-cyan font-bold">90.7 km Tunnel</span>
          </div>

          {/* Particle Species Selector */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-text-muted block">
              Particle Species:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setParticleSpecies('electron');
                  if (beamEnergyGeV > 250) {
                    setBeamEnergyGeV(120);
                    setBeamCurrent_mA(29);
                  }
                }}
                className={`py-1.5 border-2 border-black font-bold text-xs uppercase ${
                  particleSpecies === 'electron'
                    ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-canvas-sub text-text-muted hover:text-white'
                }`}
              >
                e⁺ / e⁻ (FCC-ee)
              </button>
              <button
                onClick={() => {
                  setParticleSpecies('proton');
                  setBeamEnergyGeV(50000);
                  setBeamCurrent_mA(500);
                }}
                className={`py-1.5 border-2 border-black font-bold text-xs uppercase ${
                  particleSpecies === 'proton'
                    ? 'bg-cern-magenta text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-canvas-sub text-text-muted hover:text-white'
                }`}
              >
                p⁺ (FCC-hh)
              </button>
            </div>
          </div>

          {/* Slider 1: Beam Energy */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Beam Energy (E):</span>
              <span className="text-cern-cyan font-bold">
                {beamEnergyGeV >= 1000
                  ? `${(beamEnergyGeV / 1000).toFixed(1)} TeV`
                  : `${beamEnergyGeV.toFixed(1)} GeV`}
              </span>
            </div>
            <input
              type="range"
              min={particleSpecies === 'electron' ? 20 : 5000}
              max={particleSpecies === 'electron' ? 200 : 55000}
              step={particleSpecies === 'electron' ? 0.5 : 500}
              value={beamEnergyGeV}
              onChange={(e) => {
                setBeamEnergyGeV(Number(e.target.value));
                setMachineMode('custom');
              }}
              className="w-full cursor-pointer accent-cern-cyan"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>{particleSpecies === 'electron' ? '20 GeV' : '5 TeV'}</span>
              <span>{particleSpecies === 'electron' ? '120 GeV (Higgs)' : '50 TeV'}</span>
              <span>{particleSpecies === 'electron' ? '200 GeV' : '55 TeV'}</span>
            </div>
          </div>

          {/* Slider 2: Beam Current */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Beam Current (I):</span>
              <span className="text-white font-bold">{beamCurrent_mA.toFixed(1)} mA</span>
            </div>
            <input
              type="range"
              min={1}
              max={1500}
              step={1}
              value={beamCurrent_mA}
              onChange={(e) => {
                setBeamCurrent_mA(Number(e.target.value));
                setMachineMode('custom');
              }}
              className="w-full cursor-pointer accent-cern-yellow"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>1 mA</span>
              <span>Max Safe: {physics.maxCurrent_mA.toFixed(0)} mA</span>
              <span>1500 mA</span>
            </div>
          </div>

          {/* Slider 3: Bending Radius rho */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Bending Radius (&rho;):</span>
              <span className="text-amber-300 font-bold">{bendingRadius_m.toLocaleString()} m</span>
            </div>
            <input
              type="range"
              min={8000}
              max={12000}
              step={100}
              value={bendingRadius_m}
              onChange={(e) => setBendingRadius_m(Number(e.target.value))}
              className="w-full cursor-pointer accent-amber-300"
            />
            <span className="text-[10px] text-text-muted block">
              90.7 km ring effective arc radius (10.4 km nominal)
            </span>
          </div>

          {/* 50 MW Wall-Plug Power Interlock Alert */}
          <div
            className={`p-3 border-2 border-black shadow-[3px_3px_0px_#000] space-y-2 ${
              physics.isOverLimit ? 'bg-red-950 text-red-200' : 'bg-canvas-surface text-text-secondary'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
              {physics.isOverLimit ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-red-400">EXCEEDS 50 MW RF CEILING!</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400">WITHIN 50 MW RF BUDGET</span>
                </>
              )}
            </div>
            <p className="text-[10px] leading-normal">
              CERN has mandated a strict 50 MW synchrotron power limit per beam (100 MW total electrical wall-plug) to protect public grid consumption.
            </p>
            {physics.isOverLimit && (
              <button
                onClick={() => {
                  setBeamCurrent_mA(Math.max(1, Math.floor(physics.maxCurrent_mA)));
                }}
                className="w-full py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] uppercase border border-black shadow-[2px_2px_0px_#000] transition-all"
              >
                Auto-Clamp to Safe Current ({physics.maxCurrent_mA.toFixed(1)} mA)
              </button>
            )}
          </div>
        </div>

        {/* Right Visualizer & Metrics (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Synchrotron Power</span>
              <span
                className={`text-xl font-bold ${
                  physics.isOverLimit ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {physics.powerSync_MW.toFixed(1)} MW
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                Total 2-Beam: {(physics.powerSync_MW * 2).toFixed(1)} / 100 MW
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Energy Loss (U₀)</span>
              <span className="text-xl font-bold text-cern-cyan">
                {physics.energyLossPerTurn_MeV >= 1000
                  ? `${physics.energyLossPerTurn_GeV.toFixed(2)} GeV`
                  : `${physics.energyLossPerTurn_MeV.toFixed(1)} MeV`}
              </span>
              <span className="text-[10px] text-cern-cyan block mt-0.5 font-bold">
                per single turn
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Critical Photon (ε_c)</span>
              <span className="text-xl font-bold text-amber-300">
                {physics.criticalPhotonEnergy_keV >= 1000
                  ? `${(physics.criticalPhotonEnergy_keV / 1000).toFixed(2)} MeV`
                  : `${physics.criticalPhotonEnergy_keV.toFixed(1)} keV`}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                &gamma; = {physics.gamma.toExponential(2)}
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Dipole Field (B)</span>
              <span className="text-xl font-bold text-white">
                {physics.dipoleFieldTesla.toFixed(3)} T
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                Heat: {physics.linearHeatLoad_W_m.toFixed(1)} W/m
              </span>
            </div>
          </div>

          {/* 50 MW Power Budget Gauge Bar */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[11px]">
              <span className="text-white font-bold uppercase flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cern-cyan" />
                Live RF Power Budget Consumption:
              </span>
              <span
                className={`font-bold ${
                  physics.isOverLimit ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {physics.powerFractionPct.toFixed(1)}% of 50 MW Ceiling
              </span>
            </div>
            <div className="w-full h-3 bg-black border border-zinc-800 relative">
              <div
                className={`h-full transition-all duration-300 ${
                  physics.isOverLimit
                    ? 'bg-red-500'
                    : physics.powerFractionPct > 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, physics.powerFractionPct)}%` }}
              />
              {/* 50 MW mark */}
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-red-400" />
            </div>
          </div>

          {/* Dual Visualizer: 91 km Ring Map (Left) + Dipole Synchrotron Fan (Right) */}
          <div className="bg-canvas-sub p-4 border-2 border-black shadow-[4px_4px_0px_#000] grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* 90.7 km Ring Topological Map (6 cols) */}
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-2 mb-2 border-b-2 border-black text-[11px] font-mono">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cern-cyan" />
                  FCC Ring Layout &amp; Caverns
                </span>
                <span className="text-text-muted">Geneva Basin</span>
              </div>

              <div className="relative w-full h-52 bg-black border-2 border-black overflow-hidden flex items-center justify-center">
                <canvas
                  ref={ringCanvasRef}
                  width={300}
                  height={210}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Dipole Arc & Photon Fan (6 cols) */}
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-2 mb-2 border-b-2 border-black text-[11px] font-mono">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  Bending Arc Synchrotron Radiation Fan
                </span>
                <span className="text-amber-300 font-bold">&theta; &asymp; 1/&gamma;</span>
              </div>

              <div className="relative w-full h-52 bg-black border-2 border-black overflow-hidden flex items-center justify-center">
                <canvas
                  ref={arcCanvasRef}
                  width={300}
                  height={210}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Export Deck */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-black text-xs font-mono">
            <span className="text-text-muted text-[11px]">
              Analytic Relativistic Synchrotron Radiation &amp; RF Power Model
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={exportJson}
                className="px-3 py-1.5 bg-canvas-sub hover:bg-canvas-raised text-white border-2 border-black shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-cern-cyan" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={exportCsv}
                className="px-3 py-1.5 bg-canvas-sub hover:bg-canvas-raised text-white border-2 border-black shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-cern-yellow" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
