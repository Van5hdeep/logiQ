export type Platform = "leetcode" | "codeforces" | "codechef";

export type DifficultyTone = "easy" | "medium" | "hard";

/** LeetCode: "Easy" | "Medium" | "Hard". Codeforces: rating such as "1600". */
export interface Difficulty {
  label: string;
  tone: DifficultyTone;
}

export type ProblemStatus = "solved" | "attempted" | "revisit";

/** One row in the logiQ vault (a summary of a file in the DSA folder). */
export interface VaultProblem {
  /** "<platform>/<file>", unique. */
  id: string;
  /** File name (without .json) inside <vault>\<platform>\ */
  file: string;
  platform: Platform;
  /** Platform id, e.g. "two-sum", "1872C". */
  externalId: string;
  /** Display number: LeetCode "1", Codeforces "1872C". */
  number: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  /** Topic tags, e.g. "hash-table". */
  patterns: string[];
  status: ProblemStatus;
  /** Languages with a saved solution, first one first. */
  languages: string[];
  /** Model that wrote the first saved solution. */
  answeredBy?: string;
  /** ISO timestamp of the first time logiQ helped with this problem. */
  savedAt: string;
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  codechef: "CodeChef",
};

export const STATUS_LABEL: Record<ProblemStatus, string> = {
  solved: "Solved",
  attempted: "Attempted",
  revisit: "Revisit",
};
