import { compareModels, ProviderBuilder } from '@lmring/ai-hub';
import type { ModelMessage } from 'ai';
import { auth } from '@/libs/Auth';
import { arenaCompareSchema } from '@/libs/validation';

interface StreamRequest {
  models: Array<{
    providerId: string;
    modelId: string;
    apiKey: string;
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
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const body = validationResult.data;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const providerConfigs = body.models.map((model) => {
            let provider: ReturnType<typeof ProviderBuilder.openai>;

            switch (model.providerId) {
              case 'openai':
                provider = ProviderBuilder.openai(model.apiKey);
                break;
              case 'anthropic':
                provider = ProviderBuilder.anthropic(model.apiKey);
                break;
              case 'deepseek':
                provider = ProviderBuilder.deepseek(model.apiKey);
                break;
              case 'mistral':
                provider = ProviderBuilder.mistral(model.apiKey);
                break;
              case 'xai':
                provider = ProviderBuilder.xai(model.apiKey);
                break;
              case 'openrouter':
                provider = ProviderBuilder.openrouter(model.apiKey);
                break;
              case 'google':
                provider = ProviderBuilder.google(model.apiKey);
                break;
              case 'cohere':
                provider = ProviderBuilder.cohere(model.apiKey);
                break;
              case 'together':
                provider = ProviderBuilder.together(model.apiKey);
                break;
              case 'perplexity':
                provider = ProviderBuilder.perplexity(model.apiKey);
                break;
              default:
                throw new Error(`Unsupported provider: ${model.providerId}`);
            }

            return {
              provider,
              model: model.modelId,
              options: model.options || {},
            };
          });

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
    console.error('Arena stream error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
