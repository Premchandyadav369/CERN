'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import {
  calculateSacredTimelineVacuum,
  SeededRNG,
  HIGGS_MASS_GEV,
  TOP_QUARK_MASS_GEV,
} from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import {
  drawAdditiveGlowDot,
  drawCernGridBackdrop,
  drawPhosphorCurve,
  observeOffscreenVisibility,
  setupHiDpiCanvas,
} from '@/lib/cernVisuals';
import { playTimeChargeSweep, playTemPadClick, playDiscoveryChime } from '@/lib/sonifier';
import { TvaTimeline3DLoom } from '@/components/simulations/TvaTimeline3DLoom';
import { Clock, Play, Pause, Scissors, AlertTriangle, ShieldCheck, Activity, Box, Columns } from 'lucide-react';

interface TimelinePreset {
  id: string;
  code: string;
  label: string;
  higgsMassGev: number;
  topMassGev: number;
  alphaS: number;
  note: string;
}

const TVA_PRESETS: TimelinePreset[] = [
  {
    id: 'sacred-616',
    code: 'TIMELINE 616 // CERN PDG',
    label: 'CERN Reality (m_H 125.25, m_t 172.69)',
    higgsMassGev: HIGGS_MASS_GEV,
    topMassGev: TOP_QUARK_MASS_GEV,
    alphaS: 0.1179,
    note: 'Real ATLAS + CMS measurements place our universe delicately inside the Metastable zone (Λ_I ≈ 10^10.8 GeV, lifetime >> 10^100 yr).',
  },
  {
    id: 'locked-sacred',
    code: 'SACRED LOCK // FCC STABLE',
    label: 'Absolute Stability (m_H 134.0 GeV)',
    higgsMassGev: 134.0,
    topMassGev: 170.8,
    alphaS: 0.1195,
    note: 'Higher Higgs self-coupling keeps λ(μ) > 0 all the way to the Planck Scale (10^19 GeV). No vacuum nexus branches cross the Red Line.',
  },
  {
    id: 'nexus-redline',
    code: 'NEXUS BREACH // RED LINE',
    label: 'False Vacuum Decay (m_H 108.5 GeV)',
    higgsMassGev: 108.5,
    topMassGev: 178.5,
    alphaS: 0.1145,
    note: 'Heavy top-quark radiative loops yank λ(μ) deeply negative early, triggering rapid electroweak bubble nucleation across the Red Line.',
  },
  {
    id: 'heavy-top',
    code: 'BRANCH DELTA // HEAVY TOP',
    label: 'Top Quark Shift (m_t 176.2 GeV)',
    higgsMassGev: 125.25,
    topMassGev: 176.2,
    alphaS: 0.117,
    note: 'Raising m_t by just ~3.5 GeV steepens the RG slope, lowering the instability barrier scale Λ_I by orders of magnitude!',
  },
];

interface QuantumBranch {
  id: string;
  label: string;
  startFrac: number;
  direction: -1 | 1;
  amplitudePx: number;
  crossesRedline: boolean;
  growthRate: number;
}

