'use client';

import { motion } from 'framer-motion';
import * as React from 'react';
import { ModelCard } from '@/components/arena/model-card';
import { PromptInput } from '@/components/arena/prompt-input';
import { useProviderMetadata } from '@/hooks/use-provider-metadata';
import { arenaSelectors, useArenaStore } from '@/stores/arena-store';
import type { ModelOption } from '@/types/arena';

export default function ArenaPage() {
  const providerMetadata = useProviderMetadata();

  // Zustand store selectors
  const comparisons = useArenaStore(arenaSelectors.comparisons);
  const globalPrompt = useArenaStore(arenaSelectors.globalPrompt);
  const initialized = useArenaStore(arenaSelectors.initialized);
  const isAnyLoading = useArenaStore(arenaSelectors.isAnyLoading);

  // Zustand store actions
  const setGlobalPrompt = useArenaStore((state) => state.setGlobalPrompt);
  const initializeComparisons = useArenaStore((state) => state.initializeComparisons);
  const addComparison = useArenaStore((state) => state.addComparison);
  const selectModel = useArenaStore((state) => state.selectModel);
  const toggleSync = useArenaStore((state) => state.toggleSync);
  const updateConfig = useArenaStore((state) => state.updateConfig);
  const setCustomPrompt = useArenaStore((state) => state.setCustomPrompt);
  const moveLeft = useArenaStore((state) => state.moveLeft);
  const moveRight = useArenaStore((state) => state.moveRight);
  const clearComparison = useArenaStore((state) => state.clearComparison);
  const removeComparison = useArenaStore((state) => state.removeComparison);
  const setLoading = useArenaStore((state) => state.setLoading);
  const setResponse = useArenaStore((state) => state.setResponse);
  const availableModels = useArenaStore(arenaSelectors.availableModels);

  // Compute available models from provider metadata
  const computedModels = React.useMemo(() => {
    const models: ModelOption[] = [];

    for (const provider of providerMetadata) {
      if (provider.models) {
        for (const model of provider.models) {
          models.push({
            id: `${provider.id}:${model.id}`,
            name: model.displayName || model.id,
            provider: provider.name,
            providerId: provider.id,
            description:
              provider.description || `${model.displayName || model.id} from ${provider.name}`,
            context: model.contextWindowTokens
              ? `${model.contextWindowTokens.toLocaleString()} tokens`
              : undefined,
            inputPricing: model.pricing?.input
              ? `$${model.pricing.input} / million tokens`
              : undefined,
            outputPricing: model.pricing?.output
              ? `$${model.pricing.output} / million tokens`
              : undefined,
            type: 'pro',
            isNew: false,
          });
        }
      }
    }

    return models;
  }, [providerMetadata]);

  // Initialize comparisons when models are available
  React.useEffect(() => {
    if (computedModels.length > 0 && !initialized) {
      initializeComparisons(computedModels);
    }
  }, [computedModels, initialized, initializeComparisons]);

  // Use computed models if store models are not yet available
  const displayModels = availableModels.length > 0 ? availableModels : computedModels;

  // Timeout refs for mock responses
  const timeoutRefs = React.useRef<Map<number, NodeJS.Timeout>>(new Map());

  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const handleRefresh = React.useCallback(
    async (index: number) => {
      const comparison = comparisons[index];
      if (!comparison || !comparison.modelId) return;

      const promptToUse = comparison.synced ? globalPrompt : comparison.customPrompt;
      if (!promptToUse.trim()) return;

      setLoading(index, true);

      const timeoutId = setTimeout(
        () => {
          const model = displayModels.find((m) => m.id === comparison.modelId);
          const mockResponse = `This is a mock response from ${model?.name || 'Unknown Model'} for the prompt: "${promptToUse}"

The response would include detailed information, analysis, and insights based on the model's capabilities. This is just a demonstration of the arena comparison feature.

Key points:
• Point 1: Detailed analysis
• Point 2: Specific insights
• Point 3: Actionable recommendations

The actual implementation would stream real responses from the AI models using the @lmring/ai package.`;

          setResponse(
            index,
            mockResponse,
            Math.floor(Math.random() * 2000) + 500,
            Math.floor(Math.random() * 200) + 100,
          );
          timeoutRefs.current.delete(index);
        },
        Math.random() * 3000 + 1000,
      );
      timeoutRefs.current.set(index, timeoutId);
    },
    [comparisons, globalPrompt, displayModels, setLoading, setResponse],
  );

  const handleSubmit = React.useCallback(async () => {
    if (!globalPrompt.trim()) return;

    const activeComparisons = comparisons
      .map((comp, index) => ({ ...comp, index }))
      .filter((comp) => comp.modelId && comp.synced);

    if (activeComparisons.length === 0) {
      alert('Please select at least one model with sync enabled');
      return;
    }

    for (const comp of activeComparisons) {
      handleRefresh(comp.index);
    }
  }, [globalPrompt, comparisons, handleRefresh]);

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
                models={displayModels}
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
                onModelSelect={(modelId) => selectModel(index, modelId)}
                onSyncToggle={(synced) => toggleSync(index, synced)}
                onConfigChange={(config) => updateConfig(index, config)}
                onCustomPromptChange={(prompt) => setCustomPrompt(index, prompt)}
                onClear={() => clearComparison(index)}
                onDelete={() => removeComparison(index)}
                onMoveLeft={() => moveLeft(index)}
                onMoveRight={() => moveRight(index)}
                onAddCard={
                  index === comparisons.length - 1 && comparisons.length < 4
                    ? addComparison
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
            isLoading={isAnyLoading}
            placeholder="Ask anything to compare model responses..."
          />
        </div>
      </div>
    </div>
  );
}
