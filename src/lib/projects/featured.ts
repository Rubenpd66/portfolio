import type { PortfolioConfig, ProfileOverride } from "@/lib/config/schema";
import type { GitHubUser } from "@/lib/github/types";
import { summarizeReadme } from "@/lib/readme/summary";
import { blankToNull, repoSlug } from "./transform";
import type { FeaturedProject, PrivateFeatured, Profile, Project, ReadmeDoc } from "./types";

/**
 * Featured public repos (in config order, only if visible) followed by private projects.
 * Private projects are built from the config alone and copy only whitelisted fields.
 */
export function buildFeatured(
  config: PortfolioConfig,
  projects: readonly Project[],
  readmes: ReadonlyMap<string, ReadmeDoc | null>,
): FeaturedProject[] {
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const collisions = config.privateProjects.filter((entry) => bySlug.has(entry.slug));
  if (collisions.length > 0) {
    // A public repo and a private project would share the same detail URL.
    const slugs = collisions.map((entry) => entry.slug).join(", ");
    throw new Error(`Slug de proyecto privado igual al de un repo público: ${slugs}`);
  }

  const publicFeatured: FeaturedProject[] = config.featured.flatMap((entry) => {
    const project = bySlug.get(repoSlug(entry.repo));
    if (!project) return [];
    const readme = readmes.get(project.slug) ?? null;
    return [
      {
        kind: "public",
        slug: project.slug,
        project,
        image: entry.image ?? null,
        demoUrl: entry.demoUrl ?? project.homepage,
        summary: readme === null ? null : summarizeReadme(readme.markdown),
        readme,
      },
    ];
  });

  const privateFeatured = config.privateProjects.map(
    (entry): PrivateFeatured => ({
      kind: "private",
      slug: entry.slug,
      title: entry.title,
      description: entry.description ?? null,
      technologies: entry.technologies ?? [],
      images: entry.images ?? [],
      demoUrl: entry.demoUrl ?? null,
    }),
  );

  return [...publicFeatured, ...privateFeatured];
}

export function resolveProfile(user: GitHubUser, override: ProfileOverride): Profile {
  return {
    login: user.login,
    name: override.name ?? blankToNull(user.name) ?? user.login,
    bio: override.bio ?? blankToNull(user.bio),
    avatarUrl: override.avatarUrl ?? user.avatar_url,
    location: override.location ?? blankToNull(user.location),
  };
}
