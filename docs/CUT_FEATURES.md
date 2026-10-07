# CERN-X: Cut Features Log

In strict compliance with the **No-Fake-Data Policy** (Prompt Addendum), any feature or module that lacks a verified, peer-reviewed, open-access, or published source has been deliberately cut rather than substituted with synthetic, randomized, or unverified numbers.

---

## 1. Cut Features List

### 1.1 Live LHC Status Ticker / Telemetry Stream
- **Reason for Cut**: CERN operations live status (Vistars / Page 1) does not provide a public, unauthenticated, CORS-accessible JSON/REST API for live web clients. Scraping the HTML pages in real time is explicitly prohibited by CERN terms and Rule 6 of the honesty code. Faking a live ticker with simulated numbers would violate the No-Fake-Data rule.
- **Replacement / Compliant Implementation**: A static published Run 3 operating point table (beam energy 6.8 TeV, bunch count 2748, peak luminosity $2.2 \times 10^{34}\text{ cm}^{-2}\text{s}^{-1}$) with an official, prominent external link button to the live CERN Operations Vistars page (`op-webtools.web.cern.ch/vistar/vistars.php`).

### 1.2 Synthetic Accelerator Beam-Loss Forecasting
- **Reason for Cut**: Operational beam loss monitor (BLM) raw time-series telemetry from the LHC ring is not published as an open research dataset. Previously drafted synthetic or randomly generated beam-loss datasets violate the honesty rule forbidding mock/synthetic scientific data.
- **Replacement / Compliant Implementation**: Cut from AI Lab until a public accelerator dataset (such as CERN's public acc-models or a published beam diagnostics benchmark) is verified and ingested.

### 1.3 Unverified "Toy Events" Anomaly Detection
- **Reason for Cut**: Using hand-coded random Gaussian blobs or arbitrary synthetic distributions for anomaly detection misleads users about particle physics signatures.
- **Replacement / Compliant Implementation**: Replaced with the official, peer-reviewed **LHC Olympics 2020 Challenge dataset** (Zenodo DOI: 10.5281/zenodo.4536377), which is a vetted community benchmark for resonant anomaly detection in dijet events.

### 1.4 Uncalibrated CLOUD Atmospheric Microphysics Simulation
- **Reason for Cut**: Quantitative microphysical rate equations for ternary nucleation in the CLOUD chamber require proprietary multi-component aerosol parametrisations not fully public in closed form without specialized thermodynamic modeling.
- **Replacement / Compliant Implementation**: The CLOUD experiment is retained as an authoritative **KNOWLEDGE-TIER** module featuring published results from Nature (Kirkby et al., Nature 476, 429–433 (2011)), with clear qualitative explanations of galactic cosmic ray ionisation without claiming unverified microphysics simulation.

### 1.5 Real-Time Operational WLCG State Monitor
- **Reason for Cut**: The operational state of 170+ worldwide computing sites requires private MonALISA/Dashboard authentication.
- **Replacement / Compliant Implementation**: A discrete-event queuing simulator (`sim-core/wlcg`) driven by published Tier-0/1/2 architecture capacities and network links, explicitly labelled: *"Discrete-event simulation of a simplified grid topology; not real-time WLCG state."*
