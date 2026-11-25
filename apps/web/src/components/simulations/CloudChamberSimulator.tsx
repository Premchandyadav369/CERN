'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { calculateCyclotronRadiusMeters, SeededRNG } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { useGlobalStore } from '@/lib/store';
import {
  Sparkles,
  Magnet,
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
  Zap,
  Target,
  Sliders,
} from 'lucide-react';

type SourceKind = 'alpha' | 'beta' | 'muon' | 'pair';

interface ChamberTrack {
  id: number;
  points: { x: number; y: number }[];
  secondaryPoints?: { x: number; y: number }[];
  kind: SourceKind;
  charge: number;
  width: number;
  color: string;
  secondaryColor?: string;
  alpha: number; // fade opacity
  progress: number; // 0..1 drawing animation
  label: string;
}

const SOURCE_META: Record<
  SourceKind,
  {
    name: string;
    formula: string;
    chargeText: string;
    typicalMom: number;
    color: string;
    desc: string;
  }
> = {
  alpha: {
    name: 'Alpha (²⁴¹Am)',
    formula: '⁴He²⁺ Nucleus',
    chargeText: '+2 e (Heavy)',
    typicalMom: 0.35,
    color: '#FFE600',
    desc: 'Heavy, +2 charge helium nuclei leave thick, short, dense vapor wakes (~4 cm in air).',
  },
  beta: {
    name: 'Beta (⁹⁰Sr)',
    formula: 'High-Speed e⁻',
    chargeText: '-1 e (Light)',
    typicalMom: 0.04,
    color: '#00E5FF',
    desc: 'Tiny mass causes sharp tight cyclotron spirals and zig-zag Coulomb scattering.',
  },
  muon: {
    name: 'Cosmic Muon',
    formula: 'Relativistic μ±',
    chargeText: '±1 e (207× mₑ)',
    typicalMom: 1.8,
    color: '#A855F7',
    desc: 'High-momentum cosmic-ray muons pierce cleanly across the whole chamber with gentle curvature.',
  },
  pair: {
    name: 'Pair Creation',
    formula: 'γ → e⁺ + e⁻',
    chargeText: '0 → (+1) + (-1)',
    typicalMom: 0.09,
    color: '#FF0055',
    desc: 'An invisible neutral photon strikes a vapor atom and splits into opposite-curving e⁺ and e⁻ helices.',
  },
};

