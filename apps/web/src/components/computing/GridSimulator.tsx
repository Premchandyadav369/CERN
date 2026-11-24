'use client';

import React, { useState } from 'react';
import { Value } from '@/components/provenance/Value';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Server, Network, AlertOctagon, CheckCircle2, RefreshCw, Zap, Database } from 'lucide-react';

interface GridNode {
  id: string;
  name: string;
  tier: 'Tier0' | 'Tier1' | 'Tier2';
  location: string;
  storagePb: number;
  cpuCores: number;
  activeJobs: number;
  status: 'ONLINE' | 'CONGESTED' | 'FAILED';
}

export const GridSimulator: React.FC = () => {
  // Scenario Toggle (Run 3 vs High-Luminosity LHC)
  const [isHlLhcMode, setIsHlLhcMode] = useState<boolean>(false);
  const [siteOutage, setSiteOutage] = useState<boolean>(false);

  const eventRateHz = isHlLhcMode ? 10000 : 2500;
  const dataRateGbS = isHlLhcMode ? 15.0 : 3.75;
  const yearlyStoragePb = isHlLhcMode ? 250 : 65;
  const powerConsumptionMw = isHlLhcMode ? 32 : 18;

  // Grid Tiers Topology
  const nodes: GridNode[] = [
    {
      id: 't0',
      name: 'CERN Tier-0 (Meyrin / Prévessin)',
      tier: 'Tier0',
      location: 'Geneva, Switzerland',
      storagePb: isHlLhcMode ? 180 : 70,
      cpuCores: 120000,
      activeJobs: isHlLhcMode ? 95000 : 42000,
      status: 'ONLINE',
    },
    {
      id: 't1-ral',
      name: 'RAL (Rutherford Appleton Lab)',
      tier: 'Tier1',
      location: 'Didcot, UK',
      storagePb: isHlLhcMode ? 45 : 18,
      cpuCores: 45000,
      activeJobs: siteOutage ? 0 : isHlLhcMode ? 42000 : 18000,
      status: siteOutage ? 'FAILED' : 'ONLINE',
    },
    {
      id: 't1-fzk',
      name: 'GridKa (Karlsruhe Inst. Tech.)',
      tier: 'Tier1',
      location: 'Karlsruhe, Germany',
      storagePb: isHlLhcMode ? 52 : 21,
      cpuCores: 50000,
      activeJobs: siteOutage ? 48000 : isHlLhcMode ? 38000 : 19500,
      status: siteOutage ? 'CONGESTED' : 'ONLINE',
    },
    {
      id: 't1-fnal',
      name: 'Fermilab Tier-1',
      tier: 'Tier1',
      location: 'Batavia, USA',
      storagePb: isHlLhcMode ? 60 : 26,
      cpuCores: 65000,
      activeJobs: isHlLhcMode ? 58000 : 26000,
      status: 'ONLINE',
    },
    {
      id: 't1-in2p3',
      name: 'IN2P3 Computing Centre',
      tier: 'Tier1',
      location: 'Lyon, France',
      storagePb: isHlLhcMode ? 48 : 20,
      cpuCores: 48000,
      activeJobs: siteOutage ? 46000 : isHlLhcMode ? 36000 : 17000,
      status: siteOutage ? 'CONGESTED' : 'ONLINE',
    },
  ];

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 p-4 lg:p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
      {/* LEFT: Grid Parameters & Failure Controls */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-cern-cyan" /> Grid Simulation
            </h3>
            <FidelityBadge type="TOY" />
          </div>

          {/* HL-LHC Scenario Compare */}
          <div>
            <label className="text-[11px] font-mono uppercase text-text-muted block mb-1.5 font-bold">
              Operating Era Scenario
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => setIsHlLhcMode(false)}
                className={`py-2 border-2 border-black font-bold uppercase transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                  !isHlLhcMode
                    ? 'bg-cern-blue text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-canvas-sub text-text-secondary hover:text-text-primary'
                }`}
              >
                Run 3 (Current)
              </button>
              <button
                onClick={() => setIsHlLhcMode(true)}
                className={`py-2 border-2 border-black font-bold uppercase transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                  isHlLhcMode
                    ? 'bg-[#FF0055] text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-canvas-sub text-text-secondary hover:text-text-primary'
                }`}
              >
                HL-LHC Era (×4)
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1 font-mono">
              HL-LHC expands annual archive volume from 65 PB to over 250 PB.
            </p>
          </div>

          {/* Failure Injection Sandbox */}
          <div>
            <label className="text-[11px] font-mono uppercase text-text-muted block mb-1.5 font-bold">
              Chaos Testing / Failure Injection
            </label>
            <button
              onClick={() => setSiteOutage(!siteOutage)}
              className={`w-full py-2.5 px-3 border-2 border-black font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                siteOutage
                  ? 'bg-red-500 text-black shadow-[3px_3px_0px_#000]'
                  : 'bg-canvas-sub hover:bg-canvas-surface text-text-secondary hover:text-text-primary shadow-[3px_3px_0px_#000]'
              }`}
            >
              <AlertOctagon className={`w-4 h-4 ${siteOutage ? 'text-black' : 'text-red-400'}`} />
              {siteOutage ? 'Restore Disrupted Site' : 'Inject Tier-1 Link Outage'}
            </button>
            <span className="text-[10px] text-text-muted block mt-1 font-mono">
              Simulates a transatlantic optical cut or primary cooling outage at RAL Tier-1.
            </span>
          </div>

          {/* Readout Summary */}
          <div className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-text-muted font-bold">Storage Growth:</span>
              <span className="text-cern-cyan font-bold">+{yearlyStoragePb} PB/year</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-bold">Ingest Bandwidth:</span>
              <span className="text-emerald-400 font-bold">{dataRateGbS.toFixed(2)} GB/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-bold">Data Centre Power:</span>
              <span className="text-amber-400 font-bold">{powerConsumptionMw} MW</span>
            </div>
          </div>
        </div>

        {/* Provenance Footer */}
        <div className="pt-3 border-t-2 border-black text-[11px] font-mono text-text-muted">
          <span>Topology: </span>
          <Value manifestId="wlcg-tier-topology" value="WLCG Public Specifications" />
        </div>
      </div>

      {/* CENTER: Worldwide Grid Topology Map & Queue Dynamics */}
      <div className="flex-1 flex flex-col justify-between bg-canvas border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 relative min-h-[460px] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cern-cyan" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-text-primary font-bold">
              WORLDWIDE LHC COMPUTING GRID (WLCG) ARCHITECTURE
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
            170+ Distributed Centres
          </span>
        </div>

        {/* Tier Node Cards */}
        <div className="space-y-3">
          {nodes.map((node) => {
            const isFailed = node.status === 'FAILED';
            const isCongested = node.status === 'CONGESTED';

            return (
              <div
                key={node.id}
                className={`p-3 border-2 border-black shadow-[3px_3px_0px_0px_#000000] transition-all ${
                  isFailed
                    ? 'bg-red-500/20 shadow-[3px_3px_0px_#FF0055]'
                    : isCongested
                    ? 'bg-amber-400/20 shadow-[3px_3px_0px_#FFE600]'
                    : 'bg-canvas-surface hover:shadow-[4px_4px_0px_0px_#00E5FF]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono font-bold border border-black uppercase ${
                        node.tier === 'Tier0'
                          ? 'bg-cern-blue text-white'
                          : 'bg-canvas-sub text-text-secondary'
                      }`}
                    >
                      {node.tier}
                    </span>
                    <span className="font-mono text-xs font-bold text-text-primary">
                      {node.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border border-black uppercase ${
                      isFailed
                        ? 'bg-red-500 text-black'
                        : isCongested
                        ? 'bg-amber-400 text-black'
                        : 'bg-emerald-400 text-black'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono text-text-secondary">
                  <div>
                    <span className="text-[10px] text-text-muted block uppercase font-bold">Storage:</span>
                    <span className="font-bold text-text-primary">{node.storagePb} PB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block uppercase font-bold">CPU Cores:</span>
                    <span className="font-bold text-text-primary">{node.cpuCores.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block uppercase font-bold">Queue Load:</span>
                    <span
                      className={`font-bold ${
                        isFailed ? 'text-red-400' : isCongested ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {node.activeJobs.toLocaleString()} jobs
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Network Note */}
        <div className="p-3 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] font-mono text-text-muted flex items-center justify-between">
          <span>LHC Optical Private Network (LHCOPN): 100-400 Gbps Dedicated Fiber</span>
          <span className="text-cern-cyan font-bold">Zero Public Internet Packet Loss</span>
        </div>
      </div>

      {/* RIGHT: Systemic Context */}
      <div className="w-full xl:w-80 flex flex-col justify-between bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 space-y-4">
        <div className="space-y-3">
          <div className="pb-2 border-b-2 border-black">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase">
              Computing Digital Twin
            </h3>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            The Worldwide LHC Computing Grid connects over 170 computing centers in 42 countries.
          </p>

          <p className="text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Tier-0</strong> at CERN performs initial raw reconstruction and archives data on tape.
            <strong className="text-text-primary"> Tier-1</strong> centres handle permanent custody and re-processing.
            <strong className="text-text-primary"> Tier-2</strong> universities perform end-user analysis and Monte Carlo simulations.
          </p>

          <div className="p-3 bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] leading-relaxed font-mono font-bold">
            <strong className="text-black block mb-0.5 uppercase">/// Honesty Statement ///</strong>
            This module runs a simplified discrete-event queueing model with published network topology numbers. It does not monitor live operational grid telemetry.
          </div>
        </div>

        <div className="pt-3 border-t-2 border-black text-[11px] font-mono text-text-muted">
          <span>Simulation Mode: Queue Dynamics</span>
        </div>
      </div>
    </div>
  );
};
