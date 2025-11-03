/**
 * Runtime Executor
 *
 * Simplified runtime executor for LLM Arena
 * Focuses on streamText and generateText with simple interceptor support
 */

import { generateText as _generateText, streamText as _streamText } from 'ai';
import type { RequestInterceptor } from '../../types/interceptor';
import type { CreateProviderOptions } from '../../types/provider';
import type { ExecutionOptions, ResolvedModel, RuntimeExecutorConfig } from '../../types/runtime';
import { ModelResolver } from '../models/ModelResolver';

/**
 * Runtime Executor class
 *
 * Provides unified interface for AI operations with simple interceptor support
 */
export class RuntimeExecutor {
  private readonly providerId: string;
  private readonly providerOptions: Partial<CreateProviderOptions>;
  private readonly interceptor?: RequestInterceptor;
  private readonly modelResolver: ModelResolver;

  constructor(config: RuntimeExecutorConfig) {
    this.providerId = config.providerId;
    this.providerOptions = config.providerOptions;
    this.interceptor = config.interceptor;
    this.modelResolver = new ModelResolver();
  }

  /**
   * Static factory method to create a RuntimeExecutor
   *
   * @param providerId - Provider ID
   * @param providerOptions - Provider options
   * @param interceptor - Optional request interceptor
   * @returns RuntimeExecutor instance
   *
   * @example
   * ```typescript
   * const executor = RuntimeExecutor.create('openai', {
   *   apiKey: 'sk-xxx',
   *   baseURL: 'https://api.openai.com/v1'
   * }, {
   *   onBefore: (params) => { console.log('Request:', params); return params; },
   *   onAfter: (result) => { console.log('Response:', result); return result; }
   * });
   * ```
   */
  static create(
    providerId: string,
    providerOptions: Partial<CreateProviderOptions>,
    interceptor?: RequestInterceptor,
  ): RuntimeExecutor {
    return new RuntimeExecutor({
      providerId,
      providerOptions,
      interceptor,
    });
  }

  /**
   * Stream text generation
   *
   * @param params - Parameters for streamText
   * @param options - Execution options
   * @returns Stream text result
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
   */
  async streamText(params: Parameters<typeof _streamText>[0], options?: ExecutionOptions) {
    return this.executeWithInterceptor(
      params,
      options,
      async (resolvedModel, transformedParams) => {
        return _streamText({
          ...transformedParams,
          model: resolvedModel.model,
        });
      },
    );
  }

  /**
   * Generate text (non-streaming)
   *
   * @param params - Parameters for generateText
   * @param options - Execution options
   * @returns Generate text result
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
   */
  async generateText(params: Parameters<typeof _generateText>[0], options?: ExecutionOptions) {
    return this.executeWithInterceptor(
      params,
      options,
      async (resolvedModel, transformedParams) => {
        return _generateText({
          ...transformedParams,
          model: resolvedModel.model,
        });
      },
    );
  }

  /**
   * Execute AI operation with interceptor support
   *
   * @param params - Request parameters
   * @param options - Execution options
   * @param executor - The actual AI SDK call
   * @returns Result from executor
   */
  private async executeWithInterceptor<T, TParams = unknown>(
    params: TParams,
    options: ExecutionOptions | undefined,
    executor: (resolvedModel: ResolvedModel, transformedParams: TParams) => Promise<T>,
  ): Promise<T> {
    try {
      // 1. Apply onBefore interceptor
      let transformedParams = params;
      if (this.interceptor?.onBefore) {
        transformedParams = (await this.interceptor.onBefore(params)) as TParams;
      }

      // 2. Resolve model instance
      const resolvedModel = await this.modelResolver.resolveLanguageModel(
        (transformedParams as { model: string }).model,
        this.providerId,
        this.providerOptions,
        options?.middlewares,
      );

      // 3. Execute AI operation
      const result = await executor(resolvedModel, transformedParams);

      // 4. Apply onAfter interceptor
      if (this.interceptor?.onAfter) {
        return (await this.interceptor.onAfter(result)) as T;
      }

      return result;
    } catch (error) {
      // Trigger onError interceptor
      if (this.interceptor?.onError) {
        await this.interceptor.onError(error as Error);
      }
      throw error;
    }
  }
}
