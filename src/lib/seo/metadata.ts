import type { PortfolioConfig } from "@/lib/config/schema";
import type { FeaturedProject, Profile } from "@/lib/projects/types";

export interface ProjectSeo {
  readonly title: string;
  readonly description: string | undefined;
}

/** Title and description of a featured project. Private projects use config fields only. */
export function projectSeo(item: FeaturedProject): ProjectSeo {
  if (item.kind === "private") {
    return { title: item.title, description: item.description ?? undefined };
  }
  return { title: item.project.name, description: item.summary ?? item.project.description ?? undefined };
}

export function projectPath(slug: string): string {
  return `/proyectos/${encodeURIComponent(slug)}`;
}

export interface SitemapEntry {
  readonly url: string;
  readonly lastModified?: string;
}

/** Home page plus one entry per featured project. Private projects carry no date (nothing from GitHub). */
export function buildSitemap(site: URL, featured: readonly FeaturedProject[]): SitemapEntry[] {
  const dated = featured.map((item) => ({
    url: new URL(projectPath(item.slug), site).href,
    lastModified: item.kind === "public" ? item.project.updatedAt : undefined,
  }));
  const newest = dated
    .map((entry) => entry.lastModified)
    .filter((date): date is string => date !== undefined)
    .sort()
    .at(-1);
  return [{ url: site.href, lastModified: newest }, ...dated];
}

export interface PersonJsonLd {
  readonly "@context": "https://schema.org";
  readonly "@type": "Person";
  readonly name: string;
  readonly url: string;
  readonly image: string;
  readonly description?: string;
  readonly sameAs: readonly string[];
}

export function buildPersonJsonLd(
  site: URL,
  profile: Profile,
  links: Pick<PortfolioConfig["links"], "github" | "linkedin">,
): PersonJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: site.href,
    image: new URL(profile.avatarUrl, site).href,
    ...(profile.bio ? { description: profile.bio } : {}),
    sameAs: [links.github, links.linkedin].filter((link): link is string => Boolean(link)),
  };
}

/** JSON for an inline <script type="application/ld+json">: "<" is escaped so data cannot close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
