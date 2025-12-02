import { getDefaultProviderUrl } from '@lmring/ai-hub';
import { and, db, decrypt, eq } from '@lmring/database';
import { apiKeys } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { provider: providerName } = await params;

    const [key] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.providerName, providerName)))
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
