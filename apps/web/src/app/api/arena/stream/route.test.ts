import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/arena/stream/route';
import { createMockRequest, setupTestEnvironment } from '@/test/helpers';

const { mockAuthInstance, mockCompareModels } = vi.hoisted(() => {
  const mockSession = {
    session: {
      id: 'test-session-id',
      userId: 'test-user-id',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      token: 'test-token',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  return {
    mockAuthInstance: {
      api: {
        getSession: vi.fn().mockResolvedValue(mockSession),
      },
    },
    mockCompareModels: vi.fn(),
  };
});

vi.mock('@/libs/Auth', () => ({
  auth: mockAuthInstance,
}));

vi.mock('@lmring/ai-hub', () => ({
  compareModels: mockCompareModels,
  ProviderBuilder: {
    openai: vi.fn(() => ({ providerId: 'openai' })),
    anthropic: vi.fn(() => ({ providerId: 'anthropic' })),
    deepseek: vi.fn(() => ({ providerId: 'deepseek' })),
    mistral: vi.fn(() => ({ providerId: 'mistral' })),
    xai: vi.fn(() => ({ providerId: 'xai' })),
    openrouter: vi.fn(() => ({ providerId: 'openrouter' })),
    create: vi.fn(() => ({
      withApiKey: vi.fn().mockReturnThis(),
      build: vi.fn(() => ({ providerId: 'custom' })),
    })),
  },
}));

setupTestEnvironment();

describe('POST /api/arena/stream', () => {
  const validRequestBody = {
    models: [
      {
        providerId: 'openai',
        modelId: 'gpt-4o',
        apiKey: 'test-openai-key',
        options: {
          temperature: 0.7,
          maxTokens: 2048,
        },
      },
    ],
    messages: [
      {
        role: 'user',
        content: 'What is the capital of France?',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function parseStreamResponse(response: Response) {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    const events: unknown[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return events;
          }
          try {
            events.push(JSON.parse(data));
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    return events;
  }

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(mockAuthInstance.api.getSession).mockResolvedValueOnce(null);

    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/arena/stream',
      validRequestBody,
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 when models array is missing', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/arena/stream', {
      messages: validRequestBody.messages,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 400 when messages array is missing', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/arena/stream', {
      models: validRequestBody.models,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should stream model responses with SSE format', async () => {
    mockCompareModels.mockImplementation(async (_configs, _messages, options) => {
      if (options?.onProgress) {
        options.onProgress('openai', 'gpt-4o', 'Hello');
        options.onProgress('openai', 'gpt-4o', ' World');
      }

      return [
        {
          provider: 'openai',
          model: 'gpt-4o',
          status: 'success',
          metrics: {
            totalTime: 1500,
            timeToFirstToken: 200,
            tokensPerSecond: 13.33,
            promptTokens: 10,
            completionTokens: 20,
            totalTokens: 30,
          },
        },
      ];
    });

    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/arena/stream',
      validRequestBody,
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');

    const events = await parseStreamResponse(response);

    expect(events).toContainEqual({
      type: 'chunk',
      provider: 'openai',
      model: 'gpt-4o',
      chunk: 'Hello',
    });

    expect(events).toContainEqual({
      type: 'chunk',
      provider: 'openai',
      model: 'gpt-4o',
      chunk: ' World',
    });

    expect(events).toContainEqual({
      type: 'complete',
      provider: 'openai',
      model: 'gpt-4o',
      status: 'success',
      metrics: expect.objectContaining({
        totalTime: 1500,
        timeToFirstToken: 200,
      }),
      error: undefined,
    });
  });

  it('should handle streaming errors gracefully', async () => {
    mockCompareModels.mockRejectedValue(new Error('Stream processing failed'));

    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/arena/stream',
      validRequestBody,
    );

    const response = await POST(request);

    expect(response.status).toBe(200);

    const events = await parseStreamResponse(response);

    expect(events).toContainEqual({
      type: 'error',
      error: 'Stream processing failed',
    });
  });

  it('should handle multiple models streaming', async () => {
    mockCompareModels.mockImplementation(async (_configs, _messages, options) => {
      if (options?.onProgress) {
        options.onProgress('openai', 'gpt-4o', 'Response 1');
        options.onProgress('anthropic', 'claude-3-5-sonnet-20241022', 'Response 2');
      }

      return [
        {
          provider: 'openai',
          model: 'gpt-4o',
          status: 'success',
          metrics: {
            totalTime: 1500,
            timeToFirstToken: 200,
            tokensPerSecond: 13.33,
            promptTokens: 10,
            completionTokens: 20,
            totalTokens: 30,
          },
        },
        {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          status: 'success',
          metrics: {
            totalTime: 1200,
            timeToFirstToken: 150,
            tokensPerSecond: 20.83,
            promptTokens: 10,
            completionTokens: 25,
            totalTokens: 35,
          },
        },
      ];
    });

    const requestBody = {
      models: [
        validRequestBody.models[0],
        {
          providerId: 'anthropic',
          modelId: 'claude-3-5-sonnet-20241022',
          apiKey: 'test-anthropic-key',
        },
      ],
      messages: validRequestBody.messages,
    };

    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/arena/stream',
      requestBody,
    );

    const response = await POST(request);
    const events = await parseStreamResponse(response);

    const completeEvents = events.filter((e: any) => e.type === 'complete');
    expect(completeEvents).toHaveLength(2);
  });
});
