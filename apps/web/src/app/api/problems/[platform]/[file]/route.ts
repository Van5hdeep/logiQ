import { forbidden, json, originAllowed, preflight } from "@/lib/cors";
import { parseRef, readProblem } from "@/lib/store";

export function OPTIONS(request: Request) {
  return preflight(request);
}

/** One stored problem with all its saved solutions (solutions[0] is the first one). */
export async function GET(request: Request, ctx: RouteContext<"/api/problems/[platform]/[file]">) {
  if (!originAllowed(request)) return forbidden(request);
  const { platform, file } = await ctx.params;
  const ref = parseRef(platform, decodeURIComponent(file));
  if (!ref) return json(request, { error: "Invalid problem address." }, { status: 400 });

  const problem = await readProblem(ref);
  if (!problem) return json(request, { error: "Problem not found in your vault." }, { status: 404 });
  return json(request, { ref, problem });
}
