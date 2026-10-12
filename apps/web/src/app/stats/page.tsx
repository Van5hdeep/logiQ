import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Stats" };

export default function StatsPage() {
  return (
    <ComingSoon
      title="Stats"
      description="Streaks, topic coverage and difficulty split across everything in your vault."
    />
  );
}
