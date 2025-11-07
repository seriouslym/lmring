import { registry } from '../registry';
import { DOMESTIC_PROVIDERS } from './domestic';
import { OFFICIAL_PROVIDERS } from './official';

export { DOMESTIC_PROVIDERS } from './domestic';
/**
 * Export all Provider configurations
 */
export { OFFICIAL_PROVIDERS } from './official';

/**
 * All Provider configurations (official + domestic)
 */
export const ALL_PROVIDERS = [...OFFICIAL_PROVIDERS, ...DOMESTIC_PROVIDERS];

/**
 * Initialize and register all Providers
 *
 * This function is automatically executed when the module is loaded,
 * registering all predefined Providers to the global registry
 */
export function initializeProviders(): void {
  registry.registerMany(ALL_PROVIDERS);
}

// Auto-initialize
initializeProviders();
