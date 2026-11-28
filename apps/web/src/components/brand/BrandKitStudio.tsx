'use client';

import React, { useState, useEffect } from 'react';
import { AppLogo, buildPartonSvgMarkup, PartonLogoVariant } from '@/components/ui/AppLogo';
import { Download, Copy, Check, Smartphone, Image as ImageIcon, Palette, FileCode2 } from 'lucide-react';
import { playParticlePulse } from '@/lib/sonifier';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const BACKDROP_OPTIONS = [
  { id: 'obsidian', label: 'Obsidian #05080F', className: 'bg-[#05080F]' },
  { id: 'grid', label: 'Blueprint Grid', className: 'bg-[#09111F] cern-grid-bg' },
  { id: 'tva', label: 'TVA Amber CRT', className: 'bg-[#1D1105]' },
  { id: 'light', label: 'Paper Light', className: 'bg-zinc-100' },
] as const;

const BRAND_PALETTE = [
  { name: 'Cherenkov Cyan', hex: '#00E5FF', role: 'Beamlines & Focus Rings' },
  { name: 'Dipole Cobalt', hex: '#0053A0', role: 'Primary Control Chrome' },
  { name: 'Strange Magenta', hex: '#FF0055', role: 'Down Quark & HLT Alerts' },
  { name: 'Quark Gold', hex: '#FFE600', role: 'Collision Vertex & Bets' },
  { name: 'Cryo Emerald', hex: '#00FF66', role: '1.9 K Superfluid Nominal' },
  { name: 'Deep Cavern', hex: '#05080F', role: 'Primary UI Surface' },
];

