"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkAdminCredentials, requireAdmin, sessionCookieOptions } from "@/lib/auth";
import {
  deletePost,
  deleteUnusedTag,
  savePost,
  setPostStatus,
  type PostStatus,
  type SaveInput,
  type SaveResult,
} from "@/lib/db/admin";
import { htmlToText, sanitizePostHtml } from "@/lib/content";
import { normalizeBrandFont, BRAND_FONT_KEY } from "@/lib/brand-fonts";
import { ABOUT_KEY, AUTHOR_NAME_KEY, SITE_NAME_KEY, setSetting } from "@/lib/db/settings";
import { SESSION_COOKIE, createSessionToken } from "@/lib/session";

// Login is the only Server Action that does not call requireAdmin(): the caller
// is not signed in yet. Every other action checks the session first.

export type LoginState = { error: string } | null;

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await checkAdminCredentials(email, password);
  if (!result.configured) {
    return { error: "Admin sign-in is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH." };
  }
  if (!result.ok) return { error: "Email or password is incorrect." };

  const token = await createSessionToken(result.email);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions());
  redirect("/admin");
}

export async function logout() {
  await requireAdmin();
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// Used by the editor's auto-save and Save buttons.
export async function savePostAction(input: SaveInput): Promise<SaveResult> {
  await requireAdmin();
  const result = await savePost(input);
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

// Used by the dashboard's publish and unpublish buttons.
export async function setPostStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status: PostStatus = formData.get("status") === "published" ? "published" : "draft";
  const result = await setPostStatus(id, status);
  if (!result.ok) redirect(`/admin?notice=${encodeURIComponent(result.error)}&tone=error`);
  revalidatePath("/", "layout");
  redirect(`/admin?notice=${encodeURIComponent(status === "published" ? "Post published." : "Post unpublished.")}`);
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  await deletePost(String(formData.get("id") ?? ""));
  revalidatePath("/", "layout");
  redirect("/admin?notice=Post%20deleted.");
}

export async function deleteTagAction(formData: FormData) {
  await requireAdmin();
  const removed = await deleteUnusedTag(String(formData.get("id") ?? ""));
  if (!removed) redirect("/admin/tags?notice=That%20tag%20is%20still%20used%20by%20a%20post.&tone=error");
  revalidatePath("/", "layout");
  redirect("/admin/tags?notice=Tag%20removed.");
}

// Used by the Settings page.
export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const siteName = String(formData.get("siteName") ?? "").trim().slice(0, 60);
  const authorName = String(formData.get("authorName") ?? "").trim().slice(0, 80);
  const aboutRaw = String(formData.get("aboutBlogger") ?? "");
  const aboutBlogger = htmlToText(aboutRaw) ? sanitizePostHtml(aboutRaw) : "";
  if (!siteName) redirect(`/admin/settings?notice=${encodeURIComponent("Enter a blog name.")}&tone=error`);
  if (!authorName) redirect(`/admin/settings?notice=${encodeURIComponent("Enter an author name.")}&tone=error`);
  await setSetting(SITE_NAME_KEY, siteName);
  await setSetting(BRAND_FONT_KEY, normalizeBrandFont(String(formData.get("brandFont") ?? "")));
  await setSetting(AUTHOR_NAME_KEY, authorName);
  await setSetting(ABOUT_KEY, aboutBlogger);
  revalidatePath("/", "layout");
  redirect("/admin/settings?notice=Settings%20saved.");
}
