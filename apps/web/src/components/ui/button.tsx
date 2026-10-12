type Variant = "primary" | "soft" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand/90",
  soft: "bg-brand-soft text-brand hover:bg-brand/15",
  ghost: "bg-chip text-muted hover:text-foreground",
};

/** Pill button. primary = main action, soft = secondary, ghost = quiet. */
export function Button({
  variant = "soft",
  icon,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
