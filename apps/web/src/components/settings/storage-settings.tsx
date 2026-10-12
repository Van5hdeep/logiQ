"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StorageInfo } from "@logiq/shared";
import { Check, FolderOpen, FolderSearch, Lock } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Pill } from "../ui/pill";

type Status = { kind: "ok" | "error"; text: string } | null;

export function StorageSettings({ initial }: { initial: StorageInfo }) {
  const router = useRouter();
  const [info, setInfo] = useState(initial);
  const [draft, setDraft] = useState(initial.dataDir);
  const [copyExisting, setCopyExisting] = useState(true);
  const [busy, setBusy] = useState<"browse" | "save" | null>(null);
  const [status, setStatus] = useState<Status>(null);

  const locked = info.source === "env";
  const changed = draft.trim() !== "" && draft.trim() !== info.dataDir;

  async function browse() {
    setBusy("browse");
    setStatus(null);
    try {
      const res = await fetch("/api/storage/browse", { method: "POST" });
      const { path } = (await res.json()) as { path: string | null };
      if (path) setDraft(path);
      else setStatus({ kind: "error", text: "No folder chosen. You can also type the path." });
    } catch {
      setStatus({ kind: "error", text: "Couldn't open the folder picker. Type the path instead." });
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    setStatus(null);
    try {
      const res = await fetch("/api/storage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataDir: draft, copyExisting }),
      });
      const body = (await res.json()) as (StorageInfo & { copied: number }) | { error: string };
      if (!res.ok || "error" in body) {
        setStatus({ kind: "error", text: "error" in body ? body.error : "Couldn't change the folder." });
        return;
      }
      setInfo(body);
      setDraft(body.dataDir);
      setStatus({
        kind: "ok",
        text: `Saving to ${body.dataDir} from now on.${body.copied ? ` Copied ${body.copied} problem${body.copied === 1 ? "" : "s"} there; the old files were left in place.` : ""}`,
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card accent="sky" className="flex flex-col gap-5 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Storage folder</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Every problem is saved as a file here, in leetcode, codeforces and codechef sub-folders.
          </p>
        </div>
        <Pill tone="sky">
          {info.problemCount} problem{info.problemCount === 1 ? "" : "s"} saved
        </Pill>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-tile bg-chip px-4 py-3">
        <code className="min-w-0 flex-1 break-all font-mono text-sm">{info.dataDir}</code>
        {info.source === "default" && <Pill>Default</Pill>}
        <Button
          variant="ghost"
          className="bg-card"
          onClick={() => void fetch("/api/storage/open", { method: "POST" })}
          icon={<FolderOpen size={15} aria-hidden="true" />}
        >
          Open folder
        </Button>
      </div>

      {locked ? (
        <p className="flex items-center gap-2 rounded-tile bg-butter px-4 py-3 text-sm">
          <Lock size={15} aria-hidden="true" />
          Set by LOGIQ_DATA_DIR in apps/web/.env.local. Remove that line and restart to choose a folder here.
        </p>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label htmlFor="data-dir" className="text-sm font-medium">
            Save problems in
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="data-dir"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              placeholder={info.defaultDir}
              className="min-w-0 flex-1 rounded-full border border-line bg-card px-4 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-brand/40"
            />
            <Button
              variant="soft"
              onClick={() => void browse()}
              disabled={busy !== null}
              icon={<FolderSearch size={15} aria-hidden="true" />}
            >
              {busy === "browse" ? "Choose in the window…" : "Browse"}
            </Button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={copyExisting}
              onChange={(e) => setCopyExisting(e.target.checked)}
              className="size-4 accent-[var(--brand)]"
            />
            Copy my saved problems to the new folder (the old files stay where they are)
          </label>

          <div>
            <Button
              type="submit"
              variant="primary"
              disabled={!changed || busy !== null}
              icon={<Check size={15} aria-hidden="true" />}
            >
              {busy === "save" ? "Saving…" : "Use this folder"}
            </Button>
          </div>
        </form>
      )}

      {status && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`rounded-tile px-4 py-3 text-sm ${status.kind === "ok" ? "bg-mint" : "bg-peach"}`}
        >
          {status.text}
        </p>
      )}
    </Card>
  );
}
