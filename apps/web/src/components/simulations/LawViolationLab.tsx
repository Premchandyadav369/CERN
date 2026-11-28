'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  calculateFromTotalEnergy,
  calculateSuperconductingMagnetMetrics,
  validateInteractionConservation,
  calculateSacredTimelineVacuum,
  evaluateLhcPartonLuminosity,
  PROTON_MASS_GEV,
  ELECTRON_MASS_GEV,
} from '@cern-x/sim-core';
import { LawGuardBanner } from '@/components/ui/LawGuardBanner';
import { useGlobalStore } from '@/lib/store';
import { playTemPadClick } from '@/lib/sonifier';
import { ShieldAlert, Ban, CheckCircle2, Zap, Gauge, Atom, Flame, Server } from 'lucide-react';

type LawId =
  | 'speed-of-light'
  | 'superconducting-quench'
  | 'conservation-laws'
  | 'liouville-emittance'
  | 'daq-bandwidth'
  | 'vacuum-redline'
  | 'quark-confinement'
  | 'synchrotron-wallplug';

const LAW_TABS: { id: LawId; short: string; lawTag: string }[] = [
  { id: 'speed-of-light', short: '1. Faster Than Light', lawTag: 'Special Relativity' },
  { id: 'superconducting-quench', short: '2. Overdrive Magnets', lawTag: 'Thermodynamics / BCS' },
  { id: 'conservation-laws', short: '3. Fake Particle Decay', lawTag: 'Noether Symmetries' },
  { id: 'liouville-emittance', short: '4. Zero-Size Beam', lawTag: 'Liouville Theorem' },
  { id: 'daq-bandwidth', short: '5. Record Every Crash', lawTag: 'Shannon / DAQ Limit' },
  { id: 'vacuum-redline', short: '6. Break Higgs Vacuum', lawTag: 'QFT RGE Stability' },
  { id: 'quark-confinement', short: '7. Free One Quark', lawTag: 'QCD Confinement' },
  { id: 'synchrotron-wallplug', short: '8. 100 TeV e⁻ Ring', lawTag: 'Larmor Radiation' },
];

