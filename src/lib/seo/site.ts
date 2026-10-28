const LOCAL_URL = "http://localhost:3000";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function nonBlank(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseConfiguredUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL no es una URL válida");
  }
  const isLocalHttp = url.protocol === "http:" && LOCAL_HOSTS.has(url.hostname);
  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error("NEXT_PUBLIC_SITE_URL debe empezar por https:// (http solo para localhost)");
  }
  return new URL(url.origin);
}

/**
 * Public origin used for canonical URLs, Open Graph, the sitemap and robots.txt.
 * Order: the deployment URL on Vercel previews (so they never point at production),
 * then NEXT_PUBLIC_SITE_URL, then the Vercel production domain, then localhost.
 * Throws on an invalid NEXT_PUBLIC_SITE_URL so a typo fails the build instead of shipping bad links.
 */
export function resolveSiteUrl(env: Readonly<Record<string, string | undefined>> = process.env): URL {
  const previewDomain = env.VERCEL_ENV === "preview" ? nonBlank(env.VERCEL_URL) : undefined;
  if (previewDomain) return new URL(`https://${previewDomain}`);

  const configured = nonBlank(env.NEXT_PUBLIC_SITE_URL);
  if (configured) return parseConfiguredUrl(configured);

  const productionDomain = nonBlank(env.VERCEL_PROJECT_PRODUCTION_URL);
  return new URL(productionDomain ? `https://${productionDomain}` : LOCAL_URL);
}
