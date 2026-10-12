import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import type { ChatTurn, LanguageId, ProblemRef } from "@logiq/shared";
import { api, ApiError } from "@/lib/api";
import { Card } from "./ui";

const SUGGESTIONS = [
  "Why does this approach work?",
  "Walk me through the first example step by step",
  "Can this be done faster or with less memory?",
  "What mistakes do people usually make here?",
];

/** Inline markdown the models commonly use: **bold**, *italic* and `code`. */
function Inline({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g);
  return (
    <>
      {tokens.map((t, i) =>
        t.startsWith("**") && t.endsWith("**") && t.length > 4 ? (
          <strong key={i}>{t.slice(2, -2)}</strong>
        ) : t.startsWith("`") && t.endsWith("`") && t.length > 2 ? (
          <code key={i} className="rounded bg-card px-1 font-mono text-[12px]">
            {t.slice(1, -1)}
          </code>
        ) : t.startsWith("*") && t.endsWith("*") && t.length > 2 ? (
          <em key={i}>{t.slice(1, -1)}</em>
        ) : (
          t
        ),
      )}
    </>
  );
}

/** Renders an answer: paragraphs with inline markdown, plus ``` code blocks. */
function Message({ text }: { text: string }) {
  const parts = text.split(/```(?:\w+)?\n?/);
  return (
    <div className="flex flex-col gap-2">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="overflow-x-auto rounded-tile bg-chip p-2 font-mono text-[12px] leading-5">
            {part.replace(/\n$/, "")}
          </pre>
        ) : part.trim() ? (
          <p key={i} className="whitespace-pre-wrap leading-relaxed">
            <Inline text={part.trim()} />
          </p>
        ) : null,
      )}
    </div>
  );
}

/** Follow-up questions about the current problem. History is saved in the problem's vault file. */
export function ChatCard({
  problemRef,
  language,
  initial,
}: {
  problemRef: ProblemRef;
  language: LanguageId;
  initial: ChatTurn[];
}) {
  const [chat, setChat] = useState<ChatTurn[]>(initial);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chat.length, sending]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || sending) return;
    setError(null);
    setSending(true);
    setDraft("");
    setChat((c) => [...c, { role: "user", content: q, createdAt: new Date().toISOString() }]);
    try {
      const res = await api.chat({ ref: problemRef, language, question: q });
      setChat(res.chat);
    } catch (e) {
      const err = e as ApiError;
      setChat((c) => c.slice(0, -1));
      setDraft(q);
      setError(
        err.aiError?.kind === "daily_limit"
          ? "Daily free-model limit reached. It resets daily."
          : err.aiError?.kind === "rate_limited" || err.aiError?.kind === "model_unavailable"
            ? "This model is busy right now. Switch model (top right) and ask again."
            : err.message,
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Card accent="butter">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <MessageCircle size={16} aria-hidden="true" />
        Ask a follow-up
      </h2>

      {chat.length === 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void ask(s)}
              disabled={sending}
              className="rounded-full border border-line bg-card px-3 py-1 text-left text-xs text-muted hover:border-brand/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2" aria-live="polite">
        {chat.map((turn, i) =>
          turn.role === "user" ? (
            <div key={i} className="ml-6 self-end rounded-tile bg-brand-soft px-3 py-2 text-brand">
              <p className="whitespace-pre-wrap">{turn.content}</p>
            </div>
          ) : (
            <div key={i} className="mr-2 rounded-tile bg-chip px-3 py-2">
              <Message text={turn.content} />
            </div>
          ),
        )}
        {sending && (
          <p className="flex items-center gap-2 text-xs text-muted">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Thinking…
          </p>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-tile bg-peach px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(draft);
        }}
      >
        <label className="sr-only" htmlFor="logiq-chat">
          Your question
        </label>
        <textarea
          id="logiq-chat"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void ask(draft);
            }
          }}
          rows={2}
          placeholder="Ask anything about this problem…"
          className="min-h-10 flex-1 resize-none rounded-tile border border-line bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/40"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send question"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-white disabled:opacity-50"
        >
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
    </Card>
  );
}
