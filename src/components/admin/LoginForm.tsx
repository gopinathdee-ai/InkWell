"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

const inputClass =
  "field px-3 py-2 text-sm outline-none focus:border-accent";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, null);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input name="email" type="email" autoComplete="username" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
