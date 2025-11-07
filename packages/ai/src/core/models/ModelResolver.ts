/**
 * Model Resolver
 *
 * Resolves model IDs to Language Model instances
 * Supports both traditional format ('gpt-4') and namespace format ('openai>gpt-4')
 */

import type { LanguageModelV2 } from '@ai-sdk/provider';
import { type LanguageModelMiddleware, wrapLanguageModel } from 'ai';
import { createProvider } from '../../providers/factory';
import type { CreateProviderOptions, ProviderInstance } from '../../types/provider';
import type { ResolvedModel } from '../../types/runtime';

/**
 * Model ID namespace separator
 */
const NAMESPACE_SEPARATOR = '>';

/**
 * Parsed model ID
 */
interface ParsedModelId {
  /** Provider ID (if specified in namespace format) */
  providerId?: string;
  /** Model ID */
  modelId: string;
}

/**
 * Model Resolver class
 *
 * Handles model resolution and creation with middleware support
 */
export class ModelResolver {
  /**
   * Parse a model ID string
   *
   * Supports two formats:
   * 1. Traditional: 'gpt-4'
   * 2. Namespace: 'openai>gpt-4'
   *
   * @param modelId - Model ID to parse
   * @returns Parsed model ID
   */
  static parseModelId(modelId: string): ParsedModelId {
    if (modelId.includes(NAMESPACE_SEPARATOR)) {
      const parts = modelId.split(NAMESPACE_SEPARATOR, 2);
      const providerId = parts[0]?.trim();
      const actualModelId = parts[1]?.trim();

      if (!providerId || !actualModelId) {
        throw new Error(`Invalid model ID format: ${modelId}`);
      }

      return {
        providerId,
        modelId: actualModelId,
      };
    }

    return {
      modelId: modelId.trim(),
    };
  }

  /**
   * Resolve a model ID to a Language Model instance
   *
   * @param modelId - Model ID (supports namespace format)
   * @param fallbackProviderId - Provider ID to use if not specified in modelId
   * @param providerOptions - Provider configuration options
   * @param middlewares - Optional middlewares to apply
   * @returns Resolved model information
   *
   * @example
   * ```typescript
   * // Using traditional format with fallback provider
   * const model1 = await resolver.resolveLanguageModel(
   *   'gpt-4',
   *   'openai',
   *   { apiKey: 'sk-xxx' }
   * );
   *
   * // Using namespace format
   * const model2 = await resolver.resolveLanguageModel(
   *   'anthropic>claude-3-opus-20240229',
   *   'openai', // ignored
   *   { apiKey: 'sk-xxx' }
   * );
   * ```
   */
  async resolveLanguageModel(
    modelId: string,
    fallbackProviderId: string,
    providerOptions: Partial<CreateProviderOptions>,
    middlewares?: LanguageModelMiddleware[],
  ): Promise<ResolvedModel> {
    // Parse the model ID
    const parsed = ModelResolver.parseModelId(modelId);

    // Determine which provider to use
    const actualProviderId = parsed.providerId || fallbackProviderId;

    // Create provider instance
    const providerInstance = this.createProviderInstance(actualProviderId, providerOptions);

    // Create model from provider
    let model = providerInstance(parsed.modelId);

    // Apply middlewares if provided
    if (middlewares && middlewares.length > 0) {
      model = this.applyMiddlewares(model, middlewares);
    }

    return {
      providerId: actualProviderId,
      modelId: parsed.modelId,
      model,
    };
  }

  /**
   * Create a provider instance
   *
   * @param providerId - Provider ID
   * @param options - Provider options
   * @returns Provider instance
   */
  private createProviderInstance(
    providerId: string,
    options: Partial<CreateProviderOptions>,
  ): ProviderInstance {
    return createProvider({
      providerId,
      apiKey: options.apiKey || '',
      apiKeys: options.apiKeys,
      baseURL: options.baseURL,
      headers: options.headers,
      timeout: options.timeout,
      useAnthropicFormat: options.useAnthropicFormat,
    });
  }

  /**
   * Apply middlewares to a model
   *
   * @param model - Language model instance
   * @param middlewares - Middlewares to apply
   * @returns Wrapped model with middlewares
   */
  private applyMiddlewares(
    model: LanguageModelV2,
    middlewares: LanguageModelMiddleware[],
  ): LanguageModelV2 {
    return wrapLanguageModel({
      model,
      middleware: middlewares,
    });
  }
}

/**
 * Singleton instance for convenience
 */
export const modelResolver = new ModelResolver();
