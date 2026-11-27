/**
 * Nuclear Structure, ISOLDE Mass Separation, Cherenkov Optics, and Medipix Spectral X-Ray Physics
 * Grounded in published analytical equations (Bethe-Weizsäcker SEMF, Lorentz Ion Optics, Frank-Tamm, NIST XCOM K-edges).
 */

import { ELEMENTARY_CHARGE_C } from './constants.js';

export const ATOMIC_MASS_UNIT_KG = 1.6605390666e-27;
export const MAGIC_NUMBERS = [2, 8, 20, 28, 50, 82, 126] as const;

export interface NuclearBindingResult {
  Z: number;
  N: number;
  A: number;
  totalBindingMev: number;
  bindingPerNucleonMev: number;
  isProtonMagic: boolean;
  isNeutronMagic: boolean;
  isDoublyMagic: boolean;
  stabilityRegime: 'STABLE_VALLEY' | 'PROTON_RICH' | 'NEUTRON_RICH' | 'DRIP_LINE';
}

/**
 * Bethe-Weizsäcker Semi-Empirical Mass Formula (SEMF)
 * Standard Rohlf coefficients (MeV): a_v = 15.75, a_s = 17.8, a_c = 0.711, a_a = 23.7, a_p = 11.18
 */
export function calculateSemiEmpiricalBindingEnergy(Z: number, N: number): NuclearBindingResult {
  const safeZ = Math.max(1, Math.round(Z));
  const safeN = Math.max(0, Math.round(N));
  const A = safeZ + safeN;

  const aV = 15.75;
  const aS = 17.8;
  const aC = 0.711;
  const aA = 23.7;
  const aP = 11.18;

  const volume = aV * A;
  const surface = aS * Math.pow(A, 2 / 3);
  const coulomb = (aC * safeZ * (safeZ - 1)) / Math.pow(A, 1 / 3);
  const asymmetry = (aA * Math.pow(safeN - safeZ, 2)) / A;

  let pairing = 0;
  if (safeZ % 2 === 0 && safeN % 2 === 0) {
    pairing = aP / Math.sqrt(A);
  } else if (safeZ % 2 === 1 && safeN % 2 === 1) {
    pairing = -aP / Math.sqrt(A);
  }

  const totalBindingMev = Math.max(0, volume - surface - coulomb - asymmetry + pairing);
  const bindingPerNucleonMev = totalBindingMev / A;

  const isProtonMagic = (MAGIC_NUMBERS as readonly number[]).includes(safeZ);
  const isNeutronMagic = (MAGIC_NUMBERS as readonly number[]).includes(safeN);
  const isDoublyMagic = isProtonMagic && isNeutronMagic;

  // Approximate Green-Engler beta-stability line: Z_stable ≈ A / (2 + 0.015 * A^(2/3))
  const zStable = A / (2 + 0.015 * Math.pow(A, 2 / 3));
  const deltaZ = safeZ - zStable;

  let stabilityRegime: NuclearBindingResult['stabilityRegime'] = 'STABLE_VALLEY';
  if (bindingPerNucleonMev < 5.5 && A > 8) {
    stabilityRegime = 'DRIP_LINE';
  } else if (deltaZ > 2.2) {
    stabilityRegime = 'PROTON_RICH';
  } else if (deltaZ < -2.5) {
    stabilityRegime = 'NEUTRON_RICH';
  }

  return {
    Z: safeZ,
    N: safeN,
    A,
    totalBindingMev,
    bindingPerNucleonMev,
    isProtonMagic,
    isNeutronMagic,
    isDoublyMagic,
    stabilityRegime,
  };
}

export interface MassSeparatorResult {
  cyclotronRadiusMeters: number;
  focalOffsetMm: number;
  passesSlit: boolean;
  velocityKmS: number;
  massResolvingPowerNeeded: number;
}

