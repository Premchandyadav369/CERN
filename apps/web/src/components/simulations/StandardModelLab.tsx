'use client';

import React, { useState } from 'react';
import particlesData from '../../../../../content/particles.json';
import { StandardModel3DCanvas } from '@/components/simulations/StandardModel3DCanvas';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { useGlobalStore } from '@/lib/store';
import { Atom, Zap, Sparkles, Shield } from 'lucide-react';

interface ParticleEntry {
  id: string;
  name: string;
  symbol: string;
  pdgId: number;
  type: string;
  family?: string;
  generation?: number;
  charge: number;
  massGev: number;
  spin: string;
  colorCharge?: string;
  interactions?: string[];
  lifetimeSeconds: number | null;
  decayModes: { channel: string; branchingRatio: number }[];
  discoveryYear?: number;
  discoveredAt?: string;
  eli5?: string;
  source: string;
}

const particlesList = particlesData as ParticleEntry[];

function formatMassReadable(massGev: number): string {
  if (massGev === 0) return '0 (Massless)';
  if (massGev < 1e-6) return '< 1 eV/c²';
  if (massGev < 0.001) return `${(massGev * 1000).toFixed(3)} MeV/c²`;
  if (massGev < 1) return `${(massGev * 1000).toFixed(1)} MeV/c²`;
  return `${massGev.toFixed(massGev > 50 ? 2 : 3)} GeV/c²`;
}

