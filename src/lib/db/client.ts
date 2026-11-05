import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Lazy so that `next build` works without DATABASE_URL. Pages that read the
// database must be dynamic (`export const dynamic = "force-dynamic"`).
const g = globalThis as unknown as { __blogPool?: Pool };
let db: NodePgDatabase<typeof schema> | undefined;
let pool: Pool | undefined;

export function getDb() {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  pool = g.__blogPool ?? new Pool({ connectionString: url, max: 5 });
  if (process.env.NODE_ENV !== "production") g.__blogPool = pool;
  db = drizzle(pool, { schema });
  return db;
}

// Used by the CLI scripts in scripts/db so that the process can exit.
export async function closeDb() {
  const current = pool;
  db = undefined;
  pool = undefined;
  g.__blogPool = undefined;
  await current?.end();
}
