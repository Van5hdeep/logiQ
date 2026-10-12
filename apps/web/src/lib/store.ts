import "server-only";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getDataDir } from "./storage-location";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_MODEL_ID,
  LANGUAGES,
  type DifficultyTone,
  type Platform,
  type ChatTurn,
  type ProblemContext,
  type ProblemRef,
  type Settings,
  type Solution,
  type StoredProblem,
  type VaultProblem,
} from "@logiq/shared";

/**
 * File storage for the vault. No database: one JSON file per problem, inside the folder chosen
 * in Settings (resolved by storage-location.ts):
 *   <vault>\leetcode\0001-two-sum.json
 *   <vault>\codeforces\1872C-non-coprime-split.json
 *   <vault>\codechef\FLIPCOINS-flipping-coins.json
 *   <vault>\settings.json
 */

export const PLATFORMS: Platform[] = ["leetcode", "codeforces", "codechef"];

const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9_-]{0,150}$/;

export function isPlatform(value: string): value is Platform {
  return (PLATFORMS as string[]).includes(value);
}

/** Validates a ref coming from a URL so it can never point outside the data folder. */
export function parseRef(platform: string, file: string): ProblemRef | null {
  return isPlatform(platform) && FILE_NAME.test(file) ? { platform, file } : null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** The part of the file name that identifies the problem: "0001", "1872C", "FLIPCOINS". */
function filePrefix(ctx: Pick<ProblemContext, "platform" | "number" | "externalId">): string {
  if (ctx.platform === "leetcode") {
    return /^\d+$/.test(ctx.number) ? ctx.number.padStart(4, "0") : slugify(ctx.externalId);
  }
  return ctx.externalId.toUpperCase().replace(/[^A-Z0-9_]/g, "");
}

/** "<number>-<question-name>" */
function fileStem(ctx: ProblemContext): string {
  const prefix = filePrefix(ctx);
  const name = slugify(ctx.title);
  return name && name !== prefix.toLowerCase() ? `${prefix}-${name}` : prefix;
}

const filePath = async (ref: ProblemRef) =>
  path.join(await getDataDir(), ref.platform, `${ref.file}.json`);

/** Finds the existing file for a problem, even if its title changed since it was saved. */
async function findExisting(ctx: ProblemContext): Promise<ProblemRef | null> {
  const prefix = filePrefix(ctx);
  try {
    const names = await fs.readdir(path.join(await getDataDir(), ctx.platform));
    const hit = names.find(
      (n) => n.endsWith(".json") && (n === `${prefix}.json` || n.startsWith(`${prefix}-`)),
    );
    return hit ? { platform: ctx.platform, file: hit.slice(0, -5) } : null;
  } catch {
    return null;
  }
}

/** Write to a temp file, then rename: a crash can never leave a half-written problem. */
async function writeJsonAtomic(target: string, data: unknown) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  await fs.rename(tmp, target);
}

// Serialise writes per file so two quick saves can't overwrite each other.
const locks = new Map<string, Promise<unknown>>();
function withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
  const run = (locks.get(key) ?? Promise.resolve()).then(task, task);
  locks.set(
    key,
    run.catch(() => {}),
  );
  return run;
}

export async function readProblem(ref: ProblemRef): Promise<StoredProblem | null> {
  try {
    return JSON.parse(await fs.readFile(await filePath(ref), "utf8")) as StoredProblem;
  } catch {
    return null;
  }
}

export async function findProblem(
  ctx: ProblemContext,
): Promise<{ ref: ProblemRef; problem: StoredProblem } | null> {
  const ref = await findExisting(ctx);
  if (!ref) return null;
  const problem = await readProblem(ref);
  return problem ? { ref, problem } : null;
}

