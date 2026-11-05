"use client";

// A form whose submit asks for confirmation first. Used for deletes.
export function ConfirmForm({
  action,
  fields,
  message,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  message: string;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
        {label}
      </button>
    </form>
  );
}
