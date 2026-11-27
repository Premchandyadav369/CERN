'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGlobalStore } from '@/lib/store';
import { Rotate3D } from 'lucide-react';

interface RfCavity3DCanvasProps {
  rfPhaseDeg: number;
}

export const RfCavity3DCanvas: React.FC<RfCavity3DCanvasProps> = ({ rfPhaseDeg }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [webglFailed, setWebglFailed] = useState(false);

  const stateRef = useRef({ rfPhaseDeg, reduceMotion });
  useEffect(() => {
    stateRef.current = { rfPhaseDeg, reduceMotion };
  }, [rfPhaseDeg, reduceMotion]);

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
    const h = container.clientHeight || 220;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050811, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 60);
    camera.position.set(2.4, 1.5, 5.2);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dl = new THREE.DirectionalLight(0xffe600, 1.2);
    dl.position.set(5, 8, 5);
    scene.add(dl);

    const disposables: Array<{ dispose: () => void }> = [];

    // 4-Cell Niobium Elliptical Standing-Wave RF Cavity along X axis
    const cellGeo = new THREE.SphereGeometry(0.85, 20, 14);
    cellGeo.scale(0.58, 1.0, 1.0);
    const cellMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const cells: THREE.Mesh[] = [];
    const eFields: THREE.Mesh[] = [];
    const eGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.72, 8);
    eGeo.rotateZ(Math.PI / 2);

    [-1.5, -0.5, 0.5, 1.5].forEach((xPos, idx) => {
      const c = new THREE.Mesh(cellGeo, cellMat);
      c.position.x = xPos;
      scene.add(c);
      cells.push(c);

      const eMat = new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0xffe600 : 0xff0055, transparent: true, opacity: 0.85 });
      const eBar = new THREE.Mesh(eGeo, eMat);
      eBar.position.x = xPos;
      scene.add(eBar);
      eFields.push(eBar);
      disposables.push(eMat);
    });
    disposables.push(cellGeo, cellMat, eGeo);

    // Proton Bunch surfing through cavity along X
    const bunchGeo = new THREE.SphereGeometry(0.14, 14, 14);
    const bunchMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
    const bunch = new THREE.Mesh(bunchGeo, bunchMat);
    scene.add(bunch);
    disposables.push(bunchGeo, bunchMat);

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const nw = container.clientWidth || 520;
      const nh = container.clientHeight || 220;
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
        t += 0.055;
      }

      const phaseRad = (st.rfPhaseDeg * Math.PI) / 180;
      eFields.forEach((bar, idx) => {
        // pi-mode: adjacent cavities flip electric field direction!
        const osc = Math.sin(t * 2.2 + phaseRad + idx * Math.PI);
        bar.scale.set(Math.max(0.15, Math.abs(osc) * 1.25), 1, 1);
        (bar.material as THREE.MeshBasicMaterial).color.setHex(osc >= 0 ? 0xffe600 : 0xff0055);
      });

      const bx = ((t * 0.9) % 4.6) - 2.3;
      bunch.position.x = bx;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  if (webglFailed) return null;

  return (
    <div className="relative w-full h-[210px] bg-[#050811] border-2 border-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-2 left-2.5 px-2 py-0.5 bg-black/85 border border-black text-[10px] font-mono text-[#FFE600] font-bold pointer-events-none">
        3D 400 MHz TM₀₁₀ π-MODE CAVITY · φ_s = {rfPhaseDeg.toFixed(1)}°
      </div>
      <div className="absolute bottom-2 left-2.5 px-2 py-0.5 bg-black/80 border border-black text-[10px] font-mono text-text-muted flex items-center gap-1 pointer-events-none">
        <Rotate3D className="w-3.5 h-3.5 text-cern-cyan" />
        <span>Gold/Pink axial E-field flips polarity every half-cycle as bunches pass</span>
      </div>
    </div>
  );
};
