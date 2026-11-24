'use client';

import React, { useState } from 'react';
import { Value } from '@/components/provenance/Value';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Zap, Snowflake, Wind, Activity, Info, ShieldCheck } from 'lucide-react';

export default function EngineeringPage() {
  const [magnetCurrentKa, setMagnetCurrentKa] = useState<number>(11.85); // kA nominal current
  const [temperatureK, setTemperatureK] = useState<number>(1.9); // 1.9 K superfluid He

  // B-field formula: B ≈ 8.33 * (I / 11.85) * (T < 2.17 ? 1 : quench factor)
  const isSuperconducting = temperatureK <= 2.17; // Lambda point of liquid helium
  const dipoleField = isSuperconducting ? (8.33 * (magnetCurrentKa / 11.85)).toFixed(2) : '0.00 (QUENCH)';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase bg-cern-cyan text-black px-2 py-0.5 border border-black font-bold tracking-wider shadow-[2px_2px_0px_#000]">
            EXTREME SCIENTIFIC ENGINEERING
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight text-text-primary">
          CERN Engineering Digital Twin
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-mono">
          Operating the LHC demands technologies pushed to thermodynamic, electromagnetic, and material
          limits: superconducting magnets colder than deep space, vacuum cleaner than interplanetary
          space, and radiofrequency fields accelerating particles to 99.999999% the speed of light.
        </p>
      </div>

      {/* Engineering Systems Sandbox Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Superconducting Magnets */}
        <div className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-base font-display font-black uppercase text-text-primary flex items-center gap-2">
              <Zap className="w-5 h-5 text-cern-cyan" /> Superconducting Main Dipoles
            </h2>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            1,232 twin-aperture dipoles steer the twin counter-rotating beams around the 27 km ring.
            Wound from niobium-titanium (Nb-Ti) superconducting Rutherford cables carrying nearly 12,000
            amperes.
          </p>

          {/* Interactive Magnet Control */}
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <div className="flex justify-between text-xs font-mono mb-1 font-bold">
                <span className="text-text-muted uppercase">Excitation Current:</span>
                <span className="text-cern-cyan">{magnetCurrentKa.toFixed(2)} kA</span>
              </div>
              <input
                type="range"
                min={0}
                max={13}
                step={0.1}
                value={magnetCurrentKa}
                onChange={(e) => setMagnetCurrentKa(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
              />
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <div className="flex justify-between text-xs font-mono mb-1 font-bold">
                <span className="text-text-muted uppercase">Helium Temperature:</span>
                <span className={`font-bold ${isSuperconducting ? 'text-emerald-400' : 'text-red-400'}`}>
                  {temperatureK.toFixed(2)} K {isSuperconducting ? '(Superfluid He-II)' : '(QUENCH)'}
                </span>
              </div>
              <input
                type="range"
                min={1.5}
                max={4.5}
                step={0.05}
                value={temperatureK}
                onChange={(e) => setTemperatureK(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted uppercase font-bold">Magnetic Field:</span>
              <span
                className={`text-base font-black ${
                  isSuperconducting ? 'text-cern-cyan' : 'text-red-400 animate-pulse'
                }`}
              >
                {dipoleField} {isSuperconducting ? 'Tesla' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Module 2: Cryogenics */}
        <div className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-base font-display font-black uppercase text-text-primary flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-cern-accent" /> Cryogenic Cooling (1.9 K)
            </h2>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            The LHC is the coldest place on Earth. 96 tonnes of superfluid liquid helium chill the 36,000
            tonnes of cold mass to 1.9 Kelvin (-271.3 °C), colder than outer space (2.7 Kelvin cosmic
            microwave background).
          </p>

          <div className="space-y-2 pt-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Liquid Helium Inventory:</span>
              <span className="text-text-primary font-bold">96 tonnes</span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Helium Lambda Point:</span>
              <span className="text-cern-cyan font-bold">2.17 K</span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Total Refrigeration:</span>
              <span className="text-text-primary font-bold">144 kW @ 4.5 K</span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Superfluid Conductivity:</span>
              <span className="text-emerald-400 font-bold">~100,000× Copper</span>
            </div>
          </div>
        </div>

        {/* Module 3: Ultra-High Vacuum */}
        <div className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-base font-display font-black uppercase text-text-primary flex items-center gap-2">
              <Wind className="w-5 h-5 text-emerald-400" /> Beam Vacuum Systems
            </h2>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            Inside the beam vacuum chambers, residual gas atoms must not collide with circulating
            particles to prevent beam degradation. The pressure is maintained at $10^{-10}$ to $10^{-11}$
            mbar using cryogenic cryopumping and Non-Evaporable Getter (NEG) coatings.
          </p>

          <div className="space-y-2 pt-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Beam Pipe Pressure:</span>
              <span className="text-emerald-400 font-bold">10⁻¹⁰ to 10⁻¹¹ mbar</span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Atmospheric Comparison:</span>
              <span className="text-text-secondary font-bold">~10⁻¹⁴ Atmosphere</span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Expected Beam Lifetime:</span>
              <span className="text-text-primary font-bold">&gt; 100 hours</span>
            </div>
          </div>
        </div>

        {/* Module 4: Superconducting RF Cavities */}
        <div className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-base font-display font-black uppercase text-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FFE600]" /> 400 MHz RF Cavities
            </h2>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            Eight superconducting radiofrequency (RF) cavities per beam oscillate at 400.789 MHz,
            delivering an electric field gradient of 5.5 MV/m to boost proton energy by 485 keV on each
            revolution and hold bunches tightly in longitudinal phase space.
          </p>

          <div className="space-y-2 pt-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">RF Resonance Frequency:</span>
              <span className="text-[#FFE600] font-bold">400.789 MHz</span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Peak Accelerating Voltage:</span>
              <span className="text-text-primary font-bold">16 MV per beam</span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Energy Gain / Turn:</span>
              <span className="text-emerald-400 font-bold">485 keV / turn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