/**
 * ISOLDE Magnetic Mass Separator (GPS / HRS) Deflection Physics
 * Non-relativistic ion optics: r_L = sqrt(2 * m * q * V) / (q * B)
 * Nominal design bending radius R_0 (e.g., 1.5 m in ISOLDE GPS)
 */
export function calculateMassSeparatorDeflection(
  massU: number,
  chargeStateQ: number,
  accelerationKv: number,
  dipoleFieldTesla: number,
  nominalRadiusMeters = 1.5,
  slitHalfWidthMm = 2.0
): MassSeparatorResult {
  const safeM = Math.max(1, massU) * ATOMIC_MASS_UNIT_KG;
  const safeQ = Math.max(1, chargeStateQ) * ELEMENTARY_CHARGE_C;
  const safeV = Math.max(1, accelerationKv) * 1000; // Volts
  const safeB = Math.max(0.01, dipoleFieldTesla);

  const velocityMs = Math.sqrt((2 * safeQ * safeV) / safeM);
  const cyclotronRadiusMeters = (safeM * velocityMs) / (safeQ * safeB);
  // First-order focal-plane dispersion for a 90-deg sector magnet: delta_x ≈ 2 * (r_L - R_0)
  const focalOffsetMm = (cyclotronRadiusMeters - nominalRadiusMeters) * 2 * 1000;
  const passesSlit = Math.abs(focalOffsetMm) <= slitHalfWidthMm;

  return {
    cyclotronRadiusMeters,
    focalOffsetMm,
    passesSlit,
    velocityKmS: velocityMs / 1000,
    massResolvingPowerNeeded: Math.round(massU / Math.max(0.001, Math.abs(cyclotronRadiusMeters - nominalRadiusMeters) * 10 + 0.0005)),
  };
}

export interface CherenkovResult {
  emitsCherenkov: boolean;
  thresholdBeta: number;
  thetaCherenkovDeg: number;
  ringRadiusMm: number;
  relativePhotonYield: number; // proportional to sin^2(theta_c)
}

/**
 * LHCb RICH-1 / RICH-2 Cherenkov Cone & Frank-Tamm Angle Calculation
 * Cherenkov angle: cos(theta_c) = 1 / (n * beta), emitted iff beta > 1/n
 */
export function calculateCherenkovCone(
  momentumGevC: number,
  massGev: number,
  refractiveIndex: number,
  detectorPlaneDistanceMm = 1200
): CherenkovResult {
  const safeP = Math.max(0.05, momentumGevC);
  const safeM = Math.max(0.00001, massGev);
  const n = Math.max(1.00005, refractiveIndex);

  const energy = Math.sqrt(safeP * safeP + safeM * safeM);
  const beta = safeP / energy;
  const thresholdBeta = 1.0 / n;
  const emitsCherenkov = beta > thresholdBeta;

  if (!emitsCherenkov) {
    return {
      emitsCherenkov: false,
      thresholdBeta,
      thetaCherenkovDeg: 0,
      ringRadiusMm: 0,
      relativePhotonYield: 0,
    };
  }

  const cosTheta = Math.min(1.0, 1.0 / (n * beta));
  const thetaRad = Math.acos(cosTheta);
  const thetaCherenkovDeg = (thetaRad * 180) / Math.PI;
  const ringRadiusMm = detectorPlaneDistanceMm * Math.tan(thetaRad);
  const sin2Theta = Math.sin(thetaRad) * Math.sin(thetaRad);
  const maxSin2 = 1 - 1 / (n * n);
  const relativePhotonYield = maxSin2 > 0 ? Math.min(1.0, sin2Theta / maxSin2) : 0;

  return {
    emitsCherenkov: true,
    thresholdBeta,
    thetaCherenkovDeg,
    ringRadiusMm,
    relativePhotonYield,
  };
}

export type MedipixTissue = 'soft_tissue' | 'calcium_bone' | 'iodine_contrast' | 'gold_marker';

