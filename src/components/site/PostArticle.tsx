import Image from "next/image";
import { TagChip } from "./TagChip";
import { Toc } from "./Toc";
import { readingTime, withHeadings } from "@/lib/content";
import type { PostWithTags } from "@/lib/db/queries";

// The public post template. The Admin preview renders the same component.
export function PostArticle({ post }: { post: PostWithTags }) {
  const { html, toc } = withHeadings(post.contentHtml);
  const minutes = readingTime(post.contentHtml);
  const published = post.publishedAt;
  const date = published
    ? published.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <article className="mx-auto max-w-6xl px-6 py-10 lg:grid lg:grid-cols-[minmax(0,42.5rem)_14rem] lg:justify-center lg:gap-12">
      <div className="min-w-0">
        <header className="flex flex-col gap-4">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <TagChip key={tag.id} tag={tag} />
              ))}
            </div>
          )}
          <h1 className="text-gradient text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="text-sm text-muted">
            {published && (
              <>
                <time dateTime={published.toISOString()}>{date}</time>
                {" · "}
              </>
            )}
            {minutes} min read
          </p>
        </header>

        {post.coverImageUrl && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-card">
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt || post.title}
              fill
              priority
              sizes="(min-width: 768px) 680px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="prose-article mt-10" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {toc.length > 0 && (
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Toc items={toc} />
          </div>
        </aside>
      )}
    </article>
  );
}
