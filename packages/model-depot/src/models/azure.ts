import type { ChatModelCard, ImageModelCard } from '../types';

// ============================================================================
// Chat Models
// ============================================================================

const azureChatModels: ChatModelCard[] = [
  {
    id: 'gpt-5',
    displayName: 'GPT-5',
    description: 'Azure OpenAI GPT-5 最新旗舰模型，具有卓越的推理和生成能力。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 32_768,
    enabled: true,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 5,
      output: 20,
      currency: 'USD',
    },
    releasedAt: '2025-05-14',
  },
  {
    id: 'gpt-5-mini',
    displayName: 'GPT-5 Mini',
    description: 'Azure OpenAI GPT-5 Mini 轻量版，平衡性能与成本。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 32_768,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 1.25,
      output: 5,
      currency: 'USD',
    },
    releasedAt: '2025-05-14',
  },
  {
    id: 'gpt-5-nano',
    displayName: 'GPT-5 Nano',
    description: 'Azure OpenAI GPT-5 Nano 超轻量版，适合高吞吐场景。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 32_768,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 0.25,
      output: 1,
      currency: 'USD',
    },
    releasedAt: '2025-05-14',
  },
  {
    id: 'o3',
    displayName: 'o3',
    description: 'Azure OpenAI o3 推理模型，具有强大的逻辑推理能力。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 100_000,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 10,
      output: 40,
      currency: 'USD',
    },
    releasedAt: '2025-04-16',
  },
  {
    id: 'o3-mini',
    displayName: 'o3 Mini',
    description: 'Azure OpenAI o3 Mini 轻量推理模型。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 100_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 1.1,
      output: 4.4,
      currency: 'USD',
    },
    releasedAt: '2025-01-31',
  },
  {
    id: 'o4-mini',
    displayName: 'o4 Mini',
    description: 'Azure OpenAI o4 Mini 新一代推理模型。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 100_000,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 1.1,
      output: 4.4,
      currency: 'USD',
    },
    releasedAt: '2025-04-16',
  },
  {
    id: 'o1',
    displayName: 'o1',
    description: 'Azure OpenAI o1 推理模型。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 100_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 15,
      output: 60,
      currency: 'USD',
    },
  },
  {
    id: 'o1-mini',
    displayName: 'o1 Mini',
    description: 'Azure OpenAI o1 Mini 轻量推理模型。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 65_536,
    abilities: {
      reasoning: true,
    },
    pricing: {
      input: 1.1,
      output: 4.4,
      currency: 'USD',
    },
  },
  {
    id: 'gpt-4.1',
    displayName: 'GPT-4.1',
    description: 'Azure OpenAI GPT-4.1 支持超长上下文。',
    type: 'chat',
    contextWindowTokens: 1_047_576,
    maxOutput: 32_768,
    enabled: true,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 2,
      output: 8,
      currency: 'USD',
    },
    releasedAt: '2025-04-14',
  },
  {
    id: 'gpt-4.1-mini',
    displayName: 'GPT-4.1 Mini',
    description: 'Azure OpenAI GPT-4.1 Mini 轻量版。',
    type: 'chat',
    contextWindowTokens: 1_047_576,
    maxOutput: 32_768,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 0.4,
      output: 1.6,
      currency: 'USD',
    },
    releasedAt: '2025-04-14',
  },
  {
    id: 'gpt-4.1-nano',
    displayName: 'GPT-4.1 Nano',
    description: 'Azure OpenAI GPT-4.1 Nano 超轻量版。',
    type: 'chat',
    contextWindowTokens: 1_047_576,
    maxOutput: 32_768,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 0.1,
      output: 0.4,
      currency: 'USD',
    },
    releasedAt: '2025-04-14',
  },
  {
    id: 'gpt-4o',
    displayName: 'GPT-4o',
    description: 'Azure OpenAI GPT-4o 多模态模型。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    enabled: true,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 2.5,
      output: 10,
      currency: 'USD',
    },
  },
  {
    id: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    description: 'Azure OpenAI GPT-4o Mini 轻量版。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    enabled: true,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 0.15,
      output: 0.6,
      currency: 'USD',
    },
  },
  {
    id: 'gpt-4o-2024-11-20',
    displayName: 'GPT-4o (2024-11-20)',
    description: 'Azure OpenAI GPT-4o 2024-11-20 版本。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 2.5,
      output: 10,
      currency: 'USD',
    },
    releasedAt: '2024-11-20',
  },
  {
    id: 'gpt-4o-2024-08-06',
    displayName: 'GPT-4o (2024-08-06)',
    description: 'Azure OpenAI GPT-4o 2024-08-06 版本。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 2.5,
      output: 10,
      currency: 'USD',
    },
    releasedAt: '2024-08-06',
  },
  {
    id: 'gpt-4o-2024-05-13',
    displayName: 'GPT-4o (2024-05-13)',
    description: 'Azure OpenAI GPT-4o 2024-05-13 版本。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 4_096,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 5,
      output: 15,
      currency: 'USD',
    },
    releasedAt: '2024-05-13',
  },
  {
    id: 'gpt-4o-mini-2024-07-18',
    displayName: 'GPT-4o Mini (2024-07-18)',
    description: 'Azure OpenAI GPT-4o Mini 2024-07-18 版本。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    pricing: {
      input: 0.15,
      output: 0.6,
      currency: 'USD',
    },
    releasedAt: '2024-07-18',
  },
  {
    id: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    description: 'Azure OpenAI GPT-4 Turbo 具有视觉能力。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 4_096,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 10,
      output: 30,
      currency: 'USD',
    },
  },
  {
    id: 'gpt-4-turbo-2024-04-09',
    displayName: 'GPT-4 Turbo (2024-04-09)',
    description: 'Azure OpenAI GPT-4 Turbo 2024-04-09 版本。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 4_096,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 10,
      output: 30,
      currency: 'USD',
    },
    releasedAt: '2024-04-09',
  },
  {
    id: 'gpt-4',
    displayName: 'GPT-4',
    description: 'Azure OpenAI GPT-4 基础模型。',
    type: 'chat',
    contextWindowTokens: 8_192,
    maxOutput: 4_096,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 30,
      output: 60,
      currency: 'USD',
    },
  },
  {
    id: 'gpt-4-32k',
    displayName: 'GPT-4 32K',
    description: 'Azure OpenAI GPT-4 32K 扩展上下文版。',
    type: 'chat',
    contextWindowTokens: 32_768,
    maxOutput: 4_096,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 60,
      output: 120,
      currency: 'USD',
    },
  },
  {
    id: 'gpt-35-turbo',
    displayName: 'GPT-3.5 Turbo',
    description: 'Azure OpenAI GPT-3.5 Turbo 经济高效。',
    type: 'chat',
    contextWindowTokens: 16_385,
    maxOutput: 4_096,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 0.5,
      output: 1.5,
      currency: 'USD',
    },
  },
  {
    id: 'gpt-35-turbo-16k',
    displayName: 'GPT-3.5 Turbo 16K',
    description: 'Azure OpenAI GPT-3.5 Turbo 16K 扩展上下文。',
    type: 'chat',
    contextWindowTokens: 16_385,
    maxOutput: 4_096,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 3,
      output: 4,
      currency: 'USD',
    },
  },
];

// ============================================================================
// Image Models
// ============================================================================

const azureImageModels: ImageModelCard[] = [
  {
    id: 'gpt-image-1',
    displayName: 'GPT Image 1',
    description: 'Azure OpenAI GPT Image 1 最新图像生成模型，支持多种风格。',
    type: 'image',
    enabled: true,
    releasedAt: '2025-04-23',
    resolutions: ['1024x1024', '1536x1024', '1024x1536'],
  },
  {
    id: 'dall-e-3',
    displayName: 'DALL-E 3',
    description: 'Azure OpenAI DALL-E 3 图像生成模型。',
    type: 'image',
    enabled: true,
    releasedAt: '2023-10-19',
    resolutions: ['1024x1024', '1792x1024', '1024x1792'],
  },
  {
    id: 'dall-e-2',
    displayName: 'DALL-E 2',
    description: 'Azure OpenAI DALL-E 2 图像生成模型。',
    type: 'image',
    releasedAt: '2022-04-06',
    resolutions: ['256x256', '512x512', '1024x1024'],
  },
];

// ============================================================================
// Exports
// ============================================================================

export default {
  chat: azureChatModels,
  image: azureImageModels,
};
