export interface RepoContext {
  owner: string;
  repo: string;
  branch: string;
}

export type UrlKind = "link" | "image";

const SCHEME = /^[a-z][a-z\d+.-]*:/i;
const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);
const IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Makes README URLs safe and absolute: relative paths point to the repo on GitHub,
 * anything with a non-allowed scheme becomes "" (react-markdown then drops it).
 */
export function resolveReadmeUrl(url: string, ctx: RepoContext, kind: UrlKind): string {
  const value = url.trim();
  if (value.startsWith("#")) return kind === "link" ? value : "";
  if (value.startsWith("//")) return "";

  if (SCHEME.test(value)) {
    try {
      const allowed = kind === "link" ? LINK_PROTOCOLS : IMAGE_PROTOCOLS;
      return allowed.has(new URL(value).protocol) ? value : "";
    } catch {
      return "";
    }
  }

  const [, rawPath, suffix] = /^([^?#]*)([\s\S]*)$/.exec(value) ?? ["", value, ""];
  const repoPath = [ctx.owner, ctx.repo].map(encodeURIComponent).join("/");
  const branch = ctx.branch.split("/").map(encodeURIComponent).join("/");
  const base =
    kind === "image"
      ? `https://raw.githubusercontent.com/${repoPath}/${branch}/`
      : `https://github.com/${repoPath}/blob/${branch}/`;
  return `${base}${normalizeRepoPath(rawPath)}${suffix}`;
}

/** Resolves "." and ".." without ever leaving the repository root, encoding each segment once. */
function normalizeRepoPath(path: string): string {
  const segments: string[] = [];
  for (const segment of path.split(/[/\\]/)) {
    const decoded = safeDecode(segment);
    if (decoded === "" || decoded === ".") continue;
    if (decoded === "..") segments.pop();
    else segments.push(decoded);
  }
  return segments.map(encodeURIComponent).join("/");
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
