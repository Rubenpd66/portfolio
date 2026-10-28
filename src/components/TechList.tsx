interface TechListProps {
  items: readonly string[];
  label: string;
}

export function TechList({ items, label }: TechListProps) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-strong"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
