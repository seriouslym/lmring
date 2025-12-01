import { compareModels, ProviderBuilder } from '@lmring/ai-hub';
import type { ModelMessage } from 'ai';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { arenaCompareSchema } from '@/libs/validation';

interface CompareRequest {
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
  options?: {
    streaming?: boolean;
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
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const body = validationResult.data;

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
      streaming: false,
      stopOnError: body.options?.stopOnError ?? false,
    });

    const response = results.map((result) => ({
      provider: result.provider,
      model: result.model,
      status: result.status,
      text: result.result && 'text' in result.result ? result.result.text : undefined,
      usage:
        result.result && 'usage' in result.result
          ? {
              inputTokens: result.result.usage?.promptTokens,
              outputTokens: result.result.usage?.completionTokens,
              totalTokens: result.result.usage?.totalTokens,
            }
          : undefined,
      metrics: {
        totalTime: result.metrics?.totalTime,
        timeToFirstToken: result.metrics?.timeToFirstToken,
        tokensPerSecond: result.metrics?.tokensPerSecond,
      },
      error: result.error?.message,
    }));

    return NextResponse.json({ results: response }, { status: 200 });
  } catch (error) {
    console.error('Arena compare error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
