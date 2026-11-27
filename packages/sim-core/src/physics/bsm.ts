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

export type VacuumRegime = 'STABLE' | 'METASTABLE' | 'REDLINE';

export interface SacredTimelineResult {
  higgsMassGev: number;
  topMassGev: number;
  alphaS: number;
  criticalHiggsGev: number;
  instabilityHiggsGev: number;
  regime: VacuumRegime;
  instabilityScaleLog10Gev: number;
  stabilityMarginGev: number;
  redlineMarginGev: number;
  branchRiskFraction: number;
  universeLifetimeLog10Years: number;
  runningCouplingSamples: { log10MuGev: number; lambdaEff: number }[];
}

/**
 * Parametric NNLO Standard Model Electroweak Vacuum stability calculation
 * (following Degrassi et al. / Buttazzo et al. around CERN PDG m_H = 125.25 GeV, m_t = 172.69 GeV).
 * Determines whether the Higgs vacuum stays on an eternally stable "Sacred Timeline", sits in
 * cosmic metastability, or crosses the quantum tunneling Red Line.
 */
export function calculateSacredTimelineVacuum(
  higgsMassGev = HIGGS_MASS_GEV,
  topMassGev = TOP_QUARK_MASS_GEV,
  alphaS = 0.1179
): SacredTimelineResult {
  const safeMh = Math.max(80, Math.min(200, higgsMassGev));
  const safeMt = Math.max(150, Math.min(200, topMassGev));
  const safeAlphaS = Math.max(0.105, Math.min(0.13, alphaS));

  // NNLO SM stability threshold M_H > 129.6 + 2.0*(m_t - 173.34) - 0.56*((alphaS - 0.1184)/0.0007) GeV
  const criticalHiggsGev =
    129.6 + 2.0 * (safeMt - 173.34) - 0.56 * ((safeAlphaS - 0.1184) / 0.0007);

  // Instability boundary below which bubble nucleation lifetime < age of Universe (~10^10.14 yr)
  const instabilityHiggsGev =
    111.0 + 2.2 * (safeMt - 173.34) - 0.45 * ((safeAlphaS - 0.1184) / 0.0007);

  const stabilityMarginGev = safeMh - criticalHiggsGev;
  const redlineMarginGev = safeMh - instabilityHiggsGev;

  const regime: VacuumRegime =
    stabilityMarginGev >= 0
      ? 'STABLE'
      : redlineMarginGev >= 0
      ? 'METASTABLE'
      : 'REDLINE';

  // Approximate log10(Lambda_I / GeV) scale where running lambda(mu) crosses zero
  const deltaCrit = Math.max(0, criticalHiggsGev - safeMh);
  const instabilityScaleLog10Gev =
    regime === 'STABLE' ? 19.2 : Math.max(2.3, 19.0 - 2.38 * deltaCrit);

  // Normalized branching probability / variance stress index (0..1)
  const totalBand = Math.max(4, criticalHiggsGev - instabilityHiggsGev);
  const rawStress = (criticalHiggsGev - safeMh) / totalBand;
  const branchRiskFraction = Math.max(0.03, Math.min(0.98, 0.05 + 0.72 * rawStress));

  // Bounce action lifetime scaling: >> 10^100 yr in PDG metastable region, < 10.14 yr below Red Line
  const universeLifetimeLog10Years =
    regime === 'STABLE'
      ? 999
      : regime === 'METASTABLE'
      ? Math.max(10.5, 10.5 + Math.pow(Math.max(0.1, redlineMarginGev), 1.45) * 42)
      : Math.max(-20, 10.1 + redlineMarginGev * 4.5);

  // Sample effective RG running of Higgs quartic coupling lambda(mu) from log10(mu) = 2 (100 GeV) to 19 (Planck)
  const lambda0 = (safeMh * safeMh) / (2 * HIGGS_VEV_GEV * HIGGS_VEV_GEV);
  const runningCouplingSamples: { log10MuGev: number; lambdaEff: number }[] = [];
  for (let logMu = 2; logMu <= 19; logMu += 1) {
    const t = logMu - 2; // log10(mu / 100 GeV)
    let lambdaEff: number;
    if (regime === 'STABLE') {
      const dip = 0.028 * (t / 11) * (1 - t / 22);
      const lift = (stabilityMarginGev * 0.0022) * (t / 17);
      lambdaEff = Math.max(0.004, lambda0 * Math.exp(-0.07 * t) - dip + lift);
    } else {
      const slope = 0.0095 + deltaCrit * 0.0012;
      lambdaEff = lambda0 * Math.exp(-0.065 * t) - slope * t + 0.00018 * t * t;
    }
    runningCouplingSamples.push({ log10MuGev: logMu, lambdaEff });
  }

  return {
    higgsMassGev: safeMh,
    topMassGev: safeMt,
    alphaS: safeAlphaS,
    criticalHiggsGev,
    instabilityHiggsGev,
    regime,
    instabilityScaleLog10Gev,
    stabilityMarginGev,
    redlineMarginGev,
    branchRiskFraction,
    universeLifetimeLog10Years,
    runningCouplingSamples,
  };
}

