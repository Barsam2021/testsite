"use client";

import { SPOTS, type Spot } from "@/lib/spots";
import { useCurrency } from "./CurrencyContext";
import { AppleGlyph } from "./AppleGlyph";

/** Marker für ein eingegangenes, noch nicht freigegebenes Gebot */
function PendingMark() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-1 top-1 rounded-full bg-blue/10 px-1 py-0.5 text-blue"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-2.5 w-2.5 sm:h-3 sm:w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 3h10M7 21h10" />
        <path d="M8 3v3.5a4 4 0 0 0 1.6 3.2L12 12l-2.4 2.3A4 4 0 0 0 8 17.5V21" />
        <path d="M16 3v3.5a4 4 0 0 1-1.6 3.2L12 12l2.4 2.3a4 4 0 0 1 1.6 3.2V21" />
      </svg>
    </span>
  );
}

function SpotButton({ spot, onBid }: { spot: Spot; onBid: (s: Spot) => void }) {
  const { money } = useCurrency();
  const sponsor = spot.sponsor;
  const label = sponsor
    ? `Spot ${spot.id}, ${spot.name}, ${spot.sizeLabel}. Reserved by ${sponsor.name} at ${money(spot.bid)}. Outbid.`
    : `Spot ${spot.id}, ${spot.name}, ${spot.sizeLabel}. Free from ${money(spot.bid)}. Place a bid.`;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => onBid(spot)}
      className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-black/25 bg-black/[0.02] text-ink transition-colors hover:border-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
    >
      <span className="flex h-full w-full flex-col items-center justify-end gap-1 px-1.5 py-2 transition duration-200 group-hover:blur-[3px] group-focus-visible:blur-[3px]">
        <span className="relative flex min-h-0 w-full flex-1 items-center justify-center">
          {sponsor ? (
            <img
              src={sponsor.logo}
              alt=""
              className="absolute inset-0 m-auto max-h-[70%] max-w-[88%] object-contain"
            />
          ) : null}
        </span>
        {sponsor && !sponsor.logoOnly ? (
          <span className="max-w-full shrink-0 truncate text-[10px] font-semibold leading-tight sm:text-[13px]">
            {sponsor.name}
          </span>
        ) : null}
        <span className="shrink-0 text-[11px] font-medium leading-tight tabular-nums text-ink-2 sm:text-[14px]">
          {money(spot.bid)}
        </span>
      </span>

      {spot.pending ? <PendingMark /> : null}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span className="rounded-full bg-blue px-3 py-1.5 text-[11px] font-medium text-white sm:px-4 sm:text-[13px]">
          {sponsor ? "Outbid" : "Take it"}
        </span>
      </span>
    </button>
  );
}

export function Lid({ onBid }: { onBid: (s: Spot) => void }) {
  return (
    <div className="relative mx-auto mt-12 aspect-[1.5] w-full max-w-[900px] md:mt-14">
      <div className="absolute inset-0 m-auto flex w-full max-w-[860px] flex-col justify-center">
        <div
          className="relative w-full rounded-[18px] p-[10px] sm:rounded-[22px]"
          style={{
            aspectRatio: "1.44",
            background:
              "linear-gradient(172deg, var(--lid-1) 0%, var(--lid-2) 45%, var(--lid-3) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18), 0 30px 60px -18px rgba(0,0,0,0.28), 0 12px 24px -12px rgba(0,0,0,0.18)",
          }}
        >
          {/* Glanz auf dem Aluminium */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              background:
                "radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 42%, transparent 70%)",
            }}
          />

          {/* Apple-Logo, liegt über dem Raster und wird nicht verkauft */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div aria-hidden="true" className="w-[15.6%]">
              <AppleGlyph className="w-full text-[#3b3b3f] [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.6))]" />
            </div>
          </div>

          <div
            className="relative grid h-full gap-2 p-2 sm:gap-3 sm:p-4"
            style={{
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gridTemplateRows: "minmax(0, 1fr) minmax(0, 0.9fr) minmax(0, 1fr)",
            }}
          >
            {SPOTS.map((spot) => (
              <div key={spot.id} style={{ gridArea: spot.area }}>
                <SpotButton spot={spot} onBid={onBid} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
