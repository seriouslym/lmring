'use client';

import { motion } from 'framer-motion';
import * as React from 'react';
import { ArenaLayout } from '@/components/arena/arena-layout';
import { ComparisonControls } from '@/components/arena/comparison-controls';
import { ModelCard } from '@/components/arena/model-card';
import { type ModelOption, ModelSelector } from '@/components/arena/model-selector';
import { PromptInput } from '@/components/arena/prompt-input';

// Mock data for available models
const AVAILABLE_MODELS: ModelOption[] = [
  // OpenAI
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Most capable GPT-4 model',
    isPremium: true,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Advanced reasoning',
    isPremium: true,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and efficient',
  },

  // Anthropic
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most capable Claude model',
    isPremium: true,
    isNew: true,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance',
    isNew: true,
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fast and efficient',
    isNew: true,
  },

  // Google
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: "Google's flagship model",
  },
  { id: 'palm-2', name: 'PaLM 2', provider: 'Google', description: 'Multilingual model' },

  // Meta
  {
    id: 'llama-2-70b',
    name: 'Llama 2 70B',
    provider: 'Meta',
    description: 'Open source large model',
  },
  { id: 'llama-2-13b', name: 'Llama 2 13B', provider: 'Meta', description: 'Efficient open model' },

  // Mistral
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    description: 'Flagship model',
    isNew: true,
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Mistral',
    description: 'MoE architecture',
  },
];

interface ModelComparison {
  id: string;
  modelId: string;
  response: string;
  responseTime?: number;
  tokenCount?: number;
  isLoading: boolean;
}

export default function ArenaPage() {
  const [prompt, setPrompt] = React.useState('');
  const [comparisons, setComparisons] = React.useState<ModelComparison[]>([
    { id: '1', modelId: '', response: '', isLoading: false },
    { id: '2', modelId: '', response: '', isLoading: false },
  ]);

  const handleAddModel = () => {
    if (comparisons.length < 4) {
      setComparisons([
        ...comparisons,
        {
          id: Date.now().toString(),
          modelId: '',
          response: '',
          isLoading: false,
        },
      ]);
    }
  };

  const handleRemoveModel = (index: number) => {
    if (comparisons.length > 2) {
      setComparisons(comparisons.filter((_, i) => i !== index));
    }
  };

  const handleModelSelect = (comparisonId: string, modelId: string) => {
    setComparisons(
      comparisons.map((comp) => (comp.id === comparisonId ? { ...comp, modelId } : comp)),
    );
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    // Filter comparisons that have a model selected
    const activeComparisons = comparisons.filter((comp) => comp.modelId);

    if (activeComparisons.length === 0) {
      alert('Please select at least one model');
      return;
    }

    // Set all active comparisons to loading
    setComparisons(
      comparisons.map((comp) => (comp.modelId ? { ...comp, isLoading: true, response: '' } : comp)),
    );

    // Simulate API calls for each model
    activeComparisons.forEach((comp) => {
      setTimeout(
        () => {
          const mockResponse = `This is a mock response from ${
            AVAILABLE_MODELS.find((m) => m.id === comp.modelId)?.name || 'Unknown Model'
          } for the prompt: "${prompt}"

The response would include detailed information, analysis, and insights based on the model's capabilities. This is just a demonstration of the arena comparison feature.

Key points:
• Point 1: Detailed analysis
• Point 2: Specific insights
• Point 3: Actionable recommendations

The actual implementation would stream real responses from the AI models using the @lmring/ai package.`;

          setComparisons((prev) =>
            prev.map((c) =>
              c.id === comp.id
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
        },
        Math.random() * 3000 + 1000,
      ); // Random delay between 1-4 seconds
    });
  };

  const handleShuffleModels = () => {
    const shuffled = [...comparisons];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      if (temp && shuffled[j]) {
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
      }
    }
    setComparisons(shuffled);
  };

  const selectedModels = comparisons.filter((comp) => comp.modelId);

  return (
    <div className="flex flex-col h-full bg-background">
      <ArenaLayout>
        {comparisons.map((comparison, index) => (
          <motion.div
            key={comparison.id}
            layout
            className="flex flex-col gap-4 h-full min-w-[400px] lg:min-w-[500px]"
          >
            <ModelSelector
              models={AVAILABLE_MODELS}
              selectedModel={comparison.modelId}
              onModelSelect={(modelId) => handleModelSelect(comparison.id, modelId)}
              onRemove={() => handleRemoveModel(index)}
              showRemove={comparisons.length > 2}
              disabled={comparison.isLoading}
            />

            {comparison.modelId && (
              <div className="flex-1 overflow-hidden">
                <ModelCard
                  modelName={AVAILABLE_MODELS.find((m) => m.id === comparison.modelId)?.name || ''}
                  provider={AVAILABLE_MODELS.find((m) => m.id === comparison.modelId)?.provider}
                  response={comparison.response}
                  isLoading={comparison.isLoading}
                  responseTime={comparison.responseTime}
                  tokenCount={comparison.tokenCount}
                  index={index}
                />
              </div>
            )}
          </motion.div>
        ))}
      </ArenaLayout>

      {/* Bottom Controls */}
      <div className="border-t bg-background">
        <div className="p-4 space-y-4">
          <ComparisonControls
            modelCount={selectedModels.length}
            maxModels={4}
            minModels={1}
            onAddModel={handleAddModel}
            onRemoveModel={handleRemoveModel}
            onShuffleModels={handleShuffleModels}
            isLoading={comparisons.some((c) => c.isLoading)}
          />

          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleSubmit}
            isLoading={comparisons.some((c) => c.isLoading)}
            placeholder="Ask anything to compare model responses..."
          />
        </div>
      </div>
    </div>
  );
}
