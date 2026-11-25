'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { evaluateHiggsPotential } from '@cern-x/sim-core';
import { useGlobalStore } from '@/lib/store';
import { Rotate3D } from 'lucide-react';

interface Higgs3DPotentialCanvasProps {
  muSqGev2: number;
  lambdaQuartic: number;
  vevGev: number;
  brokenSymmetry: boolean;
}

export const Higgs3DPotentialCanvas: React.FC<Higgs3DPotentialCanvasProps> = ({
  muSqGev2,
  lambdaQuartic,
  vevGev,
  brokenSymmetry,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [webglFailed, setWebglFailed] = useState<boolean>(false);

  const propsRef = useRef({ muSqGev2, lambdaQuartic, vevGev, brokenSymmetry, reduceMotion });
  useEffect(() => {
    propsRef.current = { muSqGev2, lambdaQuartic, vevGev, brokenSymmetry, reduceMotion };
  }, [muSqGev2, lambdaQuartic, vevGev, brokenSymmetry, reduceMotion]);

  const camRef = useRef({
    azimuth: 0.65,
    elevation: 0.45,
    distance: 9.2,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebglFailed(true);
      return;
    }

    const w = container.clientWidth || 520;
    const h = container.clientHeight || 280;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050811, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.3);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xffe600, 1.5, 20);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);

    // Polar Mesh Grid for V(phi_1, phi_2) Mexican Hat surface
    const RADIAL_SEGS = 28;
    const ANGULAR_SEGS = 48;
    const MAX_PHI = 310;
    const SCALE_XZ = 3.2 / MAX_PHI;
    const SCALE_Y = 1.1e-8;

    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    for (let rIdx = 0; rIdx <= RADIAL_SEGS; rIdx++) {
      const rNorm = rIdx / RADIAL_SEGS;
      const phi = rNorm * MAX_PHI;
      for (let tIdx = 0; tIdx <= ANGULAR_SEGS; tIdx++) {
        const theta = (tIdx / ANGULAR_SEGS) * Math.PI * 2;
        const x = phi * Math.cos(theta) * SCALE_XZ;
        const z = phi * Math.sin(theta) * SCALE_XZ;
        vertices.push(x, 0, z);
        colors.push(0, 0.9, 1);
      }
    }

    const rowStride = ANGULAR_SEGS + 1;
    for (let rIdx = 0; rIdx < RADIAL_SEGS; rIdx++) {
      for (let tIdx = 0; tIdx < ANGULAR_SEGS; tIdx++) {
        const a = rIdx * rowStride + tIdx;
        const b = (rIdx + 1) * rowStride + tIdx;
        const c = (rIdx + 1) * rowStride + (tIdx + 1);
        const d = rIdx * rowStride + (tIdx + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const hatGeo = new THREE.BufferGeometry();
    hatGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    hatGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    hatGeo.setIndex(indices);
    hatGeo.computeVertexNormals();

    const hatMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const hatMesh = new THREE.Mesh(hatGeo, hatMat);
    scene.add(hatMesh);

    const hatWireMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const hatWireMesh = new THREE.Mesh(hatGeo, hatWireMat);
    scene.add(hatWireMesh);

    // Golden Higgs Vacuum Sphere rolling into the valley
    const ballGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xffe600,
      emissive: 0x996600,
      roughness: 0.2,
      metalness: 0.7,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    scene.add(ballMesh);

    // Subtle circular floor reference ring
    const floorGrid = new THREE.GridHelper(9, 12, 0x1e293b, 0x0f172a);
    floorGrid.position.y = -1.1;
    scene.add(floorGrid);

    const resizeObs = new ResizeObserver(() => {
      if (!container) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw > 0 && ch > 0) {
        camera.aspect = cw / ch;
        camera.updateProjectionMatrix();
        renderer.setSize(cw, ch);
      }
    });
    resizeObs.observe(container);

    let raf = 0;
    let ballAngle = 0;
    let currentBallR = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const { muSqGev2: mu2, lambdaQuartic: lam, vevGev: vev, brokenSymmetry: broken, reduceMotion: red } =
        propsRef.current;

      // Update Mexican Hat 3D vertices smoothly
      const posAttr = hatGeo.attributes.position as THREE.BufferAttribute;
      const colAttr = hatGeo.attributes.color as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;

      let vIdx = 0;
      for (let rIdx = 0; rIdx <= RADIAL_SEGS; rIdx++) {
        const phi = (rIdx / RADIAL_SEGS) * MAX_PHI;
        const vRaw = evaluateHiggsPotential(phi, mu2, lam);
        // Clamp visual height nicely into [-0.95, +2.0]
        const y = Math.max(-0.95, Math.min(2.1, vRaw * SCALE_Y));
        for (let tIdx = 0; tIdx <= ANGULAR_SEGS; tIdx++) {
          posArr[vIdx * 3 + 1] = y;
          // Color ramp: deep cyan/emerald in valley (<0), bright cyan near zero, orange-red high rim
          if (y < -0.05) {
            colArr[vIdx * 3] = 0.0;
            colArr[vIdx * 3 + 1] = 0.95;
            colArr[vIdx * 3 + 2] = 0.65;
          } else if (y < 0.45) {
            colArr[vIdx * 3] = 0.05;
            colArr[vIdx * 3 + 1] = 0.7;
            colArr[vIdx * 3 + 2] = 1.0;
          } else {
            colArr[vIdx * 3] = 1.0;
            colArr[vIdx * 3 + 1] = 0.35;
            colArr[vIdx * 3 + 2] = 0.2;
          }
          vIdx++;
        }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      hatGeo.computeVertexNormals();

      // Animate gold Higgs vacuum ball rolling into minimum & circling Goldstone brim
      currentBallR += (vev - currentBallR) * 0.14;
      if (!red) {
        ballAngle += broken ? 0.025 : 0.01;
        if (!camRef.current.isDragging) {
          camRef.current.azimuth += 0.0022;
        }
      }
      const bX = currentBallR * Math.cos(ballAngle) * SCALE_XZ;
      const bZ = currentBallR * Math.sin(ballAngle) * SCALE_XZ;
      const bY = Math.max(-0.95, Math.min(2.1, evaluateHiggsPotential(currentBallR, mu2, lam) * SCALE_Y)) + 0.22;
      ballMesh.position.set(bX, bY, bZ);

      // Update camera
      const cs = camRef.current;
      camera.position.set(
        cs.distance * Math.sin(cs.azimuth) * Math.cos(cs.elevation),
        cs.distance * Math.sin(cs.elevation),
        cs.distance * Math.cos(cs.azimuth) * Math.cos(cs.elevation)
      );
      camera.lookAt(0, 0.25, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObs.disconnect();
      hatGeo.dispose();
      hatMat.dispose();
      hatWireMat.dispose();
      ballGeo.dispose();
      ballMat.dispose();
      renderer.dispose();
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    camRef.current.isDragging = true;
    camRef.current.lastX = e.clientX;
    camRef.current.lastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!camRef.current.isDragging) return;
    const dx = e.clientX - camRef.current.lastX;
    const dy = e.clientY - camRef.current.lastY;
    camRef.current.lastX = e.clientX;
    camRef.current.lastY = e.clientY;
    camRef.current.azimuth -= dx * 0.009;
    camRef.current.elevation = Math.max(0.1, Math.min(1.45, camRef.current.elevation + dy * 0.007));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    camRef.current.isDragging = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  if (webglFailed) {
    return (
      <div className="h-64 w-full bg-[#050811] border-2 border-zinc-800 flex items-center justify-center font-mono text-xs text-cern-cyan">
        3D WebGL unavailable — See 2D V(φ) Slice Profile
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 sm:h-72 border-2 border-zinc-800 bg-[#050811] overflow-hidden select-none">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        title="Drag to tilt & inspect the 3D Mexican Hat scalar potential"
      />
      <div className="absolute top-2.5 left-2.5 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 bg-black/85 border border-black text-[10px] font-mono font-bold text-[#FFE600]">
        <Rotate3D className="w-3.5 h-3.5 text-cern-cyan" />
        <span>3D HIGGS POTENTIAL · DRAG TO TILT</span>
      </div>
      <div className="absolute bottom-2 right-2.5 pointer-events-none px-2 py-0.5 bg-black/85 border border-zinc-800 text-[10px] font-mono font-bold text-emerald-400">
        {brokenSymmetry ? `Goldstone Valley: v = ${vevGev.toFixed(1)} GeV` : 'Unbroken Bowl Center: φ = 0'}
      </div>
    </div>
  );
};
