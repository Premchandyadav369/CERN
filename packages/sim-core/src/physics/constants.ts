/**
 * Centralized Physical Constants
 * Sources: CODATA 2022 recommended values & PDG 2024 Review of Particle Physics.
 */

export const SPEED_OF_LIGHT_M_S = 299792458; // exact (SI definition)
export const ELEMENTARY_CHARGE_C = 1.602176634e-19; // exact (SI definition)

// Rest masses in GeV/c^2 (PDG 2024)
export const PROTON_MASS_GEV = 0.93827208816;
export const ELECTRON_MASS_GEV = 0.00051099895;
export const MUON_MASS_GEV = 0.1056583755;
export const LEAD208_MASS_GEV = 193.6877; // Lead-208 nucleus mass
export const HIGGS_MASS_GEV = 125.25; // PDG central value (nominal 125.0 in toy)
export const Z_BOSON_MASS_GEV = 91.1876;
export const W_BOSON_MASS_GEV = 80.377;

// LHC Geometric & Machine Constants (LHC Design Report CERN-2004-003)
export const LHC_CIRCUMFERENCE_M = 26658.883;
export const LHC_BENDING_RADIUS_M = 2803.95; // Effective dipole bending radius rho
export const LHC_MAIN_DIPOLE_COUNT = 1232;
export const LHC_DIPOLE_LENGTH_M = 14.3;

// Magnetic rigidity factor: c [m/s] * 10^-9 = 0.299792458 [GeV / (T * m * e)]
export const RIGIDITY_CONVERSION = 0.299792458;
