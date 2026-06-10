import { create } from 'zustand';
import type { GameState, Objective, SettlementResult } from '../types/game';
import type { SubmarineState, Sample, MapMarker } from '../types/entities';

interface Message {
  text: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface GameStoreState {
  gameState: GameState;
  currentLevelId: string | null;
  submarineState: SubmarineState | null;
  objectives: Objective[];
  collectedSamples: Sample[];
  mapMarkers: MapMarker[];
  gameTime: number;
  settlementResult: SettlementResult | null;
  isPaused: boolean;
  message: Message | null;
}

interface GameStoreActions {
  setGameState: (state: GameState) => void;
  setCurrentLevel: (levelId: string) => void;
  updateSubmarineState: (partial: Partial<SubmarineState>) => void;
  updateObjectives: (objectives: Objective[]) => void;
  addCollectedSample: (sample: Sample) => void;
  addMapMarker: (marker: MapMarker) => void;
  removeMapMarker: (markerId: string) => void;
  setGameTime: (time: number) => void;
  setSettlementResult: (result: SettlementResult | null) => void;
  togglePause: () => void;
  showMessage: (text: string, type: Message['type']) => void;
  clearMessage: () => void;
  resetGame: () => void;
}

const initialState: GameStoreState = {
  gameState: 'menu',
  currentLevelId: null,
  submarineState: null,
  objectives: [],
  collectedSamples: [],
  mapMarkers: [],
  gameTime: 0,
  settlementResult: null,
  isPaused: false,
  message: null,
};

export const useGameStore = create<GameStoreState & GameStoreActions>((set) => ({
  ...initialState,

  setGameState: (state) => set({ gameState: state }),

  setCurrentLevel: (levelId) => set({ currentLevelId: levelId }),

  updateSubmarineState: (partial) =>
    set((state) => ({
      submarineState: state.submarineState
        ? { ...state.submarineState, ...partial }
        : null,
    })),

  updateObjectives: (objectives) => set({ objectives }),

  addCollectedSample: (sample) =>
    set((state) => ({
      collectedSamples: [...state.collectedSamples, sample],
    })),

  addMapMarker: (marker) =>
    set((state) => ({
      mapMarkers: [...state.mapMarkers, marker],
    })),

  removeMapMarker: (markerId) =>
    set((state) => ({
      mapMarkers: state.mapMarkers.filter((m) => m.id !== markerId),
    })),

  setGameTime: (time) => set({ gameTime: time }),

  setSettlementResult: (result) => set({ settlementResult: result }),

  togglePause: () =>
    set((state) => ({
      isPaused: !state.isPaused,
      gameState: state.isPaused ? 'playing' : 'paused',
    })),

  showMessage: (text, type) => set({ message: { text, type } }),

  clearMessage: () => set({ message: null }),

  resetGame: () => set(initialState),
}));
