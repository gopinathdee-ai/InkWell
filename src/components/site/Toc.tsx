import type { TocItem } from "@/lib/content";

export function Toc({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="Table of contents" className="glass rounded-2xl p-5 text-sm">
      <p className="label mb-3">Contents</p>
      <ul className="flex flex-col gap-2 border-l border-border">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-6" : "pl-4"}>
            <a href={`#${item.id}`} className="text-muted hover:text-accent">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
