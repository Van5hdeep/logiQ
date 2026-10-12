"use client";

import { useState } from "react";
import {
  DEFAULT_MODEL_ID,
  type FreeModel,
  type KeyStatus,
  type ModelTestResult,
} from "@logiq/shared";
import { Info } from "lucide-react";
import { shortModelName } from "@/lib/format";
import { useModel } from "../model-provider";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { FilterPill } from "../ui/pill";
import { StatTile } from "../ui/stat-tile";
import { ModelCard } from "./model-card";

type Filter = "all" | "recommended" | "json";

export function ModelsView({
  models,
  initialKey,
}: {
  models: FreeModel[];
  initialKey: KeyStatus | null;
}) {
  const { modelId, setModelId } = useModel();
  const [filter, setFilter] = useState<Filter>("all");
  const [key, setKey] = useState<KeyStatus | null>(initialKey);
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ModelTestResult>>({});

  const visible = models.filter(
    (m) =>
      filter === "all" ||
      (filter === "recommended" && m.tier === "recommended") ||
      (filter === "json" && m.jsonMode),
  );
  const selectedExists = models.some((m) => m.id === modelId);

  async function runTest(id: string) {
    setTesting(id);
    try {
      const res = await fetch("/api/models/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: id }),
      });
      const data = (await res.json()) as { result?: ModelTestResult; key?: KeyStatus | null };
      const result: ModelTestResult =
        data.result ?? {
          ok: false,
          latencyMs: 0,
          error: { kind: "unknown", message: "The test request was rejected." },
        };
      setResults((prev) => ({ ...prev, [id]: result }));
      if (data.key) setKey(data.key);
    } catch {
      setResults((prev) => ({
        ...prev,
        [id]: {
          ok: false,
          latencyMs: 0,
          error: { kind: "network", message: "Could not reach the logiQ server." },
        },
      }));
    } finally {
      setTesting(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Free models available" value={models.length} tone="sky" />
        <StatTile
          label={key ? `Free requests left today (of ${key.dailyLimit})` : "Free requests left today"}
          value={key?.dailyRemaining ?? 0}
          tone={key && key.dailyRemaining === 0 ? "peach" : "mint"}
        />
        <div className="col-span-2 rounded-tile border border-line bg-lilac px-5 py-4 sm:col-span-1">
          <dd className="truncate text-lg font-semibold leading-tight">{shortModelName(modelId)}</dd>
          <dt className="mt-1 text-sm text-muted">Model in use</dt>
        </div>
      </dl>

      <Card tone="butter" className="flex gap-3 pt-6 text-sm">
        <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="space-y-1.5">
          <p className="font-medium">How limits work</p>
          <p>
            The daily free allowance is shared by <strong>all</strong> free models, so switching
            models does not reset it. Switching helps when one model is busy (a temporary limit
            from its provider) or gives weak answers. Each Test uses 1 free request. To raise the
            daily limit from 50 to 1,000, add $10 credit once on OpenRouter. The counter is reported by OpenRouter and can lag a few minutes.
          </p>
        </div>
      </Card>

      {!selectedExists && (
        <Card tone="peach" className="flex flex-wrap items-center justify-between gap-3 pt-6 text-sm">
          <p>
            <span className="font-medium">{shortModelName(modelId)}</span> is no longer in the
            free list. Pick another model.
          </p>
          <Button variant="primary" onClick={() => setModelId(DEFAULT_MODEL_ID)}>
            Use recommended default
          </Button>
        </Card>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter models">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterPill>
        <FilterPill active={filter === "recommended"} onClick={() => setFilter("recommended")}>
          Recommended
        </FilterPill>
        <FilterPill active={filter === "json"} onClick={() => setFilter("json")}>
          JSON output
        </FilterPill>
      </div>

      <ul className="flex flex-col gap-4">
        {visible.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            selected={model.id === modelId}
            testing={testing === model.id}
            result={results[model.id]}
            onSelect={() => setModelId(model.id)}
            onTest={() => runTest(model.id)}
          />
        ))}
      </ul>
    </div>
  );
}
