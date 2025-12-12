import { useCallback } from 'react';
import { buildWorkflowStreamRequest, streamWorkflow } from '@/libs/workflow-api';
import { useWorkflowStore } from '@/stores/workflow-store';
import type { ArenaWorkflow, WorkflowMetrics } from '@/types/workflow';

/**
 * Hook for executing workflows with independent streaming
 *
 * Provides methods to:
 * - Start a workflow with an initial prompt
 * - Continue a workflow with a follow-up message
 * - Cancel a running workflow
 * - Retry a failed workflow
 * - Execute all synced workflows with the global prompt
 */
export function useWorkflowExecution() {
  const addUserMessage = useWorkflowStore((s) => s.addUserMessage);
  const startPendingResponse = useWorkflowStore((s) => s.startPendingResponse);
  const appendPendingResponse = useWorkflowStore((s) => s.appendPendingResponse);
  const appendPendingReasoning = useWorkflowStore((s) => s.appendPendingReasoning);
  const completePendingResponse = useWorkflowStore((s) => s.completePendingResponse);
  const setWorkflowStatus = useWorkflowStore((s) => s.setWorkflowStatus);
  const setAbortController = useWorkflowStore((s) => s.setAbortController);
  const getAbortController = useWorkflowStore((s) => s.getAbortController);
  const getWorkflow = useWorkflowStore((s) => s.getWorkflow);
  const getSyncedWorkflows = useWorkflowStore((s) => s.getSyncedWorkflows);
  const globalPrompt = useWorkflowStore((s) => s.globalPrompt);
  const clearWorkflowHistory = useWorkflowStore((s) => s.clearWorkflowHistory);

  /**
   * Execute streaming for a single workflow
   */
  const executeWorkflowStream = useCallback(
    async (workflow: ArenaWorkflow, prompt: string) => {
      const { id, modelId, keyId, messages, config } = workflow;

      addUserMessage(id, prompt);
      startPendingResponse(id);

      const abortController = new AbortController();
      setAbortController(id, abortController);

      const allMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: prompt },
      ];

      const request = buildWorkflowStreamRequest(id, modelId, keyId, allMessages, {
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        ...(config.topP != null && { topP: config.topP }),
        ...(config.frequencyPenalty != null && { frequencyPenalty: config.frequencyPenalty }),
        ...(config.presencePenalty != null && { presencePenalty: config.presencePenalty }),
      });

      let metrics: WorkflowMetrics | undefined;

      try {
        for await (const event of streamWorkflow(request, abortController.signal)) {
          if (event.type === 'chunk' && event.chunk) {
            appendPendingResponse(id, event.chunk);
          } else if (event.type === 'reasoning' && event.reasoning) {
            appendPendingReasoning(id, event.reasoning);
          } else if (event.type === 'complete') {
            metrics = event.metrics;
          } else if (event.type === 'error') {
            setWorkflowStatus(id, 'failed', event.error);
            setAbortController(id, undefined);
            return;
          }
        }

        completePendingResponse(id, metrics);
        setAbortController(id, undefined);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          setWorkflowStatus(id, 'cancelled');
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setWorkflowStatus(id, 'failed', errorMessage);
        }
        setAbortController(id, undefined);
      }
    },
    [
      addUserMessage,
      startPendingResponse,
      appendPendingResponse,
      appendPendingReasoning,
      completePendingResponse,
      setWorkflowStatus,
      setAbortController,
    ],
  );

  /**
   * Start a workflow with an initial prompt
   */
  const startWorkflow = useCallback(
    async (workflowId: string, prompt: string) => {
      const workflow = getWorkflow(workflowId);
      if (!workflow) {
        console.error('Workflow not found:', workflowId);
        return;
      }

      if (workflow.status === 'running') {
        console.warn('Workflow already running:', workflowId);
        return;
      }

      if (!prompt.trim()) {
        console.warn('Empty prompt provided');
        return;
      }

      await executeWorkflowStream(workflow, prompt);
    },
    [getWorkflow, executeWorkflowStream],
  );

  /**
   * Continue a workflow with a follow-up message
   */
  const continueWorkflow = useCallback(
    async (workflowId: string, followUpPrompt: string) => {
      const workflow = getWorkflow(workflowId);
      if (!workflow) {
        console.error('Workflow not found:', workflowId);
        return;
      }

      if (workflow.status === 'running') {
        console.warn('Workflow already running:', workflowId);
        return;
      }

      if (!followUpPrompt.trim()) {
        console.warn('Empty follow-up prompt provided');
        return;
      }

      await executeWorkflowStream(workflow, followUpPrompt);
    },
    [getWorkflow, executeWorkflowStream],
  );

  /**
   * Cancel a running workflow
   */
  const cancelWorkflow = useCallback(
    (workflowId: string) => {
      const controller = getAbortController(workflowId);
      if (controller) {
        controller.abort();
        setAbortController(workflowId, undefined);
        setWorkflowStatus(workflowId, 'cancelled');
      }
    },
    [getAbortController, setAbortController, setWorkflowStatus],
  );

  /**
   * Retry a failed or cancelled workflow
   */
  const retryWorkflow = useCallback(
    async (workflowId: string) => {
      const workflow = getWorkflow(workflowId);
      if (!workflow) {
        console.error('Workflow not found:', workflowId);
        return;
      }

      if (workflow.status !== 'failed' && workflow.status !== 'cancelled') {
        console.warn('Can only retry failed or cancelled workflows');
        return;
      }

      const lastUserMessage = [...workflow.messages].reverse().find((m) => m.role === 'user');
      if (!lastUserMessage) {
        console.warn('No user message to retry');
        return;
      }

      clearWorkflowHistory(workflowId);

      const freshWorkflow = getWorkflow(workflowId);
      if (freshWorkflow) {
        await executeWorkflowStream(freshWorkflow, lastUserMessage.content);
      }
    },
    [getWorkflow, clearWorkflowHistory, executeWorkflowStream],
  );

  /**
   * Start all synced workflows with the global prompt
   */
  const startAllSyncedWorkflows = useCallback(async () => {
    if (!globalPrompt.trim()) {
      console.warn('Empty global prompt');
      return;
    }

    const syncedWorkflows = getSyncedWorkflows();
    const runnableWorkflows = syncedWorkflows.filter((w) => w.status !== 'running');

    if (runnableWorkflows.length === 0) {
      console.warn('No runnable synced workflows');
      return;
    }

    await Promise.all(runnableWorkflows.map((w) => executeWorkflowStream(w, globalPrompt)));
  }, [globalPrompt, getSyncedWorkflows, executeWorkflowStream]);

  /**
   * Continue all synced workflows with a follow-up prompt
   */
  const continueAllSyncedWorkflows = useCallback(
    async (followUpPrompt: string) => {
      if (!followUpPrompt.trim()) {
        console.warn('Empty follow-up prompt');
        return;
      }

      const syncedWorkflows = getSyncedWorkflows();
      const runnableWorkflows = syncedWorkflows.filter((w) => w.status !== 'running');

      if (runnableWorkflows.length === 0) {
        console.warn('No runnable synced workflows');
        return;
      }

      await Promise.all(runnableWorkflows.map((w) => executeWorkflowStream(w, followUpPrompt)));
    },
    [getSyncedWorkflows, executeWorkflowStream],
  );

  /**
   * Cancel all running workflows
   */
  const cancelAllWorkflows = useCallback(() => {
    const syncedWorkflows = getSyncedWorkflows();
    const runningWorkflows = syncedWorkflows.filter((w) => w.status === 'running');

    for (const workflow of runningWorkflows) {
      cancelWorkflow(workflow.id);
    }
  }, [getSyncedWorkflows, cancelWorkflow]);

  return {
    startWorkflow,
    continueWorkflow,
    cancelWorkflow,
    retryWorkflow,
    startAllSyncedWorkflows,
    continueAllSyncedWorkflows,
    cancelAllWorkflows,
  };
}
