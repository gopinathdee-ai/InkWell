import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/PostEditor";
import { requireAdmin } from "@/lib/auth";
import { listTagsWithCounts } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "New post" };

// The post is created on the first auto-save, so this page has no id yet.
export default async function NewPostPage() {
  await requireAdmin();
  const tags = await listTagsWithCounts();
  return <PostEditor post={null} tagSuggestions={tags.map((t) => t.name)} />;
}
