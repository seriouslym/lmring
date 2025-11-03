/**
 * Runtime Types
 *
 * Type definitions for the RuntimeExecutor and related functionality
 */

import type { LanguageModelV2 } from '@ai-sdk/provider';
import type { LanguageModelMiddleware } from 'ai';
import type { RequestInterceptor } from './interceptor';
import type { ProviderCreatorOptions } from './provider';

/**
 * Runtime executor configuration
 */
export interface RuntimeExecutorConfig {
  /** Provider ID */
  providerId: string;
  /** Provider options (API key, base URL, etc.) */
  providerOptions: Partial<ProviderCreatorOptions>;
  /** Simple request interceptor */
  interceptor?: RequestInterceptor;
  /** Default middlewares to apply */
  middlewares?: LanguageModelMiddleware[];
}

/**
 * Options for streamText/generateText calls
 */
export interface ExecutionOptions {
  /** Additional middlewares for this call only */
  middlewares?: LanguageModelMiddleware[];
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Model resolution result
 */
export interface ResolvedModel {
  /** Provider ID */
  providerId: string;
  /** Model ID */
  modelId: string;
  /** Language model instance */
  model: LanguageModelV2;
}
