import { and, db, eq } from '@lmring/database';
import { apiKeys, userCustomModels, userEnabledModels } from '@lmring/database/schema';
import { getModelIdsForProvider } from '@lmring/model-depot';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { API_ERRORS } from '@/libs/error-constants';
import { logError } from '@/libs/error-logging';
import { customModelSchema } from '@/libs/validation';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET: List all custom models for an API key
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: keyId } = await params;

    if (!uuidRegex.test(keyId)) {
      return NextResponse.json(
        { error: 'INVALID_ID', message: 'Invalid API key ID format' },
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

    const customModels = await db
      .select({
        id: userCustomModels.id,
        modelId: userCustomModels.modelId,
        displayName: userCustomModels.displayName,
        createdAt: userCustomModels.createdAt,
      })
      .from(userCustomModels)
      .where(eq(userCustomModels.apiKeyId, keyId));

    return NextResponse.json({ models: customModels }, { status: 200 });
  } catch (error) {
    logError('Fetch custom models error', error);
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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: keyId } = await params;

    if (!uuidRegex.test(keyId)) {
      return NextResponse.json(
        { error: 'INVALID_ID', message: 'Invalid API key ID format' },
        { status: 400 },
      );
    }

    const rawBody = await request.json();
    const validationResult = customModelSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const { modelId, displayName } = validationResult.data;

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

    const [existingModel] = await db
      .select()
      .from(userCustomModels)
      .where(and(eq(userCustomModels.apiKeyId, keyId), eq(userCustomModels.modelId, modelId)))
      .limit(1);

    if (existingModel) {
      return NextResponse.json(
        { error: 'MODEL_EXISTS', message: 'A custom model with this ID already exists' },
        { status: 409 },
      );
    }

    // Check if the model ID conflicts with a built-in model
    const builtinModelIds = getModelIdsForProvider(key.providerName);
    if (builtinModelIds.includes(modelId)) {
      return NextResponse.json(
        {
          error: 'MODEL_ID_CONFLICTS_WITH_BUILTIN',
          message: API_ERRORS.MODEL_ID_CONFLICTS_WITH_BUILTIN,
        },
        { status: 409 },
      );
    }

    const now = new Date();

    const insertedModels = await db
      .insert(userCustomModels)
      .values({
        userId,
        apiKeyId: keyId,
        modelId,
        displayName: displayName || modelId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const newModel = insertedModels[0];
    if (!newModel) {
      return NextResponse.json(
        { error: 'INSERT_FAILED', message: 'Failed to insert custom model' },
        { status: 500 },
      );
    }

    await db
      .insert(userEnabledModels)
      .values({
        userId,
        apiKeyId: keyId,
        modelId,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userEnabledModels.apiKeyId, userEnabledModels.modelId],
        set: {
          enabled: true,
          updatedAt: now,
        },
      });

    return NextResponse.json(
      {
        id: newModel.id,
        modelId: newModel.modelId,
        displayName: newModel.displayName,
        enabled: true,
      },
      { status: 201 },
    );
  } catch (error) {
    logError('Create custom model error', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to create custom model',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
