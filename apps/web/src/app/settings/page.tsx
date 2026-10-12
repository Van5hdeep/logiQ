import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { StorageSettings } from "@/components/settings/storage-settings";
import { SectionTitle } from "@/components/ui/section-title";
import { storageInfo } from "@/lib/storage-location";

export const metadata: Metadata = { title: "Settings" };

async function StorageData() {
  await connection();
  return <StorageSettings initial={await storageInfo()} />;
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle as="h1" title="Settings" />
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Where your vault is saved. The AI model is chosen on the Models page.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-card bg-chip" aria-busy="true" />}>
        <StorageData />
      </Suspense>
    </div>
  );
}
