'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  calculateCherenkovCone,
  calculateSpectralXRayAttenuation,
  MedipixTissue,
} from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { Eye, Sparkles, Scan, Layers, Play, Pause } from 'lucide-react';

interface RadiatorOption {
  id: string;
  name: string;
  n: number;
  detector: string;
}

const RADIATORS: RadiatorOption[] = [
  { id: 'c4f10', name: 'C₄F₁₀ Fluorocarbon Gas (RICH-1)', n: 1.0014, detector: 'LHCb RICH-1 (2–40 GeV/c)' },
  { id: 'cf4', name: 'CF₄ Gas (RICH-2 High Momentum)', n: 1.0005, detector: 'LHCb RICH-2 (15–100 GeV/c)' },
  { id: 'aerogel', name: 'Silica Aerogel (Ultra-Low P)', n: 1.03, detector: 'Low-Momentum Pion/Kaon ID' },
];

const RICH_PARTICLES = [
  { id: 'pi', symbol: 'π±', name: 'Pion', massGev: 0.13957, color: '#00E5FF' },
  { id: 'k', symbol: 'K±', name: 'Kaon', massGev: 0.49367, color: '#FFE600' },
  { id: 'p', symbol: 'p', name: 'Proton', massGev: 0.93827, color: '#FF0055' },
  { id: 'e', symbol: 'e±', name: 'Electron', massGev: 0.000511, color: '#00FF66' },
];

