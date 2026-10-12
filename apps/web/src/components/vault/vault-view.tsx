"use client";

import { useMemo, useState } from "react";
import {
  PLATFORM_LABEL,
  STATUS_LABEL,
  type Platform,
  type ProblemStatus,
  type VaultProblem,
} from "@logiq/shared";
import Link from "next/link";
import { Download, LayoutGrid, List } from "lucide-react";
import { SearchPill } from "../search-pill";
import { useSearch } from "../search-provider";
import { Card } from "../ui/card";
import { FilterPill } from "../ui/pill";
import { SectionTitle } from "../ui/section-title";
import { ProblemCard } from "./problem-card";
import { VaultStats } from "./vault-stats";

type PlatformFilter = Platform | "all";
type StatusFilter = ProblemStatus | "all";
type ViewMode = "grid" | "list";

const PLATFORMS: PlatformFilter[] = ["all", "leetcode", "codeforces", "codechef"];
const STATUSES: StatusFilter[] = ["all", "solved", "attempted", "revisit"];

function matches(problem: VaultProblem, q: string) {
  if (!q) return true;
  const haystack = [
    problem.title,
    problem.externalId,
    PLATFORM_LABEL[problem.platform],
    problem.difficulty.label,
    ...problem.patterns,
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export function VaultView({ problems, dataDir }: { problems: VaultProblem[]; dataDir: string }) {
  const { query } = useSearch();
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>("grid");

  const visible = useMemo(
    () =>
      problems
        .filter((p) => platform === "all" || p.platform === platform)
        .filter((p) => status === "all" || p.status === status)
        .filter((p) => matches(p, query.trim()))
        .sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    [problems, platform, status, query],
  );

  const unfiltered = platform === "all" && status === "all" && query.trim() === "";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <SectionTitle as="h1" title="My Vault" count={problems.length} />
          <p className="mt-1 text-sm text-muted">
            Every problem logiQ has helped you with, saved and organised.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchPill placeholder="Search title, pattern, platform" />
          <Link
            href="/extension"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand/90"
          >
            <Download size={16} aria-hidden="true" />
            Get extension
          </Link>
        </div>
      </div>

      <VaultStats problems={problems} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Platform">
            {PLATFORMS.map((p) => (
              <FilterPill key={p} active={platform === p} onClick={() => setPlatform(p)}>
                {p === "all" ? "All" : PLATFORM_LABEL[p]}
              </FilterPill>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Status">
            {STATUSES.map((s) => (
              <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
                {s === "all" ? "Any status" : STATUS_LABEL[s]}
              </FilterPill>
            ))}
          </div>
        </div>

        <div className="flex gap-1 rounded-full bg-card p-1 shadow-card" role="group" aria-label="View">
          {(
            [
              { mode: "grid", label: "Grid view", icon: LayoutGrid },
              { mode: "list", label: "List view", icon: List },
            ] as const
          ).map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              aria-label={label}
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={
                "grid size-9 place-items-center rounded-full transition-colors " +
                (view === mode
                  ? "bg-pill-active text-pill-active-fg"
                  : "text-muted hover:text-foreground")
              }
            >
              <Icon size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs text-muted" aria-live="polite">
          {visible.length} of {problems.length} problems · saved in {dataDir} ·{" "}
          <Link href="/settings" className="text-brand hover:underline">
            change folder
          </Link>
        </p>

        {visible.length === 0 ? (
          <Card dashed className="p-10 text-center text-sm text-muted">
            {problems.length === 0
              ? "Your vault is empty. Open a problem, press Alt+L and click Start Question. Every solution is saved here."
              : "No problems match your search or filters."}
          </Card>
        ) : (
          <ul
            className={
              view === "grid" ? "grid gap-4 md:grid-cols-2" : "flex flex-col gap-3"
            }
          >
            {visible.map((problem, i) => (
              <ProblemCard key={problem.id} problem={problem} featured={unfiltered && i === 0} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
