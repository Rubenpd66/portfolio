"use client";

import { useId, useState } from "react";
import { filterByTech, listTechOptions, sortProjects } from "@/lib/projects/query";
import type { Project, SortKey } from "@/lib/projects/types";
import { ProjectCard } from "./ProjectCard";

interface ProjectExplorerProps {
  projects: readonly Project[];
}

const SORT_LABELS: Record<SortKey, string> = {
  updated: "Última actualización",
  stars: "Estrellas",
};

const selectClass =
  "min-h-11 rounded-lg border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-accent";

export function ProjectExplorer({ projects }: ProjectExplorerProps) {
  const [tech, setTech] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const techId = useId();
  const sortId = useId();

  if (projects.length === 0) {
    return <p className="text-muted">No hay repositorios públicos todavía.</p>;
  }

  const techOptions = listTechOptions(projects);
  const visible = sortProjects(filterByTech(projects, tech || null), sortKey);
  const countLabel = `${visible.length} ${visible.length === 1 ? "repositorio" : "repositorios"}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={techId} className="text-sm font-medium">
            Tecnología
          </label>
          <select
            id={techId}
            value={tech}
            onChange={(event) => setTech(event.target.value)}
            className={selectClass}
          >
            <option value="">Todas</option>
            {techOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={sortId} className="text-sm font-medium">
            Ordenar por
          </label>
          <select
            id={sortId}
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className={selectClass}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <p role="status" aria-atomic="true" className="ml-auto text-sm text-muted">
          {countLabel}
        </p>
      </div>
      <ul aria-label="Repositorios" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
