import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, PUT } from '@/app/api/user/preferences/route';
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
  userPreferences: {
    id: 'id',
    userId: 'userId',
    theme: 'theme',
    language: 'language',
    defaultModels: 'defaultModels',
    configSource: 'configSource',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
}));

setupTestEnvironment();

describe('User Preferences API', () => {
  const mockPreferences = {
    id: 'pref-123',
    userId: 'test-user-id',
    theme: 'dark',
    language: 'en',
    defaultModels: ['gpt-4o', 'claude-3-5-sonnet-20241022'],
    configSource: 'manual' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/user/preferences', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(mockAuthInstance.api.getSession).mockResolvedValueOnce(null);

      const request = createMockRequest('GET', 'http://localhost:3000/api/user/preferences');
      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return existing preferences', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([mockPreferences]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/user/preferences');
      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.preferences).toBeDefined();
      expect(data.preferences.theme).toBe('dark');
      expect(data.preferences.language).toBe('en');
      expect(data.preferences.defaultModels).toEqual(['gpt-4o', 'claude-3-5-sonnet-20241022']);
    });

    it('should create default preferences when none exist', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([]);

      const defaultPreferences = {
        id: 'pref-new',
        userId: 'test-user-id',
        theme: 'system',
        language: 'en',
        defaultModels: null,
        configSource: 'manual' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDbInstance.insert.mockReturnValue(mockDbInstance);
      mockDbInstance.values.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([defaultPreferences]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/user/preferences');
      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.preferences).toBeDefined();
      expect(data.preferences.theme).toBe('system');
      expect(data.preferences.language).toBe('en');
      expect(data.preferences.configSource).toBe('manual');
    });
  });

  describe('PUT /api/user/preferences', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(mockAuthInstance.api.getSession).mockResolvedValueOnce(null);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/user/preferences', {
        theme: 'dark',
      });

      const response = await PUT(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should update existing preferences', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([mockPreferences]);

      const updatedPreferences = {
        ...mockPreferences,
        theme: 'light',
        updatedAt: new Date(),
      };

      mockDbInstance.update.mockReturnValue(mockDbInstance);
      mockDbInstance.set.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([updatedPreferences]);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/user/preferences', {
        theme: 'light',
      });

      const response = await PUT(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.preferences).toBeDefined();
      expect(data.preferences.theme).toBe('light');
    });

    it('should update language preference', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([mockPreferences]);

      const updatedPreferences = {
        ...mockPreferences,
        language: 'zh-CN',
        updatedAt: new Date(),
      };

      mockDbInstance.update.mockReturnValue(mockDbInstance);
      mockDbInstance.set.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([updatedPreferences]);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/user/preferences', {
        language: 'zh-CN',
      });

      const response = await PUT(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.preferences.language).toBe('zh-CN');
    });

    it('should update default models', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([mockPreferences]);

      const newModels = ['gpt-4o-mini', 'claude-3-opus'];
      const updatedPreferences = {
        ...mockPreferences,
        defaultModels: newModels,
        updatedAt: new Date(),
      };

      mockDbInstance.update.mockReturnValue(mockDbInstance);
      mockDbInstance.set.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([updatedPreferences]);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/user/preferences', {
        defaultModels: newModels,
      });

      const response = await PUT(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.preferences.defaultModels).toEqual(newModels);
    });

    it('should update configSource', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([mockPreferences]);

      const updatedPreferences = {
        ...mockPreferences,
        configSource: 'cherry-studio' as const,
        updatedAt: new Date(),
      };

      mockDbInstance.update.mockReturnValue(mockDbInstance);
      mockDbInstance.set.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([updatedPreferences]);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/user/preferences', {
        configSource: 'cherry-studio',
      });

      const response = await PUT(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.preferences.configSource).toBe('cherry-studio');
    });

    it('should update multiple fields at once', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([mockPreferences]);

      const updatedPreferences = {
        ...mockPreferences,
        theme: 'light',
        language: 'zh-CN',
        defaultModels: ['gpt-4o-mini'],
        updatedAt: new Date(),
      };

      mockDbInstance.update.mockReturnValue(mockDbInstance);
      mockDbInstance.set.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([updatedPreferences]);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/user/preferences', {
        theme: 'light',
        language: 'zh-CN',
        defaultModels: ['gpt-4o-mini'],
      });

      const response = await PUT(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.preferences.theme).toBe('light');
      expect(data.preferences.language).toBe('zh-CN');
      expect(data.preferences.defaultModels).toEqual(['gpt-4o-mini']);
    });

    it('should create preferences if none exist', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([]);

      const newPreferences = {
        id: 'pref-new',
        userId: 'test-user-id',
        theme: 'dark',
        language: 'en',
        defaultModels: ['gpt-4o'],
        configSource: 'manual' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDbInstance.insert.mockReturnValue(mockDbInstance);
      mockDbInstance.values.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([newPreferences]);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/user/preferences', {
        theme: 'dark',
        defaultModels: ['gpt-4o'],
      });

      const response = await PUT(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(201);
      expect(data.preferences).toBeDefined();
      expect(data.preferences.theme).toBe('dark');
      expect(data.preferences.defaultModels).toEqual(['gpt-4o']);
    });

    it('should preserve unchanged fields', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([mockPreferences]);

      const updatedPreferences = {
        ...mockPreferences,
        theme: 'light',
        updatedAt: new Date(),
      };

      mockDbInstance.update.mockReturnValue(mockDbInstance);
      mockDbInstance.set.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([updatedPreferences]);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/user/preferences', {
        theme: 'light',
      });

      const response = await PUT(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.preferences.language).toBe('en');
      expect(data.preferences.defaultModels).toEqual(['gpt-4o', 'claude-3-5-sonnet-20241022']);
    });
  });
});
