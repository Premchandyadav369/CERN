# CERN-X — The Interactive Digital Universe of CERN

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Physics Tests: 27 Passing](https://img.shields.io/badge/Physics_Tests-27%2F27_PASS-00FF66.svg)](#verification--automated-checks)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](apps/web/package.json)
[![Three.js WebGL](https://img.shields.io/badge/3D_Graphics-Three.js-00E5FF)](apps/web/package.json)
[![KaTeX Math](https://img.shields.io/badge/Equations-KaTeX_Verified-FFE600)](apps/web/src/components/ui/MathFormula.tsx)
[![Deployment: Ready](https://img.shields.io/badge/Deployment-Vercel_%7C_Docker_%7C_Render-4C7DFF)](DEPLOYMENT.md)

> **IMPORTANT NON-AFFILIATION NOTICE**: **CERN-X** is an independent, open-source educational and computational physics platform. It is **NOT** affiliated with, sponsored by, endorsed by, or operated by the European Organization for Nuclear Research (**CERN**). Protected CERN trademarks and official emblems are not used.

---

## Table of Contents
1. [Vision & End-to-End Scientific Chain](#1-vision--end-to-end-scientific-chain)
2. [Platform Architecture & Major Pages](#2-platform-architecture--major-pages)
3. [All 33 Quantitative Simulators](#3-all-33-quantitative-simulators)
4. [TVA & Marvel-Inspired Physics Labs](#4-tva--marvel-inspired-physics-labs)
5. [Pedagogical Design: ELI5, ⓘ Info Cards & 3-Depth Learning](#5-pedagogical-design-eli5--info-cards--3-depth-learning)
6. [Core Physics Formulations (Verified Mathematics)](#6-core-physics-formulations-verified-mathematics)
7. [Strict Scientific Provenance & Honesty Policy](#7-strict-scientific-provenance--honesty-policy)
8. [Repository Structure](#8-repository-structure)
9. [Quick Start & Verified Scripts](#9-quick-start--verified-scripts)
10. [Verification & Automated Checks](#10-verification--automated-checks)
11. [Deployment Guide (Vercel, Docker, Render, Cloud Run)](#11-deployment-guide)
12. [Documentation & License](#12-documentation--license)

---

## 1. Vision & End-to-End Scientific Chain

**CERN-X** transforms CERN's accelerator complex, superconducting cryogenics, subdetectors, real-time trigger electronics, worldwide computing grid, and particle physics discoveries into a **live, browser-executable digital twin**. Instead of pre-rendered videos or static numbers, sliders compute closed-form relativistic laws, magnetic rigidities, quantum amplitudes, and deterministic seeded Monte Carlo ensembles on-the-fly inside [`@cern-x/sim-core`](packages/sim-core/src/index.ts).

The platform links the full scientific workflow end-to-end:

$$
\text{H}^- \text{ Source} \to \text{Linac4} \to \text{PSB} \to \text{PS} \to \text{SPS} \to \text{LHC (6.8 TeV)} \to \text{Collision} \to \text{Detector} \to \text{L1/HLT Trigger} \to \text{WLCG Grid} \to 5\sigma \text{ Discovery}
$$

---

## 2. Platform Architecture & Major Pages

| Route | Module | Key Capabilities |
| :--- | :--- | :--- |
| `/` | **Interactive Control Center** | 3D Hero Beam Tunnel, clickable Geneva Ring Map, Proton Journey Stepper, 9-stage Pipeline View (`KaTeX`), and Provenance Overview |
| `/projects` | **CERN Projects & 3D Atlas** | Interactive Three.js 3D underground facility complex, collider circumference overlay (`LHC`, `FCC-hh`, `HL-LHC`), knowledge graph, and 22+ projects |
| `/accelerators` | **Accelerator Complex** | Injector specs (`Linac4` through `FCC`), embedded **LHC Dynamics**, and **Courant-Snyder Beam Optics** sandboxes |
| `/experiments` | **Flagship & Fixed-Target Labs** | `ATLAS`, `CMS`, `ALICE`, `LHCb`, `ISOLDE`, `ALPHA`, `CAST`, `FASER`, `MoEDAL`, `AWAKE`, and `n_TOF` |
| `/detectors` | **3D Detector Digital Twins** | Toggleable `ATLAS` / `CMS` / `ALICE` / `LHCb` subdetector layers, LEGO calorimeter towers, $\text{PbWO}_4$ crystal & $\text{Nb}_3\text{Sn}$ 3D lattice viewer |
| `/simulations` | **33 Interactive Physics Labs** | Categorized single-row scrollable `tablist` across **5 domains** + per-module interactive `ⓘ` Technical Term Info Cards |
| `/engineering` | **Cryo, Vacuum & RF Twin** | 3D Dipole Cryostat, $1.9\text{ K}$ superfluid $\text{He-II}$ transition, UHV beam lifetime, and $400.79\text{ MHz}$ RF phase surfing |
| `/computing` | **WLCG Exascale Grid Simulator** | Multi-tier Tier-0 / Tier-1 / Tier-2 discrete-event throughput, tape archival, and HL-LHC pile-up queue dynamics |
| `/ai-lab` | **LHC-TriggerMind ML Lab** | Live browser neural-network inference (with `INT8` mode) and **SHAP Explainability** attribution benchmark on ATLAS Higgs data |
| `/open-data` | **Real CERN Open Data Lab** | Authentic $Z^0 \to \mu^+\mu^-$ dimuon invariant-mass spectrum explorer, HEPData overlays, and interactive $p_T$ / $|\eta|$ cutflow table |
| `/learn` | **Subatomic Dictionary & Timeline** | 3-depth glossary (`Beginner` / `Undergrad` / `Researcher`) with KaTeX math, Standard Model 3D periodic explorer, and CERN history timeline |
| `/methodology` | **End-to-End Methodology & Proofs** | 5-stage execution pipeline, **Live Browser Physics Verifier**, full KaTeX ledger, and interactive `data/manifest.json` inspector |
| `/about` | **Governance & Disclaimer** | Strict No-Fake-Data charter, 3 permitted data classes, fidelity badges, and non-affiliation notice |

---

## 3. All 33 Quantitative Simulators

Every simulator lives under [`/simulations`](apps/web/src/app/simulations/page.tsx), organized cleanly with single-click domain filters and accessible `role="tablist"` navigation:

### Colliders & Beam Optics (7 Labs)
- **LHC Dynamics (`?module=lhc`)**: Interactive 3D LHC ring + dipole field $B$, magnetic rigidity $B\rho$, instantaneous luminosity $\mathcal{L}$, and quench safety checks.
- **LHC 24h Physics Fill Control (`?module=lhc-fill`)**: Complete Shift Control Room modeling Injection, 6.8 TeV Ramp, $\beta^*$ Squeeze, leveled Stable Beams burn-off, and $362\text{ MJ}$ Emergency Beam Dump.
- **3D Collision Director (`?module=collision-director`)**: Launch custom $pp$, $\text{Pb–Pb}$, or $\text{FCC-ee}$ collisions (`H⁰ → γγ`, `H⁰ → ZZ* → 4μ`, `t t̄`, `Z⁰ → μ⁺μ⁻`) inside a 3D chamber with sonification.
- **Relativistic Speed Race (`?module=race`)**: Race protons and electrons from Linac4 to FCC-ee against a vacuum laser pulse while measuring $\beta = v/c$, $\gamma$, and Einstein time dilation.
- **Beam Optics FODO Sandbox (`?module=optics`)**: Solve $2\times 2$ Courant-Snyder transfer matrices and envelope $\beta(s)$ across focusing/defocusing quadrupoles.
- **HL-LHC Crab Cavity (`?module=crab`)**: Tune 400 MHz transverse crabbing voltage to restore head-on bunch overlap $F \to 1.0$.
- **FCC 91 km Collider (`?module=fcc`)**: Evaluate 100 TeV synchrotron power scaling $P_{\text{sync}} \propto \gamma^4/\rho^2$ and $16\text{ T}$ $\text{Nb}_3\text{Sn}$ requirements.

### Experiments & Detectors (8 Labs)
- **Antimatter & ALPHA-g (`?module=antimatter`)**: 3D Penning-Malmberg magnetic trap + Earth gravitational free-fall asymmetry measurement on cold antihydrogen.
- **AWAKE Plasma Wakefield (`?module=awake`)**: Model $\text{GV/m}$-scale plasma wakefields driven by 400 GeV SPS proton bunches.
- **ALICE QGP & Flow (`?module=alice`)**: Hydrodynamic elliptic flow $v_2$ and near-ideal shear viscosity $\eta/s \approx 1/(4\pi)$ in 5.36 TeV Lead–Lead collisions.
- **LHCb Rare Decays (`?module=lhcb`)**: Flavor-changing neutral current $b \to s\ell^+\ell^-$ tests and Wilson coefficient shifts ($R_K, R_{K^*}$).
- **ISOLDE Nuclear Lab (`?module=isolde`)**: Semi-empirical nuclear binding curve, magic numbers, RILIS laser ionization, and $A/q$ magnetic separation for medical isotopes like ${}^{161}\text{Tb}$.
- **RICH & Medipix Color X-Ray (`?module=rich-medipix`)**: Optical Cherenkov rings across $\pi^\pm, K^\pm, p$ thresholds plus elemental $K$-edge spectral X-ray attenuation.
- **Cloud Chamber Lab (`?module=cloud-chamber`)**: Deterministic Lorentz helical curvature trails for cosmic muons, alphas, and $e^+e^-$ pair vertices.
- **3D Detector Crystals & $\text{Nb}_3\text{Sn}$ (`?module=materials`)**: Interactive WebGL lattice views of $\text{PbWO}_4$ scintillators, liquid argon accordions, and superconducting cables.

### Quantum, Neutrinos & BSM (6 Labs)
- **PMNS Neutrinos (`?module=neutrinos`)**: 3-flavor quantum oscillation across CNGS (732 km to Gran Sasso), FASERnu (480 m), and ProtoDUNE (1,300 km).
- **Feynman S-Matrix (`?module=feynman`)**: Interactive spacetime vertex builder verifying conservation of $Q, B, L_e, L_\mu, L_\tau$ plus live animated boson wave propagation and $Z^0$ Breit-Wigner peak.
- **3D Standard Model (`?module=sm-3d`)**: Complete 17-particle periodic matrix paired with interactive Three.js standing quantum wave visualizations and Higgs Yukawa couplings.
- **Higgs Mexican Hat (`?module=higgs-ewsb`)**: 3D finite-temperature potential $V(\phi, T)$ illustrating Electroweak Symmetry Breaking below $T_c = 159.5\text{ GeV}$.
- **Cosmic Time Machine (`?module=cosmic`)**: Rewind early-universe temperature across electroweak unification and QCD confinement transitions.
- **Dark Matter CAST & MET (`?module=dark-matter`)**: Primakoff solar axion photon conversion resonance ($9\text{ T}$ dipole) and missing transverse energy mono-jet recoil signatures.

### Trigger, Medical & AI (4 Labs)
- **Hadron Therapy & Bragg Peak (`?module=bragg-peak`)**: Bethe-Bloch depth-dose Spread-Out Bragg Peak (SOBP) curves comparing proton / ${}^{12}\text{C}$ tumor sparing against 6 MV X-rays.
- **Trigger & DAQ Lab (`?module=trigger`)**: Manage 40 MHz → 100 kHz Level-1 FPGA buffers, dead-time fractions, and HLT recording bottlenecks.
- **5-Sigma Discovery (`?module=discovery`)**: Accumulate diphoton collision events over exponential QCD background to watch Asimov $Z_0$ cross the $5\sigma$ gold standard.
- **arXiv & Research Bridge (`?module=literature`)**: Live `/api/arxiv` preprint search, curated CERN benchmark papers, and 1-click BibTeX citation generator.

---

## 4. TVA & Marvel-Inspired Physics Labs

All 8 labs inside **TVA & Marvel Labs** translate recognizable sci-fi interfaces into strictly grounded CERN physics equations:

1. **TVA Sacred Timeline, 3D Temporal Loom & Multiverse Comparator (`?module=tva-timeline`)** — Retro-CRT monitor & rotating Three.js 3D Loom running NNLO Standard Model electroweak vacuum stability curves ($\lambda(\mu)$ vs. Planck scale), **Detonate Time-Charge (Prune)** animations, and side-by-side **Timeline 616 (CERN PDG)** vs. custom universe comparisons.
2. **TVA 40 MHz Variant Intake Desk (`?module=tva-intake`)** — Fast-paced Minuteman trigger triage stamping `KEEP` ($H \to 4\ell$, $Z^0 \to \mu^+\mu^-$, displaced LLPs) vs. `PRUNE` (QCD pileup, out-of-time halo) to earn an operator badge.
3. **Arc Cryo Magnet HUD (`?module=arc-magnet`)** — Circular dipole core monitor computing Maxwell energy density $u_B = B^2/(2\mu_0)$, outward hoop loads, and superconducting quench limits for LHC $\text{NbTi}$ vs. HL-LHC $\text{Nb}_3\text{Sn}$.
4. **Quantum Realm Scale Zoom (`?module=quantum-zoom`)** — Continuous logarithmic microscope spanning 61 orders of magnitude ($10^{+26}\text{ m} \to 10^{-35}\text{ m}$ Planck length), matching each spatial regime to its CERN probe energy $E \approx \hbar c / L$.
5. **Mirror Extra Dimensions (`?module=mirror-dimensions`)** — Rotating Three.js Calabi-Yau manifold + ADD compactified extra-dimension gravity scale solver ($M_D$ & Kaluza-Klein tower spacing).
6. **Spider-Glitch Displaced Vertex (`?module=displaced-vertex`)** — Relativistic boosted flight $L_{\text{lab}} = \gamma\beta c\tau_0$ predicting Long-Lived Particle decays inside ATLAS/CMS Tracker, Calorimeters, Muon Chambers, and FASER (480 m).
7. **Magneto & MoEDAL Monopole Arena (`?module=monopole-arena`)** — Compares sideways Lorentz proton bending against $4,695\times$ minimum-ionizing parabolic Dirac magnetic monopole ($g_D \approx 68.5e$) tracks.
8. **Bifrost Heavy-Ion Shower (`?module=bifrost-rays`)** — Prismatic $\text{Pb–Pb}$ ALICE TPC event bursts demonstrating strict transverse momentum balance ($\sum \vec{p}_T = 0$).

### Global Interactive Features
- **Site-Wide TVA CRT Theme Switch**: Header `TVA` toggle flips `--bg-*` and accent tokens into a warm amber CRT palette across every route.
- **Miss Minutes // O.B. Companion Widget**: Floating context-aware helper explaining current simulator controls and routing users to next challenges.
- **10 Operator Missions & Badges**: Track progress (`X/10`) across LHC, Discovery, ISOLDE, Cryo, AI Trigger, RICH, TVA Prune, Intake Desk, Arc Magnet, and Quantum Zoom challenges.
- **Opt-in Procedural WebAudio Sonifier**: Zero-asset synthesized particle pulses, collision resonance chimes, TemPad chirps, Time-Charge sweeps, and quench alarms gated cleanly by the top-bar mute switch.

---

## 5. Pedagogical Design: ELI5, ⓘ Info Cards & 3-Depth Learning

Every concept works simultaneously for high-school learners, undergraduates, and particle physicists:
- **Global `ELI5` Mode & Depth Switcher**: Switch between **Beginner**, **Undergrad**, and **Researcher** terminology depth from the header on any page.
- **`ⓘ` Technical Term Info Cards (`TechnicalTermDeck`)**: Embedded cleanly inside every simulator and every major page (`#tech-glossary-deck`), providing clickable `ⓘ` pills for 34+ terms (`β*`, `Bρ`, `η`, `λ(μ)`, `Δm²₃₂`, `v₂`, `g_D`, `K-edge`, `AMS`, `5σ`) with ELI5 analogies, formal definitions, units, and KaTeX formulas.
- **KaTeX Throughout**: All equations render using `katex` via `<MathFormula />`, `<InlineMathText />`, and expandable `fx Equation` toggles inside `FidelityBadge`.

---

## 6. Core Physics Formulations (Verified Mathematics)

All formulas below execute directly inside [`packages/sim-core`](packages/sim-core/src/physics) and match our unit-test suite:

**Magnetic Rigidity & Dipole Field (`rigidity.ts`)**

$$
B\rho = \frac{p\;[\text{GeV}/c]}{0.299792458\,|Z|}, \qquad B = \frac{B\rho}{\rho_{\text{LHC}}}
$$

**Instantaneous Collider Luminosity (`rigidity.ts`)**

$$
\mathcal{L} = \frac{N_1 N_2\,n_b\,f_{\text{rev}}\,\gamma}{4\pi\,\varepsilon_n\,\beta^*}\,F
$$

**Two-Body Invariant Mass (`kinematics.ts`)**

$$
M^2 = \left(\sum_i E_i\right)^2 - \left|\sum_i \vec{p}_i\right|^2
$$

**Asimov Profile-Likelihood Significance & Higgs ML AMS (`statistics.ts`)**

$$
Z_0 = \sqrt{2\left((s+b)\ln\!\left(1 + \frac{s}{b}\right) - s\right)}, \qquad \text{AMS} = \sqrt{2\left((s+b+b_r)\ln\!\left(1 + \frac{s}{b+b_r}\right) - s\right)}
$$

**3-Flavor Neutrino Oscillation (`nuclear.ts`)**

$$
P(\nu_\mu \to \nu_\tau) \approx \sin^2(2\theta_{23})\sin^2\!\left(\frac{1.267\,\Delta m_{32}^2\,L}{E}\right)
$$

**Standard Model Electroweak Vacuum Stability Bound (`bsm.ts`)**

$$
m_H^{\text{crit}} \approx 129.6 + 2.0\,(m_t - 173.34) - 0.56\,\frac{\alpha_s - 0.1184}{0.0007}\;\text{GeV}
$$

**Dirac Magnetic Monopole Quantization & Ionization Ratio (`bsm.ts`)**

$$
g_D = \frac{e}{2\alpha} \approx 68.5\,e, \qquad \frac{(dE/dx)_{\text{mono}}}{(dE/dx)_p} \approx (68.5\,n)^2
$$

---

## 7. Strict Scientific Provenance & Honesty Policy

1. **Three Explicit Data Classes**
   - **`[REAL]`**: Unmodified public Open Data or HEPData records.
   - **`[PUBLISHED]`**: Values cited verbatim from CERN Technical Design Reports, PDG Reviews, and peer-reviewed publications.
   - **`[COMPUTED]`**: Outputs solved live from closed-form equations or Mulberry32 seeded PRNG processes (`SeededRNG`).
2. **Fidelity Badges**: Every lab carries `ANALYTIC`, `MONTE CARLO`, `TOY`, or `ILLUSTRATIVE` provenance tags with inspectable KaTeX equations.
3. **Known Boundaries**: Detector showers use parameterized resolution shells rather than multi-gigabyte GEANT4 full Monte Carlo; CERN Open Data releases contain post-trigger selected events rather than raw L1 40 MHz hardware streams.

---

## 8. Repository Structure

```text
├── apps/
│   └── web/                          # Next.js 14 App Router UI, KaTeX, Three.js & Canvas simulators
│       ├── next.config.mjs           # Monorepo webpack aliases, security headers & optional standalone mode
│       └── src/
│           ├── app/                  # 13 App Router pages + /api/arxiv + /api/health
│           ├── components/           # 33 simulators, 3D canvases, TechTermDeck, TopBar, Footer, O.B. Guide
│           └── lib/                  # Zustand state store, manifest loader, WebAudio sonifier
├── packages/
│   ├── content-schema/               # Zod schemas validating content & manifest provenance
│   └── sim-core/                     # Pure TS physics kernel & 27 Vitest unit assertions
│       ├── src/physics/              # constants, kinematics, rigidity, statistics, feynman, bsm, nuclear
│       └── tests/                    # Automated physics validation suite
├── content/                          # Sourced JSON datasets (accelerators, experiments, projects, glossary, particles)
├── data/
│   ├── manifest.json                 # Provenance registry validated pre-build
│   ├── real_events/                  # Sample public ATLAS & CMS events
│   └── hepdata/                      # Published collaboration measurement overlays
├── scripts/
│   ├── verify_manifest.js            # Validates data/manifest.json schema integrity
│   └── verify_routes.js              # HTTP 200 smoke suite checking all 33 routes + /api/health
├── research/                         # Python ML & benchmark scripts (TriggerMind, open data scripts)
├── docs/                             # Architecture, data audit, cut-features & UI specifications
├── .github/workflows/ci.yml          # Automated CI verification workflow
├── Dockerfile                        # Multi-stage Node 20 Alpine standalone container
├── render.yaml                       # Render Blueprint configuration
├── vercel.json                       # Vercel monorepo configuration
└── DEPLOYMENT.md                     # Step-by-step cloud deployment guide
```

---

## 9. Quick Start & Verified Scripts

**Prerequisites**: Node.js `>= 20.0.0` and npm `>= 10.0.0`.

```bash
# 1. Clone and install workspace dependencies cleanly
git clone https://github.com/Premchandyadav369/CERN.git
cd CERN
npm ci

# 2. Run the full verification & topological build pipeline
npm run verify:all

# 3. Start production server (http://localhost:3000)
npm run start
```

### Complete Script Reference (Root `package.json`)

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts `@cern-x/web` in Next.js development mode on port `3000` |
| `npm run build` | Builds `@cern-x/content-schema` → `@cern-x/sim-core` → `@cern-x/web` in topological order |
| `npm run start` | Boots the production Next.js server via `@cern-x/web` |
| `npm run test:physics` | Runs the 27 Vitest physics unit tests in `packages/sim-core` |
| `npm run typecheck` | Runs `tsc --noEmit` across `content-schema`, `sim-core`, and `apps/web` |
| `npm run verify:manifest` | Validates `data/manifest.json` against schema rules |
| `npm run verify:routes` | Audits HTTP `200` responses across 33 routes & `/api/health` on `http://127.0.0.1:3000` |
| `npm run verify:all` | Chains `verify:manifest && test:physics && typecheck && build` |

---

## 10. Verification & Automated Checks

Every commit passes the following gates:
1. **`npm run verify:manifest`** — Verifies all 6 provenance records in [`data/manifest.json`](data/manifest.json).
2. **`npm run test:physics`** — Executes 27 deterministic Vitest physics assertions in [`physics-validation.test.ts`](packages/sim-core/tests/physics-validation.test.ts) (relativistic kinematics, $23,349.5\text{ T}\cdot\text{m}$ rigidity, Asimov $Z_0$, $Z^0$ Breit-Wigner peak, EWSB, Primakoff conversion, ISOLDE binding, PMNS neutrino probability conservation, LHC 362 MJ fill burn-off, PDG electroweak metastability, HL-LHC magnet pressures, LLP displaced decay, ADD gravity, Dirac $g_D^2$ ionization).
3. **`npm run typecheck`** — Zero TypeScript compiler errors across all 3 monorepo workspaces.
4. **`npm run verify:routes`** — Verifies `33/33` production routes and `/api/health` (`200 OK`).

---

## 11. Deployment Guide

CERN-X requires **no database and no secrets** to deploy. Full instructions are documented in [`DEPLOYMENT.md`](DEPLOYMENT.md):

- **Vercel *(Recommended — Free Hobby Tier)***: Import the repository at [vercel.com/new](https://vercel.com/new) keeping Root Directory at `.`. [`vercel.json`](vercel.json) handles `npm ci`, monorepo workspace compilation, and `apps/web/.next` output automatically.
- **Docker / Cloud Run / Fly.io / Railway**: Build with the multi-stage standalone container:
  ```bash
  docker build -t cern-x .
  docker run -p 3000:3000 cern-x
  ```
- **Render**: Create a **Blueprint** pointing to [`render.yaml`](render.yaml).

---

## 12. Documentation & License

- Architecture & Governance Docs: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/DATA_AUDIT.md`](docs/DATA_AUDIT.md), [`docs/CONTENT_POLICY.md`](docs/CONTENT_POLICY.md), [`docs/CUT_FEATURES.md`](docs/CUT_FEATURES.md)
- Contributing & Citation: [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CITATION.cff`](CITATION.cff)
- **License**: Distributed under the [MIT License](LICENSE). All upstream scientific datasets and publications remain governed by their respective CERN Open Data, CC-BY-4.0, CC0, PDG, and IAEA licenses.
