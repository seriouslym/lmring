import type { ModelConfig, ProviderConfig } from '../types/provider';

export type ApiFormat = 'openai' | 'anthropic';

/**
 * Detects the API format based on model name patterns
 */
export function detectFormatFromModel(modelId: string): ApiFormat {
  const modelLower = modelId.toLowerCase();

  // Anthropic model patterns
  const anthropicPatterns = ['claude', 'claude-3', 'claude-2', 'claude-instant', 'anthropic'];

  for (const pattern of anthropicPatterns) {
    if (modelLower.includes(pattern)) {
      return 'anthropic';
    }
  }

  // Default to OpenAI format
  return 'openai';
}

/**
 * Checks if a provider supports a specific format
 */
export function supportsFormat(config: ProviderConfig, format: ApiFormat): boolean {
  // Check if any model explicitly supports the format
  if (config.models?.some((model) => model.supportedFormats?.includes(format))) {
    return true;
  }

  // Check if provider has alternative base URL for Anthropic format
  if (format === 'anthropic' && config.compatibleConfig?.alternativeBaseURL) {
    return true;
  }

  // Default: OpenAI format is always supported for compatible providers
  return format === 'openai' && config.type === 'compatible';
}

/**
 * Automatically selects the appropriate format for a provider and model
 */
export function autoSelectFormat(
  config: ProviderConfig,
  modelId: string,
  preferAnthropicFormat?: boolean,
): ApiFormat {
  // If explicitly specified, check if supported
  if (preferAnthropicFormat !== undefined) {
    const format = preferAnthropicFormat ? 'anthropic' : 'openai';
    if (supportsFormat(config, format)) {
      return format;
    }
  }

  // Auto-detect based on model name
  const detectedFormat = detectFormatFromModel(modelId);

  // Check if detected format is supported
  if (supportsFormat(config, detectedFormat)) {
    return detectedFormat;
  }

  // Fallback to OpenAI format
  return 'openai';
}

/**
 * Gets the appropriate base URL for the selected format
 */
export function getBaseURLForFormat(config: ProviderConfig, format: ApiFormat): string | undefined {
  if (config.type !== 'compatible' || !config.compatibleConfig) {
    return undefined;
  }

  if (format === 'anthropic' && config.compatibleConfig.alternativeBaseURL) {
    return config.compatibleConfig.alternativeBaseURL;
  }

  return config.compatibleConfig.baseURL;
}

/**
 * Checks if a model is supported by a provider
 */
export function isModelSupported(config: ProviderConfig, modelId: string): boolean {
  if (!config.models || config.models.length === 0) {
    // If no models specified, assume all are supported
    return true;
  }

  return config.models.some(
    (model) =>
      model.id === modelId ||
      model.name === modelId ||
      model.id.toLowerCase() === modelId.toLowerCase(),
  );
}

/**
 * Gets model configuration from provider config
 */
export function getModelConfig(config: ProviderConfig, modelId: string): ModelConfig | undefined {
  if (!config.models) {
    return undefined;
  }

  return config.models.find(
    (model) =>
      model.id === modelId ||
      model.name === modelId ||
      model.id.toLowerCase() === modelId.toLowerCase(),
  );
}

/**
 * Validates if a provider can handle a specific model with format
 */
export function validateProviderModel(
  config: ProviderConfig,
  modelId: string,
  format: ApiFormat,
): { valid: boolean; reason?: string } {
  // Check if model is supported
  if (!isModelSupported(config, modelId)) {
    return {
      valid: false,
      reason: `Model ${modelId} is not supported by provider ${config.id}`,
    };
  }

  // Check if format is supported
  if (!supportsFormat(config, format)) {
    return {
      valid: false,
      reason: `Format ${format} is not supported by provider ${config.id}`,
    };
  }

  // Check specific model format support
  const modelConfig = getModelConfig(config, modelId);
  if (modelConfig?.supportedFormats && !modelConfig.supportedFormats.includes(format)) {
    return {
      valid: false,
      reason: `Model ${modelId} does not support ${format} format`,
    };
  }

  return { valid: true };
}
