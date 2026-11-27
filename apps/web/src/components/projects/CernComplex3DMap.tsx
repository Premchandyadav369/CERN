'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGlobalStore } from '@/lib/store';
import { Rotate3D, Compass, Layers } from 'lucide-react';

interface CernComplex3DMapProps {
  showFccProjection: boolean;
  onSelectSite?: (siteName: string) => void;
}

export const CernComplex3DMap: React.FC<CernComplex3DMapProps> = ({
  showFccProjection,
  onSelectSite,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [cameraPreset, setCameraPreset] = useState<'angle' | 'profile' | 'top'>('angle');
  const [webglFailed, setWebglFailed] = useState(false);

  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;
  const fccRef = useRef(showFccProjection);
  fccRef.current = showFccProjection;

  const camRef = useRef({
    azimuth: 0.55,
    elevation: 0.48,
    distance: 15.0,
    targetAzimuth: 0.55,
    targetElevation: 0.48,
    targetDistance: 15.0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    if (cameraPreset === 'angle') {
      camRef.current.targetAzimuth = 0.55;
      camRef.current.targetElevation = 0.48;
      camRef.current.targetDistance = 15.0;
    } else if (cameraPreset === 'profile') {
      camRef.current.targetAzimuth = 0.15;
      camRef.current.targetElevation = 0.08;
      camRef.current.targetDistance = 15.5;
    } else {
      camRef.current.targetAzimuth = 0.0;
      camRef.current.targetElevation = 1.46;
      camRef.current.targetDistance = 16.5;
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

    const w = container.clientWidth || 720;
    const h = container.clientHeight || 380;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050811, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050811, 0.018);

    const camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 120);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.3);
    dirLight.position.set(10, 18, 12);
    scene.add(dirLight);

    const disposables: Array<{ dispose: () => void }> = [];

    // 1. Franco-Swiss Ground Plane (Surface Level y = +1.35)
    const groundY = 1.35;
    const groundGeo = new THREE.PlaneGeometry(24, 24, 24, 24);
    groundGeo.rotateX(-Math.PI / 2);
    // Gentle Jura mountain ridge elevation along -x / -z corner
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      if (x < -4 && z < -2) {
        const ridge = Math.min(2.2, ((-4 - x) * 0.18 + (-2 - z) * 0.12));
        pos.setY(i, ridge);
      }
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = groundY;
    scene.add(groundMesh);
    disposables.push(groundGeo, groundMat);

    // Lake Geneva Accent Arc on +x / +z edge
    const lakeGeo = new THREE.RingGeometry(4.2, 6.2, 24, 1, -0.4, 1.15);
    lakeGeo.rotateX(-Math.PI / 2);
    const lakeMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);
    lakeMesh.position.set(5.4, groundY + 0.02, 1.8);
    scene.add(lakeMesh);
    disposables.push(lakeGeo, lakeMat);

    // 2. Underground 27 km LHC Ring (y = -1.25 -> ~100 m underground depth)
    const lhcY = -1.25;
    const lhcR = 3.6;
    const lhcGeo = new THREE.TorusGeometry(lhcR, 0.11, 14, 96);
    lhcGeo.rotateX(Math.PI / 2);
    const lhcMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x004466,
      roughness: 0.3,
      metalness: 0.7,
    });
    scene.add(new THREE.Mesh(lhcGeo, lhcMat));
    disposables.push(lhcGeo, lhcMat);

    // 4 Underground Detector Caverns + Vertical Surface Access Shafts
    const caverns = [
      { angle: Math.PI / 2, color: 0x00e5ff, name: 'IP1 ATLAS (Meyrin)' },
      { angle: Math.PI * 0.75, color: 0xffb020, name: 'IP2 ALICE (St. Genis)' },
      { angle: -Math.PI / 2, color: 0x4c7dff, name: 'IP5 CMS (Cessy)' },
      { angle: Math.PI * 0.25, color: 0xc084fc, name: 'IP8 LHCb / MoEDAL' },
    ];
    const cavGeo = new THREE.BoxGeometry(0.45, 0.35, 0.45);
    const shaftGeo = new THREE.CylinderGeometry(0.05, 0.05, groundY - lhcY, 8);
    const hitMeshes: THREE.Object3D[] = [];
    disposables.push(cavGeo, shaftGeo);

    caverns.forEach((cav) => {
      const cx = Math.cos(cav.angle) * lhcR;
      const cz = Math.sin(cav.angle) * lhcR;

      const cMat = new THREE.MeshStandardMaterial({ color: cav.color, emissive: cav.color, emissiveIntensity: 0.5 });
      const cMesh = new THREE.Mesh(cavGeo, cMat);
      cMesh.position.set(cx, lhcY, cz);
      cMesh.userData = { siteName: cav.name };
      scene.add(cMesh);
      hitMeshes.push(cMesh);

      const sMat = new THREE.MeshBasicMaterial({ color: cav.color, transparent: true, opacity: 0.45 });
      const sMesh = new THREE.Mesh(shaftGeo, sMat);
      sMesh.position.set(cx, (groundY + lhcY) / 2, cz);
      scene.add(sMesh);
      disposables.push(cMat, sMat);
    });

    // 3. 6.9 km SPS Ring (slightly shallower y = -0.75) + AWAKE / North Area Spur
    const spsCenter = new THREE.Vector3(-2.4, -0.75, 2.2);
    const spsGeo = new THREE.TorusGeometry(1.15, 0.075, 10, 48);
    spsGeo.rotateX(Math.PI / 2);
    const spsMat = new THREE.MeshStandardMaterial({ color: 0x4c7dff, emissive: 0x1e3a8a });
    const spsMesh = new THREE.Mesh(spsGeo, spsMat);
    spsMesh.position.copy(spsCenter);
    spsMesh.userData = { siteName: 'SPS 450 GeV + AWAKE + North Area (NA62/NA64)' };
    scene.add(spsMesh);
    hitMeshes.push(spsMesh);
    disposables.push(spsGeo, spsMat);

    // 4. PS (628m) + Linac4 + PSB + AD/ELENA + ISOLDE Campus Cluster (Surface / shallow y = +0.55)
    const psCenter = new THREE.Vector3(-1.3, 0.55, 3.6);
    const psGeo = new THREE.TorusGeometry(0.45, 0.055, 10, 32);
    psGeo.rotateX(Math.PI / 2);
    const psMat = new THREE.MeshStandardMaterial({ color: 0x00ff66, emissive: 0x065f46 });
    const psMesh = new THREE.Mesh(psGeo, psMat);
    psMesh.position.copy(psCenter);
    psMesh.userData = { siteName: 'Meyrin Hub: Linac4 + PSB + PS + ISOLDE + AD/ELENA' };
    scene.add(psMesh);
    hitMeshes.push(psMesh);
    disposables.push(psGeo, psMat);

    // Linac4 Straight Feeder Spur
    const linacGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8);
    linacGeo.rotateZ(Math.PI / 2);
    const linacMat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
    const linacMesh = new THREE.Mesh(linacGeo, linacMat);
    linacMesh.position.set(-2.3, 0.55, 4.1);
    scene.add(linacMesh);
    disposables.push(linacGeo, linacMat);

    // Transfer Tunnel connecting PS -> SPS -> LHC
    const transferPts = [
      new THREE.Vector3(-1.3, 0.55, 3.6),
      new THREE.Vector3(-2.4, -0.75, 2.2),
      new THREE.Vector3(-1.8, lhcY, 3.1),
    ];
    const transferGeo = new THREE.BufferGeometry().setFromPoints(transferPts);
    const transferMat = new THREE.LineBasicMaterial({ color: 0xffe600 });
    scene.add(new THREE.Line(transferGeo, transferMat));
    disposables.push(transferGeo, transferMat);

    // 5. Optional 91 km Future Circular Collider (FCC) Ring Projection (y = -1.75)
    const fccGeo = new THREE.TorusGeometry(8.2, 0.09, 12, 128);
    fccGeo.rotateX(Math.PI / 2);
    const fccMat = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.7 });
    const fccMesh = new THREE.Mesh(fccGeo, fccMat);
    fccMesh.position.set(1.8, -1.75, -1.8);
    fccMesh.visible = showFccProjection;
    scene.add(fccMesh);
    disposables.push(fccGeo, fccMat);

    // Animated Proton Beam Pulses circulating around LHC & SPS
    const pulseGeo = new THREE.SphereGeometry(0.11, 10, 10);
    const p1Mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const p2Mat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const lhcPulse1 = new THREE.Mesh(pulseGeo, p1Mat);
    const lhcPulse2 = new THREE.Mesh(pulseGeo, p2Mat);
    const spsPulse = new THREE.Mesh(pulseGeo, p1Mat);
    scene.add(lhcPulse1, lhcPulse2, spsPulse);

    // Expanding Underground Cavern Beacon Rings (IP1 & IP5)
    const beaconGeo = new THREE.RingGeometry(0.18, 0.25, 28);
    beaconGeo.rotateX(-Math.PI / 2);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ip1Beacon = new THREE.Mesh(beaconGeo, beaconMat);
    const ip5Beacon = new THREE.Mesh(beaconGeo, beaconMat);
    ip1Beacon.position.set(0, lhcY + 0.04, lhcR);
    ip5Beacon.position.set(0, lhcY + 0.04, -lhcR);
    scene.add(ip1Beacon, ip5Beacon);

    disposables.push(pulseGeo, p1Mat, p2Mat, beaconGeo, beaconMat);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const domEl = renderer.domElement;
    let downPos = { x: 0, y: 0 };

    const onDown = (e: PointerEvent) => {
      camRef.current.isDragging = true;
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
      downPos = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!camRef.current.isDragging) return;
      camRef.current.targetAzimuth -= (e.clientX - camRef.current.lastX) * 0.008;
      camRef.current.targetElevation = Math.max(0.05, Math.min(1.48, camRef.current.targetElevation + (e.clientY - camRef.current.lastY) * 0.008));
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      camRef.current.isDragging = false;
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) < 6 && onSelectSite) {
        const rect = domEl.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(hitMeshes, false);
        if (hits.length > 0 && hits[0].object.userData?.siteName) {
          onSelectSite(hits[0].object.userData.siteName);
        }
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camRef.current.targetDistance = Math.max(7.5, Math.min(26, camRef.current.targetDistance + e.deltaY * 0.01));
    };

    domEl.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const nw = container.clientWidth || 720;
      const nh = container.clientHeight || 380;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    let animId = 0;
    let theta = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      fccMesh.visible = fccRef.current;

      if (!reduceRef.current) {
        theta += 0.025;
        if (!camRef.current.isDragging) {
          camRef.current.targetAzimuth += 0.0014;
        }
      }

      const cs = camRef.current;
      cs.azimuth += (cs.targetAzimuth - cs.azimuth) * 0.1;
      cs.elevation += (cs.targetElevation - cs.elevation) * 0.1;
      cs.distance += (cs.targetDistance - cs.distance) * 0.1;

      camera.position.x = cs.distance * Math.cos(cs.elevation) * Math.sin(cs.azimuth);
      camera.position.y = cs.distance * Math.sin(cs.elevation);
      camera.position.z = cs.distance * Math.cos(cs.elevation) * Math.cos(cs.azimuth);
      camera.lookAt(0, 0, 0);

      lhcPulse1.position.set(Math.cos(theta) * lhcR, lhcY, Math.sin(theta) * lhcR);
      lhcPulse2.position.set(Math.cos(-theta) * lhcR, lhcY, Math.sin(-theta) * lhcR);
      spsPulse.position.set(spsCenter.x + Math.cos(theta * 2.2) * 1.15, spsCenter.y, spsCenter.z + Math.sin(theta * 2.2) * 1.15);

      if (!reduceRef.current) {
        const bPhase = (theta * 0.45) % 1;
        const bScale = 0.8 + bPhase * 3.2;
        ip1Beacon.scale.setScalar(bScale);
        ip5Beacon.scale.setScalar(bScale);
        beaconMat.opacity = Math.max(0.05, 0.72 * (1 - bPhase));
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
      domEl.removeEventListener('wheel', onWheel);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [onSelectSite, showFccProjection]);

  if (webglFailed) return null;

  return (
    <div className="relative w-full h-[380px] bg-[#050811] border-2 border-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Camera Preset Buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        {(
          [
            { id: 'angle', label: '3D Terrain + Tunnels' },
            { id: 'profile', label: '100m Underground Depth' },
            { id: 'top', label: 'Top-Down Blueprint' },
          ] as const
        ).map((preset) => (
          <button
            key={preset.id}
            onClick={() => setCameraPreset(preset.id)}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border-2 border-black shadow-[2px_2px_0px_#000] transition-all ${
              cameraPreset === preset.id
                ? 'bg-cern-cyan text-black'
                : 'bg-canvas-surface/90 text-text-secondary hover:text-white'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Depth Legend */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none text-[10px] font-mono font-bold">
        <span className="px-2 py-0.5 bg-emerald-400 text-black border border-black">Surface: Linac4 · PS · ISOLDE · AD/ELENA</span>
        <span className="px-2 py-0.5 bg-cern-blue text-white border border-black">-50m: 6.9 km SPS · AWAKE · North Area</span>
        <span className="px-2 py-0.5 bg-cern-cyan text-black border border-black">-100m: 27 km LHC · ATLAS · CMS · ALICE · LHCb</span>
        {showFccProjection && (
          <span className="px-2 py-0.5 bg-cern-magenta text-white border border-black">-200m Future: 91 km FCC Ring Projection</span>
        )}
      </div>

      <div className="absolute bottom-2.5 left-3 px-2.5 py-1 bg-black/85 border border-black text-[10px] font-mono text-text-muted flex items-center gap-1.5 pointer-events-none">
        <Rotate3D className="w-3.5 h-3.5 text-cern-cyan" />
        <span>Drag to orbit · Scroll zoom · Click glowing underground caverns to inspect site</span>
      </div>
    </div>
  );
};
