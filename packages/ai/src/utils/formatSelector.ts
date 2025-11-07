/**
 * Format Selector
 *
 * Selects the appropriate API endpoint format (OpenAI vs Anthropic)
 * for providers that support multiple formats
 */

import type { ProviderConfig } from '../types/provider';

/**
 * Determine if a provider supports dual formats
 *
 * @param config - Provider configuration
 * @returns true if dual format is supported
 */
export function supportsDualFormat(config: ProviderConfig): boolean {
  return !!(config.type === 'compatible' && config.compatibleConfig?.anthropicApiHost);
}

/**
 * Select the appropriate API endpoint based on format preference
 *
 * @param config - Provider configuration
 * @param useAnthropicFormat - Whether to use Anthropic format
 * @returns The selected base URL
 *
 * @example
 * ```typescript
 * const config = {
 *   compatibleConfig: {
 *     baseURL: 'https://open.bigmodel.cn/api/paas/v4',
 *     anthropicApiHost: 'https://open.bigmodel.cn/api/anthropic'
 *   }
 * };
 *
 * // Select OpenAI format (default)
 * selectApiEndpoint(config, false);
 * // Returns: 'https://open.bigmodel.cn/api/paas/v4'
 *
 * // Select Anthropic format
 * selectApiEndpoint(config, true);
 * // Returns: 'https://open.bigmodel.cn/api/anthropic'
 * ```
 */
export function selectApiEndpoint(
  config: ProviderConfig,
  useAnthropicFormat: boolean = false,
): string {
  if (config.type !== 'compatible' || !config.compatibleConfig) {
    throw new Error(`Provider ${config.id} does not support format selection`);
  }

  // If Anthropic format is requested and available, use it
  if (useAnthropicFormat && config.compatibleConfig.anthropicApiHost) {
    return config.compatibleConfig.anthropicApiHost;
  }

  // Otherwise use the default baseURL
  return config.compatibleConfig.baseURL;
}

/**
 * Detect if a model ID suggests Anthropic format
 *
 * This is a heuristic based on common Anthropic model naming patterns
 *
 * @param modelId - Model ID to check
 * @returns true if model ID suggests Anthropic format
 */
export function isAnthropicModel(modelId: string): boolean {
  const anthropicPatterns = [/^claude-/i, /anthropic/i];

  return anthropicPatterns.some((pattern) => pattern.test(modelId));
}

/**
 * Auto-select format based on model ID
 *
 * @param config - Provider configuration
 * @param modelId - Model ID
 * @param explicitFormat - Explicit format preference (overrides auto-detection)
 * @returns Selected base URL
 *
 * @example
 * ```typescript
 * // Auto-detect based on model ID
 * autoSelectFormat(config, 'claude-3-opus-20240229');
 * // Returns Anthropic endpoint if available
 *
 * autoSelectFormat(config, 'gpt-4');
 * // Returns OpenAI endpoint (default)
 * ```
 */
export function autoSelectFormat(
  config: ProviderConfig,
  modelId: string,
  explicitFormat?: boolean,
): string {
  // If explicit format is provided, use it
  if (explicitFormat !== undefined) {
    return selectApiEndpoint(config, explicitFormat);
  }

  // Auto-detect based on model ID
  const useAnthropic = isAnthropicModel(modelId) && supportsDualFormat(config);
  return selectApiEndpoint(config, useAnthropic);
}
