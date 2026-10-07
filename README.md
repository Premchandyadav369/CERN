# CERN-X: The Interactive Digital Universe of CERN

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Phase 0 Review](https://img.shields.io/badge/Status-Phase_0_Review-orange.svg)](#status)
[![Physics: Validated](https://img.shields.io/badge/Physics-Unit_Tested-green.svg)](#physics-validation)

> **IMPORTANT DISCLAIMER**: CERN-X is an independent, open-source educational and research platform. It is **NOT** affiliated with, endorsed by, or operated by the European Organization for Nuclear Research (CERN). CERN trademarks, logos, and protected identities are not used.

---

## 1. Overview
CERN-X is an interactive scientific digital representation of CERN's accelerator, experiment, detector, computing, and research ecosystem.

The platform links the complete scientific chain:
$$\text{Proton Source} \rightarrow \text{Linac4} \rightarrow \text{PSB} \rightarrow \text{PS} \rightarrow \text{SPS} \rightarrow \text{LHC} \rightarrow \text{Collision} \rightarrow \text{Detector} \rightarrow \text{Trigger} \rightarrow \text{Computing} \rightarrow \text{Reconstruction} \rightarrow \text{Physics Result}$$

Every number presented in the platform carries verifiable scientific provenance (`REAL`, `PUBLISHED`, or `COMPUTED`) tracked in [`/data/manifest.json`](data/manifest.json).

---

## 2. Key Architecture & Depth Tiers

### Deep Modules (Interactive & Quantitative)
- **Injector Chain & LHC Simulator**: Deterministic relativistic beam kinematics, RF acceleration, and magnetic rigidity.
- **ATLAS Detector Twin**: Interactive 3D cutaway with layered subsystem filters and real Open Data event visualization.
- **Trigger/DAQ Lab**: Multi-tier L1/HLT rate-latency budget sandbox with ROC trade-off curves.
- **WLCG & Data Centre Simulator**: Discrete-event distributed grid scheduling, replication, and failure simulation.
- **AI Lab (LHC-TriggerMind)**: Reproducible benchmark running machine learning event selection on public ATLAS simulation data.

### Interactive Modules (One Validated Model Each)
- **CMS**: General-purpose cross-check comparison with ATLAS geometry and solenoid field.
- **ALICE**: Heavy-ion collision physics, quark-gluon plasma thermodynamics, and nuclear modification factor ($R_{AA}$).
- **LHCb**: Flavour physics, $B$-meson decay channels, and CP violation.
- **Antimatter Factory**: AD and ELENA decelerators, Penning-Malmberg confinement, and spectroscopy.
- **ISOLDE, AWAKE, n_TOF**: Nuclear isotope production, plasma wakefield acceleration, and neutron time-of-flight cross sections.

### Knowledge Tier
- Authoritative, cited knowledge graphs covering FASER, SND@LHC, LHCf, TOTEM, MoEDAL, North Area, HiRadMat, CAST, Neutrino Platform, and future collider studies (HL-LHC, FCC, CLIC, Muon Collider).

---

## 3. Strict Scientific Honesty & "No Fake Data" Policy
1. **Three Permitted Data Classes**:
   - `REAL`: Raw public data released by CERN Open Data or official collaborations.
   - `PUBLISHED`: Values directly cited from peer-reviewed publications, PDG, or Technical Design Reports.
   - `COMPUTED`: Calculated on-the-fly using documented, seeded physics formulas or published lattices.
2. **Fidelity Badges**: Every simulation displays an explicit badge: `ANALYTIC`, `TOY`, `MONTE CARLO`, or `ILLUSTRATIVE`.
3. **Inspectable Numbers**: Clicking any number renders its exact citation, source URL, data class, retrieval date, and formula.

---

## 4. Known Scientific Limitations
- **Educational Simplification**: Detector responses in the browser use parameterized resolution models rather than multi-gigabyte GEANT4 Monte Carlo showers.
- **Post-Trigger Open Data**: Datasets available through the CERN Open Data portal are post-trigger accepted events; raw Level-1 trigger input streams are not public.
- **Simplified Grid Modeling**: WLCG simulations model queue dynamics using discrete-event approximations rather than live operational telemetry.

---

## 5. Repository Structure
```text
├── apps/
│   └── web/                   # Next.js App Router frontend & 3D canvas
├── packages/
│   ├── sim-core/              # Deterministic simulation engine & physics tests
│   └── content-schema/        # Zod provenance schemas & manifest validators
├── research/                  # Reproducible Python ML scripts & benchmarks
├── data/                      # Manifest and verified scientific data caches
├── content/                   # Sourced entity knowledge records
├── scripts/                   # Verification and integrity guards
└── docs/                      # Architectural specifications & audits
```

---

## 6. Development & Verification
```bash
# Install dependencies
npm install

# Run physics validation suite
npm run test:physics

# Verify data manifest checksums
npm run verify:manifest

# Launch development web server
npm run dev
```

---

## 7. License
Distributed under the [MIT License](LICENSE).
All scientific data citations remain subject to their respective upstream licenses (CERN Open Access, CC-BY-4.0, CC0 1.0, PDG, IAEA).
