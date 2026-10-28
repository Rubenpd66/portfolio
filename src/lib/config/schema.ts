import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/;

const httpsUrl = z
  .string()
  .trim()
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Debe ser una URL https");

/** Remote image hosts next/image may load. Keep in sync with `images.remotePatterns` in next.config.ts. */
export const IMAGE_HOSTS: readonly string[] = ["avatars.githubusercontent.com"];

/** Root-relative path that browsers cannot reinterpret as protocol-relative ("//", "/\", control chars). */
const LOCAL_PATH = /^\/(?![/\\])[^\\\u0000-\u001f\u007f]*$/;

/** Local file under /public (e.g. "/projects/app.png") or an https URL on an allowed host. */
const imageSrc = z
  .string()
  .trim()
  .refine((value) => {
    if (LOCAL_PATH.test(value)) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && IMAGE_HOSTS.includes(url.hostname);
    } catch {
      return false;
    }
  }, `La imagen debe ser una ruta local (/...) o una URL https de: ${IMAGE_HOSTS.join(", ")}`);

const imageSchema = z.strictObject({
  src: imageSrc,
  alt: z.string().trim().min(1, "Las imágenes necesitan texto alternativo"),
});

const profileSchema = z.strictObject({
  name: z.string().trim().min(1).optional(),
  bio: z.string().trim().min(1).optional(),
  avatarUrl: imageSrc.optional(),
  location: z.string().trim().min(1).optional(),
});

const linksSchema = z.strictObject({
  github: httpsUrl,
  linkedin: httpsUrl.optional(),
  email: z.email().optional(),
});

const featuredSchema = z.strictObject({
  /** Exact name of a public repository. */
  repo: z.string().trim().min(1),
  image: imageSchema.optional(),
  demoUrl: httpsUrl.optional(),
});

/**
 * Private repositories are shown ONLY with the fields below. `strictObject` makes any
 * other key (readme, files...) a build error, so nothing is published unless approved here.
 */
const privateProjectSchema = z.strictObject({
  slug: z.string().regex(SLUG_PATTERN, "El slug debe ser kebab-case"),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  technologies: z.array(z.string().trim().min(1)).optional(),
  images: z.array(imageSchema).optional(),
  demoUrl: httpsUrl.optional(),
});

const portfolioConfigSchema = z
  .strictObject({
    profile: profileSchema.default({}),
    links: linksSchema,
    featured: z.array(featuredSchema).default([]),
    excluded: z.array(z.string().trim().min(1)).default([]),
    privateProjects: z.array(privateProjectSchema).default([]),
  })
  .superRefine((config, ctx) => {
    const slugs = [
      ...config.featured.map((f) => f.repo.toLowerCase()),
      ...config.privateProjects.map((p) => p.slug),
    ];
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicates.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `Slugs duplicados en proyectos destacados: ${[...new Set(duplicates)].join(", ")}`,
      });
    }
  });

export type PortfolioConfig = z.infer<typeof portfolioConfigSchema>;
export type PortfolioConfigInput = z.input<typeof portfolioConfigSchema>;
export type ProfileOverride = PortfolioConfig["profile"];

/** Validates the portfolio config; throws with a readable message when it is invalid. */
export function parsePortfolioConfig(input: unknown): PortfolioConfig {
  const result = portfolioConfigSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`portfolio.config inválido:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
