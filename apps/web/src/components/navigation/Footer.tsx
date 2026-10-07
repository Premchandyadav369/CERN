import React from 'react';
import Link from 'next/link';
import { ShieldCheck, GitBranch, BookOpen, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-canvas-border bg-canvas-sub/80 text-text-muted text-xs">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-text-primary px-1.5 py-0.5 border border-cern-blue/60 bg-cern-blue/20 rounded">
                CERN-X
              </span>
              <span className="font-mono text-xs text-text-secondary">
                Interactive Scientific Digital Universe
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed max-w-lg">
              An open-source scientific digital twin modeling CERN&apos;s accelerator complex, experimental
              detectors, trigger pipelines, distributed computing, and machine learning research.
            </p>
            <div className="p-2.5 bg-canvas-surface border border-canvas-border rounded text-[11px] text-amber-300/90 leading-normal">
              <strong>Non-Affiliation Notice:</strong> CERN-X is an unofficial educational and research
              initiative. It is NOT affiliated with, sponsored by, or endorsed by CERN.
            </div>
          </div>

          <div>
            <h4 className="font-mono uppercase font-semibold text-text-primary mb-2.5 text-[11px] tracking-wider">
              Governance & Sources
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/about" className="hover:text-cern-accent transition-colors">
                  Methodology & Limits
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN/blob/main/docs/DATA_AUDIT.md"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-accent flex items-center gap-1 transition-colors"
                >
                  Source Audit Report <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN/blob/main/data/manifest.json"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-accent flex items-center gap-1 transition-colors"
                >
                  Cryptographic Manifest <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN/blob/main/docs/CUT_FEATURES.md"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-accent transition-colors"
                >
                  Excluded / Cut Features
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono uppercase font-semibold text-text-primary mb-2.5 text-[11px] tracking-wider">
              Standards & Validation
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Physics Unit Tests Passed</span>
              </li>
              <li className="flex items-center gap-1.5 text-blue-400">
                <GitBranch className="w-3.5 h-3.5" />
                <span>Deterministic Seeded PRNG</span>
              </li>
              <li>
                <a
                  href="https://github.com/Premchandyadav369/CERN"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cern-accent flex items-center gap-1 transition-colors"
                >
                  GitHub Repository <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <span>Licence: MIT</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-canvas-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-text-muted font-mono">
          <span>© 2026 Premchand Yadav. Distributed for open research & education.</span>
          <span>WCAG 2.2 AA Compliant · Dark Control-Room Theme</span>
        </div>
      </div>
    </footer>
  );
};
