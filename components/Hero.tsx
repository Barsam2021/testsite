"use client";

import { GOAL, RAISED, VISITORS, type Spot } from "@/lib/spots";
import { formatCount } from "@/lib/format";
import { useCurrency } from "./CurrencyContext";
import { Countdown } from "./Countdown";
import { Lid } from "./Lid";

const GOAL_TOOLTIP =
  "The Mac is 2 529 €. About 21% of everything raised goes to French taxes before I buy anything lol, so it's really covered around 3 200 €. Anything above that supports my indie journey and the future trips the laptop and I will go on!";

export function Hero({ onBid }: { onBid: (s: Spot) => void }) {
  const { money } = useCurrency();
  const percent = Math.round((RAISED / GOAL) * 100);
  const passed = RAISED >= GOAL;

  return (
    <header className="mx-auto max-w-5xl px-6 pt-12 pb-16 text-center md:pt-16">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <p className="text-[13px] text-ink-2">
          <strong className="font-medium tabular-nums text-ink">{formatCount(VISITORS)}</strong>{" "}
          visitors so far
        </p>
      </div>

      <h1 className="mt-5 text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.05] tracking-[-0.06em]">
        Your brand, on my Mac.
      </h1>
      <p className="mx-auto mt-4 max-w-[62ch] text-[12px] leading-relaxed text-ink-2 sm:text-[16px]">
        Your logo travels with me on a founder&rsquo;s best friend: the MacBook.
      </p>

      <div className="mx-auto mt-8 max-w-[17rem] sm:max-w-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-semibold tabular-nums text-green sm:text-2xl">
            {money(RAISED)}
            <span className="ml-1.5 text-[13px] font-normal text-ink-2 sm:ml-2 sm:text-sm">
              raised
            </span>
          </span>
          <span className="text-[13px] text-ink-2 sm:text-sm">
            <span
              title={GOAL_TOOLTIP}
              className="cursor-help underline decoration-hairline decoration-dotted underline-offset-4"
            >
              {passed ? "goal passed · " : "of goal · "}
              <strong className="font-medium tabular-nums text-green">{percent}%</strong>
            </span>
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={Math.min(100, percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Funding progress"
          className="mt-2 h-2 overflow-hidden rounded-full bg-hairline/60 ring-1 ring-black/[0.06] ring-inset"
        >
          <div
            className="h-full rounded-full bg-apple-green"
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>

        <p className="mt-2 text-[12px] text-ink-2">
          Auction <Countdown /> · you can still outbid any spot
        </p>
      </div>

      <Lid onBid={onBid} />

      <p className="mt-8 text-[13px] text-ink-2">Tap any spot to place a bid.</p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="mx-auto max-w-[58ch] leading-relaxed text-ink-2">
          I&rsquo;m financing my first MacBook by selling the one surface everyone sees: the lid.
          Caf&eacute;s, coworking spaces, events&hellip; get your brand in the outside world
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#spots"
            className="rounded-full bg-blue px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Get a spot
          </a>
          <a href="#how" className="text-[15px] text-blue hover:underline">
            How it works ›
          </a>
        </div>
      </div>
    </header>
  );
}
