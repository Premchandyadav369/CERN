import { useGlobalStore } from '@/lib/store';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!useGlobalStore.getState().soundEnabled) return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/** Subatomic particle click / Geiger-like pulse */
export function playParticlePulse(freqHz = 520, durationSec = 0.045, gainVal = 0.05): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqHz, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch {
    // Ignore audio context restrictions cleanly
  }
}

/** Sonify a reconstructed invariant mass or particle collision energy */
export function playResonanceTone(massGev: number): void {
  const mappedFreq = Math.max(180, Math.min(1320, 220 + massGev * 4.2));
  playParticlePulse(mappedFreq, 0.09, 0.06);
}

/** 5-sigma / mission discovery ascending arpeggio */
export function playDiscoveryChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
    setTimeout(() => playParticlePulse(freq, 0.14, 0.06), idx * 75);
  });
}

/** Crisp TVA TemPad CRT confirmation chirp */
export function playTemPadClick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  playParticlePulse(880, 0.035, 0.045);
  setTimeout(() => playParticlePulse(1174.66, 0.04, 0.04), 38);
}

/** Descending amber Time-Charge prune chord sweep */
export function playTimeChargeSweep(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.42);
    gain.gain.setValueAtTime(0.055, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.46);
  } catch {
    // Ignore audio errors cleanly
  }
}

/** Low subtle warning tone for magnet quench or Red Line breach */
export function playQuenchAlarm(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  [260, 195].forEach((freq, idx) => {
    setTimeout(() => playParticlePulse(freq, 0.14, 0.055), idx * 130);
  });
}
