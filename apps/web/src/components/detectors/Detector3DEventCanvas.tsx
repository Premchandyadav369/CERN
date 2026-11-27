'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGlobalStore } from '@/lib/store';
import { Rotate3D, Eye } from 'lucide-react';

export interface DetectorPhysicsObject {
  id: string;
  type: string;
  ptGev: number;
  eta: number;
  phi: number;
  energyGev: number;
  charge: number;
}

interface Detector3DEventCanvasProps {
  detector: 'atlas' | 'cms';
  visibleObjects: DetectorPhysicsObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  isTrackerActive: boolean;
  isEcalActive: boolean;
  isHcalActive: boolean;
  isMuonActive: boolean;
  metGev?: number;
}

export const Detector3DEventCanvas: React.FC<Detector3DEventCanvasProps> = ({
  detector,
  visibleObjects,
  selectedObjectId,
  onSelectObject,
  isTrackerActive,
  isEcalActive,
  isHcalActive,
  isMuonActive,
  metGev,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [cameraPreset, setCameraPreset] = useState<'cutaway' | 'endcap' | 'side'>('cutaway');
  const [webglFailed, setWebglFailed] = useState(false);

  const camRef = useRef({
    azimuth: 0.78,
    elevation: 0.42,
    distance: 10.5,
    targetAzimuth: 0.78,
    targetElevation: 0.42,
    targetDistance: 10.5,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    if (cameraPreset === 'cutaway') {
      camRef.current.targetAzimuth = 0.78;
      camRef.current.targetElevation = 0.42;
      camRef.current.targetDistance = 10.5;
    } else if (cameraPreset === 'endcap') {
      camRef.current.targetAzimuth = 0.02;
      camRef.current.targetElevation = 0.06;
      camRef.current.targetDistance = 10.2;
    } else {
      camRef.current.targetAzimuth = Math.PI / 2;
      camRef.current.targetElevation = 0.14;
      camRef.current.targetDistance = 11.2;
    }
  }, [cameraPreset]);

  const onSelectRef = useRef(onSelectObject);
  onSelectRef.current = onSelectObject;
  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;

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
    const h = container.clientHeight || 360;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050811, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050811, 0.02);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const keyLight = new THREE.DirectionalLight(0x00e5ff, 1.3);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xff0055, 1.5, 22);
    fillLight.position.set(-6, -4, 4);
    scene.add(fillLight);

    const disposables: Array<{ dispose: () => void }> = [];

    // Beam pipe along Z axis
    const beamPipeGeo = new THREE.CylinderGeometry(0.11, 0.11, 9.2, 16, 1, true);
    beamPipeGeo.rotateX(Math.PI / 2);
    const beamPipeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.55, wireframe: true });
    scene.add(new THREE.Mesh(beamPipeGeo, beamPipeMat));
    disposables.push(beamPipeGeo, beamPipeMat);

    // Helper: open 270-deg cutaway cylinder barrel centered along Z-axis
    const addCutawayBarrel = (radius: number, length: number, colorHex: number, active: boolean, opacity: number) => {
      const geo = new THREE.CylinderGeometry(radius, radius, length, 36, 1, true, Math.PI * 0.18, Math.PI * 1.5);
      geo.rotateX(Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: active ? opacity : 0.04,
        roughness: 0.4,
        metalness: 0.5,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      const wireGeo = new THREE.EdgesGeometry(geo);
      const wireMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: active ? Math.min(0.65, opacity * 2.5) : 0.08,
      });
      scene.add(new THREE.LineSegments(wireGeo, wireMat));
      disposables.push(geo, mat, wireGeo, wireMat);
    };

    // Nested Concentric Subdetector Shells
    addCutawayBarrel(0.9, 3.6, 0xffe600, isTrackerActive, 0.18); // Inner Silicon Tracker
    addCutawayBarrel(1.55, 4.4, 0x00ff66, isEcalActive, detector === 'cms' ? 0.24 : 0.18); // ECAL
    addCutawayBarrel(2.25, 5.4, 0x00e5ff, isHcalActive, 0.16); // HCAL
    addCutawayBarrel(3.05, 6.8, 0xff0055, isMuonActive, 0.12); // Muon Spectrometer

    // ATLAS Air-Core Toroids OR CMS Solenoid + Red Yoke Geometry Highlights
    if (detector === 'atlas') {
      const coilCount = 8;
      for (let i = 0; i < coilCount; i++) {
        const ang = (i / coilCount) * Math.PI * 2;
        if (ang > 0.2 && ang < 1.35) continue; // Keep cutaway window open!
        const torusCoilGeo = new THREE.BoxGeometry(0.14, 0.72, 6.2);
        const torusCoilMat = new THREE.MeshStandardMaterial({
          color: 0x00e5ff,
          transparent: true,
          opacity: isMuonActive ? 0.42 : 0.08,
          metalness: 0.7,
        });
        const coil = new THREE.Mesh(torusCoilGeo, torusCoilMat);
        coil.position.set(Math.cos(ang) * 2.75, Math.sin(ang) * 2.75, 0);
        coil.rotation.z = ang + Math.PI / 2;
        scene.add(coil);
        disposables.push(torusCoilGeo, torusCoilMat);
      }
    } else {
      // CMS Solenoid Cryostat Copper/Blue ring + outer red return yoke rings
      const solGeo = new THREE.CylinderGeometry(1.88, 1.88, 5.0, 32, 1, true, Math.PI * 0.18, Math.PI * 1.5);
      solGeo.rotateX(Math.PI / 2);
      const solMat = new THREE.MeshBasicMaterial({ color: 0x4c7dff, wireframe: true, transparent: true, opacity: 0.35 });
      scene.add(new THREE.Mesh(solGeo, solMat));
      disposables.push(solGeo, solMat);
    }

    // Beam bunches zipping toward vertex (0,0,0)
    const bunchGeo = new THREE.SphereGeometry(0.08, 10, 10);
    const b1Mat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const b2Mat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const bunch1 = new THREE.Mesh(bunchGeo, b1Mat);
    const bunch2 = new THREE.Mesh(bunchGeo, b2Mat);
    scene.add(bunch1, bunch2);
    disposables.push(bunchGeo, b1Mat, b2Mat);

    // Interaction Vertex Glow Core + Expanding Collision Shockwave
    const vertexGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const vertexMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const vertexMesh = new THREE.Mesh(vertexGeo, vertexMat);
    scene.add(vertexMesh);

    const waveGeo = new THREE.RingGeometry(0.15, 0.22, 36);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    scene.add(waveMesh);
    disposables.push(vertexGeo, vertexMat, waveGeo, waveMat);

    // Clickable Physics Objects & 3D Helical Tracks
    const hitMeshes: THREE.Object3D[] = [];
    const hitGeo = new THREE.SphereGeometry(0.16, 12, 12);
    disposables.push(hitGeo);

    visibleObjects.forEach((obj) => {
      const isSelected = obj.id === selectedObjectId;
      const reach =
        obj.type === 'MUON' ? 3.1 : obj.type === 'JET' || obj.type === 'B_JET' ? 2.25 : 1.55;

      const colorHex =
        obj.type === 'MUON'
          ? 0xff0055
          : obj.type === 'ELECTRON' || obj.type === 'PHOTON'
          ? 0x00ff66
          : 0x00e5ff;

      // Clamp eta subtly so tracks remain comfortably inside barrel/endcap viewport
      const clampedEta = Math.max(-1.6, Math.min(1.6, obj.eta));
      const zEnd = reach * Math.sinh(clampedEta) * 0.85;
      const bFieldCurvature =
        obj.charge === 0 ? 0 : (obj.charge * (detector === 'cms' ? 0.55 : 0.35)) / Math.max(8, obj.ptGev) * 14;

      const pts: THREE.Vector3[] = [];
      const steps = 24;
      let endPos = new THREE.Vector3();

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const r = reach * t;
        const phiCurved = obj.phi + bFieldCurvature * t * (obj.type === 'MUON' && r > 1.7 ? 0.45 : 1.0);
        const x = r * Math.cos(phiCurved);
        const y = r * Math.sin(phiCurved);
        const z = zEnd * t;
        const v = new THREE.Vector3(x, y, z);
        pts.push(v);
        if (i === steps) endPos = v;
      }

      const curve = new THREE.CatmullRomCurve3(pts);
      const trackGeo = new THREE.TubeGeometry(
        curve,
        24,
        isSelected ? 0.055 : 0.032,
        8,
        false
      );
      const trackMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffffff : colorHex,
      });
      const trackMesh = new THREE.Mesh(trackGeo, trackMat);
      trackMesh.userData = { objectId: obj.id };
      scene.add(trackMesh);
      hitMeshes.push(trackMesh);
      disposables.push(trackGeo, trackMat);

      // Endpoint Hit / Calorimeter Tower Block
      if (obj.type === 'PHOTON' || obj.type === 'ELECTRON' || obj.type === 'JET' || obj.type === 'B_JET') {
        const towerLen = Math.min(1.1, Math.max(0.25, obj.energyGev / 110));
        const towerGeo = new THREE.BoxGeometry(0.18, 0.18, towerLen);
        const towerMat = new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: isSelected ? 0.9 : 0.45,
          transparent: true,
          opacity: 0.85,
        });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.copy(endPos);
        tower.lookAt(0, 0, 0);
        tower.userData = { objectId: obj.id };
        scene.add(tower);
        hitMeshes.push(tower);
        disposables.push(towerGeo, towerMat);
      } else {
        const endMat = new THREE.MeshBasicMaterial({ color: isSelected ? 0xffe600 : colorHex });
        const endMarker = new THREE.Mesh(hitGeo, endMat);
        endMarker.position.copy(endPos);
        endMarker.userData = { objectId: obj.id };
        scene.add(endMarker);
        hitMeshes.push(endMarker);
        disposables.push(endMat);
      }
    });

    // Missing Transverse Energy (MET) dashed vector arrow
    if (metGev && metGev > 5) {
      const metLen = Math.min(2.6, Math.max(0.9, metGev / 35));
      const metPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(-metLen * 0.83, metLen * 0.55, 0)];
      const metGeo = new THREE.BufferGeometry().setFromPoints(metPoints);
      const metMat = new THREE.LineDashedMaterial({ color: 0xffb020, dashSize: 0.18, gapSize: 0.1 });
      const metLine = new THREE.Line(metGeo, metMat);
      metLine.computeLineDistances();
      scene.add(metLine);
      disposables.push(metGeo, metMat);
    }

    // Raycaster for track selection + Pointer Orbit Controls
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const domEl = renderer.domElement;
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      camRef.current.isDragging = true;
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!camRef.current.isDragging) return;
      const dx = e.clientX - camRef.current.lastX;
      const dy = e.clientY - camRef.current.lastY;
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
      camRef.current.targetAzimuth -= dx * 0.008;
      camRef.current.targetElevation = Math.max(-1.2, Math.min(1.4, camRef.current.targetElevation + dy * 0.008));
    };

    const handlePointerUp = (e: PointerEvent) => {
      camRef.current.isDragging = false;
      const distMoved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (distMoved < 6) {
        const rect = domEl.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(hitMeshes, false);
        if (intersects.length > 0 && intersects[0].object.userData?.objectId) {
          onSelectRef.current(intersects[0].object.userData.objectId);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camRef.current.targetDistance = Math.max(5.5, Math.min(18, camRef.current.targetDistance + e.deltaY * 0.006));
    };

    domEl.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const nw = container.clientWidth || 560;
      const nh = container.clientHeight || 360;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    let animId = 0;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!reduceRef.current) {
        clock += 0.035;
        if (!camRef.current.isDragging) {
          camRef.current.targetAzimuth += 0.0018;
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

      // Beam bunches colliding at z = 0
      const beamPhase = (clock * 0.55) % 1;
      const zPos = (1 - beamPhase) * 4.5;
      bunch1.position.set(0, 0, zPos);
      bunch2.position.set(0, 0, -zPos);
      const flash = Math.max(0.8, 1.4 - Math.abs(zPos) * 0.5);
      vertexMesh.scale.setScalar(reduceRef.current ? 1 : flash);

      if (!reduceRef.current) {
        const waveScale = 0.4 + beamPhase * 3.1;
        waveMesh.scale.setScalar(waveScale);
        waveMat.opacity = Math.max(0.02, 0.72 * (1 - beamPhase));
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domEl.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      domEl.removeEventListener('wheel', handleWheel);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [detector, visibleObjects, selectedObjectId, isTrackerActive, isEcalActive, isHcalActive, isMuonActive, metGev]);

  if (webglFailed) {
    return (
      <div className="w-full h-[360px] flex items-center justify-center bg-canvas-sub border-2 border-black font-mono text-xs text-text-muted p-4 text-center">
        WebGL 3D context unavailable. Switch to the 2D R-φ Transverse Cutaway view above.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[360px] bg-[#050811] border-2 border-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Camera Presets Overlay */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
        {(
          [
            { id: 'cutaway', label: '3D Cutaway' },
            { id: 'endcap', label: 'Endcap (R-φ)' },
            { id: 'side', label: 'Longitudinal' },
          ] as const
        ).map((preset) => (
          <button
            key={preset.id}
            onClick={() => setCameraPreset(preset.id)}
            className={`px-2 py-1 text-[10px] font-mono font-bold uppercase border-2 border-black shadow-[2px_2px_0px_#000] transition-all ${
              cameraPreset === preset.id
                ? 'bg-cern-cyan text-black'
                : 'bg-canvas-surface/90 text-text-secondary hover:text-white'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-black/80 border border-black text-[10px] font-mono text-text-muted flex items-center gap-1.5 pointer-events-none">
        <Rotate3D className="w-3.5 h-3.5 text-cern-cyan" />
        <span>Drag to orbit · Scroll zoom · Click any 3D particle track to inspect kinematics</span>
      </div>
    </div>
  );
};
