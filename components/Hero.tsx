"use client";

import type { BoardSpot, Settings } from "@/lib/auction";
import { useCurrency } from "./Currency";
import { Countdown } from "./Countdown";
import { Lid } from "./Lid";

export function Hero({
  settings,
  spots,
  raisedCents,
  onBid,
}: {
  settings: Settings;
  spots: BoardSpot[];
  raisedCents: number;
  onBid: (s: BoardSpot) => void;
}) {
  const { money } = useCurrency();
  const percent = settings.goal_cents > 0 ? Math.round((raisedCents / settings.goal_cents) * 100) : 0;
  const passed = raisedCents >= settings.goal_cents;
  const closed = Boolean(settings.closed_at);

  return (
    <header className="mx-auto max-w-5xl px-6 pt-12 pb-16 text-center md:pt-16">
      <h1 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.05] tracking-[-0.06em]">
        {settings.headline}
      </h1>
      <p className="mx-auto mt-4 max-w-[62ch] text-[12px] leading-relaxed text-ink-2 sm:text-[16px]">
        {settings.subheadline}
      </p>

      <div className="mx-auto mt-8 max-w-[17rem] sm:max-w-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-semibold tabular-nums text-green sm:text-2xl">
            {money(raisedCents)}
            <span className="ml-1.5 text-[13px] font-normal text-ink-2 sm:ml-2 sm:text-sm">raised</span>
          </span>
          <span className="text-[13px] text-ink-2 sm:text-sm">
            {passed ? "goal passed · " : `of ${money(settings.goal_cents)} · `}
            <strong className="font-medium tabular-nums text-green">{percent}%</strong>
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
            className="h-full rounded-full bg-apple-green transition-[width] duration-500"
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>

        <p className="mt-2 text-[12px] text-ink-2">
          Auction <Countdown endsAt={settings.auction_ends_at} closed={closed} />
          {!closed && " · you can still outbid any spot"}
        </p>
      </div>

      <Lid spots={spots} onBid={onBid} closed={closed} />

      <p className="mt-8 text-[13px] text-ink-2">
        {closed ? "The auction has ended." : "Tap any spot to place a bid."}
      </p>

      {!closed && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
      )}
    </header>
  );
}
