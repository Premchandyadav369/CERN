'use client';

import React, { useState, useMemo } from 'react';
import katex from 'katex';
import { HelpCircle } from 'lucide-react';

interface MathFormulaProps {
  tex: string;
  displayMode?: boolean;
  label?: string;
  derivation?: string;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  tex,
  displayMode = false,
  label,
  derivation,
  className = '',
}) => {
  const [showSteps, setShowSteps] = useState(false);

  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        throwOnError: false,
        displayMode,
        strict: false,
        output: 'html',
      });
    } catch {
      return tex;
    }
  }, [tex, displayMode]);

  return (
    <div className={`inline-flex flex-col ${displayMode ? 'w-full' : ''} ${className}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {label && <span className="text-[10px] font-mono uppercase text-text-muted font-bold">{label}</span>}
        <div
          className="cern-katex-wrap text-sm text-[#FFE600] overflow-x-auto max-w-full py-1 pr-2"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {derivation && (
          <button
            type="button"
            onClick={() => setShowSteps(!showSteps)}
            className="text-[10px] font-mono text-cern-cyan hover:text-white flex items-center gap-1 px-1.5 py-0.5 bg-black border border-black cursor-pointer"
            title="Show physical meaning & step-by-step intuition"
          >
            <HelpCircle className="w-3 h-3" />
            <span>{showSteps ? 'Hide' : 'Why?'}</span>
          </button>
        )}
      </div>
      {derivation && showSteps && (
        <div className="mt-1.5 p-2 bg-black/80 border-2 border-black text-[11px] font-mono text-text-secondary leading-relaxed">
          {derivation}
        </div>
      )}
    </div>
  );
};

/**
 * Renders mixed plain text and inline KaTeX math segments delimited by `$...$` cleanly.
 */
export const InlineMathText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    const tokens = text.split(/(\$[^$]+\$)/g);
    return tokens.map((tok) => {
      if (tok.startsWith('$') && tok.endsWith('$') && tok.length > 2) {
        const inner = tok.slice(1, -1);
        try {
          return {
            isMath: true,
            content: katex.renderToString(inner, {
              throwOnError: false,
              displayMode: false,
              strict: false,
              output: 'html',
            }),
          };
        } catch {
          return { isMath: false, content: inner };
        }
      }
      return { isMath: false, content: tok };
    });
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, idx) =>
        part.isMath ? (
          <span
            key={idx}
            className="cern-katex-inline text-[#FFE600] px-0.5 align-baseline"
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        ) : (
          <React.Fragment key={idx}>{part.content}</React.Fragment>
        )
      )}
    </span>
  );
};
