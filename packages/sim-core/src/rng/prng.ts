/**
 * Seeded Deterministic Pseudo-Random Number Generator (Mulberry32)
 * Ensures reproducible simulations across all browsers and platforms.
 */

export class SeededRNG {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }

  /**
   * Returns a pseudorandom 32-bit unsigned integer
   */
  public nextUint32(): number {
    this.state = (this.state + 0x6D2B79F5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }

  /**
   * Returns a pseudorandom float in [0, 1)
   */
  public nextFloat(): number {
    return this.nextUint32() / 4294967296.0;
  }

  /**
   * Returns a pseudorandom number uniformly distributed in [min, max)
   */
  public uniform(min: number, max: number): number {
    return min + this.nextFloat() * (max - min);
  }

  /**
   * Generates normally distributed random variable using Box-Muller transform
   */
  public gaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = Math.max(1e-12, this.nextFloat());
    const u2 = this.nextFloat();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Generates a Poisson distributed random variable using Knuth's algorithm (or Gaussian approximation for large lambda)
   */
  public poisson(lambda: number): number {
    if (lambda <= 0) return 0;
    if (lambda > 30) {
      // Gaussian approximation for large lambda
      return Math.max(0, Math.round(this.gaussian(lambda, Math.sqrt(lambda))));
    }
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
      k++;
      p *= this.nextFloat();
    } while (p > L);
    return k - 1;
  }
}
