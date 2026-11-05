# Blog platform (base framework)

Next.js 16 + Tailwind 4 + Drizzle/Neon Postgres. The project is already scaffolded and configured; the features are built in the steps described in `docs/`.

## Start

```bash
npm install
cp .env.example .env.local     # then fill in DATABASE_URL and the rest
npm run dev                    # http://localhost:3000
```

The home page works without a database. Database features need `DATABASE_URL` from a Neon project:

```bash
npm run db:migrate             # create or update tables from ./drizzle
npm run db:seed:optional       # sample posts (local only)
npm run hash-password -- "your password"   # prints ADMIN_PASSWORD_HASH
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Create a migration SQL file in `./drizzle` after changing `schema.ts` |
| `npm run db:migrate` | Apply pending migrations (safe to re-run) |
| `npm run db:seed:mandatory` | Seed data every environment needs |
| `npm run db:seed:optional` | Seed sample posts |
| `npm run db:reset` | Drop all data; asks you to type `DESTROY DATABASE`; refuses in production |
| `npm run db:reset:recreate` | Reset, migrate and seed mandatory data |
| `npm run db:studio` | Browse data in Drizzle Studio |
| `npm run hash-password` | Generate the admin password hash |

## Docs

- `docs/01-framework.md`
- `docs/02-requirements.md`
- `docs/03-features.md`
- `docs/04-design-and-build-order.md`

`CLAUDE.md` tells Claude Code how to continue the build.
