const DEFAULT_MAX_LENGTH = 280;

/** Lines that are never part of a prose paragraph. */
const NON_PROSE_LINE = /^(#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\||<|!\[|\[!\[|---|===|\*\*\*)/;

/** Plain-text first paragraph of a README, or null when it has no prose. */
export function summarizeReadme(markdown: string, maxLength = DEFAULT_MAX_LENGTH): string | null {
  const paragraph = firstProseParagraph(markdown);
  if (!paragraph) return null;
  const text = stripInlineMarkdown(paragraph);
  return text ? truncate(text, maxLength) : null;
}

const SETEXT_UNDERLINE = /^(=+|-+)$/;

function firstProseParagraph(markdown: string): string | null {
  const lines = skipFrontMatter(markdown.replace(/\r\n/g, "\n").split("\n"));
  let collected: string[] = [];
  let inFence = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (collected.length > 0 && SETEXT_UNDERLINE.test(line)) {
      // The collected lines were a setext heading ("Title" + "====="), not prose.
      collected = [];
      continue;
    }
    if (line.startsWith("```") || line.startsWith("~~~")) {
      inFence = !inFence;
      if (collected.length > 0) break;
      continue;
    }
    if (inFence) continue;

    const isProse = line !== "" && !NON_PROSE_LINE.test(line);
    if (isProse) {
      collected.push(line);
    } else if (collected.length > 0) {
      break;
    }
  }
  return collected.length > 0 ? collected.join(" ") : null;
}

function skipFrontMatter(lines: readonly string[]): readonly string[] {
  if (lines[0]?.trim() !== "---") return lines;
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  return end === -1 ? lines : lines.slice(end + 1);
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/(\*\*|__|~~)(.+?)\1/g, "$2")
    .replace(/(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])/g, "$1")
    .replace(/(?<![\w_])_(?!\s)(.+?)(?<!\s)_(?![\w_])/g, "$1")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
