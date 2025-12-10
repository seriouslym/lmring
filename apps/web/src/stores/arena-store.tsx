'use client';

import { createContext, type ReactNode, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  DEFAULT_MODEL_CONFIG,
  type ModelComparison,
  type ModelConfig,
  type ModelOption,
} from '@/types/arena';

export type ArenaState = {
  comparisons: ModelComparison[];
  globalPrompt: string;
  initialized: boolean;
  availableModels: ModelOption[];
};

export type ArenaActions = {
  setGlobalPrompt: (prompt: string) => void;
  initializeComparisons: (availableModels: ModelOption[]) => void;
  addComparison: () => void;
  updateComparison: (index: number, update: Partial<ModelComparison>) => void;
  removeComparison: (index: number) => void;
  selectModel: (index: number, modelId: string) => void;
  toggleSync: (index: number, synced: boolean) => void;
  updateConfig: (index: number, config: ModelConfig) => void;
  setCustomPrompt: (index: number, prompt: string) => void;
  moveLeft: (index: number) => void;
  moveRight: (index: number) => void;
  clearComparison: (index: number) => void;
  setLoading: (index: number, isLoading: boolean) => void;
  setResponse: (
    index: number,
    response: string,
    responseTime?: number,
    tokenCount?: number,
  ) => void;
  setError: (index: number, error: string) => void;
  setAvailableModels: (models: ModelOption[]) => void;
};

export type ArenaStore = ArenaState & ArenaActions;

function createEmptyComparison(id: string, modelId = ''): ModelComparison {
  return {
    id,
    modelId,
    response: '',
    isLoading: false,
    synced: true,
    customPrompt: '',
    config: { ...DEFAULT_MODEL_CONFIG },
  };
}

const defaultInitState: ArenaState = {
  comparisons: [],
  globalPrompt: '',
  initialized: false,
  availableModels: [],
};

