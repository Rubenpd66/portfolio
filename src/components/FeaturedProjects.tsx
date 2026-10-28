import Image from "next/image";
import Link from "next/link";
import type { FeaturedProject, ImageRef } from "@/lib/projects/types";
import { httpsOrNull } from "@/lib/utils/format";
import { ExternalLink } from "./ExternalLink";
import { textLinkClass } from "./styles";
import { TechList } from "./TechList";

interface FeaturedProjectsProps {
  items: readonly FeaturedProject[];
}

/** Display fields shared by public and private projects. Private ones never get a code link. */
interface CardView {
  slug: string;
  title: string;
  text: string | null;
  technologies: readonly string[];
  image: ImageRef | null;
  demoUrl: string | null;
  codeUrl: string | null;
  isPrivate: boolean;
}

function toView(item: FeaturedProject): CardView {
  if (item.kind === "private") {
    return {
      slug: item.slug,
      title: item.title,
      text: item.description,
      technologies: item.technologies,
      image: item.images[0] ?? null,
      demoUrl: httpsOrNull(item.demoUrl),
      codeUrl: null,
      isPrivate: true,
    };
  }
  return {
    slug: item.slug,
    title: item.project.name,
    text: item.summary ?? item.project.description,
    // A topic can repeat a language name; keys in TechList must be unique.
    technologies: [...new Set([...item.project.languages, ...item.project.topics])],
    image: item.image,
    demoUrl: httpsOrNull(item.demoUrl),
    codeUrl: item.project.repoUrl,
    isPrivate: false,
  };
}

function FeaturedCard({ view }: { view: CardView }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      {view.image && (
        <Image
          src={view.image.src}
          alt={view.image.alt}
          width={640}
          height={360}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold">{view.title}</h3>
          {view.isPrivate && (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted">
              Proyecto privado
            </span>
          )}
        </div>
        {view.text && <p className="text-pretty text-muted">{view.text}</p>}
        <TechList items={view.technologies} label={`Tecnologías de ${view.title}`} />
        <div className="mt-auto flex flex-wrap gap-x-5 pt-2 text-sm">
          <Link
            href={`/proyectos/${view.slug}`}
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
          <FeaturedCard key={item.slug} view={toView(item)} />
        ))}
      </div>
    </section>
  );
}
