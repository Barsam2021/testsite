import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { withTx } from "@/lib/db";
import { getSettings } from "@/lib/auction";
import { bidsByStatus, recentBids, recentEvents, totals, type AdminBid } from "@/lib/admin-data";
import { Shell } from "@/components/admin/Shell";
import { LogoPreview, Money, Stat, StatusPill } from "@/components/admin/ui";
import { formatCents } from "@/lib/money";
import {
  approve,
  closeNow,
  makeRemainderLink,
  markRemainderPaid,
  reject,
  releaseSpot,
  retryRefund,
} from "./actions";

export const dynamic = "force-dynamic";

const btn =
  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-50";
const primary = `${btn} bg-blue text-white hover:bg-blue-hover`;
const ghost = `${btn} border border-hairline text-ink-2 hover:text-ink`;

function when(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
}

function ReviewCard({ bid, currency }: { bid: AdminBid; currency: "eur" | "usd" }) {
  return (
    <li className="rounded-2xl border border-hairline bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-start gap-4">
        <LogoPreview url={bid.logo_url} name={bid.sponsor_name} />

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[13px] text-ink-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-semibold tabular-nums">
              {bid.spot_id}
            </span>
            {bid.spot_label}
            <StatusPill status={bid.status} />
          </p>
          <p className="mt-1 text-[17px] font-semibold">{bid.sponsor_name}</p>
          <p className="mt-0.5 text-[13px] text-ink-2">
            {bid.sponsor_email}
            {bid.sponsor_url && (
              <>
                {" · "}
                <a
                  href={bid.sponsor_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-blue hover:underline"
                >
                  {bid.sponsor_url.replace(/^https?:\/\//, "")}
                </a>
              </>
            )}
          </p>
        </div>

        <div className="text-right">
          <span className="block text-[19px] font-semibold">
            <Money cents={bid.amount_cents} currency={currency} />
          </span>
          <span className="block text-[12px] text-ink-2">
            Anzahlung <Money cents={bid.deposit_cents} currency={currency} /> · bezahlt{" "}
            {when(bid.paid_at)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline/60 pt-4">
        <form action={approve}>
          <input type="hidden" name="bid_id" value={bid.id} />
          <button type="submit" className={primary}>
            Freigeben — Platz übernehmen
          </button>
        </form>
        <form action={reject} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="bid_id" value={bid.id} />
          <input
            name="note"
            placeholder="Grund (optional)"
            className="rounded-full border border-hairline px-3.5 py-1.5 text-[13px] outline-none focus:border-blue"
          />
          <button type="submit" className={ghost}>
            Ablehnen &amp; erstatten
          </button>
        </form>
      </div>
    </li>
  );
}

export default async function AdminOverview() {
  if (!(await isAdmin())) redirect("/admin/login");

  const settings = await withTx((c) => getSettings(c));
  const [t, review, leading, won, recent, events] = await Promise.all([
    totals(),
    bidsByStatus("review"),
    bidsByStatus("leading"),
    bidsByStatus("won"),
    recentBids(60),
    recentEvents(30),
  ]);

  const currency = settings.currency;
  const holders = [...leading, ...won];
  const stuckRefunds = recent.filter(
    (b) => (b.status === "outbid" || b.status === "rejected") && !b.refunded_at,
  );
  const closed = Boolean(settings.closed_at);

  return (
    <Shell title="Übersicht" active="overview">
      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Eingenommen"
          value={formatCents(t.raised_cents, currency)}
          hint={`Ziel ${formatCents(settings.goal_cents, currency)} · ${
            settings.goal_cents ? Math.round((t.raised_cents / settings.goal_cents) * 100) : 0
          }%`}
        />
        <Stat
          label="Anzahlungen gehalten"
          value={formatCents(t.deposits_held_cents, currency)}
          hint={`${formatCents(t.deposits_refunded_cents, currency)} bereits erstattet`}
        />
        <Stat
          label="Wartet auf Prüfung"
          value={String(t.in_review)}
          tone={t.in_review > 0 ? "warn" : "plain"}
          hint={t.in_review > 0 ? "Sponsoren warten auf dich" : "nichts offen"}
        />
        <Stat
          label="Plätze vergeben"
          value={`${t.spots_taken} / 10`}
          hint={closed ? "Auktion beendet" : "Auktion läuft"}
        />
      </div>

      {t.refunds_pending > 0 && (
        <div className="mt-6 rounded-2xl border border-blue/30 bg-blue/5 p-5">
          <p className="text-[15px] font-semibold">
            {t.refunds_pending} Rückerstattung{t.refunds_pending === 1 ? "" : "en"} noch offen
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
            Bei diesen Geboten steht der Zustand korrekt in der Datenbank, aber Stripe hat das Geld
            noch nicht zurückgeschickt. Meist ein vorübergehender Fehler — hier noch einmal anstoßen.
          </p>
          <ul className="mt-3 space-y-2">
            {stuckRefunds.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 text-[13px]">
                <span className="font-medium">{b.sponsor_name}</span>
                <span className="text-ink-2">
                  Platz {b.spot_id} · <Money cents={b.deposit_cents} currency={currency} />
                </span>
                <form action={retryRefund}>
                  <input type="hidden" name="bid_id" value={b.id} />
                  <button type="submit" className={ghost}>
                    Erneut erstatten
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-[13px] font-semibold tracking-[0.1em] text-ink-2 uppercase">
          Zur Prüfung ({review.length})
        </h2>
        {review.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-hairline px-5 py-8 text-center text-[14px] text-ink-2">
            Nichts offen. Neue Gebote landen hier, sobald die Anzahlung bezahlt ist.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {review.map((bid) => (
              <ReviewCard key={bid.id} bid={bid} currency={currency} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-[13px] font-semibold tracking-[0.1em] text-ink-2 uppercase">
          Belegte Plätze ({holders.length})
        </h2>
        {holders.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-hairline px-5 py-8 text-center text-[14px] text-ink-2">
            Noch kein Platz vergeben.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-hairline bg-white">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-hairline text-[12px] text-ink-2">
                  <th className="px-5 py-3 font-medium">Platz</th>
                  <th className="px-5 py-3 font-medium">Sponsor</th>
                  <th className="px-5 py-3 text-right font-medium">Gebot</th>
                  <th className="px-5 py-3 text-right font-medium">Restbetrag</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {holders.map((b) => {
                  const remainder = b.amount_cents - b.deposit_cents;
                  return (
                    <tr key={b.id} className="border-b border-hairline/60 last:border-0">
                      <td className="px-5 py-4">
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-hairline/80 text-[11px] font-semibold tabular-nums text-ink-2">
                          {b.spot_id}
                        </span>
                        <span className="text-[13px] text-ink-2">{b.spot_label}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <LogoPreview url={b.logo_url} name={b.sponsor_name} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{b.sponsor_name}</p>
                            <p className="truncate text-[12px] text-ink-2">{b.sponsor_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold">
                        <Money cents={b.amount_cents} currency={currency} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {b.remainder_paid_at ? (
                          <span className="text-[13px] text-green">bezahlt</span>
                        ) : b.status === "won" ? (
                          <Money cents={remainder} currency={currency} />
                        ) : (
                          // Fällig wird der Rest erst mit dem Zuschlag.
                          <span className="text-[13px] text-ink-2">bei Zuschlag</span>
                        )}
                      </td>
                      <td className="px-5 py-4"><StatusPill status={b.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          {b.status === "won" && !b.remainder_paid_at && (
                            <>
                              {b.payment_link_url ? (
                                <a
                                  href={b.payment_link_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={ghost}
                                >
                                  Zahlungslink ↗
                                </a>
                              ) : (
                                <form action={makeRemainderLink}>
                                  <input type="hidden" name="bid_id" value={b.id} />
                                  <button type="submit" className={primary}>
                                    Zahlungslink erstellen
                                  </button>
                                </form>
                              )}
                              <form action={markRemainderPaid}>
                                <input type="hidden" name="bid_id" value={b.id} />
                                <button type="submit" className={ghost}>
                                  Als bezahlt markieren
                                </button>
                              </form>
                            </>
                          )}
                          <form action={releaseSpot}>
                            <input type="hidden" name="bid_id" value={b.id} />
                            <button type="submit" className={ghost}>
                              Platz freigeben
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-[13px] font-semibold tracking-[0.1em] text-ink-2 uppercase">
          Alle Gebote
        </h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-hairline bg-white">
          <table className="w-full min-w-[680px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-hairline text-[12px] text-ink-2">
                <th className="px-5 py-3 font-medium">Wann</th>
                <th className="px-5 py-3 font-medium">Platz</th>
                <th className="px-5 py-3 font-medium">Sponsor</th>
                <th className="px-5 py-3 text-right font-medium">Gebot</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Erstattet</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id} className="border-b border-hairline/60 last:border-0">
                  <td className="px-5 py-3 text-[13px] whitespace-nowrap text-ink-2">
                    {when(b.created_at)}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-ink-2">
                    {b.spot_id} · {b.spot_label}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium">{b.sponsor_name}</p>
                    <p className="text-[12px] text-ink-2">{b.sponsor_email}</p>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">
                    <Money cents={b.amount_cents} currency={currency} />
                  </td>
                  <td className="px-5 py-3"><StatusPill status={b.status} /></td>
                  <td className="px-5 py-3 text-[13px] text-ink-2">
                    {b.refunded_at ? when(b.refunded_at) : "—"}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[14px] text-ink-2">
                    Noch keine Gebote.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[13px] font-semibold tracking-[0.1em] text-ink-2 uppercase">
          Protokoll
        </h2>
        <ul className="mt-3 divide-y divide-hairline/60 overflow-hidden rounded-2xl border border-hairline bg-white text-[13px]">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-2.5">
              <span className="w-32 shrink-0 tabular-nums text-ink-2">{when(e.created_at)}</span>
              <span className="font-medium">{e.kind}</span>
              {e.bid_id && <span className="text-ink-2">Gebot {e.bid_id}</span>}
              <span className="min-w-0 truncate text-ink-2">{JSON.stringify(e.detail)}</span>
            </li>
          ))}
          {events.length === 0 && (
            <li className="px-5 py-8 text-center text-ink-2">Noch nichts passiert.</li>
          )}
        </ul>
      </section>

      {!closed && (
        <section className="mt-10 rounded-2xl border border-hairline bg-white p-5">
          <h2 className="text-[15px] font-semibold">Auktion vorzeitig beenden</h2>
          <p className="mt-1 max-w-[64ch] text-[13px] leading-relaxed text-ink-2">
            Alle aktuellen Halter gewinnen ihren Platz, offene Prüfungen werden abgelehnt und deren
            Anzahlungen erstattet. Das lässt sich nicht rückgängig machen.
          </p>
          <form action={closeNow} className="mt-4">
            <button type="submit" className={ghost}>
              Jetzt beenden
            </button>
          </form>
        </section>
      )}
    </Shell>
  );
}
