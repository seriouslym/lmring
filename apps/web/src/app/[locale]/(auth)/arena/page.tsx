'use client';

import { motion } from 'framer-motion';
import * as React from 'react';
import { ModelCard, type ModelConfig, type ModelOption } from '@/components/arena/model-card';
import { PromptInput } from '@/components/arena/prompt-input';

// Mock data for available models - enhanced with v0 style data
const AVAILABLE_MODELS: ModelOption[] = [
  // OpenAI
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Most capable GPT-4 model with superior performance on complex tasks',
    icon: '🤖',
    context: '128,000 tokens',
    inputPricing: '$10.00 / million tokens',
    outputPricing: '$30.00 / million tokens',
    badge: 'Pro',
    isPremium: true,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Advanced reasoning and broad knowledge for complex problem solving',
    icon: '🤖',
    context: '8,000 tokens',
    inputPricing: '$30.00 / million tokens',
    outputPricing: '$60.00 / million tokens',
    badge: 'Pro',
    isPremium: true,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and efficient model for everyday tasks',
    icon: '🤖',
    context: '16,000 tokens',
    inputPricing: '$0.50 / million tokens',
    outputPricing: '$1.50 / million tokens',
    badge: 'Hobby',
  },

  // Anthropic
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most capable Claude model with top-tier performance',
    icon: '🔷',
    context: '200,000 tokens',
    inputPricing: '$15.00 / million tokens',
    outputPricing: '$75.00 / million tokens',
    badge: 'Pro',
    isPremium: true,
    isNew: true,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed for most use cases',
    icon: '🔷',
    context: '200,000 tokens',
    inputPricing: '$3.00 / million tokens',
    outputPricing: '$15.00 / million tokens',
    badge: 'Pro',
    isNew: true,
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fast and cost-effective for simple tasks',
    icon: '🔷',
    context: '200,000 tokens',
    inputPricing: '$0.25 / million tokens',
    outputPricing: '$1.25 / million tokens',
    badge: 'Hobby',
    isNew: true,
  },

  // Google
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: "Google's flagship model for text and multimodal tasks",
    icon: '💎',
    context: '32,000 tokens',
    inputPricing: '$0.50 / million tokens',
    outputPricing: '$1.50 / million tokens',
    badge: 'Pro',
  },
  {
    id: 'palm-2',
    name: 'PaLM 2',
    provider: 'Google',
    description: 'Multilingual model with strong reasoning capabilities',
    icon: '💎',
    context: '8,000 tokens',
    inputPricing: '$0.25 / million tokens',
    outputPricing: '$0.75 / million tokens',
    badge: 'Hobby',
  },

  // Meta
  {
    id: 'llama-2-70b',
    name: 'Llama 2 70B',
    provider: 'Meta',
    description: 'Open source large model with strong performance',
    icon: '🦙',
    context: '4,000 tokens',
    inputPricing: '$0.70 / million tokens',
    outputPricing: '$0.90 / million tokens',
    badge: 'Hobby',
  },
  {
    id: 'llama-2-13b',
    name: 'Llama 2 13B',
    provider: 'Meta',
    description: 'Efficient open model for fast responses',
    icon: '🦙',
    context: '4,000 tokens',
    inputPricing: '$0.25 / million tokens',
    outputPricing: '$0.30 / million tokens',
    badge: 'Hobby',
  },

  // Mistral
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    description: 'Flagship model with strong multilingual capabilities',
    icon: '⚡',
    context: '32,000 tokens',
    inputPricing: '$4.00 / million tokens',
    outputPricing: '$12.00 / million tokens',
    badge: 'Pro',
    isNew: true,
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Mistral',
    description: 'Mixture of Experts architecture for efficiency',
    icon: '⚡',
    context: '32,000 tokens',
    inputPricing: '$0.70 / million tokens',
    outputPricing: '$0.70 / million tokens',
    badge: 'Hobby',
  },
];

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
  const [comparisons, setComparisons] = React.useState<ModelComparison[]>([
    {
      id: '1',
      modelId: '',
      response: '',
      isLoading: false,
      synced: true,
      customPrompt: '',
      config: { ...DEFAULT_CONFIG },
    },
    {
      id: '2',
      modelId: '',
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
      setComparisons([
        ...comparisons,
        {
          id: Date.now().toString(),
          modelId: '',
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
