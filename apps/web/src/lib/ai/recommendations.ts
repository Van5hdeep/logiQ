import type { ModelTier } from "@logiq/shared";

export interface Recommendation {
  tier: ModelTier;
  rank: number;
  usable?: boolean;
  label?: string;
  reason: string;
  evidence?: string;
}

/**
 * Hand-researched ranking of free OpenRouter models for DSA / problem solving (Oct 2026).
 * Keyed by OpenRouter model id. Any free model not listed here shows up as "untested".
 * Sources: Google Gemma 4 model card, NVIDIA Nemotron 3 Ultra model card, Poolside and
 * Thinking Machines launch posts. Vendor numbers are self-reported and not directly comparable.
 */
export const RECOMMENDATIONS: Record<string, Recommendation> = {
  "nvidia/nemotron-3-ultra-550b-a55b:free": {
    tier: "recommended",
    rank: 1,
    label: "Best for hard problems",
    reason:
      "Largest free reasoning model with a 1M-token context and the highest published LiveCodeBench score of the free models. Answered quickly in logiQ's live test. One review measured it as slow on long outputs (about 15 tokens/s).",
    evidence: "LiveCodeBench v6 89.0 (NVIDIA model card, self-reported)",
  },
  "google/gemma-4-31b-it:free": {
    tier: "recommended",
    rank: 2,
    label: "Best for contest-style",
    reason:
      "Best published Codeforces rating among the free models and supports reliable JSON output. Its free provider (Google AI Studio) was rate limited in logiQ's live test, so switch to another model when that happens.",
    evidence: "LiveCodeBench v6 80.0%, Codeforces ELO 2150 (Google model card)",
  },
  "google/gemma-4-26b-a4b-it:free": {
    tier: "good",
    rank: 3,
    label: "Fast backup",
    reason:
      "Smaller sibling of Gemma 4 31B. Good when the 31B is busy; weaker on hard problems. Shares the same provider limits.",
    evidence: "LiveCodeBench v6 77.1%, Codeforces ELO 1718 (Google model card)",
  },
  "cohere/north-mini-code:free": {
    tier: "good",
    rank: 4,
    label: "Fast, code-focused",
    reason:
      "Small code-specialised model (30B total, 3B active) that a third-party test found the fastest of the group. Answered in under a second in logiQ's live test. Less depth on hard problems.",
    evidence: "No DSA benchmark found",
  },
  "poolside/laguna-s-2.1:free": {
    tier: "good",
    rank: 5,
    label: "Coding specialist",
    reason:
      "Open-weight model built for coding agents. The free variant is scheduled to end on 31 Oct 2026. Rate limited in logiQ's live test. No LiveCodeBench figure was found.",
    evidence: "SWE-bench Multilingual 78.5%, Terminal-Bench 2.1 70.2% (Poolside, self-reported)",
  },
  "thinkingmachines/inkling:free": {
    tier: "untested",
    rank: 98,
    usable: false,
    label: "Agent apps only",
    reason:
      "Strong coding model, but OpenRouter only serves its free variant to approved coding-agent apps, so logiQ cannot use it.",
    evidence: "SWE-bench Verified 77.6 (Thinking Machines, self-reported)",
  },
  "thinkingmachines/inkling-small:free": {
    tier: "untested",
    rank: 98,
    usable: false,
    label: "Agent apps only",
    reason:
      "OpenRouter only serves this free variant to approved coding-agent apps, so logiQ cannot use it.",
  },
  "openrouter/free": {
    tier: "untested",
    rank: 99,
    label: "Random pick",
    reason:
      "OpenRouter picks a different free model on each request, so explanation quality and format vary. Not recommended.",
  },
};

export const DEFAULT_REASON = "No DSA benchmark found. Use Test to check that it answers.";
