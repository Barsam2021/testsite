"use client";

import { useState } from "react";
import type { BoardSpot, Settings } from "@/lib/auction";
import type { HistoryRow } from "@/lib/public-data";
import { useCurrency } from "./Currency";
import { Countdown } from "./Countdown";

const SIZE_LABEL = { S: "Small", M: "Medium", L: "Large" } as const;

function ago(iso: string): string {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 60) return `${min}m ago`;
  if (min < 1440) return `${Math.floor(min / 60)}h ago`;
  return `${Math.floor(min / 1440)}d ago`;
}

function Holder({ spot }: { spot: BoardSpot }) {
  if (!spot.lead) return <span className="text-[13px] text-ink-2">&mdash;</span>;
  const { sponsor_name, sponsor_url, logo_url } = spot.lead;

  const inner = (
    <>
      {logo_url ? (
        <span className="relative flex h-8 w-24 shrink-0 items-center justify-center">
          <img src={logo_url} alt="" className="absolute inset-0 h-full w-full object-contain" />
        </span>
      ) : null}
      <span className="truncate font-medium">{sponsor_name}</span>
    </>
  );

  return sponsor_url ? (
    <a
      href={sponsor_url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex min-w-0 items-center gap-2.5 hover:text-blue [&_span]:hover:underline"
    >
      {inner}
    </a>
  ) : (
    <span className="inline-flex min-w-0 items-center gap-2.5">{inner}</span>
  );
}

function BidButton({
  spot,
  onBid,
  closed,
}: {
  spot: BoardSpot;
  onBid: (s: BoardSpot) => void;
  closed: boolean;
}) {
  if (closed) {
    return <span className="shrink-0 text-[13px] text-ink-2">closed</span>;
  }
  return (
    <button
      type="button"
      onClick={() => onBid(spot)}
      className="shrink-0 rounded-full border border-blue px-4 py-1.5 text-[13px] font-medium text-blue transition-colors hover:bg-blue/8"
    >
      {spot.lead ? "Outbid" : "Take it"}
    </button>
  );
}

export function Spots({
  settings,
  spots,
  history,
  totalBids,
  taken,
  onBid,
}: {
  settings: Settings;
  spots: BoardSpot[];
  history: HistoryRow[];
  totalBids: number;
  taken: number;
  onBid: (s: BoardSpot) => void;
}) {
  const { money } = useCurrency();
  const [tab, setTab] = useState<"spots" | "history">("spots");
  const closed = Boolean(settings.closed_at);

  const ordered = [...spots].sort((a, b) => {
    const av = a.lead?.amount_cents ?? -1;
    const bv = b.lead?.amount_cents ?? -1;
    return bv - av || a.id - b.id;
  });

  const startPrices = [...spots].reduce<Record<string, number>>((acc, s) => {
    const key = s.size;
    acc[key] = Math.min(acc[key] ?? Infinity, s.start_price_cents);
    return acc;
  }, {});

  return (
    <section id="spots" className="scroll-mt-20 bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-ink-2">
          <span className="flex items-center gap-2">
            {!closed && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-apple-green opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-apple-green" />
              </span>
            )}
            {closed ? "Auction closed" : "Live auction"} — {taken} of {spots.length} sticker spots
            taken · <Countdown endsAt={settings.auction_ends_at} closed={closed} />
          </span>
        </div>

        <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">The auction, live.</h2>
        <p className="mt-3 max-w-[60ch] text-ink-2">Every spot shows its current top bid.</p>
        <p className="mt-2 max-w-[60ch] text-[13px] text-ink-2">
          Spots from {money(startPrices.S ?? 0)} Small · {money(startPrices.M ?? 0)} Medium ·{" "}
          {money(startPrices.L ?? 0)} Large, with a premium next to and around the Apple logo.
        </p>

        <div
          role="group"
          aria-label="Table view"
          className="mt-8 flex w-fit rounded-full bg-hairline/50 p-1 text-[13px] font-medium"
        >
          {([["spots", "Spots"], ["history", `History (${totalBids})`]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
              className={
                "rounded-full px-4 py-1.5 transition-colors " +
                (tab === key
                  ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.14)] ring-1 ring-black/10"
                  : "text-ink-2 hover:text-ink")
              }
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "spots" ? (
          <>
            <ul className="mt-8 space-y-3 sm:hidden">
              {ordered.map((spot) => (
                <li key={spot.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[13px] text-ink-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-semibold tabular-nums">
                          {spot.id}
                        </span>
                        {SIZE_LABEL[spot.size]} · {spot.dims}
                      </p>
                      <p className="mt-1 truncate font-medium">{spot.label}</p>
                    </div>
                    <span className="shrink-0 text-right">
                      <span className="block font-semibold tabular-nums">
                        {spot.lead ? money(spot.lead.amount_cents) : money(spot.min_next_cents)}
                      </span>
                      <span className="block text-[11px] text-ink-2">
                        {spot.bid_count} {spot.bid_count === 1 ? "bid" : "bids"}
                      </span>
                      {spot.review_amount_cents ? (
                        <span className="block text-[11px] text-blue">
                          {money(spot.review_amount_cents)} under review
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-hairline/60 pt-3">
                    <Holder spot={spot} />
                    <BidButton spot={spot} onBid={onBid} closed={closed} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 hidden overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-hairline text-[12px] text-ink-2">
                      <th scope="col" className="px-5 py-3.5 font-medium">Spot</th>
                      <th scope="col" className="hidden px-5 py-3.5 font-medium sm:table-cell">Size</th>
                      <th scope="col" className="px-5 py-3.5 font-medium">Held by</th>
                      <th scope="col" className="px-5 py-3.5 text-right font-medium">Current bid</th>
                      <th scope="col" className="px-5 py-3.5"><span className="sr-only">Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordered.map((spot) => (
                      <tr key={spot.id} className="border-b border-hairline/60 last:border-0">
                        <td className="px-5 py-4">
                          <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-hairline/80 text-[12px] font-semibold tabular-nums text-ink-2">
                            {spot.id}
                          </span>
                          <span className="font-medium">{spot.label}</span>
                        </td>
                        <td className="hidden px-5 py-4 whitespace-nowrap sm:table-cell">
                          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-bold text-ink-2">
                            {spot.size}
                          </span>
                          <span className="text-[12px] text-ink-2">{spot.dims}</span>
                        </td>
                        <td className="px-5 py-4"><Holder spot={spot} /></td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-semibold tabular-nums">
                            {spot.lead ? money(spot.lead.amount_cents) : money(spot.min_next_cents)}
                          </span>
                          <span className="block text-[11px] text-ink-2">
                            {spot.bid_count} {spot.bid_count === 1 ? "bid" : "bids"}
                          </span>
                          {spot.review_amount_cents ? (
                            <span className="block text-[11px] text-blue">
                              {money(spot.review_amount_cents)} under review
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <BidButton spot={spot} onBid={onBid} closed={closed} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {history.length === 0 ? (
              <p className="px-5 py-8 text-center text-[14px] text-ink-2">
                No bids yet. Be the first.
              </p>
            ) : (
              <ul className="divide-y divide-hairline/60">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-4 px-5 py-3 text-[14px]">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-semibold tabular-nums text-ink-2">
                        {h.spot_id}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{h.sponsor_name}</span>
                        <span className="block truncate text-[12px] text-ink-2">{h.spot_label}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-semibold tabular-nums">{money(h.amount_cents)}</span>
                      <span className="block text-[11px] text-ink-2 tabular-nums">
                        {ago(h.created_at)}
                        {h.status === "outbid" ? " · outbid" : ""}
                        {h.status === "review" ? " · under review" : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
