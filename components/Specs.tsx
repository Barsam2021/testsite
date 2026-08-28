"use client";

import { GOAL } from "@/lib/spots";
import { useCurrency } from "./CurrencyContext";

const SPECS = [
  ["Chip", "Apple M5 — 10-core CPU, 10-core GPU, 16-core Neural Engine"],
  ["Memory", "32 GB unified"],
  ["Storage", "1 TB SSD"],
  ["Display", "14.2” Liquid Retina XDR, standard glass"],
  ["Keyboard", "Backlit Magic Keyboard with Touch ID"],
  ["In the box", "No power adapter"],
];

export function Specs() {
  const { money } = useCurrency();

  return (
    <section id="specs" className="scroll-mt-20 bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">
          What the money buys.
        </h2>
        <p className="mt-3 max-w-[60ch] text-ink-2">
          Here are the exact specs. About 21% of everything raised goes to French taxes before I buy
          anything lol, so the {money(GOAL)} is really covered around {money(3200)}. Anything above
          that supports my indie journey and the future trips the laptop and I will go on!
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-6 py-5">
            <h3 className="text-xl font-semibold">MacBook Pro 14”, Silver</h3>
            <span className="text-xl font-semibold tabular-nums">{money(GOAL)}</span>
          </div>
          <dl className="divide-y divide-hairline/60">
            {SPECS.map(([term, value]) => (
              <div key={term} className="flex flex-wrap gap-x-6 gap-y-1 px-6 py-3.5 text-[14px]">
                <dt className="w-28 shrink-0 text-ink-2">{term}</dt>
                <dd className="min-w-0 flex-1">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-4 max-w-[68ch] text-[13px] leading-relaxed text-ink-2">
          Priced in euros at Apple France, which is where I&rsquo;m buying it. Dollar figures on this
          page are that euro price converted (Apple&rsquo;s own US price looks lower because it
          excludes sales tax). Anything raised past the goal pays for the trips the Mac goes on.{" "}
          <a
            href="https://www.apple.com/fr/shop/buy-mac/macbook-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue hover:underline"
          >
            Check the price at Apple
          </a>
          .
        </p>
      </div>
    </section>
  );
}
