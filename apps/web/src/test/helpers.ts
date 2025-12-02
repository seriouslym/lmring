import type { Session } from '@lmring/auth';
import { beforeEach, vi } from 'vitest';

export const mockSession: Session = {
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

export function mockAuth(session: Session | null = mockSession) {
  return {
    api: {
      getSession: vi.fn().mockResolvedValue(session),
    },
  };
}

export function mockDb() {
  return {
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
  };
}

export function createMockRequest(
  method: string,
  url: string,
  body?: unknown,
  headers?: Record<string, string>,
): Request {
  return new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function parseJsonResponse(response: Response) {
  return response.json();
}

export function mockEncryption() {
  return {
    encrypt: vi.fn((key: string) => `encrypted_${key}`),
    decrypt: vi.fn((encrypted: string) => encrypted.replace('encrypted_', '')),
  };
}

export function setupTestEnvironment() {
  beforeEach(() => {
    vi.clearAllMocks();
  });
}
