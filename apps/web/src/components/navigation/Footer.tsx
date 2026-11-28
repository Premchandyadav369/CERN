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
              <span className="font-mono font-bold text-sm text-white px-2.5 py-1 border-2 border-black bg-cern-blue shadow-[3px_3px_0px_#00E5FF]">
                PARTON
              </span>
              <span className="font-mono text-xs text-text-secondary font-bold">
                INTERACTIVE PARTICLE PHYSICS DIGITAL TWIN
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed max-w-lg font-sans">
              PARTON is an open-source scientific digital twin modeling CERN&apos;s accelerator complex,
              experimental detectors, Parton distributions, trigger pipelines, and distributed computing.
            </p>
            <div className="p-3 bg-amber-400 border-2 border-black shadow-[4px_4px_0px_#000] text-xs text-black leading-normal">
              <strong className="text-black uppercase font-mono block mb-0.5 font-extrabold">Non-Affiliation Notice</strong>
              PARTON is an unofficial educational and research initiative. It is NOT affiliated with, sponsored by, or endorsed by CERN.
            </div>
          </div>

          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000]">
            <h4 className="font-mono uppercase font-bold text-white mb-3 text-xs tracking-wider border-b-2 border-black pb-1.5 flex items-center justify-between">
              <span>Governance &amp; Sources</span>
              <span className="text-[10px] text-cern-cyan">01</span>
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/methodology" className="hover:text-cern-cyan transition-colors flex items-center gap-1 font-bold">
                  <span>→ Methodology &amp; Limits</span>
                </Link>
              </li>
              <li>
                <Link href="/brand" className="hover:text-cern-cyan transition-colors flex items-center gap-1 font-bold">
                  <span>→ PARTON Logo &amp; App Icons</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN/blob/main/docs/DATA_AUDIT.md"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-cyan flex items-center gap-1 transition-colors font-bold"
                >
                  <span>→ Source Audit Report</span> <ExternalLink className="w-3 h-3 text-cern-cyan" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN/blob/main/data/manifest.json"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-cyan flex items-center gap-1 transition-colors font-bold"
                >
                  <span>→ Cryptographic Manifest</span> <ExternalLink className="w-3 h-3 text-cern-cyan" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN/blob/main/docs/CUT_FEATURES.md"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-cyan flex items-center gap-1 transition-colors font-bold"
                >
                  <span>→ Cut Features Report</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-canvas-surface border-2 border-black shadow-[4px_4px_0px_#000]">
            <h4 className="font-mono uppercase font-bold text-white mb-3 text-xs tracking-wider border-b-2 border-black pb-1.5 flex items-center justify-between">
              <span>Standards &amp; Verification</span>
              <span className="text-emerald-400">02</span>
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Physics Tests: 27/27 PASS</span>
              </li>
              <li className="flex items-center gap-1.5 text-cern-cyan font-bold">
                <GitBranch className="w-4 h-4" />
                <span>Deterministic Seeded PRNG</span>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-cyan flex items-center gap-1 transition-colors font-bold"
                >
                  <span>→ GitHub Repository</span> <ExternalLink className="w-3 h-3 text-cern-cyan" />
                </a>
              </li>
              <li className="text-text-secondary font-bold">
                <span>Licence: MIT Open Source</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t-3 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted font-mono font-bold">
          <span>© 2026 Premchand Yadav. PARTON Open Research &amp; Education.</span>
          <span className="px-2.5 py-1 bg-black border-2 border-black shadow-[2px_2px_0px_#00E5FF] text-cern-cyan">
            PRESS ? FOR SHORTCUTS · WCAG 2.2 AA
          </span>
        </div>
      </div>
    </footer>
  );
};
