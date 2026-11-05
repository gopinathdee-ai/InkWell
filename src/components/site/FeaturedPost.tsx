import Link from "next/link";
import type { PostWithTags } from "@/lib/db/queries";
import { excerptOf } from "@/lib/content";
import { CoverImage } from "./CoverImage";
import { TagChip } from "./TagChip";

export function FeaturedPost({ post }: { post: PostWithTags }) {
  return (
    <section className="grid overflow-hidden rounded-2xl glass md:grid-cols-[1.4fr_1fr]">
      <Link href={`/posts/${post.slug}`} className="block">
        <CoverImage
          url={post.coverImageUrl}
          alt={post.coverImageAlt || post.title}
          sizes="(min-width: 768px) 60vw, 100vw"
          className="h-full min-h-64"
        />
      </Link>
      <div className="flex flex-col justify-center gap-3 p-8">
        <span className="label">
          Featured
        </span>
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
          <Link href={`/posts/${post.slug}`} className="hover:text-accent">
            {post.title}
          </Link>
        </h2>
        <p className="text-muted">{excerptOf(post)}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
