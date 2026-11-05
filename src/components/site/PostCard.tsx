import Link from "next/link";
import type { PostWithTags } from "@/lib/db/queries";
import { excerptOf } from "@/lib/content";
import { CoverImage } from "./CoverImage";

export function PostCard({ post }: { post: PostWithTags }) {
  const [firstTag] = post.tags;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl glass glass-interactive">
      <Link href={`/posts/${post.slug}`} className="block">
        <CoverImage
          url={post.coverImageUrl}
          alt={post.coverImageAlt || post.title}
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
          className="aspect-[16/10]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {firstTag && (
          <Link
            href={`/tags/${firstTag.slug}`}
            className="label"
          >
            {firstTag.name}
          </Link>
        )}
        <h2 className="text-lg font-bold leading-snug">
          <Link href={`/posts/${post.slug}`} className="hover:text-accent">
            {post.title}
          </Link>
        </h2>
        <p className="line-clamp-2 text-sm text-muted">{excerptOf(post)}</p>
      </div>
    </article>
  );
}
