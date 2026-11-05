import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { requireAdmin } from "@/lib/auth";
import { getAdminPost, listTagsWithCounts } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage(props: PageProps<"/admin/posts/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  const [post, tags] = await Promise.all([getAdminPost(id), listTagsWithCounts()]);
  if (!post) notFound();
  return <PostEditor post={post} tagSuggestions={tags.map((t) => t.name)} />;
}
