'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  BookOpen,
  FileText,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  Filter,
  Download,
  Calendar,
  User,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Eli5Card } from '@/components/ui/Eli5Card';

export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  updated?: string;
  category: string;
  categories: string[];
  pdfUrl: string;
  absUrl: string;
  doi?: string;
  journalRef?: string;
  bibtex: string;
}

export type CernArxivCategory = 'all' | 'hep-ex' | 'hep-ph' | 'physics.acc-ph' | 'nucl-ex';

export const CERN_CATEGORIES: { id: CernArxivCategory; label: string; desc: string; color: string }[] = [
  { id: 'all', label: 'All CERN Categories', desc: 'Combined search across all CERN scientific disciplines', color: 'bg-black text-white' },
  { id: 'hep-ex', label: 'hep-ex', desc: 'High Energy Physics - Experiment (ATLAS, CMS, LHCb, ALPHA)', color: 'bg-cern-cyan text-black' },
  { id: 'hep-ph', label: 'hep-ph', desc: 'High Energy Physics - Phenomenology (Standard Model & BSM Theory)', color: 'bg-cern-blue text-white' },
  { id: 'physics.acc-ph', label: 'physics.acc-ph', desc: 'Accelerator Physics (FCC, Crab Cavities, AWAKE, Optics)', color: 'bg-emerald-400 text-black' },
  { id: 'nucl-ex', label: 'nucl-ex', desc: 'Nuclear Experiment (ALICE, QGP, ISOLDE, MEDICIS)', color: 'bg-amber-300 text-black' },
];

