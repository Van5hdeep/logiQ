"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu } from "lucide-react";
import { shortModelName } from "@/lib/format";
import { Logo } from "./logo";
import { useModel } from "./model-provider";
import { NAV_ITEMS } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavPills({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={`items-center gap-1 ${className}`}>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors " +
              (active
                ? "bg-card text-brand shadow-card"
                : "text-muted hover:text-foreground")
            }
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Shows the active AI model; click to switch. */
function ModelChip() {
  const { modelId } = useModel();
  return (
    <Link
      href="/models"
      title="Switch AI model"
      className="hidden max-w-48 items-center gap-2 rounded-full bg-chip px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-brand-soft hover:text-brand lg:flex"
    >
      <Cpu size={14} aria-hidden="true" />
      <span className="truncate">{shortModelName(modelId)}</span>
    </Link>
  );
}

/** White top bar: logo left, pill navigation centre, profile right, rainbow hairline below. */
export function TopNav({ userName }: { userName: string }) {
  return (
    <header className="bg-card">
      <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link href="/" aria-label="logiQ home">
          <Logo size={32} />
        </Link>

        <NavPills className="hidden rounded-full bg-chip p-1 md:flex" />

        <div className="flex items-center gap-3">
          <ModelChip />
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand to-accent text-sm font-semibold text-white"
          >
            {userName.charAt(0).toUpperCase() || "?"}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-muted">Local profile</p>
          </div>
        </div>
      </div>
      <NavPills className="flex overflow-x-auto px-4 pb-3 md:hidden" />
      <div aria-hidden="true" className="h-0.5 opacity-70" style={{ background: "var(--rainbow)" }} />
    </header>
  );
}
