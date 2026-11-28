'use client';

import React, { useState, useEffect } from 'react';
import { useGlobalStore } from '@/lib/store';
import { playTemPadClick } from '@/lib/sonifier';
import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['⌘ / Ctrl', 'K'], label: 'Open PARTON Global Command Palette' },
  { keys: ['?'], label: 'Toggle this Operator Keyboard HUD' },
  { keys: ['Shift', '1 / 2 / 3'], label: 'Switch Explanation Depth (101 / BSc / PhD)' },
  { keys: ['Shift', 'T'], label: 'Toggle TVA Amber CRT Terminal Mode' },
  { keys: ['Shift', 'M'], label: 'Toggle Reduce Motion Accessibility Mode' },
  { keys: ['Shift', 'G'], label: 'Open Contextual O.B. / TVA Guide' },
  { keys: ['Esc'], label: 'Close Active Overlay / Drawer' },
];

export const ShortcutHudModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const setUserLevel = useGlobalStore((s) => s.setUserLevel);
  const toggleTvaMode = useGlobalStore((s) => s.toggleTvaMode);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const setReduceMotion = useGlobalStore((s) => s.setReduceMotion);
  const toggleCompanion = useGlobalStore((s) => s.toggleCompanion);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === 'Escape' && open) {
        setOpen(false);
        return;
      }
      if (isTyping || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '?') {
        e.preventDefault();
        playTemPadClick();
        setOpen((prev) => !prev);
      } else if (e.shiftKey && e.key === '!') {
        setUserLevel('BEGINNER');
      } else if (e.shiftKey && e.key === '@') {
        setUserLevel('UNDERGRAD');
      } else if (e.shiftKey && e.key === '#') {
        setUserLevel('RESEARCHER');
      } else if (e.shiftKey && (e.key === 'T' || e.key === 't')) {
        e.preventDefault();
        playTemPadClick();
        toggleTvaMode();
      } else if (e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        setReduceMotion(!reduceMotion);
      } else if (e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault();
        playTemPadClick();
        toggleCompanion();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, setUserLevel, toggleTvaMode, reduceMotion, setReduceMotion, toggleCompanion]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="PARTON Operator Keyboard Shortcuts"
    >
      <div className="w-full max-w-lg bg-canvas-surface border-3 border-black shadow-[8px_8px_0px_#00E5FF] p-5 space-y-4 font-mono">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cern-cyan" />
            <h2 className="text-base font-display font-black uppercase text-white">
              PARTON Shift Console Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close keyboard shortcuts"
            className="p-1 bg-canvas-sub border-2 border-black text-white hover:bg-cern-cyan hover:text-black cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ul className="space-y-2 text-xs">
          {SHORTCUTS.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 p-2.5 bg-canvas-sub border border-black"
            >
              <span className="text-text-secondary font-sans">{item.label}</span>
              <span className="flex items-center gap-1 shrink-0">
                {item.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-0.5 bg-black text-cern-cyan border border-zinc-700 font-black text-[11px]"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <div className="text-[11px] text-text-muted pt-1 border-t border-black flex justify-between">
          <span>Press ? anytime to toggle</span>
          <span className="text-emerald-400 font-bold">PARTON CONTROL CONSOLE</span>
        </div>
      </div>
    </div>
  );
};
