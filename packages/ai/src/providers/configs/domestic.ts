import { createDeepSeek } from '@ai-sdk/deepseek';
import type { ProviderConfig } from '../../types';

/**
 * Domestic Provider Configurations (Tier 1)
 *
 * These are the mainstream Chinese AI service providers with highest priority
 */
export const DOMESTIC_PROVIDERS: ProviderConfig[] = [
  {
    id: 'silicon',
    name: 'SiliconFlow',
    type: 'compatible',
    compatibleConfig: {
      baseURL: 'https://api.siliconflow.cn/v1',
    },
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'Qwen/Qwen2.5-7B-Instruct',
        name: 'Qwen2.5 7B Instruct',
        contextWindow: 32768,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 0.35,
          outputPerMillion: 0.35,
        },
      },
      {
        id: 'Qwen/Qwen2.5-72B-Instruct',
        name: 'Qwen2.5 72B Instruct',
        contextWindow: 32768,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 3.5,
          outputPerMillion: 3.5,
        },
      },
      {
        id: 'deepseek-ai/DeepSeek-V2.5',
        name: 'DeepSeek V2.5',
        contextWindow: 65536,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 1.0,
          outputPerMillion: 2.0,
        },
      },
      {
        id: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        name: 'Llama 3.1 70B',
        contextWindow: 131072,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 4.13,
          outputPerMillion: 4.13,
        },
      },
    ],
  },
  {
    id: 'dashscope',
    name: 'Alibaba Cloud Dashscope',
    type: 'compatible',
    compatibleConfig: {
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    },
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'qwen-turbo',
        name: 'Qwen Turbo',
        contextWindow: 8192,
        maxOutputTokens: 2048,
        pricing: {
          inputPerMillion: 2.0,
          outputPerMillion: 6.0,
        },
      },
      {
        id: 'qwen-plus',
        name: 'Qwen Plus',
        contextWindow: 32768,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 4.0,
          outputPerMillion: 12.0,
        },
      },
      {
        id: 'qwen-max',
        name: 'Qwen Max',
        contextWindow: 32768,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 40.0,
          outputPerMillion: 120.0,
        },
      },
      {
        id: 'qwen-vl-max',
        name: 'Qwen VL Max (视觉)',
        contextWindow: 32768,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 20.0,
          outputPerMillion: 20.0,
        },
      },
    ],
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI',
    type: 'compatible',
    compatibleConfig: {
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
      anthropicApiHost: 'https://open.bigmodel.cn/api/anthropic',
    },
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'glm-4-plus',
        name: 'GLM-4 Plus',
        contextWindow: 131072,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 50.0,
          outputPerMillion: 50.0,
        },
      },
      {
        id: 'glm-4-0520',
        name: 'GLM-4 0520',
        contextWindow: 131072,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 100.0,
          outputPerMillion: 100.0,
        },
      },
      {
        id: 'glm-4-flash',
        name: 'GLM-4 Flash',
        contextWindow: 131072,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 0.1,
          outputPerMillion: 0.1,
        },
      },
      {
        id: 'glm-4v',
        name: 'GLM-4V (视觉)',
        contextWindow: 8192,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 50.0,
          outputPerMillion: 50.0,
        },
      },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'official',
    creator: createDeepSeek,
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: false,
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        contextWindow: 65536,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 1.0,
          outputPerMillion: 2.0,
        },
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        contextWindow: 65536,
        maxOutputTokens: 8192,
        pricing: {
          inputPerMillion: 1.0,
          outputPerMillion: 2.0,
        },
      },
    ],
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI',
    type: 'compatible',
    compatibleConfig: {
      baseURL: 'https://api.moonshot.cn/v1',
    },
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: false,
    models: [
      {
        id: 'moonshot-v1-8k',
        name: 'Moonshot V1 8K',
        contextWindow: 8192,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 12.0,
          outputPerMillion: 12.0,
        },
      },
      {
        id: 'moonshot-v1-32k',
        name: 'Moonshot V1 32K',
        contextWindow: 32768,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 24.0,
          outputPerMillion: 24.0,
        },
      },
      {
        id: 'moonshot-v1-128k',
        name: 'Moonshot V1 128K',
        contextWindow: 131072,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 60.0,
          outputPerMillion: 60.0,
        },
      },
    ],
  },
  {
    id: 'yi',
    name: '01.AI',
    type: 'compatible',
    compatibleConfig: {
      baseURL: 'https://api.lingyiwanwu.com/v1',
    },
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'yi-large',
        name: 'Yi Large',
        contextWindow: 32768,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 20.0,
          outputPerMillion: 20.0,
        },
      },
      {
        id: 'yi-medium',
        name: 'Yi Medium',
        contextWindow: 16384,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 2.5,
          outputPerMillion: 2.5,
        },
      },
      {
        id: 'yi-vision',
        name: 'Yi Vision',
        contextWindow: 16384,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 6.0,
          outputPerMillion: 6.0,
        },
      },
      {
        id: 'yi-spark',
        name: 'Yi Spark',
        contextWindow: 16384,
        maxOutputTokens: 4096,
        pricing: {
          inputPerMillion: 1.0,
          outputPerMillion: 1.0,
        },
      },
    ],
  },
  {
    id: 'modelscope',
    name: 'ModelScope',
    type: 'compatible',
    compatibleConfig: {
      baseURL: 'https://api.modelscope.cn/v1',
    },
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: false,
    models: [
      {
        id: 'qwen-turbo',
        name: 'Qwen Turbo',
        contextWindow: 8192,
        maxOutputTokens: 2048,
      },
      {
        id: 'qwen-plus',
        name: 'Qwen Plus',
        contextWindow: 32768,
        maxOutputTokens: 8192,
      },
      {
        id: 'qwen-max',
        name: 'Qwen Max',
        contextWindow: 32768,
        maxOutputTokens: 8192,
      },
    ],
  },
];
