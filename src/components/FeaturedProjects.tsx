import Image from "next/image";
import Link from "next/link";
import type { FeaturedProject } from "@/lib/projects/types";
import { projectPath } from "@/lib/seo/metadata";
import { ExternalLink } from "./ExternalLink";
import { type FeaturedView, toFeaturedView } from "./featuredView";
import { PrivateBadge } from "./PrivateBadge";
import { textLinkClass } from "./styles";
import { TechList } from "./TechList";

interface FeaturedProjectsProps {
  items: readonly FeaturedProject[];
}

function FeaturedCard({ view }: { view: FeaturedView }) {
  const image = view.images[0];
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          width={640}
          height={360}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold">{view.title}</h3>
          {view.isPrivate && <PrivateBadge />}
        </div>
        {view.text && <p className="text-pretty text-muted">{view.text}</p>}
        <TechList items={view.technologies} label={`Tecnologías de ${view.title}`} />
        <div className="mt-auto flex flex-wrap gap-x-5 pt-2 text-sm">
          <Link
            href={projectPath(view.slug)}
            aria-label={`Ver detalles de ${view.title}`}
            className={textLinkClass}
          >
            Ver detalles →
          </Link>
          {view.demoUrl && (
            <ExternalLink
              href={view.demoUrl}
              aria-label={`Demo de ${view.title}`}
              className={textLinkClass}
            >
              Demo
            </ExternalLink>
          )}
          {view.codeUrl && (
            <ExternalLink
              href={view.codeUrl}
              aria-label={`Código de ${view.title} en GitHub`}
              className={textLinkClass}
            >
              Código
            </ExternalLink>
          )}
        </div>
      </div>
    </article>
  );
}

export function FeaturedProjects({ items }: FeaturedProjectsProps) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="destacados" className="flex flex-col gap-6">
      <h2 id="destacados" className="text-2xl font-bold tracking-tight">
        Proyectos destacados
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <FeaturedCard key={item.slug} view={toFeaturedView(item)} />
        ))}
      </div>
    </section>
  );
}
