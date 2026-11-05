// Usage: npm run db:migrate
// Applies every pending SQL file in ./drizzle. Safe to run repeatedly.
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { closeDb, getDb } from "../../src/lib/db/client";
import { fail } from "./utils";

async function main() {
  console.log("Applying migrations from ./drizzle ...");
  await migrate(getDb(), { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");
}

main()
  .catch(fail)
  .finally(() => closeDb());
