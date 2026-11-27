'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DetectorPhysicsObject } from '@/components/detectors/Detector3DEventCanvas';
import { useGlobalStore } from '@/lib/store';
import { Rotate3D } from 'lucide-react';

interface DetectorLego3DCanvasProps {
  visibleObjects: DetectorPhysicsObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  metGev?: number;
}

export const DetectorLego3DCanvas: React.FC<DetectorLego3DCanvasProps> = ({
  visibleObjects,
  selectedObjectId,
  onSelectObject,
  metGev,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [webglFailed, setWebglFailed] = useState(false);

  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;
  const onSelectRef = useRef(onSelectObject);
  onSelectRef.current = onSelectObject;

  const camRef = useRef({
    azimuth: 0.72,
    elevation: 0.56,
    distance: 9.8,
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

    const w = container.clientWidth || 560;
    const h = container.clientHeight || 360;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050811, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 80);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dir = new THREE.DirectionalLight(0x00e5ff, 1.3);
    dir.position.set(8, 14, 10);
    scene.add(dir);

    const disposables: Array<{ dispose: () => void }> = [];

    // Unrolled Eta (-3 to +3 along X) x Phi (-pi to +pi along Z) Grid Floor
    const GRID_X = 6.6; // eta width
    const GRID_Z = 5.4; // phi depth
    const baseGeo = new THREE.PlaneGeometry(GRID_X, GRID_Z, 18, 16);
    baseGeo.rotateX(-Math.PI / 2);
    const baseMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    scene.add(new THREE.Mesh(baseGeo, baseMat));
    disposables.push(baseGeo, baseMat);

    // Subtle glowing eta=0 and phi=0 cross axes
    const axisXGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-GRID_X / 2, 0.01, 0),
      new THREE.Vector3(GRID_X / 2, 0.01, 0),
    ]);
    const axisZGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.01, -GRID_Z / 2),
      new THREE.Vector3(0, 0.01, GRID_Z / 2),
    ]);
    const axisMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.45 });
    scene.add(new THREE.Line(axisXGeo, axisMat), new THREE.Line(axisZGeo, axisMat));
    disposables.push(axisXGeo, axisZGeo, axisMat);

    const hitMeshes: THREE.Object3D[] = [];

    visibleObjects.forEach((obj) => {
      const isSelected = obj.id === selectedObjectId;
      const clampedEta = Math.max(-2.8, Math.min(2.8, obj.eta));
      const xPos = (clampedEta / 3.0) * (GRID_X / 2);
      const zPos = (obj.phi / Math.PI) * (GRID_Z / 2);

      const height = Math.max(0.35, Math.min(3.6, obj.ptGev / 28.0));
      const colorHex =
        obj.type === 'MUON'
          ? 0xff0055
          : obj.type === 'ELECTRON' || obj.type === 'PHOTON'
          ? 0x00ff66
          : 0x00e5ff;

      const width = obj.type === 'JET' || obj.type === 'B_JET' ? 0.56 : 0.34;
      const towerGeo = new THREE.BoxGeometry(width, height, width);
      const towerMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xffffff : colorHex,
        emissive: colorHex,
        emissiveIntensity: isSelected ? 0.85 : 0.35,
        roughness: 0.25,
        metalness: 0.4,
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(xPos, height / 2, zPos);
      tower.userData = { objectId: obj.id };
      scene.add(tower);
      hitMeshes.push(tower);

      const edgeGeo = new THREE.EdgesGeometry(towerGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x000000 });
      const edge = new THREE.LineSegments(edgeGeo, edgeMat);
      tower.add(edge);
      disposables.push(towerGeo, towerMat, edgeGeo, edgeMat);
    });

    // Optional MET marker tower in amber along eta=0 edge
    if (metGev && metGev > 5) {
      const mh = Math.min(2.6, metGev / 30);
      const metGeo = new THREE.CylinderGeometry(0.14, 0.14, mh, 12);
      const metMat = new THREE.MeshStandardMaterial({
        color: 0xffb020,
        emissive: 0xffb020,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.75,
      });
      const metTower = new THREE.Mesh(metGeo, metMat);
      metTower.position.set(-GRID_X / 2 + 0.2, mh / 2, GRID_Z / 2 - 0.2);
      scene.add(metTower);
      disposables.push(metGeo, metMat);
    }

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
      camRef.current.azimuth -= (e.clientX - camRef.current.lastX) * 0.008;
      camRef.current.elevation = Math.max(0.15, Math.min(1.4, camRef.current.elevation + (e.clientY - camRef.current.lastY) * 0.008));
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      camRef.current.isDragging = false;
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) < 6) {
        const rect = domEl.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(hitMeshes, false);
        if (hits.length > 0 && hits[0].object.userData?.objectId) {
          onSelectRef.current(hits[0].object.userData.objectId);
        }
      }
    };

    domEl.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const nw = container.clientWidth || 560;
      const nh = container.clientHeight || 360;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!reduceRef.current && !camRef.current.isDragging) {
        camRef.current.azimuth += 0.0022;
      }
      const c = camRef.current;
      camera.position.x = c.distance * Math.cos(c.elevation) * Math.sin(c.azimuth);
      camera.position.y = c.distance * Math.sin(c.elevation);
      camera.position.z = c.distance * Math.cos(c.elevation) * Math.cos(c.azimuth);
      camera.lookAt(0, 0.8, 0);
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
  }, [visibleObjects, selectedObjectId, metGev]);

  if (webglFailed) return null;

  return (
    <div className="relative w-full h-[360px] bg-[#050811] border-2 border-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/85 border border-black text-[10px] font-mono text-cern-cyan font-bold pointer-events-none">
        UNROLLED (η ∈ [-3, 3] × φ ∈ [-π, π]) · TOWER HEIGHT ∝ TRANSVERSE p_T [GeV]
      </div>
      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-black/80 border border-black text-[10px] font-mono text-text-muted flex items-center gap-1.5 pointer-events-none">
        <Rotate3D className="w-3.5 h-3.5 text-cern-cyan" />
        <span>Drag 3D Lego Calorimeter Plot · Click any colored tower to inspect kinematics</span>
      </div>
    </div>
  );
};
