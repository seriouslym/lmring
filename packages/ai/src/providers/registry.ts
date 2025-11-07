import type { ProviderConfig } from '../types';

/**
 * Provider Registry
 *
 * Manages all available AI Provider configurations
 */
export class ProviderRegistry {
  private providers = new Map<string, ProviderConfig>();

  /**
   * Register a Provider
   */
  register(config: ProviderConfig): void {
    this.providers.set(config.id, config);
  }

  /**
   * Register multiple Providers
   */
  registerMany(configs: ProviderConfig[]): void {
    for (const config of configs) {
      this.register(config);
    }
  }

  /**
   * Get a Provider configuration by ID
   */
  get(id: string): ProviderConfig | undefined {
    return this.providers.get(id);
  }

  /**
   * Get all Provider configurations
   */
  getAll(): ProviderConfig[] {
    return Array.from(this.providers.values());
  }

  /**
   * Check if a Provider is registered
   */
  has(id: string): boolean {
    return this.providers.has(id);
  }

  /**
   * Unregister a Provider
   */
  unregister(id: string): boolean {
    return this.providers.delete(id);
  }

  /**
   * Clear all registered Providers
   */
  clear(): void {
    this.providers.clear();
  }

  /**
   * Get the number of registered Providers
   */
  get size(): number {
    return this.providers.size;
  }
}

/**
 * Global Provider registry instance
 */
export const registry = new ProviderRegistry();
