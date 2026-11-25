'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { calculatePrimakoffConversion } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { useGlobalStore } from '@/lib/store';
import { EyeOff, Sun, Magnet, Target, Sliders, Info, Radio } from 'lucide-react';

export const DarkMatterHaloscope: React.FC = () => {
  const userLevel = useGlobalStore((s) => s.userLevel);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [subMode, setSubMode] = useState<'cast' | 'monojet'>('cast');
  const [animPhase, setAnimPhase] = useState<number>(0);

  useEffect(() => {
    if (reduceMotion) return;
    let rafId = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      setAnimPhase(((ts - start) / 1000) * 1.4);
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [reduceMotion]);

  // CAST Helioscope parameters
  const [axionMassEv, setAxionMassEv] = useState<number>(0.42);
  const [plasmaMassEv, setPlasmaMassEv] = useState<number>(0.42);
  const [bFieldT, setBFieldT] = useState<number>(9.0);

  // LHC Mono-Jet Missing ET parameters
  const [jetPtGev, setJetPtGev] = useState<number>(380);
  const [jetAngleDeg, setJetAngleDeg] = useState<number>(35);

  const primakoff = useMemo(
    () =>
      calculatePrimakoffConversion({
        axionMassEv,
        photonPlasmaMassEv: plasmaMassEv,
        axionEnergyKev: 4.2, // Mean solar axion X-ray energy (4.2 keV)
        magneticFieldT: bFieldT,
        lengthMeters: 9.26, // Exact CAST LHC prototype dipole length
        couplingG10: 0.66, // g_agamma = 0.66 x 10^-10 GeV^-1 CAST limit
      }),
    [axionMassEv, plasmaMassEv, bFieldT]
  );

  // Resonance scan plot across plasma mass m_gamma from 0 to 1.0 eV
  const scanCurve = useMemo(() => {
    const pts: { m: number; coh: number; x: number; y: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const m = 0.01 + (i / 100) * 0.99;
      const res = calculatePrimakoffConversion({
        axionMassEv,
        photonPlasmaMassEv: m,
        axionEnergyKev: 4.2,
        magneticFieldT: bFieldT,
        lengthMeters: 9.26,
        couplingG10: 0.66,
      });
      const x = 35 + (i / 100) * 380;
      const y = 135 - Math.min(1, res.coherenceFactor) * 110;
      pts.push({ m, coh: res.coherenceFactor, x, y });
    }
    return pts;
  }, [axionMassEv, bFieldT]);

  // Transverse Mono-Jet vectors
  const jetRad = (jetAngleDeg * Math.PI) / 180;
  const vectorLen = Math.min(108, (jetPtGev / 800) * 100 + 18);
  const jetX = 160 + Math.cos(jetRad) * vectorLen;
  const jetY = 120 - Math.sin(jetRad) * vectorLen;
  const metX = 160 - Math.cos(jetRad) * vectorLen;
  const metY = 120 + Math.sin(jetRad) * vectorLen;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-purple-500 text-white border-2 border-black shadow-[2px_2px_0px_#000]">
              BEYOND THE STANDARD MODEL (DARK MATTER)
            </span>
            <FidelityBadge type="ANALYTIC" />
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
            Dark Matter Hunters: CAST Solar Axions &amp; LHC Mono-Jet Recoil
          </h2>
          <p className="text-xs text-text-secondary font-mono max-w-2xl">
            Dark matter leaves zero direct ionization hits in detectors. Explore CERN&apos;s two flagship
            hunt strategies: Primakoff X-ray conversion in a 9 T LHC magnet and transverse momentum
            imbalance (E_T^miss).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setSubMode('cast')}
            className={`px-3.5 py-2 border-2 border-black font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
              subMode === 'cast'
                ? 'bg-amber-400 text-black shadow-[3px_3px_0px_#000]'
                : 'bg-canvas-sub text-white hover:bg-zinc-800'
            }`}
          >
            <Sun className="w-4 h-4" /> CAST Axion Telescope
          </button>
          <button
            onClick={() => setSubMode('monojet')}
            className={`px-3.5 py-2 border-2 border-black font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
              subMode === 'monojet'
                ? 'bg-cern-magenta text-white shadow-[3px_3px_0px_#00E5FF]'
                : 'bg-canvas-sub text-white hover:bg-zinc-800'
            }`}
          >
            <EyeOff className="w-4 h-4" /> LHC Mono-Jet MET
          </button>
        </div>
      </div>

      {/* ELI5 Card */}
      <Eli5Card
        title="How Do Scientists Spot Invisible Dark Matter That Passes Straight Through Walls?"
        analogy={
          subMode === 'cast'
            ? 'Axions produced inside the Sun stream straight through Earth untouched—until they fly inside CERN’s giant 9-Tesla LHC magnet! Like tuning an old FM radio dial with helium gas until static turns clear, matching the helium gas weight to the axion tricks the invisible axion into flipping into a detectable X-ray flash!'
            : 'Imagine two ice skaters pushed apart on ice, but one is wearing an invisibility cloak! Even if you only see one skater zooming wildly to the right, Newton’s law of momentum guarantees an invisible partner zoomed off to the exact left with identical force!'
        }
        keyPoints={[
          'CAST (CERN Axion Solar Telescope): Repurposed an actual 9.26-meter LHC test magnet tilted to track the Sun at sunrise and sunset.',
          'Mono-Jet Recoil (ATLAS/CMS): Total momentum sideways to the proton beam must add up to zero—missing momentum means an invisible particle escaped!',
          'Both experiments rule out huge regions of dark matter models and hunt the 85% missing mass of our universe.',
        ]}
        whatToTry={
          subMode === 'cast'
            ? 'Move the ⁴He Buffer Gas Mass slider until m_γ exactly matches m_a — watch the coherence resonance spike to 100%!'
            : 'Rotate the Jet Angle slider and drag Transverse Recoil Energy — watch the dashed invisible Dark Matter arrow recoil strictly opposite to the visible jet!'
        }
        doi="10.1038/nphys4109"
        citationLabel="CAST Collaboration (2017), Nature Physics · New CAST limit on the axion-photon interaction"
      />

      {subMode === 'cast' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Primakoff Coherence Resonance Graph */}
          <div className="lg:col-span-7 p-4 bg-[#070B12] border-3 border-black shadow-[6px_6px_0px_#000] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="font-bold uppercase text-amber-300 flex items-center gap-1.5">
                <Radio className="w-4 h-4" /> Primakoff Coherence Spectrum sinc²(q·L/2)
              </span>
              <span
                className={`px-2 py-0.5 font-black border border-black ${
                  primakoff.coherenceFactor > 0.7 ? 'bg-emerald-400 text-black' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                Coherence: {(primakoff.coherenceFactor * 100).toFixed(1)}%
              </span>
            </div>

            {/* Live Animated CAST Dipole Magnet Bore Conversion Tube */}
            <svg viewBox="0 0 440 72" className="w-full h-18 bg-[#04070D] border-2 border-zinc-800">
              <rect x="82" y="10" width="270" height="52" fill="#0c1526" stroke="#38bdf8" strokeWidth="2" />
              <text x="217" y="22" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                CAST 9.26m SUPERCONDUCTING DIPOLE ({bFieldT.toFixed(1)} T · ⁴He m_γ={plasmaMassEv.toFixed(2)}eV)
              </text>
              <text x="40" y="40" fill="#FACC15" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                ☀️ AXIONS
              </text>
              <text x="398" y="40" fill="#00E5FF" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                X-RAY DET
              </text>
              {/* Traveling Solar Axions & Primakoff Photons */}
              {Array.from({ length: 6 }, (_, i) => {
                const prog = (animPhase * 0.45 + i / 6) % 1;
                const px = 65 + prog * 310;
                const insideMagnet = px >= 85 && px <= 350;
                const converted = prog > 0.48 && primakoff.coherenceFactor > 0.15;
                const cy = 42 + Math.sin(prog * 18 + i) * 7;
                return (
                  <circle
                    key={i}
                    cx={px}
                    cy={cy}
                    r={converted ? 4 + primakoff.coherenceFactor * 2 : 3}
                    fill={converted ? '#00E5FF' : '#FACC15'}
                    opacity={insideMagnet || converted ? 0.95 : 0.65}
                  />
                );
              })}
            </svg>

            <svg viewBox="0 0 440 165" className="w-full h-44 bg-[#04070D] border-2 border-zinc-800">
              <line x1="35" y1="135" x2="415" y2="135" stroke="#334155" strokeWidth="1.5" />
              <polyline
                fill="none"
                stroke="#FACC15"
                strokeWidth="3"
                points={scanCurve.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
              />
              {/* Tuned helium mass marker */}
              {(() => {
                const px = 35 + ((plasmaMassEv - 0.01) / 0.99) * 380;
                const py = 135 - Math.min(1, primakoff.coherenceFactor) * 110;
                return (
                  <g>
                    <line x1={px} y1="15" x2={px} y2="135" stroke="#00E5FF" strokeWidth="2" strokeDasharray="3 3" />
                    <circle cx={px} cy={py} r="6" fill="#00E5FF" stroke="#000" strokeWidth="2" />
                    <text x="40" y="152" fill="#64748B" fontSize="9" fontFamily="monospace">
                      m_γ = 0.01 eV
                    </text>
                    <text x="345" y="152" fill="#64748B" fontSize="9" fontFamily="monospace">
                      1.00 eV
                    </text>
                  </g>
                );
              })()}
            </svg>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-canvas-sub border-2 border-black">
                <span className="text-[10px] text-text-muted block uppercase font-bold">Conversion Prob P(a→γ)</span>
                <span className="text-cern-cyan font-black">{primakoff.probability.toExponential(2)}</span>
              </div>
              <div className="p-2.5 bg-canvas-sub border-2 border-black">
                <span className="text-[10px] text-text-muted block uppercase font-bold">Momentum Mismatch q</span>
                <span className="text-amber-300 font-black">{primakoff.momentumTransferEv.toExponential(2)} eV</span>
              </div>
              <div className="p-2.5 bg-canvas-sub border-2 border-black">
                <span className="text-[10px] text-text-muted block uppercase font-bold">Magnet Bore Spec</span>
                <span className="text-white font-bold">9.26 m LHC Dipole</span>
              </div>
            </div>
          </div>

          {/* Right 5 cols: Magnet & Gas Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-canvas-surface border-3 border-black shadow-[5px_5px_0px_#000] space-y-3">
              <h3 className="text-sm font-display font-black uppercase text-white border-b-2 border-black pb-2 flex items-center gap-2">
                <Magnet className="w-4 h-4 text-amber-400" /> CAST Magnet &amp; ⁴He Tuning
              </h3>

              <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-text-muted uppercase">Hidden Axion Mass (m_a):</span>
                  <span className="text-[#FFE600]">{axionMassEv.toFixed(2)} eV</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.01}
                  value={axionMassEv}
                  onChange={(e) => setAxionMassEv(Number(e.target.value))}
                  className="w-full accent-[#FFE600] cursor-pointer"
                />
              </div>

              <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-text-muted uppercase">⁴He Buffer Gas Mass (m_γ):</span>
                  <span className="text-cern-cyan">{plasmaMassEv.toFixed(2)} eV</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.01}
                  value={plasmaMassEv}
                  onChange={(e) => setPlasmaMassEv(Number(e.target.value))}
                  className="w-full accent-cern-cyan cursor-pointer"
                />
              </div>

              <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-text-muted uppercase">Dipole Magnetic Field (B):</span>
                  <span className="text-emerald-400">{bFieldT.toFixed(1)} Tesla</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={12.0}
                  step={0.5}
                  value={bFieldT}
                  onChange={(e) => setBFieldT(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] text-xs font-sans text-text-secondary">
              <span className="text-[11px] font-mono font-bold uppercase text-cern-cyan block mb-1">
                <Info className="w-3.5 h-3.5 inline mr-1" /> {userLevel} Note
              </span>
              {userLevel === 'BEGINNER'
                ? 'Just like matching two tuning forks makes one sing, filling the magnet pipe with cold helium gas slows X-ray light down just enough to match the invisible solar axion!'
                : 'In vacuum, massive axions outphase from massless photons after distance L_coh = π/q. Introducing buffer gas creates an effective plasma photon mass m_γ ∝ √n_e restoring coherence.'}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: 2D Transverse Plane Recoil Event Display */}
          <div className="lg:col-span-7 p-4 bg-[#070B12] border-3 border-black shadow-[6px_6px_0px_#000] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold uppercase text-pink-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Transverse Detector View (x-y Plane)
              </span>
              <span className="px-2 py-0.5 bg-pink-500 text-black font-black border border-black">
                p_T^miss = {jetPtGev} GeV
              </span>
            </div>

            <svg viewBox="0 0 320 240" className="w-full h-60 bg-[#04070D] border-2 border-zinc-800">
              {/* Concentric Detector Rings (Tracker, ECAL, HCAL) */}
              <circle cx="160" cy="120" r="105" fill="none" stroke="#1E293B" strokeWidth="14" />
              <circle cx="160" cy="120" r="72" fill="none" stroke="#0F172A" strokeWidth="12" />
              <circle cx="160" cy="120" r="40" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Visible Jet Spray Cone + Animated Particles */}
              {[-10, -4, 0, 4, 10].map((offset, idx) => {
                const r = ((jetAngleDeg + offset) * Math.PI) / 180;
                const pulseFrac = (animPhase * 0.8 + idx * 0.18) % 1;
                const dotDist = 12 + pulseFrac * (vectorLen - 12);
                return (
                  <g key={offset}>
                    <line
                      x1="160"
                      y1="120"
                      x2={160 + Math.cos(r) * vectorLen}
                      y2={120 - Math.sin(r) * vectorLen}
                      stroke="#00FF66"
                      strokeWidth={offset === 0 ? 3.5 : 1.5}
                      opacity={offset === 0 ? 1 : 0.65}
                    />
                    {!reduceMotion && (
                      <circle
                        cx={160 + Math.cos(r) * dotDist}
                        cy={120 - Math.sin(r) * dotDist}
                        r={2.8}
                        fill="#FFFFFF"
                        opacity={1 - pulseFrac * 0.6}
                      />
                    )}
                  </g>
                );
              })}

              {/* Recoiling Missing Transverse Energy (Invisible WIMP pair) */}
              <line
                x1="160"
                y1="120"
                x2={metX}
                y2={metY}
                stroke="#FF0055"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                strokeDashoffset={-animPhase * 18}
              />
              <circle cx={metX} cy={metY} r="5" fill="#FF0055" stroke="#000" strokeWidth="1.5" />
              <circle cx={jetX} cy={jetY} r="5" fill="#00FF66" stroke="#000" strokeWidth="1.5" />
              <circle cx="160" cy="120" r="4" fill="#FFFFFF" />

              <text x="14" y="20" fill="#00FF66" fontSize="10" fontFamily="monospace" fontWeight="bold">
                Visible Quark/Gluon Jet: {jetPtGev} GeV
              </text>
              <text x="14" y="228" fill="#FF0055" fontSize="10" fontFamily="monospace" fontWeight="bold">
                Dashed Red = Invisible E_T^miss (-{jetPtGev} GeV)
              </text>
            </svg>
          </div>

          {/* Right 5 cols: Mono-Jet Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-canvas-surface border-3 border-black shadow-[5px_5px_0px_#000] space-y-3">
              <h3 className="text-sm font-display font-black uppercase text-white border-b-2 border-black pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" /> Collision Recoil Controls
              </h3>

              <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-text-muted uppercase">Recoil Energy (p_T^miss):</span>
                  <span className="text-pink-400">{jetPtGev} GeV</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={800}
                  step={10}
                  value={jetPtGev}
                  onChange={(e) => setJetPtGev(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-text-muted uppercase">Visible Jet Angle (φ):</span>
                  <span className="text-emerald-400">{jetAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  value={jetAngleDeg}
                  onChange={(e) => setJetAngleDeg(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] text-xs font-mono space-y-1.5">
              <div className="text-cern-cyan font-bold uppercase">Transverse Momentum Balance Law:</div>
              <div className="text-white font-bold">Σ p_T(visible) + p_T^miss = 0 GeV/c</div>
              <p className="text-text-secondary font-sans text-xs pt-1">
                Before colliding, protons move purely along the beam pipe (transverse momentum = 0). Any unbalanced green jet leaves a sharp missing-momentum signature of invisible Dark Matter (χχ̄)!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
