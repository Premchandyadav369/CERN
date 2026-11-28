import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface GroqModelInfo {
  id: string;
  label: string;
  tier: 'FLAGSHIP REASONING' | 'ULTRA-FAST';
  description: string;
}

const GROQ_MODEL_CATALOG: GroqModelInfo[] = [
  {
    id: 'openai/gpt-oss-120b',
    label: 'GPT-OSS 120B (MoE Flagship)',
    tier: 'FLAGSHIP REASONING',
    description: '120B Mixture-of-Experts with deep physics & mathematical derivation capability (~500 tok/s on Groq).',
  },
  {
    id: 'openai/gpt-oss-20b',
    label: 'GPT-OSS 20B (Instant MoE)',
    tier: 'ULTRA-FAST',
    description: 'Compact 20B MoE (3.6B active) for near-instant ELI5 explanations, trigger triage, and study hints.',
  },
];

const ALLOWED_MODELS = new Set(GROQ_MODEL_CATALOG.map((m) => m.id));

type CopilotMode = 'copilot' | 'law-guard' | 'event-triage';
type DepthLevel = 'BEGINNER' | 'UNDERGRAD' | 'RESEARCHER';

function buildSystemPrompt(mode: CopilotMode, level: DepthLevel, context?: string): string {
  const depthRule =
    level === 'BEGINNER'
      ? 'Audience depth: ELI5 / Beginner (101). Lead with a clear everyday analogy, plain English, and 2-3 punchy takeaways. Keep inline LaTeX light like $E = mc^2$.'
      : level === 'UNDERGRAD'
      ? 'Audience depth: Undergraduate Physics (BSc). Combine clear intuition with exact conservation laws and clean inline LaTeX ($...$).'
      : 'Audience depth: Research Physicist (PhD). Use exact QFT, collider kinematics ($\\sqrt{s}$, $\\beta^*$, $B\\rho$, $\\Delta R$, $\\lambda(\\mu)$), PDG 2024 rigor, and compact inline LaTeX ($...$).';

  const modeRule =
    mode === 'law-guard'
      ? 'Task mode: Law Violation & Physical Limits Explainer. Clearly separate: (1) What happens physically, (2) ELI5 intuition, and (3) Mathematical law violated.'
      : mode === 'event-triage'
      ? 'Task mode: LHC Trigger & Collision Event Interpreter. Evaluate kinematics ($p_T$, $\\eta$, $E_T^{miss}$, invariant mass), classify likely signal vs QCD background, and state uncertainties honestly.'
      : 'Task mode: Interactive Physics Copilot for PARTON (an independent particle physics digital twin covering CERN accelerators, 3D detectors, Parton distributions, Open Data, and QFT). Never invent measurements; use single-dollar `$...$` for inline math.';

  return `${modeRule}\n${depthRule}\nActive page/context: ${context || 'General PARTON Laboratory'}.\nKeep answers concise, factual, structured with short bullets, and strictly non-affiliated with official CERN governance.`;
}

