'use client';

import {
  Badge,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@lmring/ui';
import { motion } from 'framer-motion';
import { SparklesIcon, XIcon } from 'lucide-react';
import * as React from 'react';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description?: string;
  category?: string;
  icon?: string;
  context?: string;
  inputPricing?: string;
  outputPricing?: string;
  badge?: 'Hobby' | 'Pro' | 'Enterprise';
  isPremium?: boolean;
  isNew?: boolean;
}

interface ModelSelectorProps {
  models: ModelOption[];
  selectedModel?: string;
  onModelSelect: (modelId: string) => void;
  onRemove?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showRemove?: boolean;
}

export function ModelSelector({
  models,
  selectedModel,
  onModelSelect,
  onRemove,
  placeholder = 'Select a model',
  disabled = false,
  showRemove = false,
}: ModelSelectorProps) {
  // Group models by provider
  const groupedModels = React.useMemo(() => {
    const groups = new Map<string, ModelOption[]>();

    models.forEach((model) => {
      const provider = model.provider;
      if (!groups.has(provider)) {
        groups.set(provider, []);
      }
      groups.get(provider)?.push(model);
    });

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [models]);

  const selectedModelInfo = models.find((m) => m.id === selectedModel);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="relative w-full"
    >
      <div className="flex items-center gap-2">
        <Select value={selectedModel} onValueChange={onModelSelect} disabled={disabled}>
          <SelectTrigger className="w-full h-10 apple-transition">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={placeholder}>
                {selectedModelInfo && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{selectedModelInfo.name}</span>
                    {selectedModelInfo.isNew && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        NEW
                      </Badge>
                    )}
                    {selectedModelInfo.isPremium && (
                      <Badge variant="default" className="text-xs px-1.5 py-0">
                        PRO
                      </Badge>
                    )}
                  </div>
                )}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[400px] overflow-y-auto bg-background border-border shadow-lg">
            {groupedModels.map(([provider, providerModels]) => (
              <SelectGroup key={provider}>
                <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                  {provider}
                </SelectLabel>
                {providerModels.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="py-2 px-2">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{model.name}</span>
                          {model.isNew && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 ml-auto">
                              NEW
                            </Badge>
                          )}
                          {model.isPremium && (
                            <Badge variant="default" className="text-xs px-1.5 py-0 ml-auto">
                              PRO
                            </Badge>
                          )}
                        </div>
                        {model.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {model.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        {showRemove && selectedModel && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={onRemove}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            aria-label="Remove model"
          >
            <XIcon className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
