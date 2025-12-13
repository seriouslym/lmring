'use client';

import { createContext, type ReactNode, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  type ArenaWorkflow,
  DEFAULT_WORKFLOW_CONFIG,
  type PendingResponse,
  type WorkflowConfig,
  type WorkflowMessage,
  type WorkflowMetrics,
  type WorkflowStatus,
} from '@/types/workflow';

/**
 * Workflow Store State
 */
export type WorkflowState = {
  /** Map of workflow ID to workflow instance */
  workflows: Map<string, ArenaWorkflow>;
  /** Global prompt shared by synced workflows */
  globalPrompt: string;
};

/**
 * Workflow Store Actions
 */
export type WorkflowActions = {
  // CRUD Operations
  createWorkflow: (modelId: string, keyId: string, synced?: boolean) => string;
  deleteWorkflow: (id: string) => void;
  updateWorkflow: (id: string, update: Partial<ArenaWorkflow>) => void;

  // Global prompt
  setGlobalPrompt: (prompt: string) => void;

  // Workflow configuration
  setWorkflowConfig: (id: string, config: Partial<WorkflowConfig>) => void;
  setWorkflowModel: (id: string, modelId: string, keyId: string) => void;
  toggleWorkflowSync: (id: string, synced: boolean) => void;
  setCustomPrompt: (id: string, prompt: string) => void;

  // Status management
  setWorkflowStatus: (id: string, status: WorkflowStatus, error?: string) => void;

  // Message management
  addUserMessage: (id: string, content: string) => string;
  addAssistantMessage: (
    id: string,
    content: string,
    metrics?: WorkflowMetrics,
    reasoning?: string,
  ) => string;

  // Streaming response management
  startPendingResponse: (id: string) => void;
  appendPendingResponse: (id: string, chunk: string) => void;
  appendPendingReasoning: (id: string, chunk: string) => void;
  completePendingResponse: (id: string, metrics?: WorkflowMetrics) => void;

  // Abort controller management (for cancellation)
  setAbortController: (id: string, controller: AbortController | undefined) => void;
  getAbortController: (id: string) => AbortController | undefined;

  // History management
  clearWorkflowHistory: (id: string) => void;
  clearAllWorkflowHistory: () => void;
  removeLastAssistantMessage: (id: string) => string | undefined;

  // Bulk operations
  getWorkflow: (id: string) => ArenaWorkflow | undefined;
  getAllWorkflows: () => ArenaWorkflow[];
  getSyncedWorkflows: () => ArenaWorkflow[];
};

export type WorkflowStore = WorkflowState & WorkflowActions;

/**
 * Generate a unique ID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create an empty workflow instance
 */
