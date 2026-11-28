import { create } from 'zustand';

export type UserLevel = 'BEGINNER' | 'UNDERGRAD' | 'RESEARCHER';

export interface OperatorMission {
  id: string;
  title: string;
  badge: string;
  targetHref: string;
  instruction: string;
  eli5Hint: string;
}

export const OPERATOR_MISSIONS: OperatorMission[] = [
  {
    id: 'mission-lhc-beam',
    title: 'Ramp LHC to 6.8 TeV Nominal Beam',
    badge: 'CCC Chief Engineer',
    targetHref: '/simulations?module=lhc',
    instruction: 'Launch LHC Dynamics and set beam energy to ≥ 6,800 GeV without quenching.',
    eli5Hint: 'Open LHC Dynamics and slide the Proton Beam Energy up to 6,800 GeV!',
  },
  {
    id: 'mission-higgs-5sigma',
    title: 'Claim the 5σ Higgs Discovery',
    badge: 'Discovery Laureate',
    targetHref: '/simulations?module=discovery',
    instruction: 'Stream collision data or tune cuts until significance Z₀ reaches ≥ 5.0 σ.',
    eli5Hint: 'Go to 5-Sigma Discovery and hit Stream Collisions until significance crosses 5σ!',
  },
  {
    id: 'mission-isolde-tb161',
    title: 'Isolate Cancer Isotope ¹⁶¹Tb at ISOLDE',
    badge: 'Nuclear Alchemist',
    targetHref: '/simulations?module=isolde',
    instruction: 'Select ¹⁶¹Tb (CERN-MEDICIS) and Auto-Lock the magnetic separator dipole field.',
    eli5Hint: 'Open ISOLDE Nuclear Lab, click ¹⁶¹Tb, and press Auto-Lock!',
  },
  {
    id: 'mission-quench-recovery',
    title: 'Witness & Recover Cryo Superfluidity',
    badge: 'Cryo Specialist',
    targetHref: '/engineering',
    instruction: 'Visit Engineering Digital Twin and inspect the 1.9 K Superfluid He-II phase transition.',
    eli5Hint: 'Drag Temperature above 2.17 K in Engineering Twin, then cool it back to 1.9 K!',
  },
  {
    id: 'mission-ai-trigger',
    title: 'Run Live TriggerMind Neural Inference',
    badge: 'L1 Trigger Architect',
    targetHref: '/ai-lab',
    instruction: 'Execute real TriggerMind-MLP inference on a Higgs event inside AI Lab.',
    eli5Hint: 'Open AI Lab → Live Neural Inference and test a signal candidate event!',
  },
  {
    id: 'mission-rich-kaon',
    title: 'Solve Kaon vs Pion Cherenkov Threshold',
    badge: 'RICH Optics Master',
    targetHref: '/simulations?module=rich-medipix',
    instruction: 'Inspect LHCb RICH-1 Cherenkov emission below 9 GeV/c where Kaons go dark.',
    eli5Hint: 'Open RICH & Medipix and slide Momentum to 6 GeV/c in C₄F₁₀ gas!',
  },
  {
    id: 'mission-tva-prune',
    title: 'Prune a Red Line Nexus Branch',
    badge: 'TVA Timekeeper',
    targetHref: '/simulations?module=tva-timeline',
    instruction: 'Visit TVA Sacred Timeline and trigger Detonate Time-Charge (Prune) on divergent quantum branches.',
    eli5Hint: 'Open TVA Sacred Timeline and press DETONATE TIME-CHARGE (PRUNE)!',
  },
  {
    id: 'mission-tva-intake',
    title: 'Clear 5 Events on 40 MHz Intake Desk',
    badge: 'Minuteman Trigger',
    targetHref: '/simulations?module=tva-intake',
    instruction: 'Stamp Keep (Trigger) or Prune (Discard) on 5 simulated LHC events at the TVA Intake Desk.',
    eli5Hint: 'Go to TVA Intake Desk and accurately sort 5 particle collisions!',
  },
  {
    id: 'mission-arc-magnet',
    title: 'Energize HL-LHC Nb₃Sn Beyond 12 T',
    badge: 'Stark Cryo Engineer',
    targetHref: '/simulations?module=arc-magnet',
    instruction: 'Drive the Arc Magnet HUD above 12 Tesla using HL-LHC Nb₃Sn superconductors without quenching.',
    eli5Hint: 'Open Arc Magnet HUD, pick Nb₃Sn, and slide Magnetic Field above 12 T!',
  },
  {
    id: 'mission-quantum-zoom',
    title: 'Dive to 10⁻¹⁹ m Quark Substructure',
    badge: 'Quantum Explorer',
    targetHref: '/simulations?module=quantum-zoom',
    instruction: 'Zoom down past the Proton radius (10⁻¹⁵ m) into quarks and the electroweak scale (10⁻¹⁹ m).',
    eli5Hint: 'Open Quantum Realm Zoom and slide the scale exponent below -18!',
  },
];