export interface SuperconductingMagnetResult {
  fieldTesla: number;
  energyDensityMjM3: number;
  magneticPressureMpa: number;
  hoopForceKnPerMeter: number;
  criticalFieldT: number;
  quenched: boolean;
  safetyMarginFraction: number;
}

/**
 * Computes exact magnetic energy density u_B = B^2 / (2 mu_0), Maxwell pressure, Lorentz hoop load,
 * and superconducting critical field margin for NbTi (LHC 8.3T) vs Nb3Sn (HL-LHC 16T).
 */
export function calculateSuperconductingMagnetMetrics(
  fieldTesla: number,
  apertureRadiusMm = 28,
  temperatureKelvin = 1.9,
  material: 'NbTi' | 'Nb3Sn' = 'Nb3Sn'
): SuperconductingMagnetResult {
  const mu0 = 4 * Math.PI * 1e-7;
  const safeB = Math.max(0, Math.min(28, fieldTesla));
  const safeR = Math.max(5, apertureRadiusMm) / 1000;
  const safeT = Math.max(1.2, Math.min(25, temperatureKelvin));

  const energyDensityJm3 = (safeB * safeB) / (2 * mu0);
  const energyDensityMjM3 = energyDensityJm3 / 1e6;
  const magneticPressureMpa = energyDensityJm3 / 1e6;
  const hoopForceKnPerMeter = (energyDensityJm3 * 2 * safeR) / 1000;

  const tc0 = material === 'NbTi' ? 9.2 : 18.3;
  const bc2_0 = material === 'NbTi' ? 14.5 : 28.0;
  const tRatio = safeT / tc0;
  const criticalFieldT = tRatio >= 1 ? 0 : bc2_0 * (1 - tRatio * tRatio) * 0.78;

  const quenched = safeB > criticalFieldT || criticalFieldT <= 0;
  const safetyMarginFraction =
    criticalFieldT <= 0 ? 0 : Math.max(0, (criticalFieldT - safeB) / criticalFieldT);

  return {
    fieldTesla: safeB,
    energyDensityMjM3,
    magneticPressureMpa,
    hoopForceKnPerMeter,
    criticalFieldT,
    quenched,
    safetyMarginFraction,
  };
}

export interface DisplacedVertexResult {
  properDecayLengthMm: number;
  boostedDecayLengthM: number;
  probInsideTracker: number;
  probInsideCalorimeter: number;
  probInsideMuonSpec: number;
  probFarForwardFaser: number;
}

/**
 * Computes relativistic mean decay distance L_lab = beta * gamma * c * tau_0 for Long-Lived Particles (LLPs)
 * and cumulative exponential decay probabilities across ATLAS/CMS detector shells and FASER (480m).
 */
