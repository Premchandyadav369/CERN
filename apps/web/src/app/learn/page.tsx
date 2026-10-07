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
      <div>
        <span className="text-xs font-mono uppercase text-cern-cyan font-bold tracking-wider">
          PEDAGOGICAL &amp; CONCEPTUAL LAYER
        </span>
        <h1 className="text-3xl font-display font-bold text-text-primary mt-1">
          Physics Dictionary, Particles &amp; History
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-3xl leading-relaxed">
          Three levels of explanatory depth designed for students, undergraduates, and research
          physicists. Switch between conceptual analogies, formal field kinematics, and experimental
          resolutions.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-canvas-border pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-panel border transition-all ${
              activeTab === 'glossary'
                ? 'bg-cern-blue border-cern-accent text-white font-bold'
                : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cern-cyan" />
            <span>Scientific Glossary</span>
          </button>

          <button
            onClick={() => setActiveTab('particles')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-panel border transition-all ${
              activeTab === 'particles'
                ? 'bg-cern-blue border-cern-accent text-white font-bold'
                : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Atom className="w-3.5 h-3.5 text-amber-400" />
            <span>Standard Model Particles</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-panel border transition-all ${
              activeTab === 'timeline'
                ? 'bg-cern-blue border-cern-accent text-white font-bold'
                : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-pink-400" />
            <span>1954 → 2026+ Timeline</span>
          </button>
        </div>

        {/* Explanatory Depth Selector */}
        {activeTab === 'glossary' && (
          <div className="flex items-center p-0.5 bg-canvas-surface border border-canvas-border rounded text-xs font-mono">
            {(['BEGINNER', 'UNDERGRAD', 'RESEARCHER'] as UserLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setUserLevel(lvl)}
                className={`px-3 py-1 rounded transition-all ${
                  userLevel === lvl
                    ? 'bg-cern-accent text-white font-bold'
                    : 'text-text-muted hover:text-text-secondary'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {glossaryData.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-canvas-surface border border-canvas-border rounded-panel space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-display font-bold text-text-primary">{item.term}</h3>
                  <span className="font-mono text-xs text-cern-cyan px-2 py-0.5 rounded bg-canvas-sub border border-canvas-border">
                    {item.symbol} [{item.units}]
                  </span>
                </div>

                <div className="p-2.5 bg-canvas-sub rounded border border-canvas-border font-mono text-xs text-amber-300">
                  {item.equationLatex}
                </div>

                {/* Depth-tailored explanation */}
                <div className="text-xs text-text-secondary leading-relaxed">
                  {userLevel === 'BEGINNER' && (
                    <p>
                      <strong className="text-text-primary font-mono block mb-1">
                        [Beginner Perspective]:
                      </strong>
                      {item.beginner}
                    </p>
                  )}
                  {userLevel === 'UNDERGRAD' && (
                    <p>
                      <strong className="text-text-primary font-mono block mb-1">
                        [Undergraduate Perspective]:
                      </strong>
                      {item.undergrad}
                    </p>
                  )}
                  {userLevel === 'RESEARCHER' && (
                    <p>
                      <strong className="text-text-primary font-mono block mb-1">
                        [Researcher Perspective]:
                      </strong>
                      {item.researcher}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-canvas-border text-[11px] font-mono text-text-muted">
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
              className="p-5 bg-canvas-surface border border-canvas-border rounded-panel space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">{part.type}</span>
                  <span className="font-mono text-base font-bold text-cern-cyan">{part.symbol}</span>
                </div>

                <h3 className="text-lg font-display font-bold text-text-primary">{part.name}</h3>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-canvas-border/50">
                    <span className="text-text-muted">Rest Mass:</span>
                    <span className="text-text-primary font-bold">{part.massGev} GeV/c²</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-canvas-border/50">
                    <span className="text-text-muted">Electric Charge:</span>
                    <span className="text-text-secondary">{part.charge} e</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-canvas-border/50">
                    <span className="text-text-muted">Spin:</span>
                    <span className="text-text-secondary">{part.spin}</span>
                  </div>
                  {part.discoveryYear && (
                    <div className="flex justify-between py-1">
                      <span className="text-text-muted">Discovered:</span>
                      <span className="text-text-secondary">
                        {part.discoveryYear} ({part.discoveredAt})
                      </span>
                    </div>
                  )}
                </div>

                {part.decayModes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase text-text-muted block mb-1 font-semibold">
                      Key Decay Channels
                    </span>
                    <div className="space-y-1 text-[11px] font-mono text-text-secondary">
                      {part.decayModes.slice(0, 3).map((dm) => (
                        <div key={dm.channel} className="flex justify-between">
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

              <div className="pt-2 border-t border-canvas-border text-[10px] font-mono text-text-muted">
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
