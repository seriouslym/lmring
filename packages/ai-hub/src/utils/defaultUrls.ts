import { registry } from '../providers/registry';

/**
 * Default API URLs for official providers
 * These are the standard endpoints that the AI SDK uses internally
 */
const OFFICIAL_PROVIDER_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  azure: '', // Requires resourceName configuration
  vertex: '', // Requires project configuration
  xai: 'https://api.x.ai/v1',
  deepseek: 'https://api.deepseek.com/v1',
  mistral: 'https://api.mistral.ai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  bedrock: '', // AWS Bedrock uses different auth
};

/**
 * Get the default API URL for a provider
 * @param providerId - The provider identifier (e.g., 'openai', 'silicon')
 * @returns The default API URL or null if not available
 */
export function getDefaultProviderUrl(providerId: string): string | null {
  // First check registry for compatible providers with baseURL
  const config = registry.get(providerId);
  if (config?.compatibleConfig?.baseURL) {
    return config.compatibleConfig.baseURL;
  }

  // Return official provider URL if available
  const officialUrl = OFFICIAL_PROVIDER_URLS[providerId];
  if (officialUrl !== undefined && officialUrl !== '') {
    return officialUrl;
  }

  return null;
}

/**
 * Get all available provider URLs
 * @returns A map of provider IDs to their default URLs
 */
export function getAllProviderUrls(): Record<string, string | null> {
  const result: Record<string, string | null> = {};

  // Add all official providers
  for (const providerId of Object.keys(OFFICIAL_PROVIDER_URLS)) {
    result[providerId] = getDefaultProviderUrl(providerId);
  }

  // Add all compatible providers from registry
  const compatibleProviders = registry.listByType('compatible');
  for (const provider of compatibleProviders) {
    result[provider.id] = provider.compatibleConfig?.baseURL ?? null;
  }

  return result;
}
