'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  calculateSemiEmpiricalBindingEnergy,
  calculateMassSeparatorDeflection,
} from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { playDiscoveryChime } from '@/lib/sonifier';
import { Atom, Magnet, Crosshair, Radio, Play, Pause, Sparkles } from 'lucide-react';

interface IsotopePreset {
  id: string;
  label: string;
  symbol: string;
  Z: number;
  N: number;
  halfLifeLabel: string;
  halfLifeSec: number;
  idealFieldT: number;
  tag: string;
  eli5Note: string;
}

const ISOTOPE_PRESETS: IsotopePreset[] = [
  {
    id: 'li11',
    label: '¹¹Li (Neutron Halo)',
    symbol: '¹¹Li',
    Z: 3,
    N: 8,
    halfLifeLabel: '8.75 ms',
    halfLifeSec: 0.00875,
    idealFieldT: 0.0695,
    tag: 'Two-Neutron Halo',
    eli5Note: 'Two extra neutrons orbit way far outside the Lithium core like giant Saturn rings—as big as a Lead nucleus!',
  },
  {
    id: 'sn132',
    label: '¹³²Sn (Doubly Magic)',
    symbol: '¹³²Sn',
    Z: 50,
    N: 82,
    halfLifeLabel: '39.7 s',
    halfLifeSec: 39.7,
    idealFieldT: 0.241,
    tag: 'r-Process Benchmark',
    eli5Note: 'Both protons (50) and neutrons (82) completely fill quantum shells—key stepping stone when supernovas forge heavy elements!',
  },
  {
    id: 'tb161',
    label: '¹⁶¹Tb (CERN-MEDICIS)',
    symbol: '¹⁶¹Tb',
    Z: 65,
    N: 96,
    halfLifeLabel: '6.89 days',
    halfLifeSec: 595296,
    idealFieldT: 0.2662,
    tag: 'Medical Radioisotope',
    eli5Note: 'Harvested at CERN-MEDICIS to attach onto cancer-seeking antibodies—delivers surgical micro-radiation inside metastases!',
  },
  {
    id: 'ra224',
    label: '²²⁴Ra (Pear Nucleus)',
    symbol: '²²⁴Ra',
    Z: 88,
    N: 136,
    halfLifeLabel: '3.63 days',
    halfLifeSec: 313632,
    idealFieldT: 0.3139,
    tag: 'Octupole Deformation',
    eli5Note: 'ISOLDE proved this nucleus is permanently shaped like a pear rather than a sphere, tightening searches for hidden cosmic asymmetry!',
  },
];