export const createArenaStore = (initState: Partial<ArenaState> = {}) => {
  return createStore<ArenaStore>()(
    devtools(
      (set, get) => ({
        ...defaultInitState,
        ...initState,

        setGlobalPrompt: (prompt) => set({ globalPrompt: prompt }, false, 'arena/setGlobalPrompt'),

        initializeComparisons: (availableModels) => {
          const state = get();
          if (state.initialized || availableModels.length === 0) return;

          const defaultModelId = availableModels[0]?.id || '';
          const secondDefaultModelId =
            availableModels.find((m) => m.id !== defaultModelId)?.id || defaultModelId;

          set(
            {
              comparisons: [
                createEmptyComparison('1', defaultModelId),
                createEmptyComparison('2', secondDefaultModelId),
              ],
              initialized: true,
              availableModels,
            },
            false,
            'arena/initializeComparisons',
          );
        },

        addComparison: () => {
          const state = get();
          if (state.comparisons.length >= 4) return;

          const usedModelIds = state.comparisons.map((c) => c.modelId);
          const availableModel = state.availableModels.find((m) => !usedModelIds.includes(m.id));
          const newModelId = availableModel?.id || state.availableModels[0]?.id || '';

          set(
            {
              comparisons: [
                ...state.comparisons,
                createEmptyComparison(Date.now().toString(), newModelId),
              ],
            },
            false,
            'arena/addComparison',
          );
        },

        updateComparison: (index, update) =>
          set(
            (state) => ({
              comparisons: state.comparisons.map((c, i) => (i === index ? { ...c, ...update } : c)),
            }),
            false,
            'arena/updateComparison',
          ),

        removeComparison: (index) => {
          const state = get();
          if (state.comparisons.length <= 1) return;

          set(
            {
              comparisons: state.comparisons.filter((_, i) => i !== index),
            },
            false,
            'arena/removeComparison',
          );
        },

        selectModel: (index, modelId) =>
          set(
            (state) => ({
              comparisons: state.comparisons.map((c, i) => (i === index ? { ...c, modelId } : c)),
            }),
            false,
            'arena/selectModel',
          ),

        toggleSync: (index, synced) =>
          set(
            (state) => ({
              comparisons: state.comparisons.map((c, i) => (i === index ? { ...c, synced } : c)),
            }),
            false,
            'arena/toggleSync',
          ),

        updateConfig: (index, config) =>
          set(
            (state) => ({
              comparisons: state.comparisons.map((c, i) => (i === index ? { ...c, config } : c)),
            }),
            false,
            'arena/updateConfig',
          ),

        setCustomPrompt: (index, customPrompt) =>
          set(
            (state) => ({
              comparisons: state.comparisons.map((c, i) =>
                i === index ? { ...c, customPrompt } : c,
              ),
            }),
            false,
            'arena/setCustomPrompt',
          ),

        moveLeft: (index) => {
          if (index <= 0) return;

          set(
            (state) => {
              const newComparisons = [...state.comparisons];
              const temp = newComparisons[index];
              const prev = newComparisons[index - 1];
              if (temp && prev) {
                newComparisons[index] = prev;
                newComparisons[index - 1] = temp;
              }
              return { comparisons: newComparisons };
            },
            false,
            'arena/moveLeft',
          );
        },

        moveRight: (index) => {
          const state = get();
          if (index >= state.comparisons.length - 1) return;

          set(
            (state) => {
              const newComparisons = [...state.comparisons];
              const temp = newComparisons[index];
              const next = newComparisons[index + 1];
              if (temp && next) {
                newComparisons[index] = next;
                newComparisons[index + 1] = temp;
              }
              return { comparisons: newComparisons };
            },
            false,
            'arena/moveRight',
          );
        },

        clearComparison: (index) =>
          set(
            (state) => ({
              comparisons: state.comparisons.map((c, i) =>
                i === index ? { ...c, response: '', isLoading: false, error: undefined } : c,
              ),
            }),
            false,
            'arena/clearComparison',
          ),

        setLoading: (index, isLoading) =>
          set(
            (state) => ({
              comparisons: state.comparisons.map((c, i) => (i === index ? { ...c, isLoading } : c)),
            }),
            false,
            'arena/setLoading',
          ),

        setResponse: (index, response, responseTime, tokenCount) =>
          set(
            (state) => ({
              comparisons: state.comparisons.map((c, i) =>
                i === index
                  ? {
                      ...c,
                      response,
                      responseTime,
                      tokenCount,
                      isLoading: false,
                      error: undefined,
                    }
                  : c,
              ),
            }),
            false,
            'arena/setResponse',
          ),

        setError: (index, error) =>
          set(
            (state) => ({
              comparisons: state.comparisons.map((c, i) =>
                i === index ? { ...c, error, isLoading: false } : c,
              ),
            }),
            false,
            'arena/setError',
          ),

        setAvailableModels: (models) =>
          set({ availableModels: models }, false, 'arena/setAvailableModels'),
      }),
      { name: 'arena-store', enabled: process.env.NODE_ENV === 'development' },
    ),
  );
};

type ArenaStoreApi = ReturnType<typeof createArenaStore>;

const ArenaStoreContext = createContext<ArenaStoreApi | null>(null);

export function ArenaStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ArenaStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createArenaStore();
  }

  return (
    <ArenaStoreContext.Provider value={storeRef.current}>{children}</ArenaStoreContext.Provider>
  );
}

export function useArenaStore<T>(selector: (state: ArenaStore) => T): T {
  const store = useContext(ArenaStoreContext);
  if (!store) {
    throw new Error('useArenaStore must be used within ArenaStoreProvider');
  }
  return useStore(store, selector);
}

export const arenaSelectors = {
  comparisons: (state: ArenaStore) => state.comparisons,
  globalPrompt: (state: ArenaStore) => state.globalPrompt,
  initialized: (state: ArenaStore) => state.initialized,
  availableModels: (state: ArenaStore) => state.availableModels,
  isAnyLoading: (state: ArenaStore) => state.comparisons.some((c) => c.isLoading),
  comparisonCount: (state: ArenaStore) => state.comparisons.length,
};