export const CloudChamberSimulator: React.FC = () => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [source, setSource] = useState<SourceKind>('pair');
  const [magneticFieldT, setMagneticFieldT] = useState<number>(1.5);
  const [momentumGev, setMomentumGev] = useState<number>(0.12);
  const [running, setRunning] = useState<boolean>(true);
  const [tracks, setTracks] = useState<ChamberTrack[]>([]);
  const [detectiveAnswer, setDetectiveAnswer] = useState<string | null>(null);
  const [mysterySeed, setMysterySeed] = useState<number>(101);
  const [detectiveResult, setDetectiveResult] = useState<string | null>(null);

  const tracksRef = useRef<ChamberTrack[]>([]);
  const rngRef = useRef<SeededRNG>(new SeededRNG(4242));
  const nextIdRef = useRef<number>(1);

  // Sync ref with state count cleanly
  const updateTracks = useCallback((updater: (prev: ChamberTrack[]) => ChamberTrack[]) => {
    const next = updater(tracksRef.current);
    tracksRef.current = next;
    setTracks(next);
  }, []);

  // Generate physically realistic trajectory points inside 640x360 canvas
  const spawnParticleTrack = useCallback(
    (kind: SourceKind, bField: number, pGev: number, customCharge?: number) => {
      const rng = rngRef.current;
      const w = 640;
      const h = 360;
      // Scale factor: 1 meter ~ 120 px for clear educational curvature visualization
      const pxPerMeter = 160;

      const buildArc = (
        startX: number,
        startY: number,
        startAngle: number,
        mom: number,
        q: number,
        maxSteps: number,
        stepLen: number,
        scatterAmp: number,
        energyLossPerStep: number
      ) => {
        const pts: { x: number; y: number }[] = [{ x: startX, y: startY }];
        let x = startX;
        let y = startY;
        let theta = startAngle;
        let curMom = mom;

        for (let i = 0; i < maxSteps; i++) {
          const rMeters = calculateCyclotronRadiusMeters(Math.max(curMom, 0.005), bField, q);
          const rPx = isFinite(rMeters) ? Math.max(12, rMeters * pxPerMeter) : 1e6;
          // Sign of curvature depends on q * bField
          const sign = q * bField === 0 ? 0 : Math.sign(q * bField);
          const dTheta = sign !== 0 ? (sign * stepLen) / rPx : 0;
          const jitter = (rng.nextFloat() - 0.5) * scatterAmp;

          theta += dTheta + jitter;
          x += Math.cos(theta) * stepLen;
          y += Math.sin(theta) * stepLen;
          pts.push({ x, y });

          curMom = Math.max(0.004, curMom * (1 - energyLossPerStep));
          if (x < -20 || x > w + 20 || y < -20 || y > h + 20) break;
        }
        return pts;
      };

      let track: ChamberTrack;
      if (kind === 'alpha') {
        const startY = 80 + rng.nextFloat() * 200;
        const angle = (rng.nextFloat() - 0.5) * 0.7;
        const pts = buildArc(40, startY, angle, Math.max(pGev, 0.25), 2, 24, 5.5, 0.03, 0.02);
        track = {
          id: nextIdRef.current++,
          points: pts,
          kind,
          charge: 2,
          width: 6.5,
          color: SOURCE_META.alpha.color,
          alpha: 1,
          progress: reduceMotion ? 1 : 0.05,
          label: 'α (⁴He²⁺)',
        };
      } else if (kind === 'beta') {
        const startY = 60 + rng.nextFloat() * 240;
        const angle = (rng.nextFloat() - 0.5) * 0.9;
        const pts = buildArc(40, startY, angle, Math.min(pGev, 0.15), -1, 70, 5.0, 0.14, 0.022);
        track = {
          id: nextIdRef.current++,
          points: pts,
          kind,
          charge: -1,
          width: 2.0,
          color: SOURCE_META.beta.color,
          alpha: 1,
          progress: reduceMotion ? 1 : 0.05,
          label: 'β⁻ (e⁻)',
        };
      } else if (kind === 'muon') {
        const startX = 60 + rng.nextFloat() * 520;
        const angle = Math.PI / 2 + (rng.nextFloat() - 0.5) * 0.5;
        const q = customCharge ?? (rng.nextFloat() > 0.5 ? 1 : -1);
        const pts = buildArc(startX, 10, angle, Math.max(pGev, 0.8), q, 65, 7.0, 0.012, 0.002);
        track = {
          id: nextIdRef.current++,
          points: pts,
          kind,
          charge: q,
          width: 3.0,
          color: SOURCE_META.muon.color,
          alpha: 1,
          progress: reduceMotion ? 1 : 0.05,
          label: q > 0 ? 'μ⁺' : 'μ⁻',
        };
      } else {
        // Pair production from vertex inside chamber
        const vx = 140 + rng.nextFloat() * 140;
        const vy = 100 + rng.nextFloat() * 160;
        const baseAngle = (rng.nextFloat() - 0.5) * 0.35;
        const pPos = buildArc(vx, vy, baseAngle - 0.08, pGev, 1, 55, 5.0, 0.04, 0.018);
        const pEle = buildArc(vx, vy, baseAngle + 0.08, pGev, -1, 55, 5.0, 0.04, 0.018);
        track = {
          id: nextIdRef.current++,
          points: pPos,
          secondaryPoints: pEle,
          kind,
          charge: 0,
          width: 2.4,
          color: '#00FF66', // e+
          secondaryColor: '#FF0055', // e-
          alpha: 1,
          progress: reduceMotion ? 1 : 0.05,
          label: 'γ → e⁺e⁻',
        };
      }

      updateTracks((prev) => [...prev.slice(-14), track]);
    },
    [reduceMotion, updateTracks]
  );

  // Periodic cosmic emitter when running
  useEffect(() => {
    if (!running) return;
    // Spawn one right away if empty
    if (tracksRef.current.length === 0) {
      spawnParticleTrack(source, magneticFieldT, momentumGev);
    }
    const interval = setInterval(() => {
      spawnParticleTrack(source, magneticFieldT, momentumGev);
    }, 1500);
    return () => clearInterval(interval);
  }, [running, source, magneticFieldT, momentumGev, spawnParticleTrack]);

  // 60 FPS Cloud Chamber dark-field renderer
  useEffect(() => {
    let raf: number;
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Supersaturated dark chamber backdrop
      ctx.fillStyle = '#06090F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle cooling grid lines
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1;
      for (let gx = 40; gx < canvas.width; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, canvas.height);
        ctx.stroke();
      }
      for (let gy = 40; gy < canvas.height; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(canvas.width, gy);
        ctx.stroke();
      }

      // Draw tracks with vapor diffusion halo
      const updated: ChamberTrack[] = [];
      for (const tr of tracksRef.current) {
        const nextProgress = Math.min(1, tr.progress + (reduceMotion ? 1 : 0.075));
        const nextAlpha = tr.progress >= 1 ? tr.alpha - 0.0028 : tr.alpha;
        if (nextAlpha <= 0.03) continue;

        const drawPath = (pts: { x: number; y: number }[], strokeCol: string) => {
          const maxIdx = Math.max(2, Math.floor(pts.length * nextProgress));
          ctx.save();
          ctx.globalAlpha = nextAlpha;
          // Vapor glow outer aura
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = tr.width + 4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalAlpha = nextAlpha * 0.28;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < maxIdx; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.stroke();

          // Bright condensation core
          ctx.globalAlpha = nextAlpha;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = Math.max(1.2, tr.width * 0.55);
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < maxIdx; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.stroke();
          ctx.restore();
        };

        // If pair production, draw faint dashed incoming photon line first
        if (tr.kind === 'pair' && tr.points.length > 0) {
          ctx.save();
          ctx.globalAlpha = nextAlpha * 0.5;
          ctx.strokeStyle = '#FACC15';
          ctx.setLineDash([4, 6]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(10, tr.points[0].y);
          ctx.lineTo(tr.points[0].x, tr.points[0].y);
          ctx.stroke();
          ctx.restore();
        }

        drawPath(tr.points, tr.color);
        if (tr.secondaryPoints && tr.secondaryColor) {
          drawPath(tr.secondaryPoints, tr.secondaryColor);
        }

        updated.push({ ...tr, progress: nextProgress, alpha: nextAlpha });
      }
      tracksRef.current = updated;

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  const currentRadiusMeters = calculateCyclotronRadiusMeters(
    momentumGev,
    magneticFieldT,
    source === 'alpha' ? 2 : 1
  );

  // Mystery challenge generator
  const mysteryMode = mysterySeed % 3;
  const triggerMysteryTrack = () => {
    setDetectiveAnswer(null);
    setDetectiveResult(null);
    const nextSeed = mysterySeed + 1;
    setMysterySeed(nextSeed);
    const kindIdx = nextSeed % 3;
    if (kindIdx === 0) {
      spawnParticleTrack('alpha', magneticFieldT, 0.35, 2);
    } else if (kindIdx === 1) {
      spawnParticleTrack('beta', magneticFieldT, 0.04, -1);
    } else {
      spawnParticleTrack('muon', magneticFieldT, 2.2, 1);
    }
  };

  const checkDetectiveGuess = (guess: string) => {
    setDetectiveAnswer(guess);
    const expected = mysteryMode === 0 ? 'alpha' : mysteryMode === 1 ? 'beta' : 'muon';
    if (guess === expected) {
      setDetectiveResult(
        `✓ Spot on! Track thickness, length, and Lorentz curvature match ${SOURCE_META[expected].name}.`
      );
    } else {
      setDetectiveResult(
        `✕ Look closer at track width and curvature radius R = p / (0.3|q|B). The chamber just saw a ${SOURCE_META[expected].name}!`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-cern-cyan text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              DIFFUSION CLOUD &amp; BUBBLE CHAMBER
            </span>
            <FidelityBadge type="ANALYTIC" />
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
            Cloud Chamber &amp; Lorentz Trajectory Sandbox
          </h2>
          <p className="text-xs text-text-secondary font-mono max-w-2xl">
            Watch supersaturated alcohol vapor reveal invisible radiation. Flip the solenoidal magnetic
            field B to measure charge sign, momentum p, and particle mass in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setRunning(!running)}
            className="px-3.5 py-2 bg-cern-blue hover:bg-cern-accent text-white border-2 border-black shadow-[3px_3px_0px_#00E5FF] font-bold uppercase flex items-center gap-1.5 cursor-pointer"
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{running ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>
          <button
            onClick={() => {
              tracksRef.current = [];
              setTracks([]);
            }}
            className="px-3 py-2 bg-canvas-sub hover:bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000] font-bold uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Purge Chamber</span>
          </button>
        </div>
      </div>

      {/* ELI5 Analogy */}
      <Eli5Card
        title="How Invisible Particles Leave Vapor Trails Like Jet Airplanes"
        analogy="Just like a high-flying jet leaves white condensation streaks in cold sky air, tiny subatomic particles rip through cold mist inside a chamber and leave glowing cloud trails. When we turn on a giant magnet, light particles curl into tight loops while heavy ones plow straight ahead!"
        keyPoints={[
          'Thick, short, straight tracks = heavy Alpha particles (like bowling balls hitting pins).',
          'Tight, curly, zig-zag spirals = featherweight Beta electrons easily pushed by magnets.',
          'Opposite curves splitting from thin air = a neutral gamma photon transforming into matter + antimatter (e⁻ + e⁺)!',
        ]}
        whatToTry="Select 'Pair Creation (γ → e⁺ + e⁻)' and slide the Magnetic Field from +2.0 T across 0 to -2.0 T — watch the green positron and pink electron swap bending directions!"
        doi="10.1016/0370-2693(73)90484-X"
        citationLabel="Gargamelle Collaboration (1973), CERN Neutral Current Bubble Chamber Discovery"
      />

      {/* Radiation Source Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(SOURCE_META) as SourceKind[]).map((key) => {
          const meta = SOURCE_META[key];
          const active = source === key;
          return (
            <button
              key={key}
              onClick={() => {
                setSource(key);
                setMomentumGev(meta.typicalMom);
                spawnParticleTrack(key, magneticFieldT, meta.typicalMom);
              }}
              className={`p-3.5 border-2 border-black text-left font-mono transition-all cursor-pointer space-y-1.5 ${
                active
                  ? 'bg-cern-blue text-white shadow-[4px_4px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                  : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[3px_3px_0px_#000]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-white">{meta.name}</span>
                <span
                  className="w-3 h-3 border border-black"
                  style={{ backgroundColor: meta.color }}
                />
              </div>
              <div className="text-[11px] font-bold text-[#FFE600]">{meta.formula}</div>
              <div className="text-[10px] text-text-muted">{meta.chargeText}</div>
            </button>
          );
        })}
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Live Vapor Canvas */}
        <div className="lg:col-span-8 space-y-3">
          <div className="p-3 bg-[#06090F] border-3 border-black shadow-[6px_6px_0px_#000] relative">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-800 text-[11px] font-mono">
              <span className="text-cern-cyan font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Supersaturated Isopropanol Tray (-35°C)
              </span>
              <div className="flex items-center gap-3 text-text-muted">
                <span>
                  B_z = <strong className="text-[#FFE600]">{magneticFieldT.toFixed(2)} T</strong>{' '}
                  {magneticFieldT >= 0 ? '(⊙ Out of Page)' : '(⊗ Into Page)'}
                </span>
                <span>
                  R ={' '}
                  <strong className="text-emerald-400">
                    {isFinite(currentRadiusMeters) ? `${currentRadiusMeters.toFixed(2)} m` : '∞ (Straight)'}
                  </strong>
                </span>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              className="w-full h-auto block border-2 border-zinc-800 bg-[#06090F]"
            />

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-text-muted">
              <span>Active Source: {SOURCE_META[source].desc}</span>
              <button
                onClick={() => spawnParticleTrack(source, magneticFieldT, momentumGev)}
                className="px-2.5 py-1 bg-cern-cyan hover:bg-sky-300 text-black font-black border border-black uppercase cursor-pointer"
              >
                + Fire Single Event
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Controls + Particle Detective */}
        <div className="lg:col-span-4 space-y-4">
          {/* Magnet & Momentum Controls */}
          <div className="p-4 bg-canvas-surface border-3 border-black shadow-[5px_5px_0px_#000] space-y-4">
            <h3 className="text-sm font-display font-black uppercase text-white border-b-2 border-black pb-2 flex items-center gap-2">
              <Magnet className="w-4 h-4 text-[#FFE600]" /> Chamber Parameters
            </h3>

            {/* Magnetic Field Slider */}
            <div className="p-3 bg-canvas-sub border-2 border-black space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-text-muted uppercase">Solenoid Magnetic Field (B):</span>
                <span className="text-[#FFE600]">{magneticFieldT.toFixed(2)} T</span>
              </div>
              <input
                type="range"
                min={-3.5}
                max={3.5}
                step={0.1}
                value={magneticFieldT}
                onChange={(e) => setMagneticFieldT(Number(e.target.value))}
                className="w-full accent-[#FFE600] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-text-muted">
                <span>-3.5 T (Reverse)</span>
                <button
                  onClick={() => setMagneticFieldT(0)}
                  className="underline hover:text-white cursor-pointer"
                >
                  Zero B (0 T)
                </button>
                <span>+3.5 T</span>
              </div>
            </div>

            {/* Momentum Slider */}
            <div className="p-3 bg-canvas-sub border-2 border-black space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-text-muted uppercase">Particle Momentum (p):</span>
                <span className="text-cern-cyan">{momentumGev.toFixed(3)} GeV/c</span>
              </div>
              <input
                type="range"
                min={0.02}
                max={3.0}
                step={0.02}
                value={momentumGev}
                onChange={(e) => setMomentumGev(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
              />
            </div>

            {/* Lorentz Formula Live Calculation */}
            <div className="p-3 bg-black border-2 border-black text-xs font-mono space-y-1">
              <div className="text-[10px] uppercase text-text-muted font-bold">
                Cyclotron Radius Law (SI/HEP):
              </div>
              <div className="text-[#FFE600] font-bold">R = p / (0.2998 · |q| · |B|)</div>
              <div className="text-emerald-400 font-bold">
                R = {momentumGev.toFixed(3)} / (0.2998 · {source === 'alpha' ? 2 : 1} ·{' '}
                {Math.abs(magneticFieldT).toFixed(2)}) ={' '}
                {isFinite(currentRadiusMeters) ? `${currentRadiusMeters.toFixed(3)} m` : '∞ m'}
              </div>
            </div>
          </div>

          {/* Interactive Particle Detective Challenge */}
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#FF0055] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black uppercase text-pink-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Particle Detective Mode
              </span>
              <button
                onClick={triggerMysteryTrack}
                className="px-2 py-1 bg-pink-500 hover:bg-pink-400 text-black font-mono font-black text-[10px] border border-black uppercase cursor-pointer"
              >
                Fire Unknown Track
              </button>
            </div>
            <p className="text-[11px] font-sans text-text-secondary">
              Click &quot;Fire Unknown Track&quot;, observe its width, range, and magnetic bend inside the chamber, then identify it:
            </p>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
              {(['alpha', 'beta', 'muon'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => checkDetectiveGuess(g)}
                  className={`py-1.5 border-2 border-black font-bold uppercase cursor-pointer ${
                    detectiveAnswer === g
                      ? 'bg-cern-cyan text-black'
                      : 'bg-canvas-sub text-white hover:bg-zinc-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {detectiveResult && (
              <div className="p-2 bg-black border border-zinc-700 text-[11px] font-mono text-emerald-300">
                {detectiveResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
