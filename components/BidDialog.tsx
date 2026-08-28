"use client";

import { useEffect, useRef, useState } from "react";
import type { Spot } from "@/lib/spots";
import { useCurrency } from "./CurrencyContext";

/** Mindestschritt und Anzahlung wie in der FAQ des Originals */
export const MIN_INCREMENT = 10;
export const DEPOSIT_RATE = 0.2;
export const MIN_DEPOSIT = 10;

export function BidDialog({ spot, onClose }: { spot: Spot | null; onClose: () => void }) {
  const { money } = useCurrency();
  const ref = useRef<HTMLDivElement>(null);
  const minBid = spot ? spot.bid + MIN_INCREMENT : 0;
  const [amount, setAmount] = useState(minBid);

  useEffect(() => {
    if (spot) setAmount(spot.bid + MIN_INCREMENT);
  }, [spot]);

  useEffect(() => {
    if (!spot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [spot, onClose]);

  if (!spot) return null;

  const deposit = Math.max(MIN_DEPOSIT, Math.round(amount * DEPOSIT_RATE));
  const tooLow = amount < minBid;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Bid on spot ${spot.id}`}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)] outline-none sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[13px] text-ink-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-semibold tabular-nums">
                {spot.id}
              </span>
              {spot.sizeLabel} · {spot.dims}
            </p>
            <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.015em]">{spot.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-2 shrink-0 rounded-full p-2 text-ink-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        <dl className="mt-6 space-y-2 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-ink-2">Current bid</dt>
            <dd className="font-medium tabular-nums">{money(spot.bid)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-2">Minimum next bid</dt>
            <dd className="font-medium tabular-nums">{money(minBid)}</dd>
          </div>
        </dl>

        <label className="mt-6 block text-[13px] font-medium" htmlFor="bid-amount">
          Your bid
        </label>
        <input
          id="bid-amount"
          type="number"
          min={minBid}
          step={MIN_INCREMENT}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1.5 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15px] tabular-nums outline-none transition-shadow focus:border-blue focus:ring-4 focus:ring-blue/15"
        />
        {tooLow && (
          <p className="mt-2 text-[13px] text-ink-2">
            Outbids need to beat the current bid by at least {money(MIN_INCREMENT)}.
          </p>
        )}

        <button
          type="button"
          disabled={tooLow}
          className="mt-5 w-full rounded-full bg-blue px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-60"
        >
          Pay {money(deposit)} deposit
        </button>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
          Bidding takes a 20% deposit (minimum {money(MIN_DEPOSIT)}), paid by card. If you
          don&rsquo;t win, it comes back in full, automatically.
        </p>
      </div>
    </div>
  );
}
