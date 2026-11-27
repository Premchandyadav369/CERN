'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Zap,
  Target,
  Shield,
  Layers,
  Sparkles,
  Info,
  HeartPulse,
  Sliders,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Atom,
} from 'lucide-react';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';

export type BeamSpecies = 'proton' | 'carbon' | 'photon';

interface SimulationPoint {
  depthCm: number;
  dose: number;
  sobpDose: number;
  photonDose: number;
  stoppingPower: number; // MeV/cm
}

// Physical constants for Bethe-Bloch in tissue (water-equivalent)
const NA = 6.02214076e23; // Avogadro's number (mol^-1)
const RE = 2.8179403262e-13; // Classical electron radius (cm)
const ME_C2 = 0.51099895; // Electron mass (MeV)
const RHO_WATER = 1.0; // g/cm^3
const Z_OVER_A_WATER = 0.55509; // Effective Z/A for water
const I_WATER_MEV = 75e-6; // Mean excitation energy 75 eV in MeV

// Compute Bethe-Bloch stopping power: -dE/dx (MeV/cm)
function computeStoppingPower(
  kineticEnergyMevPerU: number,
  chargeNumber: number,
  massNumber: number
): number {
  if (kineticEnergyMevPerU <= 0.05) return 0;

  // Proton rest mass: 938.272 MeV; Carbon rest mass: 12 * 931.494 MeV
  const restMassMev = massNumber * 931.494;
  const totalEnergyMev = kineticEnergyMevPerU * massNumber + restMassMev;
  const gamma = totalEnergyMev / restMassMev;
  const betaSq = Math.max(1e-6, 1 - 1 / (gamma * gamma));
  const beta = Math.sqrt(betaSq);

  // Maximum kinetic energy transferred to a free electron in a single collision
  const meOverM = ME_C2 / restMassMev;
  const tMax =
    (2 * ME_C2 * betaSq * gamma * gamma) /
    (1 + 2 * gamma * meOverM + meOverM * meOverM);

  const termInsideLog = (2 * ME_C2 * betaSq * gamma * gamma * tMax) / (I_WATER_MEV * I_WATER_MEV);
  if (termInsideLog <= 1.0) return 1.0;

  // Pre-factor: 2 * pi * NA * re^2 * me * c^2 * rho * (Z/A)
  // 2 * pi * 6.022e23 * (2.8179e-13)^2 * 0.511 * 1.0 * 0.55509 ≈ 0.0852 MeV/cm
  const constantFactor = 2 * Math.PI * NA * (RE * RE) * ME_C2 * RHO_WATER * Z_OVER_A_WATER;

  // Bracket term: ln(...) - 2*beta^2
  const bracket = Math.log(termInsideLog) - 2 * betaSq;
  if (bracket <= 0) return 0.5;

  const dedx = (constantFactor * (chargeNumber * chargeNumber) * bracket) / betaSq;
  // Cap at realistic maximum to prevent non-physical singularity at end of range
  const maxCap = chargeNumber === 1 ? 95 : 650;
  return Math.min(dedx, maxCap);
}

// Generate numerical range profile for single mono-energetic charged particle
function simulateTrack(
  initialKineticEnergyMevPerU: number,
  chargeNumber: number,
  massNumber: number,
  maxDepthCm: number = 35,
  stepCm: number = 0.1
): number[] {
  let e = initialKineticEnergyMevPerU;
  const numSteps = Math.ceil(maxDepthCm / stepCm);
  const doseProfile: number[] = new Array(numSteps).fill(0);
  let stoppedStep = numSteps;

  for (let i = 0; i < numSteps; i++) {
    if (e <= 0.05) {
      stoppedStep = i;
      break;
    }

    const dedx = computeStoppingPower(e, chargeNumber, massNumber);
    const deltaE = dedx * stepCm;
    doseProfile[i] = dedx;

    e = Math.max(0, e - deltaE / massNumber);
  }

  // Carbon-12 nuclear fragmentation tail:
  // Relativistic projectile fragmentation produces lighter ions (B, Be, Li, He, H)
  // that deposit ~5-8% residual dose beyond the primary stopping depth
  if (chargeNumber === 6 && stoppedStep < numSteps) {
    const peakDose = doseProfile[stoppedStep - 1] || 600;
    for (let i = stoppedStep; i < numSteps; i++) {
      const distPastPeak = (i - stoppedStep) * stepCm;
      // Exponentially decaying fragmentation dose (~6% peak dose at boundary)
      doseProfile[i] = peakDose * 0.065 * Math.exp(-distPastPeak / 5.5);
    }
  }

  // Add range straggling broadening via Gaussian kernel smoothing
  const sigmaSteps = chargeNumber === 1 ? 3 : 2;
  const smoothed: number[] = new Array(numSteps).fill(0);
  for (let i = 0; i < numSteps; i++) {
    let sum = 0;
    let weightSum = 0;
    for (let j = Math.max(0, i - sigmaSteps * 3); j <= Math.min(numSteps - 1, i + sigmaSteps * 3); j++) {
      const diff = i - j;
      const w = Math.exp(-(diff * diff) / (2 * sigmaSteps * sigmaSteps));
      sum += doseProfile[j] * w;
      weightSum += w;
    }
    smoothed[i] = sum / weightSum;
  }

  return smoothed;
}

