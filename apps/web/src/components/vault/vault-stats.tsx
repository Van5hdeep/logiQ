import type { VaultProblem } from "@logiq/shared";
import { StatTile } from "../ui/stat-tile";

export function VaultStats({ problems }: { problems: VaultProblem[] }) {
  const count = (status: VaultProblem["status"]) =>
    problems.filter((p) => p.status === status).length;

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile label="Saved" value={problems.length} tone="sky" />
      <StatTile label="Solved" value={count("solved")} tone="mint" />
      <StatTile label="Attempted" value={count("attempted")} tone="butter" />
      <StatTile label="To revisit" value={count("revisit")} dashed />
    </dl>
  );
}
