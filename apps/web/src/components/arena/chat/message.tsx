'use client';

import { Avatar, AvatarFallback, AvatarImage, cn } from '@lmring/ui';
import { UserIcon } from 'lucide-react';
import { useSession } from '@/libs/AuthClient';
import type { WorkflowMessage } from '@/types/workflow';
import { ProviderIcon } from '../provider-icon';
import { ResponseViewer } from '../response-viewer';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './reasoning';

interface MessageProps {
  message: WorkflowMessage;
  isStreaming?: boolean;
  providerId?: string;
}

export function Message({ message, isStreaming = false, providerId }: MessageProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex w-full gap-4 p-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {isUser ? (
        <Avatar className="size-8 border shadow-sm">
          <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
          <AvatarFallback className="bg-muted">
            <UserIcon className="size-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      ) : (
        <div
          className={cn(
            'flex size-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm bg-background',
          )}
        >
          {providerId && <ProviderIcon providerId={providerId} size={16} />}
        </div>
      )}

      <div className={cn('flex max-w-[80%] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        {isUser ? (
          <div className="rounded-2xl bg-primary px-4 py-2 text-primary-foreground">
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          </div>
        ) : (
          <div className="w-full space-y-2">
            {message.reasoning && (
              <Reasoning isStreaming={isStreaming}>
                <ReasoningTrigger />
                <ReasoningContent>{message.reasoning}</ReasoningContent>
              </Reasoning>
            )}
            <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-foreground backdrop-blur-sm">
              <ResponseViewer content={message.content} isStreaming={isStreaming} />
            </div>
            {!isStreaming && message.metrics && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                {message.metrics.responseTime && <span>{message.metrics.responseTime}ms</span>}
                {message.metrics.tokenCount && <span>{message.metrics.tokenCount} tokens</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
