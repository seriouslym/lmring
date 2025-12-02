import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/conversations/[id]/messages/route';
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
}));

setupTestEnvironment();

describe('Conversation Messages API', () => {
  const mockConversation = {
    id: 'conv-123',
    userId: 'test-user-id',
    title: 'Test Conversation',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessage = {
    id: 'msg-123',
    conversationId: 'conv-123',
    role: 'user' as const,
    content: 'Hello, how are you?',
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/conversations/[id]/messages', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(mockAuthInstance.api.getSession).mockResolvedValueOnce(null);

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/conversations/conv-123/messages',
      );
      const response = await GET(request, { params: Promise.resolve({ id: 'conv-123' }) });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 404 when conversation not found', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([]);

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/conversations/conv-123/messages',
      );
      const response = await GET(request, { params: Promise.resolve({ id: 'conv-123' }) });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Conversation not found' });
    });

    it('should return 404 when conversation belongs to different user', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([]);

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/conversations/conv-123/messages',
      );
      const response = await GET(request, { params: Promise.resolve({ id: 'conv-123' }) });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Conversation not found' });
    });

    it('should return messages ordered by createdAt', async () => {
      const messages = [
        { ...mockMessage, id: 'msg-1', createdAt: new Date('2024-01-01') },
        { ...mockMessage, id: 'msg-2', createdAt: new Date('2024-01-02') },
        { ...mockMessage, id: 'msg-3', createdAt: new Date('2024-01-03') },
      ];

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockConversation]);

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.orderBy.mockResolvedValue(messages);

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/conversations/conv-123/messages',
      );
      const response = await GET(request, { params: Promise.resolve({ id: 'conv-123' }) });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.messages).toBeDefined();
      expect(Array.isArray(data.messages)).toBe(true);
      expect(data.messages).toHaveLength(3);
    });
  });

  describe('POST /api/conversations/[id]/messages', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(mockAuthInstance.api.getSession).mockResolvedValueOnce(null);

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/conversations/conv-123/messages',
        {
          role: 'user',
          content: 'New message',
        },
      );

      const response = await POST(request, { params: Promise.resolve({ id: 'conv-123' }) });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 when role is missing', async () => {
      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/conversations/conv-123/messages',
        {
          content: 'New message',
        },
      );

      const response = await POST(request, { params: Promise.resolve({ id: 'conv-123' }) });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 when content is missing', async () => {
      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/conversations/conv-123/messages',
        {
          role: 'user',
        },
      );

      const response = await POST(request, { params: Promise.resolve({ id: 'conv-123' }) });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 404 when conversation not found', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([]);

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/conversations/conv-123/messages',
        {
          role: 'user',
          content: 'New message',
        },
      );

      const response = await POST(request, { params: Promise.resolve({ id: 'conv-123' }) });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Conversation not found' });
    });

    it('should create a new message and update conversation updatedAt', async () => {
      mockDbInstance.select.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.from.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.where.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockConversation]);

      mockDbInstance.insert.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.values.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.returning.mockResolvedValueOnce([mockMessage]);

      mockDbInstance.update.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.set.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.where.mockResolvedValueOnce(undefined);

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/conversations/conv-123/messages',
        {
          role: 'user',
          content: 'New message',
        },
      );

      const response = await POST(request, { params: Promise.resolve({ id: 'conv-123' }) });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(201);
      expect(data.message).toBeDefined();
      expect(data.message.content).toBe('Hello, how are you?');
      expect(mockDbInstance.update).toHaveBeenCalled();
    });

    it('should handle different message roles', async () => {
      const roles: Array<'user' | 'assistant' | 'system'> = ['user', 'assistant', 'system'];

      for (const role of roles) {
        mockDbInstance.select.mockReturnValueOnce(mockDbInstance);
        mockDbInstance.from.mockReturnValueOnce(mockDbInstance);
        mockDbInstance.where.mockReturnValueOnce(mockDbInstance);
        mockDbInstance.limit.mockResolvedValueOnce([mockConversation]);

        mockDbInstance.insert.mockReturnValueOnce(mockDbInstance);
        mockDbInstance.values.mockReturnValueOnce(mockDbInstance);
        mockDbInstance.returning.mockResolvedValueOnce([{ ...mockMessage, role }]);

        mockDbInstance.update.mockReturnValueOnce(mockDbInstance);
        mockDbInstance.set.mockReturnValueOnce(mockDbInstance);
        mockDbInstance.where.mockResolvedValueOnce(undefined);

        const request = createMockRequest(
          'POST',
          'http://localhost:3000/api/conversations/conv-123/messages',
          {
            role,
            content: `Message from ${role}`,
          },
        );

        const response = await POST(request, { params: Promise.resolve({ id: 'conv-123' }) });
        const data = await parseJsonResponse(response);

        expect(response.status).toBe(201);
        expect(data.message.role).toBe(role);
      }
    });
  });
});