function loadSavedMissions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('cernx_missions_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSavedTvaMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('cernx_tva_mode_v1') === 'true';
  } catch {
    return false;
  }
}

export interface BetRecord {
  picked: number;
  won: boolean;
  wager: number;
}

interface SavedBetState {
  credits: number;
  streak: number;
  settled: Record<string, BetRecord>;
}

function loadSavedBets(): SavedBetState {
  if (typeof window === 'undefined') return { credits: 100, streak: 0, settled: {} };
  try {
    const raw = window.localStorage.getItem('cernx_bets_v1');
    if (!raw) return { credits: 100, streak: 0, settled: {} };
    const parsed = JSON.parse(raw) as Partial<SavedBetState>;
    return {
      credits: typeof parsed.credits === 'number' ? parsed.credits : 100,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      settled: parsed.settled && typeof parsed.settled === 'object' ? parsed.settled : {},
    };
  } catch {
    return { credits: 100, streak: 0, settled: {} };
  }
}

interface SavedChallengeState {
  completedChallenges: string[];
  testedLaws: string[];
}

function loadSavedChallenges(): SavedChallengeState {
  if (typeof window === 'undefined') return { completedChallenges: [], testedLaws: [] };
  try {
    const raw = window.localStorage.getItem('parton_challenges_v1');
    if (!raw) return { completedChallenges: [], testedLaws: [] };
    const parsed = JSON.parse(raw) as Partial<SavedChallengeState>;
    return {
      completedChallenges: Array.isArray(parsed.completedChallenges) ? parsed.completedChallenges : [],
      testedLaws: Array.isArray(parsed.testedLaws) ? parsed.testedLaws : [],
    };
  } catch {
    return { completedChallenges: [], testedLaws: [] };
  }
}

