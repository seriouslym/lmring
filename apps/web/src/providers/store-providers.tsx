'use client';

import type { ReactNode } from 'react';
import { ArenaStoreProvider } from '@/stores/arena-store';
import { SettingsStoreProvider } from '@/stores/settings-store';
import { WorkflowStoreProvider } from '@/stores/workflow-store';

interface StoreProvidersProps {
  children: ReactNode;
}

/**
 * Client-side store providers wrapper for Zustand stores.
 * This component should be used in layouts to provide store context to children.
 *
 * Provider hierarchy:
 * - SettingsStoreProvider: User settings and API keys
 * - ArenaStoreProvider: Legacy arena comparison state
 * - WorkflowStoreProvider: New workflow-based independent model execution
 */
export function StoreProviders({ children }: StoreProvidersProps) {
  return (
    <SettingsStoreProvider>
      <ArenaStoreProvider>
        <WorkflowStoreProvider>{children}</WorkflowStoreProvider>
      </ArenaStoreProvider>
    </SettingsStoreProvider>
  );
}
