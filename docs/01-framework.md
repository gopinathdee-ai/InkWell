# 1. Framework

A single Next.js app serves both the public blog and the Admin module, backed by Neon Postgres and hosted on Vercel. One codebase, one deploy, no separate API service.

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| App framework | Next.js 16 (App Router), TypeScript | Server Components by default; Server Actions for Admin writes |
| Styling | Tailwind CSS 4 + `@tailwindcss/typography` | `prose` classes style article bodies |
| Fonts | Montserrat for UI, article body and code | Self-hosted via `@fontsource-variable/*`, no Google Fonts fetch at build |
| Database | Neon Postgres | Free tier; connection string in `DATABASE_URL` |
| ORM | Drizzle ORM + `pg` (node-postgres) | `drizzle-kit generate` plus `npm run db:migrate` for schema changes; works with Neon and a local Postgres |
| Rich text editor | Tiptap 3 (StarterKit, Image, Placeholder) | StarterKit already includes Link in Tiptap 3; stores HTML |
| Auth | Single admin: `bcryptjs` + `jose` JWT in an httpOnly cookie | `proxy.ts` guards `/admin`; every Server Action re-checks the session |
| Image storage | Vercel Blob | Falls back to `public/uploads` in local dev when no token is set |
| Sanitizing and parsing | `sanitize-html`, `cheerio` | Sanitize on save; cheerio adds heading ids and builds the table of contents |
| Theming | `next-themes` | Light, dark and system |
| Hosting | Vercel | Domain to be attached later |

## Conventions for Next.js 16

`AGENTS.md` says this Next.js has breaking changes, with docs in `node_modules/next/dist/docs/`. Read the relevant guide before writing code. Points already checked:

- Middleware is now `proxy.ts` (same level as `app/`, or inside `src/`).
- `params`, `searchParams` and `cookies()` are async.
- `create-next-app` turns on `cacheComponents` and `partialPrefetching`. They are turned **off** in `next.config.ts`. Use `export const dynamic = 'force-dynamic'` on pages that read the database, so the build never needs database access.
- Database access lives only in `src/lib/db`; components never import `pg` directly. Use `getDb()` from `src/lib/db/client.ts`.

## Project structure

Files marked with a star already exist in the base project.

```
src/
  app/
    layout.tsx *             theme provider, header, footer
    page.tsx *               placeholder home (replace with featured + grid)
    globals.css *            design tokens, fonts, .prose-article
    (site)/ ...              (optional) route group for public pages
      posts/[slug]/page.tsx  post page
      tags/[slug]/page.tsx   posts by tag
      search/page.tsx
      feed.xml/route.ts      RSS
    admin/
      login/page.tsx
      (protected)/
        page.tsx             posts dashboard
        posts/new/page.tsx
        posts/[id]/page.tsx  editor
        posts/[id]/preview/page.tsx
    api/upload/route.ts      image upload (admin only)
    sitemap.ts, robots.ts
  components/
    site/ *                  Header, Footer, ThemeToggle (PostCard, FeaturedPost, TagChip, Toc to add)
    admin/                   PostEditor (Tiptap), TagInput, CoverUpload, PostTable
  lib/
    db/ *                    schema.ts, client.ts  (queries.ts to add)
    site-config.ts *         placeholder blog name and tagline
    auth.ts                  login, session sign/verify, requireAdmin()
    content.ts               sanitize, heading ids, TOC, reading time
    slug.ts                  slugify
  proxy.ts *                 optimistic guard for /admin (src/, next to app/)
drizzle.config.ts *
scripts/hash-password.ts *   scripts/db/ * (migrate, seed-mandatory, seed-optional, reset)
```

## Data model

Defined in `src/lib/db/schema.ts`.

| Table | Columns |
| --- | --- |
| `posts` | `id` (uuid), `title`, `slug` (unique), `excerpt`, `content_html`, `cover_image_url`, `status` (`draft` or `published`), `published_at`, `meta_title`, `meta_description`, `created_at`, `updated_at` |
| `tags` | `id`, `name` (unique), `slug` (unique) |
| `post_tags` | `post_id`, `tag_id` (composite primary key, cascade delete) |

Tags are created on the fly: typing a new name in the editor's tag field creates it when the post is saved. The first tag on a post is shown as its label on cards. Reading time and the table of contents are computed at render time, not stored.

## Environment variables

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `ADMIN_EMAIL` | The single admin's email |
| `ADMIN_PASSWORD_HASH` | bcrypt hash, generated with `npm run hash-password -- "password"` |
| `SESSION_SECRET` | At least 32 random characters, used to sign the session JWT |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob; leave unset locally to use `public/uploads` |
| `NEXT_PUBLIC_SITE_URL` | Base URL for RSS, sitemap and share cards; set when the domain is known |

In `.env.local`, escape each `$` in the bcrypt hash as `\$` (Next.js expands `$`). The hash script prints both forms. On Vercel, paste the raw hash.