/** Adds a solution, creating the problem file on first use. The first solution is never replaced. */
export async function saveSolution(
  ctx: ProblemContext,
  solution: Solution,
): Promise<{ ref: ProblemRef; problem: StoredProblem }> {
  return withLock(ctx.platform, async () => {
    const existing = await findExisting(ctx);
    const ref = existing ?? { platform: ctx.platform, file: fileStem(ctx) };
    const now = new Date().toISOString();
    const current = existing ? await readProblem(existing) : null;

    const problem: StoredProblem = current
      ? {
          ...current,
          title: current.title || ctx.title,
          statement: ctx.statement.length > current.statement.length ? ctx.statement : current.statement,
          difficulty: current.difficulty ?? ctx.difficulty,
          tags: current.tags.length ? current.tags : (ctx.tags ?? []),
          updatedAt: now,
          solutions: [...current.solutions, solution],
        }
      : {
          version: 1,
          platform: ctx.platform,
          externalId: ctx.externalId,
          number: ctx.number,
          title: ctx.title,
          url: ctx.url,
          difficulty: ctx.difficulty,
          tags: ctx.tags ?? [],
          statement: ctx.statement,
          status: "attempted",
          savedAt: now,
          updatedAt: now,
          solutions: [solution],
        };

    await writeJsonAtomic(await filePath(ref), problem);
    return { ref, problem };
  });
}

/** Appends follow-up chat turns to a problem file. Returns the full chat. */
export async function appendChat(ref: ProblemRef, turns: ChatTurn[]): Promise<ChatTurn[] | null> {
  return withLock(ref.platform, async () => {
    const problem = await readProblem(ref);
    if (!problem) return null;
    const chat = [...(problem.chat ?? []), ...turns];
    await writeJsonAtomic(await filePath(ref), { ...problem, chat, updatedAt: new Date().toISOString() });
    return chat;
  });
}

function difficultyTone(platform: Platform, label?: string): DifficultyTone {
  if (!label) return "medium";
  if (platform === "leetcode") {
    return label.toLowerCase().startsWith("easy") ? "easy" : label.toLowerCase().startsWith("hard") ? "hard" : "medium";
  }
  const rating = Number(label);
  if (!Number.isFinite(rating)) return "medium";
  return rating < 1300 ? "easy" : rating < 1900 ? "medium" : "hard";
}

function toVaultProblem(ref: ProblemRef, p: StoredProblem): VaultProblem {
  return {
    id: `${ref.platform}/${ref.file}`,
    file: ref.file,
    platform: p.platform,
    externalId: p.externalId,
    number: p.number,
    title: p.platform === "leetcode" && p.number ? `${p.number}. ${p.title}` : `${p.number === p.title ? "" : `${p.number}. `}${p.title}`,
    url: p.url,
    difficulty: { label: p.difficulty || "Unrated", tone: difficultyTone(p.platform, p.difficulty) },
    patterns: p.tags.slice(0, 4),
    status: p.status,
    languages: [...new Set(p.solutions.map((s) => s.language))],
    answeredBy: p.solutions[0]?.model,
    savedAt: p.savedAt,
  };
}

/** Every saved problem, newest first. Reads the folder each time (fast for thousands of files). */
export async function listProblems(): Promise<VaultProblem[]> {
  const dataDir = await getDataDir();
  const all = await Promise.all(
    PLATFORMS.map(async (platform) => {
      let names: string[] = [];
      try {
        names = (await fs.readdir(path.join(dataDir, platform))).filter((n) => n.endsWith(".json"));
      } catch {
        return [];
      }
      const rows = await Promise.all(
        names.map(async (name) => {
          const ref = { platform, file: name.slice(0, -5) };
          const p = await readProblem(ref);
          return p?.solutions ? toVaultProblem(ref, p) : null;
        }),
      );
      return rows.filter((r): r is VaultProblem => r !== null);
    }),
  );
  return all.flat().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

const settingsFile = async () => path.join(await getDataDir(), "settings.json");

export async function readSettings(): Promise<Settings> {
  try {
    const raw = JSON.parse(await fs.readFile(await settingsFile(), "utf8")) as Partial<Settings>;
    return {
      modelId: raw.modelId || DEFAULT_MODEL_ID,
      language: LANGUAGES.some((l) => l.id === raw.language) ? raw.language! : DEFAULT_LANGUAGE,
    };
  } catch {
    return { modelId: DEFAULT_MODEL_ID, language: DEFAULT_LANGUAGE };
  }
}

export async function writeSettings(patch: Partial<Settings>): Promise<Settings> {
  return withLock("settings", async () => {
    const next = { ...(await readSettings()), ...patch };
    await writeJsonAtomic(await settingsFile(), next);
    return next;
  });
}
