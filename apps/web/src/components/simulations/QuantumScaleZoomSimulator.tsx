'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { playDiscoveryChime, playTemPadClick } from '@/lib/sonifier';
import { ZoomIn, Compass, Play, Pause } from 'lucide-react';

interface ScaleMilestone {
  exp: number;
  title: string;
  sizeLabel: string;
  cernInstrument: string;
  color: string;
  description: string;
}

const SCALE_MILESTONES: ScaleMilestone[] = [
  {
    exp: 26,
    title: 'Observable Universe Horizon',
    sizeLabel: '10²⁶ m (8.8 × 10²⁶ m)',
    cernInstrument: 'CERN Cosmology & Early-Universe QGP Analogues (ALICE)',
    color: '#A855F7',
    description: 'Macroscopic cosmic web shaped by Higgs phase transitions moments after the Big Bang.',
  },
  {
    exp: 4,
    title: 'Large Hadron Collider Ring',
    sizeLabel: '10⁴ m (8.6 km diameter)',
    cernInstrument: 'LHC 27 km Underground Cryogenic Tunnel',
    color: '#00E5FF',
    description: '100 meters underground across the Swiss–French border housing ATLAS, CMS, ALICE, and LHCb.',
  },
  {
    exp: -10,
    title: 'Hydrogen Atom (Electron Cloud)',
    sizeLabel: '10⁻¹⁰ m (1 Ångström)',
    cernInstrument: 'Antimatter Factory / ALPHA-g Antihydrogen Spectroscopy',
    color: '#38BDF8',
    description: 'CERN’s Antiproton Decelerator traps antihydrogen atoms inside magnetic bottles to test CPT & gravity.',
  },
  {
    exp: -15,
    title: 'Atomic Nucleus (Femtometer)',
    sizeLabel: '10⁻¹⁵ m (1 fm)',
    cernInstrument: 'ISOLDE & ALICE Heavy-Ion Pb-Pb Collisions',
    color: '#FFE600',
    description: 'Protons & neutrons packed tighter than a neutron star; heated in ALICE to free Quarks & Gluons.',
  },
  {
    exp: -18,
    title: 'Proton Inner Quark & Gluon Sea',
    sizeLabel: '10⁻¹⁸ m (Attometer)',
    cernInstrument: 'ATLAS & CMS High-p_T Deep Inelastic Parton Scattering',
    color: '#FF0055',
    description: 'At multi-TeV energies, protons resolve into swirling gluons and ephemeral quark–antiquark pairs.',
  },
  {
    exp: -19,
    title: 'Electroweak / Higgs Probe Limit',
    sizeLabel: '10⁻¹⁹ m (~0.1 zm)',
    cernInstrument: '13.6 TeV LHC Resolution Frontier (ħc / E)',
    color: '#10B981',
    description: 'World’s sharpest quantum microscope: probes substructure 10,000× smaller than an atomic nucleus!',
  },
  {
    exp: -35,
    title: 'Planck Length (Quantum Gravity Floor)',
    sizeLabel: '10⁻³⁵ m',
    cernInstrument: 'Theoretical Quantum Gravity & Extra-Dimension Frontier',
    color: '#F97316',
    description: 'Scale where spacetime itself becomes quantized—16 orders deeper than current collider energy!',
  },
];