export function calculateDisplacedVertexDecay(
  properLifetimePs: number,
  particleMassGev: number,
  energyGev: number
): DisplacedVertexResult {
  const cMetersPerSec = 299792458;
  const safeTauSec = Math.max(0.01, properLifetimePs) * 1e-12;
  const safeMass = Math.max(0.05, particleMassGev);
  const safeEnergy = Math.max(safeMass * 1.001, energyGev);

  const gamma = safeEnergy / safeMass;
  const beta = Math.sqrt(Math.max(0, 1 - 1 / (gamma * gamma)));
  const properDecayLengthM = cMetersPerSec * safeTauSec;
  const boostedDecayLengthM = Math.max(1e-6, gamma * beta * properDecayLengthM);

  const cdf = (rM: number) => 1 - Math.exp(-rM / boostedDecayLengthM);
  const probInsideTracker = cdf(1.2);
  const probInsideCalorimeter = Math.max(0, cdf(3.8) - cdf(1.2));
  const probInsideMuonSpec = Math.max(0, cdf(12.0) - cdf(3.8));
  const probFarForwardFaser = Math.max(0, cdf(485) - cdf(475));

  return {
    properDecayLengthMm: properDecayLengthM * 1000,
    boostedDecayLengthM,
    probInsideTracker,
    probInsideCalorimeter,
    probInsideMuonSpec,
    probFarForwardFaser,
  };
}

export interface ExtraDimensionResult {
  extraDimensionsN: number;
  compactRadiusMm: number;
  effectivePlanckTev: number;
  kkModeSpacingEv: number;
  lhcAccessible: boolean;
}

/**
 * Evaluates ADD large extra-dimension gravity scale M_D from Newton's constant (M_Pl^2 ~ M_D^(2+n) * R^n)
 * and Kaluza-Klein graviton mode spacing Delta m ~ hbar * c / R.
 */
export function calculateExtraDimensionKaluzaKlein(
  extraDimensionsN: number,
  compactRadiusMicrons: number
): ExtraDimensionResult {
  const n = Math.max(1, Math.min(7, Math.round(extraDimensionsN)));
  const rUm = Math.max(1e-9, Math.min(2000, compactRadiusMicrons));
  const hbarCeVm = 1.9732698e-7; // eV * m
  const rMeters = rUm * 1e-6;
  const rInvGev = rMeters / 1.9732698e-16; // in GeV^-1
  const mPlGev = 1.22089e19;

  // M_D^(2+n) = M_Pl^2 / R^n  (in GeV)
  const logMdGev = (2 * Math.log10(mPlGev) - n * Math.log10(rInvGev)) / (2 + n);
  const mDTev = Math.pow(10, logMdGev - 3);
  const kkModeSpacingEv = hbarCeVm / rMeters;

  return {
    extraDimensionsN: n,
    compactRadiusMm: rUm / 1000,
    effectivePlanckTev: mDTev,
    kkModeSpacingEv,
    lhcAccessible: mDTev <= 14.0,
  };
}

export interface MonopoleArenaResult {
  magneticChargeDiracUnits: number;
  effectiveChargeRatio: number;
  ionizingLossRatioVsProton: number;
  deflectionSlopeT: number;
}

/**
 * Computes Dirac quantization condition g_D = e / (2 alpha) (~68.5 e) and MoEDAL ionization boost (g / e)^2
 * along with magnetic parabolic acceleration vs standard Lorentz curvature.
 */
export function calculateDiracMonopoleMetrics(
  diracUnitsN: number,
  magneticFieldT: number,
  kineticEnergyGev: number
): MonopoleArenaResult {
  const alphaEm = 1 / 137.035999;
  const gDiracOverE = 1 / (2 * alphaEm); // ~68.518
  const n = Math.max(1, Math.min(6, Math.round(diracUnitsN)));
  const effG = n * gDiracOverE;
  const ionizingLossRatioVsProton = effG * effG; // ~4695 * n^2 times MIP!
  const deflectionSlopeT = (Math.abs(magneticFieldT) * n * 2.05) / Math.max(1, kineticEnergyGev);

  return {
    magneticChargeDiracUnits: n,
    effectiveChargeRatio: effG,
    ionizingLossRatioVsProton,
    deflectionSlopeT,
  };
}
