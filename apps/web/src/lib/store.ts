import { create } from 'zustand';

export type UserLevel = 'BEGINNER' | 'UNDERGRAD' | 'RESEARCHER';

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
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  citationDrawerOpen: boolean;
  setCitationDrawerOpen: (open: boolean) => void;
  activeManifestId: string | null;
  setActiveManifestId: (id: string | null) => void;
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
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  citationDrawerOpen: false,
  setCitationDrawerOpen: (open) => set({ citationDrawerOpen: open }),
  activeManifestId: null,
  setActiveManifestId: (id) => set({ activeManifestId: id, citationDrawerOpen: id !== null }),
}));


