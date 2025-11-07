import type { LanguageModelV2 } from '@ai-sdk/provider';
import type { ModelConfig } from './model';

/**
 * Provider instance type
 * A function that takes a model ID and returns a LanguageModel
 */
export type ProviderInstance = (modelId: string) => LanguageModelV2;

/**
 * Provider configuration interface
 */
export interface ProviderConfig {
  /** Provider ID (e.g., 'openai', 'silicon') */
  id: string;
  /** Display name */
  name: string;
  /** Type: official or compatible */
  type: 'official' | 'compatible';
  /** Official Provider creator function */
  creator?: (options: ProviderCreatorOptions) => ProviderInstance;
  /** OpenAI Compatible configuration */
  compatibleConfig?: {
    baseURL: string;
    defaultHeaders?: Record<string, string>;
    /** Anthropic-compatible API endpoint (for dual-format support) */
    anthropicApiHost?: string;
  };
  /** Whether streaming is supported */
  supportsStreaming: boolean;
  /** Whether structured output is supported */
  supportsStructuredOutput: boolean;
  /** Whether vision is supported */
  supportsVision: boolean;
  /** List of supported models */
  models: ModelConfig[];
}

/**
 * Provider creator options
 */
export interface ProviderCreatorOptions {
  apiKey: string;
  baseURL?: string;
  headers?: Record<string, string>;
}

/**
 * Provider creation options
 */
export interface CreateProviderOptions {
  /** Provider ID */
  providerId: string;
  /** API Key (single key) */
  apiKey?: string;
  /** Multiple API Keys for rotation (takes priority over apiKey) */
  apiKeys?: string[];
  /** Custom Base URL (optional) */
  baseURL?: string;
  /** Custom Headers (optional) */
  headers?: Record<string, string>;
  /** Request timeout */
  timeout?: number;
  /** Use Anthropic-compatible endpoint (for dual-format providers) */
  useAnthropicFormat?: boolean;
}
