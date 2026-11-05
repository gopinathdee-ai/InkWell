import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/site/PostCard";
import { Pagination } from "@/components/site/Pagination";
import { searchPublishedPosts } from "@/lib/db/queries";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Search" };

const MAX_QUERY_LENGTH = 100;

export default async function SearchPage(props: PageProps<"/search">) {
  const { q: rawQuery, page: rawPage } = await props.searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const query = (first(rawQuery) ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const page = parsePage(rawPage);

  const result = query ? await searchPublishedPosts(query, page) : null;
  if (result && page > result.pageCount) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-gradient text-3xl font-extrabold tracking-tight">Search</h1>
      <form action="/search" role="search" className="mt-6 flex max-w-xl gap-3">
        <label htmlFor="search-q" className="sr-only">
          Search posts
        </label>
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search by title, excerpt or text"
          className="min-w-0 flex-1 rounded-full glass px-4 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="btn btn-primary"
        >
          Search
        </button>
      </form>

      {result && (
        <div className="mt-10">
          <p className="mb-6 text-sm text-muted">
            {result.posts.length === 0
              ? `No posts match "${query}".`
              : `Results for "${query}", newest first.`}
          </p>
          {result.posts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {result.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          <Pagination
            basePath="/search"
            page={page}
            pageCount={result.pageCount}
            params={{ q: query }}
          />
        </div>
      )}
    </div>
  );
}
