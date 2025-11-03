/**
 * @lmring/ai - AI SDK Integration Package
 *
 * Multi-model integration package based on Vercel AI SDK
 * Supports 60+ AI Providers, including international mainstream platforms and major Chinese AI platforms
 *
 * Optimized for LLM Arena: concurrent model comparison, performance tracking, and unified API
 *
 * @packageDocumentation
 */

// Re-export core AI SDK types and functions
export type { LanguageModel, LanguageModelMiddleware } from 'ai';
export { generateText, streamText } from 'ai';

// ============================================================================
// Core Runtime
// ============================================================================

export { ModelResolver, modelResolver } from './core/models/ModelResolver';
export { RuntimeExecutor } from './core/runtime/RuntimeExecutor';

// ============================================================================
// Arena Features (Batch execution and comparison)
// ============================================================================

export {
  type CompareModelsOptions,
  compareModels,
  type ModelComparisonConfig,
  type ModelComparisonResult,
  type ProgressCallback,
  raceModels,
} from './core/arena/batchExecutor';

export {
  createPerformanceInterceptor,
  type PerformanceMetrics,
  PerformanceTracker,
  performanceTracker,
} from './core/arena/performance';

// ============================================================================
// Providers
// ============================================================================

export {
  ALL_PROVIDERS,
  createModel,
  createProvider,
  DOMESTIC_PROVIDERS,
  initializeProviders,
  OFFICIAL_PROVIDERS,
  ProviderFactory,
  ProviderRegistry,
  registry,
} from './providers';

// ============================================================================
// Types
// ============================================================================

export type {
  CreateProviderOptions,
  ModelConfig,
  ProviderConfig,
  ProviderCreatorOptions,
  ProviderInstance,
} from './types';
export type { RequestInterceptor } from './types/interceptor';
export type {
  ExecutionOptions,
  ResolvedModel,
  RuntimeExecutorConfig,
} from './types/runtime';

// ============================================================================
// Utilities
// ============================================================================

export {
  autoSelectFormat,
  isAnthropicModel,
  selectApiEndpoint,
  supportsDualFormat,
} from './utils/formatSelector';
export {
  getRotatedApiKey,
  KeyRotationManager,
  keyRotationManager,
} from './utils/keyRotation';

export {
  createLoggingInterceptor,
  Logger,
  type LoggerConfig,
  LogLevel,
  logger,
} from './utils/logger';

/**
 * Package version
 */
export const VERSION = '1.0.0';
