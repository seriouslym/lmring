import { fetchAvailableModels, getDefaultProviderUrl, getProviderById } from '@lmring/ai-hub';
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
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      );
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

    // Get the API key configuration
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

    // Decrypt the API key
    const decryptedKey = decrypt(key.encryptedKey);

    // Get the base URL (custom proxy or default)
    const baseUrl = key.proxyUrl ?? getDefaultProviderUrl(key.providerName);

    if (!baseUrl) {
      return NextResponse.json(
        {
          error: 'NO_BASE_URL',
          message: `No API URL configured for provider: ${key.providerName}`,
        },
        { status: 400 },
      );
    }

    // Fetch available models
    const result = await fetchAvailableModels(key.providerName, decryptedKey, baseUrl);

    // Get provider display name
    const provider = getProviderById(key.providerName);
    const providerDisplayName = provider?.name ?? key.providerName;

    return NextResponse.json(
      {
        providerId: key.providerName,
        providerName: providerDisplayName,
        proxyUrl: baseUrl,
        models: result.models,
        source: result.source,
      },
      { status: 200 },
    );
  } catch (error) {
    logError('Fetch models error', error);

    // Check if it's an API error (invalid key, etc.)
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'INVALID_API_KEY', message: 'The API key is invalid or expired' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        error: 'PROVIDER_ERROR',
        message: 'Failed to fetch models from provider',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
