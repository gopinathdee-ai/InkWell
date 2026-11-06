import Link from "next/link";
import type { PostWithTags } from "@/lib/db/queries";
import { excerptOf } from "@/lib/content";
import { CoverImage } from "./CoverImage";
import { TagChip } from "./TagChip";

// `stacked` puts the image above the text, for use beside another card.
export function FeaturedPost({ post, stacked = false }: { post: PostWithTags; stacked?: boolean }) {
  return (
    <section
      className={`glass overflow-hidden rounded-2xl ${
        stacked ? "flex h-full flex-col" : "grid md:grid-cols-[1.4fr_1fr]"
      }`}
    >
      <Link href={`/posts/${post.slug}`} className="block">
        <CoverImage
          url={post.coverImageUrl}
          alt={post.coverImageAlt || post.title}
          sizes={stacked ? "(min-width: 1024px) 65vw, 100vw" : "(min-width: 768px) 60vw, 100vw"}
          className={stacked ? "aspect-[16/9]" : "h-full min-h-64"}
          priority
        />
      </Link>
      <div className={`flex flex-col justify-center gap-3 ${stacked ? "p-6" : "p-8"}`}>
        <span className="label">Featured</span>
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
