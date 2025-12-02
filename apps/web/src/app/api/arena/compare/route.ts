import { compareModels, type ModelMessage } from '@lmring/ai-hub';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';
import { buildProviderConfigs, fetchUserApiKeys } from '@/libs/provider-factory';
import { arenaCompareSchema } from '@/libs/validation';

interface CompareRequest {
  models: Array<{
    keyId: string;
    modelId: string;
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    };
  }>;
  messages: ModelMessage[];
  options?: {
    stopOnError?: boolean;
  };
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = (await request.json()) as CompareRequest;

    const validationResult = arenaCompareSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const body = validationResult.data;

    const keyIds = body.models.map((m) => m.keyId);
    const keyMap = await fetchUserApiKeys(keyIds, session.user.id);

    const missingKeys = keyIds.filter((id) => !keyMap.has(id));
    if (missingKeys.length > 0) {
      return NextResponse.json(
        { error: 'API key not found or not authorized', keyIds: missingKeys },
        { status: 403 },
      );
    }

    const providerConfigs = buildProviderConfigs(body.models, keyMap);

    const results = await compareModels(providerConfigs, body.messages, {
      streaming: false,
      stopOnError: body.options?.stopOnError ?? false,
    });

    const response = await Promise.all(
      results.map(async (result) => {
        const usage =
          result.result && 'usage' in result.result ? await result.result.usage : undefined;
        return {
          provider: result.provider,
          model: result.model,
          status: result.status,
          text: result.result && 'text' in result.result ? result.result.text : undefined,
          usage: usage
            ? {
                inputTokens: usage.inputTokens,
                outputTokens: usage.outputTokens,
                totalTokens: usage.totalTokens,
              }
            : undefined,
          metrics: {
            totalTime: result.metrics?.totalTime,
            timeToFirstToken: result.metrics?.timeToFirstToken,
            tokensPerSecond: result.metrics?.tokensPerSecond,
          },
          error: result.error?.message,
        };
      }),
    );

    return NextResponse.json({ results: response }, { status: 200 });
  } catch (error) {
    logError('Arena compare error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
