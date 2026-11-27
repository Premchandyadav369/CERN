'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGlobalStore } from '@/lib/store';
import {
  createPlasmaWaveShaderMaterial,
  createThreeGlowTexture,
  observeOffscreenVisibility,
} from '@/lib/cernVisuals';
import { Pause, Play, Rotate3D } from 'lucide-react';

interface RfCavity3DCanvasProps {
  rfPhaseDeg: number;
}

export const RfCavity3DCanvas: React.FC<RfCavity3DCanvasProps> = ({ rfPhaseDeg }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [webglFailed, setWebglFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const isVisibleRef = useRef(true);

  const stateRef = useRef({ rfPhaseDeg, reduceMotion, isPlaying });
  useEffect(() => {
    stateRef.current = { rfPhaseDeg, reduceMotion, isPlaying };
  }, [rfPhaseDeg, reduceMotion, isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanupVis = observeOffscreenVisibility(container, (vis) => {
      isVisibleRef.current = vis;
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
    const h = container.clientHeight || 225;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x03060d, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 60);
    camera.position.set(2.3, 1.45, 5.4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xdbeafe, 0.7));
    const dl = new THREE.DirectionalLight(0xffe600, 1.5);
    dl.position.set(5, 8, 5);
    scene.add(dl);
    const rim = new THREE.PointLight(0x00e5ff, 1.6, 16);
    rim.position.set(-4, -3, 4);
    scene.add(rim);

    const disposables: Array<{ dispose: () => void }> = [];
    const glowTex = createThreeGlowTexture(64);
    if (glowTex) disposables.push(glowTex);

    // 1. Sculpted 4-Cell Elliptical Niobium Standing-Wave RF Cavity (LatheGeometry profile)
    const lathePts: THREE.Vector2[] = [];
    const totalSamples = 140;
    for (let i = 0; i <= totalSamples; i++) {
      const u = i / totalSamples; // 0..1 along length -2.35 .. +2.35
      const y = (u - 0.5) * 4.7;
      // 4 sinusoidal elliptical equator bulges + narrow beam iris necks
      const inCells = Math.abs(y) < 2.0;
      const cellWave = inCells ? Math.pow(Math.sin(((y + 2.0) / 4.0) * Math.PI * 4), 2) : 0;
      const radius = inCells ? 0.28 + 0.62 * cellWave : 0.24;
      lathePts.push(new THREE.Vector2(radius, y));
    }
    const cavityGeo = new THREE.LatheGeometry(lathePts, 36, 0, Math.PI * 1.45); // Cutaway shell
    cavityGeo.rotateZ(-Math.PI / 2);
    const cavityMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.88,
      roughness: 0.22,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
    });
    const cavityMesh = new THREE.Mesh(cavityGeo, cavityMat);
    scene.add(cavityMesh);
    disposables.push(cavityGeo, cavityMat);

    // Metallic iris structural ribs
    const ribGeo = new THREE.TorusGeometry(0.9, 0.022, 10, 40);
    ribGeo.rotateY(Math.PI / 2);
    const ribMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.25 });
    [-1.5, -0.5, 0.5, 1.5].forEach((xPos) => {
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.x = xPos;
      scene.add(rib);
    });
    disposables.push(ribGeo, ribMat);

    // 2. Custom GLSL TM_010 pi-Mode Standing Electromagnetic Field Cores
    const eFieldMats: THREE.ShaderMaterial[] = [];
    const eFieldMeshes: THREE.Mesh[] = [];
    const fieldGeo = new THREE.SphereGeometry(0.55, 24, 16);
    fieldGeo.scale(0.68, 0.85, 0.85);
    disposables.push(fieldGeo);

    [-1.5, -0.5, 0.5, 1.5].forEach((xPos, idx) => {
      const fMat = createPlasmaWaveShaderMaterial(idx % 2 === 0 ? 0xffe600 : 0xff0055, 0x00e5ff);
      const fMesh = new THREE.Mesh(fieldGeo, fMat);
      fMesh.position.x = xPos;
      scene.add(fMesh);
      eFieldMats.push(fMat);
      eFieldMeshes.push(fMesh);
      disposables.push(fMat);
    });

    // 3. Relativistic Surfing Proton Bunch Train with Glowing Trail
    const trainCount = 8;
    const trainPos = new Float32Array(trainCount * 3);
    const trainGeo = new THREE.BufferGeometry();
    trainGeo.setAttribute('position', new THREE.BufferAttribute(trainPos, 3));
    const trainMat = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.36,
      map: glowTex ?? undefined,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(trainGeo, trainMat));
    disposables.push(trainGeo, trainMat);

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const nw = container.clientWidth || 540;
      const nh = container.clientHeight || 225;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    });
    ro.observe(container);

    let animId = 0;
    let t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisibleRef.current) return;

      const st = stateRef.current;
      if (!st.reduceMotion && st.isPlaying) {
        t += 0.048;
      }

      const phaseRad = (st.rfPhaseDeg * Math.PI) / 180;
      eFieldMats.forEach((fMat, idx) => {
        const osc = Math.sin(t * 2.2 + phaseRad + idx * Math.PI);
        fMat.uniforms.uTime.value = t + idx * 1.4;
        fMat.uniforms.uIntensity.value = 0.25 + Math.abs(osc) * 0.9;
        eFieldMeshes[idx].scale.setScalar(0.62 + Math.abs(osc) * 0.42);
      });

      const arr = trainGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < trainCount; i++) {
        const bx = ((t * 1.15 - i * 0.14) % 5.0) - 2.5;
        arr[i * 3] = bx;
        arr[i * 3 + 1] = Math.sin(t * 6 + i) * 0.02;
        arr[i * 3 + 2] = 0;
      }
      trainGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      cleanupVis();
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  if (webglFailed) return null;

  return (
    <div className="relative w-full h-[225px] bg-[#03060D] border-2 border-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-2 left-2.5 px-2 py-0.5 bg-black/85 border border-black text-[10px] font-mono text-[#FFE600] font-bold pointer-events-none">
        3D NIOBIUM 400 MHz TM₀₁₀ π-MODE CAVITY · φ_s = {rfPhaseDeg.toFixed(1)}°
      </div>
      <div className="absolute bottom-2 left-2.5 px-2 py-0.5 bg-black/80 border border-black text-[10px] font-mono text-text-muted flex items-center gap-1 pointer-events-none">
        <Rotate3D className="w-3.5 h-3.5 text-cern-cyan" />
        <span>Cutaway lathe shell + GLSL standing plasma cells</span>
      </div>
      <button
        type="button"
        onClick={() => setIsPlaying((p) => !p)}
        aria-label={isPlaying ? 'Pause 3D RF cavity animation' : 'Play 3D RF cavity animation'}
        className="absolute bottom-2 right-2.5 px-2 py-0.5 bg-black/85 hover:bg-slate-800 text-[#FFE600] border border-[#FFE600]/60 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </button>
    </div>
  );
};
