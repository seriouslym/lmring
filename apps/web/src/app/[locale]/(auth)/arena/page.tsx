'use client';

import { motion } from 'framer-motion';
import * as React from 'react';
import { ModelCard } from '@/components/arena/model-card';
import { PromptInput } from '@/components/arena/prompt-input';
import type { ModelConfig, ModelOption } from '@/types/arena';

// Available models - sorted alphabetically by name
const AVAILABLE_MODELS: ModelOption[] = [
  // Anthropic
  {
    id: 'claude-opus-4.5',
    name: 'Claude Opus 4.5',
    provider: 'Anthropic',
    providerId: 'anthropic',
    description: 'Best model for coding, agents, and computer use',
    context: '200,000 tokens',
    inputPricing: '$5.00 / million tokens',
    outputPricing: '$25.00 / million tokens',
    type: 'pro' as const,
    isPremium: true,
    isNew: true,
    default: true,
  },
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    providerId: 'anthropic',
    description: 'Excellent for coding and computer use tasks',
    context: '200,000 tokens',
    inputPricing: '$3.00 / million tokens',
    outputPricing: '$15.00 / million tokens',
    type: 'pro' as const,
    isNew: true,
  },
  {
    id: 'claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    providerId: 'anthropic',
    description: 'Fast and cost-effective with near-frontier quality',
    context: '200,000 tokens',
    inputPricing: '$1.00 / million tokens',
    outputPricing: '$5.00 / million tokens',
    type: 'hobby' as const,
    isNew: true,
  },
  {
    id: 'claude-opus-4.1',
    name: 'Claude Opus 4.1',
    provider: 'Anthropic',
    providerId: 'anthropic',
    description: 'Focused on agentic tasks and reasoning',
    context: '200,000 tokens',
    inputPricing: '$15.00 / million tokens',
    outputPricing: '$75.00 / million tokens',
    type: 'pro' as const,
    isPremium: true,
  },

  // OpenAI
  {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    provider: 'OpenAI',
    providerId: 'openai',
    description: 'Latest flagship model from OpenAI',
    context: '128,000 tokens',
    inputPricing: '$5.00 / million tokens',
    outputPricing: '$15.00 / million tokens',
    type: 'pro' as const,
    isPremium: true,
    isNew: true,
  },
  {
    id: 'gpt-5.1-codex-max',
    name: 'GPT-5.1 Codex Max',
    provider: 'OpenAI',
    providerId: 'openai',
    description: 'Specialized coding model for autonomous work',
    context: '128,000 tokens',
    inputPricing: '$10.00 / million tokens',
    outputPricing: '$30.00 / million tokens',
    type: 'pro' as const,
    isPremium: true,
    isNew: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerId: 'openai',
    description: 'Multimodal model with vision and audio',
    context: '128,000 tokens',
    inputPricing: '$2.50 / million tokens',
    outputPricing: '$10.00 / million tokens',
    type: 'pro' as const,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    providerId: 'openai',
    description: 'Fast and affordable for everyday tasks',
    context: '128,000 tokens',
    inputPricing: '$0.15 / million tokens',
    outputPricing: '$0.60 / million tokens',
    type: 'hobby' as const,
  },
  {
    id: 'o1',
    name: 'o1',
    provider: 'OpenAI',
    providerId: 'openai',
    description: 'Advanced reasoning model for complex problems',
    context: '200,000 tokens',
    inputPricing: '$15.00 / million tokens',
    outputPricing: '$60.00 / million tokens',
    type: 'pro' as const,
    isPremium: true,
  },
  {
    id: 'o3-mini',
    name: 'o3 Mini',
    provider: 'OpenAI',
    providerId: 'openai',
    description: 'Efficient reasoning model with adjustable thinking',
    context: '200,000 tokens',
    inputPricing: '$1.10 / million tokens',
    outputPricing: '$4.40 / million tokens',
    type: 'pro' as const,
  },

  // Google
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro',
    provider: 'Google',
    providerId: 'google',
    description: 'Latest Gemini flagship with advanced capabilities',
    context: '2,000,000 tokens',
    inputPricing: '$1.50 / million tokens',
    outputPricing: '$6.00 / million tokens',
    type: 'pro' as const,
    isPremium: true,
    isNew: true,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    providerId: 'google',
    description: 'Fast multimodal model with native tool use',
    context: '1,000,000 tokens',
    inputPricing: '$0.075 / million tokens',
    outputPricing: '$0.30 / million tokens',
    type: 'hobby' as const,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    providerId: 'google',
    description: 'Powerful multimodal model with long context',
    context: '2,000,000 tokens',
    inputPricing: '$1.25 / million tokens',
    outputPricing: '$5.00 / million tokens',
    type: 'pro' as const,
  },

  // Meta
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    providerId: 'meta',
    description: 'Latest Llama with improved multilingual support',
    context: '128,000 tokens',
    inputPricing: '$0.50 / million tokens',
    outputPricing: '$0.75 / million tokens',
    type: 'hobby' as const,
  },
  {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    providerId: 'meta',
    description: 'Largest open model with frontier capabilities',
    context: '128,000 tokens',
    inputPricing: '$3.00 / million tokens',
    outputPricing: '$3.00 / million tokens',
    type: 'pro' as const,
    isPremium: true,
  },

  // Mistral
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'Mistral',
    providerId: 'mistral',
    description: 'Flagship model with 128K context and strong coding',
    context: '128,000 tokens',
    inputPricing: '$2.00 / million tokens',
    outputPricing: '$6.00 / million tokens',
    type: 'pro' as const,
  },
  {
    id: 'codestral',
    name: 'Codestral',
    provider: 'Mistral',
    providerId: 'mistral',
    description: 'Specialized model for code generation',
    context: '32,000 tokens',
    inputPricing: '$0.30 / million tokens',
    outputPricing: '$0.90 / million tokens',
    type: 'hobby' as const,
  },

  // DeepSeek
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    providerId: 'deepseek',
    description: 'Powerful open model rivaling frontier models',
    context: '64,000 tokens',
    inputPricing: '$0.27 / million tokens',
    outputPricing: '$1.10 / million tokens',
    type: 'pro' as const,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    providerId: 'deepseek',
    description: 'Reasoning model with transparent chain-of-thought',
    context: '64,000 tokens',
    inputPricing: '$0.55 / million tokens',
    outputPricing: '$2.19 / million tokens',
    type: 'pro' as const,
  },

  // xAI
  {
    id: 'grok-2',
    name: 'Grok 2',
    provider: 'xAI',
    providerId: 'xai',
    description: 'Frontier model with real-time knowledge',
    context: '128,000 tokens',
    inputPricing: '$2.00 / million tokens',
    outputPricing: '$10.00 / million tokens',
    type: 'pro' as const,
    isPremium: true,
  },

  // Qwen
  {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'Alibaba',
    providerId: 'qwen',
    description: 'Multilingual model with strong reasoning',
    context: '128,000 tokens',
    inputPricing: '$0.35 / million tokens',
    outputPricing: '$0.35 / million tokens',
    type: 'hobby' as const,
  },
].sort((a, b) => a.name.localeCompare(b.name));

