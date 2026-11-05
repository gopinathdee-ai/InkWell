import { siteConfig } from "../site-config";
import { getDb } from "./client";
import { siteSettings } from "./schema";

export const AUTHOR_NAME_KEY = "author_name";

// Public reads fall back to site-config.ts so the site still renders if the
// settings table is missing or unreachable.
export async function getSiteSettings() {
  const defaults = { authorName: siteConfig.authorName };
  try {
    const rows = await getDb().select().from(siteSettings);
    const values = new Map(rows.map((row) => [row.key, row.value]));
    return { authorName: values.get(AUTHOR_NAME_KEY) || defaults.authorName };
  } catch (error) {
    console.error("Could not read site settings, using site-config defaults.", error);
    return defaults;
  }
}

export async function setAuthorName(name: string) {
  const now = new Date();
  await getDb()
    .insert(siteSettings)
    .values({ key: AUTHOR_NAME_KEY, value: name, updatedAt: now })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: name, updatedAt: now },
    });
}
