import { compareModels, type ModelMessage } from '@lmring/ai-hub';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';
import { buildProviderConfigs, fetchUserApiKeys } from '@/libs/provider-factory';
import { arenaCompareSchema } from '@/libs/validation';

interface StreamRequest {
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
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rawBody = (await request.json()) as StreamRequest;

    const validationResult = arenaCompareSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.issues }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const body = validationResult.data;

    const keyIds = body.models.map((m) => m.keyId);
    const keyMap = await fetchUserApiKeys(keyIds, session.user.id);

    const missingKeys = keyIds.filter((id) => !keyMap.has(id));
    if (missingKeys.length > 0) {
      return new Response(
        JSON.stringify({ error: 'API key not found or not authorized', keyIds: missingKeys }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const providerConfigs = buildProviderConfigs(body.models, keyMap);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const results = await compareModels(providerConfigs, body.messages, {
            streaming: true,
            stopOnError: false,
            onProgress: (provider, model, chunk) => {
              const data = JSON.stringify({
                type: 'chunk',
                provider,
                model,
                chunk,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            },
          });

          for (const result of results) {
            const finalData = JSON.stringify({
              type: 'complete',
              provider: result.provider,
              model: result.model,
              status: result.status,
              metrics: {
                totalTime: result.metrics?.totalTime,
                timeToFirstToken: result.metrics?.timeToFirstToken,
                tokensPerSecond: result.metrics?.tokensPerSecond,
                promptTokens: result.metrics?.promptTokens,
                completionTokens: result.metrics?.completionTokens,
                totalTokens: result.metrics?.totalTokens,
              },
              error: result.error?.message,
            });
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Stream error',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    logError('Arena stream error', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
