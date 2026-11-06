import { siteConfig } from "../site-config";
import { BRAND_FONT_KEY, normalizeBrandFont } from "../brand-fonts";
import { getDb } from "./client";
import { siteSettings } from "./schema";

export const SITE_NAME_KEY = "site_name";
export const AUTHOR_NAME_KEY = "author_name";
export const ABOUT_KEY = "about_blogger";

// Public reads fall back to site-config.ts so the site still renders if the
// settings table is missing or unreachable.
export async function getSiteSettings() {
  const defaults = { siteName: siteConfig.name, authorName: siteConfig.authorName, aboutBlogger: "", brandFont: "montserrat" as const };
  try {
    const rows = await getDb().select().from(siteSettings);
    const values = new Map(rows.map((row) => [row.key, row.value]));
    return {
      siteName: values.get(SITE_NAME_KEY) || defaults.siteName,
      brandFont: normalizeBrandFont(values.get(BRAND_FONT_KEY)),
      authorName: values.get(AUTHOR_NAME_KEY) || defaults.authorName,
      aboutBlogger: values.get(ABOUT_KEY) ?? defaults.aboutBlogger,
    };
  } catch (error) {
    console.error("Could not read site settings, using site-config defaults.", error);
    return defaults;
  }
}

export async function setSetting(key: string, value: string) {
  const now = new Date();
  await getDb()
    .insert(siteSettings)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: now },
    });
}
