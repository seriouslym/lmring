type ErrorDetails = Record<string, unknown>;

export class AiHubError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: ErrorDetails,
  ) {
    super(message);
    this.name = 'AiHubError';
  }
}

export class ProviderError extends AiHubError {
  constructor(
    message: string,
    public providerId: string,
    details?: ErrorDetails,
  ) {
    super(message, 'PROVIDER_ERROR', { providerId, ...(details ?? {}) });
    this.name = 'ProviderError';
  }
}

export class ModelResolutionError extends AiHubError {
  constructor(
    public modelId: string,
    public providerId: string,
    reason: string,
  ) {
    super(
      `Failed to resolve model ${modelId} for provider ${providerId}: ${reason}`,
      'MODEL_RESOLUTION_ERROR',
      { modelId, providerId },
    );
    this.name = 'ModelResolutionError';
  }
}

export class ArenaError extends AiHubError {
  constructor(
    message: string,
    public failures: Error[],
  ) {
    super(message, 'ARENA_ERROR', { failures });
    this.name = 'ArenaError';
  }
}

export class PluginError extends AiHubError {
  constructor(
    message: string,
    public pluginName: string,
    public hook: string,
    originalError?: Error,
  ) {
    super(`Plugin ${pluginName} failed at ${hook}: ${message}`, 'PLUGIN_ERROR', {
      pluginName,
      hook,
      originalError,
    });
    this.name = 'PluginError';
  }
}

export class ConfigurationError extends AiHubError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}
