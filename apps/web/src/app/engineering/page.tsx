'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { calculateVacuumMetrics } from '@cern-x/sim-core';
import { useGlobalStore } from '@/lib/store';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { CryoMagnet3DCanvas } from '@/components/engineering/CryoMagnet3DCanvas';
import { RfCavity3DCanvas } from '@/components/engineering/RfCavity3DCanvas';
import { MathFormula } from '@/components/ui/MathFormula';
import { LabExportBar } from '@/components/ui/LabExportBar';
import { TechnicalTermDeck } from '@/components/ui/TechTermInfo';
import { Zap, Snowflake, Wind, Activity, ShieldAlert, CheckCircle2, Box } from 'lucide-react';

export default function EngineeringPage() {
  // Module 1 & 2 shared magnet + cryogenics state
  const [magnetCurrentKa, setMagnetCurrentKa] = useState<number>(11.85); // kA nominal current
  const [temperatureK, setTemperatureK] = useState<number>(1.9); // 1.9 K superfluid He-II

  // Module 3: Vacuum log-exponent slider (-11 to -6 -> 10^-11 to 10^-6 mbar)
  const [vacuumLogExp, setVacuumLogExp] = useState<number>(-10);

  // Module 4: RF synchronous phase angle (degrees)
  const [rfPhaseDeg, setRfPhaseDeg] = useState<number>(1.74); // sin(1.74 deg) * 16 MV ~ 0.485 MV -> 485 keV/turn

  // Module 2 quench state
  const completeMission = useGlobalStore((s) => s.completeMission);
  const isSuperfluidHeII = temperatureK <= 2.17; // Lambda point of liquid helium
  useEffect(() => {
    if (isSuperfluidHeII) {
      completeMission('mission-quench-recovery');
    }
  }, [isSuperfluidHeII, completeMission]);
  // Nb-Ti critical temperature around 9.2 K at 0 T, drops at high field (~2.2-4.2 K margin at 8.3 T)
  // At LHC operational current (11.85 kA), magnets quench cleanly if temperature exceeds ~2.17 K thermal stability margin
  const isQuenched = temperatureK > 2.17 || (magnetCurrentKa > 12.2 && temperatureK > 2.05);
  const dipoleField = !isQuenched ? (8.33 * (magnetCurrentKa / 11.85)).toFixed(2) : '0.00 (QUENCH)';

  // Thermal conductivity model: Normal He-I (~0.02 W/m*K) vs Superfluid He-II effective conductivity jump (~1000+ W/m*K equivalent)
  const heliumPhaseLabel =
    temperatureK <= 2.17
      ? 'Superfluid He-II (Zero Viscosity)'
      : temperatureK <= 4.22
      ? 'Normal Boiling Liquid He-I'
      : 'Gaseous Helium (Warm!)';

  // Module 3: Vacuum Metrics from @cern-x/sim-core
  const pressureMbar = Math.pow(10, vacuumLogExp);
  const vacuumMetrics = useMemo(
    () => calculateVacuumMetrics(pressureMbar, temperatureK),
    [pressureMbar, temperatureK]
  );

  // Module 4: RF Cavity Physics
  const peakRfVoltageMv = 16.0; // 8 cavities x 2 MV = 16 MV per beam
  const energyGainKev = peakRfVoltageMv * 1000 * Math.sin((rfPhaseDeg * Math.PI) / 180);

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
          space, and radiofrequency waves accelerating particles to 99.999999% the speed of light.
        </p>
      </div>

      {/* ELI5 Card */}
      <Eli5Card
        title="How Do Engineers Keep Protons Flying at 99.999999% Light Speed?"
        analogy="Imagine building a 27 km circular race track colder than deep space, emptier than the Moon's surface, and timed like ocean waves pushing millions of microscopic race cars simultaneously!"
        keyPoints={[
          'Magnets (8.33 T): Without giant superconducting electromagnets, ultra-fast protons would shoot off in a straight line through Geneva.',
          'Cryogenics (1.9 K): Superfluid liquid helium turns into a weird quantum liquid below 2.17 K that removes heat 100,000× better than copper.',
          'Vacuum (10⁻¹⁰ mbar): If even a tiny puff of air leaked into the pipe, protons would crash into air molecules instead of reaching the experiments.',
          'RF Cavities (400 MHz): Electric waves push protons slightly faster every lap, like a surfer catching a wave!',
        ]}
        whatToTry="Drag Helium Temperature above 2.17 K to trigger a Magnet Quench, degrade the Vacuum pressure slider to watch beam lifetime collapse, or adjust the RF Surf Phase angle!"
        doi="10.5170/CERN-2004-003-V-1"
        citationLabel="LHC Design Report Vol. 1: Magnets, Cryogenics, Vacuum & RF"
      />

      {/* Interactive 3D Superconducting Cryostat & Dipole Twin */}
      <section className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#00E5FF] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-black">
          <h2 className="text-base font-display font-black uppercase text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-cern-cyan" /> 3D Twin-Aperture Nb-Ti Dipole Cryostat (Live Coupled View)
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-cern-cyan font-bold">
              I = {magnetCurrentKa.toFixed(2)} kA · T = {temperatureK.toFixed(2)} K · B = {dipoleField}
            </span>
            <LabExportBar title="Engineering-3D-Dipole" />
          </div>
        </div>
        <CryoMagnet3DCanvas
          magnetCurrentKa={magnetCurrentKa}
          temperatureK={temperatureK}
          isQuenched={isQuenched}
          isSuperfluidHeII={isSuperfluidHeII}
        />
      </section>

      {/* Engineering Systems Sandbox Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Superconducting Magnets */}
        <div className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-base font-display font-black uppercase text-text-primary flex items-center gap-2">
              <Zap className="w-5 h-5 text-cern-cyan" /> 1. Superconducting Main Dipoles
            </h2>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            1,232 twin-aperture dipoles steer counter-rotating beams around the 27 km ring using
            niobium-titanium (Nb-Ti) Rutherford cables carrying ~11,850 A with zero resistance.
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <div className="flex justify-between text-xs font-mono mb-1 font-bold">
                <span className="text-text-muted uppercase">Excitation Current (I):</span>
                <span className="text-cern-cyan">{magnetCurrentKa.toFixed(2)} kA</span>
              </div>
              <input
                type="range"
                min={0}
                max={13}
                step={0.05}
                value={magnetCurrentKa}
                onChange={(e) => setMagnetCurrentKa(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
              />
            </div>

            <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <div className="flex justify-between text-xs font-mono mb-1 font-bold">
                <span className="text-text-muted uppercase">Cryostat Bath Temp (T):</span>
                <span className={`font-bold ${!isQuenched ? 'text-emerald-400' : 'text-red-400'}`}>
                  {temperatureK.toFixed(2)} K {!isQuenched ? '(Nominal)' : '(THERMAL QUENCH)'}
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

            <div
              className={`p-3 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between font-mono text-xs ${
                isQuenched ? 'bg-red-950 border-red-500' : 'bg-canvas-sub'
              }`}
            >
              <span className="text-text-muted uppercase font-bold flex items-center gap-1.5">
                {isQuenched ? (
                  <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                Dipole Magnetic Field:
              </span>
              <span
                className={`text-base font-black ${
                  !isQuenched ? 'text-cern-cyan' : 'text-red-400 animate-pulse'
                }`}
              >
                {dipoleField} {!isQuenched ? 'Tesla' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Module 2: Interactive Cryogenics Phase Transition */}
        <div className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-base font-display font-black uppercase text-text-primary flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-cern-accent" /> 2. Cryogenic Phase Explorer (1.9 K)
            </h2>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            96 tonnes of helium chill 36,000 tonnes of cold mass below 2.17 K (colder than the 2.7 K
            cosmic microwave background), entering the quantum Superfluid He-II regime.
          </p>

          {/* Interactive Phase Bar */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-2">
            <div className="flex justify-between text-[11px] font-mono font-bold">
              <span className="text-cern-cyan">1.5 K (He-II Superfluid)</span>
              <span className="text-[#FFE600]">λ-Point: 2.17 K</span>
              <span className="text-red-400">4.5 K (Gas)</span>
            </div>
            <div className="relative h-5 w-full border-2 border-black bg-black flex overflow-hidden">
              <div className="h-full bg-cyan-500/80" style={{ width: '22.3%' }} title="He-II Superfluid (<2.17 K)" />
              <div className="h-full bg-amber-500/70" style={{ width: '68.3%' }} title="He-I Liquid (2.17–4.22 K)" />
              <div className="h-full bg-red-600/80" style={{ width: '9.4%' }} title="Helium Gas (>4.22 K)" />
              {/* Indicator needle */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white border-x border-black transition-all"
                style={{ left: `${((temperatureK - 1.5) / 3.0) * 100}%` }}
              />
            </div>
            <div className="text-xs font-mono font-bold text-white flex justify-between pt-1">
              <span>Current State:</span>
              <span className={isSuperfluidHeII ? 'text-cern-cyan' : 'text-amber-400'}>
                {heliumPhaseLabel}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Effective Heat Conductivity:</span>
              <span className={`font-bold ${isSuperfluidHeII ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isSuperfluidHeII ? '~100,000× Copper (Zero Viscosity)' : '0.02 W/(m·K) (Bubbling)'}
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Magnet Winding Stability:</span>
              <span className={`font-bold ${isSuperfluidHeII ? 'text-emerald-400' : 'text-red-400'}`}>
                {isSuperfluidHeII ? 'STABLE · ZERO RESISTANCE' : 'CRITICAL · FILM BOILING RISK'}
              </span>
            </div>
          </div>
        </div>

        {/* Module 3: Interactive Ultra-High Vacuum Calculator */}
        <div className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-base font-display font-black uppercase text-text-primary flex items-center gap-2">
              <Wind className="w-5 h-5 text-emerald-400" /> 3. Ultra-High Vacuum Beam Pipe
            </h2>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            Cryopumping inside the 1.9 K beam screen freezes residual gas onto copper walls, achieving
            pressures lower than the Moon&apos;s surface so protons can orbit ~11,245 times per second.
          </p>

          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
            <div className="flex justify-between text-xs font-mono mb-1 font-bold">
              <span className="text-text-muted uppercase">Beam Pipe Pressure (P):</span>
              <span className="text-emerald-400">10^{vacuumLogExp.toFixed(1)} mbar</span>
            </div>
            <input
              type="range"
              min={-11.5}
              max={-6.0}
              step={0.1}
              value={vacuumLogExp}
              onChange={(e) => setVacuumLogExp(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1">
              <span>10⁻¹¹ mbar (Ultra-Clean)</span>
              <span>10⁻¹⁰ Nominal</span>
              <span>10⁻⁶ mbar (Leak!)</span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Residual Gas Density:</span>
              <span className="text-cern-cyan font-bold">
                {vacuumMetrics.molecularDensityCm3.toExponential(2)} molecules/cm³
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Proton Mean Free Path:</span>
              <span className="text-text-primary font-bold">
                {(vacuumMetrics.meanFreePathMeters / 1e9).toExponential(2)} million km
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Beam-Gas Lifetime (τ):</span>
              <span
                className={`font-black ${
                  vacuumMetrics.beamLifetimeHours >= 50
                    ? 'text-emerald-400'
                    : vacuumMetrics.beamLifetimeHours >= 5
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {vacuumMetrics.beamLifetimeHours >= 1
                  ? `${vacuumMetrics.beamLifetimeHours.toFixed(1)} hours`
                  : `${(vacuumMetrics.beamLifetimeHours * 60).toFixed(2)} mins (DUMP BEAM!)`}
              </span>
            </div>
          </div>
        </div>

        {/* Module 4: Interactive 400 MHz RF Cavity Wave-Surfing */}
        <div className="p-6 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-base font-display font-black uppercase text-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FFE600]" /> 4. 400 MHz RF Wave &amp; Bunch Surfing
            </h2>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            Eight niobium-on-copper superconducting cavities oscillate at 400.789 MHz (16 MV peak).
            Protons ride the rising slope of the RF wave so lagging protons get kicked harder!
          </p>

          <RfCavity3DCanvas rfPhaseDeg={rfPhaseDeg} />

          <MathFormula
            tex="\Delta E_{\text{turn}} = q V_{\text{RF}} \sin\phi_s"
            label="Synchronous Energy Gain:"
            derivation="At phase phi_s = 1.74 degrees with V_RF = 16 MV, protons gain ~485 keV each lap around the 27 km LHC."
          />

          {/* Interactive SVG RF Wave Bucket */}
          <div className="p-2 bg-black border-2 border-black">
            <svg viewBox="0 0 360 95" className="w-full h-24">
              <line x1="0" y1="48" x2="360" y2="48" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              <path
                d={Array.from({ length: 73 }, (_, i) => {
                  const x = i * 5;
                  const rad = (i / 72) * Math.PI * 2;
                  const y = 48 - Math.sin(rad) * 34;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`;
                }).join(' ')}
                fill="none"
                stroke="#FFE600"
                strokeWidth="2.5"
              />
              {/* Bunch position on RF wave */}
              {(() => {
                const rad = (rfPhaseDeg * Math.PI) / 180;
                const bx = (rfPhaseDeg / 360) * 360;
                const by = 48 - Math.sin(rad) * 34;
                return (
                  <g>
                    <line x1={bx} y1="10" x2={bx} y2="85" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="2 2" />
                    <ellipse cx={bx} cy={by} rx="10" ry="5" fill="#00E5FF" stroke="#000" strokeWidth="1.5" />
                    <text x={Math.min(bx + 14, 240)} y={Math.max(by - 6, 16)} fill="#00E5FF" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      Proton Bunch (φ_s = {rfPhaseDeg.toFixed(1)}°)
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
            <div className="flex justify-between text-xs font-mono mb-1 font-bold">
              <span className="text-text-muted uppercase">Synchronous Phase (φ_s):</span>
              <span className="text-[#FFE600]">{rfPhaseDeg.toFixed(2)}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={0.5}
              value={rfPhaseDeg}
              onChange={(e) => setRfPhaseDeg(Number(e.target.value))}
              className="w-full accent-[#FFE600] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1">
              <span>0° (Storage / Coasting)</span>
              <span>1.7° (Nominal Ramp)</span>
              <span>90° (Peak Max Gradient)</span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Energy Gain / Turn (qV·sinφ):</span>
              <span className="text-emerald-400 font-black">
                {energyGainKev >= 1000
                  ? `${(energyGainKev / 1000).toFixed(2)} MeV / turn`
                  : `${energyGainKev.toFixed(1)} keV / turn`}
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted uppercase font-bold">Laps to Reach 6.8 TeV:</span>
              <span className="text-text-primary font-bold">
                {energyGainKev > 1
                  ? `${((6350e6) / (energyGainKev * 1000) / 1e6).toFixed(2)} million turns`
                  : '∞ (Coasting Mode)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <TechnicalTermDeck contextId="page-engineering" heading="Cryogenics, Vacuum & RF Cavity Terms (ⓘ Info Cards)" />
    </div>
  );
}
