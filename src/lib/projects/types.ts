import type { RepoContext } from "@/lib/readme/urls";

/** Public repository, already transformed into the shape the UI consumes. */
export interface Project {
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly repoUrl: string;
  readonly homepage: string | null;
  /** Languages ordered by bytes of code, most used first. */
  readonly languages: readonly string[];
  readonly topics: readonly string[];
  readonly stars: number;
  /** ISO 8601 date of the last push (or last update if never pushed). */
  readonly updatedAt: string;
}

export type SortKey = "updated" | "stars";

export interface ImageRef {
  readonly src: string;
  readonly alt: string;
}

/** Raw README of a public repo plus what is needed to resolve its relative URLs. */
export interface ReadmeDoc {
  readonly markdown: string;
  readonly context: RepoContext;
}

export interface PublicFeatured {
  readonly kind: "public";
  readonly slug: string;
  readonly project: Project;
  readonly image: ImageRef | null;
  readonly demoUrl: string | null;
  readonly summary: string | null;
  readonly readme: ReadmeDoc | null;
}

/** Private repo: every field comes from the config, never from the GitHub API. */
export interface PrivateFeatured {
  readonly kind: "private";
  readonly slug: string;
  readonly title: string;
  readonly description: string | null;
  readonly technologies: readonly string[];
  readonly images: readonly ImageRef[];
  readonly demoUrl: string | null;
}

export type FeaturedProject = PublicFeatured | PrivateFeatured;

export interface Profile {
  readonly login: string;
  readonly name: string;
  readonly bio: string | null;
  readonly avatarUrl: string;
  readonly location: string | null;
}

export interface StackEntry {
  readonly name: string;
  /** Share of total bytes, 0-100, rounded to one decimal. */
  readonly percent: number;
}
