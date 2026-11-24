'use client';

import React, { useState } from 'react';
import timelineData from '../../../../../content/timeline.json';
import { Value } from '@/components/provenance/Value';
import { Calendar, Tag, ExternalLink } from 'lucide-react';

export const TimelineView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const categories = ['ALL', 'ORGANIZATION', 'ACCELERATOR', 'DISCOVERY', 'COMPUTING', 'FUTURE'];

  const filteredItems =
    filterCategory === 'ALL'
      ? timelineData
      : timelineData.filter((item) => item.category === filterCategory);

  return (
    <div className="w-full space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 border-2 border-black font-bold uppercase transition-all active:translate-x-[1px] active:translate-y-[1px] ${
              filterCategory === cat
                ? 'bg-cern-blue border-black text-white shadow-[3px_3px_0px_#00E5FF] -translate-x-0.5 -translate-y-0.5'
                : 'bg-canvas-surface border-black text-text-secondary hover:text-white shadow-[2px_2px_0px_#000]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Chronological Vertical Timeline */}
      <div className="relative pl-6 border-l-3 border-black space-y-8 ml-2">
        {filteredItems.map((item) => (
          <div key={item.year + item.title} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-[33px] top-2 w-4 h-4 bg-cern-cyan border-2 border-black shadow-[2px_2px_0px_#000] group-hover:scale-110 transition-transform" />

            <div className="p-5 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#00E5FF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all space-y-2.5">
              <div className="flex items-center justify-between gap-2 pb-2 border-b-2 border-black">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-cern-cyan text-black border-2 border-black shadow-[2px_2px_0px_#000]">
                  {item.year}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-cern-blue text-white border-2 border-black shadow-[1px_1px_0px_#000]">
                  {item.category}
                </span>
              </div>

              <h3 className="text-base font-display font-extrabold text-white">{item.title}</h3>

              <p className="text-xs text-text-secondary leading-relaxed font-sans">{item.description}</p>

              <div className="pt-2 border-t-2 border-black flex items-center justify-between text-[11px] font-mono font-bold text-text-muted">
                <span>Source: {item.source}</span>
                <span className="text-cern-cyan px-2 py-0.5 bg-black border-2 border-black shadow-[2px_2px_0px_#00E5FF]">{item.tier}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