/**
 * Simplified Analytical Mass-Attenuation Coefficient mu/rho [cm^2/g]
 * Captures photoelectric E^-3 falloff, Compton floor, and authentic NIST XCOM K-edge discontinuities:
 * - Iodine (Z=53) K-edge: 33.17 keV
 * - Gold (Z=79) K-edge: 80.72 keV
 */
export function calculateSpectralXRayAttenuation(
  photonEnergyKev: number,
  material: MedipixTissue
): { muCmInverse: number; kEdgeActive: boolean } {
  const E = Math.max(12, Math.min(140, photonEnergyKev));
  const eNorm = E / 30.0;

  if (material === 'soft_tissue') {
    const mu = 0.21 + 0.16 * Math.pow(eNorm, -2.9);
    return { muCmInverse: mu, kEdgeActive: false };
  }

  if (material === 'calcium_bone') {
    const mu = 0.34 + 1.85 * Math.pow(eNorm, -3.0);
    return { muCmInverse: mu, kEdgeActive: false };
  }

  if (material === 'iodine_contrast') {
    const kEdge = 33.17;
    const kEdgeActive = E >= kEdge;
    const basePhoto = 1.65 * Math.pow(eNorm, -2.85);
    const kJump = kEdgeActive ? 5.2 * Math.pow(E / kEdge, -2.7) : 0;
    return { muCmInverse: 0.28 + basePhoto + kJump, kEdgeActive };
  }

  // gold_marker (Z=79, K-edge = 80.72 keV)
  const kEdgeAu = 80.72;
  const kEdgeActive = E >= kEdgeAu;
  const basePhoto = 4.2 * Math.pow(eNorm, -2.75);
  const kJump = kEdgeActive ? 6.8 * Math.pow(E / kEdgeAu, -2.55) : 0;
  return { muCmInverse: 0.45 + basePhoto + kJump, kEdgeActive };
}

export interface NeutrinoOscillationResult {
  distanceKm: number;
  energyGev: number;
  probNuMuSurvival: number;
  probNuMuToNuTau: number;
  probNuMuToNuE: number;
  oscillationPhaseRad: number;
  firstMaxBaselineKm: number;
}

/**
 * Three-Flavor Atmospheric / Long-Baseline PMNS Muon-Neutrino Oscillation Probability
 * Grounded in PDG 2024 Normal Ordering parameters:
 * Δm²₃₂ = 2.453e-3 eV², sin²(θ₂₃) = 0.546, sin²(2θ₁₃) = 0.085
 * Phase Δ = 1.26693 * Δm² [eV²] * L [km] / E [GeV]
 */
export function calculateNeutrinoOscillation(
  distanceKm: number,
  energyGev: number,
  deltaM32SqEv2 = 2.453e-3
): NeutrinoOscillationResult {
  const safeL = Math.max(0.01, distanceKm);
  const safeE = Math.max(0.05, energyGev);

  const sin2Theta23 = 0.546;
  const sin2_2Theta23 = 4 * sin2Theta23 * (1 - sin2Theta23); // ~0.9915
  const sin2Theta13 = 0.022;
  const sin2_2Theta13 = 4 * sin2Theta13 * (1 - sin2Theta13); // ~0.0861

  const phaseRad = (1.26693 * deltaM32SqEv2 * safeL) / safeE;
  const sin2Phase = Math.sin(phaseRad) * Math.sin(phaseRad);

  const probNuMuToNuE = Math.min(1, sin2Theta23 * sin2_2Theta13 * sin2Phase);
  const probNuMuToNuTau = Math.min(1, (1 - sin2Theta13) * (1 - sin2Theta13) * sin2_2Theta23 * sin2Phase);
  const probNuMuSurvival = Math.max(0, 1 - probNuMuToNuE - probNuMuToNuTau);

  // First oscillation maximum at phase = pi / 2 => L_max = pi * E / (2 * 1.26693 * Δm²)
  const firstMaxBaselineKm = (Math.PI * safeE) / (2 * 1.26693 * deltaM32SqEv2);

  return {
    distanceKm: safeL,
    energyGev: safeE,
    probNuMuSurvival,
    probNuMuToNuTau,
    probNuMuToNuE,
    oscillationPhaseRad: phaseRad,
    firstMaxBaselineKm,
  };
}

