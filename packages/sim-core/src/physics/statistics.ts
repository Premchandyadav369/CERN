/**
 * Statistical Significance & Discovery Formulas
 * Source: Cowan, Cranmer, Gross, Vitells (Eur. Phys. J. C 71 (2011) 1554)
 */

/**
 * Standard naive significance s / sqrt(b)
 */
export function simpleSignificance(signal: number, background: number): number {
  if (background <= 0) return 0;
  return signal / Math.sqrt(background);
}

/**
 * Asimov discovery significance Z_A for counting experiment with Poisson background:
 * Z_A = sqrt(2 * ((s + b) * ln(1 + s / b) - s))
 */
export function asimovSignificance(signal: number, background: number): number {
  if (background <= 0 || signal <= 0) return 0;
  const term = (signal + background) * Math.log(1 + signal / background) - signal;
  return Math.sqrt(Math.max(0, 2 * term));
}

/**
 * Approximate Median Significance (AMS) used in the ATLAS Higgs Machine Learning Challenge
 * AMS = sqrt(2 * ((s + b + br) * ln(1 + s / (b + br)) - s))
 * Default br = 10.0 (regularization term)
 */
export function calculateAMS(signal: number, background: number, br: number = 10.0): number {
  if (signal <= 0) return 0;
  const bTotal = background + br;
  const term = (signal + bTotal) * Math.log(1 + signal / bTotal) - signal;
  return Math.sqrt(Math.max(0, 2 * term));
}
