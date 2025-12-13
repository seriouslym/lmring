'use client';

import { Button, ResponseViewer, ScrollArea, toast } from '@lmring/ui';
import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { ModelCard } from '@/components/arena/model-card';
import {
  PromptInput,
  PromptInputActions,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/arena/prompt-input';
import { useProviderMetadata } from '@/hooks/use-provider-metadata';
import { useWorkflowExecution } from '@/hooks/use-workflow-execution';
import {
  arenaSelectors,
  settingsSelectors,
  useArenaStore,
  useSettingsStore,
  useWorkflowStore,
  workflowSelectors,
} from '@/stores';
import type { ModelOption } from '@/types/arena';

export default function ArenaPage() {
  const router = useRouter();
  const t = useTranslations('Arena');
  const providerMetadata = useProviderMetadata();

  const comparisons = useArenaStore(arenaSelectors.comparisons);
  const initialized = useArenaStore(arenaSelectors.initialized);
  const initializeComparisons = useArenaStore((state) => state.initializeComparisons);
  const addComparison = useArenaStore((state) => state.addComparison);
  const selectModel = useArenaStore((state) => state.selectModel);
  const toggleSync = useArenaStore((state) => state.toggleSync);
  const updateConfig = useArenaStore((state) => state.updateConfig);
  const setCustomPrompt = useArenaStore((state) => state.setCustomPrompt);
  const moveLeft = useArenaStore((state) => state.moveLeft);
  const moveRight = useArenaStore((state) => state.moveRight);
  const removeComparison = useArenaStore((state) => state.removeComparison);
  const availableModels = useArenaStore(arenaSelectors.availableModels);
  const setAvailableModels = useArenaStore((state) => state.setAvailableModels);

  const savedApiKeys = useSettingsStore(settingsSelectors.savedApiKeys);
  const loadApiKeys = useSettingsStore((state) => state.loadApiKeys);
  const apiKeysLoaded = useSettingsStore(settingsSelectors.apiKeysLoaded);

  const workflows = useWorkflowStore(workflowSelectors.workflows);
  const createWorkflow = useWorkflowStore((state) => state.createWorkflow);
  const deleteWorkflow = useWorkflowStore((state) => state.deleteWorkflow);
  const setWorkflowGlobalPrompt = useWorkflowStore((state) => state.setGlobalPrompt);
  const workflowGlobalPrompt = useWorkflowStore(workflowSelectors.globalPrompt);
  const isAnyRunning = useWorkflowStore(workflowSelectors.isAnyRunning);
  const toggleWorkflowSync = useWorkflowStore((state) => state.toggleWorkflowSync);
  const setWorkflowConfig = useWorkflowStore((state) => state.setWorkflowConfig);
  const setWorkflowCustomPrompt = useWorkflowStore((state) => state.setCustomPrompt);
  const clearWorkflowHistory = useWorkflowStore((state) => state.clearWorkflowHistory);

  const { startAllSyncedWorkflows, cancelAllWorkflows, regenerateLastResponse } =
    useWorkflowExecution();

  const comparisonWorkflowMap = React.useRef<Map<string, string>>(new Map());
  const [enabledModelsMap, setEnabledModelsMap] = React.useState<Map<string, Set<string>>>(
    new Map(),
  );
  const [enabledModelsLoaded, setEnabledModelsLoaded] = React.useState(false);
  const [customModelsMap, setCustomModelsMap] = React.useState<
    Map<string, Array<{ modelId: string; displayName: string }>>
  >(new Map());
  const [maximizedContent, setMaximizedContent] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!apiKeysLoaded) {
      loadApiKeys();
    }
  }, [apiKeysLoaded, loadApiKeys]);

  const hasConfiguredProviders = React.useMemo(() => {
    return savedApiKeys.some((k) => k.enabled);
  }, [savedApiKeys]);

  React.useEffect(() => {
    const fetchEnabledModels = async () => {
      if (!apiKeysLoaded) return;

      const enabledProviders = savedApiKeys.filter((k) => k.enabled && k.id);
      if (enabledProviders.length === 0) {
        setEnabledModelsLoaded(true);
        return;
      }

      const apiKeyIdToProviderName = new Map<string, string>();
      for (const provider of enabledProviders) {
        if (provider.id) {
          apiKeyIdToProviderName.set(provider.id, provider.providerName.toLowerCase());
        }
      }

      const newEnabledModelsMap = new Map<string, Set<string>>();
      const newCustomModelsMap = new Map<string, Array<{ modelId: string; displayName: string }>>();

      try {
        // Fetch all enabled models and custom models in parallel using batch APIs
        const [enabledResponse, customResponse] = await Promise.all([
          fetch('/api/settings/api-keys/all/enabled-models'),
          fetch('/api/settings/api-keys/all/custom-models'),
        ]);

        if (enabledResponse.ok) {
          const data = await enabledResponse.json();
          const modelsByApiKeyId = data.models || {};

          for (const [apiKeyId, models] of Object.entries(modelsByApiKeyId)) {
            const providerName = apiKeyIdToProviderName.get(apiKeyId);
            if (providerName) {
              const enabledModelIds = new Set<string>();
              for (const model of models as Array<{ modelId: string; enabled: boolean }>) {
                if (model.enabled) {
                  enabledModelIds.add(model.modelId);
                }
              }
              newEnabledModelsMap.set(providerName, enabledModelIds);
            }
          }
        }

        if (customResponse.ok) {
          const data = await customResponse.json();
          const modelsByApiKeyId = data.models || {};

          for (const [apiKeyId, models] of Object.entries(modelsByApiKeyId)) {
            const providerName = apiKeyIdToProviderName.get(apiKeyId);
            if (providerName) {
              const customModels = (models as Array<{ modelId: string; displayName?: string }>).map(
                (m) => ({
                  modelId: m.modelId,
                  displayName: m.displayName || m.modelId,
                }),
              );
              if (customModels.length > 0) {
                newCustomModelsMap.set(providerName, customModels);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }

      setEnabledModelsMap(newEnabledModelsMap);
      setCustomModelsMap(newCustomModelsMap);
      setEnabledModelsLoaded(true);
    };

    fetchEnabledModels();
  }, [apiKeysLoaded, savedApiKeys]);

  const filteredProviders = React.useMemo(() => {
    if (hasConfiguredProviders) {
      const configuredProviderIds = savedApiKeys
        .filter((k) => k.enabled)
        .map((k) => k.providerName.toLowerCase());
      return providerMetadata.filter((p) => configuredProviderIds.includes(p.id.toLowerCase()));
    }
    return providerMetadata;
  }, [savedApiKeys, providerMetadata, hasConfiguredProviders]);

  const computedModels = React.useMemo(() => {
    const models: ModelOption[] = [];
    const addedModelIds = new Set<string>();

    for (const provider of filteredProviders) {
      if (provider.models) {
        const providerEnabledModels = enabledModelsMap.get(provider.id.toLowerCase());

        for (const model of provider.models) {
          const shouldInclude =
            !hasConfiguredProviders ||
            !enabledModelsLoaded ||
            !providerEnabledModels ||
            providerEnabledModels.size === 0 ||
            providerEnabledModels.has(model.id);

          if (shouldInclude) {
            const modelId = `${provider.id}:${model.id}`;
            models.push({
              id: modelId,
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
              isCustom: false,
            });
            addedModelIds.add(modelId);
          }
        }
      }

      // Add custom models for this provider
      const providerCustomModels = customModelsMap.get(provider.id.toLowerCase());
      if (providerCustomModels) {
        for (const customModel of providerCustomModels) {
          const modelId = `${provider.id}:${customModel.modelId}`;
          if (!addedModelIds.has(modelId)) {
            models.push({
              id: modelId,
              name: customModel.displayName,
              provider: provider.name,
              providerId: provider.id,
              description: `${customModel.displayName} from ${provider.name}`,
              type: 'pro',
              isNew: false,
              isCustom: true,
            });
            addedModelIds.add(modelId);
          }
        }
      }
    }

    // Handle custom providers (created via "Add Provider" dialog)
    // These providers are not in ALL_PROVIDER_METADATA, so they won't appear in filteredProviders
    const customProviders = savedApiKeys.filter((k) => k.isCustom && k.enabled);
    for (const customProvider of customProviders) {
      const providerCustomModels = customModelsMap.get(customProvider.providerName.toLowerCase());
      if (providerCustomModels) {
        for (const customModel of providerCustomModels) {
          const modelId = `${customProvider.providerName}:${customModel.modelId}`;
          if (!addedModelIds.has(modelId)) {
            const iconProviderId = customProvider.providerType || customProvider.providerName;
            models.push({
              id: modelId,
              name: customModel.displayName,
              provider: customProvider.providerName,
              providerId: iconProviderId,
              description: `${customModel.displayName} (Custom Provider)`,
              type: 'pro',
              isNew: false,
              isCustom: true,
            });
            addedModelIds.add(modelId);
          }
        }
      }
    }

    return models;
  }, [
    filteredProviders,
    enabledModelsMap,
    customModelsMap,
    hasConfiguredProviders,
    enabledModelsLoaded,
    savedApiKeys,
  ]);

  React.useEffect(() => {
    if (computedModels.length > 0 && enabledModelsLoaded) {
      setAvailableModels(computedModels);
    }
  }, [computedModels, enabledModelsLoaded, setAvailableModels]);

  React.useEffect(() => {
    if (computedModels.length > 0 && !initialized) {
      initializeComparisons(computedModels);
    }
  }, [computedModels, initialized, initializeComparisons]);

  const displayModels = availableModels.length > 0 ? availableModels : computedModels;

  const getKeyIdForModel = React.useCallback(
    (modelId: string): string | undefined => {
      const providerId = modelId.split(':')[0] || '';
      if (!providerId) return undefined;
      const key = savedApiKeys.find(
        (k) => k.providerName.toLowerCase() === providerId.toLowerCase() && k.enabled,
      );
      return key?.id;
    },
    [savedApiKeys],
  );

  const getOrCreateWorkflow = React.useCallback(
    (comparisonId: string, modelId: string, synced: boolean): string | undefined => {
      const existingWorkflowId = comparisonWorkflowMap.current.get(comparisonId);
      if (existingWorkflowId) {
        const existingWorkflow = workflows.get(existingWorkflowId);
        if (existingWorkflow && existingWorkflow.modelId === modelId) {
          return existingWorkflowId;
        }
        deleteWorkflow(existingWorkflowId);
        comparisonWorkflowMap.current.delete(comparisonId);
      }

      const keyId = getKeyIdForModel(modelId);
      if (!keyId) {
        return undefined;
      }

      const workflowId = createWorkflow(modelId, keyId, synced);
      comparisonWorkflowMap.current.set(comparisonId, workflowId);
      return workflowId;
    },
    [workflows, deleteWorkflow, createWorkflow, getKeyIdForModel],
  );

  const getWorkflowForComparison = React.useCallback(
    (comparisonId: string) => {
      const workflowId = comparisonWorkflowMap.current.get(comparisonId);
      if (!workflowId) return undefined;
      return workflows.get(workflowId);
    },
    [workflows],
  );

  const handleSubmit = React.useCallback(async () => {
    if (!workflowGlobalPrompt.trim()) return;

    if (!hasConfiguredProviders) {
      toast.warning(t('configure_api_keys_title'), {
        description: t('configure_api_keys_description'),
        action: {
          label: t('go_to_settings'),
          onClick: () => router.push('/settings?tab=provider'),
        },
      });
      return;
    }

    const syncedComparisons = comparisons.filter((comp) => comp.synced);

    // Check if all synced cards have a model selected
    const missingModelCards = syncedComparisons.filter((comp) => !comp.modelId);
    if (missingModelCards.length > 0) {
      toast.warning(t('select_model_for_all_cards_title'), {
        description: t('select_model_for_all_cards_description'),
      });
      return;
    }

    if (syncedComparisons.length === 0) {
      toast.warning(t('select_model_title'), {
        description: t('select_model_description'),
      });
      return;
    }

    const missingKeys: string[] = [];
    for (const comp of syncedComparisons) {
      const workflowId = getOrCreateWorkflow(comp.id, comp.modelId, comp.synced);
      if (!workflowId) {
        const providerId = comp.modelId.split(':')[0] || 'unknown';
        if (!missingKeys.includes(providerId)) {
          missingKeys.push(providerId);
        }
      }
    }

    if (missingKeys.length > 0) {
      toast.error(t('missing_api_key_title'), {
        description: t('missing_api_key_description', { providers: missingKeys.join(', ') }),
        action: {
          label: t('go_to_settings'),
          onClick: () => router.push('/settings?tab=provider'),
        },
      });
      return;
    }

    await startAllSyncedWorkflows();
    setWorkflowGlobalPrompt('');
  }, [
    workflowGlobalPrompt,
    comparisons,
    getOrCreateWorkflow,
    startAllSyncedWorkflows,
    hasConfiguredProviders,
    router,
    t,
    setWorkflowGlobalPrompt,
  ]);

  const handleModelSelect = React.useCallback(
    (index: number, modelId: string) => {
      selectModel(index, modelId);

      const comparison = comparisons[index];
      if (comparison) {
        getOrCreateWorkflow(comparison.id, modelId, comparison.synced);
      }
    },
    [selectModel, comparisons, getOrCreateWorkflow],
  );

  const handleSyncToggle = React.useCallback(
    (index: number, synced: boolean) => {
      toggleSync(index, synced);

      const comparison = comparisons[index];
      if (comparison) {
        const workflowId = comparisonWorkflowMap.current.get(comparison.id);
        if (workflowId) {
          toggleWorkflowSync(workflowId, synced);
        }
      }
    },
    [toggleSync, comparisons, toggleWorkflowSync],
  );

  const handleConfigChange = React.useCallback(
    (index: number, config: Parameters<typeof updateConfig>[1]) => {
      updateConfig(index, config);

      const comparison = comparisons[index];
      if (comparison) {
        const workflowId = comparisonWorkflowMap.current.get(comparison.id);
        if (workflowId) {
          setWorkflowConfig(workflowId, config);
        }
      }
    },
    [updateConfig, comparisons, setWorkflowConfig],
  );

  const handleCustomPromptChange = React.useCallback(
    (index: number, prompt: string) => {
      setCustomPrompt(index, prompt);

      const comparison = comparisons[index];
      if (comparison) {
        const workflowId = comparisonWorkflowMap.current.get(comparison.id);
        if (workflowId) {
          setWorkflowCustomPrompt(workflowId, prompt);
        }
      }
    },
    [setCustomPrompt, comparisons, setWorkflowCustomPrompt],
  );

  const handleClear = React.useCallback(
    (index: number) => {
      const comparison = comparisons[index];
      if (comparison) {
        const workflowId = comparisonWorkflowMap.current.get(comparison.id);
        if (workflowId) {
          clearWorkflowHistory(workflowId);
        }
      }
    },
    [comparisons, clearWorkflowHistory],
  );

  const handleDelete = React.useCallback(
    (index: number) => {
      const comparison = comparisons[index];
      if (comparison) {
        const workflowId = comparisonWorkflowMap.current.get(comparison.id);
        if (workflowId) {
          deleteWorkflow(workflowId);
          comparisonWorkflowMap.current.delete(comparison.id);
        }
      }
      removeComparison(index);
    },
    [comparisons, deleteWorkflow, removeComparison],
  );

  const handleRetry = React.useCallback(
    (comparisonId: string, _messageId: string) => {
      const workflowId = comparisonWorkflowMap.current.get(comparisonId);
      if (workflowId) {
        regenerateLastResponse(workflowId);
      }
    },
    [regenerateLastResponse],
  );

  const handleMaximize = React.useCallback((content: string) => {
    setMaximizedContent(content);
  }, []);

  React.useEffect(() => {
    return () => {
      cancelAllWorkflows();
    };
  }, [cancelAllWorkflows]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-muted-foreground">{t('loading_models')}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex-1 overflow-hidden p-4">
        <div
          className="h-full gap-4 overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${comparisons.length}, 1fr)`,
            gridTemplateRows: '1fr',
          }}
        >
          {comparisons.map((comparison, index) => {
            const workflow = getWorkflowForComparison(comparison.id);
            const lastAssistantMessage = workflow?.messages
              .filter((m) => m.role === 'assistant')
              .pop();
            const response =
              workflow?.pendingResponse?.content || lastAssistantMessage?.content || '';
            const isLoading = workflow?.status === 'running';

            return (
              <motion.div
                key={comparison.id}
                layout
                className="h-full min-h-0 min-w-0 overflow-hidden"
              >
                <ModelCard
                  modelId={comparison.modelId}
                  models={displayModels}
                  messages={workflow?.messages}
                  pendingResponse={workflow?.pendingResponse}
                  response={response}
                  isLoading={isLoading}
                  status={workflow?.status}
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
                  onMoveLeft={() => moveLeft(index)}
                  onMoveRight={() => moveRight(index)}
                  onAddCard={
                    index === comparisons.length - 1 && comparisons.length < 4
                      ? addComparison
                      : undefined
                  }
                  onThumbsUp={() => {}}
                  onThumbsDown={() => {}}
                  onRetry={(messageId) => handleRetry(comparison.id, messageId)}
                  onMaximize={handleMaximize}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="border-t bg-background/95 backdrop-blur-sm flex-shrink-0">
        <div className="p-4 space-y-4">
          <PromptInput
            value={workflowGlobalPrompt}
            onChange={setWorkflowGlobalPrompt}
            onSubmit={handleSubmit}
            onStop={cancelAllWorkflows}
            isLoading={isAnyRunning}
            className="border-input"
          >
            <PromptInputTextarea placeholder={t('prompt_placeholder')} />
            <PromptInputFooter>
              <PromptInputActions />
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>

      {maximizedContent && (
        <div className="fixed inset-0 z-20 bg-background flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-end p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <Button variant="ghost" size="icon" onClick={() => setMaximizedContent(null)}>
              <XIcon className="size-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto p-8 pb-20">
              <ResponseViewer content={maximizedContent} isStreaming={false} />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
