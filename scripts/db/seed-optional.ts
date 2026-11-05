// Usage: npm run db:seed:optional
// Sample posts for local development.
// Idempotent: tags are skipped if they exist and posts are matched by slug.
import { and, eq, isNull } from "drizzle-orm";
import { sanitizePostHtml } from "../../src/lib/content";
import { closeDb, getDb } from "../../src/lib/db/client";
import { posts, postTags, tags } from "../../src/lib/db/schema";
import { fail } from "./utils";

type SampleTag = { name: string; slug: string };
type SamplePost = {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  tagSlugs: string[];
  daysAgo: number;
};

const sampleTags: SampleTag[] = [
  { name: "Writing", slug: "writing" },
  { name: "Design", slug: "design" },
  { name: "Engineering", slug: "engineering" },
  { name: "Notes", slug: "notes" },
];

const samplePosts: SamplePost[] = [
  {
    title: "Why I Started Writing in Public",
    slug: "why-i-started-writing-in-public",
    excerpt: "Writing where others can read it changed how I think about my work.",
    tagSlugs: ["writing", "notes"],
    daysAgo: 1,
    contentHtml: `
<p>For years my notes lived in a folder nobody else would open. They were useful to me and nothing more.</p>
<h2>Writing for a reader</h2>
<p>Once I started publishing, every half-formed idea had to become a sentence someone else could follow. That pressure made me clearer.</p>
<h3>What changed</h3>
<p>I now write shorter drafts, more often, and I keep the ones that survive a second read.</p>`,
  },
  {
    title: "A Calm Layout for Long Reading",
    slug: "a-calm-layout-for-long-reading",
    excerpt: "Line length, contrast and spacing matter more than decoration.",
    tagSlugs: ["design"],
    daysAgo: 3,
    contentHtml: `
<p>Most reading problems on the web are layout problems. A column that is too wide tires the eye before the argument lands.</p>
<h2>Keep the column narrow</h2>
<p>Around 65 to 75 characters per line works well for body text. Anything much wider forces the reader to hunt for the next line.</p>
<h2>Let the type do the work</h2>
<p>A serif for the article and a sans serif for the interface is a combination that holds up well in both light and dark modes.</p>`,
  },
  {
    title: "Notes on Building With Drizzle",
    slug: "notes-on-building-with-drizzle",
    excerpt: "A type-safe query builder that stays close to SQL.",
    tagSlugs: ["engineering"],
    daysAgo: 6,
    contentHtml: `
<p>Drizzle keeps the mental model close to SQL, which makes it easy to predict what will run against the database.</p>
<h2>Schema as the source of truth</h2>
<p>Defining tables in TypeScript gives you inferred types for free. Migrations are generated from the same file, so the two cannot drift apart.</p>
<h2>Keep access in one place</h2>
<p>Routing every query through a single client module makes it easy to add logging or connection rules later.</p>`,
  },
  {
    title: "Small Habits for a Sustainable Practice",
    slug: "small-habits-for-a-sustainable-practice",
    excerpt: "Consistency beats intensity when a project has to last years.",
    tagSlugs: ["notes", "writing"],
    daysAgo: 10,
    contentHtml: `
<p>Big bursts of work feel productive, but they rarely last. Smaller routines survive busy weeks.</p>
<h2>Three habits I keep</h2>
<p>I write a short log at the end of each session, I leave the next task written down, and I stop while I still know what comes next.</p>`,
  },
  {
    title: "Designing Admin Screens Nobody Dreads",
    slug: "designing-admin-screens-nobody-dreads",
    excerpt: "Dense and utilitarian can still be pleasant to use.",
    tagSlugs: ["design", "engineering"],
    daysAgo: 14,
    contentHtml: `
<p>Admin screens do not need to be exciting. They need to be fast to scan and hard to misuse.</p>
<h2>Make the common action obvious</h2>
<p>Put the primary button where the eye already is, and make destructive actions require a second step.</p>
<h2>Show state, not just controls</h2>
<p>A status badge that says draft or published saves a click every time someone checks a list.</p>`,
  },
  {
    title: "The Case for Plain Text Backups",
    slug: "the-case-for-plain-text-backups",
    excerpt: "Files you can read in fifty years beat clever formats you cannot open.",
    tagSlugs: ["engineering", "notes"],
    daysAgo: 21,
    contentHtml: `
<p>Every few years a format I relied on becomes hard to open. Plain text has outlasted all of them.</p>
<h2>What to keep</h2>
<p>Store the words in plain text or Markdown, keep images in a predictable folder, and export on a schedule you will actually follow.</p>`,
  },
];

async function main() {
  const db = getDb();

  await db.insert(tags).values(sampleTags).onConflictDoNothing();
  const tagRows = await db.select().from(tags);
  const tagIdBySlug = new Map(tagRows.map((t) => [t.slug, t.id]));

  let created = 0;
  let coversSet = 0;
  for (const sample of samplePosts) {
    // Cover images live in public/seed. Posts seeded before covers existed
    // get one; their other fields are left alone.
    const coverImageUrl = `/seed/${sample.slug}.jpg`;
    const existing = await db.query.posts.findFirst({
      where: eq(posts.slug, sample.slug),
      columns: { id: true },
    });
    if (existing) {
      const updated = await db
        .update(posts)
        .set({ coverImageUrl })
        .where(and(eq(posts.id, existing.id), isNull(posts.coverImageUrl)))
        .returning({ id: posts.id });
      coversSet += updated.length;
      continue;
    }

    const publishedAt = new Date(Date.now() - sample.daysAgo * 24 * 60 * 60 * 1000);
    const [post] = await db
      .insert(posts)
      .values({
        title: sample.title,
        slug: sample.slug,
        excerpt: sample.excerpt,
        coverImageUrl,
        // Post HTML is sanitized on save, including seeded content.
        contentHtml: sanitizePostHtml(sample.contentHtml.trim()),
        status: "published",
        publishedAt,
      })
      .returning({ id: posts.id });

    const links = sample.tagSlugs
      .map((slug) => tagIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((tagId) => ({ postId: post.id, tagId }));
    if (links.length) await db.insert(postTags).values(links);
    created++;
  }

  console.log(
    `Created ${created} sample post(s). Set ${coversSet} missing cover image(s).`,
  );
}

main()
  .catch(fail)
  .finally(() => closeDb());
