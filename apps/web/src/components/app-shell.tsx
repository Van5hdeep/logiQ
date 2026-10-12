import os from "node:os";
import { Suspense } from "react";
import { ModelProvider } from "./model-provider";
import { ReviewRail } from "./review-rail";
import { SearchProvider } from "./search-provider";
import { TopNav } from "./top-nav";

/**
 * White device-style frame: top nav, then a canvas split into main content and a right rail
 * ("Review today"). Frame (border, radius, shadow) is dropped on small screens.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <ModelProvider>
        <div className="min-h-screen md:p-5">
          <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col overflow-hidden bg-canvas md:min-h-[calc(100vh-2.5rem)] md:rounded-[36px] md:border md:border-line md:shadow-card">
            <TopNav userName={os.userInfo().username} />
            <div className="grid min-w-0 flex-1 xl:grid-cols-[minmax(0,1fr)_340px]">
              <main className="min-w-0 p-5 md:p-8">{children}</main>
              <aside
                aria-label="Review today"
                className="hidden border-l border-line bg-rail p-6 xl:block"
              >
                <Suspense fallback={null}>
                  <ReviewRail />
                </Suspense>
              </aside>
            </div>
          </div>
        </div>
      </ModelProvider>
    </SearchProvider>
  );
}
