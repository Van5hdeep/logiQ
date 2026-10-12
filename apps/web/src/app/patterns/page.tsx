import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Patterns" };

export default function PatternsPage() {
  return (
    <ComingSoon
      title="Patterns"
      description="Every technique (sliding window, DP, monotonic stack…) with the problems you solved and how well you know it."
    />
  );
}
