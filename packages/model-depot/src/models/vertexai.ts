import type { ChatModelCard, ImageModelCard } from '../types';

// ============================================================================
// Chat Models - Google Vertex AI
// ============================================================================

const vertexaiChatModels: ChatModelCard[] = [
  // =========================================================================
  // Gemini 3 Series
  // =========================================================================
  {
    id: 'gemini-3-pro-image-preview',
    displayName: 'Nano Banana Pro',
    description:
      'Gemini 3 Pro Image（Nano Banana Pro）是 Google 的图像生成模型，同时支持多模态对话。',
    type: 'chat',
    contextWindowTokens: 163_840,
    maxOutput: 32_768,
    enabled: true,
    abilities: {
      imageOutput: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    pricing: {
      input: 2,
      output: 12,
      currency: 'USD',
    },
    releasedAt: '2025-11-20',
  },
  {
    id: 'gemini-3-pro-preview',
    displayName: 'Gemini 3 Pro Preview',
    description:
      'Gemini 3 Pro 是全球最佳的多模态理解模型，也是 Google 迄今为止最强大的智能体和氛围编程模型。',
    type: 'chat',
    contextWindowTokens: 1_114_112,
    maxOutput: 65_536,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    pricing: {
      input: 2,
      output: 12,
      cachedInput: 0.2,
      currency: 'USD',
    },
    releasedAt: '2025-11-18',
  },

  // =========================================================================
  // Gemini 2.5 Series
  // =========================================================================
  {
    id: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    description:
      'Gemini 2.5 Pro 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理。',
    type: 'chat',
    contextWindowTokens: 1_114_112,
    maxOutput: 65_536,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    pricing: {
      input: 1.25,
      output: 10,
      cachedInput: 0.31,
      currency: 'USD',
    },
    releasedAt: '2025-06-17',
  },
  {
    id: 'gemini-2.5-pro-preview-05-06',
    displayName: 'Gemini 2.5 Pro Preview 05-06',
    description:
      'Gemini 2.5 Pro Preview 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理。',
    type: 'chat',
    contextWindowTokens: 1_114_112,
    maxOutput: 65_536,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 1.25,
      output: 10,
      currency: 'USD',
    },
    releasedAt: '2025-05-06',
  },
  {
    id: 'gemini-2.5-pro-preview-03-25',
    displayName: 'Gemini 2.5 Pro Preview 03-25',
    description:
      'Gemini 2.5 Pro Preview 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理。',
    type: 'chat',
    contextWindowTokens: 1_114_112,
    maxOutput: 65_536,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 1.25,
      output: 10,
      currency: 'USD',
    },
    releasedAt: '2025-04-09',
  },
  {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'Gemini 2.5 Flash 是 Google 性价比最高的模型，提供全面的功能。',
    type: 'chat',
    contextWindowTokens: 1_114_112,
    maxOutput: 65_536,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    pricing: {
      input: 0.3,
      output: 2.5,
      cachedInput: 0.075,
      currency: 'USD',
    },
    releasedAt: '2025-06-17',
  },
  {
    id: 'gemini-2.5-flash-preview-04-17',
    displayName: 'Gemini 2.5 Flash Preview 04-17',
    description: 'Gemini 2.5 Flash Preview 是 Google 性价比最高的模型，提供全面的功能。',
    type: 'chat',
    contextWindowTokens: 1_114_112,
    maxOutput: 65_536,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 0.15,
      output: 3.5,
      currency: 'USD',
    },
    releasedAt: '2025-04-17',
  },
  {
    id: 'gemini-2.5-flash-image',
    displayName: 'Nano Banana',
    description:
      'Nano Banana 是 Google 最新、最快、最高效的原生多模态模型，它允许您通过对话生成和编辑图像。',
    type: 'chat',
    contextWindowTokens: 40_960,
    maxOutput: 8_192,
    enabled: true,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 0.3,
      output: 2.5,
      currency: 'USD',
    },
    releasedAt: '2025-08-26',
  },
  {
    id: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash-Lite',
    description: 'Gemini 2.5 Flash-Lite 是 Google 最小、性价比最高的模型，专为大规模使用而设计。',
    type: 'chat',
    contextWindowTokens: 1_064_000,
    maxOutput: 64_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    pricing: {
      input: 0.1,
      output: 0.4,
      cachedInput: 0.025,
      currency: 'USD',
    },
    releasedAt: '2025-07-22',
  },
  {
    id: 'gemini-2.5-flash-lite-preview-06-17',
    displayName: 'Gemini 2.5 Flash-Lite Preview 06-17',
    description:
      'Gemini 2.5 Flash-Lite Preview 是 Google 最小、性价比最高的模型，专为大规模使用而设计。',
    type: 'chat',
    contextWindowTokens: 1_064_000,
    maxOutput: 64_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 0.1,
      output: 0.4,
      currency: 'USD',
    },
    releasedAt: '2025-06-17',
  },

  // =========================================================================
  // Gemini 2.0 Series
  // =========================================================================
  {
    id: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    description:
      'Gemini 2.0 Flash 提供下一代功能和改进，包括卓越的速度、原生工具使用、多模态生成和1M令牌上下文窗口。',
    type: 'chat',
    contextWindowTokens: 1_056_768,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 0.15,
      output: 0.6,
      cachedInput: 0.0375,
      currency: 'USD',
    },
    releasedAt: '2025-02-05',
  },
  {
    id: 'gemini-2.0-flash-lite',
    displayName: 'Gemini 2.0 Flash-Lite',
    description: 'Gemini 2.0 Flash 模型变体，针对成本效益和低延迟等目标进行了优化。',
    type: 'chat',
    contextWindowTokens: 1_056_768,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 0.075,
      output: 0.3,
      cachedInput: 0.018,
      currency: 'USD',
    },
    releasedAt: '2025-02-05',
  },

  // =========================================================================
  // Gemini 1.5 Series
  // =========================================================================
  {
    id: 'gemini-1.5-flash-002',
    displayName: 'Gemini 1.5 Flash 002',
    description: 'Gemini 1.5 Flash 002 是一款高效的多模态模型，支持广泛应用的扩展。',
    type: 'chat',
    contextWindowTokens: 1_008_192,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 0.075,
      output: 0.3,
      currency: 'USD',
    },
    releasedAt: '2024-09-25',
  },
  {
    id: 'gemini-1.5-pro-002',
    displayName: 'Gemini 1.5 Pro 002',
    description:
      'Gemini 1.5 Pro 002 是最新的生产就绪模型，提供更高质量的输出，特别在数学、长上下文和视觉任务方面有显著提升。',
    type: 'chat',
    contextWindowTokens: 2_008_192,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 1.25,
      output: 2.5,
      currency: 'USD',
    },
    releasedAt: '2024-09-24',
  },
];

