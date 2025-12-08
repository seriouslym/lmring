import type { ChatModelCard, ImageModelCard } from '../types';

// ============================================================================
// Chat Models
// ============================================================================

const zhipuChatModels: ChatModelCard[] = [
  {
    id: 'glm-4.6',
    displayName: 'GLM-4.6',
    description:
      '智谱最新旗舰模型 GLM-4.6 (355B) 在高级编码、长文本处理、推理与智能体能力上全面超越前代，尤其在编程能力上对齐 Claude Sonnet 4，成为国内顶尖的 Coding 模型。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 131_072,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    pricing: {
      input: 2,
      output: 8,
      cachedInput: 0.4,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4.5v',
    displayName: 'GLM-4.5V',
    description:
      '智谱新一代基于 MOE 架构的视觉推理模型，以106B的总参数量和12B激活参数量，在各类基准测试中达到全球同级别开源多模态模型 SOTA。',
    type: 'chat',
    contextWindowTokens: 65_536,
    maxOutput: 16_384,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    pricing: {
      input: 2,
      output: 6,
      cachedInput: 0.4,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4.5',
    displayName: 'GLM-4.5',
    description:
      '智谱旗舰模型，支持思考模式切换，综合能力达到开源模型的 SOTA 水平，上下文长度可达128K。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 98_304,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    pricing: {
      input: 2,
      output: 8,
      cachedInput: 0.4,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4.5-x',
    displayName: 'GLM-4.5-X',
    description: 'GLM-4.5 的极速版，在性能强劲的同时，生成速度可达 100 tokens/秒。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 98_304,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    pricing: {
      input: 8,
      output: 16,
      cachedInput: 1.6,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4.5-air',
    displayName: 'GLM-4.5-Air',
    description: 'GLM-4.5 的轻量版，兼顾性能与性价比，可灵活切换混合思考模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 98_304,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    pricing: {
      input: 0.8,
      output: 2,
      cachedInput: 0.16,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4.5-airx',
    displayName: 'GLM-4.5-AirX',
    description: 'GLM-4.5-Air 的极速版，响应速度更快，专为大规模高速度需求打造。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 98_304,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    pricing: {
      input: 4,
      output: 12,
      cachedInput: 0.8,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4.5-flash',
    displayName: 'GLM-4.5-Flash',
    description: 'GLM-4.5 的免费版，推理、代码、智能体等任务表现出色。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 98_304,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    pricing: {
      input: 0,
      output: 0,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4.1v-thinking-flashx',
    displayName: 'GLM-4.1V-Thinking-FlashX',
    description:
      'GLM-4.1V-Thinking 系列模型是目前已知10B级别的VLM模型中性能最强的视觉模型，融合了同级别SOTA的各项视觉语言任务。',
    type: 'chat',
    contextWindowTokens: 65_536,
    maxOutput: 32_768,
    abilities: {
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 2,
      output: 2,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4.1v-thinking-flash',
    displayName: 'GLM-4.1V-Thinking-Flash',
    description:
      'GLM-4.1V-Thinking 系列模型是目前已知10B级别的VLM模型中性能最强的视觉模型，免费版本。',
    type: 'chat',
    contextWindowTokens: 65_536,
    maxOutput: 32_768,
    abilities: {
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 0,
      output: 0,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-zero-preview',
    displayName: 'GLM-Zero-Preview',
    description: 'GLM-Zero-Preview具备强大的复杂推理能力，在逻辑推理、数学、编程等领域表现优异。',
    type: 'chat',
    contextWindowTokens: 16_384,
    abilities: {
      reasoning: true,
    },
    pricing: {
      input: 10,
      output: 10,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-z1-air',
    displayName: 'GLM-Z1-Air',
    description: '推理模型: 具备强大推理能力，适用于需要深度推理的任务。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 32_768,
    abilities: {
      reasoning: true,
      search: true,
    },
    pricing: {
      input: 0.5,
      output: 0.5,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-z1-airx',
    displayName: 'GLM-Z1-AirX',
    description: '极速推理：具有超快的推理速度和强大的推理效果。',
    type: 'chat',
    contextWindowTokens: 32_768,
    maxOutput: 32_768,
    abilities: {
      reasoning: true,
      search: true,
    },
    pricing: {
      input: 5,
      output: 5,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-z1-flashx',
    displayName: 'GLM-Z1-FlashX',
    description: '高速低价：Flash增强版本，超快推理速度，更快并发保障。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 32_768,
    abilities: {
      reasoning: true,
      search: true,
    },
    pricing: {
      input: 0.1,
      output: 0.1,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-z1-flash',
    displayName: 'GLM-Z1-Flash',
    description: 'GLM-Z1 系列具备强大的复杂推理能力，在逻辑推理、数学、编程等领域表现优异。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 32_768,
    abilities: {
      reasoning: true,
      search: true,
    },
    pricing: {
      input: 0,
      output: 0,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4-plus',
    displayName: 'GLM-4-Plus',
    description: 'GLM-4-Plus 作为高智能旗舰，具备强大的处理长文本和复杂任务的能力，性能全面提升。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 4095,
    enabled: true,
    abilities: {
      functionCall: true,
      search: true,
    },
    pricing: {
      input: 5,
      output: 5,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4-0520',
    displayName: 'GLM-4-0520',
    description: 'GLM-4-0520 是最新模型版本，专为高度复杂和多样化任务设计，表现卓越。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
      search: true,
    },
    pricing: {
      input: 100,
      output: 100,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4-flash-250414',
    displayName: 'GLM-4-Flash-250414',
    description: 'GLM-4-Flash 是处理简单任务的理想选择，速度最快且免费。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 32_768,
    abilities: {
      functionCall: true,
      search: true,
    },
    pricing: {
      input: 0,
      output: 0,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4-flashx',
    displayName: 'GLM-4-FlashX-250414',
    description: 'GLM-4-FlashX 是Flash的增强版本，超快推理速度。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 4095,
    abilities: {
      functionCall: true,
      search: true,
    },
    pricing: {
      input: 0.1,
      output: 0.1,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4-long',
    displayName: 'GLM-4-Long',
    description: 'GLM-4-Long 支持超长文本输入，适合记忆型任务与大规模文档处理。',
    type: 'chat',
    contextWindowTokens: 1_024_000,
    maxOutput: 4095,
    abilities: {
      functionCall: true,
      search: true,
    },
    pricing: {
      input: 1,
      output: 1,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4-air-250414',
    displayName: 'GLM-4-Air-250414',
    description: 'GLM-4-Air 是性价比高的版本，性能接近GLM-4，提供快速度和实惠的价格。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
      search: true,
    },
    pricing: {
      input: 0.5,
      output: 0.5,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4-airx',
    displayName: 'GLM-4-AirX',
    description: 'GLM-4-AirX 提供 GLM-4-Air 的高效版本，推理速度可达其2.6倍。',
    type: 'chat',
    contextWindowTokens: 8192,
    maxOutput: 4095,
    abilities: {
      functionCall: true,
      search: true,
    },
    pricing: {
      input: 10,
      output: 10,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4v-flash',
    displayName: 'GLM-4V-Flash',
    description:
      'GLM-4V-Flash 专注于高效的单一图像理解，适用于快速图像解析的场景，例如实时图像分析或批量图像处理。',
    type: 'chat',
    contextWindowTokens: 4096,
    maxOutput: 8192,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 0,
      output: 0,
      currency: 'CNY',
    },
    releasedAt: '2024-12-09',
  },
  {
    id: 'glm-4v-plus-0111',
    displayName: 'GLM-4V-Plus-0111',
    description: 'GLM-4V-Plus 具备对视频内容及多图片的理解能力，适合多模态任务。',
    type: 'chat',
    contextWindowTokens: 16_000,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 4,
      output: 4,
      currency: 'CNY',
    },
  },
  {
    id: 'glm-4v',
    displayName: 'GLM-4V',
    description: 'GLM-4V 提供强大的图像理解与推理能力，支持多种视觉任务。',
    type: 'chat',
    contextWindowTokens: 4096,
    maxOutput: 1024,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 50,
      output: 50,
      currency: 'CNY',
    },
  },
  {
    id: 'codegeex-4',
    displayName: 'CodeGeeX-4',
    description:
      'CodeGeeX-4 是强大的AI编程助手，支持多种编程语言的智能问答与代码补全，提升开发效率。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 32_768,
    pricing: {
      input: 0.1,
      output: 0.1,
      currency: 'CNY',
    },
  },
  {
    id: 'charglm-4',
    displayName: 'CharGLM-4',
    description: 'CharGLM-4 专为角色扮演与情感陪伴设计，支持超长多轮记忆与个性化对话，应用广泛。',
    type: 'chat',
    contextWindowTokens: 8192,
    maxOutput: 4000,
    pricing: {
      input: 1,
      output: 1,
      currency: 'CNY',
    },
  },
  {
    id: 'emohaa',
    displayName: 'Emohaa',
    description: 'Emohaa 是心理模型，具备专业咨询能力，帮助用户理解情感问题。',
    type: 'chat',
    contextWindowTokens: 8192,
    maxOutput: 4000,
    pricing: {
      input: 15,
      output: 15,
      currency: 'CNY',
    },
  },
];

// ============================================================================
// Image Models
// ============================================================================

const zhipuImageModels: ImageModelCard[] = [
  {
    id: 'cogview-4',
    displayName: 'CogView-4',
    description:
      'CogView-4 是智谱首个支持生成汉字的开源文生图模型，在语义理解、图像生成质量、中英文字生成能力等方面全面提升。',
    type: 'image',
    enabled: true,
    releasedAt: '2025-03-04',
    resolutions: [
      '1024x1024',
      '768x1344',
      '864x1152',
      '1344x768',
      '1152x864',
      '1440x720',
      '720x1440',
    ],
  },
];

// ============================================================================
// Exports
// ============================================================================

export default {
  chat: zhipuChatModels,
  image: zhipuImageModels,
};
