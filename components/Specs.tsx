"use client";

import type { Settings } from "@/lib/auction";
import { useCurrency } from "./Currency";

export function Specs({ settings }: { settings: Settings }) {
  const { money } = useCurrency();
  const specs = Array.isArray(settings.device_specs) ? settings.device_specs : [];

  return (
    <section id="specs" className="scroll-mt-20 bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">
          What the money buys.
        </h2>
        {settings.device_note && (
          <p className="mt-3 max-w-[60ch] text-ink-2">{settings.device_note}</p>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-6 py-5">
            <h3 className="text-xl font-semibold">{settings.device_name}</h3>
            <span className="text-xl font-semibold tabular-nums">{money(settings.goal_cents)}</span>
          </div>
          {specs.length > 0 && (
            <dl className="divide-y divide-hairline/60">
              {specs.map(([term, value]) => (
                <div key={term} className="flex flex-wrap gap-x-6 gap-y-1 px-6 py-3.5 text-[14px]">
                  <dt className="w-28 shrink-0 text-ink-2">{term}</dt>
                  <dd className="min-w-0 flex-1">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {settings.device_url && (
          <p className="mt-4 text-[13px] leading-relaxed text-ink-2">
            <a
              href={settings.device_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue hover:underline"
            >
              Check the price
            </a>
            .
          </p>
        )}
      </div>
    </section>
  );
}
