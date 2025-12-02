import { getDefaultProviderUrl } from '@lmring/ai-hub';
import { and, db, encrypt, eq } from '@lmring/database';
import { apiKeys } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';
import { apiKeySchema } from '@/libs/validation';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const keys = await db
      .select({
        id: apiKeys.id,
        providerName: apiKeys.providerName,
        proxyUrl: apiKeys.proxyUrl,
        configSource: apiKeys.configSource,
        createdAt: apiKeys.createdAt,
        updatedAt: apiKeys.updatedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));

    // Add default URL fallback for each key
    const keysWithDefaults = keys.map((key) => ({
      ...key,
      proxyUrl: key.proxyUrl ?? getDefaultProviderUrl(key.providerName),
    }));

    return NextResponse.json({ keys: keysWithDefaults }, { status: 200 });
  } catch (error) {
    logError('Get API keys error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const rawBody = await request.json();

    const validationResult = apiKeySchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const body = validationResult.data;

    const existing = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.providerName, body.providerName)))
      .limit(1);

    const encryptedKey = encrypt(body.apiKey);

    // Normalize empty string to null for storage
    const proxyUrlToStore = body.proxyUrl?.trim() || null;

    const [existingKey] = existing;
    if (existingKey) {
      await db
        .update(apiKeys)
        .set({
          encryptedKey,
          proxyUrl: proxyUrlToStore,
          updatedAt: new Date(),
        })
        .where(eq(apiKeys.id, existingKey.id));

      return NextResponse.json(
        {
          message: 'API key updated successfully',
          id: existingKey.id,
          providerName: body.providerName,
          proxyUrl: proxyUrlToStore ?? getDefaultProviderUrl(body.providerName),
        },
        { status: 200 },
      );
    }

    const [newKey] = await db
      .insert(apiKeys)
      .values({
        userId,
        providerName: body.providerName,
        encryptedKey,
        proxyUrl: proxyUrlToStore,
        configSource: 'manual',
      })
      .returning();

    return NextResponse.json(
      {
        message: 'API key added successfully',
        id: newKey?.id,
        providerName: body.providerName,
        proxyUrl: proxyUrlToStore ?? getDefaultProviderUrl(body.providerName),
      },
      { status: 201 },
    );
  } catch (error) {
    logError('Add API key error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await db.delete(apiKeys).where(eq(apiKeys.id, keyId));

    return NextResponse.json({ message: 'API key deleted successfully' }, { status: 200 });
  } catch (error) {
    logError('Delete API key error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
