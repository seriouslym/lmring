import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/arena/compare/route';
import { createMockRequest, parseJsonResponse, setupTestEnvironment } from '@/test/helpers';

// UUIDs must follow v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where y is 8, 9, a, or b
const TEST_OPENAI_KEY_ID = '11111111-1111-4111-a111-111111111111';
const TEST_ANTHROPIC_KEY_ID = '22222222-2222-4222-a222-222222222222';
const TEST_DEEPSEEK_KEY_ID = '33333333-3333-4333-a333-333333333333';
const TEST_GOOGLE_KEY_ID = '44444444-4444-4444-a444-444444444444';
const TEST_UNAUTHORIZED_KEY_ID = '99999999-9999-4999-a999-999999999999';

const { mockAuthInstance, mockFetchUserApiKeys } = vi.hoisted(() => {
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

  const mockKeyData = new Map([
    [
      '11111111-1111-4111-a111-111111111111',
      { providerName: 'openai', apiKey: 'sk-test-openai-key', proxyUrl: null },
    ],
    [
      '22222222-2222-4222-a222-222222222222',
      { providerName: 'anthropic', apiKey: 'sk-test-anthropic-key', proxyUrl: null },
    ],
    [
      '33333333-3333-4333-a333-333333333333',
      { providerName: 'deepseek', apiKey: 'sk-test-deepseek-key', proxyUrl: null },
    ],
    [
      '44444444-4444-4444-a444-444444444444',
      { providerName: 'google', apiKey: 'sk-test-google-key', proxyUrl: null },
    ],
  ]);

  return {
    mockAuthInstance: {
      api: {
        getSession: vi.fn().mockResolvedValue(mockSession),
      },
    },
    mockFetchUserApiKeys: vi.fn().mockImplementation((keyIds: string[]) => {
      const result = new Map();
      for (const keyId of keyIds) {
        const data = mockKeyData.get(keyId);
        if (data) {
          result.set(keyId, data);
        }
      }
      return Promise.resolve(result);
    }),
  };
});

vi.mock('@/libs/Auth', () => ({
  auth: mockAuthInstance,
}));

vi.mock('@/libs/provider-factory', () => ({
  fetchUserApiKeys: mockFetchUserApiKeys,
  buildProviderConfigs: vi.fn().mockImplementation((models, keyMap) => {
    return models.map((model: { keyId: string; modelId: string }) => {
      const keyData = keyMap.get(model.keyId);
      if (!keyData) {
        throw new Error(`API key not found: ${model.keyId}`);
      }
      return {
        provider: { providerId: keyData.providerName },
        model: model.modelId,
        options: {},
      };
    });
  }),
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
    compatible: vi.fn((_provider: string) => ({ providerId: 'compatible' })),
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
        keyId: TEST_OPENAI_KEY_ID,
        modelId: 'gpt-4o',
        options: {
          temperature: 0.7,
          maxTokens: 2048,
        },
      },
      {
        keyId: TEST_ANTHROPIC_KEY_ID,
        modelId: 'claude-3-5-sonnet-20241022',
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
          keyId: TEST_DEEPSEEK_KEY_ID,
          modelId: 'deepseek-chat',
        },
        {
          keyId: TEST_GOOGLE_KEY_ID,
          modelId: 'gemini-pro',
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

  it('should return 403 when using unauthorized API key', async () => {
    const requestWithUnauthorizedKey = {
      ...validRequestBody,
      models: [
        {
          keyId: TEST_UNAUTHORIZED_KEY_ID,
          modelId: 'test-model',
        },
      ],
    };

    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/arena/compare',
      requestWithUnauthorizedKey,
    );

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(403);
    expect(data.error).toBe('API key not found or not authorized');
    expect(data.keyIds).toContain(TEST_UNAUTHORIZED_KEY_ID);
  });

  it('should return 400 when keyId is not a valid UUID', async () => {
    const requestWithInvalidKeyId = {
      ...validRequestBody,
      models: [
        {
          keyId: 'not-a-valid-uuid',
          modelId: 'test-model',
        },
      ],
    };

    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/arena/compare',
      requestWithInvalidKeyId,
    );

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });
});
