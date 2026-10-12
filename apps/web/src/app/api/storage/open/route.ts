import { promises as fs } from "node:fs";
import { sameOriginOnly } from "@/lib/cors";
import { getDataDir, revealFolder } from "@/lib/storage-location";

/** Opens the vault folder in File Explorer / Finder. */
export async function POST(request: Request) {
  if (!sameOriginOnly(request)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const dir = await getDataDir();
  await fs.mkdir(dir, { recursive: true });
  await revealFolder(dir);
  return Response.json({ ok: true });
}
