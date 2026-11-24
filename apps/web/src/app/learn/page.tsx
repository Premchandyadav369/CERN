'use client';

import React, { useState } from 'react';
import glossaryData from '../../../../../content/glossary.json';
import particlesData from '../../../../../content/particles.json';
import { TimelineView } from '@/components/timeline/TimelineView';
import { useGlobalStore, UserLevel } from '@/lib/store';
import { BookOpen, Atom, Calendar, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'glossary' | 'particles' | 'timeline'>('glossary');
  const userLevel = useGlobalStore((s) => s.userLevel);
  const setUserLevel = useGlobalStore((s) => s.setUserLevel);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase bg-cern-cyan text-black px-2 py-0.5 border border-black font-bold tracking-wider shadow-[2px_2px_0px_#000]">
            PEDAGOGICAL &amp; CONCEPTUAL LAYER
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight text-text-primary">
          Physics Dictionary, Particles &amp; History
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed font-mono">
          Three levels of explanatory depth designed for students, undergraduates, and research
          physicists. Switch between conceptual analogies, formal field kinematics, and experimental
          resolutions.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-black uppercase font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
              activeTab === 'glossary'
                ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#000]'
                : 'bg-canvas-surface text-text-secondary hover:text-text-primary shadow-[2px_2px_0px_#000]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cern-cyan" />
            <span>Scientific Glossary</span>
          </button>

          <button
            onClick={() => setActiveTab('particles')}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-black uppercase font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
              activeTab === 'particles'
                ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#000]'
                : 'bg-canvas-surface text-text-secondary hover:text-text-primary shadow-[2px_2px_0px_#000]'
            }`}
          >
            <Atom className="w-4 h-4 text-[#FFE600]" />
            <span>Standard Model Particles</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-black uppercase font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
              activeTab === 'timeline'
                ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#000]'
                : 'bg-canvas-surface text-text-secondary hover:text-text-primary shadow-[2px_2px_0px_#000]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#FF0055]" />
            <span>1954 → 2026+ Timeline</span>
          </button>
        </div>

        {/* Explanatory Depth Selector */}
        {activeTab === 'glossary' && (
          <div className="flex items-center p-1 bg-canvas-surface border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-mono gap-1">
            {(['BEGINNER', 'UNDERGRAD', 'RESEARCHER'] as UserLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setUserLevel(lvl)}
                className={`px-3 py-1 border border-black font-bold uppercase transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                  userLevel === lvl
                    ? 'bg-cern-accent text-white shadow-[2px_2px_0px_#000]'
                    : 'text-text-muted hover:text-text-secondary bg-canvas-sub'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Glossary */}
      {activeTab === 'glossary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {glossaryData.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-canvas-surface border-3 border-black shadow-[5px_5px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#00E5FF] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-display font-black uppercase text-text-primary">{item.term}</h3>
                  <span className="font-mono text-xs text-cern-cyan px-2 py-0.5 border border-black font-bold bg-canvas-sub shadow-[1px_1px_0px_#000]">
                    {item.symbol} [{item.units}]
                  </span>
                </div>

                <div className="p-2.5 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] font-mono text-xs text-[#FFE600] font-bold">
                  {item.equationLatex}
                </div>

                {/* Depth-tailored explanation */}
                <div className="text-xs text-text-secondary leading-relaxed font-mono">
                  {userLevel === 'BEGINNER' && (
                    <p>
                      <strong className="text-text-primary uppercase block mb-1">
                        [Beginner Perspective]:
                      </strong>
                      {item.beginner}
                    </p>
                  )}
                  {userLevel === 'UNDERGRAD' && (
                    <p>
                      <strong className="text-text-primary uppercase block mb-1">
                        [Undergraduate Perspective]:
                      </strong>
                      {item.undergrad}
                    </p>
                  )}
                  {userLevel === 'RESEARCHER' && (
                    <p>
                      <strong className="text-text-primary uppercase block mb-1">
                        [Researcher Perspective]:
                      </strong>
                      {item.researcher}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t-2 border-black text-[11px] font-mono text-text-muted">
                  <span>CERN Usage: {item.cernContext}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Particles Explorer */}
      {activeTab === 'particles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {particlesData.map((part) => (
            <div
              key={part.id}
              className="p-5 bg-canvas-surface border-3 border-black shadow-[5px_5px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#FF0055] transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black uppercase text-[#FFE600]">{part.type}</span>
                  <span className="font-mono text-base font-black text-cern-cyan">{part.symbol}</span>
                </div>

                <h3 className="text-lg font-display font-black uppercase text-text-primary">{part.name}</h3>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b-2 border-black/30">
                    <span className="text-text-muted font-bold">Rest Mass:</span>
                    <span className="text-text-primary font-bold">{part.massGev} GeV/c²</span>
                  </div>
                  <div className="flex justify-between py-1 border-b-2 border-black/30">
                    <span className="text-text-muted font-bold">Electric Charge:</span>
                    <span className="text-text-secondary font-bold">{part.charge} e</span>
                  </div>
                  <div className="flex justify-between py-1 border-b-2 border-black/30">
                    <span className="text-text-muted font-bold">Spin:</span>
                    <span className="text-text-secondary font-bold">{part.spin}</span>
                  </div>
                  {part.discoveryYear && (
                    <div className="flex justify-between py-1">
                      <span className="text-text-muted font-bold">Discovered:</span>
                      <span className="text-text-secondary font-bold">
                        {part.discoveryYear} ({part.discoveredAt})
                      </span>
                    </div>
                  )}
                </div>

                {part.decayModes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase text-text-muted block mb-1 font-bold">
                      Key Decay Channels
                    </span>
                    <div className="p-2 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000] space-y-1 text-[11px] font-mono text-text-secondary">
                      {part.decayModes.slice(0, 3).map((dm) => (
                        <div key={dm.channel} className="flex justify-between font-bold">
                          <span>→ {dm.channel}</span>
                          <span className="text-cern-accent">
                            {(dm.branchingRatio * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t-2 border-black text-[10px] font-mono text-text-muted">
                <span>{part.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' && <TimelineView />}
    </div>
  );
}
