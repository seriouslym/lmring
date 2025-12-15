import { db, eq } from '@lmring/database';
import { apiKeys, userModelOverrides } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';

/**
 * GET /api/settings/api-keys/all/model-overrides
 * Returns all model overrides for all API keys belonging to the current user
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
      return NextResponse.json({ overrides: {} }, { status: 200 });
    }

    // Get all model overrides for the user
    const allOverrides = await db
      .select({
        apiKeyId: userModelOverrides.apiKeyId,
        modelId: userModelOverrides.modelId,
        displayName: userModelOverrides.displayName,
        groupName: userModelOverrides.groupName,
        abilities: userModelOverrides.abilities,
        supportsStreaming: userModelOverrides.supportsStreaming,
        priceCurrency: userModelOverrides.priceCurrency,
        inputPrice: userModelOverrides.inputPrice,
        outputPrice: userModelOverrides.outputPrice,
      })
      .from(userModelOverrides)
      .where(eq(userModelOverrides.userId, userId));

    // Group by apiKeyId
    const overridesByApiKeyId: Record<
      string,
      Array<{
        modelId: string;
        displayName: string | null;
        groupName: string | null;
        abilities: Record<string, boolean> | null;
        supportsStreaming: boolean | null;
        priceCurrency: string | null;
        inputPrice: number | null;
        outputPrice: number | null;
      }>
    > = {};

    for (const override of allOverrides) {
      const arr = overridesByApiKeyId[override.apiKeyId] ?? [];
      arr.push({
        modelId: override.modelId,
        displayName: override.displayName,
        groupName: override.groupName,
        abilities: override.abilities as Record<string, boolean> | null,
        supportsStreaming: override.supportsStreaming,
        priceCurrency: override.priceCurrency,
        inputPrice: override.inputPrice,
        outputPrice: override.outputPrice,
      });
      overridesByApiKeyId[override.apiKeyId] = arr;
    }

    return NextResponse.json({ overrides: overridesByApiKeyId }, { status: 200 });
  } catch (error) {
    logError('Fetch all model overrides error', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to fetch model overrides',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
