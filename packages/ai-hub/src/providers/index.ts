import { ALL_PROVIDERS } from './configs';
import { registry } from './registry';

// Initialize registry with all providers
registry.registerBatch(ALL_PROVIDERS);

export * from './builder';
export * from './configs';
// Export everything
export * from './registry';