const DEFAULT_CONFIG: ModelConfig = {
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

interface ModelComparison {
  id: string;
  modelId: string;
  response: string;
  responseTime?: number;
  tokenCount?: number;
  isLoading: boolean;
  synced: boolean;
  customPrompt: string;
  config: ModelConfig;
}

export default function ArenaPage() {
  const [globalPrompt, setGlobalPrompt] = React.useState('');

  // Get the default model ID
  const defaultModelId =
    AVAILABLE_MODELS.find((m) => m.default)?.id || AVAILABLE_MODELS[0]?.id || '';

  // Get the second default model ID (GPT-5.1)
  const secondDefaultModelId = 'gpt-5.1';

  const [comparisons, setComparisons] = React.useState<ModelComparison[]>([
    {
      id: '1',
      modelId: defaultModelId,
      response: '',
      isLoading: false,
      synced: true,
      customPrompt: '',
      config: { ...DEFAULT_CONFIG },
    },
    {
      id: '2',
      modelId: secondDefaultModelId,
      response: '',
      isLoading: false,
      synced: true,
      customPrompt: '',
      config: { ...DEFAULT_CONFIG },
    },
  ]);

  const timeoutRefs = React.useRef<Map<number, NodeJS.Timeout>>(new Map());

  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const handleAddModel = () => {
    if (comparisons.length < 4) {
      // Find a model that isn't already in use
      const usedModelIds = comparisons.map((c) => c.modelId);
      const availableModel = AVAILABLE_MODELS.find((m) => !usedModelIds.includes(m.id));
      const newModelId = availableModel?.id || AVAILABLE_MODELS[0]?.id || '';

      setComparisons([
        ...comparisons,
        {
          id: Date.now().toString(),
          modelId: newModelId,
          response: '',
          isLoading: false,
          synced: true,
          customPrompt: '',
          config: { ...DEFAULT_CONFIG },
        },
      ]);
    }
  };

  const handleModelSelect = (index: number, modelId: string) => {
    setComparisons(comparisons.map((comp, i) => (i === index ? { ...comp, modelId } : comp)));
  };

  const handleSyncToggle = (index: number, synced: boolean) => {
    setComparisons(comparisons.map((comp, i) => (i === index ? { ...comp, synced } : comp)));
  };

  const handleConfigChange = (index: number, config: ModelConfig) => {
    setComparisons(comparisons.map((comp, i) => (i === index ? { ...comp, config } : comp)));
  };

  const handleCustomPromptChange = (index: number, customPrompt: string) => {
    setComparisons(comparisons.map((comp, i) => (i === index ? { ...comp, customPrompt } : comp)));
  };

  const handleMoveLeft = (index: number) => {
    if (index > 0) {
      const newComparisons = [...comparisons];
      const temp = newComparisons[index];
      const prev = newComparisons[index - 1];
      if (temp && prev) {
        newComparisons[index] = prev;
        newComparisons[index - 1] = temp;
        setComparisons(newComparisons);
      }
    }
  };

  const handleMoveRight = (index: number) => {
    if (index < comparisons.length - 1) {
      const newComparisons = [...comparisons];
      const temp = newComparisons[index];
      const next = newComparisons[index + 1];
      if (temp && next) {
        newComparisons[index] = next;
        newComparisons[index + 1] = temp;
        setComparisons(newComparisons);
      }
    }
  };

  const handleClear = (index: number) => {
    setComparisons(
      comparisons.map((comp, i) =>
        i === index ? { ...comp, response: '', isLoading: false } : comp,
      ),
    );
  };

  const handleDelete = (index: number) => {
    if (comparisons.length > 1) {
      setComparisons(comparisons.filter((_, i) => i !== index));
    }
  };

  const handleRefresh = async (index: number) => {
    const comparison = comparisons[index];
    if (!comparison || !comparison.modelId) return;

    const promptToUse = comparison.synced ? globalPrompt : comparison.customPrompt;
    if (!promptToUse.trim()) return;

    // Set loading state
    setComparisons(
      comparisons.map((comp, i) =>
        i === index ? { ...comp, isLoading: true, response: '' } : comp,
      ),
    );

    // Simulate API call
    const timeoutId = setTimeout(
      () => {
        const model = AVAILABLE_MODELS.find((m) => m.id === comparison.modelId);
        const mockResponse = `This is a mock response from ${model?.name || 'Unknown Model'} for the prompt: "${promptToUse}"

The response would include detailed information, analysis, and insights based on the model's capabilities. This is just a demonstration of the arena comparison feature.

Key points:
• Point 1: Detailed analysis
• Point 2: Specific insights
• Point 3: Actionable recommendations

The actual implementation would stream real responses from the AI models using the @lmring/ai package.`;

        setComparisons((prev) =>
          prev.map((c, i) =>
            i === index
              ? {
                  ...c,
                  response: mockResponse,
                  isLoading: false,
                  responseTime: Math.floor(Math.random() * 2000) + 500,
                  tokenCount: Math.floor(Math.random() * 200) + 100,
                }
              : c,
          ),
        );
        timeoutRefs.current.delete(index);
      },
      Math.random() * 3000 + 1000,
    );
    timeoutRefs.current.set(index, timeoutId);
  };

  const handleSubmit = async () => {
    if (!globalPrompt.trim()) return;

    // Filter comparisons that have a model selected and are synced
    const activeComparisons = comparisons
      .map((comp, index) => ({ ...comp, index }))
      .filter((comp) => comp.modelId && comp.synced);

    if (activeComparisons.length === 0) {
      alert('Please select at least one model with sync enabled');
      return;
    }

    // Trigger refresh for all synced comparisons
    activeComparisons.forEach((comp) => {
      handleRefresh(comp.index);
    });
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Main Content Area - Grid Layout */}
      <div className="flex-1 overflow-hidden p-4">
        <div
          className="h-full gap-4"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${comparisons.length}, 1fr)`,
          }}
        >
          {comparisons.map((comparison, index) => (
            <motion.div key={comparison.id} layout className="h-full min-w-0">
              <ModelCard
                modelId={comparison.modelId}
                models={AVAILABLE_MODELS}
                response={comparison.response}
                isLoading={comparison.isLoading}
                responseTime={comparison.responseTime}
                tokenCount={comparison.tokenCount}
                synced={comparison.synced}
                customPrompt={comparison.customPrompt}
                config={comparison.config}
                index={index}
                canMoveLeft={index > 0}
                canMoveRight={index < comparisons.length - 1}
                onModelSelect={(modelId) => handleModelSelect(index, modelId)}
                onSyncToggle={(synced) => handleSyncToggle(index, synced)}
                onConfigChange={(config) => handleConfigChange(index, config)}
                onCustomPromptChange={(prompt) => handleCustomPromptChange(index, prompt)}
                onClear={() => handleClear(index)}
                onDelete={() => handleDelete(index)}
                onMoveLeft={() => handleMoveLeft(index)}
                onMoveRight={() => handleMoveRight(index)}
                onAddCard={
                  index === comparisons.length - 1 && comparisons.length < 4
                    ? handleAddModel
                    : undefined
                }
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t bg-background/95 backdrop-blur-sm flex-shrink-0">
        <div className="p-4 space-y-4">
          <PromptInput
            value={globalPrompt}
            onChange={setGlobalPrompt}
            onSubmit={handleSubmit}
            isLoading={comparisons.some((c) => c.isLoading)}
            placeholder="Ask anything to compare model responses..."
          />
        </div>
      </div>
    </div>
  );
}
