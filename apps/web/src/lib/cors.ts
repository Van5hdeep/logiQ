import { EXTENSION_ID } from "@logiq/shared";

const EXTENSION_ORIGIN = `chrome-extension://${EXTENSION_ID}`;

/**
 * The API runs on the user's PC. Allow only our own pages and the logiQ extension,
 * so other websites can't read the vault or spend the free AI quota.
 */
export function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin GET or a local tool like curl
  if (origin === EXTENSION_ORIGIN) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export function corsHeaders(request: Request): Record<string, string> {
  return request.headers.get("origin") === EXTENSION_ORIGIN
    ? {
        "Access-Control-Allow-Origin": EXTENSION_ORIGIN,
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        Vary: "Origin",
      }
    : {};
}

export function json(request: Request, body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: { ...corsHeaders(request), ...init?.headers },
  });
}

export function forbidden(request: Request) {
  return json(request, { error: "Forbidden" }, { status: 403 });
}

export function preflight(request: Request) {
  return new Response(null, { status: originAllowed(request) ? 204 : 403, headers: corsHeaders(request) });
}

/** For settings that change the PC (folders): only the logiQ web app itself, not the extension. */
export function sameOriginOnly(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
