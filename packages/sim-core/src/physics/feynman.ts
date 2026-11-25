import {
  ELECTRON_MASS_GEV,
  HIGGS_MASS_GEV,
  MUON_MASS_GEV,
  PROTON_MASS_GEV,
  RIGIDITY_CONVERSION,
  W_BOSON_MASS_GEV,
  Z_BOSON_MASS_GEV,
} from './constants.js';

export interface QuantumParticle {
  id: string;
  symbol: string;
  name: string;
  massGev: number;
  chargeQ: number; // In units of e (supports 1/3 precision via multiples or exact fractions)
  baryonB: number;
  leptonE: number;
  leptonMu: number;
  leptonTau: number;
  spin: string;
  category: 'lepton' | 'quark' | 'boson' | 'hadron';
}

// Rest masses and quantum numbers grounded in PDG 2024
export const QUANTUM_PARTICLES: Record<string, QuantumParticle> = {
  'e-': {
    id: 'e-',
    symbol: 'e⁻',
    name: 'Electron',
    massGev: ELECTRON_MASS_GEV,
    chargeQ: -1,
    baryonB: 0,
    leptonE: 1,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1/2',
    category: 'lepton',
  },
  'e+': {
    id: 'e+',
    symbol: 'e⁺',
    name: 'Positron',
    massGev: ELECTRON_MASS_GEV,
    chargeQ: 1,
    baryonB: 0,
    leptonE: -1,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1/2',
    category: 'lepton',
  },
  'mu-': {
    id: 'mu-',
    symbol: 'μ⁻',
    name: 'Muon',
    massGev: MUON_MASS_GEV,
    chargeQ: -1,
    baryonB: 0,
    leptonE: 0,
    leptonMu: 1,
    leptonTau: 0,
    spin: '1/2',
    category: 'lepton',
  },
  'mu+': {
    id: 'mu+',
    symbol: 'μ⁺',
    name: 'Antimuon',
    massGev: MUON_MASS_GEV,
    chargeQ: 1,
    baryonB: 0,
    leptonE: 0,
    leptonMu: -1,
    leptonTau: 0,
    spin: '1/2',
    category: 'lepton',
  },
  'nu_e': {
    id: 'nu_e',
    symbol: 'νₑ',
    name: 'Electron Neutrino',
    massGev: 0,
    chargeQ: 0,
    baryonB: 0,
    leptonE: 1,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1/2',
    category: 'lepton',
  },
  'nubar_e': {
    id: 'nubar_e',
    symbol: 'ν̄ₑ',
    name: 'Electron Antineutrino',
    massGev: 0,
    chargeQ: 0,
    baryonB: 0,
    leptonE: -1,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1/2',
    category: 'lepton',
  },
  'nu_mu': {
    id: 'nu_mu',
    symbol: 'ν_μ',
    name: 'Muon Neutrino',
    massGev: 0,
    chargeQ: 0,
    baryonB: 0,
    leptonE: 0,
    leptonMu: 1,
    leptonTau: 0,
    spin: '1/2',
    category: 'lepton',
  },
  u: {
    id: 'u',
    symbol: 'u',
    name: 'Up Quark',
    massGev: 0.00216,
    chargeQ: 2 / 3,
    baryonB: 1 / 3,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1/2',
    category: 'quark',
  },
  d: {
    id: 'd',
    symbol: 'd',
    name: 'Down Quark',
    massGev: 0.0047,
    chargeQ: -1 / 3,
    baryonB: 1 / 3,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1/2',
    category: 'quark',
  },
  ubar: {
    id: 'ubar',
    symbol: 'ū',
    name: 'Anti-Up Quark',
    massGev: 0.00216,
    chargeQ: -2 / 3,
    baryonB: -1 / 3,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1/2',
    category: 'quark',
  },
  dbar: {
    id: 'dbar',
    symbol: 'd̄',
    name: 'Anti-Down Quark',
    massGev: 0.0047,
    chargeQ: 1 / 3,
    baryonB: -1 / 3,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1/2',
    category: 'quark',
  },
  gamma: {
    id: 'gamma',
    symbol: 'γ',
    name: 'Photon',
    massGev: 0,
    chargeQ: 0,
    baryonB: 0,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1',
    category: 'boson',
  },
  g: {
    id: 'g',
    symbol: 'g',
    name: 'Gluon',
    massGev: 0,
    chargeQ: 0,
    baryonB: 0,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1',
    category: 'boson',
  },
  'W+': {
    id: 'W+',
    symbol: 'W⁺',
    name: 'W⁺ Boson',
    massGev: W_BOSON_MASS_GEV,
    chargeQ: 1,
    baryonB: 0,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1',
    category: 'boson',
  },
  'W-': {
    id: 'W-',
    symbol: 'W⁻',
    name: 'W⁻ Boson',
    massGev: W_BOSON_MASS_GEV,
    chargeQ: -1,
    baryonB: 0,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1',
    category: 'boson',
  },
  Z0: {
    id: 'Z0',
    symbol: 'Z⁰',
    name: 'Z⁰ Boson',
    massGev: Z_BOSON_MASS_GEV,
    chargeQ: 0,
    baryonB: 0,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1',
    category: 'boson',
  },
  H: {
    id: 'H',
    symbol: 'H⁰',
    name: 'Higgs Boson',
    massGev: HIGGS_MASS_GEV,
    chargeQ: 0,
    baryonB: 0,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '0',
    category: 'boson',
  },
  p: {
    id: 'p',
    symbol: 'p⁺',
    name: 'Proton',
    massGev: PROTON_MASS_GEV,
    chargeQ: 1,
    baryonB: 1,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1/2',
    category: 'hadron',
  },
  n: {
    id: 'n',
    symbol: 'n⁰',
    name: 'Neutron',
    massGev: 0.93956542,
    chargeQ: 0,
    baryonB: 1,
    leptonE: 0,
    leptonMu: 0,
    leptonTau: 0,
    spin: '1/2',
    category: 'hadron',
  },
};

