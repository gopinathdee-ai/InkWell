import Link from "next/link";

// Prev and next links. `basePath` is the page path; `params` keeps other
// query values such as the search term.
export function Pagination({
  basePath,
  page,
  pageCount,
  params = {},
}: {
  basePath: string;
  page: number;
  pageCount: number;
  params?: Record<string, string>;
}) {
  if (pageCount <= 1) return null;

  const hrefFor = (target: number) => {
    const query = new URLSearchParams({ ...params });
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const linkClass =
    "btn";

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass}>
          Newer
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={linkClass}>
          Older
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
