import {
  ELECTRON_MASS_GEV,
  HIGGS_MASS_GEV,
  W_BOSON_MASS_GEV,
  Z_BOSON_MASS_GEV,
} from './constants.js';

export const HIGGS_VEV_GEV = 246.21965; // (sqrt(2) * G_F)^(-1/2) PDG 2024
export const ELECTROWEAK_TC_GEV = 159.5; // Lattice QCD / 1-loop SM crossover temperature
export const TOP_QUARK_MASS_GEV = 172.69;

export interface ElectroweakPhaseState {
  temperatureGev: number;
  brokenSymmetry: boolean;
  vevGev: number;
  lambdaQuartic: number;
  muSqGev2: number;
  massesGev: {
    wBoson: number;
    zBoson: number;
    topQuark: number;
    electron: number;
    photon: number;
    higgs: number;
  };
}

/**
 * Evaluates the finite-temperature Electroweak Higgs potential V(phi) = 0.5 * mu^2(T) * phi^2 + 0.25 * lambda * phi^4
 * and resulting spontaneous symmetry breaking masses at temperature T (GeV).
 */
export function calculateElectroweakPhase(temperatureGev: number): ElectroweakPhaseState {
  const safeT = Math.max(0, temperatureGev);
  const lambdaQuartic = (HIGGS_MASS_GEV * HIGGS_MASS_GEV) / (2 * HIGGS_VEV_GEV * HIGGS_VEV_GEV);
  const mu0Sq = (HIGGS_MASS_GEV * HIGGS_MASS_GEV) / 2;

  // Thermal mass shift: mu_eff^2(T) = -mu0^2 * (1 - (T/T_c)^2)
  const ratioSq = (safeT / ELECTROWEAK_TC_GEV) ** 2;
  const muSqGev2 = -mu0Sq * (1 - ratioSq);

  const brokenSymmetry = muSqGev2 < 0;
  const vevGev = brokenSymmetry ? Math.sqrt(-muSqGev2 / lambdaQuartic) : 0;
  const vevScale = vevGev / HIGGS_VEV_GEV;

  // When unbroken, effective Higgs scalar fluctuates around symmetric phase (T-dependent thermal curvature)
  const higgsMassT = brokenSymmetry
    ? Math.sqrt(-2 * muSqGev2)
    : Math.sqrt(Math.max(0, muSqGev2));

  return {
    temperatureGev: safeT,
    brokenSymmetry,
    vevGev,
    lambdaQuartic,
    muSqGev2,
    massesGev: {
      wBoson: W_BOSON_MASS_GEV * vevScale,
      zBoson: Z_BOSON_MASS_GEV * vevScale,
      topQuark: TOP_QUARK_MASS_GEV * vevScale,
      electron: ELECTRON_MASS_GEV * vevScale,
      photon: 0,
      higgs: higgsMassT,
    },
  };
}

/**
 * Evaluates V(phi) potential curve at a given field value phi (in GeV), shifted so V(0) = 0.
 */
export function evaluateHiggsPotential(phiGev: number, muSqGev2: number, lambdaQuartic: number): number {
  return 0.5 * muSqGev2 * phiGev * phiGev + 0.25 * lambdaQuartic * Math.pow(phiGev, 4);
}

/**
 * Computes Primakoff axion-to-photon conversion probability inside a magnetized pipe (CERN CAST dipole):
 * P(a -> gamma) = (g_agamma * B * L / 2)^2 * sinc^2(q * L / 2)
 * where momentum mismatch q = |m_a^2 - m_gamma^2| / (2 * E_a).
 * Converts SI B (T), L (m) into natural units (eV^-1, eV^2).
 */
export function calculatePrimakoffConversion(params: {
  axionMassEv: number;
  photonPlasmaMassEv: number;
  axionEnergyKev: number;
  magneticFieldT: number;
  lengthMeters: number;
  couplingG10: number; // in units of 10^-10 GeV^-1
}): {
  probability: number;
  coherenceFactor: number;
  momentumTransferEv: number;
} {
  const {
    axionMassEv,
    photonPlasmaMassEv,
    axionEnergyKev,
    magneticFieldT,
    lengthMeters,
    couplingG10,
  } = params;

  // Natural unit conversions: 1 T = 195.35 eV^2, 1 m = 5.06773e6 eV^-1
  const bNaturalEv2 = Math.abs(magneticFieldT) * 195.353;
  const lNaturalInvEv = Math.max(0.01, lengthMeters) * 5.06773e6;
  const eAxionEv = Math.max(100, axionEnergyKev * 1000);
  const gInvEv = Math.max(0, couplingG10) * 1e-10 * 1e-9; // 1 GeV^-1 = 10^-9 eV^-1

  const momentumTransferEv =
    Math.abs(axionMassEv * axionMassEv - photonPlasmaMassEv * photonPlasmaMassEv) / (2 * eAxionEv);

  const halfQL = 0.5 * momentumTransferEv * lNaturalInvEv;
  const coherenceFactor =
    halfQL < 1e-6 ? 1.0 : Math.pow(Math.sin(halfQL) / halfQL, 2);

  const amp = 0.5 * gInvEv * bNaturalEv2 * lNaturalInvEv;
  const probability = amp * amp * coherenceFactor;

  return {
    probability,
    coherenceFactor,
    momentumTransferEv,
  };
}
