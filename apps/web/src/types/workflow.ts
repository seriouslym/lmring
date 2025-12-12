/**
 * Workflow types for Arena independent model execution
 * Each workflow represents an independent conversation with a single model
 */

import type { ModelConfig } from './arena';

/**
 * Workflow execution status
 */
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Message metrics for tracking performance
 */
export interface WorkflowMessageMetrics {
  responseTime?: number;
  tokenCount?: number;
  timeToFirstToken?: number;
  tokensPerSecond?: number;
}

/**
 * Single message in a workflow conversation
 */
export interface WorkflowMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  timestamp: Date;
  metrics?: WorkflowMessageMetrics;
}

/**
 * Workflow execution metrics
 */
export interface WorkflowMetrics {
  totalTime: number;
  timeToFirstToken?: number;
  tokensPerSecond?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

/**
 * Workflow configuration (extends ModelConfig)
 */
export interface WorkflowConfig extends ModelConfig {}

/**
 * Default workflow configuration
 */
export const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  temperature: 0.7,
  maxTokens: 2048,
};

/**
 * Pending response state during streaming
 */
export interface PendingResponse {
  content: string;
  reasoning?: string;
  startTime: number;
}

/**
 * Core Arena Workflow structure
 * Each workflow represents an independent conversation stream with a model
 */
export interface ArenaWorkflow {
  /** Unique workflow identifier */
  id: string;

  /** Model ID (e.g., "openai:gpt-4") */
  modelId: string;

  /** API Key ID for the model's provider */
  keyId: string;

  /** Current workflow execution status */
  status: WorkflowStatus;

  /** Complete conversation history for this workflow */
  messages: WorkflowMessage[];

  /** Current streaming response (accumulated during generation) */
  pendingResponse?: PendingResponse;

  /** Model configuration */
  config: WorkflowConfig;

  /** Whether this workflow syncs with global prompt */
  synced: boolean;

  /** Custom prompt when not synced */
  customPrompt: string;

  /** Latest execution metrics */
  metrics?: WorkflowMetrics;

  /** Error message if status is 'failed' */
  error?: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * SSE Event types for workflow streaming
 */
export type WorkflowStreamEventType = 'ttft' | 'chunk' | 'reasoning' | 'complete' | 'error';

/**
 * Workflow stream event structure
 */
export interface WorkflowStreamEvent {
  type: WorkflowStreamEventType;
  workflowId: string;
  chunk?: string;
  reasoning?: string;
  metrics?: WorkflowMetrics;
  error?: string;
}

/**
 * Request body for workflow stream API
 */
export interface WorkflowStreamRequest {
  workflowId: string;
  modelId: string;
  keyId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  config: {
    temperature: number;
    maxTokens: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}
