import React from 'react';
import Link from 'next/link';
import { ShieldCheck, GitBranch, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t-3 border-black bg-canvas-sub text-text-muted text-xs shadow-[0_-4px_0_0_#000]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-sm text-white px-2.5 py-1 border-2 border-black bg-cern-blue shadow-[2px_2px_0px_#000]">
                PARTON
              </span>
              <span className="font-mono text-xs text-text-secondary font-medium">
                Particle Physics Digital Twin
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed max-w-lg font-sans">
              PARTON is an open-source scientific digital twin modeling CERN&apos;s accelerator complex,
              experimental detectors, Parton distributions, trigger pipelines, and distributed computing.
            </p>
            <div className="p-3 bg-amber-400 border-2 border-black shadow-[3px_3px_0px_#000] text-xs text-black leading-normal">
              <strong className="text-black font-mono block mb-0.5 font-semibold">Non-affiliation notice</strong>
              PARTON is an unofficial educational and research initiative. It is not affiliated with, sponsored by, or endorsed by CERN.
            </div>
          </div>

          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000]">
            <h4 className="font-mono font-semibold text-white mb-3 text-xs border-b-2 border-black pb-1.5">
              Governance &amp; sources
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/methodology" className="hover:text-cern-cyan transition-colors flex items-center gap-1.5 font-medium">
                  <span>Methodology &amp; limits</span>
                </Link>
              </li>
              <li>
                <Link href="/brand" className="hover:text-cern-cyan transition-colors flex items-center gap-1.5 font-medium">
                  <span>Logo &amp; app icons</span>
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="hover:text-cern-cyan transition-colors flex items-center gap-1.5 font-medium">
                  <span>Physics challenges &amp; law limits</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN/blob/main/docs/DATA_AUDIT.md"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-cyan flex items-center gap-1.5 transition-colors font-medium"
                >
                  <span>Source audit report</span> <ExternalLink className="w-3 h-3 text-text-muted" strokeWidth={1.5} />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN/blob/main/data/manifest.json"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-cyan flex items-center gap-1.5 transition-colors font-medium"
                >
                  <span>Cryptographic manifest</span> <ExternalLink className="w-3 h-3 text-text-muted" strokeWidth={1.5} />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN/blob/main/docs/CUT_FEATURES.md"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-cyan flex items-center gap-1.5 transition-colors font-medium"
                >
                  <span>Cut features report</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000]">
            <h4 className="font-mono font-semibold text-white mb-3 text-xs border-b-2 border-black pb-1.5">
              Standards &amp; verification
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                <span className="tabular-nums">Physics tests: 29/29 pass</span>
              </li>
              <li className="flex items-center gap-1.5 text-text-secondary font-medium">
                <GitBranch className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                <span>Deterministic seeded PRNG</span>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-cyan flex items-center gap-1.5 transition-colors font-medium"
                >
                  <span>GitHub repository</span> <ExternalLink className="w-3 h-3 text-text-muted" strokeWidth={1.5} />
                </a>
              </li>
              <li className="text-text-secondary font-medium">
                <span>License: MIT open source</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t-3 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted font-mono">
          <span>© 2026 Premchand Yadav. PARTON Open Research &amp; Education.</span>
          <span className="px-2.5 py-1 bg-canvas-surface border-2 border-black shadow-[2px_2px_0px_#000] text-text-secondary">
            Press <kbd className="text-cern-cyan font-semibold">?</kbd> for shortcuts · WCAG 2.2 AA
          </span>
        </div>
      </div>
    </footer>
  );
};
