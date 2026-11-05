// Usage: npm run db:seed:mandatory
// Rows every environment needs, including production. Must be idempotent:
// onConflictDoNothing means re-running never duplicates or overwrites data.
import { closeDb, getDb } from "../../src/lib/db/client";
import { tags } from "../../src/lib/db/schema";
import { fail } from "./utils";

// No mandatory rows yet. The Admin account comes from env vars, not the database.
const mandatoryTags: { name: string; slug: string }[] = [];

async function main() {
  if (mandatoryTags.length === 0) {
    console.log("No mandatory data is defined yet.");
    return;
  }
  await getDb().insert(tags).values(mandatoryTags).onConflictDoNothing();
  console.log(`Seeded ${mandatoryTags.length} mandatory tag(s).`);
}

main()
  .catch(fail)
  .finally(() => closeDb());
