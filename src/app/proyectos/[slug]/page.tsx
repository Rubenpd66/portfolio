import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/ProjectDetail";
import { getPortfolioData } from "@/lib/portfolio/data";
import type { FeaturedProject } from "@/lib/projects/types";

/** Cache Components rejects an empty list; this slug never matches, so it renders a 404. */
const PLACEHOLDER_SLUG = "__sin-proyectos__";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const { featured } = await getPortfolioData();
  if (featured.length === 0) return [{ slug: PLACEHOLDER_SLUG }];
  return featured.map((item) => ({ slug: item.slug }));
}

async function findFeatured(slug: string): Promise<FeaturedProject | undefined> {
  const { featured } = await getPortfolioData();
  return featured.find((item) => item.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/proyectos/[slug]">): Promise<Metadata> {
  const item = await findFeatured((await params).slug);
  if (!item) return {};
  const title = item.kind === "public" ? item.project.name : item.title;
  const description = item.kind === "public" ? (item.summary ?? item.project.description) : item.description;
  return { title: `${title} · Rubén · Portfolio`, description: description ?? undefined };
}

export default async function ProjectPage({ params }: PageProps<"/proyectos/[slug]">) {
  const item = await findFeatured((await params).slug);
  if (!item) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <ProjectDetail item={item} />
    </main>
  );
}
