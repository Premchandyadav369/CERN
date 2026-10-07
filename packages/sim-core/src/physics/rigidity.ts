import { RIGIDITY_CONVERSION } from './constants.js';

/**
 * Calculates magnetic rigidity B*rho in Tesla-meters.
 * B*rho = p [GeV/c] / (0.299792458 * |Z|)
 */
export function calculateMagneticRigidity(
  momentumGevC: number,
  chargeZ: number = 1
): number {
  if (chargeZ === 0) {
    throw new Error('Neutral particles have infinite magnetic rigidity (no bending)');
  }
  return momentumGevC / (RIGIDITY_CONVERSION * Math.abs(chargeZ));
}

/**
 * Calculates required dipole magnetic field in Tesla for a given momentum, charge, and bending radius.
 * B = (B*rho) / rho
 */
export function calculateRequiredDipoleField(
  momentumGevC: number,
  bendingRadiusMeters: number,
  chargeZ: number = 1
): number {
  if (bendingRadiusMeters <= 0) {
    throw new Error('Bending radius must be positive');
  }
  const rigidity = calculateMagneticRigidity(momentumGevC, chargeZ);
  return rigidity / bendingRadiusMeters;
}

/**
 * Calculates instantaneous luminosity in cm^-2 s^-1 for round colliding beams.
 * L = (N1 * N2 * n_b * f_rev * gamma) / (4 * pi * epsilon_n * beta_star) * F
 * where:
 * N1, N2 = bunch populations
 * n_b = number of bunches
 * f_rev = revolution frequency (c / circumference)
 * gamma = relativistic factor
 * epsilon_n = normalized transverse emittance (m*rad)
 * beta_star = focal parameter beta* at IP (m)
 * F = geometric reduction factor from crossing angle
 */
export function calculateInstantaneousLuminosity(params: {
  n1: number;
  n2: number;
  numberOfBunches: number;
  revolutionFrequencyHz: number;
  gamma: number;
  normalizedEmittanceM: number;
  betaStarM: number;
  geometricFactor?: number;
}): number {
  const {
    n1,
    n2,
    numberOfBunches,
    revolutionFrequencyHz,
    gamma,
    normalizedEmittanceM,
    betaStarM,
    geometricFactor = 0.85,
  } = params;

  const beamSizeSigmaSq = (normalizedEmittanceM * betaStarM) / gamma;
  // Luminosity in m^-2 s^-1
  const lM2S = (n1 * n2 * numberOfBunches * revolutionFrequencyHz * geometricFactor) /
    (4 * Math.PI * beamSizeSigmaSq);
  // Convert to cm^-2 s^-1 (1 m^2 = 10^4 cm^2 -> 1 m^-2 = 10^-4 cm^-2)
  return lM2S * 1e-4;
}
