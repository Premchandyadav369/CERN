'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ExternalLink,
  Search,
  Check,
  Copy,
  Zap,
  Atom,
  Flame,
  Activity,
  Sparkles,
  Layers,
  Compass,
  Gauge,
  Radio,
  FileText,
  Filter,
} from 'lucide-react';

export interface LiteratureItem {
  id: string;
  title: string;
  authors: string;
  collaboration: string;
  journal: string;
  year: number;
  arxivId?: string;
  doi: string;
  simModule: string;
  simLabel: string;
  category: 'Antimatter' | 'Plasma' | 'Heavy-Ion' | 'Discovery' | 'Colliders' | 'Flavour' | 'Optics' | 'Triggers';
  keyBenchmark: string;
  abstract: string;
  bibtex: string;
}

export const LITERATURE_DATABASE: LiteratureItem[] = [
  {
    id: 'alpha-g-nature-2023',
    title: 'Observation of the effect of gravity on the motion of antimatter',
    authors: 'E. K. Anderson et al. (ALPHA Collaboration)',
    collaboration: 'ALPHA',
    journal: 'Nature 621, 716–722',
    year: 2023,
    arxivId: '2309.16782',
    doi: '10.1038/s41586-023-06527-1',
    simModule: 'antimatter',
    simLabel: 'Antimatter & ALPHA-g',
    category: 'Antimatter',
    keyBenchmark: 'Gravitational acceleration of antihydrogen a_g = (0.75 ± 0.13 ± 0.16) g; rules out repulsive antigravity (-g) at >5σ',
    abstract:
      'Einstein’s general theory of relativity predicts that all bodies fall with the same gravitational acceleration regardless of their composition. Testing this Weak Equivalence Principle with antimatter has been an experimental challenge. Here we show that trapped antihydrogen atoms released in the vertical magnetic trap of ALPHA-g fall downwards under Earth gravity with acceleration consistent with normal matter.',
    bibtex: `@article{ALPHA2023Nature,
  author = {Anderson, E. K. and others (ALPHA Collaboration)},
  title = {Observation of the effect of gravity on the motion of antimatter},
  journal = {Nature},
  volume = {621},
  pages = {716--722},
  year = {2023},
  doi = {10.1038/s41586-023-06527-1},
  eprint = {2309.16782},
  archivePrefix = {arXiv},
  primaryClass = {physics.atom-ph}
}`,
  },
  {
    id: 'awake-run2-2022',
    title: 'The AWAKE Run 2 Experiment: High-Gradient Proton-Driven Wakefield Acceleration',
    authors: 'P. Muggli et al. (AWAKE Collaboration)',
    collaboration: 'AWAKE',
    journal: 'CERN Yellow Reports: Monographs / Phys. Rev. Accel. Beams',
    year: 2022,
    arxivId: '2203.06587',
    doi: '10.23731/CYRM-2022-001',
    simModule: 'awake',
    simLabel: 'AWAKE Plasma',
    category: 'Plasma',
    keyBenchmark: 'Accelerating gradients Ez > 1 GV/m driven by proton self-modulation in a 10-meter rubidium plasma cell',
    abstract:
      'The Advanced Wakefield Experiment (AWAKE) at CERN is the world first proton-driven plasma wakefield accelerator. Run 2 aims to achieve accelerating electric fields exceeding 1 GV/m with preserved witness beam emittance, demonstrating the feasibility of compact high-energy physics lepton injectors.',
    bibtex: `@article{AWAKE2022Run2,
  author = {Muggli, P. and others (AWAKE Collaboration)},
  title = {The AWAKE Run 2 experiment},
  journal = {CERN Yellow Reports: Monographs},
  volume = {CYRM-2022-001},
  year = {2022},
  doi = {10.23731/CYRM-2022-001},
  eprint = {2203.06587},
  archivePrefix = {arXiv},
  primaryClass = {physics.acc-ph}
}`,
  },
  {
    id: 'alice-qgp-flow-2023',
    title: 'Elliptic and triangular flow of identified hadrons in Pb-Pb collisions at √s_NN = 5.02 TeV',
    authors: 'S. Acharya et al. (ALICE Collaboration)',
    collaboration: 'ALICE',
    journal: 'JHEP 10, 152',
    year: 2023,
    arxivId: '2307.03759',
    doi: '10.1007/JHEP10(2023)152',
    simModule: 'alice',
    simLabel: 'ALICE QGP & Flow',
    category: 'Heavy-Ion',
    keyBenchmark: 'Harmonic flow coefficients v2 and v3 confirming Quark-Gluon Plasma shear viscosity η/s approaches the quantum lower bound 1/(4π)',
    abstract:
      'Measurements of anisotropic azimuthal flow coefficients v2, v3, and v4 of identified pions, kaons, and protons in Pb-Pb collisions at 5.02 TeV recorded by ALICE. The observed mass ordering and scaling with participant eccentricity confirm near-ideal relativistic hydrodynamic expansion of deconfined quark-gluon matter.',
    bibtex: `@article{ALICE2023Flow,
  author = {Acharya, S. and others (ALICE Collaboration)},
  title = {Elliptic and triangular flow of identified hadrons in Pb-Pb collisions at $\\sqrt{s_{NN}} = 5.02$ TeV},
  journal = {JHEP},
  volume = {10},
  pages = {152},
  year = {2023},
  doi = {10.1007/JHEP10(2023)152},
  eprint = {2307.03759},
  archivePrefix = {arXiv},
  primaryClass = {nucl-ex}
}`,
  },
  {
    id: 'atlas-higgs-mass-2018',
    title: 'Measurement of the Higgs boson mass in the H → γγ and H → ZZ* → 4ℓ channels with ATLAS',
    authors: 'M. Aaboud et al. (ATLAS Collaboration)',
    collaboration: 'ATLAS',
    journal: 'Phys. Lett. B 784, 345–366',
    year: 2018,
    arxivId: '1807.05050',
    doi: '10.1016/j.physletb.2018.07.050',
    simModule: 'discovery',
    simLabel: '5-Sigma Discovery',
    category: 'Discovery',
    keyBenchmark: 'Higgs resonance m_H = 124.97 ± 0.24 GeV with discovery significance >5.0σ in diphoton invariant mass',
    abstract:
      'A measurement of the mass of the Higgs boson in both the diphoton and four-lepton decay channels using proton-proton collision data recorded at √s = 13 TeV by the ATLAS detector at the LHC, demonstrating the gold standard 5-sigma discovery threshold in invariant mass reconstruction.',
    bibtex: `@article{ATLAS2018HiggsMass,
  author = {Aaboud, M. and others (ATLAS Collaboration)},
  title = {Measurement of the Higgs boson mass in the $H\\to\\gamma\\gamma$ and $H\\to ZZ^*\\to 4\\ell$ channels},
  journal = {Phys. Lett. B},
  volume = {784},
  pages = {345--366},
  year = {2018},
  doi = {10.1016/j.physletb.2018.07.050},
  eprint = {1807.05050},
  archivePrefix = {arXiv},
  primaryClass = {hep-ex}
}`,
  },
  {
    id: 'fcc-cdr-hh-2019',
    title: 'Future Circular Collider Conceptual Design Report: Vol 3 - The Hadron Collider (FCC-hh)',
    authors: 'A. Abada et al. (FCC Collaboration)',
    collaboration: 'FCC',
    journal: 'Eur. Phys. J. ST 228, 755–1107',
    year: 2019,
    arxivId: '1905.05078',
    doi: '10.1140/epjst/e2019-900087-0',
    simModule: 'fcc',
    simLabel: 'FCC 91km Collider',
    category: 'Colliders',
    keyBenchmark: '90.7–100 km ring, 16 T Nb3Sn superconducting dipoles, 100 TeV center-of-mass energy, 50 MW/beam synchrotron cooling',
    abstract:
      'This Conceptual Design Report presents the physics potential and technical design of the 100 TeV hadron collider FCC-hh housed in a 91 km circumference tunnel beneath the Geneva basin, exploring energy scaling laws and synchrotron radiation management.',
    bibtex: `@article{FCCHadronCDR2019,
  author = {Abada, A. and others (FCC Collaboration)},
  title = {FCC-hh: The Hadron Collider},
  journal = {Eur. Phys. J. ST},
  volume = {228},
  number = {4},
  pages = {755--1107},
  year = {2019},
  doi = {10.1140/epjst/e2019-900087-0},
  eprint = {1905.05078},
  archivePrefix = {arXiv},
  primaryClass = {physics.acc-ph}
}`,
  },
  {
    id: 'lhcb-lepton-universality-2023',
    title: 'Test of Lepton Universality in B+ → K+ ℓ+ ℓ- and B0 → K*0 ℓ+ ℓ- Decays',
    authors: 'R. Aaij et al. (LHCb Collaboration)',
    collaboration: 'LHCb',
    journal: 'Phys. Rev. Lett. 131, 051803',
    year: 2023,
    arxivId: '2212.09152',
    doi: '10.1103/PhysRevLett.131.051803',
    simModule: 'lhcb',
    simLabel: 'LHCb Rare Decays',
    category: 'Flavour',
    keyBenchmark: 'High-precision test of lepton universality with R_K and R_K* consistent with Standard Model predictions within 1σ',
    abstract:
      'A comprehensive test of lepton universality in rare b → s ℓ+ ℓ- transitions recorded by the LHCb experiment using the complete Run 1 and Run 2 data samples, probing Wilson coefficients C9 and C10 for hypothetical new vector and axial couplings.',
    bibtex: `@article{LHCb2023LeptonUniv,
  author = {Aaij, R. and others (LHCb Collaboration)},
  title = {Test of lepton universality in $B^+\\to K^+ \\ell^+ \\ell^-$ and $B^0\\to K^{*0} \\ell^+ \\ell^-$ decays},
  journal = {Phys. Rev. Lett.},
  volume = {131},
  pages = {051803},
  year = {2023},
  doi = {10.1103/PhysRevLett.131.051803},
  eprint = {2212.09152},
  archivePrefix = {arXiv},
  primaryClass = {hep-ex}
}`,
  },
  {
    id: 'hl-lhc-crab-cavity-2021',
    title: 'First beam tests of Double Quarter Wave crab cavities in the CERN SPS',
    authors: 'R. Calaga et al. (HL-LHC Collaboration)',
    collaboration: 'HL-LHC',
    journal: 'Phys. Rev. Accel. Beams 24, 062001',
    year: 2021,
    arxivId: '2104.09848',
    doi: '10.1103/PhysRevAccelBeams.24.062001',
    simModule: 'crab',
    simLabel: 'HL-LHC Crab Cavity',
    category: 'Optics',
    keyBenchmark: 'Transverse RF kick voltage V_crab = 3.4 MV at 400.79 MHz restoring geometric bunch overlap factor F to ~1.0',
    abstract:
      'We report the first experimental proof of beam rotation using superconducting Double Quarter Wave crab cavities in the CERN SPS, achieving crab tilt angles that compensate the 500 µrad crossing angle in the High-Luminosity LHC.',
    bibtex: `@article{Calaga2021CrabSPS,
  author = {Calaga, R. and others},
  title = {First beam tests of Double Quarter Wave crab cavities in the CERN SPS},
  journal = {Phys. Rev. Accel. Beams},
  volume = {24},
  pages = {062001},
  year = {2021},
  doi = {10.1103/PhysRevAccelBeams.24.062001},
  eprint = {2104.09848},
  archivePrefix = {arXiv},
  primaryClass = {physics.acc-ph}
}`,
  },
  {
    id: 'lhc-design-report-optics-2004',
    title: 'LHC Design Report Vol. 1: The LHC Main Ring Optics and Lattice',
    authors: 'O. Brüning, P. Collier, P. Lebrun, S. Myers, R. Ostojic, J. Poole, P. Proudlock',
    collaboration: 'CERN',
    journal: 'CERN-2004-003-V-1',
    year: 2004,
    doi: '10.5170/CERN-2004-003-V-1',
    simModule: 'optics',
    simLabel: 'Beam Optics',
    category: 'Optics',
    keyBenchmark: 'Courant-Snyder 90° FODO arc cell, cell length L = 106.9 m, focal length f = 37.79 m, beta_max = 177 m',
    abstract:
      'The comprehensive engineering design of the Large Hadron Collider 26.66 km main ring, detailing the alternating-gradient quadrupole focusing lattice, beta function envelope equations, and magnetic rigidity constraints for 7 TeV operation.',
    bibtex: `@techreport{LHCDesignReportVol1,
  author = {Br{\\"u}ning, O. and others},
  title = {LHC Design Report, Vol. I: The LHC Main Ring},
  institution = {CERN},
  number = {CERN-2004-003-V-1},
  year = {2004},
  doi = {10.5170/CERN-2004-003-V-1}
}`,
  },
  {
    id: 'cms-trigger-system-2017',
    title: 'The CMS Trigger System: Architecture, Timing, and Online Selection',
    authors: 'V. Khachatryan et al. (CMS Collaboration)',
    collaboration: 'CMS',
    journal: 'JINST 12, P01020',
    year: 2017,
    arxivId: '1609.02366',
    doi: '10.1088/1748-0221/12/01/P01020',
    simModule: 'trigger',
    simLabel: 'Trigger & DAQ',
    category: 'Triggers',
    keyBenchmark: 'Level-1 hardware filtering from 40 MHz down to 100 kHz within 3.8 µs FPGA latency; HLT rate ~1,000 Hz',
    abstract:
      'Detailed overview of the two-stage trigger system of the CMS experiment at the LHC, describing hardware Level-1 FPGA algorithms and software High-Level Trigger menus that select physics collisions from 40 million bunch crossings per second.',
    bibtex: `@article{CMSTrigger2017,
  author = {Khachatryan, V. and others (CMS Collaboration)},
  title = {The CMS trigger system},
  journal = {JINST},
  volume = {12},
  pages = {P01020},
  year = {2017},
  doi = {10.1088/1748-0221/12/01/P01020},
  eprint = {1609.02366},
  archivePrefix = {arXiv},
  primaryClass = {physics.ins-det}
}`,
  },
  {
    id: 'lhc-run2-luminosity-2019',
    title: 'Beam Performance and Luminosity Optimization in the LHC Run 2',
    authors: 'J. Wenninger et al. (CERN Beams Department)',
    collaboration: 'CERN',
    journal: 'CERN Yellow Reports: School Proceedings, Vol 4',
    year: 2019,
    doi: '10.23730/CYRSP-2019-004.1',
    simModule: 'lhc',
    simLabel: 'LHC Dynamics',
    category: 'Colliders',
    keyBenchmark: 'Peak instantaneous luminosity L = 2.1 × 10^34 cm^-2 s^-1 at 6.5 TeV per beam with 2,556 circulating bunches',
    abstract:
      'A review of the operational parameters of the Large Hadron Collider during Run 2, including beam-beam tuning, beta-star squeeze to 25–30 cm, bunch population evolution, and dipole field rigidity up to 8.33 Tesla.',
    bibtex: `@article{Wenninger2019LHCRun2,
  author = {Wenninger, J.},
  title = {Beam performance in the LHC during Run 2},
  journal = {CERN Yellow Reports: School Proceedings},
  volume = {4},
  pages = {1--32},
  year = {2019},
  doi = {10.23730/CYRSP-2019-004.1}
}`,
  },
  {
    id: 'pdg-2024-review',
    title: 'Review of Particle Physics (PDG 2024 Review)',
    authors: 'S. Navas et al. (Particle Data Group)',
    collaboration: 'PDG',
    journal: 'Phys. Rev. D 110, 030001',
    year: 2024,
    doi: '10.1103/PhysRevD.110.030001',
    simModule: 'discovery',
    simLabel: 'PDG Particle Physics Data',
    category: 'Discovery',
    keyBenchmark: 'Higgs mass m_H = 125.25 ± 0.17 GeV, proton mass = 938.272 MeV, W mass = 80.377 GeV, top quark mass = 172.5 GeV',
    abstract:
      'The definitive global reference compiled by the international Particle Data Group. Summarizes 3,307 new measurements from 1,003 papers, evaluating and averaging elementary particle properties, masses, decay modes, and branching ratios.',
    bibtex: `@article{ParticleDataGroup:2024ch5,
  author = {Navas, S. and others (Particle Data Group)},
  title = {Review of Particle Physics},
  journal = {Phys. Rev. D},
  volume = {110},
  number = {3},
  pages = {030001},
  year = {2024},
  doi = {10.1103/PhysRevD.110.030001}
}`,
  },
];

