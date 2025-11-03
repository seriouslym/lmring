/**
 * API Key Rotation Manager
 *
 * Manages rotation of multiple API keys for load balancing and rate limit handling
 */

/**
 * Key rotation state
 */
interface KeyRotationState {
  lastUsedIndex: number;
  lastUsedTime: number;
}

/**
 * Key Rotation Manager class
 *
 * Provides round-robin rotation of API keys
 */
export class KeyRotationManager {
  private states = new Map<string, KeyRotationState>();

  /**
   * Get the next API key for a provider
   *
   * @param providerId - Provider ID
   * @param keys - Array of API keys
   * @returns The next key to use
   *
   * @example
   * ```typescript
   * const manager = new KeyRotationManager();
   * const key = manager.getNextKey('openai', ['sk-key1', 'sk-key2', 'sk-key3']);
   * // Returns 'sk-key1' on first call, 'sk-key2' on second call, etc.
   * ```
   */
  getNextKey(providerId: string, keys: string[]): string {
    if (keys.length === 0) {
      throw new Error(`No API keys provided for provider: ${providerId}`);
    }

    if (keys.length === 1) {
      const singleKey = keys[0];
      if (!singleKey) {
        throw new Error(`Invalid API key at index 0 for provider: ${providerId}`);
      }
      return singleKey;
    }

    // Get or create state
    let state = this.states.get(providerId);
    if (!state) {
      state = {
        lastUsedIndex: -1,
        lastUsedTime: 0,
      };
      this.states.set(providerId, state);
    }

    // Calculate next index (round-robin)
    const nextIndex = (state.lastUsedIndex + 1) % keys.length;
    const nextKey = keys[nextIndex];

    if (!nextKey) {
      throw new Error(`Failed to get key at index ${nextIndex} for provider: ${providerId}`);
    }

    // Update state
    state.lastUsedIndex = nextIndex;
    state.lastUsedTime = Date.now();

    return nextKey;
  }

  /**
   * Reset rotation state for a provider
   *
   * @param providerId - Provider ID
   */
  resetRotation(providerId: string): void {
    this.states.delete(providerId);
  }

  /**
   * Get current rotation state
   *
   * @param providerId - Provider ID
   * @returns Current state or undefined if not found
   */
  getState(providerId: string): KeyRotationState | undefined {
    return this.states.get(providerId);
  }

  /**
   * Clear all rotation states
   */
  clearAll(): void {
    this.states.clear();
  }
}

/**
 * Global singleton instance
 */
export const keyRotationManager = new KeyRotationManager();

/**
 * Helper function to get rotated API key
 *
 * @param providerId - Provider ID
 * @param apiKey - Single API key
 * @param apiKeys - Multiple API keys (takes priority)
 * @returns The API key to use
 */
export function getRotatedApiKey(providerId: string, apiKey?: string, apiKeys?: string[]): string {
  // Use apiKeys if provided
  if (apiKeys && apiKeys.length > 0) {
    return keyRotationManager.getNextKey(providerId, apiKeys);
  }

  // Fallback to single apiKey
  if (apiKey) {
    return apiKey;
  }

  throw new Error(`No API key provided for provider: ${providerId}`);
}
