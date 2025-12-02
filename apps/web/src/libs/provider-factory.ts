import { ProviderBuilder } from '@lmring/ai-hub';
import { and, db, decrypt, eq, inArray } from '@lmring/database';
import { apiKeys } from '@lmring/database/schema';
import type { SupportedProvider } from './validation';

export type { SupportedProvider };

const COMPATIBLE_PROVIDERS: Record<string, string> = {
  google: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  vertex: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  cohere: 'https://api.cohere.ai/v1',
  together: 'https://api.together.xyz/v1',
  perplexity: 'https://api.perplexity.ai',
};

function hasApiVersion(url: string): boolean {
  const versionRegex = /\/v\d+(?:alpha|beta)?(?=\/|$)/i;
  try {
    const parsedUrl = new URL(url);
    return versionRegex.test(parsedUrl.pathname);
  } catch {
    return versionRegex.test(url);
  }
}

function normalizeProxyUrl(proxyUrl: string): string {
  const trimmed = proxyUrl.replace(/\/+$/, '');
  if (trimmed.endsWith('#')) {
    return trimmed;
  }
  if (hasApiVersion(trimmed)) {
    return trimmed;
  }
  return `${trimmed}/v1`;
}

/**
 * Fetch and decrypt API keys by their IDs with ownership check
 * Returns a map of keyId -> decrypted key data
 */
export async function fetchUserApiKeys(
  keyIds: string[],
  userId: string,
): Promise<
  Map<
    string,
    {
      providerName: string;
      apiKey: string;
      proxyUrl: string | null;
    }
  >
> {
  if (keyIds.length === 0) {
    return new Map();
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      providerName: apiKeys.providerName,
      encryptedKey: apiKeys.encryptedKey,
      proxyUrl: apiKeys.proxyUrl,
    })
    .from(apiKeys)
    .where(and(inArray(apiKeys.id, keyIds), eq(apiKeys.userId, userId)));

  const keyMap = new Map<
    string,
    {
      providerName: string;
      apiKey: string;
      proxyUrl: string | null;
    }
  >();

  for (const key of keys) {
    keyMap.set(key.id, {
      providerName: key.providerName,
      apiKey: decrypt(key.encryptedKey),
      proxyUrl: key.proxyUrl,
    });
  }

  return keyMap;
}

export function createProvider(
  providerId: SupportedProvider,
  apiKey: string,
  proxyUrl?: string,
): ReturnType<typeof ProviderBuilder.openai> {
  const baseURL = proxyUrl ? normalizeProxyUrl(proxyUrl) : undefined;

  switch (providerId) {
    case 'openai':
      return ProviderBuilder.openai(apiKey, baseURL);
    case 'anthropic':
      return ProviderBuilder.anthropic(apiKey, baseURL);
    case 'deepseek':
      return ProviderBuilder.deepseek(apiKey, baseURL);
    case 'mistral':
      return ProviderBuilder.mistral(apiKey, baseURL);
    case 'xai':
      return ProviderBuilder.xai(apiKey, baseURL);
    case 'openrouter':
      return ProviderBuilder.openrouter(apiKey, baseURL);
  }

  const defaultUrl = COMPATIBLE_PROVIDERS[providerId];
  if (defaultUrl) {
    return ProviderBuilder.compatible(providerId, apiKey, baseURL || defaultUrl);
  }

  throw new Error(`Unsupported provider: ${providerId}`);
}

export interface ProviderConfig {
  provider: ReturnType<typeof ProviderBuilder.openai>;
  model: string;
  options: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

export interface ArenaModelEntry {
  keyId: string;
  modelId: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

export interface KeyData {
  providerName: string;
  apiKey: string;
  proxyUrl: string | null;
}

/**
 * Build provider configs from model entries and fetched key data
 * Throws if any keyId is not found in the keyMap (authorization failure)
 */
export function buildProviderConfigs(
  models: ArenaModelEntry[],
  keyMap: Map<string, KeyData>,
): ProviderConfig[] {
  return models.map((model) => {
    const keyData = keyMap.get(model.keyId);
    if (!keyData) {
      throw new Error(`API key not found or not authorized: ${model.keyId}`);
    }

    const provider = createProvider(
      keyData.providerName as SupportedProvider,
      keyData.apiKey,
      keyData.proxyUrl ?? undefined,
    );

    return {
      provider,
      model: model.modelId,
      options: model.options || {},
    };
  });
}
