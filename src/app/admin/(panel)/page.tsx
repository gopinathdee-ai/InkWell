import Link from "next/link";
import { deletePostAction, setPostStatusAction } from "@/app/admin/actions";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { requireAdmin } from "@/lib/auth";
import { listAdminPosts } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

const actionClass = "text-sm font-medium text-muted hover:text-accent";

export default async function PostsDashboard() {
  await requireAdmin();
  const posts = await listAdminPosts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="btn btn-primary"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted">No posts yet. Create your first post.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg glass">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Tags</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/posts/${post.id}`} className="font-semibold hover:text-accent">
                      {post.title}
                    </Link>
                    <div className="text-xs text-muted">/posts/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        post.status === "published"
                          ? "bg-accent/15 text-accent"
                          : "bg-border text-muted"
                      }`}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {post.tags.map((tag) => tag.name).join(", ") || "None"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {post.updatedAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <Link href={`/admin/posts/${post.id}`} className={actionClass}>Edit</Link>
                      <Link href={`/admin/posts/${post.id}/preview`} target="_blank" className={actionClass}>
                        Preview
                      </Link>
                      <form action={setPostStatusAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={post.status === "published" ? "draft" : "published"}
                        />
                        <button type="submit" className={actionClass}>
                          {post.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <ConfirmForm
                        action={deletePostAction}
                        fields={{ id: post.id }}
                        title="Delete this post?"
                        message={`"${post.title}" will be permanently deleted. This cannot be undone.`}
                        label="Delete"
                      />
                    </div>
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
