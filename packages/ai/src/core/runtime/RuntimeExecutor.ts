/**
 * Runtime Executor
 *
 * Simplified runtime executor for LLM Arena
 * Focuses on streamText and generateText with AI SDK middleware support
 */

import {
  generateText as _generateText,
  streamText as _streamText,
  type LanguageModelMiddleware,
} from 'ai';
import type { CreateProviderOptions } from '../../types/provider';
import type { ExecutionOptions, RuntimeExecutorConfig } from '../../types/runtime';
import { ModelResolver } from '../models/ModelResolver';

/**
 * Runtime Executor class
 *
 * Provides unified interface for AI operations with middleware support
 */
export class RuntimeExecutor {
  private readonly providerId: string;
  private readonly providerOptions: Partial<CreateProviderOptions>;
  private readonly modelResolver: ModelResolver;
  private readonly defaultMiddlewares?: LanguageModelMiddleware[];

  constructor(config: RuntimeExecutorConfig) {
    this.providerId = config.providerId;
    this.providerOptions = config.providerOptions;
    this.modelResolver = new ModelResolver();
    this.defaultMiddlewares = config.middlewares;
  }

  /**
   * Static factory method to create a RuntimeExecutor
   *
   * @param providerId - Provider ID
   * @param providerOptions - Provider options
   * @param middlewares - Optional default middlewares to apply to all requests
   * @returns RuntimeExecutor instance
   *
   * @example
   * ```typescript
   * const executor = RuntimeExecutor.create('openai', {
   *   apiKey: 'sk-xxx',
   *   baseURL: 'https://api.openai.com/v1'
   * });
   * ```
   *
   * @example
   * With default middlewares:
   * ```typescript
   * const executor = RuntimeExecutor.create(
   *   'openai',
   *   { apiKey: 'sk-xxx' },
   *   [loggingMiddleware, monitoringMiddleware]
   * );
   * ```
   */
  static create(
    providerId: string,
    providerOptions: Partial<CreateProviderOptions>,
    middlewares?: LanguageModelMiddleware[],
  ): RuntimeExecutor {
    return new RuntimeExecutor({
      providerId,
      providerOptions,
      middlewares,
    });
  }

  /**
   * Stream text generation
   *
   * @param params - Parameters for streamText
   * @param options - Execution options
   * @returns Stream text result
   *
   * @remarks
   * Middlewares are merged in the following order:
   * 1. Default middlewares (set in constructor or create())
   * 2. Per-call middlewares (passed in options)
   *
   * This allows you to have common middlewares for all requests (logging, monitoring)
   * while adding specific middlewares for individual calls (caching, custom logic).
   *
   * @example
   * ```typescript
   * const result = await executor.streamText({
   *   model: 'gpt-4',
   *   messages: [{ role: 'user', content: 'Hello!' }]
   * });
   *
   * for await (const chunk of result.textStream) {
   *   console.log(chunk);
   * }
   * ```
   *
   * @example
   * With per-call middleware:
   * ```typescript
   * const result = await executor.streamText(
   *   {
   *     model: 'gpt-4',
   *     messages: [{ role: 'user', content: 'Hello!' }]
   *   },
   *   { middlewares: [cachingMiddleware] }
   * );
   * ```
   */
  async streamText(params: Parameters<typeof _streamText>[0], options?: ExecutionOptions) {
    // Validate model parameter type
    if (typeof params.model !== 'string') {
      throw new TypeError(
        'RuntimeExecutor requires model ID as string, received LanguageModel object',
      );
    }

    // Merge default middlewares with per-call middlewares
    const middlewares = [...(this.defaultMiddlewares || []), ...(options?.middlewares || [])];

    // Resolve model instance with middleware
    const resolvedModel = await this.modelResolver.resolveLanguageModel(
      params.model,
      this.providerId,
      this.providerOptions,
      middlewares.length > 0 ? middlewares : undefined,
    );

    return _streamText({
      ...params,
      model: resolvedModel.model,
    });
  }

  /**
   * Generate text (non-streaming)
   *
   * @param params - Parameters for generateText
   * @param options - Execution options
   * @returns Generate text result
   *
   * @remarks
   * Middlewares are merged in the following order:
   * 1. Default middlewares (set in constructor or create())
   * 2. Per-call middlewares (passed in options)
   *
   * This allows you to have common middlewares for all requests (logging, monitoring)
   * while adding specific middlewares for individual calls (caching, custom logic).
   *
   * @example
   * ```typescript
   * const result = await executor.generateText({
   *   model: 'gpt-4',
   *   messages: [{ role: 'user', content: 'Hello!' }]
   * });
   *
   * console.log(result.text);
   * ```
   *
   * @example
   * With per-call middleware:
   * ```typescript
   * const result = await executor.generateText(
   *   {
   *     model: 'gpt-4',
   *     messages: [{ role: 'user', content: 'Hello!' }]
   *   },
   *   { middlewares: [cachingMiddleware] }
   * );
   * ```
   */
  async generateText(params: Parameters<typeof _generateText>[0], options?: ExecutionOptions) {
    // Validate model parameter type
    if (typeof params.model !== 'string') {
      throw new TypeError(
        'RuntimeExecutor requires model ID as string, received LanguageModel object',
      );
    }

    // Merge default middlewares with per-call middlewares
    const middlewares = [...(this.defaultMiddlewares || []), ...(options?.middlewares || [])];

    // Resolve model instance with middleware
    const resolvedModel = await this.modelResolver.resolveLanguageModel(
      params.model,
      this.providerId,
      this.providerOptions,
      middlewares.length > 0 ? middlewares : undefined,
    );

    return _generateText({
      ...params,
      model: resolvedModel.model,
    });
  }
}
