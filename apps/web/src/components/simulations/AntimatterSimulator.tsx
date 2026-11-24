'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import {
  Atom,
  RotateCcw,
  Download,
  Play,
  Pause,
  Info,
  Sliders,
  Sparkles,
  Activity,
  ArrowDown,
  ArrowUp,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface AnnihilationVertex {
  id: number;
  z: number; // -0.25 to +0.25 meters
  r: number;
  timeMs: number;
  isBottom: boolean;
  wallSide: 'left' | 'right';
}

interface ParticleTrack {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  age: number;
}

export function AntimatterSimulator() {
  // Mode: 'drop' (ALPHA-g Gravitational Drop) | 'lifecycle' (AD/ELENA Factory Pipeline)
  const [activeView, setActiveView] = useState<'drop' | 'lifecycle'>('drop');

  // ALPHA-g Physical Parameters
  const [deltaB_uT, setDeltaB_uT] = useState<number>(0.0); // Magnetic balance bias in microTesla (-50 to +50 uT)
  const [temperatureK, setTemperatureK] = useState<number>(0.5); // Antihydrogen temperature (0.1 to 1.2 K)
  const [gravityRatio, setGravityRatio] = useState<number>(1.0); // a_g / g (1.0 = standard downward, 0.0 = zero-g, -1.0 = antigravity)
  const [rampSpeed, setRampSpeed] = useState<number>(1.0); // Release ramp speed multiplier (0.5x to 2x)
  const [isRamping, setIsRamping] = useState<boolean>(false);
  const [rampProgress, setRampProgress] = useState<number>(0); // 0% (trapped) to 100% (fully released)

  // Annihilation Events & Detector Tracking
  const [annihilations, setAnnihilations] = useState<AnnihilationVertex[]>([]);
  const activeTracksRef = useRef<ParticleTrack[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Deceleration Pipeline Stage (for lifecycle view)
  const [pipelineStage, setPipelineStage] = useState<number>(2); // 0=PS, 1=AD, 2=ELENA, 3=Penning Trap, 4=ALPHA-g

  // Theoretical escape probabilities according to Nature 2023 ALPHA-g model:
  // Barrier height difference: Delta U = m_Hbar * a_g * Delta_z - mu_B * Delta_B
  // Delta_z ≈ 0.256 m (ALPHA-g trap length between upper and lower balance coils)
  // mu_B ≈ 5.788e-5 eV/T = 9.274e-24 J/T = 0.6717 Kelvin / Tesla
  // For Delta B in uT: mu_B * Delta B [K] = 0.6717 * (Delta B * 1e-6) K = 6.717e-7 K per uT
  // Gravity potential: m_Hbar * g * Delta_z ≈ 1.673e-27 * 9.81 * 0.256 J ≈ 4.20e-27 J ≈ 0.304 mK
  const theory = useMemo(() => {
    const k_B = 1.380649e-23;
    const m_H = 1.6737236e-27;
    const g0 = 9.80665;
    const deltaZ = 0.256; // meters between coils

    // Gravitational potential energy difference
    const deltaU_grav_J = m_H * (gravityRatio * g0) * deltaZ;
    // Magnetic potential difference: mu_B * Delta B
    const mu_B = 9.27401e-24; // J/T
    const deltaU_mag_J = mu_B * (deltaB_uT * 1e-6);

    // Net bias in Kelvins
    const deltaU_net_K = (deltaU_grav_J - deltaU_mag_J) / k_B;

    // Logistic escape fraction to bottom (standard Boltzmann ratio)
    // f_bottom = 1 / (1 + exp(-deltaU_net / (alpha * T)))
    const alpha_eff = 0.00085; // Empirical scaling accounting for mirror ratio ramp dynamics
    const exponent = Math.max(-10, Math.min(10, deltaU_net_K / (alpha_eff * temperatureK)));
    const f_bottom_theory = 1 / (1 + Math.exp(-exponent));

    // Zero-bias nulling magnetic field: Delta B required to cancel gravity:
    // mu_B * Delta B_null = m_H * g * Delta z
    const deltaB_null_uT = (deltaU_grav_J / mu_B) * 1e6;

    return {
      f_bottom_theory,
      deltaB_null_uT,
      deltaU_net_K,
    };
  }, [deltaB_uT, temperatureK, gravityRatio]);

  // Presets
  const applyPreset = (preset: 'standard' | 'null' | 'upward' | 'antigravity') => {
    setIsRamping(false);
    setRampProgress(0);
    setAnnihilations([]);
    if (preset === 'standard') {
      setDeltaB_uT(0);
      setGravityRatio(1.0);
      setTemperatureK(0.5);
    } else if (preset === 'null') {
      setDeltaB_uT(453.1); // Balances standard downward gravity (m_H * g * dz / mu_B = 453.1 uT)
      setGravityRatio(1.0);
      setTemperatureK(0.5);
    } else if (preset === 'upward') {
      setDeltaB_uT(550.0);
      setGravityRatio(1.0);
      setTemperatureK(0.5);
    } else if (preset === 'antigravity') {
      setDeltaB_uT(0);
      setGravityRatio(-1.0); // Hypothetical repulsive gravity
      setTemperatureK(0.5);
    }
  };

  // Launch Release Ramp
  const startRamp = () => {
    setIsRamping(true);
    setRampProgress(0);
    setAnnihilations([]);
    activeTracksRef.current = [];
  };

  // Reset
  const resetSimulator = () => {
    setIsRamping(false);
    setRampProgress(0);
    setAnnihilations([]);
    activeTracksRef.current = [];
  };

  // Animation Loop for Trapped Atoms & Annihilation Flash Tracks
  useEffect(() => {
    if (!isRamping) return;

    const interval = setInterval(() => {
      setRampProgress((prev) => {
        const next = prev + 1.2 * rampSpeed;
        if (next >= 100) {
          setIsRamping(false);
          return 100;
        }

        // Generate 1 to 3 antihydrogen escapes per step
        const newEvents: AnnihilationVertex[] = [];
        const numToRelease = Math.random() < 0.7 ? 1 : 2;

        for (let i = 0; i < numToRelease; i++) {
          const isBottom = Math.random() < theory.f_bottom_theory;
          // Annihilation z location in meters:
          // Top half: 0.02 to 0.24 m, Bottom half: -0.24 to -0.02 m
          const zBase = isBottom
            ? -0.24 + Math.random() * 0.16
            : 0.08 + Math.random() * 0.16;
          const r = 0.022; // trap wall radius in meters
          const wallSide = Math.random() < 0.5 ? 'left' : 'right';

          const vertex: AnnihilationVertex = {
            id: Date.now() + Math.random(),
            z: zBase,
            r,
            timeMs: next * 200,
            isBottom,
            wallSide,
          };
          newEvents.push(vertex);

          // Exact wall coordinates on canvas: cx = 150, cy = 160, chamberW = 60, chamberH = 260
          const wallX = wallSide === 'left' ? 120 : 180;
          const wallY = 160 - zBase * 520;

          // Generate 3-5 pion tracks radiating outward from the vertex into detectors
          const numPions = 3 + Math.floor(Math.random() * 3);
          for (let p = 0; p < numPions; p++) {
            const baseAngle = wallSide === 'left' ? Math.PI : 0;
            const angle = baseAngle + (Math.random() - 0.5) * 1.6;
            const length = 20 + Math.random() * 32;
            activeTracksRef.current.push({
              startX: wallX,
              startY: wallY,
              endX: wallX + Math.cos(angle) * length,
              endY: wallY + Math.sin(angle) * length,
              color: Math.random() > 0.4 ? '#00E5FF' : '#FF0055',
              age: 0,
            });
          }
        }

        if (newEvents.length > 0) {
          setAnnihilations((current) => [...current, ...newEvents]);
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRamping, rampSpeed, theory.f_bottom_theory]);

  // Canvas Rendering for ALPHA-g Vacuum Cryostat Chamber
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;

      // 1. Vacuum Chamber Wall
      const chamberW = 60;
      const chamberTop = 30;
      const chamberBottom = h - 30;
      const chamberH = chamberBottom - chamberTop;

      // Outer cryostat shading
      ctx.fillStyle = '#060B14';
      ctx.fillRect(0, 0, w, h);

      // Vacuum cylinder tube
      const grad = ctx.createLinearGradient(cx - chamberW / 2, 0, cx + chamberW / 2, 0);
      grad.addColorStop(0, '#0D172A');
      grad.addColorStop(0.5, '#1E293B');
      grad.addColorStop(1, '#0D172A');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - chamberW / 2, chamberTop, chamberW, chamberH);

      // Cylinder outline
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - chamberW / 2, chamberTop, chamberW, chamberH);

      // 2. Superconducting Coils (Upper & Lower Mirror Coils)
      // Top Coil
      ctx.fillStyle = '#FFB020';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.fillRect(cx - chamberW / 2 - 12, chamberTop + 15, chamberW + 24, 16);
      ctx.strokeRect(cx - chamberW / 2 - 12, chamberTop + 15, chamberW + 24, 16);
      // Bottom Coil
      ctx.fillStyle = '#FFB020';
      ctx.fillRect(cx - chamberW / 2 - 12, chamberBottom - 31, chamberW + 24, 16);
      ctx.strokeRect(cx - chamberW / 2 - 12, chamberBottom - 31, chamberW + 24, 16);

      // Labels on coils
      ctx.fillStyle = '#000';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TOP COIL', cx, chamberTop + 26);
      ctx.fillText('BOTTOM COIL', cx, chamberBottom - 20);

      // 3. Center line & Gravity Vector
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, chamberTop);
      ctx.lineTo(cx, chamberBottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Gravity Arrow
      ctx.fillStyle = '#00FF66';
      ctx.strokeStyle = '#00FF66';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(gravityRatio >= 0 ? 'g ↓' : 'g ↑', cx - 45, h / 2);
      ctx.beginPath();
      if (gravityRatio >= 0) {
        ctx.moveTo(cx - 45, h / 2 + 6);
        ctx.lineTo(cx - 45, h / 2 + 24);
        ctx.lineTo(cx - 48, h / 2 + 18);
        ctx.moveTo(cx - 45, h / 2 + 24);
        ctx.lineTo(cx - 42, h / 2 + 18);
      } else {
        ctx.moveTo(cx - 45, h / 2 - 6);
        ctx.lineTo(cx - 45, h / 2 - 24);
        ctx.lineTo(cx - 48, h / 2 - 18);
        ctx.moveTo(cx - 45, h / 2 - 24);
        ctx.lineTo(cx - 42, h / 2 - 18);
      }
      ctx.stroke();

      // 4. Trapped Antihydrogen Cloud (if not fully released)
      if (rampProgress < 100) {
        const remainingFraction = 1 - rampProgress / 100;
        const numDots = Math.floor(remainingFraction * 40);
        ctx.fillStyle = '#FF0055';
        for (let i = 0; i < numDots; i++) {
          const t = Date.now() * 0.003 + i * 1.3;
          const px = cx + Math.sin(t * 1.5 + i) * (chamberW * 0.35);
          const py =
            h / 2 +
            Math.cos(t + i) * (chamberH * 0.28 * remainingFraction) +
            (gravityRatio * 15 * (1 - remainingFraction)); // Gravity sag
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Draw & Animate Active Pion Starburst Tracks
      activeTracksRef.current.forEach((tr) => {
        tr.age += 1;
        const alpha = Math.max(0, 1 - tr.age / 22);

        // Expanding vertex flash halo
        ctx.strokeStyle = `rgba(255, 230, 0, ${alpha * 0.9})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(tr.startX, tr.startY, 2 + (tr.age / 22) * 8, 0, Math.PI * 2);
        ctx.stroke();

        // Pion track trajectory line
        ctx.strokeStyle = tr.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tr.startX, tr.startY);
        ctx.lineTo(tr.endX, tr.endY);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      });
      activeTracksRef.current = activeTracksRef.current.filter((tr) => tr.age < 22);

      // 6. Draw Recorded Vertex Markers along chamber cylinder walls
      annihilations.slice(-80).forEach((ev) => {
        const vy = h / 2 - ev.z * (chamberH / 0.5);
        ctx.fillStyle = ev.isBottom ? '#FF0055' : '#00E5FF';
        ctx.beginPath();
        ctx.arc(cx + (ev.wallSide === 'left' ? -chamberW / 2 : chamberW / 2), vy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [rampProgress, annihilations, gravityRatio]);

  // Statistical Reconstruction of a_g / g
  const totalAnnihilations = annihilations.length;
  const bottomCount = annihilations.filter((a) => a.isBottom).length;
  const topCount = totalAnnihilations - bottomCount;
  const observedBottomFrac = totalAnnihilations > 0 ? bottomCount / totalAnnihilations : 0.5;

  // Reconstructed a_g / g estimate:
  // Using linear approximation near balance: Delta f = f_b - 0.5 ≈ (a_g/g) * 0.25 - Delta_B * 0.025
  const reconstructedAgRatio = useMemo(() => {
    if (totalAnnihilations < 10) return null;
    // Solve f_b = 1 / (1 + exp(-[a_g * g * dz - mu_B * dB] / (alpha * T)))
    const f_clamped = Math.max(0.05, Math.min(0.95, observedBottomFrac));
    const deltaU_est = -Math.log(1 / f_clamped - 1) * 0.00085 * temperatureK;
    const mu_B = 9.27401e-24;
    const k_B = 1.380649e-23;
    const m_H = 1.6737236e-27;
    const g0 = 9.80665;
    const dz = 0.256;

    const deltaU_grav_est_J = deltaU_est * k_B + mu_B * (deltaB_uT * 1e-6);
    const ag_over_g = deltaU_grav_est_J / (m_H * g0 * dz);
    const statError = 1.0 / Math.sqrt(totalAnnihilations);

    return {
      ratio: ag_over_g,
      error: statError,
      compatibleWithSM: Math.abs(ag_over_g - 1.0) < 2 * statError,
    };
  }, [totalAnnihilations, observedBottomFrac, temperatureK, deltaB_uT]);

  // Export JSON Scenario
  const exportJson = () => {
    const data = {
      experiment: 'CERN ALPHA-g Gravitational Drop Experiment',
      timestamp: new Date().toISOString(),
      parameters: {
        magneticBiasDeltaB_uT: deltaB_uT,
        trapTemperatureK: temperatureK,
        trueGravityRatio: gravityRatio,
        rampSpeed: rampSpeed,
      },
      results: {
        totalAnnihilations,
        bottomEscapes: bottomCount,
        topEscapes: topCount,
        observedBottomFraction: observedBottomFrac,
        theoreticalBottomFraction: theory.f_bottom_theory,
        reconstructedAgOverG: reconstructedAgRatio ? reconstructedAgRatio.ratio : null,
        statisticalUncertainty: reconstructedAgRatio ? reconstructedAgRatio.error : null,
      },
      nature2023Benchmark: {
        publishedRatio: 0.75,
        statPlusSystError: 0.13,
        simulationError: 0.16,
        conclusion: 'Gravitational acceleration of antihydrogen is consistent with standard g within errors.',
      },
      fidelity: 'ANALYTIC + MONTE CARLO',
      source: 'ALPHA Collaboration, Nature 621, 716-722 (2023)',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alphag_gravity_drop_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCsv = () => {
    let csv = 'event_id,z_vertex_m,time_ms,exit_direction\n';
    annihilations.forEach((ev) => {
      csv += `${ev.id},${ev.z.toFixed(4)},${ev.timeMs.toFixed(1)},${ev.isBottom ? 'BOTTOM' : 'TOP'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alphag_vertices_${Date.now()}.csv`;
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
              /// Antimatter Factory: AD / ELENA &amp; ALPHA-g Gravitational Drop ///
            </h3>
            <FidelityBadge
              type="ANALYTIC"
              formula="U(z) = \mu_B B(z) + m_{\bar{H}} a_g z \implies f_{\text{down}} = \frac{1}{1 + e^{-\Delta U / k_B T}}"
            />
          </div>
          <p className="text-xs text-text-secondary font-mono mt-1">
            Antiproton deceleration (5.3 MeV &rarr; 100 keV in ELENA), Penning-Malmberg neutral trapping, and ALPHA-g 2023 gravitational free fall.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveView('drop')}
            className={`px-3 py-1.5 border-2 border-black font-bold uppercase transition-all ${
              activeView === 'drop'
                ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
                : 'bg-canvas-sub text-text-muted hover:text-white'
            }`}
          >
            ALPHA-g Gravitational Drop
          </button>
          <button
            onClick={() => setActiveView('lifecycle')}
            className={`px-3 py-1.5 border-2 border-black font-bold uppercase transition-all ${
              activeView === 'lifecycle'
                ? 'bg-cern-magenta text-white shadow-[2px_2px_0px_#000]'
                : 'bg-canvas-sub text-text-muted hover:text-white'
            }`}
          >
            AD / ELENA Pipeline
          </button>
        </div>
      </div>

      {activeView === 'drop' ? (
        <>
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-text-muted font-bold mr-1">PRESETS:</span>
            <button
              onClick={() => applyPreset('standard')}
              className="px-3 py-1 bg-canvas-sub text-white hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#000] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              Standard Downward Gravity (&Delta;B = 0)
            </button>
            <button
              onClick={() => applyPreset('null')}
              className="px-3 py-1 bg-canvas-sub text-cern-cyan hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#00E5FF] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              Gravity Nulling (&Delta;B = +453.1 &mu;T)
            </button>
            <button
              onClick={() => applyPreset('upward')}
              className="px-3 py-1 bg-canvas-sub text-amber-300 hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#FFE600] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              Upward Bias (&Delta;B = +550 &mu;T)
            </button>
            <button
              onClick={() => applyPreset('antigravity')}
              className="px-3 py-1 bg-red-950 text-red-300 hover:bg-red-900 border-2 border-black shadow-[2px_2px_0px_#FF0055] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              Hypothetical Repulsive Antigravity (a_g = -g)
            </button>
          </div>

          {/* Main Simulation Viewport: Controls (4 cols) + Visualizer & Statistics (8 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls Deck */}
            <div className="lg:col-span-4 bg-canvas-sub p-4 border-3 border-black shadow-[5px_5px_0px_#000] space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <span className="font-bold text-white uppercase flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cern-cyan" />
                  ALPHA-g Magnetic Balance
                </span>
                <span className="text-[10px] text-cern-cyan font-bold">Nature (2023)</span>
              </div>

              {/* Slider 1: Magnetic Balance Bias Delta B */}
              <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-bold">Balance Bias (&Delta;B):</span>
                  <span className="text-cern-cyan font-bold">
                    {deltaB_uT > 0 ? `+${deltaB_uT.toFixed(1)}` : deltaB_uT.toFixed(1)} &mu;T
                  </span>
                </div>
                <input
                  type="range"
                  min={-600}
                  max={600}
                  step={1}
                  value={deltaB_uT}
                  onChange={(e) => setDeltaB_uT(Number(e.target.value))}
                  className="w-full cursor-pointer accent-cern-cyan"
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>-600 &mu;T (Down)</span>
                  <span>0 &mu;T (1g)</span>
                  <span>+453 &mu;T (0g)</span>
                  <span>+600 &mu;T (Up)</span>
                </div>
              </div>

              {/* Slider 2: Trap Temperature */}
              <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-bold">Antihydrogen Temp:</span>
                  <span className="text-white font-bold">{temperatureK.toFixed(2)} K</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.2}
                  step={0.05}
                  value={temperatureK}
                  onChange={(e) => setTemperatureK(Number(e.target.value))}
                  className="w-full cursor-pointer accent-cern-yellow"
                />
                <span className="text-[10px] text-text-muted block">
                  Cold mixing Penning-Malmberg state (~0.5 K)
                </span>
              </div>

              {/* Slider 3: Gravity Ratio (Physical vs Hypothetical) */}
              <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-bold">True a_g / g:</span>
                  <span
                    className={`font-bold ${
                      gravityRatio > 0
                        ? 'text-emerald-400'
                        : gravityRatio === 0
                        ? 'text-yellow-400'
                        : 'text-cern-magenta'
                    }`}
                  >
                    {gravityRatio.toFixed(2)} g
                  </span>
                </div>
                <input
                  type="range"
                  min={-1.0}
                  max={1.5}
                  step={0.1}
                  value={gravityRatio}
                  onChange={(e) => setGravityRatio(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-400"
                />
                <span className="text-[10px] text-text-muted block">
                  1.0 = Normal gravity, -1.0 = Repulsive antigravity
                </span>
              </div>

              {/* Execution Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={startRamp}
                  disabled={isRamping}
                  className="w-full py-2.5 bg-cern-blue hover:bg-cern-accent disabled:opacity-50 text-white font-bold uppercase border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 text-cern-cyan fill-current" />
                  <span>{isRamping ? `Releasing Trap (${rampProgress.toFixed(0)}%)` : 'Run Trap Release Ramp'}</span>
                </button>

                <button
                  onClick={resetSimulator}
                  className="w-full py-1.5 bg-canvas-surface hover:bg-canvas-raised text-text-secondary hover:text-white font-bold uppercase border-2 border-black shadow-[2px_2px_0px_#000] transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset / Clear Events</span>
                </button>
              </div>

              {/* Theoretical Prediction Card */}
              <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-text-muted block">
                  Closed-Form Theory:
                </span>
                <div className="flex justify-between">
                  <span className="text-text-muted">Expected Bottom %:</span>
                  <span className="font-bold text-white">
                    {(theory.f_bottom_theory * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Expected Top %:</span>
                  <span className="font-bold text-white">
                    {((1 - theory.f_bottom_theory) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Nulling Field (&Delta;B_0):</span>
                  <span className="font-bold text-cern-cyan">
                    +{theory.deltaB_null_uT.toFixed(1)} &mu;T
                  </span>
                </div>
              </div>
            </div>

            {/* Right Visualizer & Data HUD (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
                  <span className="text-text-muted block text-[10px] uppercase font-bold">Total Annihilations</span>
                  <span className="text-xl font-bold text-white">{totalAnnihilations}</span>
                  <span className="text-[10px] text-text-muted block mt-0.5">
                    Vertices recorded
                  </span>
                </div>

                <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
                  <span className="text-text-muted block text-[10px] uppercase font-bold flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 text-cern-magenta" /> Bottom Escapes
                  </span>
                  <span className="text-xl font-bold text-cern-magenta">{bottomCount}</span>
                  <span className="text-[10px] text-cern-magenta block mt-0.5 font-bold">
                    {(observedBottomFrac * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
                  <span className="text-text-muted block text-[10px] uppercase font-bold flex items-center gap-1">
                    <ArrowUp className="w-3 h-3 text-cern-cyan" /> Top Escapes
                  </span>
                  <span className="text-xl font-bold text-cern-cyan">{topCount}</span>
                  <span className="text-[10px] text-cern-cyan block mt-0.5 font-bold">
                    {totalAnnihilations > 0 ? (((topCount) / totalAnnihilations) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>

                <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
                  <span className="text-text-muted block text-[10px] uppercase font-bold">Reconstructed a_g / g</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {reconstructedAgRatio ? `${reconstructedAgRatio.ratio.toFixed(2)}` : '—'}
                  </span>
                  <span className="text-[10px] text-text-muted block mt-0.5">
                    {reconstructedAgRatio ? `± ${reconstructedAgRatio.error.toFixed(2)} (1σ)` : 'Need ≥10 events'}
                  </span>
                </div>
              </div>

              {/* Main Visualizer: ALPHA-g Chamber + Vertex Histogram */}
              <div className="bg-canvas-sub p-4 border-2 border-black shadow-[4px_4px_0px_#000] grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* 2D Canvas of ALPHA-g Vertical Trap (7 cols) */}
                <div className="md:col-span-7 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between pb-2 mb-2 border-b-2 border-black text-[11px] font-mono">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-cern-magenta" />
                      ALPHA-g Vertical Cryostat (25 cm)
                    </span>
                    <span className="text-text-muted font-bold">Pion Starbursts</span>
                  </div>

                  <div className="relative w-full h-80 bg-black border-2 border-black overflow-hidden flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={320}
                      className="w-full h-full object-contain"
                    />

                    {/* Overlay badge when ramping */}
                    {isRamping && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 border border-cern-cyan text-cern-cyan text-[10px] font-mono font-bold animate-pulse">
                        RAMPING DOWN COILS
                      </div>
                    )}
                  </div>
                </div>

                {/* Vertex Height Histogram dN/dz (5 cols) */}
                <div className="md:col-span-5 flex flex-col justify-between space-y-3 font-mono text-xs">
                  <div className="w-full pb-2 border-b-2 border-black text-[11px]">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cern-cyan" />
                      Silicon Vertex Detector dN/dz
                    </span>
                  </div>

                  {/* Vertical bins representation */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                    {[
                      { label: '+20 to +25 cm (Top Mirror)', count: annihilations.filter(a => a.z > 0.15).length, color: 'bg-cern-cyan' },
                      { label: '+10 to +15 cm (Upper Barrel)', count: annihilations.filter(a => a.z > 0.05 && a.z <= 0.15).length, color: 'bg-sky-500' },
                      { label: '0 to +5 cm (Midplane Top)', count: annihilations.filter(a => a.z > 0.0 && a.z <= 0.05).length, color: 'bg-blue-600' },
                      { label: '-5 to 0 cm (Midplane Bottom)', count: annihilations.filter(a => a.z >= -0.05 && a.z <= 0.0).length, color: 'bg-pink-600' },
                      { label: '-15 to -10 cm (Lower Barrel)', count: annihilations.filter(a => a.z >= -0.15 && a.z < -0.05).length, color: 'bg-rose-500' },
                      { label: '-25 to -20 cm (Bottom Mirror)', count: annihilations.filter(a => a.z < -0.15).length, color: 'bg-cern-magenta' },
                    ].map((bin, idx) => {
                      const maxCount = Math.max(1, totalAnnihilations);
                      const pct = Math.min(100, (bin.count / maxCount) * 100);
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-text-muted">{bin.label}</span>
                            <span className="text-white font-bold">{bin.count}</span>
                          </div>
                          <div className="w-full h-2 bg-black border border-zinc-800">
                            <div className={`h-full ${bin.color} transition-all duration-300`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Benchmark Comparison with Nature 2023 */}
                  <div className="p-2.5 bg-canvas-surface border-2 border-black space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-cern-cyan font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Nature 2023 Published Benchmark</span>
                    </div>
                    <p className="text-[10px] text-text-secondary leading-normal">
                      ALPHA-g observed: <strong>a_g / g = 0.75 ± 0.13 (stat.+syst.) ± 0.16 (sim.)</strong>. Repulsive gravity (a_g = -g) is ruled out at <strong>&gt; 5&sigma;</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Export Deck */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-black text-xs font-mono">
                <span className="text-text-muted text-[11px]">
                  Format: Raw Annihilation Vertices &amp; Trap Parameters
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
        </>
      ) : (
        /* AD / ELENA Antimatter Factory Pipeline Lifecycle View */
        <div className="space-y-6">
          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
            <span className="text-xs font-mono font-bold text-cern-cyan uppercase">
              /// The CERN Antimatter Deceleration &amp; Trapping Cascade ///
            </span>
            <p className="text-xs text-text-secondary leading-relaxed font-sans max-w-4xl">
              Antiprotons are naturally created at relativistic speeds. To measure their fundamental properties,
              laser transitions, and gravitational fall, CERN uses a multi-tiered deceleration chain to cool antiprotons
              from 96% the speed of light down to cryogenic fractions of a Kelvin.
            </p>

            {/* Stages Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-3">
              {[
                {
                  step: '01',
                  name: 'PS Production',
                  energy: '26 GeV → 3.57 GeV/c',
                  speed: '0.96 c',
                  desc: 'Protons strike an iridium target producing p-pbar pairs via E=mc^2.',
                },
                {
                  step: '02',
                  name: 'AD Ring',
                  energy: '3.57 GeV/c → 5.3 MeV',
                  speed: '0.10 c',
                  desc: 'Stochastic and electron cooling reduces beam size and kinetic energy.',
                },
                {
                  step: '03',
                  name: 'ELENA Ring',
                  energy: '5.3 MeV → 100 keV',
                  speed: '0.014 c',
                  desc: 'Further decelerates beam into ultra-low energy bunches with Delta p / p < 10^-4.',
                },
                {
                  step: '04',
                  name: 'Penning Trap',
                  energy: '100 keV → < 1 eV',
                  speed: '< 10^-4 c',
                  desc: 'Cryogenic electrode ring traps antiprotons and mixes with e+ from Na-22.',
                },
                {
                  step: '05',
                  name: 'ALPHA-g Magnetic Trap',
                  energy: '< 0.5 Kelvin',
                  speed: '< 100 m/s',
                  desc: 'Neutral antihydrogen confined by magnetic minimum for free fall drop test.',
                },
              ].map((st, i) => (
                <div
                  key={i}
                  onClick={() => setPipelineStage(i)}
                  className={`p-3 border-2 border-black cursor-pointer transition-all ${
                    pipelineStage === i
                      ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                    <span className="text-cern-cyan">{st.step}</span>
                    <span className="text-amber-400">{st.speed}</span>
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-white">{st.name}</h4>
                  <div className="text-[11px] font-mono text-emerald-400 font-bold my-1">{st.energy}</div>
                  <p className="text-[10px] text-text-muted leading-tight mt-1">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Selected Stage Inspection Card */}
          <div className="p-5 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000] grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 font-mono text-xs">
              <span className="px-2 py-0.5 bg-black border border-black text-cern-cyan font-bold text-[10px] uppercase">
                Stage Detail: {pipelineStage === 2 ? 'ELENA Synchrotron' : 'CERN Antimatter Facility'}
              </span>
              <h3 className="text-lg font-display font-bold text-white">
                {pipelineStage === 0 && 'Target Station & Magnetic Horn'}
                {pipelineStage === 1 && 'Antiproton Decelerator (AD) 182-meter Ring'}
                {pipelineStage === 2 && 'Extra Low ENergy Antiproton (ELENA) 30.4-meter Ring'}
                {pipelineStage === 3 && 'Multi-Ring Penning-Malmberg Plasma Mixing Trap'}
                {pipelineStage === 4 && 'ALPHA-g Neutral Antihydrogen Magnetic Balance'}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                {pipelineStage === 2
                  ? 'ELENA is a compact 30.4-meter hexagonal synchrotron commissioned to bridge the gap between the 5.3 MeV AD beam and the experimental traps. Before ELENA, experiments used degrader foils that destroyed over 99% of antiprotons. ELENA electron-cools the beam and outputs 100 keV bunches directly through electrostatic transfer lines, boosting trapping efficiency by a factor of 50.'
                  : 'CERN is the only facility in the world capable of decelerating and capturing antiprotons for precision synthetic antimatter spectroscopy (1S-2S transition) and gravitational free-fall tests.'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2">
                <div className="p-2 bg-canvas-surface border border-black">
                  <span className="text-text-muted block text-[10px]">Revolution Frequency</span>
                  <span className="text-white font-bold">{pipelineStage === 2 ? '146 kHz (at 100 keV)' : '1.58 MHz'}</span>
                </div>
                <div className="p-2 bg-canvas-surface border border-black">
                  <span className="text-text-muted block text-[10px]">Vacuum Pressure</span>
                  <span className="text-cern-cyan font-bold">3 &times; 10^-12 mbar (XHV)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-canvas-surface border-2 border-black flex flex-col justify-center items-center text-center space-y-3">
              <Atom className="w-16 h-16 text-cern-magenta animate-pulse" />
              <div className="text-xs font-mono text-white font-bold">
                Reaction: p + p &rarr; p + p + p + pbar
              </div>
              <div className="text-[11px] font-mono text-text-secondary max-w-sm">
                Antihydrogen formation: pbar + e+ + e+ &rarr; Hbar + e+ (three-body recombination)
              </div>
              <button
                onClick={() => setActiveView('drop')}
                className="px-4 py-2 bg-cern-cyan text-black font-bold uppercase text-xs border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-white transition-all"
              >
                Return to ALPHA-g Drop Simulation &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
