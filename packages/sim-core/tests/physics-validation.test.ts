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
});
