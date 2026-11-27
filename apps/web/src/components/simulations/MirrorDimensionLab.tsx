'use client';

import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import * as THREE from 'three';
import { calculateExtraDimensionKaluzaKlein } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import {
  createPlasmaWaveShaderMaterial,
  createThreeGlowTexture,
  observeOffscreenVisibility,
} from '@/lib/cernVisuals';
import { Orbit, Sparkles, Rotate3D } from 'lucide-react';

export const MirrorDimensionLab: React.FC = () => {
  const sliderPrefix = useId();
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const [extraDims, setExtraDims] = useState<number>(2);
  const [radiusMicrons, setRadiusMicrons] = useState<number>(220);
  const [webglFailed, setWebglFailed] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const camRef = useRef({ az: 0.4, el: 0.35, dist: 6.2, dragging: false, lastX: 0, lastY: 0 });
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
    let isVisible = true;
    const cleanupVis = observeOffscreenVisibility(container, (v) => {
      isVisible = v;
    });

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      cleanupVis();
      return;
    }

    const w = container.clientWidth || 540;
    const h = container.clientHeight || 280;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x060210, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060210, 0.055);
    const camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 100);

    scene.add(new THREE.AmbientLight(0xd8b4fe, 0.7));
    const goldLight = new THREE.PointLight(0xffb000, 3.0, 22);
    goldLight.position.set(3, 3, 4);
    scene.add(goldLight);
    const cyanLight = new THREE.PointLight(0x00e5ff, 2.5, 22);
    cyanLight.position.set(-4, -2, 3);
    scene.add(cyanLight);

    const disposables: Array<{ dispose: () => void }> = [];
    const glowTex = createThreeGlowTexture(64);
    if (glowTex) disposables.push(glowTex);

    // Kaleidoscopic Mirror-Dimension Nested Calabi-Yau Manifolds with GLSL Portal Rim Shader
    const p = 2 + (extraDims % 4);
    const q = 3 + ((extraDims + 1) % 5);
    const knotGeom = new THREE.TorusKnotGeometry(1.42, 0.28, 160, 26, p, q);
    const solidMat = createPlasmaWaveShaderMaterial(0xf59e0b, 0xa855f7);
    const solidKnot = new THREE.Mesh(knotGeom, solidMat);
    scene.add(solidKnot);

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
    });
    const wireKnot = new THREE.Mesh(knotGeom, wireMat);
    wireKnot.scale.setScalar(1.03);
    scene.add(wireKnot);
    disposables.push(knotGeom, solidMat, wireMat);

    // Counter-rotating Golden & Cyan Mirror Mandala Rings
    const portalRings: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const rGeo = new THREE.TorusGeometry(2.1 + i * 0.26, 0.024, 10, 84);
      const rMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00e5ff : 0xfbbf24,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = i * 0.7;
      ring.rotation.y = i * 1.1;
      portalRings.push(ring);
      scene.add(ring);
      disposables.push(rGeo, rMat);
    }

    // Orbiting Kaluza-Klein Graviton Soft Luminous Halo
    const ptsCount = 190;
    const positions = new Float32Array(ptsCount * 3);
    for (let i = 0; i < ptsCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = 1.9 + Math.random() * 1.65;
      positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
      positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      positions[i * 3 + 2] = r * Math.cos(ph);
    }
    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.22,
      map: glowTex ?? undefined,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const halo = new THREE.Points(pGeom, pMat);
    scene.add(halo);
    disposables.push(pGeom, pMat);

    let animId = 0;
    let angle = 0;
    const renderLoop = () => {
      if (!isVisible) {
        if (!stateRef.current.reduceMotion) animId = requestAnimationFrame(renderLoop);
        return;
      }
      const { reduceMotion: rm, radiusMicrons: r } = stateRef.current;
      if (!rm) {
        angle += 0.013;
        if (!camRef.current.dragging) camRef.current.az += 0.003;
      }
      solidMat.uniforms.uTime.value = angle * 1.8;
      solidMat.uniforms.uIntensity.value = 0.85;
      solidKnot.rotation.x = angle * 0.6;
      solidKnot.rotation.y = angle;
      wireKnot.rotation.copy(solidKnot.rotation);
      const scaleMod = 0.78 + Math.min(0.4, Math.log10(Math.max(1, r)) * 0.12);
      solidKnot.scale.setScalar(scaleMod);
      wireKnot.scale.setScalar(scaleMod * 1.03);
      portalRings.forEach((ring, idx) => {
        ring.rotation.z = angle * (idx % 2 === 0 ? 0.55 : -0.65);
        ring.rotation.x += rm ? 0 : 0.004 * (idx + 1);
      });
      halo.rotation.y = -angle * 0.4;

      const { az, el, dist } = camRef.current;
      camera.position.set(
        dist * Math.cos(el) * Math.sin(az),
        dist * Math.sin(el),
        dist * Math.cos(el) * Math.cos(az)
      );
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      if (!rm) animId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      cleanupVis();
      disposables.forEach((d) => d.dispose());
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

        <div className="xl:col-span-7 bg-[#070312] border-3 border-black p-4 shadow-[5px_5px_0px_#000] space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs font-mono">
            <span className="font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <Orbit className="w-4 h-4" /> Calabi-Yau Compactification Manifold ({extraDims} Hidden Loops)
            </span>
            <span className="text-cern-cyan flex items-center gap-1">
              <Rotate3D className="w-3.5 h-3.5" /> Drag to Orbit · 160 KK Gravitons
            </span>
          </div>
          {webglFailed ? (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-zinc-400">
              WebGL context unavailable—parametric ADD metrics remain active on the left.
            </div>
          ) : (
            <div
              ref={containerRef}
              onPointerDown={(e) => {
                camRef.current.dragging = true;
                camRef.current.lastX = e.clientX;
                camRef.current.lastY = e.clientY;
              }}
              onPointerMove={(e) => {
                if (!camRef.current.dragging) return;
                const dx = e.clientX - camRef.current.lastX;
                const dy = e.clientY - camRef.current.lastY;
                camRef.current.az -= dx * 0.01;
                camRef.current.el = Math.max(-1.1, Math.min(1.1, camRef.current.el + dy * 0.01));
                camRef.current.lastX = e.clientX;
                camRef.current.lastY = e.clientY;
              }}
              onPointerUp={() => {
                camRef.current.dragging = false;
              }}
              onPointerLeave={() => {
                camRef.current.dragging = false;
              }}
              className="w-full h-64 border border-purple-900 bg-[#070312] cursor-grab active:cursor-grabbing"
            />
          )}
          <div className="text-[11px] font-mono text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Inner metallic core + golden mandala rings scale dynamically with compact radius R
          </div>
        </div>
      </div>
    </div>
  );
};
