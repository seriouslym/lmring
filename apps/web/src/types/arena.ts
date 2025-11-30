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