export interface GlobalState {
  userLevel: UserLevel;
  setUserLevel: (level: UserLevel) => void;
  complexityLevel?: 'beginner' | 'undergrad' | 'researcher';
  eli5Mode: boolean;
  setEli5Mode: (active: boolean) => void;
  toggleEli5Mode: () => void;
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;
  dataClassOverlay: boolean;
  setDataClassOverlay: (active: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSoundEnabled: () => void;
  tvaMode: boolean;
  setTvaMode: (active: boolean) => void;
  toggleTvaMode: () => void;
  hydrateTvaMode: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  citationDrawerOpen: boolean;
  setCitationDrawerOpen: (open: boolean) => void;
  activeManifestId: string | null;
  setActiveManifestId: (id: string | null) => void;
  missionsOpen: boolean;
  setMissionsOpen: (open: boolean) => void;
  companionOpen: boolean;
  setCompanionOpen: (open: boolean) => void;
  toggleCompanion: () => void;
  completedMissions: string[];
  completeMission: (id: string) => void;
  resetMissions: () => void;
  hydrateMissions: () => void;
  betCredits: number;
  betStreak: number;
  settledBets: Record<string, BetRecord>;
  placePhysicsBet: (id: string, picked: number, correctIndex: number, wager: number) => void;
  resetBets: () => void;
  hydrateBets: () => void;
  completedChallenges: string[];
  testedLawViolations: string[];
  hydrateChallenges: () => void;
  completeChallenge: (id: string, rewardCredits: number) => void;
  recordLawViolation: (lawId: string) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  userLevel: 'BEGINNER',
  complexityLevel: 'beginner',
  setUserLevel: (level) =>
    set(() => ({
      userLevel: level,
      complexityLevel: level.toLowerCase() as 'beginner' | 'undergrad' | 'researcher',
      eli5Mode: level === 'BEGINNER',
    })),
  eli5Mode: true,
  setEli5Mode: (active) => set({ eli5Mode: active }),
  toggleEli5Mode: () => set((state) => ({ eli5Mode: !state.eli5Mode })),
  reduceMotion: false,
  setReduceMotion: (reduce) => set({ reduceMotion: reduce }),
  dataClassOverlay: false,
  setDataClassOverlay: (active) => set({ dataClassOverlay: active }),
  soundEnabled: false,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  toggleSoundEnabled: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  tvaMode: false,
  setTvaMode: (active) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('cernx_tva_mode_v1', String(active));
      } catch {}
      document.documentElement.classList.toggle('cern-tva-theme', active);
    }
    set({ tvaMode: active });
  },
  toggleTvaMode: () =>
    set((state) => {
      const next = !state.tvaMode;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('cernx_tva_mode_v1', String(next));
        } catch {}
        document.documentElement.classList.toggle('cern-tva-theme', next);
      }
      return { tvaMode: next };
    }),
  hydrateTvaMode: () => {
    const saved = loadSavedTvaMode();
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('cern-tva-theme', saved);
    }
    set({ tvaMode: saved });
  },
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  citationDrawerOpen: false,
  setCitationDrawerOpen: (open) => set({ citationDrawerOpen: open }),
  activeManifestId: null,
  setActiveManifestId: (id) => set({ activeManifestId: id, citationDrawerOpen: id !== null }),
  missionsOpen: false,
  setMissionsOpen: (open) => set({ missionsOpen: open }),
  companionOpen: false,
  setCompanionOpen: (open) => set({ companionOpen: open }),
  toggleCompanion: () => set((state) => ({ companionOpen: !state.companionOpen })),
  completedMissions: [],
  hydrateMissions: () => set({ completedMissions: loadSavedMissions() }),
  completeMission: (id) =>
    set((state) => {
      if (state.completedMissions.includes(id)) return state;
      const next = [...state.completedMissions, id];
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('cernx_missions_v1', JSON.stringify(next));
        } catch {}
      }
      return { completedMissions: next };
    }),
  resetMissions: () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('cernx_missions_v1');
      } catch {}
    }
    set({ completedMissions: [] });
  },
  betCredits: 100,
  betStreak: 0,
  settledBets: {},
  hydrateBets: () => {
    const saved = loadSavedBets();
    set({ betCredits: saved.credits, betStreak: saved.streak, settledBets: saved.settled });
  },
  placePhysicsBet: (id, picked, correctIndex, wager) =>
    set((state) => {
      const cleanWager = Math.max(10, Math.min(wager, Math.max(10, state.betCredits)));
      const won = picked === correctIndex;
      const nextCredits = Math.max(25, state.betCredits + (won ? cleanWager : -cleanWager));
      const nextStreak = won ? state.betStreak + 1 : 0;
      const nextSettled = { ...state.settledBets, [id]: { picked, won, wager: cleanWager } };
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(
            'cernx_bets_v1',
            JSON.stringify({ credits: nextCredits, streak: nextStreak, settled: nextSettled })
          );
        } catch {}
      }
      return { betCredits: nextCredits, betStreak: nextStreak, settledBets: nextSettled };
    }),
  resetBets: () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('cernx_bets_v1');
      } catch {}
    }
    set({ betCredits: 100, betStreak: 0, settledBets: {} });
  },
  completedChallenges: [],
  testedLawViolations: [],
  hydrateChallenges: () => {
    const saved = loadSavedChallenges();
    set({
      completedChallenges: saved.completedChallenges,
      testedLawViolations: saved.testedLaws,
    });
  },
  completeChallenge: (id, rewardCredits) =>
    set((state) => {
      if (state.completedChallenges.includes(id)) return state;
      const nextChallenges = [...state.completedChallenges, id];
      const nextCredits = state.betCredits + Math.max(0, rewardCredits);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(
            'parton_challenges_v1',
            JSON.stringify({
              completedChallenges: nextChallenges,
              testedLaws: state.testedLawViolations,
            })
          );
          window.localStorage.setItem(
            'cernx_bets_v1',
            JSON.stringify({
              credits: nextCredits,
              streak: state.betStreak,
              settled: state.settledBets,
            })
          );
        } catch {}
      }
      return { completedChallenges: nextChallenges, betCredits: nextCredits };
    }),
  recordLawViolation: (lawId) =>
    set((state) => {
      if (state.testedLawViolations.includes(lawId)) return state;
      const nextLaws = [...state.testedLawViolations, lawId];
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(
            'parton_challenges_v1',
            JSON.stringify({
              completedChallenges: state.completedChallenges,
              testedLaws: nextLaws,
            })
          );
        } catch {}
      }
      return { testedLawViolations: nextLaws };
    }),
}));
