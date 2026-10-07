/**
 * Relativistic Kinematics
 * Closed-form analytical equations for particle acceleration and collisions.
 */

export interface RelativisticState {
  totalEnergyGev: number;
  kineticEnergyGev: number;
  momentumGevC: number;
  gamma: number;
  beta: number;
  velocityMS: number;
}

/**
 * Calculates full relativistic parameters from kinetic energy and rest mass.
 * E = E_k + m
 * gamma = E / m
 * beta = sqrt(1 - 1 / gamma^2)
 * p = sqrt(E^2 - m^2)
 */
export function calculateFromKineticEnergy(
  kineticEnergyGev: number,
  restMassGev: number
): RelativisticState {
  if (kineticEnergyGev < 0) {
    throw new Error('Kinetic energy must be non-negative');
  }
  if (restMassGev <= 0) {
    throw new Error('Rest mass must be positive for massive particles');
  }

  const totalEnergyGev = kineticEnergyGev + restMassGev;
  const gamma = totalEnergyGev / restMassGev;
  const beta = Math.sqrt(Math.max(0, 1 - 1 / (gamma * gamma)));
  const momentumGevC = Math.sqrt(Math.max(0, totalEnergyGev * totalEnergyGev - restMassGev * restMassGev));
  const velocityMS = beta * 299792458;

  return {
    totalEnergyGev,
    kineticEnergyGev,
    momentumGevC,
    gamma,
    beta,
    velocityMS,
  };
}

/**
 * Calculates relativistic parameters from total energy and rest mass.
 */
export function calculateFromTotalEnergy(
  totalEnergyGev: number,
  restMassGev: number
): RelativisticState {
  if (totalEnergyGev < restMassGev) {
    throw new Error('Total energy cannot be less than rest mass');
  }
  return calculateFromKineticEnergy(totalEnergyGev - restMassGev, restMassGev);
}

/**
 * Center-of-mass energy sqrt(s) for symmetric collider: sqrt(s) = 2 * E_beam
 */
export function colliderCenterOfMassEnergy(beamEnergyGev: number): number {
  return 2 * beamEnergyGev;
}

/**
 * Fixed-target center-of-mass energy:
 * sqrt(s) = sqrt(m1^2 + m2^2 + 2 * E1 * m2)
 */
export function fixedTargetCenterOfMassEnergy(
  beamTotalEnergyGev: number,
  beamMassGev: number,
  targetMassGev: number
): number {
  const s = beamMassGev * beamMassGev + targetMassGev * targetMassGev + 2 * beamTotalEnergyGev * targetMassGev;
  return Math.sqrt(Math.max(0, s));
}

/**
 * Invariant mass of two ultrarelativistic / massless particles from (pt, eta, phi)
 * M = sqrt(2 * pt1 * pt2 * (cosh(deltaEta) - cos(deltaPhi)))
 */
export function twoBodyInvariantMass(
  pt1: number,
  eta1: number,
  phi1: number,
  pt2: number,
  eta2: number,
  phi2: number
): number {
  const deltaEta = eta1 - eta2;
  let deltaPhi = Math.abs(phi1 - phi2);
  if (deltaPhi > Math.PI) {
    deltaPhi = 2 * Math.PI - deltaPhi;
  }
  const term = 2 * pt1 * pt2 * (Math.cosh(deltaEta) - Math.cos(deltaPhi));
  return Math.sqrt(Math.max(0, term));
}
