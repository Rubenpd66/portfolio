import type { StackEntry } from "@/lib/projects/types";
import { formatPercent } from "@/lib/utils/format";

interface StackSectionProps {
  stack: readonly StackEntry[];
}

export function StackSection({ stack }: StackSectionProps) {
  // Languages that round to 0 % add noise without information.
  const visible = stack.filter((entry) => entry.percent > 0);
  if (visible.length === 0) return null;
  return (
    <section aria-labelledby="stack" className="flex flex-col gap-6">
      <div>
        <h2 id="stack" className="text-2xl font-bold tracking-tight">
          Sobre mí · Stack
        </h2>
        <p className="mt-1 text-sm text-muted">
          Calculado a partir del código de mis repositorios públicos.
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {visible.map((entry) => (
          <li key={entry.name} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{entry.name}</span>
              <span className="text-muted">{formatPercent(entry.percent)}</span>
            </div>
            <div
              role="meter"
              aria-label={entry.name}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={entry.percent}
              aria-valuetext={formatPercent(entry.percent)}
              className="h-2 overflow-hidden rounded-full bg-accent-soft"
            >
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.max(entry.percent, 1)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
