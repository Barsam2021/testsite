"use client";

import { useState } from "react";
import { SPOTS_BY_BID, START_PRICE, TAKEN, SPOTS, type Spot } from "@/lib/spots";
import { HISTORY, ago } from "@/lib/history";
import { useCurrency } from "./CurrencyContext";
import { Countdown } from "./Countdown";

function SponsorCell({ spot }: { spot: Spot }) {
  if (!spot.sponsor) return <span className="text-[13px] text-ink-2">&mdash;</span>;
  const { name, logo, logoOnly, url } = spot.sponsor;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group/link inline-flex min-w-0 items-center gap-2.5 hover:text-blue [&_span]:hover:underline"
    >
      <span className="relative flex h-8 w-24 shrink-0 items-center justify-center">
        <img src={logo} alt={logoOnly ? name : ""} className="absolute inset-0 h-full w-full object-contain" />
      </span>
      {!logoOnly && <span className="truncate font-medium">{name}</span>}
    </a>
  );
}

function OutbidButton({ spot, onBid }: { spot: Spot; onBid: (s: Spot) => void }) {
  return (
    <button
      type="button"
      onClick={() => onBid(spot)}
      className="shrink-0 rounded-full border border-blue px-4 py-1.5 text-[13px] font-medium text-blue transition-colors hover:bg-blue/8"
    >
      {spot.sponsor ? "Outbid" : "Take it"}
    </button>
  );
}

export function Spots({ onBid }: { onBid: (s: Spot) => void }) {
  const { money } = useCurrency();
  const [tab, setTab] = useState<"spots" | "history">("spots");

  return (
    <section id="spots" className="scroll-mt-20 bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-ink-2">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-apple-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-apple-green" />
            </span>
            Live auction — {TAKEN} of {SPOTS.length} sticker spots taken · <Countdown />
          </span>
        </div>

        <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">The auction, live.</h2>
        <p className="mt-3 max-w-[60ch] text-ink-2">Every spot shows its current top bid.</p>
        <p className="mt-2 max-w-[60ch] text-[13px] text-ink-2">
          Spots from {money(START_PRICE.S)} Small · {money(START_PRICE.M)} Medium ·{" "}
          {money(START_PRICE.L)} Large, with a premium next to and around the Apple logo.
        </p>

        <div
          role="group"
          aria-label="Table view"
          className="mt-8 flex w-fit rounded-full bg-hairline/50 p-1 text-[13px] font-medium"
        >
          {([["spots", "Spots"], ["history", `History (${HISTORY.length})`]] as const).map(
            ([key, label]) => (
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
            ),
          )}
        </div>

        {tab === "spots" ? (
          <>
            {/* Mobil: Karten */}
            <ul className="mt-8 space-y-3 sm:hidden">
              {SPOTS_BY_BID.map((spot) => (
                <li key={spot.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[13px] text-ink-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-semibold tabular-nums">
                          {spot.id}
                        </span>
                        {spot.sizeLabel} · {spot.dims}
                      </p>
                      <p className="mt-1 truncate font-medium">{spot.name}</p>
                    </div>
                    <span className="shrink-0 text-right">
                      <span className="block font-semibold tabular-nums">{money(spot.bid)}</span>
                      <span className="block text-[11px] text-ink-2">{spot.bids} bids</span>
                      {spot.pending ? (
                        <span className="block text-[11px] text-blue">
                          {money(spot.pending)} under review
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-hairline/60 pt-3">
                    <SponsorCell spot={spot} />
                    <OutbidButton spot={spot} onBid={onBid} />
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: Tabelle */}
            <div className="mt-8 hidden overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[440px] text-left text-[14px] sm:min-w-[560px]">
                  <thead>
                    <tr className="border-b border-hairline text-[12px] text-ink-2">
                      <th scope="col" className="px-3 py-3.5 font-medium sm:px-5">Spot</th>
                      <th scope="col" className="hidden px-5 py-3.5 font-medium sm:table-cell">Size</th>
                      <th scope="col" className="px-3 py-3.5 font-medium sm:px-5">Held by</th>
                      <th scope="col" className="px-3 py-3.5 text-right font-medium sm:px-5">Current bid</th>
                      <th scope="col" className="px-5 py-3.5"><span className="sr-only">Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {SPOTS_BY_BID.map((spot) => (
                      <tr key={spot.id} className="border-b border-hairline/60 last:border-0">
                        <td className="px-3 py-4 sm:px-5">
                          <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-hairline/80 text-[12px] font-semibold tabular-nums text-ink-2">
                            {spot.id}
                          </span>
                          <span className="font-medium">{spot.name}</span>
                        </td>
                        <td className="hidden px-5 py-4 whitespace-nowrap sm:table-cell">
                          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-bold text-ink-2">
                            {spot.size}
                          </span>
                          <span className="text-[12px] text-ink-2">{spot.dims}</span>
                        </td>
                        <td className="px-3 py-4 sm:px-5"><SponsorCell spot={spot} /></td>
                        <td className="px-3 py-4 text-right sm:px-5">
                          <span className="font-semibold tabular-nums">{money(spot.bid)}</span>
                          <span className="block text-[11px] text-ink-2">{spot.bids} bids</span>
                          {spot.pending ? (
                            <span className="block text-[11px] text-blue">
                              {money(spot.pending)} under review
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <OutbidButton spot={spot} onBid={onBid} />
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
            <ul className="divide-y divide-hairline/60">
              {HISTORY.map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-5 py-3 text-[14px]">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-semibold tabular-nums text-ink-2">
                      {h.spotId}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{h.bidder}</span>
                      <span className="block truncate text-[12px] text-ink-2">{h.spotName}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-semibold tabular-nums">{money(h.amount)}</span>
                    <span className="block text-[11px] text-ink-2 tabular-nums">{ago(h.agoMinutes)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
