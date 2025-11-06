/**
 * Runtime Executor
 *
 * Simplified runtime executor for LLM Arena
 * Focuses on streamText and generateText with AI SDK middleware support
 */

import { generateText as _generateText, streamText as _streamText } from 'ai';
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

  constructor(config: RuntimeExecutorConfig) {
    this.providerId = config.providerId;
    this.providerOptions = config.providerOptions;
    this.modelResolver = new ModelResolver();
  }

  /**
   * Static factory method to create a RuntimeExecutor
   *
   * @param providerId - Provider ID
   * @param providerOptions - Provider options
   * @returns RuntimeExecutor instance
   *
   * @example
   * ```typescript
   * const executor = RuntimeExecutor.create('openai', {
   *   apiKey: 'sk-xxx',
   *   baseURL: 'https://api.openai.com/v1'
   * });
   * ```
   */
  static create(
    providerId: string,
    providerOptions: Partial<CreateProviderOptions>,
  ): RuntimeExecutor {
    return new RuntimeExecutor({
      providerId,
      providerOptions,
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
    // Resolve model instance with middleware
    const resolvedModel = await this.modelResolver.resolveLanguageModel(
      params.model as string,
      this.providerId,
      this.providerOptions,
      options?.middlewares,
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
    // Resolve model instance with middleware
    const resolvedModel = await this.modelResolver.resolveLanguageModel(
      params.model as string,
      this.providerId,
      this.providerOptions,
      options?.middlewares,
    );

    return _generateText({
      ...params,
      model: resolvedModel.model,
    });
  }
}
