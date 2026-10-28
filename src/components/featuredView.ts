import type { FeaturedProject, ImageRef, ReadmeDoc } from "@/lib/projects/types";
import { httpsOrNull } from "@/lib/utils/format";

/** Display fields shared by public and private projects. Private ones never get a code link or README. */
export interface FeaturedView {
  slug: string;
  title: string;
  /** Short text for cards: README summary first, then the repo description. */
  text: string | null;
  description: string | null;
  technologies: readonly string[];
  images: readonly ImageRef[];
  demoUrl: string | null;
  codeUrl: string | null;
  readme: ReadmeDoc | null;
  isPrivate: boolean;
}

export function toFeaturedView(item: FeaturedProject): FeaturedView {
  if (item.kind === "private") {
    return {
      slug: item.slug,
      title: item.title,
      text: item.description,
      description: item.description,
      technologies: item.technologies,
      images: item.images,
      demoUrl: httpsOrNull(item.demoUrl),
      codeUrl: null,
      readme: null,
      isPrivate: true,
    };
  }
  return {
    slug: item.slug,
    title: item.project.name,
    text: item.summary ?? item.project.description,
    description: item.project.description,
    // A topic can repeat a language name; keys in TechList must be unique.
    technologies: [...new Set([...item.project.languages, ...item.project.topics])],
    images: item.image ? [item.image] : [],
    demoUrl: httpsOrNull(item.demoUrl),
    codeUrl: item.project.repoUrl,
    readme: item.readme,
    isPrivate: false,
  };
}
