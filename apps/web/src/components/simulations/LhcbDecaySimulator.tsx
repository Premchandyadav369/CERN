'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import {
  Sparkles,
  Sliders,
  RotateCcw,
  Play,
  Pause,
  Download,
  Activity,
  Layers,
  CheckCircle,
  Eye,
  Info,
  ChevronRight,
} from 'lucide-react';

export function LhcbDecaySimulator() {
  // Wilson Coefficients Shift Parameters
  const [deltaC9, setDeltaC9] = useState<number>(0.0); // Vector coupling shift (-2.0 to +1.0, SM = 0)
  const [deltaC10, setDeltaC10] = useState<number>(0.0); // Axial-vector shift (-1.0 to +1.5, SM = 0)
  const [q2Value, setQ2Value] = useState<number>(3.5); // Dilepton invariant mass squared q^2 (1.1 to 6.0 GeV^2)
  const [selectedChannel, setSelectedChannel] = useState<'RK' | 'RKstar'>('RK');
  const [leptonMode, setLeptonMode] = useState<'muon' | 'electron'>('muon');
  const [observablePlot, setObservablePlot] = useState<'ratio' | 'p5prime'>('ratio');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Animation State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animProgressRef = useRef<number>(0);

  // Physics Calculations: Lepton Universality Ratios & Angular Observable P5'
  const physics = useMemo(() => {
    // Standard Model baseline:
    // C9^SM ≈ 4.1, C10^SM ≈ -4.3
    const C9_eff = 4.1 + deltaC9;
    const C10_eff = -4.3 + deltaC10;

    // Lepton Universality Ratio R_K:
    // SM is strictly 1.000 ± 0.010 in low q^2 region [1.1, 6.0] GeV^2
    // New Physics in muon mode shifts RK:
    // Delta RK ≈ 0.22 * (deltaC9 - deltaC10)
    const deltaRK = 0.22 * (deltaC9 - deltaC10);
    const RK_value = Math.max(0.5, Math.min(1.5, 1.0 + deltaRK));

    // R_K* ratio has similar structure with slight form-factor dependence:
    const deltaRKstar = 0.24 * deltaC9 - 0.20 * deltaC10;
    const RKstar_value = Math.max(0.5, Math.min(1.5, 1.0 + deltaRKstar));

    // Angular observable P_5'(q^2):
    // In SM, P_5' crosses zero near q^2 ≈ 4.0 GeV^2, and is around -0.4 to -0.5 at q^2 ≈ 5 GeV^2.
    // A negative shift deltaC9 ≈ -0.8 shifts P_5' upwards, explaining the historical LHCb anomaly!
    const P5_prime_SM = -0.35 * (q2Value - 3.8);
    const P5_prime = Math.max(-1.0, Math.min(1.0, P5_prime_SM - 0.28 * deltaC9));

    // Branching fraction BR(B -> K* mu mu) x 10^-7:
    const baseBR = 1.05; // SM rate x 10^-7 per GeV^2
    const branchingRatio_e7 = Math.max(
      0.3,
      baseBR * (1 + 0.18 * deltaC9 - 0.15 * deltaC10)
    );

    // Published LHCb Run 1+2 & Run 3 (2022/2023) experimental measurements:
    // LHCb 2023 (Nature Physics):
    // RK (low q2) = 0.949 ± 0.042 (stat) ± 0.022 (syst) => ±0.047 combined
    // RK* (low q2) = 1.027 ± 0.072 (stat) ± 0.027 (syst) => ±0.077 combined
    const expRK = 0.949;
    const expRK_err = 0.047;
    const expRKstar = 1.027;
    const expRKstar_err = 0.077;

    const pullSigmas =
      selectedChannel === 'RK'
        ? Math.abs(RK_value - expRK) / expRK_err
        : Math.abs(RKstar_value - expRKstar) / expRKstar_err;

    return {
      C9_eff,
      C10_eff,
      RK_value,
      RKstar_value,
      P5_prime,
      P5_prime_SM,
      branchingRatio_e7,
      expRK,
      expRK_err,
      expRKstar,
      expRKstar_err,
      pullSigmas,
    };
  }, [deltaC9, deltaC10, q2Value, selectedChannel]);

  // Presets
  const applyPreset = (preset: 'sm' | 'leptoquark' | 'zprime' | 'anomaly2021') => {
    if (preset === 'sm') {
      setDeltaC9(0.0);
      setDeltaC10(0.0);
      setQ2Value(3.5);
    } else if (preset === 'leptoquark') {
      // Vector leptoquark U_1 (SU(2) singlet): delta C9 = - delta C10 = -0.4
      setDeltaC9(-0.4);
      setDeltaC10(0.4);
      setQ2Value(4.0);
    } else if (preset === 'zprime') {
      // Heavy neutral Z' gauge boson: pure vector shift delta C9 ≈ -0.85
      setDeltaC9(-0.85);
      setDeltaC10(0.0);
      setQ2Value(5.0);
    } else if (preset === 'anomaly2021') {
      // Historical 2021 anomaly fit: RK ≈ 0.846
      setDeltaC9(-0.7);
      setDeltaC10(0.0);
      setQ2Value(3.0);
    }
    animProgressRef.current = 0;
  };

  // Trigger New Decay Animation
  const triggerDecay = () => {
    animProgressRef.current = 0;
  };

  // Canvas Spectrometer Event Display: LHCb Forward Geometry with 60fps Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (isPlaying) {
        animProgressRef.current = (animProgressRef.current + 0.75) % 100;
      }
      const progress = animProgressRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;

      // Background
      ctx.fillStyle = '#060B14';
      ctx.fillRect(0, 0, w, h);

      // 1. LHCb Geometry Subsystems Layout (0 to 20 meters single-arm forward spectrometer)
      // Beam collision axis line
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(10, cy);
      ctx.lineTo(w - 10, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // VELO Box (Vertex Locator: 0 to 1.0 m)
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(30, cy - 25, 50, 50);
      ctx.fillRect(30, cy - 25, 50, 50);
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VELO', 55, cy - 28);

      // LHCb Dipole Magnet (4 T*m warm dipole: x 160 to 220)
      ctx.fillStyle = '#1E1B4B';
      ctx.strokeStyle = '#FFB020';
      ctx.lineWidth = 2;
      ctx.strokeRect(160, cy - 45, 60, 90);
      ctx.fillRect(160, cy - 45, 60, 90);
      ctx.fillStyle = '#FFB020';
      ctx.fillText('MAGNET', 190, cy - 48);

      // RICH 1 & RICH 2 Cherenkov detectors
      ctx.fillStyle = '#064E3B';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1;
      ctx.strokeRect(100, cy - 30, 35, 60);
      ctx.strokeRect(330, cy - 40, 40, 80);
      ctx.fillStyle = '#10B981';
      ctx.fillText('RICH1', 117, cy - 33);
      ctx.fillText('RICH2', 350, cy - 43);

      // Tracking Stations (T1, T2, T3)
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      [250, 275, 300].forEach((tx, idx) => {
        ctx.beginPath();
        ctx.moveTo(tx, cy - 38);
        ctx.lineTo(tx, cy + 38);
        ctx.stroke();
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`T${idx + 1}`, tx, cy - 41);
      });

      // Calorimeters: ECAL (Electromagnetic) & HCAL (Hadronic)
      ctx.fillStyle = '#312E81';
      ctx.strokeStyle = '#818CF8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(390, cy - 45, 42, 90);
      ctx.fillRect(390, cy - 45, 42, 90);
      ctx.fillStyle = '#818CF8';
      ctx.fillText('ECAL/HCAL', 411, cy - 48);

      // Muon Filter & Chambers M1-M5 with iron absorbers
      ctx.fillStyle = '#4C0519';
      ctx.strokeStyle = '#FF0055';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(450, cy - 45, 120, 90);
      ctx.fillRect(450, cy - 45, 120, 90);
      // Draw 4 iron absorber plates inside muon system
      ctx.fillStyle = '#18181B';
      for (let plate = 0; plate < 4; plate++) {
        ctx.fillRect(465 + plate * 28, cy - 42, 10, 84);
      }
      ctx.fillStyle = '#FF0055';
      ctx.fillText('MUON M1-M5', 510, cy - 48);

      // 2. Animated Decay Vertex Dynamics
      const primaryVertexX = 40;
      const primaryVertexY = cy;
      const decayVertexX = 72; // Displaced secondary vertex in VELO (~5 mm real scale)
      const decayVertexY = cy + 6;

      // Primary Vertex Dot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(primaryVertexX, primaryVertexY, 3, 0, Math.PI * 2);
      ctx.fill();

      // B-meson flight: progress 0 to 20
      const bProgress = Math.min(1.0, progress / 20.0);
      const bCurrentX = primaryVertexX + (decayVertexX - primaryVertexX) * bProgress;
      const bCurrentY = primaryVertexY + (decayVertexY - primaryVertexY) * bProgress;

      ctx.strokeStyle = '#FFE600';
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(primaryVertexX, primaryVertexY);
      ctx.lineTo(bCurrentX, bCurrentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Traveling B-meson packet dot
      if (progress < 25) {
        ctx.fillStyle = '#FFE600';
        ctx.shadowColor = '#FFE600';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bCurrentX, bCurrentY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Secondary Vertex activation at progress >= 20
      if (progress >= 20) {
        // Displaced decay vertex marker
        ctx.fillStyle = '#FFE600';
        ctx.beginPath();
        ctx.arc(decayVertexX, decayVertexY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Flash starburst upon decay
        if (progress < 35) {
          const flashAlpha = 1.0 - (progress - 20) / 15.0;
          ctx.strokeStyle = `rgba(255, 230, 0, ${flashAlpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(decayVertexX, decayVertexY, 2 + (progress - 20) * 1.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Daughter Tracks Propagation (progress 20 to 80)
        const trackFrac = Math.min(1.0, (progress - 20) / 55.0);

        // Track 1: Kaon+ (Cyan, stopped at calorimeter)
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(decayVertexX, decayVertexY);
        const kaonEndT = trackFrac;
        if (kaonEndT > 0) {
          ctx.lineTo(160, cy - 5);
          if (kaonEndT > 0.3) {
            ctx.quadraticCurveTo(190, cy - 16, 240, cy - 14);
          }
          if (kaonEndT > 0.6) {
            const finalKx = 240 + (390 - 240) * ((kaonEndT - 0.6) / 0.4);
            ctx.lineTo(finalKx, cy - 15);
          }
        }
        ctx.stroke();

        // RICH 1 Cherenkov ring emission when kaon passes x=118
        if (trackFrac > 0.25) {
          const ringPulse = Math.min(1.0, (trackFrac - 0.25) / 0.2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${ringPulse * 0.9})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(118, cy - 8, 12 * ringPulse, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Track 2: Pion- (Green, only for B0 -> K*0(-> K+ pi-) channel)
        if (selectedChannel === 'RKstar') {
          ctx.strokeStyle = '#00FF66';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(decayVertexX, decayVertexY);
          if (trackFrac > 0) {
            ctx.lineTo(160, cy + 5);
            if (trackFrac > 0.3) {
              ctx.quadraticCurveTo(190, cy + 18, 240, cy + 16);
            }
            if (trackFrac > 0.6) {
              const finalPix = 240 + (390 - 240) * ((trackFrac - 0.6) / 0.4);
              ctx.lineTo(finalPix, cy + 18);
            }
          }
          ctx.stroke();
        }

        // Lepton Tracks: Muon Mode vs Electron Mode
        if (leptonMode === 'muon') {
          // --- DIMUON MODE: Minimum ionizing particles penetrating all iron filters into M1-M5 ---
          // Track 3: Muon+ (Bends UP in dipole, penetrates iron to M5)
          ctx.strokeStyle = '#FF0055';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(decayVertexX, decayVertexY);
          ctx.lineTo(160, cy - 12);
          if (trackFrac > 0.25) {
            ctx.quadraticCurveTo(190, cy - 38, 240, cy - 32);
          }
          if (trackFrac > 0.5) {
            const finalMuX = 240 + (560 - 240) * Math.min(1.0, (trackFrac - 0.5) / 0.5);
            ctx.lineTo(finalMuX, cy - 36);
          }
          ctx.stroke();

          // Track 4: Muon- (Bends DOWN in dipole, penetrates iron to M5)
          ctx.strokeStyle = '#FF0055';
          ctx.beginPath();
          ctx.moveTo(decayVertexX, decayVertexY);
          ctx.lineTo(160, cy + 10);
          if (trackFrac > 0.25) {
            ctx.quadraticCurveTo(190, cy + 36, 240, cy + 30);
          }
          if (trackFrac > 0.5) {
            const finalMuX = 240 + (560 - 240) * Math.min(1.0, (trackFrac - 0.5) / 0.5);
            ctx.lineTo(finalMuX, cy + 34);
          }
          ctx.stroke();

          // Sequential Muon Hits in M1-M5 Chambers as muons penetrate
          const muonChamberX = [460, 488, 516, 544, 565];
          muonChamberX.forEach((mx, idx) => {
            if (trackFrac > 0.6 + idx * 0.08) {
              ctx.fillStyle = '#FF0055';
              ctx.shadowColor = '#FF0055';
              ctx.shadowBlur = 6;
              // Upper hit
              ctx.beginPath();
              ctx.arc(mx, cy - 36, 3, 0, Math.PI * 2);
              ctx.fill();
              // Lower hit
              ctx.beginPath();
              ctx.arc(mx, cy + 34, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          });
        } else {
          // --- DIELECTRON MODE: Cascading electromagnetic shower inside ECAL with Bremsstrahlung radiation ---
          // Track 3: Positron e+ (Bends UP, radiates photons, terminates in ECAL)
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(decayVertexX, decayVertexY);
          ctx.lineTo(160, cy - 12);
          if (trackFrac > 0.25) {
            ctx.quadraticCurveTo(190, cy - 36, 240, cy - 30);
          }
          if (trackFrac > 0.5) {
            const finalEX = 240 + (410 - 240) * Math.min(1.0, (trackFrac - 0.5) / 0.4);
            ctx.lineTo(finalEX, cy - 28);
          }
          ctx.stroke();

          // Track 4: Electron e- (Bends DOWN, radiates photons, terminates in ECAL)
          ctx.strokeStyle = '#F59E0B';
          ctx.beginPath();
          ctx.moveTo(decayVertexX, decayVertexY);
          ctx.lineTo(160, cy + 10);
          if (trackFrac > 0.25) {
            ctx.quadraticCurveTo(190, cy + 34, 240, cy + 28);
          }
          if (trackFrac > 0.5) {
            const finalEX = 240 + (410 - 240) * Math.min(1.0, (trackFrac - 0.5) / 0.4);
            ctx.lineTo(finalEX, cy + 26);
          }
          ctx.stroke();

          // Bremsstrahlung photon emission rays emitted along dipole bending path
          if (trackFrac > 0.45) {
            ctx.strokeStyle = '#FDE047';
            ctx.setLineDash([2, 2]);
            ctx.lineWidth = 1;
            // Gamma 1 from e+
            ctx.beginPath();
            ctx.moveTo(195, cy - 30);
            ctx.lineTo(260, cy - 44);
            ctx.stroke();
            // Gamma 2 from e-
            ctx.beginPath();
            ctx.moveTo(195, cy + 30);
            ctx.lineTo(260, cy + 44);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#FDE047';
            ctx.font = '8px monospace';
            ctx.fillText('γ_brem', 265, cy - 44);
            ctx.fillText('γ_brem', 265, cy + 46);
          }

          // Electromagnetic Shower Flash in ECAL (NO muon penetration!)
          if (trackFrac > 0.85) {
            const showerAlpha = Math.min(1.0, (trackFrac - 0.85) / 0.15);
            ctx.fillStyle = `rgba(245, 158, 11, ${showerAlpha * 0.4})`;
            ctx.fillRect(395, cy - 40, 30, 80);
            ctx.strokeStyle = `rgba(253, 224, 71, ${showerAlpha})`;
            ctx.strokeRect(395, cy - 40, 30, 80);
            ctx.fillStyle = '#FDE047';
            ctx.font = 'bold 8px monospace';
            ctx.fillText('EM SHOWER', 410, cy);
          }
        }

        // Track Labels
        if (progress > 60) {
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#00E5FF';
          ctx.fillText('K⁺', 400, cy - 13);
          if (selectedChannel === 'RKstar') {
            ctx.fillStyle = '#00FF66';
            ctx.fillText('π⁻', 400, cy + 22);
          }

          if (leptonMode === 'muon') {
            ctx.fillStyle = '#FF0055';
            ctx.fillText('μ⁺', 572, cy - 34);
            ctx.fillText('μ⁻', 572, cy + 36);
          } else {
            ctx.fillStyle = '#F59E0B';
            ctx.fillText('e⁺ [ECAL]', 435, cy - 26);
            ctx.fillText('e⁻ [ECAL]', 435, cy + 26);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, leptonMode, selectedChannel, physics]);

  // Export JSON Scenario
  const exportJson = () => {
    const data = {
      experiment: 'LHCb Rare Decays & Lepton Universality Simulation',
      timestamp: new Date().toISOString(),
      parameters: {
        wilsonShiftDeltaC9: deltaC9,
        wilsonShiftDeltaC10: deltaC10,
        dileptonInvariantMassSquared_q2_GeV2: q2Value,
        decayChannel: selectedChannel,
        leptonMode: leptonMode,
      },
      results: {
        effectiveWilsonC9: physics.C9_eff,
        effectiveWilsonC10: physics.C10_eff,
        leptonUniversalityRatio_RK: physics.RK_value,
        leptonUniversalityRatio_RKstar: physics.RKstar_value,
        angularObservable_P5prime: physics.P5_prime,
        branchingFraction_e7: physics.branchingRatio_e7,
        standardModelRK: 1.0,
        lhcbMeasurementRK: physics.expRK,
        lhcbMeasurementError: physics.expRK_err,
        pullSignificanceSigma: physics.pullSigmas,
      },
      fidelity: 'ANALYTIC + EFFECTIVE HAMILTONIAN',
      source: 'LHCb Collaboration, Nature Physics 18, 277-282 (2022) & Phys. Rev. Lett. 131, 051803 (2023)',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lhcb_rk_simulation_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportCsv = () => {
    let csv = 'q2_GeV2,RK_theory,P5prime_theory,P5prime_SM\n';
    for (let q = 1.0; q <= 6.0; q += 0.25) {
      const p5_sm = -0.35 * (q - 3.8);
      const p5 = Math.max(-1.0, Math.min(1.0, p5_sm - 0.28 * deltaC9));
      csv += `${q.toFixed(2)},${physics.RK_value.toFixed(4)},${p5.toFixed(4)},${p5_sm.toFixed(4)}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lhcb_rk_profile_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">
      <Eli5Card
        title="The Cosmic Twin Test & Ghost Particle Hunters"
        analogy="Checking if nature treats electrons and muons as identical twins, or if mysterious ghost particles are secretly favoring one over the other."
        keyPoints={[
          "The Standard Model states that electrons and muons are identical twins in their fundamental electroweak gauge couplings (Lepton Flavour Universality).",
          "By measuring the exact ratio R_K = BR(B -> K mu+ mu-) / BR(B -> K e+ e-), physicists search for hypothetical Leptoquarks or Z' bosons that break this symmetry."
        ]}
        whatToTry="Dial the Wilson Coefficient ΔC9 slider to -1.0 to see how a new physics vector current depresses R_K away from the Standard Model value of ~1.0!"
        arxivId="2212.09152"
        doi="10.1103/PhysRevLett.131.051803"
        citationLabel="LHCb Collaboration: Lepton Universality in B Decays (PRL 2023)"
      />
      <div className="w-full bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] p-5 space-y-6">
      {/* Top Bar with Fidelity Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-display font-extrabold text-white">
              LHCb: Rare Decays &amp; Lepton Universality (R_K / R_K*) Lab
            </h3>
            <FidelityBadge
              type="ANALYTIC"
              formula="\mathcal{H}_{\text{eff}} = -\frac{4 G_F}{\sqrt{2}} V_{tb} V_{ts}^* \sum C_i \mathcal{O}_i \implies R_K \approx 1 + 0.22 (\Delta C_9 - \Delta C_{10})"
            />
          </div>
          <p className="text-xs text-text-secondary font-mono mt-1">
            Flavour-changing neutral current transition b &rarr; s l⁺ l⁻, effective field theory Wilson coefficients, and comparative muon vs electron forward event display.
          </p>
        </div>

        {/* Channel & Lepton Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center border-2 border-black">
            <button
              onClick={() => setSelectedChannel('RK')}
              className={`px-3 py-1 font-bold uppercase transition-all ${
                selectedChannel === 'RK'
                  ? 'bg-cern-cyan text-black'
                  : 'bg-canvas-sub text-text-muted hover:text-white'
              }`}
            >
              R_K (B⁺ &rarr; K⁺)
            </button>
            <button
              onClick={() => setSelectedChannel('RKstar')}
              className={`px-3 py-1 font-bold uppercase transition-all ${
                selectedChannel === 'RKstar'
                  ? 'bg-cern-magenta text-white'
                  : 'bg-canvas-sub text-text-muted hover:text-white'
              }`}
            >
              R_K* (B⁰ &rarr; K*⁰)
            </button>
          </div>

          <div className="flex items-center border-2 border-black shadow-[2px_2px_0px_#000]">
            <button
              onClick={() => setLeptonMode('muon')}
              className={`px-3 py-1 font-bold uppercase transition-all ${
                leptonMode === 'muon'
                  ? 'bg-cern-magenta text-white'
                  : 'bg-canvas-sub text-text-muted hover:text-white'
              }`}
            >
              μ⁺μ⁻ (Muon)
            </button>
            <button
              onClick={() => setLeptonMode('electron')}
              className={`px-3 py-1 font-bold uppercase transition-all ${
                leptonMode === 'electron'
                  ? 'bg-amber-400 text-black'
                  : 'bg-canvas-sub text-text-muted hover:text-white'
              }`}
            >
              e⁺e⁻ (Electron)
            </button>
          </div>
        </div>
      </div>

      {/* Presets Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-text-muted font-bold mr-1">PHYSICS PRESETS:</span>
        <button
          onClick={() => applyPreset('sm')}
          className="px-3 py-1 bg-canvas-sub text-white hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#000] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Standard Model (ΔC₉ = 0, ΔC₁₀ = 0)
        </button>
        <button
          onClick={() => applyPreset('leptoquark')}
          className="px-3 py-1 bg-canvas-sub text-cern-cyan hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#00E5FF] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Vector Leptoquark U₁ (ΔC₉ = -ΔC₁₀ = -0.4)
        </button>
        <button
          onClick={() => applyPreset('zprime')}
          className="px-3 py-1 bg-canvas-sub text-amber-300 hover:bg-canvas-raised border-2 border-black shadow-[2px_2px_0px_#FFE600] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Heavy Z&apos; Boson (ΔC₉ = -0.85)
        </button>
        <button
          onClick={() => applyPreset('anomaly2021')}
          className="px-3 py-1 bg-red-950 text-red-300 hover:bg-red-900 border-2 border-black shadow-[2px_2px_0px_#FF0055] font-bold active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          Historical 2021 Anomaly Fit (R_K ≈ 0.85)
        </button>
      </div>

      {/* Main Grid: Controls (4 cols) + Visualizer & Metrics (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sliders Deck */}
        <div className="lg:col-span-4 bg-canvas-sub p-4 border-3 border-black shadow-[5px_5px_0px_#000] space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <span className="font-bold text-white uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cern-cyan" />
              Wilson Coefficients
            </span>
            <span className="text-[10px] text-cern-cyan font-bold">μ-Coupling Shifts</span>
          </div>

          {/* Slider 1: Delta C9 (Vector) */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Vector Shift (ΔC₉^μ):</span>
              <span
                className={`font-bold ${
                  deltaC9 === 0 ? 'text-white' : deltaC9 < 0 ? 'text-cern-cyan' : 'text-amber-400'
                }`}
              >
                {deltaC9 > 0 ? `+${deltaC9.toFixed(2)}` : deltaC9.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-2.0}
              max={1.0}
              step={0.05}
              value={deltaC9}
              onChange={(e) => setDeltaC9(Number(e.target.value))}
              className="w-full cursor-pointer accent-cern-cyan"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>-2.0 (New Physics)</span>
              <span>0.0 (SM)</span>
              <span>+1.0</span>
            </div>
          </div>

          {/* Slider 2: Delta C10 (Axial-Vector) */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">Axial Shift (ΔC₁₀^μ):</span>
              <span
                className={`font-bold ${
                  deltaC10 === 0 ? 'text-white' : deltaC10 > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {deltaC10 > 0 ? `+${deltaC10.toFixed(2)}` : deltaC10.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-1.0}
              max={1.5}
              step={0.05}
              value={deltaC10}
              onChange={(e) => setDeltaC10(Number(e.target.value))}
              className="w-full cursor-pointer accent-cern-yellow"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>-1.0</span>
              <span>0.0 (SM)</span>
              <span>+1.5</span>
            </div>
          </div>

          {/* Slider 3: Dilepton Mass Squared q^2 */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-bold">q² = m²(ℓ⁺ℓ⁻):</span>
              <span className="text-amber-300 font-bold">{q2Value.toFixed(2)} GeV²</span>
            </div>
            <input
              type="range"
              min={1.1}
              max={6.0}
              step={0.1}
              value={q2Value}
              onChange={(e) => setQ2Value(Number(e.target.value))}
              className="w-full cursor-pointer accent-amber-300"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>1.1 GeV² (Low q²)</span>
              <span>6.0 GeV² (Pre-J/ψ)</span>
            </div>
          </div>

          {/* Animation Action Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="py-2.5 bg-canvas-surface hover:bg-canvas-raised text-white font-bold uppercase border-2 border-black shadow-[2px_2px_0px_#000] transition-all flex items-center justify-center gap-1.5"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button
              onClick={triggerDecay}
              className="py-2.5 bg-cern-blue hover:bg-cern-accent text-white font-bold uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cern-cyan fill-current" />
              <span>RESTART DECAY</span>
            </button>
          </div>

          {/* LHCb 2023 Measurement Status Card */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1.5 text-[11px]">
            <span className="text-[10px] font-bold uppercase text-cern-cyan block">
              LHCb Run 1+2 &amp; Run 3 Status:
            </span>
            <div className="flex justify-between">
              <span className="text-text-muted">Published R_K:</span>
              <span className="font-bold text-white">0.949 ± 0.047</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Published R_K*:</span>
              <span className="font-bold text-white">1.027 ± 0.077</span>
            </div>
            <p className="text-[10px] text-emerald-400 leading-normal pt-1 border-t border-zinc-800">
              Compatible with Lepton Universality (SM) within 1.0σ.
            </p>
          </div>
        </div>

        {/* Right Visualizer & Spectrometer Display (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Calculated R_K</span>
              <span className="text-xl font-bold text-cern-cyan">
                {physics.RK_value.toFixed(3)}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                SM: 1.000 ± 0.010
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Calculated R_K*</span>
              <span className="text-xl font-bold text-white">
                {physics.RKstar_value.toFixed(3)}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                Vector meson final state
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Angular P₅&apos;(q²)</span>
              <span className="text-xl font-bold text-amber-300">
                {physics.P5_prime.toFixed(3)}
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                SM: {physics.P5_prime_SM.toFixed(3)}
              </span>
            </div>

            <div className="bg-canvas-sub p-3 border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-text-muted block text-[10px] uppercase font-bold">Branching Rate</span>
              <span className="text-xl font-bold text-emerald-400">
                {physics.branchingRatio_e7.toFixed(2)} &times; 10⁻⁷
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                per GeV² q² bin
              </span>
            </div>
          </div>

          {/* Spectrometer Event Display Canvas */}
          <div className="bg-canvas-sub p-4 border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-2 text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cern-cyan" />
                LHCb 20m Spectrometer Display ({leptonMode === 'muon' ? 'Dimuon Channel' : 'Dielectron Channel'})
              </span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-cern-cyan font-bold">• K⁺ Kaon</span>
                <span className="text-emerald-400 font-bold">• π⁻ Pion</span>
                <span className={leptonMode === 'muon' ? 'text-cern-magenta font-bold' : 'text-amber-400 font-bold'}>
                  {leptonMode === 'muon' ? '• μ⁺μ⁻ Muons' : '• e⁺e⁻ Electrons'}
                </span>
              </div>
            </div>

            <div className="relative w-full h-52 bg-black border-2 border-black overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={650}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Differential Operator & Channel Note Display */}
            <div className="p-3 bg-canvas-surface border-2 border-black grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-text-muted text-[10px] block uppercase font-bold">
                  Effective Operator Coefficients:
                </span>
                <div className="text-[11px] text-white">
                  C₉^eff = <strong className="text-cern-cyan">{physics.C9_eff.toFixed(2)}</strong> (SM = 4.10)
                </div>
                <div className="text-[11px] text-white">
                  C₁₀^eff = <strong className="text-amber-300">{physics.C10_eff.toFixed(2)}</strong> (SM = -4.30)
                </div>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-text-muted text-[10px] block uppercase font-bold">
                  Compatibility with 2023 LHCb Data:
                </span>
                <div className="text-[11px] text-emerald-400 font-bold">
                  Pull = {physics.pullSigmas.toFixed(2)} σ
                </div>
                <div className="text-[10px] text-text-muted">
                  {physics.pullSigmas < 2.0 ? 'Agreement within experimental errors' : 'Discrepancy with measurement'}
                </div>
              </div>
            </div>
          </div>

          {/* Live R_K / R_K* Ratio & P5' Angular Observable Plotter */}
          <div className="bg-canvas-sub p-4 border-2 border-black shadow-[4px_4px_0px_#000] space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-2 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white uppercase">
                  {observablePlot === 'ratio'
                    ? `Live ${selectedChannel === 'RK' ? 'R_K' : 'R_K*'} Ratio vs q² [GeV²]`
                    : `Angular Observable P₅'(q²) vs q² [GeV²]`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-black shadow-[1px_1px_0px_#000] text-[10px]">
                  <button
                    onClick={() => setObservablePlot('ratio')}
                    className={`px-2.5 py-0.5 font-bold uppercase transition-all ${
                      observablePlot === 'ratio'
                        ? 'bg-cern-cyan text-black'
                        : 'bg-canvas-sub text-text-muted hover:text-white'
                    }`}
                  >
                    R_K Ratio
                  </button>
                  <button
                    onClick={() => setObservablePlot('p5prime')}
                    className={`px-2.5 py-0.5 font-bold uppercase transition-all ${
                      observablePlot === 'p5prime'
                        ? 'bg-purple-500 text-white'
                        : 'bg-canvas-sub text-text-muted hover:text-white'
                    }`}
                  >
                    P₅&apos; Angular
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] pl-1">
                  <span className="text-emerald-400 font-bold">— SM</span>
                  <span className="text-cern-cyan font-bold">— EFT</span>
                  <span className="text-amber-300 font-bold">• Data</span>
                </div>
              </div>
            </div>

            {observablePlot === 'ratio' ? (
              /* SVG Plot 1: R_K / R_K* Lepton Universality domain q2 in [1.0, 6.0], range R in [0.6, 1.4] */
              <div className="w-full h-36 bg-black border-2 border-black relative p-2">
                <svg viewBox="0 0 500 120" className="w-full h-full">
                  {/* Horizontal grid lines */}
                  <line x1="40" y1="10" x2="480" y2="10" stroke="#1E293B" strokeWidth="1" />
                  <line x1="40" y1="35" x2="480" y2="35" stroke="#1E293B" strokeWidth="1" />
                  <line x1="40" y1="60" x2="480" y2="60" stroke="#334155" strokeWidth="1.5" />
                  <line x1="40" y1="85" x2="480" y2="85" stroke="#1E293B" strokeWidth="1" />
                  <line x1="40" y1="110" x2="480" y2="110" stroke="#1E293B" strokeWidth="1" />

                  {/* Y-axis labels */}
                  <text x="35" y="13" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="monospace">1.4</text>
                  <text x="35" y="38" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="monospace">1.2</text>
                  <text x="35" y="63" fill="#00FF66" fontSize="8" textAnchor="end" fontFamily="monospace" fontWeight="bold">1.0</text>
                  <text x="35" y="88" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="monospace">0.8</text>
                  <text x="35" y="113" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="monospace">0.6</text>

                  {/* X-axis labels (q2 = 1.0 to 6.0) */}
                  {[1, 2, 3, 4, 5, 6].map((q) => {
                    const qx = 40 + (q - 1.0) * (440 / 5.0);
                    return (
                      <g key={q}>
                        <line x1={qx} y1="10" x2={qx} y2="110" stroke="#1E293B" strokeWidth="1" strokeDasharray="2,2" />
                        <text x={qx} y="118" fill="#64748B" fontSize="8" textAnchor="middle" fontFamily="monospace">
                          {q}.0
                        </text>
                      </g>
                    );
                  })}

                  {/* SM Theoretical Band (1.000 ± 0.010) */}
                  <rect x="40" y="58" width="440" height="4" fill="rgba(0, 255, 102, 0.15)" />
                  <line x1="40" y1="60" x2="480" y2="60" stroke="#00FF66" strokeWidth="1.5" strokeDasharray="4,4" />

                  {/* New Physics Model Curve */}
                  {(() => {
                    const targetR = selectedChannel === 'RK' ? physics.RK_value : physics.RKstar_value;
                    const curveY = 60 - ((targetR - 1.0) / 0.8) * 100;
                    const clampedY = Math.max(10, Math.min(110, curveY));
                    return (
                      <line
                        x1="40"
                        y1={clampedY}
                        x2="480"
                        y2={clampedY}
                        stroke="#00E5FF"
                        strokeWidth="2.5"
                      />
                    );
                  })()}

                  {/* LHCb 2023 Measurement with Error Bars */}
                  {(() => {
                    const expVal = selectedChannel === 'RK' ? physics.expRK : physics.expRKstar;
                    const expErr = selectedChannel === 'RK' ? physics.expRK_err : physics.expRKstar_err;
                    const expX = 40 + (3.5 - 1.0) * (440 / 5.0); // low q2 center ~3.5
                    const expY = 60 - ((expVal - 1.0) / 0.8) * 100;
                    const errTopY = 60 - (((expVal + expErr) - 1.0) / 0.8) * 100;
                    const errBottomY = 60 - (((expVal - expErr) - 1.0) / 0.8) * 100;

                    return (
                      <g>
                        <line x1={expX} y1={errTopY} x2={expX} y2={errBottomY} stroke="#FFE600" strokeWidth="2" />
                        <line x1={expX - 5} y1={errTopY} x2={expX + 5} y2={errTopY} stroke="#FFE600" strokeWidth="2" />
                        <line x1={expX - 5} y1={errBottomY} x2={expX + 5} y2={errBottomY} stroke="#FFE600" strokeWidth="2" />
                        <circle cx={expX} cy={expY} r="4" fill="#FFE600" stroke="#000" strokeWidth="1.5" />
                        <text x={expX + 8} y={expY - 4} fill="#FFE600" fontSize="8" fontFamily="monospace" fontWeight="bold">
                          {selectedChannel === 'RK' ? 'LHCb RK' : 'LHCb RK*'}: {expVal.toFixed(3)} ± {expErr.toFixed(3)}
                        </text>
                      </g>
                    );
                  })()}

                  {/* Current Selected q^2 Operating Point Marker */}
                  {(() => {
                    const targetR = selectedChannel === 'RK' ? physics.RK_value : physics.RKstar_value;
                    const currX = 40 + (q2Value - 1.0) * (440 / 5.0);
                    const currY = Math.max(10, Math.min(110, 60 - ((targetR - 1.0) / 0.8) * 100));

                    return (
                      <g>
                        <circle cx={currX} cy={currY} r="5" fill="#FF0055" stroke="#FFFFFF" strokeWidth="2" />
                        <line x1={currX} y1="10" x2={currX} y2="110" stroke="#FF0055" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            ) : (
              /* SVG Plot 2: P5' Angular Observable vs q2: domain [1.0, 6.0], range P5' in [-1.0, +0.6] */
              <div className="w-full h-36 bg-black border-2 border-black relative p-2">
                <svg viewBox="0 0 500 120" className="w-full h-full">
                  {/* Grid lines: P5' = +0.5 -> y=12, P5' = 0 -> y=50, P5' = -0.5 -> y=88, P5' = -1.0 -> y=115 */}
                  <line x1="40" y1="12" x2="480" y2="12" stroke="#1E293B" strokeWidth="1" />
                  <line x1="40" y1="50" x2="480" y2="50" stroke="#334155" strokeWidth="1.5" />
                  <line x1="40" y1="88" x2="480" y2="88" stroke="#1E293B" strokeWidth="1" />

                  {/* Y-axis labels */}
                  <text x="35" y="15" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="monospace">+0.5</text>
                  <text x="35" y="53" fill="#00FF66" fontSize="8" textAnchor="end" fontFamily="monospace" fontWeight="bold">0.0</text>
                  <text x="35" y="91" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="monospace">-0.5</text>

                  {/* X-axis labels (q2 = 1.0 to 6.0) */}
                  {[1, 2, 3, 4, 5, 6].map((q) => {
                    const qx = 40 + (q - 1.0) * (440 / 5.0);
                    return (
                      <g key={q}>
                        <line x1={qx} y1="10" x2={qx} y2="110" stroke="#1E293B" strokeWidth="1" strokeDasharray="2,2" />
                        <text x={qx} y="118" fill="#64748B" fontSize="8" textAnchor="middle" fontFamily="monospace">
                          {q}.0
                        </text>
                      </g>
                    );
                  })}

                  {/* SM Curve: P5_sm = -0.35 * (q2 - 3.8); y = 50 - P5 * 76 */}
                  {(() => {
                    const smPoints: string[] = [];
                    const eftPoints: string[] = [];
                    for (let q = 1.0; q <= 6.0; q += 0.2) {
                      const qx = 40 + (q - 1.0) * (440 / 5.0);
                      const smP5 = -0.35 * (q - 3.8);
                      const eftP5 = Math.max(-1.0, Math.min(0.8, smP5 - 0.28 * deltaC9));
                      const smY = Math.max(10, Math.min(115, 50 - smP5 * 76));
                      const eftY = Math.max(10, Math.min(115, 50 - eftP5 * 76));
                      smPoints.push(`${qx.toFixed(1)},${smY.toFixed(1)}`);
                      eftPoints.push(`${qx.toFixed(1)},${eftY.toFixed(1)}`);
                    }
                    return (
                      <g>
                        <polyline points={smPoints.join(' ')} fill="none" stroke="#00FF66" strokeWidth="1.5" strokeDasharray="4,4" />
                        <polyline points={eftPoints.join(' ')} fill="none" stroke="#00E5FF" strokeWidth="2.5" />
                      </g>
                    );
                  })()}

                  {/* LHCb Historical Anomaly Point at q2 ≈ 5.0: P5' ≈ -0.15 ± 0.12 */}
                  {(() => {
                    const dataQ = 5.0;
                    const dataP5 = -0.15;
                    const dataErr = 0.12;
                    const dx = 40 + (dataQ - 1.0) * (440 / 5.0);
                    const dy = 50 - dataP5 * 76;
                    const topY = 50 - (dataP5 + dataErr) * 76;
                    const botY = 50 - (dataP5 - dataErr) * 76;
                    return (
                      <g>
                        <line x1={dx} y1={topY} x2={dx} y2={botY} stroke="#FFE600" strokeWidth="2" />
                        <line x1={dx - 4} y1={topY} x2={dx + 4} y2={topY} stroke="#FFE600" strokeWidth="2" />
                        <line x1={dx - 4} y1={botY} x2={dx + 4} y2={botY} stroke="#FFE600" strokeWidth="2" />
                        <circle cx={dx} cy={dy} r="4" fill="#FFE600" stroke="#000" strokeWidth="1.5" />
                        <text x={dx + 7} y={dy - 4} fill="#FFE600" fontSize="8" fontFamily="monospace" fontWeight="bold">
                          LHCb: -0.15 ± 0.12 (3.4σ)
                        </text>
                      </g>
                    );
                  })()}

                  {/* Selected Operating Point Marker */}
                  {(() => {
                    const currX = 40 + (q2Value - 1.0) * (440 / 5.0);
                    const currY = Math.max(10, Math.min(115, 50 - physics.P5_prime * 76));
                    return (
                      <g>
                        <circle cx={currX} cy={currY} r="5" fill="#FF0055" stroke="#FFFFFF" strokeWidth="2" />
                        <line x1={currX} y1="10" x2={currX} y2="115" stroke="#FF0055" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            )}

            <div className="flex justify-between text-[10px] text-text-muted">
              <span>{observablePlot === 'ratio' ? 'Low-q² Dilepton Window [1.1, 6.0] GeV²' : 'P₅\' Zero-Crossing SM Prediction at q² ≈ 3.8 GeV²'}</span>
              <span>LHCb Nature Physics 2022 &amp; Phys. Rev. Lett. 131 (2023)</span>
            </div>
          </div>

          {/* Export Deck */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-black text-xs font-mono">
            <span className="text-text-muted text-[11px]">
              EFT Wilson Hamiltonian &amp; LHCb Run 1-3 Lepton Universality Model
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