export const BrandKitStudio: React.FC = () => {
  const [variant, setVariant] = useState<PartonLogoVariant>('full');
  const [backdropId, setBackdropId] = useState<(typeof BACKDROP_OPTIONS)[number]['id']>('obsidian');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installedMsg, setInstalledMsg] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const currentBackdrop = BACKDROP_OPTIONS.find((b) => b.id === backdropId) ?? BACKDROP_OPTIONS[0];

  const triggerDownload = (href: string, filename: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
    playParticlePulse(780, 0.06, 0.05);
  };

  const handleDownloadSvg = () => {
    const svg = buildPartonSvgMarkup(variant);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `parton-${variant}-icon.svg`);
    URL.revokeObjectURL(url);
  };

  const renderSvgToPng = (svgString: string, width: number, height: number, filename: string, drawBanner = false) => {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (drawBanner) {
        ctx.fillStyle = '#05080F';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 6;
        ctx.strokeRect(12, 12, width - 24, height - 24);

        // Draw subtle blueprint grid lines
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let gx = 40; gx < width; gx += 40) {
          ctx.beginPath();
          ctx.moveTo(gx, 12);
          ctx.lineTo(gx, height - 12);
          ctx.stroke();
        }
        ctx.drawImage(img, 84, 72, 256, 256);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 88px system-ui, -apple-system, sans-serif';
        ctx.fillText('PARTON', 390, 195);

        ctx.fillStyle = '#00E5FF';
        ctx.font = 'bold 26px monospace';
        ctx.fillText('PARTICLE PHYSICS · ACCELERATORS · 3D DIGITAL TWINS', 394, 248);

        ctx.fillStyle = '#FFE600';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('33 QUANTITATIVE LABS · CERN OPEN DATA · C++17 / TS / PY', 394, 294);
      } else {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      }

      const pngUrl = canvas.toDataURL('image/png');
      triggerDownload(pngUrl, filename);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      playParticlePulse(620, 0.04, 0.04);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {}
  };

  const handleInstallPwa = async () => {
    if (!installPrompt) {
      setInstalledMsg('Use your browser menu → "Install PARTON" / "Add to Home Screen" using our SVG app icon.');
      return;
    }
    await installPrompt.prompt();
    const res = await installPrompt.userChoice;
    setInstalledMsg(
      res.outcome === 'accepted'
        ? 'PARTON installed as desktop/mobile web app!'
        : 'Install dismissed — you can export any PNG icon size below anytime.'
    );
    setInstallPrompt(null);
  };

  return (
    <div className="space-y-8">
      {/* Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Emblem Stage */}
        <div className="lg:col-span-7 p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {(
                [
                  { id: 'full', label: 'Collider Emblem' },
                  { id: 'minimal', label: 'Simple App Icon' },
                  { id: 'monochrome', label: 'Monochrome Stamp' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setVariant(tab.id)}
                  className={`px-3 py-1.5 border-2 border-black font-bold cursor-pointer transition-all ${
                    variant === tab.id
                      ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-canvas-sub text-text-secondary hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              {BACKDROP_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setBackdropId(bg.id)}
                  title={bg.label}
                  className={`px-2 py-1 border-2 border-black font-bold cursor-pointer ${
                    backdropId === bg.id
                      ? 'bg-[#FFE600] text-black'
                      : 'bg-canvas-sub text-text-muted hover:text-white'
                  }`}
                >
                  {bg.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Showcase Stage */}
          <div
            className={`min-h-[270px] border-2 border-black flex flex-col items-center justify-center p-8 gap-5 ${currentBackdrop.className}`}
          >
            <div className="group flex flex-col sm:flex-row items-center gap-5">
              <AppLogo variant={variant} size={132} />
              <div className="text-center sm:text-left">
                <div
                  className={`font-display font-black text-4xl tracking-tight ${
                    backdropId === 'light' ? 'text-black' : 'text-white'
                  }`}
                >
                  PARTON
                </div>
                <div
                  className={`font-mono text-xs font-bold tracking-widest uppercase mt-1 ${
                    backdropId === 'light' ? 'text-blue-700' : 'text-cern-cyan'
                  }`}
                >
                  3 Quarks · Gluon Sea · Hard Scatter
                </div>
              </div>
            </div>
          </div>

          {/* Real Multi-Size Legibility Ladder */}
          <div className="p-3 bg-canvas-sub border-2 border-black flex flex-wrap items-end justify-between gap-4">
            <span className="text-[11px] font-mono font-bold text-text-muted uppercase">
              Legibility Check:
            </span>
            <div className="flex flex-wrap items-end gap-5">
              {[16, 24, 32, 48, 72].map((px) => (
                <div key={px} className="flex flex-col items-center gap-1">
                  <AppLogo variant={variant} size={px} />
                  <span className="text-[10px] font-mono text-text-muted">{px}px</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Instant Asset Downloader & PWA Installer */}
        <div className="lg:col-span-5 p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-display font-black uppercase text-white border-b-2 border-black pb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-cern-cyan" /> Instant Icon &amp; Logo Exports
            </h2>
            <p className="text-xs font-sans text-text-secondary leading-relaxed">
              Every vector mark and PNG icon renders directly inside your browser—ready for favicons, mobile home screens, GitHub social cards, or physics slide decks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="p-3 bg-cern-cyan hover:bg-sky-300 text-black font-black border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between cursor-pointer active:translate-y-0.5"
              >
                <span>Vector (.svg)</span>
                <FileCode2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  renderSvgToPng(
                    buildPartonSvgMarkup(variant),
                    512,
                    512,
                    `parton-${variant}-512x512.png`
                  )
                }
                className="p-3 bg-emerald-400 hover:bg-emerald-300 text-black font-black border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between cursor-pointer active:translate-y-0.5"
              >
                <span>Icon 512px PNG</span>
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  renderSvgToPng(
                    buildPartonSvgMarkup('minimal'),
                    192,
                    192,
                    'parton-simple-app-icon-192x192.png'
                  )
                }
                className="p-3 bg-[#FFE600] hover:bg-yellow-300 text-black font-black border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between cursor-pointer active:translate-y-0.5"
              >
                <span>App Icon 192px</span>
                <Smartphone className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  renderSvgToPng(
                    buildPartonSvgMarkup(variant),
                    1200,
                    400,
                    `parton-banner-1200x400.png`,
                    true
                  )
                }
                className="p-3 bg-cern-blue hover:bg-cern-accent text-white font-black border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between cursor-pointer active:translate-y-0.5"
              >
                <span>Hero Banner PNG</span>
                <Download className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleCopyText(buildPartonSvgMarkup(variant), 'svg-copy')}
              className="w-full p-2.5 bg-canvas-sub hover:bg-canvas-raised text-white border-2 border-black shadow-[3px_3px_0px_#000] font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedId === 'svg-copy' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied Clean SVG Markup!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cern-cyan" />
                  <span>Copy Current SVG Markup</span>
                </>
              )}
            </button>
          </div>

          {/* PWA / Homescreen Installer */}
          <div className="p-3.5 bg-canvas-sub border-2 border-black space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-xs text-white uppercase">
                Desktop / Mobile App Icon (PWA)
              </span>
              <span className="px-1.5 py-0.5 bg-emerald-400 text-black font-mono text-[10px] font-black border border-black">
                MANIFEST READY
              </span>
            </div>
            <button
              type="button"
              onClick={handleInstallPwa}
              className="w-full py-2 px-3 bg-canvas-surface hover:bg-cern-cyan hover:text-black text-cern-cyan font-mono font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] transition-colors cursor-pointer"
            >
              {installPrompt ? 'Install PARTON App Now' : 'Check Browser App Install Status'}
            </button>
            {installedMsg && (
              <p className="text-[11px] font-mono text-amber-300 leading-snug">{installedMsg}</p>
            )}
          </div>
        </div>
      </div>

      {/* Color System Swatches */}
      <div className="p-5 bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-4">
        <h3 className="text-base font-display font-black uppercase text-white flex items-center gap-2 border-b-2 border-black pb-2">
          <Palette className="w-4 h-4 text-cern-cyan" /> PARTON Visual System &amp; Color Swatches
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          {BRAND_PALETTE.map((swatch) => (
            <button
              key={swatch.hex}
              type="button"
              onClick={() => handleCopyText(swatch.hex, swatch.hex)}
              className="p-3 bg-canvas-sub border-2 border-black shadow-[3px_3px_0px_#000] text-left hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <div
                className="w-full h-10 border-2 border-black mb-2"
                style={{ backgroundColor: swatch.hex }}
              />
              <div className="font-black text-white">{swatch.name}</div>
              <div className="text-[11px] text-cern-cyan mt-0.5">
                {copiedId === swatch.hex ? 'Copied!' : swatch.hex}
              </div>
              <div className="text-[10px] text-text-muted mt-1 font-sans">{swatch.role}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
