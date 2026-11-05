import Link from "next/link";
import type { Tag } from "@/lib/db/schema";

export function TagChip({ tag }: { tag: Pick<Tag, "name" | "slug"> }) {
  return (
    <Link
      href={`/tags/${tag.slug}`}
      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted hover:border-accent hover:text-accent"
    >
      {tag.name}
    </Link>
  );
}