function createEmptyWorkflow(
  id: string,
  modelId: string,
  keyId: string,
  synced = true,
): ArenaWorkflow {
  const now = new Date();
  return {
    id,
    modelId,
    keyId,
    status: 'pending',
    messages: [],
    config: { ...DEFAULT_WORKFLOW_CONFIG },
    synced,
    customPrompt: '',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Default initial state
 */
const defaultInitState: WorkflowState = {
  workflows: new Map(),
  globalPrompt: '',
};

/**
 * Store for AbortControllers (not serializable, kept outside Zustand state)
 */
const abortControllers = new Map<string, AbortController>();

/**
 * Create the Workflow Store
 */
export const createWorkflowStore = (initState: Partial<WorkflowState> = {}) => {
  return createStore<WorkflowStore>()(
    devtools(
      (set, get) => ({
        ...defaultInitState,
        ...initState,

        // ============ CRUD Operations ============

        createWorkflow: (modelId, keyId, synced = true) => {
          const id = generateId();
          set(
            (state) => {
              const newMap = new Map(state.workflows);
              newMap.set(id, createEmptyWorkflow(id, modelId, keyId, synced));
              return { workflows: newMap };
            },
            false,
            'workflow/create',
          );
          return id;
        },

        deleteWorkflow: (id) => {
          const controller = abortControllers.get(id);
          if (controller) {
            controller.abort();
            abortControllers.delete(id);
          }

          set(
            (state) => {
              const newMap = new Map(state.workflows);
              newMap.delete(id);
              return { workflows: newMap };
            },
            false,
            'workflow/delete',
          );
        },

        updateWorkflow: (id, update) => {
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow) return state;

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                ...update,
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/update',
          );
        },

        // ============ Global Prompt ============

        setGlobalPrompt: (prompt) => {
          set({ globalPrompt: prompt }, false, 'workflow/setGlobalPrompt');
        },

        // ============ Workflow Configuration ============

        setWorkflowConfig: (id, config) => {
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow) return state;

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                config: { ...workflow.config, ...config },
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/setConfig',
          );
        },

        setWorkflowModel: (id, modelId, keyId) => {
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow) return state;

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                modelId,
                keyId,
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/setModel',
          );
        },

        toggleWorkflowSync: (id, synced) => {
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow) return state;

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                synced,
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/toggleSync',
          );
        },

        setCustomPrompt: (id, prompt) => {
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow) return state;

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                customPrompt: prompt,
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/setCustomPrompt',
          );
        },

        // ============ Status Management ============

        setWorkflowStatus: (id, status, error) => {
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow) return state;

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                status,
                error: error ?? (status === 'failed' ? workflow.error : undefined),
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/setStatus',
          );
        },

        // ============ Message Management ============

        addUserMessage: (id, content) => {
          const messageId = generateId();
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow) return state;

              const message: WorkflowMessage = {
                id: messageId,
                role: 'user',
                content,
                timestamp: new Date(),
              };

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                messages: [...workflow.messages, message],
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/addUserMessage',
          );
          return messageId;
        },

        addAssistantMessage: (id, content, metrics, reasoning) => {
          const messageId = generateId();
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow) return state;

              const message: WorkflowMessage = {
                id: messageId,
                role: 'assistant',
                content,
                reasoning,
                timestamp: new Date(),
                metrics: metrics
                  ? {
                      responseTime: metrics.totalTime,
                      tokenCount: metrics.totalTokens,
                      timeToFirstToken: metrics.timeToFirstToken,
                      tokensPerSecond: metrics.tokensPerSecond,
                    }
                  : undefined,
              };

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                messages: [...workflow.messages, message],
                metrics,
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/addAssistantMessage',
          );
          return messageId;
        },

        // ============ Streaming Response Management ============

        startPendingResponse: (id) => {
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow) return state;

              const pendingResponse: PendingResponse = {
                content: '',
                startTime: Date.now(),
              };

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                pendingResponse,
                status: 'running',
                error: undefined,
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/startPendingResponse',
          );
        },

        appendPendingResponse: (id, chunk) => {
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow || !workflow.pendingResponse) return state;

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                pendingResponse: {
                  ...workflow.pendingResponse,
                  content: workflow.pendingResponse.content + chunk,
                },
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/appendPendingResponse',
          );
        },

        appendPendingReasoning: (id, chunk) => {
          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow || !workflow.pendingResponse) return state;

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                pendingResponse: {
                  ...workflow.pendingResponse,
                  reasoning: (workflow.pendingResponse.reasoning || '') + chunk,
                },
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/appendPendingReasoning',
          );
        },

        completePendingResponse: (id, metrics) => {
          const state = get();
          const workflow = state.workflows.get(id);
          if (!workflow || !workflow.pendingResponse) return;

          get().addAssistantMessage(
            id,
            workflow.pendingResponse.content,
            metrics,
            workflow.pendingResponse.reasoning,
          );

          set(
            (s) => {
              const w = s.workflows.get(id);
              if (!w) return s;

              const newMap = new Map(s.workflows);
              newMap.set(id, {
                ...w,
                pendingResponse: undefined,
                status: 'completed',
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/completePendingResponse',
          );
        },

        // ============ Abort Controller Management ============

        setAbortController: (id, controller) => {
          if (controller) {
            abortControllers.set(id, controller);
          } else {
            abortControllers.delete(id);
          }
        },

        getAbortController: (id) => {
          return abortControllers.get(id);
        },

        // ============ History Management ============

        clearWorkflowHistory: (id) => {
          const controller = abortControllers.get(id);
          if (controller) {
            controller.abort();
            abortControllers.delete(id);
          }

          set(
            (state) => {
              const workflow = state.workflows.get(id);
              if (!workflow) return state;

              const newMap = new Map(state.workflows);
              newMap.set(id, {
                ...workflow,
                messages: [],
                pendingResponse: undefined,
                status: 'pending',
                error: undefined,
                metrics: undefined,
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/clearHistory',
          );
        },

        clearAllWorkflowHistory: () => {
          for (const [_id, controller] of abortControllers) {
            controller.abort();
          }
          abortControllers.clear();

          set(
            (state) => {
              const newMap = new Map<string, ArenaWorkflow>();
              for (const [id, workflow] of state.workflows) {
                newMap.set(id, {
                  ...workflow,
                  messages: [],
                  pendingResponse: undefined,
                  status: 'pending',
                  error: undefined,
                  metrics: undefined,
                  updatedAt: new Date(),
                });
              }
              return { workflows: newMap };
            },
            false,
            'workflow/clearAllHistory',
          );
        },

        removeLastAssistantMessage: (id) => {
          const state = get();
          const workflow = state.workflows.get(id);
          if (!workflow) return undefined;

          // Find the last assistant message index
          const lastAssistantIndex = workflow.messages.findLastIndex((m) => m.role === 'assistant');
          if (lastAssistantIndex === -1) return undefined;

          // Get the user message content that preceded this assistant message
          const userMessageIndex = lastAssistantIndex - 1;
          const userMessage =
            userMessageIndex >= 0 ? workflow.messages[userMessageIndex] : undefined;
          const userContent = userMessage?.role === 'user' ? userMessage.content : undefined;

          set(
            (s) => {
              const w = s.workflows.get(id);
              if (!w) return s;

              // Remove the last assistant message
              const newMessages = w.messages.slice(0, lastAssistantIndex);

              const newMap = new Map(s.workflows);
              newMap.set(id, {
                ...w,
                messages: newMessages,
                pendingResponse: undefined,
                status: 'pending',
                error: undefined,
                updatedAt: new Date(),
              });
              return { workflows: newMap };
            },
            false,
            'workflow/removeLastAssistantMessage',
          );

          return userContent;
        },

        // ============ Bulk Operations ============

        getWorkflow: (id) => {
          return get().workflows.get(id);
        },

        getAllWorkflows: () => {
          return Array.from(get().workflows.values());
        },

        getSyncedWorkflows: () => {
          return Array.from(get().workflows.values()).filter((w) => w.synced);
        },
      }),
      { name: 'workflow-store', enabled: process.env.NODE_ENV === 'development' },
    ),
  );
};

type WorkflowStoreApi = ReturnType<typeof createWorkflowStore>;

const WorkflowStoreContext = createContext<WorkflowStoreApi | null>(null);

export function WorkflowStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<WorkflowStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createWorkflowStore();
  }

  return (
    <WorkflowStoreContext.Provider value={storeRef.current}>
      {children}
    </WorkflowStoreContext.Provider>
  );
}

export function useWorkflowStore<T>(selector: (state: WorkflowStore) => T): T {
  const store = useContext(WorkflowStoreContext);
  if (!store) {
    throw new Error('useWorkflowStore must be used within WorkflowStoreProvider');
  }
  return useStore(store, selector);
}

/**
 * Pre-defined selectors for common use cases
 */
export const workflowSelectors = {
  workflows: (state: WorkflowStore) => state.workflows,
  globalPrompt: (state: WorkflowStore) => state.globalPrompt,
  workflowCount: (state: WorkflowStore) => state.workflows.size,
  isAnyRunning: (state: WorkflowStore) =>
    Array.from(state.workflows.values()).some((w) => w.status === 'running'),
  allWorkflows: (state: WorkflowStore) => Array.from(state.workflows.values()),
  syncedWorkflows: (state: WorkflowStore) =>
    Array.from(state.workflows.values()).filter((w) => w.synced),
};
