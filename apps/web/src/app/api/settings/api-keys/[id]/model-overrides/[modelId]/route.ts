import { and, db, eq } from '@lmring/database';
import { apiKeys, userModelOverrides } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';
import { customModelUpdateSchema } from '@/libs/validation';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PUT: Update a specific model override
export async function PUT(
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

    const rawBody = await request.json();
    const validationResult = customModelUpdateSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const {
      displayName,
      groupName,
      abilities,
      supportsStreaming,
      priceCurrency,
      inputPrice,
      outputPrice,
    } = validationResult.data;

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

    const decodedModelId = decodeURIComponent(modelId);
    const now = new Date();

    // Upsert the override
    const updatedOverrides = await db
      .insert(userModelOverrides)
      .values({
        userId,
        apiKeyId: keyId,
        modelId: decodedModelId,
        displayName: displayName || null,
        groupName: groupName || null,
        abilities: abilities || null,
        supportsStreaming: supportsStreaming ?? null,
        priceCurrency: priceCurrency || null,
        inputPrice: inputPrice ?? null,
        outputPrice: outputPrice ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userModelOverrides.apiKeyId, userModelOverrides.modelId],
        set: {
          displayName: displayName || null,
          groupName: groupName || null,
          abilities: abilities || null,
          supportsStreaming: supportsStreaming ?? null,
          priceCurrency: priceCurrency || null,
          inputPrice: inputPrice ?? null,
          outputPrice: outputPrice ?? null,
          updatedAt: now,
        },
      })
      .returning();

    const override = updatedOverrides[0];
    if (!override) {
      return NextResponse.json(
        { error: 'UPDATE_FAILED', message: 'Failed to update model override' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        id: override.id,
        modelId: override.modelId,
        displayName: override.displayName,
        groupName: override.groupName,
        abilities: override.abilities,
        supportsStreaming: override.supportsStreaming,
        priceCurrency: override.priceCurrency,
        inputPrice: override.inputPrice,
        outputPrice: override.outputPrice,
      },
      { status: 200 },
    );
  } catch (error) {
    logError('Update model override error', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to update model override',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// DELETE: Remove a model override (restore to default)
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

    const decodedModelId = decodeURIComponent(modelId);

    const deletedOverrides = await db
      .delete(userModelOverrides)
      .where(
        and(eq(userModelOverrides.apiKeyId, keyId), eq(userModelOverrides.modelId, decodedModelId)),
      )
      .returning();

    if (deletedOverrides.length === 0) {
      return NextResponse.json(
        { error: 'OVERRIDE_NOT_FOUND', message: 'Model override not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: 'Model override deleted successfully, restored to default' },
      { status: 200 },
    );
  } catch (error) {
    logError('Delete model override error', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to delete model override',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
