import type { ReactNode } from "react";

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

const NEW_TAB_NOTICE = "(se abre en una pestaña nueva)";

export function ExternalLink({ href, children, className, "aria-label": label }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={label && `${label} ${NEW_TAB_NOTICE}`}
    >
      {children}
      {!label && <span className="sr-only"> {NEW_TAB_NOTICE}</span>}
    </a>
  );
}
