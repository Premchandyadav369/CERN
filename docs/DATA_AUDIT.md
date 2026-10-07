# CERN-X: Phase 0 Source Audit Report (Data Provenance & Policy Gate)

**Date**: 2026-10-07  
**Policy**: CERN-X No-Fake-Data Addendum (Strict Provenance: `REAL`, `PUBLISHED`, `COMPUTED`)  
**Audit Status**: Complete for Phase 0 Approval Gate

---

## 1. Provenance Classification Standards
- **`REAL`**: Released by CERN, an experimental collaboration, or standard scientific body, unmodified except for documented schema/format conversion.
- **`PUBLISHED`**: Sourced directly from peer-reviewed papers, Technical Design Reports (TDRs), design reports, or accredited reference databases (PDG, HEPData, IAEA, NIST).
- **`COMPUTED`**: Produced deterministically by versioned, seeded code in `packages/sim-core` or `research/` based on documented `REAL` or `PUBLISHED` inputs.
- **`FORBIDDEN`**: Hand-typed unverified numbers, `Math.random()` outside seeded PRNG, mock JSON pretending to be measurements, fake tickers, and unverified synthetic datasets.

---

## 2. Feature-by-Feature Source Audit Matrix

| Module / Feature | Candidate Source & URL | Format & Access | Size / Ingest | Licence / Terms | Data Class | Audit Decision |
|---|---|---|---|---|---|---|
| **LHC & Injector Specifications** | CERN Official Pages (`home.cern`), LHC Design Report (CERN-2004-003-V-1) | PDF / Web, manual extraction to JSON | < 100 KB bundled | CERN Open Access (CC-BY-4.0) | `PUBLISHED` | **GO** |
| **LHC Optics / Lattice Tracking** | CERN `acc-models-lhc` repository (`gitlab.cern.ch/acc-models/acc-models-lhc`) | MAD-X / TFS tables | ~5 MB precomputed Twiss tables | CERN Open Access | `COMPUTED` on published lattices | **GO** |
| **LHC Live Status Ticker** | CERN Operations Vistars (`op-webtools.web.cern.ch/vistar/`) | Unauthenticated HTML page (no public API) | N/A | Scraping prohibited; no public machine API | N/A | **CUT** (Replaced by static published Run 3 operating point + direct link out to CERN Vistars) |
| **LHC Luminosity History** | ATLAS & CMS published luminosity records (arXiv:2212.09379, Eur. Phys. J. C 81 (2021) 800) | Tables via CDS & HEPData | < 50 KB bundled | CC-BY-4.0 | `PUBLISHED` | **GO** |
| **Particle Explorer & Standard Model** | Particle Data Group (PDG 2024 Review), via Scikit-HEP `particle` package | Pinned Python package & JSON table | ~1.2 MB bundled | Open Scientific Use (cite PDG) | `PUBLISHED` | **GO** |
| **ATLAS Real Event Display** | CERN Open Data Portal (`opendata.cern.ch`), Record 15007 / ATLAS 13 TeV Open Data | JSON / Parquet event records | ~2.5 MB sample | CC0 1.0 Universal | `REAL` | **GO** |
| **CMS Real Event Display** | CERN Open Data Portal, CMS 2012B collision events (`.ig` / JSON format) | JSON converted format | ~3.0 MB sample | CC0 1.0 Universal | `REAL` | **GO** |
| **Detector Geometry & Specs** | ATLAS TDR (JINST 3 S08003), CMS TDR (JINST 3 S08004), ALICE (JINST 3 S08002), LHCb (JINST 3 S08005) | Extracted published parameters | < 200 KB bundled | CC-BY-4.0 | `PUBLISHED` | **GO** |
| **Detector Subsystem Filter** | Client-side filter on reconstructed particle tracks/towers in real open events | Code function | Zero data cost | MIT (CERN-X) | `ILLUSTRATIVE FILTER` (Labelled as visual filter, not hardware response) | **GO** |
| **Reconstruction Lab (Tracking)** | TrackML Particle Tracking Dataset (CERN/Kaggle/Inria, DOI: 10.5281/zenodo.4878000) | CSV converted to Parquet | ~10 MB curated sample | CC-BY-4.0 | `COMPUTED` on public simulation | **GO** |
| **Trigger Lab Budget & Menu** | ATLAS Trigger TDR (CERN-LHCC-2013-018) & CMS Trigger TDR (CERN-LHCC-2000-038) | Published rate & latency budgets | < 50 KB | CERN Open Access | `PUBLISHED` budgets + `COMPUTED` ROCs | **GO** |
| **Discovery Exercise: Rediscovery** | ATLAS Open Data 13 TeV $H \rightarrow \gamma\gamma$ and $H \rightarrow 4\ell$ datasets | Parquet / ROOT via uproot | ~8 MB curated sample | CC0 1.0 Universal | `REAL` | **GO** |
| **Discovery Exercise: Toy Resonance** | Seeded Breit-Wigner resonance on polynomial background | Deterministic seeded PRNG in `sim-core` | In-memory computed | N/A | `COMPUTED` (Labelled "Simulated Exercise, Not Real Data") | **GO** |
| **ALICE Heavy-Ion Physics** | HEPData Record ins1666817 ($R_{AA}$ and elliptic flow $v_2$ in Pb-Pb at 5.02 TeV) | YAML / CSV from HEPData | < 100 KB bundled | CC0 / HEPData terms | `PUBLISHED` | **GO** |
| **LHCb B-Decay Physics** | LHCb Open Data ($B^\pm \rightarrow K^\pm K^+ K^-$) + HEPData branching ratios | CSV / Parquet | ~4 MB sample | CC0 1.0 Universal | `REAL` + `PUBLISHED` | **GO** |
| **Antimatter Factory (AD / ELENA)** | CERN ELENA TDR (CERN-2014-002) & published Penning trap field parameters | Mathematical formulas | In-memory computed | CERN Open Access | `COMPUTED` from published formulas | **GO** |
| **ISOLDE Nuclear Physics** | IAEA Live Chart of Nuclides / NuDat 3.0 / AME2020 mass evaluation | JSON table of isotopes | ~1.5 MB bundled | IAEA Open Data terms | `PUBLISHED` | **GO** |
| **n_TOF Cross Sections** | ENDF/B-VIII.0 cross-section tables via IAEA Nuclear Data Services | Evaluated data tables | ~300 KB bundled | Open Nuclear Data | `PUBLISHED` | **GO** |
| **AWAKE Plasma Wakefield** | AWAKE Collaboration (Nature 561, 363–369 (2018), DOI: 10.1038/s41586-018-0485-4) | Published acceleration parameters & 1D wakefield equation | In-memory computed | Nature Open Access / Springer | `PUBLISHED` + `COMPUTED` | **GO** |
| **CLOUD Atmospheric Physics** | CLOUD Collaboration (Nature 476, 429–433 (2011), Kirkby et al.) | Summary of published results | < 50 KB text | Nature Open Access | `PUBLISHED` (Knowledge-only, no toy sim) | **GO** |
| **WLCG & Data Centre Simulation** | WLCG Overview (`wlcg.web.cern.ch`), CERN Data Centre public factsheets | Topology table & queueing parameters | < 80 KB bundled | CERN Open Access | `PUBLISHED` topology + `COMPUTED` queue model | **GO** |
| **Engineering: Superconducting Magnets** | Lubell / Bottura Nb-Ti critical surface parametrisation (IEEE Trans. Appl. Supercond.) | Analytical formula | In-memory computed | Published scientific literature | `PUBLISHED` + `COMPUTED` | **GO** |
| **AI Lab: LHC-TriggerMind** | ATLAS Higgs Machine Learning Challenge (CERN Open Data / OpenML, DOI: 10.7483/OPENDATA.ATLAS.Z55B.2V8K) | CSV converted to Parquet | ~15 MB dataset in `/research` | CC-BY-4.0 (Official ATLAS Simulation) | `COMPUTED` on public simulation | **GO** |
| **AI Lab: Anomaly Detection** | LHC Olympics 2020 Challenge dataset (Zenodo DOI: 10.5281/zenodo.4536377) | HDF5 converted to Parquet | ~12 MB curated benchmark sample | CC-BY-4.0 | `COMPUTED` on public benchmark | **GO** |
| **Synthetic Beam-Loss Forecasting** | N/A (Previous proposal used synthetic data) | N/A | N/A | Prohibited by No-Fake-Data rule | Synthetic / Fake | **CUT** |
| **Generic Toy Event Anomaly** | N/A (Previous proposal used unverified toy data) | N/A | N/A | Prohibited by No-Fake-Data rule | Unverified | **CUT** |
| **CERN Knowledge Graph** | CERN Official Pages, INSPIRE-HEP API, CERN Document Server records | Curated JSON graph with exact citations | ~400 KB bundled | Open Bibliographic Data | `PUBLISHED` | **GO** |

---

## 3. Storage and Checksum Verification Plan
All bundled datasets (`.parquet`, `.json`, `.csv`) live under `/data/raw` and `/data/processed`.
Every file will be indexed in `/data/manifest.json` with:
1. `id`: unique machine identifier
2. `sha256`: cryptographic checksum verified at CI build time
3. `source_url`: canonical web address or DOI
4. `class`: `REAL` | `PUBLISHED` | `COMPUTED`
5. `license`: standard SPDX identifier
6. `retrieval_date`: ISO 8601 timestamp
7. `transform_script`: path to deterministic Python/Node converter
