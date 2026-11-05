// Usage: npm run db:reset
// Drops the public and drizzle schemas (all tables, enums and migration records).
// Requires typing DESTROY DATABASE. Disabled in production.
import { sql } from "drizzle-orm";
import { closeDb, getDb } from "../../src/lib/db/client";
import { confirmPhrase, fail, refuseInProduction } from "./utils";

async function main() {
  refuseInProduction("db:reset");
  await confirmPhrase(
    "This permanently deletes ALL data in the database named in DATABASE_URL.",
    "DESTROY DATABASE",
  );
  const db = getDb();
  console.log("Dropping schemas drizzle and public ...");
  await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
  await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
  await db.execute(sql`CREATE SCHEMA public`);
  console.log("Database reset. Run npm run db:migrate next.");
}

main()
  .catch(fail)
  .finally(() => closeDb());
