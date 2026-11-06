import { asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { sanitizePostHtml } from "../content";
import { slugify } from "../slug";
import { getDb } from "./client";
import { withTags, type PostWithTags } from "./queries";
import { posts, postTags, tags } from "./schema";

// Admin reads and writes. Callers must have run requireAdmin() first.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PostStatus = "draft" | "published";

export type SaveInput = {
  id: string | null;
  title: string;
  slug: string;
  // True while the slug follows the title; the server then adds -2, -3... on clashes.
  slugAuto: boolean;
  excerpt: string;
  contentHtml: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  tagNames: string[];
  status: PostStatus;
  // YYYY-MM-DD, or empty to keep the existing date (or use now on first publish).
  publishedDate: string;
};

export type SaveResult =
  | { ok: true; id: string; slug: string; status: PostStatus; savedAt: string }
  | { ok: false; error: string };

export async function listAdminPosts(): Promise<PostWithTags[]> {
  const rows = await getDb().select().from(posts).orderBy(desc(posts.updatedAt));
  return withTags(rows);
}

export async function getAdminPost(id: string): Promise<PostWithTags | null> {
  if (!UUID.test(id)) return null;
  const [row] = await getDb().select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!row) return null;
  const [withTagList] = await withTags([row]);
  return withTagList;
}

export function listTagsWithCounts() {
  return getDb()
    .select({ id: tags.id, name: tags.name, slug: tags.slug, postCount: count(postTags.postId) })
    .from(tags)
    .leftJoin(postTags, eq(postTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(asc(tags.name));
}

function clean(value: string, max: number) {
  return value.trim().slice(0, max);
}

function normalizeTagNames(names: string[]) {
  const bySlug = new Map<string, string>();
  for (const raw of names) {
    const name = clean(raw, 40);
    const slug = slugify(name);
    if (name && slug && !bySlug.has(slug)) bySlug.set(slug, name);
  }
  return [...bySlug].slice(0, 20).map(([slug, name]) => ({ slug, name }));
}

// Returns the first free slug from `base`, or null if a manual slug is taken.
async function availableSlug(base: string, auto: boolean, ownId: string | null) {
  const db = getDb();
  for (let n = 1; ; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const [owner] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, candidate))
      .limit(1);
    if (!owner || owner.id === ownId) return candidate;
    if (!auto) return null;
  }
}

export async function savePost(input: SaveInput): Promise<SaveResult> {
  const db = getDb();

  const [current] = input.id && UUID.test(input.id)
    ? await db.select().from(posts).where(eq(posts.id, input.id)).limit(1)
    : [];
  if (input.id && !current) return { ok: false, error: "This post no longer exists." };

  if (input.status === "published" && !input.coverImageUrl) {
    return { ok: false, error: "Add a cover image before publishing." };
  }

  const title = clean(input.title, 200) || "Untitled";
  const base = slugify(input.slugAuto ? title : input.slug).slice(0, 120) || "untitled";
  const slug = await availableSlug(base, input.slugAuto, current?.id ?? null);
  if (!slug) return { ok: false, error: "That slug is already used by another post." };

  const now = new Date();

  const dateInput = input.publishedDate.trim();
  let publishedAt: Date | null;
  if (dateInput) {
    const parsed = new Date(`${dateInput}T00:00:00Z`);
    // Rejects impossible dates such as 2021-02-31, which JavaScript would roll over.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput) || parsed.toISOString().slice(0, 10) !== dateInput) {
      return { ok: false, error: "Use a valid published date." };
    }
    publishedAt = parsed;
  } else {
    publishedAt = current?.publishedAt ?? (input.status === "published" ? now : null);
  }

  const values = {
    title,
    slug,
    excerpt: clean(input.excerpt, 300),
    contentHtml: sanitizePostHtml(input.contentHtml),
    coverImageUrl: input.coverImageUrl,
    coverImageAlt: clean(input.coverImageAlt, 200) || null,
    metaTitle: clean(input.metaTitle, 120) || null,
    metaDescription: clean(input.metaDescription, 300) || null,
    status: input.status,
    publishedAt,
    updatedAt: now,
  };

  const tagRows = normalizeTagNames(input.tagNames);

  const id = await db.transaction(async (tx) => {
    let postId: string;
    if (current) {
      await tx.update(posts).set(values).where(eq(posts.id, current.id));
      postId = current.id;
    } else {
      const [row] = await tx.insert(posts).values(values).returning({ id: posts.id });
      postId = row.id;
    }

    // Tags are created on the fly. Existing slugs are reused.
    let tagIds: string[] = [];
    if (tagRows.length) {
      await tx.insert(tags).values(tagRows).onConflictDoNothing();
      const found = await tx
        .select({ id: tags.id })
        .from(tags)
        .where(inArray(tags.slug, tagRows.map((t) => t.slug)));
      tagIds = found.map((t) => t.id);
    }

    await tx.delete(postTags).where(eq(postTags.postId, postId));
    if (tagIds.length) {
      await tx.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
    }
    return postId;
  });

  return { ok: true, id, slug, status: input.status, savedAt: now.toISOString() };
}

export async function setPostStatus(id: string, status: PostStatus): Promise<SaveResult> {
  if (!UUID.test(id)) return { ok: false, error: "Post not found." };
  const db = getDb();
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return { ok: false, error: "Post not found." };
  if (status === "published" && !post.coverImageUrl) {
    return { ok: false, error: `Add a cover image to "${post.title}" before publishing.` };
  }

  const now = new Date();
  await db
    .update(posts)
    .set({
      status,
      publishedAt: post.publishedAt ?? (status === "published" ? now : null),
      updatedAt: now,
    })
    .where(eq(posts.id, id));
  return { ok: true, id, slug: post.slug, status, savedAt: now.toISOString() };
}

export async function deletePost(id: string) {
  if (!UUID.test(id)) return;
  await getDb().delete(posts).where(eq(posts.id, id));
}

// Removes a tag only when no post uses it. Returns false if it is still in use.
export async function deleteUnusedTag(id: string) {
  if (!UUID.test(id)) return false;
  // Explicit SQL: the NOT EXISTS guard must see the tag row being deleted.
  const result = await getDb().execute(sql`
    delete from ${tags}
    where ${tags.id} = ${id}
      and not exists (select 1 from ${postTags} where ${postTags.tagId} = ${tags.id})
  `);
  return result.rowCount === 1;
}
