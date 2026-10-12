<p align="center">
  <img src="apps/web/public/brand/logiq-logo.svg" alt="logiQ logo" width="120" />
</p>

<h1 align="center">logiQ</h1>

<p align="center">
  <strong>Your personal DSA tutor, right next to the problem.</strong><br />
  Stuck on a LeetCode, Codeforces or CodeChef problem? Press <kbd>Alt</kbd>+<kbd>L</kbd>, click <em>Start Question</em>,<br />
  and get the full solution, every line explained in plain words, and the time and space complexity.
</p>

<p align="center">
  Free AI models · No database · Your problems stay on your PC
</p>

---

## What it does

| | |
|---|---|
| **Explains any problem** | A Chrome side panel reads the question and your code editor, then gives you the idea in simple words, the complete code, a line-by-line explanation and the time and space complexity. |
| **Follow-up chat** | Ask "why does this work?" or "walk me through the example" right under the solution. |
| **Any language** | Python by default. Switch to C++, Java, JavaScript, Go and more; the solution is redone in that language. |
| **Saves everything** | Every problem is saved as a file in a folder you choose, sorted by platform: `leetcode/0001-two-sum.json`. |
| **Your vault** | A web dashboard to search, filter and revisit problems. **Open solution** reopens the question with the exact solution you got the first time. |
| **Free models, your pick** | Uses free models on [OpenRouter](https://openrouter.ai). The Models page ranks them for DSA and lets you switch when one hits a limit. |

## How it works

```
 Problem page            Chrome extension             logiQ app (your PC)           OpenRouter
 ────────────            ────────────────             ───────────────────           ──────────
 LeetCode /       ──►    Side panel reads the   ──►   /api/explain             ──►  free AI model
 Codeforces /            question + editor            fills in the full question
 CodeChef                                             saves the answer as a file
                                                      in your vault folder
```

- The app runs on your computer at `http://localhost:3000`. The extension talks only to it.
- Your OpenRouter key stays in a local `.env.local` file and never reaches the browser.
- If a page doesn't show the whole question, logiQ fetches it from the platform itself. That costs no AI tokens.

## Quick start

**You need:** [Node.js 20+](https://nodejs.org), [pnpm](https://pnpm.io) (`npm i -g pnpm`), Google Chrome, and a free [OpenRouter API key](https://openrouter.ai/keys).

1. **Install**

   ```bash
   git clone https://github.com/Van5hdeep/logiQ.git
   cd logiQ
   pnpm install
   ```

2. **Add your key.** Copy `apps/web/.env.example` to `apps/web/.env.local` and paste your key:

   ```bash
   OPENROUTER_API_KEY=sk-or-v1-...
   ```

3. **Start the app**

   ```bash
   pnpm dev
   ```

   Open http://localhost:3000.

4. **Install the extension**

   ```bash
   pnpm ext:zip
   ```

   In the app, click **Get extension** → **Download extension**. Unzip it, open `chrome://extensions`, turn on
   **Developer mode**, click **Load unpacked** and pick the unzipped folder. (Chrome only installs extensions
   straight from the Web Store, so this one-time step is needed.)

5. **Choose where to save** (optional). In **Settings**, type a folder or click **Browse**.
   The default is `Documents/logiQ`.

## Using it

1. Open a problem on LeetCode, Codeforces or CodeChef.
2. Press <kbd>Alt</kbd>+<kbd>L</kbd> (or click the logiQ icon) to open the side panel.
3. Pick a language and click **Start Question**.
4. Read the idea, the code, the line-by-line notes and the complexity. Ask follow-ups in the chat.
5. Later, open your **Vault** and click **Open solution** on any problem to see it again.

Free models can take up to a couple of minutes for a full solution. Anything already saved loads instantly.

## Your files

```
<your folder>/
├── leetcode/
│   ├── 0001-two-sum.json
│   └── 0013-roman-to-integer.json
├── codeforces/
│   └── 1872C-non-coprime-split.json
├── codechef/
│   └── FLIPCOINS-flipping-coins.json
└── settings.json            your model and language
```

Each file holds the question, every solution (the first one is never replaced) and your chat. They're plain JSON,
so you can back the folder up with OneDrive, Google Drive or a private git repo.

## Free model limits

OpenRouter gives free accounts **50 free-model requests a day**, shared by *all* free models (1,000/day after a
one-time $10 credit). Switching models helps when one model is busy, not when the daily allowance is used up.
The Models page shows how many requests you have left.

## Project structure

```
logiQ/
├── apps/
│   ├── web/          Next.js app: vault, models, settings and the local API
│   └── extension/    Chrome extension (WXT + React): side panel, page readers, chat
├── packages/
│   └── shared/       Types shared by the app and the extension
└── .planning/        Plan, design system, decisions and specs
```

| Command | What it does |
|---|---|
| `pnpm dev` | Run the app at http://localhost:3000 |
| `pnpm ext:dev` | Run the extension in development mode |
| `pnpm ext:zip` | Build the extension zip used by **Get extension** |
| `pnpm typecheck` / `pnpm lint` | Check the code |

**Built with:** Next.js, React, Tailwind CSS, WXT, TypeScript, zod and OpenRouter.

## Privacy

- Your problems, solutions and chats are saved only in the folder you choose on your computer.
- Problem text and code are sent to the OpenRouter model you pick, to generate answers. Free models may use
  prompts for training, so don't paste anything private.
- The local API only accepts requests from the logiQ app and the logiQ extension.

---

<p align="center">Made for learning, one problem at a time.</p>
