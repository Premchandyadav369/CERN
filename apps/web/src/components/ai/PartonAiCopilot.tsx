'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useGlobalStore } from '@/lib/store';
import { InlineMathText } from '@/components/ui/MathFormula';
import { playParticlePulse, playTemPadClick } from '@/lib/sonifier';
import {
  Sparkles,
  Send,
  Cpu,
  Zap,
  ShieldAlert,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  elapsedMs?: number;
  fallback?: boolean;
  errorMessage?: string;
}

interface PartonAiCopilotProps {
  compact?: boolean;
  defaultMode?: 'copilot' | 'law-guard' | 'event-triage';
  contextOverride?: string;
}

const MODELS = [
  { id: 'openai/gpt-oss-120b', short: 'GPT-OSS 120B', tag: 'Reasoning Flagship' },
  { id: 'openai/gpt-oss-20b', short: 'GPT-OSS 20B', tag: 'Instant MoE' },
] as const;

const MODES = [
  { id: 'copilot', label: 'Physics Copilot', icon: Sparkles },
  { id: 'law-guard', label: 'Law Limits', icon: ShieldAlert },
  { id: 'event-triage', label: 'Event Triage', icon: Cpu },
] as const;

const PROMPT_CHIPS = [
  'Explain magnetic rigidity Bρ and why LHC needs 8.33 T dipoles.',
  'Why can a massive proton never reach the speed of light c?',
  'Explain Higgs gg fusion via low-x Bjorken Partons in ELI5 terms.',
  'How do 5σ significance and Z0 → μ+μ- cutflows prove a discovery?',
];

