'use client';

import { createContext, type ReactNode, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

export type SettingsTab = 'general' | 'provider' | 'system-model' | 'storage' | 'help' | 'about';

export interface ApiKeyRecord {
  id: string;
  providerName: string;
  proxyUrl?: string;
  enabled: boolean;
  configSource: string;
  createdAt: string;
  updatedAt: string;
  hasApiKey?: boolean;
  isCustom?: boolean;
  providerType?: string;
}

export type SettingsState = {
  activeTab: SettingsTab;
  telemetryEnabled: boolean;
  apiKeysLoaded: boolean;
  savedApiKeys: ApiKeyRecord[];
};

export type SettingsActions = {
  setActiveTab: (tab: SettingsTab) => void;
  setTelemetryEnabled: (enabled: boolean) => void;
  setApiKeysLoaded: (loaded: boolean) => void;
  setSavedApiKeys: (keys: ApiKeyRecord[]) => void;
  addApiKey: (key: ApiKeyRecord) => void;
  updateApiKey: (id: string, update: Partial<ApiKeyRecord>) => void;
  removeApiKey: (id: string) => void;
  loadApiKeys: () => Promise<void>;
};

export type SettingsStore = SettingsState & SettingsActions;

const defaultInitState: SettingsState = {
  activeTab: 'general',
  telemetryEnabled: false,
  apiKeysLoaded: false,
  savedApiKeys: [],
};

export const createSettingsStore = (initState: Partial<SettingsState> = {}) => {
  return createStore<SettingsStore>()(
    devtools(
      persist(
        (set, get) => ({
          ...defaultInitState,
          ...initState,

          setActiveTab: (tab) => set({ activeTab: tab }, false, 'settings/setActiveTab'),

          setTelemetryEnabled: (enabled) =>
            set({ telemetryEnabled: enabled }, false, 'settings/setTelemetryEnabled'),

          setApiKeysLoaded: (loaded) =>
            set({ apiKeysLoaded: loaded }, false, 'settings/setApiKeysLoaded'),

          setSavedApiKeys: (keys) => set({ savedApiKeys: keys }, false, 'settings/setSavedApiKeys'),

          addApiKey: (key) =>
            set(
              (state) => {
                const existing = state.savedApiKeys.find(
                  (k) => k.providerName.toLowerCase() === key.providerName.toLowerCase(),
                );
                if (existing) {
                  return {
                    savedApiKeys: state.savedApiKeys.map((k) =>
                      k.providerName.toLowerCase() === key.providerName.toLowerCase()
                        ? { ...k, ...key }
                        : k,
                    ),
                  };
                }
                return { savedApiKeys: [...state.savedApiKeys, key] };
              },
              false,
              'settings/addApiKey',
            ),

          updateApiKey: (id, update) =>
            set(
              (state) => ({
                savedApiKeys: state.savedApiKeys.map((k) =>
                  k.id === id ? { ...k, ...update, updatedAt: new Date().toISOString() } : k,
                ),
              }),
              false,
              'settings/updateApiKey',
            ),

          removeApiKey: (id) =>
            set(
              (state) => ({
                savedApiKeys: state.savedApiKeys.filter((k) => k.id !== id),
              }),
              false,
              'settings/removeApiKey',
            ),

          loadApiKeys: async () => {
            const state = get();
            if (state.apiKeysLoaded) return;

            try {
              const response = await fetch('/api/settings/api-keys');
              if (response.ok) {
                const data = await response.json();
                set(
                  {
                    savedApiKeys: data.keys || [],
                    apiKeysLoaded: true,
                  },
                  false,
                  'settings/loadApiKeys',
                );
              } else {
                set({ apiKeysLoaded: true }, false, 'settings/loadApiKeysError');
              }
            } catch (error) {
              console.error('Failed to load API keys:', error);
              set({ apiKeysLoaded: true }, false, 'settings/loadApiKeysError');
            }
          },
        }),
        {
          name: 'lmring-settings',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            telemetryEnabled: state.telemetryEnabled,
            activeTab: state.activeTab,
          }),
        },
      ),
      { name: 'settings-store', enabled: process.env.NODE_ENV === 'development' },
    ),
  );
};

type SettingsStoreApi = ReturnType<typeof createSettingsStore>;

const SettingsStoreContext = createContext<SettingsStoreApi | null>(null);

export function SettingsStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<SettingsStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createSettingsStore();
  }

  return (
    <SettingsStoreContext.Provider value={storeRef.current}>
      {children}
    </SettingsStoreContext.Provider>
  );
}

export function useSettingsStore<T>(selector: (state: SettingsStore) => T): T {
  const store = useContext(SettingsStoreContext);
  if (!store) {
    throw new Error('useSettingsStore must be used within SettingsStoreProvider');
  }
  return useStore(store, selector);
}

export const settingsSelectors = {
  activeTab: (state: SettingsStore) => state.activeTab,
  telemetryEnabled: (state: SettingsStore) => state.telemetryEnabled,
  apiKeysLoaded: (state: SettingsStore) => state.apiKeysLoaded,
  savedApiKeys: (state: SettingsStore) => state.savedApiKeys,
};
