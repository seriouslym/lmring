import type { ModelMessage } from 'ai';
import type {
  ArenaOptions,
  ModelComparisonConfig,
  ModelComparisonResult,
} from '../../types/runtime';
import { compareModels } from './comparison';

export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed';

interface Task {
  id: string;
  status: TaskStatus;
  models: ModelComparisonConfig[];
  messages: ModelMessage[];
  results?: ModelComparisonResult[];
  error?: Error;
  abortController?: AbortController;
  promise?: Promise<ModelComparisonResult[]>;
  originalOptions?: ArenaOptions;
}

export class ArenaController {
  private tasks = new Map<string, Task>();
  private nextId = 1;

  generateId(): string {
    return `arena-task-${this.nextId++}`;
  }

  async start(
    id: string,
    models: ModelComparisonConfig[],
    messages: ModelMessage[],
    options?: ArenaOptions,
  ): Promise<ModelComparisonResult[]> {
    // Check if task already exists
    if (this.tasks.has(id)) {
      throw new Error(`Task ${id} already exists`);
    }

    // Create abort controller
    const abortController = new AbortController();

    // Create task
    const task: Task = {
      id,
      status: 'running',
      models,
      messages,
      abortController,
      originalOptions: options,
    };

    this.tasks.set(id, task);

    // Start comparison
    const promise = compareModels(models, messages, {
      ...options,
      controller: abortController,
    });

    task.promise = promise;

    try {
      const results = await promise;
      task.status = 'completed';
      task.results = results;
      return results;
    } catch (error) {
      if (task.status !== 'paused' && task.status !== 'cancelled') {
        task.status = 'failed';
      }
      task.error = error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  }

  pause(id: string): void {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    if (task.status !== 'running') {
      throw new Error(`Task ${id} is not running`);
    }

    // Note: True pause/resume is complex with async operations
    // This implementation cancels the task
    if (task.abortController) {
      task.abortController.abort();
    }
    task.status = 'paused';
  }

  resume(id: string): Promise<ModelComparisonResult[]> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    if (task.status !== 'paused') {
      throw new Error(`Task ${id} is not paused`);
    }

    // Restart the task with a new controller, preserving original options
    const newController = new AbortController();
    task.abortController = newController;
    task.status = 'running';

    const promise = compareModels(task.models, task.messages, {
      ...task.originalOptions,
      controller: newController,
    });

    task.promise = promise;

    promise.then(
      (results) => {
        task.status = 'completed';
        task.results = results;
      },
      (error) => {
        if (task.status !== 'paused' && task.status !== 'cancelled') {
          task.status = 'failed';
        }
        task.error = error instanceof Error ? error : new Error(String(error));
      },
    );

    return promise;
  }

  cancel(id: string): void {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    if (task.status === 'completed' || task.status === 'cancelled') {
      return;
    }

    if (task.abortController) {
      task.abortController.abort();
    }
    task.status = 'cancelled';
  }

  getStatus(id: string): TaskStatus {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
    return task.status;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getResults(id: string): ModelComparisonResult[] | undefined {
    const task = this.tasks.get(id);
    return task?.results;
  }

  clearTask(id: string): void {
    const task = this.tasks.get(id);
    if (task && (task.status === 'running' || task.status === 'paused')) {
      this.cancel(id);
    }
    this.tasks.delete(id);
  }

  clearAllTasks(): void {
    // Cancel all running tasks
    for (const task of this.tasks.values()) {
      if (task.status === 'running' || task.status === 'paused') {
        if (task.abortController) {
          task.abortController.abort();
        }
      }
    }
    this.tasks.clear();
  }
}
