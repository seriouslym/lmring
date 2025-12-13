import { cn } from './utils';
import { StopCircle } from 'lucide-react';
import * as React from 'react';
import { Streamdown } from 'streamdown';
import { Shimmer } from './shimmer';
import { StreamingCursor } from './streaming-cursor';

export type ResponseViewerStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

interface ResponseViewerProps {
  content: string;
  isStreaming?: boolean;
  status?: ResponseViewerStatus;
  className?: string;
}

export function ResponseViewer({
  content,
  isStreaming = false,
  status,
  className,
}: ResponseViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: content triggers scroll
  React.useEffect(() => {
    if (isStreaming && containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
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

  if (!content) {
    return (
      <Shimmer duration={2.5} className="text-sm italic block leading-tight">
        Waiting for response...
      </Shimmer>
    );
  }

  return (
    <div ref={containerRef} className={cn('text-sm', className)}>
      <Streamdown
        parseIncompleteMarkdown={true}
        isAnimating={isStreaming}
        controls={{ code: true }}
      >
        {content}
      </Streamdown>
      {isStreaming && <StreamingCursor />}
      {status === 'cancelled' && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
          <StopCircle className="h-3 w-3" />
          <span>Stopped by user</span>
        </div>
      )}
    </div>
  );
}

