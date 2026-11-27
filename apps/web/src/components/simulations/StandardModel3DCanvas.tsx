'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGlobalStore } from '@/lib/store';
import { Rotate3D } from 'lucide-react';

interface StandardModel3DCanvasProps {
  particleId: string;
  family: string;
  massGev: number;
  charge: number;
  interactions: string[];
}

export const StandardModel3DCanvas: React.FC<StandardModel3DCanvasProps> = ({
  particleId,
  family,
  massGev,
  charge,
  interactions,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [webglFailed, setWebglFailed] = useState(false);

  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;

  const camRef = useRef({
    azimuth: 0.4,
    elevation: 0.35,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    } catch {
      setWebglFailed(true);
      return;
    }

    const w = container.clientWidth || 440;
    const h = container.clientHeight || 300;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050811, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 80);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.3);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xff0055, 1.5, 18);
    pointLight.position.set(-4, -3, 4);
    scene.add(pointLight);

    const disposables: Array<{ dispose: () => void }> = [];

    // Higgs Vacuum Field Coupling Grid (intensity scales with log-mass)
    const hasHiggs = interactions.includes('Higgs');
    const logMassNorm = massGev > 0.0001 ? Math.min(1.0, Math.max(0.15, (Math.log10(massGev) + 4) / 6.3)) : 0.0;

    const ringCount = hasHiggs ? 5 : 2;
    const higgsRings: THREE.Mesh[] = [];
    for (let i = 0; i < ringCount; i++) {
      const rGeo = new THREE.TorusGeometry(1.1 + i * 0.45, 0.015, 8, 48);
      const rMat = new THREE.MeshBasicMaterial({
        color: hasHiggs ? 0xffe600 : 0x334155,
        transparent: true,
        opacity: hasHiggs ? 0.18 + logMassNorm * 0.45 : 0.15,
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      higgsRings.push(ring);
      disposables.push(rGeo, rMat);
    }

    // Core Particle Quantum Geometry by Family
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    if (family === 'QUARK' || family === 'HADRON') {
      // Three SU(3) RGB color-charged sub-nodes orbiting inside strong gluon flux knot
      const rgbColors = [0xff0055, 0x00ff66, 0x00e5ff];
      const knotGeo = new THREE.TorusKnotGeometry(0.62, 0.12, 72, 12, 2, 3);
      const knotMat = new THREE.MeshStandardMaterial({
        color: family === 'HADRON' ? 0x38bdf8 : 0x4c7dff,
        wireframe: family === 'QUARK',
        roughness: 0.25,
        metalness: 0.7,
        emissive: 0x003b80,
      });
      coreGroup.add(new THREE.Mesh(knotGeo, knotMat));
      disposables.push(knotGeo, knotMat);

      const qGeo = new THREE.SphereGeometry(0.22, 16, 16);
      disposables.push(qGeo);
      rgbColors.forEach((col, idx) => {
        const qMat = new THREE.MeshStandardMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.55,
        });
        const orb = new THREE.Mesh(qGeo, qMat);
        const ang = (idx / 3) * Math.PI * 2;
        orb.position.set(Math.cos(ang) * 0.65, Math.sin(ang) * 0.45, Math.sin(ang * 2) * 0.35);
        coreGroup.add(orb);
        disposables.push(qMat);
      });
    } else if (family === 'LEPTON') {
      const isNeutrino = particleId.includes('neutrino');
      const lepGeo = new THREE.IcosahedronGeometry(isNeutrino ? 0.52 : 0.78, 1);
      const lepMat = new THREE.MeshStandardMaterial({
        color: isNeutrino ? 0x94a3b8 : charge < 0 ? 0x00e5ff : 0xff0055,
        wireframe: isNeutrino,
        transparent: true,
        opacity: isNeutrino ? 0.45 : 0.9,
        emissive: isNeutrino ? 0x1e293b : 0x005588,
        roughness: 0.2,
        metalness: 0.8,
      });
      coreGroup.add(new THREE.Mesh(lepGeo, lepMat));
      disposables.push(lepGeo, lepMat);

      // Spin 1/2 chiral precession ring
      const spinGeo = new THREE.TorusGeometry(1.05, 0.035, 10, 40);
      const spinMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
      const spinRing = new THREE.Mesh(spinGeo, spinMat);
      spinRing.rotation.y = Math.PI / 4;
      coreGroup.add(spinRing);
      disposables.push(spinGeo, spinMat);
    } else if (family === 'GAUGE_BOSON') {
      const bColor =
        particleId === 'photon'
          ? 0xffe600
          : particleId === 'gluon'
          ? 0x00ff66
          : 0xff0055;
      const bGeo = new THREE.OctahedronGeometry(0.85, 1);
      const bMat = new THREE.MeshStandardMaterial({
        color: bColor,
        emissive: bColor,
        emissiveIntensity: 0.4,
        wireframe: particleId === 'photon',
        roughness: 0.2,
        metalness: 0.65,
      });
      coreGroup.add(new THREE.Mesh(bGeo, bMat));
      disposables.push(bGeo, bMat);

      const waveGeo = new THREE.TorusGeometry(1.15, 0.04, 12, 48);
      const waveMat = new THREE.MeshBasicMaterial({ color: bColor, transparent: true, opacity: 0.7 });
      coreGroup.add(new THREE.Mesh(waveGeo, waveMat));
      disposables.push(waveGeo, waveMat);
    } else {
      // Higgs Scalar Spin-0 Gold Resonant Halo
      const hGeo = new THREE.SphereGeometry(0.95, 28, 28);
      const hMat = new THREE.MeshStandardMaterial({
        color: 0xffe600,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        roughness: 0.15,
        metalness: 0.85,
      });
      coreGroup.add(new THREE.Mesh(hGeo, hMat));
      const shellGeo = new THREE.IcosahedronGeometry(1.35, 1);
      const shellMat = new THREE.MeshBasicMaterial({ color: 0xffe600, wireframe: true, transparent: true, opacity: 0.35 });
      coreGroup.add(new THREE.Mesh(shellGeo, shellMat));
      disposables.push(hGeo, hMat, shellGeo, shellMat);
    }

    const domEl = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      camRef.current.isDragging = true;
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!camRef.current.isDragging) return;
      camRef.current.azimuth -= (e.clientX - camRef.current.lastX) * 0.01;
      camRef.current.elevation = Math.max(-1.1, Math.min(1.1, camRef.current.elevation + (e.clientY - camRef.current.lastY) * 0.01));
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
      const nw = container.clientWidth || 440;
      const nh = container.clientHeight || 300;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    let animId = 0;
    let phase = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!reduceRef.current) {
        // Heavier particles oscillate faster in Compton/Yukawa quantum phase
        const omega = 0.018 + logMassNorm * 0.04;
        phase += omega;
        coreGroup.rotation.y += 0.012 + logMassNorm * 0.025;
        coreGroup.rotation.x = Math.sin(phase * 0.6) * 0.3;

        higgsRings.forEach((ring, i) => {
          ring.rotation.z = phase * (i % 2 === 0 ? 0.5 : -0.4);
          const s = 1 + Math.sin(phase * 1.8 - i * 0.5) * (0.04 + logMassNorm * 0.08);
          ring.scale.set(s, s, 1);
        });
      }

      const dist = 5.4;
      camera.position.x = dist * Math.cos(camRef.current.elevation) * Math.sin(camRef.current.azimuth);
      camera.position.y = dist * Math.sin(camRef.current.elevation);
      camera.position.z = dist * Math.cos(camRef.current.elevation) * Math.cos(camRef.current.azimuth);
      camera.lookAt(0, 0, 0);

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
  }, [particleId, family, massGev, charge, interactions]);

  if (webglFailed) return null;

  return (
    <div className="relative w-full h-[290px] bg-[#050811] border-2 border-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/85 border border-black text-[10px] font-mono text-[#FFE600] font-bold pointer-events-none">
        {interactions.includes('Higgs')
          ? `HIGGS YUKAWA DRAG: ${massGev >= 1 ? `${massGev} GeV` : `${(massGev * 1000).toFixed(2)} MeV`}`
          : 'MASSLESS GAUGE FIELD (ZERO HIGGS DRAG)'}
      </div>
      <div className="absolute bottom-2 left-2.5 px-2 py-0.5 bg-black/80 border border-black text-[10px] font-mono text-text-muted flex items-center gap-1 pointer-events-none">
        <Rotate3D className="w-3.5 h-3.5 text-cern-cyan" />
        <span>Drag 3D quantum state · Yellow rings illustrate Higgs vacuum coupling strength</span>
      </div>
    </div>
  );
};
