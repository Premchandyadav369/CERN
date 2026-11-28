/**
 * Parameterized DGLAP-inspired Proton Parton Distribution Function (PDF) kernel.
 * Produces educational analytic curves x*f(x, Q^2) capturing CTEQ/NNPDF qualitative scaling:
 * - Up/down valence peaks near x ~ 0.17 with u_v > d_v (proton uud composition)
 * - Explosive low-x gluon sea (g) and sea quark (qbar) growth as x -> 1e-4
 * - Logarithmic DGLAP Q^2 evolution softening high-x valence and feeding low-x glue
 */

export interface PartonDensityPoint {
  x: number;
  qGev: number;
  /** x * u_v(x, Q^2) */
  xUv: number;
  /** x * d_v(x, Q^2) */
  xDv: number;
  /** x * g(x, Q^2) (full unscaled gluon momentum density) */
  xGluon: number;
  /** x * q_sea(x, Q^2) */
  xSea: number;
  /** Characteristic total momentum share density */
  gluonFraction: number;
}

export interface LhcPartonChannelEstimate {
  typicalX: number;
  qScaleGev: number;
  ggChannelShare: number;
  qqbarChannelShare: number;
  valenceValenceShare: number;
  dominantSubprocess: string;
}

/**
 * Evaluates parameterized CTEQ-style parton distributions at Bjorken-x and scale Q (GeV).
 */
export function evaluateProtonPdf(xInput: number, qGevInput: number): PartonDensityPoint {
  const x = Math.min(0.985, Math.max(1e-4, xInput));
  const qGev = Math.min(3000, Math.max(1.5, qGevInput));

  // QCD evolution variable t = ln(ln(Q^2 / Lambda^2) / ln(Q0^2 / Lambda^2))
  const lambdaGev = 0.22;
  const q0Gev = 2.0;
  const tRaw = Math.log(Math.log((qGev * qGev) / (lambdaGev * lambdaGev)) / Math.log((q0Gev * q0Gev) / (lambdaGev * lambdaGev)));
  const t = Math.max(0, tRaw);

  // Valence distributions shift downward in x with Q^2 (DGLAP radiation)
  const uNorm = 3.25 * Math.exp(-0.045 * t);
  const dNorm = 1.95 * Math.exp(-0.05 * t);
  const xUv = uNorm * Math.pow(x, 0.72) * Math.pow(1 - x, 3.25 + 0.35 * t);
  const xDv = dNorm * Math.pow(x, 0.76) * Math.pow(1 - x, 4.15 + 0.38 * t);

  // Low-x gluon rise steepens with t while large-x falls off smoothly
  const gluonExponent = 0.16 + 0.065 * Math.min(t, 2.5);
  const gluonNorm = 1.85 + 0.42 * t;
  const xGluon = gluonNorm * Math.pow(x, -gluonExponent) * Math.pow(1 - x, 5.4 + 0.45 * t);

  // Quark-antiquark sea tracks gluon splitting g -> q qbar
  const seaNorm = 0.36 + 0.08 * t;
  const xSea = seaNorm * Math.pow(x, -0.18 - 0.03 * Math.min(t, 2.5)) * Math.pow(1 - x, 6.2 + 0.4 * t);

  const total = Math.max(1e-9, xUv + xDv + xGluon + xSea);

  return {
    x,
    qGev,
    xUv,
    xDv,
    xGluon,
    xSea,
    gluonFraction: xGluon / total,
  };
}

/**
 * Estimates which colliding parton subprocess dominates producing resonance mass M_X at sqrt(s).
 */
export function evaluateLhcPartonLuminosity(
  massGev: number,
  sqrtSTev = 13.6
): LhcPartonChannelEstimate {
  const sqrtSGev = Math.max(100, sqrtSTev * 1000);
  const typicalX = Math.min(0.95, Math.max(1e-4, massGev / sqrtSGev));
  const qScaleGev = Math.max(2, massGev);
  const pdf = evaluateProtonPdf(typicalX, qScaleGev);

  const wGg = pdf.xGluon * pdf.xGluon;
  const wQqbar = 2 * (pdf.xUv + pdf.xDv) * pdf.xSea * 0.5 + pdf.xSea * pdf.xSea;
  const wVal = (pdf.xUv + pdf.xDv) * (pdf.xUv + pdf.xDv) * 0.35;
  const sum = Math.max(1e-12, wGg + wQqbar + wVal);

  const ggChannelShare = wGg / sum;
  const qqbarChannelShare = wQqbar / sum;
  const valenceValenceShare = wVal / sum;

  let dominantSubprocess = 'g + g → X (Gluon-Gluon Fusion)';
  if (qqbarChannelShare > ggChannelShare && qqbarChannelShare >= valenceValenceShare) {
    dominantSubprocess = 'q + q̄ → X (Drell-Yan / Weak Boson)';
  } else if (valenceValenceShare > ggChannelShare && valenceValenceShare > qqbarChannelShare) {
    dominantSubprocess = 'q + q → Jets (High-x Valence Scatter)';
  }

  return {
    typicalX,
    qScaleGev,
    ggChannelShare,
    qqbarChannelShare,
    valenceValenceShare,
    dominantSubprocess,
  };
}
