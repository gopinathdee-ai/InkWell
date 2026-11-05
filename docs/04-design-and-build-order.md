# 4. Design direction and build order

The public site follows the Magazine grid mockup (option B), with Montserrat for readability and article text. A reference screenshot is in `docs/reference/option-b-magazine-grid.png`.

## Design direction

- **Layout:** top bar with blog name on the left and links plus search and theme toggle on the right; a featured post card (image left, text right); a section titled "Latest stories" with a three-column card grid; footer with copyright and RSS link.
- **Cards:** 16 px rounded corners, soft shadow, cover image on top, uppercase first-tag label in the accent color, title in bold, two-line excerpt.
- **Color:** Dark Glass is the default theme: near-black background with soft indigo and cyan glows, frosted glass panels, gradient headlines and monospace labels. A light variant of the same glass style is available from the header toggle. Accent indigo (`#818cf8` on dark) to cyan (`#22d3ee`). Tokens are defined in `src/app/globals.css`; shared classes are `glass`, `label`, `text-gradient`, `field`, `btn` and `btn-primary`.
- **Type:** Montserrat throughout (navigation, cards, headings, article bodies at 18 px and above in `.prose-article`, and code). Article column about 680 px wide.
- **Admin:** plain, dense, utilitarian screens using the same fonts and accent; the editor is a centered column with a toolbar and a side panel for cover image, tags, slug and SEO fields.
- **Placeholders:** blog name "InkWell" and a one-line tagline, both in `src/lib/site-config.ts`.

## Build order

Each step should end with a working app and a passing `npm run build`.

1. **Scaffold and config. DONE in this base project.** Next.js 16 app, dependencies, `cacheComponents` off, fonts, theme provider, design tokens, `site-config.ts`, header, footer and a placeholder home page. Done when: a styled home page loads in light and dark mode.
2. **Database. Schema and client are DONE; seed script remains.** Drizzle schema, `pg` client, `drizzle.config.ts`, the initial migration in `./drizzle` and the `scripts/db/` scripts exist (`db:migrate`, `db:seed:mandatory`, `db:seed:optional`, `db:reset`, `db:reset:recreate`). `db:seed:optional` creates 6 sample posts. `src/lib/db/queries.ts` is in place. Done when: `npm run db:migrate && npm run db:seed:optional` works against a Neon database.
3. **Public site.** Build the home page (featured post and grid), post page, tag page, search and `PostCard`, `FeaturedPost`, `TagChip`, `Toc` components from the seeded data. Done when: all pages render, the table of contents and reading time show, and the layout holds at 360 px width.
4. **Auth.** Add login page, session handling, `proxy.ts` and `requireAdmin()` (the hash script exists). Done when: `/admin` redirects to login and a correct login opens the dashboard.
5. **Admin posts.** Build the dashboard, editor with auto-save, tag input, cover and inline image upload, slug and SEO fields, preview, publish and delete. Done when: a post written in the editor appears on the public site after publishing and disappears when unpublished.
6. **Discoverability and polish.** Add the RSS feed, sitemap, robots, share-card metadata, loading and error states, and the not-found page. Done when: the feed validates and a shared link shows a card.
7. **Deploy.** Create the Neon database and Vercel project, add the environment variables, enable Vercel Blob, and deploy. Update the README with deployment notes. Done when: the production site loads and the Admin can publish a post with an uploaded image.

## Open items

- Final blog name, logo and tagline.
- Domain name, to be attached in Vercel once chosen.
- Whether to add a Category concept later; for now tags cover it.
