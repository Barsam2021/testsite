"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardSpot, Settings } from "@/lib/auction";
import { centsToUnits, depositFor, unitsToCents } from "@/lib/money";
import { useCurrency } from "./Currency";

type Props = {
  spot: BoardSpot | null;
  settings: Settings;
  onClose: () => void;
};

export function BidDialog({ spot, settings, onClose }: Props) {
  const { money } = useCurrency();
  const panel = useRef<HTMLDivElement>(null);

  const [amount, setAmount] = useState(0);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spot) return;
    setAmount(centsToUnits(spot.min_next_cents));
    setError(null);
  }, [spot]);

  useEffect(() => {
    if (!spot) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [spot, onClose]);

  if (!spot) return null;

  const amountCents = unitsToCents(amount || 0);
  const tooLow = amountCents < spot.min_next_cents;
  const deposit = depositFor(amountCents, settings.deposit_bps, settings.min_deposit_cents);
  const canSubmit = !tooLow && name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function uploadLogo(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload fehlgeschlagen.");
      setLogoUrl(json.url);
      setLogoName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spot_id: spot!.id,
          amount,
          sponsor_name: name,
          sponsor_url: url,
          sponsor_email: email,
          logo_url: logoUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.min_next_cents) setAmount(centsToUnits(json.min_next_cents));
        throw new Error(json.error ?? "Das Gebot ging nicht durch.");
      }
      window.location.href = json.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Das Gebot ging nicht durch.");
      setSending(false);
    }
  }

  const field =
    "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink-2/70 focus:border-blue focus:ring-4 focus:ring-blue/15";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/30 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Bid on ${spot.label}`}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)] outline-none sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[13px] text-ink-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-semibold tabular-nums">
                {spot.id}
              </span>
              {spot.size === "L" ? "Large" : spot.size === "M" ? "Medium" : "Small"} · {spot.dims}
            </p>
            <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.015em]">{spot.label}</h3>
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

        <dl className="mt-5 space-y-2 border-b border-hairline/60 pb-5 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-ink-2">{spot.lead ? "Current bid" : "Starting price"}</dt>
            <dd className="font-medium tabular-nums">
              {money(spot.lead ? spot.lead.amount_cents : spot.start_price_cents)}
            </dd>
          </div>
          {spot.review_amount_cents ? (
            <div className="flex justify-between">
              <dt className="text-ink-2">Under review</dt>
              <dd className="font-medium tabular-nums text-blue">{money(spot.review_amount_cents)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-ink-2">Minimum next bid</dt>
            <dd className="font-medium tabular-nums">{money(spot.min_next_cents)}</dd>
          </div>
        </dl>

        <div className="mt-5 space-y-3">
          <div>
            <label className="block text-[13px] font-medium" htmlFor="bid-amount">
              Your bid ({settings.currency === "eur" ? "€" : "$"})
            </label>
            <input
              id="bid-amount"
              type="number"
              inputMode="numeric"
              min={centsToUnits(spot.min_next_cents)}
              step={centsToUnits(settings.min_increment_cents)}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={`mt-1.5 tabular-nums ${field}`}
            />
          </div>

          <input
            className={field}
            placeholder="brand or company name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Brand name"
          />
          <input
            className={field}
            placeholder="your website (optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label="Website"
          />
          <input
            className={field}
            type="email"
            placeholder="your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
          />

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-hairline px-4 py-3 text-[14px] transition-colors hover:border-blue">
            <span className="min-w-0 truncate text-ink-2">
              {uploading ? "Uploading…" : logoName || "Logo (PNG, JPG, WEBP — max 2 MB)"}
            </span>
            <span className="shrink-0 text-[13px] font-medium text-blue">
              {logoUrl ? "Replace" : "Choose"}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadLogo(f);
              }}
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-surface px-4 py-3 text-[13px] leading-relaxed">{error}</p>
        )}

        <button
          type="button"
          disabled={!canSubmit || sending || uploading}
          onClick={submit}
          className="mt-5 w-full rounded-full bg-blue px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-60"
        >
          {sending ? "Taking you to checkout…" : `Pay ${money(deposit)} deposit`}
        </button>

        <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
          Bidding takes a {settings.deposit_bps / 100}% deposit (minimum{" "}
          {money(settings.min_deposit_cents)}), paid by card. If you don&rsquo;t win, it comes back
          in full. Every sponsor is approved by hand before anything appears on the lid.
        </p>
      </div>
    </div>
  );
}
