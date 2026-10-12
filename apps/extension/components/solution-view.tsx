import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { languageLabel, type Solution } from "@logiq/shared";
import { Card } from "./ui";

/** The three answer parts: complete code, every line explained, time and space complexity. */
export function SolutionView({ solution }: { solution: Solution }) {
  const [active, setActive] = useState<{ from: number; to: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const codeLines = solution.code.replace(/\s+$/, "").split("\n");

  async function copy() {
    await navigator.clipboard.writeText(solution.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      {solution.idea && (
        <Card accent="butter" tone="bg-butter">
          <h2 className="mb-2 text-base font-semibold">The idea, in simple words</h2>
          <p className="leading-relaxed">{solution.idea}</p>
        </Card>
      )}
      <Card accent="lilac">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">1. Code · {languageLabel(solution.language)}</h2>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full bg-chip px-3 py-1 text-xs font-medium text-muted hover:text-foreground"
          >
            {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-tile bg-chip p-3 font-mono text-[12px] leading-5">
          {codeLines.map((line, i) => {
            const n = i + 1;
            const lit = active && n >= active.from && n <= active.to;
            return (
              <div key={n} className={`flex rounded ${lit ? "bg-brand-soft" : ""}`}>
                <span className="w-7 shrink-0 select-none pr-2 text-right text-muted">{n}</span>
                <code className="whitespace-pre">{line || " "}</code>
              </div>
            );
          })}
        </pre>
      </Card>

      <Card accent="sky">
        <h2 className="mb-3 text-base font-semibold">2. Line by line</h2>
        <ol className="flex flex-col gap-2">
          {solution.lines.map((note, i) => (
            <li
              key={i}
              onMouseEnter={() => setActive({ from: note.from, to: note.to })}
              onMouseLeave={() => setActive(null)}
              className="rounded-tile border border-line p-3 transition-colors hover:border-brand/40 hover:bg-brand-soft/40"
            >
              <p className="text-[11px] font-medium text-muted">
                {note.from === note.to ? `Line ${note.from}` : `Lines ${note.from}–${note.to}`}
              </p>
              <code className="mt-1 block overflow-x-auto whitespace-pre font-mono text-[12px]">
                {note.code}
              </code>
              <p className="mt-1.5 leading-relaxed">{note.explanation}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card accent="mint">
        <h2 className="mb-3 text-base font-semibold">3. Complexity</h2>
        <div className="grid gap-2">
          <div className="rounded-tile bg-sky p-3">
            <p className="text-xs text-muted">Time</p>
            <p className="font-mono text-lg font-semibold">{solution.complexity.time}</p>
            <p className="mt-1 leading-relaxed">{solution.complexity.timeReason}</p>
          </div>
          <div className="rounded-tile bg-mint p-3">
            <p className="text-xs text-muted">Space</p>
            <p className="font-mono text-lg font-semibold">{solution.complexity.space}</p>
            <p className="mt-1 leading-relaxed">{solution.complexity.spaceReason}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
