import { createAnthropic } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';
import { createVertex } from '@ai-sdk/google-vertex';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import type { ProviderConfig } from '../../types';

/**
 * Official Provider Configurations
 *
 * These providers have official AI SDK package support
 */
export const OFFICIAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'official',
    creator: createOpenAI,
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        pricing: {
          inputPerMillion: 2.5,
          outputPerMillion: 10,
        },
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        pricing: {
          inputPerMillion: 0.15,
          outputPerMillion: 0.6,
        },
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 10,
          outputPerMillion: 30,
        },
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        contextWindow: 16385,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 0.5,
          outputPerMillion: 1.5,
        },
      },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'official',
    creator: createAnthropic,
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 3,
          outputPerMillion: 15,
        },
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 0.8,
          outputPerMillion: 4,
        },
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        contextWindow: 200000,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 15,
          outputPerMillion: 75,
        },
      },
    ],
  },
  {
    id: 'google',
    name: 'Google Vertex AI',
    type: 'official',
    creator: createVertex,
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash (Experimental)',
        contextWindow: 1048576,
        maxOutputTokens: 8192,
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        contextWindow: 2097152,
        maxOutputTokens: 8192,
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        contextWindow: 1048576,
        maxOutputTokens: 8192,
      },
    ],
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    type: 'official',
    creator: createAzure,
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o (Azure)',
        contextWindow: 128000,
        maxOutputTokens: 16384,
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo (Azure)',
        contextWindow: 128000,
        maxOutputTokens: 4096,
      },
    ],
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    type: 'official',
    creator: createXai,
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: false,
    models: [
      {
        id: 'grok-beta',
        name: 'Grok Beta',
        contextWindow: 131072,
        maxOutputTokens: 4096,
      },
      {
        id: 'grok-vision-beta',
        name: 'Grok Vision Beta',
        contextWindow: 8192,
        maxOutputTokens: 4096,
      },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    type: 'official',
    creator: createMistral,
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: false,
    models: [
      {
        id: 'mistral-large-latest',
        name: 'Mistral Large',
        contextWindow: 128000,
        maxOutputTokens: 4096,
      },
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small',
        contextWindow: 32000,
        maxOutputTokens: 4096,
      },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'official',
    creator: () => openrouter,
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o (via OpenRouter)',
        contextWindow: 128000,
        maxOutputTokens: 16384,
      },
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet (via OpenRouter)',
        contextWindow: 200000,
        maxOutputTokens: 8192,
      },
    ],
  },
];
