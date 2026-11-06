"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Tone = "ok" | "error";
type ToastItem = { id: number; message: string; tone: Tone };
type ShowToast = (message: string, tone?: Tone) => void;

const TOAST_MS = 4000;
const ToastContext = createContext<ShowToast | null>(null);

// Call from any Admin client component: show("Post saved.") or show("Could not save.", "error").
export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside ToastProvider.");
  return show;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const show = useCallback<ShowToast>((message, tone = "ok") => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Suspense fallback={null}>
        <UrlNotice />
      </Suspense>
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 left-4 z-50 flex flex-col items-end gap-2 sm:left-auto"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`toast pointer-events-auto sm:max-w-sm ${toast.tone === "error" ? "toast-error" : ""}`}
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: toast.tone === "error" ? "var(--danger)" : "var(--accent-2)" }}
            />
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Server Actions redirect with ?notice=...&tone=error. This turns that into a toast
// and removes the parameters, so a refresh does not show it again.
function UrlNotice() {
  const show = useToast();
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const notice = params.get("notice");
    if (!notice) return;
    show(notice, params.get("tone") === "error" ? "error" : "ok");

    const rest = new URLSearchParams(params);
    rest.delete("notice");
    rest.delete("tone");
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, pathname, router, show]);

  return null;
}
