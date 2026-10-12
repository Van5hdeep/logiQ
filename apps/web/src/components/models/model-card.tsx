import type { FreeModel, ModelTestResult } from "@logiq/shared";
import { Brain, Check, Eye, FileJson, Loader2, Star, Zap } from "lucide-react";
import { formatDateUtc, formatTokens } from "@/lib/format";
import { AiErrorNotice } from "../ai/ai-error-notice";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Pill } from "../ui/pill";

export function ModelCard({
  model,
  selected,
  testing,
  result,
  onSelect,
  onTest,
}: {
  model: FreeModel;
  selected: boolean;
  testing: boolean;
  result: ModelTestResult | undefined;
  onSelect: () => void;
  onTest: () => void;
}) {
  const recommended = model.tier === "recommended";

  return (
    <Card
      as="li"
      tone={selected ? "lilac" : "white"}
      accent={recommended ? "rainbow" : selected ? "lilac" : undefined}
      className="flex flex-col gap-4 pt-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold leading-tight tracking-tight">{model.name}</h2>
            {recommended && (
              <Pill tone="mint" icon={<Star size={13} aria-hidden="true" />}>
                Recommended{model.label ? ` · ${model.label}` : ""}
              </Pill>
            )}
            {!recommended && model.label && (
              <Pill tone={model.usable ? "sky" : "peach"}>{model.label}</Pill>
            )}
          </div>
          <p className="mt-1 break-all font-mono text-xs text-muted">{model.id}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            onClick={onTest}
            disabled={testing || !model.usable}
            icon={
              testing ? (
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              ) : (
                <Zap size={15} aria-hidden="true" />
              )
            }
          >
            {testing ? "Testing…" : "Test"}
          </Button>
          <Button
            variant={selected ? "soft" : "primary"}
            onClick={onSelect}
            disabled={!model.usable}
            aria-pressed={selected}
            icon={selected ? <Check size={15} aria-hidden="true" /> : undefined}
          >
            {selected ? "In use" : "Use this model"}
          </Button>
        </div>
      </div>

      <p className="text-sm leading-relaxed">{model.reason}</p>
      {model.evidence && (
        <p className="text-xs text-muted">
          <span className="font-medium text-foreground">Evidence:</span> {model.evidence}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <Pill>{formatTokens(model.contextLength)} context</Pill>
        {model.reasoning && <Pill icon={<Brain size={13} aria-hidden="true" />}>Reasoning</Pill>}
        {model.jsonMode && <Pill icon={<FileJson size={13} aria-hidden="true" />}>JSON output</Pill>}
        {model.vision && <Pill icon={<Eye size={13} aria-hidden="true" />}>Images</Pill>}
        {model.expiresAt && <Pill tone="peach">Free until {formatDateUtc(model.expiresAt)}</Pill>}
      </div>

      {result && (
        <div aria-live="polite">
          {result.ok ? (
            <p className="inline-flex items-center gap-2 rounded-tile bg-mint px-4 py-3 text-sm font-medium">
              <Check size={16} aria-hidden="true" />
              Works. Answered in {(result.latencyMs / 1000).toFixed(1)}s
            </p>
          ) : (
            result.error && <AiErrorNotice error={result.error} showSwitchLink={false} />
          )}
        </div>
      )}
    </Card>
  );
}
