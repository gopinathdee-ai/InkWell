"use client";

import { useRef } from "react";

// A destructive action behind a styled confirmation dialog, instead of the browser's alert.
export function ConfirmForm({
  action,
  fields,
  title,
  message,
  label,
  confirmLabel = "Delete",
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  title: string;
  message: string;
  label: string;
  confirmLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="text-red-600 hover:underline dark:text-red-400"
      >
        {label}
      </button>
      <dialog ref={dialog} className="confirm-dialog" aria-labelledby="confirm-title">
        <form action={action} className="flex flex-col gap-6 p-6">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <div>
            <h2 id="confirm-title" className="text-lg font-bold tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm text-muted">{message}</p>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn" onClick={() => dialog.current?.close()}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              {confirmLabel}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
