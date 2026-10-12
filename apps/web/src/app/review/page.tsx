import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Review" };

export default function ReviewPage() {
  return (
    <ComingSoon
      title="Review"
      description="Spaced-repetition queue: problems that are due, shown so you recall the approach before revealing it."
    />
  );
}
