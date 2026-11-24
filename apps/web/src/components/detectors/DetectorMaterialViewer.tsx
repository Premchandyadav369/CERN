'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Rotate3d,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Zap,
  Info,
  Shield,
  ExternalLink,
  Sliders,
  Compass,
  Cpu,
} from 'lucide-react';
import { Eli5Card } from '@/components/ui/Eli5Card';

export type MaterialType = 'pbwo4' | 'lar' | 'nb3sn';

interface Atom3D {
  x: number; // in lattice units [-1, 1]
  y: number;
  z: number;
  element: string;
  color: string;
  radius: number; // screen radius base
  label: string;
}

interface Bond3D {
  from: number;
  to: number;
  color: string;
}

interface AccordionPlane3D {
  points: [number, number, number][];
  color: string;
}

interface MaterialInfo {
  name: string;
  subsystem: string;
  crystalSystem: string;
  density: string;
  radiationLengthX0: number; // cm
  moliereRadius: number; // cm
  criticalEnergyEc: number; // MeV
  decayTime?: string;
  refractiveIndex?: string;
  totalInstalled?: string;
  driftVelocity?: string;
  operatingTemp?: string;
  gapThickness?: string;
  totalVolume?: string;
  latticeParam?: string;
  criticalFieldBc2?: string;
  criticalTempTc?: string;
  operatingDipoleField?: string;
  thermalTreatment?: string;
  color: string;
  description: string;
}

