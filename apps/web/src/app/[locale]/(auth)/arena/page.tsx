'use client';

import { motion } from 'framer-motion';
import * as React from 'react';
import { ModelCard } from '@/components/arena/model-card';
import { PromptInput } from '@/components/arena/prompt-input';
import { useProviderMetadata } from '@/hooks/use-provider-metadata';
import type { ModelConfig, ModelOption } from '@/types/arena';

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
  const providerMetadata = useProviderMetadata();
  const [globalPrompt, setGlobalPrompt] = React.useState('');

  const availableModels = React.useMemo(() => {
    const models: ModelOption[] = [];

    for (const provider of providerMetadata) {
      if (provider.models) {
        for (const model of provider.models) {
          models.push({
            id: model.id,
            name: model.name,
            provider: provider.name,
            providerId: provider.id,
            description: provider.description || `${model.name} from ${provider.name}`,
            context: model.contextLength
              ? `${model.contextLength.toLocaleString()} tokens`
              : undefined,
            inputPricing: model.inputPricePerMillion
              ? `$${model.inputPricePerMillion} / million tokens`
              : undefined,
            outputPricing: model.outputPricePerMillion
              ? `$${model.outputPricePerMillion} / million tokens`
              : undefined,
            type: 'pro',
            isNew: false,
          });
        }
      }
    }

    return models;
  }, [providerMetadata]);

  const [comparisons, setComparisons] = React.useState<ModelComparison[]>([]);
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (availableModels.length > 0 && !initialized) {
      const defaultModelId = availableModels[0]?.id || '';
      const secondDefaultModelId =
        availableModels.find((m) => m.id === 'gpt-5.1')?.id ||
        availableModels.find((m) => m.id !== defaultModelId)?.id ||
        defaultModelId;

      setComparisons([
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
      setInitialized(true);
    }
  }, [availableModels, initialized]);

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
      const usedModelIds = comparisons.map((c) => c.modelId);
      const availableModel = availableModels.find((m) => !usedModelIds.includes(m.id));
      const newModelId = availableModel?.id || availableModels[0]?.id || '';

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

    setComparisons(
      comparisons.map((comp, i) =>
        i === index ? { ...comp, isLoading: true, response: '' } : comp,
      ),
    );

    const timeoutId = setTimeout(
      () => {
        const model = availableModels.find((m) => m.id === comparison.modelId);
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

    const activeComparisons = comparisons
      .map((comp, index) => ({ ...comp, index }))
      .filter((comp) => comp.modelId && comp.synced);

    if (activeComparisons.length === 0) {
      alert('Please select at least one model with sync enabled');
      return;
    }

    activeComparisons.forEach((comp) => {
      handleRefresh(comp.index);
    });
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-muted-foreground">Loading models...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
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
                models={availableModels}
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