export const MedipixRichSimulator: React.FC = () => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const completeMission = useGlobalStore((s) => s.completeMission);
  const [labMode, setLabMode] = useState<'rich' | 'medipix'>('rich');

  // LHCb RICH state
  const [radiatorId, setRadiatorId] = useState<string>('c4f10');
  const [momentumGev, setMomentumGev] = useState<number>(12.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Medipix3 Spectral X-Ray state
  const [photonKev, setPhotonKev] = useState<number>(38.0);
  const [spectralMode, setSpectralMode] = useState<boolean>(true);

  const radiator = RADIATORS.find((r) => r.id === radiatorId) || RADIATORS[0];

  const richResults = useMemo(
    () =>
      RICH_PARTICLES.map((p) => ({
        ...p,
        ...calculateCherenkovCone(momentumGev, p.massGev, radiator.n, 1200),
      })),
    [momentumGev, radiator]
  );

  useEffect(() => {
    if (labMode === 'rich' && radiatorId === 'c4f10' && momentumGev <= 8.5) {
      completeMission('mission-rich-kaon');
    }
  }, [labMode, radiatorId, momentumGev, completeMission]);

  const richCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const medipixCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mode A: LHCb RICH Cherenkov Cone + Ring Imaging Photon Detector Animation
  useEffect(() => {
    if (labMode !== 'rich') return;
    const canvas = richCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;

    const render = () => {
      if (isPlaying && !reduceMotion) {
        t = (t + 0.018) % 1;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, w, h);

      // Left Panel: Side Longitudinal Gas Radiator & Cherenkov Shockwave Cone
      const radW = Math.floor(w * 0.58);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 14, radW - 20, h - 28);

      ctx.fillStyle = 'rgba(0, 229, 255, 0.04)';
      ctx.fillRect(10, 14, radW - 20, h - 28);

      // Particle flying horizontally along y = h/2
      const cy = h / 2;
      const xStart = 20;
      const xEnd = radW - 25;
      const xNow = xStart + t * (xEnd - xStart);

      // Pion trajectory + Cherenkov wave cones
      const pionRes = richResults.find((r) => r.id === 'pi')!;
      const kaonRes = richResults.find((r) => r.id === 'k')!;

      // Draw Pion Blue Wavefront Cone if emitting
      if (pionRes.emitsCherenkov) {
        const coneSpread = Math.max(12, pionRes.thetaCherenkovDeg * 11);
        for (let k = 0; k < 5; k++) {
          const emitX = xStart + ((k + 1) / 6) * (xEnd - xStart);
          if (xNow >= emitX) {
            const dist = xNow - emitX;
            const spread = (dist / (xEnd - xStart)) * coneSpread * 1.6;
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.55)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(xNow, cy);
            ctx.lineTo(emitX, cy - spread);
            ctx.moveTo(xNow, cy);
            ctx.lineTo(emitX, cy + spread);
            ctx.stroke();
          }
        }
      }

      // Moving Track Particle Dot
      ctx.beginPath();
      ctx.arc(xNow, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${radiator.name} · n=${radiator.n}`, 18, 30);
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`Cherenkov Photons → Spherical Mirror → MaPMT Array`, 18, h - 22);

      // Right Panel: Circular Photon Detector Plane Showing Concentric Cherenkov Rings
      const mapCx = radW + (w - radW) / 2;
      const mapCy = h / 2;
      const maxR = Math.min(w - radW, h) * 0.41;

      // Grid box
      ctx.fillStyle = '#020617';
      ctx.fillRect(radW + 4, 14, w - radW - 14, h - 28);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(radW + 4, 14, w - radW - 14, h - 28);

      const maxPossibleTheta = Math.acos(1 / radiator.n) * (180 / Math.PI);

      richResults.forEach((res) => {
        if (!res.emitsCherenkov) return;
        const rPx = Math.max(8, (res.thetaCherenkovDeg / Math.max(0.5, maxPossibleTheta)) * maxR);

        // Soft glowing ring
        ctx.beginPath();
        ctx.arc(mapCx, mapCy, rPx, 0, Math.PI * 2);
        ctx.strokeStyle = res.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Sparkle photon hits around circumference
        const numHits = Math.round(14 + res.relativePhotonYield * 26);
        for (let i = 0; i < numHits; i++) {
          const ang = (i / numHits) * Math.PI * 2 + (isPlaying && !reduceMotion ? t * 0.4 : 0);
          ctx.fillStyle = res.color;
          ctx.fillRect(mapCx + Math.cos(ang) * rPx - 1.5, mapCy + Math.sin(ang) * rPx - 1.5, 3, 3);
        }
      });

      // Center beamspot
      ctx.beginPath();
      ctx.arc(mapCx, mapCy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.fillStyle = '#FFE600';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('MaPMT PHOTON RING PLANE', radW + 14, 30);
      ctx.fillStyle = kaonRes.emitsCherenkov ? '#FFE600' : '#FF0055';
      ctx.fillText(
        kaonRes.emitsCherenkov ? 'K± EMITTING RING' : 'K± BELOW CHERENKOV THRESHOLD (DARK!)',
        radW + 14,
        h - 22
      );

      if (isPlaying && !reduceMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [labMode, richResults, radiator, isPlaying, reduceMotion]);

  // Mode B: Medipix3 Color Spectral X-Ray K-Edge Scanner Canvas
  const medipixMaterials = useMemo(() => {
    const mats: { id: MedipixTissue; label: string; color: string }[] = [
      { id: 'soft_tissue', label: 'Soft Tissue (Water Eq.)', color: '#38BDF8' },
      { id: 'calcium_bone', label: 'Calcium Bone Matrix', color: '#E2E8F0' },
      { id: 'iodine_contrast', label: 'Iodine Vessel (K=33.2 keV)', color: '#00FF66' },
      { id: 'gold_marker', label: 'Gold Biomarker (K=80.7 keV)', color: '#FFE600' },
    ];
    return mats.map((m) => ({
      ...m,
      ...calculateSpectralXRayAttenuation(photonKev, m.id),
    }));
  }, [photonKev]);

  useEffect(() => {
    if (labMode !== 'medipix') return;
    const canvas = medipixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, w, h);

    // Draw Left: Phantom Cross-Section & Medipix Color/Grayscale X-Ray Detector Image
    const viewW = Math.floor(w * 0.54);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(10, 12, viewW - 20, h - 24);

    // Outer tissue disc
    const cx = viewW / 2;
    const cy = h / 2;
    const drawDisc = (x: number, y: number, r: number, matId: MedipixTissue, spectralHex: string) => {
      const atten = calculateSpectralXRayAttenuation(photonKev, matId);
      const opacity = Math.min(0.95, Math.max(0.15, atten.muCmInverse / 6.0));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (spectralMode) {
        ctx.fillStyle = spectralHex;
        ctx.globalAlpha = opacity;
      } else {
        const g = Math.round(opacity * 255);
        ctx.fillStyle = `rgb(${g},${g},${g})`;
        ctx.globalAlpha = 1;
      }
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = spectralMode ? spectralHex : '#94A3B8';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    drawDisc(cx, cy, 82, 'soft_tissue', '#0284C7');
    drawDisc(cx - 34, cy - 12, 24, 'calcium_bone', '#E2E8F0');
    drawDisc(cx + 32, cy - 16, 18, 'iodine_contrast', '#00FF66');
    drawDisc(cx + 12, cy + 36, 15, 'gold_marker', '#FFE600');

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(spectralMode ? 'MEDIPIX3 K-EDGE COLOR X-RAY' : 'CONVENTIONAL MONOCHROME X-RAY', 18, 28);

    // Draw Right: Mass Attenuation mu(E) Spectrum Curve (15 to 120 keV)
    const gx0 = viewW + 24;
    const gw = w - gx0 - 18;
    const gy0 = 26;
    const gh = h - 54;

    ctx.strokeStyle = '#475569';
    ctx.strokeRect(gx0, gy0, gw, gh);

    const drawCurve = (matId: MedipixTissue, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let e = 15; e <= 120; e += 1) {
        const { muCmInverse } = calculateSpectralXRayAttenuation(e, matId);
        const x = gx0 + ((e - 15) / 105) * gw;
        const y = gy0 + gh - Math.min(1, muCmInverse / 10) * gh;
        if (e === 15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawCurve('calcium_bone', '#E2E8F0');
    drawCurve('iodine_contrast', '#00FF66');
    drawCurve('gold_marker', '#FFE600');

    // Vertical Energy Threshold Line
    const curX = gx0 + ((photonKev - 15) / 105) * gw;
    ctx.strokeStyle = '#FF0055';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(curX, gy0);
    ctx.lineTo(curX, gy0 + gh);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`X-RAY THRESHOLD = ${photonKev.toFixed(1)} keV`, gx0, 18);
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('15 keV                 K-Edges: I(33.2) / Au(80.7)           120 keV', gx0, h - 8);
  }, [labMode, photonKev, spectralMode]);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Optical Sonic Booms (LHCb RICH) & CERN’s Color X-Ray Camera (Medipix3)"
        analogy={
          labMode === 'rich'
            ? 'When a jet breaks the sound barrier, it makes a sonic boom cone. When an ultra-fast LHC particle shoots through transparent gas faster than light slows down inside that gas, it emits a blue optical sonic boom (Cherenkov light ring)—heavier Kaons make smaller rings than light Pions!'
            : 'Hospital X-rays look black-and-white because old cameras cannot tell photon colors apart. CERN took silicon pixel chips straight from LHC trackers to build Medipix3—counting every single X-ray photon energy so Iodine arteries and Gold nanoparticles glow in true color!'
        }
        keyPoints={
          labMode === 'rich'
            ? [
                'Cherenkov Threshold: Light is emitted ONLY when particle speed β exceeds 1/n inside the gas.',
                'At 5 GeV/c in C₄F₁₀ gas, Pions shine brightly while Kaons stay completely dark—instant particle identification!',
              ]
            : [
                'K-Edge Fingerprints: At exact atomic binding energies (33.17 keV for Iodine, 80.72 keV for Gold), X-ray absorption spikes sharply.',
                'Same CERN Timepix/Medipix chips fly aboard the International Space Station to warn astronauts about cosmic radiation!',
              ]
        }
        whatToTry={
          labMode === 'rich'
            ? 'Slide Momentum between 3 and 20 GeV/c in C₄F₁₀ gas to spot the dramatic moment Kaons (Yellow) and Protons (Pink) drop below the Cherenkov threshold!'
            : 'Drag the X-Ray Threshold across 33.2 keV and 80.7 keV to see Iodine & Gold vessels flash with sudden K-edge absorption spikes!'
        }
        doi="10.1140/epjc/s10052-013-2431-9"
        citationLabel="LHCb RICH Collaboration & CERN Medipix3 Collaboration"
      />

      {/* Mode Switcher */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setLabMode('rich')}
          className={`px-4 py-2 border-2 border-black font-mono font-bold text-xs uppercase transition-all flex items-center gap-2 ${
            labMode === 'rich'
              ? 'bg-purple-600 text-white shadow-[4px_4px_0px_#C084FC]'
              : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Mode A: LHCb RICH Cherenkov PID</span>
        </button>

        <button
          onClick={() => setLabMode('medipix')}
          className={`px-4 py-2 border-2 border-black font-mono font-bold text-xs uppercase transition-all flex items-center gap-2 ${
            labMode === 'medipix'
              ? 'bg-cern-cyan text-black shadow-[4px_4px_0px_#00E5FF]'
              : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>Mode B: Medipix3 Spectral Color X-Ray (Spin-Off)</span>
        </button>
      </div>

      {labMode === 'rich' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000]">
          {/* Controls */}
          <div className="xl:col-span-4 space-y-4 bg-canvas-surface border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-xs font-mono font-black uppercase text-white">Cherenkov Parameters</h3>
              <FidelityBadge type="ANALYTIC" />
            </div>

            <MathFormula tex="\cos\theta_c = \frac{1}{n\beta}" label="Cherenkov Angle:" />

            <div>
              <span className="text-[10px] font-mono text-text-muted uppercase font-bold block mb-1.5">
                Radiator Gas / Medium (Refractive Index n)
              </span>
              <div className="space-y-1.5">
                {RADIATORS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRadiatorId(r.id)}
                    className={`w-full p-2 border-2 border-black text-left font-mono text-xs transition-all ${
                      radiatorId === r.id
                        ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#00E5FF]'
                        : 'bg-canvas-sub text-text-secondary hover:text-white'
                    }`}
                  >
                    <div className="font-bold">{r.name}</div>
                    <div className="text-[10px] opacity-80">n = {r.n} · {r.detector}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black">
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span className="text-text-muted uppercase">Track Momentum (p):</span>
                <span className="text-cern-cyan">{momentumGev.toFixed(1)} GeV/c</span>
              </div>
              <input
                type="range"
                min={1}
                max={80}
                step={0.5}
                value={momentumGev}
                onChange={(e) => setMomentumGev(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {richResults.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-2 bg-canvas-sub border-2 border-black"
                >
                  <span className="font-bold" style={{ color: res.color }}>
                    {res.symbol} {res.name}
                  </span>
                  <span className="text-white">
                    {res.emitsCherenkov
                      ? `θ_c = ${res.thetaCherenkovDeg.toFixed(2)}°`
                      : 'SUB-THRESHOLD'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas Display */}
          <div className="xl:col-span-8 bg-canvas border-2 border-black shadow-[4px_4px_0px_#000] p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-mono font-bold text-white uppercase">
                Live Cherenkov Optical Cone &amp; MaPMT Ring Display (cos θ_c = 1 / nβ)
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2.5 py-1 bg-canvas-surface border border-black text-[10px] font-mono font-bold text-cern-cyan flex items-center gap-1"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            </div>
            <canvas ref={richCanvasRef} width={580} height={310} className="w-full h-72 border border-black bg-[#050811]" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000]">
          {/* Controls */}
          <div className="xl:col-span-4 space-y-4 bg-canvas-surface border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-xs font-mono font-black uppercase text-white">Medipix3 Energy Binning</h3>
              <FidelityBadge type="ANALYTIC" />
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black">
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span className="text-text-muted uppercase">Photon Energy Threshold:</span>
                <span className="text-cern-cyan">{photonKev.toFixed(1)} keV</span>
              </div>
              <input
                type="range"
                min={15}
                max={120}
                step={0.5}
                value={photonKev}
                onChange={(e) => setPhotonKev(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1">
                <button onClick={() => setPhotonKev(30)} className="underline hover:text-white">30 keV</button>
                <button onClick={() => setPhotonKev(36)} className="underline hover:text-emerald-400">I K-Edge (36)</button>
                <button onClick={() => setPhotonKev(84)} className="underline hover:text-[#FFE600]">Au K-Edge (84)</button>
              </div>
            </div>

            <button
              onClick={() => setSpectralMode(!spectralMode)}
              className={`w-full py-2.5 border-2 border-black font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_#000] transition-all ${
                spectralMode ? 'bg-emerald-400 text-black' : 'bg-zinc-700 text-white'
              }`}
            >
              {spectralMode ? 'Mode: True-Color Spectral K-Edge' : 'Mode: Conventional Monochrome'}
            </button>

            <div className="space-y-1.5 text-xs font-mono">
              {medipixMaterials.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-canvas-sub border-2 border-black">
                  <span style={{ color: m.color }} className="font-bold truncate">{m.label}</span>
                  <span className="text-white font-bold shrink-0">
                    μ = {m.muCmInverse.toFixed(2)} {m.kEdgeActive ? '★K' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="xl:col-span-8 bg-canvas border-2 border-black shadow-[4px_4px_0px_#000] p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-mono font-bold text-white uppercase">
                Photon-Counting Phantom &amp; NIST XCOM K-Edge Attenuation Spectrum
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">55 μm Hybrid Silicon ASIC</span>
            </div>
            <canvas ref={medipixCanvasRef} width={580} height={310} className="w-full h-72 border border-black bg-[#050811]" />
          </div>
        </div>
      )}
    </div>
  );
};
