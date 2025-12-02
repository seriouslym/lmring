import type { ModelMessage } from '@lmring/ai-hub';

export interface ModelConfig {
  providerId: string;
  modelId: string;
  apiKey: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

export interface CompareResponse {
  results: Array<{
    provider: string;
    model: string;
    status: 'success' | 'failed' | 'cancelled';
    text?: string;
    usage?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    };
    metrics?: {
      totalTime?: number;
      timeToFirstToken?: number;
      tokensPerSecond?: number;
    };
    error?: string;
  }>;
}

export interface StreamEvent {
  type: 'chunk' | 'complete' | 'error';
  provider?: string;
  model?: string;
  chunk?: string;
  status?: 'success' | 'failed' | 'cancelled';
  metrics?: {
    totalTime?: number;
    timeToFirstToken?: number;
    tokensPerSecond?: number;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  error?: string;
}

export async function compareModels(
  models: ModelConfig[],
  messages: ModelMessage[],
): Promise<CompareResponse> {
  const response = await fetch('/api/arena/compare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      models,
      messages,
      options: {
        streaming: false,
        stopOnError: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to compare models');
  }

  return response.json();
}

export async function* streamCompare(
  models: ModelConfig[],
  messages: ModelMessage[],
): AsyncGenerator<StreamEvent> {
  const response = await fetch('/api/arena/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      models,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to stream models');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

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
          const event = JSON.parse(data) as StreamEvent;
          yield event;
        } catch (error) {
          console.error('Failed to parse SSE event:', error);
        }
      }
    }
  }
}

export interface ApiKey {
  id: string;
  providerName: string;
  proxyUrl: string;
  configSource: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getApiKeys(): Promise<{ keys: ApiKey[] }> {
  const response = await fetch('/api/settings/api-keys');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get API keys');
  }

  return response.json();
}

export async function addApiKey(
  providerName: string,
  apiKey: string,
  proxyUrl?: string,
): Promise<{ message: string; id: string; providerName: string; proxyUrl: string }> {
  const response = await fetch('/api/settings/api-keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      providerName,
      apiKey,
      proxyUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add API key');
  }

  return response.json();
}

export async function deleteApiKey(keyId: string): Promise<{ message: string }> {
  const response = await fetch(`/api/settings/api-keys?id=${keyId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete API key');
  }

  return response.json();
}

export async function getProviderApiKey(providerName: string): Promise<{
  id: string;
  providerName: string;
  apiKey: string;
  proxyUrl: string;
  configSource: string;
}> {
  const response = await fetch(`/api/settings/api-keys/${providerName}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get API key');
  }

  return response.json();
}
