import type { ChatModelCard, ImageModelCard } from '../types';

// ============================================================================
// Chat Models
// ============================================================================

const volcengineChatModels: ChatModelCard[] = [
  {
    id: 'doubao-seed-code',
    displayName: 'Doubao Seed Code',
    description:
      'Doubao-Seed-Code 面向 Agentic 编程任务进行了深度优化，支持多模态（文字/图片/视频）与 256k 长上下文，兼容 Anthropic API。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 32_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 1.2,
      output: 8,
      cachedInput: 0.24,
      currency: 'CNY',
    },
  },
  {
    id: 'deepseek-v3.1',
    displayName: 'DeepSeek V3.1',
    description:
      'DeepSeek-V3.1 是深度求索全新推出的混合推理模型，支持思考与非思考2种推理模式，较 DeepSeek-R1-0528 思考效率更高。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 32_768,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    pricing: {
      input: 4,
      output: 12,
      cachedInput: 0.8,
      currency: 'CNY',
    },
  },
  {
    id: 'kimi-k2',
    displayName: 'Kimi K2',
    description:
      'Kimi-K2 是 Moonshot AI 推出的具备超强代码和 Agent 能力的 MoE 架构基础模型，总参数 1T，激活参数 32B。',
    type: 'chat',
    contextWindowTokens: 262_144,
    maxOutput: 32_768,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 4,
      output: 16,
      cachedInput: 0.8,
      currency: 'CNY',
    },
  },
  {
    id: 'deepseek-r1',
    displayName: 'DeepSeek R1',
    description:
      'DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，在数学、代码、自然语言推理等任务上性能比肩 OpenAI o1。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    pricing: {
      input: 4,
      output: 16,
      currency: 'CNY',
    },
  },
  {
    id: 'deepseek-r1-distill-qwen-32b',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    description: 'DeepSeek-R1-Distill 模型是通过微调训练得到的，使用 DeepSeek-R1 生成的样本数据。',
    type: 'chat',
    contextWindowTokens: 65_536,
    maxOutput: 8192,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    pricing: {
      input: 1.5,
      output: 6,
      currency: 'CNY',
    },
  },
  {
    id: 'deepseek-r1-distill-qwen-7b',
    displayName: 'DeepSeek R1 Distill Qwen 7B',
    description: 'DeepSeek-R1-Distill 7B 版本。',
    type: 'chat',
    contextWindowTokens: 65_536,
    maxOutput: 8192,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    pricing: {
      input: 0.6,
      output: 2.4,
      currency: 'CNY',
    },
  },
  {
    id: 'deepseek-v3',
    displayName: 'DeepSeek V3',
    description:
      'DeepSeek-V3 是深度求索公司自研的 MoE 模型，多项评测成绩超越 Qwen2.5-72B 和 Llama-3.1-405B。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 2,
      output: 8,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-seed-1.6-vision',
    displayName: 'Doubao Seed 1.6 Vision',
    description:
      'Doubao-Seed-1.6-vision 视觉深度思考模型，在教育、图像审核、巡检与安防和 AI 搜索问答等场景下展现出更强的通用多模态理解和推理能力。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 32_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 0.8,
      output: 8,
      cachedInput: 0.16,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-seed-1.6',
    displayName: 'Doubao Seed 1.6',
    description: '豆包全新多模态深度思考模型，同时支持 auto/thinking/non-thinking 三种思考模式。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 32_000,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 0.8,
      output: 8,
      cachedInput: 0.16,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-seed-1.6-thinking',
    displayName: 'Doubao Seed 1.6 Thinking',
    description: '豆包深度思考模型，在 Coding、Math、逻辑推理上大幅提升。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 32_000,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 0.8,
      output: 8,
      cachedInput: 0.16,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-seed-1.6-lite',
    displayName: 'Doubao Seed 1.6 Lite',
    description: 'Doubao-Seed-1.6-lite 全新多模态深度思考模型，支持思考程度可调节，更强性价比。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 32_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 0.3,
      output: 2.4,
      cachedInput: 0.06,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-seed-1.6-flash',
    displayName: 'Doubao Seed 1.6 Flash',
    description: '豆包极速多模态思考模型，TPOT 仅需 10ms。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 32_000,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 0.15,
      output: 1.5,
      cachedInput: 0.03,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-1.5-ui-tars',
    displayName: 'Doubao 1.5 UI TARS',
    description:
      'Doubao-1.5-UI-TARS 是一款原生面向图形界面交互（GUI）的 Agent 模型，通过感知、推理和行动等类人的能力与 GUI 进行无缝交互。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 16_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 3.5,
      output: 12,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-1.5-thinking-vision-pro',
    displayName: 'Doubao 1.5 Thinking Vision Pro',
    description:
      '全新视觉深度思考模型，具备更强的通用多模态理解和推理能力，在 59 个公开评测基准中的 37 个上取得 SOTA 表现。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 16_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 3,
      output: 9,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-1.5-thinking-pro',
    displayName: 'Doubao 1.5 Thinking Pro',
    description: '豆包深度思考模型，在数学、编程、科学推理等领域表现突出。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 16_000,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    pricing: {
      input: 4,
      output: 16,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-1.5-thinking-pro-m',
    displayName: 'Doubao 1.5 Thinking Pro M',
    description: 'Doubao-1.5 深度思考模型 M 版本，自带原生多模态深度推理能力。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 16_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 4,
      output: 16,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-1.5-pro-32k',
    displayName: 'Doubao 1.5 Pro 32k',
    description: '豆包全新主力模型，在知识、代码、推理等方面表现卓越。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 0.8,
      output: 2,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-1.5-pro-256k',
    displayName: 'Doubao 1.5 Pro 256k',
    description: 'Doubao-1.5-pro-256k 基于 Doubao-1.5-Pro 全面升级版，整体效果大幅提升 10%。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 12_288,
    pricing: {
      input: 5,
      output: 9,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-1.5-lite-32k',
    displayName: 'Doubao 1.5 Lite 32k',
    description: '豆包轻量版模型，极致响应速度，效果与时延均达一流水平。',
    type: 'chat',
    contextWindowTokens: 32_768,
    maxOutput: 12_288,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 0.3,
      output: 0.6,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-1.5-vision-pro-32k',
    displayName: 'Doubao 1.5 Vision Pro 32k',
    description: '豆包多模态大模型，支持任意分辨率图像识别。',
    type: 'chat',
    contextWindowTokens: 32_768,
    maxOutput: 12_288,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 3,
      output: 9,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-1.5-vision-pro',
    displayName: 'Doubao 1.5 Vision Pro',
    description: '豆包全新升级的多模态大模型，支持 128k 上下文，增强视觉推理和文档识别能力。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 3,
      output: 9,
      currency: 'CNY',
    },
    releasedAt: '2025-03-28',
  },
  {
    id: 'doubao-1.5-vision-lite',
    displayName: 'Doubao 1.5 Vision Lite',
    description: '豆包轻量版多模态大模型，支持 128k 上下文。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 1.5,
      output: 4.5,
      currency: 'CNY',
    },
    releasedAt: '2025-03-15',
  },
  {
    id: 'doubao-vision-pro-32k',
    displayName: 'Doubao Vision Pro 32k',
    description: '豆包多模态大模型，具备强大的图片理解与推理能力。',
    type: 'chat',
    contextWindowTokens: 32_768,
    maxOutput: 4096,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 3,
      output: 9,
      currency: 'CNY',
    },
    releasedAt: '2024-10-28',
  },
  {
    id: 'doubao-vision-lite-32k',
    displayName: 'Doubao Vision Lite 32k',
    description: '豆包轻量版多模态大模型。',
    type: 'chat',
    contextWindowTokens: 32_768,
    maxOutput: 4096,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 1.5,
      output: 4.5,
      currency: 'CNY',
    },
    releasedAt: '2024-10-15',
  },
  {
    id: 'doubao-pro-32k',
    displayName: 'Doubao Pro 32k',
    description: '豆包效果最好的主力模型，适合处理复杂任务。',
    type: 'chat',
    contextWindowTokens: 32_768,
    maxOutput: 4096,
    pricing: {
      input: 0.8,
      output: 2,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-pro-256k',
    displayName: 'Doubao Pro 256k',
    description: '豆包主力模型 256k 上下文版本。',
    type: 'chat',
    contextWindowTokens: 256_000,
    maxOutput: 4096,
    pricing: {
      input: 5,
      output: 9,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-lite-4k',
    displayName: 'Doubao Lite 4k',
    description: '豆包轻量模型 4k 版本，极致响应速度。',
    type: 'chat',
    contextWindowTokens: 4096,
    maxOutput: 4096,
    pricing: {
      input: 0.3,
      output: 0.6,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-lite-32k',
    displayName: 'Doubao Lite 32k',
    description: '豆包轻量模型，极致响应速度，高性价比。',
    type: 'chat',
    contextWindowTokens: 32_768,
    maxOutput: 4096,
    pricing: {
      input: 0.3,
      output: 0.6,
      currency: 'CNY',
    },
  },
  {
    id: 'doubao-lite-128k',
    displayName: 'Doubao Lite 128k',
    description: '豆包轻量模型 128k 上下文版本。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 4096,
    pricing: {
      input: 0.8,
      output: 1,
      currency: 'CNY',
    },
  },
];

// ============================================================================
// Image Models
// ============================================================================

const volcengineImageModels: ImageModelCard[] = [
  {
    id: 'doubao-seedream-4-0-250828',
    displayName: 'Seedream 4.0',
    description:
      'Seedream 4.0 图片生成模型由字节跳动 Seed 团队研发，支持文字与图片输入，提供高可控、高质量的图片生成体验。',
    type: 'image',
    enabled: true,
    releasedAt: '2025-09-09',
    resolutions: [
      '2048x2048',
      '2304x1728',
      '1728x2304',
      '2560x1440',
      '1440x2560',
      '2496x1664',
      '1664x2496',
      '3024x1296',
    ],
  },
  {
    id: 'doubao-seedream-3-0-t2i-250415',
    displayName: 'Seedream 3.0 文生图',
    description:
      'Seedream 3.0 图片生成模型由字节跳动 Seed 团队研发，支持文字与图片输入，提供高可控、高质量的图片生成体验。',
    type: 'image',
    enabled: true,
    releasedAt: '2025-04-15',
    resolutions: [
      '1024x1024',
      '864x1152',
      '1152x864',
      '1280x720',
      '720x1280',
      '832x1248',
      '1248x832',
      '1512x648',
    ],
  },
  {
    id: 'doubao-seededit-3-0-i2i-250628',
    displayName: 'SeedEdit 3.0 图生图',
    description: '支持通过文本指令编辑图像，生成图像的边长在 512～1536 之间。',
    type: 'image',
    enabled: true,
    releasedAt: '2025-06-28',
  },
];

// ============================================================================
// Exports
// ============================================================================

export default {
  chat: volcengineChatModels,
  image: volcengineImageModels,
};
