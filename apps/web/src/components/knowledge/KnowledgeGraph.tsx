'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { GitBranch, Info, ExternalLink, Compass } from 'lucide-react';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'ACCELERATOR' | 'EXPERIMENT' | 'PARTICLE' | 'COMPUTING' | 'SPINOFF';
  description: string;
}

interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  evidence: string;
  sourceUrl: string;
}

const RAW_NODES: Omit<GraphNode, 'x' | 'y' | 'vx' | 'vy'>[] = [
  { id: 'linac4', name: 'Linac4 (160 MeV)', type: 'ACCELERATOR', description: 'Starts every proton journey by accelerating H⁻ ions to 160 MeV.' },
  { id: 'psb', name: 'PS Booster (2 GeV)', type: 'ACCELERATOR', description: '4 superimposed rings boosting brightness for PS and ISOLDE.' },
  { id: 'ps', name: 'Proton Synchrotron', type: 'ACCELERATOR', description: '628 m central hub running since 1959; feeds SPS, AD, EAST, n_TOF.' },
  { id: 'sps', name: 'SPS (450 GeV)', type: 'ACCELERATOR', description: '6.9 km workhorse injecting LHC and powering North Area & AWAKE.' },
  { id: 'lhc', name: 'LHC (27 km)', type: 'ACCELERATOR', description: 'World flagship superconducting collider at 13.6 TeV.' },
  { id: 'hllhc', name: 'HL-LHC / FCC', type: 'ACCELERATOR', description: '12 T Nb₃Sn crab-cavity upgrade & 91 km FCC study.' },
  { id: 'atlas', name: 'ATLAS', type: 'EXPERIMENT', description: '46 m general-purpose barrel detector at Point 1.' },
  { id: 'cms', name: 'CMS', type: 'EXPERIMENT', description: 'Compact 3.8 T solenoid & PbWO₄ crystal detector at Point 5.' },
  { id: 'alice', name: 'ALICE', type: 'EXPERIMENT', description: 'Heavy-ion QGP spectrometer recreating Big Bang soup.' },
  { id: 'lhcb', name: 'LHCb', type: 'EXPERIMENT', description: 'Forward flavour & RICH spectrometer probing matter-antimatter CP violation.' },
  { id: 'isolde', name: 'ISOLDE', type: 'EXPERIMENT', description: 'Produces >1,300 rare radioactive nuclei via mass separation.' },
  { id: 'ad', name: 'AD / ALPHA-g', type: 'EXPERIMENT', description: 'Antimatter Factory decelerating antiprotons to 100 keV.' },
  { id: 'awake', name: 'AWAKE', type: 'EXPERIMENT', description: 'Proton-driven plasma wakefield accelerator (>1 GV/m).' },
  { id: 'na62', name: 'NA62 / CLOUD', type: 'EXPERIMENT', description: 'Rare kaon decays & cosmic-ray cloud aerosol nucleation chambers.' },
  { id: 'higgs', name: 'Higgs H⁰ & Z⁰/W±', type: 'PARTICLE', description: 'Electroweak symmetry breaking bosons discovered at CERN.' },
  { id: 'qgp', name: 'Quark-Gluon Plasma', type: 'PARTICLE', description: 'Deconfined primordial fluid of quarks and gluons.' },
  { id: 'wlcg', name: 'WLCG Grid', type: 'COMPUTING', description: '170 computing centres storing >1.5 Exabytes globally.' },
  { id: 'www', name: 'World Wide Web', type: 'COMPUTING', description: 'Invented by Tim Berners-Lee at CERN in 1989 (HTTP/HTML).' },
  { id: 'medipix', name: 'Medipix3 / Space', type: 'SPINOFF', description: 'Color spectral medical X-ray & ISS radiation chips from LHC trackers.' },
  { id: 'medicis', name: 'MEDICIS / Hadron', type: 'SPINOFF', description: 'Targeted radioisotopes (¹⁶¹Tb) & carbon/proton cancer therapy.' },
];

