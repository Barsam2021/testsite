"use client";

import { useState } from "react";

export function Waitlist() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, handle }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="waitlist" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl border border-hairline bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.015em] sm:text-3xl">
            Want to do this with your own laptop?
          </h2>
          <p className="mt-3 max-w-[58ch] leading-relaxed text-ink-2">
            You set your machine and your prices; the sticker spots, the auction, and everything else
            is handled for you.
          </p>

          <div className="mt-6">
            {status === "done" ? (
              <p className="rounded-xl bg-surface px-4 py-3 text-[15px]">
                You&rsquo;re on the list. One email when it opens.
              </p>
            ) : (
              <form className="space-y-3" onSubmit={submit}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your email"
                    autoComplete="email"
                    aria-label="Email"
                    className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink-2/70 focus:border-blue focus:ring-4 focus:ring-blue/15"
                  />
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="your X/Twitter handle (optional)"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-label="X handle, optional"
                    className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink-2/70 focus:border-blue focus:ring-4 focus:ring-blue/15"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-full bg-blue px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-60 sm:w-auto sm:px-8"
                >
                  {status === "sending" ? "One second…" : "Join the waitlist"}
                </button>
                {status === "error" && (
                  <p className="text-[13px] text-ink-2">
                    That didn&rsquo;t go through. Try again in a moment.
                  </p>
                )}
              </form>
            )}
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-ink-2">
            One email when it opens, nothing else.
          </p>
        </div>
      </div>
    </section>
  );
}