export const QuantumScaleZoomSimulator: React.FC = () => {
  const sliderPrefix = useId();
  const completeMission = useGlobalStore((s) => s.completeMission);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const [scaleExp, setScaleExp] = useState<number>(-15);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tRef = useRef<number>(0);

  const handleScaleChange = (exp: number) => {
    setScaleExp(exp);
    playTemPadClick();
    if (exp <= -18.5) {
      completeMission('mission-quantum-zoom');
      playDiscoveryChime();
    }
  };

  const activeMilestone = useMemo(() => {
    let closest = SCALE_MILESTONES[0];
    let minDiff = Infinity;
    for (const m of SCALE_MILESTONES) {
      const d = Math.abs(m.exp - scaleExp);
      if (d < minDiff) {
        minDiff = d;
        closest = m;
      }
    }
    return closest;
  }, [scaleExp]);

  const requiredEnergyLog10Gev = -15.705 - scaleExp;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;

    const render = () => {
      if (isPlaying && !reduceMotion) tRef.current += 0.03;
      const t = tRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = '#040610';
      ctx.fillRect(0, 0, w, h);

      // Background logarithmic grid + zooming hyperspace reticle
      const zoomFrac = ((scaleExp + 35) % 4) / 4;
      for (let i = 0; i < 6; i++) {
        const ringPhase = (i / 6 + (isPlaying && !reduceMotion ? (t * 0.12) % 1 : zoomFrac)) % 1;
        const r = Math.pow(ringPhase, 1.5) * (w * 0.48);
        ctx.strokeStyle = activeMilestone.color;
        ctx.globalAlpha = (1 - ringPhase) * 0.35;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(4, r), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Reticle crosshairs
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 12);
      ctx.lineTo(cx, h - 12);
      ctx.moveTo(20, cy);
      ctx.lineTo(w - 20, cy);
      ctx.stroke();

      // Scale-specific physical visualization
      if (scaleExp >= 12) {
        // Observable Universe Cosmic Web filaments
        for (let i = 0; i < 14; i++) {
          const a1 = i * 0.45 + t * 0.05;
          const a2 = a1 + 1.1;
          const x1 = cx + Math.cos(a1) * (50 + (i % 4) * 32);
          const y1 = cy + Math.sin(a1 * 1.3) * (35 + (i % 3) * 24);
          const x2 = cx + Math.cos(a2) * (60 + ((i + 2) % 4) * 28);
          const y2 = cy + Math.sin(a2 * 1.2) * (40 + ((i + 1) % 3) * 24);
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.fillStyle = '#E9D5FF';
          ctx.beginPath();
          ctx.arc(x1, y1, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (scaleExp >= -2) {
        // LHC 27km Superconducting Ring & dual beams
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, 86, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 86, 0, Math.PI * 2);
        ctx.stroke();

        for (let b = 0; b < 6; b++) {
          const ang1 = t * 1.8 + (b * Math.PI) / 3;
          const ang2 = -t * 1.8 + (b * Math.PI) / 3;
          ctx.fillStyle = '#00E5FF';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ang1) * 88, cy + Math.sin(ang1) * 88, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FF0055';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ang2) * 84, cy + Math.sin(ang2) * 84, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ['ATLAS', 'CMS', 'ALICE', 'LHCb'].forEach((name, idx) => {
          const a = (idx * Math.PI) / 2;
          const ix = cx + Math.cos(a) * 86;
          const iy = cy + Math.sin(a) * 86;
          ctx.fillStyle = '#FFE600';
          ctx.beginPath();
          ctx.arc(ix, iy, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(name, ix + 8, iy + 3);
        });
      } else if (scaleExp >= -12) {
        // Atom electron orbital cloud
        const cloud = ctx.createRadialGradient(cx, cy, 4, cx, cy, 96);
        cloud.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
        cloud.addColorStop(0.45, 'rgba(56, 189, 248, 0.25)');
        cloud.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = cloud;
        ctx.beginPath();
        ctx.arc(cx, cy, 96, 0, Math.PI * 2);
        ctx.fill();

        for (let o = 0; o < 3; o++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((o * Math.PI) / 3 + t * 0.25);
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 92, 32, 0, 0, Math.PI * 2);
          ctx.stroke();
          const ex = Math.cos(t * 2.6 + o) * 92;
          const ey = Math.sin(t * 2.6 + o) * 32;
          ctx.fillStyle = '#FFE600';
          ctx.beginPath();
          ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = '#FF0055';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (scaleExp >= -16) {
        // Atomic nucleus: packed protons & neutrons
        for (let n = 0; n < 14; n++) {
          const ang = n * 2.399 + t * 0.35;
          const rad = 12 + Math.sqrt(n) * 14;
          const nx = cx + Math.cos(ang) * rad + Math.sin(t * 3 + n) * 2;
          const ny = cy + Math.sin(ang) * rad + Math.cos(t * 3 + n) * 2;
          const g = ctx.createRadialGradient(nx - 3, ny - 3, 2, nx, ny, 14);
          g.addColorStop(0, n % 2 === 0 ? '#FF80AB' : '#93C5FD');
          g.addColorStop(1, n % 2 === 0 ? '#9D174D' : '#1E3A8A');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(nx, ny, 13, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (scaleExp >= -24) {
        // Inside the Proton: 3 Valence Quarks + pulsing Gluon spring tubes!
        const quarkPos = [0, 1, 2].map((idx) => {
          const a = idx * ((Math.PI * 2) / 3) + t * 1.5;
          const r = 52 + Math.sin(t * 2.5 + idx) * 8;
          return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, label: idx < 2 ? 'u' : 'd' };
        });
        // Pulsing Gluon flux springs
        for (let i = 0; i < 3; i++) {
          const p1 = quarkPos[i];
          const p2 = quarkPos[(i + 1) % 3];
          ctx.beginPath();
          for (let s = 0; s <= 24; s++) {
            const u = s / 24;
            const lx = p1.x + (p2.x - p1.x) * u;
            const ly = p1.y + (p2.y - p1.y) * u + Math.sin(u * Math.PI * 6 - t * 5) * 6;
            if (s === 0) ctx.moveTo(lx, ly);
            else ctx.lineTo(lx, ly);
          }
          ctx.strokeStyle = '#FFE600';
          ctx.lineWidth = 2.4;
          ctx.stroke();
        }
        quarkPos.forEach((q, idx) => {
          const g = ctx.createRadialGradient(q.x, q.y, 2, q.x, q.y, 20);
          g.addColorStop(0, '#FFFFFF');
          g.addColorStop(0.45, idx === 0 ? '#FF0055' : idx === 1 ? '#00E5FF' : '#10B981');
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(q.x, q.y, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(q.label, q.x - 4, q.y + 4);
        });
      } else {
        // Planck Foam Quantum Spacetime
        ctx.strokeStyle = '#F97316';
        for (let x = 24; x < w - 24; x += 28) {
          ctx.beginPath();
          for (let y = 18; y < h - 18; y += 12) {
            const warp = Math.sin(x * 0.08 + y * 0.09 + t * 2.8) * 7;
            if (y === 18) ctx.moveTo(x + warp, y);
            else ctx.lineTo(x + warp, y);
          }
          ctx.stroke();
        }
      }

      // Probe energy de Broglie wave across bottom
      ctx.beginPath();
      const freq = Math.min(0.28, 0.03 + Math.abs(scaleExp) * 0.006);
      for (let x = 16; x <= w - 16; x += 3) {
        const y = h - 24 + Math.sin(x * freq - t * 4) * 6;
        if (x === 16) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`SCALE: 10^${scaleExp.toFixed(1)} m (${activeMilestone.sizeLabel})`, 14, 18);

      if (isPlaying && !reduceMotion) animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [scaleExp, activeMilestone, isPlaying, reduceMotion]);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Ant-Man’s Quantum Realm Dive: 61 Orders of Magnitude at CERN!"
        analogy="Why do we need a giant 27-kilometer ring just to look inside a tiny proton? Because quantum mechanics acts like a camera lens with an inverse rule: the tinier the target you want to photograph (10⁻¹⁹ m), the MORE collision energy you need—turning the LHC into the most powerful microscope humanity has ever built!"
      />

      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <FidelityBadge type="ANALYTIC" />
            <span className="px-2 py-0.5 bg-purple-400 text-black font-mono font-black text-[10px] border-2 border-black uppercase">
              PYM-LOGARITHMIC MICROSCOPE // 10²⁶ m → 10⁻³⁵ m
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-white">
            Quantum Realm Scale Zoom &amp; Compton Microscope
          </h2>
          <p className="text-xs font-mono text-text-secondary mt-1">
            Scrub continuously across cosmic horizons down to quarks, Higgs resolution (10⁻¹⁹ m), and the Planck floor.
          </p>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] text-text-muted uppercase">Active Spatial Resolution</div>
          <div className="text-2xl font-black text-cern-cyan">10^{scaleExp.toFixed(1)} m</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 space-y-4 bg-canvas-surface border-3 border-black p-4 shadow-[5px_5px_0px_#000]">
          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-exp`} className="text-text-muted uppercase">
                Logarithmic Scale Exponent (10^x m):
              </label>
              <span className="text-[#FFE600]">x = {scaleExp.toFixed(1)}</span>
            </div>
            <input
              id={`${sliderPrefix}-exp`}
              type="range"
              min={-35}
              max={26}
              step={0.5}
              value={scaleExp}
              aria-valuetext={`10 to the power ${scaleExp.toFixed(1)} meters`}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span>10⁻³⁵ m (Planck)</span>
              <span>10⁻¹⁵ m (Nucleus)</span>
              <span>10²⁶ m (Cosmos)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-mono font-bold uppercase text-text-muted flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cern-cyan" /> Instant Quantum Jumps
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SCALE_MILESTONES.map((m) => (
                <button
                  key={m.exp}
                  type="button"
                  onClick={() => handleScaleChange(m.exp)}
                  className={`px-3 py-2 text-left border-2 border-black font-mono text-xs flex items-center justify-between cursor-pointer ${
                    activeMilestone.exp === m.exp
                      ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#000]'
                      : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  <span className="font-bold">{m.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-black text-[#FFE600]">
                    10^{m.exp} m
                  </span>
                </button>
              ))}
            </div>
          </div>

          <MathFormula tex="\lambda = \frac{\hbar c}{E} \approx \frac{1.973\times 10^{-16}\text{ GeV}\cdot\text{m}}{E}" label="De Broglie Microscope:" />
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-[#040610] border-3 border-black shadow-[5px_5px_0px_#000] space-y-3">
            <div className="w-full flex justify-between items-center text-xs font-mono border-b border-zinc-800 pb-2">
              <span className="text-white font-bold flex items-center gap-1.5">
                <ZoomIn className="w-4 h-4 text-purple-400" /> {activeMilestone.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">
                  E_probe ≈ 10^{requiredEnergyLog10Gev.toFixed(1)} GeV
                </span>
                {!reduceMotion && (
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="px-2 py-0.5 bg-canvas-surface border border-black text-[10px] font-bold text-cern-cyan flex items-center gap-1 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                )}
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={600}
              height={265}
              aria-label={`Live logarithmic quantum scale canvas at 10 to the ${scaleExp.toFixed(1)} meters showing ${activeMilestone.title}.`}
              className="w-full h-64 border border-zinc-800 bg-[#040610]"
            />

            <div className="w-full p-3.5 bg-canvas-sub border-2 border-black text-xs font-mono text-text-secondary leading-relaxed">
              <strong className="text-white block mb-1">{activeMilestone.cernInstrument}</strong>
              {activeMilestone.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