export interface ConservationCheckResult {
  valid: boolean;
  quantumValid: boolean;
  kinematicallyAllowed: boolean;
  deltaQ: number;
  deltaB: number;
  deltaLe: number;
  deltaLmu: number;
  deltaLtau: number;
  thresholdGev: number;
  violations: string[];
}

function sumQuantumNumbers(ids: string[]) {
  return ids.reduce(
    (acc, id) => {
      const p = QUANTUM_PARTICLES[id];
      if (!p) {
        throw new Error(`Unknown particle id: ${id}`);
      }
      acc.q += p.chargeQ;
      acc.b += p.baryonB;
      acc.le += p.leptonE;
      acc.lmu += p.leptonMu;
      acc.ltau += p.leptonTau;
      acc.mass += p.massGev;
      return acc;
    },
    { q: 0, b: 0, le: 0, lmu: 0, ltau: 0, mass: 0 }
  );
}

/**
 * Validates Standard Model conservation laws (Charge, Baryon Number, Lepton Flavor Numbers)
 * and relativistic center-of-mass threshold energy sqrt(s) >= sum(m_out).
 */
export function validateInteractionConservation(
  incomingIds: string[],
  outgoingIds: string[],
  sqrtSGev: number
): ConservationCheckResult {
  const initial = sumQuantumNumbers(incomingIds);
  const finalState = sumQuantumNumbers(outgoingIds);

  // Use tiny epsilon due to quark charge 1/3 floating point representation
  const eps = 1e-6;
  const deltaQ = Math.abs(finalState.q - initial.q) < eps ? 0 : Number((finalState.q - initial.q).toFixed(4));
  const deltaB = Math.abs(finalState.b - initial.b) < eps ? 0 : Number((finalState.b - initial.b).toFixed(4));
  const deltaLe = finalState.le - initial.le;
  const deltaLmu = finalState.lmu - initial.lmu;
  const deltaLtau = finalState.ltau - initial.ltau;

  const violations: string[] = [];
  if (deltaQ !== 0) {
    violations.push(`Electric charge violation: ΔQ = ${deltaQ > 0 ? '+' : ''}${deltaQ} e`);
  }
  if (deltaB !== 0) {
    violations.push(`Baryon number violation: ΔB = ${deltaB > 0 ? '+' : ''}${deltaB}`);
  }
  if (deltaLe !== 0) {
    violations.push(`Electron lepton flavor violation: ΔLₑ = ${deltaLe > 0 ? '+' : ''}${deltaLe}`);
  }
  if (deltaLmu !== 0) {
    violations.push(`Muon lepton flavor violation: ΔL_μ = ${deltaLmu > 0 ? '+' : ''}${deltaLmu}`);
  }
  if (deltaLtau !== 0) {
    violations.push(`Tau lepton flavor violation: ΔL_τ = ${deltaLtau > 0 ? '+' : ''}${deltaLtau}`);
  }

  const thresholdGev = finalState.mass;
  const kinematicallyAllowed = sqrtSGev + eps >= thresholdGev;
  if (!kinematicallyAllowed) {
    violations.push(
      `Insufficient center-of-mass energy: √s = ${sqrtSGev.toFixed(3)} GeV < threshold Σm_out = ${thresholdGev.toFixed(3)} GeV`
    );
  }

  const quantumValid =
    deltaQ === 0 && deltaB === 0 && deltaLe === 0 && deltaLmu === 0 && deltaLtau === 0;

  return {
    valid: quantumValid && kinematicallyAllowed,
    quantumValid,
    kinematicallyAllowed,
    deltaQ,
    deltaB,
    deltaLe,
    deltaLmu,
    deltaLtau,
    thresholdGev,
    violations,
  };
}

