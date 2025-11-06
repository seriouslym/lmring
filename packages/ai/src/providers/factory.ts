import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { CreateProviderOptions, ProviderInstance } from '../types';
import { autoSelectFormat, selectApiEndpoint } from '../utils/formatSelector';
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
    // Determine baseURL
    // Priority: user-provided baseURL > explicit format preference > default OpenAI format
    let baseURL: string;

    if (options.baseURL) {
      baseURL = options.baseURL;
    } else if (options.useAnthropicFormat !== undefined) {
      baseURL = selectApiEndpoint(config, options.useAnthropicFormat);
    } else {
      // No preference specified, use default OpenAI format
      // Note: Auto-detection based on modelId is not possible here since modelId is unknown
      // Use createModel() for auto-detection based on model name
      if (!config.compatibleConfig) {
        throw new Error(`Provider ${config.id} is missing compatibleConfig`);
      }
      baseURL = config.compatibleConfig.baseURL;
    }

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
 * This method supports automatic format detection based on model ID.
 * For dual-format providers (e.g., ZhipuAI), it automatically selects
 * the appropriate API endpoint based on the model name.
 *
 * @param options - Provider creation options
 * @param modelId - Model ID
 * @returns Model instance
 *
 * @example
 * ```typescript
 * // Auto-detect format based on model ID
 * const claudeModel = createModel({
 *   providerId: 'zhipuai',
 *   apiKey: process.env.ZHIPUAI_API_KEY!,
 * }, 'claude-3-opus-20240229'); // Uses Anthropic format
 *
 * const gptModel = createModel({
 *   providerId: 'zhipuai',
 *   apiKey: process.env.ZHIPUAI_API_KEY!,
 * }, 'gpt-4'); // Uses OpenAI format
 * ```
 */
export function createModel(options: CreateProviderOptions, modelId: string) {
  const config = registry.get(options.providerId);

  let enhancedOptions = options;
  if (!options.baseURL && options.useAnthropicFormat === undefined && config) {
    if (config.type === 'compatible') {
      const detectedBaseURL = autoSelectFormat(config, modelId, undefined);
      enhancedOptions = {
        ...options,
        baseURL: detectedBaseURL,
      };
    }
  }

  const provider = createProvider(enhancedOptions);
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