export const PartonAiCopilot: React.FC<PartonAiCopilotProps> = ({
  compact = false,
  defaultMode = 'copilot',
  contextOverride,
}) => {
  const pathname = usePathname();
  const userLevel = useGlobalStore((s) => s.userLevel);

  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-oss-120b');
  const [mode, setMode] = useState<'copilot' | 'law-guard' | 'event-triage'>(defaultMode);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<{
    configured: boolean;
    liveReachable: boolean | null;
    probeStatus: number | null;
  } | null>(null);

  useEffect(() => {
    fetch('/api/groq?probe=1')
      .then((r) => r.json())
      .then((d) => {
        setApiStatus({
          configured: Boolean(d.configured),
          liveReachable: d.liveReachable ?? null,
          probeStatus: d.probeStatus ?? null,
        });
      })
      .catch(() => {});
  }, []);

  const submitPrompt = async (textOverride?: string) => {
    const prompt = (textOverride ?? input).trim();
    if (!prompt || loading) return;

    playTemPadClick();
    setLoading(true);
    if (!textOverride) setInput('');

    const historyForApi = turns.slice(-4).map((t) => ({ role: t.role, content: t.content }));
    setTurns((prev) => [...prev, { role: 'user', content: prompt }]);

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode,
          model: selectedModel,
          level: userLevel,
          context: contextOverride || `Route: ${pathname}`,
          history: historyForApi,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        fallback?: boolean;
        model?: string;
        elapsedMs?: number;
        answer?: string;
        errorMessage?: string;
        upstreamStatus?: number | null;
      };

      setTurns((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || 'No response received.',
          model: data.model || selectedModel,
          elapsedMs: data.elapsedMs,
          fallback: Boolean(data.fallback),
          errorMessage: data.errorMessage,
        },
      ]);

      if (typeof data.upstreamStatus === 'number') {
        setApiStatus((prev) =>
          prev
            ? {
                ...prev,
                liveReachable: Boolean(data.ok),
                probeStatus: data.upstreamStatus ?? prev.probeStatus,
              }
            : null
        );
      }
      playParticlePulse(data.ok ? 860 : 540, 0.06, 0.05);
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to reach /api/groq endpoint. Verify the server is running.',
          fallback: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (txt: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {}
  };

  return (
    <div
      className={`bg-canvas-surface border-3 border-black shadow-[6px_6px_0px_#000] space-y-4 ${
        compact ? 'p-3' : 'p-5'
      }`}
    >
      {/* Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-cern-cyan text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-black text-base text-white uppercase">
              PARTON × Groq AI Physics Copilot
            </h3>
            <p className="text-[11px] font-mono text-text-muted">
              Adapts automatically to your active level (<strong className="text-cern-cyan">{userLevel}</strong>) with KaTeX math rendering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          {apiStatus?.liveReachable === true ? (
            <span className="px-2 py-0.5 bg-emerald-400 text-black font-black border border-black">
              GROQ CLOUD LIVE
            </span>
          ) : apiStatus?.configured ? (
            <span
              className="px-2 py-0.5 bg-amber-400 text-black font-black border border-black"
              title="Key detected in server env, live Groq endpoint returned auth/network status — deterministic fallback active"
            >
              AUTH {apiStatus.probeStatus ?? 'CHECK'} · LOCAL FALLBACK
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-200 font-bold border border-black">
              ENV KEY UNSET
            </span>
          )}
        </div>
      </div>

      {/* Model & Mode Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex flex-wrap gap-1.5">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModel(m.id)}
              className={`px-2.5 py-1 border-2 border-black font-bold cursor-pointer ${
                selectedModel === m.id
                  ? 'bg-cern-cyan text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-canvas-sub text-text-secondary hover:text-white'
              }`}
              title={m.tag}
            >
              {m.short}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`px-2 py-1 border-2 border-black font-bold flex items-center gap-1 cursor-pointer ${
                  mode === m.id
                    ? 'bg-[#FFE600] text-black'
                    : 'bg-canvas-sub text-text-muted hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {PROMPT_CHIPS.slice(0, compact ? 2 : 4).map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => submitPrompt(chip)}
            className="text-left text-[11px] font-mono px-2.5 py-1 bg-canvas-sub hover:bg-canvas-raised text-cern-cyan border border-black cursor-pointer truncate max-w-full"
          >
            ▸ {chip}
          </button>
        ))}
      </div>

      {/* Conversation History */}
      {turns.length > 0 && (
        <div
          className={`space-y-2.5 overflow-y-auto bg-canvas-sub border-2 border-black p-3 ${
            compact ? 'max-h-56' : 'max-h-96'
          }`}
        >
          {turns.map((turn, idx) => (
            <div
              key={idx}
              className={`p-3 border-2 border-black text-xs ${
                turn.role === 'user'
                  ? 'bg-cern-blue/25 border-cern-cyan/40 text-white font-mono'
                  : 'bg-black/80 text-text-secondary space-y-2'
              }`}
            >
              {turn.role === 'user' ? (
                <div>
                  <span className="text-[10px] font-black text-cern-cyan mr-2">YOU:</span>
                  {turn.content}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-1 font-mono text-[10px]">
                    <span className="text-emerald-400 font-bold">
                      {turn.model} {turn.elapsedMs ? `· ${turn.elapsedMs}ms` : ''}
                      {turn.fallback ? ' (Grounded Fallback)' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(turn.content, idx)}
                      className="text-text-muted hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  {turn.errorMessage && (
                    <div className="p-2 bg-[#250710] border border-cern-magenta text-[11px] font-mono text-amber-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-cern-magenta shrink-0 mt-0.5" />
                      <span>{turn.errorMessage}</span>
                    </div>
                  )}
                  <div className="font-sans leading-relaxed whitespace-pre-wrap text-xs">
                    <InlineMathText text={turn.content} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitPrompt();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about particle decays, magnets, Parton x, 5σ Higgs, or breaking physics laws..."
          aria-label="Ask PARTON Groq AI Copilot"
          className="flex-1 px-3 py-2 bg-canvas-sub text-white border-2 border-black font-mono text-xs focus:outline-none focus:border-cern-cyan"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-cern-cyan hover:bg-sky-300 disabled:opacity-50 text-black font-mono font-black text-xs border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>{loading ? 'Thinking' : 'Ask'}</span>
        </button>
      </form>
    </div>
  );
};
