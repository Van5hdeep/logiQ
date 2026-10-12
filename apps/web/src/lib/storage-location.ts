import "server-only";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Platform, StorageInfo } from "@logiq/shared";

/**
 * Where the vault lives. Resolved in this order:
 *   1. LOGIQ_DATA_DIR environment variable (locks the setting)
 *   2. the folder chosen in Settings, remembered in ~/.logiq/config.json
 *   3. default: <home>/Documents/logiQ
 * The config file sits outside the vault so the choice survives moving the vault.
 */
const CONFIG_FILE = path.join(os.homedir(), ".logiq", "config.json");
export const DEFAULT_DATA_DIR = path.join(os.homedir(), "Documents", "logiQ");
const PLATFORM_DIRS: Platform[] = ["leetcode", "codeforces", "codechef"];

async function readConfig(): Promise<{ dataDir?: string }> {
  try {
    return JSON.parse(await fs.readFile(CONFIG_FILE, "utf8")) as { dataDir?: string };
  } catch {
    return {};
  }
}

export async function resolveDataDir(): Promise<{ dataDir: string; source: StorageInfo["source"] }> {
  if (process.env.LOGIQ_DATA_DIR) return { dataDir: process.env.LOGIQ_DATA_DIR, source: "env" };
  const { dataDir } = await readConfig();
  if (dataDir) return { dataDir, source: "config" };
  return { dataDir: DEFAULT_DATA_DIR, source: "default" };
}

export async function getDataDir(): Promise<string> {
  return (await resolveDataDir()).dataDir;
}

/** Checks a folder can be used: absolute, creatable, writable. Returns the normalised path. */
async function validateFolder(input: string): Promise<string> {
  const trimmed = input.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) throw new Error("Enter a folder path.");
  if (!path.isAbsolute(trimmed)) throw new Error("Use a full path, e.g. C:\\Users\\you\\Documents\\logiQ.");
  const dir = path.resolve(trimmed);

  const stat = await fs.stat(dir).catch(() => null);
  if (stat && !stat.isDirectory()) throw new Error("That path is a file, not a folder.");
  try {
    await fs.mkdir(dir, { recursive: true });
    const probe = path.join(dir, `.logiq-write-test-${randomUUID()}`);
    await fs.writeFile(probe, "ok");
    await fs.rm(probe);
  } catch {
    throw new Error("logiQ can't create or write to that folder. Pick another one.");
  }
  return dir;
}

/** Copies saved problems and settings into the new folder. Never overwrites, never deletes. */
async function copyVault(from: string, to: string): Promise<number> {
  let copied = 0;
  for (const platform of PLATFORM_DIRS) {
    const src = path.join(from, platform);
    const names = await fs.readdir(src).catch(() => [] as string[]);
    if (!names.length) continue;
    await fs.mkdir(path.join(to, platform), { recursive: true });
    for (const name of names.filter((n) => n.endsWith(".json"))) {
      const target = path.join(to, platform, name);
      if (await fs.stat(target).catch(() => null)) continue;
      await fs.copyFile(path.join(src, name), target);
      copied++;
    }
  }
  const settings = path.join(to, "settings.json");
  if (!(await fs.stat(settings).catch(() => null))) {
    await fs.copyFile(path.join(from, "settings.json"), settings).catch(() => {});
  }
  return copied;
}

export async function setDataDir(
  input: string,
  copyExisting: boolean,
): Promise<{ dataDir: string; copied: number }> {
  if (process.env.LOGIQ_DATA_DIR) {
    throw new Error("The folder is set by LOGIQ_DATA_DIR in .env.local. Remove it to choose here.");
  }
  const next = await validateFolder(input);
  const current = await getDataDir();
  const same = path.resolve(current).toLowerCase() === next.toLowerCase();
  const copied = copyExisting && !same ? await copyVault(current, next) : 0;

  await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify({ dataDir: next }, null, 2) + "\n", "utf8");
  return { dataDir: next, copied };
}

function run(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: 5 * 60_000, windowsHide: false }, (err, stdout) =>
      err && !stdout ? reject(err) : resolve(String(stdout).trim()),
    );
  });
}

/** Opens the operating system's own folder picker on this PC. Returns null if cancelled. */
export async function browseForFolder(): Promise<string | null> {
  const prompt = "Choose where logiQ saves your problems";
  try {
    if (process.platform === "win32") {
      const script = [
        "Add-Type -AssemblyName System.Windows.Forms",
        "$owner = New-Object System.Windows.Forms.Form -Property @{TopMost = $true}",
        "$d = New-Object System.Windows.Forms.FolderBrowserDialog",
        `$d.Description = '${prompt}'`,
        "$d.ShowNewFolderButton = $true",
        "if ($d.ShowDialog($owner) -eq 'OK') { [Console]::Out.Write($d.SelectedPath) }",
      ].join("; ");
      return (await run("powershell.exe", ["-NoProfile", "-STA", "-Command", script])) || null;
    }
    if (process.platform === "darwin") {
      return (await run("osascript", ["-e", `POSIX path of (choose folder with prompt "${prompt}")`])) || null;
    }
    return (await run("zenity", ["--file-selection", "--directory", `--title=${prompt}`])) || null;
  } catch {
    return null;
  }
}

/** Opens the vault folder in File Explorer / Finder. */
export async function revealFolder(dir: string): Promise<void> {
  const cmd = process.platform === "win32" ? "explorer.exe" : process.platform === "darwin" ? "open" : "xdg-open";
  await run(cmd, [dir]).catch(() => {}); // explorer.exe exits with code 1 even on success
}

export async function storageInfo(): Promise<StorageInfo> {
  const { dataDir, source } = await resolveDataDir();
  let problemCount = 0;
  for (const platform of PLATFORM_DIRS) {
    const names = await fs.readdir(path.join(dataDir, platform)).catch(() => [] as string[]);
    problemCount += names.filter((n) => n.endsWith(".json")).length;
  }
  return { dataDir, source, problemCount, defaultDir: DEFAULT_DATA_DIR };
}
