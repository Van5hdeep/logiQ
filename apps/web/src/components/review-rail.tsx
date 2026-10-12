import { PLATFORM_LABEL } from "@logiq/shared";
import { Clock } from "lucide-react";
import { connection } from "next/server";
import { listProblems } from "@/lib/store";
import { Card, RAINBOW_COLORS, type Tone } from "./ui/card";
import { SectionTitle } from "./ui/section-title";

const TONES: Tone[] = ["sky", "lilac", "butter"];
const DAY = 24 * 60 * 60 * 1000;

function relativeDay(iso: string, now: number) {
  const days = Math.floor((now - new Date(iso).getTime()) / DAY);
  return days <= 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
}

/** Right rail data: problems to look at again and how many you did each day this week. */
async function loadRail() {
  await connection();
  const problems = await listProblems();
  const now = Date.now();
  const toRevisit = problems.filter((p) => p.status !== "solved").slice(0, 3);

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now - (6 - i) * DAY);
    const key = day.toISOString().slice(0, 10);
    return {
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      count: problems.filter((p) => p.savedAt.slice(0, 10) === key).length,
    };
  });
  const max = Math.max(1, ...week.map((d) => d.count));
  return { now, toRevisit, week, max };
}

export async function ReviewRail() {
  const { now, toRevisit, week, max } = await loadRail();
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Look again" count={toRevisit.length} />

      {toRevisit.length === 0 ? (
        <Card dashed className="p-5 text-sm text-muted">
          Problems you haven&apos;t marked solved show up here.
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {toRevisit.map((problem, i) => (
            <Card key={problem.id} as="li" tone={TONES[i % TONES.length]} className="p-4 pt-5">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="inline-flex items-center gap-2">
                  <Clock size={15} aria-hidden="true" />
                  {PLATFORM_LABEL[problem.platform]}
                </span>
                <span className="text-muted">{relativeDay(problem.savedAt, now)}</span>
              </div>
              <div className="mt-3 rounded-tile bg-white/70 p-3 text-sm">
                <p className="font-medium leading-snug">{problem.title}</p>
                {problem.patterns.length > 0 && (
                  <p className="mt-1 text-xs text-muted">{problem.patterns.join(" · ")}</p>
                )}
              </div>
            </Card>
          ))}
        </ul>
      )}

      <Card accent="rainbow" className="mt-2 pt-6">
        <SectionTitle title="This week" as="h3" />
        <div className="mt-5 flex h-32 gap-2">
          {week.map(({ label, count }, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div
                title={`${count} problems`}
                style={{
                  height: `${Math.max(8, (count / max) * 88)}px`,
                  backgroundColor: RAINBOW_COLORS[i % RAINBOW_COLORS.length],
                  opacity: i === 6 ? 1 : 0.4,
                }}
                className="w-full rounded-xl"
              />
              <span className="text-[11px] text-muted">{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
