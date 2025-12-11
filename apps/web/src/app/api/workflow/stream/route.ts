import { streamText } from '@lmring/ai-hub';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';
import { createProvider, fetchUserApiKeys } from '@/libs/provider-factory';
import { type SupportedProvider, workflowStreamSchema } from '@/libs/validation';

/**
 * POST /api/workflow/stream
 *
 * Single workflow streaming endpoint.
 * Unlike /api/arena/stream which handles multiple models in batch,
 * this endpoint handles a single model with independent message history.
 */
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

    const rawBody = await request.json();
    const validationResult = workflowStreamSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validationResult.error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const body = validationResult.data;
    const { workflowId, modelId, keyId, messages, config } = body;

    const keyMap = await fetchUserApiKeys([keyId], session.user.id);
    const keyData = keyMap.get(keyId);

    if (!keyData) {
      return new Response(
        JSON.stringify({
          error: 'API key not found or not authorized',
          keyId,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const provider = createProvider(
      keyData.providerName as SupportedProvider,
      keyData.apiKey,
      keyData.proxyUrl ?? undefined,
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const startTime = Date.now();
        let firstTokenTime: number | undefined;

        try {
          const result = streamText({
            model: provider.languageModel(modelId),
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
            // Only pass optional params when they have values (avoids Anthropic conflict)
            ...(config.topP != null && { topP: config.topP }),
            ...(config.frequencyPenalty != null && { frequencyPenalty: config.frequencyPenalty }),
            ...(config.presencePenalty != null && { presencePenalty: config.presencePenalty }),
          });

          for await (const chunk of result.textStream) {
            if (firstTokenTime === undefined) {
              firstTokenTime = Date.now() - startTime;
              const ttftEvent = JSON.stringify({
                type: 'ttft',
                workflowId,
                value: firstTokenTime,
              });
              controller.enqueue(encoder.encode(`data: ${ttftEvent}\n\n`));
            }

            const chunkEvent = JSON.stringify({
              type: 'chunk',
              workflowId,
              chunk,
            });
            controller.enqueue(encoder.encode(`data: ${chunkEvent}\n\n`));
          }

          const usage = await result.usage;
          const totalTime = Date.now() - startTime;
          const totalTokens = usage?.totalTokens ?? 0;
          const tokensPerSecond = totalTime > 0 ? (totalTokens / totalTime) * 1000 : 0;

          const completeEvent = JSON.stringify({
            type: 'complete',
            workflowId,
            metrics: {
              totalTime,
              timeToFirstToken: firstTokenTime,
              tokensPerSecond: Math.round(tokensPerSecond * 100) / 100,
              promptTokens: usage?.inputTokens,
              completionTokens: usage?.outputTokens,
              totalTokens: usage?.totalTokens,
            },
          });
          controller.enqueue(encoder.encode(`data: ${completeEvent}\n\n`));

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorEvent = JSON.stringify({
            type: 'error',
            workflowId,
            error: errorMessage,
          });
          controller.enqueue(encoder.encode(`data: ${errorEvent}\n\n`));
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
    logError('Workflow stream error', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
