import type { ChatModelCard, EmbeddingModelCard } from '../types';

// ============================================================================
// Chat Models - Local Inference
// ============================================================================

const ollamaChatModels: ChatModelCard[] = [
  // =========================================================================
  // DeepSeek Series
  // =========================================================================
  {
    id: 'deepseek-v3.1:latest',
    displayName: 'DeepSeek V3.1',
    description:
      'DeepSeek V3.1 模型为混合推理架构模型，同时支持思考模式与非思考模式。本次升级针对通用推理、前端开发与中文写作场景进行了专项优化。',
    type: 'chat',
    contextWindowTokens: 163_840,
    enabled: true,
    abilities: {
      reasoning: true,
    },
  },
  {
    id: 'deepseek-r1:671b',
    displayName: 'DeepSeek R1 671B',
    description:
      'DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，在仅有极少标注数据的情况下，极大提升了模型推理能力，尤其在数学、代码、自然语言推理等任务上。',
    type: 'chat',
    contextWindowTokens: 131_072,
    enabled: true,
    abilities: {
      reasoning: true,
    },
  },
  {
    id: 'deepseek-r1:70b',
    displayName: 'DeepSeek R1 70B',
    description: 'DeepSeek-R1 70B 模型，适合在本地运行的中大型推理模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      reasoning: true,
    },
  },
  {
    id: 'deepseek-r1:32b',
    displayName: 'DeepSeek R1 32B',
    description: 'DeepSeek-R1 32B 模型，平衡性能和资源消耗的推理模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      reasoning: true,
    },
  },
  {
    id: 'deepseek-r1:14b',
    displayName: 'DeepSeek R1 14B',
    description: 'DeepSeek-R1 14B 模型，适合在消费级硬件上运行。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      reasoning: true,
    },
  },
  {
    id: 'deepseek-r1:8b',
    displayName: 'DeepSeek R1 8B',
    description: 'DeepSeek-R1 8B 轻量级模型，适合资源受限环境。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      reasoning: true,
    },
  },
  {
    id: 'deepseek-r1:7b',
    displayName: 'DeepSeek R1 7B',
    description: 'DeepSeek-R1 7B 轻量级模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      reasoning: true,
    },
  },
  {
    id: 'deepseek-r1:1.5b',
    displayName: 'DeepSeek R1 1.5B',
    description: 'DeepSeek-R1 1.5B 超轻量级模型，可在低配设备上运行。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      reasoning: true,
    },
  },
  {
    id: 'deepseek-v3:latest',
    displayName: 'DeepSeek V3',
    description:
      'DeepSeek-V3 为自研 MoE 模型，671B 参数，激活 37B，在长文本、代码、数学、百科、中文能力上表现优秀。',
    type: 'chat',
    contextWindowTokens: 65_536,
  },
  {
    id: 'deepseek-v2.5:latest',
    displayName: 'DeepSeek V2.5',
    description: 'DeepSeek V2.5 模型，结合了 V2 Chat 和 Coder 的优势。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },
  {
    id: 'deepseek-coder-v2:latest',
    displayName: 'DeepSeek Coder V2',
    description: 'DeepSeek Coder V2 专注于代码生成和理解。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },

  // =========================================================================
  // GPT-OSS Series
  // =========================================================================
  {
    id: 'gpt-oss:120b',
    displayName: 'GPT OSS 120B',
    description: 'GPT OSS 120B 开源模型，具有强大的通用能力。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      reasoning: true,
    },
  },
  {
    id: 'gpt-oss:20b',
    displayName: 'GPT OSS 20B',
    description: 'GPT OSS 20B 开源模型，平衡性能和效率。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      reasoning: true,
    },
  },

  // =========================================================================
  // Qwen Series
  // =========================================================================
  {
    id: 'qwen3:235b-a22b',
    displayName: 'Qwen3 235B A22B',
    description: 'Qwen3 最大规模的 MoE 模型，具有顶级的推理和生成能力。',
    type: 'chat',
    contextWindowTokens: 131_072,
    enabled: true,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
  },
  {
    id: 'qwen3:72b',
    displayName: 'Qwen3 72B',
    description: 'Qwen3 72B 大规模模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
  },
  {
    id: 'qwen3:32b',
    displayName: 'Qwen3 32B',
    description: 'Qwen3 32B 模型，性能与资源消耗的良好平衡。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
  },
  {
    id: 'qwen3:14b',
    displayName: 'Qwen3 14B',
    description: 'Qwen3 14B 中型模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
  },
  {
    id: 'qwen3:8b',
    displayName: 'Qwen3 8B',
    description: 'Qwen3 8B 轻量级模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
  },
  {
    id: 'qwen3:4b',
    displayName: 'Qwen3 4B',
    description: 'Qwen3 4B 超轻量级模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
  },
  {
    id: 'qwen3:1.7b',
    displayName: 'Qwen3 1.7B',
    description: 'Qwen3 1.7B 最小模型，适合嵌入式设备。',
    type: 'chat',
    contextWindowTokens: 32_768,
    abilities: {
      functionCall: true,
      reasoning: true,
    },
  },
  {
    id: 'qwen2.5:72b',
    displayName: 'Qwen2.5 72B',
    description: 'Qwen2.5 72B 大规模模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
    },
  },
  {
    id: 'qwen2.5:32b',
    displayName: 'Qwen2.5 32B',
    description: 'Qwen2.5 32B 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
    },
  },
  {
    id: 'qwen2.5:14b',
    displayName: 'Qwen2.5 14B',
    description: 'Qwen2.5 14B 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
    },
  },
  {
    id: 'qwen2.5:7b',
    displayName: 'Qwen2.5 7B',
    description: 'Qwen2.5 7B 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
    },
  },
  {
    id: 'qwen2.5-coder:32b',
    displayName: 'Qwen2.5 Coder 32B',
    description: 'Qwen2.5 Coder 32B 代码专用模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },
  {
    id: 'qwen2.5-coder:14b',
    displayName: 'Qwen2.5 Coder 14B',
    description: 'Qwen2.5 Coder 14B 代码专用模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },
  {
    id: 'qwen2.5-coder:7b',
    displayName: 'Qwen2.5 Coder 7B',
    description: 'Qwen2.5 Coder 7B 代码专用模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },

  // =========================================================================
  // Llama Series
  // =========================================================================
  {
    id: 'llama4:maverick',
    displayName: 'Llama 4 Maverick',
    description: 'Meta Llama 4 Maverick 模型，具有先进的推理能力。',
    type: 'chat',
    contextWindowTokens: 131_072,
    enabled: true,
    abilities: {
      functionCall: true,
      vision: true,
    },
  },
  {
    id: 'llama4:scout',
    displayName: 'Llama 4 Scout',
    description: 'Meta Llama 4 Scout 模型，支持超长上下文。',
    type: 'chat',
    contextWindowTokens: 10_485_760,
    abilities: {
      functionCall: true,
      vision: true,
    },
  },
  {
    id: 'llama3.3:70b',
    displayName: 'Llama 3.3 70B',
    description: 'Meta Llama 3.3 70B 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
    },
  },
  {
    id: 'llama3.2:90b',
    displayName: 'Llama 3.2 90B',
    description: 'Meta Llama 3.2 90B 视觉模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      vision: true,
    },
  },
  {
    id: 'llama3.2:11b',
    displayName: 'Llama 3.2 11B',
    description: 'Meta Llama 3.2 11B 视觉模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      vision: true,
    },
  },
  {
    id: 'llama3.2:3b',
    displayName: 'Llama 3.2 3B',
    description: 'Meta Llama 3.2 3B 轻量级模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },
  {
    id: 'llama3.2:1b',
    displayName: 'Llama 3.2 1B',
    description: 'Meta Llama 3.2 1B 超轻量级模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },
  {
    id: 'llama3.1:405b',
    displayName: 'Llama 3.1 405B',
    description: 'Meta Llama 3.1 405B 最大模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },
  {
    id: 'llama3.1:70b',
    displayName: 'Llama 3.1 70B',
    description: 'Meta Llama 3.1 70B 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },
  {
    id: 'llama3.1:8b',
    displayName: 'Llama 3.1 8B',
    description: 'Meta Llama 3.1 8B 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },

  // =========================================================================
  // Gemma Series
  // =========================================================================
  {
    id: 'gemma3:27b',
    displayName: 'Gemma 3 27B',
    description: 'Google Gemma 3 27B 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    enabled: true,
    abilities: {
      vision: true,
    },
  },
  {
    id: 'gemma3:12b',
    displayName: 'Gemma 3 12B',
    description: 'Google Gemma 3 12B 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      vision: true,
    },
  },
  {
    id: 'gemma3:4b',
    displayName: 'Gemma 3 4B',
    description: 'Google Gemma 3 4B 轻量级模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      vision: true,
    },
  },
  {
    id: 'gemma3:1b',
    displayName: 'Gemma 3 1B',
    description: 'Google Gemma 3 1B 超轻量级模型。',
    type: 'chat',
    contextWindowTokens: 32_768,
  },
  {
    id: 'gemma2:27b',
    displayName: 'Gemma 2 27B',
    description: 'Google Gemma 2 27B 模型。',
    type: 'chat',
    contextWindowTokens: 8_192,
  },
  {
    id: 'gemma2:9b',
    displayName: 'Gemma 2 9B',
    description: 'Google Gemma 2 9B 模型。',
    type: 'chat',
    contextWindowTokens: 8_192,
  },
  {
    id: 'gemma2:2b',
    displayName: 'Gemma 2 2B',
    description: 'Google Gemma 2 2B 轻量级模型。',
    type: 'chat',
    contextWindowTokens: 8_192,
  },

  // =========================================================================
  // Mistral Series
  // =========================================================================
  {
    id: 'mistral-large:latest',
    displayName: 'Mistral Large',
    description: 'Mistral Large 模型，具有强大的推理能力。',
    type: 'chat',
    contextWindowTokens: 131_072,
    enabled: true,
    abilities: {
      functionCall: true,
    },
  },
  {
    id: 'mistral-nemo:latest',
    displayName: 'Mistral Nemo',
    description: 'Mistral Nemo 模型，12B 参数。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
    },
  },
  {
    id: 'mistral:latest',
    displayName: 'Mistral 7B',
    description: 'Mistral 7B 基础模型。',
    type: 'chat',
    contextWindowTokens: 32_768,
  },
  {
    id: 'mixtral:8x7b',
    displayName: 'Mixtral 8x7B',
    description: 'Mixtral 8x7B MoE 模型。',
    type: 'chat',
    contextWindowTokens: 32_768,
  },
  {
    id: 'mixtral:8x22b',
    displayName: 'Mixtral 8x22B',
    description: 'Mixtral 8x22B 大规模 MoE 模型。',
    type: 'chat',
    contextWindowTokens: 65_536,
  },
  {
    id: 'codestral:latest',
    displayName: 'Codestral',
    description: 'Codestral 代码专用模型。',
    type: 'chat',
    contextWindowTokens: 32_768,
  },

  // =========================================================================
  // Phi Series (Microsoft)
  // =========================================================================
  {
    id: 'phi4:latest',
    displayName: 'Phi 4',
    description: 'Microsoft Phi 4 模型，14B 参数。',
    type: 'chat',
    contextWindowTokens: 16_384,
    enabled: true,
  },
  {
    id: 'phi3.5:latest',
    displayName: 'Phi 3.5',
    description: 'Microsoft Phi 3.5 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },
  {
    id: 'phi3:latest',
    displayName: 'Phi 3',
    description: 'Microsoft Phi 3 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
  },

  // =========================================================================
  // Other Models
  // =========================================================================
  {
    id: 'command-r-plus:latest',
    displayName: 'Command R+',
    description: 'Cohere Command R+ 模型，专为 RAG 优化。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
    },
  },
  {
    id: 'command-r:latest',
    displayName: 'Command R',
    description: 'Cohere Command R 模型。',
    type: 'chat',
    contextWindowTokens: 131_072,
    abilities: {
      functionCall: true,
    },
  },
  {
    id: 'yi:34b',
    displayName: 'Yi 34B',
    description: '01.AI Yi 34B 模型。',
    type: 'chat',
    contextWindowTokens: 4_096,
  },
  {
    id: 'yi:9b',
    displayName: 'Yi 9B',
    description: '01.AI Yi 9B 模型。',
    type: 'chat',
    contextWindowTokens: 4_096,
  },
  {
    id: 'yi:6b',
    displayName: 'Yi 6B',
    description: '01.AI Yi 6B 模型。',
    type: 'chat',
    contextWindowTokens: 4_096,
  },
  {
    id: 'starcoder2:15b',
    displayName: 'StarCoder2 15B',
    description: 'BigCode StarCoder2 15B 代码模型。',
    type: 'chat',
    contextWindowTokens: 16_384,
  },
  {
    id: 'starcoder2:7b',
    displayName: 'StarCoder2 7B',
    description: 'BigCode StarCoder2 7B 代码模型。',
    type: 'chat',
    contextWindowTokens: 16_384,
  },
  {
    id: 'starcoder2:3b',
    displayName: 'StarCoder2 3B',
    description: 'BigCode StarCoder2 3B 代码模型。',
    type: 'chat',
    contextWindowTokens: 16_384,
  },
  {
    id: 'codegemma:7b',
    displayName: 'CodeGemma 7B',
    description: 'Google CodeGemma 7B 代码模型。',
    type: 'chat',
    contextWindowTokens: 8_192,
  },
  {
    id: 'codegemma:2b',
    displayName: 'CodeGemma 2B',
    description: 'Google CodeGemma 2B 代码模型。',
    type: 'chat',
    contextWindowTokens: 8_192,
  },
  {
    id: 'llava:latest',
    displayName: 'LLaVA',
    description: 'LLaVA 视觉语言模型。',
    type: 'chat',
    contextWindowTokens: 4_096,
    abilities: {
      vision: true,
    },
  },
  {
    id: 'llava-llama3:latest',
    displayName: 'LLaVA Llama 3',
    description: 'LLaVA 基于 Llama 3 的视觉语言模型。',
    type: 'chat',
    contextWindowTokens: 8_192,
    abilities: {
      vision: true,
    },
  },
  {
    id: 'moondream:latest',
    displayName: 'Moondream',
    description: 'Moondream 轻量级视觉语言模型。',
    type: 'chat',
    contextWindowTokens: 2_048,
    abilities: {
      vision: true,
    },
  },
];

// ============================================================================
// Embedding Models
// ============================================================================

const ollamaEmbeddingModels: EmbeddingModelCard[] = [
  {
    id: 'nomic-embed-text:latest',
    displayName: 'Nomic Embed Text',
    description: 'Nomic Embed Text 文本嵌入模型。',
    type: 'embedding',
    maxDimension: 768,
    enabled: true,
  },
  {
    id: 'mxbai-embed-large:latest',
    displayName: 'MxBai Embed Large',
    description: 'MxBai Embed Large 高维度嵌入模型。',
    type: 'embedding',
    maxDimension: 1024,
    enabled: true,
  },
  {
    id: 'all-minilm:latest',
    displayName: 'All MiniLM',
    description: 'All MiniLM 轻量级嵌入模型。',
    type: 'embedding',
    maxDimension: 384,
  },
  {
    id: 'snowflake-arctic-embed:latest',
    displayName: 'Snowflake Arctic Embed',
    description: 'Snowflake Arctic Embed 嵌入模型。',
    type: 'embedding',
    maxDimension: 1024,
  },
];

// ============================================================================
// Exports
// ============================================================================

export default {
  chat: ollamaChatModels,
  embedding: ollamaEmbeddingModels,
};
