/**
 * Model configuration interface
 */
export interface ModelConfig {
  /** Model ID */
  id: string;
  /** Display name */
  name: string;
  /** Context window size */
  contextWindow: number;
  /** Maximum output tokens */
  maxOutputTokens?: number;
  /** Pricing information */
  pricing?: {
    /** Input price per million tokens */
    inputPerMillion: number;
    /** Output price per million tokens */
    outputPerMillion: number;
  };
}
