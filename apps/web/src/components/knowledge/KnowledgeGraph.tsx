'use client';

import React, { useState } from 'react';
import { Value } from '@/components/provenance/Value';
import { GitBranch, Info, ExternalLink, Filter, Search } from 'lucide-react';

interface GraphNode {
  id: string;
  name: string;
  type: 'ACCELERATOR' | 'EXPERIMENT' | 'DETECTOR' | 'PARTICLE' | 'COMPUTING';
  x: number;
  y: number;
  description: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: 'uses' | 'supplied_by' | 'contains' | 'studies' | 'produces';
  evidence: string;
  sourceUrl: string;
}

const NODES: GraphNode[] = [
  { id: 'lhc', name: 'Large Hadron Collider', type: 'ACCELERATOR', x: 280, y: 160, description: '27 km superconducting collider operating at 13.6 TeV.' },
  { id: 'sps', name: 'Super Proton Synchrotron', type: 'ACCELERATOR', x: 120, y: 160, description: '450 GeV pre-accelerator and injector to the LHC.' },
  { id: 'atlas', name: 'ATLAS Experiment', type: 'EXPERIMENT', x: 440, y: 90, description: 'General-purpose detector studying electroweak and Higgs physics.' },
  { id: 'cms', name: 'CMS Experiment', type: 'EXPERIMENT', x: 440, y: 230, description: 'General-purpose solenoid detector cross-checking ATLAS discoveries.' },
  { id: 'higgs', name: 'Higgs Boson (H0)', type: 'PARTICLE', x: 600, y: 160, description: '125.25 GeV scalar boson discovered by ATLAS & CMS in 2012.' },
  { id: 'wlcg', name: 'WLCG Computing Grid', type: 'COMPUTING', x: 340, y: 310, description: 'Global distributed network of 170+ computing sites processing LHC data.' },
  { id: 'calorimeter', name: 'LAr Calorimeter', type: 'DETECTOR', x: 550, y: 50, description: 'Liquid argon sampling calorimeter measuring electrons and photons.' },
];

const EDGES: GraphEdge[] = [
  { id: 'e1', source: 'sps', target: 'lhc', relation: 'supplied_by', evidence: 'The SPS accelerates protons to 450 GeV and transfers them into the LHC via the TI2 and TI8 tunnels.', sourceUrl: 'https://home.cern/science/accelerators/large-hadron-collider' },
  { id: 'e2', source: 'lhc', target: 'atlas', relation: 'contains', evidence: 'ATLAS is located at Interaction Point 1 on the LHC ring in Meyrin, Switzerland.', sourceUrl: 'https://home.cern/science/experiments/atlas' },
  { id: 'e3', source: 'lhc', target: 'cms', relation: 'contains', evidence: 'CMS is located at Interaction Point 5 on the LHC ring in Cessy, France.', sourceUrl: 'https://home.cern/science/experiments/cms' },
  { id: 'e4', source: 'atlas', target: 'higgs', relation: 'studies', evidence: 'ATLAS discovered the Higgs boson in 2012 and performs precision couplings measurements in Run 3.', sourceUrl: 'https://pdg.lbl.gov/2024/listings/rpp2024-list-higgs-boson.pdf' },
  { id: 'e5', source: 'cms', target: 'higgs', relation: 'studies', evidence: 'CMS independently discovered the Higgs boson in diphoton and 4-lepton decay channels in 2012.', sourceUrl: 'https://pdg.lbl.gov/2024/listings/rpp2024-list-higgs-boson.pdf' },
  { id: 'e6', source: 'atlas', target: 'calorimeter', relation: 'contains', evidence: 'The accordion liquid-argon calorimeter is the primary electromagnetic detector inside ATLAS.', sourceUrl: 'https://cds.cern.ch/record/782076' },
  { id: 'e7', source: 'atlas', target: 'wlcg', relation: 'produces', evidence: 'ATLAS sends reconstructed AOD and raw collision event files directly to the WLCG Tier-0 tape archive.', sourceUrl: 'https://wlcg.web.cern.ch/' },
];

