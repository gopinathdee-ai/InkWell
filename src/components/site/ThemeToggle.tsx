"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

// False on the server and during hydration, true after the page has mounted.
const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(subscribe, () => true, () => false);

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="btn btn-icon text-base leading-none"
    >
      {mounted ? (isDark ? "☀" : "☾") : ""}
    </button>
  );
}
