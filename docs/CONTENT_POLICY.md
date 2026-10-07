# CERN-X: Content & Provenance Policy

## 1. Core Principles
CERN-X is built on scientific honesty and strict data provenance. We explicitly separate what is verified fact, what is established consensus physics, what is an active search hypothesis, and what is a computational model.

---

## 2. Source Tiers
Every claim, parameter, and dataset must be tagged with a verifiable Source Tier:

- **Tier 1 (`T1_OFFICIAL`)**: CERN Official Portal & Documentation (`home.cern`, CERN Council, CERN Directory). Canonical for institutional facts, operating states, and machine geometries.
- **Tier 2 (`T2_OPEN_DATA`)**: CERN Open Data Portal (`opendata.cern.ch`). Canonical for open-access collision runs, simulated Monte Carlo datasets, and public analysis examples.
- **Tier 3 (`T3_CDS`)**: CERN Document Server (`cds.cern.ch`). Canonical for Technical Design Reports (TDRs), Yellow Reports, Internal Notes, and Conference Proceedings.
- **Tier 4 (`T4_EXPERIMENT`)**: Official Experiment Collaboration sites (ATLAS, CMS, ALICE, LHCb collaboration websites and public result repositories).
- **Tier 5 (`T5_PEER_REVIEWED`)**: Peer-reviewed scientific journals (Physical Review, JHEP, EPJC, JINST, Nature, Science) and the Particle Data Group (PDG).

---

## 3. Data Classes
Any quantitative value rendered in the application must strictly belong to one of:

1. **`REAL`**: Unmodified measurements released by CERN or experiment collaborations.
2. **`PUBLISHED`**: Values transcribed directly from peer-reviewed literature or official design parameters with DOI/URL citation.
3. **`COMPUTED`**: Quantities generated deterministically in `sim-core` or `research/` from documented formulas and published initial conditions.

---

## 4. Epistemic Status
Physics content must never conflate established science with speculative theory. All physics modules must carry an epistemic tag:

- **`ESTABLISHED_PHYSICS`**: Validated by overwhelming experimental evidence (Standard Model particles, relativistic kinematics, Maxwell-Lorentz electrodynamics, electroweak unification).
- **`HYPOTHESIS`**: Scientifically motivated theoretical extensions awaiting direct empirical proof (Supersymmetry, extra dimensions, sterile neutrinos, dark photons).
- **`SEARCH_TARGET`**: Specific benchmark signatures targeted by active experimental analysis (WIMP dark matter, microscopic black holes, heavy resonances, ALPs).

---

## 5. Simulation Fidelity Badges
Every interactive simulation canvas must prominently display its fidelity level:

- **`ANALYTIC`**: Derived from closed-form exact mathematical equations (e.g., relativistic momentum-energy relations, magnetic rigidity). The equation is directly inspectable.
- **`TOY`**: Simplified educational approximation intended to convey qualitative mechanics (e.g., simplified 2D tracking with fixed resolution).
- **`MONTE CARLO`**: Seeded stochastic simulation incorporating probabilistic physics (e.g., Poisson pileup, Breit-Wigner resonance generation).
- **`ILLUSTRATIVE`**: Visual graphic aiding conceptual understanding without claim to numerical fidelity (e.g., particle beam halo animations).
