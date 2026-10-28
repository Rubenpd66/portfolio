import Link from "next/link";
import { textLinkClass } from "@/components/styles";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-start justify-center gap-4 px-4 py-24 sm:px-6">
      <p className="text-sm font-semibold text-accent-strong">Error 404</p>
      <h1 className="text-4xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="text-muted">El proyecto o la página que buscas no existe o ya no se publica.</p>
      <Link href="/" className={textLinkClass}>
        ← Volver al portfolio
      </Link>
    </main>
  );
}
