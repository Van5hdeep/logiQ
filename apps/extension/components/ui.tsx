/* Small copies of the web app's primitives (apps/web/src/components/ui), same tokens and rules. */

type Accent = "mint" | "lilac" | "butter" | "sky" | "peach" | "rainbow";

const ACCENT: Record<Accent, string> = {
  mint: "#4ade80",
  lilac: "#a78bfa",
  butter: "#facc15",
  sky: "#38bdf8",
  peach: "#fb923c",
  rainbow: "var(--rainbow)",
};

export function Card({
  accent,
  tone = "bg-card",
  className = "",
  children,
}: {
  accent?: Accent;
  tone?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-card border border-line p-4 pt-5 shadow-card ${tone} ${className}`}
    >
      {accent && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-1 rounded-b-full"
          style={{ background: ACCENT[accent] }}
        />
      )}
      {children}
    </section>
  );
}

const BUTTON: Record<"primary" | "soft" | "ghost", string> = {
  primary: "bg-brand text-white hover:bg-brand/90",
  soft: "bg-brand-soft text-brand hover:bg-brand/15",
  ghost: "bg-chip text-muted hover:text-foreground",
};

export function Button({
  variant = "soft",
  icon,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

export function Pill({ tone = "bg-chip text-muted", children }: { tone?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {children}
    </span>
  );
}
