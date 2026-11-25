'use client';

import React, { useState, useMemo } from 'react';
import {
  calculateElectroweakPhase,
  evaluateHiggsPotential,
  ELECTROWEAK_TC_GEV,
  HIGGS_VEV_GEV,
} from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { Higgs3DPotentialCanvas } from './Higgs3DPotentialCanvas';
import { useGlobalStore } from '@/lib/store';
import { Flame, Sparkles, Sliders, HelpCircle, Info } from 'lucide-react';

export const HiggsMechanismSimulator: React.FC = () => {
  const userLevel = useGlobalStore((s) => s.userLevel);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [temperatureGev, setTemperatureGev] = useState<number>(0);
  const [customYukawa, setCustomYukawa] = useState<number>(0.5);
  const [quizGuess, setQuizGuess] = useState<number | null>(null);

  const phase = useMemo(() => calculateElectroweakPhase(temperatureGev), [temperatureGev]);

  // Compute V(phi) curve points for SVG (-320 GeV to +320 GeV)
  const potentialPlot = useMemo(() => {
    const phiMin = -320;
    const phiMax = 320;
    const steps = 96;
    const rawPts: { phi: number; v: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const phi = phiMin + (i / steps) * (phiMax - phiMin);
      const v = evaluateHiggsPotential(phi, phase.muSqGev2, phase.lambdaQuartic);
      rawPts.push({ phi, v });
    }

    // Map V into clean fixed display window so symmetric bowl vs Mexican hat morph dramatically
    const vMin = -6.5e7;
    const vMax = 1.6e8;

    return rawPts.map((pt) => {
      const x = 35 + ((pt.phi - phiMin) / (phiMax - phiMin)) * 390;
      const clampedV = Math.max(vMin, Math.min(vMax, pt.v));
      const normY = (clampedV - vMin) / (vMax - vMin);
      const y = 210 - normY * 180;
      return { ...pt, x, y };
    });
  }, [phase]);

  // Vacuum ball screen coordinate at phi = +vevGev
  const ballPos = useMemo(() => {
    const phi = phase.vevGev;
    const v = evaluateHiggsPotential(phi, phase.muSqGev2, phase.lambdaQuartic);
    const x = 35 + ((phi - -320) / 640) * 390;
    const vMin = -6.5e7;
    const vMax = 1.6e8;
    const clampedV = Math.max(vMin, Math.min(vMax, v));
    const normY = (clampedV - vMin) / (vMax - vMin);
    const y = 210 - normY * 180;
    return { x, y };
  }, [phase]);

  const customParticleMassGev = (customYukawa * phase.vevGev) / Math.SQRT2;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              ELECTROWEAK SYMMETRY BREAKING
            </span>
            <FidelityBadge type="ANALYTIC" />
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
            Why Do Particles Have Mass? Higgs &quot;Mexican Hat&quot; Lab
          </h2>
          <p className="text-xs text-text-secondary font-mono max-w-2xl">
            Cool the early Big Bang universe past T_c = 159.5 GeV to watch the Higgs potential tilt into
            a Mexican Hat—breaking electroweak symmetry and giving mass to quarks, leptons, and W/Z bosons.
          </p>
        </div>

        {/* Temperature Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setTemperatureGev(220)}
            className={`px-3 py-1.5 border-2 border-black font-bold uppercase cursor-pointer ${
              temperatureGev > 160
                ? 'bg-orange-500 text-black shadow-[3px_3px_0px_#000]'
                : 'bg-canvas-sub text-white hover:bg-orange-950'
            }`}
          >
            🔥 Big Bang Hot (220 GeV)
          </button>
          <button
            onClick={() => setTemperatureGev(159.5)}
            className="px-3 py-1.5 bg-canvas-sub hover:bg-zinc-800 text-amber-300 border-2 border-black font-bold uppercase cursor-pointer"
          >
            ⚡ T_c = 159.5 GeV
          </button>
          <button
            onClick={() => setTemperatureGev(0)}
            className={`px-3 py-1.5 border-2 border-black font-bold uppercase cursor-pointer ${
              temperatureGev === 0
                ? 'bg-cern-cyan text-black shadow-[3px_3px_0px_#000]'
                : 'bg-canvas-sub text-white hover:bg-cyan-950'
            }`}
          >
            ❄️ Today&apos;s Vacuum (0 GeV)
          </button>
        </div>
      </div>

      {/* ELI5 Card */}
      <Eli5Card
        title="The Invisible Cosmic Snowfield That Makes Things Heavy"
        analogy="Imagine skiing across an invisible ocean of snow! Photons wear magical friction-free hoverboots—so they zip past at the speed of light with zero mass. Electrons wear tiny snowshoes and move easily. Top quarks wear giant sticky snowboots, making them 338,000 times heavier than electrons!"
        keyPoints={[
          'Just after the Big Bang (above 159.5 GeV), the universe was too hot for snow to freeze—every particle weighed ZERO!',
          'As the cosmos cooled, the Higgs field froze into a non-zero ocean everywhere in space (v = 246 GeV), shaped like the brim of a Mexican Hat.',
          'The Higgs Boson discovered at CERN in 2012 is a vibration ripple you kick up when smashing particles hard enough into that cosmic snowfield!',
        ]}
        whatToTry="Slide Universe Temperature from 240 GeV down to 0 GeV and watch the gold ball roll off center while W, Z, Top, and Electron masses switch ON!"
        doi="10.1016/j.physletb.2012.08.020"
        citationLabel="ATLAS & CMS (2012) Discovery of the 125 GeV Higgs Boson"
      />

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Live Mexican Hat SVG + Cosmic Cooling Slider */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-[#070B12] border-3 border-black shadow-[6px_6px_0px_#000] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="font-bold uppercase text-white">
                Scalar Potential V(φ) = ½ μ²(T) φ² + ¼ λ φ⁴
              </span>
              <div className="flex items-center gap-2">
                <div className="flex border border-black bg-black text-[10px]">
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-2 py-0.5 font-bold uppercase cursor-pointer ${
                      viewMode === '3d' ? 'bg-cern-cyan text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    3D Hat
                  </button>
                  <button
                    onClick={() => setViewMode('2d')}
                    className={`px-2 py-0.5 font-bold uppercase cursor-pointer ${
                      viewMode === '2d' ? 'bg-cern-cyan text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    2D Slice
                  </button>
                </div>
                <span
                  className={`px-2 py-0.5 font-black border border-black ${
                    phase.brokenSymmetry
                      ? 'bg-cern-cyan text-black'
                      : 'bg-orange-400 text-black animate-pulse'
                  }`}
                >
                  {phase.brokenSymmetry ? 'SYMMETRY BROKEN (v > 0)' : 'SYMMETRIC PHASE (v = 0)'}
                </span>
              </div>
            </div>

            {viewMode === '3d' ? (
              <Higgs3DPotentialCanvas
                muSqGev2={phase.muSqGev2}
                lambdaQuartic={phase.lambdaQuartic}
                vevGev={phase.vevGev}
                brokenSymmetry={phase.brokenSymmetry}
              />
            ) : (
            <svg viewBox="0 0 460 235" className="w-full h-60 bg-[#04070D] border-2 border-zinc-800">
              {/* Zero potential axis */}
              <line x1="20" y1="158" x2="440" y2="158" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
              {/* Phi = 0 symmetry axis */}
              <line x1="230" y1="15" x2="230" y2="220" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="235" y="25" fill="#64748B" fontSize="10" fontFamily="monospace" fontWeight="bold">
                φ = 0
              </text>

              {/* V(phi) curve */}
              <polyline
                fill="none"
                stroke={phase.brokenSymmetry ? '#00E5FF' : '#FB923C'}
                strokeWidth="3.5"
                points={potentialPlot.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
              />

              {/* Vacuum VEV vertical indicator if broken */}
              {phase.brokenSymmetry && (
                <>
                  <line
                    x1={ballPos.x}
                    y1={ballPos.y}
                    x2={ballPos.x}
                    y2="215"
                    stroke="#FFE600"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={Math.min(ballPos.x + 6, 360)}
                    y="212"
                    fill="#FFE600"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    v = {phase.vevGev.toFixed(1)} GeV
                  </text>
                </>
              )}

              {/* Vacuum State Ball */}
              <circle
                cx={ballPos.x}
                cy={ballPos.y}
                r="10"
                fill="#FFE600"
                stroke="#000000"
                strokeWidth="3"
              />
              <circle cx={ballPos.x} cy={ballPos.y} r="3.5" fill="#FFFFFF" />
            </svg>
            )}

            {/* Temperature Slider */}
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-text-muted uppercase flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" /> Early Universe Temperature (T):
                </span>
                <span className={phase.brokenSymmetry ? 'text-cern-cyan' : 'text-orange-400'}>
                  {temperatureGev.toFixed(1)} GeV ({temperatureGev === 0 ? 'Present Day' : `T/Tc = ${(temperatureGev / ELECTROWEAK_TC_GEV).toFixed(2)}`})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={250}
                step={0.5}
                value={temperatureGev}
                onChange={(e) => setTemperatureGev(Number(e.target.value))}
                className="w-full accent-orange-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-text-muted">
                <span>0 GeV (Today: v = {HIGGS_VEV_GEV.toFixed(1)} GeV)</span>
                <span>159.5 GeV (Phase Transition)</span>
                <span>250 GeV (Unbroken SM)</span>
              </div>
            </div>
          </div>

          {/* Interactive Depth Narrative */}
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase text-cern-cyan flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> {userLevel} Physics Breakdown
            </span>
            <p className="text-xs font-sans text-text-primary leading-relaxed">
              {userLevel === 'BEGINNER'
                ? phase.brokenSymmetry
                  ? 'Because the universe has cooled below 159.5 GeV, the golden Higgs ball sits deep in the brim of the hat! Every W, Z, quark, and electron drags against this field to get its mass, while light (photons) slips through with zero mass.'
                  : 'You cranked the temperature above 159.5 GeV! In the blazing first picosecond after the Big Bang, the Higgs ocean melted to zero. Electrons, quarks, and W/Z bosons were completely massless and zipped at light speed!'
                : userLevel === 'UNDERGRAD'
                ? `At T = ${temperatureGev.toFixed(1)} GeV, thermal corrections yield μ²_eff = ${phase.muSqGev2.toFixed(0)} GeV². Since μ² ${phase.brokenSymmetry ? '< 0, SU(2)_L × U(1)_Y breaks spontaneously to U(1)_EM with VEV v = ' + phase.vevGev.toFixed(1) + ' GeV.' : '> 0, gauge symmetry is restored and all tree-level Dirac & gauge masses vanish.'}`
                : `Thermal effective potential minimum satisfies dV_eff/dφ = φ(μ²(T) + λφ²) = 0 with λ = ${phase.lambdaQuartic.toFixed(4)}. Fermion Dirac masses follow m_f(T) = y_f v(T)/√2 while QED photon remains protected by residual U(1)_EM gauge invariance.`}
            </p>
          </div>
        </div>

        {/* Right 5 Cols: Mass Spectrum Bars + Custom Yukawa Slider + Micro-Quiz */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dynamic Mass Spectrum */}
          <div className="p-4 bg-canvas-surface border-3 border-black shadow-[5px_5px_0px_#000] space-y-3">
            <h3 className="text-sm font-display font-black uppercase text-white border-b-2 border-black pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFE600]" /> Live Emergent Particle Masses
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              {[
                { name: 'Top Quark (t)', mass: phase.massesGev.topQuark, max: 180, unit: 'GeV', col: 'bg-pink-500' },
                { name: 'Z⁰ Boson (Weak)', mass: phase.massesGev.zBoson, max: 180, unit: 'GeV', col: 'bg-purple-400' },
                { name: 'W± Boson (Weak)', mass: phase.massesGev.wBoson, max: 180, unit: 'GeV', col: 'bg-cern-accent' },
                {
                  name: 'Electron (e⁻)',
                  mass: phase.massesGev.electron * 1000,
                  max: 1.0,
                  unit: 'MeV',
                  col: 'bg-cern-cyan',
                },
                { name: 'Photon (γ)', mass: 0, max: 180, unit: 'GeV (Protected)', col: 'bg-emerald-400' },
              ].map((p) => {
                const pct = p.unit === 'MeV' ? (p.mass / p.max) * 100 : (p.mass / 180) * 100;
                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-text-secondary">{p.name}</span>
                      <span className="text-white">
                        {p.unit === 'MeV' ? p.mass.toFixed(3) : p.mass.toFixed(2)} {p.unit}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-black border border-zinc-700">
                      <div
                        className={`h-full transition-all duration-150 ${p.col}`}
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Yukawa Coupling Explorer */}
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] space-y-2.5">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-cern-cyan uppercase flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Test Yukawa Coupling (y_f):
              </span>
              <span className="text-[#FFE600]">{customYukawa.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1.0}
              step={0.01}
              value={customYukawa}
              onChange={(e) => setCustomYukawa(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
            <div className="p-2.5 bg-black border border-zinc-800 text-xs font-mono flex justify-between items-center">
              <span className="text-text-muted">Resulting Particle Mass (y_f · v / √2):</span>
              <span className="text-emerald-400 font-black">{customParticleMassGev.toFixed(2)} GeV</span>
            </div>
          </div>

          {/* Micro-Quiz */}
          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#FFE600] space-y-2">
            <div className="text-xs font-mono font-black uppercase text-[#FFE600] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Intuition Check
            </div>
            <p className="text-xs font-sans text-white">
              If the Higgs VEV suddenly doubled from 246 GeV to 492 GeV, what would happen to electrons and atomic sizes?
            </p>
            <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
              {[
                'Nothing — electron mass does not depend on the Higgs field.',
                'Electrons double in mass, shrinking atomic radii by 2×!',
                'Photons would become super heavy.',
              ].map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuizGuess(idx)}
                  className={`p-2 border-2 border-black text-left cursor-pointer ${
                    quizGuess === idx
                      ? idx === 1
                        ? 'bg-emerald-400 text-black font-bold'
                        : 'bg-red-500 text-black font-bold'
                      : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {quizGuess !== null && (
              <div className="text-[11px] font-mono text-text-secondary">
                {quizGuess === 1
                  ? '✓ Exact! Because mₑ = yₑ·v/√2 and the Bohr radius a₀ ∝ 1/mₑ, doubling v cuts atom size in half!'
                  : '✕ Hint: Look at m_f = y_f·v/√2! Fermion masses scale directly with VEV v, while the photon stays zero.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
