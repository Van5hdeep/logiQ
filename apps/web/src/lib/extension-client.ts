"use client";

import { EXTENSION_ID, type ExtensionMessage, type ProblemRef } from "@logiq/shared";

type ChromeRuntime = {
  sendMessage: (id: string, message: unknown, callback: (response: unknown) => void) => void;
  lastError?: { message?: string };
};

function runtime(): ChromeRuntime | undefined {
  return (globalThis as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
}

/** Sends a message to the logiQ extension. Resolves null if it isn't installed. */
function send<T>(message: ExtensionMessage, timeoutMs = 1500): Promise<T | null> {
  const rt = runtime();
  if (!rt?.sendMessage) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    try {
      rt.sendMessage(EXTENSION_ID, message, (response) => {
        clearTimeout(timer);
        resolve(rt.lastError ? null : ((response as T) ?? null));
      });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

export async function extensionVersion(): Promise<string | null> {
  const res = await send<{ ok: boolean; version: string }>({ type: "ping" });
  return res?.ok ? res.version : null;
}

/**
 * Opens the question in a new tab with the extension side panel showing the saved solution.
 * Returns false (and just opens the question) when the extension isn't installed.
 */
export async function openSolution(ref: ProblemRef, url: string): Promise<boolean> {
  const res = await send<{ ok: boolean }>({ type: "open-solution", ref, url }, 5000);
  if (res?.ok) return true;
  window.open(url, "_blank", "noopener");
  return false;
}
