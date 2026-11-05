import { notFound } from "next/navigation";
import { FeaturedPost } from "@/components/site/FeaturedPost";
import { PostCard } from "@/components/site/PostCard";
import { Pagination } from "@/components/site/Pagination";
import { getHomePage } from "@/lib/db/queries";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function Home(props: PageProps<"/">) {
  const { page: rawPage } = await props.searchParams;
  const page = parsePage(rawPage);
  const { featured, grid, pageCount } = await getHomePage(page);
  if (page > pageCount) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {featured ? (
        <FeaturedPost post={featured} />
      ) : (
        page === 1 && <p className="text-muted">No posts yet.</p>
      )}

      {grid.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 text-xl font-bold">Latest stories</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {grid.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}

      <Pagination basePath="/" page={page} pageCount={pageCount} />
    </div>
  );
}
