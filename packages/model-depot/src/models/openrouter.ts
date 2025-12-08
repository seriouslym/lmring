import type { ChatModelCard, ImageModelCard } from '../types';

// ============================================================================
// Chat Models - via OpenRouter API Gateway
// ============================================================================

const openrouterChatModels: ChatModelCard[] = [
  // =========================================================================
  // DeepSeek Series
  // =========================================================================
  {
    id: 'deepseek/deepseek-chat-v3-1',
    displayName: 'DeepSeek V3.1',
    description:
      'DeepSeek V3.1 模型为混合推理架构模型，同时支持思考模式与非思考模式。本次升级针对通用推理、前端开发与中文写作场景进行了专项优化。',
    type: 'chat',
    contextWindowTokens: 163_840,
    maxOutput: 65_536,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    pricing: {
      input: 1.1,
      output: 2.2,
      currency: 'USD',
    },
    releasedAt: '2025-05-20',
  },
  {
    id: 'deepseek/deepseek-r1-0528',
    displayName: 'DeepSeek R1 0528',
    description: 'DeepSeek R1 0528 版本，具有强大的推理能力。',
    type: 'chat',
    contextWindowTokens: 163_840,
    maxOutput: 163_840,
    enabled: true,
    abilities: {
      reasoning: true,
    },
    pricing: {
      input: 3,
      output: 8,
      currency: 'USD',
    },
    releasedAt: '2025-05-28',
  },
  {
    id: 'deepseek/deepseek-r1',
    displayName: 'DeepSeek R1',
    description: 'DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，极大提升了模型推理能力。',
    type: 'chat',
    contextWindowTokens: 163_840,
    maxOutput: 163_840,
    abilities: {
      reasoning: true,
    },
    pricing: {
      input: 3,
      output: 8,
      currency: 'USD',
    },
  },
  {
    id: 'deepseek/deepseek-chat',
    displayName: 'DeepSeek V3',
    description: 'DeepSeek-V3 为自研 MoE 模型，671B 参数，激活 37B。',
    type: 'chat',
    contextWindowTokens: 65_536,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 0.9,
      output: 0.9,
      currency: 'USD',
    },
  },
  {
    id: 'deepseek/deepseek-prover-v2',
    displayName: 'DeepSeek Prover V2',
    description: 'DeepSeek Prover V2 数学证明专用模型。',
    type: 'chat',
    contextWindowTokens: 163_840,
    maxOutput: 163_840,
    abilities: {
      reasoning: true,
    },
    pricing: {
      input: 3,
      output: 8,
      currency: 'USD',
    },
  },

  // =========================================================================
  // Qwen Series
  // =========================================================================
  {
    id: 'qwen/qwen3-coder-480b-a35b-instruct',
    displayName: 'Qwen3 Coder 480B A35B',
    description: '通义千问代码模型，具有强大的 Coding Agent 能力。',
    type: 'chat',
    contextWindowTokens: 262_144,
    maxOutput: 65_536,
    enabled: true,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 1.8,
      output: 7.2,
      currency: 'USD',
    },
  },
  {
    id: 'qwen/qwen3-235b-a22b',
    displayName: 'Qwen3 235B A22B',
    description: 'Qwen3 最大规模的 MoE 模型，支持思考模式切换。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    pricing: {
      input: 0.16,
      output: 0.58,
      currency: 'USD',
    },
  },
  {
    id: 'qwen/qwen3-32b',
    displayName: 'Qwen3 32B',
    description: 'Qwen3 32B 模型，支持思考模式切换。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    pricing: {
      input: 0.07,
      output: 0.13,
      currency: 'USD',
    },
  },
  {
    id: 'qwen/qwq-32b',
    displayName: 'QwQ 32B',
    description: 'QwQ 32B 推理模型，通过强化学习大幅度提升了推理能力。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    abilities: {
      reasoning: true,
    },
    pricing: {
      input: 0.12,
      output: 0.18,
      currency: 'USD',
    },
  },
  {
    id: 'qwen/qvq-72b-preview',
    displayName: 'QVQ 72B Preview',
    description: 'QVQ 72B 视觉推理模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 32_768,
    abilities: {
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 0.33,
      output: 1.33,
      currency: 'USD',
    },
  },

  // =========================================================================
  // Google Gemini Series
  // =========================================================================
  {
    id: 'google/gemini-2.5-pro-preview',
    displayName: 'Gemini 2.5 Pro Preview',
    description: 'Google Gemini 2.5 Pro 预览版，最强大的多模态模型。',
    type: 'chat',
    contextWindowTokens: 1_048_576,
    maxOutput: 65_536,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 2.5,
      output: 15,
      currency: 'USD',
    },
    releasedAt: '2025-03-26',
  },
  {
    id: 'google/gemini-2.5-flash-preview',
    displayName: 'Gemini 2.5 Flash Preview',
    description: 'Google Gemini 2.5 Flash 预览版，快速响应。',
    type: 'chat',
    contextWindowTokens: 1_048_576,
    maxOutput: 65_536,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 0.15,
      output: 0.6,
      currency: 'USD',
    },
    releasedAt: '2025-04-17',
  },
  {
    id: 'google/gemini-2.0-flash-001',
    displayName: 'Gemini 2.0 Flash',
    description: 'Google Gemini 2.0 Flash 稳定版。',
    type: 'chat',
    contextWindowTokens: 1_048_576,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 0.1,
      output: 0.4,
      currency: 'USD',
    },
  },
  {
    id: 'google/gemini-flash-1.5',
    displayName: 'Gemini 1.5 Flash',
    description: 'Google Gemini 1.5 Flash。',
    type: 'chat',
    contextWindowTokens: 1_048_576,
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
  },
  {
    id: 'google/gemini-pro-1.5',
    displayName: 'Gemini 1.5 Pro',
    description: 'Google Gemini 1.5 Pro。',
    type: 'chat',
    contextWindowTokens: 2_097_152,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 2.5,
      output: 10,
      currency: 'USD',
    },
  },

  // =========================================================================
  // OpenAI Series
  // =========================================================================
  {
    id: 'openai/o3',
    displayName: 'OpenAI o3',
    description: 'OpenAI o3 推理模型，具有强大的推理能力。',
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
    id: 'openai/o3-mini',
    displayName: 'OpenAI o3 Mini',
    description: 'OpenAI o3 Mini 轻量版。',
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
    id: 'openai/o4-mini',
    displayName: 'OpenAI o4 Mini',
    description: 'OpenAI o4 Mini 模型。',
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
    releasedAt: '2025-04-16',
  },
  {
    id: 'openai/gpt-4.1',
    displayName: 'GPT-4.1',
    description: 'OpenAI GPT-4.1 模型。',
    type: 'chat',
    contextWindowTokens: 1_047_576,
    maxOutput: 32_768,
    enabled: true,
    abilities: {
      functionCall: true,
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
    id: 'openai/gpt-4.1-mini',
    displayName: 'GPT-4.1 Mini',
    description: 'OpenAI GPT-4.1 Mini 轻量版。',
    type: 'chat',
    contextWindowTokens: 1_047_576,
    maxOutput: 32_768,
    abilities: {
      functionCall: true,
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
    id: 'openai/gpt-4.1-nano',
    displayName: 'GPT-4.1 Nano',
    description: 'OpenAI GPT-4.1 Nano 超轻量版。',
    type: 'chat',
    contextWindowTokens: 1_047_576,
    maxOutput: 32_768,
    abilities: {
      functionCall: true,
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
    id: 'openai/gpt-4o',
    displayName: 'GPT-4o',
    description: 'OpenAI GPT-4o 多模态模型。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 2.5,
      output: 10,
      currency: 'USD',
    },
  },
  {
    id: 'openai/gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    description: 'OpenAI GPT-4o Mini 轻量版。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 16_384,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 0.15,
      output: 0.6,
      currency: 'USD',
    },
  },
  {
    id: 'openai/o1',
    displayName: 'OpenAI o1',
    description: 'OpenAI o1 推理模型。',
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
    id: 'openai/o1-mini',
    displayName: 'OpenAI o1 Mini',
    description: 'OpenAI o1 Mini 轻量版。',
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

  // =========================================================================
  // Anthropic Claude Series
  // =========================================================================
  {
    id: 'anthropic/claude-sonnet-4',
    displayName: 'Claude Sonnet 4',
    description: 'Anthropic Claude Sonnet 4 模型。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 64_000,
    enabled: true,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 3,
      output: 15,
      currency: 'USD',
    },
    releasedAt: '2025-05-22',
  },
  {
    id: 'anthropic/claude-opus-4',
    displayName: 'Claude Opus 4',
    description: 'Anthropic Claude Opus 4 最强大的模型。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 32_000,
    enabled: true,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 15,
      output: 75,
      currency: 'USD',
    },
    releasedAt: '2025-05-22',
  },
  {
    id: 'anthropic/claude-3.7-sonnet',
    displayName: 'Claude 3.7 Sonnet',
    description: 'Anthropic Claude 3.7 Sonnet 模型。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 128_000,
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    pricing: {
      input: 3,
      output: 15,
      currency: 'USD',
    },
    releasedAt: '2025-02-24',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    description: 'Anthropic Claude 3.5 Sonnet。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 3,
      output: 15,
      currency: 'USD',
    },
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    displayName: 'Claude 3.5 Haiku',
    description: 'Anthropic Claude 3.5 Haiku 轻量版。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 8_192,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 0.8,
      output: 4,
      currency: 'USD',
    },
  },
  {
    id: 'anthropic/claude-3-opus',
    displayName: 'Claude 3 Opus',
    description: 'Anthropic Claude 3 Opus。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 4_096,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 15,
      output: 75,
      currency: 'USD',
    },
  },

  // =========================================================================
  // Meta Llama Series
  // =========================================================================
  {
    id: 'meta-llama/llama-4-maverick',
    displayName: 'Llama 4 Maverick',
    description: 'Meta Llama 4 Maverick 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    enabled: true,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 0.22,
      output: 0.88,
      currency: 'USD',
    },
    releasedAt: '2025-04-05',
  },
  {
    id: 'meta-llama/llama-4-scout',
    displayName: 'Llama 4 Scout',
    description: 'Meta Llama 4 Scout 超长上下文模型。',
    type: 'chat',
    contextWindowTokens: 10_485_760,
    maxOutput: 131_072,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 0.15,
      output: 0.6,
      currency: 'USD',
    },
    releasedAt: '2025-04-05',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    displayName: 'Llama 3.3 70B Instruct',
    description: 'Meta Llama 3.3 70B 指令模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 0.12,
      output: 0.3,
      currency: 'USD',
    },
  },
  {
    id: 'meta-llama/llama-3.2-90b-vision-instruct',
    displayName: 'Llama 3.2 90B Vision',
    description: 'Meta Llama 3.2 90B 视觉模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 0.9,
      output: 0.9,
      currency: 'USD',
    },
  },
  {
    id: 'meta-llama/llama-3.1-405b-instruct',
    displayName: 'Llama 3.1 405B Instruct',
    description: 'Meta Llama 3.1 405B 最大模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    pricing: {
      input: 3,
      output: 3,
      currency: 'USD',
    },
  },

  // =========================================================================
  // Mistral Series
  // =========================================================================
  {
    id: 'mistralai/mistral-large-2411',
    displayName: 'Mistral Large 2411',
    description: 'Mistral Large 2411 版本。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    enabled: true,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 2,
      output: 6,
      currency: 'USD',
    },
  },
  {
    id: 'mistralai/mistral-medium-3',
    displayName: 'Mistral Medium 3',
    description: 'Mistral Medium 3 中等规模模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 0.4,
      output: 2,
      currency: 'USD',
    },
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct',
    displayName: 'Mistral Small 3.1 24B',
    description: 'Mistral Small 3.1 24B 指令模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 0.1,
      output: 0.3,
      currency: 'USD',
    },
  },
  {
    id: 'mistralai/codestral-2501',
    displayName: 'Codestral 2501',
    description: 'Mistral Codestral 2501 代码模型。',
    type: 'chat',
    contextWindowTokens: 262_144,
    maxOutput: 262_144,
    pricing: {
      input: 0.3,
      output: 0.9,
      currency: 'USD',
    },
  },
  {
    id: 'mistralai/magistral-medium-2506',
    displayName: 'Magistral Medium 2506',
    description: 'Mistral Magistral Medium 推理模型。',
    type: 'chat',
    contextWindowTokens: 40_000,
    maxOutput: 40_000,
    abilities: {
      reasoning: true,
    },
    pricing: {
      input: 2,
      output: 5,
      currency: 'USD',
    },
  },

  // =========================================================================
  // Cohere Series
  // =========================================================================
  {
    id: 'cohere/command-r-plus-08-2024',
    displayName: 'Command R+ 08-2024',
    description: 'Cohere Command R+ 08-2024 版本。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 4_096,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 2.5,
      output: 10,
      currency: 'USD',
    },
  },
  {
    id: 'cohere/command-r-08-2024',
    displayName: 'Command R 08-2024',
    description: 'Cohere Command R 08-2024 版本。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 4_096,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 0.15,
      output: 0.6,
      currency: 'USD',
    },
  },

  // =========================================================================
  // xAI Grok Series
  // =========================================================================
  {
    id: 'x-ai/grok-3-mini-beta',
    displayName: 'Grok 3 Mini Beta',
    description: 'xAI Grok 3 Mini Beta 版本。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    pricing: {
      input: 0.3,
      output: 0.5,
      currency: 'USD',
    },
    releasedAt: '2025-04-09',
  },
  {
    id: 'x-ai/grok-3-beta',
    displayName: 'Grok 3 Beta',
    description: 'xAI Grok 3 Beta 版本。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    pricing: {
      input: 3,
      output: 15,
      currency: 'USD',
    },
    releasedAt: '2025-02-18',
  },
  {
    id: 'x-ai/grok-2-vision-1212',
    displayName: 'Grok 2 Vision 1212',
    description: 'xAI Grok 2 Vision 视觉模型。',
    type: 'chat',
    contextWindowTokens: 32_768,
    maxOutput: 32_768,
    abilities: {
      functionCall: true,
      vision: true,
    },
    pricing: {
      input: 2,
      output: 10,
      currency: 'USD',
    },
  },
  {
    id: 'x-ai/grok-2-1212',
    displayName: 'Grok 2 1212',
    description: 'xAI Grok 2 1212 版本。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 2,
      output: 10,
      currency: 'USD',
    },
  },

  // =========================================================================
  // Google Gemma Series
  // =========================================================================
  {
    id: 'google/gemma-3-27b-it',
    displayName: 'Gemma 3 27B',
    description: 'Google Gemma 3 27B 指令模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 8_192,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 0.1,
      output: 0.2,
      currency: 'USD',
    },
  },
  {
    id: 'google/gemma-3-12b-it',
    displayName: 'Gemma 3 12B',
    description: 'Google Gemma 3 12B 指令模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 8_192,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 0.06,
      output: 0.15,
      currency: 'USD',
    },
  },
  {
    id: 'google/gemma-3-4b-it',
    displayName: 'Gemma 3 4B',
    description: 'Google Gemma 3 4B 轻量级模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 8_192,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 0.04,
      output: 0.06,
      currency: 'USD',
    },
  },

  // =========================================================================
  // Microsoft Phi Series
  // =========================================================================
  {
    id: 'microsoft/phi-4',
    displayName: 'Phi 4',
    description: 'Microsoft Phi 4 14B 模型。',
    type: 'chat',
    contextWindowTokens: 16_384,
    maxOutput: 16_384,
    pricing: {
      input: 0.07,
      output: 0.14,
      currency: 'USD',
    },
  },
  {
    id: 'microsoft/phi-4-multimodal-instruct',
    displayName: 'Phi 4 Multimodal',
    description: 'Microsoft Phi 4 多模态模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 4_096,
    abilities: {
      vision: true,
    },
    pricing: {
      input: 0.04,
      output: 0.1,
      currency: 'USD',
    },
  },

  // =========================================================================
  // Other Models
  // =========================================================================
  {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    displayName: 'Llama 3.1 Nemotron 70B',
    description: 'NVIDIA Nemotron 70B 基于 Llama 3.1 优化的模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    pricing: {
      input: 0.12,
      output: 0.3,
      currency: 'USD',
    },
  },
  {
    id: 'perplexity/sonar-pro',
    displayName: 'Sonar Pro',
    description: 'Perplexity Sonar Pro 搜索增强模型。',
    type: 'chat',
    contextWindowTokens: 200_000,
    maxOutput: 8_000,
    abilities: {
      search: true,
    },
    pricing: {
      input: 3,
      output: 15,
      currency: 'USD',
    },
  },
  {
    id: 'perplexity/sonar',
    displayName: 'Sonar',
    description: 'Perplexity Sonar 搜索增强模型。',
    type: 'chat',
    contextWindowTokens: 128_000,
    maxOutput: 8_000,
    abilities: {
      search: true,
    },
    pricing: {
      input: 1,
      output: 1,
      currency: 'USD',
    },
  },
  {
    id: 'nousresearch/hermes-3-llama-3.1-405b',
    displayName: 'Hermes 3 405B',
    description: 'NousResearch Hermes 3 405B 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    maxOutput: 131_072,
    abilities: {
      functionCall: true,
    },
    pricing: {
      input: 4,
      output: 4,
      currency: 'USD',
    },
  },
];