// ============================================================================
// Image Models
// ============================================================================

const vertexaiImageModels: ImageModelCard[] = [
  {
    id: 'gemini-2.5-flash-image:image',
    displayName: 'Nano Banana',
    description:
      'Nano Banana 是 Google 最新、最快、最高效的原生多模态模型，它允许您通过对话生成和编辑图像。',
    type: 'image',
    enabled: true,
    releasedAt: '2025-08-26',
  },
  {
    id: 'imagen-4.0-generate-001',
    displayName: 'Imagen 4',
    description: 'Imagen 4 是 Google DeepMind 的第四代文本到图像生成模型。',
    type: 'image',
    enabled: true,
    releasedAt: '2025-08-15',
  },
  {
    id: 'imagen-4.0-ultra-generate-001',
    displayName: 'Imagen 4 Ultra',
    description: 'Imagen 4 Ultra 是 Imagen 4 的高质量版本。',
    type: 'image',
    enabled: true,
    releasedAt: '2025-08-15',
  },
  {
    id: 'imagen-4.0-fast-generate-001',
    displayName: 'Imagen 4 Fast',
    description: 'Imagen 4 Fast 是 Imagen 4 的快速版本。',
    type: 'image',
    enabled: true,
    releasedAt: '2025-08-15',
  },
];

// ============================================================================
// Exports
// ============================================================================

export default {
  chat: vertexaiChatModels,
  image: vertexaiImageModels,
};
