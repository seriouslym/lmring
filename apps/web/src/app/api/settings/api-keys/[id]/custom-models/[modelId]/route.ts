import { and, db, eq } from '@lmring/database';
import { apiKeys, userCustomModels, userEnabledModels } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; modelId: string }> },
) {
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
    const { id: keyId, modelId } = await params;

    if (!uuidRegex.test(keyId)) {
      return NextResponse.json(
        { error: 'INVALID_ID', message: 'Invalid API key ID format' },
        { status: 400 },
      );
    }

    if (!modelId || modelId.length > 200) {
      return NextResponse.json(
        { error: 'INVALID_MODEL_ID', message: 'Invalid model ID' },
        { status: 400 },
      );
    }

    const [key] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
      .limit(1);

    if (!key) {
      return NextResponse.json(
        { error: 'API_KEY_NOT_FOUND', message: 'API key configuration not found' },
        { status: 404 },
      );
    }

    const deletedModels = await db
      .delete(userCustomModels)
      .where(and(eq(userCustomModels.apiKeyId, keyId), eq(userCustomModels.modelId, modelId)))
      .returning();

    if (deletedModels.length === 0) {
      return NextResponse.json(
        { error: 'MODEL_NOT_FOUND', message: 'Custom model not found' },
        { status: 404 },
      );
    }

    await db
      .delete(userEnabledModels)
      .where(and(eq(userEnabledModels.apiKeyId, keyId), eq(userEnabledModels.modelId, modelId)));

    return NextResponse.json({ message: 'Custom model deleted successfully' }, { status: 200 });
  } catch (error) {
    logError('Delete custom model error', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to delete custom model',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
