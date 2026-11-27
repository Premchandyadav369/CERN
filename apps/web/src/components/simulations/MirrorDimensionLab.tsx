'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import * as THREE from 'three';
import { calculateExtraDimensionKaluzaKlein } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { Orbit, Sparkles } from 'lucide-react';

export const MirrorDimensionLab: React.FC = () => {
  const sliderPrefix = useId();
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const [extraDims, setExtraDims] = useState<number>(2);
  const [radiusMicrons, setRadiusMicrons] = useState<number>(220);
  const [webglFailed, setWebglFailed] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const res = useMemo(
    () => calculateExtraDimensionKaluzaKlein(extraDims, radiusMicrons),
    [extraDims, radiusMicrons]
  );

  const stateRef = useRef({ extraDims, radiusMicrons, reduceMotion });
  useEffect(() => {
    stateRef.current = { extraDims, radiusMicrons, reduceMotion };
  }, [extraDims, radiusMicrons, reduceMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch {
      setWebglFailed(true);
      return;
    }

    const w = container.clientWidth || 540;
    const h = container.clientHeight || 260;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x090414, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1.8, 6.2);
    camera.lookAt(0, 0, 0);

    // Kaleidoscopic Mirror-Dimension nested Calabi-Yau wireframe manifolds
    const p = 2 + (extraDims % 4);
    const q = 3 + ((extraDims + 1) % 5);
    const outerKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.55, 0.32, 128, 20, p, q),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true })
    );
    scene.add(outerKnot);

    const innerKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.9, 0.18, 96, 14, q, p),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true })
    );
    scene.add(innerKnot);

    let animId = 0;
    let angle = 0;
    const renderLoop = () => {
      const { reduceMotion: rm, radiusMicrons: r } = stateRef.current;
      if (!rm) angle += 0.012;
      outerKnot.rotation.x = angle * 0.7;
      outerKnot.rotation.y = angle;
      innerKnot.rotation.y = -angle * 1.3;
      innerKnot.rotation.z = angle * 0.5;
      const scaleMod = 0.78 + Math.min(0.45, Math.log10(Math.max(1, r)) * 0.14);
      outerKnot.scale.setScalar(scaleMod);
      renderer.render(scene, camera);
      if (!rm) animId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [extraDims, radiusMicrons, reduceMotion]);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Doctor Strange’s Mirror Dimension = Real Curled-Up Extra Dimensions!"
        analogy="Imagine walking on a garden hose from far away—it looks like a 1D line. Zoom in close (like an ant!) and you discover a hidden curled-up circle around it! At CERN, physicists look for Kaluza-Klein gravitons and microscopic quantum black holes leaking gravity into tiny hidden dimensions!"
      />

      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <FidelityBadge type="ANALYTIC" />
            <span className="px-2 py-0.5 bg-amber-400 text-black font-mono font-black text-[10px] border-2 border-black uppercase">
              MIRROR DIMENSION // ADD &amp; KALUZA-KLEIN GRAVITY
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-white">
            Curled-Up Extra Spatial Dimensions &amp; KK Graviton Lab
          </h2>
          <p className="text-xs font-mono text-text-secondary mt-1">
            Explore how n compactified spatial dimensions lower the true Planck scale M_D into LHC TeV reach.
          </p>
        </div>

        <span
          className={`px-3 py-1.5 border-2 border-black font-mono font-black text-xs ${
            res.lhcAccessible ? 'bg-emerald-400 text-black' : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          {res.lhcAccessible ? 'WITHIN 14 TeV LHC REACH' : 'BEYOND LHC ENERGY HORIZON'}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 space-y-4 bg-canvas-surface border-3 border-black p-4 shadow-[5px_5px_0px_#000]">
          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-n`} className="text-text-muted uppercase">
                Extra Spatial Dimensions (n):
              </label>
              <span className="text-amber-400">{extraDims} D (Total {3 + extraDims + 1}D Spacetime)</span>
            </div>
            <input
              id={`${sliderPrefix}-n`}
              type="range"
              min={2}
              max={6}
              step={1}
              value={extraDims}
              aria-valuetext={`${extraDims} extra dimensions`}
              onChange={(e) => setExtraDims(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-r`} className="text-text-muted uppercase">
                Compactification Radius R:
              </label>
              <span className="text-cern-cyan">{radiusMicrons} μm ({res.compactRadiusMm.toFixed(3)} mm)</span>
            </div>
            <input
              id={`${sliderPrefix}-r`}
              type="range"
              min={1}
              max={1000}
              step={5}
              value={radiusMicrons}
              aria-valuetext={`${radiusMicrons} micrometers`}
              onChange={(e) => setRadiusMicrons(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-canvas-sub border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">Effective Planck M_D</dt>
              <dd className="text-amber-300 font-black text-base mt-0.5">
                {res.effectivePlanckTev < 1000
                  ? `${res.effectivePlanckTev.toFixed(2)} TeV`
                  : `${res.effectivePlanckTev.toExponential(1)} TeV`}
              </dd>
            </div>
            <div className="p-3 bg-canvas-sub border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">KK Mode Spacing</dt>
              <dd className="text-cern-cyan font-black text-base mt-0.5">
                {res.kkModeSpacingEv.toExponential(2)} eV
              </dd>
            </div>
          </dl>

          <MathFormula
            tex="M_{\text{Pl}}^2 \sim M_D^{2+n}\,R^n, \quad \Delta m_{\text{KK}} = \frac{\hbar c}{R}"
            label="ADD Higher-Dimensional Gravity Law:"
          />
        </div>

        <div className="xl:col-span-7 bg-[#090414] border-3 border-black p-4 shadow-[5px_5px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs font-mono">
            <span className="font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <Orbit className="w-4 h-4" /> Calabi-Yau Compactification Manifold ({extraDims} Hidden Loops)
            </span>
            <span className="text-cern-cyan flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Three.js Live Wireframe
            </span>
          </div>
          {webglFailed ? (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-zinc-400">
              WebGL context unavailable—parametric ADD metrics remain active on the left.
            </div>
          ) : (
            <div ref={containerRef} className="w-full h-64 border border-purple-900 bg-[#090414]" />
          )}
        </div>
      </div>
    </div>
  );
};
