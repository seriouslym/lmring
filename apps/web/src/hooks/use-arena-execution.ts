import type { ModelConfig, ModelOption } from '@/types/arena';
import { executeComparison } from '@/utils/arena-execution';

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
  error?: string;
}

export function useArenaExecution(
  comparisons: ModelComparison[],
  setComparisons: React.Dispatch<React.SetStateAction<ModelComparison[]>>,
  apiKeys: Map<string, string>,
  availableModels: ModelOption[],
) {
  const handleSubmit = async (globalPrompt: string) => {
    if (!globalPrompt.trim()) {
      return;
    }

    const activeIndices = comparisons
      .map((comp, index) => (comp.modelId && comp.synced ? index : -1))
      .filter((index) => index >= 0);

    if (activeIndices.length === 0) {
      alert('Please select at least one model with sync enabled');
      return;
    }

    await executeComparison(
      comparisons,
      globalPrompt,
      activeIndices,
      apiKeys,
      availableModels,
      (index, update) => {
        setComparisons((prev) =>
          prev.map((comp, i) => (i === index ? { ...comp, ...update } : comp)),
        );
      },
    );
  };

  return { handleSubmit };
}
