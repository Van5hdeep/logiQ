export type Tone = "white" | "mint" | "lilac" | "butter" | "sky" | "peach";

/** Accent = the coloured bar on top of a container. "rainbow" spans all seven colours. */
export type Accent = Exclude<Tone, "white"> | "rainbow";

const TONE_CLASS: Record<Tone, string> = {
  white: "bg-card",
  mint: "bg-mint",
  lilac: "bg-lilac",
  butter: "bg-butter",
  sky: "bg-sky",
  peach: "bg-peach",
};

export const ACCENT_BACKGROUND: Record<Accent, string> = {
  mint: "var(--a-mint)",
  lilac: "var(--a-lilac)",
  butter: "var(--a-butter)",
  sky: "var(--a-sky)",
  peach: "var(--a-peach)",
  rainbow: "var(--rainbow)",
};

/** Rainbow order, used by charts that colour each bar. */
export const RAINBOW_COLORS = [
  "#fb7185",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#38bdf8",
  "#818cf8",
  "#c084fc",
] as const;

export function AccentBar({ accent }: { accent: Accent }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-8 top-0 h-1 rounded-b-full"
      style={{ background: ACCENT_BACKGROUND[accent] }}
    />
  );
}

type CardProps = {
  tone?: Tone;
  /** Coloured bar along the top edge. Defaults to the tone's colour; "rainbow" for hero cards. */
  accent?: Accent;
  /** Dashed outline, no fill: used for "empty" or secondary slots. */
  dashed?: boolean;
  as?: "div" | "li" | "section" | "article";
  className?: string;
  children: React.ReactNode;
};

/** Base surface. White, 28px radius, hairline border, soft shadow, rainbow-accent top bar. */
export function Card({
  tone = "white",
  accent,
  dashed = false,
  as: Component = "div",
  className = "",
  children,
}: CardProps) {
  const bar = accent ?? (tone === "white" ? undefined : tone);
  const surface = dashed
    ? "border border-dashed border-line-strong"
    : `${TONE_CLASS[tone]} border border-line shadow-card`;
  return (
    <Component className={`relative overflow-hidden rounded-card p-5 ${surface} ${className}`}>
      {!dashed && bar && <AccentBar accent={bar} />}
      {children}
    </Component>
  );
}
