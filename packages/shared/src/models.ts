/** Default model for new installs. Must be one of the recommended free models. */
export const DEFAULT_MODEL_ID = "nvidia/nemotron-3-ultra-550b-a55b:free";

export type ModelTier = "recommended" | "good" | "untested";

/** A free OpenRouter chat model, merged with logiQ's DSA recommendation data. */
export interface FreeModel {
  id: string;
  name: string;
  contextLength: number;
  maxOutputTokens: number | null;
  reasoning: boolean;
  /** Supports response_format / structured outputs (reliable JSON). */
  jsonMode: boolean;
  /** Accepts image input (useful for screenshots of problems). */
  vision: boolean;
  /** ISO date after which OpenRouter stops serving the free variant, if announced. */
  expiresAt: string | null;
  tier: ModelTier;
  /** False when OpenRouter only serves this model to approved apps (logiQ cannot use it). */
  usable: boolean;
  /** Lower = better within a tier. */
  rank: number;
  /** Short badge text, e.g. "Best all-round". */
  label?: string;
  reason: string;
  /** Benchmark evidence with its source, if any was found. */
  evidence?: string;
}

/** OpenRouter's free-model daily allowance for the configured key. */
export interface KeyStatus {
  freeTier: boolean;
  dailyUsed: number;
  dailyLimit: number;
  dailyRemaining: number;
}

export type AiErrorKind =
  | "daily_limit"
  | "rate_limited"
  | "unauthorized"
  | "privacy_settings"
  | "model_unavailable"
  | "network"
  | "unknown";

export interface AiError {
  kind: AiErrorKind;
  message: string;
}

export interface ModelTestResult {
  ok: boolean;
  latencyMs: number;
  reply?: string;
  error?: AiError;
}
