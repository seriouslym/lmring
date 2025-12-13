'use client';

import { ScrollArea } from '@lmring/ui';
import { useEffect, useRef } from 'react';
import type { PendingResponse, WorkflowMessage, WorkflowStatus } from '@/types/workflow';
import { Message } from './message';

interface ChatListProps {
  messages: WorkflowMessage[];
  pendingResponse?: PendingResponse;
  isLoading?: boolean;
  status?: WorkflowStatus;
  providerId?: string;
  onRetry?: (messageId: string) => void;
  onMaximize?: (content: string) => void;
}

export function ChatList({
  messages,
  pendingResponse,
  isLoading,
  status,
  providerId,
  onRetry,
  onMaximize,
}: ChatListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on content change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, pendingResponse, isLoading]);

  const lastAssistantIndex = messages.findLastIndex((m) => m.role === 'assistant');

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="flex flex-col gap-4 pb-4 pt-4 px-2">
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            providerId={providerId}
            isStreaming={false}
            onRetry={
              onRetry && message.role === 'assistant' && index === lastAssistantIndex
                ? () => onRetry(message.id)
                : undefined
            }
            onMaximize={message.role === 'assistant' ? onMaximize : undefined}
          />
        ))}

        {pendingResponse && (
          <Message
            message={{
              id: 'pending',
              role: 'assistant',
              content: pendingResponse.content,
              reasoning: pendingResponse.reasoning,
              timestamp: new Date(pendingResponse.startTime),
            }}
            providerId={providerId}
            isStreaming={status === 'running'}
            status={status}
          />
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
