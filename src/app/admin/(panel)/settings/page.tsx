import type { Metadata } from "next";
import { saveSettingsAction } from "@/app/admin/actions";
import { RichTextField } from "@/components/admin/RichTextField";
import { requireAdmin } from "@/lib/auth";
import { BRAND_FONTS } from "@/lib/brand-fonts";
import { getSiteSettings } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Site-wide details shown on the public site.</p>
      </div>

      <form action={saveSettingsAction} className="glass flex flex-col gap-4 rounded-2xl p-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Blog name
          <input
            name="siteName"
            defaultValue={settings.siteName}
            required
            maxLength={60}
            className="field"
          />
          <span className="text-xs font-normal text-muted">Shown next to the icon in the header.</span>
        </label>
        <fieldset className="flex flex-col gap-2 text-sm font-medium">
          <legend className="mb-1.5">Blog name font</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {BRAND_FONTS.map((font) => (
              <label
                key={font.key}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 has-[:checked]:border-accent has-[:checked]:bg-accent/10"
              >
                <input type="radio" name="brandFont" value={font.key} defaultChecked={font.key === settings.brandFont} className="accent-[var(--accent)]" />
                <span className="text-lg" style={{ fontFamily: font.css }}>
                  {settings.siteName || "InkWell"}
                </span>
                <span className="ml-auto text-xs font-normal text-muted">{font.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Author name
          <input
            name="authorName"
            defaultValue={settings.authorName}
            required
            maxLength={80}
            className="field"
          />
          <span className="text-xs font-normal text-muted">Shown in the footer as © year and name.</span>
        </label>
        <div className="flex flex-col gap-1.5 text-sm font-medium">
          About the blogger
          <RichTextField name="aboutBlogger" initialHtml={settings.aboutBlogger} />
          <span className="text-xs font-normal text-muted">
            Shown beside the featured post on the home page. Leave empty to hide it.
          </span>
        </div>
        <div>
          <button type="submit" className="btn btn-primary">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
