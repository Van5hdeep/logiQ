import "server-only";
import type { ProblemContext } from "@logiq/shared";

/**
 * Fills in a problem statement the page didn't fully show. Uses each platform's own data
 * (LeetCode GraphQL, CodeChef API, Codeforces page) instead of an AI web search: zero tokens.
 */

const MAX_STATEMENT = 12_000; // keep prompts small

type Extra = {
  number?: string;
  title?: string;
  statement: string;
  difficulty?: string;
  tags?: string[];
};

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\s*(br|\/p|\/div|\/li|\/pre|\/h\d)\s*\/?>/gi, "\n")
    .replace(/<sup>/gi, "^")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchLeetCode(slug: string): Promise<Extra | null> {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: `https://leetcode.com/problems/${slug}/` },
    body: JSON.stringify({
      query:
        "query q($titleSlug: String!) { question(titleSlug: $titleSlug) { questionFrontendId title content difficulty topicTags { name } } }",
      variables: { titleSlug: slug },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const q = ((await res.json()) as {
    data?: { question?: { questionFrontendId: string; title: string; content: string | null; difficulty: string; topicTags: { name: string }[] } };
  }).data?.question;
  if (!q?.content) return null;
  return {
    number: q.questionFrontendId,
    title: q.title,
    statement: htmlToText(q.content),
    difficulty: q.difficulty,
    tags: q.topicTags.map((t) => t.name),
  };
}

async function fetchCodeChef(code: string): Promise<Extra | null> {
  const res = await fetch(`https://www.codechef.com/api/contests/PRACTICE/problems/${code}`, {
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await res.json()) as {
    problem_name?: string;
    body?: string;
    problemComponents?: { statement?: string; inputFormat?: string; outputFormat?: string; constraints?: string };
  };
  const c = data.problemComponents;
  const statement = c
    ? [c.statement, c.inputFormat && `Input\n${c.inputFormat}`, c.outputFormat && `Output\n${c.outputFormat}`, c.constraints && `Constraints\n${c.constraints}`]
        .filter(Boolean)
        .join("\n\n")
    : data.body;
  return statement ? { title: data.problem_name, statement: htmlToText(statement) } : null;
}

async function fetchCodeforces(id: string): Promise<Extra | null> {
  const m = id.match(/^(\d+)([A-Z]\d?)$/);
  if (!m) return null;
  const res = await fetch(`https://codeforces.com/problemset/problem/${m[1]}/${m[2]}`, {
    signal: AbortSignal.timeout(10_000),
  });
  const html = await res.text();
  const start = html.indexOf('<div class="problem-statement">');
  if (start < 0) return null;
  const end = html.indexOf('<div class="second-level-menu"', start);
  return { statement: htmlToText(html.slice(start, end > start ? end : start + 60_000)) };
}

/** Returns the context with the fullest statement available. Never throws. */
export async function completeContext(ctx: ProblemContext): Promise<ProblemContext> {
  const looksComplete = ctx.statement.length >= 300 && /example|input|output|constraint/i.test(ctx.statement);
  if (looksComplete) return { ...ctx, statement: ctx.statement.slice(0, MAX_STATEMENT) };

  try {
    const extra =
      ctx.platform === "leetcode"
        ? await fetchLeetCode(ctx.externalId)
        : ctx.platform === "codechef"
          ? await fetchCodeChef(ctx.externalId)
          : await fetchCodeforces(ctx.externalId);
    if (extra && extra.statement.length > ctx.statement.length) {
      return {
        ...ctx,
        number: ctx.number || extra.number || ctx.number,
        title: ctx.title || extra.title || ctx.title,
        statement: extra.statement.slice(0, MAX_STATEMENT),
        difficulty: ctx.difficulty ?? extra.difficulty,
        tags: ctx.tags?.length ? ctx.tags : extra.tags,
      };
    }
  } catch {
    // Network or format change: fall back to what the page showed.
  }
  return { ...ctx, statement: ctx.statement.slice(0, MAX_STATEMENT) };
}
