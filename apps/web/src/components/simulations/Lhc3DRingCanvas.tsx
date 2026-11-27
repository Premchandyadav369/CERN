'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGlobalStore } from '@/lib/store';
import { createThreeGlowTexture, observeOffscreenVisibility } from '@/lib/cernVisuals';
import { Rotate3D, Eye } from 'lucide-react';

interface Lhc3DRingCanvasProps {
  beamEnergyGev: number;
  bunches: number;
  betaStarM: number;
  particleType: 'proton' | 'lead';
  isRunning: boolean;
  betaVelocity: number;
  pileup: number;
  dipoleFieldTesla: number;
}

export const Lhc3DRingCanvas: React.FC<Lhc3DRingCanvasProps> = ({
  beamEnergyGev,
  bunches,
  betaStarM,
  particleType,
  isRunning,
  betaVelocity,
  pileup,
  dipoleFieldTesla,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const [cameraPreset, setCameraPreset] = useState<'overview' | 'ip' | 'top'>('overview');
  const [webglFailed, setWebglFailed] = useState<boolean>(false);

  // Camera spherical coords ref so drag & presets update seamlessly inside RAF
  const camStateRef = useRef({
    azimuth: 0.45,
    elevation: 0.52,
    distance: 14.5,
    targetAzimuth: 0.45,
    targetElevation: 0.52,
    targetDistance: 14.5,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  // Live simulation props ref inside RAF without reconstructing WebGL scene
  const simRef = useRef({
    beamEnergyGev,
    bunches,
    betaStarM,
    particleType,
    isRunning,
    pileup,
    reduceMotion,
  });

  useEffect(() => {
    simRef.current = {
      beamEnergyGev,
      bunches,
      betaStarM,
      particleType,
      isRunning,
      pileup,
      reduceMotion,
    };
  }, [beamEnergyGev, bunches, betaStarM, particleType, isRunning, pileup, reduceMotion]);

  useEffect(() => {
    if (cameraPreset === 'overview') {
      camStateRef.current.targetAzimuth = 0.45;
      camStateRef.current.targetElevation = 0.52;
      camStateRef.current.targetDistance = 14.5;
    } else if (cameraPreset === 'ip') {
      camStateRef.current.targetAzimuth = 0.05;
      camStateRef.current.targetElevation = 0.22;
      camStateRef.current.targetDistance = 7.8;
    } else if (cameraPreset === 'top') {
      camStateRef.current.targetAzimuth = 0.0;
      camStateRef.current.targetElevation = 1.48;
      camStateRef.current.targetDistance = 14.0;
    }
  }, [cameraPreset]);

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

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 380;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050811, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050811, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0x00e5ff, 1.4);
    keyLight.position.set(10, 15, 10);
    scene.add(keyLight);
    const accentLight = new THREE.PointLight(0xff0055, 2.0, 25);
    accentLight.position.set(0, 3, 0);
    scene.add(accentLight);

    // Subtle Neobrutalist Dark Blueprint Grid Floor
    const gridHelper = new THREE.GridHelper(24, 24, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -1.3;
    scene.add(gridHelper);

    const RING_RADIUS = 5.2;

    // 1. LHC Cryostat Vacuum Torus Tunnel Shell
    const cryostatGeo = new THREE.TorusGeometry(RING_RADIUS, 0.28, 16, 96);
    const cryostatMat = new THREE.MeshStandardMaterial({
      color: 0x003b80,
      roughness: 0.35,
      metalness: 0.7,
      transparent: true,
      opacity: 0.55,
    });
    const cryostatMesh = new THREE.Mesh(cryostatGeo, cryostatMat);
    cryostatMesh.rotation.x = Math.PI / 2;
    scene.add(cryostatMesh);

    // Wireframe outer cryostat structural lattice
    const wireGeo = new THREE.TorusGeometry(RING_RADIUS, 0.31, 8, 48);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    wireMesh.rotation.x = Math.PI / 2;
    scene.add(wireMesh);

    // 2. Superconducting Dipole Magnet Casing Segments (16 major sector octants around ring)
    const dipoleGeo = new THREE.BoxGeometry(0.95, 0.42, 0.55);
    const dipoleMat = new THREE.MeshStandardMaterial({
      color: 0x0053a0,
      emissive: 0x001a38,
      roughness: 0.3,
      metalness: 0.8,
    });
    const dipoleMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      // Leave clean gaps at the 4 Interaction Points (0, pi/2, pi, 3pi/2)
      if (i % 4 === 0) continue;
      const dMesh = new THREE.Mesh(dipoleGeo, dipoleMat);
      dMesh.position.set(Math.cos(angle) * RING_RADIUS, 0, Math.sin(angle) * RING_RADIUS);
      dMesh.rotation.y = -angle + Math.PI / 2;
      scene.add(dMesh);
      dipoleMeshes.push(dMesh);
    }

    // 3. 4 Detector Caverns (ATLAS, ALICE, CMS, LHCb) at cardinal angles
    const ipPositions = [
      { angle: 0, color: 0x00e5ff, radius: 0.65 }, // ATLAS (IP1)
      { angle: Math.PI / 2, color: 0xfacc15, radius: 0.52 }, // ALICE (IP2)
      { angle: Math.PI, color: 0x4c7dff, radius: 0.62 }, // CMS (IP5)
      { angle: (3 * Math.PI) / 2, color: 0xa855f7, radius: 0.48 }, // LHCb (IP8)
    ];

    const ipFlashMeshes: THREE.Mesh[] = [];
    ipPositions.forEach((ip) => {
      const cavernGeo = new THREE.CylinderGeometry(ip.radius, ip.radius, 1.3, 12, 1, true);
      const cavernMat = new THREE.MeshBasicMaterial({
        color: ip.color,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      });
      const cavern = new THREE.Mesh(cavernGeo, cavernMat);
      cavern.position.set(Math.cos(ip.angle) * RING_RADIUS, 0, Math.sin(ip.angle) * RING_RADIUS);
      cavern.rotation.z = Math.PI / 2;
      cavern.rotation.y = -ip.angle + Math.PI / 2;
      scene.add(cavern);

      // Central luminosity burst orb at each IP
      const flashGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const flashMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      });
      const flash = new THREE.Mesh(flashGeo, flashMat);
      flash.position.copy(cavern.position);
      scene.add(flash);
      ipFlashMeshes.push(flash);
    });

    // 4. Counter-Rotating Beam 1 (Clockwise Cyan) & Beam 2 (Counter-Clockwise Magenta) Bunches
    const BUNCH_COUNT = 32;
    const bunchGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const beam1Mat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const beam2Mat = new THREE.MeshBasicMaterial({ color: 0xff0055 });

    const beam1Meshes: THREE.Mesh[] = [];
    const beam2Meshes: THREE.Mesh[] = [];
    for (let i = 0; i < BUNCH_COUNT; i++) {
      const m1 = new THREE.Mesh(bunchGeo, beam1Mat);
      const m2 = new THREE.Mesh(bunchGeo, beam2Mat);
      scene.add(m1);
      scene.add(m2);
      beam1Meshes.push(m1);
      beam2Meshes.push(m2);
    }

    // 5. Radiating Collision Particle Sparks emerging from IP1 (angle=0) and IP5 (angle=PI)
    const SPARK_COUNT = 60;
    const sparkPositions = new Float32Array(SPARK_COUNT * 3);
    const sparkVelocities: { vx: number; vy: number; vz: number; life: number; ipIdx: number }[] = [];
    for (let i = 0; i < SPARK_COUNT; i++) {
      const ipIdx = i % 2 === 0 ? 0 : 2; // IP1 or IP5
      const ip = ipPositions[ipIdx];
      sparkPositions[i * 3] = Math.cos(ip.angle) * RING_RADIUS;
      sparkPositions[i * 3 + 1] = 0;
      sparkPositions[i * 3 + 2] = Math.sin(ip.angle) * RING_RADIUS;
      sparkVelocities.push({
        vx: (Math.random() - 0.5) * 0.09,
        vy: (Math.random() - 0.5) * 0.09,
        vz: (Math.random() - 0.5) * 0.09,
        life: Math.random(),
        ipIdx,
      });
    }
    const glowTex = createThreeGlowTexture(64);
    let isVisible = true;
    const cleanupVis = observeOffscreenVisibility(container, (v) => {
      isVisible = v;
    });

    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffe600,
      size: 0.32,
      map: glowTex ?? undefined,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkPoints);

    // Expanding Equatorial Shockwave Rings at IP1 & IP5
    const shockGeo = new THREE.RingGeometry(0.18, 0.25, 32);
    shockGeo.rotateX(Math.PI / 2);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const shockRing1 = new THREE.Mesh(shockGeo, shockMat);
    const shockRing2 = new THREE.Mesh(shockGeo, shockMat);
    shockRing1.position.set(Math.cos(ipPositions[0].angle) * RING_RADIUS, 0, Math.sin(ipPositions[0].angle) * RING_RADIUS);
    shockRing2.position.set(Math.cos(ipPositions[2].angle) * RING_RADIUS, 0, Math.sin(ipPositions[2].angle) * RING_RADIUS);
    scene.add(shockRing1, shockRing2);

    // ResizeObserver for crisp layout transitions
    const resizeObs = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        renderer.render(scene, camera);
      }
    });
    resizeObs.observe(container);

    // 60 FPS Animation Loop
    let rafId = 0;
    let phase1 = 0;
    let phase2 = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!isVisible) return;
      const { beamEnergyGev: eGev, bunches: nb, betaStarM: bStar, particleType: pType, isRunning: run, pileup: mu, reduceMotion: red } =
        simRef.current;

      // Smooth camera interpolation
      const cs = camStateRef.current;
      cs.azimuth += (cs.targetAzimuth - cs.azimuth) * 0.12;
      cs.elevation += (cs.targetElevation - cs.elevation) * 0.12;
      cs.distance += (cs.targetDistance - cs.distance) * 0.12;

      if (run && !red && !cs.isDragging) {
        cs.targetAzimuth += 0.0018;
      }

      const cx = cs.distance * Math.sin(cs.azimuth) * Math.cos(cs.elevation);
      const cy = cs.distance * Math.sin(cs.elevation);
      const cz = cs.distance * Math.cos(cs.azimuth) * Math.cos(cs.elevation);
      camera.position.set(cx, cy, cz);
      camera.lookAt(0, 0, 0);

      // Update bunch color for Lead ions vs Protons
      beam1Mat.color.setHex(pType === 'lead' ? 0xfacc15 : 0x00e5ff);
      beam2Mat.color.setHex(pType === 'lead' ? 0xf97316 : 0xff0055);

      const speedFactor = 0.012 + (eGev / 7000) * 0.032;
      if (run && !red) {
        phase1 = (phase1 + speedFactor) % (Math.PI * 2);
        phase2 = (phase2 - speedFactor + Math.PI * 2) % (Math.PI * 2);
      }

      const activeFraction = Math.min(1, Math.max(0.15, nb / 2748));
      const visibleBunches = Math.max(4, Math.floor(BUNCH_COUNT * activeFraction));

      // Beam squeeze effect near IP angles (beta* squeeze!)
      const squeezeRadiusFactor = Math.max(0.55, Math.min(1.4, bStar / 0.35));

      for (let i = 0; i < BUNCH_COUNT; i++) {
        const show = i < visibleBunches;
        beam1Meshes[i].visible = show;
        beam2Meshes[i].visible = show;
        if (!show) continue;

        const a1 = phase1 + (i / visibleBunches) * Math.PI * 2;
        const a2 = phase2 + (i / visibleBunches) * Math.PI * 2;

        // Slight vertical betatron wiggle that tightens near IP
        const r1 = RING_RADIUS + 0.055;
        const r2 = RING_RADIUS - 0.055;
        const ySqueeze1 = Math.sin(a1 * 6) * 0.03 * squeezeRadiusFactor;
        const ySqueeze2 = Math.cos(a2 * 6) * 0.03 * squeezeRadiusFactor;

        beam1Meshes[i].position.set(Math.cos(a1) * r1, ySqueeze1, Math.sin(a1) * r1);
        beam2Meshes[i].position.set(Math.cos(a2) * r2, ySqueeze2, Math.sin(a2) * r2);
      }

      // Gentle IP luminosity breathing well under 3 Hz WCAG flash limit
      const pulseBase = run && !red ? 0.72 + 0.35 * Math.sin(performance.now() * 0.008) : 0.7;
      const lumiScale = Math.min(2.2, Math.max(0.5, 0.7 + mu / 50));
      ipFlashMeshes.forEach((flash, idx) => {
        const s = pulseBase * lumiScale * (idx === 0 || idx === 2 ? 1.15 : 0.75);
        flash.scale.set(s, s, s);
      });

      // Animate radial collision sparks at IP1 & IP5
      if (run && !red) {
        const posArr = sparkGeo.attributes.position.array as Float32Array;
        const sparkReach = 0.6 + Math.min(1.5, mu / 45);
        for (let i = 0; i < SPARK_COUNT; i++) {
          const sv = sparkVelocities[i];
          sv.life += 0.045;
          if (sv.life >= 1.0) {
            const ip = ipPositions[sv.ipIdx];
            posArr[i * 3] = Math.cos(ip.angle) * RING_RADIUS;
            posArr[i * 3 + 1] = 0;
            posArr[i * 3 + 2] = Math.sin(ip.angle) * RING_RADIUS;
            sv.vx = (Math.random() - 0.5) * 0.06 * sparkReach;
            sv.vy = (Math.random() - 0.5) * 0.06 * sparkReach;
            sv.vz = (Math.random() - 0.5) * 0.06 * sparkReach;
            sv.life = 0;
          } else {
            posArr[i * 3] += sv.vx;
            posArr[i * 3 + 1] += sv.vy;
            posArr[i * 3 + 2] += sv.vz;
          }
        }
        sparkGeo.attributes.position.needsUpdate = true;

        const swPhase = (performance.now() * 0.0014) % 1;
        const swScale = 0.6 + swPhase * (2.6 + Math.min(2.0, mu / 35));
        shockRing1.scale.setScalar(swScale);
        shockRing2.scale.setScalar(swScale);
        shockMat.opacity = Math.max(0.05, 0.78 * (1 - swPhase));
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      cleanupVis();
      glowTex?.dispose();
      resizeObs.disconnect();
      cryostatGeo.dispose();
      cryostatMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      dipoleGeo.dispose();
      dipoleMat.dispose();
      bunchGeo.dispose();
      beam1Mat.dispose();
      beam2Mat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      shockGeo.dispose();
      shockMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Mouse / Pointer Drag Orbit handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    camStateRef.current.isDragging = true;
    camStateRef.current.lastX = e.clientX;
    camStateRef.current.lastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!camStateRef.current.isDragging) return;
    const dx = e.clientX - camStateRef.current.lastX;
    const dy = e.clientY - camStateRef.current.lastY;
    camStateRef.current.lastX = e.clientX;
    camStateRef.current.lastY = e.clientY;
    camStateRef.current.targetAzimuth -= dx * 0.008;
    camStateRef.current.targetElevation = Math.max(
      0.12,
      Math.min(1.52, camStateRef.current.targetElevation + dy * 0.006)
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    camStateRef.current.isDragging = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer already released
    }
  };

  if (webglFailed) {
    return (
      <div className="h-80 w-full bg-[#050811] border-2 border-black flex flex-col items-center justify-center p-4 font-mono text-xs text-cern-cyan">
        <span>WebGL unavailable in this headless context — Live Telemetry Active</span>
        <span className="text-white font-bold mt-2">
          v = {betaVelocity.toFixed(8)} c · B = {dipoleFieldTesla.toFixed(2)} T
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full border-2 border-black bg-[#050811] overflow-hidden select-none">
      {/* Interactive 3D Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing touch-none"
        title="Drag to orbit the 3D superconducting ring in real time"
      />

      {/* Top Left HUD Overlay */}
      <div className="absolute top-3 left-3 pointer-events-none space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/85 border-2 border-black shadow-[2px_2px_0px_#00E5FF] text-[10px] font-mono font-bold text-cern-cyan">
          <Rotate3D className="w-3.5 h-3.5" />
          <span>WEBGL 3D RING · DRAG TO ORBIT</span>
        </div>
        <div className="px-2.5 py-1 bg-black/80 border border-zinc-800 text-[11px] font-mono text-white font-bold w-fit">
          β = {betaVelocity.toFixed(8)} c · √s = {((beamEnergyGev * 2) / 1000).toFixed(2)} TeV
        </div>
      </div>

      {/* Top Right Camera Presets */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 font-mono text-[10px]">
        {(
          [
            { id: 'overview', label: '3D Ring' },
            { id: 'ip', label: 'IP1 Close-Up' },
            { id: 'top', label: 'Top-Down' },
          ] as const
        ).map((cam) => (
          <button
            key={cam.id}
            onClick={() => setCameraPreset(cam.id)}
            className={`px-2 py-1 border-2 border-black font-bold uppercase cursor-pointer transition-all ${
              cameraPreset === cam.id
                ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
                : 'bg-black/85 text-zinc-300 hover:text-white'
            }`}
          >
            {cam.label}
          </button>
        ))}
      </div>

      {/* Bottom Legend */}
      <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[10px] font-mono">
        <div className="flex items-center gap-3 px-2.5 py-1 bg-black/85 border border-zinc-800">
          <span className="flex items-center gap-1 text-cern-cyan font-bold">
            <span className="w-2 h-2 rounded-full bg-cern-cyan" /> Beam 1 (CW)
          </span>
          <span className="flex items-center gap-1 text-[#FF0055] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FF0055]" /> Beam 2 (CCW)
          </span>
          <span className="flex items-center gap-1 text-[#FFE600] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FFE600]" /> Collision Sparks (⟨μ⟩={pileup.toFixed(0)})
          </span>
        </div>
        <span className="hidden sm:inline px-2 py-1 bg-black/85 border border-zinc-800 text-emerald-400 font-bold">
          16 Cryo Dipoles · B = {dipoleFieldTesla.toFixed(2)} T
        </span>
      </div>
    </div>
  );
};
