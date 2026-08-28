"use client";

import { useCurrency } from "./CurrencyContext";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "#spots", label: "Live auction" },
  { href: "#how", label: "How it works" },
  { href: "#specs", label: "The machine" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const { currency, setCurrency } = useCurrency();

  return (
    <nav className="sticky top-0 z-40 border-b border-hairline/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-6 py-3">
        <a href="#" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em]">
          <Wordmark className="h-7 w-auto" />
          Brand My Mac
        </a>

        <div className="hidden items-center gap-7 text-[13px] text-ink-2 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div
            role="group"
            aria-label="Display currency"
            className="flex rounded-full bg-hairline/50 p-0.5 text-[12px] font-medium"
          >
            {(["EUR", "USD"] as const).map((c) => {
              const active = currency === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCurrency(c)}
                  className={
                    "rounded-full px-2.5 py-1 transition-colors " +
                    (active
                      ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.14)] ring-1 ring-black/10"
                      : "text-ink-2 hover:text-ink")
                  }
                >
                  {c === "EUR" ? "€" : "$"}
                </button>
              );
            })}
          </div>

          <a
            href="#spots"
            className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
          >
            Get a spot
          </a>
        </div>
      </div>
    </nav>
  );
}
