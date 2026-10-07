# CERN-X: Phase 0 Master Architecture & Implementation Plan

**Project**: CERN-X (The Interactive Digital Universe of CERN)  
**Version**: 1.0.0-alpha  
**Date**: 2026-10-07  
**Status**: Ready for User Review and Approval

---

## 1. Executive Summary & Philosophy
CERN-X is an interactive, open-source digital representation of CERN's scientific ecosystem, bridging:
$$\text{Accelerators} \longrightarrow \text{Collisions} \longrightarrow \text{Detectors} \longrightarrow \text{Reconstruction} \longrightarrow \text{Trigger} \longrightarrow \text{Computing} \longrightarrow \text{Physics Analysis} \longrightarrow \text{AI Research}$$

### The Three Foundational Pillars:
1. **Uncompromising Scientific Honesty**: Every number displayed in the UI is bound to a cryptographic record in `/data/manifest.json`. Only three data classes are permissible: `REAL`, `PUBLISHED`, and `COMPUTED`. Zero placeholder mocks or fabricated metrics.
2. **Deterministic Physics Core**: Shared, type-safe primitives (`Particle`, `Beam`, `Bunch`, `Magnet`, `Collision`, `Detector`, `Hit`, `Track`, `Event`, `TriggerDecision`, `ComputeJob`) powered by seeded PRNG (xoshiro128** / mulberry32) for reproducible scenarios and shareable URLs.
3. **Control-Room Aesthetic**: Dark, high-density, legible scientific instrumentation styling (`#060A12` base, JetBrains Mono tabular numbers, clear fidelity badges, and color-blind safe palettes).

---

## 2. Monorepo & Directory Structure

