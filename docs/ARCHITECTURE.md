# CERN-X: System Architecture & Engineering Design

## 1. System Overview
CERN-X is engineered as an isomorphic, multi-package TypeScript and Python workspace:

```text
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 15 Web App                     │
│  (App Router, Tailwind CSS, React Three Fiber, D3 / Visx)   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│    @cern-x/content-schema   │  │      @cern-x/sim-core       │
│  (Zod Schemas, Provenance,  │  │  (Physics Engine, Seeded    │
│   Manifest, Entities)       │  │   PRNG, Web Worker Comlink) │
└──────────────┬──────────────┘  └─────────────┬───────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│     /data/manifest.json     │  │       /research (ML)        │
│  (Cryptographic manifest,   │  │  (Reproducible scripts,     │
│   SHA-256 checks, DOIs)     │  │   ONNX web inference)       │
└─────────────────────────────┘  └─────────────────────────────┘
```

---

## 2. End-to-End Scientific Pipeline
The core value proposition of CERN-X is the continuous, interactive chain linking accelerator physics to experimental analysis:

$$\begin{aligned}
\text{Beam Generation} &\longrightarrow \text{Radiofrequency Acceleration} \\
&\longrightarrow \text{Magnetic Guidance \& Rigidity} \\
&\longrightarrow \text{Bunch Crossing \& Collision} \\
&\longrightarrow \text{Detector Subsystem Energy Deposition} \\
&\longrightarrow \text{Digitized Hit Reconstruction} \\
&\longrightarrow \text{Level-1 Hardware \& High-Level Software Trigger} \\
&\longrightarrow \text{Tier-0 Storage \& WLCG Grid Distribution} \\
&\longrightarrow \text{Physics Object Filtering (Electrons, Muons, Jets, MET)} \\
&\longrightarrow \text{Hypothesis Testing \& Mass Resonance Fitting}
\end{aligned}$$

---

## 3. Data Flow & Provenance Architecture
1. **Manifest Registration**: Every raw or computed dataset is registered in `/data/manifest.json`.
2. **Build Verification**: CI script `scripts/verify_manifest.ts` asserts that all files exist and their cryptographic SHA-256 hashes match.
3. **Runtime Ingestion**: Next.js statically parses the manifest at build time.
4. **Rendering Guard**: UI components never render naked raw numbers; they consume the `<Value>` component:
   ```tsx
   <Value manifestId="lhc-dipole-field-nominal" value={8.33} unit="T" />
   ```
5. **Interactive Inspection**: When clicked, `<Value>` queries the manifest and opens an inspector popover showing tier, source URL, DOI, retrieval date, and formula.

---

## 4. Simulation Engine & Threading Model
- Long-running or intensive collision and lattice computations execute inside dedicated **Web Workers** via `comlink`, preventing main-thread UI jank.
- All stochastic calculations consume an instance of `SeededRNG` (Mulberry32), ensuring that scenarios shared via query strings reproduce identically across all client machines.
