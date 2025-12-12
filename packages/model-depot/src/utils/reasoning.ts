/**
 * Regex-based reasoning model detection for custom models.
 * Used when the model is not found in model-depot's static configuration.
 */

// Regex patterns for reasoning model detection
const REASONING_PATTERNS = [
  // Claude reasoning models (3.7, Sonnet 4, Opus 4, Haiku 4)
  /claude-(3[.-]7|sonnet-4|opus-4|haiku-4)/i,
  // OpenAI reasoning models (o1, o3, o4 series)
  /^o[134]/i,
  /gpt-5/i,
  /gpt-oss/i,
  // Generic reasoning keywords
  /\b(reasoning|reasoner|thinking)\b/i,
  // Qwen reasoning models
  /qwen3|qwq|qvq/i,
  // Gemini thinking models
  /gemini.*thinking/i,
  /gemini-2\.5/i,
  // DeepSeek V3.x hybrid inference
  /deepseek-v3[.-]\d/i,
  /deepseek-chat-v3/i,
  // Grok reasoning models
  /grok-(3-mini|4)/i,
  // Hunyuan reasoning
  /hunyuan-t1|hunyuan-a13b/i,
  // Zhipu reasoning
  /glm-z1|glm-4\.[56]/i,
  // MiniMax reasoning
  /minimax-m[12]/i,
  // Step reasoning
  /step-3|step-r1/i,
];

/**
 * Detect if a model supports reasoning based on its model ID.
 * This is used for custom models where we don't have static configuration.
 *
 * @param modelId - The model ID to check
 * @returns true if the model ID matches known reasoning model patterns
 */
export function detectReasoningByModelId(modelId: string): boolean {
  return REASONING_PATTERNS.some((pattern) => pattern.test(modelId));
}
