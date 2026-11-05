# 2. Requirements Analysis

The platform must let one author write, manage and publish blog posts through a private Admin module, and present them to anonymous readers in a modern magazine-style public site, at near-zero running cost.

## Users

| Role | Who | Needs |
| --- | --- | --- |
| Reader | Anonymous visitor | Browse, search and read posts quickly on any device; switch to dark mode |
| Admin | The blog owner (one account) | Write, preview, publish and manage posts; upload images; manage tags without leaving the editor |

## Functional requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-1 | Readers can see published posts only, newest first, on a home page with one featured post and a grid of the rest | Must |
| FR-2 | Readers can open a post at `/posts/<slug>` and see title, cover image, publish date, tags, reading time, table of contents and body | Must |
| FR-3 | Readers can filter posts by tag and search by words in title, excerpt and body | Must |
| FR-4 | Readers can toggle light and dark mode; the choice persists and defaults to the system setting | Must |
| FR-5 | The Admin can sign in with email and password; all `/admin` pages and actions are blocked otherwise | Must |
| FR-6 | The Admin can create, edit, delete, publish and unpublish posts using a rich text editor | Must |
| FR-7 | Every post requires a cover image; images can also be inserted inline in the body | Must |
| FR-8 | Posts can be saved as drafts; drafts never appear publicly | Must |
| FR-9 | The editor auto-saves a draft while the Admin types | Should |
| FR-10 | The Admin can preview a post exactly as readers will see it before publishing | Should |
| FR-11 | The Admin can set slug, excerpt, meta title and meta description per post; defaults are derived from the title and body | Should |
| FR-12 | The Admin can add tags to a post and create new tags on the fly while editing | Must |
| FR-13 | The site exposes an RSS feed, sitemap and robots.txt, and share-card tags on each post | Could |

## Non-functional requirements

- **Performance:** home and post pages render in under 2 seconds on a typical mobile connection; images are resized by `next/image`.
- **Security:** passwords stored only as bcrypt hashes; session cookie is httpOnly, secure and signed; all post HTML is sanitized on save; upload endpoint accepts images only, with a size limit of 5 MB; every Server Action checks the session itself, not only `proxy.ts`.
- **Readability:** body text at 18 px or larger, line height around 1.7, line length under 75 characters, contrast meeting WCAG AA in both themes.
- **Responsive:** layout works from 360 px phones to wide desktops; the grid collapses from three columns to one.
- **Accessibility:** semantic headings, keyboard-reachable controls, alt text field on every image.
- **Maintainability:** TypeScript strict mode; database access only through `src/lib/db`; a seed script creates sample data.
- **Cost:** runs on free tiers of Neon, Vercel and Vercel Blob.

## Assumptions and constraints

- One author and one admin account. No public sign-up.
- Blog name and branding are placeholders held in one config file (`src/lib/site-config.ts`) so they can be changed in one place.
- Domain is not decided; URLs use `NEXT_PUBLIC_SITE_URL` when set.
- Categories are handled as tags, created on the fly.
- Content is stored as sanitized HTML produced by Tiptap.

## Out of scope for version 1

Scheduled publishing, comments, newsletter signup, multiple users and roles, revision history, media library, import and export, analytics. The schema and structure leave room to add them later.