export interface LhcFillStateResult {
  storedEnergyBeamMJ: number;
  copperMeltEquivalentKg: number;
  instantaneousLumiE34: number;
  integratedLumiPbInv: number;
  phase: 'INJECTION' | 'RAMP' | 'SQUEEZE' | 'STABLE_BEAMS' | 'DUMP';
}

/**
 * Analytical LHC Physics Fill Cycle & Luminosity Burn-off Model
 * Stored energy per beam: E_beam = N_b * n_b * E_GeV * 1e9 * e [Joules] -> MJ
 * Copper melting enthalpy ~0.7 MJ/kg -> shows ~500 kg Cu equivalent at 362 MJ!
 */
export function calculateLhcFillCycle(
  hoursElapsed: number,
  bunches: number,
  intensityE11: number,
  beamEnergyGev: number,
  peakLumiE34: number,
  levelCapE34: number,
  totalFillHours = 12.0
): LhcFillStateResult {
  const safeH = Math.max(0, Math.min(totalFillHours + 0.5, hoursElapsed));
  const storedEnergyBeamMJ =
    (bunches * (intensityE11 * 1e11) * (beamEnergyGev * 1e9) * ELEMENTARY_CHARGE_C) / 1e6;
  const copperMeltEquivalentKg = storedEnergyBeamMJ / 0.7;

  if (safeH < 0.5) {
    return {
      storedEnergyBeamMJ: storedEnergyBeamMJ * (450 / Math.max(450, beamEnergyGev)),
      copperMeltEquivalentKg: copperMeltEquivalentKg * (450 / Math.max(450, beamEnergyGev)),
      instantaneousLumiE34: 0,
      integratedLumiPbInv: 0,
      phase: 'INJECTION',
    };
  }
  if (safeH < 1.0) {
    const frac = (safeH - 0.5) / 0.5;
    const eNow = 450 + frac * (beamEnergyGev - 450);
    const ratio = eNow / Math.max(450, beamEnergyGev);
    return {
      storedEnergyBeamMJ: storedEnergyBeamMJ * ratio,
      copperMeltEquivalentKg: copperMeltEquivalentKg * ratio,
      instantaneousLumiE34: 0,
      integratedLumiPbInv: 0,
      phase: 'RAMP',
    };
  }
  if (safeH < 1.3) {
    return {
      storedEnergyBeamMJ,
      copperMeltEquivalentKg,
      instantaneousLumiE34: peakLumiE34 * 0.08,
      integratedLumiPbInv: 0,
      phase: 'SQUEEZE',
    };
  }
  if (safeH >= totalFillHours) {
    return {
      storedEnergyBeamMJ: 0,
      copperMeltEquivalentKg: 0,
      instantaneousLumiE34: 0,
      integratedLumiPbInv: 0,
      phase: 'DUMP',
    };
  }

  // Stable Beams burn-off L(t) = min(L_cap, L_peak / (1 + t / tau_burn)^2)
  const stableHours = safeH - 1.3;
  const tauHours = 14.5;
  const dtStep = 0.1;
  let integratedPbInv = 0;
  let currentLumiE34 = 0;

  for (let t = 0; t <= stableHours; t += dtStep) {
    const rawL = peakLumiE34 / Math.pow(1 + t / tauHours, 2);
    currentLumiE34 = Math.min(levelCapE34, rawL);
    // 1e34 cm^-2 s^-1 = 10 ub^-1 s^-1 = 36 pb^-1 / hour
    integratedPbInv += currentLumiE34 * 36.0 * dtStep;
  }

  return {
    storedEnergyBeamMJ,
    copperMeltEquivalentKg,
    instantaneousLumiE34: currentLumiE34,
    integratedLumiPbInv: integratedPbInv,
    phase: 'STABLE_BEAMS',
  };
}