// ============================================================================
// Image Models
// ============================================================================

const openrouterImageModels: ImageModelCard[] = [
  {
    id: 'openai/gpt-image-1',
    displayName: 'GPT Image 1',
    description: 'OpenAI GPT Image 1 图像生成模型。',
    type: 'image',
    enabled: true,
    releasedAt: '2025-04-23',
  },
  {
    id: 'black-forest-labs/flux-1.1-pro',
    displayName: 'FLUX 1.1 Pro',
    description: 'Black Forest Labs FLUX 1.1 Pro 图像生成模型。',
    type: 'image',
    enabled: true,
  },
  {
    id: 'black-forest-labs/flux-pro',
    displayName: 'FLUX Pro',
    description: 'Black Forest Labs FLUX Pro 图像生成模型。',
    type: 'image',
  },
  {
    id: 'black-forest-labs/flux-schnell',
    displayName: 'FLUX Schnell',
    description: 'Black Forest Labs FLUX Schnell 快速图像生成。',
    type: 'image',
  },
  {
    id: 'stability-ai/stable-diffusion-3.5-large',
    displayName: 'Stable Diffusion 3.5 Large',
    description: 'Stability AI SD 3.5 Large 图像生成模型。',
    type: 'image',
  },
  {
    id: 'stability-ai/stable-diffusion-3.5-large-turbo',
    displayName: 'Stable Diffusion 3.5 Large Turbo',
    description: 'Stability AI SD 3.5 Large Turbo 快速版。',
    type: 'image',
  },
];

// ============================================================================
// Exports
// ============================================================================

export default {
  chat: openrouterChatModels,
  image: openrouterImageModels,
};
