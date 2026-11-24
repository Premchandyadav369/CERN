'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import {
  Zap,
  Sliders,
  RotateCcw,
  Play,
  Pause,
  Download,
  Gauge,
  Activity,
  Flame,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export function AwakeSimulator() {
  // AWAKE Simulation Parameters
  const [plasmaDensity_1e14, setPlasmaDensity_1e14] = useState<number>(7.0); // 10^14 cm^-3 (Range 1.0 to 12.0)
  const [injectionPhaseDeg, setInjectionPhaseDeg] = useState<number>(270); // 0 to 360 degrees (optimal accelerating phase ≈ 270 deg / 3pi/2)
  const [protonIntensity_1e11, setProtonIntensity_1e11] = useState<number>(3.0); // 10^11 protons per bunch (Range 1.0 to 4.0)
  const [witnessInitialEnergyMeV, setWitnessInitialEnergyMeV] = useState<number>(18.8); // 10 to 30 MeV
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Animation State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animTimeRef = useRef<number>(0);
  const witnessZRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const [witnessPositionZ_m, setWitnessPositionZ_m] = useState<number>(0); // 0 to 10 meters along the cell
  const [currentEnergyMeV, setCurrentEnergyMeV] = useState<number>(18.8);

  // Physical Calculations (AWAKE Nature Physics & PRL references)
  const physics = useMemo(() => {
    // Physical Constants
    const e = 1.602176634e-19; // C
    const m_e = 9.1093837e-31; // kg
    const eps0 = 8.8541878e-12; // F/m
    const c = 299792458; // m/s

    // Plasma density in SI units: n_e [m^-3] = n_e [cm^-3] * 1e6
    const n_e_m3 = plasmaDensity_1e14 * 1e14 * 1e6;

    // Angular plasma frequency: omega_pe = sqrt(n_e * e^2 / (eps0 * m_e))
    const omega_pe = Math.sqrt((n_e_m3 * e * e) / (eps0 * m_e)); // rad/s
    const f_pe_GHz = (omega_pe / (2 * Math.PI)) * 1e-9; // GHz (~200-300 GHz)

    // Plasma wavelength: lambda_pe = 2 * pi * c / omega_pe
    const lambda_pe_mm = ((2 * Math.PI * c) / omega_pe) * 1000; // mm (~1.2 mm for 7e14 cm^-3)

    // Wave-breaking electric field limit: E_0 = m_e * c * omega_pe / e [V/m]
    // In GV/m: E_0 ≈ 96 * sqrt(n_e [cm^-3]) * 1e-9 GV/m
    const E0_GV_m = ((m_e * c * omega_pe) / e) * 1e-9; // GV/m (typically 2 to 3.5 GV/m)

    // Scaling with proton drive bunch intensity (higher N_p drives deeper cavitation):
    const driveScale = Math.min(1.5, Math.max(0.4, protonIntensity_1e11 / 3.0));
    const peakAcceleratingField_GV_m = E0_GV_m * 0.72 * driveScale; // Real self-modulated wake gradient

    // Effective local field at injection phase:
    // Optimal accelerating phase for negatively-charged electrons is at 270 deg (-sin(270) = +1):
    const phaseRad = (injectionPhaseDeg * Math.PI) / 180.0;
    const phaseFactor = -Math.sin(phaseRad);
    const effectiveGradient_GV_m = peakAcceleratingField_GV_m * phaseFactor;

    // 10-meter plasma cell total energy gain:
    // Delta E = q * E_eff * L_cell
    const cellLength_m = 10.0; // AWAKE Rubidium cell is exactly 10 m
    const finalEnergyGainGeV = Math.max(
      -witnessInitialEnergyMeV / 1000,
      effectiveGradient_GV_m * cellLength_m
    );
    const finalEnergyGeV = witnessInitialEnergyMeV / 1000 + finalEnergyGainGeV;

    // Self-modulation microbunch count over SPS 12 cm bunch:
    const bunchLength_mm = 120.0; // 12 cm
    const microbunchCount = Math.floor(bunchLength_mm / lambda_pe_mm);

    return {
      omega_pe,
      f_pe_GHz,
      lambda_pe_mm,
      E0_GV_m,
      peakAcceleratingField_GV_m,
      phaseFactor,
      effectiveGradient_GV_m,
      cellLength_m,
      finalEnergyGeV,
      finalEnergyGainGeV,
      microbunchCount,
    };
  }, [plasmaDensity_1e14, injectionPhaseDeg, protonIntensity_1e11, witnessInitialEnergyMeV]);

  // Presets
  const applyPreset = (preset: 'nominal' | 'high_gradient' | 'decelerating' | 'low_density') => {
    witnessZRef.current = 0;
    if (preset === 'nominal') {
      setPlasmaDensity_1e14(7.0);
      setInjectionPhaseDeg(270);
      setProtonIntensity_1e11(3.0);
      setWitnessInitialEnergyMeV(18.8);
    } else if (preset === 'high_gradient') {
      setPlasmaDensity_1e14(11.0);
      setInjectionPhaseDeg(270);
      setProtonIntensity_1e11(4.0);
      setWitnessInitialEnergyMeV(18.8);
    } else if (preset === 'decelerating') {
      setPlasmaDensity_1e14(7.0);
      setInjectionPhaseDeg(90); // 180 deg out of phase -> decelerating
      setProtonIntensity_1e11(3.0);
      setWitnessInitialEnergyMeV(18.8);
    } else if (preset === 'low_density') {
      setPlasmaDensity_1e14(2.0);
      setInjectionPhaseDeg(270);
      setProtonIntensity_1e11(2.0);
      setWitnessInitialEnergyMeV(18.8);
    }
    setWitnessPositionZ_m(0);
    setCurrentEnergyMeV(18.8);
  };

  // Canvas Rendering & Simulation Loop: 60fps Wakefield & Witness Bunch Acceleration
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let renderId: number;

    const render = () => {
      if (isPlaying) {
        animTimeRef.current += 0.05;
        witnessZRef.current += 0.08;
        if (witnessZRef.current > 10.0) {
          witnessZRef.current = 0;
        }

        // Throttle React state updates to avoid component re-render overhead (~8 Hz)
        frameCountRef.current++;
        if (frameCountRef.current % 8 === 0) {
          const currentZ = witnessZRef.current;
          const liveE =
            witnessInitialEnergyMeV +
            Math.max(
              -witnessInitialEnergyMeV,
              physics.effectiveGradient_GV_m * 1000 * currentZ
            );
          setWitnessPositionZ_m(currentZ);
          setCurrentEnergyMeV(liveE);
        }
      }

      const activeZ = witnessZRef.current;
      const liveE =
        witnessInitialEnergyMeV +
        Math.max(
          -witnessInitialEnergyMeV,
          physics.effectiveGradient_GV_m * 1000 * activeZ
        );

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // 1. Background Cryogenic Vapor Cell Enclosure
      ctx.fillStyle = '#060B14';
      ctx.fillRect(0, 0, w, h);

      // Rubidium plasma column (horizontal tube from x = 40 to x = w - 70)
      const cellStartX = 40;
      const cellEndX = w - 80;
      const cellW = cellEndX - cellStartX;
      const cellCenterY = 90;
      const cellHalfH = 38;

      // Outer cell vacuum jacket
      ctx.fillStyle = '#0F1A2E';
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.fillRect(cellStartX, cellCenterY - cellHalfH, cellW, cellHalfH * 2);
      ctx.strokeRect(cellStartX, cellCenterY - cellHalfH, cellW, cellHalfH * 2);

      // Plasma ionization glow (rubidium vapor laser-ionized)
      const plasmaGrad = ctx.createLinearGradient(0, cellCenterY - cellHalfH, 0, cellCenterY + cellHalfH);
      plasmaGrad.addColorStop(0, 'rgba(147, 51, 234, 0.15)');
      plasmaGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.25)');
      plasmaGrad.addColorStop(1, 'rgba(147, 51, 234, 0.15)');
      ctx.fillStyle = plasmaGrad;
      ctx.fillRect(cellStartX + 2, cellCenterY - cellHalfH + 2, cellW - 4, cellHalfH * 2 - 4);

      // 2. Self-Modulation Proton Microbunches (Entering from Left)
      const t = animTimeRef.current;
      const waveK = (2 * Math.PI) / 35; // Visual wave spatial frequency

      // Draw modulated proton train (yellow glowing dots)
      ctx.fillStyle = '#FFE600';
      const numMicrobunches = 18;
      for (let i = 0; i < numMicrobunches; i++) {
        const bunchX = cellStartX + ((i * 35 - t * 40) % cellW);
        if (bunchX >= cellStartX && bunchX <= cellEndX) {
          // Pinching effect: bunch envelope narrows along the cell
          const progress = (bunchX - cellStartX) / cellW;
          const bunchRad = 4 - progress * 1.5;
          ctx.beginPath();
          ctx.arc(bunchX, cellCenterY, bunchRad, 0, Math.PI * 2);
          ctx.fill();

          // Speed blur
          ctx.strokeStyle = 'rgba(255, 230, 0, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bunchX - 10, cellCenterY);
          ctx.lineTo(bunchX + 6, cellCenterY);
          ctx.stroke();
        }
      }

      // 3. Plasma Density Perturbation & Wakefield Undulation Waves
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = cellStartX; x <= cellEndX; x += 3) {
        const progress = (x - cellStartX) / cellW;
        // SMI wave amplitude grows along the cell, then saturates
        const amp = Math.min(22, progress * 26) * (physics.peakAcceleratingField_GV_m / 2.5);
        const y = cellCenterY + Math.sin(x * waveK - t * 4) * amp;
        if (x === cellStartX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Mirror wave (lower boundary)
      ctx.strokeStyle = '#FF0055';
      ctx.beginPath();
      for (let x = cellStartX; x <= cellEndX; x += 3) {
        const progress = (x - cellStartX) / cellW;
        const amp = Math.min(22, progress * 26) * (physics.peakAcceleratingField_GV_m / 2.5);
        const y = cellCenterY - Math.sin(x * waveK - t * 4) * amp;
        if (x === cellStartX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 4. Injected Witness Electron Bunch
      const witnessX = cellStartX + (activeZ / 10.0) * cellW;
      if (witnessX >= cellStartX && witnessX <= cellEndX) {
        // Electron bunch (bright electric blue with halo)
        ctx.fillStyle = '#00FF66';
        ctx.shadowColor = '#00FF66';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(witnessX, cellCenterY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label above bunch
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`e⁻ [${(liveE / 1000).toFixed(2)} GeV]`, witnessX, cellCenterY - 14);
      }

      // 5. Downstream Electron Spectrometer Dipole (Right Exit)
      const specX = cellEndX + 10;
      const specW = 45;
      const specH = 60;
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#FFB020';
      ctx.lineWidth = 2;
      ctx.fillRect(specX, cellCenterY - specH / 2, specW, specH);
      ctx.strokeRect(specX, cellCenterY - specH / 2, specW, specH);

      ctx.fillStyle = '#FFB020';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DIPOLE', specX + specW / 2, cellCenterY - 8);
      ctx.fillText('B-FIELD', specX + specW / 2, cellCenterY + 4);

      // Trajectory bending into spectrometer screen:
      // Higher energy bends LESS (rigid momentum p = q*B*rho)
      const deflectionY =
        liveE > 50
          ? cellCenterY + Math.min(25, 400 / Math.max(10, liveE))
          : cellCenterY + 28;

      ctx.strokeStyle = '#00FF66';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(cellEndX, cellCenterY);
      ctx.quadraticCurveTo(specX + specW / 2, cellCenterY, specX + specW + 12, deflectionY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Phosphor detection screen
      ctx.fillStyle = '#00FF66';
      ctx.fillRect(specX + specW + 12, cellCenterY - 30, 4, 60);

      // 6. Longitudinal Scale Marks (0 to 10 meters)
      ctx.fillStyle = '#64748B';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      for (let m = 0; m <= 10; m += 2) {
        const mx = cellStartX + (m / 10) * cellW;
        ctx.fillText(`${m}m`, mx, cellCenterY + cellHalfH + 14);
        ctx.fillRect(mx - 0.5, cellCenterY + cellHalfH, 1, 4);
      }

      renderId = requestAnimationFrame(render);
    };

    renderId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(renderId);
  }, [isPlaying, physics, witnessInitialEnergyMeV]);

  // Export JSON Scenario
  const exportJson = () => {
    const data = {
      experiment: 'CERN AWAKE Plasma Wakefield Accelerator',
      timestamp: new Date().toISOString(),
      parameters: {
        plasmaDensity_1e14_cm3: plasmaDensity_1e14,
        injectionPhaseDeg,
        protonIntensity_1e11: protonIntensity_1e11,
        witnessInitialEnergyMeV,
      },
      results: {
        plasmaFrequencyGHz: physics.f_pe_GHz,
        plasmaWavelengthMm: physics.lambda_pe_mm,
        wavebreakingFieldLimitGVm: physics.E0_GV_m,
        peakAcceleratingFieldGVm: physics.peakAcceleratingField_GV_m,
        effectiveGradientGVm: physics.effectiveGradient_GV_m,
        finalElectronEnergyGeV: physics.finalEnergyGeV,
        totalEnergyGainGeV: physics.finalEnergyGainGeV,
        microbunchCount: physics.microbunchCount,
      },
      fidelity: 'ANALYTIC',
      source: 'AWAKE Collaboration, Nature 561, 363-367 (2018) & Nature Physics 17, 842-848 (2021)',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `awake_simulation_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCsv = () => {
    let csv = 'distance_z_m,effective_field_GV_m,electron_energy_MeV\n';
    for (let z = 0; z <= 10.0; z += 0.5) {
      const eLocal =
        witnessInitialEnergyMeV +
        Math.max(-witnessInitialEnergyMeV, physics.effectiveGradient_GV_m * 1000 * z);
      csv += `${z.toFixed(1)},${physics.effectiveGradient_GV_m.toFixed(3)},${eLocal.toFixed(2)}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `awake_acceleration_profile_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] p-5 space-y-6">
      {/* Top Bar with Fidelity Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-display font-extrabold text-white">
              /// AWAKE: Proton-Driven Plasma Wakefield Accelerator ///
            </h3>
            <FidelityBadge
              type="ANALYTIC"
              formula="E_0 = \frac{m_e c \omega_{pe}}{e} \approx 96 \sqrt{n_{pe} [\text{cm}^{-3}]} \implies E_z > 1\text{ GV/m}"
            />
          </div>
          <p className="text-xs text-text-secondary font-mono mt-1">
            SPS 400 GeV proton bunch driving self-modulation instability in 10-meter rubidium vapor cell with multi-GV/m electron acceleration.
          </p>
        </div>

        {/* Play/Pause Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 bg-cern-blue hover:bg-cern-accent text-white font-bold uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE BEAM' : 'RESUME BEAM'}</span>
          </button>
          <button
            onClick={() => {
              witnessZRef.current = 0;
              setWitnessPositionZ_m(0);
              setCurrentEnergyMeV(witnessInitialEnergyMeV);
            }}
            className="p-1.5 bg-canvas-sub hover:bg-canvas-raised text-text-muted hover:text-white border-2 border-black shadow-[2px_2px_0px_#000] transition-all"
            title="Re-inject witness bunch"
          >
            <RotateCcw className="w-4 h-4 text-cern-cyan" />
          </button>
        </div>
      </div>

      {/* Presets Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-text-muted font-bold mr-1">PRESETS:</span>
        <button
          onClick={() => applyPreset('nominal')}
          className="px-3 py-1 bg-canvas-sub text-white hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#000] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Nominal AWAKE Run 2 (7&times;10¹⁴ cm⁻³)
        </button>
        <button
          onClick={() => applyPreset('high_gradient')}
          className="px-3 py-1 bg-canvas-sub text-cern-cyan hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#00E5FF] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          High Density Peak Gradient (11&times;10¹⁴ cm⁻³)
        </button>
        <button
          onClick={() => applyPreset('decelerating')}
          className="px-3 py-1 bg-red-950 text-red-300 hover:bg-red-900 border-2 border-black shadow-[2px_2px_0px_#FF0055] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Decelerating Phase (90° Off-Peak)
        </button>
        <button
          onClick={() => applyPreset('low_density')}
          className="px-3 py-1 bg-canvas-sub text-amber-300 hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#FFE600] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Low Density Wake (2&times;10¹⁴ cm⁻³)
        </button>
      </div>

      {/* Main Grid: Controls (4 cols) + Visualizer & Metrics (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sliders Deck */}
        <div className="lg:col-span-4 bg-canvas-sub p-4 border-3 border-black shadow-[5px_5px_0px_#000] space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <span className="font-bold text-white uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cern-cyan" />
              Plasma &amp; Injection Knobs
            </span>
            <span className="text-[10px] text-cern-cyan font-bold">10m Rubidium</span>
          </div>

          {/* Slider 1: Plasma Density */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Plasma Density (n_pe):</span>
              <span className="text-cern-cyan font-bold">
                {plasmaDensity_1e14.toFixed(1)} &times; 10¹⁴ cm⁻³
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={12.0}
              step={0.2}
              value={plasmaDensity_1e14}
              onChange={(e) => setPlasmaDensity_1e14(Number(e.target.value))}
              className="w-full cursor-pointer accent-cern-cyan"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>1.0&times;10¹⁴</span>
              <span>Nominal: 7.0</span>
              <span>12.0&times;10¹⁴</span>
            </div>
          </div>

          {/* Slider 2: Witness Injection Phase */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Injection Phase (&Delta;&phi;):</span>
              <span
                className={`font-bold ${
                  physics.effectiveGradient_GV_m > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {injectionPhaseDeg}° {physics.effectiveGradient_GV_m > 0 ? '(Accelerating)' : '(Decelerating)'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={injectionPhaseDeg}
              onChange={(e) => setInjectionPhaseDeg(Number(e.target.value))}
              className="w-full cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>0° (Neutral)</span>
              <span>90° (Decel)</span>
              <span>270° (Peak Accel)</span>
            </div>
          </div>

          {/* Slider 3: SPS Proton Bunch Intensity */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">SPS Drive Bunch (N_p):</span>
              <span className="text-amber-300 font-bold">
                {protonIntensity_1e11.toFixed(1)} &times; 10¹¹ p⁺
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={4.0}
              step={0.1}
              value={protonIntensity_1e11}
              onChange={(e) => setProtonIntensity_1e11(Number(e.target.value))}
              className="w-full cursor-pointer accent-amber-300"
            />
            <span className="text-[10px] text-text-muted block">
              SPS 400 GeV/c drive beam delivers ~19 kJ pulse energy
            </span>
          </div>

          {/* Slider 4: Witness Electron Initial Energy */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Witness Injector Energy:</span>
              <span className="text-white font-bold">{witnessInitialEnergyMeV.toFixed(1)} MeV</span>
            </div>
            <input
              type="range"
              min={12.0}
              max={25.0}
              step={0.5}
              value={witnessInitialEnergyMeV}
              onChange={(e) => setWitnessInitialEnergyMeV(Number(e.target.value))}
              className="w-full cursor-pointer accent-white"
            />
            <span className="text-[10px] text-text-muted block">
              PHIN RF photoinjector output (nominally 18.8 MeV)
            </span>
          </div>

          {/* Accelerator Gradient Comparison Callout */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1.5 text-[11px]">
            <span className="text-[10px] font-bold uppercase text-cern-cyan block">
              Accelerating Gradient Benchmark:
            </span>
            <div className="flex justify-between">
              <span className="text-text-muted">LHC Superconducting RF:</span>
              <span className="font-bold text-white">5.5 MV/m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">CLIC Normal Conducting:</span>
              <span className="font-bold text-white">100 MV/m</span>
            </div>
            <div className="flex justify-between border-t border-zinc-800 pt-1">
              <span className="text-emerald-400 font-bold">AWAKE Plasma Cell:</span>
              <span className="font-bold text-emerald-400">
                {(physics.effectiveGradient_GV_m * 1000).toFixed(0)} MV/m ({physics.effectiveGradient_GV_m.toFixed(2)} GV/m)
              </span>
            </div>
          </div>
        </div>

        {/* Right Visualizer & Real-Time Telemetry (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Peak Gradient (E_z)</span>
              <span className="text-xl font-bold text-cern-cyan">
                {physics.effectiveGradient_GV_m.toFixed(2)} GV/m
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                Limit: {physics.E0_GV_m.toFixed(2)} GV/m
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Final Energy (E_f)</span>
              <span className="text-xl font-bold text-emerald-400">
                {physics.finalEnergyGeV.toFixed(3)} GeV
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">
                +{(physics.finalEnergyGainGeV * 1000).toFixed(0)} MeV Gain
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Plasma Frequency</span>
              <span className="text-xl font-bold text-amber-300">
                {physics.f_pe_GHz.toFixed(1)} GHz
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                &lambda;_pe = {physics.lambda_pe_mm.toFixed(2)} mm
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Microbunches (SMI)</span>
              <span className="text-xl font-bold text-white">
                ~{physics.microbunchCount}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                Along 12 cm drive bunch
              </span>
            </div>
          </div>

          {/* Interactive Animation Canvas: 10m Vapor Cell */}
          <div className="bg-canvas-sub p-4 border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-cern-cyan" />
                10-Meter Laser-Ionized Rubidium Plasma Vapor Cell
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-300" /> SPS 400 GeV Drive
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Witness e⁻
                </span>
              </div>
            </div>

            {/* 2D Canvas */}
            <div className="relative w-full h-48 bg-black border-2 border-black overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={700}
                height={180}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Live Progress & Energy Meter */}
            <div className="p-3 bg-canvas-surface border-2 border-black grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs font-mono">
              <div className="sm:col-span-5 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-muted">Witness Cell Position:</span>
                  <span className="text-white font-bold">{witnessPositionZ_m.toFixed(2)} / 10.0 m</span>
                </div>
                <div className="w-full h-2.5 bg-black border border-zinc-800">
                  <div
                    className="h-full bg-cern-cyan transition-all duration-75"
                    style={{ width: `${(witnessPositionZ_m / 10.0) * 100}%` }}
                  />
                </div>
              </div>

              <div className="sm:col-span-7 flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <span className="text-text-muted text-[10px] block uppercase font-bold">Live Electron Energy</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {currentEnergyMeV >= 1000
                      ? `${(currentEnergyMeV / 1000).toFixed(3)} GeV`
                      : `${currentEnergyMeV.toFixed(1)} MeV`}
                  </span>
                </div>
                <div className="px-3 py-1 bg-black border border-black shadow-[2px_2px_0px_#000] text-right">
                  <span className="text-[10px] text-text-muted block">Spectrometer B-Field</span>
                  <span className="text-xs font-bold text-amber-300">0.25 T</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Deck */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-black text-xs font-mono">
            <span className="text-text-muted text-[11px]">
              Reproducible closed-form simulation based on AWAKE Nature 2018/2021
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
  );
}