/**
 * Tree-level QED + Z0 resonance cross section for e+ e- -> mu+ mu- in nanobarns (nb).
 * Pure QED: sigma_0 = (4 * pi * alpha^2) / (3 * s) * (hbar*c)^2 * threshold_factor
 * with (hbar*c)^2 = 0.389379372e6 nb * GeV^2 (PDG 2024).
 */
export function calculateEeToMumuCrossSectionNb(sqrtSGev: number): {
  qedOnlyNb: number;
  withZResonanceNb: number;
  mandelstamS: number;
} {
  if (sqrtSGev <= 2 * MUON_MASS_GEV) {
    return {
      qedOnlyNb: 0,
      withZResonanceNb: 0,
      mandelstamS: sqrtSGev * sqrtSGev,
    };
  }

  const alpha = 1 / 137.035999084;
  const hbarCSqNbGev2 = 389379.372; // 0.389379 GeV^2 mb = 389379.372 GeV^2 nb
  const s = sqrtSGev * sqrtSGev;
  const beta = Math.sqrt(Math.max(0, 1 - (4 * MUON_MASS_GEV * MUON_MASS_GEV) / s));
  const thresholdFactor = 0.5 * beta * (3 - beta * beta);

  const qedOnlyNb = ((4 * Math.PI * alpha * alpha) / (3 * s)) * hbarCSqNbGev2 * thresholdFactor;

  // Relativistic Breit-Wigner enhancement near Z0 pole (M_Z = 91.1876 GeV, Gamma_Z = 2.4955 GeV)
  const gammaZ = 2.4955;
  const peakFactor = 210.0; // Approximate LEP ratio sigma_peak(Z -> mumu) / sigma_QED(M_Z)
  const bwDenom = (s - Z_BOSON_MASS_GEV * Z_BOSON_MASS_GEV) ** 2 + (Z_BOSON_MASS_GEV * gammaZ) ** 2;
  const bwTerm =
    (s * gammaZ * gammaZ * Z_BOSON_MASS_GEV * Z_BOSON_MASS_GEV) / Math.max(bwDenom, 1e-9);

  const withZResonanceNb = qedOnlyNb * (1 + peakFactor * bwTerm);

  return {
    qedOnlyNb,
    withZResonanceNb,
    mandelstamS: s,
  };
}

/**
 * Computes cyclotron radius of curvature R in meters inside a uniform solenoidal magnetic field B (Tesla).
 * R = p [GeV/c] / (0.299792458 * |q| * |B|)
 */
export function calculateCyclotronRadiusMeters(
  momentumGevC: number,
  magneticFieldT: number,
  chargeZ: number = 1
): number {
  const bAbs = Math.abs(magneticFieldT);
  const qAbs = Math.abs(chargeZ);
  if (bAbs < 1e-6 || qAbs === 0) {
    return Infinity;
  }
  return momentumGevC / (RIGIDITY_CONVERSION * qAbs * bAbs);
}

/**
 * Computes beam-pipe Ultra-High Vacuum gas density, proton mean free path, and beam lifetime.
 * Uses ideal gas law n = P / (k_B * T) and proton-H2 equivalent nuclear/Coulomb cross section (~100 mb effective scattering at LHC).
 */
export function calculateVacuumMetrics(pressureMbar: number, temperatureK: number = 1.9): {
  pressurePa: number;
  molecularDensityCm3: number;
  meanFreePathMeters: number;
  beamLifetimeHours: number;
} {
  const safeP = Math.max(pressureMbar, 1e-13);
  const safeT = Math.max(temperatureK, 1.5);
  const pressurePa = safeP * 100; // 1 mbar = 100 Pa
  const boltzmannK = 1.380649e-23; // J/K

  const molecularDensityM3 = pressurePa / (boltzmannK * safeT);
  const molecularDensityCm3 = molecularDensityM3 * 1e-6;

  // Effective beam-gas loss cross section ~ 100 mb = 1e-29 m^2 (inelastic + small-angle aperture loss)
  const sigmaLossM2 = 1e-29;
  const meanFreePathMeters = 1 / (molecularDensityM3 * sigmaLossM2);

  // At beta ~ 1, v ~ 2.998e8 m/s -> tau = lambda / c
  const tauSeconds = meanFreePathMeters / 299792458;
  const beamLifetimeHours = tauSeconds / 3600;

  return {
    pressurePa,
    molecularDensityCm3,
    meanFreePathMeters,
    beamLifetimeHours,
  };
}
