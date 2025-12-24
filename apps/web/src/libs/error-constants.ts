/**
 * Standard API error messages for consistent error responses across all endpoints.
 */
export const API_ERRORS = {
  // Authentication errors (401)
  UNAUTHORIZED: 'Unauthorized',

  // Validation errors (400)
  VALIDATION_FAILED: 'Validation failed',
  TITLE_REQUIRED: 'Title is required',
  MESSAGE_ID_REQUIRED: 'messageId is required',
  KEY_ID_REQUIRED: 'Key ID is required',
  VOTE_ID_REQUIRED: 'Vote ID is required',

  // Not found errors (404)
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  MESSAGE_NOT_FOUND: 'Message not found or unauthorized',
  MODEL_RESPONSE_NOT_FOUND: 'Model response not found',
  API_KEY_NOT_FOUND: 'API key not found',
  VOTE_NOT_FOUND: 'Vote not found',
  SHARED_RESULT_NOT_FOUND: 'Shared result not found',

  // Gone errors (410)
  SHARE_LINK_EXPIRED: 'Share link has expired',

  // Conflict errors (409)
  MODEL_ID_CONFLICTS_WITH_BUILTIN: 'Model ID conflicts with a built-in model',

  // Server errors (500)
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const;

export type ApiError = (typeof API_ERRORS)[keyof typeof API_ERRORS];
