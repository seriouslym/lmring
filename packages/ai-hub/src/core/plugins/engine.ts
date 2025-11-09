import type { AiPlugin, PluginContext } from '../../types/plugin';
import { PluginError } from '../../utils/errors';
import { PluginManager } from './manager';

type OnRequestStartHook = NonNullable<AiPlugin['onRequestStart']>;
type OnRequestEndHook = NonNullable<AiPlugin['onRequestEnd']>;
type OnErrorHook = NonNullable<AiPlugin['onError']>;

export class PluginEngine {
  private manager: PluginManager;

  constructor(plugins: AiPlugin[] = []) {
    this.manager = new PluginManager(plugins);
  }

  addPlugin(plugin: AiPlugin): void {
    this.manager.register(plugin);
  }

  removePlugin(name: string): void {
    this.manager.unregister(name);
  }

  // Sequential hook execution - each plugin transforms the value
  async executeSequential<T>(
    hookName: 'transformParams' | 'transformResult',
    value: T,
    context: PluginContext,
  ): Promise<T> {
    const plugins = this.manager.getPluginsWithHook(hookName);
    let result = value;

    for (const plugin of plugins) {
      try {
        const hook = plugin[hookName];
        if (hook && typeof hook === 'function') {
          const transformed = await (
            hook as (value: T, ctx: PluginContext) => Promise<unknown> | unknown
          ).call(plugin, result, context);
          result = transformed as T;
        }
      } catch (error) {
        throw new PluginError(
          `Plugin execution failed: ${error instanceof Error ? error.message : String(error)}`,
          plugin.name,
          hookName,
          error instanceof Error ? error : undefined,
        );
      }
    }

    return result;
  }

  // Parallel hook execution - for side effects only
  async executeParallel(hookName: 'onRequestStart', context: PluginContext): Promise<void>;
  async executeParallel(
    hookName: 'onRequestEnd',
    context: PluginContext,
    result: unknown,
  ): Promise<void>;
  async executeParallel(hookName: 'onError', context: PluginContext, error: Error): Promise<void>;
  async executeParallel(
    hookName: 'onRequestStart' | 'onRequestEnd' | 'onError',
    context: PluginContext,
    arg?: unknown,
  ): Promise<void> {
    const plugins = this.manager.getPluginsWithHook(hookName);

    const promises = plugins.map(async (plugin) => {
      try {
        const hook = plugin[hookName];
        if (hook && typeof hook === 'function') {
          if (hookName === 'onRequestStart') {
            await (hook as OnRequestStartHook).call(plugin, context);
          } else if (hookName === 'onRequestEnd') {
            await (hook as OnRequestEndHook).call(plugin, context, arg);
          } else {
            await (hook as OnErrorHook).call(plugin, arg as Error, context);
          }
        }
      } catch (error) {
        console.error(
          `Plugin ${plugin.name} failed at ${hookName}:`,
          error instanceof Error ? error.message : error,
        );
        // Don't throw - parallel hooks should not break execution
      }
    });

    await Promise.all(promises);
  }

  // Stream transformation
  async executeStream<T>(hookName: 'onStream', chunk: T, context: PluginContext): Promise<T> {
    const plugins = this.manager.getPluginsWithHook(hookName);
    let result = chunk;

    for (const plugin of plugins) {
      try {
        const hook = plugin[hookName];
        if (hook && typeof hook === 'function') {
          const transformed = await (
            hook as (chunk: T, ctx: PluginContext) => Promise<unknown> | unknown
          ).call(plugin, result, context);
          result = transformed as T;
        }
      } catch (error) {
        console.error(
          `Plugin ${plugin.name} failed at stream transformation:`,
          error instanceof Error ? error.message : error,
        );
        // Continue with original chunk if stream transformation fails
      }
    }

    return result;
  }

  // Initialize all plugins
  async initialize(context: PluginContext): Promise<void> {
    await this.manager.initialize(context);
  }

  // Get all registered plugins
  getPlugins(): AiPlugin[] {
    return this.manager.getAll();
  }

  // Execute full lifecycle for a request
  async executeLifecycle<TParams, TResult>(
    method: string,
    params: TParams,
    executor: (params: TParams) => Promise<TResult>,
    baseContext: Partial<PluginContext> = {},
  ): Promise<TResult> {
    const context: PluginContext = {
      providerId: baseContext.providerId || 'unknown',
      modelId: baseContext.modelId || 'unknown',
      method,
      attempt: 0,
      metadata: {},
      ...baseContext,
    };

    // Initialize plugins
    await this.initialize(context);

    // Transform params
    const transformedParams = await this.executeSequential('transformParams', params, context);

    // Notify request start
    await this.executeParallel('onRequestStart', context);

    let result: TResult;
    let error: Error | undefined;

    try {
      // Execute the actual request
      result = await executor(transformedParams);

      // Transform result
      result = await this.executeSequential('transformResult', result, context);

      // Notify request end
      await this.executeParallel('onRequestEnd', context, result);
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));

      // Notify error
      await this.executeParallel('onError', context, error);

      throw error;
    }

    return result;
  }
}
