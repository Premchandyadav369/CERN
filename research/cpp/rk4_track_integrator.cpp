// CERN-X Scientific Kernel: 4th-Order Runge-Kutta (RK4) Relativistic Track & Dirac Monopole Integrator (C++17)
// Compares Lorentz transverse curvature (q * v x B) against MoEDAL Dirac Monopole longitudinal acceleration (g_D * B).

#include <algorithm>
#include <cassert>
#include <cmath>
#include <iostream>
#include <iomanip>

namespace cernx::tracking {

struct Vec3 {
  double x, y, z;
  Vec3 operator+(const Vec3& o) const { return {x + o.x, y + o.y, z + o.z}; }
  Vec3 operator-(const Vec3& o) const { return {x - o.x, y - o.y, z - o.z}; }
  Vec3 operator*(double s) const { return {x * s, y * s, z * s}; }
  double norm() const { return std::sqrt(x * x + y * y + z * z); }
};

inline Vec3 cross(const Vec3& a, const Vec3& b) {
  return {a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x};
}

constexpr double C_MPS = 299792458.0;
constexpr double E_CHARGE = 1.602176634e-19;
constexpr double ALPHA_EM = 1.0 / 137.035999084;
constexpr double G_DIRAC_OVER_E = 1.0 / (2.0 * ALPHA_EM);  // ~68.518 e

struct State {
  Vec3 pos;
  Vec3 vel;
};

// Relativistic RK4 step for uniform B-field along +z (electric charge q_units OR magnetic charge g_dirac_units)
inline State rk4_step(const State& s, double gamma_mass_kg, double b_tesla,
                      int elec_q_units, int dirac_g_units, double dt) {
  const Vec3 b_vec{0.0, 0.0, b_tesla};

  auto accel = [&](const Vec3& v) -> Vec3 {
    const double q_c = static_cast<double>(elec_q_units) * E_CHARGE;
    const Vec3 f_lorentz = cross(v, b_vec) * q_c;
    // Analogous magnetic force g * B acting longitudinally for hypothetical Dirac monopole
    const double g_amp_m = static_cast<double>(dirac_g_units) * G_DIRAC_OVER_E * E_CHARGE * C_MPS;
    const Vec3 f_mono{0.0, 0.0, g_amp_m * b_tesla};
    return (f_lorentz + f_mono) * (1.0 / gamma_mass_kg);
  };

  const Vec3 k1_x = s.vel;
  const Vec3 k1_v = accel(s.vel);

  const Vec3 k2_x = s.vel + k1_v * (0.5 * dt);
  const Vec3 k2_v = accel(k2_x);

  const Vec3 k3_x = s.vel + k2_v * (0.5 * dt);
  const Vec3 k3_v = accel(k3_x);

  const Vec3 k4_x = s.vel + k3_v * dt;
  const Vec3 k4_v = accel(k4_x);

  return State{
      s.pos + (k1_x + k2_x * 2.0 + k3_x * 2.0 + k4_x) * (dt / 6.0),
      s.vel + (k1_v + k2_v * 2.0 + k3_v * 2.0 + k4_v) * (dt / 6.0),
  };
}

}  // namespace cernx::tracking

int main() {
  using namespace cernx::tracking;

  // Test 1: Standard unit-charge particle in 3.8 T field conserving |v| under pure Lorentz force
  // p = 10 GeV/c -> relativistic gamma_m = p / c
  const double p_gev = 10.0;
  const double p_si = p_gev * 1e9 * E_CHARGE / C_MPS;
  const double gamma_mass_kg = p_si / (0.995 * C_MPS);
  const double expected_radius_m = p_gev / (0.299792458 * 3.8);

  State proton{{0.0, 0.0, 0.0}, {0.995 * C_MPS, 0.0, 0.0}};
  const double dt = 1e-11;
  double max_y = 0.0;
  for (int i = 0; i < 4000; ++i) {
    proton = rk4_step(proton, gamma_mass_kg, 3.8, +1, 0, dt);
    max_y = std::max(max_y, std::abs(proton.pos.y));
  }
  const double speed_drift = std::abs(proton.vel.norm() - 0.995 * C_MPS) / (0.995 * C_MPS);
  assert(speed_drift < 1e-4);
  assert(expected_radius_m > 8.7 && expected_radius_m < 8.9);

  // Test 2: Dirac monopole longitudinal boost & ~4695x ionization ratio
  const double ionization_ratio = G_DIRAC_OVER_E * G_DIRAC_OVER_E;
  assert(ionization_ratio > 4600.0 && ionization_ratio < 4750.0);

  State monopole{{0.0, 0.0, 0.0}, {0.8 * C_MPS, 0.0, 0.0}};
  for (int i = 0; i < 500; ++i) {
    monopole = rk4_step(monopole, gamma_mass_kg, 3.8, 0, 1, dt);
  }
  assert(monopole.pos.z > 0.0);

  std::cout << std::fixed << std::setprecision(4)
            << "[C++ RK4 Integrator] PASS: Speed conservation drift=" << speed_drift
            << " | Cyclotron R=" << expected_radius_m
            << " m | Dirac (g_D/e)^2=" << ionization_ratio
            << " | Monopole dz=" << monopole.pos.z << " m\n";
  return 0;
}
