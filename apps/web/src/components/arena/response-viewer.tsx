'use client';

import { motion } from 'framer-motion';
import { StopCircle } from 'lucide-react';
import * as React from 'react';
import type { WorkflowStatus } from '@/types/workflow';
import { Shimmer } from './chat/shimmer';

interface ResponseViewerProps {
  content: string;
  isStreaming?: boolean;
  status?: WorkflowStatus;
  format?: 'text' | 'code';
  language?: string;
}

export function ResponseViewer({
  content,
  isStreaming = false,
  status,
  format = 'text',
  language = 'plaintext',
}: ResponseViewerProps) {
  const lines = content.split('\n');
  const lastLineRef = React.useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: content triggers scroll on updates during streaming
  React.useEffect(() => {
    if (isStreaming && lastLineRef.current) {
      lastLineRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isStreaming, content]);

  if (!content && status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
        <StopCircle className="h-4 w-4" />
        <span>Stopped by user</span>
      </div>
    );
  }

  // Loading state
  if (!content) {
    return (
      <Shimmer duration={2.5} className="text-sm italic">
        Waiting for response...
      </Shimmer>
    );
  }

  if (format === 'code') {
    return (
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
        <code className={`language-${language} text-sm`}>{content}</code>
      </pre>
    );
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {lines.map((line, index) => (
        <motion.div
          key={index}
          ref={index === lines.length - 1 ? lastLineRef : null}
          initial={isStreaming ? { opacity: 0, x: -5 } : {}}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.1 }}
          className="text-sm leading-relaxed"
        >
          {line || <br />}
        </motion.div>
      ))}
      {isStreaming && (
        <motion.span
          className="inline-block w-2 h-4 bg-primary ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
      {status === 'cancelled' && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
          <StopCircle className="h-3 w-3" />
          <span>Stopped by user</span>
        </div>
      )}
    </div>
  );
}
