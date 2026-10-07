import { create } from 'zustand';

export type UserLevel = 'BEGINNER' | 'UNDERGRAD' | 'RESEARCHER';

interface GlobalState {
  userLevel: UserLevel;
  setUserLevel: (level: UserLevel) => void;
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
  userLevel: 'UNDERGRAD',
  setUserLevel: (level) => set({ userLevel: level }),
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
