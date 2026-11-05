"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { uploadImage } from "./upload";

type Props = {
  initialHtml: string;
  onChange: (html: string) => void;
  onError: (message: string) => void;
};

const isImage = (file: File) => file.type.startsWith("image/");

// Each icon is a 24px outline icon drawn with stroke="currentColor".
const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const icons = {
  paragraph: (
    <svg {...iconProps}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
  heading2: (
    <svg {...iconProps}>
      <path d="M4 12h8M4 18V6M12 18V6M17 12a2 2 0 1 1 4 0c0 .6-.4 1-1 1.5L17 18h4" />
    </svg>
  ),
  heading3: (
    <svg {...iconProps}>
      <path d="M4 12h8M4 18V6M12 18V6M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2 2 2 0 0 1 2 2c0 1.5-1.8 2.5-3.5 1.5" />
    </svg>
  ),
  bold: (
    <svg {...iconProps}>
      <path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />
    </svg>
  ),
  italic: (
    <svg {...iconProps}>
      <path d="M19 4h-9M14 20H5M15 4 9 20" />
    </svg>
  ),
  bulletList: (
    <svg {...iconProps}>
      <path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  ),
  numberedList: (
    <svg {...iconProps}>
      <path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M4 18H6c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  ),
  quote: (
    <svg {...iconProps}>
      <path d="M4 5v14M9 8h11M9 12h11M9 16h7" />
    </svg>
  ),
  code: (
    <svg {...iconProps}>
      <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  ),
  link: (
    <svg {...iconProps}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  rule: (
    <svg {...iconProps}>
      <path d="M3 12h18" />
    </svg>
  ),
  image: (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
    </svg>
  ),
};

// Icon button. The label is used as the tooltip and the accessible name.
function ToolButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded border disabled:opacity-50 ${
        active
          ? "border-accent bg-accent text-on-accent"
          : "border-border text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />;

export function RichEditor({ initialHtml, onChange, onError }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const insertRef = useRef<(files: File[]) => Promise<void>>(async () => {});
  const [uploading, setUploading] = useState(false);

  const insertImages = async (files: File[]) => {
    setUploading(true);
    for (const file of files) {
      const result = await uploadImage(file);
      if ("error" in result) {
        onError(result.error);
        continue;
      }
      const suggested = file.name.replace(/\.[^.]+$/, "");
      const alt = window.prompt("Alt text for this image (describe it for screen readers):", suggested);
      if (alt === null) continue;
      editorRef.current?.chain().focus().setImage({ src: result.url, alt: alt.trim() }).run();
    }
    setUploading(false);
  };

  // Paste and drop handlers are created once, so they call the latest version through this ref.
  useEffect(() => {
    insertRef.current = insertImages;
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: "Start writing your post..." }),
    ],
    content: initialHtml,
    onCreate: ({ editor: created }) => {
      editorRef.current = created;
    },
    onUpdate: ({ editor: updated }) => onChange(updated.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-article min-h-[50vh] max-w-none focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter(isImage);
        if (files.length === 0) return false;
        event.preventDefault();
        void insertRef.current(files);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter(isImage);
        if (files.length === 0) return false;
        event.preventDefault();
        void insertRef.current(files);
        return true;
      },
    },
  });

  if (!editor) return <div className="min-h-[50vh]" />;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (leave empty to remove):", previous ?? "https://");
    if (url === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (url.trim() === "") chain.unsetLink().run();
    else chain.setLink({ href: url.trim() }).run();
  };

  return (
    <div className="flex flex-col rounded-lg glass focus-within:border-accent">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1.5 rounded-t-lg border-b border-border bg-card px-3 py-2">
        <ToolButton label="Normal text" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
          {icons.paragraph}
        </ToolButton>
        <Divider />
        <ToolButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          {icons.heading2}
        </ToolButton>
        <ToolButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          {icons.heading3}
        </ToolButton>
        <Divider />
        <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          {icons.bold}
        </ToolButton>
        <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          {icons.italic}
        </ToolButton>
        <Divider />
        <ToolButton label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          {icons.bulletList}
        </ToolButton>
        <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          {icons.numberedList}
        </ToolButton>
        <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          {icons.quote}
        </ToolButton>
        <ToolButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          {icons.code}
        </ToolButton>
        <ToolButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          {icons.link}
        </ToolButton>
        <ToolButton label="Divider line" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          {icons.rule}
        </ToolButton>
        <Divider />
        <ToolButton label={uploading ? "Uploading image" : "Insert image"} disabled={uploading} onClick={() => fileInput.current?.click()}>
          {icons.image}
        </ToolButton>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            void insertImages(files);
          }}
        />
      </div>
      <div className="px-5 py-4" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
