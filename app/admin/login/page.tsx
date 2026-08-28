"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function AdminLogin() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold tracking-[-0.02em]">Admin</h1>
      <p className="mt-2 text-[14px] text-ink-2">Zugang nur für den Betreiber.</p>

      <form action={action} className="mt-6 space-y-3">
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Passwort"
          aria-label="Passwort"
          className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15px] outline-none transition-shadow focus:border-blue focus:ring-4 focus:ring-blue/15"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {pending ? "Moment…" : "Anmelden"}
        </button>
        {error && (
          <p className="rounded-xl bg-surface px-4 py-3 text-[13px] leading-relaxed">{error}</p>
        )}
      </form>
    </main>
  );
}
