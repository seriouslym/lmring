interface KeyPool {
  keys: string[];
  currentIndex: number;
  strategy: 'round-robin' | 'random' | 'weighted';
  weights?: number[];
}

export class KeyRotationManager {
  private pools = new Map<string, KeyPool>();

  /**
   * Register a pool of API keys for a provider
   */
  registerPool(
    providerId: string,
    keys: string | string[],
    options?: {
      strategy?: 'round-robin' | 'random' | 'weighted';
      weights?: number[];
    },
  ): void {
    const keyArray = Array.isArray(keys) ? keys : [keys];

    if (keyArray.length === 0) {
      throw new Error('At least one API key is required');
    }

    const strategy = options?.strategy || 'round-robin';

    if (strategy === 'weighted' && options?.weights) {
      if (options.weights.length !== keyArray.length) {
        throw new Error('Weights array must match keys array length');
      }
    }

    this.pools.set(providerId, {
      keys: keyArray,
      currentIndex: 0,
      strategy,
      weights: options?.weights,
    });
  }

  /**
   * Get the next API key for a provider
   */
  getKey(providerId: string): string | undefined {
    const pool = this.pools.get(providerId);
    if (!pool || pool.keys.length === 0) {
      return undefined;
    }

    switch (pool.strategy) {
      case 'random':
        return this.getRandomKey(pool);

      case 'weighted':
        return this.getWeightedKey(pool);
      default:
        return this.getRoundRobinKey(pool);
    }
  }

  private getRoundRobinKey(pool: KeyPool): string {
    const key = pool.keys[pool.currentIndex];
    pool.currentIndex = (pool.currentIndex + 1) % pool.keys.length;
    return key as string;
  }

  private getRandomKey(pool: KeyPool): string {
    const index = Math.floor(Math.random() * pool.keys.length);
    return pool.keys[index] as string;
  }

  private getWeightedKey(pool: KeyPool): string {
    if (!pool.weights || pool.weights.length === 0) {
      // Fallback to round-robin if no weights
      return this.getRoundRobinKey(pool);
    }

    const totalWeight = pool.weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < pool.keys.length; i++) {
      random -= pool.weights[i] as number;
      if (random <= 0) {
        return pool.keys[i] as string;
      }
    }

    // Fallback to last key
    return pool.keys[pool.keys.length - 1] as string;
  }

  /**
   * Get all keys for a provider
   */
  getKeys(providerId: string): string[] {
    const pool = this.pools.get(providerId);
    return pool ? [...pool.keys] : [];
  }

  /**
   * Add a key to an existing pool
   */
  addKey(providerId: string, key: string, weight?: number): void {
    const pool = this.pools.get(providerId);
    if (!pool) {
      throw new Error(`No key pool found for provider ${providerId}`);
    }

    if (!pool.keys.includes(key)) {
      if (pool.strategy === 'weighted') {
        if (weight === undefined) {
          throw new Error(`Weight is required when adding a key to weighted pool ${providerId}`);
        }

        if (!pool.weights) {
          // Initialize weights for existing keys with default value of 1
          pool.weights = Array(pool.keys.length).fill(1);
        }

        // Ensure weights array is synchronized before adding new key
        if (pool.weights.length !== pool.keys.length) {
          throw new Error('Weights array must match keys array length when adding new keys');
        }

        pool.keys.push(key);
        pool.weights.push(weight);
      } else {
        pool.keys.push(key);
      }
    }
  }

  /**
   * Remove a key from a pool
   */
  removeKey(providerId: string, key: string): void {
    const pool = this.pools.get(providerId);
    if (!pool) {
      return;
    }

    const index = pool.keys.indexOf(key);
    if (index !== -1) {
      pool.keys.splice(index, 1);

      if (pool.weights && pool.weights.length > index) {
        pool.weights.splice(index, 1);
      }

      // Adjust current index if needed
      if (pool.currentIndex >= pool.keys.length && pool.keys.length > 0) {
        pool.currentIndex = 0;
      }
    }
  }

  /**
   * Clear all key pools
   */
  clear(): void {
    this.pools.clear();
  }

  /**
   * Clear a specific provider's key pool
   */
  clearProvider(providerId: string): void {
    this.pools.delete(providerId);
  }

  /**
   * Get pool information
   */
  getPoolInfo(providerId: string):
    | {
        keyCount: number;
        strategy: string;
        hasWeights: boolean;
      }
    | undefined {
    const pool = this.pools.get(providerId);
    if (!pool) {
      return undefined;
    }

    return {
      keyCount: pool.keys.length,
      strategy: pool.strategy,
      hasWeights: !!pool.weights && pool.weights.length > 0,
    };
  }
}

// Global key rotation manager
export const keyRotationManager = new KeyRotationManager();

/**
 * Helper function to get a rotated API key
 */
export function getRotatedApiKey(
  providerId: string,
  apiKey?: string,
  apiKeys?: string | string[],
): string | undefined {
  // If multiple keys provided, check if we need to register them
  if (apiKeys) {
    const nextKeys = Array.isArray(apiKeys) ? apiKeys : [apiKeys];
    const currentKeys = keyRotationManager.getKeys(providerId);

    // Only re-register if keys have changed
    const needsRefresh =
      currentKeys.length !== nextKeys.length ||
      currentKeys.some((key, index) => key !== nextKeys[index]);

    if (needsRefresh) {
      keyRotationManager.registerPool(providerId, apiKeys);
    }

    return keyRotationManager.getKey(providerId);
  }

  // Try to get from existing pool
  const rotatedKey = keyRotationManager.getKey(providerId);
  if (rotatedKey) {
    return rotatedKey;
  }

  // Fallback to single key
  return apiKey;
}
