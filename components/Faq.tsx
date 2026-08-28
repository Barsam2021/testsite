import type { ReactNode } from "react";

const ITEMS: { q: string; a: ReactNode }[] = [
  {
    q: "Is this real?",
    a: (
      <p className="leading-relaxed text-ink-2">
        Completely. The MacBook is real (well, imminent), the stickers are real vinyl, and I will
        travel with it and work with it in public spaces. The only fictional thing is the idea that a
        laptop lid isn&rsquo;t premium ad inventory.
      </p>
    ),
  },
  {
    q: "Why this MacBook?",
    a: (
      <>
        <p className="leading-relaxed text-ink-2">
          In short: I need a new laptop + I&rsquo;m building for iOS = MacBook.
        </p>
        <p className="mt-3 leading-relaxed text-ink-2">
          I&rsquo;ve been indie hacking for a year and a half now, pretty limited by my old dying
          laptop whenever I wanted to go somewhere.
        </p>
        <p className="mt-3 leading-relaxed text-ink-2">
          I&rsquo;ve also started building mobile apps at the beginning of 2026, and building for iOS
          without a Mac is just the worst (still making some money from them right now). I&rsquo;d
          like to finally be able to build in Swift too.
        </p>
      </>
    ),
  },
  {
    q: "What do I actually get?",
    a: (
      <>
        <p className="leading-relaxed text-ink-2">
          Your brand showing up both on socials and in the real world:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-ink-2">
          <li>
            A die-cut vinyl sticker of your logo on the lid of the laptop = visible in public spaces
            + in my photos/vlogs
          </li>
          <li>A spot on this page with a link to your site</li>
        </ul>
        <p className="mt-3 leading-relaxed text-ink-2">
          I can&rsquo;t promise you impressions or ROI, just that it goes where I work and appears in
          some of the stuff I post.
        </p>
      </>
    ),
  },
  {
    q: "How does payment work?",
    a: (
      <p className="leading-relaxed text-ink-2">
        Bidding takes a 20% deposit (minimum 10 €), paid by card when you place the bid. If you
        don&rsquo;t win, it comes back in full, automatically. If you do, it counts toward the price
        and I send a payment link for the remainder. Bids are settled in euros; the dollar prices
        shown are indicative.
      </p>
    ),
  },
  {
    q: "What if someone outbids me?",
    a: (
      <p className="leading-relaxed text-ink-2">
        You get an honorable mention in the bid history and the chance to swing back. Outbids need to
        beat the current bid by at least 10 €.
      </p>
    ),
  },
  {
    q: "Can any brand join?",
    a: (
      <p className="leading-relaxed text-ink-2">
        Almost. Every sponsor is approved by hand before anything appears, and I keep the final say
        on what goes on the lid — it travels with me, after all. If your bid is refused, your deposit
        comes back in full.
      </p>
    ),
  },
  {
    q: "Why not just buy the MacBook?",
    a: (
      <p className="leading-relaxed text-ink-2">
        I&rsquo;ve been needing one for months, MRR is increasing but I&rsquo;m still far from being
        able to afford it at the moment. If this flops, I&rsquo;ll just keep waiting until the day I
        can get one, but you won&rsquo;t be on it then.
      </p>
    ),
  },
  {
    q: "Can I do this with my own laptop?",
    a: (
      <p className="leading-relaxed text-ink-2">
        That is the most asked question in the replies, so yes — I&rsquo;m building it. You set your
        machine and your prices; the sticker spots, the auction, and everything else is handled for
        you.{" "}
        <a href="#waitlist" className="text-blue hover:underline">
          Join the waitlist
        </a>
        .
      </p>
    ),
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">
          Questions &amp; Answers
        </h2>
        <div className="mt-8 divide-y divide-hairline/70">
          {ITEMS.map((item) => (
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
