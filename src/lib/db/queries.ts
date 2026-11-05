import { and, count, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { siteConfig } from "../site-config";
import { getDb } from "./client";
import { posts, postTags, tags, type Post, type Tag } from "./schema";

// Public read queries. Only published posts are returned.

export type PostWithTags = Post & { tags: Tag[] };

const PER_PAGE = siteConfig.postsPerPage;
const isPublished = eq(posts.status, "published");

// Attaches tags to a batch of posts with one query.
export async function withTags(rows: Post[]): Promise<PostWithTags[]> {
  if (rows.length === 0) return [];
  const links = await getDb()
    .select({ postId: postTags.postId, tag: tags })
    .from(postTags)
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .where(inArray(postTags.postId, rows.map((r) => r.id)))
    .orderBy(tags.name);

  const byPost = new Map<string, Tag[]>();
  for (const { postId, tag } of links) {
    byPost.set(postId, [...(byPost.get(postId) ?? []), tag]);
  }
  return rows.map((row) => ({ ...row, tags: byPost.get(row.id) ?? [] }));
}

async function listPosts(filter: SQL | undefined, offset: number, limit: number) {
  const rows = await getDb()
    .select()
    .from(posts)
    .where(and(isPublished, filter))
    .orderBy(desc(posts.publishedAt))
    .offset(offset)
    .limit(limit);
  return withTags(rows);
}

async function countPosts(filter: SQL | undefined) {
  const [row] = await getDb()
    .select({ value: count() })
    .from(posts)
    .where(and(isPublished, filter));
  return row.value;
}

// Paged list used by tag and search pages.
async function getPagedPosts(filter: SQL | undefined, page: number) {
  const [total, items] = await Promise.all([
    countPosts(filter),
    listPosts(filter, (page - 1) * PER_PAGE, PER_PAGE),
  ]);
  return { posts: items, pageCount: Math.max(1, Math.ceil(total / PER_PAGE)) };
}

// Page 1 shows the newest post as the featured card; the grid holds the next
// PER_PAGE posts. Later pages continue from there.
export async function getHomePage(page: number) {
  const total = await countPosts(undefined);
  const gridOffset = 1 + (page - 1) * PER_PAGE;
  const [featured, grid] = await Promise.all([
    page === 1 ? listPosts(undefined, 0, 1) : Promise.resolve([]),
    listPosts(undefined, gridOffset, PER_PAGE),
  ]);
  return {
    featured: featured[0] ?? null,
    grid,
    pageCount: Math.max(1, Math.ceil((total - 1) / PER_PAGE)),
  };
}

export async function getPublishedPostBySlug(slug: string) {
  const [row] = await getDb()
    .select()
    .from(posts)
    .where(and(isPublished, eq(posts.slug, slug)))
    .limit(1);
  if (!row) return null;
  const [withTagList] = await withTags([row]);
  return withTagList;
}

export async function getTagBySlug(slug: string) {
  const [row] = await getDb().select().from(tags).where(eq(tags.slug, slug)).limit(1);
  return row ?? null;
}

export function getTagPosts(tagSlug: string, page: number) {
  const tagged = getDb()
    .select({ id: postTags.postId })
    .from(postTags)
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .where(eq(tags.slug, tagSlug));
  return getPagedPosts(inArray(posts.id, tagged), page);
}

// Matches title, excerpt and body text (HTML tags stripped). LIKE wildcards in
// the query are escaped so that "%" and "_" are matched literally.
export function searchPublishedPosts(query: string, page: number) {
  const pattern = `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const bodyText = sql`regexp_replace(${posts.contentHtml}, '<[^>]+>', ' ', 'g')`;
  return getPagedPosts(
    or(
      ilike(posts.title, pattern),
      ilike(posts.excerpt, pattern),
      ilike(bodyText, pattern),
    ),
    page,
  );
}
