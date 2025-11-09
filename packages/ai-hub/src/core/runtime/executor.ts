import type { LanguageModelV2 } from '@ai-sdk/provider';
import type { LanguageModelMiddleware } from 'ai';
import {
  generateObject as aiGenerateObject,
  generateText as aiGenerateText,
  streamObject as aiStreamObject,
  streamText as aiStreamText,
} from 'ai';
import type { AiPlugin, PluginContext } from '../../types/plugin';
import type { ProviderInstance } from '../../types/provider';
import type {
  GenerateObjectParams,
  GenerateTextParams,
  StreamObjectParams,
  StreamTextParams,
} from '../../types/runtime';
import { ModelResolutionError } from '../../utils/errors';
import { wrapWithMiddlewares } from '../middleware/wrapper';
import { PluginEngine } from '../plugins/engine';

type ProviderLike = {
  providerId?: string;
  name?: string;
  languageModel?: ProviderInstance['languageModel'];
  chat?: ProviderInstance['languageModel'];
};

type ProviderSource = ProviderInstance | LanguageModelV2 | ProviderLike;

type StreamTextResponse = Awaited<ReturnType<typeof aiStreamText>>;
type GenerateTextResponse = Awaited<ReturnType<typeof aiGenerateText>>;
type GenerateObjectResponse = Awaited<ReturnType<typeof aiGenerateObject>>;
type StreamObjectResponse = Awaited<ReturnType<typeof aiStreamObject>>;

export class RuntimeExecutor {
  private engine: PluginEngine;
  private providerId: string;
  private middlewares: LanguageModelMiddleware[];

  constructor(
    private provider: ProviderSource, // Support both ProviderInstance and raw provider
    plugins: AiPlugin[] = [],
    middlewares: LanguageModelMiddleware[] = [],
  ) {
    this.engine = new PluginEngine(plugins);
    this.middlewares = middlewares;

    // Try to extract providerId
    if (this.isProviderLike(provider) && typeof provider.providerId === 'string') {
      this.providerId = provider.providerId;
    } else if (this.isProviderLike(provider) && typeof provider.name === 'string') {
      this.providerId = provider.name;
    } else if (this.isLanguageModel(provider) && typeof provider.provider === 'string') {
      this.providerId = provider.provider;
    } else {
      this.providerId = 'unknown';
    }
  }

  private resolveModel(modelId: string): LanguageModelV2 {
    if (!this.provider) {
      throw new ModelResolutionError(modelId, this.providerId, 'Provider not initialized');
    }

    // If provider has languageModel method, use it
    if (this.hasLanguageModel(this.provider)) {
      return this.provider.languageModel(modelId);
    }

    if (this.hasChatModel(this.provider)) {
      return this.provider.chat(modelId);
    }

    if (this.isLanguageModel(this.provider)) {
      return this.provider;
    }

    throw new ModelResolutionError(
      modelId,
      this.providerId,
      'Provider does not support language models',
    );
  }

  private createContext(modelId: string, method: string): PluginContext {
    return {
      providerId: this.providerId,
      modelId,
      method,
      attempt: 0,
      metadata: {},
    };
  }

  async streamText(
    params: StreamTextParams,
    options?: {
      plugins?: AiPlugin[];
      middlewares?: LanguageModelMiddleware[];
    },
  ): Promise<StreamTextResponse> {
    const context = this.createContext(params.model, 'streamText');

    // Merge plugins
    const allPlugins = [...this.engine.getPlugins(), ...(options?.plugins || [])];
    const engine = new PluginEngine(allPlugins);

    // Merge middlewares
    const allMiddlewares = [...this.middlewares, ...(options?.middlewares || [])];

    return engine.executeLifecycle(
      'streamText',
      params,
      async (transformedParams) => {
        const { model: modelId, ...restParams } = transformedParams;

        // Resolve model after transformation
        const resolvedModel = this.resolveModel(modelId);
        const wrappedModel =
          allMiddlewares.length > 0
            ? wrapWithMiddlewares(resolvedModel, allMiddlewares)
            : resolvedModel;

        // Update context with transformed modelId
        context.modelId = modelId;

        return aiStreamText({
          model: wrappedModel,
          ...restParams,
          experimental_telemetry: {
            isEnabled: true,
            metadata: {
              providerId: this.providerId,
              modelId,
            },
          },
        });
      },
      context,
    );
  }

