import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ModelsView } from "@/components/models/models-view";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { fetchFreeModels, fetchKeyStatus } from "@/lib/ai/openrouter";

export const metadata: Metadata = { title: "Models" };

async function loadData() {
  try {
    const [models, key] = await Promise.all([fetchFreeModels(), fetchKeyStatus()]);
    return { models, key };
  } catch {
    return null;
  }
}

async function ModelsData() {
  // Live data (model list + today's quota): always render at request time.
  await connection();
  const data = await loadData();
  if (!data) {
    return (
      <Card dashed className="p-10 text-center text-sm text-muted">
        Could not load the model list from OpenRouter. Check your internet connection and reload.
      </Card>
    );
  }
  return <ModelsView models={data.models} initialKey={data.key} />;
}

function ModelsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading models">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-card bg-chip" />
      ))}
    </div>
  );
}

export default function ModelsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle as="h1" title="Models" />
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Free AI models from OpenRouter, ranked for DSA and problem solving. If the model you are
          using hits a limit, switch to another one here.
        </p>
      </div>
      <Suspense fallback={<ModelsSkeleton />}>
        <ModelsData />
      </Suspense>
    </div>
  );
}
