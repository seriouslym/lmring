import { db, eq } from '@lmring/database';
import { apiKeys, userCustomModels } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';

/**
 * GET /api/settings/api-keys/all/custom-models
 * Returns all custom models for all API keys belonging to the current user
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

    // Get all custom models for the user
    const allCustomModels = await db
      .select({
        apiKeyId: userCustomModels.apiKeyId,
        id: userCustomModels.id,
        modelId: userCustomModels.modelId,
        displayName: userCustomModels.displayName,
        createdAt: userCustomModels.createdAt,
      })
      .from(userCustomModels)
      .where(eq(userCustomModels.userId, userId));

    // Group by apiKeyId
    const modelsByApiKeyId: Record<
      string,
      Array<{ id: string; modelId: string; displayName: string | null; createdAt: Date }>
    > = {};

    for (const model of allCustomModels) {
      const arr = modelsByApiKeyId[model.apiKeyId] ?? [];
      arr.push({
        id: model.id,
        modelId: model.modelId,
        displayName: model.displayName,
        createdAt: model.createdAt,
      });
      modelsByApiKeyId[model.apiKeyId] = arr;
    }

    return NextResponse.json({ models: modelsByApiKeyId }, { status: 200 });
  } catch (error) {
    logError('Fetch all custom models error', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to fetch custom models',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
