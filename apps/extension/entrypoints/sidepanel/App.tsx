import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Cpu, Loader2, Play, RefreshCw } from "lucide-react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LOGIQ_SERVER,
  PLATFORM_LABEL,
  type AiError,
  type LanguageId,
  type ProblemContext,
  type ProblemRef,
  type Solution,
  type StoredProblem,
} from "@logiq/shared";
import { ChatCard } from "@/components/chat-card";
import { SolutionView } from "@/components/solution-view";
import { Button, Card, Pill } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { extractProblem, readEditor } from "@/lib/page-readers";
import { pendingKey } from "@/lib/pending";

type Phase =
  | { kind: "idle" }
  | { kind: "working"; step: string }
  | { kind: "error"; message: string; aiError?: AiError; offline?: boolean }
  | {
      kind: "result";
      ref: ProblemRef;
      problem: StoredProblem;
      solution: Solution;
      /** Opened from the vault: showing the solution saved the first time. */
      fromVault: boolean;
      cached: boolean;
    };

const SUPPORTED = /^https:\/\/(leetcode\.com\/problems\/|codeforces\.com\/(problemset|contest|gym)\/|www\.codechef\.com\/)/;

const ADVICE: Partial<Record<AiError["kind"], string>> = {
  daily_limit:
    "Your daily free-model limit is used up. It is shared by all free models, so switching will not help. It resets daily.",
  rate_limited: "This model is busy or rate limited right now. Switch to another model.",
  model_unavailable: "This model is unavailable right now. Switch to another model.",
  unauthorized: "OpenRouter rejected the API key. Check OPENROUTER_API_KEY in apps/web/.env.local.",
  privacy_settings: "Allow free models in your OpenRouter privacy settings.",
};

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function toContext(problem: StoredProblem): ProblemContext {
  return {
    platform: problem.platform,
    externalId: problem.externalId,
    number: problem.number,
    title: problem.title,
    url: problem.url,
    statement: problem.statement,
    difficulty: problem.difficulty,
    tags: problem.tags,
  };
}

