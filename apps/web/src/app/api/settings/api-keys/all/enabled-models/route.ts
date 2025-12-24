import { db, eq } from '@lmring/database';
import { apiKeys, userEnabledModels } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';

/**
 * GET /api/settings/api-keys/all/enabled-models
 * Returns all enabled models for all API keys belonging to the current user
 * Grouped by apiKeyId for efficient batch retrieval
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Get all API keys for the user
    const userApiKeys = await db
      .select({ id: apiKeys.id, providerName: apiKeys.providerName })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));

    if (userApiKeys.length === 0) {
      return NextResponse.json({ models: {} }, { status: 200 });
    }

    // Get all enabled models for the user
    const allEnabledModels = await db
      .select({
        apiKeyId: userEnabledModels.apiKeyId,
        modelId: userEnabledModels.modelId,
        enabled: userEnabledModels.enabled,
      })
      .from(userEnabledModels)
      .where(eq(userEnabledModels.userId, userId));

    // Group by apiKeyId
    const modelsByApiKeyId: Record<string, Array<{ modelId: string; enabled: boolean }>> = {};

    for (const model of allEnabledModels) {
      const arr = modelsByApiKeyId[model.apiKeyId] ?? [];
      arr.push({
        modelId: model.modelId,
        enabled: model.enabled,
      });
      modelsByApiKeyId[model.apiKeyId] = arr;
    }

    return NextResponse.json({ models: modelsByApiKeyId }, { status: 200 });
  } catch (error) {
    logError('Fetch all enabled models error', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to fetch enabled models',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
