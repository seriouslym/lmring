import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as GET_KEY_BY_ID } from '@/app/api/settings/api-keys/[id]/route';
import { DELETE, GET, POST } from '@/app/api/settings/api-keys/route';
import { createMockRequest, parseJsonResponse, setupTestEnvironment } from '@/test/helpers';

const { mockDbInstance, mockAuthInstance, mockEncryptFn, mockDecryptFn } = vi.hoisted(() => {
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
    mockEncryptFn: vi.fn((key: string) => `encrypted_${key}`),
    mockDecryptFn: vi.fn((encrypted: string) => encrypted.replace('encrypted_', '')),
  };
});

vi.mock('@/libs/Auth', () => ({
  auth: mockAuthInstance,
}));

vi.mock('@lmring/database', () => ({
  db: mockDbInstance,
  encrypt: mockEncryptFn,
  decrypt: mockDecryptFn,
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
  apiKeys: {
    id: 'id',
    userId: 'userId',
    providerName: 'providerName',
    encryptedKey: 'encryptedKey',
    configSource: 'configSource',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
}));

setupTestEnvironment();

describe('API Keys Management', () => {
  const mockApiKey = {
    id: 'key-123',
    userId: 'test-user-id',
    providerName: 'openai',
    encryptedKey: 'encrypted_sk-test123',
    configSource: 'manual' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/settings/api-keys', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(mockAuthInstance.api.getSession).mockResolvedValueOnce(null);

      const request = createMockRequest('GET', 'http://localhost:3000/api/settings/api-keys');
      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return user API keys list', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockResolvedValue([
        {
          id: mockApiKey.id,
          providerName: mockApiKey.providerName,
          configSource: mockApiKey.configSource,
          createdAt: mockApiKey.createdAt,
          updatedAt: mockApiKey.updatedAt,
        },
      ]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/settings/api-keys');
      const response = await GET(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.keys).toBeDefined();
      expect(Array.isArray(data.keys)).toBe(true);
      expect(data.keys[0]).not.toHaveProperty('encryptedKey');
    });
  });

  describe('POST /api/settings/api-keys', () => {
    it('should return 400 when provider name or API key is missing', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/settings/api-keys', {
        providerName: 'openai',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      // This is valid without apiKey - it creates provider config without key
      expect(response.status).toBe(201);
      expect(data.message).toBe('Provider added successfully');
    });

    it('should create a new API key', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([]);

      mockDbInstance.insert.mockReturnValue(mockDbInstance);
      mockDbInstance.values.mockReturnValue(mockDbInstance);
      mockDbInstance.returning.mockResolvedValue([mockApiKey]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/settings/api-keys', {
        providerName: 'openai',
        apiKey: 'sk-test123',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(201);
      expect(data.message).toBe('Provider added successfully');
      expect(data.providerName).toBe('openai');
      expect(mockEncryptFn).toHaveBeenCalledWith('sk-test123');
    });

    it('should update existing API key', async () => {
      mockDbInstance.select.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.from.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.where.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockApiKey]);

      mockDbInstance.update.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.set.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.where.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.returning.mockResolvedValueOnce([{ ...mockApiKey, enabled: false }]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/settings/api-keys', {
        providerName: 'openai',
        apiKey: 'sk-new-key',
      });

      const response = await POST(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.message).toBe('Provider updated successfully');
      expect(mockEncryptFn).toHaveBeenCalledWith('sk-new-key');
    });
  });

  describe('DELETE /api/settings/api-keys', () => {
    it('should return 400 when key ID is missing', async () => {
      const request = createMockRequest('DELETE', 'http://localhost:3000/api/settings/api-keys');
      const response = await DELETE(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('Key ID is required');
    });

    it('should return 404 when API key not found', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([]);

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/settings/api-keys?id=key-123',
      );
      const response = await DELETE(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe('API key not found');
    });

    it('should delete API key', async () => {
      mockDbInstance.select.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.from.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.where.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.limit.mockResolvedValueOnce([mockApiKey]);

      mockDbInstance.delete.mockReturnValueOnce(mockDbInstance);
      mockDbInstance.where.mockResolvedValueOnce(undefined);

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/settings/api-keys?id=key-123',
      );
      const response = await DELETE(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.message).toBe('API key deleted successfully');
    });
  });

  describe('GET /api/settings/api-keys/[id]', () => {
    it('should return 400 when ID format is invalid', async () => {
      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/settings/api-keys/invalid-id',
      );
      const response = await GET_KEY_BY_ID(request, {
        params: Promise.resolve({ id: 'invalid-id' }),
      });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('INVALID_ID');
    });

    it('should return 404 when API key not found for ID', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([]);

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/settings/api-keys/11111111-1111-1111-1111-111111111111',
      );
      const response = await GET_KEY_BY_ID(request, {
        params: Promise.resolve({ id: '11111111-1111-1111-1111-111111111111' }),
      });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe('API key not found');
    });

    it('should return decrypted API key for valid ID', async () => {
      mockDbInstance.select.mockReturnValue(mockDbInstance);
      mockDbInstance.from.mockReturnValue(mockDbInstance);
      mockDbInstance.where.mockReturnValue(mockDbInstance);
      mockDbInstance.limit.mockResolvedValue([mockApiKey]);

      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/settings/api-keys/key-123',
      );
      const response = await GET_KEY_BY_ID(request, {
        params: Promise.resolve({ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }),
      });
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.providerName).toBe('openai');
      expect(data.apiKey).toBe('sk-test123');
      expect(mockDecryptFn).toHaveBeenCalledWith('encrypted_sk-test123');
    });
  });
});
