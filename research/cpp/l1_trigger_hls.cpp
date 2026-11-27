// CERN-X Scientific Kernel: Ultra-Low Latency Level-1 Hardware Trigger Emulator (C++17)
// Models fixed-threshold FPGA kinematic filtering for 40 MHz LHC dimuon & diphoton bunch crossings.

#include <algorithm>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <vector>

namespace cernx::trigger {

struct TriggerObject {
  double pt_gev;
  double eta;
  double phi;
  int charge;
};

struct TriggerDecision {
  bool l1_accept;
  double invariant_mass_gev;
  double delta_r;
  uint32_t latency_ns;
};

constexpr double PI = 3.14159265358979323846;

inline double wrap_delta_phi(double dphi) {
  while (dphi > PI) dphi -= 2.0 * PI;
  while (dphi < -PI) dphi += 2.0 * PI;
  return dphi;
}

inline TriggerDecision evaluate_dimuon_l1(const TriggerObject& a,
                                          const TriggerObject& b,
                                          double min_lead_pt_gev = 20.0,
                                          double min_mass_gev = 60.0) {
  const double deta = a.eta - b.eta;
  const double dphi = wrap_delta_phi(a.phi - b.phi);
  const double delta_r = std::sqrt(deta * deta + dphi * dphi);

  // Massless ultrarelativistic di-object invariant mass M^2 = 2 pT1 pT2 (cosh(dEta) - cos(dPhi))
  const double m2 = 2.0 * a.pt_gev * b.pt_gev * (std::cosh(deta) - std::cos(dphi));
  const double mass_gev = std::sqrt(std::max(0.0, m2));

  const bool pt_ok = (std::max(a.pt_gev, b.pt_gev) >= min_lead_pt_gev) &&
                       (std::min(a.pt_gev, b.pt_gev) >= 10.0);
  const bool opp_sign = (a.charge * b.charge) <= 0;
  const bool mass_ok = mass_gev >= min_mass_gev;

  return TriggerDecision{
      pt_ok && opp_sign && mass_ok,
      mass_gev,
      delta_r,
      125  // 5 LHC 25ns BX pipeline stages = 125 ns deterministic latency
  };
}

}  // namespace cernx::trigger

int main() {
  using namespace cernx::trigger;

  // Test 1: Back-to-back Z0 -> mu+ mu- candidate (~91.2 GeV)
  const TriggerObject mu1{45.6, 0.20, 0.0, +1};
  const TriggerObject mu2{45.6, -0.20, PI, -1};
  const auto z_res = evaluate_dimuon_l1(mu1, mu2);
  assert(z_res.l1_accept);
  assert(z_res.invariant_mass_gev > 88.0 && z_res.invariant_mass_gev < 96.0);

  // Test 2: Soft minimum-bias QCD spray (rejected cleanly by L1)
  const TriggerObject soft1{8.5, 0.1, 0.4, +1};
  const TriggerObject soft2{6.2, 0.15, 0.9, -1};
  const auto qcd_res = evaluate_dimuon_l1(soft1, soft2);
  assert(!qcd_res.l1_accept);

  // Test 3: H -> gamma gamma back-to-back (~125.2 GeV)
  const TriggerObject gam1{62.6, 0.0, 0.5, 0};
  const TriggerObject gam2{62.6, 0.0, 0.5 + PI, 0};
  const auto h_res = evaluate_dimuon_l1(gam1, gam2);
  assert(h_res.l1_accept);
  assert(std::abs(h_res.invariant_mass_gev - 125.2) < 0.1);

  std::cout << std::fixed << std::setprecision(2)
            << "[C++ L1 Trigger HLS] PASS: Z0 M=" << z_res.invariant_mass_gev
            << " GeV | H0 M=" << h_res.invariant_mass_gev
            << " GeV | Latency=" << z_res.latency_ns << " ns\n";
  return 0;
}
