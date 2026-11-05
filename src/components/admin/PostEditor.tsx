"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { savePostAction } from "@/app/admin/actions";
import { editorInitialFrom, type EditorInitial } from "@/lib/admin-editor";
import type { PostStatus, SaveResult } from "@/lib/db/admin";
import type { PostWithTags } from "@/lib/db/queries";
import { slugify } from "@/lib/slug";
import { RichEditor } from "./RichEditor";
import { TagInput } from "./TagInput";
import { uploadImage } from "./upload";

const AUTOSAVE_MS = 2000;

type SaveState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "saving" }
  | { kind: "saved"; at: string }
  | { kind: "error"; message: string };

const inputClass =
  "w-full field px-2.5 py-2 text-sm outline-none focus:border-accent";
const buttonClass =
  "btn disabled:opacity-50";

export function PostEditor({
  post,
  tagSuggestions,
  notice,
}: {
  post: PostWithTags | null;
  tagSuggestions: string[];
  notice?: string;
}) {
  const initial = editorInitialFrom(post);
  const [form, setForm] = useState<EditorInitial>(initial);
  const [postId, setPostId] = useState<string | null>(initial.id);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Refs hold the latest values for timers and queued saves.
  const formRef = useRef(form);
  const idRef = useRef(postId);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const queue = useRef<Promise<void>>(Promise.resolve());

  const applyPatch = (patch: Partial<EditorInitial>) => {
    formRef.current = { ...formRef.current, ...patch };
    setForm(formRef.current);
  };

  // Saves run one at a time. Each run reads the latest form, so a queued save never
  // sends stale data. The first save of a new post creates it.
  const saveNow = useCallback((status?: PostStatus) => {
    clearTimeout(timer.current);
    queue.current = queue.current.then(async () => {
      const snapshot = status ? { ...formRef.current, status } : formRef.current;
      setSave({ kind: "saving" });

      let result: SaveResult;
      try {
        result = await savePostAction({ ...snapshot, id: idRef.current });
      } catch {
        setSave({ kind: "error", message: "Could not save. Check your connection." });
        return;
      }
      if (!result.ok) {
        setSave({ kind: "error", message: result.error });
        return;
      }

      if (!idRef.current) {
        idRef.current = result.id;
        setPostId(result.id);
        window.history.replaceState(null, "", `/admin/posts/${result.id}`);
      }
      applyPatch({
        status: result.status,
        ...(formRef.current.slugAuto ? { slug: result.slug } : {}),
      });
      setSave({ kind: "saved", at: result.savedAt });
    });
    return queue.current;
  }, []);

  const update = (patch: Partial<EditorInitial>) => {
    const next = { ...formRef.current, ...patch };
    if (patch.title !== undefined && next.slugAuto) next.slug = slugify(patch.title);
    formRef.current = next;
    setForm(next);
    setSave({ kind: "pending" });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void saveNow(), AUTOSAVE_MS);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const uploadCover = async (file: File) => {
    setCoverError(null);
    setCoverBusy(true);
    const result = await uploadImage(file);
    setCoverBusy(false);
    if ("error" in result) {
      setCoverError(result.error);
      return;
    }
    update({
      coverImageUrl: result.url,
      coverImageAlt: formRef.current.coverImageAlt || formRef.current.title,
    });
  };

  const canPublish = Boolean(form.coverImageUrl);
  const isPublished = form.status === "published";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-muted hover:text-foreground">
            ← Posts
          </Link>
          <SaveStatus state={save} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {postId && (
            <Link href={`/admin/posts/${postId}/preview`} target="_blank" className={buttonClass}>
              Preview
            </Link>
          )}
          <button type="button" className={buttonClass} onClick={() => void saveNow()}>
            Save
          </button>
          {isPublished ? (
            <button type="button" className={buttonClass} onClick={() => void saveNow("draft")}>
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary disabled:opacity-50"
              disabled={!canPublish}
              title={canPublish ? "Publish this post" : "Add a cover image to publish"}
              onClick={() => void saveNow("published")}
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {(notice || editorError) && (
        <p role="alert" className="rounded glass px-4 py-2 text-sm">
          {notice ?? editorError}
        </p>
      )}
      {!canPublish && !isPublished && (
        <p className="text-xs text-muted">A cover image is required before the post can be published.</p>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="mx-auto flex w-full min-w-0 max-w-[46rem] flex-col gap-4">
          <input
            aria-label="Post title"
            value={form.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Post title"
            className="w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none placeholder:text-muted"
          />
          <RichEditor
            initialHtml={initial.contentHtml}
            onChange={(html) => update({ contentHtml: html })}
            onError={setEditorError}
          />
        </div>

        <aside className="flex flex-col gap-6 text-sm">
          <Section title="Cover image">
            <div className="relative aspect-[16/10] overflow-hidden rounded glass">
              {form.coverImageUrl ? (
                <Image
                  src={form.coverImageUrl}
                  alt={form.coverImageAlt || form.title}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent to-accent-2 text-xs font-semibold text-on-accent">
                  No cover yet
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className={`${buttonClass} cursor-pointer ${coverBusy ? "opacity-50" : ""}`}>
                {coverBusy ? "Uploading..." : form.coverImageUrl ? "Replace" : "Upload"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={coverBusy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadCover(file);
                  }}
                />
              </label>
              {form.coverImageUrl && (
                <button type="button" className={buttonClass} onClick={() => update({ coverImageUrl: null })}>
                  Remove
                </button>
              )}
            </div>
            {coverError && <p className="text-xs text-red-600 dark:text-red-400">{coverError}</p>}
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Alt text
              <input
                value={form.coverImageAlt}
                onChange={(event) => update({ coverImageAlt: event.target.value })}
                placeholder="Describe the image"
                className={inputClass}
              />
            </label>
          </Section>

          <Section title="Tags">
            <TagInput
              value={form.tagNames}
              suggestions={tagSuggestions}
              onChange={(tagNames) => update({ tagNames })}
            />
          </Section>

          <Section title="Slug">
            <input
              value={form.slug}
              onChange={(event) => update({ slug: event.target.value, slugAuto: false })}
              className={inputClass}
            />
            <p className="text-xs text-muted">/posts/{form.slug || "..."}</p>
          </Section>

          <Section title="Excerpt">
            <textarea
              value={form.excerpt}
              onChange={(event) => update({ excerpt: event.target.value })}
              rows={3}
              maxLength={300}
              placeholder="Leave empty to use the start of the post"
              className={inputClass}
            />
          </Section>

          <Section title="SEO">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Meta title
              <input
                value={form.metaTitle}
                onChange={(event) => update({ metaTitle: event.target.value })}
                placeholder={form.title || "Defaults to the post title"}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Meta description
              <textarea
                value={form.metaDescription}
                onChange={(event) => update({ metaDescription: event.target.value })}
                rows={2}
                maxLength={300}
                placeholder="Defaults to the excerpt"
                className={inputClass}
              />
            </label>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="label">{title}</h2>
      {children}
    </section>
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  switch (state.kind) {
    case "pending":
      return <span className="text-xs text-muted">Unsaved changes</span>;
    case "saving":
      return <span className="text-xs text-muted">Saving...</span>;
    case "saved":
      return (
        <span className="text-xs text-muted">
          Saved {new Date(state.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      );
    case "error":
      return <span className="text-xs text-red-600 dark:text-red-400">{state.message}</span>;
    default:
      return null;
  }
}
