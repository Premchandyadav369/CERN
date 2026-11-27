import { describe, it, expect } from 'vitest';
import {
  PROTON_MASS_GEV,
  LHC_BENDING_RADIUS_M,
} from '../src/physics/constants.js';
import {
  calculateFromKineticEnergy,
  calculateFromTotalEnergy,
  colliderCenterOfMassEnergy,
  fixedTargetCenterOfMassEnergy,
  twoBodyInvariantMass,
} from '../src/physics/kinematics.js';
import {
  calculateMagneticRigidity,
  calculateRequiredDipoleField,
} from '../src/physics/rigidity.js';
import {
  simpleSignificance,
  asimovSignificance,
  calculateAMS,
} from '../src/physics/statistics.js';
import {
  validateInteractionConservation,
  calculateEeToMumuCrossSectionNb,
  calculateCyclotronRadiusMeters,
  calculateVacuumMetrics,
} from '../src/physics/feynman.js';
import {
  calculateElectroweakPhase,
  calculatePrimakoffConversion,
  calculateSacredTimelineVacuum,
  calculateSuperconductingMagnetMetrics,
  calculateDisplacedVertexDecay,
  calculateExtraDimensionKaluzaKlein,
  calculateDiracMonopoleMetrics,
  HIGGS_VEV_GEV,
  ELECTROWEAK_TC_GEV,
} from '../src/physics/bsm.js';
import {
  calculateSemiEmpiricalBindingEnergy,
  calculateMassSeparatorDeflection,
  calculateCherenkovCone,
  calculateSpectralXRayAttenuation,
  calculateNeutrinoOscillation,
  calculateLhcFillCycle,
} from '../src/physics/nuclear.js';
import { SeededRNG } from '../src/rng/prng.js';

