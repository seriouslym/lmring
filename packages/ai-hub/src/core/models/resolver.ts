import type { LanguageModelV2, LanguageModelV2Middleware } from '@ai-sdk/provider';
import { ProviderBuilder } from '../../providers/builder';
import { registry } from '../../providers/registry';
import type { ProviderOptions, ResolvedModel } from '../../types/provider';
import { ModelResolutionError, ProviderError } from '../../utils/errors';
import { wrapWithMiddlewares } from '../middleware/wrapper';

interface ProviderWithModel {
  languageModel?: (modelId: string) => LanguageModelV2;
  chat?: (modelId: string) => LanguageModelV2;
}

export class ModelResolver {
  private cache = new Map<string, ResolvedModel>();

  resolve(
    modelId: string,
    fallbackProviderId?: string,
    options?: {
      providerOptions?: ProviderOptions;
      middlewares?: LanguageModelV2Middleware[];
      useAnthropicFormat?: boolean;
    },
  ): ResolvedModel {
    // Check cache
    const cacheKey = `${modelId}_${fallbackProviderId}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Parse model ID - support multiple formats
    const { providerId, modelName } = this.parseModelId(modelId, fallbackProviderId);

    if (!providerId) {
      throw new ModelResolutionError(modelId, 'unknown', 'Unable to determine provider ID');
    }

    // Get provider config
    const providerConfig = registry.get(providerId);
    if (!providerConfig) {
      throw new ProviderError(`Provider ${providerId} not found in registry`, providerId);
    }

    // Detect format
    const format = this.detectFormat(modelName, options?.useAnthropicFormat);

    // Create provider instance
    const provider = ProviderBuilder.createProviderInstance(providerId, {
      ...options?.providerOptions,
      useAnthropicFormat: format === 'anthropic',
    });

    // Get model from provider
    let model: LanguageModelV2;

    const providerWithModel = provider as ProviderWithModel;
    const languageModel = providerWithModel.languageModel?.bind(providerWithModel);
    const chatModel = providerWithModel.chat?.bind(providerWithModel);
    if (languageModel) {
      model = languageModel(modelName);
    } else if (chatModel) {
      model = chatModel(modelName);
    } else {
      throw new ModelResolutionError(
        modelId,
        providerId,
        'Provider does not support language models',
      );
    }

    // Apply middlewares
    if (options?.middlewares && options.middlewares.length > 0) {
      model = wrapWithMiddlewares(model, options.middlewares);
    }

    // Create resolved model
    const resolved: ResolvedModel = {
      providerId,
      modelId: modelName,
      format,
      model,
    };

    // Cache the result
    this.cache.set(cacheKey, resolved);

    return resolved;
  }

  private parseModelId(
    modelId: string,
    fallbackProviderId?: string,
  ): { providerId: string | null; modelName: string } {
    // Support multiple separators: > (LMRing), | (Cherry Studio), : (common)
    const separators = ['>', '|', ':'];

    for (const separator of separators) {
      const [providerPart, modelPart] = modelId.split(separator);
      if (providerPart && modelPart) {
        return {
          providerId: providerPart.trim(),
          modelName: modelPart.trim(),
        };
      }
    }

    // No separator found - use fallback provider
    return {
      providerId: fallbackProviderId || null,
      modelName: modelId,
    };
  }

  private detectFormat(modelName: string, preferAnthropicFormat?: boolean): 'openai' | 'anthropic' {
    // If explicitly specified, use that
    if (preferAnthropicFormat !== undefined) {
      return preferAnthropicFormat ? 'anthropic' : 'openai';
    }

    // Auto-detect based on model name patterns
    const anthropicPatterns = ['claude', 'anthropic', 'claude-3', 'claude-2'];

    const modelLower = modelName.toLowerCase();
    const isAnthropicModel = anthropicPatterns.some((pattern) => modelLower.includes(pattern));

    return isAnthropicModel ? 'anthropic' : 'openai';
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// Global resolver instance
export const modelResolver = new ModelResolver();
