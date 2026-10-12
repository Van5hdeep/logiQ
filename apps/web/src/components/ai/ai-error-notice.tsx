import Link from "next/link";
import type { AiError, AiErrorKind } from "@logiq/shared";

const ADVICE: Record<AiErrorKind, string> = {
  daily_limit:
    "Your daily free-model limit is used up. It is shared by every free model, so switching will not reset it. It resets daily, or add $10 credit on OpenRouter for 1,000 free requests a day.",
  rate_limited:
    "This model is busy or rate limited right now. Choose another model and try again.",
  unauthorized:
    "OpenRouter rejected the API key. Check OPENROUTER_API_KEY in apps/web/.env.local and restart the app.",
  privacy_settings:
    "Free models need to be allowed in your OpenRouter privacy settings (openrouter.ai/settings/privacy).",
  model_unavailable: "This model is unavailable right now. Choose another model.",
  network: "Could not reach OpenRouter or the model timed out. Try again or pick another model.",
  unknown: "Something went wrong. Try again or pick another model.",
};

/** Explains an AI failure and links to the Models page when switching model can help. */
export function AiErrorNotice({ error, showSwitchLink = true }: { error: AiError; showSwitchLink?: boolean }) {
  const canSwitch =
    showSwitchLink &&
    (error.kind === "rate_limited" ||
      error.kind === "model_unavailable" ||
      error.kind === "network" ||
      error.kind === "unknown");

  return (
    <div role="alert" className="rounded-tile bg-peach p-4 text-sm">
      <p className="font-medium">{ADVICE[error.kind]}</p>
      <p className="mt-1 break-words text-xs text-muted">{error.message}</p>
      {canSwitch && (
        <Link href="/models" className="mt-3 inline-block font-medium text-brand underline-offset-2 hover:underline">
          Choose another model
        </Link>
      )}
    </div>
  );
}
