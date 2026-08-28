import type { ReactNode } from "react";
import { Wordmark } from "./Wordmark";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-hairline/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-13 max-w-6xl items-center px-6 py-3">
          <a href="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em]">
            <Wordmark className="h-7 w-auto" />
            Brand My Mac
          </a>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h1 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">{title}</h1>
        <div className="mt-8 space-y-4 leading-relaxed text-ink-2">{children}</div>
        <p className="mt-12 text-[13px]">
          <a href="/" className="text-blue hover:underline">
            ← Back to the auction
          </a>
        </p>
      </main>
    </>
  );
}
