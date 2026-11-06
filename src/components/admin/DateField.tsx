"use client";

import { useEffect, useRef, useState } from "react";

// A date field with a calendar panel. The value is YYYY-MM-DD, or empty.
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const PANEL_HEIGHT = 380;
const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayIso = () => new Date().toISOString().slice(0, 10);

function parse(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) } : null;
}

export function DateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"up" | "down">("down");
  const [view, setView] = useState(() => {
    const base = parse(value) ?? parse(todayIso())!;
    return { y: base.y, m: base.m };
  });
  const wrapper = useRef<HTMLDivElement>(null);

  // Close on a click outside the field, or on Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openPanel = () => {
    const selected = parse(value);
    if (selected) setView({ y: selected.y, m: selected.m });
    // Open upward when there is not enough room below the field.
    const rect = wrapper.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setPlacement(spaceBelow < PANEL_HEIGHT && spaceAbove > spaceBelow ? "up" : "down");
    }
    setOpen((current) => !current);
  };

  const selected = parse(value);
  const firstWeekday = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const monthLabel = new Date(Date.UTC(view.y, view.m, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const today = todayIso();

  const moveMonth = (delta: number) => {
    const next = new Date(Date.UTC(view.y, view.m + delta, 1));
    setView({ y: next.getUTCFullYear(), m: next.getUTCMonth() });
  };
  const pick = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  return (
    <div ref={wrapper} className="relative">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="YYYY-MM-DD"
          inputMode="numeric"
          className="field px-2.5 py-2 text-sm"
        />
        <button
          type="button"
          aria-label="Open calendar"
          aria-expanded={open}
          onClick={openPanel}
          className="btn shrink-0"
          style={{ width: "2.5rem", height: "2.5rem", padding: 0 }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ width: 18, height: 18, flexShrink: 0 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          className={`popover absolute left-0 z-30 w-72 rounded-2xl p-4 ${
            placement === "up" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous year" className="btn btn-icon" onClick={() => moveMonth(-12)}>
                «
              </button>
              <button type="button" aria-label="Previous month" className="btn btn-icon" onClick={() => moveMonth(-1)}>
                ‹
              </button>
            </div>
            <span className="whitespace-nowrap text-sm font-semibold">{monthLabel}</span>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Next month" className="btn btn-icon" onClick={() => moveMonth(1)}>
                ›
              </button>
              <button type="button" aria-label="Next year" className="btn btn-icon" onClick={() => moveMonth(12)}>
                »
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center">
            {WEEKDAYS.map((day) => (
              <span key={day} className="label py-1 text-[0.65rem]">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) return <span key={`blank-${index}`} />;
              const iso = toIso(view.y, view.m, day);
              const isSelected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pick(iso)}
                  aria-pressed={isSelected}
                  className={`h-9 rounded-full text-sm transition-colors ${
                    isSelected
                      ? "bg-accent font-semibold text-on-accent"
                      : isToday
                        ? "border border-accent text-accent"
                        : "hover:bg-accent/15"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button type="button" className="btn" onClick={() => pick("")}>
              Clear
            </button>
            <button type="button" className="btn btn-primary" onClick={() => pick(today)}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
