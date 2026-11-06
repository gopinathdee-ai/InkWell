"use client";

import { useState } from "react";
import { RichEditor } from "./RichEditor";

// Rich text inside a plain form: the editor's HTML is sent in a hidden field.
export function RichTextField({ name, initialHtml }: { name: string; initialHtml: string }) {
  const [html, setHtml] = useState(initialHtml);
  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={html} />
      <RichEditor initialHtml={initialHtml} onChange={setHtml} />
    </div>
  );
}
