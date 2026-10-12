import { AccentBar, type Tone } from "./card";

const TILE_TONE: Record<Tone, string> = {
  white: "bg-card",
  mint: "bg-mint",
  lilac: "bg-lilac",
  butter: "bg-butter",
  sky: "bg-sky",
  peach: "bg-peach",
};

/** Big-number tile with a coloured top bar. `dashed` renders the outlined, unfilled variant. */
export function StatTile({
  label,
  value,
  tone = "white",
  dashed = false,
}: {
  label: string;
  value: number;
  tone?: Tone;
  dashed?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-tile px-5 py-4 ${
        dashed ? "border border-dashed border-line-strong" : `${TILE_TONE[tone]} border border-line`
      }`}
    >
      {!dashed && tone !== "white" && <AccentBar accent={tone} />}
      <dd className="text-4xl font-semibold tabular-nums tracking-tight">{value}</dd>
      <dt className="mt-1 text-sm text-muted">{label}</dt>
    </div>
  );
}
