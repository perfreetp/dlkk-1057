import { create } from 'zustand';
import type { GameSave } from '../types/game';
import { loadFromStorage, saveToStorage, removeFromStorage } from '../utils/storage';
import { UPGRADES } from '../data/upgrades';

const STORAGE_KEY = 'deepsea_adventure_save';

interface SaveStoreState {
  save: GameSave | null;
  isLoaded: boolean;
}

interface SaveStoreActions {
  loadSave: () => void;
  saveSave: () => void;
  createNewSave: (playerName: string) => void;
  upgradePart: (partId: string, level: number) => boolean;
  unlockLevel: (levelId: string) => void;
  addSampleToCollection: (sampleId: string) => void;
  addLog: (logId: string) => void;
  addCredits: (amount: number) => void;
  setHighScore: (levelId: string, score: number) => void;
  hasEnoughCredits: (cost: number) => boolean;
  resetSave: () => void;
}

const initialSave: GameSave = {
  playerName: '',
  currentLevel: 'level1',
  unlockedLevels: ['level1'],
  upgrades: {},
  collectedSamples: [],
  collectedLogs: [],
  highScores: {},
  totalCredits: 0,
};

export const useSaveStore = create<SaveStoreState & SaveStoreActions>((set, get) => ({
  save: null,
  isLoaded: false,

  loadSave: () => {
    const saved = loadFromStorage<GameSave>(STORAGE_KEY);
    if (saved) {
      set({ save: saved, isLoaded: true });
    } else {
      set({ save: null, isLoaded: true });
    }
  },

  saveSave: () => {
    const { save } = get();
    if (save) {
      saveToStorage(STORAGE_KEY, save);
    }
  },

  createNewSave: (playerName: string) => {
    const newSave: GameSave = {
      ...initialSave,
      playerName,
    };
    set({ save: newSave });
    get().saveSave();
  },

  upgradePart: (partId: string, level: number) => {
    const { save, hasEnoughCredits } = get();
    if (!save) return false;

    const upgrade = UPGRADES.find((u) => u.id === partId);
    if (!upgrade) return false;
    if (level < 0 || level > upgrade.maxLevel) return false;

    const cost = upgrade.costs[level - 1];
    if (!hasEnoughCredits(cost)) return false;

    set({
      save: {
        ...save,
        upgrades: {
          ...save.upgrades,
          [partId]: level,
        },
        totalCredits: save.totalCredits - cost,
      },
    });

    get().saveSave();
    return true;
  },

  unlockLevel: (levelId: string) => {
    const { save } = get();
    if (!save) return;
    if (save.unlockedLevels.includes(levelId)) return;

    set({
      save: {
        ...save,
        unlockedLevels: [...save.unlockedLevels, levelId],
      },
    });

    get().saveSave();
  },

  addSampleToCollection: (sampleId: string) => {
    const { save } = get();
    if (!save) return;
    if (save.collectedSamples.includes(sampleId)) return;

    set({
      save: {
        ...save,
        collectedSamples: [...save.collectedSamples, sampleId],
      },
    });

    get().saveSave();
  },

  addLog: (logId: string) => {
    const { save } = get();
    if (!save) return;
    if (save.collectedLogs.includes(logId)) return;

    set({
      save: {
        ...save,
        collectedLogs: [...save.collectedLogs, logId],
      },
    });

    get().saveSave();
  },

  addCredits: (amount: number) => {
    const { save } = get();
    if (!save) return;

    set({
      save: {
        ...save,
        totalCredits: save.totalCredits + amount,
      },
    });

    get().saveSave();
  },

  setHighScore: (levelId: string, score: number) => {
    const { save } = get();
    if (!save) return;

    const currentHighScore = save.highScores[levelId] || 0;
    if (score <= currentHighScore) return;

    set({
      save: {
        ...save,
        highScores: {
          ...save.highScores,
          [levelId]: score,
        },
      },
    });

    get().saveSave();
  },

  hasEnoughCredits: (cost: number) => {
    const { save } = get();
    return save !== null && save.totalCredits >= cost;
  },

  resetSave: () => {
    removeFromStorage(STORAGE_KEY);
    set({ save: null });
  },
}));
