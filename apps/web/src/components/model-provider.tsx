"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_MODEL_ID, type Settings } from "@logiq/shared";

type ModelContextValue = {
  /** OpenRouter id of the model used for explanations. */
  modelId: string;
  setModelId: (id: string) => void;
};

const ModelContext = createContext<ModelContextValue | null>(null);

/**
 * The chosen model lives in settings.json in the DSA folder (via /api/settings),
 * so the extension uses the same model you pick here.
 */
export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [modelId, setModelIdState] = useState(DEFAULT_MODEL_ID);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? (r.json() as Promise<Settings>) : null))
      .then((s) => {
        if (s?.modelId) setModelIdState(s.modelId);
      })
      .catch(() => {});
  }, []);

  const setModelId = useCallback((id: string) => {
    setModelIdState(id);
    void fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId: id }),
    });
  }, []);

  const value = useMemo(() => ({ modelId, setModelId }), [modelId, setModelId]);
  return <ModelContext value={value}>{children}</ModelContext>;
}

export function useModel(): ModelContextValue {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used inside <ModelProvider>");
  return ctx;
}
