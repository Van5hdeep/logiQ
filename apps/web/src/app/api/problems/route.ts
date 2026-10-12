import { forbidden, json, originAllowed, preflight } from "@/lib/cors";
import { listProblems } from "@/lib/store";

export function OPTIONS(request: Request) {
  return preflight(request);
}

/** Summaries of every problem in the DSA folder, newest first. */
export async function GET(request: Request) {
  if (!originAllowed(request)) return forbidden(request);
  return json(request, { problems: await listProblems() });
}
