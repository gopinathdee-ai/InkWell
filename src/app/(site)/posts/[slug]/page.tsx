import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PostArticle } from "@/components/site/PostArticle";
import { excerptOf } from "@/lib/content";
import { getPublishedPostBySlug } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

// Shared by generateMetadata and the page so the query runs once per request.
const loadPost = cache((slug: string) => getPublishedPostBySlug(slug));

export async function generateMetadata(props: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await loadPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || excerptOf(post),
  };
}

export default async function PostPage(props: PageProps<"/posts/[slug]">) {
  const { slug } = await props.params;
  const post = await loadPost(slug);
  if (!post) notFound();
  return <PostArticle post={post} />;
}
