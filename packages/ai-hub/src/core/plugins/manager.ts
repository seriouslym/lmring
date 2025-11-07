import type { AiPlugin, PluginContext } from '../../types/plugin';
import { PluginError } from '../../utils/errors';

export class PluginManager {
  private plugins: AiPlugin[] = [];
  private sortedPlugins: AiPlugin[] = [];

  constructor(plugins: AiPlugin[] = []) {
    this.registerBatch(plugins);
  }

  register(plugin: AiPlugin): void {
    if (!plugin.name) {
      throw new PluginError('Plugin must have a name', 'unknown', 'register');
    }

    // Check for duplicates
    if (this.plugins.some((p) => p.name === plugin.name)) {
      throw new PluginError(`Plugin ${plugin.name} is already registered`, plugin.name, 'register');
    }

    this.plugins.push(plugin);
    this.sortPlugins();
  }

  registerBatch(plugins: AiPlugin[]): void {
    for (const plugin of plugins) {
      this.register(plugin);
    }
  }

  unregister(name: string): void {
    const index = this.plugins.findIndex((p) => p.name === name);
    if (index !== -1) {
      this.plugins.splice(index, 1);
      this.sortPlugins();
    }
  }

  get(name: string): AiPlugin | undefined {
    return this.plugins.find((p) => p.name === name);
  }

  has(name: string): boolean {
    return this.plugins.some((p) => p.name === name);
  }

  getAll(): AiPlugin[] {
    return [...this.sortedPlugins];
  }

  getByEnforce(enforce: 'pre' | 'post' | undefined): AiPlugin[] {
    return this.sortedPlugins.filter((p) => p.enforce === enforce);
  }

  clear(): void {
    this.plugins = [];
    this.sortedPlugins = [];
  }

  private sortPlugins(): void {
    // Sort by enforce order: pre -> normal (undefined) -> post
    this.sortedPlugins = [...this.plugins].sort((a, b) => {
      const orderMap = { pre: 0, undefined: 1, post: 2 };
      const orderA = orderMap[a.enforce || 'undefined'];
      const orderB = orderMap[b.enforce || 'undefined'];
      return orderA - orderB;
    });
  }

  // Initialize all plugins
  async initialize(context: PluginContext): Promise<void> {
    for (const plugin of this.sortedPlugins) {
      if (plugin.onInit) {
        try {
          await plugin.onInit(context);
        } catch (error) {
          throw new PluginError(
            `Failed to initialize plugin: ${error instanceof Error ? error.message : String(error)}`,
            plugin.name,
            'onInit',
            error instanceof Error ? error : undefined,
          );
        }
      }
    }
  }

  // Get plugins with specific hook
  getPluginsWithHook(hookName: keyof AiPlugin): AiPlugin[] {
    return this.sortedPlugins.filter((p) => {
      const hook = p[hookName];
      return typeof hook === 'function';
    });
  }
}
