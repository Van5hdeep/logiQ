import { cacheLife } from "next/cache";
import type {
  AiError,
  FreeModel,
  KeyStatus,
  ModelTestResult,
  ModelTier,
} from "@logiq/shared";
import { DEFAULT_REASON, RECOMMENDATIONS } from "./recommendations";

const BASE_URL = "https://openrouter.ai/api/v1";

interface RawModel {
  id: string;
  name: string;
  context_length: number;
  expiration_date?: string | null;
  architecture?: { input_modalities?: string[]; output_modalities?: string[] };
  pricing?: { prompt?: string; completion?: string };
  top_provider?: { max_completion_tokens?: number | null };
  supported_parameters?: string[];
}

function isFreeChatModel(m: RawModel): boolean {
  const free =
    m.id.endsWith(":free") ||
    (Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0);
  const textOnly = m.architecture?.output_modalities?.join(",") === "text";
  return free && textOnly && !m.id.includes("content-safety");
}

const TIER_ORDER: Record<ModelTier, number> = { recommended: 0, good: 1, untested: 2 };

function toFreeModel(m: RawModel): FreeModel {
  const rec = RECOMMENDATIONS[m.id];
  const params = m.supported_parameters ?? [];
  return {
    id: m.id,
    name: m.name.replace(/\s*\(free\)\s*$/i, "").replace(/\s{2,}/g, " ").trim(),
    contextLength: m.context_length,
    maxOutputTokens: m.top_provider?.max_completion_tokens ?? null,
    reasoning: params.includes("reasoning"),
    jsonMode: params.includes("structured_outputs") || params.includes("response_format"),
    vision: m.architecture?.input_modalities?.includes("image") ?? false,
    expiresAt: m.expiration_date ?? null,
    usable: rec?.usable ?? true,
    tier: rec?.tier ?? "untested",
    rank: rec?.rank ?? 50,
    label: rec?.label,
    reason: rec?.reason ?? DEFAULT_REASON,
    evidence: rec?.evidence,
  };
}

/** Raw OpenRouter model catalogue. Cached for an hour; our rankings are merged on top per request. */
async function fetchRawModels(): Promise<RawModel[]> {
  "use cache";
  cacheLife("hours");

  const res = await fetch(`${BASE_URL}/models`);
  if (!res.ok) throw new Error(`OpenRouter models request failed (${res.status})`);
  const { data } = (await res.json()) as { data: RawModel[] };
  return data;
}

/** Live list of free chat models from OpenRouter, merged with our DSA recommendations. */
export async function fetchFreeModels(): Promise<FreeModel[]> {
  const raw = await fetchRawModels();
  return raw
    .filter(isFreeChatModel)
    .map(toFreeModel)
    .sort(
      (a, b) =>
        Number(b.usable) - Number(a.usable) ||
        TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
        a.rank - b.rank ||
        b.contextLength - a.contextLength,
    );
}

/** Free-model daily allowance for the configured key. Never cached. */
export async function fetchKeyStatus(): Promise<KeyStatus | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`${BASE_URL}/key`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { data } = (await res.json()) as {
      data?: {
        is_free_tier?: boolean;
        free_model_daily_requests?: { used: number; limit: number; remaining: number };
      };
    };
    const daily = data?.free_model_daily_requests;
    if (!daily) return null;
    return {
      freeTier: data?.is_free_tier ?? true,
      dailyUsed: daily.used,
      dailyLimit: daily.limit,
      dailyRemaining: daily.remaining,
    };
  } catch {
    return null;
  }
}

/** Turns an OpenRouter HTTP error into something the UI can explain. */
export function classifyError(status: number, body: unknown): AiError {
  const err = (body as { error?: { message?: string; metadata?: { provider_name?: string } } })
    ?.error;
  const message = (err?.message ?? `Request failed (${status})`).slice(0, 300);
  const provider = err?.metadata?.provider_name;
  const text = provider ? `${message} (${provider})` : message;

  const keyProblem = /api key|auth|credential|unauthori[sz]ed/i.test(message);
  if (status === 401 || (status === 403 && keyProblem)) {
    return { kind: "unauthorized", message: text };
  }
  if (status === 429) {
    return /per-day|daily|per day/i.test(message)
      ? { kind: "daily_limit", message: text }
      : { kind: "rate_limited", message: text };
  }
  if (/data policy|privacy/i.test(message)) return { kind: "privacy_settings", message: text };
  if (status === 404 || status === 400 || status >= 500) {
    return { kind: "model_unavailable", message: text };
  }
  return { kind: "unknown", message: text };
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatResult =
  | { ok: true; content: string; model: string; latencyMs: number }
  | { ok: false; error: AiError; latencyMs: number };

/** One chat completion against OpenRouter, with errors turned into AiError kinds. */
export async function chatCompletion({
  model,
  messages,
  maxTokens,
  timeoutMs = 60_000,
}: {
  model: string;
  messages: ChatMessage[];
  maxTokens: number;
  timeoutMs?: number;
}): Promise<ChatResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const started = Date.now();
  if (!apiKey) {
    return {
      ok: false,
      latencyMs: 0,
      error: {
        kind: "unauthorized",
        message: "OPENROUTER_API_KEY is not set. Add it to apps/web/.env.local and restart.",
      },
    };
  }

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "logiQ",
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;
    const body: unknown = await res.json().catch(() => null);

    // OpenRouter can also return HTTP 200 with an error payload when the upstream provider fails.
    if (!res.ok || (body as { error?: unknown })?.error) {
      return { ok: false, latencyMs, error: classifyError(res.status, body) };
    }

    const data = body as { model?: string; choices?: { message?: { content?: string | null } }[] };
    return {
      ok: true,
      latencyMs,
      model: data.model ?? model,
      content: data.choices?.[0]?.message?.content?.trim() ?? "",
    };
  } catch (e) {
    const timedOut = e instanceof DOMException && e.name === "TimeoutError";
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: {
        kind: "network",
        message: timedOut
          ? `The model took longer than ${Math.round(timeoutMs / 1000)} seconds to answer.`
          : "Could not reach OpenRouter. Check your internet connection.",
      },
    };
  }
}

/** Sends one tiny request to check a model answers. Counts as 1 free request. */
export async function testModel(model: string): Promise<ModelTestResult> {
  const result = await chatCompletion({
    model,
    messages: [{ role: "user", content: "Reply with the single word OK." }],
    maxTokens: 256,
  });
  return result.ok
    ? { ok: true, latencyMs: result.latencyMs, reply: result.content || undefined }
    : { ok: false, latencyMs: result.latencyMs, error: result.error };
}
