'use client';

import type { ReactNode } from 'react';
import { ArenaStoreProvider } from '@/stores/arena-store';
import { SettingsStoreProvider } from '@/stores/settings-store';

interface StoreProvidersProps {
  children: ReactNode;
}

/**
 * Client-side store providers wrapper for Zustand stores.
 * This component should be used in layouts to provide store context to children.
 */
export function StoreProviders({ children }: StoreProvidersProps) {
  return (
    <SettingsStoreProvider>
      <ArenaStoreProvider>{children}</ArenaStoreProvider>
    </SettingsStoreProvider>
  );
}
