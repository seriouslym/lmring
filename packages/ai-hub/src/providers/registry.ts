import type { ProviderConfig, ProviderInstance } from '../types/provider';
import { ConfigurationError } from '../utils/errors';

export class ProviderRegistry {
  private providers = new Map<string, ProviderConfig>();
  private aliases = new Map<string, string>();
  private instances = new Map<string, ProviderInstance>();

  register(config: ProviderConfig): void {
    if (!config.id) {
      throw new ConfigurationError('Provider id is required');
    }

    this.providers.set(config.id, config);
  }

  registerWithAliases(config: ProviderConfig, aliases?: string[]): void {
    this.register(config);

    if (aliases) {
      for (const alias of aliases) {
        this.aliases.set(alias, config.id);
      }
    }
  }

  registerBatch(configs: ProviderConfig[]): void {
    for (const config of configs) {
      this.register(config);
    }
  }

  get(id: string): ProviderConfig | undefined {
    const actualId = this.aliases.get(id) || id;
    return this.providers.get(actualId);
  }

  has(id: string): boolean {
    const actualId = this.aliases.get(id) || id;
    return this.providers.has(actualId);
  }

  list(): ProviderConfig[] {
    return Array.from(this.providers.values());
  }

  listByType(type: 'official' | 'compatible' | 'custom'): ProviderConfig[] {
    return this.list().filter((p) => p.type === type);
  }

  cacheInstance(id: string, instance: ProviderInstance): void {
    const actualId = this.aliases.get(id) || id;
    this.instances.set(actualId, instance);
  }

  getCachedInstance(id: string): ProviderInstance | undefined {
    const actualId = this.aliases.get(id) || id;
    return this.instances.get(actualId);
  }

  clear(): void {
    this.providers.clear();
    this.aliases.clear();
    this.instances.clear();
  }
}

// Global registry instance
export const registry = new ProviderRegistry();
