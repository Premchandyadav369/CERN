'use client';

import React, { useState, useEffect } from 'react';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { playTemPadClick } from '@/lib/sonifier';
import { Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export interface TechTermEntry {
  id: string;
  term: string;
  symbol: string;
  units: string;
  eli5: string;
  definition: string;
  tex?: string;
  cernUse: string;
}

export const TECH_TERMS: Record<string, TechTermEntry> = {
  luminosity: {
    id: 'luminosity',
    term: 'Instantaneous Luminosity',
    symbol: 'L',
    units: 'cm⁻² s⁻¹',
    eli5: 'How tightly packed and bright the proton beams are at the crossing point—more brightness means more collisions per second.',
    definition: 'Proportionality factor linking interaction rate dN/dt = L · σ to particle cross section σ.',
    tex: '\\mathcal{L} = \\frac{N_1 N_2 n_b f_{\\text{rev}} \\gamma}{4\\pi \\varepsilon_n \\beta^*}\\,F',
    cernUse: 'LHC Run 3 operates leveled near 2.1 × 10³⁴ cm⁻²s⁻¹; HL-LHC targets 5.0–7.5 × 10³⁴ cm⁻²s⁻¹.',
  },
  magnetic_rigidity: {
    id: 'magnetic_rigidity',
    term: 'Magnetic Rigidity',
    symbol: 'Bρ',
    units: 'T·m',
    eli5: 'How stubborn a speeding proton is when magnets try to steer it around a curve.',
    definition: 'Momentum per unit electric charge governing circular bending radius ρ in dipole field B.',
    tex: 'B\\rho = \\frac{p}{q} = \\frac{p\\;[\\text{GeV}/c]}{0.299792458\\,|Z|}',
    cernUse: 'Fixes 8.33 T dipole requirements for the 2,804 m bending radius inside the 27 km LHC tunnel.',
  },
  beta_star: {
    id: 'beta_star',
    term: 'Beta-Star (β*)',
    symbol: 'β*',
    units: 'm or cm',
    eli5: 'How tightly the final quadrupole magnets squeeze the proton beam like a magnifying glass focal point.',
    definition: 'Value of the optical betatron envelope function β(s) at the interaction point (IP); smaller β* means smaller transverse beam size.',
    tex: '\\sigma^* = \\sqrt{\\frac{\\varepsilon_n \\beta^*}{\\gamma}}',
    cernUse: 'LHC squeezes β* to ~30 cm inside ATLAS & CMS; HL-LHC squeezes down to 15 cm.',
  },
  pseudorapidity: {
    id: 'pseudorapidity',
    term: 'Pseudorapidity',
    symbol: 'η',
    units: 'dimensionless',
    eli5: 'Angle coordinate measured away from the colliding beam pipe: 0 is straight sideways, high numbers hug the pipe.',
    definition: 'Spatial coordinate approximating true rapidity y in the ultrarelativistic limit, invariant under longitudinal boosts in differences Δη.',
    tex: '\\eta = -\\ln\\!\\left(\\tan\\frac{\\theta}{2}\\right)',
    cernUse: 'ATLAS/CMS trackers span |η| < 2.5; LHCb covers the forward cone 2.0 < η < 5.0.',
  },
  transverse_momentum: {
    id: 'transverse_momentum',
    term: 'Transverse Momentum',
    symbol: 'p_T',
    units: 'GeV/c',
    eli5: 'The sideways kick flying out perpendicular to the colliding beams. Big p_T screams high-violence core collision!',
    definition: 'Momentum projection in the transverse (x, y) plane perpendicular to the z beam axis where initial total p_T ≈ 0.',
    tex: 'p_T = p\\sin\\theta = \\sqrt{p_x^2 + p_y^2}',
    cernUse: 'Primary discriminant used by Level-1 hardware triggers to reject soft QCD background.',
  },
  invariant_mass: {
    id: 'invariant_mass',
    term: 'Invariant Mass',
    symbol: 'M',
    units: 'GeV/c²',
    eli5: 'Adding up daughter particle energies and directions backwards to weigh an invisible parent particle that already decayed.',
    definition: 'Lorentz-invariant norm of total 4-momentum conserved identically across every inertial reference frame.',
    tex: 'M^2 = \\left(\\sum E_i\\right)^2 - \\left|\\sum \\vec{p}_i\\right|^2',
    cernUse: 'Revealed Z⁰ (91.2 GeV) and Higgs boson (125.25 GeV) resonance bumps over smooth backgrounds.',
  },
  stored_energy: {
    id: 'stored_energy',
    term: 'Stored Beam Energy',
    symbol: 'E_beam',
    units: 'MJ',
    eli5: 'All the motion energy packed into a single circulating ring of protons—equal to a speeding high-speed TGV train!',
    definition: 'Product of total bunch number k, protons per bunch N_b, proton energy E_p, and elementary charge e.',
    tex: 'E_{\\text{beam}} = k\\,N_b\\,E_p\\,e \\approx 362\\text{ MJ}',
    cernUse: 'Requires ultra-fast kicker magnets at Point 6 to safely extract beams into graphite dump blocks.',
  },
  cryo_he2: {
    id: 'cryo_he2',
    term: 'Superfluid Helium-II',
    symbol: 'He-II',
    units: 'K',
    eli5: 'Ultra-cold liquid helium below 2.17 K that flows with zero friction and conducts heat hundreds of times better than copper.',
    definition: 'Quantum Bose-condensed liquid helium phase cooled to 1.9 K across the 27 km LHC cryo-ring.',
    tex: 'T_{\\text{op}} = 1.9\\text{ K} < T_{\\lambda} = 2.17\\text{ K}',
    cernUse: 'Penetrates NbTi magnet cable insulation pores to carry away beam-induced heat spikes.',
  },
  quench: {
    id: 'quench',
    term: 'Superconducting Quench',
    symbol: 'T > T_c',
    units: 'K / T',
    eli5: 'When part of a superconducting magnet warms slightly too much, loses zero-resistance magic, and dumps huge electrical heat.',
    definition: 'Sudden resistive transition when temperature, current density, or magnetic field exceeds the superconductor critical surface.',
    tex: 'B_{\\text{op}} > B_{c2}(T) \\implies R_{\\text{coil}} > 0',
    cernUse: 'Guarded by real-time quench protection heaters & energy extraction dump resistors.',
  },
  nb3sn: {
    id: 'nb3sn',
    term: 'Niobium-Tin (Nb₃Sn)',
    symbol: 'Nb₃Sn',
    units: 'T',
    eli5: 'Next-generation brittle crystal superconducting wire strong enough to push fields up to 16 Tesla.',
    definition: 'A15 intermetallic Type-II superconductor with T_c = 18.3 K and critical fields exceeding 24 T.',
    tex: 'u_B = \\frac{B^2}{2\\mu_0} \\quad (P_B \\approx 102\\text{ MPa at }16\\text{ T})',
    cernUse: 'Replaces NbTi in HL-LHC inner-triplet quadrupole magnets and baseline 16 T FCC-hh dipoles.',
  },
  crab_cavity: {
    id: 'crab_cavity',
    term: 'Crab Cavity Tilt',
    symbol: 'F',
    units: 'MV',
    eli5: 'Sideways radio-wave kicks that rotate proton bunches like sideways-scuttling crabs so they collide completely head-on.',
    definition: 'Transverse deflecting RF cavity correcting crossing-angle geometric luminosity loss factor F.',
    tex: 'F = \\frac{1}{\\sqrt{1 + \\Phi^2}}, \\quad \\Phi = \\frac{\\theta_c \\sigma_z}{2\\sigma^*}',
    cernUse: 'Verified in CERN SPS tests and central to HL-LHC reaching +170% overlap gain.',
  },
  synchrotron_rad: {
    id: 'synchrotron_rad',
    term: 'Synchrotron Radiation',
    symbol: 'P_sync',
    units: 'MW',
    eli5: 'X-ray glow wasted whenever ultra-fast particles whip around sharp magnetic curves.',
    definition: 'Larmor relativistic power radiated radially proportional to γ⁴ / ρ², severely penalizing light electrons.',
    tex: 'P_{\\text{sync}} = \\frac{e^2 c}{6\\pi\\varepsilon_0}\\frac{\\gamma^4}{\\rho^2}',
    cernUse: 'Even protons radiate ~10 kW in the LHC, while FCC-ee caps synchrotron losses at 50 MW/beam.',
  },
  qgp: {
    id: 'qgp',
    term: 'Quark-Gluon Plasma',
    symbol: 'QGP',
    units: 'MeV / K',
    eli5: 'A primordial soup from the first millionth of a second after the Big Bang where quarks melt free from protons.',
    definition: 'Deconfined state of QCD matter above crossover temperature T_QGP ≈ 156 MeV behaving as a near-perfect liquid.',
    tex: 'T_{\\text{QGP}} \\approx 156\\text{ MeV} \\approx 1.8\\times 10^{12}\\text{ K}',
    cernUse: 'Studied by ALICE in 5.36 TeV Lead–Lead heavy-ion collisions.',
  },
  elliptic_flow: {
    id: 'elliptic_flow',
    term: 'Elliptic Flow (v₂)',
    symbol: 'v₂',
    units: 'dimensionless',
    eli5: 'Squeezing a football-shaped overlap droplet makes particles shoot out harder sideways along the waist!',
    definition: 'Second Fourier harmonic of azimuthal particle momentum anisotropy measuring hydrodynamic pressure conversion.',
    tex: '\\frac{dN}{d\\phi} \\propto 1 + 2v_2\\cos(2\\phi)',
    cernUse: 'Proves QGP shear viscosity-to-entropy ratio η/s lies close to the quantum lower bound 1/(4π).',
  },
  cherenkov: {
    id: 'cherenkov',
    term: 'Cherenkov Cone',
    symbol: 'θ_c',
    units: 'mrad / deg',
    eli5: 'An optical "sonic boom" cone of blue light created when a particle outruns light inside gas or liquid.',
    definition: 'Coherent electromagnetic shockwave emitted at angle cos θ_c = 1 / (nβ) when β > 1/n.',
    tex: '\\cos\\theta_c = \\frac{1}{n\\beta}',
    cernUse: 'LHCb RICH-1 & RICH-2 identify pions vs. kaons vs. protons from ring radii.',
  },
  k_edge: {
    id: 'k_edge',
    term: 'K-Edge Spectral X-Ray',
    symbol: 'μ(E)',
    units: 'cm⁻¹',
    eli5: 'Each chemical element suddenly drinks up X-rays at its own unique color threshold—turning black-and-white scans into color!',
    definition: 'Sharp jump in photoelectric photon attenuation coefficient right above inner K-shell binding energy.',
    tex: 'I(x) = I_0\\,e^{-\\mu(E)\\,x}',
    cernUse: 'CERN Medipix3 photon-counting chips enable spectral color biomedical X-ray imaging.',
  },
  bethe_bloch: {
    id: 'bethe_bloch',
    term: 'Bethe-Bloch Bragg Peak',
    symbol: '-dE/dx',
    units: 'MeV/cm',
    eli5: 'Charged ion beams save almost all their energy until the very last millimeter before stopping—blasting tumors while sparing organs behind!',
    definition: 'Mean ionization stopping power inversely proportional to β², forming a sharp depth-dose Bragg Peak.',
    tex: '-\\frac{dE}{dx} \\propto \\frac{z^2}{\\beta^2}\\left[\\ln\\!\\left(\\frac{2m_ec^2\\beta^2\\gamma^2 T_{\\max}}{I^2}\\right)-2\\beta^2\\right]',
    cernUse: 'Inspires CERN medical hadron therapy accelerators (PIMMS / CNAO / MedAustron).',
  },
  pmns: {
    id: 'pmns',
    term: 'PMNS Neutrino Mixing',
    symbol: 'Δm²₃₂',
    units: 'eV²',
    eli5: 'Neutrinos travel as three overlapping quantum ripples that drift out of phase underground, turning one flavor into another!',
    definition: 'Unitary Pontecorvo–Maki–Nakagawa–Sakata matrix rotating mass eigenstates ν₁,ν₂,ν₃ into weak flavors ν_e, ν_μ, ν_τ.',
    tex: 'P(\\nu_\\mu \\to \\nu_\\tau) \\approx \\sin^2(2\\theta_{23})\\sin^2\\!\\left(\\frac{1.267\\,\\Delta m^2_{32}\\,L}{E}\\right)',
    cernUse: 'Probed across CNGS (732 km to Gran Sasso), FASERnu (480 m), and ProtoDUNE.',
  },
  lambda_vacuum: {
    id: 'lambda_vacuum',
    term: 'Higgs Quartic Running λ(μ)',
    symbol: 'λ(μ)',
    units: 'dimensionless',
    eli5: 'A cosmic tug-of-war between the Higgs boson pushing up and the heavy Top quark pulling quantum vacuum energy downward.',
    definition: 'Scale-dependent self-coupling of the Higgs potential whose sign determines whether the vacuum stays absolutely stable or metastable.',
    tex: 'm_H^{\\text{crit}} \\approx 129.6 + 2.0\\,(m_t - 173.34) - 0.56\\,\\frac{\\alpha_s - 0.1184}{0.0007}\\;\\text{GeV}',
    cernUse: 'ATLAS & CMS m_H = 125.25 GeV and m_t = 172.69 GeV measurements map our universe near metastability.',
  },
  ewsb_vev: {
    id: 'ewsb_vev',
    term: 'Electroweak VEV (Mexican Hat)',
    symbol: 'v',
    units: 'GeV',
    eli5: 'Cooling below 159.5 GeV causes the Higgs field ball to roll off the hat peak into a 246 GeV trough, giving W, Z & quarks mass.',
    definition: 'Non-zero vacuum expectation value v = 246.22 GeV breaking SU(2)_L × U(1)_Y symmetry at temperatures below T_c.',
    tex: 'V(\\phi) = \\frac{1}{2}\\mu^2(T)\\phi^2 + \\frac{1}{4}\\lambda\\phi^4',
    cernUse: 'Verified via W, Z, and Higgs Yukawa couplings measured at LHC.',
  },
  displaced_llp: {
    id: 'displaced_llp',
    term: 'Displaced Vertex (LLP)',
    symbol: 'L_lab',
    units: 'm / mm',
    eli5: 'Long-lived ghost particles fly meters invisibly before erupting into sudden tracks mid-detector.',
    definition: 'Secondary decay vertex displaced significantly from primary interaction point due to proper lifetime τ₀ and boost γβ.',
    tex: 'L_{\\text{lab}} = \\gamma\\beta c\\tau_0',
    cernUse: 'Dedicated searches at ATLAS/CMS displaced vertex triggers, FASER, and MATHUSLA.',
  },
  add_kk: {
    id: 'add_kk',
    term: 'ADD Compactified Dimensions',
    symbol: 'M_D',
    units: 'TeV',
    eli5: 'If gravity leaks into tiny curled-up extra dimensions, true gravity strength M_D could sit right near LHC energy!',
    definition: 'Arkani-Hamed–Dimopoulos–Dvali relation linking observed Planck scale M_Pl to n extra dimensions of radius R.',
    tex: 'M_{\\text{Pl}}^2 \\sim M_D^{2+n}\\,R^n, \\quad \\Delta m_{\\text{KK}} = \\frac{\\hbar c}{R}',
    cernUse: 'Constrained by ATLAS & CMS mono-jet and high-mass dilepton Kaluza-Klein searches.',
  },
  dirac_monopole: {
    id: 'dirac_monopole',
    term: 'Dirac Magnetic Monopole',
    symbol: 'g_D',
    units: 'e',
    eli5: 'A hypothetical pure North-only magnetic particle ionizing plastic trackers ~4,700× brighter than a proton!',
    definition: 'Isolated magnetic charge obeying Dirac quantization g_D = e / (2α) ≈ 68.5 e with parabolic trajectory along B.',
    tex: 'g_D = \\frac{e}{2\\alpha} \\approx 68.5\\,e',
    cernUse: 'Directly hunted using nuclear track detectors and trapped aluminum around LHCb by CERN MoEDAL.',
  },
  l1_trigger: {
    id: 'l1_trigger',
    term: 'Level-1 FPGA & HLT Trigger',
    symbol: 'R_L1',
    units: 'MHz → kHz',
    eli5: 'Ultra-fast electronic bouncers checking 40 million bunch crossings a second in 2.5 microseconds to keep only interesting events.',
    definition: 'Two-stage hardware/software DAQ filter shrinking 40 MHz input down to ~1–2 kHz permanent storage.',
    tex: 'R_{\\text{keep}} \\approx 100\\text{ kHz (L1)} \\to 1.5\\text{ kHz (HLT)}',
    cernUse: 'Runs custom Xilinx/AMD FPGA firmware and GPU/CPU High-Level Trigger farms at ATLAS & CMS.',
  },
  asimov_sigma: {
    id: 'asimov_sigma',
    term: 'Asimov 5σ Discovery Threshold',
    symbol: 'Z₀',
    units: 'σ (std dev)',
    eli5: 'Reaching 5σ means less than a 1-in-3.5-million chance that your signal bump is just random background luck!',
    definition: 'Profile likelihood ratio test statistic quantifying excess signal events s over background expectation b.',
    tex: 'Z_0 = \\sqrt{2\\left((s+b)\\ln\\!\\left(1+\\frac{s}{b}\\right)-s\\right)} \\ge 5.0',
    cernUse: 'Standard gold discovery bar used for the 2012 Higgs announcement.',
  },
  ams_metric: {
    id: 'ams_metric',
    term: 'Approximate Median Significance',
    symbol: 'AMS',
    units: 'σ-proxy',
    eli5: 'The exact physics exam grade physicists give an AI classifier—rewarding real Higgs finds while punishing false alarms.',
    definition: 'Regularized Asimov significance score balancing true positive weighted signal s against background b + b_r.',
    tex: '\\text{AMS} = \\sqrt{2\\left((s+b+b_r)\\ln\\!\\left(1+\\frac{s}{b+b_r}\\right)-s\\right)}',
    cernUse: 'Benchmark objective metric from the CERN ATLAS Higgs Boson ML Challenge.',
  },
  plasma_wakefield: {
    id: 'plasma_wakefield',
    term: 'Plasma Wakefield Gradient',
    symbol: 'E₀',
    units: 'GV/m',
    eli5: 'Surfing electrons on steep electric plasma waves 20× stronger per meter than standard metal RF cavities.',
    definition: 'Wavebreaking longitudinal electric field excited in ionized rubidium plasma scales with √n_pe.',
    tex: 'E_0 = \\frac{m_e c \\omega_{pe}}{e} \\approx 96\\sqrt{n_{pe}\\;[\\text{cm}^{-3}]}\\text{ V/m}',
    cernUse: 'Pioneered at CERN AWAKE using SPS 400 GeV proton bunches as wakefield drivers.',
  },
  alpha_g: {
    id: 'alpha_g',
    term: 'Antimatter Gravity (ALPHA-g)',
    symbol: 'a_g',
    units: 'g (9.81 m/s²)',
    eli5: 'Dropping cold trapped antihydrogen atoms to prove antimatter falls DOWN under Earth gravity, not upward!',
    definition: 'Gravitational acceleration measurement via magnetic mirror trap asymmetry on neutral antihydrogen.',
    tex: 'U(z) = \\mu_B B(z) + m_{\\bar{H}} a_g z',
    cernUse: 'Measured by ALPHA-g at CERN Antiproton Decelerator (a_g ≈ +0.75 ± 0.29 g, confirming downward fall).',
  },
  cast_primakoff: {
    id: 'cast_primakoff',
    term: 'Axion Primakoff Conversion',
    symbol: 'P(a→γ)',
    units: 'dimensionless',
    eli5: 'Turning invisible solar axions into real X-ray photons by shining them through a strong 9-Tesla LHC magnet pipe.',
    definition: 'Coherent axion-to-photon conversion amplitude enhanced when buffer gas photon effective mass matches m_a.',
    tex: 'P(a \\to \\gamma) = \\left(\\frac{g_{a\\gamma} B L}{2}\\right)^2 \\text{sinc}^2\\!\\left(\\frac{q L}{2}\\right)',
    cernUse: 'Searched over decades at CERN CAST helioscope using a prototype LHC dipole magnet.',
  },
  feynman_amp: {
    id: 'feynman_amp',
    term: 'Breit-Wigner & S-Matrix Amplitude',
    symbol: 'M_fi',
    units: 'nb / GeV⁻²',
    eli5: 'Matching beam energy exactly to a particle’s mass (91.2 GeV for Z⁰) rings it like a bell—multiplying collisions 100×!',
    definition: 'Quantum perturbation scattering transition conserved across Q, B, L_e, L_μ, L_τ with Z⁰ propagator resonance.',
    tex: '\\sigma(s) \\propto \\frac{s}{(s - M_Z^2)^2 + M_Z^2 \\Gamma_Z^2}',
    cernUse: 'Measured cleanly by ALEPH, DELPHI, L3, and OPAL at CERN LEP.',
  },
  isolde_mass: {
    id: 'isolde_mass',
    term: 'ISOLDE Mass Separator & SEMF',
    symbol: 'A / q',
    units: 'u / e',
    eli5: 'Weighing fragile radioactive isotopes in mid-flight using magnets so only one single exotic atom reaches doctors or experiments.',
    definition: 'Magnetic dipole bending radius separating ionized radioactive isotopes by mass-to-charge ratio alongside binding energy B(Z,A).',
    tex: 'R_L = \\frac{\\sqrt{2\\,m\\,q\\,V}}{q\\,B}',
    cernUse: 'CERN ISOLDE & MEDICIS produce rare medical isotopes including Terbium-161.',
  },
  rf_cavity: {
    id: 'rf_cavity',
    term: '400 MHz RF Phase Acceleration',
    symbol: 'φ_s',
    units: 'degrees / MV',
    eli5: 'Pushing bunches with precision radio waves timed like pushing a playground swing at the exact top of its arc.',
    definition: 'Synchronous energy gain per turn inside niobium-coated superconducting 400.8 MHz RF cavities.',
    tex: '\\Delta E_{\\text{turn}} = q V_{\\text{RF}} \\sin\\phi_s',
    cernUse: 'LHC Point 4 cavities accelerate protons from 450 GeV injection to 6.8 TeV flat top.',
  },
  wilson_rk: {
    id: 'wilson_rk',
    term: 'Flavour Ratios (R_K / R_K*)',
    symbol: 'R_K',
    units: 'dimensionless',
    eli5: 'Checking if heavy beauty quarks treat electrons and heavier muons equally—any mismatch points to new hidden physics!',
    definition: 'Branching fraction ratio of rare penguin decays B → K μ⁺μ⁻ relative to B → K e⁺e⁻ testing Lepton Flavour Universality.',
    tex: 'R_K = \\frac{\\mathcal{B}(B^+ \\to K^+ \\mu^+\\mu^-)}{\\mathcal{B}(B^+ \\to K^+ e^+ e^-)} \\approx 1.00',
    cernUse: 'Measured to sub-percent precision by the LHCb Collaboration.',
  },
  courant_snyder: {
    id: 'courant_snyder',
    term: 'FODO Lattice & Hill’s Envelope',
    symbol: 'β(s)',
    units: 'm',
    eli5: 'Alternating focusing and defocusing magnetic lenses keep protons from drifting off-track—just like optical telescopes.',
    definition: 'Strong-focusing quadrupole lattice solving Hill’s periodic differential equation to bound transverse phase space.',
    tex: '\\frac{d^2 x}{ds^2} + K(s)\\,x = 0, \\quad \\sigma(s) = \\sqrt{\\varepsilon\\,\\beta(s)}',
    cernUse: 'Foundational beam optics geometry across PS, SPS, LHC, and FCC.',
  },
};

export const MODULE_TERM_MAP: Record<string, string[]> = {
  lhc: ['luminosity', 'magnetic_rigidity', 'beta_star', 'stored_energy', 'rf_cavity'],
  'lhc-fill': ['stored_energy', 'luminosity', 'beta_star', 'cryo_he2'],
  'tva-timeline': ['lambda_vacuum', 'ewsb_vev', 'displaced_llp', 'invariant_mass'],
  'tva-intake': ['l1_trigger', 'transverse_momentum', 'invariant_mass', 'displaced_llp'],
  'arc-magnet': ['nb3sn', 'cryo_he2', 'quench', 'magnetic_rigidity'],
  'quantum-zoom': ['transverse_momentum', 'alpha_g', 'isolde_mass', 'add_kk'],
  'mirror-dimensions': ['add_kk', 'invariant_mass', 'transverse_momentum'],
  'displaced-vertex': ['displaced_llp', 'pseudorapidity', 'transverse_momentum', 'l1_trigger'],
  'monopole-arena': ['dirac_monopole', 'magnetic_rigidity', 'nb3sn'],
  'bifrost-rays': ['qgp', 'elliptic_flow', 'transverse_momentum', 'pseudorapidity'],
  neutrinos: ['pmns', 'transverse_momentum', 'invariant_mass'],
  feynman: ['feynman_amp', 'invariant_mass', 'transverse_momentum'],
  'collision-director': ['invariant_mass', 'transverse_momentum', 'pseudorapidity', 'magnetic_rigidity'],
  race: ['rf_cavity', 'magnetic_rigidity', 'stored_energy'],
  optics: ['courant_snyder', 'beta_star', 'magnetic_rigidity'],
  antimatter: ['alpha_g', 'cryo_he2', 'magnetic_rigidity'],
  awake: ['plasma_wakefield', 'rf_cavity', 'transverse_momentum'],
  alice: ['qgp', 'elliptic_flow', 'pseudorapidity'],
  lhcb: ['wilson_rk', 'pseudorapidity', 'cherenkov', 'displaced_llp'],
  crab: ['crab_cavity', 'luminosity', 'beta_star'],
  fcc: ['synchrotron_rad', 'nb3sn', 'magnetic_rigidity', 'luminosity'],
  'sm-3d': ['ewsb_vev', 'lambda_vacuum', 'invariant_mass'],
  isolde: ['isolde_mass', 'magnetic_rigidity', 'beta_star'],
  'rich-medipix': ['cherenkov', 'k_edge', 'pseudorapidity'],
  'cloud-chamber': ['magnetic_rigidity', 'bethe_bloch', 'dirac_monopole'],
  'higgs-ewsb': ['ewsb_vev', 'lambda_vacuum', 'invariant_mass'],
  cosmic: ['ewsb_vev', 'qgp', 'lambda_vacuum'],
  'dark-matter': ['cast_primakoff', 'transverse_momentum', 'displaced_llp'],
  'bragg-peak': ['bethe_bloch', 'k_edge', 'isolde_mass'],
  materials: ['nb3sn', 'cryo_he2', 'k_edge', 'quench'],
  trigger: ['l1_trigger', 'transverse_momentum', 'asimov_sigma'],
  discovery: ['asimov_sigma', 'invariant_mass', 'ams_metric'],
  literature: ['luminosity', 'invariant_mass', 'asimov_sigma', 'wilson_rk'],
  'page-home': ['luminosity', 'magnetic_rigidity', 'invariant_mass', 'l1_trigger'],
  'page-accelerators': ['magnetic_rigidity', 'rf_cavity', 'courant_snyder', 'crab_cavity', 'synchrotron_rad'],
  'page-detectors': ['pseudorapidity', 'transverse_momentum', 'invariant_mass', 'cherenkov'],
  'page-experiments': ['qgp', 'wilson_rk', 'alpha_g', 'isolde_mass', 'pmns'],
  'page-computing': ['l1_trigger', 'luminosity', 'asimov_sigma'],
  'page-engineering': ['cryo_he2', 'quench', 'nb3sn', 'rf_cavity'],
  'page-ai-lab': ['ams_metric', 'l1_trigger', 'transverse_momentum', 'invariant_mass'],
  'page-open-data': ['invariant_mass', 'pseudorapidity', 'transverse_momentum', 'asimov_sigma'],
  'page-projects': ['luminosity', 'synchrotron_rad', 'isolde_mass', 'plasma_wakefield', 'cast_primakoff'],
  'page-methodology': ['luminosity', 'magnetic_rigidity', 'asimov_sigma', 'lambda_vacuum', 'bethe_bloch'],
};

interface TechnicalTermDeckProps {
  contextId: string;
  heading?: string;
  className?: string;
}

export const TechnicalTermDeck: React.FC<TechnicalTermDeckProps> = ({
  contextId,
  heading = 'Technical Terms & Symbol Info Cards',
  className = '',
}) => {
  const eli5Mode = useGlobalStore((s) => s.eli5Mode);
  const termIds = MODULE_TERM_MAP[contextId] || ['luminosity', 'magnetic_rigidity', 'invariant_mass'];
  const entries = termIds.map((id) => TECH_TERMS[id]).filter(Boolean);

  const [selectedId, setSelectedId] = useState<string>(entries[0]?.id || '');
  const [showAll, setShowAll] = useState<boolean>(false);

  // Sync default selected term when switching simulator tab
  useEffect(() => {
    const first = termIds[0];
    if (first && TECH_TERMS[first]) {
      setSelectedId(first);
    }
  }, [contextId, termIds]);

  const activeEntry = TECH_TERMS[selectedId] || entries[0];
  if (!entries.length) return null;

  return (
    <section
      id="tech-glossary-deck"
      aria-label={heading}
      className={`p-4 sm:p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-3 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-cern-cyan text-black border-2 border-black flex items-center justify-center font-mono font-black text-xs shadow-[2px_2px_0px_#000]">
            ⓘ
          </span>
          <div>
            <h3 className="font-mono font-black text-xs sm:text-sm uppercase text-white tracking-wider">
              {heading}
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Click any ⓘ term card below for plain-English intuition, formal definition, units, and KaTeX equation.
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => {
            playTemPadClick();
            setShowAll((v) => !v);
          }}
          className="px-2.5 py-1 bg-canvas-sub hover:bg-canvas-raised text-cern-cyan border-2 border-black font-mono font-bold text-[11px] flex items-center gap-1 shadow-[2px_2px_0px_#000] cursor-pointer"
        >
          <span>{showAll ? 'Single Card View' : `Expand All (${entries.length})`}</span>
          {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Clickable Info Pills */}
      {!showAll && (
        <div className="flex flex-wrap gap-2">
          {entries.map((item) => {
            const isActive = item.id === activeEntry?.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-expanded={isActive}
                onClick={() => {
                  playTemPadClick();
                  setSelectedId(item.id);
                }}
                className={`px-3 py-1.5 border-2 border-black font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cern-cyan text-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
                    : 'bg-canvas-sub text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
                }`}
              >
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{item.term}</span>
                <span className={`px-1 py-0.5 text-[10px] border border-black ${isActive ? 'bg-black text-[#FFE600]' : 'bg-black/60 text-cern-cyan'}`}>
                  {item.symbol}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Expanded Info Cards */}
      <div className={showAll ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : ''}>
        {(showAll ? entries : activeEntry ? [activeEntry] : []).map((card) => (
          <div
            key={card.id}
            className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#000] space-y-2.5 font-mono"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#FFE600] text-black border border-black font-black text-xs">
                  ⓘ {card.symbol}
                </span>
                <h4 className="font-display font-black text-sm sm:text-base text-white">
                  {card.term}
                </h4>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-black text-cern-cyan border border-black font-bold">
                Units: {card.units}
              </span>
            </div>

            {eli5Mode && (
              <div className="p-2.5 bg-amber-300/95 text-black border-2 border-black text-xs font-sans font-bold leading-snug flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{card.eli5}</span>
              </div>
            )}

            <p className="text-xs text-text-secondary font-sans leading-relaxed">
              <strong className="text-white font-mono uppercase text-[11px] mr-1.5">Formal Definition:</strong>
              {card.definition}
            </p>

            {card.tex && (
              <div className="p-2.5 bg-black border-2 border-black">
                <MathFormula tex={card.tex} displayMode />
              </div>
            )}

            <div className="text-[11px] text-emerald-400 font-bold">
              CERN Context: <span className="text-text-secondary font-normal">{card.cernUse}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
