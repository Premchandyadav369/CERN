'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useGlobalStore, OPERATOR_MISSIONS } from '@/lib/store';
import { Award, CheckCircle2, Circle, X, ArrowRight, RotateCcw, Radio } from 'lucide-react';
import { playDiscoveryChime } from '@/lib/sonifier';

export const MissionsDrawer: React.FC = () => {
  const isOpen = useGlobalStore((s) => s.missionsOpen);
  const setIsOpen = useGlobalStore((s) => s.setMissionsOpen);
  const completedMissions = useGlobalStore((s) => s.completedMissions);
  const completeMission = useGlobalStore((s) => s.completeMission);
  const resetMissions = useGlobalStore((s) => s.resetMissions);
  const hydrateMissions = useGlobalStore((s) => s.hydrateMissions);
  const eli5Mode = useGlobalStore((s) => s.eli5Mode);

  useEffect(() => {
    hydrateMissions();
  }, [hydrateMissions]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const pct = Math.round((completedMissions.length / OPERATOR_MISSIONS.length) * 100);
  // Statistical significance calibration analog Z_0 = 5.0 * completionRatio + bonus on all 10
  const sigmaEquiv = ((completedMissions.length / OPERATOR_MISSIONS.length) * 5.2).toFixed(2);
  const rank =
    completedMissions.length === OPERATOR_MISSIONS.length
      ? 'CHIEF CERN PHYSICIST (5σ+)'
      : completedMissions.length >= 4
      ? 'RUN-3 SHIFT LEADER'
      : 'JUNIOR BEAM OPERATOR';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        role="dialog"
        aria-label="CERN Operator Missions"
        className="w-full max-w-md h-full bg-canvas-surface border-l-3 border-black shadow-[-6px_0px_0px_#000] flex flex-col justify-between p-5 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FFE600]" />
              <h2 className="font-display font-black text-lg text-white uppercase">
                CERN Operator Missions
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close missions drawer"
              onClick={() => setIsOpen(false)}
              className="p-1 bg-black border-2 border-black text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Rank & Discovery Significance Progress Card */}
          <div className="p-4 bg-canvas-sub border-2 border-black shadow-[4px_4px_0px_#FFE600] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">Clearance Rank:</span>
              <span className="text-[#FFE600]">{rank}</span>
            </div>
            <div className="w-full h-3.5 bg-black border-2 border-black overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cern-cyan via-emerald-400 to-[#FFE600] transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-text-muted">
              <span>{completedMissions.length} / {OPERATOR_MISSIONS.length} Challenges Complete</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Radio className="w-3 h-3" /> Z₀ ≈ {sigmaEquiv} σ
              </span>
            </div>
          </div>

          {/* Mission List */}
          <div className="space-y-3">
            {OPERATOR_MISSIONS.map((m) => {
              const done = completedMissions.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`p-3.5 border-2 border-black transition-all space-y-2 ${
                    done
                      ? 'bg-emerald-950/50 shadow-[3px_3px_0px_#00FF66]'
                      : 'bg-canvas-sub shadow-[3px_3px_0px_#000]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          completeMission(m.id);
                          playDiscoveryChime();
                        }}
                        className="mt-0.5 shrink-0 cursor-pointer"
                        title="Verify mission completion"
                        aria-label={`Mark ${m.title} verified`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-text-muted hover:text-white" />
                        )}
                      </button>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-cern-cyan font-bold block">
                          Badge: {m.badge}
                        </span>
                        <h3 className={`text-sm font-display font-bold ${done ? 'text-emerald-300 line-through' : 'text-white'}`}>
                          {m.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary font-sans leading-relaxed">
                    {eli5Mode ? m.eli5Hint : m.instruction}
                  </p>

                  <div className="flex justify-end">
                    <Link
                      href={m.targetHref}
                      onClick={() => setIsOpen(false)}
                      className="px-2.5 py-1 bg-cern-blue hover:bg-cern-accent text-white text-[11px] font-mono font-bold border border-black flex items-center gap-1"
                    >
                      <span>Launch Lab</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t-2 border-black flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={resetMissions}
            className="text-text-muted hover:text-red-400 flex items-center gap-1 font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
          <span className="text-text-muted">Saved locally</span>
        </div>
      </div>
    </div>
  );
};