export const KnowledgeGraph: React.FC = () => {
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(NODES[0]);

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'ACCELERATOR':
        return '#00E5FF';
      case 'EXPERIMENT':
        return '#4C7DFF';
      case 'PARTICLE':
        return '#FFB020';
      case 'DETECTOR':
        return '#00FF66';
      case 'COMPUTING':
        return '#FF0055';
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
      {/* Visual Force-Directed Canvas */}
      <div className="flex-1 flex flex-col justify-between bg-canvas border-2 border-black shadow-[3px_3px_0px_#000] p-4 relative min-h-[460px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3.5 mb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
              /// CERN SCIENTIFIC KNOWLEDGE &amp; EVIDENCE GRAPH ///
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cern-cyan font-bold px-2 py-0.5 bg-black border-2 border-black shadow-[2px_2px_0px_#00E5FF]">
            CLICK NODES OR ARROWS
          </span>
        </div>

        {/* SVG Graph Viewport */}
        <div className="w-full h-80 flex items-center justify-center relative select-none">
          <svg viewBox="0 0 720 380" className="w-full h-full max-w-2xl">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="14"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#6B7C99" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="8"
                markerHeight="6"
                refX="14"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#00E5FF" />
              </marker>
            </defs>

            {/* Edges */}
            {EDGES.map((edge) => {
              const src = NODES.find((n) => n.id === edge.source)!;
              const tgt = NODES.find((n) => n.id === edge.target)!;
              const isSelected = selectedEdge?.id === edge.id;

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g
                  key={edge.id}
                  onClick={() => setSelectedEdge(edge)}
                  className="cursor-pointer group"
                >
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isSelected ? '#00E5FF' : '#2A3B5C'}
                    strokeWidth={isSelected ? '3' : '2'}
                    markerEnd={isSelected ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                    className="transition-colors group-hover:stroke-cern-cyan"
                  />
                  {/* Relation Label Pill */}
                  <rect
                    x={midX - 30}
                    y={midY - 9}
                    width="60"
                    height="18"
                    fill="#000000"
                    stroke={isSelected ? '#00E5FF' : '#000000'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    fill={isSelected ? '#00E5FF' : '#C8D7F0'}
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {edge.relation}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.type);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? '24' : '20'}
                    fill="#0D1422"
                    stroke={isSelected ? '#FFFFFF' : color}
                    strokeWidth={isSelected ? '4' : '2.5'}
                    className="transition-all group-hover:stroke-white"
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    fill="#FFFFFF"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node.id.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t-2 border-black flex flex-wrap gap-3 text-[11px] font-mono text-white font-bold">
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-canvas-sub border border-black shadow-[1px_1px_0px_#000]">
            <span className="w-2.5 h-2.5 bg-[#00E5FF] border border-black" /> Accelerators
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-canvas-sub border border-black shadow-[1px_1px_0px_#000]">
            <span className="w-2.5 h-2.5 bg-[#4C7DFF] border border-black" /> Experiments
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-canvas-sub border border-black shadow-[1px_1px_0px_#000]">
            <span className="w-2.5 h-2.5 bg-[#FFB020] border border-black" /> Particles
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-canvas-sub border border-black shadow-[1px_1px_0px_#000]">
            <span className="w-2.5 h-2.5 bg-[#00FF66] border border-black" /> Detectors
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-canvas-sub border border-black shadow-[1px_1px_0px_#000]">
            <span className="w-2.5 h-2.5 bg-[#FF0055] border border-black" /> Computing
          </span>
        </div>
      </div>

      {/* RIGHT: Selected Node & Edge Evidence Drawer */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-3 border-black shadow-[5px_5px_0px_#000] p-4 space-y-4">
        <div className="space-y-4">
          <div className="pb-2 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5 tracking-wider">
              <Info className="w-4 h-4 text-cern-cyan" /> /// Evidence Inspector ///
            </h3>
          </div>

          {selectedEdge ? (
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <span className="text-[10px] font-mono text-text-muted uppercase block font-bold">
                  Relationship Edge
                </span>
                <div className="font-mono font-bold text-cern-cyan text-sm mt-0.5 px-2 py-1 bg-black border-2 border-black shadow-[2px_2px_0px_#000]">
                  {selectedEdge.source.toUpperCase()} ──[{selectedEdge.relation}]──&gt;{' '}
                  {selectedEdge.target.toUpperCase()}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-text-muted uppercase block mb-1 font-bold">
                  Authoritative Evidence Citation
                </span>
                <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] text-text-secondary font-sans">
                  {selectedEdge.evidence}
                </div>
              </div>

              <a
                href={selectedEdge.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-cern-blue hover:bg-cern-accent border-2 border-black shadow-[3px_3px_0px_#00E5FF] text-white text-xs font-mono font-bold transition-all active:translate-x-[1px] active:translate-y-[1px]"
              >
                <span>Verify Source Documentation</span>
                <ExternalLink className="w-4 h-4 text-cern-cyan" />
              </a>
            </div>
          ) : selectedNode ? (
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="px-2 py-0.5 text-[10px] font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] uppercase"
                    style={{ backgroundColor: getNodeColor(selectedNode.type), color: '#000000' }}
                  >
                    {selectedNode.type}
                  </span>
                </div>
                <h4 className="text-base font-display font-extrabold text-white">
                  {selectedNode.name}
                </h4>
              </div>

              <p className="text-text-secondary font-sans">{selectedNode.description}</p>

              <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] text-[11px] font-mono text-text-muted font-bold">
                Tip: Click any relationship arrow connecting to this entity to view verifiable
                scientific evidence.
              </div>
            </div>
          ) : null}
        </div>

        <div className="pt-3 border-t-2 border-black text-[11px] font-mono text-text-muted font-bold">
          <span>/// Graph Integrity: Sourced Claims Only ///</span>
        </div>
      </div>
    </div>
  );
};
