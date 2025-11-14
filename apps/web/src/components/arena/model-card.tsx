'use client';

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@lmring/ui';
import { motion } from 'framer-motion';
import {
  CheckIcon,
  ClockIcon,
  CopyIcon,
  SparklesIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from 'lucide-react';
import * as React from 'react';

interface ModelCardProps {
  modelName: string;
  provider?: string;
  response?: string;
  isLoading?: boolean;
  responseTime?: number;
  tokenCount?: number;
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  index?: number;
}

export function ModelCard({
  modelName,
  provider,
  response = '',
  isLoading = false,
  responseTime,
  tokenCount,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  index = 0,
}: ModelCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (response) {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
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
      className="w-full h-full min-w-[400px] max-w-[500px] lg:min-w-[500px]"
    >
      <Card className="h-full arena-card flex flex-col">
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-primary" />
                {modelName}
              </CardTitle>
              {provider && <CardDescription className="text-sm">{provider}</CardDescription>}
            </div>
            <div className="flex items-center gap-2">
              {responseTime && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {responseTime}ms
                </Badge>
              )}
              {tokenCount && <Badge variant="secondary">{tokenCount} tokens</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          <div className="relative">
            {isLoading ? (
              <div className="space-y-3">
                <motion.div
                  className="h-4 bg-muted rounded animate-pulse"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="h-4 bg-muted rounded animate-pulse w-5/6"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="h-4 bg-muted rounded animate-pulse w-4/6"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {response || 'No response yet...'}
                </p>
              </div>
            )}
          </div>

          {response && !isLoading && (
            <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onThumbsUp}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Thumbs up"
                >
                  <ThumbsUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onThumbsDown}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Thumbs down"
                >
                  <ThumbsDownIcon className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                aria-label="Copy response"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-4 w-4" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