const RAW_EDGES: GraphEdge[] = [
  { source: 'linac4', target: 'psb', relation: 'injects', evidence: 'Strips electrons from H⁻ into PSB 4 rings.', sourceUrl: 'https://home.cern/science/accelerators/linear-accelerator-4' },
  { source: 'psb', target: 'ps', relation: 'injects', evidence: 'Transfers 2.0 GeV protons into the PS.', sourceUrl: 'https://home.cern/science/accelerators/proton-synchrotron-booster' },
  { source: 'psb', target: 'isolde', relation: 'feeds', evidence: '1.4–2.0 GeV protons strike UCx/Ta targets for exotic nuclei.', sourceUrl: 'https://home.cern/science/experiments/isolde' },
  { source: 'ps', target: 'sps', relation: 'injects', evidence: 'Delivers 25 ns 26 GeV bunch trains to SPS.', sourceUrl: 'https://home.cern/science/accelerators/proton-synchrotron' },
  { source: 'ps', target: 'ad', relation: 'feeds', evidence: '26 GeV protons strike iridium targets producing antiprotons.', sourceUrl: 'https://home.cern/science/experiments/antimatter-factory' },
  { source: 'ps', target: 'na62', relation: 'feeds', evidence: 'East Area pions supply CLOUD cosmic-ray aerosol tests.', sourceUrl: 'https://home.cern/science/experiments/cloud' },
  { source: 'sps', target: 'lhc', relation: 'injects', evidence: 'Injects 450 GeV bunches via TI2 & TI8 tunnels.', sourceUrl: 'https://home.cern/science/accelerators/large-hadron-collider' },
  { source: 'sps', target: 'awake', relation: 'drives', evidence: '400 GeV bunches create rubidium plasma wakefields.', sourceUrl: 'https://home.cern/science/experiments/awake' },
  { source: 'sps', target: 'na62', relation: 'feeds', evidence: '400 GeV protons probe rare K+ -> pi+ nu nu-bar at NA62.', sourceUrl: 'https://home.cern/science/experiments/na62' },
  { source: 'lhc', target: 'hllhc', relation: 'upgrades_to', evidence: 'HL-LHC increases luminosity 5–10x; FCC scales to 91 km.', sourceUrl: 'https://home.cern/science/accelerators/high-luminosity-lhc' },
  { source: 'lhc', target: 'atlas', relation: 'hosts', evidence: 'Collides beams inside IP1 ATLAS.', sourceUrl: 'https://home.cern/science/experiments/atlas' },
  { source: 'lhc', target: 'cms', relation: 'hosts', evidence: 'Collides beams inside IP5 CMS.', sourceUrl: 'https://home.cern/science/experiments/cms' },
  { source: 'lhc', target: 'alice', relation: 'hosts', evidence: 'Heavy Pb-Pb ions collide inside IP2 ALICE.', sourceUrl: 'https://home.cern/science/experiments/alice' },
  { source: 'lhc', target: 'lhcb', relation: 'hosts', evidence: 'Forward b/c hadron decays recorded at IP8 LHCb.', sourceUrl: 'https://home.cern/science/experiments/lhcb' },
  { source: 'atlas', target: 'higgs', relation: 'discovered', evidence: 'Jointly observed 125 GeV Higgs boson in 2012.', sourceUrl: 'https://pdg.lbl.gov/' },
  { source: 'cms', target: 'higgs', relation: 'discovered', evidence: 'Independently observed Higgs in diphoton & ZZ* modes.', sourceUrl: 'https://pdg.lbl.gov/' },
  { source: 'alice', target: 'qgp', relation: 'recreates', evidence: 'Measures elliptic flow v2 of Quark-Gluon Plasma.', sourceUrl: 'https://home.cern/science/experiments/alice' },
  { source: 'atlas', target: 'wlcg', relation: 'streams_to', evidence: '1–3 kHz event data archived globally across Tier-0/1/2.', sourceUrl: 'https://wlcg.web.cern.ch/' },
  { source: 'cms', target: 'wlcg', relation: 'streams_to', evidence: 'Open Data & Run 3 datasets distributed via WLCG.', sourceUrl: 'https://opendata.cern.ch/' },
  { source: 'wlcg', target: 'www', relation: 'descends_from', evidence: 'Built on global hypertext sharing pioneered by WWW in 1989.', sourceUrl: 'https://home.cern/science/computing/birth-web' },
  { source: 'lhcb', target: 'medipix', relation: 'spun_off', evidence: 'Silicon hybrid pixel ASICs birthed color medical X-ray chips.', sourceUrl: 'https://medipix.web.cern.ch/' },
  { source: 'isolde', target: 'medicis', relation: 'powers', evidence: 'Harvests targeted terbium isotopes for cancer radiotherapy.', sourceUrl: 'https://medicis.cern/' },
];

