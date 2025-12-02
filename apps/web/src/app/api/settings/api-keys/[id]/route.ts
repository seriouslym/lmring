import { getDefaultProviderUrl } from '@lmring/ai-hub';
import { and, db, decrypt, eq } from '@lmring/database';
import { apiKeys } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: keyId } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    const decryptedKey = decrypt(key.encryptedKey);

    return NextResponse.json(
      {
        id: key.id,
        providerName: key.providerName,
        apiKey: decryptedKey,
        proxyUrl: key.proxyUrl ?? getDefaultProviderUrl(key.providerName),
        configSource: key.configSource,
      },
      { status: 200 },
    );
  } catch (error) {
    logError('Get API key error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
