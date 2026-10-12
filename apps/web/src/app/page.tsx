import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { VaultView } from "@/components/vault/vault-view";
import { getDataDir } from "@/lib/storage-location";
import { listProblems } from "@/lib/store";

export const metadata: Metadata = { title: "Vault" };

async function VaultData() {
  // The vault is the DSA folder on disk: always read it at request time.
  await connection();
  const [problems, dataDir] = await Promise.all([listProblems(), getDataDir()]);
  return <VaultView problems={problems} dataDir={dataDir} />;
}

function VaultSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading vault">
      <div className="h-12 w-64 animate-pulse rounded-tile bg-chip" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-tile bg-chip" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-card bg-chip" />
    </div>
  );
}

export default function VaultPage() {
  return (
    <Suspense fallback={<VaultSkeleton />}>
      <VaultData />
    </Suspense>
  );
}
