# CERN-X: UI / UX Direction & Design Tokens Specification

## Concept
A **scientific control room meets interactive atlas**. Dark, precise, data-dense but calm. It should feel like a serious research instrument, not a sci-fi video game.
Avoid purple-gradient "AI app" clichés, stock glassmorphism everywhere, and decorative clutter.

---

## Design Tokens (CSS Variables, Dark Default + Light Mode)

### Palette
- **Background**:
  - Deep navy-black `#060A12` (canvas)
  - Surface `#0D1422` (cards, sidebars)
  - Raised `#131C2E` (active panels, popovers, modals)
  - Subsurface `#0A0F1A` (canvas background, wells)
- **Primary / Brand**:
  - CERN-style deep blue: `#0033A0` (brand accent, key action buttons)
  - Interaction light blue: `#4C7DFF` (links, focus rings, interactive states)
- **Scientific Accents**:
  - Beam Cyan: `#3DD6FF` (proton beams, live streams, fast metrics)
  - Ion Magenta: `#E04FD0` (heavy ions, high energy density)
  - Antimatter Amber: `#FFB020` (antimatter, decelerators, alerts)
  - Success Green: `#2ECC8F` (validated, passed, operational)
  - Error Coral: `#FF5C5C` (rejected, fault, limits exceeded)
- **Text & Hierarchy**:
  - Primary text: `#E8EEF9`
  - Secondary text: `#9FB0CC`
  - Muted text: `#6B7C99`
  - Monospace code/numbers: `#C8D7F0`
- **Event-Display Conventions**:
  - Tracks: Warm Yellow / Orange (`#FFD166` / `#F77F00`)
  - EM Calorimeter: Green towers (`#06D6A0`)
  - Hadronic Calorimeter: Blue/Violet towers (`#118AB2`)
  - Muon chambers / hits: Crimson Red (`#EF476F`)
- **Accessibility & Contrast**:
  - Full WCAG 2.2 AA compliant contrast on dark and light modes.
  - Color-blind-safe check on every chart (never rely on color alone; use distinct dash styles, markers, and patterns).
- **Borders & Radii**:
  - Border: `1px solid rgba(255, 255, 255, 0.08)` (dark) / `1px solid rgba(0, 0, 0, 0.1)` (light)
  - Panel radius: `6px`
  - Data cell radius: `2px`
  - Pill badge radius: `9999px`

### Typography
- **UI Interface Font**: Inter (`system-ui, -apple-system, sans-serif`)
- **Live Numbers & Code**: JetBrains Mono / Fira Code (`ui-monospace, monospace`), with `font-variant-numeric: tabular-nums` for all dynamic readouts
- **Headings**: Space Grotesk / Inter Display
- **Type Scale**:
  - Micro / Captions: `12px` (line-height: `16px`)
  - Body Small / Controls: `14px` (line-height: `20px`)
  - Body Regular: `16px` (line-height: `24px`)
  - Subheading / Section: `20px` (line-height: `28px`)
  - View Title: `28px` (line-height: `36px`)
  - Hero Display: `40px` (line-height: `48px`)

### Grid & Motion
- **Spacing Grid**: 4px base (`4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px`)
- **Motion**: `150ms - 250ms` ease-out for UI transitions. Simulations run on their own clock worker.
- **Motion Reduction**: Global `prefers-reduced-motion` and manual toggle to disable canvas particle animations and glows.

---

## Layout System
- **Top Bar**:
  - Monospace wordmark: `CERN-X` (text only, no unauthorized logo)
  - Breadcrumb: Dynamic zoom hierarchy (`CERN › Complex › LHC › ATLAS › Calorimeter`)
  - Global Search / Command Palette: `Ctrl/Cmd + K`
  - Top Navigation: Discover, Accelerators, Experiments, Detectors, Simulations, Computing, Engineering, AI Lab, Learn
  - Mode Controls: Level switcher (Beginner / Undergraduate / Researcher), Reduce-motion toggle, Dark/Light mode
- **Three-Pane Simulation Workspace**:
  - `LEFT`: Parameter Panel (sliders, numeric inputs, unit dropdowns, bounds, physics presets, reset)
  - `CENTER`: Visualization Canvas (3D R3F viewport, 2D D3/Visx charts, schematic ring map)
  - `RIGHT`: Inspector & Evidence Drawer (equations with LaTeX KaTeX, source tier chip, fidelity badge, limitations note)
  - `BOTTOM`: Time Scrubber & Control Deck (run/pause/step, clock speed $\times 0.1 \rightarrow \times 10$, event counter, provenance audit trail)
- **Footer**:
  - Unofficial project disclaimer: *"CERN-X is an independent educational and research platform. Not affiliated with or endorsed by CERN."*
  - Source policy & Data Manifest link
  - MIT License
  - Changelog & Methodology link

---

## Signature Components
1. **Ring Map Home**: Interactive SVG/Canvas animated schematic of the injector chain (Linac4 → PSB → PS → SPS → LHC) with clickable stations and hover summary cards.
2. **Provenance `<Value>` / `<Series>` / `<Event>`**: Custom typography wrappers displaying numbers with click-to-inspect popovers (Source, Tier, DOI, Class: REAL / PUBLISHED / COMPUTED, Formula).
3. **Fidelity Badge**: Standardized pill chips (`ANALYTIC`, `TOY`, `MONTE CARLO`, `ILLUSTRATIVE`).
4. **Data-Class Overlay Toggle**: One-click visual mode highlighting the entire interface by data class:
   - Green = `REAL` (Open Data, measured)
   - Blue = `PUBLISHED` (TDR, PDG, papers)
   - Amber = `COMPUTED` (Seeded physics engine output)
5. **Level Switcher**: Three-tier pedagogical filter across all explanatory drawers:
   - *Beginner*: Intuitive concepts, visual analogies, zero heavy jargon.
   - *Undergraduate*: Formal definitions, standard kinematics, core field equations.
   - *Researcher*: Full Lagrangian / cross-section / detector resolution formulations, TDR citations, systematic uncertainty breakdowns.
6. **Command Palette (`Cmd+K`)**: Rapid keyboard search across all accelerators, experiments, particles, datasets, glossary terms, and simulation setups.
7. **Discovery Notebook**: Step-by-step statistical hypothesis testing workspace with mass-peak fitting and significance estimation, tagged with explicit `SIMULATED EXERCISE` banner.