export function App() {
  const [tab, setTab] = useState<chrome.tabs.Tab | undefined>();
  const [language, setLanguage] = useState<LanguageId>(DEFAULT_LANGUAGE);
  const [model, setModel] = useState<string>("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const lastContext = useRef<ProblemContext | null>(null);

  // Settings (model + default language) are shared with the web app.
  useEffect(() => {
    api
      .settings()
      .then((s) => {
        setLanguage(s.language);
        setModel(s.modelId);
      })
      .catch(() => setPhase({ kind: "error", message: "The logiQ app is not running. Start it with `pnpm dev` in the logiQ folder.", offline: true }));
  }, []);

  /** If this tab was opened from the vault ("Open solution"), show the saved first solution. */
  const showPending = useCallback(async (t: chrome.tabs.Tab | undefined) => {
    if (t?.id === undefined) return;
    const key = pendingKey(t.id);
    const ref = (await chrome.storage.session.get(key))[key] as ProblemRef | undefined;
    if (!ref) return;
    try {
      const { problem } = await api.problem(ref);
      const first = problem.solutions[0];
      if (!first) return;
      lastContext.current = toContext(problem);
      setPhase({ kind: "result", ref, problem, solution: first, fromVault: true, cached: true });
      await chrome.action.setBadgeText({ text: "", tabId: t.id });
    } catch (e) {
      setPhase({ kind: "error", message: (e as Error).message, offline: (e as ApiError).offline });
    }
  }, []);

  useEffect(() => {
    const refresh = async () => {
      const t = await activeTab();
      setTab(t);
      await showPending(t);
    };
    void refresh();
    const onActivated = () => void refresh();
    const onUpdated = (_id: number, info: { status?: string; url?: string }) => {
      if (info.status === "complete" || info.url) void refresh();
    };
    const onStorage = (_c: unknown, area: string) => {
      if (area === "session") void refresh();
    };
    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.storage.onChanged.addListener(onStorage);
    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.storage.onChanged.removeListener(onStorage);
    };
  }, [showPending]);

  async function solve(context: ProblemContext, lang: LanguageId, regenerate = false) {
    setPhase({ kind: "working", step: `Writing the ${LANGUAGES.find((l) => l.id === lang)?.label} solution${model ? ` with ${model.split("/").pop()?.replace(":free", "")}` : ""}…` });
    try {
      const res = await api.explain({ problem: context, language: lang, regenerate });
      setPhase({ kind: "result", ...res, fromVault: false });
    } catch (e) {
      const err = e as ApiError;
      setPhase({ kind: "error", message: err.message, aiError: err.aiError, offline: err.offline });
    }
  }

  async function startQuestion() {
    const t = await activeTab();
    if (t?.id === undefined || !t.url || !SUPPORTED.test(t.url)) {
      setPhase({ kind: "error", message: "Open a LeetCode, Codeforces or CodeChef problem page, then press Start Question." });
      return;
    }
    setPhase({ kind: "working", step: "Reading the question and your code editor…" });
    try {
      const [problemRes] = await chrome.scripting.executeScript({ target: { tabId: t.id }, func: extractProblem });
      const [editorRes] = await chrome.scripting
        .executeScript({ target: { tabId: t.id }, world: "MAIN", func: readEditor })
        .catch(() => [{ result: null }]);
      const raw = problemRes?.result;
      if (!raw) {
        setPhase({ kind: "error", message: "Couldn't find a problem on this page. Open the problem's own page and try again." });
        return;
      }
      const context: ProblemContext = {
        ...raw,
        starterCode: editorRes?.result?.code || undefined,
        starterLanguage: editorRes?.result?.language,
      };
      lastContext.current = context;
      await solve(context, language);
    } catch (e) {
      setPhase({ kind: "error", message: `Couldn't read this page: ${(e as Error).message}` });
    }
  }

  async function changeLanguage(next: LanguageId) {
    setLanguage(next);
    void api.saveSettings({ language: next }).catch(() => {});
    // Changing language repeats the whole solution in the new language (saved ones load instantly).
    if (phase.kind === "result") {
      const saved = phase.problem.solutions.find((s) => s.language === next);
      if (saved) {
        setPhase({ ...phase, solution: saved, cached: true });
        return;
      }
      if (lastContext.current) await solve(lastContext.current, next);
    }
  }

  const supported = !!tab?.url && SUPPORTED.test(tab.url);
  const working = phase.kind === "working";

  return (
    <div className="flex min-h-screen flex-col gap-3 p-3">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img src="/icon/32.png" alt="" className="size-7" />
          <span className="text-lg font-semibold tracking-tight">
            logi<span className="text-brand">Q</span>
          </span>
        </div>
        <button
          type="button"
          title="Switch AI model"
          onClick={() => chrome.tabs.create({ url: `${LOGIQ_SERVER}/models` })}
          className="flex max-w-40 items-center gap-1.5 rounded-full bg-chip px-3 py-1.5 text-xs font-medium text-muted hover:bg-brand-soft hover:text-brand"
        >
          <Cpu size={13} aria-hidden="true" />
          <span className="truncate">{model ? model.split("/").pop()?.replace(":free", "") : "model"}</span>
        </button>
      </header>
      <div aria-hidden="true" className="h-0.5 rounded-full opacity-70" style={{ background: "var(--rainbow)" }} />

      <Card accent="rainbow">
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">Language</span>
            <select
              value={language}
              disabled={working}
              onChange={(e) => void changeLanguage(e.target.value as LanguageId)}
              className="rounded-full border border-line bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand/40"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="primary"
            onClick={() => void startQuestion()}
            disabled={working}
            className="w-full py-2.5"
            icon={working ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          >
            Start Question
          </Button>
          {!supported && phase.kind === "idle" && (
            <p className="text-xs text-muted">Open a LeetCode, Codeforces or CodeChef problem to begin.</p>
          )}
        </div>
      </Card>

      {phase.kind === "working" && (
        <Card tone="bg-sky">
          <p className="flex items-center gap-2 font-medium">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            {phase.step}
          </p>
          <p className="mt-1 text-xs text-muted">Free models can take up to 2 minutes for a full solution. Saved solutions load instantly.</p>
        </Card>
      )}

      {phase.kind === "error" && (
        <Card tone="bg-peach">
          <p role="alert" className="font-medium">
            {phase.aiError ? ADVICE[phase.aiError.kind] ?? phase.message : phase.message}
          </p>
          {phase.aiError && <p className="mt-1 break-words text-xs text-muted">{phase.aiError.message}</p>}
          {phase.aiError && phase.aiError.kind !== "daily_limit" && (
            <Button
              className="mt-3"
              onClick={() => chrome.tabs.create({ url: `${LOGIQ_SERVER}/models` })}
              icon={<Cpu size={15} aria-hidden="true" />}
            >
              Switch model
            </Button>
          )}
        </Card>
      )}

      {phase.kind === "result" && (
        <>
          <Card tone={phase.fromVault ? "bg-lilac" : "bg-card"} accent={phase.fromVault ? "lilac" : undefined}>
            <div className="flex flex-wrap items-center gap-1.5">
              <Pill>{PLATFORM_LABEL[phase.problem.platform]}</Pill>
              {phase.problem.difficulty && <Pill tone="bg-butter text-foreground">{phase.problem.difficulty}</Pill>}
              {phase.fromVault && (
                <Pill tone="bg-card text-foreground">
                  <BookOpen size={12} aria-hidden="true" /> Saved solution
                </Pill>
              )}
            </div>
            <h1 className="mt-2 text-lg font-semibold leading-tight">
              {phase.problem.number && phase.problem.platform === "leetcode" ? `${phase.problem.number}. ` : ""}
              {phase.problem.title}
            </h1>
            <p className="mt-1 text-xs text-muted">
              {phase.cached ? "Saved" : "New"} · {phase.solution.model.split("/").pop()?.replace(":free", "")} ·{" "}
              {new Date(phase.solution.createdAt).toLocaleDateString()}
            </p>
            <p className="mt-1 break-all text-[11px] text-muted">
              Vault file: {phase.ref.platform}/{phase.ref.file}.json
            </p>
            {phase.problem.solutions.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Saved languages">
                {phase.problem.solutions.map((s, i) => (
                  <button
                    key={`${s.language}-${i}`}
                    type="button"
                    aria-pressed={s === phase.solution}
                    onClick={() => setPhase({ ...phase, solution: s })}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      s === phase.solution ? "border-brand/30 bg-brand-soft text-brand" : "border-line bg-card text-muted"
                    }`}
                  >
                    {LANGUAGES.find((l) => l.id === s.language)?.label ?? s.language}
                    {i === 0 ? " · first" : ""}
                  </button>
                ))}
              </div>
            )}
            {!phase.fromVault && lastContext.current && (
              <Button
                variant="ghost"
                className="mt-3"
                onClick={() => lastContext.current && void solve(lastContext.current, language, true)}
                icon={<RefreshCw size={14} aria-hidden="true" />}
              >
                Regenerate
              </Button>
            )}
          </Card>
          <SolutionView solution={phase.solution} />
          <ChatCard
            key={`${phase.ref.platform}/${phase.ref.file}`}
            problemRef={phase.ref}
            language={phase.solution.language}
            initial={phase.problem.chat ?? []}
          />
        </>
      )}
    </div>
  );
}
