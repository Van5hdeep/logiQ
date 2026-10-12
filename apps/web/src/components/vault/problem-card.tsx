"use client";

import { useState } from "react";
import {
  languageLabel,
  PLATFORM_LABEL,
  STATUS_LABEL,
  type DifficultyTone,
  type Platform,
  type ProblemStatus,
  type VaultProblem,
} from "@logiq/shared";
import { BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { openSolution } from "@/lib/extension-client";
import { shortModelName } from "@/lib/format";
import { Button } from "../ui/button";
import { Card, type Tone } from "../ui/card";
import { Pill } from "../ui/pill";

const DIFFICULTY_TONE: Record<DifficultyTone, Tone> = {
  easy: "mint",
  medium: "butter",
  hard: "peach",
};

const STATUS_TONE: Record<ProblemStatus, Exclude<Tone, "white">> = {
  solved: "mint",
  attempted: "butter",
  revisit: "peach",
};

const PLATFORM_CODE: Record<Platform, string> = {
  leetcode: "LC",
  codeforces: "CF",
  codechef: "CC",
};

const PLATFORM_TONE: Record<Platform, string> = {
  leetcode: "bg-butter",
  codeforces: "bg-sky",
  codechef: "bg-lilac",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function ProblemCard({
  problem,
  featured = false,
}: {
  problem: VaultProblem;
  /** Lilac highlight for the most recent problem. */
  featured?: boolean;
}) {
  const [notice, setNotice] = useState<string | null>(null);

  async function onOpenSolution() {
    setNotice(null);
    const viaExtension = await openSolution({ platform: problem.platform, file: problem.file }, problem.url);
    if (!viaExtension) {
      setNotice(
        "The logiQ extension isn't installed or enabled, so only the question opened. Get it from the Extension page.",
      );
    }
  }

  return (
    <Card
      as="li"
      tone={featured ? "lilac" : "white"}
      accent={featured ? "lilac" : STATUS_TONE[problem.status]}
      className="flex flex-col gap-4 pt-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {featured && (
            <Pill tone="white" icon={<Sparkles size={13} aria-hidden="true" />} className="mb-3">
              Latest explanation
            </Pill>
          )}
          <h2 className="text-xl font-semibold leading-tight tracking-tight">{problem.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {PLATFORM_LABEL[problem.platform]}
            {problem.answeredBy ? ` · ${shortModelName(problem.answeredBy)}` : ""}
          </p>
        </div>
        <span
          aria-hidden="true"
          className={`grid size-11 shrink-0 place-items-center rounded-full text-xs font-semibold ${PLATFORM_TONE[problem.platform]}`}
        >
          {PLATFORM_CODE[problem.platform]}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Pill tone={DIFFICULTY_TONE[problem.difficulty.tone]}>{problem.difficulty.label}</Pill>
        {problem.patterns.map((pattern) => (
          <Pill key={pattern}>{pattern}</Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <Pill tone={STATUS_TONE[problem.status]}>{STATUS_LABEL[problem.status]}</Pill>
        <span>{problem.languages.map(languageLabel).join(", ")}</span>
        <span>{formatDate(problem.savedAt)}</span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => void onOpenSolution()}
          icon={<BookOpen size={15} aria-hidden="true" />}
        >
          Open solution
        </Button>
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-chip px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ExternalLink size={15} aria-hidden="true" />
          Open question
        </a>
      </div>

      {notice && (
        <p role="status" className="rounded-tile bg-peach px-4 py-3 text-sm">
          {notice}
        </p>
      )}
    </Card>
  );
}
