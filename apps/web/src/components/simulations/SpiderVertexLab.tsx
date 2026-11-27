'use client';

import React, { useState, useMemo, useId } from 'react';
import { calculateDisplacedVertexDecay } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { Activity } from 'lucide-react';

export const SpiderVertexLab: React.FC = () => {
  const sliderPrefix = useId();
  const [lifetimePs, setLifetimePs] = useState<number>(3500);
  const [llpMassGev, setLlpMassGev] = useState<number>(12.0);
  const [llpEnergyGev, setLlpEnergyGev] = useState<number>(140.0);

  const decay = useMemo(
    () => calculateDisplacedVertexDecay(lifetimePs, llpMassGev, llpEnergyGev),
    [lifetimePs, llpMassGev, llpEnergyGev]
  );

  // Map 0 -> 14 m detector radius horizontally in SVG (x=40..440)
  const decayBarPx = Math.min(395, (decay.boostedDecayLengthM / 14) * 395);

  return (
    <div className="space-y-5">
      <Eli5Card
        title="Spider-Verse Dimensional Glitches = Displaced Vertices at ATLAS, CMS & FASER!"
        analogy="Most particles explode instantly at the collision center. But mysterious Long-Lived Particles act like ghosts glitching invisibly across solid iron—flying whole centimeters or meters without leaving a single track, then suddenly erupting into twin muons mid-detector!"
      />

      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <FidelityBadge type="ANALYTIC" />
            <span className="px-2 py-0.5 bg-cern-magenta text-white font-mono font-black text-[10px] border-2 border-black uppercase">
              DISPLACED VERTEX LAB // LLP &amp; FASER
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-display font-black text-white">
            Long-Lived Particle Flight &amp; Displaced Vertex Glitch Chamber
          </h2>
          <p className="text-xs font-mono text-text-secondary mt-1">
            Relativistic Lorentz dilation L = γβcτ₀ across Pixel Tracker, Calorimeters, Muon Chambers, and FASER.
          </p>
        </div>

        <div className="px-3 py-2 bg-black border-2 border-cern-magenta font-mono text-xs shadow-[3px_3px_0px_#00E5FF]">
          Mean Lab Decay: <strong className="text-[#FFE600]">{decay.boostedDecayLengthM.toFixed(2)} m</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 space-y-4 bg-canvas-surface border-3 border-black p-4 shadow-[5px_5px_0px_#000]">
          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-tau`} className="text-text-muted uppercase">
                Proper Lifetime τ₀:
              </label>
              <span className="text-cern-magenta">{lifetimePs.toFixed(0)} ps</span>
            </div>
            <input
              id={`${sliderPrefix}-tau`}
              type="range"
              min={50}
              max={15000}
              step={50}
              value={lifetimePs}
              aria-valuetext={`${lifetimePs} picoseconds`}
              onChange={(e) => setLifetimePs(Number(e.target.value))}
              className="w-full accent-cern-magenta cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-m`} className="text-text-muted uppercase">
                LLP Rest Mass m_X:
              </label>
              <span className="text-cern-cyan">{llpMassGev.toFixed(1)} GeV</span>
            </div>
            <input
              id={`${sliderPrefix}-m`}
              type="range"
              min={1}
              max={100}
              step={0.5}
              value={llpMassGev}
              aria-valuetext={`${llpMassGev} GeV`}
              onChange={(e) => setLlpMassGev(Number(e.target.value))}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <label htmlFor={`${sliderPrefix}-e`} className="text-text-muted uppercase">
                Particle Lab Energy E_X:
              </label>
              <span className="text-[#FFE600]">{llpEnergyGev.toFixed(0)} GeV</span>
            </div>
            <input
              id={`${sliderPrefix}-e`}
              type="range"
              min={20}
              max={1200}
              step={10}
              value={llpEnergyGev}
              aria-valuetext={`${llpEnergyGev} GeV`}
              onChange={(e) => setLlpEnergyGev(Number(e.target.value))}
              className="w-full accent-[#FFE600] cursor-pointer"
            />
          </div>

          <MathFormula
            tex="L_{\text{lab}} = \gamma\beta c\tau_0, \quad P(r_1 \le r \le r_2) = e^{-r_1/L_{\text{lab}}} - e^{-r_2/L_{\text{lab}}}"
            label="Boosted Vertex Displacement Law:"
          />
        </div>

        <div className="xl:col-span-8 space-y-4">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">Tracker (&lt;1.2 m)</dt>
              <dd className="text-cern-cyan font-black text-base">{(decay.probInsideTracker * 100).toFixed(1)}%</dd>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">Calorimeter (1.2–3.8 m)</dt>
              <dd className="text-[#FFE600] font-black text-base">{(decay.probInsideCalorimeter * 100).toFixed(1)}%</dd>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">Muon Spec (3.8–12 m)</dt>
              <dd className="text-cern-magenta font-black text-base">{(decay.probInsideMuonSpec * 100).toFixed(1)}%</dd>
            </div>
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <dt className="text-[10px] text-text-muted uppercase">FASER Window (480 m)</dt>
              <dd className="text-emerald-400 font-black text-base">{(decay.probFarForwardFaser * 100).toFixed(2)}%</dd>
            </div>
          </dl>

          {/* Chromatic Glitch Radial Shell Visualizer */}
          <div className="bg-[#070510] border-3 border-black p-4 shadow-[5px_5px_0px_#000] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cern-magenta" /> Radial Detector Cross-Section (0 m IP → 14 m Cavern Wall)
              </span>
              <span className="text-cern-cyan">Dashed: Invisible LLP Flight</span>
            </div>

            <svg viewBox="0 0 460 190" className="w-full h-52 bg-[#05030C] border border-zinc-800" aria-label="Displaced vertex radial shell flight diagram">
              {/* Detector Shells */}
              <rect x="40" y="25" width="34" height="130" fill="rgba(0,229,255,0.12)" stroke="#00E5FF" strokeWidth="1.5" />
              <text x="57" y="172" textAnchor="middle" fill="#00E5FF" fontSize="9" fontFamily="monospace">Tracker</text>

              <rect x="74" y="25" width="74" height="130" fill="rgba(255,230,0,0.09)" stroke="#FFE600" strokeWidth="1.5" />
              <text x="111" y="172" textAnchor="middle" fill="#FFE600" fontSize="9" fontFamily="monospace">ECAL/HCAL</text>

              <rect x="148" y="25" width="232" height="130" fill="rgba(255,0,85,0.08)" stroke="#FF0055" strokeWidth="1.5" />
              <text x="264" y="172" textAnchor="middle" fill="#FF0055" fontSize="9" fontFamily="monospace">Muon Spectrometer (4m–12m)</text>

              {/* IP center */}
              <circle cx="40" cy="90" r="6" fill="#FFFFFF" />

              {/* Invisible neutral LLP flight */}
              <line
                x1="40"
                y1="90"
                x2={40 + decayBarPx}
                y2="90"
                stroke="#A855F7"
                strokeWidth="3"
                strokeDasharray="6 5"
              />

              {/* Chromatic Spider-Glitch vertex burst & diverging tracks */}
              <circle cx={40 + decayBarPx + 2} cy="91" r="8" fill="#00E5FF" opacity="0.5" />
              <circle cx={40 + decayBarPx - 2} cy="89" r="8" fill="#FF0055" opacity="0.7" />
              <circle cx={40 + decayBarPx} cy="90" r="6" fill="#FFE600" />

              <line x1={40 + decayBarPx} y1="90" x2={Math.min(450, 40 + decayBarPx + 75)} y2="42" stroke="#00FF66" strokeWidth="2.5" />
              <line x1={40 + decayBarPx} y1="90" x2={Math.min(450, 40 + decayBarPx + 75)} y2="138" stroke="#00FF66" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
