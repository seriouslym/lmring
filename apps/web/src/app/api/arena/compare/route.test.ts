import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/arena/compare/route';
import { createMockRequest, parseJsonResponse, setupTestEnvironment } from '@/test/helpers';

const { mockAuthInstance } = vi.hoisted(() => {
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
  };
});

vi.mock('@/libs/Auth', () => ({
  auth: mockAuthInstance,
}));

vi.mock('@lmring/ai-hub', () => ({
  compareModels: vi.fn().mockResolvedValue([
    {
      provider: 'openai',
      model: 'gpt-4o',
      status: 'success',
      result: {
        text: 'Mock response from GPT-4o',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      },
      metrics: {
        totalTime: 1500,
        timeToFirstToken: 200,
        tokensPerSecond: 13.33,
      },
    },
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      status: 'success',
      result: {
        text: 'Mock response from Claude',
        usage: {
          promptTokens: 10,
          completionTokens: 25,
          totalTokens: 35,
        },
      },
      metrics: {
        totalTime: 1200,
        timeToFirstToken: 150,
        tokensPerSecond: 20.83,
      },
    },
  ]),
  ProviderBuilder: {
    openai: vi.fn(() => ({ providerId: 'openai' })),
    anthropic: vi.fn(() => ({ providerId: 'anthropic' })),
    deepseek: vi.fn(() => ({ providerId: 'deepseek' })),
    mistral: vi.fn(() => ({ providerId: 'mistral' })),
    xai: vi.fn(() => ({ providerId: 'xai' })),
    openrouter: vi.fn(() => ({ providerId: 'openrouter' })),
    google: vi.fn(() => ({ providerId: 'google' })),
    cohere: vi.fn(() => ({ providerId: 'cohere' })),
    together: vi.fn(() => ({ providerId: 'together' })),
    perplexity: vi.fn(() => ({ providerId: 'perplexity' })),
    create: vi.fn(() => ({
      withApiKey: vi.fn().mockReturnThis(),
      build: vi.fn(() => ({ providerId: 'custom' })),
    })),
  },
}));

setupTestEnvironment();

describe('POST /api/arena/compare', () => {
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
      {
        providerId: 'anthropic',
        modelId: 'claude-3-5-sonnet-20241022',
        apiKey: 'test-anthropic-key',
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
    options: {
      streaming: false,
      stopOnError: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(mockAuthInstance.api.getSession).mockResolvedValueOnce(null);

    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/arena/compare',
      validRequestBody,
    );

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 when models array is missing', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/arena/compare', {
      messages: validRequestBody.messages,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 400 when messages array is missing', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/arena/compare', {
      models: validRequestBody.models,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should successfully compare models and return results', async () => {
    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/arena/compare',
      validRequestBody,
    );

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.results).toBeDefined();
    expect(data.results).toHaveLength(2);
    expect(data.results[0]).toMatchObject({
      provider: 'openai',
      model: 'gpt-4o',
      status: 'success',
      text: 'Mock response from GPT-4o',
      metrics: expect.objectContaining({
        totalTime: 1500,
        timeToFirstToken: 200,
      }),
    });
    expect(data.results[1]).toMatchObject({
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      status: 'success',
      text: 'Mock response from Claude',
    });
  });

  it('should handle different provider types', async () => {
    const requestWithDifferentProviders = {
      ...validRequestBody,
      models: [
        {
          providerId: 'deepseek',
          modelId: 'deepseek-chat',
          apiKey: 'test-deepseek-key',
        },
        {
          providerId: 'google',
          modelId: 'gemini-pro',
          apiKey: 'test-google-key',
        },
      ],
    };

    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/arena/compare',
      requestWithDifferentProviders,
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should return 400 when using unsupported provider', async () => {
    const requestWithUnsupportedProvider = {
      ...validRequestBody,
      models: [
        {
          providerId: 'unsupported-provider',
          modelId: 'test-model',
          apiKey: 'test-key',
        },
      ],
    };

    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/arena/compare',
      requestWithUnsupportedProvider,
    );

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });
});
