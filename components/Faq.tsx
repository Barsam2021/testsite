import type { ReactNode } from "react";
import type { Settings } from "@/lib/auction";
import { formatCents } from "@/lib/money";

export function Faq({ settings }: { settings: Settings }) {
  const deposit = `${settings.deposit_bps / 100}%`;
  const minDeposit = formatCents(settings.min_deposit_cents, settings.currency);
  const increment = formatCents(settings.min_increment_cents, settings.currency);

  const items: { q: string; a: ReactNode }[] = [
    {
      q: "Is this real?",
      a: (
        <p className="leading-relaxed text-ink-2">
          Completely. The machine is real, the stickers are real vinyl, and it travels with me and
          gets worked on in public. The only fictional thing is the idea that a laptop lid
          isn&rsquo;t premium ad inventory.
        </p>
      ),
    },
    {
      q: "How does payment work?",
      a: (
        <p className="leading-relaxed text-ink-2">
          Bidding takes a {deposit} deposit (minimum {minDeposit}), charged to your card the moment
          you bid. If you get outbid or your brand isn&rsquo;t approved, it comes back in full,
          automatically. If you win, it counts toward the price and I send a payment link for the
          remainder.
        </p>
      ),
    },
    {
      q: "What if someone outbids me?",
      a: (
        <p className="leading-relaxed text-ink-2">
          You get an honorable mention in the bid history, your deposit is refunded in full, and you
          can swing back. Outbids need to beat the current bid by at least {increment}.
        </p>
      ),
    },
    {
      q: "What do I actually get?",
      a: (
        <>
          <p className="leading-relaxed text-ink-2">
            Your brand showing up both online and in the real world:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-ink-2">
            <li>A die-cut vinyl sticker of your logo on the lid — visible wherever I work</li>
            <li>A spot on this page with a link to your site</li>
          </ul>
          <p className="mt-3 leading-relaxed text-ink-2">
            I can&rsquo;t promise you impressions or ROI, just that it goes where I go.
          </p>
        </>
      ),
    },
    {
      q: "Can any brand join?",
      a: (
        <p className="leading-relaxed text-ink-2">
          Almost. Every sponsor is approved by hand before anything appears, and I keep the final say
          on what goes on the lid — it travels with me, after all. If your bid is refused, your
          deposit comes back in full. That is why a new top bid shows as &ldquo;under review&rdquo;
          before it takes over a spot.
        </p>
      ),
    },
    {
      q: "When does it end?",
      a: (
        <p className="leading-relaxed text-ink-2">
          At the time on the countdown. Whoever holds a spot when it hits zero keeps it, and I get in
          touch about the remainder and the artwork.
        </p>
      ),
    },
  ];

  return (
    <section id="faq" className="scroll-mt-20 bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">
          Questions &amp; Answers
        </h2>
        <div className="mt-8 divide-y divide-hairline/70">
          {items.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-ink-2 transition-transform duration-300 ease-out group-open:rotate-45"
                >
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </summary>
              <div className="max-w-[62ch] pb-5">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
