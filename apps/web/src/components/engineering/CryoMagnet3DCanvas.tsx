'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGlobalStore } from '@/lib/store';
import { Rotate3D } from 'lucide-react';

interface CryoMagnet3DCanvasProps {
  magnetCurrentKa: number;
  temperatureK: number;
  isQuenched: boolean;
  isSuperfluidHeII: boolean;
}

export const CryoMagnet3DCanvas: React.FC<CryoMagnet3DCanvasProps> = ({
  magnetCurrentKa,
  temperatureK,
  isQuenched,
  isSuperfluidHeII,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [webglFailed, setWebglFailed] = useState(false);

  const stateRef = useRef({
    magnetCurrentKa,
    temperatureK,
    isQuenched,
    isSuperfluidHeII,
    reduceMotion,
  });

  useEffect(() => {
    stateRef.current = {
      magnetCurrentKa,
      temperatureK,
      isQuenched,
      isSuperfluidHeII,
      reduceMotion,
    };
  }, [magnetCurrentKa, temperatureK, isQuenched, isSuperfluidHeII, reduceMotion]);

  const camRef = useRef({
    azimuth: 0.42,
    elevation: 0.25,
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

    const w = container.clientWidth || 560;
    const h = container.clientHeight || 260;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050811, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 80);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const keyLight = new THREE.DirectionalLight(0x00e5ff, 1.4);
    keyLight.position.set(6, 9, 8);
    scene.add(keyLight);

    // Outer Cryostat Vessel (cutaway blue shell)
    const cryostatGeo = new THREE.CylinderGeometry(1.9, 1.9, 5.4, 32, 1, true);
    cryostatGeo.rotateX(Math.PI / 2);
    const cryostatMat = new THREE.MeshStandardMaterial({
      color: 0x0f3b7a,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    scene.add(new THREE.Mesh(cryostatGeo, cryostatMat));

    // Iron Yoke + Cold Mass Cylinder (changes tint on Quench)
    const yokeGeo = new THREE.CylinderGeometry(1.42, 1.42, 4.8, 28, 1, false);
    yokeGeo.rotateX(Math.PI / 2);
    const yokeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.65,
      transparent: true,
      opacity: 0.72,
    });
    const yokeMesh = new THREE.Mesh(yokeGeo, yokeMat);
    scene.add(yokeMesh);

    // Superfluid Liquid Helium Inner Jacket Glow
    const heGeo = new THREE.CylinderGeometry(1.5, 1.5, 4.6, 24, 1, true);
    heGeo.rotateX(Math.PI / 2);
    const heMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const heMesh = new THREE.Mesh(heGeo, heMat);
    scene.add(heMesh);

    // Twin Beam Apertures (Beam 1 & Beam 2 Vacuum Pipes)
    const pipeGeo = new THREE.CylinderGeometry(0.18, 0.18, 6.2, 18);
    pipeGeo.rotateX(Math.PI / 2);
    const pipeMat1 = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.35 });
    const pipeMat2 = new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 0.35 });
    const pipe1 = new THREE.Mesh(pipeGeo, pipeMat1);
    const pipe2 = new THREE.Mesh(pipeGeo, pipeMat2);
    pipe1.position.x = -0.58;
    pipe2.position.x = 0.58;
    scene.add(pipe1, pipe2);

    // Moving Counter-Rotating Proton Bunches
    const bunchGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const b1Mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const b2Mat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
    const b1 = new THREE.Mesh(bunchGeo, b1Mat);
    const b2 = new THREE.Mesh(bunchGeo, b2Mat);
    b1.position.x = -0.58;
    b2.position.x = 0.58;
    scene.add(b1, b2);

    // Magnetic Dipole Flux Loops around twin apertures
    const fluxRings: THREE.Mesh[] = [];
    const fluxGeo = new THREE.TorusGeometry(0.36, 0.025, 8, 24);
    const fluxMat = new THREE.MeshBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.75 });
    [-1.6, 0, 1.6].forEach((zOff) => {
      [-0.58, 0.58].forEach((xOff) => {
        const ring = new THREE.Mesh(fluxGeo, fluxMat);
        ring.position.set(xOff, 0, zOff);
        scene.add(ring);
        fluxRings.push(ring);
      });
    });

    // Helium Boil Bubbles (shown when > 2.17 K or quenched)
    const bubbleCount = 36;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePos = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount; i++) {
      bubblePos[i * 3] = (Math.random() - 0.5) * 2.4;
      bubblePos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
      bubblePos[i * 3 + 2] = (Math.random() - 0.5) * 4.4;
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
    const bubbleMat = new THREE.PointsMaterial({ color: 0xffb020, size: 0.14, transparent: true, opacity: 0.0 });
    const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubbles);

    const domEl = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      camRef.current.isDragging = true;
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!camRef.current.isDragging) return;
      camRef.current.azimuth -= (e.clientX - camRef.current.lastX) * 0.008;
      camRef.current.elevation = Math.max(-0.8, Math.min(1.1, camRef.current.elevation + (e.clientY - camRef.current.lastY) * 0.008));
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
      const nw = container.clientWidth || 560;
      const nh = container.clientHeight || 260;
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
        t += 0.04;
        if (!camRef.current.isDragging) {
          camRef.current.azimuth += 0.0025;
        }
      }

      const dist = 7.2;
      camera.position.x = dist * Math.cos(camRef.current.elevation) * Math.sin(camRef.current.azimuth);
      camera.position.y = dist * Math.sin(camRef.current.elevation);
      camera.position.z = dist * Math.cos(camRef.current.elevation) * Math.cos(camRef.current.azimuth);
      camera.lookAt(0, 0, 0);

      // Update thermal/quench visuals dynamically
      if (st.isQuenched) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 6);
        yokeMat.color.setHex(0x7f1d1d);
        heMat.color.setHex(0xff3333);
        heMat.opacity = 0.25 + pulse * 0.2;
        fluxMat.opacity = 0.08;
      } else if (st.isSuperfluidHeII) {
        yokeMat.color.setHex(0x1e293b);
        heMat.color.setHex(0x00e5ff);
        heMat.opacity = 0.2;
        fluxMat.opacity = Math.min(0.95, 0.2 + (st.magnetCurrentKa / 12) * 0.75);
      } else {
        yokeMat.color.setHex(0x451a03);
        heMat.color.setHex(0xffb020);
        heMat.opacity = 0.25;
        fluxMat.opacity = Math.min(0.85, (st.magnetCurrentKa / 12) * 0.7);
      }

      // Helium boil bubbles when above 2.17 K
      bubbleMat.opacity = st.isSuperfluidHeII ? 0.0 : 0.85;
      if (!st.isSuperfluidHeII && !st.reduceMotion) {
        const posArr = bubbleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < bubbleCount; i++) {
          posArr[i * 3 + 1] += 0.03;
          if (posArr[i * 3 + 1] > 1.2) posArr[i * 3 + 1] = -1.2;
        }
        bubbleGeo.attributes.position.needsUpdate = true;
      }

      // Counter-rotating protons inside pipes (stop on quench!)
      if (!st.isQuenched && !st.reduceMotion) {
        b1.position.z = ((t * 1.4) % 6) - 3;
        b2.position.z = 3 - ((t * 1.4) % 6);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      domEl.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      cryostatGeo.dispose();
      cryostatMat.dispose();
      yokeGeo.dispose();
      yokeMat.dispose();
      heGeo.dispose();
      heMat.dispose();
      pipeGeo.dispose();
      pipeMat1.dispose();
      pipeMat2.dispose();
      bunchGeo.dispose();
      b1Mat.dispose();
      b2Mat.dispose();
      fluxGeo.dispose();
      fluxMat.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (webglFailed) return null;

  return (
    <div className="relative w-full h-[260px] bg-[#050811] border-2 border-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
      <div className="absolute top-2.5 left-2.5 flex items-center gap-2 pointer-events-none">
        <span
          className={`px-2 py-0.5 text-[10px] font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] uppercase ${
            isQuenched
              ? 'bg-red-500 text-white animate-pulse'
              : isSuperfluidHeII
              ? 'bg-cern-cyan text-black'
              : 'bg-amber-400 text-black'
          }`}
        >
          {isQuenched ? 'THERMAL QUENCH — MAGNET TRIP' : isSuperfluidHeII ? '1.9 K SUPERFLUID HE-II ACTIVE' : 'HE-I BOILING REGIME (>2.17 K)'}
        </span>
      </div>
      <div className="absolute bottom-2 left-2.5 px-2 py-0.5 bg-black/80 border border-black text-[10px] font-mono text-text-muted flex items-center gap-1 pointer-events-none">
        <Rotate3D className="w-3.5 h-3.5 text-cern-cyan" />
        <span>Interactive 3D Twin-Aperture Nb-Ti Dipole Cryostat Cross-Section</span>
      </div>
    </div>
  );
};
