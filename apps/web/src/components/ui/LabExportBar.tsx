'use client';

import React, { useState } from 'react';
import { Camera, Share2, Check } from 'lucide-react';
import { playParticlePulse } from '@/lib/sonifier';

interface LabExportBarProps {
  title: string;
  shareQuery?: Record<string, string | number>;
}

export const LabExportBar: React.FC<LabExportBarProps> = ({ title, shareQuery }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (shareQuery) {
      Object.entries(shareQuery).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      playParticlePulse(740, 0.05, 0.05);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleSnapshot = () => {
    if (typeof document === 'undefined') return;
    // Capture first visible canvas/WebGL viewport on the active tab
    const canvases = Array.from(document.querySelectorAll('canvas'));
    const targetCanvas = canvases.find((c) => c.offsetWidth > 100 && c.offsetHeight > 100) || canvases[0];
    if (!targetCanvas) return;
    try {
      const dataUrl = targetCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `cern-x-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}.png`;
      a.click();
      playParticlePulse(880, 0.07, 0.05);
    } catch {}
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
      <button
        onClick={handleSnapshot}
        className="px-3 py-1.5 bg-canvas-surface hover:bg-canvas-raised text-white border-2 border-black shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px]"
        title="Export active canvas or 3D viewport as high-resolution PNG poster"
      >
        <Camera className="w-3.5 h-3.5 text-cern-cyan" />
        <span>Export Lab PNG</span>
      </button>

      <button
        onClick={handleCopyLink}
        className="px-3 py-1.5 bg-canvas-surface hover:bg-canvas-raised text-white border-2 border-black shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px]"
        title="Copy shareable link to this laboratory module"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#FFE600]" />}
        <span>{copied ? 'Link Copied!' : 'Share Lab URL'}</span>
      </button>
    </div>
  );
};
