// Renders the logiQ "scholar node" mark to the PNG sizes Chrome needs (public/icon/<size>.png).
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,12 94,34 50,56 6,34" fill="#5B4BFF" stroke="#5B4BFF" stroke-width="4" stroke-linejoin="round"/><path d="M22 50 V68 L50 84 L78 68 V50 L50 64 Z" fill="#16163A" stroke="#16163A" stroke-width="4" stroke-linejoin="round"/><line x1="6" y1="34" x2="6" y2="64" stroke="#19C3A6" stroke-width="4" stroke-linecap="round"/><circle cx="6" cy="68" r="6" fill="#19C3A6"/></svg>`;

mkdirSync(join(root, "public", "icon"), { recursive: true });
for (const size of [16, 32, 48, 128]) {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
  writeFileSync(join(root, "public", "icon", `${size}.png`), png);
}
console.log("icons written");
