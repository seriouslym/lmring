'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Slider,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@lmring/ui';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ClockIcon,
  EraserIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  Trash2Icon,
} from 'lucide-react';
import * as React from 'react';

import { ProviderIcon } from '@/components/arena/provider-icon';
import type { ModelConfig, ModelOption } from '@/types/arena';

interface ModelCardProps {
  modelId?: string;
  models: ModelOption[];
  response?: string;
  isLoading?: boolean;
  responseTime?: number;
  tokenCount?: number;
  synced?: boolean;
  customPrompt?: string;
  config?: ModelConfig;
  index?: number;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onModelSelect?: (modelId: string) => void;
  onSyncToggle?: (synced: boolean) => void;
  onConfigChange?: (config: ModelConfig) => void;
  onCustomPromptChange?: (prompt: string) => void;
  onClear?: () => void;
  onDelete?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onAddCard?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
}

const DEFAULT_CONFIG: ModelConfig = {
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

export function ModelCard({
  modelId,
  models,
  response = '',
  isLoading = false,
  responseTime,
  tokenCount,
  synced = true,
  customPrompt = '',
  config = DEFAULT_CONFIG,
  index = 0,
  canMoveLeft = false,
  canMoveRight = false,
  onModelSelect,
  onSyncToggle,
  onConfigChange,
  onCustomPromptChange,
  onClear,
  onDelete,
  onMoveLeft,
  onMoveRight,
  onAddCard,
  onThumbsUp,
  onThumbsDown,
}: ModelCardProps) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [modelMenuOpen, setModelMenuOpen] = React.useState(false);

  const selectedModel = models.find((m) => m.id === modelId);

  const handleConfigChange = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => {
    if (value !== undefined) {
      onConfigChange?.({ ...config, [key]: value });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="w-full h-full"
    >
      <Card className="h-full arena-card flex flex-col glass-effect">
        <CardHeader className="pb-3 flex-shrink-0 space-y-0">
          {/* Top Controls */}
          <div className="flex items-center gap-2">
            {/* Model Selector Dropdown */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setModelMenuOpen(!modelMenuOpen)}
                className="w-full flex items-center justify-between h-9 px-3 rounded-lg border border-border/50 hover:border-border transition-colors bg-background/50"
              >
                {selectedModel ? (
                  <div className="flex items-center gap-2">
                    <ProviderIcon providerId={selectedModel.providerId} size={16} />
                    <span className="font-medium text-sm">{selectedModel.name}</span>
                    {selectedModel.isNew && (
                      <Badge variant="default" className="text-xs px-1.5 py-0">
                        NEW
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Select a model...</span>
                )}
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </button>

              {modelMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    onClick={() => setModelMenuOpen(false)}
                    onKeyDown={(e) => e.key === 'Escape' && setModelMenuOpen(false)}
                    aria-label="Close model selector"
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-popover border rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          onModelSelect?.(model.id);
                          setModelMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 py-3 px-3 hover:bg-accent transition-colors text-left"
                      >
                        <ProviderIcon providerId={model.providerId} size={16} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{model.name}</div>
                        </div>
                        {model.isNew && (
                          <Badge variant="default" className="text-xs px-1.5 py-0">
                            NEW
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover-lift text-muted-foreground hover:text-foreground"
                        onClick={() => onSyncToggle?.(!synced)}
                      >
                        {synced ? (
                          <ToggleRightIcon className="h-4 w-4" />
                        ) : (
                          <ToggleLeftIcon className="h-4 w-4" />
                        )}
                      </Button>
                      {synced && (
                        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 border border-background ring-1 ring-background pointer-events-none" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sync chat messages with other models</p>
                  </TooltipContent>
                </Tooltip>

                {/* Settings Popover */}
                <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover-lift">
                          <SlidersHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Model Settings</p>
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent className="w-80 glass-effect" align="end">
                    <div className="space-y-4">
                      <h4 className="font-medium sr-only">Model Settings</h4>

                      <div className="space-y-3">
                        {/* Max Tokens */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Max Output Tokens</Label>
                            <span className="text-sm text-muted-foreground">
                              {config.maxTokens}
                            </span>
                          </div>
                          <Slider
                            value={[config.maxTokens]}
                            onValueChange={([value]) =>
                              handleConfigChange('maxTokens', value ?? config.maxTokens)
                            }
                            min={256}
                            max={64000}
                            step={256}
                          />
                        </div>

                        {/* Temperature */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Temperature</Label>
                            <span className="text-sm text-muted-foreground">
                              {config.temperature.toFixed(2)}
                            </span>
                          </div>
                          <Slider
                            value={[config.temperature]}
                            onValueChange={([value]) =>
                              handleConfigChange('temperature', value ?? config.temperature)
                            }
                            min={0}
                            max={2}
                            step={0.01}
                          />
                        </div>

                        {/* Top P */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Top P</Label>
                            <span className="text-sm text-muted-foreground">
                              {config.topP.toFixed(2)}
                            </span>
                          </div>
                          <Slider
                            value={[config.topP]}
                            onValueChange={([value]) =>
                              handleConfigChange('topP', value ?? config.topP)
                            }
                            min={0}
                            max={1}
                            step={0.01}
                          />
                        </div>

                        {/* Frequency Penalty */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Frequency Penalty</Label>
                            <span className="text-sm text-muted-foreground">
                              {config.frequencyPenalty.toFixed(2)}
                            </span>
                          </div>
                          <Slider
                            value={[config.frequencyPenalty]}
                            onValueChange={([value]) =>
                              handleConfigChange(
                                'frequencyPenalty',
                                value ?? config.frequencyPenalty,
                              )
                            }
                            min={0}
                            max={2}
                            step={0.01}
                          />
                        </div>

                        {/* Presence Penalty */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Presence Penalty</Label>
                            <span className="text-sm text-muted-foreground">
                              {config.presencePenalty.toFixed(2)}
                            </span>
                          </div>
                          <Slider
                            value={[config.presencePenalty]}
                            onValueChange={([value]) =>
                              handleConfigChange('presencePenalty', value ?? config.presencePenalty)
                            }
                            min={0}
                            max={2}
                            step={0.01}
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Add Card Button */}
                {onAddCard && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover-lift"
                        onClick={onAddCard}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Model</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* More Actions Dropdown */}
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover-lift"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>More Options</p>
                    </TooltipContent>
                  </Tooltip>

                  {dropdownOpen && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                        onKeyDown={(e) => e.key === 'Escape' && setDropdownOpen(false)}
                        aria-label="Close dropdown menu"
                      />
                      <div className="absolute top-full right-0 mt-1 z-20 bg-popover border rounded-xl shadow-lg min-w-[160px] py-1">
                        {onClear && (
                          <button
                            type="button"
                            onClick={() => {
                              onClear();
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                          >
                            <EraserIcon className="h-4 w-4" />
                            Clear Chat
                          </button>
                        )}
                        {canMoveLeft && onMoveLeft && (
                          <button
                            type="button"
                            onClick={() => {
                              onMoveLeft();
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                          >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Move Left
                          </button>
                        )}
                        {canMoveRight && onMoveRight && (
                          <button
                            type="button"
                            onClick={() => {
                              onMoveRight();
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                          >
                            <ArrowRightIcon className="h-4 w-4" />
                            Move Right
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => {
                              onDelete();
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left text-destructive"
                          >
                            <Trash2Icon className="h-4 w-4" />
                            Delete Chat
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-0 overflow-hidden pb-4">
          {/* Content Area */}
          {!response && !isLoading && selectedModel ? (
            /* Centered Model Info Display */
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3 max-w-xl w-full backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ProviderIcon providerId={selectedModel.providerId} size={16} />
                  <span>{selectedModel.name}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedModel.description}
                </p>

                {/* Model Stats */}
                {(selectedModel.context || selectedModel.inputPricing) && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2">
                    {selectedModel.context && (
                      <div>
                        <span className="font-medium">Context:</span> {selectedModel.context}
                      </div>
                    )}
                    {selectedModel.inputPricing && (
                      <div>
                        <span className="font-medium">Input:</span> {selectedModel.inputPricing}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Links */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      Model Page <ExternalLinkIcon className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      Pricing <ExternalLinkIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Response Display */
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-4 p-1">
                {/* Metrics Badges */}
                {(responseTime || tokenCount) && (
                  <div className="flex items-center gap-2">
                    {responseTime && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {responseTime}ms
                      </Badge>
                    )}
                    {tokenCount && <Badge variant="secondary">{tokenCount} tokens</Badge>}
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="space-y-3">
                    <motion.div
                      className="h-4 bg-muted/50 rounded animate-pulse"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="h-4 bg-muted/50 rounded animate-pulse w-5/6"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="h-4 bg-muted/50 rounded animate-pulse w-4/6"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                )}

                {/* Response Text */}
                {response && !isLoading && (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{response}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Prompt Input (when not synced) */}
          {!synced && (
            <div className="pt-3 flex-shrink-0">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => onCustomPromptChange?.(e.target.value)}
                placeholder="Type a custom prompt for this model..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
              />
            </div>
          )}

          {/* Action Footer (when response exists) */}
          {response && !isLoading && (
            <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onThumbsUp}
                  className="p-2 rounded-lg hover:bg-accent transition-colors hover-lift button-press"
                  aria-label="Thumbs up"
                >
                  <ThumbsUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onThumbsDown}
                  className="p-2 rounded-lg hover:bg-accent transition-colors hover-lift button-press"
                  aria-label="Thumbs down"
                >
                  <ThumbsDownIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