export const LawViolationLab: React.FC = () => {
  const [activeLaw, setActiveLaw] = useState<LawId>('speed-of-light');
  const recordLawViolation = useGlobalStore((s) => s.recordLawViolation);
  const testedLawViolations = useGlobalStore((s) => s.testedLawViolations);
  const hydrateChallenges = useGlobalStore((s) => s.hydrateChallenges);

  // Interactive sliders/selectors per law experiment
  const [energyExponent, setEnergyExponent] = useState<number>(4); // 10^4 GeV
  const [targetFieldT, setTargetFieldT] = useState<number>(12.5);
  const [cryoTempK, setCryoTempK] = useState<number>(1.9);
  const [illegalDecayIdx, setIllegalDecayIdx] = useState<number>(0);
  const [beamSpotUm, setBeamSpotUm] = useState<number>(1.5);
  const [keepRateMhz, setKeepRateMhz] = useState<number>(40.0);
  const [topMassGev, setTopMassGev] = useState<number>(178.5);
  const [quarkSepFm, setQuarkSepFm] = useState<number>(1.8);
  const [electronEnergyGev, setElectronEnergyGev] = useState<number>(500);

  useEffect(() => {
    hydrateChallenges();
  }, [hydrateChallenges]);

  const selectLaw = (id: LawId) => {
    playTemPadClick();
    setActiveLaw(id);
    recordLawViolation(id);
  };

  useEffect(() => {
    recordLawViolation(activeLaw);
  }, [activeLaw, recordLawViolation]);

  // Live physics evaluations via @cern-x/sim-core
  const boostedEnergyGev = Math.pow(10, energyExponent);
  const relProton = useMemo(
    () => calculateFromTotalEnergy(Math.max(PROTON_MASS_GEV + 0.1, boostedEnergyGev), PROTON_MASS_GEV),
    [boostedEnergyGev]
  );

  const magnetCheck = useMemo(
    () => calculateSuperconductingMagnetMetrics(targetFieldT, 28, cryoTempK, 'NbTi'),
    [targetFieldT, cryoTempK]
  );

  const ILLEGAL_REACTIONS = useMemo(
    () => [
      {
        label: 'p + p → μ⁺ + ν_μ  (Delete Baryons & Invent Leptons)',
        inIds: ['p', 'p'],
        outIds: ['mu_plus', 'nu_mu'],
      },
      {
        label: 'e⁻ + e⁺ → μ⁻ + e⁺  (Violates Electron & Muon Lepton Family)',
        inIds: ['e_minus', 'e_plus'],
        outIds: ['mu_minus', 'e_plus'],
      },
      {
        label: 'p → e⁺ + γ  (Forbidden Proton Decay in Standard Model)',
        inIds: ['p'],
        outIds: ['e_plus', 'gamma'],
      },
    ],
    []
  );

  const selectedReaction = ILLEGAL_REACTIONS[illegalDecayIdx] ?? ILLEGAL_REACTIONS[0];
  const conservationCheck = useMemo(
    () => validateInteractionConservation(selectedReaction.inIds, selectedReaction.outIds),
    [selectedReaction]
  );

  const vacuumCheck = useMemo(
    () => calculateSacredTimelineVacuum(118.0, topMassGev, 0.1179),
    [topMassGev]
  );

  const partonProbe = useMemo(
    () => evaluateLhcPartonLuminosity(125.25, Math.min(100, electronEnergyGev / 100)),
    [electronEnergyGev]
  );

  // Synchrotron power scaling P ~ (E / m_e)^4 for LEP/LHC 4.24 km bending radius
  const gammaElectron = electronEnergyGev / ELECTRON_MASS_GEV;
  const lepRadiusM = 3096; // LEP bending radius in LHC tunnel
  const u0GevPerTurn = 8.85e-5 * Math.pow(electronEnergyGev, 4) / lepRadiusM;
  const beamCurrentA = 0.005; // 5 mA LEP-like electron beam
  const syncPowerMw = u0GevPerTurn * 1000 * beamCurrentA; // MW rough scale
  const qcdStringTensionGevPerFm = 0.9; // ~0.9 GeV/fm QCD flux tube
  const fluxEnergyGev = qcdStringTensionGevPerFm * quarkSepFm;
  const daqThroughputGbS = keepRateMhz * 1000; // 1 MB/event -> 1000 GB/s per MHz!

  return (
    <div className="space-y-6">
      {/* Header Progress */}
      <div className="p-4 bg-canvas-sub border-3 border-black shadow-[5px_5px_0px_#FF0055] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Ban className="w-5 h-5 text-cern-magenta" />
          <div>
            <h2 className="font-display font-black text-lg text-white uppercase">
              Break the Laws of Physics: Hard Limits &amp; Interlock Lab
            </h2>
            <p className="text-xs font-mono text-text-secondary">
              Try breaking 8 fundamental conservation &amp; engineering laws below to inspect real consequences (ELI5 + Technical Proof).
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-black text-cern-cyan font-mono font-black text-xs border-2 border-black">
          {testedLawViolations.length} / {LAW_TABS.length} BARRIERS PROBED
        </span>
      </div>

      {/* Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        {LAW_TABS.map((tab) => {
          const active = activeLaw === tab.id;
          const probed = testedLawViolations.includes(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectLaw(tab.id)}
              className={`p-2.5 text-left border-2 border-black transition-all cursor-pointer ${
                active
                  ? 'bg-cern-magenta text-white shadow-[3px_3px_0px_#FFE600] -translate-y-0.5'
                  : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] opacity-85 mb-0.5">
                <span>{tab.lawTag}</span>
                {probed && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
              </div>
              <div className="font-bold truncate">{tab.short}</div>
            </button>
          );
        })}
      </div>

      {/* Active Interactive Law Experiment */}
      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-5">
        {activeLaw === 'speed-of-light' && (
          <>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-cern-cyan">
                  Inject Cosmic RF Energy: 10^{energyExponent} GeV ({boostedEnergyGev.toLocaleString()} GeV)
                </span>
                <span className="text-[#FFE600] font-black">
                  β = {(relProton.beta * 100).toFixed(8)}% of c | γ = {relProton.gamma.toExponential(2)}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={9}
                step={0.5}
                value={energyExponent}
                onChange={(e) => setEnergyExponent(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
                aria-label="Proton energy exponent"
              />
            </div>

            <LawGuardBanner
              lawName="Special Relativity: Speed Limit v < c"
              whatHappens={`Even at ${boostedEnergyGev.toLocaleString()} GeV (Lorentz factor γ = ${relProton.gamma.toExponential(2)}), proton speed freezes just under light speed at β = ${relProton.beta.toFixed(11)} c. Reaching 1.000 c requires literally infinite energy!`}
              eli5Explanation="Imagine pushing a cosmic sled that gets heavier every time you shove it faster! Above 99.9% light speed, almost 100% of your giant LHC microwave push makes the proton heavier (relativistic energy E = γmc²) instead of making it go measurably faster than light."
              technicalExplanation="As v → c, the Lorentz factor γ = 1/√(1 − β²) diverges to infinity. Because a proton has non-zero rest mass m_p ≈ 0.938 GeV/c², total energy E = γ m_p c² cannot attain β = 1 cleanly within finite spacetime energy."
              formulaTex="\beta = \sqrt{1 - \frac{1}{\gamma^2}} = \sqrt{1 - \left(\frac{m_p c^2}{E}\right)^2} < 1"
            />
          </>
        )}

        {activeLaw === 'superconducting-quench' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-cern-cyan">Commanded NbTi Dipole Field:</span>
                  <span className="text-[#FFE600] font-black">{targetFieldT.toFixed(1)} T (LHC limit ~8.9 T)</span>
                </div>
                <input
                  type="range"
                  min={6.0}
                  max={16.0}
                  step={0.2}
                  value={targetFieldT}
                  onChange={(e) => setTargetFieldT(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                  aria-label="Target dipole field Tesla"
                />
              </div>
              <div className="p-3 bg-canvas-sub border-2 border-black space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-emerald-400">Cryostat Bath Temp:</span>
                  <span className="text-white font-black">{cryoTempK.toFixed(2)} K (He-II ≤ 2.17 K)</span>
                </div>
                <input
                  type="range"
                  min={1.8}
                  max={4.5}
                  step={0.05}
                  value={cryoTempK}
                  onChange={(e) => setCryoTempK(Number(e.target.value))}
                  className="w-full accent-cern-magenta cursor-pointer"
                  aria-label="Cryostat temperature Kelvin"
                />
              </div>
            </div>

            <LawGuardBanner
              lawName="BCS Superconducting Critical Surface & Quench Barrier"
              severity={magnetCheck.quenched ? 'VIOLATION' : 'WARNING'}
              whatHappens={
                magnetCheck.quenched
                  ? `QUENCH TRIGGERED! NbTi loses zero resistance (u_B = ${magnetCheck.energyDensityMjM3.toFixed(1)} MJ/m³). Stored magnetic energy instantaneously flashes into resistive copper-busbar heat, boiling liquid helium at explosive pressure!`
                  : `Currently below NbTi quench boundary (${targetFieldT.toFixed(1)} T at ${cryoTempK.toFixed(2)} K). Raise field above 9.7 T or warm above 2.17 K to trigger quench!`
              }
              eli5Explanation="Superconducting magnets carry 11,850 Amps with zero electrical friction only when kept freezing cold inside 1.9 K superfluid liquid helium. Push the magnetic squeeze too hard or let it warm up by half a degree, and zero-friction vanishes in a millisecond—dumping lightning-bolt heat into the pipe!"
              technicalExplanation="Type-II NbTi superconductors collapse to normal resistance outside their critical surface B_c2(T, J). Once quenched, Joule heating P = I²R evaporates superfluid He-II requiring emergency energy extraction resistors and quench heaters."
              formulaTex="B_{c2}(T) \approx B_{c2}(0)\left[1 - \left(\frac{T}{T_c}\right)^{1.7}\right], \quad u_B = \frac{B^2}{2\mu_0}"
            />
          </>
        )}

        {activeLaw === 'conservation-laws' && (
          <>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {ILLEGAL_REACTIONS.map((rxn, idx) => (
                <button
                  key={rxn.label}
                  type="button"
                  onClick={() => setIllegalDecayIdx(idx)}
                  className={`px-3 py-2 border-2 border-black font-bold cursor-pointer ${
                    illegalDecayIdx === idx
                      ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  {rxn.label}
                </button>
              ))}
            </div>

            <LawGuardBanner
              lawName="Noether Gauge & Quantum Conservation Rules (Q, B, L)"
              whatHappens={`S-Matrix Amplitude STRICTLY ZERO! Violations detected by kernel: ${conservationCheck.violations.join(' | ')}`}
              eli5Explanation="Every particle reaction follows strict LEGO accounting rules! You cannot turn protons (baryons) into muons, destroy net electric charge, or swap electron-family particles into muon-family particles without balancing the quantum checkbook!"
              technicalExplanation="By Noether's Theorem, continuous U(1) symmetries impose exact invariance of electric charge Q, baryon number B, and flavor lepton numbers (L_e, L_μ, L_τ) at every perturbative Standard Model vertex."
              formulaTex="\sum_{\text{in}} Q = \sum_{\text{out}} Q,\quad \sum_{\text{in}} B = \sum_{\text{out}} B,\quad \Delta L_\ell = 0"
            />
          </>
        )}

        {activeLaw === 'liouville-emittance' && (
          <>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-cern-cyan">
                  Try Squeezing Beam Radius σ*: {beamSpotUm.toFixed(2)} μm
                </span>
                <span className="text-[#FFE600] font-black">
                  Divergence θ* ∝ 1/σ* = {(16 / Math.max(0.2, beamSpotUm)).toFixed(1)}× Nominal Spread
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={16}
                step={0.2}
                value={beamSpotUm}
                onChange={(e) => setBeamSpotUm(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
                aria-label="Beam spot radius micrometer"
              />
            </div>

            <LawGuardBanner
              lawName="Liouville Phase-Space Conservation & Beam-Beam Tune Shift"
              severity={beamSpotUm < 5 ? 'VIOLATION' : 'WARNING'}
              whatHappens={`Attempting to crush σ* down to ${beamSpotUm.toFixed(2)} μm blows beam angular divergence up by ${(16 / Math.max(0.2, beamSpotUm)).toFixed(1)}×! Inside neighboring quadrupoles the beam grows HUGE and scrapes the collimator jaws!`}
              eli5Explanation="Squeezing a particle beam is like squishing a balloon filled with water: pinch the middle super tiny at the collision point, and the beam bulges dangerously fat inside the focusing magnets right next to the detector!"
              technicalExplanation="Hamiltonian magnetic optics preserves 6D phase-space volume (Liouville Theorem: normalized emittance ε_n = γ σ_x σ_x' = const). Shrinking IP β* forces β(s) = β* + s²/β* inside inner triplets while driving nonlinear beam-beam tune shifts ΔQ."
              formulaTex="\varepsilon_n = \gamma\,\sqrt{\langle x^2\rangle\langle x'^2\rangle} = \text{const}, \qquad \beta(s) = \beta^* + \frac{s^2}{\beta^*}"
            />
          </>
        )}

        {activeLaw === 'daq-bandwidth' && (
          <>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-cern-cyan">
                  Bypass L1 Trigger — Save Rate: {keepRateMhz.toFixed(1)} MHz
                </span>
                <span className="text-cern-magenta font-black">
                  Required Write Speed: {(daqThroughputGbS / 1000).toFixed(1)} TB/s (Grid Limit ~0.01 TB/s)
                </span>
              </div>
              <input
                type="range"
                min={0.01}
                max={40}
                step={0.5}
                value={keepRateMhz}
                onChange={(e) => setKeepRateMhz(Number(e.target.value))}
                className="w-full accent-cern-magenta cursor-pointer"
                aria-label="Trigger keep rate MHz"
              />
            </div>

            <LawGuardBanner
              lawName="Shannon DAQ Bandwidth & FIFO Buffer Saturation"
              severity={keepRateMhz > 0.1 ? 'VIOLATION' : 'WARNING'}
              whatHappens={`Attempting to record ${keepRateMhz.toFixed(1)} MHz × ~1 MB/event generates ${daqThroughputGbS.toFixed(0)} GB/s (${(daqThroughputGbS * 86400 / 1e6).toFixed(1)} Exabytes/day)! Front-end readout buffers overflow within microseconds, causing ~100% blind dead-time.`}
              eli5Explanation="LHC takes 40 million huge HD detector snapshots every single second—like streaming 40 million movies at once! No hard drive array on Earth can write 40 Terabytes every second, so hardware FPGAs must delete 99.997% of ordinary proton splashes in 2.5 microseconds!"
              technicalExplanation="Bounded Level-1 latency (~2.5–12.5 μs pipeline memory) and Tier-0 optical/tape ingestion (~10 GB/s) force L1 hardware reduction from 40 MHz → 100 kHz and HLT software selection down to ~1–5 kHz."
              formulaTex="R_{\text{byte}} = f_{\text{trigger}} \times \langle S_{\text{evt}}\rangle \le B_{\text{WLCG}} \approx 10\;\text{GB/s}"
            />
          </>
        )}

        {activeLaw === 'vacuum-redline' && (
          <>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-[#FFE600]">
                  Push Top Quark Yukawa Coupling (m_t): {topMassGev.toFixed(1)} GeV
                </span>
                <span className="text-cern-magenta font-black">
                  Regime: {vacuumCheck.regime} | Instability Λ_I ≈ 10^{vacuumCheck.instabilityScaleLog10Gev.toFixed(1)} GeV
                </span>
              </div>
              <input
                type="range"
                min={168}
                max={184}
                step={0.5}
                value={topMassGev}
                onChange={(e) => setTopMassGev(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
                aria-label="Top quark mass GeV"
              />
            </div>

            <LawGuardBanner
              lawName="Electroweak Vacuum Quantum Stability Bound (NNLO RGE)"
              severity={vacuumCheck.regime === 'REDLINE' ? 'VIOLATION' : 'WARNING'}
              whatHappens={`At m_H = 118 GeV and m_t = ${topMassGev.toFixed(1)} GeV, strong negative top-quark loops drive the Higgs quartic coupling λ(μ) < 0 at μ ≈ 10^${vacuumCheck.instabilityScaleLog10Gev.toFixed(1)} GeV, opening rapid vacuum decay tunneling!`}
              eli5Explanation="Think of our universe sitting inside a cozy valley! The heavy top quark pulls that valley's wall downward at ultra-high energy. Make the top quark too heavy or Higgs too light, and the valley flips upside down—making empty space itself unstable!"
              technicalExplanation="In 2-loop/NNLO RGE running, dλ/d(ln μ) contains a dominant negative −12 y_t⁴ term. Exceeding m_H^crit forces the effective Higgs potential V_eff(φ) below our electroweak minimum faster than cosmic age."
              formulaTex="m_H^{\text{crit}} \approx 129.6 + 2.0\,(m_t - 173.34) - 0.56\,\frac{\alpha_s - 0.1184}{0.0007}\;\text{GeV}"
            />
          </>
        )}

        {activeLaw === 'quark-confinement' && (
          <>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-cern-cyan">
                  Pull Quark Separation Distance r: {quarkSepFm.toFixed(2)} fm
                </span>
                <span className="text-[#FFE600] font-black">
                  Flux Tube Energy V(r): {fluxEnergyGev.toFixed(2)} GeV (Snap &gt; 0.30 GeV!)
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3.0}
                step={0.1}
                value={quarkSepFm}
                onChange={(e) => setQuarkSepFm(Number(e.target.value))}
                className="w-full accent-cern-cyan cursor-pointer"
                aria-label="Quark separation femtometer"
              />
            </div>

            <LawGuardBanner
              lawName="QCD Color Confinement: No Free Isolated Quarks"
              severity={fluxEnergyGev >= 0.3 ? 'VIOLATION' : 'WARNING'}
              whatHappens={`String energy V(r) ≈ σ·r = ${fluxEnergyGev.toFixed(2)} GeV exceeds the pion pair creation threshold (~0.28 GeV)! The gluon flux tube SNAPS into new q q̄ pairs, producing neutral mesons & jets instead of one bare quark!`}
              eli5Explanation="Quarks are connected by unbreakable cosmic rubber bands! Unlike magnets that get weaker as you pull them apart, the gluon force between two quarks stays rock-solid until the rubber band snaps—and each snapped end instantly grows a brand-new partner quark!"
              technicalExplanation="Non-Abelian SU(3)_c gauge self-interactions squeeze chromoelectric fields into a 1D flux tube with string tension σ ≈ 0.9 GeV/fm. Asymptotic freedom holds at tiny r, while infrared confinement prevents color-charged free asymptotic states."
              formulaTex="V_{\text{QCD}}(r) \approx -\frac{4}{3}\frac{\alpha_s(r)}{r} + \sigma\,r \quad (\sigma \approx 0.9\;\text{GeV/fm})"
            />
          </>
        )}

        {activeLaw === 'synchrotron-wallplug' && (
          <>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-cern-cyan">
                  Accelerate Electrons (e⁻) in 27 km Ring: {electronEnergyGev} GeV
                </span>
                <span className="text-cern-magenta font-black">
                  Radiated Loss / Turn: {u0GevPerTurn.toFixed(2)} GeV ({(syncPowerMw / 1000).toFixed(2)} GW-scale scale!)
                </span>
              </div>
              <input
                type="range"
                min={90}
                max={1000}
                step={20}
                value={electronEnergyGev}
                onChange={(e) => setElectronEnergyGev(Number(e.target.value))}
                className="w-full accent-cern-magenta cursor-pointer"
                aria-label="Electron energy GeV"
              />
            </div>

            <LawGuardBanner
              lawName="Relativistic Larmor Synchrotron Radiation Barrier"
              severity={u0GevPerTurn > 4 ? 'VIOLATION' : 'WARNING'}
              whatHappens={`Because electrons are 1,836× lighter than protons (γ = ${gammaElectron.toExponential(2)}), forcing ${electronEnergyGev} GeV around a 3.1 km bend radiates ${u0GevPerTurn.toFixed(1)} GeV PER TURN (${((u0GevPerTurn / electronEnergyGev) * 100).toFixed(1)}% beam bleed per lap — why LEP stopped at 104.5 GeV and FCC-ee needs 91 km)!`}
              eli5Explanation="Light feathers lose way more wind energy around sharp corners than heavy bowling balls! Electrons are so tiny that bending them in the LHC tunnel makes them spray blinding X-rays every lap, melting through wall-plug electricity limits!"
              technicalExplanation="Relativistic synchrotron energy loss per turn scales as ΔE ∝ (E/m)⁴ / ρ. Replacing electrons with 1,836× heavier protons suppresses (m_p/m_e)⁴ ≈ 1.13 × 10¹³ times more radiation, enabling 6.8 TeV inside the exact same tunnel."
              formulaTex="\Delta E_{\text{turn}} = \frac{e^2}{3\varepsilon_0}\,\frac{\gamma^4}{\rho} \;\propto\; \frac{E^4}{m^4\,\rho}"
            />
          </>
        )}
      </div>

      {/* Parton luminosity subtle readout linking our new kernel cleanly */}
      <div className="p-3 bg-canvas-sub border-2 border-black text-[11px] font-mono text-text-muted flex flex-wrap items-center justify-between gap-2">
        <span>
          Parton PDF Baseline Context: Typical Higgs x ≈ <strong className="text-cern-cyan">{partonProbe.typicalX.toFixed(4)}</strong>
        </span>
        <span>All interlock calculations run live via @cern-x/sim-core</span>
      </div>
    </div>
  );
};
