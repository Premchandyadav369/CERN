'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Value } from '@/components/provenance/Value';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { useGlobalStore } from '@/lib/store';
import {
  Activity,
  ArrowRight,
  Zap,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface MachineNode {
  id: string;
  name: string;
  type: string;
  energy: string;
  particles: string;
  purpose: string;
  status: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  route: string;
  manifestId: string;
  fidelity: 'ANALYTIC' | 'TOY' | 'MONTE CARLO' | 'ILLUSTRATIVE';
  experiments: string[];
}

const MACHINES: MachineNode[] = [
  {
    id: 'linac4',
    name: 'Linac4',
    type: 'Linear Accelerator',
    energy: '160 MeV',
    particles: 'H- ions',
    purpose: 'Initial linear acceleration of negative hydrogen ions into the complex.',
    status: 'OPERATIONAL',
    cx: 120,
    cy: 280,
    r: 16,
    color: '#00E5FF',
    route: '/accelerators?id=linac4',
    manifestId: 'lhc-nominal-beam-energy-run3',
    fidelity: 'ANALYTIC',
    experiments: ['PS Booster'],
  },
  {
    id: 'psb',
    name: 'PS Booster',
    type: '4-Ring Synchrotron',
    energy: '2.0 GeV',
    particles: 'Protons',
    purpose: 'Boosts beam brightness and energy before transfer to the PS and ISOLDE target.',
    status: 'OPERATIONAL',
    cx: 210,
    cy: 280,
    r: 22,
    color: '#00E5FF',
    route: '/accelerators?id=psb',
    manifestId: 'lhc-nominal-beam-energy-run3',
    fidelity: 'ANALYTIC',
    experiments: ['ISOLDE', 'Proton Synchrotron'],
  },
  {
    id: 'ps',
    name: 'Proton Synchrotron (PS)',
    type: 'Synchrotron (628 m)',
    energy: '26 GeV',
    particles: 'Protons, Heavy ions',
    purpose: 'Central distributor operating since 1959. Feeds SPS, AD, and n_TOF.',
    status: 'OPERATIONAL',
    cx: 330,
    cy: 280,
    r: 34,
    color: '#4C7DFF',
    route: '/accelerators?id=ps',
    manifestId: 'lhc-nominal-beam-energy-run3',
    fidelity: 'ANALYTIC',
    experiments: ['Antimatter Factory (AD/ELENA)', 'n_TOF', 'East Area (CLOUD)', 'SPS'],
  },
  {
    id: 'ad',
    name: 'Antimatter Factory (AD/ELENA)',
    type: 'Decelerator & Cooler',
    energy: '100 keV',
    particles: 'Antiprotons',
    purpose: 'Decelerates antiprotons for precision antimatter synthesis and CPT tests.',
    status: 'OPERATIONAL',
    cx: 330,
    cy: 160,
    r: 22,
    color: '#FFB020',
    route: '/experiments?id=antimatter-factory',
    manifestId: 'lhc-nominal-beam-energy-run3',
    fidelity: 'ANALYTIC',
    experiments: ['ALPHA', 'AEgIS', 'ASACUSA', 'BASE', 'GBAR'],
  },
  {
    id: 'sps',
    name: 'Super Proton Synchrotron (SPS)',
    type: 'Synchrotron (6.9 km)',
    energy: '450 GeV',
    particles: 'Protons, Lead ions',
    purpose: 'Final high-energy injector for the LHC. Feeds North Area and AWAKE.',
    status: 'OPERATIONAL',
    cx: 480,
    cy: 280,
    r: 54,
    color: '#4C7DFF',
    route: '/accelerators?id=sps',
    manifestId: 'lhc-nominal-beam-energy-run3',
    fidelity: 'ANALYTIC',
    experiments: ['North Area (NA61, NA62, NA64)', 'AWAKE', 'LHC'],
  },
  {
    id: 'awake',
    name: 'AWAKE',
    type: 'Plasma Wakefield Accelerator',
    energy: '2.0 GeV (electrons)',
    particles: 'Electrons in Rubidium Plasma',
    purpose: 'Proves proton-driven plasma wakefield acceleration with gradients > 1 GV/m.',
    status: 'OPERATIONAL',
    cx: 480,
    cy: 130,
    r: 20,
    color: '#FF0055',
    route: '/experiments?id=awake',
    manifestId: 'lhc-nominal-beam-energy-run3',
    fidelity: 'ANALYTIC',
    experiments: ['Advanced Plasma Acceleration'],
  },
  {
    id: 'lhc',
    name: 'Large Hadron Collider (LHC)',
    type: 'Superconducting Collider (26.7 km)',
    energy: '6.8 TeV per beam (13.6 TeV sqrt(s))',
    particles: 'Protons, Pb82+ ions',
    purpose: 'World’s highest energy circular collider exploring the Higgs and new physics.',
    status: 'OPERATIONAL (Run 3)',
    cx: 740,
    cy: 280,
    r: 105,
    color: '#00E5FF',
    route: '/simulations?module=lhc',
    manifestId: 'lhc-nominal-beam-energy-run3',
    fidelity: 'ANALYTIC',
    experiments: ['ATLAS', 'CMS', 'ALICE', 'LHCb', 'TOTEM', 'FASER', 'SND@LHC'],
  },
];

const COLLISION_POINTS = [
  { id: 'atlas', name: 'ATLAS (Point 1)', cx: 740, cy: 175, desc: 'General-purpose discovery detector', route: '/detectors?detector=atlas' },
  { id: 'alice', name: 'ALICE (Point 2)', cx: 845, cy: 280, desc: 'Heavy ion quark-gluon plasma', route: '/experiments?id=alice' },
  { id: 'cms', name: 'CMS (Point 5)', cx: 740, cy: 385, desc: 'Compact muon solenoid detector', route: '/detectors?detector=cms' },
  { id: 'lhcb', name: 'LHCb (Point 8)', cx: 635, cy: 280, desc: 'Flavour physics and CP violation', route: '/experiments?id=lhcb' },
];

export const RingMap: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('lhc');
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  const selectedMachine = MACHINES.find((m) => m.id === selectedId) || MACHINES[6];

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
      {/* Interactive SVG Canvas Area */}
      <div className="flex-1 flex flex-col justify-between bg-canvas border-2 border-black shadow-[3px_3px_0px_#000] p-4 relative min-h-[460px]">
        {/* Canvas Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3.5 mb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
              /// CERN ACCELERATOR COMPLEX &amp; RING SCHEMATIC ///
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold px-2 py-0.5 bg-black border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="w-2 h-2 rounded-none bg-emerald-400 animate-pulse" /> LIVE SCHEMA
            </span>
            <span className="hidden sm:inline font-bold text-white">CLICK TO INSPECT</span>
          </div>
        </div>

        {/* SVG Diagram Canvas */}
        <div className="w-full h-full flex items-center justify-center py-4 overflow-x-auto">
          <svg
            viewBox="0 0 920 460"
            className="w-full max-w-4xl h-auto select-none"
            style={{ minWidth: '640px' }}
          >
            <defs>
              <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4C7DFF" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Beam Transfer Lines */}
            {/* Hydrogen source into Linac4 */}
            <path
              d="M 50 280 L 120 280"
              stroke="#6B7C99"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Linac4 -> PSB */}
            <path d="M 136 280 L 188 280" stroke="#00E5FF" strokeWidth="3" />
            {/* PSB -> PS */}
            <path d="M 232 280 L 296 280" stroke="#00E5FF" strokeWidth="3" />
            {/* PS -> SPS */}
            <path d="M 364 280 L 426 280" stroke="#4C7DFF" strokeWidth="3" />
            {/* SPS -> LHC (TI2 and TI8 transfer lines) */}
            <path d="M 534 280 L 635 280" stroke="#00E5FF" strokeWidth="3.5" />

            {/* Branch Lines: PS -> AD */}
            <path d="M 330 246 L 330 182" stroke="#FFB020" strokeWidth="2.5" />
            {/* Branch Lines: SPS -> AWAKE */}
            <path d="M 480 226 L 480 150" stroke="#FF0055" strokeWidth="2.5" />

            {/* Machine Rings Rendering */}
            {MACHINES.map((m) => {
              const isSelected = m.id === selectedId;
              return (
                <g
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className="cursor-pointer group"
                >
                  {/* Outer ring when selected */}
                  {isSelected && (
                    <circle
                      cx={m.cx}
                      cy={m.cy}
                      r={m.r + 7}
                      fill="none"
                      stroke={m.color}
                      strokeWidth="3"
                      strokeDasharray="6 3"
                      className={!reduceMotion ? 'animate-spin origin-center' : ''}
                      style={{ transformOrigin: `${m.cx}px ${m.cy}px` }}
                    />
                  )}

                  {/* Main Ring Body */}
                  <circle
                    cx={m.cx}
                    cy={m.cy}
                    r={m.r}
                    fill={isSelected ? '#131C2E' : '#0D1422'}
                    stroke={isSelected ? '#FFFFFF' : m.color}
                    strokeWidth={isSelected ? '4' : '2.5'}
                    className="transition-all duration-150 group-hover:stroke-white"
                  />

                  {/* Internal Label */}
                  <text
                    x={m.cx}
                    y={m.cy + 4}
                    fill="#FFFFFF"
                    fontSize={m.r > 35 ? '12' : '10'}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {m.id.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* Four Major LHC Interaction Points */}
            {COLLISION_POINTS.map((ip) => (
              <g
                key={ip.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(ip.id === 'atlas' || ip.id === 'cms' ? 'lhc' : 'lhc');
                }}
                className="cursor-pointer group"
              >
                <circle
                  cx={ip.cx}
                  cy={ip.cy}
                  r="8"
                  fill="#FF5C5C"
                  stroke="#000000"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-125"
                />
                <text
                  x={ip.cx}
                  y={ip.cy - 12}
                  fill="#FFFFFF"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {ip.name.split(' ')[0]}
                </text>
              </g>
            ))}

            {/* Start Source Indicator */}
            <circle cx="45" cy="280" r="6" fill="#00E5FF" stroke="#000000" strokeWidth="2" />
            <text
              x="45"
              y="306"
              fill="#FFFFFF"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              H+ Source
            </text>
          </svg>
        </div>

        {/* Canvas Bottom Ticker */}
        <div className="pt-2.5 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-text-muted">
          <span className="font-bold text-white">Active View: {selectedMachine.name}</span>
          <span className="flex items-center gap-2">
            <span className="font-bold text-text-secondary">Rigidity:</span>
            <Value manifestId={selectedMachine.manifestId} value="23350" unit="T·m" />
          </span>
        </div>
      </div>

      {/* Right Details Panel for Selected Machine */}
      <div className="w-full xl:w-96 flex flex-col justify-between bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] p-5 space-y-4">
        <div className="space-y-4">
          {/* Header & Badges */}
          <div className="border-b-2 border-black pb-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-emerald-400 text-black border-2 border-black shadow-[2px_2px_0px_#000] uppercase">
                {selectedMachine.status}
              </span>
              <FidelityBadge type={selectedMachine.fidelity} />
            </div>
            <h2 className="text-xl font-display font-extrabold text-white">
              {selectedMachine.name}
            </h2>
            <p className="text-xs text-cern-cyan font-mono font-bold mt-1 uppercase tracking-wider">{selectedMachine.type}</p>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-sans">
            {selectedMachine.purpose}
          </p>

          {/* Machine Parameters Monospace Grid */}
          <div className="space-y-2 pt-2 border-t-2 border-black font-mono">
            <div className="flex items-center justify-between text-xs py-2 px-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted font-bold">Energy:</span>
              <span className="text-white font-bold">
                {selectedMachine.energy}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-2 px-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted font-bold">Particle Type:</span>
              <span className="text-text-secondary font-bold">{selectedMachine.particles}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2 px-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted font-bold">Nominal B-Field:</span>
              <Value manifestId="lhc-dipole-field-nominal" value={8.33} unit="T" digits={2} />
            </div>
            <div className="flex items-center justify-between text-xs py-2 px-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-text-muted font-bold">Beam Velocity:</span>
              <span className="text-emerald-400 font-bold">0.999999991 c</span>
            </div>
          </div>

          {/* Experiments Served */}
          <div>
            <span className="text-[11px] font-mono uppercase text-white block mb-1.5 font-bold">
              /// Experiments &amp; Facilities Served ///
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedMachine.experiments.map((exp) => (
                <span
                  key={exp}
                  className="px-2.5 py-1 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] text-cern-cyan font-mono font-bold"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t-2 border-black">
          <Link
            href={selectedMachine.route}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cern-blue hover:bg-cern-accent text-white font-mono font-bold text-xs uppercase border-2 border-black shadow-[4px_4px_0px_#00E5FF] hover:shadow-[5px_5px_0px_#00E5FF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <span>Launch {selectedMachine.id.toUpperCase()} Environment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
