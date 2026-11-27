'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalStore } from '@/lib/store';
import { Search, X, ChevronRight } from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  category: 'ACCELERATOR' | 'EXPERIMENT' | 'PARTICLE' | 'SIMULATION' | 'LEARN';
  path: string;
  description: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: '1', title: 'LHC Simulator', category: 'SIMULATION', path: '/simulations?module=lhc', description: 'Simulate proton/lead bunches, luminosity, and magnetic rigidity.' },
  { id: '2', title: 'ATLAS Digital Twin', category: 'EXPERIMENT', path: '/detectors?detector=atlas', description: 'Explore subdetectors and visualize real 13 TeV collision events.' },
  { id: '3', title: 'CMS vs ATLAS Comparison', category: 'EXPERIMENT', path: '/detectors?detector=cms', description: 'Compare solenoid vs toroid magnet geometry and ECAL resolutions.' },
  { id: '4', title: 'Trigger/DAQ Pipeline Lab', category: 'SIMULATION', path: '/simulations?module=trigger', description: 'L1 to HLT rate/latency sliders with ROC trade-off curves.' },
  { id: '5', title: 'Higgs Rediscovery Exercise', category: 'SIMULATION', path: '/simulations?module=discovery', description: 'Reconstruct diphoton invariant mass peak on real ATLAS open data.' },
  { id: '6', title: 'WLCG Grid Simulator', category: 'SIMULATION', path: '/computing', description: 'Discrete-event simulation of Tier-0/1/2 job scheduling and failures.' },
  { id: '7', title: 'LHC-TriggerMind AI Benchmark', category: 'SIMULATION', path: '/ai-lab', description: 'Reproducible XGBoost & MLP trigger selection on ATLAS Higgs data.' },
  { id: '8', title: 'Higgs Boson (H0)', category: 'PARTICLE', path: '/learn?particle=higgs', description: 'PDG 2024 review properties, branching fractions, and decay tree.' },
  { id: '9', title: 'Proton Synchrotron (PS)', category: 'ACCELERATOR', path: '/accelerators?id=ps', description: '26 GeV central distributor operating since 1959.' },
  { id: '10', title: 'Super Proton Synchrotron (SPS)', category: 'ACCELERATOR', path: '/accelerators?id=sps', description: '450 GeV final injector to LHC feeding North Area & AWAKE.' },
  { id: '11', title: 'Instantaneous Luminosity', category: 'LEARN', path: '/learn?term=luminosity', description: 'Analytical formula, units, and HL-LHC target parameters.' },
  { id: '12', title: 'Magnetic Rigidity (B*rho)', category: 'LEARN', path: '/learn?term=magnetic-rigidity', description: 'Relativistic momentum per charge and dipole requirements.' },
  { id: '13', title: 'Antimatter Factory (AD/ELENA)', category: 'EXPERIMENT', path: '/simulations?module=antimatter', description: 'Penning traps, laser spectroscopy, and ALPHA-g gravity drop simulation.' },
  { id: '14', title: 'ALICE Heavy Ions (QGP Flow)', category: 'SIMULATION', path: '/simulations?module=alice', description: 'Quark-Gluon Plasma hydrodynamic flow v2 in Pb-Pb collisions.' },
  { id: '15', title: 'CERN Open Data Explorer', category: 'SIMULATION', path: '/open-data', description: 'Query metadata, cutflows, and preview public 13 TeV collision runs.' },
  { id: '16', title: 'Feynman S-Matrix & Conservation Lab', category: 'SIMULATION', path: '/simulations?module=feynman', description: 'Assemble particle reactions, test Q/B/L conservation, and inspect Z0 resonance.' },
  { id: '17', title: 'Cloud Chamber & Lorentz Tracks', category: 'SIMULATION', path: '/simulations?module=cloud-chamber', description: '60 FPS vapor chamber with tunable B-field and particle detective mode.' },
  { id: '18', title: 'Higgs "Mexican Hat" Symmetry Lab', category: 'SIMULATION', path: '/simulations?module=higgs-ewsb', description: 'Cool the early universe past Tc = 159.5 GeV to trigger mass generation.' },
  { id: '19', title: 'Dark Matter CAST & Mono-Jet Lab', category: 'SIMULATION', path: '/simulations?module=dark-matter', description: 'Solar axion Primakoff resonance and LHC invisible recoil detection.' },
  { id: '20', title: 'Hadron Therapy & Bragg Peak Sim', category: 'SIMULATION', path: '/simulations?module=bragg-peak', description: 'Bethe-Bloch proton & C-12 SOBP depth-dose profiles and CERN-MEDICIS.' },
  { id: '21', title: '3D Detector Crystals & Nb3Sn Lattice', category: 'EXPERIMENT', path: '/detectors?tab=materials', description: 'Interactive 3D PbWO4 scintillator, LAr accordion, and 16T superconductors.' },
  { id: '22', title: 'Engineering Cryo, Vacuum & RF Twin', category: 'ACCELERATOR', path: '/engineering', description: '3D dipole cryostat, 1.9 K superfluid phase transition, UHV lifetime, and RF surfing.' },
  { id: '23', title: 'Live arXiv HEP Preprints Feed', category: 'LEARN', path: '/simulations?module=literature', description: 'Real-time LHC Run 3 papers, search, and BibTeX citation export.' },
  { id: '24', title: 'Complete CERN Projects & 3D Site Atlas', category: 'EXPERIMENT', path: '/projects', description: 'Interactive 3D underground tunnel map & 22+ CERN facilities, WWW, and spin-offs.' },
  { id: '25', title: '3D Standard Model & Higgs Yukawa Matrix', category: 'PARTICLE', path: '/simulations?module=sm-3d', description: 'Complete 17-particle periodic table with live 3D quantum wave simulations.' },
  { id: '26', title: 'ISOLDE Nuclear Chart & Mass Separator', category: 'SIMULATION', path: '/simulations?module=isolde', description: 'Segrè nuclide chart, magic shells, RILIS lasers, and magnetic A/q separation.' },
  { id: '27', title: 'LHCb RICH Cherenkov & Medipix3 Color X-Ray', category: 'SIMULATION', path: '/simulations?module=rich-medipix', description: 'Optical Cherenkov photon rings and CERN medical K-edge spectral X-rays.' },
  { id: '28', title: 'Cosmic Big Bang Cooling Time Machine', category: 'SIMULATION', path: '/simulations?module=cosmic', description: 'Rewind universe temperature across QCD confinement & Higgs symmetry breaking.' },
  { id: '29', title: 'Live Browser TriggerMind Neural Inference', category: 'SIMULATION', path: '/ai-lab', description: 'Run real trained TriggerMind-MLP neural network weights in browser with INT8 mode.' },
  { id: '30', title: 'Real CMS/ATLAS Z0 Dimuon Mass Spectrum', category: 'EXPERIMENT', path: '/open-data', description: 'Inspect real CERN Open Data dimuon Z0 pole histogram and cutflow events.' },
  { id: '31', title: '3D Custom Beam Collision Director', category: 'SIMULATION', path: '/simulations?module=collision-director', description: 'Fire custom pp, Pb-Pb, and FCC-ee beam collisions inside a live 3D detector chamber.' },
  { id: '32', title: 'Relativistic Speed & Einstein Clock Race', category: 'SIMULATION', path: '/simulations?module=race', description: 'Race CERN accelerators against a laser beam and compare Lorentz time dilation.' },
  { id: '33', title: 'PMNS 3-Flavor Neutrino Oscillation Lab', category: 'SIMULATION', path: '/simulations?module=neutrinos', description: 'Simulate CNGS 732 km, FASERnu, and DUNE baseline neutrino flavor mixing probabilities.' },
  { id: '34', title: 'LHC 24h Physics Fill Control Room', category: 'SIMULATION', path: '/simulations?module=lhc-fill', description: 'Operate Injection, Ramp, Squeeze, Leveled Stable Beams, and 362 MJ Beam Dump.' },
  { id: '35', title: 'TVA Sacred Timeline, 3D Loom & Multiverse Comparator', category: 'SIMULATION', path: '/simulations?module=tva-timeline', description: 'Retro-CRT & Three.js Temporal Loom mapping Higgs & top quark vacuum stability, Red Line crossings, and Time-Charge pruning.' },
  { id: '36', title: 'TVA Variant Intake Desk (40 MHz Trigger)', category: 'SIMULATION', path: '/simulations?module=tva-intake', description: 'Keep vs Prune real LHC collision topologies under L1 readout bandwidth limits.' },
  { id: '37', title: 'Arc Reactor Cryo Superconducting Dipole HUD', category: 'SIMULATION', path: '/simulations?module=arc-magnet', description: 'Magnetic energy density u_B, Maxwell burst pressure, and Nb3Sn quench thresholds.' },
  { id: '38', title: 'Quantum Realm Scale Zoom Explorer', category: 'SIMULATION', path: '/simulations?module=quantum-zoom', description: 'Logarithmic zoom from 10^26 m cosmos down to 10^-35 m Planck floor.' },
  { id: '39', title: 'Mirror Dimension Extra Dimensions & KK Lab', category: 'SIMULATION', path: '/simulations?module=mirror-dimensions', description: 'Three.js Calabi-Yau manifold and ADD higher-dimensional Planck gravity solver.' },
  { id: '40', title: 'Spider-Glitch Displaced Vertex LLP Detector', category: 'SIMULATION', path: '/simulations?module=displaced-vertex', description: 'Relativistic decay flight across ATLAS, CMS, and FASER.' },
  { id: '41', title: 'Magneto & CERN MoEDAL Magnetic Monopole Arena', category: 'SIMULATION', path: '/simulations?module=monopole-arena', description: 'Compare Lorentz proton bending with 4700x MIP Dirac magnetic monopoles.' },
  { id: '42', title: 'Bifrost Heavy-Ion Pb-Pb & Cosmic Shower Lab', category: 'SIMULATION', path: '/simulations?module=bifrost-rays', description: 'Prismatic ALICE Quark-Gluon Plasma fireball conserving transverse momentum.' },
  { id: '43', title: 'End-to-End Methodology, Formulas & Verification', category: 'LEARN', path: '/methodology', description: '5-stage architecture, live browser KaTeX equation verifier, and cryptographic provenance manifest.' },
];

