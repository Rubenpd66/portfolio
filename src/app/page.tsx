import type { Metadata } from "next";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Hero } from "@/components/Hero";
import { ProjectExplorer } from "@/components/ProjectExplorer";
import { StackSection } from "@/components/StackSection";
import { getPortfolioData } from "@/lib/portfolio/data";
import { buildPersonJsonLd, serializeJsonLd } from "@/lib/seo/metadata";
import { resolveSiteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const { profile, links, featured, projects, stack } = await getPortfolioData();
  const jsonLd = serializeJsonLd(buildPersonJsonLd(resolveSiteUrl(), profile, links));

  return (
    <>
      {/* Escaped JSON (no "<"), never executed: application/ld+json is data, not script. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-20 px-4 py-16 sm:px-6 sm:py-24">
        <Hero profile={profile} links={links} />
        <FeaturedProjects items={featured} />
        <StackSection stack={stack} />
        <section aria-labelledby="repositorios" className="flex flex-col gap-6">
          <h2 id="repositorios" className="text-2xl font-bold tracking-tight">
            Todos los repositorios
          </h2>
          <ProjectExplorer projects={projects} />
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-muted sm:px-6">
          <p>© {profile.name}</p>
          <p>Generado automáticamente desde GitHub.</p>
        </div>
      </footer>
    </>
  );
}
