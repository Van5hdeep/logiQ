import { promises as fs } from "node:fs";
import path from "node:path";

/** Serves the newest built extension zip (made by `pnpm ext:zip`). */
export async function GET() {
  const outDir = path.resolve(process.cwd(), "..", "extension", ".output");
  let names: string[] = [];
  try {
    names = (await fs.readdir(outDir)).filter((n) => n.endsWith("-chrome.zip"));
  } catch {
    // not built yet
  }
  if (!names.length) {
    return Response.json(
      { error: "The extension hasn't been built yet. Run `pnpm ext:zip` in the logiQ folder, then try again." },
      { status: 404 },
    );
  }
  const stats = await Promise.all(names.map(async (n) => ({ n, t: (await fs.stat(path.join(outDir, n))).mtimeMs })));
  const newest = stats.sort((a, b) => b.t - a.t)[0].n;
  const data = await fs.readFile(path.join(outDir, newest));
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="logiq-extension.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
