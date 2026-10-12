import { sameOriginOnly } from "@/lib/cors";
import { browseForFolder } from "@/lib/storage-location";

/** Opens the system folder picker on this PC and returns the chosen path (null if cancelled). */
export async function POST(request: Request) {
  if (!sameOriginOnly(request)) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ path: await browseForFolder() });
}
