import {
  LOGIQ_SERVER,
  type AiError,
  type ChatRequest,
  type ChatResponse,
  type ExplainRequest,
  type ExplainResponse,
  type ProblemRef,
  type Settings,
  type StoredProblem,
} from "@logiq/shared";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly aiError?: AiError,
    readonly offline = false,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${LOGIQ_SERVER}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("The logiQ app is not running. Start it with `pnpm dev` in the logiQ folder.", undefined, true);
  }
  const body = (await res.json().catch(() => null)) as (T & { error?: AiError | string }) | null;
  if (!res.ok || !body) {
    const err = body?.error;
    if (err && typeof err === "object") throw new ApiError(err.message, err);
    throw new ApiError(typeof err === "string" ? err : `Request failed (${res.status})`);
  }
  return body;
}

export const api = {
  settings: () => call<Settings>("/api/settings"),
  saveSettings: (s: Partial<Settings>) =>
    call<Settings>("/api/settings", { method: "PUT", body: JSON.stringify(s) }),
  explain: (req: ExplainRequest) =>
    call<ExplainResponse>("/api/explain", { method: "POST", body: JSON.stringify(req) }),
  chat: (req: ChatRequest) =>
    call<ChatResponse>("/api/chat", { method: "POST", body: JSON.stringify(req) }),
  problem: (ref: ProblemRef) =>
    call<{ ref: ProblemRef; problem: StoredProblem }>(
      `/api/problems/${ref.platform}/${encodeURIComponent(ref.file)}`,
    ),
};
