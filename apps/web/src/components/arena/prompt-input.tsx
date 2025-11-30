'use client';

import { Button, Textarea } from '@lmring/ui';
import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon, XIcon } from 'lucide-react';
import * as React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  onClear,
  isLoading = false,
  placeholder = 'Enter your prompt here...',
  maxLength = 5000,
}: PromptInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
    textareaRef.current?.focus();
  };

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div
        className={`relative rounded-xl border ${
          isFocused ? 'border-primary ring-2 ring-ring/20' : 'border-border'
        } bg-background apple-transition apple-shadow-sm`}
      >
        <div className="flex items-start p-3 gap-3">
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{
              duration: 2,
              repeat: isLoading ? Infinity : 0,
              ease: 'linear',
            }}
          >
            <SparklesIcon className="h-5 w-5 text-primary mt-0.5" />
          </motion.div>

          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isLoading}
              maxLength={maxLength}
              className="min-h-[44px] resize-none border-0 p-0 focus-visible:ring-0 shadow-none bg-transparent placeholder:text-muted-foreground/60"
              style={{
                scrollbarWidth: 'thin',
              }}
            />

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={isNearLimit ? 'text-destructive' : ''}>
                  {characterCount} / {maxLength}
                </span>
                {isFocused && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs"
                  >
                    Press{' '}
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">↵</kbd> to
                    send
                  </motion.span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {value && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClear}
                      disabled={isLoading}
                      className="h-8 px-2"
                    >
                      <XIcon className="h-4 w-4" />
                      Clear
                    </Button>
                  </motion.div>
                )}

                <Button
                  size="icon"
                  onClick={onSubmit}
                  disabled={!value.trim() || isLoading}
                  className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white p-0"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
