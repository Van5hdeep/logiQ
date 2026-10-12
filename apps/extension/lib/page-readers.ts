/*
 * Functions injected into the problem page with chrome.scripting.executeScript.
 * Chrome serialises each function on its own, so they must not use anything from outside their body.
 */

export interface RawProblem {
  platform: "leetcode" | "codeforces" | "codechef";
  externalId: string;
  number: string;
  title: string;
  url: string;
  statement: string;
  difficulty?: string;
  tags: string[];
}

/** Reads the problem from the page (isolated world). Returns null on unsupported pages. */
export function extractProblem(): RawProblem | null {
  const text = (el: Element | null | undefined) => ((el as HTMLElement | null)?.innerText ?? "").trim();
  const host = location.hostname;
  const path = location.pathname;

  if (host.endsWith("leetcode.com")) {
    const slug = path.match(/\/problems\/([^/]+)/)?.[1];
    if (!slug) return null;
    const heading =
      text(document.querySelector(`.text-title-large a[href*="/problems/${slug}"]`)) ||
      text(document.querySelector(".text-title-large")) ||
      document.title.replace(/\s*-\s*LeetCode.*$/, "");
    const m = heading.match(/^(\d+)\.\s*(.+)$/);
    const diffEl = document.querySelector('[class*="text-difficulty-"]');
    return {
      platform: "leetcode",
      externalId: slug,
      number: m?.[1] ?? "",
      title: (m?.[2] ?? heading).trim(),
      url: `https://leetcode.com/problems/${slug}/`,
      statement: text(document.querySelector('[data-track-load="description_content"]')),
      difficulty: text(diffEl) || undefined,
      tags: Array.from(document.querySelectorAll('a[href^="/tag/"]'))
        .map((a) => text(a))
        .filter(Boolean),
    };
  }

  if (host.endsWith("codeforces.com")) {
    const m =
      path.match(/\/problemset\/problem\/(\d+)\/(\w+)/) ||
      path.match(/\/contest\/(\d+)\/problem\/(\w+)/) ||
      path.match(/\/gym\/(\d+)\/problem\/(\w+)/);
    if (!m) return null;
    const contest = m[1] ?? "";
    const index = (m[2] ?? "").toUpperCase();
    const id = `${contest}${index}`;
    const rawTitle = text(document.querySelector(".problem-statement .header .title"));
    const tagEls = Array.from(document.querySelectorAll(".tag-box")).map((t) => text(t));
    return {
      platform: "codeforces",
      externalId: id,
      number: id,
      title: rawTitle.replace(/^\w+\.\s*/, "") || id,
      url: `https://codeforces.com/problemset/problem/${contest}/${index}`,
      statement: text(document.querySelector(".problem-statement")),
      difficulty: tagEls.find((t) => /^\*\d+$/.test(t))?.slice(1),
      tags: tagEls.filter((t) => t && !t.startsWith("*")),
    };
  }

  if (host.endsWith("codechef.com")) {
    const code = path.match(/\/problems\/([A-Z0-9_]+)/i)?.[1]?.toUpperCase();
    if (!code) return null;
    const statementEl =
      document.querySelector("#problem-statement") ||
      document.querySelector('[class*="problem-statement"]') ||
      document.querySelector('[class*="problemStatement"]');
    const title =
      text(document.querySelector('[class*="problem-name"]')) ||
      text(document.querySelector("h1")) ||
      document.title.split(/ Practice| - /)[0] ||
      "";
    return {
      platform: "codechef",
      externalId: code,
      number: code,
      title: title.trim() || code,
      url: `https://www.codechef.com/problems/${code}`,
      statement: text(statementEl),
      tags: [],
    };
  }

  return null;
}

export interface EditorCode {
  code: string;
  language?: string;
}

/** Reads the code editor (main world, so it can see Monaco/Ace on the page). */
export function readEditor(): EditorCode | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const models: any[] = w.monaco?.editor?.getModels?.() ?? [];
    const code = models.filter((m) => m.getLanguageId?.() !== "plaintext");
    if (code.length) {
      const best = code.reduce((a, b) => (b.getValueLength() > a.getValueLength() ? b : a));
      return { code: best.getValue(), language: best.getLanguageId?.() };
    }
  } catch {
    /* fall through */
  }
  try {
    const el = document.querySelector(".ace_editor");
    if (el && w.ace) {
      const editor = w.ace.edit(el);
      return { code: editor.getValue(), language: editor.session?.getMode?.()?.$id?.split("/").pop() };
    }
  } catch {
    /* fall through */
  }
  const area = document.querySelector<HTMLTextAreaElement>("#sourceCodeTextarea, textarea[name='source']");
  return area?.value ? { code: area.value } : null;
}