function buildGroundedLocalFallback(prompt: string, mode: CopilotMode, level: DepthLevel): string {
  const q = prompt.toLowerCase();
  if (q.includes('light') || q.includes('faster') || q.includes('speed') || q.includes('c ')) {
    return level === 'BEGINNER'
      ? 'Particles with mass can NEVER hit light speed $c$ because every extra LHC kick increases relativistic mass-energy $E = \\gamma m c^2$ instead of pushing speed past $0.999999991\\,c$! Try the Speed of Light barrier inside `/challenges` to test $\\gamma$ up to $10^9$.'
      : 'Special Relativity forbids massive particles from reaching $\\beta = v/c = 1$: total proton energy follows $E = \\gamma m_p c^2$ with $\\gamma = (1 - \\beta^2)^{-1/2} \\to \\infty$ as $\\beta \\to 1$. At $6.8\\text{ TeV}$, $\\gamma \\approx 7247$ and $\\beta \\approx 0.9999999905$.';
  }
  if (q.includes('higgs') || q.includes('5 sigma') || q.includes('5σ') || q.includes('discovery')) {
    return 'In collider physics, discovery requires Asimov profile-likelihood significance $Z_0 = \\sqrt{2((s+b)\\ln(1+s/b)-s)} \\ge 5.0\\,\\sigma$ (a $\\sim 3 \\times 10^{-7}$ background fluctuation odds). At $13.6\\text{ TeV}$, Higgs production is dominated ($>85\\%$) by low-$x$ gluon-gluon fusion $gg \\to H$ inside protons!';
  }
  if (q.includes('quench') || q.includes('magnet') || q.includes('helium') || q.includes('1.9')) {
    return 'LHC bending relies on magnetic rigidity $B\\rho = p / (0.299792\\,|Z|)$. Holding $6.8\\text{ TeV}$ protons in $\\rho = 2803.95\\text{ m}$ needs $\\sim 8.1–8.33\\text{ T}$ inside $\\text{NbTi}$ coils cooled by superfluid He-II ($T \\le 2.17\\text{ K}$). Crossing $B_{c2}(T)$ triggers a thermal quench dumping $362\\text{ MJ}$!';
  }
  if (q.includes('parton') || q.includes('gluon') || q.includes('bjorken') || q.includes('quark')) {
    return 'Feynman’s Parton model reveals protons as dynamic bags of 3 valence quarks ($uud$) plus a dense sea of gluons and $q\\bar{q}$ pairs. At momentum fraction $x \\approx M_H / \\sqrt{s} \\approx 0.0092$, gluon density $xg(x, Q^2)$ overwhelms valence quarks—explaining why the LHC is fundamentally a gluon collider!';
  }
  if (mode === 'event-triage') {
    return 'Event Triage Heuristic: Look for isolated high-$p_T$ leptons ($e^\\pm, \\mu^\\pm$) with invariant mass $m_{\\ell\\ell} \\approx 91.19\\text{ GeV}$ ($Z^0$ pole) or $m_{4\\ell} / m_{\\gamma\\gamma} \\approx 125.25\\text{ GeV}$ ($H^0$). Multi-jet events with soft $p_T$ and zero missing $E_T^{\\text{miss}}$ are overwhelmingly soft QCD background.';
  }
  return 'Grounded Physics Summary: All PARTON calculations execute deterministically in `@cern-x/sim-core` using exact relations such as $B\\rho = p/(0.2998\\,|Z|)$, $Z_0 = \\sqrt{2((s+b)\\ln(1+s/b)-s)}$, and NNLO vacuum stability $m_H^{\\text{crit}}$. Refresh `GROQ_API_KEY` in `apps/web/.env.local` for live neural synthesis across any custom question!';
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY?.trim() ?? '';
  const configured = Boolean(apiKey);
  const probe = req.nextUrl.searchParams.get('probe') === '1';

  let liveReachable: boolean | null = null;
  let probeStatus: number | null = null;

  if (configured && probe) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      probeStatus = res.status;
      liveReachable = res.ok;
    } catch {
      liveReachable = false;
    }
  }

  return NextResponse.json(
    {
      status: 'ok',
      configured,
      liveReachable,
      probeStatus,
      primaryModel: process.env.GROQ_PRIMARY_MODEL || 'openai/gpt-oss-120b',
      fastModel: process.env.GROQ_FAST_MODEL || 'openai/gpt-oss-20b',
      catalog: GROQ_MODEL_CATALOG,
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      prompt?: string;
      mode?: CopilotMode;
      model?: string;
      level?: DepthLevel;
      context?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    const prompt = String(body.prompt || '').trim();
    if (!prompt || prompt.length > 3000) {
      return NextResponse.json(
        { ok: false, errorMessage: 'Prompt must be between 1 and 3,000 characters.' },
        { status: 400 }
      );
    }

    const mode: CopilotMode =
      body.mode === 'law-guard' || body.mode === 'event-triage' ? body.mode : 'copilot';
    const level: DepthLevel =
      body.level === 'UNDERGRAD' || body.level === 'RESEARCHER' ? body.level : 'BEGINNER';
    const requestedModel = body.model && ALLOWED_MODELS.has(body.model)
      ? body.model
      : process.env.GROQ_PRIMARY_MODEL && ALLOWED_MODELS.has(process.env.GROQ_PRIMARY_MODEL)
      ? process.env.GROQ_PRIMARY_MODEL
      : 'openai/gpt-oss-120b';

    const apiKey = process.env.GROQ_API_KEY?.trim() ?? '';
    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        fallback: true,
        model: requestedModel,
        upstreamStatus: null,
        errorMessage: 'GROQ_API_KEY is not configured in server environment (apps/web/.env.local).',
        answer: buildGroundedLocalFallback(prompt, mode, level),
      });
    }

    const systemPrompt = buildSystemPrompt(mode, level, body.context);
    const trimmedHistory = Array.isArray(body.history)
      ? body.history
          .slice(-6)
          .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      : [];

    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);

    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: requestedModel,
        temperature: 0.25,
        max_tokens: 700,
        messages: [
          { role: 'system', content: systemPrompt },
          ...trimmedHistory,
          { role: 'user', content: prompt },
        ],
      }),
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      let detail = `Groq upstream returned HTTP ${upstream.status}.`;
      try {
        const errJson = (await upstream.json()) as { error?: { message?: string; code?: string } };
        if (errJson?.error?.message) {
          detail = `Groq HTTP ${upstream.status}: ${errJson.error.message}`;
        }
      } catch {}

      return NextResponse.json({
        ok: false,
        fallback: true,
        model: requestedModel,
        upstreamStatus: upstream.status,
        errorMessage:
          upstream.status === 401
            ? `${detail} Update GROQ_API_KEY in apps/web/.env.local with an active GroqCloud key.`
            : detail,
        answer: buildGroundedLocalFallback(prompt, mode, level),
      });
    }

    const data = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    const answer = data.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({
      ok: true,
      fallback: false,
      model: requestedModel,
      elapsedMs: Date.now() - startedAt,
      usage: data.usage ?? null,
      answer: answer || buildGroundedLocalFallback(prompt, mode, level),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        fallback: true,
        errorMessage: error instanceof Error ? error.message : 'Unexpected Groq route failure.',
        answer: buildGroundedLocalFallback('', 'copilot', 'BEGINNER'),
      },
      { status: 200 }
    );
  }
}
