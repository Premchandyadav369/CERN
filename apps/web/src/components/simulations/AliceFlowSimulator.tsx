'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import {
  Activity,
  Sliders,
  RotateCcw,
  Play,
  Pause,
  Download,
  Flame,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';

interface EmittedParticle {
  id: number;
  phi: number; // Azimuthal angle in radians
  r: number; // Current radial distance
  speed: number;
  species: 'pion' | 'kaon' | 'proton';
  color: string;
}

export function AliceFlowSimulator() {
  // ALICE Heavy-Ion Parameters
  const [impactParameter_fm, setImpactParameter_fm] = useState<number>(7.2); // 0 to 13 fm (peak v2 occurs near 7-8 fm)
  const [etaOverS, setEtaOverS] = useState<number>(0.08); // Shear viscosity / entropy density (0.08 ≈ 1/(4pi) AdS/CFT lower bound)
  const [collisionEnergyTeV, setCollisionEnergyTeV] = useState<number>(5.36); // sqrt(s_NN) = 5.36 TeV (LHC Run 3)
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'pion' | 'kaon' | 'proton'>('all');
  const [plotMode, setPlotMode] = useState<'polar' | 'cartesian'>('polar');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Particle tracks animation
  const particlesRef = useRef<EmittedParticle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const polarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Optical Glauber Model & Relativistic Hydrodynamics (ALICE Run 2 & Run 3 data)
  const physics = useMemo(() => {
    const b = impactParameter_fm;
    const R_Pb = 6.62; // Radius of Pb-208 nucleus in fm
    const A = 208; // Mass number

    // Overlap area & participant calculation (Glauber geometric parametrization):
    // If b >= 2*R_Pb, no overlap (ultraperipheral)
    const normalizedB = Math.min(1.0, b / (2 * R_Pb));
    const overlapFraction = Math.max(0, 1 - Math.pow(normalizedB, 1.35));

    // Participant nucleons (N_part) and binary nucleon-nucleon collisions (N_coll)
    const N_part = Math.max(2, Math.round(2 * A * overlapFraction));
    const N_coll = Math.max(1, Math.round(1800 * Math.pow(overlapFraction, 1.8)));
    const N_spec = Math.max(0, 2 * A - N_part);

    // Initial spatial eccentricity epsilon_2:
    // eps_2 = ( <y^2 - x^2> ) / ( <y^2 + x^2> )
    // Peaks around b ≈ 7.5 fm where the overlap ellipse is most elongated
    let epsilon_2 = 0;
    if (b > 0 && b < 2 * R_Pb) {
      epsilon_2 = (b / (2 * R_Pb)) * Math.sqrt(Math.max(0, 1 - Math.pow(b / (2 * R_Pb), 2))) * 1.6;
      epsilon_2 = Math.min(0.65, Math.max(0.01, epsilon_2));
    }

    // Initial QGP temperature T_init in MeV:
    // Scale with (N_part)^(1/3) and collision energy
    const T_init_MeV = Math.round(
      320 * Math.pow(Math.max(10, N_part) / 400, 0.33) * Math.pow(collisionEnergyTeV / 5.36, 0.1)
    );

    // Initial energy density epsilon_0 in GeV/fm^3:
    const energyDensity_GeV_fm3 = (15.5 * (N_part / 400) * (collisionEnergyTeV / 5.36)).toFixed(1);

    // Elliptic flow coefficient v2:
    // Hydrodynamic linear response: v2 = kappa * epsilon_2 / (1 + (eta/s) / (eta/s)_AdS * damping)
    // eta/s = 0.08 is the KSS bound 1/(4*pi). Higher viscosity suppresses elliptic flow!
    const viscousDamping = 1 + ((etaOverS - 0.08) / 0.08) * 0.95;
    const v2_nominal = (0.28 * epsilon_2) / viscousDamping;
    const v2 = Math.max(0.005, Math.min(0.18, v2_nominal));

    // Triangular flow v3 (fluctuation driven, ~0.02 - 0.035):
    const v3 = 0.025 / viscousDamping;

    // Centrality Class %:
    // Fraction of total cross section: Centrality ≈ (b / 14)^2 * 100%
    const centralityPct = Math.min(100, Math.round(Math.pow(b / 13.5, 2) * 100));

    return {
      R_Pb,
      N_part,
      N_coll,
      N_spec,
      epsilon_2,
      T_init_MeV,
      energyDensity_GeV_fm3,
      v2,
      v3,
      centralityPct,
    };
  }, [impactParameter_fm, etaOverS, collisionEnergyTeV]);

  // Presets
  const applyPreset = (preset: 'central' | 'peak_v2' | 'peripheral' | 'high_viscosity') => {
    if (preset === 'central') {
      setImpactParameter_fm(1.2);
      setEtaOverS(0.08);
      setCollisionEnergyTeV(5.36);
    } else if (preset === 'peak_v2') {
      setImpactParameter_fm(7.5); // Optimal almond shape
      setEtaOverS(0.08);
      setCollisionEnergyTeV(5.36);
    } else if (preset === 'peripheral') {
      setImpactParameter_fm(11.8);
      setEtaOverS(0.08);
      setCollisionEnergyTeV(5.36);
    } else if (preset === 'high_viscosity') {
      setImpactParameter_fm(7.5);
      setEtaOverS(0.24); // Heavy damping
      setCollisionEnergyTeV(5.36);
    }
    particlesRef.current = [];
  };

  // Canvas 1: 60fps Transverse Overlap Geometry & Expanding Fireball
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let spawnTimer = 0;

    const render = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = 8.5; // pixels per fermi

      if (isPlaying) {
        spawnTimer++;
        if (spawnTimer % 3 === 0) {
          // Generate new particle batch with elliptic flow modulation
          const count = Math.min(8, Math.max(3, Math.floor(physics.N_part / 35)));
          for (let i = 0; i < count; i++) {
            let phi = Math.random() * Math.PI * 2;
            let accepted = false;
            let attempts = 0;
            while (!accepted && attempts < 15) {
              attempts++;
              const testPhi = Math.random() * Math.PI * 2;
              const prob = 1 + 2 * physics.v2 * Math.cos(2 * testPhi) + 2 * physics.v3 * Math.cos(3 * testPhi);
              const maxProb = 1 + 2 * physics.v2 + 2 * physics.v3;
              if (Math.random() < prob / maxProb) {
                phi = testPhi;
                accepted = true;
              }
            }

            const speciesRand = Math.random();
            let species: 'pion' | 'kaon' | 'proton' = 'pion';
            let speed = 2.4;
            let color = '#00FF66';

            if (speciesRand > 0.85) {
              species = 'proton';
              speed = 1.3;
              color = '#FF0055';
            } else if (speciesRand > 0.65) {
              species = 'kaon';
              speed = 1.8;
              color = '#00E5FF';
            }

            if (selectedSpecies === 'all' || selectedSpecies === species) {
              particlesRef.current.push({
                id: Math.random(),
                phi,
                r: 8,
                speed,
                species,
                color,
              });
            }
          }
        }

        // Advance particles
        particlesRef.current.forEach((p) => {
          p.r += p.speed;
        });
        particlesRef.current = particlesRef.current.filter((p) => p.r < 135).slice(-180);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = '#060B14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid coordinates
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, canvas.height);
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.stroke();

      // Nucleus A (displaced by -b/2 on x-axis)
      const b_px = (impactParameter_fm * scale) / 2;
      const r_px = physics.R_Pb * scale;

      // Nucleus A outline
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - b_px, cy, r_px, 0, Math.PI * 2);
      ctx.stroke();

      // Nucleus B outline (displaced by +b/2 on x-axis)
      ctx.strokeStyle = '#FB7185';
      ctx.beginPath();
      ctx.arc(cx + b_px, cy, r_px, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Overlap Almond (QGP Fireball)
      if (impactParameter_fm < 2 * physics.R_Pb) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx - b_px, cy, r_px, 0, Math.PI * 2);
        ctx.clip();
        ctx.beginPath();
        ctx.arc(cx + b_px, cy, r_px, 0, Math.PI * 2);
        ctx.clip();

        // Glowing fireball gradient
        const fireGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r_px);
        fireGrad.addColorStop(0, '#FFE600');
        fireGrad.addColorStop(0.5, '#FF5C5C');
        fireGrad.addColorStop(1, '#FF0055');
        ctx.fillStyle = fireGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Reaction plane axes label: x (in-plane), y (out-of-plane)
      ctx.fillStyle = '#64748B';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('x (in-plane, Ψ=0)', canvas.width - 10, cy - 8);
      ctx.textAlign = 'center';
      ctx.fillText('y (out-of-plane)', cx + 55, 18);

      // Draw Expanding Hadron Particles
      particlesRef.current.forEach((p) => {
        const px = cx + Math.cos(p.phi) * p.r;
        const py = cy + Math.sin(p.phi) * p.r;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Eccentricity axes visual guide
      if (impactParameter_fm < 2 * physics.R_Pb && impactParameter_fm > 0) {
        ctx.strokeStyle = '#FFE600';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        // Minor axis (x)
        const minorR = (physics.R_Pb - impactParameter_fm / 2) * scale;
        ctx.beginPath();
        ctx.moveTo(cx - minorR, cy);
        ctx.lineTo(cx + minorR, cy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, impactParameter_fm, physics, selectedSpecies]);

  // Canvas 2: Live Polar Plot of Azimuthal Yield dN/dphi = 1 + 2*v2*cos(2*phi)
  useEffect(() => {
    const canvas = polarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const baseRadius = 55;

    // Background
    ctx.fillStyle = '#060B14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Polar Grid Circles
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    [30, 55, 80].forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Radial spokes
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 85, cy + Math.sin(a) * 85);
      ctx.stroke();
    }

    // Isotropic Reference Circle (v2 = 0)
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Anisotropic Elliptic Distribution: r(phi) = R0 * (1 + 2*v2*cos(2*phi))
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
    ctx.beginPath();
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const phi = (i / steps) * Math.PI * 2;
      const modRadius = baseRadius * (1 + 2 * physics.v2 * Math.cos(2 * phi));
      const px = cx + Math.cos(phi) * modRadius;
      const py = cy + Math.sin(phi) * modRadius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // In-plane / Out-of-plane annotations
    ctx.fillStyle = '#FFE600';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('In-plane (0°)', cx + 75, cy - 6);
    ctx.fillText('Out-of-plane (90°)', cx, cy - 70);
  }, [physics.v2]);

  // Export JSON Scenario
  const exportJson = () => {
    const data = {
      experiment: 'ALICE Quark-Gluon Plasma & Elliptic Flow Simulation',
      timestamp: new Date().toISOString(),
      parameters: {
        impactParameter_fm,
        shearViscosityRatio_eta_over_s: etaOverS,
        collisionEnergy_sqrt_s_NN_TeV: collisionEnergyTeV,
        particleSpeciesFilter: selectedSpecies,
      },
      results: {
        participantNucleons_Npart: physics.N_part,
        binaryCollisions_Ncoll: physics.N_coll,
        spectatorNucleons_Nspec: physics.N_spec,
        initialSpatialEccentricity_epsilon2: physics.epsilon_2,
        ellipticFlowCoefficient_v2: physics.v2,
        triangularFlowCoefficient_v3: physics.v3,
        centralityPercentile: physics.centralityPct,
        initialTemperature_MeV: physics.T_init_MeV,
        initialEnergyDensity_GeV_fm3: physics.energyDensity_GeV_fm3,
      },
      fidelity: 'ANALYTIC + GLAUBER OPTICAL',
      source: 'ALICE Collaboration, Phys. Rev. Lett. 116, 132302 (2016) & JHEP 05 (2023) 061',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alice_flow_simulation_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCsv = () => {
    let csv = 'phi_rad,phi_deg,dndphi_anisotropy_ratio\n';
    for (let deg = 0; deg <= 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const ratio = 1 + 2 * physics.v2 * Math.cos(2 * rad) + 2 * physics.v3 * Math.cos(3 * rad);
      csv += `${rad.toFixed(4)},${deg},${ratio.toFixed(4)}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alice_elliptic_flow_profile_${Date.now()}.csv`;
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
              /// ALICE: Heavy-Ion QGP &amp; Elliptic Flow (v₂) Sandbox ///
            </h3>
            <FidelityBadge
              type="ANALYTIC"
              formula="\frac{dN}{d\phi} \propto 1 + 2 v_2 \cos(2\phi), \quad v_2 \propto \frac{\varepsilon_2}{1 + (\eta/s) / (1/4\pi)}"
            />
          </div>
          <p className="text-xs text-text-secondary font-mono mt-1">
            Pb-Pb collisions at &radic;s_NN = 5.36 TeV, initial overlap eccentricity &epsilon;₂, and relativistic hydrodynamic expansion of the deconfined Quark-Gluon Plasma.
          </p>
        </div>

        {/* Play/Pause Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 bg-cern-blue hover:bg-cern-accent text-white font-bold uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE FLOW' : 'RESUME FLOW'}</span>
          </button>
          <button
            onClick={() => {
              particlesRef.current = [];
            }}
            className="p-1.5 bg-canvas-sub hover:bg-canvas-raised text-text-muted hover:text-white border-2 border-black shadow-[2px_2px_0px_#000] transition-all"
            title="Clear tracks"
          >
            <RotateCcw className="w-4 h-4 text-cern-cyan" />
          </button>
        </div>
      </div>

      {/* Presets Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-text-muted font-bold mr-1">PRESETS:</span>
        <button
          onClick={() => applyPreset('central')}
          className="px-3 py-1 bg-canvas-sub text-white hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#000] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Ultra-Central (b = 1.2 fm, v₂ &asymp; 0)
        </button>
        <button
          onClick={() => applyPreset('peak_v2')}
          className="px-3 py-1 bg-canvas-sub text-cern-cyan hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#00E5FF] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Peak Elliptic Flow (b = 7.5 fm, Almond Overlap)
        </button>
        <button
          onClick={() => applyPreset('peripheral')}
          className="px-3 py-1 bg-canvas-sub text-amber-300 hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#FFE600] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Peripheral Collision (b = 11.8 fm)
        </button>
        <button
          onClick={() => applyPreset('high_viscosity')}
          className="px-3 py-1 bg-red-950 text-red-300 hover:bg-red-900 border-2 border-black shadow-[2px_2px_0px_#FF0055] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Viscous Dissipation (&eta;/s = 0.24)
        </button>
      </div>

      {/* Main Grid: Controls (4 cols) + Visualizer & Metrics (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sliders Deck */}
        <div className="lg:col-span-4 bg-canvas-sub p-4 border-3 border-black shadow-[5px_5px_0px_#000] space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <span className="font-bold text-white uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cern-cyan" />
              Heavy-Ion Collision Parameters
            </span>
            <span className="text-[10px] text-cern-cyan font-bold">ALICE Run 3</span>
          </div>

          {/* Slider 1: Impact Parameter b */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Impact Parameter (b):</span>
              <span className="text-cern-cyan font-bold">{impactParameter_fm.toFixed(1)} fm</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={13.0}
              step={0.2}
              value={impactParameter_fm}
              onChange={(e) => setImpactParameter_fm(Number(e.target.value))}
              className="w-full cursor-pointer accent-cern-cyan"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>0 fm (Head-on)</span>
              <span>7.5 fm (Peak v₂)</span>
              <span>13 fm (Grazing)</span>
            </div>
          </div>

          {/* Slider 2: QGP Shear Viscosity eta/s */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Viscosity (&eta; / s):</span>
              <span
                className={`font-bold ${
                  etaOverS <= 0.1 ? 'text-emerald-400' : etaOverS <= 0.18 ? 'text-amber-300' : 'text-red-400'
                }`}
              >
                {etaOverS.toFixed(3)} {etaOverS === 0.08 ? '≈ 1/(4π) [AdS/CFT]' : ''}
              </span>
            </div>
            <input
              type="range"
              min={0.08}
              max={0.30}
              step={0.01}
              value={etaOverS}
              onChange={(e) => setEtaOverS(Number(e.target.value))}
              className="w-full cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>0.08 (Ideal Fluid)</span>
              <span>0.16 (QGP Best Fit)</span>
              <span>0.30 (Viscous)</span>
            </div>
          </div>

          {/* Slider 3: Collision Energy */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Energy (&radic;s_NN):</span>
              <span className="text-amber-300 font-bold">{collisionEnergyTeV.toFixed(2)} TeV</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[2.76, 5.02, 5.36].map((ene) => (
                <button
                  key={ene}
                  onClick={() => setCollisionEnergyTeV(ene)}
                  className={`py-1 border text-[11px] font-bold ${
                    collisionEnergyTeV === ene
                      ? 'bg-cern-blue text-white border-black shadow-[2px_2px_0px_#00E5FF]'
                      : 'bg-canvas-sub text-text-muted border-black hover:text-white'
                  }`}
                >
                  {ene} TeV
                </button>
              ))}
            </div>
          </div>

          {/* Particle Species Filter */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-text-muted block">
              Identify Particle Species:
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'all', label: 'All', color: 'text-white' },
                { id: 'pion', label: 'π±', color: 'text-emerald-400' },
                { id: 'kaon', label: 'K±', color: 'text-cern-cyan' },
                { id: 'proton', label: 'p / p̄', color: 'text-cern-magenta' },
              ].map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => setSelectedSpecies(sp.id as any)}
                  className={`py-1 text-[10px] font-bold border border-black ${
                    selectedSpecies === sp.id
                      ? 'bg-zinc-800 text-white shadow-[2px_2px_0px_#000]'
                      : 'bg-canvas-sub text-text-muted hover:text-white'
                  }`}
                >
                  <span>{sp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optical Glauber Summary */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1 text-[11px]">
            <span className="text-[10px] font-bold uppercase text-cern-cyan block">
              Hydrodynamic Thermodynamic State:
            </span>
            <div className="flex justify-between">
              <span className="text-text-muted">Centrality Class:</span>
              <span className="font-bold text-white">{physics.centralityPct}% (Pb-Pb)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Initial Temperature (T₀):</span>
              <span className="font-bold text-amber-300">{physics.T_init_MeV} MeV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Energy Density (&epsilon;₀):</span>
              <span className="font-bold text-white">{physics.energyDensity_GeV_fm3} GeV/fm³</span>
            </div>
          </div>
        </div>

        {/* Right Visualizer & Real-Time Plots (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Elliptic Flow (v₂)</span>
              <span className="text-xl font-bold text-cern-cyan">
                {physics.v2.toFixed(3)}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                v₂ / &epsilon;₂ = {(physics.v2 / Math.max(0.01, physics.epsilon_2)).toFixed(2)}
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Eccentricity (&epsilon;₂)</span>
              <span className="text-xl font-bold text-amber-300">
                {physics.epsilon_2.toFixed(3)}
              </span>
              <span className="text-[10px] text-amber-300 block mt-0.5 font-bold">
                Spatial Anisotropy
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Participants (N_part)</span>
              <span className="text-xl font-bold text-white">
                {physics.N_part}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                Spectators: {physics.N_spec}
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Binary Collisions</span>
              <span className="text-xl font-bold text-emerald-400">
                {physics.N_coll}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                N_coll Glauber scaling
              </span>
            </div>
          </div>

          {/* Dual Visualizer: Overlap Geometry (Left) + Live Polar Anisotropy Radar (Right) */}
          <div className="bg-canvas-sub p-4 border-2 border-black shadow-[4px_4px_0px_#000] grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Transverse Overlap Geometry & Expanding Fireball (7 cols) */}
            <div className="md:col-span-7 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-2 mb-2 border-b-2 border-black text-[11px] font-mono">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-cern-magenta" />
                  Pb-Pb Overlap &amp; Hadron Blast Wave
                </span>
                <span className="text-cern-cyan font-bold">b = {impactParameter_fm.toFixed(1)} fm</span>
              </div>

              <div className="relative w-full h-64 bg-black border-2 border-black overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={260}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Live Azimuthal Anisotropy Display: Polar vs Cartesian dN/dphi (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between font-mono text-xs space-y-2">
              <div className="w-full pb-2 border-b-2 border-black flex items-center justify-between text-[11px]">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cern-cyan" />
                  {plotMode === 'polar' ? 'v₂ Polar Radar' : 'dN/dφ Cartesian'}
                </span>
                <div className="flex items-center border border-black shadow-[1px_1px_0px_#000] text-[10px]">
                  <button
                    onClick={() => setPlotMode('polar')}
                    className={`px-2 py-0.5 font-bold uppercase transition-all ${
                      plotMode === 'polar'
                        ? 'bg-cern-cyan text-black'
                        : 'bg-canvas-sub text-text-muted hover:text-white'
                    }`}
                  >
                    Polar
                  </button>
                  <button
                    onClick={() => setPlotMode('cartesian')}
                    className={`px-2 py-0.5 font-bold uppercase transition-all ${
                      plotMode === 'cartesian'
                        ? 'bg-amber-400 text-black'
                        : 'bg-canvas-sub text-text-muted hover:text-white'
                    }`}
                  >
                    Cartesian
                  </button>
                </div>
              </div>

              <div className="relative w-full h-52 bg-black border-2 border-black overflow-hidden flex items-center justify-center p-2">
                {plotMode === 'polar' ? (
                  <canvas
                    ref={polarCanvasRef}
                    width={220}
                    height={210}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg viewBox="0 0 240 180" className="w-full h-full">
                    {/* Cartesian grid */}
                    <line x1="28" y1="20" x2="230" y2="20" stroke="#1E293B" strokeWidth="1" />
                    <line x1="28" y1="60" x2="230" y2="60" stroke="#1E293B" strokeWidth="1" />
                    <line x1="28" y1="100" x2="230" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="28" y1="140" x2="230" y2="140" stroke="#1E293B" strokeWidth="1" />

                    {/* Y-axis labels */}
                    <text x="24" y="23" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="monospace">1.4</text>
                    <text x="24" y="63" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="monospace">1.2</text>
                    <text x="24" y="103" fill="#00FF66" fontSize="8" textAnchor="end" fontFamily="monospace" fontWeight="bold">1.0</text>
                    <text x="24" y="143" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="monospace">0.8</text>

                    {/* X-axis lines & labels (phi = 0 to 360 deg) */}
                    {[
                      { deg: 0, label: '0°' },
                      { deg: 90, label: '90°' },
                      { deg: 180, label: '180°' },
                      { deg: 270, label: '270°' },
                      { deg: 360, label: '360°' },
                    ].map((tick) => {
                      const tx = 28 + (tick.deg / 360) * 202;
                      return (
                        <g key={tick.deg}>
                          <line x1={tx} y1="20" x2={tx} y2="155" stroke="#1E293B" strokeWidth="1" strokeDasharray="2,2" />
                          <text x={tx} y="167" fill="#64748B" fontSize="8" textAnchor="middle" fontFamily="monospace">
                            {tick.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Isotropic baseline (v2 = 0) */}
                    <line x1="28" y1="100" x2="230" y2="100" stroke="#64748B" strokeWidth="1.2" strokeDasharray="4,4" />

                    {/* Modulation curve: y = 100 - (ratio - 1.0) * 100 */}
                    {(() => {
                      const points: string[] = [];
                      const fillPoints: string[] = [`28,100`];
                      for (let d = 0; d <= 360; d += 6) {
                        const rad = (d * Math.PI) / 180;
                        const ratio = 1 + 2 * physics.v2 * Math.cos(2 * rad) + 2 * physics.v3 * Math.cos(3 * rad);
                        const px = 28 + (d / 360) * 202;
                        const py = Math.max(15, Math.min(150, 100 - (ratio - 1.0) * 100));
                        points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
                        fillPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
                      }
                      fillPoints.push(`230,100`);

                      return (
                        <g>
                          <polygon points={fillPoints.join(' ')} fill="rgba(0, 229, 255, 0.15)" />
                          <polyline
                            points={points.join(' ')}
                            fill="none"
                            stroke="#00E5FF"
                            strokeWidth="2.5"
                          />
                        </g>
                      );
                    })()}

                    {/* Annotations */}
                    <text x="32" y="32" fill="#FFE600" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      In-plane crest
                    </text>
                    <text x="80" y="135" fill="#FF5C5C" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      Out-of-plane trough
                    </text>
                  </svg>
                )}
              </div>

              <div className="p-2 bg-canvas-surface border border-black text-[10px] text-text-secondary leading-normal">
                {plotMode === 'polar'
                  ? 'Anisotropic pressure gradients ∇P convert spatial eccentricity ε₂ into final momentum anisotropy v₂ with η/s ≈ 1/(4π).'
                  : 'Cartesian dN/dφ ∝ 1 + 2v₂ cos(2φ): In-plane peaks at 0°, 180°, 360° align with the reaction plane Ψ_R.'}
              </div>
            </div>
          </div>

          {/* Export Deck */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-black text-xs font-mono">
            <span className="text-text-muted text-[11px]">
              ALICE Pb-Pb 5.36 TeV Run 3 Hydrodynamic Model
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