export const DetectorMaterialViewer: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>('pbwo4');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [showUnitCell, setShowUnitCell] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [particleEnergyGev, setParticleEnergyGev] = useState<number>(50); // 50 GeV photon/electron
  const [particleType, setParticleType] = useState<'photon' | 'electron'>('photon');
  const [isShowerActive, setIsShowerActive] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<{ theta: number; phi: number }>({ theta: 0.6, phi: 0.35 });
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const showerParticlesRef = useRef<{ x: number; y: number; z: number; color: string; life: number }[]>([]);

  // Material physics constants
  const materialData: Record<MaterialType, MaterialInfo> = {
    pbwo4: {
      name: 'CMS Lead Tungstate (PbWO₄)',
      subsystem: 'CMS Electromagnetic Calorimeter (ECAL)',
      crystalSystem: 'Tetragonal Scheelite (Space Group I4₁/a)',
      density: '8.28 g/cm³',
      radiationLengthX0: 0.89, // cm
      moliereRadius: 2.2, // cm
      criticalEnergyEc: 8.7, // MeV
      decayTime: '10 ns (80% light in 25 ns)',
      refractiveIndex: '2.16',
      totalInstalled: '75,848 precision crystals',
      color: 'text-cern-cyan',
      description:
        'High-density, fast scintillating crystal used in the CMS ECAL. Short radiation length (0.89 cm) and small Molière radius (2.2 cm) allow compact containment of electromagnetic showers from Higgs diphoton decays (H → γγ).',
    },
    lar: {
      name: 'ATLAS Liquid Argon Calorimeter Cell',
      subsystem: 'ATLAS LAr Electromagnetic & Hadronic Endcap',
      crystalSystem: 'Noble Liquid Atomic Matrix (T = 88.0 K)',
      density: '1.396 g/cm³',
      radiationLengthX0: 14.0, // cm
      moliereRadius: 9.04, // cm
      criticalEnergyEc: 32.8, // MeV
      driftVelocity: '4.75 mm/µs (at E = 10 kV/cm, 88 K)',
      operatingTemp: '88.0 K (-185.15 °C cryogenic)',
      gapThickness: '2.1 mm accordion drift gap',
      totalVolume: '85,000 liters of cryo-cooled LAr',
      color: 'text-sky-400',
      description:
        'Noble liquid sampling calorimeter using accordion-folded copper-kapton electrodes. Radiation-tolerant liquid medium with linear ionisation response and high electron mobility for high-energy electron and photon tracking.',
    },
    nb3sn: {
      name: 'High-Field Superconducting Nb₃Sn vs NbTi',
      subsystem: 'HL-LHC Interaction Region & FCC-hh 16 T Dipoles',
      crystalSystem: 'A15 Phase Intermetallic Cubic (Space Group Pm3̅n)',
      density: '8.91 g/cm³',
      radiationLengthX0: 1.15, // cm
      moliereRadius: 2.1, // cm
      criticalEnergyEc: 12.2, // MeV
      latticeParam: 'a = 0.529 nm',
      criticalFieldBc2: '25.0 T (at 1.9 K) vs 14.5 T (8.33 T operational) for NbTi',
      criticalTempTc: '18.3 K vs 9.2 K for NbTi',
      operatingDipoleField: '16.0 Tesla (FCC-hh) vs 8.33 Tesla (LHC NbTi)',
      thermalTreatment: 'Reaction bake: 650°C for 200 hours in vacuum',
      color: 'text-amber-400',
      description:
        'A15 cubic intermetallic superconductor with orthogonal linear Niobium chains along cube faces. Enables next-generation 16 Tesla bending dipoles for the 100 TeV Future Circular Collider (FCC-hh), far exceeding the 8.33 T limit of current NbTi magnets.',
    },
  };

  const currentMat = materialData[selectedMaterial];

  // EM Shower Calculator results
  const showerMetrics = useMemo(() => {
    const x0 = currentMat.radiationLengthX0;
    const ec = currentMat.criticalEnergyEc;
    const energyMev = particleEnergyGev * 1000;

    // Shower maximum: t_max = ln(E/Ec) - C where C = 0.5 for photons, 1.0 for electrons
    const cVal = particleType === 'photon' ? 0.5 : 1.0;
    const tMaxInX0 = Math.max(1, Math.log(energyMev / ec) - cVal);
    const tMaxInCm = tMaxInX0 * x0;

    // 95% longitudinal shower containment depth: L_95% = t_max + 12 X0
    const containmentInX0 = tMaxInX0 + 12.0;
    const containmentInCm = containmentInX0 * x0;

    return {
      tMaxInX0: tMaxInX0.toFixed(1),
      tMaxInCm: tMaxInCm.toFixed(1),
      containmentInX0: containmentInX0.toFixed(1),
      containmentInCm: containmentInCm.toFixed(1),
    };
  }, [particleEnergyGev, particleType, currentMat]);

  // Construct 3D lattice points for each material
  const latticeData = useMemo(() => {
    const atoms: Atom3D[] = [];
    const bonds: Bond3D[] = [];
    const accordionPlanes: AccordionPlane3D[] = [];

    if (selectedMaterial === 'pbwo4') {
      // Tetragonal Scheelite unit cell (c/a ~ 2.2)
      // Pb atoms (corners + center + body)
      const pbPositions = [
        [-0.55, -0.55, -0.85],
        [0.55, -0.55, -0.85],
        [0.55, 0.55, -0.85],
        [-0.55, 0.55, -0.85],
        [-0.55, -0.55, 0.85],
        [0.55, -0.55, 0.85],
        [0.55, 0.55, 0.85],
        [-0.55, 0.55, 0.85],
        [0, 0, 0],
      ];
      pbPositions.forEach(([x, y, z]) => {
        atoms.push({
          x,
          y,
          z,
          element: 'Pb',
          color: '#00E5FF', // Bright cyan for Lead
          radius: 12,
          label: 'Pb²⁺ (Lead Ion)',
        });
      });

      // Tungsten atoms (tetrahedral centers)
      const wPositions = [
        [0, 0.3, -0.45],
        [0, -0.3, 0.45],
        [0.3, 0, 0.45],
        [-0.3, 0, -0.45],
      ];
      wPositions.forEach(([x, y, z]) => {
        const wIdx = atoms.length;
        atoms.push({
          x,
          y,
          z,
          element: 'W',
          color: '#FFE600', // Gold for Tungsten
          radius: 10,
          label: 'W⁶⁺ (Tungsten Ion)',
        });

        // 4 Oxygen atoms surrounding each W in tetrahedral coordination
        const oOffsets = [
          [0.16, 0.16, 0.16],
          [-0.16, -0.16, 0.16],
          [0.16, -0.16, -0.16],
          [-0.16, 0.16, -0.16],
        ];
        oOffsets.forEach(([ox, oy, oz]) => {
          const oIdx = atoms.length;
          atoms.push({
            x: x + ox,
            y: y + oy,
            z: z + oz,
            element: 'O',
            color: '#FF0055', // Magenta-red for Oxygen
            radius: 6,
            label: 'O²⁻ (Oxygen Ion)',
          });
          bonds.push({ from: wIdx, to: oIdx, color: '#f59e0b' });
        });
      });
    } else if (selectedMaterial === 'lar') {
      // ATLAS Liquid Argon accordion calorimeter cell
      // Accordion zigzag copper/kapton electrode plates
      const accordionZ = [-0.6, 0, 0.6];
      accordionZ.forEach((zVal) => {
        accordionPlanes.push({
          points: [
            [-0.8, -0.6, zVal],
            [-0.3, -0.2, zVal],
            [0.2, -0.6, zVal],
            [0.7, -0.2, zVal],
          ],
          color: 'rgba(255, 230, 0, 0.55)',
        });
        accordionPlanes.push({
          points: [
            [-0.8, 0.4, zVal],
            [-0.3, 0.8, zVal],
            [0.2, 0.4, zVal],
            [0.7, 0.8, zVal],
          ],
          color: 'rgba(56, 189, 248, 0.55)',
        });
      });

      // Liquid Argon atoms in cryogenic matrix
      for (let ix = -3; ix <= 3; ix++) {
        for (let iy = -2; iy <= 2; iy++) {
          for (let iz = -2; iz <= 2; iz++) {
            const jitterX = Math.sin(ix * 3 + iy * 2 + iz) * 0.08;
            const jitterY = Math.cos(iy * 4 + iz * 2 + ix) * 0.08;
            const jitterZ = Math.sin(iz * 5 + ix * 2) * 0.08;
            atoms.push({
              x: (ix / 3.5) * 0.72 + jitterX,
              y: (iy / 2.5) * 0.62 + jitterY,
              z: (iz / 2.5) * 0.62 + jitterZ,
              element: 'Ar',
              color: '#38BDF8',
              radius: 6.5,
              label: 'Liquid Argon Atom (88 K)',
            });
          }
        }
      }
    } else {
      // Nb3Sn A15 Cubic Phase
      // Sn atoms at BCC corners and body center
      const snPositions = [
        [-0.7, -0.7, -0.7],
        [0.7, -0.7, -0.7],
        [0.7, 0.7, -0.7],
        [-0.7, 0.7, -0.7],
        [-0.7, -0.7, 0.7],
        [0.7, -0.7, 0.7],
        [0.7, 0.7, 0.7],
        [-0.7, 0.7, 0.7],
        [0, 0, 0],
      ];
      snPositions.forEach(([x, y, z]) => {
        atoms.push({
          x,
          y,
          z,
          element: 'Sn',
          color: '#E0E7FF', // Silver-white for Tin
          radius: 12,
          label: 'Sn (Tin BCC site)',
        });
      });

      // Orthogonal Nb chains crossing each of the 6 cube faces
      const nbPairs = [
        // Face +/- X (crossing in Y direction)
        { x: 0.7, y: -0.35, z: 0 },
        { x: 0.7, y: 0.35, z: 0 },
        { x: -0.7, y: -0.35, z: 0 },
        { x: -0.7, y: 0.35, z: 0 },
        // Face +/- Y (crossing in Z direction)
        { x: 0, y: 0.7, z: -0.35 },
        { x: 0, y: 0.7, z: 0.35 },
        { x: 0, y: -0.7, z: -0.35 },
        { x: 0, y: -0.7, z: 0.35 },
        // Face +/- Z (crossing in X direction)
        { x: -0.35, y: 0, z: 0.7 },
        { x: 0.35, y: 0, z: 0.7 },
        { x: -0.35, y: 0, z: -0.7 },
        { x: 0.35, y: 0, z: -0.7 },
      ];

      nbPairs.forEach((pos) => {
        atoms.push({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          element: 'Nb',
          color: '#00E5FF', // Bright cyan for Niobium
          radius: 9,
          label: 'Nb (Niobium orthogonal chain, 16 T superconductor)',
        });
      });

      // Connect adjacent Nb atoms into chains
      for (let i = 9; i < atoms.length; i += 2) {
        if (i + 1 < atoms.length) {
          bonds.push({ from: i, to: i + 1, color: '#00E5FF' });
        }
      }
    }

    return { atoms, bonds, accordionPlanes };
  }, [selectedMaterial]);

  // Main 3D rendering loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Auto rotation update
      if (isAutoRotating && !isDraggingRef.current) {
        rotationRef.current.theta += 0.007;
      }

      const { theta, phi } = rotationRef.current;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      const focalLength = 480 * zoomLevel;
      const cameraDistance = 2.8;

      // Project 3D point (x, y, z) to 2D screen coordinates
      const project = (x: number, y: number, z: number) => {
        // Rotation around Y (theta)
        const x1 = x * cosT - z * sinT;
        const z1 = x * sinT + z * cosT;

        // Rotation around X (phi)
        const y2 = y * cosP - z1 * sinP;
        const z2 = y * sinP + z1 * cosP;

        const distance = z2 + cameraDistance;
        const scale = focalLength / Math.max(0.2, distance);

        return {
          screenX: cx + x1 * scale,
          screenY: cy + y2 * scale,
          depth: z2,
          scale,
        };
      };

      // Draw Unit Cell Bounding Wireframe Box
      if (showUnitCell) {
        // Tetragonal aspect ratio (c/a ~ 1.5 visually) for PbWO4, cubic for others
        const zHalf = selectedMaterial === 'pbwo4' ? 0.95 : 0.75;
        const xyHalf = selectedMaterial === 'pbwo4' ? 0.65 : 0.75;

        const boxCorners = [
          [-xyHalf, -xyHalf, -zHalf],
          [xyHalf, -xyHalf, -zHalf],
          [xyHalf, xyHalf, -zHalf],
          [-xyHalf, xyHalf, -zHalf],
          [-xyHalf, -xyHalf, zHalf],
          [xyHalf, -xyHalf, zHalf],
          [xyHalf, xyHalf, zHalf],
          [-xyHalf, xyHalf, zHalf],
        ];

        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0], // back face
          [4, 5], [5, 6], [6, 7], [7, 4], // front face
          [0, 4], [1, 5], [2, 6], [3, 7], // connecting edges
        ];

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);

        edges.forEach(([i1, i2]) => {
          const p1 = project(boxCorners[i1][0], boxCorners[i1][1], boxCorners[i1][2]);
          const p2 = project(boxCorners[i2][0], boxCorners[i2][1], boxCorners[i2][2]);
          ctx.beginPath();
          ctx.moveTo(p1.screenX, p1.screenY);
          ctx.lineTo(p2.screenX, p2.screenY);
          ctx.stroke();
        });
        ctx.setLineDash([]);
      }

      // Draw Accordion Electrode Planes for LAr
      if (selectedMaterial === 'lar' && latticeData.accordionPlanes) {
        latticeData.accordionPlanes.forEach((plane) => {
          ctx.strokeStyle = plane.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          plane.points.forEach((pt, pIdx) => {
            const p = project(pt[0], pt[1], pt[2]);
            if (pIdx === 0) ctx.moveTo(p.screenX, p.screenY);
            else ctx.lineTo(p.screenX, p.screenY);
          });
          ctx.stroke();
        });
      }

      // Draw Bonds
      latticeData.bonds.forEach((bond) => {
        const a1 = latticeData.atoms[bond.from];
        const a2 = latticeData.atoms[bond.to];
        if (!a1 || !a2) return;

        const p1 = project(a1.x, a1.y, a1.z);
        const p2 = project(a2.x, a2.y, a2.z);

        ctx.strokeStyle = bond.color;
        ctx.lineWidth = 2.5 * Math.min(p1.scale, p2.scale) * 0.005;
        ctx.beginPath();
        ctx.moveTo(p1.screenX, p1.screenY);
        ctx.lineTo(p2.screenX, p2.screenY);
        ctx.stroke();
      });

      // Prepare atoms for Depth Sorting (Painter's algorithm)
      const projectedAtoms = latticeData.atoms.map((atom) => {
        const proj = project(atom.x, atom.y, atom.z);
        return {
          ...atom,
          ...proj,
        };
      });

      // Sort back-to-front (largest depth first)
      projectedAtoms.sort((a, b) => b.depth - a.depth);

      // Render Atoms
      projectedAtoms.forEach((atom) => {
        const radius = Math.max(3, atom.radius * atom.scale * 0.005);

        // Specular gradient sphere
        const grad = ctx.createRadialGradient(
          atom.screenX - radius * 0.3,
          atom.screenY - radius * 0.3,
          radius * 0.1,
          atom.screenX,
          atom.screenY,
          radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, atom.color);
        grad.addColorStop(1, '#05070a');

        ctx.beginPath();
        ctx.arc(atom.screenX, atom.screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Render Active EM Shower particle animation
      if (showerParticlesRef.current.length > 0) {
        showerParticlesRef.current = showerParticlesRef.current.filter((p) => p.life > 0);
        showerParticlesRef.current.forEach((p) => {
          p.x += (Math.random() - 0.5) * 0.03;
          p.y += (Math.random() - 0.5) * 0.03;
          p.z += 0.02; // penetrate deeper
          p.life -= 0.02;

          const proj = project(p.x, p.y, p.z);
          ctx.beginPath();
          ctx.arc(proj.screenX, proj.screenY, 3 * proj.scale * 0.005, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [latticeData, isAutoRotating, showUnitCell, zoomLevel, selectedMaterial]);

  // Pointer drag interactions (works for both touch and mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    rotationRef.current.theta += deltaX * 0.008;
    rotationRef.current.phi = Math.max(-1.4, Math.min(1.4, rotationRef.current.phi + deltaY * 0.008));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const triggerShowerSimulation = () => {
    setIsShowerActive(true);
    const newParticles: { x: number; y: number; z: number; color: string; life: number }[] = [];
    for (let i = 0; i < 45; i++) {
      newParticles.push({
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: -0.8 + (Math.random() - 0.5) * 0.2,
        color: selectedMaterial === 'pbwo4' ? '#00E5FF' : selectedMaterial === 'lar' ? '#FFE600' : '#FF0055',
        life: 1.0,
      });
    }
    showerParticlesRef.current = newParticles;
    setTimeout(() => setIsShowerActive(false), 2000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ELI5 Pedagogy Card */}
      <Eli5Card
        title="Atomic armor and quantum superhighways: How crystals turn ghost particles into light, and superconductors channel lightning without losing energy"
        analogy="Inside CMS, 75,000 lead tungstate crystals catch high-speed photons and turn them into tiny flashes of blue light in 25 billionths of a second. Meanwhile, in the accelerator tunnel, superconducting Nb3Sn crystals form zero-resistance quantum superhighways that bend 7-TeV proton beams with giant 16-Tesla magnetic fields without generating any heat."
        keyPoints={[
          "Lead Tungstate (PbWO₄): Exceptionally dense (8.28 g/cm³) crystal that absorbs high-energy photons in just a few centimeters (X₀ = 0.89 cm, R_M = 2.2 cm).",
          "Liquid Argon (LAr): Pure cryogenic liquid at 88 Kelvin where knocked-out electrons drift at 4.75 mm/µs through an accordion electric field like a digital camera sensor.",
          "Nb₃Sn Superconductors: A15 cubic crystal lattice with orthogonal niobium chains, capable of sustaining 16 to 25 Tesla magnetic fields at 1.9 Kelvin."
        ]}
        whatToTry="Click and drag to rotate the 3D unit cell in real-time. Switch between PbWO₄, Liquid Argon, and Nb₃Sn, and click 'Simulate Shower' to watch radiation length containment!"
        doi="10.1109/TNS.2022.3168921"
        arxivId="1905.05078"
        citationLabel="IEEE Transactions on Nuclear Science • CERN Materials Research"
      />

      {/* Main 3D Inspector Frame */}
      <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        {/* LEFT: 3D Canvas Viewport */}
        <div className="flex-1 flex flex-col bg-canvas border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 space-y-4">
          {/* Header & Material Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <Rotate3d className="w-4 h-4 text-cern-cyan" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-text-primary font-bold">
                INTERACTIVE 3D LATTICE &amp; DETECTOR MATERIAL PHYSICS
              </h3>
            </div>

            {/* Material Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <button
                onClick={() => setSelectedMaterial('pbwo4')}
                className={`px-3 py-1 font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                  selectedMaterial === 'pbwo4'
                    ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-canvas-sub text-text-secondary hover:text-white'
                }`}
              >
                CMS PbWO₄ Crystal
              </button>
              <button
                onClick={() => setSelectedMaterial('lar')}
                className={`px-3 py-1 font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                  selectedMaterial === 'lar'
                    ? 'bg-sky-400 text-black shadow-[2px_2px_0px_#000] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-canvas-sub text-text-secondary hover:text-white'
                }`}
              >
                ATLAS Liquid Argon
              </button>
              <button
                onClick={() => setSelectedMaterial('nb3sn')}
                className={`px-3 py-1 font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                  selectedMaterial === 'nb3sn'
                    ? 'bg-amber-300 text-black shadow-[2px_2px_0px_#000] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-canvas-sub text-text-secondary hover:text-white'
                }`}
              >
                16 T Nb₃Sn Superconductor
              </button>
            </div>
          </div>

          {/* 3D Interactive Canvas with Pointer Capture */}
          <div className="relative w-full aspect-[16/10] min-h-[360px] border-2 border-black shadow-[4px_4px_0px_#000] bg-[#07090e] overflow-hidden select-none">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
            />

            {/* In-Canvas Floating Controls */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 bg-black/80 text-cern-cyan font-bold border border-black shadow-[2px_2px_0px_#000]">
                {currentMat.name}
              </span>
              <span className="px-2 py-0.5 bg-black/80 text-text-muted border border-black text-[11px]">
                Drag to rotate 3D unit cell
              </span>
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className="px-2.5 py-1 bg-canvas-surface hover:bg-black text-white font-mono text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
                title="Toggle 3D auto rotation"
              >
                {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-cern-cyan" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isAutoRotating ? 'Pause' : 'Rotate'}</span>
              </button>

              <button
                onClick={() => setShowUnitCell(!showUnitCell)}
                className={`px-2.5 py-1 font-mono text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] transition-colors cursor-pointer ${
                  showUnitCell ? 'bg-amber-300 text-black' : 'bg-canvas-surface text-text-muted'
                }`}
                title="Toggle unit cell bounding box"
              >
                Unit Cell
              </button>

              <button
                onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
                className="p-1 bg-canvas-surface hover:bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                className="p-1 bg-canvas-surface hover:bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Particle Shower Trigger Button */}
            <div className="absolute top-3 right-3">
              <button
                onClick={triggerShowerSimulation}
                disabled={isShowerActive}
                className="px-3 py-1.5 bg-cern-blue hover:bg-cern-accent text-white font-mono text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-cern-cyan" />
                <span>Simulate Shower</span>
              </button>
            </div>
          </div>

          {/* Description & Subsystem Context */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] space-y-1 text-xs font-mono">
            <span className="text-[10px] text-text-muted uppercase font-bold block">
              Subsystem &amp; Experimental Context
            </span>
            <p className="text-text-secondary leading-relaxed font-sans text-xs">
              {currentMat.description}
            </p>
          </div>
        </div>

        {/* RIGHT: Material Physics Telemetry & Shower Depth Calculator */}
        <div className="w-full xl:w-96 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cern-cyan" /> Material Physics Parameters
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-cern-cyan font-bold border border-black shadow-[1px_1px_0px_#000]">
                BENCHMARK
              </span>
            </div>

            {/* Material Specific Metrics Table */}
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-black/30">
                <span className="text-text-muted font-bold">Crystal Structure:</span>
                <span className="text-white font-bold truncate max-w-[170px]">{currentMat.crystalSystem}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/30">
                <span className="text-text-muted font-bold">Medium Density:</span>
                <span className="text-cern-cyan font-bold">{currentMat.density}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/30">
                <span className="text-text-muted font-bold">Radiation Length (X₀):</span>
                <span className="text-amber-300 font-bold">{currentMat.radiationLengthX0} cm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/30">
                <span className="text-text-muted font-bold">Molière Radius (R_M):</span>
                <span className="text-emerald-400 font-bold">{currentMat.moliereRadius} cm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/30">
                <span className="text-text-muted font-bold">Critical Energy (E_c):</span>
                <span className="text-pink-400 font-bold">{currentMat.criticalEnergyEc} MeV</span>
              </div>

              {/* Material-Specific Deep Telemetry */}
              {selectedMaterial === 'lar' && (
                <>
                  <div className="flex justify-between py-1 border-b border-black/30">
                    <span className="text-text-muted font-bold">Drift Velocity (v_d):</span>
                    <span className="text-emerald-400 font-bold">{currentMat.driftVelocity}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/30">
                    <span className="text-text-muted font-bold">Cryogenic Temperature:</span>
                    <span className="text-sky-300 font-bold">{currentMat.operatingTemp}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted font-bold">Accordion Drift Gap:</span>
                    <span className="text-white font-bold">{currentMat.gapThickness}</span>
                  </div>
                </>
              )}

              {selectedMaterial === 'nb3sn' && (
                <>
                  <div className="flex justify-between py-1 border-b border-black/30">
                    <span className="text-text-muted font-bold">Critical Field (B_c2):</span>
                    <span className="text-amber-300 font-bold">{currentMat.criticalFieldBc2}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/30">
                    <span className="text-text-muted font-bold">Critical Temp (T_c):</span>
                    <span className="text-emerald-400 font-bold">{currentMat.criticalTempTc}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted font-bold">Operating Dipole Field:</span>
                    <span className="text-cern-cyan font-bold">{currentMat.operatingDipoleField}</span>
                  </div>
                </>
              )}

              {selectedMaterial === 'pbwo4' && (
                <>
                  <div className="flex justify-between py-1 border-b border-black/30">
                    <span className="text-text-muted font-bold">Scintillation Decay:</span>
                    <span className="text-emerald-400 font-bold">{currentMat.decayTime}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted font-bold">Refractive Index:</span>
                    <span className="text-white font-bold">n = {currentMat.refractiveIndex}</span>
                  </div>
                </>
              )}
            </div>

            {/* Electromagnetic Shower Depth Calculator */}
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" /> EM Shower Calculator
                </span>
                <span className="text-[10px] font-mono bg-black text-amber-300 px-1.5 py-0.5 border border-black font-bold">
                  ROSSI APPROX B
                </span>
              </div>

              {/* Particle Type Toggle */}
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setParticleType('photon')}
                  className={`py-1 text-center font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                    particleType === 'photon'
                      ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-canvas-surface text-text-secondary'
                  }`}
                >
                  Photon (γ)
                </button>
                <button
                  onClick={() => setParticleType('electron')}
                  className={`py-1 text-center font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                    particleType === 'electron'
                      ? 'bg-cern-magenta text-white shadow-[2px_2px_0px_#000]'
                      : 'bg-canvas-surface text-text-secondary'
                  }`}
                >
                  Electron (e⁻/e⁺)
                </button>
              </div>

              {/* Energy Slider */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between font-bold">
                  <span className="text-text-muted uppercase">Incident Energy:</span>
                  <span className="text-cern-cyan">{particleEnergyGev} GeV</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={250}
                  step={5}
                  value={particleEnergyGev}
                  onChange={(e) => setParticleEnergyGev(Number(e.target.value))}
                  className="w-full accent-cern-cyan cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-bold">
                  <span>5 GeV</span>
                  <span>250 GeV (Higgs diphoton)</span>
                </div>
              </div>

              {/* Computed Shower Results */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 bg-canvas-surface border border-black shadow-[1px_1px_0px_#000]">
                  <span className="text-[10px] text-text-muted font-bold block uppercase">Shower Max (t_max)</span>
                  <div className="text-sm font-bold text-[#FFE600] mt-0.5">
                    {showerMetrics.tMaxInCm} cm
                  </div>
                  <span className="text-[10px] text-text-muted block">({showerMetrics.tMaxInX0} X₀)</span>
                </div>

                <div className="p-2 bg-canvas-surface border border-black shadow-[1px_1px_0px_#000]">
                  <span className="text-[10px] text-text-muted font-bold block uppercase">95% Containment</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {showerMetrics.containmentInCm} cm
                  </div>
                  <span className="text-[10px] text-text-muted block">({showerMetrics.containmentInX0} X₀)</span>
                </div>
              </div>
            </div>

            {/* Superconducting Comparison Banner (for Nb3Sn) */}
            {selectedMaterial === 'nb3sn' && (
              <div className="p-3 bg-amber-400 text-black border-2 border-black shadow-[3px_3px_0px_#000] space-y-1 text-xs font-mono">
                <strong className="block uppercase font-black">/// FCC-hh 16 Tesla Magnet Upgrade ///</strong>
                <p className="text-[11px] leading-snug">
                  Current LHC NbTi magnets are limited to 8.33 T at 1.9 K. Switching to A15 Nb₃Sn pushes
                  dipole fields to 16 T, reaching 100 TeV center-of-mass energy in a 91 km tunnel.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t-2 border-black text-[11px] font-mono text-text-muted flex justify-between">
            <span>CMS ECAL Crystal Length: 23.0 cm (25.8 X₀)</span>
            <Link href="/detectors" className="text-cern-cyan underline font-bold">
              View Detector Twins
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
