import { createAnthropic } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createVertex } from '@ai-sdk/google-vertex';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { ProviderConfig, ProviderInstance, ProviderOptions } from '../../types/provider';

// Helper function to add providerId to provider instances
type ProviderLike = {
  languageModel: ProviderInstance['languageModel'];
  chat?: ProviderInstance['languageModel'];
};

function wrapProvider<T extends ProviderLike>(
  providerId: string,
  creator: (options?: ProviderOptions) => T,
): (options: ProviderOptions) => ProviderInstance {
  return (options: ProviderOptions) => {
    const provider = creator(options);
    return {
      ...provider,
      providerId,
    };
  };
}

export const OFFICIAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'official',
    creator: wrapProvider('openai', createOpenAI),
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        contextLength: 128000,
        maxOutputTokens: 16384,
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        contextLength: 128000,
        maxOutputTokens: 16384,
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        contextLength: 128000,
        maxOutputTokens: 4096,
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        contextLength: 16385,
        maxOutputTokens: 4096,
      },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'official',
    creator: wrapProvider('anthropic', createAnthropic),
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    models: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        contextLength: 200000,
        maxOutputTokens: 8192,
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        contextLength: 200000,
        maxOutputTokens: 8192,
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        contextLength: 200000,
        maxOutputTokens: 4096,
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        contextLength: 200000,
        maxOutputTokens: 4096,
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        contextLength: 200000,
        maxOutputTokens: 4096,
      },
    ],
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    type: 'official',
    creator: wrapProvider('azure', createAzure),
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    supportsFunctionCalling: true,
  },
  {
    id: 'vertex',
    name: 'Google Vertex AI',
    type: 'official',
    creator: wrapProvider('vertex', createVertex),
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    models: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        contextLength: 2097152,
        maxOutputTokens: 8192,
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        contextLength: 1048576,
        maxOutputTokens: 8192,
      },
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash (Experimental)',
        contextLength: 1048576,
        maxOutputTokens: 8192,
      },
    ],
  },
  {
    id: 'xai',
    name: 'xAI',
    type: 'official',
    creator: wrapProvider('xai', createXai),
    supportsStreaming: true,
    supportsStructuredOutput: true,
    models: [
      {
        id: 'grok-beta',
        name: 'Grok Beta',
        contextLength: 131072,
        maxOutputTokens: 4096,
      },
      {
        id: 'grok-vision-beta',
        name: 'Grok Vision Beta',
        contextLength: 8192,
        maxOutputTokens: 4096,
      },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'official',
    creator: wrapProvider('deepseek', createDeepSeek),
    supportsStreaming: true,
    supportsStructuredOutput: true,
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        contextLength: 65536,
        maxOutputTokens: 8192,
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        contextLength: 65536,
        maxOutputTokens: 8192,
      },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    type: 'official',
    creator: wrapProvider('mistral', createMistral),
    supportsStreaming: true,
    supportsStructuredOutput: true,
    models: [
      {
        id: 'mistral-large-latest',
        name: 'Mistral Large',
        contextLength: 32768,
        maxOutputTokens: 4096,
      },
      {
        id: 'mistral-medium-latest',
        name: 'Mistral Medium',
        contextLength: 32768,
        maxOutputTokens: 4096,
      },
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small',
        contextLength: 32768,
        maxOutputTokens: 4096,
      },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'official',
    creator: wrapProvider('openrouter', createOpenRouter),
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    supportsFunctionCalling: true,
  },
];
