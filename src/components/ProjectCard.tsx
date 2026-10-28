import type { Project } from "@/lib/projects/types";
import { formatDate, httpsOrNull } from "@/lib/utils/format";
import { ExternalLink } from "./ExternalLink";
import { textLinkClass } from "./styles";
import { TechList } from "./TechList";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const demoUrl = httpsOrNull(project.homepage);
  const starLabel = `${project.stars} ${project.stars === 1 ? "estrella" : "estrellas"}`;

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/50">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold break-words">{project.name}</h3>
        <span className="shrink-0 text-sm text-muted">
          <span aria-hidden="true">★ {project.stars}</span>
          <span className="sr-only">{starLabel}</span>
        </span>
      </div>
      <p className="text-sm text-muted">{project.description ?? "Sin descripción."}</p>
      <TechList items={project.languages} label={`Lenguajes de ${project.name}`} />
      <TechList items={project.topics} label={`Temas de ${project.name}`} />
      <div className="mt-auto flex flex-wrap items-center gap-x-4 pt-1 text-sm">
        <span className="text-muted">
          {/* Server and browser ICU data may abbreviate months differently. */}
          Actualizado{" "}
          <time dateTime={project.updatedAt} suppressHydrationWarning>
            {formatDate(project.updatedAt)}
          </time>
        </span>
        <ExternalLink
          href={project.repoUrl}
          aria-label={`Código de ${project.name} en GitHub`}
          className={textLinkClass}
        >
          Código
        </ExternalLink>
        {demoUrl && (
          <ExternalLink
            href={demoUrl}
            aria-label={`Demo de ${project.name}`}
            className={textLinkClass}
          >
            Demo
          </ExternalLink>
        )}
      </div>
    </article>
  );
}
