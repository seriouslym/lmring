'use client';

import { Badge, Button, Popover, PopoverContent, PopoverTrigger } from '@lmring/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { ProviderIcon } from '@/components/arena/provider-icon';
import type { ModelOption } from '@/types/arena';

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
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter and sort models based on search query
  const filteredModels = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return [...models].sort((a, b) => a.name.localeCompare(b.name));
    }

    return models
      .filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.provider.toLowerCase().includes(query) ||
          model.id.toLowerCase().includes(query),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [models, searchQuery]);

  const selectedModelInfo = models.find((m) => m.id === selectedModel);

  // Focus input when popover opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else {
      setSearchQuery('');
    }
  }, [open]);

  const handleSelect = (modelId: string) => {
    onModelSelect(modelId);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="relative w-full"
    >
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="w-full h-10 justify-between font-normal"
            >
              <div className="flex items-center gap-2 truncate">
                {selectedModelInfo ? (
                  <>
                    <ProviderIcon providerId={selectedModelInfo.providerId} size={16} />
                    <span className="text-sm truncate">{selectedModelInfo.name}</span>
                    {selectedModelInfo.isNew && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                        NEW
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <div className="flex items-center border-b px-3 py-2">
              <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-8 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="ml-2 p-1 rounded hover:bg-muted"
                >
                  <XIcon className="h-3 w-3 opacity-50" />
                </button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredModels.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No models found
                </div>
              ) : (
                <div className="p-1">
                  {filteredModels.map((model) => (
                    <button
                      type="button"
                      key={model.id}
                      onClick={() => handleSelect(model.id)}
                      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ProviderIcon providerId={model.providerId} size={16} />
                        <span className="font-medium truncate">{model.name}</span>
                        {model.isNew && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                            NEW
                          </Badge>
                        )}
                      </div>
                      {selectedModel === model.id && (
                        <CheckIcon className="h-4 w-4 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <AnimatePresence>
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
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
