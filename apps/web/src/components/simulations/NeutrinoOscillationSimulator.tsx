'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { calculateNeutrinoOscillation } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { Radio, Play, Pause, Compass } from 'lucide-react';

interface BaselinePreset {
  id: string;
  label: string;
  distanceKm: number;
  energyGev: number;
  note: string;
}

const BASELINES: BaselinePreset[] = [
  {
    id: 'cngs',
    label: 'CERN → Gran Sasso (CNGS 732 km)',
    distanceKm: 732,
    energyGev: 1.8,
    note: 'CNGS shot muon neutrinos 732 km straight through Earth’s crust from CERN SPS to OPERA in Italy, directly observing ν_τ appearance!',
  },
  {
    id: 'cngs-nominal',
    label: 'CNGS High-E Beam (732 km, 17 GeV)',
    distanceKm: 732,
    energyGev: 17.0,
    note: 'Actual average CNGS beam energy: optimized above the 3.5 GeV tau-lepton production threshold.',
  },
  {
    id: 'fasernu',
    label: 'LHC → FASERnu (480 m Collider)',
    distanceKm: 0.48,
    energyGev: 500.0,
    note: 'FASERnu observes first collider TeV neutrinos 480 m from ATLAS—practically zero oscillation at TeV scales!',
  },
  {
    id: 'dune',
    label: 'ProtoDUNE / LBNF (1,300 km)',
    distanceKm: 1300,
    energyGev: 2.5,
    note: 'CERN Neutrino Platform (ProtoDUNE) validates huge 770-tonne liquid argon TPCs for next-gen 1,300 km oscillation tests.',
  },
];

