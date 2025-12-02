import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/model-responses/route';
import { createMockRequest, parseJsonResponse, setupTestEnvironment } from '@/test/helpers';

const { mockDbInstance, mockAuthInstance } = vi.hoisted(() => {
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
    mockDbInstance: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockReturnThis(),
    },
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

vi.mock('@lmring/database', () => ({
  db: mockDbInstance,
  eq: vi.fn(),
  and: vi.fn(),
  or: vi.fn(),
  desc: vi.fn(),
  asc: vi.fn(),
  sql: vi.fn(),
  gt: vi.fn(),
  gte: vi.fn(),
  lt: vi.fn(),
  lte: vi.fn(),
  ne: vi.fn(),
}));

vi.mock('@lmring/database/schema', () => ({
  conversations: {
    id: 'id',
    userId: 'userId',
    title: 'title',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  messages: {
    id: 'id',
    conversationId: 'conversationId',
    role: 'role',
    content: 'content',
    createdAt: 'createdAt',
  },
  modelResponses: {
    id: 'id',
    messageId: 'messageId',
    modelName: 'modelName',
    providerName: 'providerName',
    responseContent: 'responseContent',
    tokensUsed: 'tokensUsed',
    responseTimeMs: 'responseTimeMs',
    createdAt: 'createdAt',
  },
}));

setupTestEnvironment();

describe('Model Responses API', () => {
  const mockMessage = {
    id: 'msg-123',
    conversationId: 'conv-123',
    userId: 'test-user-id',
  };

  const mockModelResponse = {
    id: 'resp-123',
    messageId: 'msg-123',
    modelName: 'gpt-4o',
    providerName: 'openai',
    responseContent: 'This is a test response from GPT-4o',
    tokensUsed: 150,
    responseTimeMs: 1500,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/model-responses', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(mockAuthInstance.api.getSession).mockResolvedValueOnce(null);

      const request = createMockRequest('POST', 'http://localhost:3000/api/model-responses', {
        messageId: 'msg-123',
        modelName: 'gpt-4o',
        providerName: 'openai',
        responseContent: 'Test response',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 when messageId is missing', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/model-responses', {
        modelName: 'gpt-4o',
        providerName: 'openai',
        responseContent: 'Test response',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 when modelName is missing', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/model-responses', {
        messageId: 'msg-123',
        providerName: 'openai',
        responseContent: 'Test response',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 when providerName is missing', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/model-responses', {
        messageId: 'msg-123',
        modelName: 'gpt-4o',
        responseContent: 'Test response',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 when responseContent is missing', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/model-responses', {
        messageId: 'msg-123',
        modelName: 'gpt-4o',
        providerName: 'openai',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 when messageId is not a valid UUID', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/model-responses', {
        messageId: 'invalid-uuid',
        modelName: 'gpt-4o',
        providerName: 'openai',
        responseContent: 'Test response',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 404 when message not found', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.innerJoin.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/model-responses', {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        modelName: 'gpt-4o',
        providerName: 'openai',
        responseContent: 'Test response',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Message not found or unauthorized' });
    });

    it('should return 404 when message belongs to different user', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.innerJoin.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([{ ...mockMessage, userId: 'different-user-id' }]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/model-responses', {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        modelName: 'gpt-4o',
        providerName: 'openai',
        responseContent: 'Test response',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Message not found or unauthorized' });
    });

    it('should create model response with all fields', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.innerJoin.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([mockMessage]);

      mockDbInstance.insert.mockReturnValue(mockDbInstance);
      mockDbInstance.values.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([mockModelResponse]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/model-responses', {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        modelName: 'gpt-4o',
        providerName: 'openai',
        responseContent: 'This is a test response from GPT-4o',
        tokensUsed: 150,
        responseTimeMs: 1500,
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(201);
      expect(data.response).toBeDefined();
      expect(data.response.modelName).toBe('gpt-4o');
      expect(data.response.providerName).toBe('openai');
      expect(data.response.tokensUsed).toBe(150);
      expect(data.response.responseTimeMs).toBe(1500);
    });

    it('should create model response without optional fields', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.innerJoin.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([mockMessage]);

      const responseWithoutOptionals = {
        ...mockModelResponse,
        tokensUsed: undefined,
        responseTimeMs: undefined,
      };

      mockDbInstance.insert.mockReturnValue(mockDbInstance);
      mockDbInstance.values.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([responseWithoutOptionals]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/model-responses', {
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        modelName: 'gpt-4o',
        providerName: 'openai',
        responseContent: 'This is a test response from GPT-4o',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(201);
      expect(data.response).toBeDefined();
      expect(data.response.modelName).toBe('gpt-4o');
    });
  });

  describe('GET /api/model-responses', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(mockAuthInstance.api.getSession).mockResolvedValueOnce(null);

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/model-responses?messageId=msg-123',
      );

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 when messageId is missing', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/model-responses');

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'messageId is required' });
    });

    it('should return empty array when no responses found', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockResolvedValue([]);

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/model-responses?messageId=msg-123',
      );

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.responses).toEqual([]);
    });

    it('should return model responses for given messageId', async () => {
      const responses = [
        mockModelResponse,
        {
          ...mockModelResponse,
          id: 'resp-456',
          modelName: 'claude-3-5-sonnet-20241022',
          providerName: 'anthropic',
          responseContent: 'This is a test response from Claude',
        },
      ];

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockResolvedValue(responses);

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/model-responses?messageId=msg-123',
      );

      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.responses).toBeDefined();
      expect(Array.isArray(data.responses)).toBe(true);
      expect(data.responses).toHaveLength(2);
      expect(data.responses[0].modelName).toBe('gpt-4o');
      expect(data.responses[1].modelName).toBe('claude-3-5-sonnet-20241022');
    });
  });
});