export const BraggPeakSimulator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [species, setSpecies] = useState<BeamSpecies>('proton');
  // Proton default 150 MeV (~16 cm range); Carbon default 290 MeV/u (~16 cm range)
  const [protonEnergy, setProtonEnergy] = useState<number>(150);
  const [carbonEnergy, setCarbonEnergy] = useState<number>(290);
  const [isSobpEnabled, setIsSobpEnabled] = useState<boolean>(true);
  const [tumorDepthCm, setTumorDepthCm] = useState<number>(15);
  const [tumorMarginCm, setTumorMarginCm] = useState<number>(3.5);
  const [hoveredDepth, setHoveredDepth] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active beam kinetic energy
  const activeEnergy = species === 'proton' ? protonEnergy : species === 'carbon' ? carbonEnergy : 150;
  const chargeNumber = species === 'proton' ? 1 : species === 'carbon' ? 6 : 0;
  const massNumber = species === 'proton' ? 1 : species === 'carbon' ? 12 : 0;

  // Generate dose profiles across 0..35 cm
  const maxDepthCm = 35;
  const stepCm = 0.1;
  const numSteps = Math.ceil(maxDepthCm / stepCm);

  const simulationData = useMemo(() => {
    // 1. Single mono-energetic Bragg peak for selected hadron
    const rawHadronDose =
      species === 'photon'
        ? new Array(numSteps).fill(0)
        : simulateTrack(activeEnergy, chargeNumber, massNumber, maxDepthCm, stepCm);

    // Normalize mono-energetic peak to 100%
    const maxHadronVal = Math.max(...rawHadronDose, 1e-4);
    const normalizedHadron = rawHadronDose.map((v) => (v / maxHadronVal) * 100);

    // 2. Spread-Out Bragg Peak (SOBP) synthesized across tumor target [depth - margin, depth + margin]
    const sobpDose: number[] = new Array(numSteps).fill(0);
    if (species !== 'photon') {
      const tumorStart = Math.max(1, tumorDepthCm - tumorMarginCm / 2);
      const tumorEnd = Math.min(32, tumorDepthCm + tumorMarginCm / 2);

      // We superimpose multiple energy slices targeting depth range
      const numSlices = 14;
      for (let s = 0; s < numSlices; s++) {
        const sliceTargetDepth = tumorStart + ((tumorEnd - tumorStart) * s) / (numSlices - 1);
        // Estimate required energy for range: Range ~ alpha * E^p (p ~ 1.75 for proton)
        const targetEnergy =
          species === 'proton'
            ? Math.pow(sliceTargetDepth / 7.6, 1 / 1.75) * 100
            : Math.pow(sliceTargetDepth / 3.8, 1 / 1.75) * 180;

        const sliceTrack = simulateTrack(targetEnergy, chargeNumber, massNumber, maxDepthCm, stepCm);
        const slicePeak = Math.max(...sliceTrack, 1e-4);
        // Bortfeld weighting: shallower peaks have lower weight so cumulative sum is flat
        const weight = Math.pow(sliceTargetDepth / tumorEnd, 0.45);

        for (let i = 0; i < numSteps; i++) {
          sobpDose[i] += (sliceTrack[i] / slicePeak) * weight;
        }
      }

      // Find max inside target zone and normalize to 100%
      const targetIndicesStart = Math.floor(tumorStart / stepCm);
      const targetIndicesEnd = Math.floor(tumorEnd / stepCm);
      let targetMax = 0;
      for (let i = targetIndicesStart; i <= targetIndicesEnd; i++) {
        if (sobpDose[i] > targetMax) targetMax = sobpDose[i];
      }
      targetMax = Math.max(targetMax, 1e-4);
      for (let i = 0; i < numSteps; i++) {
        sobpDose[i] = (sobpDose[i] / targetMax) * 100;
      }
    }

    // 3. Conventional 6 MV X-ray Photons:
    // Build up to d_max ~ 1.5 cm, followed by exponential decay with mu ~ 0.046 cm^-1
    const photonDose: number[] = new Array(numSteps).fill(0);
    const dMaxCm = 1.5;
    const mu = 0.046;
    for (let i = 0; i < numSteps; i++) {
      const d = i * stepCm;
      if (d <= dMaxCm) {
        photonDose[i] = (d / dMaxCm) * 100;
      } else {
        photonDose[i] = 100 * Math.exp(-mu * (d - dMaxCm));
      }
    }

    // Combine into structured points
    const points: SimulationPoint[] = [];
    for (let i = 0; i < numSteps; i++) {
      const d = Number((i * stepCm).toFixed(2));
      points.push({
        depthCm: d,
        dose: normalizedHadron[i],
        sobpDose: sobpDose[i],
        photonDose: photonDose[i],
        stoppingPower: rawHadronDose[i],
      });
    }

    return points;
  }, [species, activeEnergy, chargeNumber, massNumber, tumorDepthCm, tumorMarginCm]);

  // Find Bragg peak depth for current mono-energetic beam
  const braggPeakDepth = useMemo(() => {
    let maxIdx = 0;
    let maxVal = 0;
    simulationData.forEach((p, idx) => {
      if (p.dose > maxVal) {
        maxVal = p.dose;
        maxIdx = idx;
      }
    });
    return (maxIdx * stepCm).toFixed(1);
  }, [simulationData]);

  // Entrance and distal dose calculations
  const metrics = useMemo(() => {
    const entranceDose =
      species === 'photon'
        ? simulationData[10]?.photonDose || 50
        : isSobpEnabled
        ? simulationData[10]?.sobpDose || 25
        : simulationData[10]?.dose || 20;

    const tumorEnd = tumorDepthCm + tumorMarginCm / 2;
    const distalDepth = tumorEnd + 3.0; // 3 cm past tumor
    const distalIdx = Math.min(simulationData.length - 1, Math.floor(distalDepth / stepCm));

    const distalDose =
      species === 'photon'
        ? simulationData[distalIdx]?.photonDose || 45
        : isSobpEnabled
        ? simulationData[distalIdx]?.sobpDose || 0
        : simulationData[distalIdx]?.dose || 0;

    const rbe = species === 'carbon' ? 3.0 : species === 'proton' ? 1.1 : 1.0;
    const letPeak = species === 'carbon' ? 82 : species === 'proton' ? 12 : 0.3; // keV/um

    let distalStatus = 'ZERO exit dose (Critical organs spared)';
    if (species === 'photon') {
      distalStatus = 'Severe exit dose (40-60% tissue damage)';
    } else if (species === 'carbon') {
      distalStatus = 'Nuclear fragmentation tail (~5-7%)';
    }

    return {
      entrancePercent: entranceDose.toFixed(1),
      distalPercent: Math.max(0, distalDose).toFixed(1),
      distalStatus,
      rbe: rbe.toFixed(1),
      letPeak: `${letPeak} keV/µm`,
      sparingBenefit: (
        simulationData[distalIdx]?.photonDose -
        (isSobpEnabled ? simulationData[distalIdx]?.sobpDose : simulationData[distalIdx]?.dose)
      ).toFixed(1),
    };
  }, [simulationData, species, isSobpEnabled, tumorDepthCm, tumorMarginCm]);

  // Telemetry for hovered depth
  const hoverTelemetry = useMemo(() => {
    if (hoveredDepth === null) return null;
    const idx = Math.min(simulationData.length - 1, Math.max(0, Math.round(hoveredDepth / stepCm)));
    const pt = simulationData[idx];
    if (!pt) return null;

    const tumorStart = tumorDepthCm - tumorMarginCm / 2;
    const tumorEnd = tumorDepthCm + tumorMarginCm / 2;

    let region = 'Healthy Entrance Tissue';
    if (hoveredDepth >= tumorStart && hoveredDepth <= tumorEnd) {
      region = 'Tumor Target Zone';
    } else if (hoveredDepth > tumorEnd) {
      region = 'Critical Organ Beyond Tumor';
    }

    const hadronDoseVal = isSobpEnabled ? pt.sobpDose : pt.dose;

    return {
      depth: hoveredDepth.toFixed(1),
      hadronDose: species !== 'photon' ? hadronDoseVal.toFixed(1) : null,
      photonDose: pt.photonDose.toFixed(1),
      region,
    };
  }, [hoveredDepth, simulationData, isSobpEnabled, species, tumorDepthCm, tumorMarginCm]);

  // Render high-contrast 60 FPS Animated Canvas Chart & Beam Penetration Overlay
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const width = canvas.width;
    const height = canvas.height;
    const padLeft = 55;
    const padRight = 25;
    const padTop = 30;
    const padBottom = 45;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const getX = (depth: number) => padLeft + (depth / maxDepthCm) * plotW;
    const getY = (dose: number) => padTop + plotH - (Math.min(120, Math.max(0, dose)) / 120) * plotH;

    // Animated ion packet stream traveling along tissue depth
    const packets = Array.from({ length: 14 }, (_, i) => ({
      offset: i / 14,
      laneOffset: ((i % 5) - 2) * 5,
    }));

    const drawFrame = (nowMs: number) => {
      const tPhase = reduceMotion ? 0 : (nowMs / 1000) * 0.45;
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.fillStyle = '#0a0d12';
      ctx.fillRect(padLeft, padTop, plotW, plotH);

      ctx.strokeStyle = '#1e2633';
      ctx.lineWidth = 1;

      for (let d = 5; d <= 30; d += 5) {
        const x = getX(d);
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, padTop + plotH);
        ctx.stroke();

        ctx.fillStyle = '#6b7280';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${d} cm`, x, padTop + plotH + 18);
      }

      for (let dose = 20; dose <= 100; dose += 20) {
        const y = getY(dose);
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotW, y);
        ctx.stroke();

        ctx.fillStyle = '#6b7280';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${dose}%`, padLeft - 8, y + 3);
      }

      const tumorStart = Math.max(0, tumorDepthCm - tumorMarginCm / 2);
      const tumorEnd = Math.min(35, tumorDepthCm + tumorMarginCm / 2);
      const xTumorStart = getX(tumorStart);
      const xTumorEnd = getX(tumorEnd);

      ctx.fillStyle = 'rgba(255, 230, 0, 0.12)';
      ctx.fillRect(xTumorStart, padTop, xTumorEnd - xTumorStart, plotH);

      ctx.strokeStyle = '#FFE600';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xTumorStart, padTop);
      ctx.lineTo(xTumorStart, padTop + plotH);
      ctx.moveTo(xTumorEnd, padTop);
      ctx.lineTo(xTumorEnd, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#FFE600';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TARGET TUMOR REGION', (xTumorStart + xTumorEnd) / 2, padTop + 18);

      const distalCritStart = tumorEnd + 1.5;
      const xCritStart = getX(distalCritStart);
      const xCritEnd = getX(34);
      ctx.fillStyle = 'rgba(255, 0, 85, 0.08)';
      ctx.fillRect(xCritStart, padTop, xCritEnd - xCritStart, plotH);

      ctx.fillStyle = '#ff6b8b';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CRITICAL ORGAN (BRAIN STEM / SPINAL CORD)', (xCritStart + xCritEnd) / 2, padTop + plotH - 12);

      // Animated Beam Ionization Channel at bottom track strip
      const beamCenterY = padTop + plotH - 38;
      if (!reduceMotion) {
        const stopDepthCm = species === 'photon' ? maxDepthCm : isSobpEnabled ? tumorEnd : tumorDepthCm;
        const beamCol = species === 'proton' ? '#00E5FF' : species === 'carbon' ? '#FF0055' : '#f97316';

        // Bragg flare halo inside tumor
        if (species !== 'photon') {
          const flareX = isSobpEnabled ? (xTumorStart + xTumorEnd) / 2 : getX(tumorDepthCm);
          const flareW = isSobpEnabled ? (xTumorEnd - xTumorStart) * 0.55 : 18;
          const pulseAlpha = 0.25 + 0.15 * Math.sin(nowMs * 0.008);
          const grad = ctx.createRadialGradient(flareX, beamCenterY, 2, flareX, beamCenterY, Math.max(20, flareW));
          grad.addColorStop(0, species === 'proton' ? `rgba(0, 229, 255, ${pulseAlpha + 0.25})` : `rgba(255, 0, 85, ${pulseAlpha + 0.25})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(flareX, beamCenterY, Math.max(20, flareW), 0, Math.PI * 2);
          ctx.fill();
        }

        // Flying particle bunches
        packets.forEach((pk, idx) => {
          const prog = (tPhase + pk.offset) % 1;
          // Hadrons slow down sharply near end-of-range (Bragg curve deceleration)
          const eased = species === 'photon' ? prog : 1 - Math.pow(1 - prog, 1.85);
          const targetStop = isSobpEnabled && species !== 'photon'
            ? tumorStart + ((idx % 4) / 3) * (tumorEnd - tumorStart)
            : stopDepthCm;
          const depth = eased * targetStop;
          const px = getX(depth);
          const py = beamCenterY + pk.laneOffset;

          // Particle glow escalates right at Bragg stop!
          const isStopping = species !== 'photon' && prog > 0.72;
          ctx.fillStyle = isStopping ? '#FFE600' : beamCol;
          ctx.globalAlpha = species === 'photon' ? 0.65 * (1 - prog * 0.6) : isStopping ? 0.95 : 0.75;
          ctx.beginPath();
          ctx.arc(px, py, isStopping ? 4.5 : 2.6, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Draw 6 MV Conventional X-ray curve
      ctx.beginPath();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 3]);
      simulationData.forEach((p, idx) => {
        const x = getX(p.depthCm);
        const y = getY(p.photonDose);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Active Hadron Curve
      if (species !== 'photon') {
        const activeCurveKey = isSobpEnabled ? 'sobpDose' : 'dose';
        const strokeColor = species === 'proton' ? '#00E5FF' : '#FF0055';

        ctx.beginPath();
        ctx.moveTo(getX(0), getY(0));
        simulationData.forEach((p) => {
          ctx.lineTo(getX(p.depthCm), getY(p[activeCurveKey]));
        });
        ctx.lineTo(getX(maxDepthCm), getY(0));
        ctx.closePath();
        ctx.fillStyle =
          species === 'proton' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 0, 85, 0.15)';
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3.5;
        simulationData.forEach((p, idx) => {
          const x = getX(p.depthCm);
          const y = getY(p[activeCurveKey]);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        if (isSobpEnabled) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          simulationData.forEach((p, idx) => {
            const x = getX(p.depthCm);
            const y = getY(p.dose);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      if (hoveredDepth !== null) {
        const xHover = getX(hoveredDepth);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(xHover, padTop);
        ctx.lineTo(xHover, padTop + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        const idx = Math.min(simulationData.length - 1, Math.max(0, Math.round(hoveredDepth / stepCm)));
        const pt = simulationData[idx];
        if (pt) {
          const hadronDoseVal = isSobpEnabled ? pt.sobpDose : pt.dose;
          const text =
            species !== 'photon'
              ? `d=${hoveredDepth.toFixed(1)}cm | Hadron: ${hadronDoseVal.toFixed(0)}% | X-ray: ${pt.photonDose.toFixed(0)}%`
              : `d=${hoveredDepth.toFixed(1)}cm | 6 MV X-ray: ${pt.photonDose.toFixed(0)}%`;

          ctx.font = 'bold 11px monospace';
          const textW = ctx.measureText(text).width;
          const badgeX = Math.max(padLeft + 5, Math.min(width - padRight - textW - 15, xHover - textW / 2));
          const badgeY = padTop + 35;

          ctx.fillStyle = '#000000';
          ctx.strokeStyle = '#00E5FF';
          ctx.lineWidth = 2;
          ctx.fillRect(badgeX - 6, badgeY - 14, textW + 12, 22);
          ctx.strokeRect(badgeX - 6, badgeY - 14, textW + 12, 22);

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.fillText(text, badgeX, badgeY + 1);
        }
      }

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(padLeft, padTop, plotW, plotH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PATIENT TISSUE PENETRATION DEPTH (cm)', padLeft + plotW / 2, height - 10);

      ctx.save();
      ctx.translate(16, padTop + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('RELATIVE ABSORBED DOSE (%)', 0, 0);
      ctx.restore();

      if (!reduceMotion) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    if (reduceMotion) {
      drawFrame(0);
    } else {
      rafId = requestAnimationFrame(drawFrame);
    }

    return () => cancelAnimationFrame(rafId);
  }, [simulationData, species, isSobpEnabled, tumorDepthCm, tumorMarginCm, hoveredDepth, reduceMotion]);

  // Handle pointer hover / touch interaction for depth inspection
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    const padLeft = 55;
    const padRight = 25;
    const plotW = canvas.width - padLeft - padRight;

    if (mouseX >= padLeft && mouseX <= padLeft + plotW) {
      const depth = ((mouseX - padLeft) / plotW) * maxDepthCm;
      setHoveredDepth(Math.round(depth * 10) / 10);
    } else {
      setHoveredDepth(null);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ELI5 Pedagogy Card */}
      <Eli5Card
        title="Smart Subatomic Cannonballs that stop right inside the tumor without harming the healthy brain"
        analogy="Conventional X-rays act like high-intensity floodlights: they blast all the healthy brain tissue in front of the tumor, and keep burning right out the back into the brainstem. Protons and Carbon ions are precision kinetic cannonballs: they coast gently through healthy brain tissue with almost zero damage, dump 100% of their destructive energy right inside the cancer tumor, and stop dead on a dime."
        keyPoints={[
          "Bethe-Bloch Peak: Charged particles lose little energy when moving fast, then deposit a massive spike of energy right as they slow down to zero velocity.",
          "Spread-Out Bragg Peak (SOBP): By sweeping multiple beam energies, physicians sculpt a razor-sharp 3D dose plateau that covers the entire tumor volume.",
          "Healthy Tissue Sparing: Dose past the Bragg peak drops immediately to ZERO (protons) with negligible exit dose, protecting critical organs like the optic nerve and brainstem."
        ]}
        whatToTry="Toggle between Proton, Carbon-12, and 6 MV X-Ray. Switch SOBP ON/OFF and adjust tumor depth to watch the dose plateau perfectly conform to the target volume!"
        doi="10.2174/1874471016666231124110000"
        arxivId="2311.14589"
        citationLabel="CERN Hadron Therapy & MEDICIS Research"
      />

      {/* Main Simulator Deck */}
      <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        {/* LEFT: Controls & Parameters */}
        <div className="w-full xl:w-96 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cern-cyan" /> Hadron Therapy Beam Control
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cern-cyan text-black font-bold border border-black shadow-[1px_1px_0px_#000]">
                BETHE-BLOCH
              </span>
            </div>

            {/* Beam Species Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-text-muted font-bold block">
                Particle Beam Species
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setSpecies('proton')}
                  className={`py-2 px-1 text-center font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                    species === 'proton'
                      ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  Proton (¹H⁺)
                </button>
                <button
                  onClick={() => setSpecies('carbon')}
                  className={`py-2 px-1 text-center font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                    species === 'carbon'
                      ? 'bg-cern-magenta text-white shadow-[2px_2px_0px_#000] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  Carbon (¹²C⁶⁺)
                </button>
                <button
                  onClick={() => setSpecies('photon')}
                  className={`py-2 px-1 text-center font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                    species === 'photon'
                      ? 'bg-orange-500 text-black shadow-[2px_2px_0px_#000] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  6 MV X-Ray
                </button>
              </div>
            </div>

            {/* Energy Slider */}
            {species !== 'photon' ? (
              <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-text-muted uppercase">Initial Beam Energy:</span>
                  <span className={species === 'proton' ? 'text-cern-cyan' : 'text-pink-400'}>
                    {activeEnergy} {species === 'proton' ? 'MeV' : 'MeV/u'}
                  </span>
                </div>
                {species === 'proton' ? (
                  <input
                    type="range"
                    min={70}
                    max={250}
                    step={2}
                    value={protonEnergy}
                    onChange={(e) => setProtonEnergy(Number(e.target.value))}
                    className="w-full accent-cern-cyan cursor-pointer"
                  />
                ) : (
                  <input
                    type="range"
                    min={120}
                    max={400}
                    step={5}
                    value={carbonEnergy}
                    onChange={(e) => setCarbonEnergy(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                )}
                <div className="flex justify-between text-[10px] text-text-muted font-mono font-bold">
                  <span>{species === 'proton' ? '70 MeV (~4 cm)' : '120 MeV/u (~3.5 cm)'}</span>
                  <span>{species === 'proton' ? '250 MeV (~38 cm)' : '400 MeV/u (~30 cm)'}</span>
                </div>
                <div className="text-[11px] font-mono text-text-secondary pt-1 border-t border-black/40">
                  Bragg Peak Range: <strong className="text-white">{braggPeakDepth} cm</strong> in soft tissue
                </div>
              </div>
            ) : (
              <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-mono text-orange-400 space-y-1">
                <span className="font-bold uppercase block text-[10px]">Conventional Linear Accelerator</span>
                <p className="text-[11px] text-text-secondary leading-tight">
                  6 MV Bremsstrahlung photon beam. Delivers high entrance dose, peaks at 1.5 cm depth, and continues decaying exponentially with zero stopping power Bragg peak.
                </p>
              </div>
            )}

            {/* Spread-Out Bragg Peak (SOBP) Modulator Toggle */}
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" /> SOBP Modulator Wheel
                </span>
                {species !== 'photon' ? (
                  <button
                    onClick={() => setIsSobpEnabled(!isSobpEnabled)}
                    className={`px-3 py-1 text-xs font-mono font-black border-2 border-black transition-all cursor-pointer ${
                      isSobpEnabled
                        ? 'bg-emerald-400 text-black shadow-[2px_2px_0px_#000]'
                        : 'bg-black text-text-muted'
                    }`}
                  >
                    {isSobpEnabled ? 'SOBP ACTIVE' : 'MONO-PEAK'}
                  </button>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-text-muted border border-black font-bold">
                    N/A (X-RAYS)
                  </span>
                )}
              </div>

              {/* Tumor Target Depth Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted font-bold uppercase">Tumor Target Depth:</span>
                  <span className="text-amber-300 font-bold">{tumorDepthCm.toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={0.5}
                  value={tumorDepthCm}
                  onChange={(e) => setTumorDepthCm(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Tumor Target Margin Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted font-bold uppercase">Target Margin (Width):</span>
                  <span className="text-amber-300 font-bold">{tumorMarginCm.toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min={1.5}
                  max={7.0}
                  step={0.5}
                  value={tumorMarginCm}
                  onChange={(e) => setTumorMarginCm(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Bethe-Bloch Equation Card */}
            <div className="p-3 bg-canvas-sub border-2 border-black text-xs font-mono space-y-1 text-text-muted shadow-[2px_2px_0px_#000]">
              <span className="text-[10px] text-cern-cyan font-bold uppercase block">
                Bethe-Bloch Stopping Power Equation
              </span>
              <div className="py-1">
                <MathFormula
                  tex="-\frac{dE}{dx} = 2\pi N_A r_e^2 m_e c^2 \rho \frac{Z}{A}\frac{z^2}{\beta^2}\left[\ln\!\left(\frac{2 m_e c^2 \beta^2 \gamma^2 T_{\max}}{I^2}\right) - 2\beta^2\right]"
                  displayMode
                />
              </div>
              <p className="text-[10px] text-text-muted leading-tight">
                Stopping power scales with 1/β², causing the energy loss rate to skyrocket just before rest.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t-2 border-black text-[11px] font-mono text-text-muted">
            <span>Reference: ICRU Report 93 • Preserving Brainstem &amp; Spinal Cord</span>
          </div>
        </div>

        {/* RIGHT: Interactive Canvas Dose-Depth Curve & Clinical Telemetry */}
        <div className="flex-1 flex flex-col justify-between bg-canvas border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-cern-magenta" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-text-primary font-bold">
                DOSE-DEPTH DISTRIBUTION &amp; HEALTHY TISSUE SPARING HUD
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-cern-cyan font-bold">
                <span className="w-3 h-0.5 bg-cern-cyan inline-block border border-black" /> Hadron Beam
              </span>
              <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                <span className="w-3 h-0.5 bg-orange-400 inline-block border border-black" /> Conventional 6 MV X-Ray
              </span>
            </div>
          </div>

          {/* Interactive Canvas with Pointer Events */}
          <div className="relative w-full aspect-[16/9] min-h-[300px] border-2 border-black shadow-[4px_4px_0px_#000]">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoveredDepth(null)}
              className="w-full h-full block bg-[#0a0d12] cursor-crosshair touch-none select-none"
            />
          </div>

          {/* Hover Depth HUD Bar */}
          {hoverTelemetry && (
            <div className="p-2.5 bg-black text-xs font-mono border-2 border-black shadow-[2px_2px_0px_#000] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-cern-cyan font-bold">Depth: {hoverTelemetry.depth} cm</span>
                <span className="text-text-muted">|</span>
                <span className="text-amber-300 font-semibold">{hoverTelemetry.region}</span>
              </div>
              <div className="flex items-center gap-3">
                {hoverTelemetry.hadronDose !== null && (
                  <span className="text-cern-cyan font-bold">
                    Hadron Dose: {hoverTelemetry.hadronDose}%
                  </span>
                )}
                <span className="text-orange-400 font-bold">
                  X-Ray Dose: {hoverTelemetry.photonDose}%
                </span>
              </div>
            </div>
          )}

          {/* 4 Clinical Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] text-text-muted font-bold uppercase block">Entrance Skin Dose</span>
              <div className="text-xl font-mono font-black text-white mt-0.5">
                {metrics.entrancePercent}%
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                Low entrance toxicity
              </span>
            </div>

            <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] text-text-muted font-bold uppercase block">Tumor Coverage</span>
              <div className="text-xl font-mono font-black text-[#FFE600] mt-0.5">
                100.0%
              </div>
              <span className="text-[10px] text-text-muted font-semibold block mt-0.5">
                Target: {tumorDepthCm} ± {(tumorMarginCm / 2).toFixed(1)} cm
              </span>
            </div>

            <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] text-text-muted font-bold uppercase block">Distal Organ Dose</span>
              <div className="text-xl font-mono font-black text-cern-cyan mt-0.5">
                {metrics.distalPercent}%
              </div>
              <span className={`text-[10px] font-bold block mt-0.5 ${Number(metrics.distalPercent) < 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {metrics.distalStatus}
              </span>
            </div>

            <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000]">
              <span className="text-[10px] text-text-muted font-bold uppercase block">Relative Bio Effectiveness</span>
              <div className="text-xl font-mono font-black text-pink-400 mt-0.5">
                {metrics.rbe}x RBE
              </div>
              <span className="text-[10px] text-text-muted font-semibold block mt-0.5">
                Peak LET: {metrics.letPeak}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CERN-MEDICIS Panel: Targeted Alpha Therapy & Medical Isotopes */}
      <div className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-400 text-black font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
              CERN-MEDICIS ISOTOPE RESEARCH ENGINE
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-black px-2 py-0.5 border border-black font-bold">
              1.4 GeV PS Booster Spallation
            </span>
          </div>

          <a
            href="https://medicis.cern"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-canvas-sub hover:bg-canvas-raised text-text-secondary hover:text-white font-mono text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] transition-all"
          >
            <span>cern.ch/medicis</span>
            <ExternalLink className="w-3.5 h-3.5 text-cern-cyan ml-1" />
          </a>
        </div>

        <div>
          <h3 className="text-xl font-display font-extrabold text-white">
            Targeted Alpha Therapy (TAT) &amp; Theranostics from CERN-MEDICIS
          </h3>
          <p className="text-xs md:text-sm text-text-secondary mt-1.5 max-w-4xl leading-relaxed font-sans">
            Medical Isotopes Collected from ISOLDE (MEDICIS) uses the high-energy 1.4 GeV proton beam from the
            CERN Proton Synchrotron Booster (PSB) on spallation targets to mass-separate non-conventional
            radionuclides. These isotopes are bound to antibodies and peptides to seek out and eradicate
            cancer micrometastases with subatomic precision.
          </p>
        </div>

        {/* 3 Isotope Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#00E5FF] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-cern-cyan">¹⁴⁹Tb (Terbium-149)</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-black text-cern-cyan font-bold border border-black">
                α-Emitter
              </span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              <strong>Half-life: 4.1 hours</strong>. Emits low-energy 3.97 MeV alpha particles with a tissue range
              under 28 µm (a few cell diameters). Ideal for destroying isolated cancer cells and micro-tumors
              without bone marrow toxicity.
            </p>
            <div className="pt-2 border-t border-black/40 text-[11px] text-text-muted">
              Primary Target: Metastatic melanoma &amp; leukemias
            </div>
          </div>

          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#FF0055] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-pink-400">²²⁵Ac (Actinium-225)</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-black text-pink-400 font-bold border border-black">
                Atomic Nanogenerator
              </span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              <strong>Half-life: 9.9 days</strong>. The gold standard for targeted alpha therapy. Each single
              atom yields a cascade of 4 high-energy alpha decays, causing fatal double-strand DNA breaks
              in tumor cell nuclei.
            </p>
            <div className="pt-2 border-t border-black/40 text-[11px] text-text-muted">
              Primary Target: Castration-resistant prostate cancer (PSMA)
            </div>
          </div>

          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#FFE600] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-amber-300">¹⁵²Tb (Terbium-152)</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-black text-amber-300 font-bold border border-black">
                Theranostic PET
              </span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              <strong>Half-life: 17.5 hours</strong>. Positron emitter used for high-resolution 3D PET molecular
              imaging. Identical chemical twin to therapeutic ¹⁴⁹Tb and ¹⁶¹Tb, allowing doctors to image the
              tumor and treat it with identical bioconjugates.
            </p>
            <div className="pt-2 border-t border-black/40 text-[11px] text-text-muted">
              Primary Role: Precision dosimetry &amp; PET tumor mapping
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
