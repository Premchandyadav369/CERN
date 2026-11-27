'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VacuumRegime } from '@cern-x/sim-core';
import { useGlobalStore } from '@/lib/store';
import {
  createPlasmaWaveShaderMaterial,
  createThreeGlowTexture,
  observeOffscreenVisibility,
} from '@/lib/cernVisuals';
import { Rotate3D } from 'lucide-react';

interface TvaTimeline3DLoomProps {
  regime: VacuumRegime;
  branchRiskFraction: number;
  higgsMassGev: number;
  topMassGev: number;
}

export const TvaTimeline3DLoom: React.FC<TvaTimeline3DLoomProps> = ({
  regime,
  branchRiskFraction,
  higgsMassGev,
  topMassGev,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [webglFailed, setWebglFailed] = useState(false);

  const stateRef = useRef({ regime, branchRiskFraction, higgsMassGev, topMassGev, reduceMotion });
  useEffect(() => {
    stateRef.current = { regime, branchRiskFraction, higgsMassGev, topMassGev, reduceMotion };
  }, [regime, branchRiskFraction, higgsMassGev, topMassGev, reduceMotion]);

  const camRef = useRef({ azimuth: 0.4, elevation: 0.35, distance: 7.4, dragging: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let isVisible = true;
    const cleanupVis = observeOffscreenVisibility(container, (v) => {
      isVisible = v;
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

    const w = container.clientWidth || 620;
    const h = container.clientHeight || 280;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x0b0502, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0502, 0.055);
    const camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 100);

    scene.add(new THREE.AmbientLight(0xffdca8, 0.7));
    const coreLight = new THREE.PointLight(0xffb000, 3.2, 24);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const disposables: Array<{ dispose: () => void }> = [];
    const glowTex = createThreeGlowTexture(64);
    if (glowTex) disposables.push(glowTex);

    // Temporal Loom Concentric Brushed Brass Gyro Ring + Inner Containment Halo
    const loomRingGeom = new THREE.TorusGeometry(2.5, 0.09, 18, 84);
    const loomRingMat = new THREE.MeshStandardMaterial({
      color: 0xd9822b,
      emissive: 0x5c2905,
      metalness: 0.88,
      roughness: 0.24,
    });
    const loomRing = new THREE.Mesh(loomRingGeom, loomRingMat);
    loomRing.rotation.y = Math.PI / 2;
    scene.add(loomRing);
    disposables.push(loomRingGeom, loomRingMat);

    const innerRingGeom = new THREE.TorusGeometry(1.75, 0.045, 12, 72);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat);
    innerRing.rotation.y = Math.PI / 2;
    scene.add(innerRing);
    disposables.push(innerRingGeom, innerRingMat);

    // GLSL Volumetric Singularity Core Shell inside Loom Aperture
    const loomAuraGeo = new THREE.CylinderGeometry(1.4, 1.4, 1.2, 36, 4, true);
    loomAuraGeo.rotateZ(Math.PI / 2);
    const loomAuraMat = createPlasmaWaveShaderMaterial(0xffb000, 0xff334b);
    const loomAura = new THREE.Mesh(loomAuraGeo, loomAuraMat);
    scene.add(loomAura);
    disposables.push(loomAuraGeo, loomAuraMat);

    // Central Sacred Timeline braided helical tubes (3 luminous strands + additive shader glow)
    const sacredGroup = new THREE.Group();
    scene.add(sacredGroup);

    for (let s = 0; s < 3; s++) {
      const pts: THREE.Vector3[] = [];
      const phase = (s * Math.PI * 2) / 3;
      for (let i = 0; i <= 64; i++) {
        const u = i / 64;
        const x = (u - 0.5) * 8.6;
        const r = 0.22 + 0.08 * Math.sin(u * Math.PI * 3);
        pts.push(new THREE.Vector3(x, Math.sin(u * 14 + phase) * r, Math.cos(u * 14 + phase) * r));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeom = new THREE.TubeGeometry(curve, 64, s === 0 ? 0.07 : 0.034, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: s === 0 ? 0xffe082 : 0xffb000,
        transparent: true,
        opacity: s === 0 ? 0.95 : 0.72,
        blending: THREE.AdditiveBlending,
      });
      sacredGroup.add(new THREE.Mesh(tubeGeom, tubeMat));
      disposables.push(tubeGeom, tubeMat);
    }

    // Diverging Branching Quantum Filaments
    const branchGroup = new THREE.Group();
    scene.add(branchGroup);

    const branchMaterials: THREE.MeshBasicMaterial[] = [];
    for (let b = 0; b < 6; b++) {
      const angle = (b / 6) * Math.PI * 2 + 0.3;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 26; i++) {
        const u = i / 26;
        const x = -0.8 + u * 4.4;
        const spread = Math.pow(u, 1.45) * 2.1;
        pts.push(new THREE.Vector3(x, Math.sin(angle) * spread, Math.cos(angle) * spread));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geom = new THREE.TubeGeometry(curve, 32, 0.032, 6, false);
      const mat = new THREE.MeshBasicMaterial({
        color: b % 2 === 0 ? 0x38bdf8 : 0xff334b,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      branchMaterials.push(mat);
      branchGroup.add(new THREE.Mesh(geom, mat));
      disposables.push(geom, mat);
    }

    // Soft Glowing Temporal Energy Sparks along the Sacred Timeline axis
    const sparkCount = 160;
    const sparkPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = (Math.random() - 0.5) * 8.6;
      sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 0.72;
      sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 0.72;
    }
    const sparkGeom = new THREE.BufferGeometry();
    sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffe082,
      size: 0.24,
      map: glowTex ?? undefined,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparks = new THREE.Points(sparkGeom, sparkMat);
    scene.add(sparks);
    disposables.push(sparkGeom, sparkMat);

    let animId = 0;
    let clock = 0;

    const animate = () => {
      if (!isVisible) {
        if (!stateRef.current.reduceMotion) animId = requestAnimationFrame(animate);
        return;
      }
      const { reduceMotion: rm, regime: reg, branchRiskFraction: risk } = stateRef.current;
      if (!rm) {
        clock += 0.016;
        if (!camRef.current.dragging) camRef.current.azimuth += 0.0036;
        const posAttr = sparkGeom.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < sparkCount; i++) {
          let sx = posAttr.getX(i) + 0.055;
          if (sx > 4.3) sx = -4.3;
          posAttr.setX(i, sx);
        }
        posAttr.needsUpdate = true;
      }

      loomAuraMat.uniforms.uTime.value = clock * 2.2;
      loomAuraMat.uniforms.uIntensity.value = reg === 'REDLINE' ? 1.15 : 0.7 + risk * 0.4;
      loomRing.rotation.z = clock * 0.45;
      innerRing.rotation.z = -clock * 0.7;
      sacredGroup.rotation.x = clock * 0.55;
      branchGroup.rotation.x = -clock * 0.25;
      branchGroup.scale.set(1, 0.5 + risk * 1.15, 0.5 + risk * 1.15);

      branchMaterials.forEach((mat, idx) => {
        const redline = reg === 'REDLINE' || (reg === 'METASTABLE' && idx < Math.round(risk * 6));
        mat.color.setHex(redline ? 0xff334b : 0x38bdf8);
      });

      const { azimuth, elevation, distance } = camRef.current;
      camera.position.set(
        distance * Math.cos(elevation) * Math.sin(azimuth),
        distance * Math.sin(elevation),
        distance * Math.cos(elevation) * Math.cos(azimuth)
      );
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);

      if (!rm) animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 620;
      const nh = container.clientHeight || 280;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      cleanupVis();
      window.removeEventListener('resize', handleResize);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [reduceMotion, regime, branchRiskFraction]);

  if (webglFailed) {
    return (
      <div className="h-64 border-2 border-[#4A2E10] bg-[#120B05] flex items-center justify-center p-4 text-xs font-mono text-[#F5C77E]">
        3D Temporal Loom WebGL fallback active — switch to 2D CRT Timeline Loom for live wave rendering.
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          camRef.current.dragging = true;
          camRef.current.lastX = e.clientX;
          camRef.current.lastY = e.clientY;
        }}
        onPointerMove={(e) => {
          if (!camRef.current.dragging) return;
          const dx = e.clientX - camRef.current.lastX;
          const dy = e.clientY - camRef.current.lastY;
          camRef.current.azimuth -= dx * 0.01;
          camRef.current.elevation = Math.max(-1.1, Math.min(1.1, camRef.current.elevation + dy * 0.01));
          camRef.current.lastX = e.clientX;
          camRef.current.lastY = e.clientY;
        }}
        onPointerUp={() => {
          camRef.current.dragging = false;
        }}
        onPointerLeave={() => {
          camRef.current.dragging = false;
        }}
        className="w-full h-64 border-2 border-[#4A2E10] bg-[#0D0703] cursor-grab active:cursor-grabbing"
      />
      <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-[#D8A55C]">
        <span className="flex items-center gap-1">
          <Rotate3D className="w-3.5 h-3.5 text-[#FFB000]" />
          Drag to orbit 3D Temporal Loom (Three.js) · Ring threads Higgs/Top RG vacuum strands
        </span>
        <span>
          m_H={higgsMassGev.toFixed(1)} | m_t={topMassGev.toFixed(1)} GeV
        </span>
      </div>
    </div>
  );
};
