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
            className={`px-3 py-1.5 rounded border transition-colors ${
              filterCategory === cat
                ? 'bg-cern-blue border-cern-accent text-white font-bold'
                : 'bg-canvas-surface border-canvas-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Chronological Vertical Timeline */}
      <div className="relative pl-6 border-l border-canvas-border space-y-8">
        {filteredItems.map((item) => (
          <div key={item.year + item.title} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-canvas-surface border-2 border-cern-cyan group-hover:bg-cern-cyan transition-colors" />

            <div className="p-4 bg-canvas-surface border border-canvas-border rounded-panel space-y-2 hover:border-canvas-borderStrong transition-colors">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-bold text-cern-cyan">{item.year}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-canvas-sub border border-canvas-border text-text-muted">
                  {item.category}
                </span>
              </div>

              <h3 className="text-base font-display font-bold text-text-primary">{item.title}</h3>

              <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>

              <div className="pt-2 border-t border-canvas-border flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span>Source: {item.source}</span>
                <span className="text-cern-accent">{item.tier}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
