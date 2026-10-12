import { z } from "zod";
import { sameOriginOnly } from "@/lib/cors";
import { setDataDir, storageInfo } from "@/lib/storage-location";

const PutSchema = z.object({
  dataDir: z.string().min(1).max(500),
  copyExisting: z.boolean().default(true),
});

/** Current vault folder and how many problems it holds. */
export async function GET(request: Request) {
  if (!sameOriginOnly(request)) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json(await storageInfo());
}

/** Switch the vault folder. Optionally copies saved problems over (never deletes the old ones). */
export async function PUT(request: Request) {
  if (!sameOriginOnly(request)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = PutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a folder path." }, { status: 400 });

  try {
    const { copied } = await setDataDir(parsed.data.dataDir, parsed.data.copyExisting);
    return Response.json({ ...(await storageInfo()), copied });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
