/**
 * Shared types for Arena components
 */

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  providerId: string;
  description?: string;
  category?: string;
  context?: string;
  inputPricing?: string;
  outputPricing?: string;
  type?: 'hobby' | 'pro';
  isPremium?: boolean;
  isNew?: boolean;
  default?: boolean;
}

export interface ModelConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

export interface ModelComparison {
  id: string;
  modelId: string;
  response: string;
  responseTime?: number;
  tokenCount?: number;
  isLoading: boolean;
  synced: boolean;
  customPrompt: string;
  config: ModelConfig;
  error?: string;
}
