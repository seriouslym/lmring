import type { LanguageModelV2 } from '@ai-sdk/provider';

export interface ProviderInstance {
  readonly providerId: string;
  readonly apiKey?: string;
  readonly baseURL?: string;
  readonly name?: string;
  languageModel(modelId: string): LanguageModelV2;
}

export interface ProviderConfig {
  id: string;
  name: string;
  description?: string;
  type: 'official' | 'compatible' | 'custom';
  creator?: (options: ProviderOptions) => ProviderInstance;
  compatibleConfig?: {
    baseURL: string;
    alternativeBaseURL?: string; // For dual format support
    defaultHeaders?: Record<string, string>;
  };
  models?: ModelConfig[];
  supportsStreaming?: boolean;
  supportsStructuredOutput?: boolean;
  supportsVision?: boolean;
  supportsFunctionCalling?: boolean;
}

export interface ModelConfig {
  id: string;
  name: string;
  contextLength?: number;
  maxOutputTokens?: number;
  inputPricePerMillion?: number;
  outputPricePerMillion?: number;
  supportedFormats?: ('openai' | 'anthropic')[];
}

export interface ProviderOptions {
  apiKey?: string;
  baseURL?: string;
  headers?: Record<string, string>;
  organization?: string;
  project?: string;
  resourceName?: string; // Azure
  apiVersion?: string; // Azure
  region?: string; // AWS Bedrock
  useAnthropicFormat?: boolean; // For dual format providers
}

export interface ResolvedModel {
  providerId: string;
  modelId: string;
  format: 'openai' | 'anthropic';
  model: LanguageModelV2;
}