  async generateText(
    params: GenerateTextParams,
    options?: {
      plugins?: AiPlugin[];
      middlewares?: LanguageModelMiddleware[];
    },
  ): Promise<GenerateTextResponse> {
    const context = this.createContext(params.model, 'generateText');

    // Merge plugins
    const allPlugins = [...this.engine.getPlugins(), ...(options?.plugins || [])];
    const engine = new PluginEngine(allPlugins);

    // Merge middlewares
    const allMiddlewares = [...this.middlewares, ...(options?.middlewares || [])];

    return engine.executeLifecycle(
      'generateText',
      params,
      async (transformedParams) => {
        const { model: modelId, ...restParams } = transformedParams;

        // Resolve model after transformation
        const resolvedModel = this.resolveModel(modelId);
        const wrappedModel =
          allMiddlewares.length > 0
            ? wrapWithMiddlewares(resolvedModel, allMiddlewares)
            : resolvedModel;

        // Update context with transformed modelId
        context.modelId = modelId;

        return aiGenerateText({
          model: wrappedModel,
          ...restParams,
          experimental_telemetry: {
            isEnabled: true,
            metadata: {
              providerId: this.providerId,
              modelId,
            },
          },
        });
      },
      context,
    );
  }

  async generateObject<T = unknown>(
    params: GenerateObjectParams<T>,
    options?: {
      plugins?: AiPlugin[];
      middlewares?: LanguageModelMiddleware[];
    },
  ): Promise<GenerateObjectResponse> {
    const context = this.createContext(params.model, 'generateObject');

    // Merge plugins
    const allPlugins = [...this.engine.getPlugins(), ...(options?.plugins || [])];
    const engine = new PluginEngine(allPlugins);

    // Merge middlewares
    const allMiddlewares = [...this.middlewares, ...(options?.middlewares || [])];

    return engine.executeLifecycle(
      'generateObject',
      params,
      async (transformedParams) => {
        const { model: modelId, stopSequences: _stopSequences, ...restParams } = transformedParams;

        // Resolve model after transformation
        const resolvedModel = this.resolveModel(modelId);
        const wrappedModel =
          allMiddlewares.length > 0
            ? wrapWithMiddlewares(resolvedModel, allMiddlewares)
            : resolvedModel;

        // Update context with transformed modelId
        context.modelId = modelId;

        const request: Parameters<typeof aiGenerateObject>[0] = {
          model: wrappedModel,
          ...restParams,
          experimental_telemetry: {
            isEnabled: true,
            metadata: {
              providerId: this.providerId,
              modelId,
            },
          },
        };
        return aiGenerateObject(request);
      },
      context,
    );
  }

  async streamObject<T = unknown>(
    params: StreamObjectParams<T>,
    options?: {
      plugins?: AiPlugin[];
      middlewares?: LanguageModelMiddleware[];
    },
  ): Promise<StreamObjectResponse> {
    const context = this.createContext(params.model, 'streamObject');

    // Merge plugins
    const allPlugins = [...this.engine.getPlugins(), ...(options?.plugins || [])];
    const engine = new PluginEngine(allPlugins);

    // Merge middlewares
    const allMiddlewares = [...this.middlewares, ...(options?.middlewares || [])];

    return engine.executeLifecycle(
      'streamObject',
      params,
      async (transformedParams) => {
        const { model: modelId, stopSequences: _stopSequences, ...restParams } = transformedParams;

        // Resolve model after transformation
        const resolvedModel = this.resolveModel(modelId);
        const wrappedModel =
          allMiddlewares.length > 0
            ? wrapWithMiddlewares(resolvedModel, allMiddlewares)
            : resolvedModel;

        // Update context with transformed modelId
        context.modelId = modelId;

        const request: Parameters<typeof aiStreamObject>[0] = {
          model: wrappedModel,
          ...restParams,
          experimental_telemetry: {
            isEnabled: true,
            metadata: {
              providerId: this.providerId,
              modelId,
            },
          },
        };
        return aiStreamObject(request);
      },
      context,
    );
  }

  // Plugin management
  addPlugin(plugin: AiPlugin): void {
    this.engine.addPlugin(plugin);
  }

  removePlugin(name: string): void {
    this.engine.removePlugin(name);
  }

  getPlugins(): AiPlugin[] {
    return this.engine.getPlugins();
  }

  // Get provider info
  getProviderId(): string {
    return this.providerId;
  }

  private isProviderLike(provider: ProviderSource): provider is ProviderInstance | ProviderLike {
    return typeof provider === 'object' && provider !== null;
  }

  private hasLanguageModel(
    provider: ProviderSource,
  ): provider is
    | ProviderInstance
    | (ProviderLike & { languageModel: ProviderInstance['languageModel'] }) {
    return (
      this.isProviderLike(provider) &&
      typeof (provider as ProviderLike).languageModel === 'function'
    );
  }

  private hasChatModel(
    provider: ProviderSource,
  ): provider is ProviderLike & { chat: ProviderInstance['languageModel'] } {
    return this.isProviderLike(provider) && typeof (provider as ProviderLike).chat === 'function';
  }

  private isLanguageModel(provider: ProviderSource): provider is LanguageModelV2 {
    return (
      typeof provider === 'object' &&
      provider !== null &&
      typeof (provider as LanguageModelV2).doGenerate === 'function'
    );
  }
}
