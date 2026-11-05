import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/site/PostArticle";
import { requireAdmin } from "@/lib/auth";
import { getAdminPost } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Preview", robots: { index: false } };

// Renders the post with the public template, including drafts. Admin only.
export default async function PreviewPage(props: PageProps<"/admin/posts/[id]/preview">) {
  await requireAdmin();
  const { id } = await props.params;
  const post = await getAdminPost(id);
  if (!post) notFound();

  return (
    <>
      <div className="bg-accent px-6 py-2 text-center text-sm font-semibold text-on-accent">
        Preview{post.status === "draft" ? " of a draft. Readers cannot see this yet." : "."}
      </div>
      <PostArticle post={post} />
    </>
  );
}
