import type { Platform } from "./types";

/** Fixed id of the logiQ extension (pinned by the "key" in its manifest). */
export const EXTENSION_ID = "hfflkpmhfebkhdgbagopjkmkelgoaobo";

/** Where the local logiQ server runs. The extension talks to this. */
export const LOGIQ_SERVER = "http://localhost:3000";

export const LANGUAGES = [
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "go", label: "Go" },
  { id: "c", label: "C" },
  { id: "csharp", label: "C#" },
  { id: "kotlin", label: "Kotlin" },
  { id: "rust", label: "Rust" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];
export const DEFAULT_LANGUAGE: LanguageId = "python";

export function languageLabel(id: string): string {
  return LANGUAGES.find((l) => l.id === id)?.label ?? id;
}

/** What the extension reads from a problem page. */
export interface ProblemContext {
  platform: Platform;
  /** Platform id: LeetCode slug ("two-sum"), Codeforces "1872C", CodeChef "FLIPCOINS". */
  externalId: string;
  /** Display number: LeetCode "1", Codeforces "1872C", CodeChef "FLIPCOINS". */
  number: string;
  title: string;
  url: string;
  statement: string;
  difficulty?: string;
  tags?: string[];
  /** Starter code from the page's editor: shows the expected signature. */
  starterCode?: string;
  starterLanguage?: string;
}

/** One explained line (or group of lines) of the solution code. */
export interface LineNote {
  /** 1-based, inclusive. */
  from: number;
  to: number;
  code: string;
  explanation: string;
}

export interface Complexity {
  time: string;
  timeReason: string;
  space: string;
  spaceReason: string;
}

/** The answer format: full code, every line explained, time and space complexity. */
export interface Solution {
  language: LanguageId;
  /** The approach in 2–4 plain sentences, read before the code. */
  idea?: string;
  code: string;
  lines: LineNote[];
  complexity: Complexity;
  model: string;
  createdAt: string;
}

/** A problem as stored on disk: <vault>\<platform>\<number>-<slug>.json */
export interface StoredProblem {
  version: 1;
  platform: Platform;
  externalId: string;
  number: string;
  title: string;
  url: string;
  difficulty?: string;
  tags: string[];
  statement: string;
  status: "solved" | "attempted" | "revisit";
  savedAt: string;
  updatedAt: string;
  /** In the order they were generated. solutions[0] is the first one logiQ gave you. */
  solutions: Solution[];
  /** Follow-up questions asked in the side panel, oldest first. */
  chat?: ChatTurn[];
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  /** Model that wrote an assistant answer. */
  model?: string;
}

export interface ChatRequest {
  ref: ProblemRef;
  /** Language of the solution the question is about. */
  language: LanguageId;
  question: string;
}

export interface ChatResponse {
  answer: ChatTurn;
  chat: ChatTurn[];
}

/** Address of a stored problem: folder + file name without ".json". */
export interface ProblemRef {
  platform: Platform;
  file: string;
}

export interface ExplainRequest {
  problem: ProblemContext;
  language: LanguageId;
  /** Ignore a saved solution and generate a new one. */
  regenerate?: boolean;
}

export interface ExplainResponse {
  ref: ProblemRef;
  problem: StoredProblem;
  solution: Solution;
  /** True when the saved solution was returned without calling the AI. */
  cached: boolean;
}

/** Where the vault folder is and how it was chosen. */
export interface StorageInfo {
  dataDir: string;
  /** env = LOGIQ_DATA_DIR (locked), config = chosen in Settings, default = not chosen yet. */
  source: "env" | "config" | "default";
  problemCount: number;
  defaultDir: string;
}

export interface Settings {
  modelId: string;
  language: LanguageId;
}

/** Messages the web app sends to the extension (externally_connectable). */
export type ExtensionMessage =
  | { type: "ping" }
  | { type: "open-solution"; ref: ProblemRef; url: string };
