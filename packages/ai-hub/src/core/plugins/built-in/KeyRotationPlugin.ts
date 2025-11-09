import { AiPlugin, type PluginContext } from '../../../types/plugin';

interface KeyStats {
  uses: number;
  errors: number;
  lastUsed: number;
  lastError?: number;
  errorRate: number;
}

export interface KeyRotationOptions {
  keys: string[];
  strategy?: 'round-robin' | 'least-used' | 'least-errors';
  maxErrorRate?: number; // Disable key if error rate exceeds this
  cooldownPeriod?: number; // ms to wait before retrying a failed key
}

type NormalizedKeyRotationOptions = {
  strategy: 'round-robin' | 'least-used' | 'least-errors';
  maxErrorRate?: number;
  cooldownPeriod: number;
};

export class KeyRotationPlugin extends AiPlugin {
  name = 'key-rotation';
  description = 'Rotates API keys for load balancing and failover';

  private keys: string[];
  private currentIndex = 0;
  private stats = new Map<string, KeyStats>();
  private options: NormalizedKeyRotationOptions;

  constructor(options: KeyRotationOptions) {
    super();

    if (!options.keys || options.keys.length === 0) {
      throw new Error('At least one API key is required');
    }

    this.keys = options.keys;
    this.options = {
      strategy: options.strategy ?? 'round-robin',
      maxErrorRate: options.maxErrorRate,
      cooldownPeriod: options.cooldownPeriod ?? 60000, // 1 minute
    };

    // Initialize stats for each key
    for (const key of this.keys) {
      this.stats.set(key, {
        uses: 0,
        errors: 0,
        lastUsed: 0,
        errorRate: 0,
      });
    }
  }

  async transformParams(
    params: Record<string, unknown>,
    context: PluginContext,
  ): Promise<Record<string, unknown>> {
    const selectedKey = this.selectKey();

    if (!selectedKey) {
      throw new Error('No available API keys');
    }

    // Store selected key in context for error tracking
    context.metadata.selectedApiKey = selectedKey;

    // Update stats
    const stat = this.getStatsForKey(selectedKey);
    stat.uses++;
    stat.lastUsed = Date.now();

    // Replace API key in params
    return {
      ...params,
      apiKey: selectedKey,
    };
  }

  async onError(_error: Error, context: PluginContext): Promise<void> {
    const key =
      typeof context.metadata.selectedApiKey === 'string'
        ? context.metadata.selectedApiKey
        : undefined;
    if (!key) return;

    const stat = this.getStatsForKey(key);
    stat.errors++;
    stat.lastError = Date.now();
    stat.errorRate = stat.errors / stat.uses;

    // Check if key should be disabled
    if (
      this.options.maxErrorRate &&
      stat.errorRate > this.options.maxErrorRate &&
      stat.uses >= 5 // Minimum uses before disabling
    ) {
      console.warn(`API key disabled due to high error rate: ${stat.errorRate.toFixed(2)}`);
    }
  }

  private selectKey(): string | null {
    const availableKeys = this.getAvailableKeys();

    if (availableKeys.length === 0) {
      return null;
    }

    switch (this.options.strategy) {
      case 'least-used':
        return this.selectLeastUsedKey(availableKeys);

      case 'least-errors':
        return this.selectLeastErrorsKey(availableKeys);
      default:
        return this.selectRoundRobinKey(availableKeys);
    }
  }

  private getAvailableKeys(): string[] {
    const now = Date.now();

    return this.keys.filter((key) => {
      const stat = this.getStatsForKey(key);

      // Check error rate
      if (
        this.options.maxErrorRate &&
        stat.errorRate > this.options.maxErrorRate &&
        stat.uses >= 5
      ) {
        // Check if cooldown period has passed
        if (stat.lastError && now - stat.lastError < this.options.cooldownPeriod) {
          return false;
        }

        // Reset stats after cooldown
        stat.errors = 0;
        stat.uses = 0;
        stat.errorRate = 0;
      }

      return true;
    });
  }

  private selectRoundRobinKey(keys: string[]): string {
    const key = keys[this.currentIndex % keys.length];
    if (key === undefined) {
      throw new Error('Cannot select key from empty list');
    }
    this.currentIndex++;
    return key;
  }

  private selectLeastUsedKey(keys: string[]): string {
    if (keys.length === 0) {
      throw new Error('Cannot select key from empty list');
    }

    let minUses = Infinity;
    let selectedKey = keys[0];
    if (selectedKey === undefined) {
      throw new Error('Cannot select key from empty list');
    }

    for (const key of keys) {
      const stat = this.getStatsForKey(key);
      if (stat.uses < minUses) {
        minUses = stat.uses;
        selectedKey = key;
      }
    }

    return selectedKey;
  }

  private selectLeastErrorsKey(keys: string[]): string {
    if (keys.length === 0) {
      throw new Error('Cannot select key from empty list');
    }

    let minErrorRate = Infinity;
    let selectedKey = keys[0];
    if (selectedKey === undefined) {
      throw new Error('Cannot select key from empty list');
    }

    for (const key of keys) {
      const stat = this.getStatsForKey(key);
      if (stat.errorRate < minErrorRate) {
        minErrorRate = stat.errorRate;
        selectedKey = key;
      }
    }

    return selectedKey;
  }

  getStats(): Map<string, KeyStats> {
    return new Map(this.stats);
  }

  resetStats(): void {
    for (const stat of this.stats.values()) {
      stat.uses = 0;
      stat.errors = 0;
      stat.errorRate = 0;
      stat.lastError = undefined;
    }
  }

  addKey(key: string): void {
    if (!this.keys.includes(key)) {
      this.keys.push(key);
      this.stats.set(key, {
        uses: 0,
        errors: 0,
        lastUsed: 0,
        errorRate: 0,
      });
    }
  }

  removeKey(key: string): void {
    const index = this.keys.indexOf(key);
    if (index !== -1) {
      this.keys.splice(index, 1);
      this.stats.delete(key);
    }
  }

  private getStatsForKey(key: string): KeyStats {
    const stat = this.stats.get(key);
    if (!stat) {
      throw new Error(`Stats not found for key: ${key}`);
    }
    return stat;
  }
}
