import type { Metadata } from "next";
import { saveSettingsAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage(props: PageProps<"/admin/settings">) {
  await requireAdmin();
  const { notice } = await props.searchParams;
  const message = Array.isArray(notice) ? notice[0] : notice;
  const settings = await getSiteSettings();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Site-wide details shown on the public site.</p>
      </div>

      {message && (
        <p role="alert" className="glass rounded-xl px-4 py-2 text-sm">
          {message}
        </p>
      )}

      <form action={saveSettingsAction} className="glass flex flex-col gap-4 rounded-2xl p-6">
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
        <div>
          <button type="submit" className="btn btn-primary">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
