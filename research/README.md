# CERN-X Research Laboratory & ML Benchmarks

This workspace contains all reproducible offline scientific code, data ingestion scripts, model training pipelines, and HEPData benchmarks supporting the **CERN-X** platform.

---

## 1. Principles & Non-Negotiable Honesty Rules
1. **Zero Fake Metrics:** Shipped numbers shown on the website match the values produced by deterministic runs of these scripts with fixed seeds (`seed=42`).
2. **Transparent Fidelity:** Every result is labelled with its exact tier: `REAL_OPEN_DATA`, `PUBLISHED_RECORD`, `OUR_ML_EXPERIMENT`, or `ANALYTIC`.
3. **Open Standards:** All exported neural network models adhere to ONNX standard protocols for client-side zero-runtime inference (`onnxruntime-web`).

---

## 2. Directory Structure
```
research/
├── benchmarks/
│   ├── triggermind_results.json    # Committed metrics, CIs, latencies for TriggerMind
│   ├── triggermind_model.json      # Model topology & normalization constants
│   └── triggermind_mlp.onnx        # ONNX format model artifact
├── scripts/
│   ├── train_triggermind.py        # End-to-end ML training, AMS computation & bootstrapping
│   ├── export_onnx.py              # Export model to ONNX & runtime verification
│   ├── convert_open_data.py        # 4-vector kinematics & cutflow processor for Open Data
│   ├── beam_optics.py              # FODO cell Courant-Snyder solver & LHC arc lattice validation
│   └── evaluate_hepdata.py         # HEPData benchmark tables (ALICE R_AA, ATLAS H->yy) & pull fits
├── requirements.txt                # Python environment requirements
└── README.md                       # This document
```

---

## 3. Reproduction Instructions

### Setup
```bash
# Using standard virtualenv or uv
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Running the Scripts
```bash
# 1. Train TriggerMind & generate benchmark results
python scripts/train_triggermind.py

# 2. Export & verify ONNX model
python scripts/export_onnx.py

# 3. Process open collision data & produce cutflow
python scripts/convert_open_data.py

# 4. Solve accelerator FODO lattice beam optics
python scripts/beam_optics.py

# 5. Ingest & verify published HEPData records
python scripts/evaluate_hepdata.py
```

---

## 4. Benchmark Validation Summary
- **LHC-TriggerMind AMS**: Evaluated using the official CERN/Kaggle Higgs ML Challenge definition with $b_r = 10.0$:
  $$AMS = \sqrt{2 \left( (s + b + b_r) \ln\left(1 + \frac{s}{b + b_r}\right) - s \right)}$$
  All reported numbers include 95% empirical bootstrap confidence intervals ($B = 200$ resamples).
- **LHC Beam Optics**: Solves Hill's equation for a $106.9\text{ m}$ FODO cell, yielding $\beta_{\max} = 182.49\text{ m}$ versus the published LHC Design Report value of $177.0\text{ m}$ (relative difference $3.1\%$, well within nominal thin-lens approximation tolerance).
