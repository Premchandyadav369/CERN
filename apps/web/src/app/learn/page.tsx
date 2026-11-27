'use client';

import React, { useState } from 'react';
import glossaryData from '../../../../../content/glossary.json';
import { TimelineView } from '@/components/timeline/TimelineView';
import { ScienceLiteratureBridge } from '@/components/knowledge/ScienceLiteratureBridge';
import { StandardModelLab } from '@/components/simulations/StandardModelLab';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore, UserLevel } from '@/lib/store';
import { BookOpen, Atom, Calendar, HelpCircle, Layers, CheckCircle2, FileText } from 'lucide-react';

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'glossary' | 'particles' | 'timeline' | 'literature'>('glossary');
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

          <button
            onClick={() => setActiveTab('literature')}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-black uppercase font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
              activeTab === 'literature'
                ? 'bg-cern-blue text-white shadow-[3px_3px_0px_#000]'
                : 'bg-canvas-surface text-text-secondary hover:text-text-primary shadow-[2px_2px_0px_#000]'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Research &amp; arXiv Bridge</span>
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
          <Eli5Card
            title="The CERN Subatomic Dictionary"
            analogy="Translating complex quantum formulas and accelerator physics into simple everyday ideas so anyone can understand how the universe works."
            keyPoints={[
              "Luminosity is like flashlight brightness: brighter beam means more chances of rare particle collisions.",
              "Cross section is target size: a bigger cross section makes a particle much easier to hit.",
              "Magnetic rigidity is how stubborn a fast particle is when trying to steer it around a curve."
            ]}
            whatToTry="Toggle between BEGINNER, UNDERGRAD, and RESEARCHER perspectives above to see the math get progressively deeper!"
            doi="10.5170/CERN-2004-003-V-1"
            citationLabel="CERN Academic Training Lectures & Design Reports"
          />
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

                <div className="p-3 bg-canvas-sub border-2 border-black shadow-[2px_2px_0px_#000]">
                  <MathFormula tex={item.equationLatex} displayMode />
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

      {/* Tab 2: 3D Standard Model & Particles Explorer */}
      {activeTab === 'particles' && <StandardModelLab />}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' && <TimelineView />}

      {/* Tab 4: Peer-Reviewed Literature & arXiv Bridge */}
      {activeTab === 'literature' && <ScienceLiteratureBridge />}
    </div>
  );
}
