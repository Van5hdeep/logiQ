type LogoMarkProps = { size?: number; className?: string };

/** "Scholar node" mark: mortarboard over a vault base, tassel ends in a graph node. */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="logiQ"
      className={className}
    >
      <polygon
        points="50,12 94,34 50,56 6,34"
        fill="var(--brand)"
        stroke="var(--brand)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M22 50 V68 L50 84 L78 68 V50 L50 64 Z"
        fill="var(--logo-body)"
        stroke="var(--logo-body)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <line
        x1="6"
        y1="34"
        x2="6"
        y2="64"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="6" cy="68" r="6" fill="var(--accent)" />
    </svg>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize: size * 0.75 }}
      >
        logi<span className="text-brand">Q</span>
      </span>
    </span>
  );
}
