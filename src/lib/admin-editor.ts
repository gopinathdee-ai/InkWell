import type { PostStatus } from "./db/admin";
import type { PostWithTags } from "./db/queries";

// Form state for the post editor. Shared by the server pages and the client editor.
export type EditorInitial = {
  id: string | null;
  title: string;
  slug: string;
  // True while the slug follows the title. Editing the slug turns this off.
  slugAuto: boolean;
  excerpt: string;
  contentHtml: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  tagNames: string[];
  status: PostStatus;
  // YYYY-MM-DD, or empty to use the date of first publication.
  publishedDate: string;
};

export function editorInitialFrom(post: PostWithTags | null): EditorInitial {
  if (!post) {
    return {
      id: null,
      title: "",
      slug: "",
      slugAuto: true,
      excerpt: "",
      contentHtml: "",
      coverImageUrl: null,
      coverImageAlt: "",
      metaTitle: "",
      metaDescription: "",
      tagNames: [],
      status: "draft",
      publishedDate: "",
    };
  }
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    slugAuto: false,
    excerpt: post.excerpt,
    contentHtml: post.contentHtml,
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: post.coverImageAlt ?? "",
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    tagNames: post.tags.map((tag) => tag.name),
    status: post.status,
    publishedDate: post.publishedAt ? post.publishedAt.toISOString().slice(0, 10) : "",
  };
}
