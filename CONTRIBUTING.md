# Contributing to CERN-X

Thank you for your interest in contributing to CERN-X! Because this platform adheres to strict scientific honesty and zero unverified data policies, please review these guidelines before submitting a pull request.

---

## 1. Non-Negotiable Standards
1. **Source Every Number**: Never introduce a parameter, constant, or measurement without adding a corresponding record in `/data/manifest.json`.
2. **Honest Fidelity Badging**: Label every simulation (`ANALYTIC`, `TOY`, `MONTE CARLO`, `ILLUSTRATIVE`).
3. **No Unseeded Randomness**: Use `SeededRNG` from `@cern-x/sim-core` rather than `Math.random()`.
4. **Reproducible Research**: Any machine learning model or derived curve must include its Python training script and exact random seed under `/research/scripts`.

---

## 2. Development Workflow
```bash
# 1. Clone the repository
git clone https://github.com/Premchandyadav369/CERN.git
cd CERN

# 2. Install workspace dependencies
npm install

# 3. Run validation test suite
npm run test

# 4. Verify data manifest
npm run verify:manifest
```
