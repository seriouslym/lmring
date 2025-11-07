import type { ProviderConfig } from '../../types/provider';
import { DOMESTIC_PROVIDERS } from './domestic';
import { OFFICIAL_PROVIDERS } from './official';

export const ALL_PROVIDERS: ProviderConfig[] = [...OFFICIAL_PROVIDERS, ...DOMESTIC_PROVIDERS];

export { OFFICIAL_PROVIDERS, DOMESTIC_PROVIDERS };

// Helper functions for provider management
export function getProviderById(id: string): ProviderConfig | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id);
}

export function getProvidersByType(type: 'official' | 'compatible' | 'custom'): ProviderConfig[] {
  return ALL_PROVIDERS.filter((p) => p.type === type);
}

export function getSupportedModels(providerId: string): string[] {
  const provider = getProviderById(providerId);
  return provider?.models?.map((m) => m.id) || [];
}
