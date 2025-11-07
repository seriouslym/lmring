import type { ProviderConfig } from '../../types/provider';

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
        contextLength: 32768,
        maxOutputTokens: 8192,
      },
      {
        id: 'Qwen/Qwen2.5-72B-Instruct',
        name: 'Qwen2.5 72B Instruct',
        contextLength: 32768,
        maxOutputTokens: 8192,
      },
      {
        id: 'deepseek-ai/DeepSeek-V2.5',
        name: 'DeepSeek V2.5',
        contextLength: 65536,
        maxOutputTokens: 8192,
      },
      {
        id: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        name: 'Llama 3.1 70B',
        contextLength: 131072,
        maxOutputTokens: 8192,
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
        contextLength: 8192,
        maxOutputTokens: 2048,
      },
      {
        id: 'qwen-plus',
        name: 'Qwen Plus',
        contextLength: 32768,
        maxOutputTokens: 8192,
      },
      {
        id: 'qwen-max',
        name: 'Qwen Max',
        contextLength: 32768,
        maxOutputTokens: 8192,
      },
      {
        id: 'qwen-vl-max',
        name: 'Qwen VL Max',
        contextLength: 32768,
        maxOutputTokens: 8192,
      },
    ],
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI',
    type: 'compatible',
    compatibleConfig: {
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
      alternativeBaseURL: 'https://open.bigmodel.cn/api/anthropic', // Anthropic format
    },
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'glm-4-plus',
        name: 'GLM-4 Plus',
        contextLength: 131072,
        maxOutputTokens: 8192,
        supportedFormats: ['openai', 'anthropic'],
      },
      {
        id: 'glm-4-0520',
        name: 'GLM-4 0520',
        contextLength: 131072,
        maxOutputTokens: 8192,
        supportedFormats: ['openai', 'anthropic'],
      },
      {
        id: 'glm-4-flash',
        name: 'GLM-4 Flash',
        contextLength: 131072,
        maxOutputTokens: 4096,
        supportedFormats: ['openai', 'anthropic'],
      },
    ],
  },
  {
    id: 'baichuan',
    name: 'Baichuan AI',
    type: 'compatible',
    compatibleConfig: {
      baseURL: 'https://api.baichuan-ai.com/v1',
    },
    supportsStreaming: true,
    supportsStructuredOutput: true,
    models: [
      {
        id: 'Baichuan4',
        name: 'Baichuan 4',
        contextLength: 32768,
        maxOutputTokens: 4096,
      },
      {
        id: 'Baichuan3-Turbo',
        name: 'Baichuan 3 Turbo',
        contextLength: 32768,
        maxOutputTokens: 4096,
      },
      {
        id: 'Baichuan2-Turbo',
        name: 'Baichuan 2 Turbo',
        contextLength: 32768,
        maxOutputTokens: 4096,
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
    models: [
      {
        id: 'moonshot-v1-8k',
        name: 'Moonshot V1 8K',
        contextLength: 8192,
        maxOutputTokens: 4096,
      },
      {
        id: 'moonshot-v1-32k',
        name: 'Moonshot V1 32K',
        contextLength: 32768,
        maxOutputTokens: 4096,
      },
      {
        id: 'moonshot-v1-128k',
        name: 'Moonshot V1 128K',
        contextLength: 131072,
        maxOutputTokens: 4096,
      },
    ],
  },
  {
    id: 'yi',
    name: '01.AI (Yi)',
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
        contextLength: 32768,
        maxOutputTokens: 4096,
      },
      {
        id: 'yi-medium',
        name: 'Yi Medium',
        contextLength: 16384,
        maxOutputTokens: 4096,
      },
      {
        id: 'yi-spark',
        name: 'Yi Spark',
        contextLength: 16384,
        maxOutputTokens: 4096,
      },
      {
        id: 'yi-large-turbo',
        name: 'Yi Large Turbo',
        contextLength: 16384,
        maxOutputTokens: 4096,
      },
      {
        id: 'yi-vision',
        name: 'Yi Vision',
        contextLength: 16384,
        maxOutputTokens: 4096,
      },
    ],
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    type: 'compatible',
    compatibleConfig: {
      baseURL: 'https://api.minimax.chat/v1',
      alternativeBaseURL: 'https://api.minimax.chat/v1/anthropic', // Anthropic format
    },
    supportsStreaming: true,
    supportsStructuredOutput: true,
    models: [
      {
        id: 'abab6.5s-chat',
        name: 'ABAB 6.5s Chat',
        contextLength: 245760,
        maxOutputTokens: 8192,
        supportedFormats: ['openai', 'anthropic'],
      },
      {
        id: 'abab6.5t-chat',
        name: 'ABAB 6.5t Chat',
        contextLength: 8192,
        maxOutputTokens: 4096,
        supportedFormats: ['openai', 'anthropic'],
      },
      {
        id: 'abab6.5g-chat',
        name: 'ABAB 6.5g Chat',
        contextLength: 8192,
        maxOutputTokens: 4096,
        supportedFormats: ['openai', 'anthropic'],
      },
    ],
  },
  {
    id: 'step',
    name: 'StepFun',
    type: 'compatible',
    compatibleConfig: {
      baseURL: 'https://api.stepfun.com/v1',
    },
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsVision: true,
    models: [
      {
        id: 'step-1v-32k',
        name: 'Step 1V 32K',
        contextLength: 32768,
        maxOutputTokens: 8192,
      },
      {
        id: 'step-1-32k',
        name: 'Step 1 32K',
        contextLength: 32768,
        maxOutputTokens: 8192,
      },
      {
        id: 'step-1-128k',
        name: 'Step 1 128K',
        contextLength: 128000,
        maxOutputTokens: 8192,
      },
      {
        id: 'step-2-16k',
        name: 'Step 2 16K',
        contextLength: 16384,
        maxOutputTokens: 8192,
      },
    ],
  },
];
