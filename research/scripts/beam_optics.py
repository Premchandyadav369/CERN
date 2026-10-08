"""
CERN-X Accelerator Physics: Linear Beam Optics & FODO Lattice Simulator
Reference: CERN Accelerator School (CAS) - Introduction to Beam Dynamics
LHC Design Report Vol 1: Chapter 2 (Lattice Design and Orbit)

This script computes:
  1. Transfer matrices (2x2 Courant-Snyder) for drift spaces and quadrupoles
  2. Periodic FODO cell transfer matrix M_cell
  3. Cell stability criterion: |Tr(M_cell)| < 2
  4. Phase advance per cell mu = arccos(Tr(M)/2)
  5. Maximum and minimum beta functions (beta_max, beta_min)
  6. Beam envelope sigma(s) = sqrt(epsilon * beta(s)) for given normalized emittance
  7. Numerical comparison against nominal LHC arc lattice parameters
"""

import math
import json
import numpy as np

def drift_matrix(L: float) -> np.ndarray:
    """Transfer matrix for a field-free drift space of length L [m]."""
    return np.array([
        [1.0, L],
        [0.0, 1.0]
    ], dtype=np.float64)

def thin_quadrupole_matrix(f: float) -> np.ndarray:
    """Transfer matrix for a thin-lens quadrupole with focal length f [m]."""
    return np.array([
        [1.0, 0.0],
        [-1.0 / f, 1.0]
    ], dtype=np.float64)

def thick_quadrupole_matrix(k1: float, L: float) -> np.ndarray:
    """
    Thick-lens quadrupole transfer matrix.
    k1 > 0: Focusing
    k1 < 0: Defocusing
    """
    if abs(k1) < 1e-12:
        return drift_matrix(L)
    if k1 > 0:
        omega = math.sqrt(k1)
        phi = omega * L
        return np.array([
            [math.cos(phi), math.sin(phi) / omega],
            [-omega * math.sin(phi), math.cos(phi)]
        ], dtype=np.float64)
    else:
        omega = math.sqrt(-k1)
        phi = omega * L
        return np.array([
            [math.cosh(phi), math.sinh(phi) / omega],
            [omega * math.sinh(phi), math.cosh(phi)]
        ], dtype=np.float64)

def compute_fodo_cell(L_cell: float, f: float):
    """
    Computes a symmetric FODO cell:
    1/2 QF -> Drift (L/2) -> QD -> Drift (L/2) -> 1/2 QF
    """
    L_drift = L_cell / 2.0
    M_half_qf = thin_quadrupole_matrix(2.0 * f)
    M_qd = thin_quadrupole_matrix(-f)
    M_drift = drift_matrix(L_drift)

    # Multiply in order: M_half_qf @ M_drift @ M_qd @ M_drift @ M_half_qf
    M_cell = M_half_qf @ M_drift @ M_qd @ M_drift @ M_half_qf

    trace = float(M_cell[0, 0] + M_cell[1, 1])
    is_stable = abs(trace) < 2.0

    if is_stable:
        cos_mu = trace / 2.0
        mu_rad = math.acos(cos_mu)
        mu_deg = math.degrees(mu_rad)
        sin_half_mu = L_cell / (4.0 * f)

        # Analytic beta functions at the symmetry points (mid-QF and mid-QD)
        sin_mu = math.sin(mu_rad)
        beta_max = (L_cell * (1.0 + math.sin(mu_rad / 2.0))) / sin_mu
        beta_min = (L_cell * (1.0 - math.sin(mu_rad / 2.0))) / sin_mu
        alpha_at_mid = 0.0 # By symmetry
    else:
        mu_rad = 0.0
        mu_deg = 0.0
        beta_max = float('nan')
        beta_min = float('nan')
        alpha_at_mid = float('nan')

    return {
        "matrix": M_cell.tolist(),
        "trace": trace,
        "is_stable": is_stable,
        "phase_advance_rad": mu_rad,
        "phase_advance_deg": mu_deg,
        "beta_max_m": beta_max,
        "beta_min_m": beta_min,
        "focal_length_m": f,
        "cell_length_m": L_cell
    }

def main():
    print("=" * 72)
    print("CERN-X Accelerator Physics: Beam Optics & FODO Cell Solver")
    print("Benchmark: LHC Main Arc Lattice Cell (CERN Design Report)")
    print("=" * 72)

    # Nominal LHC Arc Cell parameters:
    # Cell length L_cell = 106.9 m
    # Nominal phase advance mu = 90 deg (pi/2) -> sin(mu/2) = sin(45 deg) = 1/sqrt(2)
    # Since sin(mu/2) = L_cell / (4 * f), f = L_cell / (4 * sin(45 deg)) = 106.9 / (4 * 0.7071) ~ 37.8 m
    L_lhc = 106.9
    f_lhc = L_lhc / (4.0 * math.sin(math.radians(45.0)))

    optics = compute_fodo_cell(L_cell=L_lhc, f=f_lhc)

    print(f"\n[FODO Cell Parameters]")
    print(f"  Cell Length (L):        {optics['cell_length_m']:.2f} m")
    print(f"  Quadrupole Focal (f):   {optics['focal_length_m']:.2f} m")
    print(f"  Transfer Matrix Trace:  {optics['trace']:.5f} (Stability: {optics['is_stable']})")
    print(f"  Phase Advance (mu):     {optics['phase_advance_deg']:.2f} degrees ({optics['phase_advance_rad']:.4f} rad)")
    print(f"  Beta Maximum (beta_max): {optics['beta_max_m']:.2f} m (mid-focusing quad)")
    print(f"  Beta Minimum (beta_min): {optics['beta_min_m']:.2f} m (mid-defocusing quad)")

    # Beam envelope at 7 TeV (rel. gamma ~ 7460) with normalized emittance epsilon_n = 2.5 um rad
    gamma_rel = 7460.5
    eps_geom = 2.5e-6 / gamma_rel
    sigma_max_um = math.sqrt(eps_geom * optics['beta_max_m']) * 1e6
    sigma_min_um = math.sqrt(eps_geom * optics['beta_min_m']) * 1e6

    print(f"\n[Beam Envelope @ 7 TeV]")
    print(f"  Geometric Emittance:    {eps_geom*1e9:.3f} nm*rad")
    print(f"  RMS Beam Size (max):    {sigma_max_um:.1f} um")
    print(f"  RMS Beam Size (min):    {sigma_min_um:.1f} um")

    # Comparison against published LHC parameters
    published_lhc = {
        "beta_max_m": 177.0,
        "beta_min_m": 33.0,
        "phase_advance_deg": 90.0,
        "tolerance_pct": 5.0
    }
    diff_beta_max = abs(optics['beta_max_m'] - published_lhc['beta_max_m']) / published_lhc['beta_max_m'] * 100
    print(f"\n[Validation Against LHC Design Report]")
    print(f"  Computed beta_max: {optics['beta_max_m']:.2f} m vs Published: {published_lhc['beta_max_m']} m (Diff: {diff_beta_max:.2f}%)")
    print(f"  Validation Status: {'PASS' if diff_beta_max < published_lhc['tolerance_pct'] else 'FAIL'}")
    print("=" * 72)

if __name__ == "__main__":
    main()
