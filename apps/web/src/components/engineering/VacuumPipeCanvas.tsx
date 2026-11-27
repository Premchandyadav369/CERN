'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGlobalStore } from '@/lib/store';
import {
  drawAdditiveGlowDot,
  drawCernGridBackdrop,
  drawPhosphorCurve,
  observeOffscreenVisibility,
  setupHiDpiCanvas,
} from '@/lib/cernVisuals';
import { Pause, Play } from 'lucide-react';

interface VacuumPipeCanvasProps {
  vacuumLogExp: number;
  beamLifetimeHours: number;
}

interface GasMolecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const VacuumPipeCanvas: React.FC<VacuumPipeCanvasProps> = ({
  vacuumLogExp,
  beamLifetimeHours,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [isPlaying, setIsPlaying] = useState(true);
  const isVisibleRef = useRef(true);

  const stateRef = useRef({ vacuumLogExp, beamLifetimeHours, reduceMotion, isPlaying });
  useEffect(() => {
    stateRef.current = { vacuumLogExp, beamLifetimeHours, reduceMotion, isPlaying };
  }, [vacuumLogExp, beamLifetimeHours, reduceMotion, isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const cleanupVis = observeOffscreenVisibility(container, (vis) => {
      isVisibleRef.current = vis;
    });

    // Pool of residual H2 / CO gas molecules
    const molecules: GasMolecule[] = Array.from({ length: 48 }, (_, i) => ({
      x: ((i * 73) % 100) / 100,
      y: 0.25 + (((i * 41) % 50) / 100),
      vx: (((i % 7) - 3) * 0.0018) || 0.0012,
      vy: (((i % 5) - 2) * 0.0022) || -0.0015,
    }));

    let t = 0;
    let rafId = 0;

    const render = () => {
      rafId = requestAnimationFrame(render);
      if (!isVisibleRef.current) return;
      const { vacuumLogExp: exp, beamLifetimeHours: lifeH, reduceMotion: rm, isPlaying: play } = stateRef.current;
      if (play && !rm) {
        t += 0.04;
      }

      const vp = setupHiDpiCanvas(canvas, 500, 154);
      if (!vp) return;
      const { ctx, width: w, height: h } = vp;

      const isHealthy = lifeH >= 20;
      const isCritical = lifeH < 5;
      drawCernGridBackdrop(ctx, w, h, {
        accentColor: isCritical ? 'rgba(239, 68, 68, 0.09)' : 'rgba(16, 185, 129, 0.08)',
        bgInner: isCritical ? '#20090E' : '#061A1E',
        bgOuter: '#03060D',
        gridStep: 22,
        showScanlines: true,
      });

      const pipeTop = h * 0.28;
      const pipeBot = h * 0.74;
      const cy = (pipeTop + pipeBot) * 0.5;

      // Copper-coated 1.9 K cryo-beam screen walls
      ctx.strokeStyle = '#0EA5E9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, pipeTop);
      ctx.lineTo(w - 16, pipeTop);
      ctx.moveTo(16, pipeBot);
      ctx.lineTo(w - 16, pipeBot);
      ctx.stroke();

      // Cryopumping wall condensation shimmer
      ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.fillRect(16, pipeTop - 5, w - 32, 5);
      ctx.fillRect(16, pipeBot, w - 32, 5);

      // Relativistic 6.8 TeV Proton Beam Core
      const beamPts = [
        { x: 18, y: cy },
        { x: w - 18, y: cy },
      ];
      drawPhosphorCurve(ctx, beamPts, isCritical ? '#F87171' : '#00FF66', 1.6, 0.75);

      // Flying Proton Bunches
      for (let b = 0; b < 5; b++) {
        const bx = 24 + (((t * 140 + b * ((w - 48) / 5)) % (w - 48)));
        drawAdditiveGlowDot(ctx, bx, cy, 12, isCritical ? '248, 113, 113' : '0, 255, 102', 0.9);
      }

      // Residual Gas Molecules proportional to log pressure (-11.5 .. -6.0)
      const activeCount = Math.min(molecules.length, Math.max(2, Math.round(((exp + 11.5) / 5.5) * molecules.length)));
      for (let i = 0; i < activeCount; i++) {
        const m = molecules[i];
        if (play && !rm) {
          m.x = (m.x + m.vx + 1) % 1;
          m.y += m.vy;
          if (m.y < 0.31 || m.y > 0.71) m.vy *= -1;
        }
        const mx = 20 + m.x * (w - 40);
        const my = m.y * h;
        const nearBeam = Math.abs(my - cy) < 7;
        drawAdditiveGlowDot(ctx, mx, my, nearBeam ? 13 : 7, nearBeam ? '255, 0, 85' : '251, 191, 36', nearBeam ? 0.95 : 0.6);

        // Beam-gas Coulomb scatter spark if molecule intercepts beam axis
        if (nearBeam && isCritical) {
          ctx.strokeStyle = 'rgba(255, 0, 85, 0.75)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mx, cy);
          ctx.lineTo(mx + 22, cy + (i % 2 === 0 ? -16 : 16));
          ctx.stroke();
        }
      }

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 9.5px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`BEAM SCREEN · P = 10^${exp.toFixed(1)} mbar · ${activeCount} SITES`, 14, 19);
      ctx.fillStyle = isHealthy ? '#34D399' : isCritical ? '#F87171' : '#FBBF24';
      ctx.fillText(isHealthy ? 'CRYOPUMPING NOMINAL' : isCritical ? 'BEAM LOSS ALERT' : 'DEGRADED VACUUM', 14, h - 10);
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
      className="relative w-full h-[154px] bg-[#03060D] border-2 border-black shadow-[3px_3px_0px_#000] overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      <button
        type="button"
        onClick={() => setIsPlaying((p) => !p)}
        aria-label={isPlaying ? 'Pause vacuum beam animation' : 'Play vacuum beam animation'}
        className="absolute bottom-1.5 right-2 px-2 py-0.5 bg-black/85 hover:bg-slate-800 text-emerald-400 border border-emerald-400/50 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </button>
    </div>
  );
};
