'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import {
  RotateCcw,
  Sliders,
  Play,
  Pause,
  Download,
  Zap,
  Activity,
  Layers,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

export function CrabCavitySimulator() {
  // HL-LHC Machine & Beam Parameters
  const [crossingAngle_urad, setCrossingAngle_urad] = useState<number>(500); // 0 to 600 urad (nominal HL-LHC ≈ 500 urad)
  const [crabVoltageMV, setCrabVoltageMV] = useState<number>(3.4); // 0 to 4.5 MV per cavity (nominal 3.4 MV)
  const [bunchLengthCm, setBunchLengthCm] = useState<number>(7.55); // 5.0 to 10.0 cm (nominal 7.55 cm)
  const [beamSizeStarUm, setBeamSizeStarUm] = useState<number>(7.5); // 5.0 to 20.0 um (nominal beta* = 15 cm -> sigma* ≈ 7.5 um)
  const [bunchIntensityE11, setBunchIntensityE11] = useState<number>(2.2); // 1.0 to 2.5 x 10^11 protons per bunch
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Animation State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animTimeRef = useRef<number>(0);

  // Physics Calculations: Piwinski Angle & Geometric Luminosity Reduction Factor
  const physics = useMemo(() => {
    // Half crossing angle theta_c / 2 in radians
    const theta_c_rad = (crossingAngle_urad * 1e-6);
    const halfTheta_c_rad = theta_c_rad / 2.0;

    // Bunch length in meters and transverse beam size in meters
    const sigma_z_m = bunchLengthCm * 0.01;
    const sigma_star_m = beamSizeStarUm * 1e-6;

    // Piwinski angle without crab cavities:
    // Phi_0 = (theta_c * sigma_z) / (2 * sigma_star)
    const Piwinski_0 = (theta_c_rad * sigma_z_m) / (2.0 * sigma_star_m);

    // Geometric reduction factor without crab cavities:
    // F_0 = 1 / sqrt(1 + Phi_0^2)
    const F_0 = 1.0 / Math.sqrt(1.0 + Piwinski_0 * Piwinski_0);

    // Crab angle induced by deflecting voltage V_crab:
    // Full compensation at nominal V_crab = 3.4 MV imparts a transverse tilt theta_crab = 250 urad (half of 500 urad).
    // The crab kick is an intrinsic RF cavity property and does NOT vanish when crossingAngle = 0!
    const crabAngle_rad = (250e-6) * (crabVoltageMV / 3.4);
    const crabAngle_urad = crabAngle_rad * 1e6;

    // Residual collision angle after crab cavity tilt (accounting for over-crabbing tilt overshoot):
    // theta_eff = |theta_c - 2 * theta_crab|
    const theta_eff_rad = Math.abs(theta_c_rad - 2.0 * crabAngle_rad);
    const Piwinski_eff = (theta_eff_rad * sigma_z_m) / (2.0 * sigma_star_m);

    // Effective Geometric Reduction Factor:
    const F_eff = Math.min(1.0, 1.0 / Math.sqrt(1.0 + Piwinski_eff * Piwinski_eff));

    // Luminosity Gain Factor:
    const lumiGainPct = ((F_eff / F_0) - 1.0) * 100.0;

    // HL-LHC Peak Luminosity (x 10^34 cm^-2 s^-1):
    // Nominal uncrabbed L_0 ≈ 2.8e34, crab cavities boost to ~7.5e34!
    const baseLumi_e34 = 7.5;
    const peakLuminosity_e34 = baseLumi_e34 * F_eff * Math.pow(bunchIntensityE11 / 2.2, 2);

    return {
      Piwinski_0,
      F_0,
      crabAngle_urad,
      Piwinski_eff,
      F_eff,
      lumiGainPct,
      peakLuminosity_e34,
      theta_eff_rad,
    };
  }, [crossingAngle_urad, crabVoltageMV, bunchLengthCm, beamSizeStarUm, bunchIntensityE11]);

  // Presets
  const applyPreset = (preset: 'nominal' | 'uncrabbed' | 'zero_angle' | 'over_crabbed') => {
    if (preset === 'nominal') {
      setCrossingAngle_urad(500);
      setCrabVoltageMV(3.4); // Full compensation
      setBunchLengthCm(7.55);
      setBeamSizeStarUm(7.5);
    } else if (preset === 'uncrabbed') {
      setCrossingAngle_urad(500);
      setCrabVoltageMV(0.0); // No crabbing
      setBunchLengthCm(7.55);
      setBeamSizeStarUm(7.5);
    } else if (preset === 'zero_angle') {
      setCrossingAngle_urad(0);
      setCrabVoltageMV(0.0);
      setBunchLengthCm(7.55);
      setBeamSizeStarUm(7.5);
    } else if (preset === 'over_crabbed') {
      setCrossingAngle_urad(400);
      setCrabVoltageMV(4.2);
      setBunchLengthCm(7.55);
      setBeamSizeStarUm(7.5);
    }
  };

  // Canvas Animation: 60fps Bunch Crossing and Crabbing Overlap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (isPlaying) {
        animTimeRef.current += 0.04;
      }
      const t = animTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // 1. Vacuum Chamber & Coordinate Axis
      ctx.fillStyle = '#060B14';
      ctx.fillRect(0, 0, w, h);

      // Interaction Point marker (IP1 / IP5)
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, 15);
      ctx.lineTo(cx, h - 15);
      ctx.moveTo(20, cy);
      ctx.lineTo(w - 20, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('IP (COLLISION POINT)', cx, 18);

      // Crab Cavity Glyphs upstream
      ctx.strokeStyle = '#FFB020';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(60, cy - 30, 25, 60);
      ctx.strokeRect(w - 85, cy - 30, 25, 60);
      ctx.fillStyle = '#FFB020';
      ctx.font = '8px monospace';
      ctx.fillText('CRAB', 72, cy - 34);
      ctx.fillText('CRAB', w - 73, cy - 34);

      // 2. Bunch Trajectories & Collision Geometry
      // Beam 1 travels left to right at angle +halfAngle
      // Beam 2 travels right to left at angle -halfAngle
      const halfAngleVis = (crossingAngle_urad / 500) * 0.18; // Visually scaled crossing angle
      const crabTiltVis = (crabVoltageMV / 3.4) * 0.09; // Bunch rotation tilt (0.09 rad visual compensation at 3.4 MV)

      // Bunch phase along trajectory: loops between -200 and +200 px from IP
      const travelDist = 180;
      const progress = (t * 50) % (travelDist * 2);
      const pos1 = progress - travelDist; // x position of Beam 1 relative to IP
      const pos2 = -pos1; // x position of Beam 2 relative to IP

      const bunchLengthVis = 45 * (bunchLengthCm / 7.55);
      const bunchHeightVis = 14;

      // Beam 1 Bunch (Cyan - Moving Right)
      ctx.save();
      const b1X = cx + pos1;
      const b1Y = cy + pos1 * Math.tan(halfAngleVis);
      ctx.translate(b1X, b1Y);
      // Rotation angle: trajectory angle minus crab compensation tilt
      ctx.rotate(halfAngleVis - crabTiltVis);

      const grad1 = ctx.createRadialGradient(0, 0, 2, 0, 0, bunchLengthVis / 2);
      grad1.addColorStop(0, '#00E5FF');
      grad1.addColorStop(0.6, 'rgba(0, 229, 255, 0.4)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.ellipse(0, 0, bunchLengthVis / 2, bunchHeightVis / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Beam 2 Bunch (Magenta - Moving Left)
      ctx.save();
      const b2X = cx + pos2;
      const b2Y = cy - pos2 * Math.tan(halfAngleVis);
      ctx.translate(b2X, b2Y);
      // Rotation angle: trajectory angle minus crab compensation tilt
      ctx.rotate(-halfAngleVis + crabTiltVis);

      const grad2 = ctx.createRadialGradient(0, 0, 2, 0, 0, bunchLengthVis / 2);
      grad2.addColorStop(0, '#FF0055');
      grad2.addColorStop(0.6, 'rgba(255, 0, 85, 0.4)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.ellipse(0, 0, bunchLengthVis / 2, bunchHeightVis / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Collision Overlap Luminosity Flash at IP
      const overlapDist = Math.abs(pos1);
      if (overlapDist < bunchLengthVis / 2) {
        const overlapFactor = 1.0 - overlapDist / (bunchLengthVis / 2);
        const flashIntensity = overlapFactor * physics.F_eff;

        ctx.fillStyle = `rgba(255, 230, 0, ${flashIntensity * 0.75})`;
        ctx.shadowColor = '#FFE600';
        ctx.shadowBlur = 20 * flashIntensity;
        ctx.beginPath();
        ctx.arc(cx, cy, 14 * flashIntensity + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collision Sparks
        const numSparks = Math.floor(flashIntensity * 8);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        for (let s = 0; s < numSparks; s++) {
          const sparkAngle = (s * Math.PI * 2) / numSparks + t * 4;
          const sparkLen = 10 * flashIntensity + 5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(sparkAngle) * sparkLen, cy + Math.sin(sparkAngle) * sparkLen);
          ctx.stroke();
        }
      }

      // 4. Overlap Geometry State Label in Bottom Corner
      ctx.fillStyle = physics.F_eff > 0.85 ? '#00FF66' : physics.F_eff > 0.5 ? '#FFE600' : '#FF0055';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        physics.F_eff > 0.85
          ? '✓ FULL HEAD-ON CRABBING COLLISION'
          : physics.F_eff > 0.5
          ? '⚠ PARTIAL CRABBING OVERLAP'
          : '✗ SEVERE PIWINSKI ANGLE LOSS',
        20,
        h - 18
      );

      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'right';
      ctx.fillText(`Piwinski: Φ = ${physics.Piwinski_eff.toFixed(2)} | F = ${physics.F_eff.toFixed(2)}`, w - 20, h - 18);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [crossingAngle_urad, crabVoltageMV, bunchLengthCm, physics, isPlaying]);

  // Export JSON Scenario
  const exportJson = () => {
    const data = {
      experiment: 'HL-LHC Crab Cavity & Bunch Rotation Simulator',
      timestamp: new Date().toISOString(),
      parameters: {
        crossingAngle_urad: crossingAngle_urad,
        crabCavityVoltage_MV: crabVoltageMV,
        bunchLength_cm: bunchLengthCm,
        ipBeamSpotSize_um: beamSizeStarUm,
        bunchIntensityE11: bunchIntensityE11,
      },
      results: {
        uncrabbedPiwinskiAngle: physics.Piwinski_0,
        uncrabbedReductionFactorF: physics.F_0,
        crabInducedAngle_urad: physics.crabAngle_urad,
        effectivePiwinskiAngle: physics.Piwinski_eff,
        effectiveReductionFactorF: physics.F_eff,
        luminosityGainPct: physics.lumiGainPct,
        peakLuminosity_e34: physics.peakLuminosity_e34,
      },
      fidelity: 'ANALYTIC',
      source: 'HL-LHC Technical Design Report (CERN-2020-010) & Crab Cavity Physics (PRAB 2021)',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crab_cavity_simulation_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCsv = () => {
    let csv = 'crab_voltage_MV,effective_piwinski,luminosity_factor_F,peak_luminosity_e34\n';
    for (let v = 0.0; v <= 4.5; v += 0.25) {
      const crabAng = (250e-6) * (v / 3.4);
      const effAngle = Math.abs((crossingAngle_urad * 1e-6) - 2.0 * crabAng);
      const piw = (effAngle * bunchLengthCm * 0.01) / (2.0 * beamSizeStarUm * 1e-6);
      const f = 1.0 / Math.sqrt(1.0 + piw * piw);
      const lum = 7.5 * f * Math.pow(bunchIntensityE11 / 2.2, 2);
      csv += `${v.toFixed(2)},${piw.toFixed(3)},${f.toFixed(4)},${lum.toFixed(3)}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crab_cavity_sweep_${Date.now()}.csv`;
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
              /// HL-LHC: Crab Cavity &amp; Bunch Rotation Simulator ///
            </h3>
            <FidelityBadge
              type="ANALYTIC"
              formula="F = \frac{1}{\sqrt{1 + \Phi^2}}, \quad \Phi = \frac{\theta_c \sigma_z}{2\sigma^*} \implies V_{\text{crab}} \approx 3.4\text{ MV} \to F \approx 1.0"
            />
          </div>
          <p className="text-xs text-text-secondary font-mono mt-1">
            Transverse RF deflecting cavities compensating the 500 &mu;rad crossing angle to maximize geometric bunch overlap and restore HL-LHC peak luminosity.
          </p>
        </div>

        {/* Play/Pause Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 bg-cern-blue hover:bg-cern-accent text-white font-bold uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE BUNCHES' : 'RESUME BUNCHES'}</span>
          </button>
        </div>
      </div>

      {/* Presets Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-text-muted font-bold mr-1">PRESETS:</span>
        <button
          onClick={() => applyPreset('nominal')}
          className="px-3 py-1 bg-canvas-sub text-cern-cyan hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#00E5FF] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          HL-LHC Full Crabbing (V = 3.4 MV, F &asymp; 1.0)
        </button>
        <button
          onClick={() => applyPreset('uncrabbed')}
          className="px-3 py-1 bg-canvas-sub text-red-300 hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#FF0055] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Uncompensated Crossing (V = 0 MV, 63% Lost)
        </button>
        <button
          onClick={() => applyPreset('zero_angle')}
          className="px-3 py-1 bg-canvas-sub text-white hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#000] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Zero Crossing Angle (&theta;_c = 0)
        </button>
        <button
          onClick={() => applyPreset('over_crabbed')}
          className="px-3 py-1 bg-canvas-sub text-amber-300 hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#FFE600] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Over-Rotated (V = 4.2 MV)
        </button>
      </div>

      {/* Main Grid: Controls (4 cols) + Visualizer & Metrics (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sliders Deck */}
        <div className="lg:col-span-4 bg-canvas-sub p-4 border-3 border-black shadow-[5px_5px_0px_#000] space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <span className="font-bold text-white uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cern-cyan" />
              Crab Cavity &amp; Beam Knobs
            </span>
            <span className="text-[10px] text-cern-cyan font-bold">400.79 MHz RF</span>
          </div>

          {/* Slider 1: Deflecting Crab Voltage */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Crab Deflecting Voltage:</span>
              <span
                className={`font-bold ${
                  crabVoltageMV >= 3.2 && crabVoltageMV <= 3.6
                    ? 'text-emerald-400'
                    : crabVoltageMV === 0
                    ? 'text-red-400'
                    : 'text-amber-300'
                }`}
              >
                {crabVoltageMV.toFixed(2)} MV
              </span>
            </div>
            <input
              type="range"
              min={0.0}
              max={4.5}
              step={0.05}
              value={crabVoltageMV}
              onChange={(e) => setCrabVoltageMV(Number(e.target.value))}
              className="w-full cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>0 MV (No Tilt)</span>
              <span>3.4 MV (Optimal)</span>
              <span>4.5 MV</span>
            </div>
          </div>

          {/* Slider 2: Full Crossing Angle theta_c */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Crossing Angle (&theta;_c):</span>
              <span className="text-cern-cyan font-bold">{crossingAngle_urad} &mu;rad</span>
            </div>
            <input
              type="range"
              min={0}
              max={600}
              step={10}
              value={crossingAngle_urad}
              onChange={(e) => setCrossingAngle_urad(Number(e.target.value))}
              className="w-full cursor-pointer accent-cern-cyan"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>0 &mu;rad (Parasitic Risk)</span>
              <span>500 &mu;rad (HL-LHC)</span>
              <span>600 &mu;rad</span>
            </div>
          </div>

          {/* Slider 3: Bunch Length sigma_z */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Bunch Length (&sigma;_z):</span>
              <span className="text-white font-bold">{bunchLengthCm.toFixed(2)} cm</span>
            </div>
            <input
              type="range"
              min={5.0}
              max={10.0}
              step={0.1}
              value={bunchLengthCm}
              onChange={(e) => setBunchLengthCm(Number(e.target.value))}
              className="w-full cursor-pointer accent-white"
            />
            <span className="text-[10px] text-text-muted block">
              Longitudinal RMS Gaussian spread
            </span>
          </div>

          {/* Slider 4: IP Transverse Spot Size sigma* */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">IP Spot Size (&sigma;*):</span>
              <span className="text-amber-300 font-bold">{beamSizeStarUm.toFixed(1)} &mu;m</span>
            </div>
            <input
              type="range"
              min={5.0}
              max={20.0}
              step={0.5}
              value={beamSizeStarUm}
              onChange={(e) => setBeamSizeStarUm(Number(e.target.value))}
              className="w-full cursor-pointer accent-amber-300"
            />
            <span className="text-[10px] text-text-muted block">
              &beta;* = 15 cm insertion optics limit
            </span>
          </div>

          {/* Bunch Population Slider */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Intensity (N_b):</span>
              <span className="text-white font-bold">{bunchIntensityE11.toFixed(2)} &times; 10¹¹</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={2.5}
              step={0.05}
              value={bunchIntensityE11}
              onChange={(e) => setBunchIntensityE11(Number(e.target.value))}
              className="w-full cursor-pointer accent-white"
            />
          </div>
        </div>

        {/* Right Visualizer & Metrics (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Luminosity Factor (F)</span>
              <span className="text-xl font-bold text-cern-cyan">
                {(physics.F_eff * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                Uncrabbed: {(physics.F_0 * 100).toFixed(1)}%
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Piwinski Angle (&Phi;)</span>
              <span className="text-xl font-bold text-amber-300">
                {physics.Piwinski_eff.toFixed(2)}
              </span>
              <span className="text-[10px] text-amber-300 block mt-0.5 font-bold">
                Original: {physics.Piwinski_0.toFixed(2)}
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Peak Luminosity</span>
              <span className="text-xl font-bold text-emerald-400">
                {physics.peakLuminosity_e34.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">
                &times; 10³⁴ cm⁻² s⁻¹
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Crabbing Gain</span>
              <span className="text-xl font-bold text-white">
                +{physics.lumiGainPct.toFixed(0)}%
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                vs uncrabbed crossing
              </span>
            </div>
          </div>

          {/* Interactive Animation Canvas: Colliding Tilted Bunches */}
          <div className="bg-canvas-sub p-4 border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cern-cyan" />
                HL-LHC Interaction Region (IP1 / IP5) Bunch Crossing Display
              </span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-cern-cyan font-bold">• Beam 1 (Rightward)</span>
                <span className="text-cern-magenta font-bold">• Beam 2 (Leftward)</span>
              </div>
            </div>

            <div className="relative w-full h-56 bg-black border-2 border-black overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={650}
                height={220}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Explanatory Callout */}
            <div className="p-3 bg-canvas-surface border-2 border-black grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-text-muted text-[10px] block uppercase font-bold">
                  Piwinski Angle Compensation Mechanism:
                </span>
                <p className="text-[11px] text-text-secondary leading-normal">
                  Without crab cavities, bunches cross diagonally like scissors, wasting &gt;60% of collision potential in trailing tails.
                </p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-text-muted text-[10px] block uppercase font-bold">
                  RF Cavity Technology:
                </span>
                <p className="text-[11px] text-cern-cyan leading-normal">
                  Double Quarter Wave (DQW) for ATLAS &bull; RF Dipole (RFD) for CMS operating at 400.79 MHz in superfluid He at 2 Kelvin.
                </p>
              </div>
            </div>
          </div>

          {/* Export Deck */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-black text-xs font-mono">
            <span className="text-text-muted text-[11px]">
              Analytic HL-LHC Crab Cavity &amp; Beam-Beam Overlap Model
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
