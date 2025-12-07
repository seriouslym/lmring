import { z } from 'zod';

export const SUPPORTED_PROVIDERS = [
  'openai',
  'anthropic',
  'deepseek',
  'mistral',
  'xai',
  'openrouter',
  'google',
  'gemini',
  'vertex',
  'cohere',
  'together',
  'perplexity',
] as const;

export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

export const conversationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
});

export const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z
    .string()
    .trim()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50000 characters'),
});

export const modelResponseSchema = z.object({
  messageId: z.uuid('Invalid message ID'),
  modelName: z.string().min(1).max(100),
  providerName: z.string().min(1).max(100),
  responseContent: z.string().trim().min(1).max(50000),
  tokensUsed: z.number().int().min(0).max(1000000).optional(),
  responseTimeMs: z.number().int().min(0).max(3600000).optional(),
});

export const voteSchema = z.object({
  messageId: z.uuid('Invalid message ID'),
  modelResponseId: z.uuid('Invalid model response ID'),
  voteType: z.enum(['like', 'dislike', 'neutral']),
});

export const apiKeySchema = z.object({
  providerName: z.string().min(1).max(100),
  apiKey: z.string().min(1).max(500),
  proxyUrl: z
    .string()
    .max(500)
    .refine(
      (val) => val === '' || /^https?:\/\/.+/.test(val),
      'Must be a valid URL starting with http:// or https://',
    )
    .optional(),
  enabled: z.boolean().optional(),
});

export const apiKeyPatchSchema = z.object({
  enabled: z.boolean().optional(),
});

export const connectionCheckSchema = z.object({
  providerName: z.string().min(1).max(100),
  apiKey: z.string().min(1).max(500),
  proxyUrl: z
    .string()
    .max(500)
    .refine(
      (val) => val === '' || /^https?:\/\/.+/.test(val),
      'Must be a valid URL starting with http:// or https://',
    )
    .optional(),
  model: z.string().min(1).max(200),
});

export const modelEnableSchema = z.object({
  models: z
    .array(
      z.object({
        modelId: z.string().min(1).max(200),
        enabled: z.boolean(),
      }),
    )
    .min(1)
    .max(100),
});

export const customModelSchema = z.object({
  modelId: z.string().min(1).max(200),
  displayName: z.string().max(200).optional(),
});

export const userPreferencesSchema = z.object({
  theme: z.string().max(50).optional(),
  language: z.string().max(10).optional(),
  defaultModels: z.array(z.string().max(100)).max(10).optional(),
  configSource: z.enum(['manual', 'cherry-studio', 'newapi']).optional(),
});

export const shareSchema = z.object({
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export const arenaModelSchema = z.object({
  keyId: z.uuid('Invalid API key ID'),
  modelId: z.string().min(1).max(200),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().int().min(1).max(100000).optional(),
      topP: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export const arenaCompareSchema = z.object({
  models: z.array(arenaModelSchema).min(1).max(10),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().trim().min(1).max(50000),
      }),
    )
    .min(1)
    .max(100),
  options: z
    .object({
      streaming: z.boolean().optional(),
      stopOnError: z.boolean().optional(),
    })
    .optional(),
});

export type ConversationInput = z.infer<typeof conversationSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ModelResponseInput = z.infer<typeof modelResponseSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
export type ApiKeyPatchInput = z.infer<typeof apiKeyPatchSchema>;
export type ConnectionCheckInput = z.infer<typeof connectionCheckSchema>;
export type ModelEnableInput = z.infer<typeof modelEnableSchema>;
export type CustomModelInput = z.infer<typeof customModelSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type ShareInput = z.infer<typeof shareSchema>;
export type ArenaModelInput = z.infer<typeof arenaModelSchema>;
export type ArenaCompareInput = z.infer<typeof arenaCompareSchema>;

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '*'.repeat(apiKey.length);
  }

  const visibleStart = apiKey.slice(0, 4);
  const visibleEnd = apiKey.slice(-4);
  const maskedMiddle = '*'.repeat(Math.min(apiKey.length - 8, 20));

  return `${visibleStart}${maskedMiddle}${visibleEnd}`;
}
