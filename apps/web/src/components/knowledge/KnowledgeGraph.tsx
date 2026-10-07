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
        return '#3DD6FF';
      case 'EXPERIMENT':
        return '#4C7DFF';
      case 'PARTICLE':
        return '#FFB020';
      case 'DETECTOR':
        return '#2ECC8F';
      case 'COMPUTING':
        return '#E04FD0';
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border border-canvas-border rounded-panel">
      {/* Visual Force-Directed Canvas */}
      <div className="flex-1 flex flex-col justify-between bg-canvas rounded-panel border border-canvas-border p-4 relative min-h-[460px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-text-primary font-bold">
              CERN SCIENTIFIC KNOWLEDGE &amp; EVIDENCE GRAPH
            </h3>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Click nodes or edge arrows to inspect evidence
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
                <polygon points="0 0, 8 3, 0 6" fill="#3DD6FF" />
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
                    stroke={isSelected ? '#3DD6FF' : '#2A3B5C'}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    markerEnd={isSelected ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                    className="transition-colors group-hover:stroke-cern-accent"
                  />
                  {/* Relation Label Pill */}
                  <rect
                    x={midX - 28}
                    y={midY - 8}
                    width="56"
                    height="16"
                    rx="3"
                    fill="#0D1422"
                    stroke={isSelected ? '#3DD6FF' : '#1C273C'}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    fill={isSelected ? '#3DD6FF' : '#9FB0CC'}
                    fontSize="9"
                    fontFamily="JetBrains Mono"
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
                    r={isSelected ? '22' : '18'}
                    fill="#0D1422"
                    stroke={color}
                    strokeWidth={isSelected ? '3' : '2'}
                    className="transition-all group-hover:stroke-white"
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    fill="#E8EEF9"
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
        <div className="pt-2 border-t border-canvas-border flex flex-wrap gap-3 text-[11px] font-mono text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Accelerators
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Experiments
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Particles
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Detectors
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Computing
          </span>
        </div>
      </div>

      {/* RIGHT: Selected Node & Edge Evidence Drawer */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border border-canvas-border rounded-panel p-4 space-y-4">
        <div className="space-y-4">
          <div className="pb-2 border-b border-canvas-border">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cern-cyan" /> Evidence Inspector
            </h3>
          </div>

          {selectedEdge ? (
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <span className="text-[10px] font-mono text-text-muted uppercase block">
                  Relationship Edge
                </span>
                <div className="font-mono font-bold text-text-primary text-sm mt-0.5">
                  {selectedEdge.source.toUpperCase()} ──[{selectedEdge.relation}]──&gt;{' '}
                  {selectedEdge.target.toUpperCase()}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-text-muted uppercase block mb-1">
                  Authoritative Evidence Citation
                </span>
                <div className="p-3 bg-canvas-sub border border-canvas-border rounded text-text-secondary">
                  {selectedEdge.evidence}
                </div>
              </div>

              <a
                href={selectedEdge.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 bg-canvas-sub hover:bg-canvas-raised border border-canvas-border rounded text-[11px] font-mono text-cern-accent"
              >
                <span>Verify Source Documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : selectedNode ? (
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                    style={{ backgroundColor: `${getNodeColor(selectedNode.type)}20`, color: getNodeColor(selectedNode.type) }}
                  >
                    {selectedNode.type}
                  </span>
                </div>
                <h4 className="text-base font-display font-bold text-text-primary">
                  {selectedNode.name}
                </h4>
              </div>

              <p className="text-text-secondary">{selectedNode.description}</p>

              <div className="p-3 bg-canvas-sub border border-canvas-border rounded text-[11px] font-mono text-text-muted">
                Tip: Click any relationship arrow connecting to this entity to view verifiable
                scientific evidence.
              </div>
            </div>
          ) : null}
        </div>

        <div className="pt-3 border-t border-canvas-border text-[11px] font-mono text-text-muted">
          <span>Graph Integrity: Sourced Claims Only</span>
        </div>
      </div>
    </div>
  );
};
