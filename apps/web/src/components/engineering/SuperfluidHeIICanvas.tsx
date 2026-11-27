'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGlobalStore } from '@/lib/store';
import {
  drawAdditiveGlowDot,
  drawCernGridBackdrop,
  drawPhosphorCurve,
  drawVectorArrow,
  observeOffscreenVisibility,
  setupHiDpiCanvas,
} from '@/lib/cernVisuals';
import { Pause, Play } from 'lucide-react';

interface SuperfluidHeIICanvasProps {
  temperatureK: number;
  magnetCurrentKa: number;
  isSuperfluidHeII: boolean;
}

interface VortexNode {
  angle: number;
  ring: number;
  spin: number;
  phase: number;
}

interface BoilBubble {
  xFrac: number;
  yFrac: number;
  vy: number;
  r: number;
  wobble: number;
}

export const SuperfluidHeIICanvas: React.FC<SuperfluidHeIICanvasProps> = ({
  temperatureK,
  magnetCurrentKa,
  isSuperfluidHeII,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [isPlaying, setIsPlaying] = useState(true);
  const isVisibleRef = useRef(true);

  const propsRef = useRef({ temperatureK, magnetCurrentKa, isSuperfluidHeII, reduceMotion, isPlaying });
  useEffect(() => {
    propsRef.current = { temperatureK, magnetCurrentKa, isSuperfluidHeII, reduceMotion, isPlaying };
  }, [temperatureK, magnetCurrentKa, isSuperfluidHeII, reduceMotion, isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const cleanupVis = observeOffscreenVisibility(container, (vis) => {
      isVisibleRef.current = vis;
    });

    // Deterministic quantized Onsager-Feynman vortex lattice nodes
    const vortices: VortexNode[] = [];
    for (let ring = 0; ring < 2; ring++) {
      const count = ring === 0 ? 6 : 10;
      for (let i = 0; i < count; i++) {
        vortices.push({
          angle: (i / count) * Math.PI * 2 + ring * 0.25,
          ring,
          spin: ring % 2 === 0 ? 1 : -1,
          phase: i * 0.9,
        });
      }
    }

    // Convective bubbles for He-I / Gas regime
    const bubbles: BoilBubble[] = Array.from({ length: 34 }, (_, i) => ({
      xFrac: 0.12 + ((i * 37) % 76) / 100,
      yFrac: 0.2 + ((i * 53) % 72) / 100,
      vy: 0.004 + (i % 5) * 0.0014,
      r: 3 + (i % 4) * 2.2,
      wobble: i * 1.1,
    }));

    let t = 0;
    let rafId = 0;

    const render = () => {
      rafId = requestAnimationFrame(render);
      const { temperatureK: T, magnetCurrentKa: I, isSuperfluidHeII: isSF, reduceMotion: rm, isPlaying: play } =
        propsRef.current;
      if (!isVisibleRef.current) return;

      if (play && !rm) {
        t += 0.032;
      }

      const vp = setupHiDpiCanvas(canvas, 500, 196);
      if (!vp) return;
      const { ctx, width: w, height: h } = vp;
      const cx = w * 0.5;
      const cy = h * 0.54;

      const isGas = T > 4.22;
      drawCernGridBackdrop(ctx, w, h, {
        accentColor: isSF ? 'rgba(0, 229, 255, 0.09)' : isGas ? 'rgba(239, 68, 68, 0.09)' : 'rgba(245, 158, 11, 0.09)',
        bgInner: isSF ? '#061B2E' : isGas ? '#24090D' : '#1E1406',
        bgOuter: '#03060D',
        gridStep: 24,
        showScanlines: true,
        showCrosshair: false,
      });

      // Landau-Tisza Two-Fluid Superfluid Condensate Fraction: rho_s / rho = 1 - (T / T_lambda)^5.6
      const lambdaRatio = Math.min(1, Math.max(0, T / 2.17));
      const superfluidFraction = isSF ? Math.max(0.05, 1 - Math.pow(lambdaRatio, 5.6)) : 0;

      // 1. Cryostat Bath Flow Streamlines (Second-Sound Entropy Waves vs Turbulent Eddies)
      const streamRows = 5;
      for (let r = 0; r < streamRows; r++) {
        const baseY = 34 + r * ((h - 60) / (streamRows - 1));
        const pts: { x: number; y: number }[] = [];
        for (let sx = 14; sx <= w - 14; sx += 10) {
          const normX = sx / w;
          // Deflect streamlines smoothly around central Nb-Ti magnet conductor
          const dx = sx - cx;
          const dy = baseY - cy;
          const distSq = dx * dx + dy * dy + 650;
          const deflectY = (dy / distSq) * 1850;
          const wave = isSF
            ? Math.sin(normX * 14 - t * 2.4 + r * 0.7) * 3.5 * superfluidFraction
            : Math.sin(normX * 22 - t * 4.0 + r * 1.9) * 8.5 + Math.cos(normX * 37 + t * 2.7) * 3.2;
          pts.push({ x: sx, y: baseY + deflectY + wave });
        }
        drawPhosphorCurve(
          ctx,
          pts,
          isSF ? '#00E5FF' : isGas ? '#EF4444' : '#FFB020',
          isSF ? 1.35 : 1.1,
          isSF ? 0.55 : 0.42
        );
      }

      // 2. Superfluid Quantized Onsager-Feynman Vortices (T <= 2.17 K) OR Nucleate Boiling Bubbles (T > 2.17 K)
      if (isSF) {
        vortices.forEach((v) => {
          const orbitR = v.ring === 0 ? 58 : 96;
          const ang = v.angle + t * 0.35 * v.spin;
          const vx = cx + Math.cos(ang) * orbitR * 1.45;
          const vy = cy + Math.sin(ang) * orbitR * 0.58;

          drawAdditiveGlowDot(ctx, vx, vy, 18, '0, 229, 255', 0.42 * superfluidFraction);

          // Quantized circulation spiral arms (kappa = h/m_He)
          ctx.save();
          ctx.strokeStyle = `rgba(125, 249, 255, ${0.55 * superfluidFraction})`;
          ctx.lineWidth = 1.1;
          for (let arm = 0; arm < 2; arm++) {
            ctx.beginPath();
            for (let step = 0; step < 12; step++) {
              const rad = 2.5 + step * 1.15;
              const theta = arm * Math.PI + step * 0.45 * v.spin + t * 2.2 * v.spin;
              const px = vx + Math.cos(theta) * rad;
              const py = vy + Math.sin(theta) * rad;
              if (step === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
          ctx.restore();
        });
      } else {
        // He-I Nucleate Boiling / Vapor Film Bubbles
        const bubbleIntensity = isGas ? 1.0 : 0.78;
        bubbles.forEach((b) => {
          if (play && !rm) {
            b.yFrac -= b.vy * (isGas ? 1.7 : 1.0);
            if (b.yFrac < 0.08) {
              b.yFrac = 0.92;
            }
          }
          const bx = b.xFrac * w + Math.sin(t * 2.8 + b.wobble) * 5;
          const by = b.yFrac * h;
          drawAdditiveGlowDot(ctx, bx, by, b.r * 2.8, isGas ? '239, 68, 68' : '255, 176, 32', 0.45 * bubbleIntensity);
          ctx.strokeStyle = isGas ? 'rgba(254, 202, 202, 0.85)' : 'rgba(253, 230, 138, 0.85)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(bx, by, b.r, 0, Math.PI * 2);
          ctx.stroke();
        });
      }

      // 3. Central Superconducting Nb-Ti Rutherford Conductor Cross-Section & Kapitza Film Layer
      const filmRadius = isSF ? 28 : isGas ? 42 : 36;
      drawAdditiveGlowDot(
        ctx,
        cx,
        cy,
        filmRadius * 2.2,
        isSF ? '0, 229, 255' : isGas ? '239, 68, 68' : '245, 158, 11',
        0.55
      );

      // Vapor boundary insulation ring if above Lambda point
      if (!isSF) {
        ctx.save();
        ctx.strokeStyle = isGas ? 'rgba(239, 68, 68, 0.75)' : 'rgba(251, 191, 36, 0.7)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, 56, 30, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Copper-matrix Rutherford cable keystone core
      ctx.save();
      ctx.fillStyle = isSF ? '#0F2942' : '#451A03';
      ctx.strokeStyle = isSF ? '#38BDF8' : '#F87171';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 42, cy - 16, 84, 32, 6);
      ctx.fill();
      ctx.stroke();

      // 10 Nb-Ti strand filaments inside cable
      for (let i = 0; i < 5; i++) {
        for (let row = 0; row < 2; row++) {
          const sx = cx - 30 + i * 15;
          const sy = cy - 6 + row * 12;
          ctx.fillStyle = isSF ? '#00FF66' : '#FB923C';
          ctx.beginPath();
          ctx.arc(sx, sy, 3.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 4. Outward Heat Extraction Flux Vectors (Rapid thermal siphon in He-II vs trapped heat above 2.17 K)
      const fluxLen = isSF ? 26 + 8 * Math.sin(t * 2.5) : 10;
      const fluxColor = isSF ? '#00FF66' : '#EF4444';
      drawVectorArrow(ctx, cx, cy - 22, cx, cy - 22 - fluxLen, fluxColor, 1.8, 5);
      drawVectorArrow(ctx, cx, cy + 22, cx, cy + 22 + fluxLen, fluxColor, 1.8, 5);
      drawVectorArrow(ctx, cx - 48, cy, cx - 48 - fluxLen * 1.2, cy, fluxColor, 1.8, 5);
      drawVectorArrow(ctx, cx + 48, cy, cx + 48 + fluxLen * 1.2, cy, fluxColor, 1.8, 5);

      // 5. Crisp Telemetry HUD Labels
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 9.5px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        isSF
          ? `HE-II CONDENSATE · ρ_s/ρ = ${(superfluidFraction * 100).toFixed(0)}% · κ VORTICES`
          : isGas
          ? `SUPERHEATED VAPOR (${T.toFixed(2)} K) · QUENCH`
          : `HE-I FILM BOILING (${T.toFixed(2)} K) · BUBBLES`,
        14,
        19
      );

      ctx.fillStyle = isSF ? '#00E5FF' : '#FCA5A5';
      ctx.textAlign = 'right';
      ctx.fillText(`I = ${I.toFixed(2)} kA`, w - 14, 19);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        isSF
          ? 'ZERO VISCOSITY · SECOND-SOUND HEAT SIPHON ACTIVE'
          : 'THERMAL CONDUCTIVITY COLLAPSED (~0.02 W/m·K)',
        14,
        h - 10
      );
    };

    render();
    return () => {
      cancelAnimationFrame(rafId);
      cleanupVis();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[196px] bg-[#03060D] border-2 border-black shadow-[3px_3px_0px_#000] overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      <button
        type="button"
        onClick={() => setIsPlaying((p) => !p)}
        aria-label={isPlaying ? 'Pause Superfluid He-II animation' : 'Play Superfluid He-II animation'}
        className="absolute bottom-1.5 right-2 px-2 py-0.5 bg-black/85 hover:bg-slate-800 text-cern-cyan border border-cern-cyan/50 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </button>
    </div>
  );
};