export const CommandPalette: React.FC = () => {
  const isOpen = useGlobalStore((s) => s.commandPaletteOpen);
  const setIsOpen = useGlobalStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const filteredItems = SEARCH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    setQuery('');
    router.push(item.path);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100 p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-canvas-surface border-3 border-black rounded-none shadow-[8px_8px_0px_#000] overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b-3 border-black bg-cern-blue text-white">
          <Search className="w-5 h-5 text-cern-cyan shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search accelerators, experiments, particles, simulations..."
            value={query}
            onKeyDown={handleInputKeyDown}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-white text-sm font-mono placeholder:text-blue-200 focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 border-2 border-black bg-black text-white hover:bg-zinc-800 transition-colors shadow-[2px_2px_0px_#00E5FF]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1.5 bg-canvas-sub">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 border-2 border-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-canvas-raised shadow-[4px_4px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-canvas-surface shadow-[2px_2px_0px_#000] text-text-secondary hover:text-white hover:shadow-[3px_3px_0px_#000]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-white">{item.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border-2 border-black bg-cern-blue text-white shadow-[2px_2px_0px_#000]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-1 font-sans">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cern-cyan shrink-0 ml-2" />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs font-mono text-text-muted border-2 border-dashed border-black m-2 bg-canvas-surface shadow-[3px_3px_0px_#000]">
              NO MATCHING CERN ENTITIES FOUND IN CATALOGUE.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t-3 border-black bg-black flex items-center justify-between text-xs font-mono text-text-muted">
          <span>↑ / ↓ TO NAVIGATE · ENTER TO LAUNCH</span>
          <span className="text-cern-cyan font-bold">ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
};
