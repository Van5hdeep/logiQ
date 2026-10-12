"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useSearch } from "./search-provider";

/** Rounded search field wired to the shared query. Press "/" anywhere to focus it. */
export function SearchPill({ placeholder }: { placeholder: string }) {
  const { query, setQuery } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative w-full md:w-80">
      <Search
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full bg-chip py-3 pl-11 pr-12 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-brand/40"
      />
      <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md bg-card px-1.5 text-[11px] text-muted sm:block">
        /
      </kbd>
    </div>
  );
}
