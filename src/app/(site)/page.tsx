import { notFound } from "next/navigation";
import { FeaturedPost } from "@/components/site/FeaturedPost";
import { PostCard } from "@/components/site/PostCard";
import { AboutBlogger } from "@/components/site/AboutBlogger";
import { Pagination } from "@/components/site/Pagination";
import { getHomePage } from "@/lib/db/queries";
import { htmlToText } from "@/lib/content";
import { getSiteSettings } from "@/lib/db/settings";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function Home(props: PageProps<"/">) {
  const { page: rawPage } = await props.searchParams;
  const page = parsePage(rawPage);
  const { featured, grid, pageCount } = await getHomePage(page);
  if (page > pageCount) notFound();
  const settings = await getSiteSettings();
  const aboutLength = htmlToText(settings.aboutBlogger).length;
  const showAbout = page === 1 && aboutLength > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {featured ? (
        showAbout ? (
          <div className="grid items-stretch gap-6 lg:grid-cols-[2fr_1fr]">
            <FeaturedPost post={featured} stacked />
            <AboutBlogger
              name={settings.authorName}
              html={settings.aboutBlogger}
              long={aboutLength > 280}
            />
          </div>
        ) : (
          <FeaturedPost post={featured} />
        )
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
