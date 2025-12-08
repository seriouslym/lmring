import type { AiModelType, DefaultModelListItem, ModelAbilities } from '@lmring/model-depot';
import { getEndpointConfig, getModelsForProvider } from '@lmring/model-depot';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  cn,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@lmring/ui';
import {
  AlertCircleIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  Loader2Icon,
  LockIcon,
  MessageSquareIcon,
  MicIcon,
  RadioIcon,
  RotateCwIcon,
  SearchIcon,
  Trash2Icon,
  VolumeIcon,
  WrenchIcon,
  ZapIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AddModelDialog } from './AddModelDialog';
import type { ConnectionCheckResponse, Provider, SaveApiKeyResponse } from './types';

const MODEL_TYPE_CONFIG: Record<
  AiModelType,
  { label: string; icon: React.ElementType; color: string }
> = {
  chat: { label: 'Chat', icon: MessageSquareIcon, color: 'text-blue-500' },
  embedding: { label: 'Embedding', icon: ZapIcon, color: 'text-purple-500' },
  image: { label: 'Image', icon: ImageIcon, color: 'text-green-500' },
  tts: { label: 'TTS', icon: VolumeIcon, color: 'text-orange-500' },
  stt: { label: 'STT', icon: MicIcon, color: 'text-pink-500' },
  realtime: { label: 'Realtime', icon: RadioIcon, color: 'text-red-500' },
};

interface ProviderDetailProps {
  provider: Provider;
  onToggle: (id: string, enabled: boolean, apiKeyId?: string) => void;
  onSave?: (providerId: string, apiKeyId: string) => void;
}

type CheckStatus = 'idle' | 'checking' | 'success' | 'error';