export const NeutrinoOscillationSimulator: React.FC = () => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [distanceKm, setDistanceKm] = useState<number>(732);
  const [energyGev, setEnergyGev] = useState<number>(1.8);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activePresetId, setActivePresetId] = useState<string>('cngs');

  const osc = useMemo(
    () => calculateNeutrinoOscillation(distanceKm, energyGev),
    [distanceKm, energyGev]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let phaseShift = 0;

    const render = () => {
      if (isPlaying && !reduceMotion) {
        phaseShift += 0.08;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, w, h);

      // Subtle Earth Crust Profile Band
      ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.fillRect(0, h * 0.25, w, h * 0.55);
      ctx.strokeStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.25);
      ctx.lineTo(w, h * 0.25);
      ctx.stroke();

      const padX = 48;
      const spanW = w - padX * 2;
      const cy = h * 0.52;

      // Source & Far Detector markers
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('CERN SOURCE (100% ν_μ)', 10, 20);
      ctx.fillStyle = '#FF0055';
      ctx.fillText(`FAR DETECTOR (${distanceKm.toFixed(distanceKm < 5 ? 2 : 0)} km)`, w - 185, 20);

      // Plot Live Oscillating Flavor Waveforms along baseline [0 -> distanceKm]
      const steps = 140;
      const drawFlavorWave = (key: 'mu' | 'tau' | 'e', color: string, baseOpacity: number) => {
        ctx.strokeStyle = color;
        ctx.globalAlpha = baseOpacity;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const frac = i / steps;
          const x = padX + frac * spanW;
          const d = Math.max(0.01, frac * distanceKm);
          const res = calculateNeutrinoOscillation(d, energyGev);
          const prob =
            key === 'mu'
              ? res.probNuMuSurvival
              : key === 'tau'
              ? res.probNuMuToNuTau
              : res.probNuMuToNuE;
          const carrier = Math.sin(frac * 26 - (isPlaying && !reduceMotion ? phaseShift : 0));
          const y = cy - (prob - 0.5) * 95 + carrier * prob * 14;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      };

      drawFlavorWave('e', '#00FF66', 0.85);
      drawFlavorWave('tau', '#FF0055', 0.95);
      drawFlavorWave('mu', '#00E5FF', 0.95);

      // Travelling Quantum Packet Dot
      const pktFrac = isPlaying && !reduceMotion ? ((phaseShift * 0.03) % 1) : 1.0;
      const pktX = padX + pktFrac * spanW;
      const pktRes = calculateNeutrinoOscillation(Math.max(0.01, pktFrac * distanceKm), energyGev);
      const rCol = Math.round(pktRes.probNuMuToNuTau * 255);
      const gCol = Math.round(pktRes.probNuMuSurvival * 229 + pktRes.probNuMuToNuE * 255);
      const bCol = Math.round(pktRes.probNuMuSurvival * 255 + pktRes.probNuMuToNuTau * 85);

      ctx.beginPath();
      ctx.arc(pktX, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${Math.min(255, rCol)}, ${Math.min(255, gCol)}, ${Math.min(255, bCol)})`;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Cyan: ν_μ Survival | Magenta: ν_τ Appearance | Green: ν_e Appearance', 14, h - 10);

      if (isPlaying && !reduceMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [distanceKm, energyGev, isPlaying, reduceMotion]);

  const applyPreset = (b: BaselinePreset) => {
    setActivePresetId(b.id);
    setDistanceKm(b.distanceKm);
    setEnergyGev(b.energyGev);
  };

  const activePreset = BASELINES.find((b) => b.id === activePresetId) || BASELINES[0];

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Neutrino Shape-Shifting: How Ghost Particles Morph Flavors Underground!"
        analogy="Imagine ordering vanilla ice cream in Geneva, shooting it straight through 732 km of solid rock without needing any tunnel—and having it arrive in Italy transformed into strawberry! Neutrinos are quantum chameleons made of three overlapping mass waves that beat in and out of sync as they travel!"
        keyPoints={[
          'Zero Tunnel Needed: Neutrinos zip right through solid rock from CERN toward detectors in Italy and the US.',
          'CNGS & ProtoDUNE: CERN pioneered long-baseline muon-to-tau oscillation proof and liquid argon TPC detectors.',
        ]}
        whatToTry="Adjust Distance (km) and Neutrino Energy (GeV) to hit the peak Magenta ν_τ transformation around 1.8 GeV at 732 km!"
        doi="10.1103/PhysRevLett.120.211801"
        citationLabel="OPERA Collaboration CNGS & PDG 2024 PMNS Parameters"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
        <div className="xl:col-span-4 space-y-4 bg-canvas-surface border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-xs font-mono font-black uppercase text-white flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cern-cyan" /> PMNS Baseline Controls
            </h3>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <div className="space-y-1.5">
            {BASELINES.map((b) => (
              <button
                key={b.id}
                onClick={() => applyPreset(b)}
                className={`w-full p-2 border-2 border-black text-left font-mono text-xs transition-all ${
                  activePresetId === b.id
                    ? 'bg-cern-blue text-white shadow-[2px_2px_0px_#00E5FF]'
                    : 'bg-canvas-sub text-text-secondary hover:text-white'
                }`}
              >
                <div className="font-bold">{b.label}</div>
              </button>
            ))}
          </div>

          <div className="p-2.5 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">Baseline Distance L:</span>
              <span className="text-cern-cyan">{distanceKm.toFixed(distanceKm < 5 ? 2 : 0)} km</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1500}
              step={5}
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div className="p-2.5 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">Beam Energy E_ν:</span>
              <span className="text-[#FFE600]">{energyGev.toFixed(1)} GeV</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={25}
              step={0.1}
              value={energyGev}
              onChange={(e) => setEnergyGev(Number(e.target.value))}
              className="w-full accent-[#FFE600] cursor-pointer"
            />
          </div>

          <div className="p-2.5 bg-amber-300 border-2 border-black text-[11px] font-mono font-bold text-black">
            {activePreset.note}
          </div>

          <MathFormula
            tex="P(\nu_\mu \to \nu_\tau) \approx \sin^2(2\theta_{23})\sin^2\!\left(\frac{1.267\,\Delta m^2_{32}\,L}{E}\right)"
            label="3-Flavor Transition Law:"
          />
        </div>

        <div className="xl:col-span-8 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">ν_μ Survival</span>
              <strong className="text-cern-cyan text-lg">{(osc.probNuMuSurvival * 100).toFixed(1)}%</strong>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">ν_τ Morph (Tau)</span>
              <strong className="text-cern-magenta text-lg">{(osc.probNuMuToNuTau * 100).toFixed(1)}%</strong>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">ν_e Appearance</span>
              <strong className="text-emerald-400 text-lg">{(osc.probNuMuToNuE * 100).toFixed(1)}%</strong>
            </div>
          </div>

          <div className="bg-canvas border-2 border-black p-4 shadow-[4px_4px_0px_#000] space-y-2">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cern-cyan" /> Underground Quantum Wavefront Propagation
              </span>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2.5 py-1 bg-canvas-surface border border-black text-[10px] font-bold text-cern-cyan flex items-center gap-1"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            </div>
            <canvas ref={canvasRef} width={580} height={270} className="w-full h-64 border border-black bg-[#050811]" />
          </div>
        </div>
      </div>
    </div>
  );
};
