import { formatCents } from "@/lib/money";

export function Stat({
  label,
  value,
  hint,
  tone = "plain",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "plain" | "warn";
}) {
  return (
    <div className="bg-white px-4 py-3.5">
      <span
        className={
          "block text-[22px] font-semibold tabular-nums tracking-[-0.02em] " +
          (tone === "warn" ? "text-blue" : "")
        }
      >
        {value}
      </span>
      <span className="mt-0.5 block text-[11px] font-medium tracking-[0.08em] text-ink-2 uppercase">
        {label}
      </span>
      {hint && <span className="mt-1 block text-[12px] text-ink-2">{hint}</span>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    review: "bg-blue/10 text-blue",
    leading: "bg-apple-green/15 text-green",
    won: "bg-apple-green/15 text-green",
    outbid: "bg-hairline/70 text-ink-2",
    rejected: "bg-hairline/70 text-ink-2",
    expired: "bg-hairline/70 text-ink-2",
    pending_payment: "bg-hairline/70 text-ink-2",
  };
  const label: Record<string, string> = {
    review: "in Prüfung",
    leading: "hält Platz",
    won: "gewonnen",
    outbid: "überboten",
    rejected: "abgelehnt",
    expired: "verfallen",
    pending_payment: "unbezahlt",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tone[status] ?? "bg-hairline/70 text-ink-2"}`}
    >
      {label[status] ?? status}
    </span>
  );
}

export function Money({ cents, currency }: { cents: number; currency: "eur" | "usd" }) {
  return <span className="tabular-nums">{formatCents(cents, currency)}</span>;
}

export function LogoPreview({ url, name }: { url: string | null; name: string }) {
  if (!url) {
    return (
      <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-hairline text-[11px] text-ink-2">
        kein Logo
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg border border-hairline bg-white p-1"
      title="Original öffnen"
    >
      <img src={url} alt={`Logo ${name}`} className="max-h-full max-w-full object-contain" />
    </a>
  );
}
