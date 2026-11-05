"use client";

import { useState } from "react";
import { slugify } from "@/lib/slug";

// Tags are confirmed with Enter or a comma. Existing tags are suggested;
// new names are created when the post is saved.
export function TagInput({
  value,
  suggestions,
  onChange,
}: {
  value: string[];
  suggestions: string[];
  onChange: (names: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const selected = new Set(value.map((name) => slugify(name)));
  const query = draft.trim().toLowerCase();
  const matches = suggestions
    .filter((name) => !selected.has(slugify(name)))
    .filter((name) => !query || name.toLowerCase().includes(query))
    .slice(0, 8);

  const add = (raw: string) => {
    const name = raw.trim().replace(/,$/, "").trim();
    setDraft("");
    if (!name || selected.has(slugify(name))) return;
    onChange([...value, name]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((name) => (
          <span key={name} className="flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs">
            {name}
            <button
              type="button"
              aria-label={`Remove ${name}`}
              className="text-muted hover:text-foreground"
              onClick={() => onChange(value.filter((n) => n !== name))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(event) => {
          const next = event.target.value;
          if (next.endsWith(",")) add(next);
          else setDraft(next);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add(draft);
          } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder="Type a tag and press Enter"
        className="field px-2 py-1.5 text-sm outline-none focus:border-accent"
      />
      {matches.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {matches.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => add(name)}
              className="rounded-full bg-border/60 px-2.5 py-0.5 text-xs text-muted hover:text-foreground"
            >
              + {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
