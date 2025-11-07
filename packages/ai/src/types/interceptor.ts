/**
 * Request Interceptor Types
 *
 * Simple hooks for request lifecycle - much lighter than the full plugin system
 */

/**
 * Request interceptor interface
 *
 * Provides simple hooks for the request lifecycle without the complexity
 * of a full plugin system
 */
export interface RequestInterceptor<TParams = unknown, TResult = unknown> {
  /**
   * Called before the request is sent
   * Can modify parameters
   */
  onBefore?: (params: TParams) => TParams | Promise<TParams>;

  /**
   * Called after the request completes successfully
   * Can modify the result
   */
  onAfter?: (result: TResult) => TResult | Promise<TResult>;

  /**
   * Called when an error occurs
   */
  onError?: (error: Error) => void | Promise<void>;
}
