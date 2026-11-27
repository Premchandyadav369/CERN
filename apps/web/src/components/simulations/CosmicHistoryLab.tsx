'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { calculateElectroweakPhase } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { Flame, Sparkles } from 'lucide-react';

export const CosmicHistoryLab: React.FC = () => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  // Log10(T_GeV) from +2.4 (250 GeV) down to -1.3 (0.05 GeV = 50 MeV)
  const [logTemp, setLogTemp] = useState<number>(0.8); // ~6.3 GeV QGP era
  const tempGev = Math.pow(10, logTemp);

  const ewsb = useMemo(() => calculateElectroweakPhase(tempGev), [tempGev]);
  const isQgpDeconfined = tempGev >= 0.155; // QCD crossover ~ 155 MeV (0.155 GeV)
  const cosmicTimeLabel =
    tempGev >= 160
      ? 't < 10⁻¹¹ s (Electroweak Era)'
      : tempGev >= 0.155
      ? 't ~ 10⁻¹⁰ to 10⁻⁵ s (Quark-Gluon Plasma Soup)'
      : 't > 10⁻⁵ s (Confined Hadrons & Atomic Era)';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let phase = 0;

    const particles = Array.from({ length: 36 }, (_, i) => ({
      angle: (i / 36) * Math.PI * 2,
      radius: 25 + (i % 5) * 24,
      speed: 0.4 + (i % 4) * 0.35,
      color: i % 3 === 0 ? '#FF0055' : i % 3 === 1 ? '#00E5FF' : '#00FF66',
    }));

    const render = () => {
      if (!reduceMotion) phase += 0.025;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      if (isQgpDeconfined) {
        // Free-roaming deconfined quarks and gluons
        particles.forEach((p, idx) => {
          const a = p.angle + phase * p.speed;
          const r = p.radius + Math.sin(phase * 1.7 + idx) * 14;
          const x = cx + Math.cos(a) * r * 1.4;
          const y = cy + Math.sin(a * 1.2) * r * 0.85;
          ctx.beginPath();
          ctx.arc(x, y, ewsb.brokenSymmetry ? 5 : 4, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });
      } else {
        // Confined 3-quark Baryon Triplets!
        for (let b = 0; b < 10; b++) {
          const bx = cx + Math.cos(b * 0.7 + phase * 0.4) * (40 + (b % 3) * 45);
          const by = cy + Math.sin(b * 1.1 + phase * 0.35) * (35 + (b % 2) * 38);
          ctx.beginPath();
          ctx.arc(bx, by, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 229, 255, 0.14)';
          ctx.strokeStyle = '#00E5FF';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          for (let q = 0; q < 3; q++) {
            const qa = phase * 3 + (q * Math.PI * 2) / 3 + b;
            ctx.beginPath();
            ctx.arc(bx + Math.cos(qa) * 6, by + Math.sin(qa) * 6, 3, 0, Math.PI * 2);
            ctx.fillStyle = q === 0 ? '#FF0055' : q === 1 ? '#00FF66' : '#00E5FF';
            ctx.fill();
          }
        }
      }

      ctx.fillStyle = '#FFE600';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(
        isQgpDeconfined
          ? 'FREE QUARK-GLUON PLASMA DECONFINEMENT'
          : 'HADRONIZATION: QUARKS LOCKED INSIDE PROTONS & NEUTRONS',
        16,
        24
      );
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(
        ewsb.brokenSymmetry
          ? `Higgs VEV = ${ewsb.vevGev.toFixed(1)} GeV (W/Z/Quarks Massive)`
          : 'Electroweak Symmetry Restored (W/Z/Quarks Massless!)',
        16,
        h - 14
      );

      if (!reduceMotion) animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isQgpDeconfined, ewsb, reduceMotion]);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="The CERN Time Machine: Rewinding the Big Bang From Massless Plasma to Atoms"
        analogy="Collider rings act like reverse time machines! As you slide Temperature hotter, you rewind the universe back to 10 microseconds after the Big Bang (when protons melt into ALICE's Quark-Gluon Soup) and even further back to 10 trillionths of a second (before the Higgs field froze and turned on mass!)."
        keyPoints={[
          'T_QCD ≈ 0.155 GeV (~2 Trillion K): ALICE recreates this exact melting point smashing Lead ions.',
          'T_EW = 159.5 GeV: ATLAS & CMS probe the Higgs vacuum transition that switched on fundamental particle masses.',
        ]}
        whatToTry="Slide the Cosmic Temperature across 0.155 GeV (Quark Confinement) and 159.5 GeV (Electroweak Mass Generation)!"
        doi="10.1038/s41586-019-1421-z"
        citationLabel="Lattice QCD & Standard Model Thermal Phase Transitions"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
        <div className="xl:col-span-5 space-y-4 bg-canvas-surface border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-xs font-mono font-black uppercase text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FFE600]" /> Cosmic Cooling Dial
            </h3>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">Universe Temperature:</span>
              <span className="text-cern-cyan">
                {tempGev >= 1 ? `${tempGev.toFixed(1)} GeV` : `${(tempGev * 1000).toFixed(0)} MeV`}
              </span>
            </div>
            <input
              type="range"
              min={-1.3}
              max={2.4}
              step={0.02}
              value={logTemp}
              onChange={(e) => setLogTemp(Number(e.target.value))}
              className="w-full accent-[#FFE600] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <button onClick={() => setLogTemp(-1.0)} className="underline hover:text-white">Hadrons (100 MeV)</button>
              <button onClick={() => setLogTemp(0.2)} className="underline hover:text-cern-cyan">ALICE QGP (1.6 GeV)</button>
              <button onClick={() => setLogTemp(2.3)} className="underline hover:text-cern-magenta">Pre-Higgs (200 GeV)</button>
            </div>
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black text-xs font-mono space-y-1.5">
            <div className="text-[#FFE600] font-bold">{cosmicTimeLabel}</div>
            <div className="flex justify-between">
              <span className="text-text-muted">W Boson Mass:</span>
              <strong className="text-white">{ewsb.massesGev.wBoson.toFixed(2)} GeV</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Top Quark Mass:</span>
              <strong className="text-white">{ewsb.massesGev.topQuark.toFixed(2)} GeV</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">QCD State:</span>
              <strong className={isQgpDeconfined ? 'text-cern-magenta' : 'text-emerald-400'}>
                {isQgpDeconfined ? 'Deconfined QGP Plasma' : 'Confined Protons/Neutrons'}
              </strong>
            </div>
          </div>

          <MathFormula
            tex="T_{\text{EW}} = 159.5\text{ GeV} \gg T_{\text{QCD}} \approx 0.155\text{ GeV}"
            label="Two Cosmic Phase Transitions:"
          />
        </div>

        <div className="xl:col-span-7 bg-canvas border-2 border-black p-4 shadow-[4px_4px_0px_#000] space-y-2">
          <canvas ref={canvasRef} width={540} height={270} className="w-full h-64 border border-black bg-[#050811]" />
        </div>
      </div>
    </div>
  );
};
