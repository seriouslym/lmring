import { and, db, eq } from '@lmring/database';
import { apiKeys, userModelOverrides } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';
import { modelOverrideSchema } from '@/libs/validation';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET: List all model overrides for an API key
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

    const overrides = await db
      .select({
        id: userModelOverrides.id,
        modelId: userModelOverrides.modelId,
        displayName: userModelOverrides.displayName,
        groupName: userModelOverrides.groupName,
        abilities: userModelOverrides.abilities,
        supportsStreaming: userModelOverrides.supportsStreaming,
        priceCurrency: userModelOverrides.priceCurrency,
        inputPrice: userModelOverrides.inputPrice,
        outputPrice: userModelOverrides.outputPrice,
        createdAt: userModelOverrides.createdAt,
      })
      .from(userModelOverrides)
      .where(eq(userModelOverrides.apiKeyId, keyId));

    return NextResponse.json({ overrides }, { status: 200 });
  } catch (error) {
    logError('Fetch model overrides error', error);
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

// POST: Create or update a model override
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
    const validationResult = modelOverrideSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const {
      modelId,
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

    const now = new Date();

    // Use upsert to create or update
    const insertedOverrides = await db
      .insert(userModelOverrides)
      .values({
        userId,
        apiKeyId: keyId,
        modelId,
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

    const override = insertedOverrides[0];
    if (!override) {
      return NextResponse.json(
        { error: 'INSERT_FAILED', message: 'Failed to save model override' },
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
      { status: 201 },
    );
  } catch (error) {
    logError('Create model override error', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to create model override',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
