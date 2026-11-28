'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import {
  evaluateProtonPdf,
  evaluateLhcPartonLuminosity,
} from '@cern-x/sim-core';
import { setupHiDpiCanvas, observeCanvasVisibility } from '@/lib/cernVisuals';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { MathFormula } from '@/components/ui/MathFormula';
import { LabExportBar } from '@/components/ui/LabExportBar';
import { useGlobalStore } from '@/lib/store';
import { Sparkles, Atom } from 'lucide-react';

const PRESET_PROCESSES = [
  { id: 'higgs', label: 'Higgs gg→H (125.25 GeV)', massGev: 125.25, qGev: 125 },
  { id: 'z0', label: 'Drell-Yan Z⁰ (91.2 GeV)', massGev: 91.19, qGev: 91 },
  { id: 'ttbar', label: 'Top Pair t t̄ (350 GeV)', massGev: 350, qGev: 173 },
  { id: 'bsm', label: '1.5 TeV BSM Resonance', massGev: 1500, qGev: 1500 },
] as const;

export const PartonPdfExplorer: React.FC = () => {
  const [qScaleGev, setQScaleGev] = useState<number>(125);
  const [probeMassGev, setProbeMassGev] = useState<number>(125.25);
  const [sqrtSTev, setSqrtSTev] = useState<number>(13.6);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const protonBagRef = useRef<HTMLCanvasElement | null>(null);
  const qId = useId();
  const massId = useId();

  const channelInfo = useMemo(
    () => evaluateLhcPartonLuminosity(probeMassGev, sqrtSTev),
    [probeMassGev, sqrtSTev]
  );

  const probePdf = useMemo(
    () => evaluateProtonPdf(channelInfo.typicalX, qScaleGev),
    [channelInfo.typicalX, qScaleGev]
  );

  // Draw PDG-style log-x Parton Distribution Curves on Hi-DPI Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const viewport = setupHiDpiCanvas(canvas, 680, 290);
    if (!viewport) return;
    const { ctx, width: w, height: h } = viewport;

    ctx.fillStyle = '#05080F';
    ctx.fillRect(0, 0, w, h);

    const padL = 46;
    const padR = 18;
    const padT = 22;
    const padB = 34;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const minLogX = -4; // 10^-4
    const maxLogX = 0; // 10^0 = 1.0
    const yMax = 1.65;

    const toScreenX = (xVal: number) => {
      const lx = Math.log10(Math.max(1e-4, Math.min(1, xVal)));
      return padL + ((lx - minLogX) / (maxLogX - minLogX)) * plotW;
    };
    const toScreenY = (yVal: number) => {
      const clamped = Math.max(0, Math.min(yMax, yVal));
      return padT + plotH - (clamped / yMax) * plotH;
    };

    // Gridlines across decades 10^-4 .. 1
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let dec = -4; dec <= 0; dec++) {
      const gx = padL + ((dec - minLogX) / (maxLogX - minLogX)) * plotW;
      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, padT + plotH);
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(dec === 0 ? '1.0' : `1e${dec}`, gx - 12, padT + plotH + 16);
    }

    for (const yTick of [0.4, 0.8, 1.2, 1.6]) {
      const gy = toScreenY(yTick);
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(padL + plotW, gy);
      ctx.stroke();
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px monospace';
      ctx.fillText(yTick.toFixed(1), 8, gy + 3);
    }

    // Axes box
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padL, padT, plotW, plotH);

    // Sample 140 log-spaced points
    const samples: ReturnType<typeof evaluateProtonPdf>[] = [];
    for (let i = 0; i <= 140; i++) {
      const lx = minLogX + (i / 140) * (maxLogX - minLogX);
      const x = Math.pow(10, lx);
      if (x <= 0.985) samples.push(evaluateProtonPdf(x, qScaleGev));
    }

    const drawCurve = (
      selector: (s: ReturnType<typeof evaluateProtonPdf>) => number,
      color: string,
      dashed = false
    ) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      if (dashed) ctx.setLineDash([5, 4]);
      ctx.beginPath();
      samples.forEach((pt, idx) => {
        const px = toScreenX(pt.x);
        const py = toScreenY(selector(pt));
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    };

    drawCurve((s) => s.xGluon / 10, '#00E5FF');
    drawCurve((s) => s.xUv, '#FFE600');
    drawCurve((s) => s.xDv, '#FF0055');
    drawCurve((s) => s.xSea, '#A855F7', true);

    // Target Bjorken-x vertical line
    const markerX = toScreenX(channelInfo.typicalX);
    ctx.save();
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(markerX, padT);
    ctx.lineTo(markerX, padT + plotH);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 10px monospace';
    const labelX = markerX > padL + plotW - 115 ? markerX - 112 : markerX + 6;
    ctx.fillText(`x ≈ ${channelInfo.typicalX.toFixed(4)}`, labelX, padT + 14);

    // Axis title
    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('Bjorken Momentum Fraction x (log₁₀ scale)', padL + plotW * 0.25, h - 4);
  }, [qScaleGev, channelInfo.typicalX]);

  // Animated 3-Quark + Gluon Sea Quantum Proton Interior Schematic
  useEffect(() => {
    const canvas = protonBagRef.current;
    if (!canvas) return;
    let frame = 0;
    let rafId = 0;
    let visible = true;

    const stopObserve = observeCanvasVisibility(canvas, (isVisible) => {
      visible = isVisible;
    });

    const gluonSwirlCount = Math.min(36, Math.max(8, Math.round(6 + Math.log10(qScaleGev) * 9)));

    const renderFrame = () => {
      const viewport = setupHiDpiCanvas(canvas, 280, 260);
      if (viewport && visible) {
        const { ctx, width: w, height: h } = viewport;
        const cx = w / 2;
        const cy = h / 2;
        const rProton = Math.min(w, h) * 0.37;

        ctx.fillStyle = '#05080F';
        ctx.fillRect(0, 0, w, h);

        // Outer proton confinement boundary
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, rProton, 0, Math.PI * 2);
        ctx.stroke();

        // Swirling gluon-sea dipoles multiplying as Q rises
        for (let i = 0; i < gluonSwirlCount; i++) {
          const ang = (i / gluonSwirlCount) * Math.PI * 2 + (reduceMotion ? 0 : frame * 0.015 * (i % 2 === 0 ? 1 : -1));
          const rad = rProton * (0.28 + ((i * 37) % 62) / 100);
          const gx = cx + Math.cos(ang) * rad;
          const gy = cy + Math.sin(ang) * rad;
          ctx.fillStyle = i % 3 === 0 ? 'rgba(0,229,255,0.45)' : 'rgba(168,85,247,0.45)';
          ctx.beginPath();
          ctx.arc(gx, gy, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3 Valence quark coordinates
        const phase = reduceMotion ? 0 : frame * 0.022;
        const quarks = [
          { angle: phase, color: '#00E5FF', label: 'u' },
          { angle: phase + (2 * Math.PI) / 3, color: '#FFE600', label: 'u' },
          { angle: phase + (4 * Math.PI) / 3, color: '#FF0055', label: 'd' },
        ].map((q) => ({
          ...q,
          x: cx + Math.cos(q.angle) * rProton * 0.56,
          y: cy + Math.sin(q.angle) * rProton * 0.56,
        }));

        // Coiled color-flux Y-junction strings
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 2;
        quarks.forEach((q) => {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        });

        quarks.forEach((q) => {
          ctx.fillStyle = q.color;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(q.x, q.y, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(q.label, q.x, q.y + 0.5);
        });

        // Probe wavelength crosshair
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Q = ${qScaleGev} GeV`, 10, 16);
        ctx.fillText(`Sea Gluons: ${gluonSwirlCount}`, 10, h - 10);
      }

      if (!reduceMotion) {
        frame++;
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
    return () => {
      stopObserve();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [qScaleGev, reduceMotion]);

  return (
    <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2">
          <Atom className="w-5 h-5 text-cern-cyan" />
          <h3 className="text-lg font-display font-black uppercase text-white">
            Inside the Proton: Bjorken-x Parton Distribution Explorer
          </h3>
          <FidelityBadge
            type="ANALYTIC"
            formulaTex="f_i(x, Q^2) \;\xrightarrow{\text{DGLAP}}\; P_{ij} \otimes f_j"
          />
        </div>
        <LabExportBar
          title="PARTON-Bjorken-PDF"
          shareQuery={{ q: qScaleGev, mass: probeMassGev, sqrtS: sqrtSTev }}
        />
      </div>

      {/* Collision Process Presets */}
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        {PRESET_PROCESSES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setProbeMassGev(p.massGev);
              setQScaleGev(p.qGev);
            }}
            className={`px-2.5 py-1.5 border-2 border-black font-bold cursor-pointer transition-all ${
              Math.abs(probeMassGev - p.massGev) < 1
                ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
                : 'bg-canvas-sub text-text-secondary hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs bg-canvas-sub p-4 border-2 border-black">
        <div>
          <label htmlFor={qId} className="block font-bold text-cern-cyan mb-1">
            Resolution Scale Q: {qScaleGev} GeV
          </label>
          <input
            id={qId}
            type="range"
            min={2}
            max={1500}
            step={5}
            value={qScaleGev}
            onChange={(e) => setQScaleGev(Number(e.target.value))}
            className="w-full accent-cern-cyan cursor-pointer"
          />
        </div>
        <div>
          <label htmlFor={massId} className="block font-bold text-[#FFE600] mb-1">
            Resonance Mass M_X: {probeMassGev.toFixed(1)} GeV
          </label>
          <input
            id={massId}
            type="range"
            min={20}
            max={2500}
            step={10}
            value={probeMassGev}
            onChange={(e) => setProbeMassGev(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[11px] text-text-muted font-bold uppercase mb-1">Collider Beam Energy √s</span>
          <div className="flex gap-1.5">
            {[7, 13.6, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setSqrtSTev(val)}
                className={`flex-1 py-1 border-2 border-black font-black cursor-pointer ${
                  sqrtSTev === val ? 'bg-emerald-400 text-black' : 'bg-canvas-surface text-white'
                }`}
              >
                {val} TeV
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plot + Proton Bag Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8 bg-[#05080F] border-2 border-black p-2 flex flex-col justify-between">
          <canvas ref={canvasRef} className="w-full h-[270px] block" />
          <div className="flex flex-wrap gap-4 px-2 py-1 text-[11px] font-mono border-t border-zinc-800">
            <span className="text-cern-cyan font-bold">━ xg(x)/10 (Gluon Sea)</span>
            <span className="text-[#FFE600] font-bold">━ xu_v (Up Valence)</span>
            <span className="text-cern-magenta font-bold">━ xd_v (Down Valence)</span>
            <span className="text-purple-400 font-bold">┅ xq̄ (Sea Quarks)</span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#05080F] border-2 border-black p-2 flex flex-col justify-between">
          <canvas ref={protonBagRef} className="w-full h-[240px] block" />
          <div className="p-2 bg-canvas-sub border-t border-black text-[11px] font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">Dominant Channel:</span>
              <span className="text-emerald-400 font-bold">{channelInfo.dominantSubprocess}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">gg Fusion Share:</span>
              <strong className="text-cern-cyan">{(channelInfo.ggChannelShare * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">q+q̄ / qq Share:</span>
              <strong className="text-[#FFE600]">
                {((channelInfo.qqbarChannelShare + channelInfo.valenceValenceShare) * 100).toFixed(1)}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Quantitative Readout + KaTeX Law */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-canvas-sub p-3.5 border-2 border-black">
        <MathFormula
          tex={`x \\approx \\frac{M_X}{\\sqrt{s}} = \\frac{${probeMassGev.toFixed(1)}}{${(sqrtSTev * 1000).toFixed(0)}} = ${channelInfo.typicalX.toFixed(5)},\\quad xg(${channelInfo.typicalX.toFixed(3)})=${probePdf.xGluon.toFixed(2)}`}
          displayMode
        />
        <div className="text-xs font-sans text-text-secondary flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#FFE600] shrink-0 mt-0.5" />
          <span>
            Because the LHC collides protons at <strong className="text-white">{sqrtSTev} TeV</strong>, making a{' '}
            <strong className="text-white">{probeMassGev.toFixed(0)} GeV</strong> particle probes tiny{' '}
            <strong className="text-cern-cyan">x ≈ {channelInfo.typicalX.toFixed(4)}</strong>—where virtual{' '}
            <strong className="text-white">gluons</strong> carry {(probePdf.gluonFraction * 100).toFixed(0)}% of the probed parton density!
          </span>
        </div>
      </div>
    </div>
  );
};
