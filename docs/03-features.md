# 3. Features list

Version 1 has 11 chosen features plus the pages that make them usable. "List no." is the number from the original feature menu; "Req" links to `02-requirements.md`.

## Admin module

| Feature | List no. | Req | What it does and how to check it |
| --- | --- | --- | --- |
| Admin login | 28 | FR-5 | Email and password form at `/admin/login`; wrong credentials show a generic error; visiting `/admin` signed out redirects to login; sign-out clears the cookie |
| Posts dashboard | n/a | FR-6 | Table of all posts with title, status, tags and last updated; actions: edit, preview, publish or unpublish, delete (with confirm); new-post button |
| Rich text editor | 1 | FR-6 | Tiptap with headings 2 to 3, bold, italic, lists, quote, code block, link, inline image, horizontal rule; output saved as sanitized HTML |
| Draft and published states | 2 | FR-8 | Status toggle; publishing sets `published_at`; drafts return 404 on the public site |
| Auto-save | 5 | FR-9 | Saves about 2 seconds after typing stops; shows "Saving" and "Saved" state; first save creates the draft |
| Preview | 7 | FR-10 | Preview page renders the post with the public template, including drafts, for the signed-in Admin only |
| Image uploads | 4 | FR-7 | Cover image upload (required to publish) and inline image upload via drag, paste or button; image types only, 5 MB limit; alt text field |
| Slug, excerpt and SEO fields | 8 | FR-11 | Slug auto-generated from title and editable; excerpt, meta title and meta description optional, with sensible fallbacks |
| Tags created on the fly | 10 | FR-12 | Tag field suggests existing tags; typing a new name and pressing Enter creates it; unused tags can be removed from a Tags screen |

## Public blog

| Feature | List no. | Req | What it does and how to check it |
| --- | --- | --- | --- |
| Home, magazine layout | n/a | FR-1 | Latest published post as a large featured card, then a three-column card grid (cover image, first tag as label, title, excerpt); pagination at 12 per page |
| Post page | 15 | FR-2 | Cover image, title, date, tags, reading time (words divided by 200, rounded up), sticky table of contents from H2 and H3 headings on wide screens, serif body text |
| Tag pages | 10 | FR-3 | `/tags/<slug>` lists posts with that tag; tag chips on cards and posts link to it |
| Search | 13 | FR-3 | Search box in the header; results page matches title, excerpt and body text, newest first |
| Dark mode | 14 | FR-4 | Toggle in the header; light, dark and system; no flash of the wrong theme on load |
| Feed and SEO | n/a | FR-13 | `/feed.xml`, `/sitemap.xml`, `/robots.txt`, Open Graph and Twitter tags from cover image, title and excerpt |
| Placeholder branding | n/a | n/a | Blog name, tagline, author name and footer text read from `src/lib/site-config.ts` |

## Not in version 1

Scheduled publishing, comments, newsletter, roles, revisions, media library and analytics (everything else on the menu) can be added later without schema changes to the posts table.
