'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGlobalStore } from '@/lib/store';
import { Rotate3D } from 'lucide-react';

interface Antimatter3DTrapCanvasProps {
  deltaB_uT: number;
  temperatureK: number;
  gravityRatio: number;
  rampProgress: number; // 0 to 100
  fBottomTheory: number;
}

export const Antimatter3DTrapCanvas: React.FC<Antimatter3DTrapCanvasProps> = ({
  deltaB_uT,
  temperatureK,
  gravityRatio,
  rampProgress,
  fBottomTheory,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [webglFailed, setWebglFailed] = useState(false);

  const stateRef = useRef({ deltaB_uT, temperatureK, gravityRatio, rampProgress, fBottomTheory, reduceMotion });
  useEffect(() => {
    stateRef.current = { deltaB_uT, temperatureK, gravityRatio, rampProgress, fBottomTheory, reduceMotion };
  }, [deltaB_uT, temperatureK, gravityRatio, rampProgress, fBottomTheory, reduceMotion]);

  const camRef = useRef({
    azimuth: 0.45,
    elevation: 0.22,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
      return;
    }

    const w = container.clientWidth || 520;
    const h = container.clientHeight || 300;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050811, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 80);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const keyLight = new THREE.DirectionalLight(0xff0055, 1.2);
    keyLight.position.set(6, 9, 8);
    scene.add(keyLight);

    const disposables: Array<{ dispose: () => void }> = [];

    // Vertical Penning-Malmberg Cryostat Cylinder Shell (transparent)
    const wallGeo = new THREE.CylinderGeometry(1.15, 1.15, 4.4, 24, 1, true);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    scene.add(new THREE.Mesh(wallGeo, wallMat));
    disposables.push(wallGeo, wallMat);

    // Upper & Lower Mirror Magnetic Pinch Coils (Y = +1.45 and -1.45)
    const coilGeo = new THREE.TorusGeometry(1.18, 0.08, 12, 36);
    coilGeo.rotateX(Math.PI / 2);
    const topCoilMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0369a1 });
    const botCoilMat = new THREE.MeshStandardMaterial({ color: 0xffe600, emissive: 0x854d0e });
    const topCoil = new THREE.Mesh(coilGeo, topCoilMat);
    const botCoil = new THREE.Mesh(coilGeo, botCoilMat);
    topCoil.position.y = 1.45;
    botCoil.position.y = -1.45;
    scene.add(topCoil, botCoil);

    // 8 Vertical Octupole Magnetic Bottle Bars
    const barGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.2, 8);
    const barMat = new THREE.MeshBasicMaterial({ color: 0x4c7dff, transparent: true, opacity: 0.65 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(Math.cos(a) * 1.0, 0, Math.sin(a) * 1.0);
      scene.add(bar);
    }
    disposables.push(coilGeo, topCoilMat, botCoilMat, barGeo, barMat);

    // 24 Cold Antihydrogen Atoms Inside Trap
    const atomGeo = new THREE.SphereGeometry(0.065, 10, 10);
    const atomMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const atoms: { mesh: THREE.Mesh; seed: number; dirSign: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(atomGeo, atomMat);
      scene.add(m);
      atoms.push({ mesh: m, seed: i * 1.73, dirSign: i / 24 });
    }
    disposables.push(atomGeo, atomMat);

    const domEl = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      camRef.current.isDragging = true;
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!camRef.current.isDragging) return;
      camRef.current.azimuth -= (e.clientX - camRef.current.lastX) * 0.008;
      camRef.current.elevation = Math.max(-0.7, Math.min(0.9, camRef.current.elevation + (e.clientY - camRef.current.lastY) * 0.008));
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
    };
    const onUp = () => {
      camRef.current.isDragging = false;
    };
    domEl.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const nw = container.clientWidth || 520;
      const nh = container.clientHeight || 300;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    let animId = 0;
    let t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const st = stateRef.current;
      if (!st.reduceMotion) {
        t += 0.045;
        if (!camRef.current.isDragging) {
          camRef.current.azimuth += 0.002;
        }
      }

      const dist = 6.6;
      camera.position.x = dist * Math.cos(camRef.current.elevation) * Math.sin(camRef.current.azimuth);
      camera.position.y = dist * Math.sin(camRef.current.elevation);
      camera.position.z = dist * Math.cos(camRef.current.elevation) * Math.cos(camRef.current.azimuth);
      camera.lookAt(0, 0, 0);

      // Coil glow dims as ramp releases magnetic confinement
      const trapStrength = Math.max(0.1, 1 - st.rampProgress / 100);
      topCoilMat.emissiveIntensity = trapStrength;
      botCoilMat.emissiveIntensity = trapStrength * (st.deltaB_uT >= 0 ? 1.2 : 0.7);
      barMat.opacity = 0.15 + trapStrength * 0.55;

      const jitterAmp = 0.08 + st.temperatureK * 0.12;
      const dropFrac = st.rampProgress / 100;

      atoms.forEach((a) => {
        const rx = Math.sin(t * 2.1 + a.seed) * 0.45 * (1 + dropFrac * 0.6);
        const rz = Math.cos(t * 1.9 + a.seed * 1.3) * 0.45 * (1 + dropFrac * 0.6);
        const fallsDown = a.dirSign < st.fBottomTheory;
        const driftY = dropFrac > 0.05 ? (fallsDown ? -dropFrac * 1.95 : dropFrac * 1.95) : 0;
        const thermalY = Math.sin(t * 3.1 + a.seed * 0.7) * jitterAmp;
        a.mesh.position.set(rx, Math.max(-2.0, Math.min(2.0, thermalY + driftY)), rz);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      domEl.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  if (webglFailed) return null;

  return (
    <div className="relative w-full h-[290px] bg-[#050811] border-2 border-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/85 border border-black text-[10px] font-mono text-cern-magenta font-bold pointer-events-none">
        3D ALPHA-g VERTICAL OCTUPOLE TRAP · P(DOWN) = {(fBottomTheory * 100).toFixed(1)}%
      </div>
      <div className="absolute bottom-2 left-2.5 px-2 py-0.5 bg-black/80 border border-black text-[10px] font-mono text-text-muted flex items-center gap-1 pointer-events-none">
        <Rotate3D className="w-3.5 h-3.5 text-cern-cyan" />
        <span>Drag 3D Antimatter Magnetic Bottle · Release trap to watch gravity drop</span>
      </div>
    </div>
  );
};
