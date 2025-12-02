import { getProviderById } from '../providers/configs';

/**
 * Represents a model fetched from provider API
 */
export interface FetchedModel {
  id: string;
  name?: string;
  created?: number;
  owned_by?: string;
}

/**
 * Result of fetching available models
 */
export interface FetchModelsResult {
  models: FetchedModel[];
  source: 'dynamic' | 'static';
}

/**
 * Providers that don't support dynamic model listing
 * These will use static model lists from provider configs
 */
const STATIC_ONLY_PROVIDERS = new Set([
  'anthropic', // No models API endpoint
  'azure', // Requires deployment configuration
  'vertex', // Requires project configuration
  'bedrock', // AWS-specific auth
]);

/**
 * Fetch models from OpenAI-compatible API endpoint
 * Works for: OpenAI, Mistral, DeepSeek, SiliconFlow, and most domestic providers
 */
async function fetchOpenAICompatibleModels(
  apiKey: string,
  baseUrl: string,
): Promise<FetchedModel[]> {
  const normalizedUrl = baseUrl.replace(/\/+$/, '');
  const modelsUrl = normalizedUrl.endsWith('/v1')
    ? `${normalizedUrl}/models`
    : `${normalizedUrl}/v1/models`;

  const response = await fetch(modelsUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch models: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as { data?: FetchedModel[]; object?: string };

  if (Array.isArray(data.data)) {
    return data.data.map((model) => ({
      id: model.id,
      name: model.name,
      created: model.created,
      owned_by: model.owned_by,
    }));
  }

  if (Array.isArray(data)) {
    return (data as FetchedModel[]).map((model) => ({
      id: model.id,
      name: model.name,
      created: model.created,
      owned_by: model.owned_by,
    }));
  }

  return [];
}

/**
 * Get static model list from provider configuration
 */
function getStaticModels(providerId: string): FetchedModel[] {
  const provider = getProviderById(providerId);
  if (!provider?.models) {
    return [];
  }

  return provider.models.map((model) => ({
    id: model.id,
    name: model.name,
  }));
}

/**
 * Fetch available models for a provider
 *
 * @param providerId - The provider identifier (e.g., 'openai', 'anthropic')
 * @param apiKey - The decrypted API key
 * @param baseUrl - The API base URL (custom proxy or default)
 * @returns Promise with models array and source indicator
 *
 * @example
 * ```typescript
 * const result = await fetchAvailableModels('openai', 'sk-xxx', 'https://api.openai.com/v1');
 * console.log(result.models); // [{ id: 'gpt-4o', name: 'gpt-4o', ... }, ...]
 * console.log(result.source); // 'dynamic'
 * ```
 */
export async function fetchAvailableModels(
  providerId: string,
  apiKey: string,
  baseUrl: string,
): Promise<FetchModelsResult> {
  if (STATIC_ONLY_PROVIDERS.has(providerId)) {
    return {
      models: getStaticModels(providerId),
      source: 'static',
    };
  }

  try {
    const models = await fetchOpenAICompatibleModels(apiKey, baseUrl);
    return {
      models,
      source: 'dynamic',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isExpectedError =
      errorMessage.includes('404') ||
      errorMessage.includes('Not Found') ||
      errorMessage.includes('Endpoint not found');

    if (!isExpectedError) {
      console.warn(`Failed to fetch models dynamically for ${providerId}: ${errorMessage}`);
    }

    return {
      models: getStaticModels(providerId),
      source: 'static',
    };
  }
}

/**
 * Check if a provider supports dynamic model fetching
 */
export function supportsModelFetching(providerId: string): boolean {
  return !STATIC_ONLY_PROVIDERS.has(providerId);
}
