export interface LabEli5AndBetSpec {
  id: string;
  headline: string;
  kidAnalogy: string;
  steps: [
    { label: string; detail: string },
    { label: string; detail: string },
    { label: string; detail: string }
  ];
  myth: string;
  reality: string;
  betQuestion: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  winExplanation: string;
  experimentPrompt: string;
}

export const LAB_ELI5_AND_BETS: Record<string, LabEli5AndBetSpec> = {
  lhc: {
    id: 'lhc',
    headline: 'A 27 km Magnetic Circular Speedway Under Geneva',
    kidAnalogy:
      'Think of swinging a glowing marble on a string super fast: the faster you swing it, the harder you have to pull inward so it stays in a circle. The LHC replaces the string with 1,232 freezing electromagnets pulling protons around a 27 km loop 11,245 times a second!',
    steps: [
      { label: 'Push', detail: 'Radio waves kick protons faster along straight RF cavities.' },
      { label: 'Bend', detail: '8.33 Tesla superconducting dipoles curve them cleanly inside the tunnel.' },
      { label: 'Collide', detail: 'Two opposite beams squeeze and slam head-on inside ATLAS & CMS.' },
    ],
    myth: 'Doubling LHC proton energy makes protons move twice as fast.',
    reality: 'At 450 GeV protons already travel at 99.9998% c! Pushing to 6,800 GeV adds only ~0.0002% speed while boosting relativistic mass-energy 15×.',
    betQuestion: 'If LHC ramps protons from 450 GeV to 6,800 GeV (15× energy), what happens to their speed?',
    options: [
      'Speed becomes 15× faster than light',
      'Speed barely rises (~0.0002% closer to c); relativistic mass γ jumps 15×!',
      'Protons slow down in heavier magnetic fields',
    ],
    correctIndex: 1,
    winExplanation: 'Correct! Nothing with mass crosses light speed c. All extra energy increases Lorentz gamma γ = E/mc² instead of speed!',
    experimentPrompt: 'Drag Beam Energy from 450 GeV to 6,800 GeV and watch β freeze near 1.00000 while B-field & γ climb.',
  },
  'lhc-fill': {
    id: 'lhc-fill',
    headline: 'How Operators Run a 12-Hour Collider Shift Safely',
    kidAnalogy:
      'A 12-hour LHC shift is like refueling a jumbo jet in mid-air: operators carefully fill the ring, gently warm up the magnets, focus the beam tighter with lenses, and finally squeeze the beams slightly apart early on so detectors don’t get blinded!',
    steps: [
      { label: 'Inject & Ramp', detail: 'Fill 2,808 bunches at 450 GeV, then synchronously ramp magnets to 6.8 TeV.' },
      { label: 'Level & Collide', detail: 'Cap brightness early (leveling) so 60 overlaps/crossing stays crisp.' },
      { label: 'Safe Dump', detail: 'When protons burn off, kicker magnets extract the beam in 89 µs.' },
    ],
    myth: 'Detectors always want maximum instantaneous collisions from minute one.',
    reality: 'Peak brightness early creates blurry pile-up (200+ overlapping tracks). Luminosity leveling keeps clarity high for hours!',
    betQuestion: 'Why does the LHC control room deliberately limit collision brightness at the start of a fill?',
    options: [
      'To save electricity during afternoon hours',
      'To cap pile-up μ so detectors can still separate tracks cleanly',
      'Because magnets overheat above 1.5×10³⁴',
    ],
    correctIndex: 1,
    winExplanation: 'Spot on! Luminosity leveling trades peak pile-up for steady high-quality data across the whole shift.',
    experimentPrompt: 'Press Stream 12h Shift and compare the capped flat-top against an unleveled exponential decay.',
  },
  'tva-timeline': {
    id: 'tva-timeline',
    headline: 'Is Our Entire Universe on a Knife-Edge Cliff?',
    kidAnalogy:
      'Imagine a marble sitting in a shallow saucer at the top of a giant cliff. Because the Higgs boson weighs 125.25 GeV and the Top Quark weighs 172.69 GeV, our universe sits safely in a cozy bowl today—yet a super-rare quantum tunnel could drop it over the rim in trillions of years!',
    steps: [
      { label: 'Quantum Sea', detail: 'Virtual Higgs and Top quarks constantly tug on empty space energy.' },
      { label: 'RG Running', detail: 'At ultra-high energies, the Top quark pulls self-coupling λ(μ) downward.' },
      { label: 'Red Line', detail: 'If λ crosses zero below Planck scale, space becomes metastable.' },
    ],
    myth: 'Empty vacuum is dead and unchanging at every energy scale.',
    reality: 'Quantum vacuum couplings shift dynamically with energy scale μ under the Standard Model Renormalization Group!',
    betQuestion: 'Which heavy quark pulls the Higgs potential downward toward vacuum instability at high energy?',
    options: [
      'Up quark (0.002 GeV)',
      'Top quark (172.69 GeV)',
      'Electron (0.0005 GeV)',
    ],
    correctIndex: 1,
    winExplanation: 'Yes! Because the Top quark Yukawa coupling is huge (~1.0), top-quark loops dominate the downward RG slope of λ(μ).',
    experimentPrompt: 'Nudge Top Quark mass up toward 176 GeV and watch branches turn Red Line, then trigger Detonate Time-Charge!',
  },
  'tva-intake': {
    id: 'tva-intake',
    headline: 'Sorting 40 Million Collisions a Second in Real Time',
    kidAnalogy:
      'Imagine standing in front of a waterfall spraying 40 million marbles every second, and your job is to catch ONLY the 1,000 golden ones while tossing the rest away in 25 nanoseconds!',
    steps: [
      { label: '25 ns Clock', detail: 'Bunches cross every 25 nanoseconds inside ATLAS & CMS.' },
      { label: 'L1 Trigger', detail: 'Custom FPGAs keep rare leptons/photons and prune plain jets instantly.' },
      { label: 'Tape Archive', detail: 'Only ~1 kHz of physics gold gets saved to CERN Tier-0 disks.' },
    ],
    myth: 'CERN saves every single collision happening inside the LHC.',
    reality: 'Saving all 40 MHz would fill petabytes every few seconds! Over 99.99% must be pruned in real time.',
    betQuestion: 'Out of 40,000,000 bunch crossings every second, roughly how many can CERN write to permanent storage?',
    options: [
      'About 1,000 per second (~0.0025%)',
      'About 20,000,000 per second (50%)',
      'Every single one (40,000,000/s)',
    ],
    correctIndex: 0,
    winExplanation: 'Nailed it! Only ~1 kHz survives the multi-stage hardware L1 + High-Level Trigger!',
    experimentPrompt: 'Race the 25 ns buffer clock: KEEP crisp Higgs/Z⁰ signatures and PRUNE noisy multijet backgrounds.',
  },
  'arc-magnet': {
    id: 'arc-magnet',
    headline: 'Superconducting Titanium-Niobium Sleeves vs Deep-Ocean Pressure',
    kidAnalogy:
      'Think of carrying 11,850 Amps of lightning without making a spark—while outward magnetic pressure tries to explode the steel collar like water pressure 6 km beneath the ocean!',
    steps: [
      { label: 'Zero Ohms', detail: 'Cooled to 1.9 K, Nb-Ti & Nb₃Sn wires lose all electrical resistance.' },
      { label: 'B² Pressure', detail: 'Raising B from 8.3 T to 16 T quadruples outward magnetic hoop stress.' },
      { label: 'Quench Guard', detail: 'Heating past 2.17 K destroys superfluid cooling and trips energy dumps.' },
    ],
    myth: 'Superconductors can carry infinite magnetic field regardless of temperature.',
    reality: 'Every superconductor obeys a strict 3D critical surface (J, B, T). Pushing Nb-Ti past ~10 T quenches instantaneously!',
    betQuestion: 'Doubling a magnet’s field from 8 T to 16 T multiplies the outward magnetic bursting pressure by how much?',
    options: ['2× pressure', '4× pressure (scales as B²)', 'No change in force'],
    correctIndex: 1,
    winExplanation: 'Right! Magnetic pressure is B²/(2μ₀), so 2× B produces 4× stress—which is why HL-LHC upgrades to Nb₃Sn!',
    experimentPrompt: 'Switch to Nb₃Sn and push B above 12 T, then warm Temperature past 2.2 K to watch quench.',
  },
  'quantum-zoom': {
    id: 'quantum-zoom',
    headline: 'Using TeV Energy as Humanity’s Sharpest Microscope',
    kidAnalogy:
      'Why build a 27 km collider just to see something tiny? Because in quantum physics, tiny wavelengths require huge energy—just like using rapid choppy ripples to feel tiny pebbles in a pond!',
    steps: [
      { label: '10⁻¹⁰ m', detail: 'Electron clouds orbit tiny nuclei at the chemical scale.' },
      { label: '10⁻¹⁵ m', detail: 'Protons & neutrons pack tightly into femtometer cores.' },
      { label: '10⁻¹⁹ m', detail: '13.6 TeV LHC resolves quarks and electroweak bosons!' },
    ],
    myth: 'Optical or electron microscopes could see inside a quark if built with better lenses.',
    reality: 'Light wavelengths are millions of times larger than a proton! Only TeV colliders have λ = ħc/E ~ 10⁻¹⁹ m.',
    betQuestion: 'To resolve structure 10× smaller than today’s LHC limit, how must collider energy change?',
    options: [
      'Divide energy by 10',
      'Multiply collision energy by 10 (λ = ħc / E)',
      'Cool the beam pipe closer to 0 K',
    ],
    correctIndex: 1,
    winExplanation: 'Exact! De Broglie resolution λ = ħc/E means 10× smaller distance requires 10× higher energy.',
    experimentPrompt: 'Slide the scale exponent from +26 down to -19 m and watch wavelength frequency accelerate.',
  },
  'mirror-dimensions': {
    id: 'mirror-dimensions',
    headline: 'Could Gravity Leak Into Hidden Extra Spatial Loops?',
    kidAnalogy:
      'From far away, a garden hose looks like a thin 1D line. Shrink down like an ant and you discover a curled-up circular loop around it! String & ADD models ask if our universe hides tiny µm loops.',
    steps: [
      { label: 'Bulk Loops', detail: 'Gravity alone propagates into n compactified spatial dimensions.' },
      { label: 'True Planck M_D', detail: 'Diluted gravity drops the true quantum gravity scale toward TeV.' },
      { label: 'KK Modes', detail: 'Standing graviton waves appear as evenly spaced heavy resonances.' },
    ],
    myth: 'Gravity is inherently the strongest force because we see planets orbit.',
    reality: 'Gravity is ~10³⁸× weaker than electromagnetism—possibly because its flux spreads into hidden extra dimensions!',
    betQuestion: 'If extra spatial dimensions compactified at radius R = 0.2 mm exist, why does gravity feel so weak to us?',
    options: [
      'Gravity field lines leak out into the extra curled-up dimensions',
      'Photons absorb gravitons inside Earth’s atmosphere',
      'Higgs bosons cancel Newton’s constant G',
    ],
    correctIndex: 0,
    winExplanation: 'Bingo! ADD theory proposes gravity dilutes across (4 + n) dimensions while Standard Model forces stay on our 3D brane.',
    experimentPrompt: 'Change Extra Dimensions (n) and radius R to watch the Calabi-Yau topology & M_D shift.',
  },
  'displaced-vertex': {
    id: 'displaced-vertex',
    headline: 'Catching Ghost Particles That Glitch Mid-Detector',
    kidAnalogy:
      'Normal particles explode right at the bullseye collision point. Long-Lived Particles act like ghosts: they travel invisibly through solid trackers for centimeters or meters before suddenly bursting into tracks!',
    steps: [
      { label: 'Neutral Flight', detail: 'Invisible LLP flies undisturbed through silicon pixel layers.' },
      { label: 'Lorentz Stretch', detail: 'High γ speed dilates proper lifetime cτ into meters in the lab.' },
      { label: 'Glitch Vertex', detail: 'Daughter muons erupt mid-calorimeter pointing back off-axis.' },
    ],
    myth: 'Every particle created at the LHC must leave a track starting at coordinates (0,0,0).',
    reality: 'Weakly coupled neutral Long-Lived Particles travel meters before decaying, creating displaced vertices!',
    betQuestion: 'If an unstable Long-Lived Particle flies near light speed with Lorentz boost γ = 10, how far does it travel before decaying?',
    options: [
      '10× farther than its rest decay length cτ',
      '10× shorter due to length contraction',
      'Always stops right inside the inner pixel layer',
    ],
    correctIndex: 0,
    winExplanation: 'Correct! Time dilation stretches its lab lifetime by γ, pushing the displaced vertex out by L = βγcτ.',
    experimentPrompt: 'Boost LLP Energy to watch the dashed neutral track stretch across ECAL into the Muon Chambers!',
  },
  'monopole-arena': {
    id: 'monopole-arena',
    headline: 'Hunting Pure North-Only Magnets (Dirac Monopoles)',
    kidAnalogy:
      'Snap a fridge magnet in half and you always get two North+South magnets. Paul Dirac showed that if even ONE standalone North magnetic pole exists, it explains why electric charge comes in exact discrete steps!',
    steps: [
      { label: 'Huge Charge', detail: 'A minimum Dirac magnetic charge g_D equals 68.5× the electric charge!' },
      { label: '4,700× Light', detail: 'Ionization scales as (g_D/e)² ≈ 4,700× brighter than a proton.' },
      { label: 'Parabolic Pull', detail: 'Monopoles accelerate straight along B-lines instead of curling sideways.' },
    ],
    myth: 'Magnetic monopoles curve sideways in circles like electrons inside CMS.',
    reality: 'Magnetic force F = g_D·B points ALONG the magnetic field lines, curving monopoles along the solenoid axis!',
    betQuestion: 'Roughly how much brighter does a slow Dirac monopole (1 g_D) ionize atoms compared to a proton (+1 e)?',
    options: ['1× (same brightness)', 'About 68.5× brighter', 'Over 4,700× brighter (~68.5²)'],
    correctIndex: 2,
    winExplanation: 'Winner! Ionization power scales as charge² ≈ 68.5² ≈ 4,700×—scorching clear pits in MoEDAL plastic sheets!',
    experimentPrompt: 'Crank Dirac Charge n·g_D to 3 and watch the blazing orange ionization sheath dwarf the cyan proton track.',
  },
  'bifrost-rays': {
    id: 'bifrost-rays',
    headline: 'Re-Creating the 5-Trillion-Kelvin Big Bang Soup (QGP)',
    kidAnalogy:
      'Slam two heavy Lead nuclei together at 99.99999% c and they melt into Quark-Gluon Plasma 100,000× hotter than the Sun’s core—erupting into rainbow jets whose sideways push must still cancel to zero!',
    steps: [
      { label: 'Deconfinement', detail: 'Protons & neutrons melt into free quarks and gluons for 10⁻²³ s.' },
      { label: 'Perfect Liquid', detail: 'Tiny η/s viscosity lets pressure gradients turn into collective flow.' },
      { label: 'Σp_T = 0', detail: 'Every jet spraying left balances momentum spraying right.' },
    ],
    myth: 'Quark-Gluon Plasma behaves like a hot sparse gas.',
    reality: 'RHIC and ALICE proved QGP behaves as the most nearly frictionless fluid ever measured!',
    betQuestion: 'When ALICE shoots two Lead nuclei head-on at 5.36 TeV, what total sideways momentum Σp_T must all tracks add up to?',
    options: ['Strictly 0.00 GeV/c (conservation)', 'Equals beam energy 5,360 GeV/c', 'Depends on how many quarks escape'],
    correctIndex: 0,
    winExplanation: 'Yes! Incoming nuclei carry zero transverse momentum, so vector sum Σp_T across all particles stays zero!',
    experimentPrompt: 'Lower Centrality to 5% (head-on) and trigger New Pb-Pb Collision to see hundreds of recoil-balanced tracks.',
  },
  neutrinos: {
    id: 'neutrinos',
    headline: 'Phantom Neutrinos Changing Identity Mid-Flight Through Solid Rock',
    kidAnalogy:
      'Imagine throwing a chocolate scoop that mysteriously morphs into strawberry 300 km away, then vanilla, and back to chocolate—because its quantum flavor is made of three mixed mass waves beating out of sync!',
    steps: [
      { label: 'Weak Birth', detail: 'CERN SPS creates a pure beam of Muon Neutrinos (ν_μ).' },
      { label: 'Earth Flight', detail: 'Neutrinos sail 732 km straight through solid rock without stopping.' },
      { label: 'Flavor Flip', detail: 'Mass eigenstates beat out of phase so OPERA detects Tau Neutrinos (ν_τ)!' },
    ],
    myth: 'Neutrinos are massless ghost particles that never change flavor.',
    reality: 'Neutrino oscillation proved neutrinos have tiny nonzero masses (Nobel Prize 2015)!',
    betQuestion: 'What surprising proof did neutrino flavor oscillation give physicists?',
    options: [
      'Neutrinos must travel faster than light',
      'Neutrinos must have small, non-zero masses',
      'Neutrinos carry fractional electric charge',
    ],
    correctIndex: 1,
    winExplanation: 'Correct! Oscillations require mass differences Δm² ≠ 0 so phases evolve at distinct rates!',
    experimentPrompt: 'Switch between CNGS 1.8 GeV and FASERnu 500 GeV to see how high energy stretches oscillation distance.',
  },
  'bragg-peak': {
    id: 'bragg-peak',
    headline: 'Stopping Cancer Radiation With Sub-Millimeter Proton Precision',
    kidAnalogy:
      'Hospital X-rays shoot clean through your whole body like bullets, damaging healthy tissue behind a tumor. Protons act like smart depth charges: they skim lightly through skin, slam all energy at the exact tumor depth, and stop dead!',
    steps: [
      { label: 'Fast Entry', detail: 'Fast 150 MeV protons spend very little time near skin atoms, sparing entrance.' },
      { label: 'Bragg Spike', detail: 'As ions slow down (1/v²), stopping power spikes sharply at exact range.' },
      { label: 'Zero Exit', detail: 'Energy hits zero past the tumor, sparing the spinal cord or brainstem!' },
    ],
    myth: 'All radiation beams deposit maximum energy right where they enter skin.',
    reality: 'Hadron ions obey Bethe-Bloch 1/β² peaking—depositing their sharp Bragg Peak deep inside the tumor!',
    betQuestion: 'Compared to 6 MV hospital X-rays, how much exit dose does a Proton Bragg Peak leave 3 cm behind a tumor?',
    options: ['Nearly 0% (beam stops cleanly)', 'About 45% exit dose', 'Over 80% exit dose'],
    correctIndex: 0,
    winExplanation: 'Yes! CERN accelerator precision directly powers hadron cancer therapy centers across Europe!',
    experimentPrompt: 'Toggle Carbon-12 vs Proton vs X-Ray and hover across 15 cm to read sparing gain.',
  },
  'dark-matter': {
    id: 'dark-matter',
    headline: 'Turning an LHC Test Magnet Into an X-Ray Telescope Aimed at the Sun',
    kidAnalogy:
      'If invisible axions leak from the Sun’s core, filling an LHC magnet bore with exact-density cold helium tunes it like an FM radio dial—converting invisible dark matter straight into measurable X-rays!',
    steps: [
      { label: 'Solar Birth', detail: 'Thermonuclear photons inside the Sun convert into hypothetical axions.' },
      { label: '9 T Bore', detail: 'CAST tracks the Sun using a 9.26 m LHC dipole magnet prototype.' },
      { label: 'Resonance Match', detail: 'Tuning ⁴He buffer gas sets photon mass m_γ = m_a for 100% coherence.' },
    ],
    myth: 'Dark matter searches only happen in underground caves or deep space.',
    reality: 'CERN’s CAST magnet tracks the Sun daily AND ATLAS/CMS search for invisible missing momentum (MET)!',
    betQuestion: 'At LHC colliders, how do ATLAS & CMS detect dark matter candidates that leave zero tracks in any detector layer?',
    options: [
      'By spotting missing transverse momentum imbalance (E_T^miss) opposite a visible jet',
      'By weighing the whole detector magnet before and after collisions',
      'Dark matter stops cleanly inside the silicon pixel layer',
    ],
    correctIndex: 0,
    winExplanation: 'Spot on! Total sideways momentum must equal zero—missing recoil reveals invisible escaping WIMPs!',
    experimentPrompt: 'Match m_γ = m_a in CAST mode, then switch to LHC Mono-Jet Recoil to spin the missing MET arrow.',
  },
  trigger: {
    id: 'trigger',
    headline: 'Throwing Away 99.997% of Data Without Losing Nobel Discoveries',
    kidAnalogy:
      'Think of reading 10,000 books every single second while keeping only 1 bookmark per thousand shelves—using ultra-fast custom microchips that decide in microseconds!',
    steps: [
      { label: 'L1 FPGA', detail: '40 MHz hardware filters down to 100 kHz in < 4 microseconds.' },
      { label: 'HLT Farm', detail: 'Thousands of CPU/GPU nodes reconstruct full tracks to select 1 kHz.' },
      { label: 'Save to Tape', detail: 'Confirmed physics events stream to CERN Tier-0 storage.' },
    ],
    myth: 'Deadtime loss only happens when a hard drive fills up.',
    reality: 'If Level-1 buffers back up during bursts, the detector goes deaf ("deadtime") and misses collisions!',
    betQuestion: 'What happens if the Trigger acceptance threshold is set too low during a high-luminosity run?',
    options: [
      'DAQ buffers overflow and deadtime surges, blinding the detector',
      'Proton beam energy spontaneously drops',
      'Higgs bosons vanish completely',
    ],
    correctIndex: 0,
    winExplanation: 'Right! Balancing trigger bandwidth vs signal efficiency is one of CERN’s toughest engineering feats.',
    experimentPrompt: 'Push collision rate up and tune trigger thresholds to keep Deadtime < 2%!',
  },
  discovery: {
    id: 'discovery',
    headline: 'Why Physicists Wait for 5-Sigma Before Announcing a New Particle',
    kidAnalogy:
      'Flipping 5 heads in a row happens occasionally by pure luck. Flipping 21+ heads in a row has less than a 1-in-3.5-million chance—that’s what CERN’s famous 5σ ("five-sigma") gold standard guarantees!',
    steps: [
      { label: 'Random Noise', detail: 'Background events fluctuate randomly across mass bins like coin flips.' },
      { label: 'Sideband Fit', detail: 'Measure smooth background left & right of a candidate bump.' },
      { label: 'Z₀ ≥ 5σ', detail: 'Only 1-in-3,500,000 fluke odds earns a formal CERN discovery!' },
    ],
    myth: 'Seeing a visible bump in a histogram proves a new particle immediately.',
    reality: 'History is full of 3σ "look-elsewhere" bumps that faded with more data! 5σ protects truth.',
    betQuestion: 'What false-alarm probability corresponds to particle physics’ 5σ discovery threshold?',
    options: ['1 in 20 (5%)', '1 in 1,000 (0.1%)', 'Roughly 1 in 3.5 million (~2.9×10⁻⁷)'],
    correctIndex: 2,
    winExplanation: 'Exact! p ≈ 2.87×10⁻⁷ guarantees no "ghost discovery" fools the global physics community.',
    experimentPrompt: 'Hit Stream Collisions and tighten lepton p_T cuts to break 5.0σ in real time!',
  },
  feynman: {
    id: 'feynman',
    headline: 'Cosmic Bookkeeping Rules Behind Every Subatomic Force',
    kidAnalogy:
      'Every particle interaction works like a cosmic cash register: electric charge, baryon count, and lepton family counts before the crash MUST balance to the exact penny afterward!',
    steps: [
      { label: 'Before', detail: 'Incoming particles bring exact Q, B, and lepton numbers.' },
      { label: 'Force Packet', detail: 'Virtual photons, gluons, or W/Z/H bosons carry momentum across space-time.' },
      { label: 'After', detail: 'If any quantum conservation rule breaks, nature assigns ZERO probability!' },
    ],
    myth: 'Virtual mediator particles are permanent marbles flying between atoms.',
    reality: 'Propagators are mathematical off-shell quantum amplitudes connecting two interaction vertices!',
    betQuestion: 'Why is the decay μ⁻ → e⁻ + γ strictly forbidden in the Standard Model even though electric charge (-1) balances?',
    options: [
      'It violates Electron & Muon Lepton Flavor Conservation (L_μ and L_e)',
      'Photons cannot couple to electrons',
      'Muons are lighter than electrons',
    ],
    correctIndex: 0,
    winExplanation: 'Spot on! Charged-lepton flavor violation (μ → eγ) would rewrite the Standard Model—so CERN hunts for it!',
    experimentPrompt: 'Select μ⁻ → e⁻ + γ (Forbidden) or test your own illegal combos in Custom Sandbox!',
  },
  'sm-3d': {
    id: 'sm-3d',
    headline: 'How the Invisible Higgs Field Gives Matter Its Weight',
    kidAnalogy:
      'Imagine walking across an empty room (effortless = massless photon!) vs wading chest-deep through molasses (heavy = Top quark!). Every particle’s mass is simply how strongly the Higgs field tugs on it!',
    steps: [
      { label: 'Quarks', detail: 'Colored building blocks of protons & neutrons bound by gluons.' },
      { label: 'Leptons', detail: 'Electrons, muons & ghostly neutrinos unaffected by the strong force.' },
      { label: 'Bosons', detail: 'Force carriers + the scalar Higgs setting the mass scale.' },
    ],
    myth: 'Larger physical size makes a particle heavier.',
    reality: 'Fundamental particles are point-like! A Top quark weighs ~340,000× more than an electron purely from stronger Higgs Yukawa drag.',
    betQuestion: 'Which elementary fermion couples strongest to the Higgs boson, weighing almost as much as a Gold atom?',
    options: ['Electron', 'Muon Neutrino', 'Top Quark (~172.7 GeV)'],
    correctIndex: 2,
    winExplanation: 'Correct! Top Yukawa y_t ≈ 0.99 makes the top quark uniquely precious to electroweak physics.',
    experimentPrompt: 'Click Top Quark vs Photon vs Higgs Boson to compare their 3D Yukawa coupling rings!',
  },
  crab: {
    id: 'crab',
    headline: 'Twisting Beam Bunches Sideways for Head-On HL-LHC Collisions',
    kidAnalogy:
      'Normally LHC beams cross at a tiny scissors angle so they don’t crash too early—but tilted bunches barely graze! RF Crab Cavities tilt each bunch like a sideways-scuttling crab right before IP1 & IP5 so they smack flat head-on!',
    steps: [
      { label: 'Piwinski Loss', detail: 'Crossing angle reduces overlap between long 7.5 cm proton bunches.' },
      { label: 'Crab Kick', detail: 'Transverse RF waves push the bunch head one way and tail the other.' },
      { label: 'Luminosity Boost', detail: 'Full overlap restores brightness toward 7.5 × 10³⁴ cm⁻²s⁻¹!' },
    ],
    myth: 'Beams can simply cross at 0° without crab cavities.',
    reality: 'At HL-LHC spacing (25 ns), 0° causes unwanted long-range parasitic beam-beam collisions before the IP!',
    betQuestion: 'Why does the HL-LHC install superconducting Crab Cavities on either side of ATLAS and CMS?',
    options: [
      'To rotate each proton bunch sideways so tilted crossings overlap 100% head-on',
      'To accelerate protons to 100 TeV',
      'To cool helium down to 0.5 K',
    ],
    correctIndex: 0,
    winExplanation: 'Bingo! Zero-angle head-on overlap without parasitic pre-collisions—maximizing discovery reach!',
    experimentPrompt: 'Drop Crab Voltage to 0 MV to watch Geometric Factor F collapse, then restore 3.4 MV!',
  },
  awake: {
    id: 'awake',
    headline: 'Surfing a 10-Meter Rubidium Plasma Wave at 1,000× RF Gradient',
    kidAnalogy:
      'Normal copper/niobium accelerators spark if electric fields get too strong. Instead, AWAKE shoots protons through ionized Rubidium gas to kick up giant plasma ocean waves—letting tiny electron bunches surf 10 meters to multi-GeV speeds!',
    steps: [
      { label: 'Laser Plasma', detail: 'Terawatt laser ionizes a 10 m Rubidium vapor column in one pulse.' },
      { label: 'Self-Modulate', detail: '400 GeV SPS proton beam breaks into resonant microbunches.' },
      { label: 'Electron Surf', detail: 'Injected electrons ride ~1 GV/m plasma wakefield slopes!' },
    ],
    myth: 'Future compact colliders must use 100-kilometer niobium RF tunnels.',
    reality: 'Plasma wakefield gradients reach 1–10+ GV/m—up to 100× higher than conventional RF cavities!',
    betQuestion: 'Why can ionized plasma sustain electric accelerating fields ~50× stronger than solid metal RF cavities?',
    options: [
      'Plasma is already ionized—there are no solid metal walls left to melt or spark!',
      'Plasma operates at absolute zero Kelvin',
      'Rubidium magnets multiply electric charge',
    ],
    correctIndex: 0,
    winExplanation: 'Yes! Because plasma is already an ionized sea, electrical breakdown isn’t a ceiling!',
    experimentPrompt: 'Set Injection Phase to 270° vs 90° to switch between 2 GeV acceleration and deceleration!',
  },
  antimatter: {
    id: 'antimatter',
    headline: 'Does Antimatter Fall Down or Up in Earth’s Gravity?',
    kidAnalogy:
      'Scientists at CERN’s ALPHA-g catch ~100 icy-cold antihydrogen atoms inside a vertical magnetic bottle, gently turn down the magnetic walls, and watch whether antimatter falls DOWN just like an apple—or floats UP!',
    steps: [
      { label: 'Antiprotons', detail: 'CERN’s AD & ELENA decelerators slow antiprotons down to keV.' },
      { label: '0.5 K Bottle', detail: 'Cold antihydrogen floats inside an octupole magnetic trap.' },
      { label: 'Drop Test', detail: 'As field ramps down, annihilation flashes reveal downward g_anti ≈ +1g!' },
    ],
    myth: 'Antimatter pushes upward with "antigravity" when dropped.',
    reality: 'In 2023 CERN’s ALPHA-g observed for the first time that antimatter falls downward consistent with +1g!',
    betQuestion: 'When CERN’s ALPHA-g gently turned down its vertical magnetic trap on antihydrogen atoms in 2023, which way did they fall?',
    options: ['Upward (antigravity -1g)', 'Downward consistent with Earth’s normal +1g gravity', 'Hovered stationary forever'],
    correctIndex: 1,
    winExplanation: 'Right! ALPHA-g confirmed Einstein’s Weak Equivalence Principle holds for antimatter (~0.75±0.29g)!',
    experimentPrompt: 'Ramp down the 3D Penning trap coils and check Bottom vs Top annihilation ratios!',
  },
  engineering: {
    id: 'engineering',
    headline: '1.9 K Superfluid Helium: Colder Than Deep Space',
    kidAnalogy:
      'At room temperature, helium is balloon gas. Cool it to 4.2 K and it boils like water. Cool it past 2.17 K and it transforms into quantum Superfluid He-II—flowing through microscopic cracks with zero friction and whisking heat away 100,000× better than copper!',
    steps: [
      { label: 'Nb-Ti Coils', detail: '11,850 A runs cleanly with zero resistance inside 1,232 dipoles.' },
      { label: 'λ-Point (2.17 K)', detail: 'Below 2.17 K, quantized vortices unlock frictionless heat siphoning.' },
      { label: 'Ultra-Vacuum', detail: 'Cryopumping freezes residual gas thinner than interplanetary space!' },
    ],
    myth: 'LHC cold magnets sit at normal boiling liquid helium temperature (4.2 K).',
    reality: 'CERN operates at 1.9 K—colder than the 2.7 K cosmic microwave background—strictly to stay inside Superfluid He-II!',
    betQuestion: 'Why does the LHC chill magnets down to 1.9 K instead of stopping at normal boiling liquid helium (4.2 K)?',
    options: [
      'Below 2.17 K (λ-point), Helium enters quantum Superfluid He-II with ~100,000× copper thermal conductivity',
      'At 4.2 K liquid helium turns solid and cracks pipes',
      'Superconductivity never works above 2.0 K in any metal',
    ],
    correctIndex: 0,
    winExplanation: 'Exact! Boiling bubbles at 4.2 K insulate coils; He-II at 1.9 K siphons micro-heat instantly with zero bubbles!',
    experimentPrompt: 'Drag Cryostat Bath Temp above 2.17 K on /engineering to watch both 3D Cryostat & He-II visualizer quench!',
  },
  'collision-director': {
    id: 'collision-director',
    headline: 'Directing Real-Time Proton Smash-Ups Inside a 4-Layer Detector',
    kidAnalogy:
      'Think of playing film director inside an invisible glass stadium: smash protons at 13.6 TeV, then freeze time and peel away the steel calorimeters or spin the 3D camera around exploding jets!',
    steps: [
      { label: 'Bunch Crossing', detail: 'Counter-rotating proton packets squeeze to micrometer spots.' },
      { label: 'Energy Deposition', detail: 'Photons/electrons stop in ECAL; quarks shower in HCAL; muons punch outer.' },
      { label: 'Track Fit', detail: 'Bending curvature measures each particle’s exact momentum.' },
    ],
    myth: 'Particles actually have bright glowing colored lines trailing behind them in real life.',
    reality: 'Subatomic tracks are invisible—computers reconstruct faint electronic dots inside silicon and gas layers!',
    betQuestion: 'Which particle cleanly punches through BOTH ECAL and HCAL iron walls to reach the outermost spectrometer chambers?',
    options: ['Electron', 'Photon', 'Muon'],
    correctIndex: 2,
    winExplanation: 'Correct! Muons weigh ~207× more than electrons, losing minimal bremsstrahlung energy in calorimeters.',
    experimentPrompt: 'Trigger Higgs → 4l vs Di-jet events in 3D and orbit the spectrometer shell!',
  },
  race: {
    id: 'race',
    headline: 'Why Even 6.8 TeV Cannot Beat a Flashlight Beam Around Geneva',
    kidAnalogy:
      'Imagine putting rocket engines on a bowling ball already rolling at 99.9999% of speed limit c: pushing harder stops making it noticeably faster and instead stretches its internal clock!',
    steps: [
      { label: 'Linac4 (160 MeV)', detail: 'Protons start at 51.9% speed of light.' },
      { label: 'PS & SPS', detail: 'Protons accelerate to 99.93% then 99.9998% c.' },
      { label: 'LHC (6.8 TeV)', detail: '99.9999991% c — finishing 1 lap just ~2.5 mm behind a photon!' },
    ],
    myth: 'CERN accelerators break Einstein’s cosmic speed limit c = 299,792,458 m/s.',
    reality: 'No massive particle ever crosses c; all extra energy goes into relativistic momentum γmv!',
    betQuestion: 'After 1 full 26.66 km lap around the LHC, how far behind a laser photon is a 6.8 TeV proton?',
    options: ['~2.5 millimeters behind', '~2.5 kilometers behind', 'Proton wins by 5 meters'],
    correctIndex: 0,
    winExplanation: 'Amazing right?! Just ~2.5 mm over a 26.66 km marathon!',
    experimentPrompt: 'Slide Custom Proton Energy from 1 GeV up to 6,800 GeV and watch β freeze near 1.',
  },
  optics: {
    id: 'optics',
    headline: 'Glass Lenses for Light = Magnetic Quadrupoles for Protons',
    kidAnalogy:
      'Light beams spread out unless you pass them through curved eyeglass lenses. Proton beams spread out too—so CERN uses alternating North/South quadrupole magnets (FODO cells) to pinch beams narrower than a human hair!',
    steps: [
      { label: 'Focus X / Defocus Y', detail: 'One quadrupole pinches horizontally while stretching vertically.' },
      { label: 'Flip Polarity', detail: 'Rotated 90°, the next quadrupole pinches vertically!' },
      { label: 'Net Squeeze (β*)', detail: 'Together they squeeze both planes sharply at ATLAS & CMS.' },
    ],
    myth: 'A single magnet can focus a charged beam in both X and Y planes simultaneously.',
    reality: 'Maxwell’s equations forbid simultaneous 2D focusing in static fields—so alternating FODO focusing is mandatory!',
    betQuestion: 'Why does shrinking β* ("beta-star") at an Interaction Point skyrocket collision rates?',
    options: [
      'It squeezes protons into a tinier cross-section, boosting density²',
      'It heats the niobium coils',
      'It doubles proton electric charge',
    ],
    correctIndex: 0,
    winExplanation: 'Exact! Luminosity L scales inversely with β*—tighter waist means vastly more head-on crashes!',
    experimentPrompt: 'Sweep Quadrupole Gradient k₁ and Drift Length to spot stable vs unstable betatron tunes!',
  },
  fcc: {
    id: 'fcc',
    headline: 'Dreaming Beyond LHC: A 91 km Super-Ring for 100 TeV',
    kidAnalogy:
      'To turn tighter corners at 8× higher energy without protons spinning out of the track, you need BOTH stronger magnets (16 T Nb₃Sn!) AND a ring more than 3× wider around Geneva!',
    steps: [
      { label: 'FCC-ee', detail: 'Phase 1 collides ultra-clean electrons & positrons as a Higgs/Z⁰ factory.' },
      { label: '16 T Dipoles', detail: 'Next-gen Nb₃Sn bends 50 TeV beams inside the 91 km tunnel.' },
      { label: '100 TeV Reach', detail: 'Phase 2 FCC-hh probes 10× heavier new particles!' },
    ],
    myth: 'Any energy collider fits inside the existing 27 km tunnel if we just crank RF power.',
    reality: 'Magnetic bending scales linearly with radius and field (p = 0.3 B·ρ)—so 100 TeV demands ~91 km at ~16 T!',
    betQuestion: 'To bump collision energy from 13.6 TeV (LHC) toward 100 TeV (FCC-hh), why build a ~91 km tunnel AND 16 T magnets?',
    options: [
      'Because bending rigidity p = 0.3 B·R scales with both magnetic field B and radius R',
      'So workers have longer underground bike paths',
      'Because protons decay faster in small rings',
    ],
    correctIndex: 0,
    winExplanation: 'Correct! Doubling B (~8.3 T → 16 T) and ~3.4× circumference cleanly scales momentum ~7×!',
    experimentPrompt: 'Dial Energy up to 100 TeV and compare required Dipole Field B vs tunnel circumference!',
  },
  alice: {
    id: 'alice',
    headline: 'Measuring an Almond-Shaped Quark-Gluon Fireball via Elliptic Flow',
    kidAnalogy:
      'Squeeze a water balloon sideways—water squirts hardest out the flat wide sides! When two Lead nuclei clip off-center, the almond-shaped fireball pushes particles strongest along the short X-axis (v₂ flow)!',
    steps: [
      { label: 'Impact b', detail: 'Off-center Pb-Pb crash forms an asymmetric almond overlap zone.' },
      { label: 'Pressure Push', detail: 'Steeper pressure gradient along narrow X squirts more hadrons horizontally.' },
      { label: 'Low η/s', detail: 'Strong v₂ proves near-zero shear viscosity!' },
    ],
    myth: 'Central head-on collisions produce the largest elliptic anisotropy v₂.',
    reality: 'Head-on crashes are symmetric circles (v₂ ≈ 0); mid-peripheral crashes (~7 fm impact parameter) peak in v₂!',
    betQuestion: 'Which Lead-Lead collision geometry produces the strongest almond elliptic flow v₂?',
    options: [
      'Exact dead-center head-on (b = 0 fm)',
      'Mid-peripheral off-center overlap (b ≈ 7–8 fm)',
      'Two nuclei missing completely',
    ],
    correctIndex: 1,
    winExplanation: 'Spot on! Dead-center overlaps are circular; off-center ~7.5 fm gives max almond eccentricity!',
    experimentPrompt: 'Set Impact Parameter b = 7.5 fm vs 1.0 fm and watch the polar dN/dφ peanut shape grow!',
  },
  lhcb: {
    id: 'lhcb',
    headline: 'Why Matter Survived Antimatter After the Big Bang (CP Violation)',
    kidAnalogy:
      'The Big Bang should have made 50% matter and 50% antimatter that canceled completely into empty light. LHCb catches tiny 1-in-a-billion asymmetry tilts in Beauty quarks (B⁰ mesons) showing why matter won!',
    steps: [
      { label: 'Forward Cone', detail: 'LHCb sits like a one-sided camera catching forward B-hadrons.' },
      { label: 'Matter/Anti Flip', detail: 'B⁰ and B̄⁰ mesons oscillate back and forth trillions of times/sec.' },
      { label: 'CKM Asymmetry', detail: 'Decays favor matter slightly over antimatter (CP violation)!' },
    ],
    myth: 'Particles and antiparticles always decay at identical rates in every channel.',
    reality: 'Precision decays in K, B, and D mesons show measurable CP asymmetry!',
    betQuestion: 'What cosmic mystery is CERN’s LHCb experiment primarily engineered to help solve?',
    options: [
      'Why our universe is made of matter instead of equal annihilated antimatter',
      'How fast sound waves travel in deep ocean trenches',
      'Counting moons around Jupiter',
    ],
    correctIndex: 0,
    winExplanation: 'Yes! Measuring tiny CKM asymmetries and rare B-decays tests why matter survived!',
    experimentPrompt: 'Adjust CP Phase & Mixing Frequency to watch matter vs antimatter decay waves separate!',
  },
  isolde: {
    id: 'isolde',
    headline: 'Synthesizing Lifesaving Medical Cancer Isotopes From Heavy Targets',
    kidAnalogy:
      'Shoot 1.4 GeV protons at a hot ceramic target and it splashes exotic nuclei never seen in nature. ISOLDE uses precision bending magnets like a coin sorter to pluck out pure cancer-fighting isotopes like Terbium-161!',
    steps: [
      { label: 'Spallation', detail: 'PS Booster protons fragment heavy uranium/tantalum targets.' },
      { label: 'Laser Ionize', detail: 'Laser pulses pick exact atomic electron shells selectively.' },
      { label: 'Mass Sort', detail: 'Dipole magnets isolate A/q purity to parts-per-million!' },
    ],
    myth: 'CERN research only creates exotic high-energy particles with no daily medical use.',
    reality: 'CERN-MEDICIS supplies clinical radiometals like ¹⁶¹Tb & ¹⁴⁹Tb for targeted tumor therapies!',
    betQuestion: 'How does ISOLDE separate two nuclei that weigh almost identically except for tiny mass-to-charge A/q differences?',
    options: [
      'Magnetic rigidity bending inside a calibrated dipole spectrometer',
      'Spinning a mechanical centrifuge',
      'Cooling them with fans',
    ],
    correctIndex: 0,
    winExplanation: 'Exact! Heavier ions bend less in fixed B-field, letting slit collimators pluck pure isotopes!',
    experimentPrompt: 'Select Terbium-161 (CERN-MEDICIS) and hit Auto-Lock Dipole!',
  },
  'rich-medipix': {
    id: 'rich-medipix',
    headline: 'Sonic Booms of Light & Color X-Ray Medical Chips',
    kidAnalogy:
      'Just like supersonic jets make shockwaves in air, ultra-fast particles sailing through gas faster than light slows inside that gas create cones of blue Cherenkov glow—and CERN’s Medipix pixels spun directly into 3D color hospital X-ray cameras!',
    steps: [
      { label: 'Exceed c/n', detail: 'If particle speed β > 1/n, it outruns light in gas and shines a ring!' },
      { label: 'Measure θ_C', detail: 'Ring radius reveals particle velocity, separating pions from kaons.' },
      { label: 'Medipix Spin-Off', detail: 'Counting single X-ray energies created MARS color CT scanners!' },
    ],
    myth: 'Cherenkov radiation breaks Einstein’s vacuum light speed c.',
    reality: 'Nothing outruns vacuum light c—particles only outrun light slowed down inside glass, water, or C₄F₁₀ gas (c/n)!',
    betQuestion: 'Below ~9 GeV/c inside LHCb’s C₄F₁₀ radiator gas, why do Pions glow a Cherenkov ring while heavier Kaons stay dark?',
    options: [
      'Lighter Pions move faster than local light speed c/n, while heavier Kaons lag below threshold',
      'Kaons absorb all blue light inside mirrors',
      'Kaons have zero electric charge',
    ],
    correctIndex: 0,
    winExplanation: 'Winner! Same momentum gives lighter pions higher velocity β—crossing β > 1/n cleanly!',
    experimentPrompt: 'Set Beam Momentum to 6 GeV/c in C₄F₁₀ gas to watch Pion rings shine while Kaons disappear!',
  },
  'cloud-chamber': {
    id: 'cloud-chamber',
    headline: 'Seeing Invisible Cosmic Rays Leave Vapor Trails in Alcohol Fog',
    kidAnalogy:
      'Cool rubbing alcohol air so cold it wants to rain—the instant an invisible cosmic muon zips through, it knocks electrons off gas atoms, triggering tiny white cloud droplets tracing its curved path!',
    steps: [
      { label: 'Supersaturate', detail: 'Warm alcohol vapor above cools over dry-ice cold plate below.' },
      { label: 'Ionize Air', detail: 'Charged particles strip electrons, forming condensation seeds.' },
      { label: 'Spot Charge', detail: 'Oppositely curved spirals reveal +e vs -e in magnetic fields!' },
    ],
    myth: 'You need a billion-dollar LHC cavern to watch real subatomic particle tracks.',
    reality: 'A simple cooled cloud chamber lets anyone watch live cosmic muons & alpha particles with bare eyes!',
    betQuestion: 'When an invisible neutral photon converts into an electron-positron pair (γ → e⁺ + e⁻) in a magnetic field, what do tracks look like?',
    options: [
      'A V-shape of two tracks curving in OPPOSITE directions from empty space',
      'One straight thick line starting at the wall',
      'Zero tracks ever appear',
    ],
    correctIndex: 0,
    winExplanation: 'Correct! Neutral γ leaves zero incoming trail, then +e and -e curl opposite ways under Lorentz v × B!',
    experimentPrompt: 'Select Pair Creation and boost Magnetic Field T to tighten opposite e⁺/e⁻ spirals!',
  },
  materials: {
    id: 'materials',
    headline: 'Why Detectors Grow Heavy Transparent Lead-Glass Crystals & Nb₃Sn Wires',
    kidAnalogy:
      'To weigh a 100 GeV photon completely without it slipping away, CMS packs 75,848 dense clear Lead Tungstate crystals—denser than iron yet crystal clear as glass—that flash blue light in nanoseconds!',
    steps: [
      { label: 'PbWO₄ Crystals', detail: '8.28 g/cm³ density stops electromagnetic showers inside 23 cm.' },
      { label: 'Fast Scintillation', detail: '99% light collects inside 25 ns to beat next LHC crossing.' },
      { label: 'Nb₃Sn Upgrades', detail: 'Replaces Nb-Ti to push future magnets toward 16 Tesla.' },
    ],
    myth: 'Lead shields must always be dark opaque gray metal.',
    reality: 'Lead Tungstate (PbWO₄) crystals are heavier than stainless steel yet optically transparent!',
    betQuestion: 'Why did CMS choose Lead Tungstate (PbWO₄) crystals weighing 8.28 g/cm³ for its ECAL?',
    options: [
      'Short radiation length packs full TeV photon showers into compact clear crystals',
      'They glow brightly under natural sunlight',
      'They are soft like plastic foam',
    ],
    correctIndex: 0,
    winExplanation: 'Yes! Compact 23 cm crystals resolve diphoton Higgs peaks with world-leading <1% precision!',
    experimentPrompt: 'Inspect crystal lattice geometry and radiation lengths in the 3D Material Viewer!',
  },
  'higgs-ewsb': {
    id: 'higgs-ewsb',
    headline: 'Why Space Chose a "Mexican Hat" Bottom State After the Big Bang',
    kidAnalogy:
      'Think of balancing a marble dead-center on a pointed sombrero peak at high heat—the instant the universe cooled, the marble rolled into the circular brim v = 246 GeV, giving W/Z bosons and electrons their mass!',
    steps: [
      { label: 'High-T Symmetry', detail: 'Right after the Big Bang, v = 0 and all particles flew massless.' },
      { label: 'Roll to Brim', detail: 'At ~10⁻¹¹ s, the Higgs field settled into v = 246 GeV trough.' },
      { label: 'Radial Excitation', detail: 'Shaking the marble uphill & down creates the 125 GeV Higgs boson!' },
    ],
    myth: 'The Higgs boson creates mass directly; rather the all-pervading Higgs FIELD gives mass.',
    reality: 'Particles gain mass dragging on the background Higgs VEV v = 246 GeV; the Higgs boson is a quantum ripple of that field!',
    betQuestion: 'What happens to W and Z bosons if the Higgs field vacuum expectation value v dropped to zero?',
    options: [
      'W, Z bosons and quarks/leptons become completely massless (m = 0)',
      'Everything turns into pure dark energy',
      'Photons gain 125 GeV mass',
    ],
    correctIndex: 0,
    winExplanation: 'Spot on! Every fermion and electroweak gauge boson mass vanishes cleanly without EWSB v = 246 GeV!',
    experimentPrompt: 'Adjust Early Universe Temperature T_GeV to watch the Mexican Hat shift from broken brim to symmetric peak!',
  },
  cosmic: {
    id: 'cosmic',
    headline: 'Rewinding Time Back to 10⁻¹¹ Seconds After the Big Bang',
    kidAnalogy:
      'Every time you boost LHC collision energy, you focus a cosmic time machine closer to the Big Bang: LHC energies re-create exact temperatures space had just ten-trillionths of a second after birth!',
    steps: [
      { label: '10⁻¹¹ s (EWSB)', detail: 'Higgs field turns on at T ≈ 10¹⁵ K (13.6 TeV LHC frontier).' },
      { label: '10⁻⁵ s (QGP)', detail: 'Free quarks condense into first protons & neutrons inside ALICE.' },
      { label: '380,000 yrs', detail: 'Atoms capture electrons and first Cosmic Microwave light escapes.' },
    ],
    myth: 'Colliders invent strange particles that never existed in nature.',
    reality: 'CERN re-creates the exact natural particle soup of the first trillionth of a second after Creation!',
    betQuestion: 'Roughly how old was the Universe when space cooled through LHC’s ~100–1000 GeV Electroweak transition?',
    options: ['Around 10⁻¹¹ seconds (ten trillionths of a second)', '1 billion years', '380,000 years'],
    correctIndex: 0,
    winExplanation: 'Correct! Just picoseconds after the Big Bang—captured live in 27 km beneath Geneva!',
    experimentPrompt: 'Drag the Cosmic Epoch slider back toward t = 10⁻¹² s to watch Temperature & Energy skyrocket!',
  },
  literature: {
    id: 'literature',
    headline: 'Connecting Interactive Simulations Directly to Peer-Reviewed Physics Papers',
    kidAnalogy:
      'Think of this tab as CERN’s scientific passport desk: every curve you just played with links straight to live arXiv papers, HEPData tables, and official CERN Technical Design Reports!',
    steps: [
      { label: 'Live arXiv', detail: 'Query real preprints straight from Cornell’s arXiv API.' },
      { label: 'DOI Trace', detail: 'Every simulator equation links directly to its published benchmark.' },
      { label: 'Export Code', detail: 'Download .py / .ipynb scripts above to reproduce plots locally.' },
    ],
    myth: 'Educational animations cannot be verified against real published experimental data.',
    reality: 'Every closed-form curve and parameter in CERN-X maps to an auditable DOI and offline Python/C++ kernel!',
    betQuestion: 'How are all CERN-X constants and curves audited against real publications?',
    options: [
      'Via cryptographic manifest verification, Vitest physics bounds & PDG/CERN DOIs',
      'Hand-drawn rough guesses',
      'Random coin flips on every page load',
    ],
    correctIndex: 0,
    winExplanation: 'Spot on! Check /methodology or click any Provenance badge to trace every single formula!',
    experimentPrompt: 'Search live ATLAS/CMS preprints right below or jump to /methodology for formal KaTeX proofs.',
  },
};


