import Image from "next/image";
import Link from "next/link";
import type { FeaturedProject } from "@/lib/projects/types";
import { ExternalLink } from "./ExternalLink";
import { type FeaturedView, toFeaturedView } from "./featuredView";
import { PrivateBadge } from "./PrivateBadge";
import { Readme } from "./Readme";
import { textLinkClass } from "./styles";
import { TechList } from "./TechList";

interface ProjectDetailProps {
  item: FeaturedProject;
}

const buttonClass =
  "inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function ProjectDetail({ item }: ProjectDetailProps) {
  const view = toFeaturedView(item);

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-5">
        <Link href="/" className={`${textLinkClass} self-start text-sm`}>
          ← Volver al portfolio
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-balance">{view.title}</h1>
          {view.isPrivate && <PrivateBadge />}
        </div>
        {view.description && <p className="max-w-2xl text-lg text-pretty text-muted">{view.description}</p>}
        <TechList items={view.technologies} label={`Tecnologías de ${view.title}`} />
        <div className="flex flex-wrap gap-3">
          {view.demoUrl && (
            <ExternalLink
              href={view.demoUrl}
              aria-label={`Ver demo de ${view.title}`}
              className={`${buttonClass} bg-accent text-white hover:bg-accent-strong`}
            >
              Ver demo
            </ExternalLink>
          )}
          {view.codeUrl && (
            <ExternalLink
              href={view.codeUrl}
              aria-label={`Código en GitHub de ${view.title}`}
              className={`${buttonClass} border border-border bg-surface hover:border-accent`}
            >
              Código en GitHub
            </ExternalLink>
          )}
        </div>
      </header>

      {view.images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {view.images.map((image, index) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={1280}
              height={720}
              sizes="(min-width: 1024px) 512px, (min-width: 640px) 50vw, 100vw"
              loading={index === 0 ? "eager" : "lazy"}
              className="aspect-video w-full rounded-xl border border-border object-cover"
            />
          ))}
        </div>
      )}

      <ProjectBody readme={view.readme} isPrivate={view.isPrivate} />
    </article>
  );
}

function ProjectBody({ readme, isPrivate }: Pick<FeaturedView, "readme" | "isPrivate">) {
  if (isPrivate) {
    return (
      <p className="rounded-xl border border-border bg-surface p-5 text-muted">
        Este proyecto tiene código privado: solo se muestran los datos aprobados para publicarse.
      </p>
    );
  }
  if (!readme) {
    return <p className="text-muted">Este repositorio no tiene README.</p>;
  }
  return (
    <section aria-label="README" className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <Readme doc={readme} />
    </section>
  );
}