```text
c:\Users\PREMCHANDYADAV\OneDrive\Desktop\Project\CERN\
├── apps/
│   └── web/                               # Next.js 15 App Router Frontend
│       ├── public/                        # Static assets (icons, font manifests, schematic SVG)
│       ├── src/
│       │   ├── app/                       # App Router routes
│       │   │   ├── page.tsx               # Ring Map Home
│       │   │   ├── accelerators/          # Accelerators (LHC, SPS, PS, Linac4, LEIR, AD...)
│       │   │   ├── experiments/           # Experiments (ATLAS, CMS, ALICE, LHCb, ISOLDE...)
│       │   │   ├── detectors/             # Detector explorer & 3D event displays
│       │   │   ├── simulations/           # Deep simulators (LHC run, Collisions, Triggers)
│       │   │   ├── computing/             # WLCG grid & CERN Data Centre simulator
│       │   │   ├── engineering/           # Superconducting magnets, Cryo, Vacuum, RF
│       │   │   ├── ai-lab/                # Flagship LHC-TriggerMind & ML experiment workbench
│       │   │   ├── open-data/             # CERN Open Data explorer & In-browser analysis
│       │   │   ├── knowledge-graph/       # D3 interactive force-directed evidence graph
│       │   │   ├── timeline/              # 1954 → 2026+ technology & discovery timeline
│       │   │   └── about/                 # Methodology, limitations, sources & disclaimer
│       │   ├── components/
│       │   │   ├── provenance/            # <Value>, <Series>, <Event>, <CitationDrawer>
│       │   │   ├── ui/                    # Design tokens, badges, buttons, sliders, command palette
│       │   │   ├── 3d/                    # React Three Fiber canvas, detector geometry, beam rings
│       │   │   ├── charts/                # D3 / SVG charts with uncertainty bands & WCAG support
│       │   │   └── navigation/            # Top bar, breadcrumb, level switcher, search
│       │   ├── lib/                       # Web Worker bridges, client state (Zustand)
│       │   └── styles/                    # Tailwind CSS variables and theme tokens
│       ├── tailwind.config.ts
│       └── package.json
├── packages/
│   ├── sim-core/                          # Deterministic simulation engine (isomorphic TS)
│   │   ├── src/
│   │   │   ├── primitives/                # Particle, Beam, Bunch, Magnet, Detector, Hit, Event
│   │   │   ├── physics/                   # Relativistic kinematics, rigidity, RF, synchrotron
│   │   │   ├── detectors/                 # ATLAS/CMS geometry, tracker hits, calorimeter towers
│   │   │   ├── trigger/                   # L1/HLT rate-latency budget and cutflow evaluator
│   │   │   ├── computing/                 # Discrete-event WLCG queuing and network model
│   │   │   ├── rng/                       # Seeded deterministic PRNG (xoshiro128**)
│   │   │   └── worker/                    # Web Worker Comlink wrapper
│   │   ├── tests/                         # Vitest physics validation tests
│   │   └── package.json
│   └── content-schema/                    # Strict Zod schemas for content & data
│       ├── src/
│       │   ├── manifest.ts                # Dataset manifest schema (REAL / PUBLISHED / COMPUTED)
│       │   ├── entity.ts                  # Accelerator, Experiment, Detector, Particle schema
│       │   ├── provenance.ts              # Provenance record and citation schema
│       │   └── experiment-card.ts         # ML experiment reproducibility schema
│       └── package.json
├── research/                              # Python ML & scientific data pipeline
│   ├── scripts/
│   │   ├── train_triggermind.py           # Reproducible XGBoost & MLP training on ATLAS Higgs ML
│   │   ├── evaluate_benchmark.py          # Latency, AMS, size, calibration and ROC curves
│   │   └── export_onnx.py                 # Export trained weights to web-friendly ONNX
│   ├── benchmarks/                        # Committed benchmark JSON metrics with seeds
│   └── requirements.txt
├── data/                                  # Canonical data repository
│   ├── manifest.json                      # Cryptographic registry of every dataset and table
│   ├── raw/                               # Unmodified raw source extracts
│   └── processed/                         # Converted JSON/Parquet slices
├── content/                               # Sourced knowledge records (JSON/MDX)
│   ├── accelerators/
│   ├── experiments/
│   ├── particles/
│   ├── engineering/
│   └── timeline/
├── scripts/                               # Automation & CI guards
│   ├── verify_manifest.ts                 # Validates all file SHA-256 checksums
│   ├── lint_provenance.ts                 # Scans UI for unlinked numbers or forbidden mocks
│   └── ingest_pdg.py                      # Pulls PDG 2024 particle tables
├── docs/                                  # Architectural documentation & briefs
│   ├── BUILD_BRIEF.md                     # Complete Master Build Brief
│   ├── UI_BRIEF.md                        # Complete UI/UX & Design Tokens Specification
│   ├── DATA_AUDIT.md                      # Source Audit Report (Go/Cut decisions)
│   ├── CUT_FEATURES.md                    # Record of features excluded for lack of sources
│   ├── PHASE_0_PLAN.md                    # This document
│   └── ARCHITECTURE.md                    # System architecture design
├── .gitignore
├── LICENSE                                # MIT License + CERN Non-Affiliation Disclaimer
└── README.md
```

---

## 3. Data Manifest & Provenance Engine

### 3.1 Strict Manifest Schema (`/data/manifest.json`)
Every piece of data must match the schema:
```typescript
export type DataClass = 'REAL' | 'PUBLISHED' | 'COMPUTED';
export type FidelityBadge = 'ANALYTIC' | 'TOY' | 'MONTE CARLO' | 'ILLUSTRATIVE';
export type SourceTier = 'T1_OFFICIAL' | 'T2_OPEN_DATA' | 'T3_CDS' | 'T4_EXPERIMENT' | 'T5_PEER_REVIEWED';

export interface ManifestRecord {
  id: string;                       // e.g. "lhc-run3-nominal-parameters"
  title: string;
  dataClass: DataClass;             // REAL | PUBLISHED | COMPUTED
  sourceTier: SourceTier;
  sourceUrl: string;
  doiOrRecordId?: string;
  retrievalDate: string;            // ISO 8601
  sha256?: string;                  // SHA-256 of raw underlying asset
  license: string;                  // e.g. "CC-BY-4.0", "CC0-1.0"
  transformScript?: string;         // e.g. "research/scripts/ingest_lhc_params.py"
  gitCommit?: string;
  softwareVersions?: Record<string, string>;
  seed?: number;                    // If COMPUTED
  formula?: string;                 // If ANALYTIC/COMPUTED
  knownLimitations: string;         // Plain-text honest disclaimer
}
```

