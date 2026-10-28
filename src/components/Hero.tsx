import Image from "next/image";
import type { PortfolioConfig } from "@/lib/config/schema";
import type { Profile } from "@/lib/projects/types";
import { ExternalLink } from "./ExternalLink";

interface HeroProps {
  profile: Profile;
  links: PortfolioConfig["links"];
}

const linkClass =
  "inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Hero({ profile, links }: HeroProps) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
      <Image
        src={profile.avatarUrl}
        alt={`Foto de ${profile.name}`}
        width={112}
        height={112}
        loading="eager"
        fetchPriority="high"
        className="size-24 rounded-2xl object-cover ring-1 ring-border sm:size-28"
      />
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-strong">
            Desarrollador
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {profile.name}
          </h1>
          {profile.location && <p className="mt-1 text-sm text-muted">{profile.location}</p>}
        </div>
        {profile.bio && <p className="max-w-prose text-lg text-pretty text-muted">{profile.bio}</p>}
        <nav aria-label="Contacto" className="flex flex-wrap gap-2">
          <ExternalLink
            href={links.github}
            className={`${linkClass} bg-accent text-on-accent hover:bg-accent-hover`}
          >
            GitHub
          </ExternalLink>
          {links.linkedin && (
            <ExternalLink
              href={links.linkedin}
              className={`${linkClass} border border-border hover:border-accent hover:text-accent-strong`}
            >
              LinkedIn
            </ExternalLink>
          )}
          {links.email && (
            <a
              href={`mailto:${links.email}`}
              className={`${linkClass} border border-border hover:border-accent hover:text-accent-strong`}
            >
              Email
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
