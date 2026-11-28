'use client';

import React, { useState } from 'react';
import { Camera, Share2, Check, FileCode2, BookOpen, Braces } from 'lucide-react';
import { playParticlePulse } from '@/lib/sonifier';

interface LabExportBarProps {
  title: string;
  shareQuery?: Record<string, string | number>;
}

function buildPythonScript(title: string, shareQuery?: Record<string, string | number>): string {
  const paramsJson = JSON.stringify(shareQuery ?? {}, null, 2);
  return `"""
PARTON Reproducible Lab Script: ${title}
Generated: ${new Date().toISOString()}
Requires: numpy, scipy (or run standalone with Python 3.10+)
Repository solvers: research/scripts/{electroweak_vacuum_rge,neutrino_pmns_mc,beam_optics}.py
"""

import json
import math

LAB_TITLE = ${JSON.stringify(title)}
PARAMETERS = json.loads(${JSON.stringify(paramsJson)})

# Fundamental PDG / SI Constants
HBAR_C_GEV_FM = 0.1973269804
SPEED_OF_LIGHT_MS = 299792458.0
LHC_CIRCUMFERENCE_M = 26658.883

def summary():
    print(f"PARTON Reproducible Run :: {LAB_TITLE}")
    print("Captured Scenario Parameters:", json.dumps(PARAMETERS, indent=2))
    print(f"LHC Revolution Frequency f_rev = {SPEED_OF_LIGHT_MS / LHC_CIRCUMFERENCE_M:.2f} Hz")

if __name__ == "__main__":
    summary()
`;
}

function buildNotebookJson(title: string, shareQuery?: Record<string, string | number>): string {
  const pyCode = buildPythonScript(title, shareQuery).split('\n').map((l) => `${l}\n`);
  const nb = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
      language_info: { name: 'python', version: '3.11' },
    },
    cells: [
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          `# PARTON Reproducible Experiment: ${title}\n`,
          '\n',
          'Exported directly from the **PARTON Physics Digital Twin** interactive simulation suite.\n',
        ],
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: pyCode,
      },
    ],
  };
  return JSON.stringify(nb, null, 2);
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
    const canvases = Array.from(document.querySelectorAll('canvas'));
    const targetCanvas = canvases.find((c) => c.offsetWidth > 100 && c.offsetHeight > 100) || canvases[0];
    if (!targetCanvas) return;
    try {
      const poster = document.createElement('canvas');
      const headerH = 56;
      const w = Math.max(640, targetCanvas.width);
      const h = targetCanvas.height + headerH;
      poster.width = w;
      poster.height = h;
      const ctx = poster.getContext('2d');
      let dataUrl = '';

      if (ctx) {
        ctx.fillStyle = '#05080F';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#090E1A';
        ctx.fillRect(0, 0, w, headerH);
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(0, headerH - 3, w, 3);
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`PARTON // ${title.toUpperCase()}`, 18, 34);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#FFE600';
        ctx.textAlign = 'right';
        ctx.fillText(new Date().toISOString().slice(0, 19) + ' UTC', w - 18, 34);
        ctx.textAlign = 'left';
        ctx.drawImage(targetCanvas, (w - targetCanvas.width) / 2, headerH);
        dataUrl = poster.toDataURL('image/png');
      } else {
        dataUrl = targetCanvas.toDataURL('image/png');
      }

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `parton-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}.png`;
      a.click();
      playParticlePulse(880, 0.07, 0.05);
    } catch {}
  };

  const downloadFile = (content: string, ext: 'py' | 'ipynb' | 'json', mime: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parton-${slug}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    playParticlePulse(660, 0.06, 0.05);
  };

  const telemetryPayload = JSON.stringify(
    {
      platform: 'PARTON',
      module: title,
      capturedAt: new Date().toISOString(),
      parameters: shareQuery ?? {},
    },
    null,
    2
  );

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
      <button
        type="button"
        onClick={handleSnapshot}
        className="px-2.5 py-1.5 bg-canvas-surface hover:bg-canvas-raised text-white border-2 border-black shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        title="Export active canvas or 3D viewport as high-resolution PNG poster"
      >
        <Camera className="w-3.5 h-3.5 text-cern-cyan" />
        <span>PNG</span>
      </button>

      <button
        type="button"
        onClick={() => downloadFile(buildPythonScript(title, shareQuery), 'py', 'text/x-python')}
        className="px-2.5 py-1.5 bg-canvas-surface hover:bg-canvas-raised text-white border-2 border-black shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        title="Download standalone Python reproducibility script (.py)"
      >
        <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>.py</span>
      </button>

      <button
        type="button"
        onClick={() => downloadFile(buildNotebookJson(title, shareQuery), 'ipynb', 'application/x-ipynb+json')}
        className="px-2.5 py-1.5 bg-canvas-surface hover:bg-canvas-raised text-white border-2 border-black shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        title="Download Jupyter Notebook (.ipynb) with active scenario parameters"
      >
        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
        <span>.ipynb</span>
      </button>

      <button
        type="button"
        onClick={() => downloadFile(telemetryPayload, 'json', 'application/json')}
        className="px-2.5 py-1.5 bg-canvas-surface hover:bg-canvas-raised text-white border-2 border-black shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        title="Download structured JSON scenario snapshot"
      >
        <Braces className="w-3.5 h-3.5 text-purple-300" />
        <span>.json</span>
      </button>

      <button
        type="button"
        onClick={handleCopyLink}
        className="px-2.5 py-1.5 bg-canvas-surface hover:bg-canvas-raised text-white border-2 border-black shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        title="Copy shareable link to this laboratory module"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#FFE600]" />}
        <span>{copied ? 'Copied!' : 'Share URL'}</span>
      </button>
    </div>
  );
};
