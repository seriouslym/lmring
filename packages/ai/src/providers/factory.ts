import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { CreateProviderOptions, ProviderInstance } from '../types';
import { autoSelectFormat } from '../utils/formatSelector';
import { getRotatedApiKey } from '../utils/keyRotation';
import { registry } from './registry';

/**
 * Create a Provider instance
 *
 * @param options - Provider creation options
 * @returns Provider instance (used to create models)
 * @throws Error if Provider is not registered
 *
 * @example
 * ```typescript
 * // Create OpenAI Provider
 * const openai = createProvider({
 *   providerId: 'openai',
 *   apiKey: process.env.OPENAI_API_KEY!,
 * });
 *
 * // Use Provider to create model
 * const model = openai('gpt-4');
 * ```
 */
export function createProvider(options: CreateProviderOptions): ProviderInstance {
  const config = registry.get(options.providerId);

  if (!config) {
    throw new Error(
      `Provider not found: ${options.providerId}. Please register this provider first using registry.register().`,
    );
  }

  // Get API key with rotation support
  const apiKey = getRotatedApiKey(options.providerId, options.apiKey, options.apiKeys);

  // Use official Provider
  if (config.type === 'official' && config.creator) {
    return config.creator({
      apiKey,
      baseURL: options.baseURL,
      headers: options.headers,
    });
  }

  // Use OpenAI Compatible with dual-format support
  if (config.type === 'compatible') {
    // Select baseURL based on format preference or auto-detect
    const baseURL = options.baseURL || autoSelectFormat(config, '', options.useAnthropicFormat);

    return createOpenAICompatible({
      name: options.providerId,
      apiKey,
      baseURL,
      headers: {
        ...config.compatibleConfig?.defaultHeaders,
        ...options.headers,
      },
    });
  }

  throw new Error(
    `Invalid provider configuration for ${options.providerId}. Provider type must be 'official' or 'compatible'.`,
  );
}

/**
 * Create a model instance (convenience method)
 *
 * @param options - Provider creation options
 * @param modelId - Model ID
 * @returns Model instance
 *
 * @example
 * ```typescript
 * const model = createModel({
 *   providerId: 'openai',
 *   apiKey: process.env.OPENAI_API_KEY!,
 * }, 'gpt-4');
 * ```
 */
export function createModel(options: CreateProviderOptions, modelId: string) {
  const provider = createProvider(options);
  return provider(modelId);
}

/**
 * Provider Factory (legacy export for backwards compatibility)
 * @deprecated Use createProvider function instead
 */
export const ProviderFactory = {
  create: createProvider,
  createModel,
};
