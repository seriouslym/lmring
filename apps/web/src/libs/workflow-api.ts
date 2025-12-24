/**
 * Workflow API client for single workflow stream operations
 */

import type { WorkflowMetrics, WorkflowStreamEvent, WorkflowStreamRequest } from '@/types/workflow';

/**
 * Stream a single workflow execution
 *
 * @param request - The workflow stream request
 * @param signal - Optional AbortSignal for cancellation
 * @yields WorkflowStreamEvent - Stream events (ttft, chunk, complete, error)
 */
export async function* streamWorkflow(
  request: WorkflowStreamRequest,
  signal?: AbortSignal,
): AsyncGenerator<WorkflowStreamEvent> {
  const response = await fetch('/api/workflow/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to stream workflow';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // ignore parse errors
    }

    yield {
      type: 'error',
      workflowId: request.workflowId,
      error: errorMessage,
    };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield {
      type: 'error',
      workflowId: request.workflowId,
      error: 'Response body is not readable',
    };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            return;
          }

          try {
            const event = JSON.parse(data) as WorkflowStreamEvent;
            yield event;
          } catch {
            console.error('Failed to parse SSE event:', data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Helper to build a WorkflowStreamRequest from workflow state
 *
 * Note: modelId may include provider prefix (e.g., "openai:gpt-4").
 * This function extracts just the model name for the API.
 */
export function buildWorkflowStreamRequest(
  workflowId: string,
  modelId: string,
  keyId: string,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  config: {
    temperature: number;
    maxTokens: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  },
): WorkflowStreamRequest {
  const modelName = modelId.includes(':') ? modelId.split(':').slice(1).join(':') : modelId;

  return {
    workflowId,
    modelId: modelName,
    keyId,
    messages,
    config,
  };
}

/**
 * Parse metrics from a complete event
 */
export function parseWorkflowMetrics(event: WorkflowStreamEvent): WorkflowMetrics | undefined {
  if (event.type === 'complete' && event.metrics) {
    return event.metrics;
  }
  return undefined;
}