export const TvaTimelineSimulator: React.FC = () => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const completeMission = useGlobalStore((s) => s.completeMission);
  const sliderPrefix = useId();

  const [viewMode, setViewMode] = useState<'crt-2d' | 'loom-3d' | 'comparator'>('crt-2d');
  const [activePresetId, setActivePresetId] = useState<string>('sacred-616');
  const [higgsMassGev, setHiggsMassGev] = useState<number>(HIGGS_MASS_GEV);
  const [topMassGev, setTopMassGev] = useState<number>(TOP_QUARK_MASS_GEV);
  const [alphaS, setAlphaS] = useState<number>(0.1179);
  const [branchSeed, setBranchSeed] = useState<number>(616);
  const [pruneCount, setPruneCount] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [pruneProgress, setPruneProgress] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeRef = useRef<number>(0);

  const vacuum = useMemo(
    () => calculateSacredTimelineVacuum(higgsMassGev, topMassGev, alphaS),
    [higgsMassGev, topMassGev, alphaS]
  );

  const sacred616Baseline = useMemo(
    () => calculateSacredTimelineVacuum(HIGGS_MASS_GEV, TOP_QUARK_MASS_GEV, 0.1179),
    []
  );

  // Deterministic CERN decay / vacuum quantum branches driven by SeededRNG and physics branchRiskFraction
  const branches = useMemo<QuantumBranch[]>(() => {
    const rng = new SeededRNG(branchSeed + Math.round(higgsMassGev * 10 + topMassGev * 10));
    const labels = [
      'H⁰ → γγ',
      't-loop RG',
      'W⁺W⁻* br.',
      'λ(μ)→0',
      'H⁰ → Z Z*',
      'BSM SU(2)',
      'EWSB VEV',
      'Top Yukawa',
      'Planck UV',
    ];
    const redlineDistPx = 68;
    const count = 7;

    return Array.from({ length: count }, (_, idx) => {
      const startFrac = 0.14 + (idx / count) * 0.68 + (rng.nextFloat() - 0.5) * 0.05;
      const direction: -1 | 1 = idx % 2 === 0 ? -1 : 1;
      const roll = rng.nextFloat();
      const crosses = roll < vacuum.branchRiskFraction;
      const amp = crosses
        ? redlineDistPx + 14 + rng.nextFloat() * 30
        : 22 + rng.nextFloat() * (redlineDistPx - 30);

      return {
        id: `BR-${branchSeed}-${idx + 1}`,
        label: labels[(idx + branchSeed) % labels.length],
        startFrac,
        direction,
        amplitudePx: amp,
        crossesRedline: crosses,
        growthRate: 0.7 + rng.nextFloat() * 0.8,
      };
    });
  }, [branchSeed, higgsMassGev, topMassGev, vacuum.branchRiskFraction]);

  // Animate Sacred Timeline CRT canvas + Pruning Time-Charge sweep
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let isVisible = true;
    const cleanupVis = observeOffscreenVisibility(canvas, (v) => {
      isVisible = v;
    });
    let animId = 0;

    const render = () => {
      if (isPlaying && !reduceMotion && isVisible) {
        timeRef.current += 0.025;
      }
      const vp = setupHiDpiCanvas(canvas, 680, 290);
      if (!vp || !isVisible) {
        if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
        return;
      }
      const { ctx, width: w, height: h } = vp;
      const t = timeRef.current;
      const cy = h / 2;
      const redlineOffset = 68;

      drawCernGridBackdrop(ctx, w, h, {
        accentColor: 'rgba(255, 176, 0, 0.08)',
        bgInner: '#1E1105',
        bgOuter: '#0A0602',
        gridStep: 28,
        showScanlines: true,
        showCrosshair: false,
      });

      // Red Line Variance Thresholds (top & bottom)
      const drawRedline = (yPos: number, tag: string) => {
        ctx.save();
        ctx.setLineDash([7, 5]);
        ctx.strokeStyle = '#FF334B';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(14, yPos);
        ctx.lineTo(w - 14, yPos);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#FF6B7F';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(tag, 18, yPos < cy ? yPos - 6 : yPos + 13);
      };

      drawRedline(cy - redlineOffset, '▲ VARIANCE RED LINE (+λ INSTABILITY BOUND)');
      drawRedline(cy + redlineOffset, '▼ VARIANCE RED LINE (−λ TUNNELING BOUND)');

      // Phosphor Quantum Vacuum Branches behind Sacred Timeline core
      const activeSweepX = pruneProgress !== null ? pruneProgress * w : -1;

      branches.forEach((b, idx) => {
        const startX = b.startFrac * w;
        const endX = Math.min(w - 22, startX + 145 + idx * 12);

        const prunedFactor =
          activeSweepX > startX
            ? Math.max(0.08, 1 - Math.min(1, (activeSweepX - startX) / 95))
            : 1;

        const targetY = cy + b.direction * b.amplitudePx * prunedFactor;
        const waveWobble =
          isPlaying && !reduceMotion ? Math.sin(t * 1.8 * b.growthRate + idx) * 4 * prunedFactor : 0;

        // Sample cubic bezier into discrete points for multi-pass phosphor CRT glow
        const pts: { x: number; y: number }[] = [];
        const p0x = startX;
        const p0y = cy;
        const p1x = startX + 42;
        const p1y = cy + b.direction * 6 * prunedFactor;
        const p2x = startX + 68;
        const p2y = targetY + waveWobble;
        const p3x = endX;
        const p3y = targetY + waveWobble;
        for (let s = 0; s <= 18; s++) {
          const u = s / 18;
          const mu = 1 - u;
          const bx = mu * mu * mu * p0x + 3 * mu * mu * u * p1x + 3 * mu * u * u * p2x + u * u * u * p3x;
          const by = mu * mu * mu * p0y + 3 * mu * mu * u * p1y + 3 * mu * u * u * p2y + u * u * u * p3y;
          pts.push({ x: bx, y: by });
        }

        const isRed = b.crossesRedline && prunedFactor > 0.4;
        const bCol = isRed ? (vacuum.regime === 'REDLINE' ? '#FF2A4B' : '#FF6B35') : '#38BDF8';
        drawPhosphorCurve(ctx, pts, bCol, isRed ? 2.1 : 1.5, 0.92);

        const tipY = targetY + waveWobble;
        drawAdditiveGlowDot(ctx, endX, tipY, isRed ? 14 : 9, isRed ? '255, 51, 75' : '0, 229, 255', 0.9);

        if (prunedFactor > 0.45) {
          ctx.fillStyle = isRed ? '#FFA3AF' : '#93E6FF';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(b.label, Math.min(w - 64, endX + 7), tipY + 3);
        }
      });

      // Luminous Braided TVA Sacred Timeline along center with multi-strand phosphor bloom
      for (let strand = -1; strand <= 1; strand++) {
        const strandPts: { x: number; y: number }[] = [];
        for (let x = 10; x <= w - 10; x += 7) {
          const phase = x * 0.025 - (isPlaying && !reduceMotion ? t * 2.1 : 0);
          const braidOffset =
            strand * 4.5 * Math.sin(phase + strand * 1.4) + Math.cos(phase * 0.5) * 1.8;
          strandPts.push({ x, y: cy + braidOffset });
        }
        const strandCol =
          strand === 0 ? '#FFD166' : vacuum.regime === 'REDLINE' ? '#FF5E73' : '#FFB000';
        drawPhosphorCurve(ctx, strandPts, strandCol, strand === 0 ? 2.8 : 1.35, strand === 0 ? 1.0 : 0.7);
      }

      // Present epoch marker (13.8 Gyr LHC observation)
      const nowX = w * 0.52;
      ctx.strokeStyle = 'rgba(255, 224, 130, 0.45)';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(nowX, 24);
      ctx.lineTo(nowX, h - 20);
      ctx.stroke();

      drawAdditiveGlowDot(ctx, nowX, cy, 18, '255, 224, 130', 0.85);
      ctx.fillStyle = '#FFE082';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('LHC EPOCH (13.8 Gyr)', nowX - 58, 18);

      // Animated Time-Charge Reset Wavefront
      if (pruneProgress !== null) {
        const sweepX = pruneProgress * w;
        const grad = ctx.createLinearGradient(sweepX - 45, 0, sweepX + 12, 0);
        grad.addColorStop(0, 'rgba(255, 176, 0, 0)');
        grad.addColorStop(0.75, 'rgba(255, 176, 0, 0.55)');
        grad.addColorStop(1, 'rgba(255, 245, 200, 0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(Math.max(0, sweepX - 45), 0, 57, h);

        ctx.fillStyle = '#FFE082';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('RESET CHARGE SWEEP', Math.max(8, sweepX - 115), h - 10);
      }

      if (isPlaying && !reduceMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      cleanupVis();
    };
  }, [branches, isPlaying, reduceMotion, pruneProgress, vacuum.regime]);

  // Step Time-Charge Reset Wave animation cleanly
  useEffect(() => {
    if (pruneProgress === null) return;
    if (reduceMotion) {
      setPruneProgress(null);
      setBranchSeed((s) => s + 17);
      setPruneCount((c) => c + 1);
      return;
    }
    const timer = setInterval(() => {
      setPruneProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 1.15) {
          setBranchSeed((s) => s + 17);
          setPruneCount((c) => c + 1);
          return null;
        }
        return prev + 0.045;
      });
    }, 28);
    return () => clearInterval(timer);
  }, [pruneProgress, reduceMotion]);

  const triggerResetCharge = () => {
    if (pruneProgress !== null) return;
    playTimeChargeSweep();
    completeMission('mission-tva-prune');
    setPruneProgress(0);
    if (reduceMotion) playDiscoveryChime();
  };

  const applyPreset = (p: TimelinePreset) => {
    playTemPadClick();
    setActivePresetId(p.id);
    setHiggsMassGev(p.higgsMassGev);
    setTopMassGev(p.topMassGev);
    setAlphaS(p.alphaS);
  };

  // Build SVG path for RG running quartic coupling lambda(mu)
  const rgPlot = useMemo(() => {
    const pts = vacuum.runningCouplingSamples;
    const minL = -0.08;
    const maxL = 0.2;
    const toX = (logMu: number) => 36 + ((logMu - 2) / 17) * 308;
    const toY = (l: number) => {
      const clamped = Math.max(minL, Math.min(maxL, l));
      return 12 + (1 - (clamped - minL) / (maxL - minL)) * 96;
    };
    const pathD = pts
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(pt.log10MuGev).toFixed(1)} ${toY(pt.lambdaEff).toFixed(1)}`)
      .join(' ');
    const zeroY = toY(0);
    return { pathD, zeroY, toX };
  }, [vacuum.runningCouplingSamples]);

  const activePreset = TVA_PRESETS.find((p) => p.id === activePresetId) || TVA_PRESETS[0];

  const regimeColors =
    vacuum.regime === 'STABLE'
      ? { badgeBg: 'bg-emerald-400 text-black', label: 'SACRED TIMELINE LOCKED (STABLE)' }
      : vacuum.regime === 'METASTABLE'
      ? { badgeBg: 'bg-[#FFB000] text-black', label: 'METASTABLE NEXUS ZONE' }
      : { badgeBg: 'bg-[#FF334B] text-white', label: 'NEXUS REDLINE BREACH' };

  return (
    <div className="space-y-5">
      <Eli5Card
        title="The Real CERN 'Sacred Timeline': Why Two Particle Masses Decide Cosmic Stability!"
        analogy="At CERN, physicists weighed the Higgs boson (125.25 GeV) and Top quark (172.69 GeV) so precisely that they unlocked the universe’s Vacuum Phase Map! The Top quark pulls quantum energy downward while the Higgs boson pushes upward—leaving our cosmos right beside a metastable Red Line where only quantum stability keeps timelines safe for trillions of cosmic ages!"
      />

      {/* Main TVA Retro-CRT Header */}
      <div className="p-5 bg-[#1A1006] border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4 cern-tva-scanlines">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <FidelityBadge type="ANALYTIC" />
            <span className="px-2 py-0.5 bg-[#FFB000] text-black font-mono font-black text-[10px] border-2 border-black uppercase tracking-wider">
              TIME VARIANCE AUTHORITY // FILE #SM-616
            </span>
            <span className={`px-2 py-0.5 font-mono font-black text-[10px] border-2 border-black uppercase ${regimeColors.badgeBg}`}>
              {regimeColors.label}
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-[#FFE082] tracking-tight">
            TVA Sacred Timeline &amp; Electroweak Vacuum Branching Lab
          </h2>
          <p className="text-xs text-[#F5C77E] font-mono mt-1">
            Educational TVA-inspired monitor powered by NNLO Standard Model Higgs quartic running λ(μ) &amp; Degrassi/Buttazzo stability bounds.
          </p>
        </div>

        <button
          type="button"
          onClick={triggerResetCharge}
          disabled={pruneProgress !== null}
          className="px-4 py-2.5 bg-[#FFB000] hover:bg-[#FFC947] disabled:opacity-60 text-black font-mono font-black text-xs border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
        >
          <Scissors className="w-4 h-4" />
          <span>{pruneProgress !== null ? 'PRUNING NEXUS...' : 'DETONATE TIME-CHARGE (PRUNE)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left 4 Cols: TemPad Presets & Particle Mass Tuners */}
        <div className="xl:col-span-4 space-y-4 bg-[#170F07] border-3 border-black p-4 shadow-[5px_5px_0px_#000]">
          <h3 className="text-xs font-mono font-black uppercase text-[#FFB000] border-b border-[#4A2E10] pb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> TemPad Timeline Scenarios
          </h3>

          <div className="space-y-1.5">
            {TVA_PRESETS.map((p) => {
              const active = p.id === activePresetId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`w-full text-left px-3 py-2 border-2 border-black font-mono transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FFB000] text-black shadow-[3px_3px_0px_#000]'
                      : 'bg-[#23160A] text-[#F5C77E] hover:bg-[#2F1D0D]'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase opacity-80">{p.code}</div>
                  <div className="text-xs font-bold">{p.label}</div>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-[#23160A] border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-mh`} className="text-[#F5C77E] uppercase">
                Higgs Boson Mass m_H:
              </label>
              <span className="text-[#FFE082]">{higgsMassGev.toFixed(2)} GeV</span>
            </div>
            <input
              id={`${sliderPrefix}-mh`}
              type="range"
              min={102}
              max={145}
              step={0.05}
              value={higgsMassGev}
              aria-valuetext={`${higgsMassGev.toFixed(2)} GeV`}
              onChange={(e) => setHiggsMassGev(Number(e.target.value))}
              className="cern-tva-slider w-full cursor-pointer"
            />
          </div>

          <div className="p-2.5 bg-[#23160A] border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-mt`} className="text-[#F5C77E] uppercase">
                Top Quark Mass m_t:
              </label>
              <span className="text-[#FF6B35]">{topMassGev.toFixed(2)} GeV</span>
            </div>
            <input
              id={`${sliderPrefix}-mt`}
              type="range"
              min={165}
              max={183}
              step={0.05}
              value={topMassGev}
              aria-valuetext={`${topMassGev.toFixed(2)} GeV`}
              onChange={(e) => setTopMassGev(Number(e.target.value))}
              className="cern-tva-slider w-full cursor-pointer"
            />
          </div>

          <div className="p-2.5 bg-[#23160A] border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-as`} className="text-[#F5C77E] uppercase">
                Strong Coupling α_s(M_Z):
              </label>
              <span className="text-cern-cyan">{alphaS.toFixed(4)}</span>
            </div>
            <input
              id={`${sliderPrefix}-as`}
              type="range"
              min={0.113}
              max={0.123}
              step={0.0005}
              value={alphaS}
              aria-valuetext={alphaS.toFixed(4)}
              onChange={(e) => setAlphaS(Number(e.target.value))}
              className="cern-tva-slider w-full cursor-pointer"
            />
          </div>

          <div className="p-2.5 bg-[#FFB000] border-2 border-black text-[11px] font-mono font-bold text-black">
            {activePreset.note}
          </div>

          <MathFormula
            tex="m_H^{\text{crit}} \approx 129.6 + 2.0\,(m_t - 173.34) - 0.56\,\frac{\alpha_s - 0.1184}{0.0007}\;\text{GeV}"
            label="SM Sacred Stability Bound:"
          />
        </div>

        {/* Right 8 Cols: TVA CRT Monitor + Telemetry + RG Coupling Plot */}
        <div className="xl:col-span-8 space-y-4">
          {/* Semantic KPI Strip */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#170F07] border-2 border-black">
              <dt className="text-[10px] text-[#D8A55C] uppercase">Vacuum Regime</dt>
              <dd className="text-[#FFE082] font-black text-sm mt-0.5 flex items-center gap-1">
                {vacuum.regime === 'REDLINE' ? (
                  <AlertTriangle className="w-4 h-4 text-[#FF334B]" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span>{vacuum.regime}</span>
              </dd>
            </div>
            <div className="p-3 bg-[#170F07] border-2 border-black">
              <dt className="text-[10px] text-[#D8A55C] uppercase">Instability Scale Λ_I</dt>
              <dd className="text-[#FFB000] font-black text-base mt-0.5">
                {vacuum.regime === 'STABLE'
                  ? '> 10¹⁹ GeV'
                  : `10^${vacuum.instabilityScaleLog10Gev.toFixed(1)} GeV`}
              </dd>
            </div>
            <div className="p-3 bg-[#170F07] border-2 border-black">
              <dt className="text-[10px] text-[#D8A55C] uppercase">Redline Branch Risk</dt>
              <dd className="text-[#FF6B35] font-black text-base mt-0.5">
                {(vacuum.branchRiskFraction * 100).toFixed(0)}%
              </dd>
            </div>
            <div className="p-3 bg-[#170F07] border-2 border-black">
              <dt className="text-[10px] text-[#D8A55C] uppercase">Pruned Branches</dt>
              <dd className="text-cern-cyan font-black text-base mt-0.5">{pruneCount} resets</dd>
            </div>
          </dl>

          {/* Sacred Timeline View Mode Switcher & Monitor */}
          <div className="bg-[#120B05] border-3 border-black p-4 shadow-[5px_5px_0px_#000] space-y-3 cern-tva-scanlines">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#4A2E10] pb-2 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { playTemPadClick(); setViewMode('crt-2d'); }}
                  className={`px-2.5 py-1 border border-black font-bold flex items-center gap-1 cursor-pointer ${
                    viewMode === 'crt-2d' ? 'bg-[#FFB000] text-black' : 'bg-[#23160A] text-[#F5C77E] hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" /> CRT Timeline Loom
                </button>
                <button
                  type="button"
                  onClick={() => { playTemPadClick(); setViewMode('loom-3d'); }}
                  className={`px-2.5 py-1 border border-black font-bold flex items-center gap-1 cursor-pointer ${
                    viewMode === 'loom-3d' ? 'bg-[#FFB000] text-black' : 'bg-[#23160A] text-[#F5C77E] hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" /> 3D Temporal Loom
                </button>
                <button
                  type="button"
                  onClick={() => { playTemPadClick(); setViewMode('comparator'); }}
                  className={`px-2.5 py-1 border border-black font-bold flex items-center gap-1 cursor-pointer ${
                    viewMode === 'comparator' ? 'bg-[#FFB000] text-black' : 'bg-[#23160A] text-[#F5C77E] hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" /> Multiverse Comparator
                </button>
              </div>
              {viewMode === 'crt-2d' && !reduceMotion && (
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="px-2.5 py-1 bg-[#23160A] hover:bg-[#33200E] border border-[#FFB000] text-[10px] font-bold text-[#FFE082] flex items-center gap-1 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
              )}
            </div>

            {viewMode === 'crt-2d' && (
              <>
                <canvas
                  ref={canvasRef}
                  width={660}
                  height={260}
                  aria-label={`TVA Sacred Timeline simulation showing regime ${vacuum.regime}, instability scale 10 to the ${vacuum.instabilityScaleLog10Gev.toFixed(1)} GeV, and branching variance ${(vacuum.branchRiskFraction * 100).toFixed(0)} percent.`}
                  className="w-full h-64 border-2 border-[#4A2E10] bg-[#120B05]"
                />
                <p className="text-[11px] font-mono text-[#D8A55C]">
                  Crit Bound: {vacuum.criticalHiggsGev.toFixed(2)} GeV · Margin: {vacuum.stabilityMarginGev >= 0 ? '+' : ''}{vacuum.stabilityMarginGev.toFixed(2)} GeV · Red curves crossing Red Line: Nexus Instability Branches
                </p>
              </>
            )}

            {viewMode === 'loom-3d' && (
              <TvaTimeline3DLoom
                regime={vacuum.regime}
                branchRiskFraction={vacuum.branchRiskFraction}
                higgsMassGev={higgsMassGev}
                topMassGev={topMassGev}
              />
            )}

            {viewMode === 'comparator' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-[#1C1107] border-2 border-[#FFB000] space-y-2">
                  <div className="flex justify-between items-center border-b border-[#4A2E10] pb-1.5">
                    <span className="font-black text-[#FFB000]">UNIVERSE A // TIMELINE 616 (CERN PDG)</span>
                    <span className="px-1.5 py-0.5 bg-[#FFB000] text-black font-black text-[10px]">{sacred616Baseline.regime}</span>
                  </div>
                  <div className="space-y-1 text-[#F5C77E]">
                    <div className="flex justify-between"><span>Higgs / Top Mass:</span><strong className="text-white">125.25 / 172.69 GeV</strong></div>
                    <div className="flex justify-between"><span>Crit Threshold:</span><strong>{sacred616Baseline.criticalHiggsGev.toFixed(2)} GeV</strong></div>
                    <div className="flex justify-between"><span>Instability Scale Λ_I:</span><strong>10^{sacred616Baseline.instabilityScaleLog10Gev.toFixed(1)} GeV</strong></div>
                    <div className="flex justify-between"><span>Branching Risk:</span><strong>{(sacred616Baseline.branchRiskFraction * 100).toFixed(0)}%</strong></div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#1C1107] border-2 border-cern-cyan space-y-2">
                  <div className="flex justify-between items-center border-b border-zinc-700 pb-1.5">
                    <span className="font-black text-cern-cyan">UNIVERSE B // CUSTOM VARIANT</span>
                    <span className={`px-1.5 py-0.5 font-black text-[10px] ${regimeColors.badgeBg}`}>{vacuum.regime}</span>
                  </div>
                  <div className="space-y-1 text-text-secondary">
                    <div className="flex justify-between"><span>Higgs / Top Mass:</span><strong className="text-white">{higgsMassGev.toFixed(2)} / {topMassGev.toFixed(2)} GeV</strong></div>
                    <div className="flex justify-between"><span>Crit Threshold:</span><strong>{vacuum.criticalHiggsGev.toFixed(2)} GeV</strong></div>
                    <div className="flex justify-between"><span>Instability Scale Λ_I:</span><strong>{vacuum.regime === 'STABLE' ? '> 10¹⁹ GeV' : `10^${vacuum.instabilityScaleLog10Gev.toFixed(1)} GeV`}</strong></div>
                    <div className="flex justify-between"><span>Δ Risk vs 616:</span><strong className="text-[#FFE082]">{((vacuum.branchRiskFraction - sacred616Baseline.branchRiskFraction) * 100 >= 0 ? '+' : '')}{((vacuum.branchRiskFraction - sacred616Baseline.branchRiskFraction) * 100).toFixed(0)}%</strong></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RG Running Coupling lambda(mu) Plot */}
          <div className="bg-[#170F07] border-3 border-black p-4 shadow-[4px_4px_0px_#000] space-y-2">
            <div className="flex flex-wrap justify-between items-center text-xs font-mono">
              <span className="font-bold text-[#FFE082] uppercase">
                Renormalization Group Flow: Quartic Coupling λ(μ) from 10² to 10¹⁹ GeV
              </span>
              <span className="text-[11px] text-[#D8A55C]">
                λ &lt; 0 triggers quantum vacuum tunneling
              </span>
            </div>
            <svg viewBox="0 0 360 124" className="w-full h-32 bg-[#0E0803] border border-[#4A2E10]" aria-hidden="true">
              {/* Zero line */}
              <line
                x1="36"
                y1={rgPlot.zeroY}
                x2="344"
                y2={rgPlot.zeroY}
                stroke="#FF334B"
                strokeWidth="1.4"
                strokeDasharray="4 4"
              />
              <text x="8" y={rgPlot.zeroY + 3} fill="#FF5E73" fontSize="9" fontFamily="monospace" fontWeight="bold">
                λ=0
              </text>

              {/* RG running curve */}
              <path
                d={rgPlot.pathD}
                fill="none"
                stroke={vacuum.regime === 'STABLE' ? '#10B981' : '#FFB000'}
                strokeWidth="2.8"
              />

              {/* Instability scale marker when metastable/redline */}
              {vacuum.regime !== 'STABLE' && (
                <>
                  <line
                    x1={rgPlot.toX(vacuum.instabilityScaleLog10Gev)}
                    y1="10"
                    x2={rgPlot.toX(vacuum.instabilityScaleLog10Gev)}
                    y2="112"
                    stroke="#38BDF8"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={Math.min(280, rgPlot.toX(vacuum.instabilityScaleLog10Gev) + 4)}
                    y="22"
                    fill="#38BDF8"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Λ_I≈10^{vacuum.instabilityScaleLog10Gev.toFixed(1)}
                  </text>
                </>
              )}

              <text x="36" y="118" fill="#D8A55C" fontSize="8.5" fontFamily="monospace">
                10² GeV (LHC)
              </text>
              <text x="276" y="118" fill="#D8A55C" fontSize="8.5" fontFamily="monospace">
                10¹⁹ GeV (Planck)
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
