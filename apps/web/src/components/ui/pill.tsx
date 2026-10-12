import type { Tone } from "./card";

const PILL_TONE: Record<Tone | "neutral", string> = {
  neutral: "bg-chip text-muted",
  white: "bg-card text-foreground border border-line",
  mint: "bg-mint text-foreground",
  lilac: "bg-lilac text-foreground",
  butter: "bg-butter text-foreground",
  sky: "bg-sky text-foreground",
  peach: "bg-peach text-foreground",
};

/** Small static label (status, difficulty, pattern). */
export function Pill({
  tone = "neutral",
  icon,
  children,
  className = "",
}: {
  tone?: Tone | "neutral";
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${PILL_TONE[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

/** Toggle button used for filters. Active = soft indigo tint with indigo text. */
export function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors " +
        (active
          ? "border-brand/30 bg-pill-active text-pill-active-fg"
          : "border-line bg-card text-muted hover:border-line-strong hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
