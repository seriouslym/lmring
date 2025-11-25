'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

interface ResponseViewerProps {
  content: string;
  isStreaming?: boolean;
  format?: 'text' | 'markdown' | 'code';
  language?: string;
}

export function ResponseViewer({
  content,
  isStreaming = false,
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

  if (!content) {
    return <div className="text-sm text-muted-foreground italic">Waiting for response...</div>;
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
    </div>
  );
}
