'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalStore } from '@/lib/store';
import { Search, X, Activity, Atom, Cpu, Layers, BookOpen, ChevronRight } from 'lucide-react';

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
  { id: '13', title: 'Antimatter Factory (AD/ELENA)', category: 'EXPERIMENT', path: '/experiments?id=antimatter-factory', description: 'Penning traps, laser spectroscopy, and CPT gravity tests.' },
  { id: '14', title: 'ALICE Heavy Ions', category: 'EXPERIMENT', path: '/experiments?id=alice', description: 'Quark-Gluon Plasma, elliptic flow v2, and Pb-Pb collisions.' },
  { id: '15', title: 'CERN Open Data Explorer', category: 'SIMULATION', path: '/open-data', description: 'Query metadata and preview public 13 TeV reconstructed collision runs.' },
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-canvas-surface border border-canvas-borderStrong rounded-panel shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-canvas-border bg-canvas-sub">
          <Search className="w-5 h-5 text-text-muted" />
          <input
            autoFocus
            type="text"
            placeholder="Search accelerators, experiments, particles, simulations..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-text-primary text-sm focus:outline-none placeholder:text-text-muted font-mono"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-canvas-border/50">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between p-2.5 rounded cursor-pointer transition-colors ${
                  idx === selectedIndex ? 'bg-canvas-raised text-text-primary' : 'text-text-secondary'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-xs text-text-primary">{item.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-canvas-sub border border-canvas-border text-text-muted">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed line-clamp-1">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted opacity-60" />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-text-muted">
              No matching CERN entities found.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-canvas-border bg-canvas-sub flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>Navigation: ↑ / ↓ to select, Enter to open</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