export const IsoldeSimulator: React.FC = () => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const completeMission = useGlobalStore((s) => s.completeMission);

  const [selectedPresetId, setSelectedPresetId] = useState<string>('sn132');
  const [targetZ, setTargetZ] = useState<number>(50);
  const [targetN, setTargetN] = useState<number>(82);
  const [extractionKv, setExtractionKv] = useState<number>(50);
  const [dipoleFieldT, setDipoleFieldT] = useState<number>(0.241);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const activePreset = ISOTOPE_PRESETS.find((p) => p.id === selectedPresetId) || ISOTOPE_PRESETS[1];
  const massA = targetZ + targetN;

  const binding = useMemo(() => calculateSemiEmpiricalBindingEnergy(targetZ, targetN), [targetZ, targetN]);

  // Target ion optics vs nearby contaminant isobar (A + 2 or A - 2)
  const targetOptics = useMemo(
    () => calculateMassSeparatorDeflection(massA, 1, extractionKv, dipoleFieldT, 1.5, 4.0),
    [massA, extractionKv, dipoleFieldT]
  );
  const contaminantOptics = useMemo(
    () => calculateMassSeparatorDeflection(massA + 3, 1, extractionKv, dipoleFieldT, 1.5, 4.0),
    [massA, extractionKv, dipoleFieldT]
  );

  // Auto-tune dipole field for nominal 1.5 m bending radius
  const handleAutoLock = () => {
    // R = sqrt(2 m V / q) / B  => B = sqrt(2 m V / q) / 1.5
    const mKg = massA * 1.6605390666e-27;
    const qC = 1.602176634e-19;
    const V = extractionKv * 1000;
    const exactB = Math.sqrt((2 * mKg * V) / qC) / 1.5;
    setDipoleFieldT(Number(exactB.toFixed(4)));
  };

  useEffect(() => {
    if (targetZ === 65 && targetN === 96 && targetOptics.passesSlit) {
      completeMission('mission-isolde-tb161');
      playDiscoveryChime();
    }
  }, [targetZ, targetN, targetOptics.passesSlit, completeMission]);

  const applyPreset = (preset: IsotopePreset) => {
    setSelectedPresetId(preset.id);
    setTargetZ(preset.Z);
    setTargetN(preset.N);
    setExtractionKv(50);
    setDipoleFieldT(preset.idealFieldT);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const segreCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Animated Magnetic Mass Separator Beamline Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let phase = 0;

    const ions = Array.from({ length: 18 }, (_, i) => ({
      offset: (i / 18) * 1.0,
      isTarget: i % 3 !== 0,
    }));

    const render = () => {
      if (isPlaying && !reduceMotion) {
        phase = (phase + 0.012) % 1;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, w, h);

      // Background subtle blueprint grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 1) PSB Proton Beam hitting UCx Target + RILIS Laser
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.fillRect(34, 108, 44, 44);
      ctx.strokeRect(34, 108, 44, 44);
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('UCx TARGET', 28, 168);

      // Incoming 1.4 GeV proton arrow
      ctx.strokeStyle = '#FF0055';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(4, 130);
      ctx.lineTo(32, 130);
      ctx.stroke();
      ctx.fillStyle = '#FF0055';
      ctx.fillText('1.4 GeV p', 4, 100);

      // RILIS green laser beam vertically ionizing inside target chamber
      ctx.strokeStyle = '#00FF66';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(56, 30);
      ctx.lineTo(56, 106);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#00FF66';
      ctx.fillText('RILIS LASER ION SOURCE', 12, 22);

      // 2) Sector Dipole Magnet Zone (X = 165 to 315)
      ctx.fillStyle = 'rgba(0, 83, 161, 0.35)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.fillRect(165, 55, 140, 150);
      ctx.strokeRect(165, 55, 140, 150);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`GPS DIPOLE (${dipoleFieldT.toFixed(3)} T)`, 172, 46);

      // 3) Focal Exit Slit at X = 445, centered at Y = 130
      const slitX = 450;
      const slitY = 130;
      ctx.fillStyle = '#FFE600';
      ctx.fillRect(slitX - 3, 25, 6, slitY - 38);
      ctx.fillRect(slitX - 3, slitY + 13, 6, h - (slitY + 25));
      ctx.fillStyle = '#FFE600';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('MASS SLIT', slitX - 24, 18);

      // Compute normalized deflection dy on focal plane
      const mapOffsetPx = (offsetMm: number) => Math.max(-95, Math.min(95, offsetMm * 0.65));
      const targetDy = mapOffsetPx(targetOptics.focalOffsetMm);
      const contamDy = mapOffsetPx(contaminantOptics.focalOffsetMm);

      // Draw trajectory centerlines
      const drawPath = (dy: number, color: string, alpha: number) => {
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(78, slitY);
        ctx.lineTo(165, slitY);
        ctx.quadraticCurveTo(260, slitY + dy * 0.35, 305, slitY + dy * 0.72);
        ctx.lineTo(slitX + 55, slitY + dy);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      };

      drawPath(contamDy, '#94A3B8', 0.45);
      drawPath(targetDy, '#00E5FF', 0.85);

      // Animate drifting ion packets along paths
      ions.forEach((ion) => {
        const s = (phase + ion.offset) % 1;
        const dy = ion.isTarget ? targetDy : contamDy;
        let px = 78 + s * (slitX + 45 - 78);
        let py = slitY;

        if (px > 165 && px <= 305) {
          const u = (px - 165) / 140;
          py = slitY + dy * 0.72 * (u * u);
        } else if (px > 305) {
          const u = (px - 305) / (slitX + 55 - 305);
          py = slitY + dy * (0.72 + 0.28 * u);
        }

        // Stop on collimator wall if misses slit
        if (px >= slitX - 2 && Math.abs(py - slitY) > 12) {
          px = slitX - 4;
        }

        ctx.beginPath();
        ctx.arc(px, py, ion.isTarget ? 4.2 : 3.0, 0, Math.PI * 2);
        ctx.fillStyle = ion.isTarget ? (targetOptics.passesSlit ? '#00FF66' : '#FFE600') : '#64748B';
        ctx.fill();
      });

      // Downstream Detector Experiment Chamber
      ctx.fillStyle = targetOptics.passesSlit ? 'rgba(0,255,102,0.18)' : 'rgba(255,0,85,0.12)';
      ctx.strokeStyle = targetOptics.passesSlit ? '#00FF66' : '#FF0055';
      ctx.lineWidth = 2;
      ctx.fillRect(slitX + 24, 98, 72, 64);
      ctx.strokeRect(slitX + 24, 98, 72, 64);
      ctx.fillStyle = targetOptics.passesSlit ? '#00FF66' : '#FF0055';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(targetOptics.passesSlit ? 'BEAM LOCKED' : 'OFF-SLIT', slitX + 28, 134);

      if (isPlaying && !reduceMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [dipoleFieldT, extractionKv, targetOptics, contaminantOptics, isPlaying, reduceMotion]);

  // 2. Segrè Nuclear Landscape Chart (N vs Z) Canvas
  useEffect(() => {
    const canvas = segreCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, w, h);

    const maxN = 155;
    const maxZ = 100;
    const padL = 34;
    const padB = 26;
    const plotW = w - padL - 14;
    const plotH = h - padB - 14;

    const toX = (n: number) => padL + (n / maxN) * plotW;
    const toY = (z: number) => h - padB - (z / maxZ) * plotH;

    // Plot Magic Number Lines (2, 8, 20, 28, 50, 82, 126)
    const magics = [2, 8, 20, 28, 50, 82, 126];
    ctx.strokeStyle = 'rgba(255, 230, 0, 0.25)';
    ctx.lineWidth = 1;
    ctx.font = '9px monospace';
    ctx.fillStyle = '#FFE600';
    magics.forEach((m) => {
      if (m <= maxN) {
        const x = toX(m);
        ctx.beginPath();
        ctx.moveTo(x, 12);
        ctx.lineTo(x, h - padB);
        ctx.stroke();
        ctx.fillText(String(m), x - 6, h - padB + 12);
      }
      if (m <= maxZ) {
        const y = toY(m);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - 14, y);
        ctx.stroke();
        ctx.fillText(String(m), 6, y + 3);
      }
    });

    // Draw Nuclide Stability Band (sampled SEMF Green-Engler valley)
    for (let z = 1; z <= 96; z += 1) {
      for (let n = 0; n <= 150; n += 1) {
        const a = z + n;
        const zStable = a / (2 + 0.015 * Math.pow(a, 2 / 3));
        const dz = z - zStable;
        if (Math.abs(dz) < 1.3) {
          ctx.fillStyle = '#00E5FF';
          ctx.fillRect(toX(n), toY(z), 2.5, 2.5);
        } else if (Math.abs(dz) < 12 && z <= a * 0.65 && n >= z * 0.7) {
          ctx.fillStyle = dz > 0 ? 'rgba(255,0,85,0.22)' : 'rgba(56,189,248,0.22)';
          ctx.fillRect(toX(n), toY(z), 2, 2);
        }
      }
    }

    // Highlight all 4 ISOLDE Preset Landmarks
    ISOTOPE_PRESETS.forEach((p) => {
      const x = toX(p.N);
      const y = toY(p.Z);
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00FF66';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
    });

    // Current Crosshair (targetN, targetZ)
    const cx = toX(targetN);
    const cy = toY(targetZ);
    ctx.strokeStyle = '#FFE600';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`Z=${targetZ}, N=${targetN} (A=${massA})`, Math.min(cx + 8, w - 130), Math.max(20, cy - 8));

    // Axis labels
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Neutron Number N →', w / 2 - 40, h - 4);
  }, [targetZ, targetN, massA]);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="ISOLDE & CERN-MEDICIS: How CERN Builds & Sorts Rare Radioactive Atoms"
        analogy="Think of ISOLDE as CERN’s cosmic alchemy forge! First, high-energy protons smash into a hot metal target to shatter atoms into hundreds of weird radioactive flavors. Then green lasers zap ONLY one chosen chemical element, and a curved magnet bends light vs heavy atoms into separate paths—just like sorting marbles of different weights around a banked corner!"
        keyPoints={[
          'Segrè Chart Magic Numbers (2, 8, 20, 28, 50, 82, 126): Just like noble gases in chemistry, atomic nuclei with filled proton/neutron shells are super-stable.',
          'Magnetic Mass Separator (GPS/HRS): Bends ions along R = mv / (qB)—heavier isotopes fly wider curves, cleanly separating contaminants!',
          'CERN-MEDICIS harvests life-saving cancer therapy isotopes (like Terbium-161) from discarded protons!',
        ]}
        whatToTry="Pick an exotic isotope preset (like Doubly Magic Tin-132 or Cancer Therapy Tb-161), then tune the Dipole Field slider—or hit Auto-Lock—to steer it straight through the focal Mass Slit!"
        doi="10.1088/1361-6471/aa7e91"
        citationLabel="ISOLDE & HIE-ISOLDE Collaboration, J. Phys. G 44 (2017)"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        {/* LEFT CONTROLS (4 cols) */}
        <div className="xl:col-span-4 space-y-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-xs font-mono font-black uppercase text-white flex items-center gap-1.5">
              <Magnet className="w-4 h-4 text-cern-cyan" /> ISOLDE Mass Separator
            </h3>
            <FidelityBadge type="ANALYTIC" />
          </div>

          {/* Isotope Presets */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1.5">
              Featured CERN-ISOLDE / MEDICIS Isotopes
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {ISOTOPE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className={`p-2 border-2 border-black text-left font-mono transition-all ${
                    selectedPresetId === p.id && targetZ === p.Z && targetN === p.N
                      ? 'bg-cern-blue text-white shadow-[2px_2px_0px_#00E5FF]'
                      : 'bg-canvas-sub hover:bg-canvas-raised text-text-secondary hover:text-white'
                  }`}
                >
                  <div className="text-xs font-black text-[#FFE600]">{p.label}</div>
                  <div className="text-[9px] text-cern-cyan">{p.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Z & N Sliders */}
          <div className="space-y-2.5">
            <div className="p-2.5 bg-canvas-sub border-2 border-black">
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span className="text-text-muted uppercase">Protons (Z):</span>
                <span className="text-cern-magenta">{targetZ} {binding.isProtonMagic ? '★ MAGIC SHELL' : ''}</span>
              </div>
              <input
                type="range"
                min={2}
                max={92}
                step={1}
                value={targetZ}
                onChange={(e) => setTargetZ(Number(e.target.value))}
                className="w-full accent-cern-magenta cursor-pointer"
              />
            </div>

            <div className="p-2.5 bg-canvas-sub border-2 border-black">
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span className="text-text-muted uppercase">Neutrons (N):</span>
                <span className="text-cern-cyan">{targetN} {binding.isNeutronMagic ? '★ MAGIC SHELL' : ''}</span>
              </div>
              <input
                type="range"
                min={2}
                max={145}
                step={1}
                value={targetN}
                onChange={(e) => setTargetN(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
              />
            </div>

            {/* GPS Magnetic Separator Field B & HV */}
            <div className="p-2.5 bg-canvas-sub border-2 border-black">
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span className="text-text-muted uppercase">Dipole Field (B):</span>
                <span className="text-emerald-400">{dipoleFieldT.toFixed(4)} T</span>
              </div>
              <input
                type="range"
                min={0.04}
                max={0.42}
                step={0.0005}
                value={dipoleFieldT}
                onChange={(e) => setDipoleFieldT(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] font-mono text-text-muted">HV = {extractionKv} kV</span>
                <button
                  onClick={handleAutoLock}
                  className="px-2.5 py-1 bg-[#FFE600] hover:bg-amber-300 text-black text-[10px] font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Auto-Lock A={massA}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-amber-300 border-2 border-black text-[11px] font-mono font-bold text-black leading-snug">
            {activePreset.symbol}: {activePreset.eli5Note}
          </div>

          <MathFormula
            tex="R_L = \frac{\sqrt{2\,m\,q\,V}}{q\,B}"
            label="ISOLDE Ion Optics:"
          />
        </div>

        {/* RIGHT VIEWPORT (8 cols) */}
        <div className="xl:col-span-8 space-y-4">
          {/* Top Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-[10px] text-text-muted block uppercase">Binding / Nucleon (SEMF)</span>
              <strong className="text-cern-cyan text-sm">{binding.bindingPerNucleonMev.toFixed(2)} MeV</strong>
            </div>
            <div className="p-2.5 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-[10px] text-text-muted block uppercase">Ion Speed (50 kV)</span>
              <strong className="text-white text-sm">{targetOptics.velocityKmS.toFixed(0)} km/s</strong>
            </div>
            <div className="p-2.5 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-[10px] text-text-muted block uppercase">Slit Focal Offset</span>
              <strong className={`text-sm ${targetOptics.passesSlit ? 'text-emerald-400' : 'text-red-400'}`}>
                {targetOptics.focalOffsetMm >= 0 ? '+' : ''}
                {targetOptics.focalOffsetMm.toFixed(1)} mm
              </strong>
            </div>
            <div className="p-2.5 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-[10px] text-text-muted block uppercase">Nuclear Regime</span>
              <strong className="text-[#FFE600] text-xs">{binding.stabilityRegime.replace('_', ' ')}</strong>
            </div>
          </div>

          {/* Animated Magnetic Separator Canvas */}
          <div className="bg-canvas border-2 border-black shadow-[4px_4px_0px_#000] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                Live Target → Laser RILIS → Sector Magnet Separation (A={massA} vs A={massA + 3})
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2 py-0.5 bg-canvas-surface border border-black text-[10px] font-bold text-cern-cyan flex items-center gap-1"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            </div>
            <canvas ref={canvasRef} width={560} height={240} className="w-full h-56 border border-black bg-[#050811]" />
          </div>

          {/* Segrè Nuclear Chart */}
          <div className="bg-canvas border-2 border-black shadow-[4px_4px_0px_#000] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFE600]" />
                Segrè Chart of Nuclides (Z vs N · Gold Lines = Closed Magic Shells)
              </span>
              <span className="text-[10px] text-cern-cyan font-bold">
                {binding.isDoublyMagic ? '★★ DOUBLY MAGIC NUCLEUS' : `Mass Number A = ${massA}`}
              </span>
            </div>
            <canvas ref={segreCanvasRef} width={560} height={190} className="w-full h-44 border border-black bg-[#050811]" />
          </div>
        </div>
      </div>
    </div>
  );
};