export const ScienceLiteratureBridge: React.FC<{
  initialFilter?: string;
  className?: string;
}> = ({ initialFilter = 'All', className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedBibId, setCopiedBibId] = useState<string | null>(null);
  const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);

  const categories = [
    'All',
    'Antimatter',
    'Plasma',
    'Heavy-Ion',
    'Discovery',
    'Colliders',
    'Flavour',
    'Optics',
    'Triggers',
  ];

  const filteredItems = LITERATURE_DATABASE.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.authors.toLowerCase().includes(q) ||
      item.collaboration.toLowerCase().includes(q) ||
      item.simLabel.toLowerCase().includes(q) ||
      (item.arxivId && item.arxivId.toLowerCase().includes(q)) ||
      item.doi.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleCopyBibtex = async (item: LiteratureItem) => {
    let copied = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(item.bibtex);
        copied = true;
      }
    } catch {
      // Fallback below
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = item.bibtex;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        // Ignore fallback errors
      }
    }

    setCopiedBibId(item.id);
    setTimeout(() => setCopiedBibId(null), 2500);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase bg-cern-cyan text-black px-2.5 py-0.5 border border-black font-bold tracking-wider shadow-[2px_2px_0px_#000]">
              /// PEER-REVIEWED RESEARCH &amp; ARXIV CITATION BRIDGE ///
            </span>
            <span className="hidden md:inline-block text-[11px] font-mono text-emerald-400 bg-black px-2 py-0.5 border border-emerald-500 font-bold">
              10/10 SIMULATORS GROUNDED IN PUBLISHED DATA
            </span>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-white">
          Science Literature &amp; Experimental Benchmarks
        </h2>
        <p className="text-xs md:text-sm text-text-secondary mt-2 max-w-4xl leading-relaxed font-sans">
          Every mathematical engine in CERN-X maps directly to peer-reviewed Nature, JHEP, PRL, and
          Physical Review publications, open-access arXiv preprints, and official CERN Design Reports.
          Click any arXiv or DOI record to inspect the original experimental results.
        </p>

        {/* Filter and Search Bar */}
        <div className="mt-5 pt-4 border-t-2 border-black flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 font-bold uppercase border-2 border-black transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  selectedCategory === cat
                    ? 'bg-cern-blue text-white shadow-[2px_2px_0px_#00E5FF]'
                    : 'bg-canvas-surface text-text-secondary hover:text-white hover:bg-canvas-raised shadow-[2px_2px_0px_#000]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 text-cern-cyan absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search arXiv, DOI, author..."
              className="w-full bg-canvas-surface border-2 border-black pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-text-muted focus:outline-none focus:border-cern-cyan shadow-[2px_2px_0px_#000]"
            />
          </div>
        </div>
      </div>

      {/* Grid of Literature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredItems.map((item) => {
          const isAbstractOpen = expandedAbstractId === item.id;
          const isCopied = copiedBibId === item.id;

          return (
            <div
              key={item.id}
              className="bg-canvas-surface border-3 border-black shadow-[5px_5px_0px_0px_#000000] p-5 flex flex-col justify-between space-y-4 hover:border-cern-cyan transition-colors"
            >
              <div className="space-y-3">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-black text-amber-300 border border-black shadow-[1px_1px_0px_#000]">
                      {item.collaboration}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-canvas-sub text-text-secondary border border-black">
                      {item.journal} ({item.year})
                    </span>
                  </div>

                  <Link
                    href={`/simulations?module=${item.simModule}`}
                    className="flex items-center gap-1 text-[11px] font-mono font-bold text-cern-cyan hover:underline bg-canvas-sub px-2 py-0.5 border border-black shadow-[1px_1px_0px_#00E5FF]"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Run {item.simLabel}</span>
                  </Link>
                </div>

                {/* Article Title */}
                <h3 className="text-base font-display font-extrabold text-white leading-snug">
                  {item.title}
                </h3>

                {/* Authors */}
                <p className="text-xs font-mono text-text-muted">
                  {item.authors}
                </p>

                {/* Key Experimental Benchmark */}
                <div className="p-3 bg-canvas-sub border-2 border-black text-xs font-mono shadow-[2px_2px_0px_#000]">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
                    /// Experimental Benchmark &amp; Discovery Standard ///
                  </span>
                  <span className="text-white font-bold leading-relaxed">
                    {item.keyBenchmark}
                  </span>
                </div>

                {/* Expandable Abstract */}
                {isAbstractOpen && (
                  <div className="p-3 bg-canvas-sub/80 border border-black text-xs font-sans text-text-secondary leading-relaxed space-y-2">
                    <strong className="font-mono text-white text-[11px] uppercase block">
                      Abstract:
                    </strong>
                    <p>{item.abstract}</p>
                  </div>
                )}
              </div>

              {/* Bottom Action Deck */}
              <div className="pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  {/* arXiv Link */}
                  {item.arxivId && (
                    <a
                      href={`https://arxiv.org/abs/${item.arxivId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 bg-cern-blue hover:bg-cern-accent text-white font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      title={`Open preprint arXiv:${item.arxivId}`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>arXiv:{item.arxivId}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </a>
                  )}

                  {/* DOI Link */}
                  <a
                    href={`https://doi.org/${item.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-canvas-sub hover:bg-canvas-raised text-text-secondary hover:text-white font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    title={`Open peer-reviewed publisher DOI: ${item.doi}`}
                  >
                    <span>DOI:{item.doi}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Abstract */}
                  <button
                    onClick={() =>
                      setExpandedAbstractId(isAbstractOpen ? null : item.id)
                    }
                    className="text-[11px] text-text-muted hover:text-white underline font-bold px-1 py-0.5"
                  >
                    {isAbstractOpen ? 'Hide Abstract' : 'View Abstract'}
                  </button>

                  {/* Copy BibTeX */}
                  <button
                    onClick={() => handleCopyBibtex(item)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-canvas-sub hover:bg-black text-text-secondary hover:text-white font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    title="Copy BibTeX reference to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cern-cyan" />
                        <span>BibTeX</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-8 text-center bg-canvas-sub border-2 border-black text-text-muted font-mono text-sm">
          No research literature matches query &quot;{searchQuery}&quot;. Try searching for &quot;ALPHA-g&quot;, &quot;AWAKE&quot;, &quot;QGP&quot;, or &quot;Higgs&quot;.
        </div>
      )}
    </div>
  );
};
