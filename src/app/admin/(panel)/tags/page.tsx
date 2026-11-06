import { deleteTagAction } from "@/app/admin/actions";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { requireAdmin } from "@/lib/auth";
import { listTagsWithCounts } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  await requireAdmin();
  const tags = await listTagsWithCounts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Tags</h1>
        <p className="mt-1 text-sm text-muted">
          Tags are created from the post editor. Unused tags can be removed here.
        </p>
      </div>

      {tags.length === 0 ? (
        <p className="text-muted">No tags yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg glass">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Posts</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">{tag.name}</td>
                  <td className="px-4 py-3 text-muted">{tag.slug}</td>
                  <td className="px-4 py-3 text-muted">{tag.postCount}</td>
                  <td className="px-4 py-3">
                    {tag.postCount === 0 ? (
                      <ConfirmForm
                        action={deleteTagAction}
                        fields={{ id: tag.id }}
                        title="Remove this tag?"
                        message={`The tag "${tag.name}" will be removed.`}
                        label="Remove"
                        confirmLabel="Remove"
                      />
                    ) : (
                      <span className="text-muted">In use</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