export function ProviderDetail({ provider, onToggle, onSave }: ProviderDetailProps) {
  const [apiKey, setApiKey] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [checkStatus, setCheckStatus] = useState<CheckStatus>('idle');
  const [checkError, setCheckError] = useState<string>('');
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const [isFetchingKey, setIsFetchingKey] = useState(false);
  const [fetchedApiKey, setFetchedApiKey] = useState<string | null>(null);

  const [modelEnabledStates, setModelEnabledStates] = useState<Record<string, boolean>>({});
  const [customModels, setCustomModels] = useState<DefaultModelListItem[]>([]);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  const hasExistingApiKey = Boolean(provider.apiKeyId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: provider.id is intentionally included to reset form when provider changes
  useEffect(() => {
    if (provider.apiKey) {
      setApiKey(provider.apiKey);
    } else if (provider.apiKeyId) {
      setApiKey('');
    } else {
      setApiKey('');
    }
    if (provider.proxyUrl) {
      setProxyUrl(provider.proxyUrl);
    } else {
      setProxyUrl('');
    }
    setCheckStatus('idle');
    setCheckError('');
    setResponseTime(null);
    setFetchedApiKey(null);
    setShowKey(false);
  }, [provider.id, provider.apiKey, provider.proxyUrl, provider.apiKeyId]);

  useEffect(() => {
    const fetchModelStates = async () => {
      if (!provider.apiKeyId) {
        setModelEnabledStates({});
        return;
      }

      try {
        // Use dedicated enabled-models endpoint that returns raw database records
        // This ensures model IDs match exactly what was saved, regardless of provider API differences
        const response = await fetch(`/api/settings/api-keys/${provider.apiKeyId}/enabled-models`);
        if (response.ok) {
          const data = await response.json();
          const statesMap: Record<string, boolean> = {};
          for (const model of data.models || []) {
            statesMap[model.modelId] = model.enabled;
          }
          setModelEnabledStates(statesMap);
        }
      } catch (error) {
        console.error('Failed to fetch model states:', error);
      }
    };

    fetchModelStates();
  }, [provider.apiKeyId]);

  // Fetch custom models from database
  useEffect(() => {
    const fetchCustomModels = async () => {
      if (!provider.apiKeyId) {
        setCustomModels([]);
        return;
      }

      try {
        const response = await fetch(`/api/settings/api-keys/${provider.apiKeyId}/custom-models`);
        if (response.ok) {
          const data = await response.json();
          const models = (data.models || []).map(
            (m: { modelId: string; displayName?: string }) => ({
              id: m.modelId,
              displayName: m.displayName || m.modelId,
              type: 'chat' as const,
              abilities: {},
              providerId: provider.id.toLowerCase(),
              source: 'custom' as const,
            }),
          );
          setCustomModels(models);
        }
      } catch (error) {
        console.error('Failed to fetch custom models:', error);
      }
    };

    fetchCustomModels();
  }, [provider.apiKeyId, provider.id]);

  const models = useMemo(() => {
    const staticModels = getModelsForProvider(provider.id.toLowerCase());
    const staticIds = new Set(staticModels.map((m) => m.id));

    const dbCustomModels = Object.keys(modelEnabledStates)
      .filter((id) => !staticIds.has(id))
      .map((id) => ({
        id,
        displayName: id,
        type: 'chat' as const,
        abilities: {},
      }));

    const mergedCustomModelsMap = new Map();

    for (const model of dbCustomModels) {
      mergedCustomModelsMap.set(model.id, model);
    }

    for (const model of customModels) {
      mergedCustomModelsMap.set(model.id, {
        ...model,
      });
    }

    return [...staticModels, ...mergedCustomModelsMap.values()] as typeof staticModels;
  }, [provider.id, modelEnabledStates, customModels]);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;
    return models.filter(
      (model) =>
        model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.displayName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [models, searchQuery]);

  const modelsByType = useMemo(() => {
    const grouped: Partial<Record<AiModelType, typeof filteredModels>> = {};
    for (const model of filteredModels) {
      const type = model.type || 'chat';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(model);
    }
    return grouped;
  }, [filteredModels]);

  const sortedModelTypes = useMemo(() => {
    const typeOrder: AiModelType[] = ['chat', 'image', 'embedding', 'tts', 'stt', 'realtime'];
    return typeOrder.filter((type) => modelsByType[type] && modelsByType[type].length > 0);
  }, [modelsByType]);

  const defaultUrl = useMemo(() => {
    const endpoint = getEndpointConfig(provider.id.toLowerCase());
    return endpoint?.baseURL || '';
  }, [provider.id]);

  const handleSave = useCallback(async () => {
    if (!apiKey.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerName: provider.id.toLowerCase(),
          apiKey: apiKey.trim(),
          proxyUrl: proxyUrl.trim() || undefined,
          enabled: provider.connected,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save API key');
      }

      const result: SaveApiKeyResponse = await response.json();

      onSave?.(provider.id, result.id);

      toast.success('Saved', {
        description: 'API key configuration saved successfully',
      });
    } catch (error) {
      toast.error('Save Failed', {
        description: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setIsSaving(false);
    }
  }, [apiKey, proxyUrl, provider.id, provider.connected, onSave]);

  const handleCheck = useCallback(async () => {
    if (!apiKey.trim()) {
      toast.error('API Key Required', {
        description: 'Please enter your API key before testing the connection.',
      });
      return;
    }

    if (!selectedModel) {
      toast.error('Model Required', {
        description: 'Please select a model to test the connection.',
      });
      return;
    }

    setCheckStatus('checking');
    setCheckError('');
    setResponseTime(null);

    try {
      const response = await fetch('/api/settings/api-keys/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerName: provider.id.toLowerCase(),
          apiKey: apiKey.trim(),
          proxyUrl: proxyUrl.trim() || undefined,
          model: selectedModel,
        }),
      });

      const result: ConnectionCheckResponse = await response.json();

      if (result.success) {
        setCheckStatus('success');
        setResponseTime(result.responseTimeMs ?? null);
        toast.success('Connection Successful', {
          description: `Connected in ${result.responseTimeMs}ms`,
        });

        await handleSave();
      } else {
        setCheckStatus('error');
        setCheckError(result.message || 'Connection failed');
        toast.error('Connection Failed', {
          description: result.message || 'Unable to connect to the provider',
        });
      }
    } catch (error) {
      setCheckStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setCheckError(errorMessage);
      toast.error('Connection Error', {
        description: errorMessage,
      });
    }
  }, [apiKey, proxyUrl, selectedModel, provider.id, handleSave]);

  const handleToggle = useCallback(async () => {
    const newEnabled = !provider.connected;

    if (newEnabled && !apiKey.trim() && !provider.apiKeyId) {
      onToggle(provider.id, newEnabled);
      return;
    }

    setIsToggling(true);
    try {
      if (provider.apiKeyId) {
        const response = await fetch(`/api/settings/api-keys/${provider.apiKeyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: newEnabled }),
        });

        if (!response.ok) {
          throw new Error('Failed to update provider status');
        }

        onToggle(provider.id, newEnabled, provider.apiKeyId);
      } else if (apiKey.trim()) {
        const response = await fetch('/api/settings/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerName: provider.id.toLowerCase(),
            apiKey: apiKey.trim(),
            proxyUrl: proxyUrl.trim() || undefined,
            enabled: newEnabled,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save provider configuration');
        }

        const result: SaveApiKeyResponse = await response.json();
        onToggle(provider.id, newEnabled, result.id);
        onSave?.(provider.id, result.id);
      } else {
        onToggle(provider.id, newEnabled);
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update status',
      });
    } finally {
      setIsToggling(false);
    }
  }, [provider.id, provider.connected, provider.apiKeyId, apiKey, proxyUrl, onToggle, onSave]);

  const handleModelToggle = useCallback(
    async (modelId: string, enabled: boolean) => {
      setModelEnabledStates((prev) => ({ ...prev, [modelId]: enabled }));

      if (provider.apiKeyId) {
        try {
          await fetch(`/api/settings/api-keys/${provider.apiKeyId}/models`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              models: [{ modelId, enabled }],
            }),
          });
        } catch {
          setModelEnabledStates((prev) => ({ ...prev, [modelId]: !enabled }));
          toast.error('Error', {
            description: 'Failed to update model status',
          });
        }
      }
    },
    [provider.apiKeyId],
  );

  const handleAddModel = useCallback(
    async (model: { id: string; name: string }) => {
      if (!provider.apiKeyId) {
        toast.error('Please save your API key first');
        return;
      }

      try {
        const response = await fetch(`/api/settings/api-keys/${provider.apiKeyId}/custom-models`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId: model.id,
            displayName: model.name,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to add model');
        }

        setCustomModels((prev) => [
          ...prev,
          {
            id: model.id,
            displayName: model.name,
            type: 'chat' as const,
            abilities: {},
            providerId: provider.id.toLowerCase(),
            source: 'custom' as const,
          },
        ]);
        // Do not auto-enable new models
        // setModelEnabledStates((prev) => ({ ...prev, [model.id]: true }));
        toast.success('Model Added');
      } catch (error) {
        toast.error('Failed to add model', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [provider.apiKeyId, provider.id],
  );

  const handleDeleteCustomModel = useCallback(
    async (modelId: string) => {
      if (!provider.apiKeyId) return;

      try {
        const response = await fetch(
          `/api/settings/api-keys/${provider.apiKeyId}/custom-models/${encodeURIComponent(modelId)}`,
          { method: 'DELETE' },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete model');
        }

        // Remove from local state
        setCustomModels((prev) => prev.filter((m) => m.id !== modelId));
        setModelEnabledStates((prev) => {
          const newState = { ...prev };
          delete newState[modelId];
          return newState;
        });

        toast.success('Model Deleted');
      } catch (error) {
        toast.error('Failed to delete model', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [provider.apiKeyId],
  );

  const handleShowKey = useCallback(async () => {
    if (showKey) {
      setShowKey(false);
      return;
    }

    if (fetchedApiKey) {
      setShowKey(true);
      return;
    }

    if (!provider.apiKeyId) {
      setShowKey(true);
      return;
    }

    setIsFetchingKey(true);
    try {
      const response = await fetch(`/api/settings/api-keys/${provider.apiKeyId}`);
      if (response.ok) {
        const data = await response.json();
        setFetchedApiKey(data.apiKey);
        setApiKey(data.apiKey);
        setShowKey(true);
      } else {
        toast.error('Failed to fetch API key');
      }
    } catch (error) {
      toast.error('Failed to fetch API key', {
        description: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setIsFetchingKey(false);
    }
  }, [showKey, fetchedApiKey, provider.apiKeyId]);

  const renderProviderIcon = (size = 20, className?: string) => {
    if (provider.Icon) {
      return (
        <provider.Icon
          size={size}
          className={cn(
            'text-foreground',
            !provider.connected && 'grayscale opacity-70',
            className,
          )}
        />
      );
    }
    return null;
  };

  const renderModelListIcon = (size = 20, className?: string) => {
    if (provider.Icon) {
      return <provider.Icon size={size} className={cn('text-foreground', className)} />;
    }
    return null;
  };

  const renderAbilityIcons = (abilities: ModelAbilities) => {
    const iconSize = 'h-3.5 w-3.5';
    return (
      <TooltipProvider>
        <div className="flex gap-2 items-center">
          {abilities.vision && (
            <Tooltip>
              <TooltipTrigger>
                <EyeIcon className={cn(iconSize, 'text-green-500')} />
              </TooltipTrigger>
              <TooltipContent>Vision</TooltipContent>
            </Tooltip>
          )}
          {abilities.imageOutput && (
            <Tooltip>
              <TooltipTrigger>
                <ImageIcon className={cn(iconSize, 'text-green-500')} />
              </TooltipTrigger>
              <TooltipContent>Image Generation</TooltipContent>
            </Tooltip>
          )}
          {abilities.reasoning && (
            <Tooltip>
              <TooltipTrigger>
                <BrainCircuitIcon className={cn(iconSize, 'text-purple-500')} />
              </TooltipTrigger>
              <TooltipContent>Reasoning / Deep Thinking</TooltipContent>
            </Tooltip>
          )}
          {abilities.search && (
            <Tooltip>
              <TooltipTrigger>
                <SearchIcon className={cn(iconSize, 'text-blue-500')} />
              </TooltipTrigger>
              <TooltipContent>Online Search</TooltipContent>
            </Tooltip>
          )}
          {abilities.functionCall && (
            <Tooltip>
              <TooltipTrigger>
                <WrenchIcon className={cn(iconSize, 'text-orange-500')} />
              </TooltipTrigger>
              <TooltipContent>Function Calls</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  };

  const renderCheckStatus = () => {
    if (checkStatus === 'success') {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2Icon className="h-4 w-4" />
          <span>Connected{responseTime ? ` in ${responseTime}ms` : ''}</span>
        </div>
      );
    }
    if (checkStatus === 'error') {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircleIcon className="h-4 w-4" />
          <span>{checkError || 'Connection failed'}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {renderProviderIcon(25)}
          <div>
            <h2 className="text-lg font-semibold">{provider.name}</h2>
            {provider.description && (
              <p className="text-sm text-muted-foreground">{provider.description}</p>
            )}
          </div>
        </div>
        <Switch checked={provider.connected} onCheckedChange={handleToggle} disabled={isToggling} />
      </div>

      <Separator />

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="api-key">API Key</Label>
          <div className="relative">
            <Input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                hasExistingApiKey ? 'API Key saved (enter new to replace)' : 'Enter API Key'
              }
              className="pr-10 h-9"
            />
            <button
              type="button"
              onClick={handleShowKey}
              disabled={isFetchingKey}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {isFetchingKey ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : showKey ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {hasExistingApiKey && !apiKey && (
            <p className="text-xs text-muted-foreground">
              Your API key is securely stored. Enter a new key to replace it.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="proxy-url">API Proxy URL</Label>
          <Input
            id="proxy-url"
            value={proxyUrl}
            onChange={(e) => setProxyUrl(e.target.value)}
            placeholder={defaultUrl || 'https://api.example.com/v1'}
            className="h-9"
          />
        </div>

        <div className="space-y-3">
          <Label>Connectivity Check</Label>
          <div className="flex gap-3 w-full items-start">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="flex-1 h-9">
                <SelectValue placeholder="Select model to check" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      {renderModelListIcon(16)}
                      <span>{model.displayName || model.id}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2 h-9 min-w-[100px] transition-all hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 dark:hover:border-blue-500"
              onClick={handleCheck}
              disabled={checkStatus === 'checking' || isSaving}
            >
              {checkStatus === 'checking' ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Checking
                </>
              ) : (
                <>Check</>
              )}
            </Button>
          </div>

          {renderCheckStatus()}

          <div className="flex items-center justify-center gap-2 text-[0.8rem] text-muted-foreground pt-2">
            <LockIcon className="h-3 w-3" />
            <span>
              Your key will be encrypted using{' '}
              <span className="text-blue-500 font-medium">AES-GCM</span> encryption algorithm
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-medium leading-none">Model List</h3>
            <p className="text-sm text-muted-foreground">
              {models.length} models available across {sortedModelTypes.length} categories
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Models..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9" title="Fetch models">
              <RotateCwIcon className="h-4 w-4" />
            </Button>
            <AddModelDialog onAdd={handleAddModel} />
          </div>
        </div>

        {sortedModelTypes.length > 0 ? (
          <Tabs defaultValue={sortedModelTypes[0]} className="w-full">
            <div className="overflow-x-auto pb-2 -mx-1 px-1">
              <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0 flex-nowrap md:flex-wrap">
                {sortedModelTypes.map((type) => {
                  const config = MODEL_TYPE_CONFIG[type];
                  const TypeIcon = config.icon;
                  const typeModels = modelsByType[type] || [];
                  return (
                    <TabsTrigger
                      key={type}
                      value={type}
                      className="group w-auto flex-none rounded-full border border-transparent bg-transparent data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 px-4 py-2 transition-all"
                    >
                      <TypeIcon className={cn('mr-2 h-4 w-4', config.color)} />
                      <span>{config.label}</span>
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 min-w-5 px-1 justify-center bg-muted text-muted-foreground group-data-[state=active]:bg-background/50 group-data-[state=active]:text-foreground"
                      >
                        {typeModels.length}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {sortedModelTypes.map((type) => {
              const typeModels = [...(modelsByType[type] || [])].sort((a, b) => {
                const aEnabled = modelEnabledStates[a.id] ?? false;
                const bEnabled = modelEnabledStates[b.id] ?? false;
                if (aEnabled === bEnabled) return 0;
                return aEnabled ? -1 : 1;
              });
              return (
                <TabsContent key={type} value={type} className="space-y-2 mt-4">
                  {typeModels.map((model) => {
                    const isEnabled = modelEnabledStates[model.id] ?? false;
                    return (
                      <div
                        key={model.id}
                        className="group flex items-center justify-between p-3 rounded-lg border border-transparent bg-transparent hover:bg-card hover:border-border hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                            {renderModelListIcon(32)}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium leading-tight">
                                {model.displayName || model.id}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground leading-tight">
                              {model.releasedAt && <span>{model.releasedAt}</span>}
                              {model.pricing?.input && (
                                <span>Input ${(model.pricing.input || 0).toFixed(2)}/M</span>
                              )}
                              {model.pricing?.output && (
                                <span>Output ${(model.pricing.output || 0).toFixed(2)}/M</span>
                              )}
                              {model.contextWindowTokens && (
                                <span>{(model.contextWindowTokens / 1000).toFixed(0)}K</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {model.abilities && renderAbilityIcons(model.abilities)}
                          {customModels.some((cm) => cm.id === model.id) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:border-destructive border border-transparent"
                              onClick={() => setModelToDelete(model.id)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          )}
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => handleModelToggle(model.id, checked)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <div className="p-8 text-center border rounded-lg border-dashed text-muted-foreground">
            No models found matching your search
          </div>
        )}
      </div>

      <AlertDialog open={!!modelToDelete} onOpenChange={(open) => !open && setModelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this model? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setModelToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (modelToDelete) handleDeleteCustomModel(modelToDelete);
                setModelToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
