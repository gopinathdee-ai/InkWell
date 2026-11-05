import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/site/PostCard";
import { Pagination } from "@/components/site/Pagination";
import { getTagBySlug, getTagPosts } from "@/lib/db/queries";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/tags/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const tag = await getTagBySlug(slug);
  return { title: tag ? `Posts tagged ${tag.name}` : "Tag not found" };
}

export default async function TagPage(props: PageProps<"/tags/[slug]">) {
  const { slug } = await props.params;
  const { page: rawPage } = await props.searchParams;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const page = parsePage(rawPage);
  const { posts, pageCount } = await getTagPosts(slug, page);
  if (page > pageCount) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <p className="label">Tag</p>
      <h1 className="mb-8 mt-2 text-gradient text-3xl font-extrabold tracking-tight">{tag.name}</h1>

      {posts.length === 0 ? (
        <p className="text-muted">No published posts with this tag yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination basePath={`/tags/${slug}`} page={page} pageCount={pageCount} />
    </div>
  );
}
