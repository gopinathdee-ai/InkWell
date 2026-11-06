@AGENTS.md

# Blog platform

Personal blog web app: public magazine-style blog plus a private Admin module. Next.js 16 (App Router), Tailwind 4, Drizzle + Neon Postgres, Tiptap editor, Vercel hosting.

Read these before building anything:

- `docs/01-framework.md` stack, structure, data model, env vars
- `docs/02-requirements.md` requirements and constraints
- `docs/03-features.md` v1 feature list with acceptance notes
- `docs/04-design-and-build-order.md` design direction and the 7-step build order

## Status

Build steps 1 to 5 are done: public site (step 3), auth (step 4) and Admin posts (step 5). Continue from step 6 (discoverability) in `docs/04-design-and-build-order.md`, then step 7. Still to check in a browser: admin login with the real password, editor auto-save, Tiptap toolbar, 360 px layout and dark mode. Local uploads go to public/uploads (gitignored). Do one step at a time and run `npm run typecheck && npm run build` at the end of each.

## Rules

- Next.js 16 differs from older versions. Check `node_modules/next/dist/docs/` before using an API (`proxy.ts` not middleware; `params`, `searchParams`, `cookies()` are async).
- Keep `cacheComponents` off. Pages that read the database use `export const dynamic = "force-dynamic"`.
- Database access only through `src/lib/db` (`getDb()`). Never import `pg` in components.
- Sanitize post HTML on save. Every Server Action and route handler in Admin must call `requireAdmin()`.
- Branding lives in `src/lib/site-config.ts`. The blog name, author name and About the blogger text are set in Admin > Settings and stored in `site_settings`; `site-config.ts` is the fallback. Colors and fonts come from the tokens in `src/app/globals.css`.
- Single admin account from env vars; no public sign-up.
- Out of scope for v1: scheduling, comments, newsletter, roles, revisions, media library, analytics.