export const StandardModelLab: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('higgs');
  const eli5Mode = useGlobalStore((s) => s.eli5Mode);
  const userLevel = useGlobalStore((s) => s.userLevel);
  const showEli5 = eli5Mode || userLevel === 'BEGINNER';

  const selected = particlesList.find((p) => p.id === selectedId) || particlesList[0];

  const quarks = particlesList.filter((p) => p.family === 'QUARK');
  const leptons = particlesList.filter((p) => p.family === 'LEPTON');
  const bosons = particlesList.filter((p) => p.family === 'GAUGE_BOSON' || p.family === 'SCALAR_BOSON');
  const hadrons = particlesList.filter((p) => p.family === 'HADRON');

  const massRatioVsElectron = selected.massGev > 0 ? selected.massGev / 0.000511 : 0;

  return (
    <div className="space-y-5">
      <Eli5Card
        title="The Complete 17-Piece Lego Table of the Universe (Standard Model)"
        analogy="Just like a chemistry periodic table lists all atoms, particle physics has one master table of 17 fundamental bricks! Twelve matter bricks (6 quarks + 6 leptons) snap together using 4 force messengers (gluons, photons, W, Z), while the famous Higgs boson gives them weight!"
        keyPoints={[
          'Quarks (Violet/Blue) feel the Strong nuclear glue and build protons & neutrons.',
          'Leptons (Cyan/Green) include Electrons & Muons plus ghostly Neutrinos that sail straight through planets.',
          'Force Bosons & Higgs (Gold/Magenta) mediate forces and generate mass—click any tile to inspect its live 3D quantum wave!',
        ]}
        whatToTry="Compare the massless Photon (γ) to the ultra-heavy Top Quark (172.69 GeV)—watch the 3D Higgs Yukawa gold rings flare up as mass spans 12 orders of magnitude!"
        doi="10.1103/PhysRevD.110.030001"
        citationLabel="Particle Data Group (PDG 2024 Review of Particle Physics)"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        {/* LEFT: Interactive Standard Model Periodic Grid (7 cols) */}
        <div className="xl:col-span-7 space-y-5">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-sm font-mono font-black uppercase text-white flex items-center gap-2">
              <Atom className="w-4 h-4 text-cern-cyan" /> Standard Model &amp; Hadron Periodic Matrix
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-400 text-black font-bold border border-black">
              PDG 2024 VERIFIED
            </span>
          </div>

          {/* Quarks + Bosons Matrix */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-300 block mb-1.5">
                I. Quarks (Spin 1/2 · Color Charged · Feel All 4 Forces)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quarks.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`p-2.5 border-2 border-black text-left font-mono transition-all ${
                      selectedId === p.id
                        ? 'bg-purple-600 text-white shadow-[3px_3px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                        : 'bg-canvas-surface hover:bg-canvas-raised text-white shadow-[2px_2px_0px_#000]'
                    }`}
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-black text-[#FFE600]">{p.symbol}</span>
                      <span className="text-[9px] text-text-muted">G{p.generation}</span>
                    </div>
                    <div className="text-[10px] font-bold truncate mt-0.5">{p.name.replace(' Quark', '')}</div>
                    <div className="text-[9px] text-cern-cyan truncate">{formatMassReadable(p.massGev)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-cern-cyan block mb-1.5">
                II. Leptons (Spin 1/2 · Charged &amp; Neutral Neutrinos)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {leptons.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`p-2.5 border-2 border-black text-left font-mono transition-all ${
                      selectedId === p.id
                        ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                        : 'bg-canvas-surface hover:bg-canvas-raised text-white shadow-[2px_2px_0px_#000]'
                    }`}
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-black text-cern-cyan">{p.symbol}</span>
                      <span className="text-[9px] text-text-muted">G{p.generation}</span>
                    </div>
                    <div className="text-[10px] font-bold truncate mt-0.5">{p.name.replace(' Lepton', '')}</div>
                    <div className="text-[9px] text-emerald-300 truncate">{formatMassReadable(p.massGev)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-cern-magenta block mb-1.5">
                  III. Force Gauge Bosons &amp; Higgs (Spin 1 &amp; 0)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-3 gap-2">
                  {bosons.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`p-2 border-2 border-black text-left font-mono transition-all ${
                        selectedId === p.id
                          ? 'bg-cern-magenta text-white shadow-[3px_3px_0px_#FFE600] -translate-x-0.5 -translate-y-0.5'
                          : 'bg-canvas-surface hover:bg-canvas-raised text-white shadow-[2px_2px_0px_#000]'
                      }`}
                    >
                      <div className="text-base font-black text-[#FFE600]">{p.symbol}</div>
                      <div className="text-[10px] font-bold truncate">{p.name.replace(' Boson', '')}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1.5">
                  IV. Key Composite Hadrons (Quark Bound States)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {hadrons.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`p-2 border-2 border-black text-left font-mono transition-all ${
                        selectedId === p.id
                          ? 'bg-emerald-600 text-white shadow-[3px_3px_0px_#00FF66] -translate-x-0.5 -translate-y-0.5'
                          : 'bg-canvas-surface hover:bg-canvas-raised text-white shadow-[2px_2px_0px_#000]'
                      }`}
                    >
                      <div className="text-base font-black text-emerald-300">{p.symbol}</div>
                      <div className="text-[10px] font-bold truncate">{p.name.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logarithmic Mass Hierarchy Bar */}
          <div className="p-3 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
            <div className="flex justify-between text-[11px] font-mono font-bold">
              <span className="text-text-muted uppercase">Higgs Yukawa Mass Scale (vs Electron m_e):</span>
              <span className="text-[#FFE600]">
                {selected.massGev === 0 ? '0 × m_e (Protected by Gauge Symmetry)' : `${massRatioVsElectron.toLocaleString('en-US', { maximumFractionDigits: 0 })} × m_e`}
              </span>
            </div>
            <div className="w-full h-3 bg-black border border-black overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cern-cyan via-[#FFE600] to-cern-magenta transition-all duration-300"
                style={{
                  width: `${selected.massGev > 0.0001 ? Math.min(100, Math.max(4, ((Math.log10(selected.massGev) + 4) / 6.3) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: 3D Quantum Field Stage & Particle Inspector (5 cols) */}
        <div className="xl:col-span-5 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-cern-cyan font-bold">{selected.type}</span>
                <h3 className="text-xl font-display font-black text-white flex items-center gap-2">
                  <span className="text-[#FFE600] font-mono">{selected.symbol}</span>
                  <span>{selected.name}</span>
                </h3>
              </div>
              <FidelityBadge type="ANALYTIC" />
            </div>

            <StandardModel3DCanvas
              particleId={selected.id}
              family={selected.family || 'GAUGE_BOSON'}
              massGev={selected.massGev}
              charge={selected.charge}
              interactions={selected.interactions || []}
            />

            {/* Interactions Tags */}
            <div className="flex flex-wrap gap-1.5">
              {['Strong', 'Electromagnetic', 'Weak', 'Higgs'].map((force) => {
                const active = (selected.interactions || []).includes(force);
                return (
                  <span
                    key={force}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold border-2 border-black uppercase ${
                      active
                        ? force === 'Higgs'
                          ? 'bg-[#FFE600] text-black'
                          : force === 'Strong'
                          ? 'bg-emerald-400 text-black'
                          : force === 'Electromagnetic'
                          ? 'bg-cern-cyan text-black'
                          : 'bg-cern-magenta text-white'
                        : 'bg-canvas-sub text-text-muted opacity-40'
                    }`}
                  >
                    {active ? '✓ ' : '× '}
                    {force}
                  </span>
                );
              })}
            </div>

            {/* Plain-English ELI5 explanation vs detailed specs */}
            {selected.eli5 && (
              <div
                className={`p-3 border-2 border-black text-xs leading-relaxed ${
                  showEli5 ? 'bg-amber-300 text-black font-bold shadow-[3px_3px_0px_#000]' : 'bg-canvas-sub text-text-secondary font-sans'
                }`}
              >
                <span className="font-mono text-[10px] uppercase block mb-0.5 opacity-80">
                  {showEli5 ? '👶 ELI5 Intuition:' : 'Physical Role:'}
                </span>
                {selected.eli5}
              </div>
            )}

            {/* Exact PDG Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-canvas-sub border-2 border-black">
                <span className="text-[10px] text-text-muted block uppercase">Rest Mass (PDG)</span>
                <strong className="text-white">{formatMassReadable(selected.massGev)}</strong>
              </div>
              <div className="p-2 bg-canvas-sub border-2 border-black">
                <span className="text-[10px] text-text-muted block uppercase">Charge / Spin</span>
                <strong className="text-cern-cyan">
                  {selected.charge > 0 ? `+${selected.charge.toFixed(2).replace('.00', '')}` : selected.charge.toFixed(2).replace('.00', '')}e · s={selected.spin}
                </strong>
              </div>
              <div className="p-2 bg-canvas-sub border-2 border-black">
                <span className="text-[10px] text-text-muted block uppercase">Color Charge</span>
                <strong className="text-emerald-400">{selected.colorCharge || 'None'}</strong>
              </div>
              <div className="p-2 bg-canvas-sub border-2 border-black">
                <span className="text-[10px] text-text-muted block uppercase">Discovery</span>
                <strong className="text-amber-300 truncate block">{selected.discoveryYear || '—'}</strong>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t-2 border-black text-[10px] font-mono text-text-muted">
            Source: {selected.source} · PDG ID {selected.pdgId}
          </div>
        </div>
      </div>
    </div>
  );
};
