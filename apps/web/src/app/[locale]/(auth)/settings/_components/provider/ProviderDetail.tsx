import type { ModelAbilities } from '@lmring/model-depot';
import { getEndpointConfig, getModelsForProvider } from '@lmring/model-depot';
import {
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@lmring/ui';
import {
  BrainCircuitIcon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  Loader2Icon,
  LockIcon,
  PlusIcon,
  RotateCwIcon,
  SearchIcon,
  WrenchIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Provider } from './types';

interface ProviderDetailProps {
  provider: Provider;
  onToggle: (id: string) => void;
}

export function ProviderDetail({ provider, onToggle }: ProviderDetailProps) {
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const models = useMemo(() => {
    return getModelsForProvider(provider.id.toLowerCase());
  }, [provider.id]);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;
    return models.filter(
      (model) =>
        model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.displayName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [models, searchQuery]);

  const defaultUrl = useMemo(() => {
    const endpoint = getEndpointConfig(provider.id.toLowerCase());
    return endpoint?.baseURL || '';
  }, [provider.id]);

  const handleCheck = async () => {
    setIsChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsChecking(false);
  };

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
        <Switch checked={provider.connected} onCheckedChange={() => onToggle(provider.id)} />
      </div>

      <Separator />

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>API Key</Label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              defaultValue={provider.connected ? 'sk-xxxxxxxxxxxxxxxx' : ''}
              placeholder="Enter API Key"
              className="pr-10 h-9"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Label>API Proxy URL</Label>
          <Input placeholder={defaultUrl || 'https://api.example.com/v1'} className="h-9" />
        </div>

        <div className="space-y-3">
          <Label>Connectivity Check</Label>
          <div className="flex gap-3 w-full items-start">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="flex-1 h-9">
                <div className="flex items-center gap-2">
                  {selectedModel && renderModelListIcon(16)}
                  <SelectValue placeholder="Select model to check" />
                </div>
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
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Checking
                </>
              ) : (
                <>Check</>
              )}
            </Button>
          </div>
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
          <div className="flex items-baseline gap-2">
            <Label className="text-base">Model List</Label>
            <span className="text-sm text-muted-foreground">{models.length} models available</span>
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
            <Button variant="outline" size="icon" className="h-9 w-9" title="Add model">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <div
                key={model.id}
                className="group flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{renderModelListIcon(20)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.displayName || model.id}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {model.releasedAt && <span>Released at {model.releasedAt}</span>}
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
                  <Switch defaultChecked={model.enabled} />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center border rounded-lg border-dashed text-muted-foreground">
              No models found matching your search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