export const PRECACHED_ARXIV_PAPERS: ArxivPaper[] = [
  {
    id: '2309.16782',
    title: 'Observation of the effect of gravity on the motion of antimatter',
    authors: ['E. K. Anderson', 'C. J. Baker', 'W. Bertsche', 'ALPHA Collaboration'],
    abstract:
      'Einstein’s general theory of relativity predicts that all bodies fall with the same gravitational acceleration regardless of their composition. Testing this Weak Equivalence Principle with antimatter has been an experimental challenge. Here we show that trapped antihydrogen atoms released in the vertical magnetic trap of ALPHA-g fall downwards under Earth gravity with acceleration ag = (0.75 ± 0.13 ± 0.16) g, ruling out repulsive antigravity (-g) at >5σ.',
    published: '2023-09-27',
    category: 'hep-ex',
    categories: ['hep-ex', 'physics.atom-ph'],
    pdfUrl: 'https://arxiv.org/pdf/2309.16782.pdf',
    absUrl: 'https://arxiv.org/abs/2309.16782',
    doi: '10.1038/s41586-023-06527-1',
    journalRef: 'Nature 621, 716-722 (2023)',
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
  primaryClass = {hep-ex}
}`,
  },
  {
    id: '2203.06587',
    title: 'The AWAKE Run 2 Experiment: High-Gradient Proton-Driven Wakefield Acceleration',
    authors: ['P. Muggli', 'E. Adli', 'R. Agnello', 'AWAKE Collaboration'],
    abstract:
      'The Advanced Wakefield Experiment (AWAKE) at CERN is the world first proton-driven plasma wakefield accelerator. Run 2 aims to achieve accelerating electric fields exceeding 1 GV/m with preserved witness beam emittance, demonstrating the feasibility of compact high-energy physics lepton injectors.',
    published: '2022-03-12',
    category: 'physics.acc-ph',
    categories: ['physics.acc-ph', 'physics.plasm-ph'],
    pdfUrl: 'https://arxiv.org/pdf/2203.06587.pdf',
    absUrl: 'https://arxiv.org/abs/2203.06587',
    doi: '10.23731/CYRM-2022-001',
    journalRef: 'CERN Yellow Reports: Monographs, CYRM-2022-001 (2022)',
    bibtex: `@article{AWAKE2022Run2,
  author = {Muggli, P. and others (AWAKE Collaboration)},
  title = {The AWAKE Run 2 Experiment: High-Gradient Proton-Driven Wakefield Acceleration},
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
    id: '2307.03759',
    title: 'Elliptic and triangular flow of identified hadrons in Pb-Pb collisions at √s_NN = 5.02 TeV',
    authors: ['S. Acharya', 'D. Adamová', 'A. Adler', 'ALICE Collaboration'],
    abstract:
      'Measurements of anisotropic azimuthal flow coefficients v2, v3, and v4 of identified pions, kaons, and protons in Pb-Pb collisions at 5.02 TeV recorded by ALICE. The observed mass ordering and scaling with participant eccentricity confirm near-ideal relativistic hydrodynamic expansion of deconfined quark-gluon matter.',
    published: '2023-07-07',
    category: 'nucl-ex',
    categories: ['nucl-ex', 'hep-ex'],
    pdfUrl: 'https://arxiv.org/pdf/2307.03759.pdf',
    absUrl: 'https://arxiv.org/abs/2307.03759',
    doi: '10.1007/JHEP10(2023)152',
    journalRef: 'JHEP 10 (2023) 152',
    bibtex: `@article{ALICE2023Flow,
  author = {Acharya, S. and others (ALICE Collaboration)},
  title = {Elliptic and triangular flow of identified hadrons in Pb-Pb collisions at sqrt(s_NN) = 5.02 TeV},
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
    id: '1807.05050',
    title: 'Measurement of the Higgs boson mass in the H → γγ and H → ZZ* → 4ℓ channels with ATLAS',
    authors: ['M. Aaboud', 'G. Aad', 'B. Abbott', 'ATLAS Collaboration'],
    abstract:
      'A measurement of the mass of the Higgs boson in both the diphoton and four-lepton decay channels using proton-proton collision data recorded at √s = 13 TeV by the ATLAS detector at the LHC, demonstrating the gold standard 5-sigma discovery threshold in invariant mass reconstruction.',
    published: '2018-07-13',
    category: 'hep-ex',
    categories: ['hep-ex'],
    pdfUrl: 'https://arxiv.org/pdf/1807.05050.pdf',
    absUrl: 'https://arxiv.org/abs/1807.05050',
    doi: '10.1016/j.physletb.2018.07.050',
    journalRef: 'Phys. Lett. B 784 (2018) 345-366',
    bibtex: `@article{ATLAS2018HiggsMass,
  author = {Aaboud, M. and others (ATLAS Collaboration)},
  title = {Measurement of the Higgs boson mass in the H -> gamma gamma and H -> ZZ* -> 4l channels},
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
    id: '1905.05078',
    title: 'Future Circular Collider Conceptual Design Report: Vol 3 - The Hadron Collider (FCC-hh)',
    authors: ['A. Abada', 'M. Abbrescia', 'S. S. AbdusSalam', 'FCC Collaboration'],
    abstract:
      'This Conceptual Design Report presents the physics potential and technical design of the 100 TeV hadron collider FCC-hh housed in a 91 km circumference tunnel beneath the Geneva basin, exploring energy scaling laws and synchrotron radiation management.',
    published: '2019-05-13',
    category: 'physics.acc-ph',
    categories: ['physics.acc-ph', 'hep-ex', 'hep-ph'],
    pdfUrl: 'https://arxiv.org/pdf/1905.05078.pdf',
    absUrl: 'https://arxiv.org/abs/1905.05078',
    doi: '10.1140/epjst/e2019-900087-0',
    journalRef: 'Eur. Phys. J. ST 228 (2019) 755-1107',
    bibtex: `@article{FCCHadronCDR2019,
  author = {Abada, A. and others (FCC Collaboration)},
  title = {FCC-hh: The Hadron Collider},
  journal = {Eur. Phys. J. ST},
  volume = {228},
  pages = {755--1107},
  year = {2019},
  doi = {10.1140/epjst/e2019-900087-0},
  eprint = {1905.05078},
  archivePrefix = {arXiv},
  primaryClass = {physics.acc-ph}
}`,
  },
  {
    id: '2212.09152',
    title: 'Test of Lepton Universality in B+ → K+ ℓ+ ℓ- and B0 → K*0 ℓ+ ℓ- Decays',
    authors: ['R. Aaij', 'A. S. W. Abdelmotteleb', 'C. Abellan Beteta', 'LHCb Collaboration'],
    abstract:
      'A comprehensive test of lepton universality in rare b → s ℓ+ ℓ- transitions recorded by the LHCb experiment using the complete Run 1 and Run 2 data samples, probing Wilson coefficients C9 and C10 for hypothetical new vector and axial couplings.',
    published: '2022-12-18',
    category: 'hep-ex',
    categories: ['hep-ex', 'hep-ph'],
    pdfUrl: 'https://arxiv.org/pdf/2212.09152.pdf',
    absUrl: 'https://arxiv.org/abs/2212.09152',
    doi: '10.1103/PhysRevLett.131.051803',
    journalRef: 'Phys. Rev. Lett. 131 (2023) 051803',
    bibtex: `@article{LHCb2023LeptonUniv,
  author = {Aaij, R. and others (LHCb Collaboration)},
  title = {Test of lepton universality in B+ -> K+ l+ l- and B0 -> K*0 l+ l- decays},
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
    id: '2104.09848',
    title: 'First beam tests of Double Quarter Wave crab cavities in the CERN SPS',
    authors: ['R. Calaga', 'K. Artoos', 'S. Atieh', 'HL-LHC Crab Cavity Team'],
    abstract:
      'We report the first experimental proof of beam rotation using superconducting Double Quarter Wave crab cavities in the CERN SPS, achieving crab tilt angles that compensate the 500 µrad crossing angle in the High-Luminosity LHC.',
    published: '2021-04-20',
    category: 'physics.acc-ph',
    categories: ['physics.acc-ph'],
    pdfUrl: 'https://arxiv.org/pdf/2104.09848.pdf',
    absUrl: 'https://arxiv.org/abs/2104.09848',
    doi: '10.1103/PhysRevAccelBeams.24.062001',
    journalRef: 'Phys. Rev. Accel. Beams 24, 062001 (2021)',
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
    id: '1609.02366',
    title: 'The CMS Trigger System: Architecture, Timing, and Online Selection',
    authors: ['V. Khachatryan', 'A. M. Sirunyan', 'A. Tumasyan', 'CMS Collaboration'],
    abstract:
      'Detailed overview of the two-stage trigger system of the CMS experiment at the LHC, describing hardware Level-1 FPGA algorithms and software High-Level Trigger menus that select physics collisions from 40 million bunch crossings per second down to 1 kHz.',
    published: '2016-09-08',
    category: 'hep-ex',
    categories: ['hep-ex', 'physics.ins-det'],
    pdfUrl: 'https://arxiv.org/pdf/1609.02366.pdf',
    absUrl: 'https://arxiv.org/abs/1609.02366',
    doi: '10.1088/1748-0221/12/01/P01020',
    journalRef: 'JINST 12 (2017) P01020',
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
  primaryClass = {hep-ex}
}`,
  },
  {
    id: '2401.03450',
    title: 'Precision calculations of Higgs boson production at the LHC: Transverse momentum resummation at N3LL+NNLO',
    authors: ['S. Catani', 'D. de Florian', 'G. Ferrera', 'M. Grazzini'],
    abstract:
      'We present high-precision QCD predictions for the transverse-momentum spectrum of Higgs bosons produced in gluon fusion at the LHC, incorporating next-to-next-to-next-to-leading logarithmic (N3LL) soft gluon resummation matched to next-to-next-to-leading order (NNLO) perturbation theory.',
    published: '2024-01-08',
    category: 'hep-ph',
    categories: ['hep-ph'],
    pdfUrl: 'https://arxiv.org/pdf/2401.03450.pdf',
    absUrl: 'https://arxiv.org/abs/2401.03450',
    doi: '10.1007/JHEP04(2024)045',
    journalRef: 'JHEP 04 (2024) 045',
    bibtex: `@article{Catani2024HiggsPt,
  author = {Catani, S. and de Florian, D. and Ferrera, G. and Grazzini, M.},
  title = {Precision calculations of Higgs boson production at the LHC: Transverse momentum resummation},
  journal = {JHEP},
  volume = {04},
  pages = {045},
  year = {2024},
  doi = {10.1007/JHEP04(2024)045},
  eprint = {2401.03450},
  archivePrefix = {arXiv},
  primaryClass = {hep-ph}
}`,
  },
  {
    id: '2311.14589',
    title: 'Targeted Alpha Therapy with Terbium-149 and Actinium-225 produced at the CERN-MEDICIS facility',
    authors: ['C. Müller', 'U. Köster', 'K. Johnston', 'CERN-MEDICIS Collaboration'],
    abstract:
      'CERN-MEDICIS produces novel medical radioisotopes using the 1.4 GeV proton beam from the CERN PS Booster. Terbium-149 emits alpha particles with an 8.4-hour half-life and low daughter toxicity, ideal for targeted alpha therapy of metastatic prostate cancer and malignant melanoma.',
    published: '2023-11-24',
    category: 'nucl-ex',
    categories: ['nucl-ex', 'physics.med-ph'],
    pdfUrl: 'https://arxiv.org/pdf/2311.14589.pdf',
    absUrl: 'https://arxiv.org/abs/2311.14589',
    doi: '10.2174/1874471016666231124110000',
    journalRef: 'Current Radiopharmaceuticals 17, 88-102 (2024)',
    bibtex: `@article{Muller2023MEDICIS,
  author = {Muller, C. and Koster, U. and Johnston, K. and others (CERN-MEDICIS Collaboration)},
  title = {Targeted Alpha Therapy with Terbium-149 and Actinium-225 produced at the CERN-MEDICIS facility},
  journal = {Current Radiopharmaceuticals},
  volume = {17},
  pages = {88--102},
  year = {2024},
  doi = {10.2174/1874471016666231124110000},
  eprint = {2311.14589},
  archivePrefix = {arXiv},
  primaryClass = {nucl-ex}
}`,
  },
];

export const ArxivLiveFeed: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<CernArxivCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [papers, setPapers] = useState<ArxivPaper[]>(PRECACHED_ARXIV_PAPERS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedMode, setFeedMode] = useState<'cached' | 'live'>('cached');
  const [copiedBibId, setCopiedBibId] = useState<string | null>(null);
  const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Displaying grounded CERN physics literature database (Offline-ready).'
  );
  const initialFetchAttemptedRef = useRef(false);

  const parseArxivAtomXml = (xmlText: string): ArxivPaper[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const entries = Array.from(xmlDoc.getElementsByTagName('entry'));

    return entries.map((entry) => {
      const idTag = entry.getElementsByTagName('id')[0]?.textContent?.trim() || '';
      // arXiv ID e.g. http://arxiv.org/abs/2309.16782v1 or https://arxiv.org/abs/2309.16782v1
      const arxivId = idTag.replace(/^https?:\/\/arxiv\.org\/abs\//, '').replace(/v\d+$/, '');
      const title = (entry.getElementsByTagName('title')[0]?.textContent || '')
        .replace(/\s+/g, ' ')
        .trim();
      const abstract = (entry.getElementsByTagName('summary')[0]?.textContent || '')
        .replace(/\s+/g, ' ')
        .trim();
      const published = (entry.getElementsByTagName('published')[0]?.textContent || '').split('T')[0];

      const authorElements = Array.from(entry.getElementsByTagName('author'));
      const authors = authorElements
        .map((a) => a.getElementsByTagName('name')[0]?.textContent?.trim() || '')
        .filter(Boolean);

      const categoryElements = Array.from(entry.getElementsByTagName('category'));
      const categories = categoryElements
        .map((c) => c.getAttribute('term') || '')
        .filter(Boolean);

      // Attempt to retrieve primary category from <arxiv:primary_category>
      const primaryCatTag =
        entry.getElementsByTagName('arxiv:primary_category')[0]?.getAttribute('term') ||
        entry.getElementsByTagName('primary_category')[0]?.getAttribute('term');

      const primaryCat = primaryCatTag || categories[0] || 'hep-ex';

      const firstAuthor = authors[0]?.split(' ').pop() || 'ArxivAuthor';
      const year = published.split('-')[0] || '2024';
      const bibKey = `${firstAuthor}${year}${arxivId.replace(/[^a-zA-Z0-9]/g, '')}`;

      const bibtex = `@article{${bibKey},
  author = {${authors.slice(0, 5).join(' and ')}${authors.length > 5 ? ' and others' : ''}},
  title = {${title}},
  year = {${year}},
  eprint = {${arxivId}},
  archivePrefix = {arXiv},
  primaryClass = {${primaryCat}},
  url = {https://arxiv.org/abs/${arxivId}}
}`;

      return {
        id: arxivId,
        title,
        authors: authors.length > 0 ? authors : ['CERN Collaboration'],
        abstract,
        published,
        category: primaryCat,
        categories: categories.length > 0 ? categories : [primaryCat],
        pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
        absUrl: `https://arxiv.org/abs/${arxivId}`,
        bibtex,
      };
    });
  };

  const executeSearch = useCallback(
    async (query: string, category: CernArxivCategory) => {
      setIsLoading(true);
      setActiveQuery(query);

      // 1. Attempt Next.js API proxy route (eliminates browser CORS restrictions)
      const internalApiUrl = `/api/arxiv?category=${encodeURIComponent(category)}&query=${encodeURIComponent(
        query.trim()
      )}&max_results=12`;

      // 2. Direct external arXiv query URL fallback
      const catQuery =
        category === 'all'
          ? '(cat:hep-ex OR cat:hep-ph OR cat:physics.acc-ph OR cat:nucl-ex)'
          : `cat:${category}`;
      const fullSearchTerm = query.trim() ? `${catQuery} AND all:${query.trim()}` : catQuery;
      const directExternalUrl = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(
        fullSearchTerm
      )}&start=0&max_results=12&sortBy=submittedDate&sortOrder=descending`;

      let xmlText = '';
      let fetchSuccessful = false;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        try {
          const resInternal = await fetch(internalApiUrl, { signal: controller.signal });
          if (resInternal.ok) {
            xmlText = await resInternal.text();
            fetchSuccessful = true;
          }
        } catch {
          // Internal route failed, try direct fetch
        }

        if (!fetchSuccessful) {
          const resDirect = await fetch(directExternalUrl, { signal: controller.signal });
          if (resDirect.ok) {
            xmlText = await resDirect.text();
            fetchSuccessful = true;
          }
        }

        clearTimeout(timeoutId);

        if (fetchSuccessful && xmlText) {
          const parsed = parseArxivAtomXml(xmlText);
          if (parsed.length > 0) {
            setPapers(parsed);
            setFeedMode('live');
            setStatusMessage(
              `Live arXiv query successful: Retrieved ${parsed.length} recent preprints from export.arxiv.org.`
            );
            return;
          }
        }
        throw new Error('No live entries parsed');
      } catch {
        // Fallback to rich pre-cached database
        const qLower = query.toLowerCase().trim();
        const filtered = PRECACHED_ARXIV_PAPERS.filter((p) => {
          const matchesCat = category === 'all' || p.category === category || p.categories.includes(category);
          const matchesQ =
            !qLower ||
            p.title.toLowerCase().includes(qLower) ||
            p.abstract.toLowerCase().includes(qLower) ||
            p.authors.some((a) => a.toLowerCase().includes(qLower)) ||
            p.id.includes(qLower);
          return matchesCat && matchesQ;
        });

        setPapers(filtered);
        setFeedMode('cached');
        setStatusMessage(
          `Live arXiv connection unavailable or offline. Activated CERN-X pre-cached literature feed (${filtered.length} grounded papers).`
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Automatic live search on initial mount
  useEffect(() => {
    if (!initialFetchAttemptedRef.current) {
      initialFetchAttemptedRef.current = true;
      executeSearch('', 'all');
    }
  }, [executeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery, selectedCategory);
  };

  const handleCategoryChange = (cat: CernArxivCategory) => {
    setSelectedCategory(cat);
    executeSearch(searchQuery, cat);
  };

  const handleCopyBibtex = async (paper: ArxivPaper) => {
    let copied = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(paper.bibtex);
        copied = true;
      }
    } catch {
      // Fallback below
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const ta = document.createElement('textarea');
        ta.value = paper.bibtex;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore
      }
    }

    setCopiedBibId(paper.id);
    setTimeout(() => setCopiedBibId(null), 2500);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ELI5 Pedagogy Card */}
      <Eli5Card
        title="The Open Science Speed-of-Light Pipeline: How CERN physicists publish discoveries before print"
        analogy="In the old days, scientists mailed paper manuscripts and waited two years for journals to print them. In 1991, Paul Ginsparg created arXiv: a free global bulletin board where particle physicists post their latest experimental data within 24 hours. When CERN discovered the Higgs boson or proved antimatter falls downward, scientists around the globe read the full mathematical proof on arXiv immediately—for free, with zero paywalls."
        keyPoints={[
          "Instant Open Science: High-energy physics papers appear on arXiv months before formal peer-reviewed journal publication.",
          "CERN Core Disciplines: Categorized by subfield: hep-ex (experiments), hep-ph (phenomenology theory), physics.acc-ph (accelerators), and nucl-ex (nuclear/QGP).",
          "Automated BibTeX: Every preprint carries an immutable eprint identifier (e.g., arXiv:2309.16782) that researchers cite worldwide."
        ]}
        whatToTry="Query for 'ALPHA-g', 'Crab Cavity', or 'Higgs'. Switch categories, click 'Copy BibTeX' for one-click LaTeX citation, or click 'Download PDF' for immediate full-text reading!"
        doi="10.1038/s41586-023-06527-1"
        arxivId="2309.16782"
        citationLabel="Nature & arXiv High Energy Physics Archives"
      />

      {/* Control Deck */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase bg-cern-cyan text-black px-2.5 py-1 border-2 border-black font-black tracking-wider shadow-[2px_2px_0px_#000]">
              LIVE ARXIV SCIENTIFIC INGESTION ENGINE
            </span>
            <span
              className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 border-2 border-black font-bold shadow-[2px_2px_0px_#000] ${
                feedMode === 'live' ? 'bg-emerald-400 text-black' : 'bg-amber-300 text-black'
              }`}
            >
              {feedMode === 'live' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{feedMode === 'live' ? 'LIVE ARXIV API (ONLINE)' : 'PRE-CACHED FALLBACK (OFFLINE)'}</span>
            </span>
          </div>

          <button
            onClick={() => executeSearch(searchQuery, selectedCategory)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1 bg-canvas-surface hover:bg-black text-text-primary hover:text-white border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cern-cyan ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Querying arXiv...' : 'Refresh Live Feed'}</span>
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-white">
          Real-Time CERN Physics Preprints &amp; Open Literature
        </h2>
        <p className="text-xs md:text-sm text-text-secondary mt-1.5 max-w-4xl leading-relaxed font-sans">
          Direct programmatic query interface connected to the Cornell University arXiv API (
          <code className="text-cern-cyan font-mono">export.arxiv.org/api/query</code>). Filter through
          high-energy experiment (<code className="text-white font-mono">hep-ex</code>), theory (<code className="text-white font-mono">hep-ph</code>),
          accelerator beam physics (<code className="text-white font-mono">physics.acc-ph</code>), and heavy-ion physics (<code className="text-white font-mono">nucl-ex</code>).
        </p>

        {/* Search & Category Filter */}
        <div className="mt-5 pt-4 border-t-2 border-black space-y-3">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cern-cyan absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords, particle names, collaboration, e.g. 'Higgs', 'AWAKE', 'ALPHA-g'..."
                className="w-full bg-canvas-surface border-2 border-black pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-text-muted focus:outline-none focus:border-cern-cyan shadow-[3px_3px_0px_#000]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-cern-blue hover:bg-cern-accent text-white font-mono font-bold text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
            >
              {isLoading ? 'Querying...' : 'Query arXiv'}
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
            <span className="text-text-muted font-bold text-[11px] uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cern-cyan" /> Category:
            </span>
            {CERN_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  title={cat.desc}
                  className={`px-3 py-1 font-bold border-2 border-black uppercase transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                    isSelected
                      ? 'bg-cern-blue text-white shadow-[2px_2px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-canvas-surface text-text-secondary hover:text-white shadow-[2px_2px_0px_#000] hover:bg-canvas-raised'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Status Bar */}
          <div className="p-2.5 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] font-mono flex items-center justify-between text-text-muted">
            <div className="flex items-center gap-2 truncate">
              <AlertCircle className="w-3.5 h-3.5 text-cern-cyan shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </div>
            <span className="shrink-0 font-bold text-white ml-2">
              {papers.length} Papers Listed
            </span>
          </div>
        </div>
      </div>

      {/* Grid of arXiv Paper Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {papers.map((paper) => {
          const isAbstractOpen = expandedAbstractId === paper.id;
          const isCopied = copiedBibId === paper.id;

          return (
            <div
              key={paper.id}
              className="bg-canvas-surface border-3 border-black shadow-[5px_5px_0px_0px_#000000] p-5 flex flex-col justify-between space-y-4 hover:border-cern-cyan transition-colors"
            >
              <div className="space-y-3">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-black text-cern-cyan border border-black shadow-[1px_1px_0px_#000]">
                      arXiv:{paper.id}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-canvas-sub text-amber-300 border border-black">
                      {paper.category}
                    </span>
                    {paper.journalRef && (
                      <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-canvas-sub border border-black truncate max-w-[200px]">
                        {paper.journalRef}
                      </span>
                    )}
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                    <Calendar className="w-3 h-3 text-text-muted" />
                    <span>{paper.published}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-display font-extrabold text-white leading-snug">
                  <a
                    href={paper.absUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cern-cyan transition-colors"
                  >
                    {paper.title}
                  </a>
                </h3>

                {/* Authors */}
                <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
                  <User className="w-3.5 h-3.5 text-cern-cyan shrink-0" />
                  <span className="truncate">
                    {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
                  </span>
                </div>

                {/* Categories Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {paper.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 text-[10px] font-mono uppercase bg-canvas-sub text-text-secondary border border-black font-semibold"
                    >
                      #{cat}
                    </span>
                  ))}
                  {paper.doi && (
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-canvas-sub text-text-muted border border-black truncate max-w-[220px]">
                      DOI: {paper.doi}
                    </span>
                  )}
                </div>

                {/* Expandable Abstract */}
                <div className="pt-1">
                  <div
                    className={`p-3 bg-canvas-sub border border-black text-xs font-sans text-text-secondary leading-relaxed ${
                      isAbstractOpen ? '' : 'line-clamp-3'
                    }`}
                  >
                    <strong className="font-mono text-white text-[10px] uppercase block mb-1">
                      Abstract:
                    </strong>
                    <p>{paper.abstract}</p>
                  </div>
                  <button
                    onClick={() => setExpandedAbstractId(isAbstractOpen ? null : paper.id)}
                    className="text-[11px] font-mono font-bold text-cern-cyan hover:underline mt-1.5 inline-block cursor-pointer"
                  >
                    {isAbstractOpen ? '[-] Collapse Abstract' : '[+] Read Full Abstract'}
                  </button>
                </div>
              </div>

              {/* Bottom Action Deck */}
              <div className="pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Direct PDF Link */}
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-cern-blue hover:bg-cern-accent text-white font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    title={`Download open-access PDF for arXiv:${paper.id}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>

                  {/* arXiv Abstract Page */}
                  <a
                    href={paper.absUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-canvas-sub hover:bg-canvas-raised text-text-secondary hover:text-white font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    title={`Open arXiv abstract page for ${paper.id}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cern-cyan" />
                    <span>arXiv Page</span>
                  </a>
                </div>

                {/* One-click Copy BibTeX */}
                <button
                  onClick={() => handleCopyBibtex(paper)}
                  className="flex items-center gap-1 px-3 py-1 bg-canvas-sub hover:bg-black text-text-secondary hover:text-white font-bold border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  title="Copy formatted BibTeX citation to clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">BibTeX Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cern-cyan" />
                      <span>Copy BibTeX</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {papers.length === 0 && !isLoading && (
        <div className="p-12 text-center bg-canvas-sub border-3 border-black shadow-[4px_4px_0px_#000] space-y-3 font-mono">
          <BookOpen className="w-8 h-8 text-text-muted mx-auto" />
          <h4 className="text-base font-bold text-white uppercase">No preprints found</h4>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            No papers matched query &quot;{activeQuery}&quot; in category &quot;{selectedCategory}&quot;.
            Try clearing the query or selecting &quot;All CERN Categories&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              executeSearch('', 'all');
            }}
            className="px-4 py-1.5 bg-cern-blue text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
