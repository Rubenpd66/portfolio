import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function readTokens(block: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g)) {
    tokens[name] = value;
  }
  return tokens;
}

function extractBlock(startPattern: RegExp): string {
  const start = css.search(startPattern);
  if (start === -1) throw new Error(`Bloque no encontrado: ${startPattern}`);
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error(`Bloque sin cerrar: ${startPattern}`);
}

const light = readTokens(extractBlock(/@theme\s*\{/));
const dark = { ...light, ...readTokens(extractBlock(/@media\s*\(prefers-color-scheme:\s*dark\)/)) };

const TEXT = 4.5;
const NON_TEXT = 3;

// [foreground token, background token, minimum ratio]
const PAIRS: [string, string, number][] = [
  ["foreground", "background", TEXT],
  ["foreground", "surface", TEXT],
  ["muted", "background", TEXT],
  ["muted", "surface", TEXT],
  ["accent-strong", "background", TEXT],
  ["accent-strong", "surface", TEXT],
  ["accent-strong", "accent-soft", TEXT],
  ["on-accent", "accent", TEXT],
  ["on-accent", "accent-hover", TEXT],
  ["code-foreground", "code", TEXT],
  ["accent", "background", NON_TEXT],
  ["accent", "surface", NON_TEXT],
];

describe.each([
  ["claro", light],
  ["oscuro", dark],
])("tema %s", (_, tokens) => {
  it.each(PAIRS)("%s sobre %s cumple WCAG AA (≥ %s:1)", (fg, bg, min) => {
    expect(tokens[fg], `falta --color-${fg}`).toBeDefined();
    expect(tokens[bg], `falta --color-${bg}`).toBeDefined();
    expect(contrastRatio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(min);
  });
});

describe("modo oscuro", () => {
  it("redefine la paleta de superficies y texto", () => {
    expect(dark.background).not.toBe(light.background);
    expect(dark.foreground).not.toBe(light.foreground);
  });

  it("declara color-scheme para que los controles nativos se adapten", () => {
    expect(css).toMatch(/color-scheme:\s*light dark/);
  });
});