const DEFAULT_FALLBACK: LabEli5AndBetSpec = {
  id: 'default',
  headline: 'Inside CERN’s Real-Time Physics Discovery Engine',
  kidAnalogy:
    'Think of CERN’s experiments as giant 3D digital cameras coupled to supercomputers: accelerating particles close to light speed, smashing them at precise crosshairs, and reading conservation laws to spot brand-new physics!',
  steps: [
    { label: 'Accelerate', detail: 'RF waves pump energy into beams up to multi-TeV scales.' },
    { label: 'Steer & Collide', detail: 'Superconducting magnets squeeze beams into tiny interaction points.' },
    { label: 'Reconstruct', detail: 'Calorimeters, trackers & triggers turn flashes into precision measurements.' },
  ],
  myth: 'Simulators on educational portals just play pre-recorded cartoon loops.',
  reality: 'Every visualization on CERN-X calculates live SI/PDG observables using exact relativistic & quantum laws!',
  betQuestion: 'What core engineering pair makes modern TeV colliders like the LHC physically possible?',
  options: [
    'Superconducting electromagnets + 400 MHz RF acceleration cavities',
    'Permanent iron bar magnets + DC battery banks',
    'Hydraulic water turbines spinning proton rings',
  ],
  correctIndex: 0,
  winExplanation: 'Spot on! High-field superconducting bending magnets and precision RF acceleration work in tight sync!',
  experimentPrompt: 'Adjust the interactive sliders below and watch every readout, equation, and visualization update live.',
};

export function getLabEli5AndBet(moduleId?: string | null): LabEli5AndBetSpec {
  if (!moduleId) return DEFAULT_FALLBACK;
  return LAB_ELI5_AND_BETS[moduleId] || DEFAULT_FALLBACK;
}
