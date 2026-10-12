/** 1048576 -> "1M", 262144 -> "262K", 65536 -> "66K". */
export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`.replace(".0M", "M");
  return `${Math.round(n / 1000)}K`;
}

/** "google/gemma-4-31b-it:free" -> "gemma-4-31b-it". */
export function shortModelName(id: string): string {
  return id.split("/").pop()?.replace(/:free$/, "") ?? id;
}

export function formatDateUtc(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
