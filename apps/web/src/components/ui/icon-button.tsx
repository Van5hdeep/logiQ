/** Circular 36px icon target. Use on links (`<a className={iconButtonClass}>`) or buttons. */
export const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full bg-chip text-muted transition-colors hover:bg-brand-soft hover:text-brand";

export function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={iconButtonClass}>
      {children}
    </button>
  );
}
