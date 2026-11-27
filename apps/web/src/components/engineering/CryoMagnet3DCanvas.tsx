'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGlobalStore } from '@/lib/store';
import {
  createSuperfluidJacketShaderMaterial,
  createThreeGlowTexture,
  observeOffscreenVisibility,
} from '@/lib/cernVisuals';
import { Pause, Play, Rotate3D } from 'lucide-react';

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
  const [isPlaying, setIsPlaying] = useState(true);
  const isVisibleRef = useRef(true);

  const stateRef = useRef({
    magnetCurrentKa,
    temperatureK,
    isQuenched,
    isSuperfluidHeII,
    reduceMotion,
    isPlaying,
  });

  useEffect(() => {
    stateRef.current = {
      magnetCurrentKa,
      temperatureK,
      isQuenched,
      isSuperfluidHeII,
      reduceMotion,
      isPlaying,
    };
  }, [magnetCurrentKa, temperatureK, isQuenched, isSuperfluidHeII, reduceMotion, isPlaying]);

  const camRef = useRef({
    azimuth: 0.44,
    elevation: 0.28,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanupVis = observeOffscreenVisibility(container, (vis) => {
      isVisibleRef.current = vis;
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

    const w = container.clientWidth || 640;
    const h = container.clientHeight || 290;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x03060d, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03060d, 0.045);
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 80);

    scene.add(new THREE.AmbientLight(0xbbe6ff, 0.65));
    const keyLight = new THREE.DirectionalLight(0x00e5ff, 1.8);
    keyLight.position.set(6, 9, 8);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xff0055, 1.5, 18);
    rimLight.position.set(-5, -4, -5);
    scene.add(rimLight);

    const disposables: Array<{ dispose: () => void }> = [];
    const glowTex = createThreeGlowTexture(64);
    if (glowTex) disposables.push(glowTex);

    // 1. Outer LHC Cryostat Vacuum Vessel (Half-cutaway + CAD end flanges)
    const cryostatGeo = new THREE.CylinderGeometry(2.05, 2.05, 5.8, 36, 1, true, Math.PI * 0.25, Math.PI * 1.5);
    cryostatGeo.rotateX(Math.PI / 2);
    const cryostatMat = new THREE.MeshStandardMaterial({
      color: 0x0c3468,
      metalness: 0.78,
      roughness: 0.28,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });
    scene.add(new THREE.Mesh(cryostatGeo, cryostatMat));
    disposables.push(cryostatGeo, cryostatMat);

    // End Flange Structural Rings
    const flangeGeo = new THREE.TorusGeometry(2.05, 0.045, 12, 48);
    const flangeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.5,
      metalness: 0.85,
      roughness: 0.2,
    });
    [-2.9, 0, 2.9].forEach((zOff) => {
      const fl = new THREE.Mesh(flangeGeo, flangeMat);
      fl.position.z = zOff;
      scene.add(fl);
    });
    disposables.push(flangeGeo, flangeMat);

    // 2. Iron Yoke + Stainless Collar Laminations (cutaway reveals Nb-Ti coils)
    const yokeGeo = new THREE.CylinderGeometry(1.52, 1.52, 5.1, 32, 1, true, Math.PI * 0.35, Math.PI * 1.3);
    yokeGeo.rotateX(Math.PI / 2);
    const yokeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.38,
      metalness: 0.82,
      side: THREE.DoubleSide,
    });
    scene.add(new THREE.Mesh(yokeGeo, yokeMat));
    disposables.push(yokeGeo, yokeMat);

    // 3. Custom GLSL Superfluid He-II Lambda-Transition Shader Jacket
    const heGeo = new THREE.CylinderGeometry(1.66, 1.66, 5.2, 48, 8, true);
    heGeo.rotateX(Math.PI / 2);
    const heShaderMat = createSuperfluidJacketShaderMaterial();
    const heMesh = new THREE.Mesh(heGeo, heShaderMat);
    scene.add(heMesh);
    disposables.push(heGeo, heShaderMat);

    // 4. Twin Nb-Ti Dipole Saddle Coils (Upper/Lower conductors around each aperture)
    const saddleGeo = new THREE.CylinderGeometry(0.32, 0.32, 4.9, 20, 1, true);
    saddleGeo.rotateX(Math.PI / 2);
    const saddleMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
    });
    [-0.62, 0.62].forEach((xOff) => {
      const coil = new THREE.Mesh(saddleGeo, saddleMat);
      coil.position.x = xOff;
      scene.add(coil);
    });
    disposables.push(saddleGeo, saddleMat);

    // 5. Twin Beam Apertures (Beam 1 Cyan & Beam 2 Magenta vacuum screens)
    const pipeGeo = new THREE.CylinderGeometry(0.16, 0.16, 6.8, 24, 1, true);
    pipeGeo.rotateX(Math.PI / 2);
    const pipeMat1 = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const pipeMat2 = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0055,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const pipe1 = new THREE.Mesh(pipeGeo, pipeMat1);
    const pipe2 = new THREE.Mesh(pipeGeo, pipeMat2);
    pipe1.position.x = -0.62;
    pipe2.position.x = 0.62;
    scene.add(pipe1, pipe2);
    disposables.push(pipeGeo, pipeMat1, pipeMat2);

    // 6. Volumetric 3D Dipole Magnetic B-Field Streamlines arching around Twin Apertures
    const fluxLoops: THREE.Mesh[] = [];
    const fluxMat = new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(fluxMat);

    [-1.8, -0.6, 0.6, 1.8].forEach((zOff) => {
      [-0.62, 0.62].forEach((xOff, aIdx) => {
        const sign = aIdx === 0 ? 1 : -1;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(xOff, -0.45, zOff),
          new THREE.Vector3(xOff + 0.34 * sign, 0, zOff),
          new THREE.Vector3(xOff, 0.45, zOff),
          new THREE.Vector3(xOff - 0.34 * sign, 0, zOff),
        ], true);
        const loopGeo = new THREE.TubeGeometry(curve, 32, 0.014, 6, true);
        const loopMesh = new THREE.Mesh(loopGeo, fluxMat);
        scene.add(loopMesh);
        fluxLoops.push(loopMesh);
        disposables.push(loopGeo);
      });
    });

    // 7. Counter-Rotating Proton Bunches (5 per beam with glow sprites)
    const bunchCountPerBeam = 5;
    const bunches1Pos = new Float32Array(bunchCountPerBeam * 3);
    const bunches2Pos = new Float32Array(bunchCountPerBeam * 3);
    for (let i = 0; i < bunchCountPerBeam; i++) {
      bunches1Pos[i * 3] = -0.62;
      bunches1Pos[i * 3 + 1] = 0;
      bunches1Pos[i * 3 + 2] = -3.4 + (i / bunchCountPerBeam) * 6.8;

      bunches2Pos[i * 3] = 0.62;
      bunches2Pos[i * 3 + 1] = 0;
      bunches2Pos[i * 3 + 2] = 3.4 - (i / bunchCountPerBeam) * 6.8;
    }
    const b1Geo = new THREE.BufferGeometry();
    b1Geo.setAttribute('position', new THREE.BufferAttribute(bunches1Pos, 3));
    const b2Geo = new THREE.BufferGeometry();
    b2Geo.setAttribute('position', new THREE.BufferAttribute(bunches2Pos, 3));
    const b1Mat = new THREE.PointsMaterial({
      color: 0xa5f3fc,
      size: 0.42,
      map: glowTex ?? undefined,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const b2Mat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.42,
      map: glowTex ?? undefined,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(b1Geo, b1Mat), new THREE.Points(b2Geo, b2Mat));
    disposables.push(b1Geo, b2Geo, b1Mat, b2Mat);

    // 8. Soft Luminous Helium Vortex / Boil Cloud Sprites inside Cryostat Jacket
    const particleCount = 120;
    const cryoPos = new Float32Array(particleCount * 3);
    const cryoAngles = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 1.05 + Math.random() * 0.48;
      cryoAngles[i] = ang;
      cryoPos[i * 3] = Math.cos(ang) * rad;
      cryoPos[i * 3 + 1] = Math.sin(ang) * rad;
      cryoPos[i * 3 + 2] = (Math.random() - 0.5) * 4.9;
    }
    const cryoPtsGeo = new THREE.BufferGeometry();
    cryoPtsGeo.setAttribute('position', new THREE.BufferAttribute(cryoPos, 3));
    const cryoPtsMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.24,
      map: glowTex ?? undefined,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(cryoPtsGeo, cryoPtsMat));
    disposables.push(cryoPtsGeo, cryoPtsMat);

    const domEl = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      camRef.current.isDragging = true;
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!camRef.current.isDragging) return;
      camRef.current.azimuth -= (e.clientX - camRef.current.lastX) * 0.008;
      camRef.current.elevation = Math.max(
        -0.75,
        Math.min(1.15, camRef.current.elevation + (e.clientY - camRef.current.lastY) * 0.008)
      );
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
      const nw = container.clientWidth || 640;
      const nh = container.clientHeight || 290;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    });
    ro.observe(container);

    let animId = 0;
    let t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisibleRef.current) return;

      const st = stateRef.current;
      if (!st.reduceMotion && st.isPlaying) {
        t += 0.032;
        if (!camRef.current.isDragging) {
          camRef.current.azimuth += 0.0022;
        }
      }

      const dist = 7.4;
      camera.position.x = dist * Math.cos(camRef.current.elevation) * Math.sin(camRef.current.azimuth);
      camera.position.y = dist * Math.sin(camRef.current.elevation);
      camera.position.z = dist * Math.cos(camRef.current.elevation) * Math.cos(camRef.current.azimuth);
      camera.lookAt(0, 0, 0);

      // Update GLSL shader uniforms for Superfluid vs Boiling vs Quench
      heShaderMat.uniforms.uTime.value = t;
      heShaderMat.uniforms.uRegime.value = st.isQuenched ? 2.0 : st.isSuperfluidHeII ? 0.0 : 1.0;
      heShaderMat.uniforms.uFieldNorm.value = Math.min(1.2, st.magnetCurrentKa / 11.85);

      if (st.isQuenched) {
        yokeMat.color.setHex(0x5b1216);
        saddleMat.emissive.setHex(0xef4444);
        fluxMat.opacity = 0.08;
        cryoPtsMat.color.setHex(0xef4444);
      } else if (st.isSuperfluidHeII) {
        yokeMat.color.setHex(0x1e293b);
        saddleMat.emissive.setHex(0x00e5ff);
        fluxMat.opacity = Math.min(0.85, 0.18 + (st.magnetCurrentKa / 12) * 0.65);
        cryoPtsMat.color.setHex(0x00e5ff);
      } else {
        yokeMat.color.setHex(0x451a03);
        saddleMat.emissive.setHex(0xf59e0b);
        fluxMat.opacity = Math.min(0.7, (st.magnetCurrentKa / 12) * 0.55);
        cryoPtsMat.color.setHex(0xfbbf24);
      }

      // Helical Superfluid Vortex Drift vs Chaotic Upward Boil Plumes
      if (!st.reduceMotion && st.isPlaying) {
        const pos = cryoPtsGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          if (st.isSuperfluidHeII && !st.isQuenched) {
            cryoAngles[i] += 0.015 * (i % 2 === 0 ? 1 : -1);
            const r = 1.08 + (i % 5) * 0.09;
            pos[i * 3] = Math.cos(cryoAngles[i]) * r;
            pos[i * 3 + 1] = Math.sin(cryoAngles[i]) * r;
            pos[i * 3 + 2] += 0.018;
            if (pos[i * 3 + 2] > 2.45) pos[i * 3 + 2] = -2.45;
          } else {
            pos[i * 3 + 1] += 0.032;
            if (pos[i * 3 + 1] > 1.5) pos[i * 3 + 1] = -1.5;
          }
        }
        cryoPtsGeo.attributes.position.needsUpdate = true;

        // Animate counter-rotating proton bunch trains
        if (!st.isQuenched) {
          const b1Arr = b1Geo.attributes.position.array as Float32Array;
          const b2Arr = b2Geo.attributes.position.array as Float32Array;
          for (let i = 0; i < bunchCountPerBeam; i++) {
            b1Arr[i * 3 + 2] += 0.14;
            if (b1Arr[i * 3 + 2] > 3.4) b1Arr[i * 3 + 2] = -3.4;

            b2Arr[i * 3 + 2] -= 0.14;
            if (b2Arr[i * 3 + 2] < -3.4) b2Arr[i * 3 + 2] = 3.4;
          }
          b1Geo.attributes.position.needsUpdate = true;
          b2Geo.attributes.position.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      cleanupVis();
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
    <div className="relative w-full h-[290px] bg-[#03060D] border-2 border-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
      <div className="absolute top-2.5 left-2.5 flex items-center gap-2 pointer-events-none">
        <span
          className={`px-2 py-0.5 text-[10px] font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] uppercase ${
            isQuenched
              ? 'bg-red-500 text-white'
              : isSuperfluidHeII
              ? 'bg-cern-cyan text-black'
              : 'bg-amber-400 text-black'
          }`}
        >
          {isQuenched
            ? 'THERMAL QUENCH — RESISTIVE WAVE PROPAGATING'
            : isSuperfluidHeII
            ? 'GLSL SUPERFLUID HE-II VORTEX LATTICE (1.9 K)'
            : 'HE-I NUCLEATE BOILING (>2.17 K)'}
        </span>
      </div>
      <div className="absolute bottom-2 left-2.5 px-2 py-0.5 bg-black/80 border border-black text-[10px] font-mono text-text-muted flex items-center gap-1 pointer-events-none">
        <Rotate3D className="w-3.5 h-3.5 text-cern-cyan" />
        <span>Drag to Orbit 3D Twin-Aperture Nb-Ti Cryostat + Quantized Vortex Shader</span>
      </div>
      <button
        type="button"
        onClick={() => setIsPlaying((p) => !p)}
        aria-label={isPlaying ? 'Pause 3D Cryostat animation' : 'Play 3D Cryostat animation'}
        className="absolute bottom-2 right-2.5 px-2.5 py-0.5 bg-black/85 hover:bg-slate-800 text-cern-cyan border border-cern-cyan/60 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </button>
    </div>
  );
};