### 3.2 The `<Value>` Provenance Component
In `apps/web/src/components/provenance/Value.tsx`:
```tsx
<Value
  manifestId="lhc-proton-energy-run3"
  value={6.8}
  unit="TeV"
  digits={2}
/>
```
**Hover / Click Inspector displays**:
- Data Class (`PUBLISHED`)
- Sourced From: CERN LHC Run 3 Operational Parameters (CERN Document Server)
- Tier: `T1_OFFICIAL` (CERN Official Specification)
- Formula / Context: $E = \gamma m_p c^2$
- Retrieved: `2024-03-15` | License: `CC-BY-4.0`
- Limitations: Beam energy calibrated via magnetic field resonance; operational beam energy varies within $\pm 0.1\%$.

---

## 4. Simulation Core & Physics Validation Suite

The simulation core (`packages/sim-core`) executes deterministic physics calculations with seeded PRNG.

### 4.1 Required Validation Unit Tests
1. **Relativistic Kinematics**:
   $$\beta = \sqrt{1 - \frac{1}{\gamma^2}}, \quad p = \sqrt{E^2 - m^2}, \quad E_k = (\gamma - 1)mc^2$$
   - *Test*: $E_k = 6.8\text{ TeV}$ proton ($m_p = 0.938272\text{ GeV}/c^2$) yields $\gamma \approx 7248.3$, $\beta \approx 0.999999990$, $p \approx 6799.99993\text{ GeV}/c$. Tolerance: $10^{-6}$.
2. **Magnetic Rigidity & Dipole Field**:
   $$B\rho\text{ [T}\cdot\text{m]} = \frac{p\text{ [GeV/}c\text{]}}{0.299792458}$$
   - *Test*: 7 TeV proton gives $B\rho \approx 23,349.5\text{ T}\cdot\text{m}$. For LHC bending radius $\rho = 2803.95\text{ m}$ (from $1232 \times 14.3\text{ m}$ dipoles), required dipole field is $B = 8.327\text{ T}$. Tolerance: $\pm 0.05\text{ T}$.
3. **Collision Center-of-Mass Energy ($\sqrt{s}$)**:
   - Symmetric colliders: $\sqrt{s} = 2E_{\text{beam}}$.
   - Fixed target: $\sqrt{s} = \sqrt{m_1^2 + m_2^2 + 2 E_1 m_2}$.
   - *Test*: 450 GeV proton on fixed proton target gives $\sqrt{s} \approx 29.1\text{ GeV}$, contrasting with 900 GeV in collider mode.
4. **Invariant Mass Reconstruction**:
   $$M_{\gamma\gamma} = \sqrt{2 E_1 E_2 (1 - \cos\theta)}$$
   - *Test*: Two photons generated from simulated isotropic $H \rightarrow \gamma\gamma$ decay at $M_H = 125.0\text{ GeV}$ reconstruct invariant mass peak within $125.0 \pm 0.1\text{ GeV}$.
5. **Poisson Statistical Significance**:
   - Asimov formula: $Z_A = \sqrt{2 \left((s+b)\ln(1 + s/b) - s\right)}$
   - *Test*: For $s = 50$, $b = 100$, test $s/\sqrt{b} = 5.0$ and $Z_A \approx 4.582$. Tolerance: $10^{-3}$.

---

## 5. UI Design System Tokens

Tokens are implemented as native CSS custom properties supporting Dark (default) and Light themes:

```css
:root {
  --bg-canvas: #060a12;
  --bg-surface: #0d1422;
  --bg-raised: #131c2e;
  --bg-subsurface: #0a0f1a;
  
  --primary-cern: #0033a0;
  --primary-accent: #4c7dff;
  
  --beam-cyan: #3dd6ff;
  --ion-magenta: #e04fd0;
  --antimatter-amber: #ffb020;
  --success: #2ecc8f;
  --error: #ff5c5c;
  
  --text-primary: #e8eef9;
  --text-secondary: #9fb0cc;
  --text-muted: #6b7c99;
  --text-mono: #c8d7f0;
  
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  
  --radius-panel: 6px;
  --radius-cell: 2px;
  --radius-pill: 9999px;
}
```

