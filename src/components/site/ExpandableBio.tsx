"use client";

import { useState } from "react";

// Shows the start of a long bio and expands it in place.
export function ExpandableBio({ html, long }: { html: string; long: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`prose-compact text-muted ${long && !open ? "max-h-44 overflow-hidden" : ""}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {long && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="self-start text-sm font-semibold text-accent hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