export const KnowledgeGraph: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('lhc');
  const [pathTargetId, setPathTargetId] = useState<string>('medipix');
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Run deterministic D3 force layout once on mount to compute balanced graph geometry
  useEffect(() => {
    const nodes: GraphNode[] = RAW_NODES.map((n, i) => ({
      ...n,
      x: 360 + Math.cos(i * 0.6) * 140,
      y: 200 + Math.sin(i * 0.6) * 110,
    }));
    const links = RAW_EDGES.map((e) => ({ source: e.source, target: e.target }));

    const sim = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(68))
      .force('charge', d3.forceManyBody().strength(-240))
      .force('center', d3.forceCenter(360, 200))
      .force('collide', d3.forceCollide(30))
      .stop();

    for (let i = 0; i < 220; i++) sim.tick();

    const posMap: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      posMap[n.id] = {
        x: Math.max(54, Math.min(666, n.x || 360)),
        y: Math.max(36, Math.min(364, n.y || 200)),
      };
    });
    setPositions(posMap);
  }, []);

  // Undirected BFS Shortest Path Tracer between selectedNodeId and pathTargetId
  const shortestPath = useMemo(() => {
    const adj: Record<string, string[]> = {};
    RAW_NODES.forEach((n) => (adj[n.id] = []));
    RAW_EDGES.forEach((e) => {
      adj[e.source]?.push(e.target);
      adj[e.target]?.push(e.source);
    });

    const queue: string[][] = [[selectedNodeId]];
    const visited = new Set([selectedNodeId]);
    while (queue.length > 0) {
      const path = queue.shift()!;
      const curr = path[path.length - 1];
      if (curr === pathTargetId) return path;
      for (const nxt of adj[curr] || []) {
        if (!visited.has(nxt)) {
          visited.add(nxt);
          queue.push([...path, nxt]);
        }
      }
    }
    return [];
  }, [selectedNodeId, pathTargetId]);

  const pathEdgeSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < shortestPath.length - 1; i++) {
      const a = shortestPath[i];
      const b = shortestPath[i + 1];
      set.add(`${a}->${b}`);
      set.add(`${b}->${a}`);
    }
    return set;
  }, [shortestPath]);

  const selectedNode = RAW_NODES.find((n) => n.id === selectedNodeId) || RAW_NODES[0];
  const connectedEdges = RAW_EDGES.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId);

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'ACCELERATOR': return '#00E5FF';
      case 'EXPERIMENT': return '#4C7DFF';
      case 'PARTICLE': return '#FFE600';
      case 'COMPUTING': return '#00FF66';
      case 'SPINOFF': return '#FF0055';
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
      {/* Force-Directed D3 Canvas */}
      <div className="flex-1 flex flex-col justify-between bg-canvas border-2 border-black shadow-[3px_3px_0px_#000] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3.5">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
              D3 CERN Scientific Constellation (20 Nodes · Trace Path)
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-text-muted">Trace to:</span>
            <select
              value={pathTargetId}
              onChange={(e) => setPathTargetId(e.target.value)}
              className="bg-black text-[#FFE600] border border-black px-2 py-0.5 font-bold"
            >
              {RAW_NODES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full h-[380px] min-h-[340px] bg-[#050811] border border-black relative overflow-hidden">
          <svg viewBox="0 0 720 400" className="w-full h-full min-h-[340px] block">
            {RAW_EDGES.map((e, idx) => {
              const p1 = positions[e.source];
              const p2 = positions[e.target];
              if (!p1 || !p2) return null;
              const onPath = pathEdgeSet.has(`${e.source}->${e.target}`);
              const touchesSel = e.source === selectedNodeId || e.target === selectedNodeId;
              return (
                <line
                  key={idx}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={onPath ? '#FFE600' : touchesSel ? '#00E5FF' : '#334155'}
                  strokeWidth={onPath ? 3 : touchesSel ? 2 : 1.2}
                  strokeOpacity={onPath ? 1 : touchesSel ? 0.85 : 0.45}
                />
              );
            })}

            {RAW_NODES.map((n) => {
              const pos = positions[n.id];
              if (!pos) return null;
              const isSelected = n.id === selectedNodeId;
              const inPath = shortestPath.includes(n.id);
              const color = getNodeColor(n.type);
              return (
                <g
                  key={n.id}
                  onClick={() => setSelectedNodeId(n.id)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 15 : inPath ? 12 : 9}
                    fill={color}
                    stroke={isSelected || inPath ? '#FFFFFF' : '#000000'}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 22}
                    fill={isSelected || inPath ? '#FFFFFF' : '#94A3B8'}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {n.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Shortest Path Chain Strip */}
        <div className="p-2.5 bg-canvas-surface border-2 border-black text-[11px] font-mono flex flex-wrap items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#FFE600]" />
          <span className="text-text-muted font-bold">Shortest Connection:</span>
          {shortestPath.map((id, i) => (
            <React.Fragment key={id}>
              <span className="px-1.5 py-0.5 bg-black text-[#FFE600] border border-black font-bold">
                {RAW_NODES.find((n) => n.id === id)?.name}
              </span>
              {i < shortestPath.length - 1 && <span className="text-cern-cyan">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Side Inspector */}
      <div className="w-full xl:w-80 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] p-4 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="pb-2 border-b-2 border-black bg-canvas-sub -mx-4 -mt-4 p-3.5">
            <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cern-cyan" /> Node Inspector
            </h3>
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-2">
            <span
              className="inline-block text-[10px] font-mono font-black px-2 py-0.5 text-black border border-black"
              style={{ backgroundColor: getNodeColor(selectedNode.type) }}
            >
              {selectedNode.type}
            </span>
            <h4 className="text-lg font-display font-black text-white">{selectedNode.name}</h4>
            <p className="text-xs text-text-secondary font-sans leading-relaxed">{selectedNode.description}</p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-text-muted block">
              Direct Causal Links ({connectedEdges.length})
            </span>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {connectedEdges.map((edge, idx) => (
                <div key={idx} className="p-2.5 bg-canvas-sub border-2 border-black text-[11px] font-mono space-y-1">
                  <div className="text-cern-cyan font-bold">
                    {edge.source} —[{edge.relation}]→ {edge.target}
                  </div>
                  <p className="text-text-secondary font-sans text-[11px]">{edge.evidence}</p>
                  <a
                    href={edge.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    <span>CERN Citation</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