describe('Physics Validation Suite', () => {
  describe('Relativistic Kinematics', () => {
    it('accurately computes beta, gamma, and momentum from kinetic energy for a 7 TeV proton', () => {
      // 7 TeV proton: kinetic energy ~ 6999.06 GeV or total energy 7000 GeV
      const state = calculateFromTotalEnergy(7000, PROTON_MASS_GEV);

      // gamma = 7000 / 0.938272... ≈ 7460.5
      expect(state.gamma).toBeCloseTo(7000 / PROTON_MASS_GEV, 2);

      // beta should be extremely close to 1: beta = sqrt(1 - 1/gamma^2)
      expect(state.beta).toBeGreaterThan(0.9999999);
      expect(state.beta).toBeLessThan(1.0);

      // E^2 = p^2 + m^2 => p = sqrt(E^2 - m^2)
      const pExpected = Math.sqrt(7000 * 7000 - PROTON_MASS_GEV * PROTON_MASS_GEV);
      expect(state.momentumGevC).toBeCloseTo(pExpected, 4);
    });

    it('correctly satisfies E^2 = p^2 + m^2 for various energies', () => {
      const testEnergiesGev = [1.0, 10.0, 450.0, 6800.0, 7000.0];
      for (const e of testEnergiesGev) {
        const state = calculateFromTotalEnergy(e, PROTON_MASS_GEV);
        const reconstructedE = Math.sqrt(
          state.momentumGevC * state.momentumGevC + PROTON_MASS_GEV * PROTON_MASS_GEV
        );
        expect(reconstructedE).toBeCloseTo(e, 5);
      }
    });

    it('validates symmetric collider vs fixed-target sqrt(s)', () => {
      // Symmetric collider at 450 GeV per beam (LHC injection energy) -> sqrt(s) = 900 GeV
      expect(colliderCenterOfMassEnergy(450)).toBe(900);

      // Fixed target: 450 GeV proton onto stationary proton target (m = 0.938 GeV)
      // sqrt(s) = sqrt(m^2 + m^2 + 2 * E * m)
      const sqrtSFixed = fixedTargetCenterOfMassEnergy(450, PROTON_MASS_GEV, PROTON_MASS_GEV);
      // sqrt(2*0.93827^2 + 2*450*0.93827) ≈ sqrt(1.76 + 844.44) ≈ 29.088 GeV
      expect(sqrtSFixed).toBeCloseTo(29.09, 1);
    });
  });

  describe('Magnetic Rigidity & LHC Dipole Field Sanity', () => {
    it('calculates magnetic rigidity B*rho for 7 TeV proton (~23,350 T*m)', () => {
      const p = 7000; // GeV/c
      const bRho = calculateMagneticRigidity(p, 1);
      // B*rho = 7000 / 0.299792458 = 23,349.46 T*m
      expect(bRho).toBeCloseTo(23349.5, 0);
    });

    it('validates LHC dipole field ≈ 8.3 T for nominal bending radius ≈ 2804 m', () => {
      const p = 7000; // GeV/c
      const b = calculateRequiredDipoleField(p, LHC_BENDING_RADIUS_M, 1);
      // B = 23349.46 / 2803.95 = 8.327 T
      expect(b).toBeCloseTo(8.33, 1);
      expect(b).toBeGreaterThan(8.2);
      expect(b).toBeLessThan(8.5);
    });
  });

  describe('Invariant Mass Resonance Reconstruction', () => {
    it('reconstructs a 125 GeV Higgs resonance from two-body diphoton decay', () => {
      // In center of mass of 125 GeV resonance at rest, two back-to-back 62.5 GeV photons
      // pt1 = 62.5, eta1 = 0, phi1 = 0
      // pt2 = 62.5, eta2 = 0, phi2 = pi
      const mass = twoBodyInvariantMass(62.5, 0, 0, 62.5, 0, Math.PI);
      expect(mass).toBeCloseTo(125.0, 4);

      // Photons with pseudorapidity separation:
      // Say pt1 = 50, pt2 = 50, deltaEta = 1.0, deltaPhi = 2.4
      const generalMass = twoBodyInvariantMass(50, 0.5, 0.0, 50, -0.5, 2.4);
      expect(generalMass).toBeGreaterThan(0);
    });

    it('demonstrates mean peak reconstruction within tolerance using seeded RNG', () => {
      const rng = new SeededRNG(1337);
      const trueMass = 125.0;
      const sigma = 1.5; // detector resolution 1.5 GeV
      const reconstructedMasses: number[] = [];

      for (let i = 0; i < 200; i++) {
        const m = rng.gaussian(trueMass, sigma);
        reconstructedMasses.push(m);
      }

      const mean = reconstructedMasses.reduce((a, b) => a + b, 0) / reconstructedMasses.length;
      expect(mean).toBeCloseTo(125.0, 0);
    });
  });

  describe('Poisson Statistical Significance', () => {
    it('verifies naive significance s/sqrt(b)', () => {
      const s = 50;
      const b = 100;
      expect(simpleSignificance(s, b)).toBeCloseTo(5.0, 4);
    });

    it('verifies Asimov significance matches closed-form formula', () => {
      const s = 50;
      const b = 100;
      // Z_A = sqrt(2 * ((150)*ln(1 + 50/100) - 50))
      // 150 * ln(1.5) - 50 = 150 * 0.405465 - 50 = 60.81977 - 50 = 10.81977
      // 2 * 10.81977 = 21.6395
      // sqrt(21.6395) ≈ 4.6518
      const zA = asimovSignificance(s, b);
      expect(zA).toBeCloseTo(4.652, 2);
    });

    it('calculates AMS with regularization for LHC-TriggerMind', () => {
      const s = 100;
      const b = 1000;
      const ams = calculateAMS(s, b, 10.0);
      expect(ams).toBeGreaterThan(0);
      expect(ams).toBeLessThan(simpleSignificance(s, b));
    });
  });

  describe('Seeded PRNG Reproducibility', () => {
    it('produces identical deterministic sequences for the same seed', () => {
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);

      for (let i = 0; i < 20; i++) {
        expect(rng1.nextFloat()).toBe(rng2.nextFloat());
      }
    });

    it('produces different sequences for different seeds', () => {
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(999);

      const seq1 = Array.from({ length: 5 }, () => rng1.nextFloat());
      const seq2 = Array.from({ length: 5 }, () => rng2.nextFloat());
      expect(seq1).not.toEqual(seq2);
    });
  });

  describe('Feynman Conservation, QED Cross Sections & Engineering Physics', () => {
    it('validates allowed QED muon pair production e+ e- -> mu+ mu- above threshold', () => {
      const res = validateInteractionConservation(['e+', 'e-'], ['mu+', 'mu-'], 10.0);
      expect(res.valid).toBe(true);
      expect(res.quantumValid).toBe(true);
      expect(res.kinematicallyAllowed).toBe(true);
      expect(res.violations).toHaveLength(0);
    });

    it('rejects forbidden lepton-flavor violation e- -> mu- + gamma and below-threshold kinematics', () => {
      const lfv = validateInteractionConservation(['e-'], ['mu-', 'gamma'], 10.0);
      expect(lfv.valid).toBe(false);
      expect(lfv.quantumValid).toBe(false);
      expect(lfv.deltaLe).toBe(-1);
      expect(lfv.deltaLmu).toBe(1);

      const subThreshold = validateInteractionConservation(['e+', 'e-'], ['mu+', 'mu-'], 0.15);
      expect(subThreshold.quantumValid).toBe(true);
      expect(subThreshold.kinematicallyAllowed).toBe(false);
      expect(subThreshold.valid).toBe(false);
    });

    it('validates Z0 Breit-Wigner peak near 91.19 GeV in e+ e- -> mu+ mu-', () => {
      const offPeak = calculateEeToMumuCrossSectionNb(30.0);
      const onPeak = calculateEeToMumuCrossSectionNb(91.1876);
      expect(onPeak.withZResonanceNb).toBeGreaterThan(offPeak.withZResonanceNb * 10);
    });

    it('computes cyclotron curvature radius R = p / (0.2998 * |q| * B)', () => {
      // 0.3 GeV/c unit-charge particle in 1.0 T magnetic field -> R ≈ 1.0 m
      const radius = calculateCyclotronRadiusMeters(0.299792458, 1.0, 1);
      expect(radius).toBeCloseTo(1.0, 4);
      expect(calculateCyclotronRadiusMeters(1.0, 0.0, 1)).toBe(Infinity);
    });

    it('validates LHC ultra-high vacuum beam lifetime (> 100 h at 1e-10 mbar and 1.9 K)', () => {
      const nominal = calculateVacuumMetrics(1e-10, 1.9);
      expect(nominal.beamLifetimeHours).toBeGreaterThan(100);
      const degraded = calculateVacuumMetrics(1e-6, 1.9);
      expect(degraded.beamLifetimeHours).toBeLessThan(0.1);
    });
  });

  describe('Electroweak Symmetry Breaking & CAST Axion Primakoff Physics', () => {
    it('restores symmetry and sets W/Z/top masses to zero above T_c = 159.5 GeV', () => {
      const hotUniverse = calculateElectroweakPhase(ELECTROWEAK_TC_GEV + 40);
      expect(hotUniverse.brokenSymmetry).toBe(false);
      expect(hotUniverse.vevGev).toBe(0);
      expect(hotUniverse.massesGev.wBoson).toBe(0);
      expect(hotUniverse.massesGev.topQuark).toBe(0);

      const presentVacuum = calculateElectroweakPhase(0);
      expect(presentVacuum.brokenSymmetry).toBe(true);
      expect(presentVacuum.vevGev).toBeCloseTo(HIGGS_VEV_GEV, 2);
      expect(presentVacuum.massesGev.wBoson).toBeCloseTo(80.377, 2);
      expect(presentVacuum.massesGev.photon).toBe(0);
    });

    it('peaks Primakoff conversion coherence when plasma photon mass matches axion mass', () => {
      const resonant = calculatePrimakoffConversion({
        axionMassEv: 0.4,
        photonPlasmaMassEv: 0.4,
        axionEnergyKev: 4.2,
        magneticFieldT: 9.0,
        lengthMeters: 9.26,
        couplingG10: 0.66,
      });
      const detuned = calculatePrimakoffConversion({
        axionMassEv: 0.4,
        photonPlasmaMassEv: 0.0,
        axionEnergyKev: 4.2,
        magneticFieldT: 9.0,
        lengthMeters: 9.26,
        couplingG10: 0.66,
      });
      expect(resonant.coherenceFactor).toBeCloseTo(1.0, 4);
      expect(resonant.probability).toBeGreaterThan(detuned.probability * 10);
    });
  });

  describe('ISOLDE Nuclear Physics, LHCb Cherenkov & Medipix Spectral K-Edges', () => {
    it('computes ~8.7 MeV/nucleon peak binding for Fe-56 and detects doubly-magic Sn-132', () => {
      const fe56 = calculateSemiEmpiricalBindingEnergy(26, 30);
      expect(fe56.bindingPerNucleonMev).toBeGreaterThan(8.5);
      expect(fe56.bindingPerNucleonMev).toBeLessThan(9.0);
      expect(fe56.stabilityRegime).toBe('STABLE_VALLEY');

      const sn132 = calculateSemiEmpiricalBindingEnergy(50, 82);
      expect(sn132.isProtonMagic).toBe(true);
      expect(sn132.isNeutronMagic).toBe(true);
      expect(sn132.isDoublyMagic).toBe(true);
    });

    it('separates ISOLDE ion isobars strictly by mass-to-charge ratio', () => {
      const sn132 = calculateMassSeparatorDeflection(132, 1, 50, 0.2414, 1.5, 4.0);
      const cs137 = calculateMassSeparatorDeflection(137, 1, 50, 0.2414, 1.5, 4.0);
      expect(cs137.cyclotronRadiusMeters).toBeGreaterThan(sn132.cyclotronRadiusMeters);
      expect(Math.abs(sn132.focalOffsetMm - cs137.focalOffsetMm)).toBeGreaterThan(30);
    });

    it('enforces Cherenkov velocity threshold beta > 1/n in LHCb RICH-1', () => {
      // Kaon mass ~0.4937 GeV/c^2, C4F10 n = 1.0014 -> threshold momentum ~9.3 GeV/c
      const slowKaon = calculateCherenkovCone(5.0, 0.4937, 1.0014);
      const fastPion = calculateCherenkovCone(5.0, 0.1396, 1.0014);
      expect(slowKaon.emitsCherenkov).toBe(false);
      expect(fastPion.emitsCherenkov).toBe(true);
      expect(fastPion.thetaCherenkovDeg).toBeGreaterThan(2.0);
    });

    it('models Iodine (33.17 keV) and Gold (80.72 keV) K-edge attenuation jumps for Medipix3', () => {
      const belowI = calculateSpectralXRayAttenuation(32.0, 'iodine_contrast');
      const aboveI = calculateSpectralXRayAttenuation(34.0, 'iodine_contrast');
      expect(belowI.kEdgeActive).toBe(false);
      expect(aboveI.kEdgeActive).toBe(true);
      expect(aboveI.muCmInverse).toBeGreaterThan(belowI.muCmInverse * 2.5);

      const belowAu = calculateSpectralXRayAttenuation(79.0, 'gold_marker');
      const aboveAu = calculateSpectralXRayAttenuation(82.0, 'gold_marker');
      expect(belowAu.kEdgeActive).toBe(false);
      expect(aboveAu.kEdgeActive).toBe(true);
      expect(aboveAu.muCmInverse).toBeGreaterThan(belowAu.muCmInverse * 2.0);
    });

    it('conserves 3-flavor neutrino probability and peaks nu_mu -> nu_tau oscillation at first L/E maximum', () => {
      const zeroDist = calculateNeutrinoOscillation(0.01, 5.0);
      expect(zeroDist.probNuMuSurvival).toBeGreaterThan(0.99);
      const sum0 = zeroDist.probNuMuSurvival + zeroDist.probNuMuToNuTau + zeroDist.probNuMuToNuE;
      expect(sum0).toBeCloseTo(1.0, 5);

      // Peak oscillation at firstMaxBaselineKm (e.g. L ≈ 505 km for E = 1 GeV -> CNGS-scale ~732 km at ~1.5 GeV)
      const peak = calculateNeutrinoOscillation(zeroDist.firstMaxBaselineKm, 5.0);
      expect(peak.probNuMuToNuTau).toBeGreaterThan(0.9);
      const sumPeak = peak.probNuMuSurvival + peak.probNuMuToNuTau + peak.probNuMuToNuE;
      expect(sumPeak).toBeCloseTo(1.0, 5);
    });

    it('computes ~350-380 MJ nominal LHC stored beam energy and stable luminosity leveling burn-off', () => {
      const stable = calculateLhcFillCycle(4.0, 2748, 1.2e0, 6800, 2.2, 2.0, 12.0);
      expect(stable.phase).toBe('STABLE_BEAMS');
      expect(stable.storedEnergyBeamMJ).toBeGreaterThan(340);
      expect(stable.storedEnergyBeamMJ).toBeLessThan(390);
      expect(stable.instantaneousLumiE34).toBeLessThanOrEqual(2.0);
      expect(stable.integratedLumiPbInv).toBeGreaterThan(150);
    });

    it('classifies CERN PDG Higgs/Top masses into METASTABLE vs STABLE vs REDLINE electroweak vacuum regimes', () => {
      const cernUniverse = calculateSacredTimelineVacuum(125.25, 172.69, 0.1179);
      expect(cernUniverse.regime).toBe('METASTABLE');
      expect(cernUniverse.instabilityScaleLog10Gev).toBeGreaterThan(9.5);
      expect(cernUniverse.instabilityScaleLog10Gev).toBeLessThan(12.5);
      expect(cernUniverse.runningCouplingSamples.length).toBeGreaterThan(10);

      const lockedStable = calculateSacredTimelineVacuum(133.0, 171.0, 0.1195);
      expect(lockedStable.regime).toBe('STABLE');
      expect(lockedStable.stabilityMarginGev).toBeGreaterThan(0);

      const redlineCollapse = calculateSacredTimelineVacuum(108.0, 178.0, 0.115);
      expect(redlineCollapse.regime).toBe('REDLINE');
      expect(redlineCollapse.branchRiskFraction).toBeGreaterThan(0.7);
    });

    it('computes superconducting magnet energy density, relativistic LLP decay length, ADD scale & Dirac g_D^2 boost', () => {
      const nb3sn = calculateSuperconductingMagnetMetrics(12.0, 28, 1.9, 'Nb3Sn');
      expect(nb3sn.energyDensityMjM3).toBeCloseTo(57.295, 1);
      expect(nb3sn.quenched).toBe(false);

      const overLimit = calculateSuperconductingMagnetMetrics(15.0, 28, 4.2, 'NbTi');
      expect(overLimit.quenched).toBe(true);

      const llp = calculateDisplacedVertexDecay(5000, 10, 100); // ~1.5m proper -> ~15m boosted
      expect(llp.boostedDecayLengthM).toBeGreaterThan(10);
      expect(llp.probInsideTracker + llp.probInsideCalorimeter + llp.probInsideMuonSpec).toBeLessThanOrEqual(1.0);

      const addN2 = calculateExtraDimensionKaluzaKlein(2, 500);
      expect(addN2.effectivePlanckTev).toBeGreaterThan(0.5);
      expect(addN2.effectivePlanckTev).toBeLessThan(10.0);

      const mono = calculateDiracMonopoleMetrics(1, 3.8, 100);
      expect(mono.effectiveChargeRatio).toBeCloseTo(68.518, 1);
      expect(mono.ionizingLossRatioVsProton).toBeGreaterThan(4500);
    });
  });
});