---

## 6. Phased Implementation Roadmap

### Phase 0: Foundations, Governance & Approvals (Current Step)
- [x] Initialized Git repository, remotes, and user configuration.
- [x] Written `docs/BUILD_BRIEF.md`, `docs/UI_BRIEF.md`, `docs/DATA_AUDIT.md`, `docs/CUT_FEATURES.md`.
- [x] Formulated `packages/content-schema` (Zod schemas for Provenance, Manifest, Entity).
- [x] Formulated `packages/sim-core` types, constants, kinematics and physics validation tests.
- [x] Generated initial `/data/manifest.json`.
- [ ] **Approval Gate**: User reviews Phase 0 Plan and Source Audit Report.

### Phase 1: Simulation Core & UI Shell
- Build `packages/sim-core` with seeded PRNG and Web Worker runner (`comlink`).
- Execute and pass all Vitest physics validation unit tests.
- Build Next.js UI shell (`apps/web`): top bar, breadcrumb, command palette (`Cmd+K`), `<Value>` provenance components.
- Implement Signature Component 1: **Ring Map Home** (interactive animated accelerator complex schematic).
- Screenshots & responsive audit (Desktop / Mobile, Dark / Light).

### Phase 2: Detector Digital Twins & Labs
- ATLAS interactive twin: layered cutaway (Inner Detector, EM/Hadronic Calorimeters, Muon Spectrometer).
- Real event browser: load real CERN Open Data 13 TeV events (jets, muons, electrons, MET).
- Reconstruction Lab: hits $\rightarrow$ clusters $\rightarrow$ tracks $\rightarrow$ vertices.
- Trigger Lab: L1/HLT rate-latency budget sliders, ROC curves, efficiency vs purity trade-offs.

### Phase 3: Distributed Computing, Knowledge Graph & Pipeline
- WLCG Grid Simulator: Tier-0/1/2 topology, data replication, network congestion, failure injection.
- CERN Data Centre Simulator: CPU/GPU loads, storage growth, cooling/power demand under HL-LHC data rates.
- CERN Knowledge Graph: D3 force-directed searchable graph with clickable source evidence.
- The End-to-End Pipeline view: Accelerator $\rightarrow$ Collision $\rightarrow$ Detector $\rightarrow$ Trigger $\rightarrow$ Storage $\rightarrow$ Grid $\rightarrow$ Analysis $\rightarrow$ Result.

### Phase 4: AI Lab & LHC-TriggerMind
- Preserved reproducible research benchmark:
  - Dataset: ATLAS Higgs Machine Learning Challenge (CERN Open Data simulation).
  - Models: Baseline cut-based, Logistic Regression, XGBoost ($AMS = 3.339$, Latency $= 0.547\text{ ms}$, Size $= 804.2\text{ kB}$), MLP 16-8 ($AMS = 3.022$, Latency $= 0.115\text{ ms}$, Size $= 6.3\text{ kB}$).
- ONNX web runtime: run client-side inference on real event samples.
- Model card & data card documentation.

### Phase 5: Additional Accelerators, Experiments & Timeline
- Interactive-tier simulators: CMS (with ATLAS-vs-CMS comparison), ALICE (heavy ions, QGP), LHCb (B-decay CP violation), Antimatter Factory (AD/ELENA Penning trap), ISOLDE, AWAKE, n_TOF.
- Knowledge-tier pages: FASER, SND@LHC, LHCf, TOTEM, MoEDAL, North Area, HiRadMat, Future Colliders (HL-LHC, FCC, CLIC, Muon Collider).
- Technology & Discovery Timeline: 1954 to 2026+.

### Phase 6: Accessibility, Performance, i18n & Release
- Accessibility verification: WCAG 2.2 AA compliance, keyboard navigation, axe-core testing.
- Internationalisation: English and French (CERN official languages).
- Lighthouse audit (Performance $\ge 85$, Accessibility $\ge 95$).
- Offline PWA service worker for core pages.
- Final documentation and release packaging.
