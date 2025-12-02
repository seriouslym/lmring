import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/leaderboard/route';
import { DELETE, GET as GET_VOTES, POST } from '@/app/api/votes/route';
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
  userVotes: {
    id: 'id',
    userId: 'userId',
    messageId: 'messageId',
    modelResponseId: 'modelResponseId',
    voteType: 'voteType',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
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
  modelRankings: {
    id: 'id',
    modelName: 'modelName',
    providerName: 'providerName',
    totalLikes: 'totalLikes',
    totalDislikes: 'totalDislikes',
    totalNeutral: 'totalNeutral',
    rankingScore: 'rankingScore',
    updatedAt: 'updatedAt',
  },
  messages: {
    id: 'id',
    conversationId: 'conversationId',
    role: 'role',
    content: 'content',
    createdAt: 'createdAt',
  },
  conversations: {
    id: 'id',
    userId: 'userId',
    title: 'title',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
}));

setupTestEnvironment();

describe('Votes and Leaderboard API', () => {
  // Use valid UUIDs for test data
  const TEST_MESSAGE_ID = '550e8400-e29b-41d4-a716-446655440001';
  const TEST_RESPONSE_ID = '550e8400-e29b-41d4-a716-446655440002';
  const TEST_VOTE_ID = '550e8400-e29b-41d4-a716-446655440003';
  const TEST_CONVERSATION_ID = '550e8400-e29b-41d4-a716-446655440004';

  const mockVote = {
    id: TEST_VOTE_ID,
    userId: 'test-user-id',
    messageId: TEST_MESSAGE_ID,
    modelResponseId: TEST_RESPONSE_ID,
    voteType: 'like' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockModelResponse = {
    id: TEST_RESPONSE_ID,
    messageId: TEST_MESSAGE_ID,
    modelName: 'gpt-4o',
    providerName: 'openai',
    responseContent: 'Test response',
    tokensUsed: 100,
    responseTimeMs: 1500,
    createdAt: new Date(),
  };

  const mockMessage = {
    id: TEST_MESSAGE_ID,
    conversationId: TEST_CONVERSATION_ID,
    userId: 'test-user-id',
    role: 'user' as const,
    content: 'Test message',
    createdAt: new Date(),
  };

  const mockRanking = {
    id: 'rank-123',
    modelName: 'gpt-4o',
    providerName: 'openai',
    totalLikes: 100,
    totalDislikes: 10,
    totalNeutral: 5,
    rankingScore: 86.96,
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/votes', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(mockAuthInstance.api.getSession).mockResolvedValueOnce(null);

      const request = createMockRequest('POST', 'http://localhost:3000/api/votes', {
        messageId: TEST_MESSAGE_ID,
        modelResponseId: TEST_RESPONSE_ID,
        voteType: 'like',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 when required fields are missing', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/votes', {
        messageId: TEST_MESSAGE_ID,
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should create a new vote', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.innerJoin.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockMessage]);

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockModelResponse]);

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([]);

      mockDbInstance.insert.mockReturnValue(mockDbInstance);
      mockDbInstance.values.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([mockVote]);

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.innerJoin.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.groupBy.mockResolvedValue([
        { voteType: 'like', count: 10 },
        { voteType: 'dislike', count: 2 },
      ]);

      mockDbInstance.insert.mockReturnValue(mockDbInstance);
      mockDbInstance.values.mockReturnValue(mockDbInstance);
      mockDbInstance.onConflictDoUpdate.mockResolvedValue([mockRanking]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/votes', {
        messageId: TEST_MESSAGE_ID,
        modelResponseId: TEST_RESPONSE_ID,
        voteType: 'like',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(201);
      expect(data.vote).toBeDefined();
      expect(data.vote.voteType).toBe('like');
    });

    it('should update existing vote', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.innerJoin.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockMessage]);

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockModelResponse]);

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockVote]);

      mockDbInstance.update.mockReturnValue(mockDbInstance);
      mockDbInstance.set.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([{ ...mockVote, voteType: 'dislike' }]);

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.innerJoin.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.groupBy.mockResolvedValue([{ voteType: 'dislike', count: 3 }]);

      mockDbInstance.insert.mockReturnValue(mockDbInstance);
      mockDbInstance.values.mockReturnValue(mockDbInstance);
      mockDbInstance.onConflictDoUpdate.mockResolvedValue([mockRanking]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/votes', {
        messageId: TEST_MESSAGE_ID,
        modelResponseId: TEST_RESPONSE_ID,
        voteType: 'dislike',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.vote.voteType).toBe('dislike');
    });
  });

  describe('GET /api/votes', () => {
    it('should return user votes', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockResolvedValue([mockVote]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/votes');
      const response = await GET_VOTES(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.votes).toBeDefined();
      expect(Array.isArray(data.votes)).toBe(true);
    });
  });

  describe('DELETE /api/votes', () => {
    it('should delete vote', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockVote]);

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockModelResponse]);

      mockDbInstance.delete.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockResolvedValue(undefined);

      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.innerJoin.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.groupBy.mockResolvedValue([]);

      mockDbInstance.insert.mockReturnValue(mockDbInstance);
      mockDbInstance.values.mockReturnValue(mockDbInstance);
      mockDbInstance.onConflictDoUpdate.mockResolvedValue([mockRanking]);

      const request = createMockRequest(
        'DELETE',
        `http://localhost:3000/api/votes?id=${TEST_VOTE_ID}`,
      );
      const response = await DELETE(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Vote deleted successfully' });
    });
  });

  describe('GET /api/leaderboard', () => {
    it('should return model rankings', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.orderBy.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockReturnValue(mockDbInstance);
      mockDbInstance.offset.mockResolvedValue([mockRanking]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/leaderboard');
      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.rankings).toBeDefined();
      expect(Array.isArray(data.rankings)).toBe(true);
    });

    it('should support pagination', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.orderBy.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockReturnValue(mockDbInstance);
      mockDbInstance.offset.mockResolvedValue([mockRanking]);

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/leaderboard?limit=10&offset=5',
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockDbInstance.limit).toHaveBeenCalledWith(10);
      expect(mockDbInstance.offset).toHaveBeenCalledWith(5);
    });
  });
});
