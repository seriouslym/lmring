import { type ModelConfig as ApiModelConfig, streamCompare } from '@/libs/arena-api';
import type { ModelConfig, ModelOption } from '@/types/arena';

interface ComparisonResult {
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

export async function executeComparison(
  comparisons: ComparisonResult[],
  globalPrompt: string,
  activeIndices: number[],
  apiKeys: Map<string, string>,
  availableModels: ModelOption[],
  onProgress: (index: number, update: Partial<ComparisonResult>) => void,
): Promise<void> {
  const activeComparisons = activeIndices
    .map((index) => {
      const comparison = comparisons[index];
      if (!comparison) return null;
      return {
        index,
        comparison,
      };
    })
    .filter((item): item is { index: number; comparison: ComparisonResult } => item !== null);

  const modelConfigs: ApiModelConfig[] = [];
  const indexMap = new Map<string, number>();

  for (const { index, comparison } of activeComparisons) {
    const model = availableModels.find((m) => m.id === comparison.modelId);
    if (!model) continue;

    const apiKey = apiKeys.get(model.providerId);
    if (!apiKey) {
      onProgress(index, {
        isLoading: false,
        error: `Missing API key for ${model.provider}`,
      });
      continue;
    }

    modelConfigs.push({
      providerId: model.providerId,
      modelId: model.id,
      apiKey,
      options: {
        temperature: comparison.config.temperature,
        maxTokens: comparison.config.maxTokens,
        topP: comparison.config.topP,
      },
    });

    indexMap.set(`${model.providerId}/${model.id}`, index);
  }

  if (modelConfigs.length === 0) {
    return;
  }

  const responseBuffers = new Map<number, string>();
  const startTimes = new Map<number, number>();

  activeIndices.forEach((index) => {
    responseBuffers.set(index, '');
    startTimes.set(index, Date.now());
    onProgress(index, {
      isLoading: true,
      response: '',
      error: undefined,
    });
  });

  try {
    const prompt = activeComparisons[0]?.comparison.synced
      ? globalPrompt
      : activeComparisons[0]?.comparison.customPrompt || '';

    for await (const event of streamCompare(modelConfigs, [
      {
        role: 'user',
        content: prompt,
      },
    ])) {
      const key = event.provider && event.model ? `${event.provider}/${event.model}` : undefined;
      const index = key ? indexMap.get(key) : undefined;

      if (index === undefined) continue;

      if (event.type === 'chunk' && event.chunk) {
        const currentBuffer = responseBuffers.get(index) || '';
        const newBuffer = currentBuffer + event.chunk;
        responseBuffers.set(index, newBuffer);

        onProgress(index, {
          response: newBuffer,
        });
      } else if (event.type === 'complete') {
        const startTime = startTimes.get(index);
        const responseTime = startTime ? Date.now() - startTime : undefined;

        onProgress(index, {
          isLoading: false,
          responseTime,
          tokenCount: event.metrics?.totalTokens,
          error: event.error,
        });
      } else if (event.type === 'error') {
        onProgress(index, {
          isLoading: false,
          error: event.error || 'Unknown error occurred',
        });
      }
    }
  } catch (error) {
    activeIndices.forEach((index) => {
      onProgress(index, {
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to execute comparison',
      });
    });
  }
}
