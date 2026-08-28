import { NextResponse } from "next/server";
import { withTx } from "@/lib/db";
import { closeAuction, expireStale, getSettings } from "@/lib/auction";
import { runRefunds } from "@/lib/refunds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Läuft stündlich über Vercel Cron. Zwei Aufgaben:
 *   1. abgebrochene Bezahlvorgänge verfallen lassen
 *   2. die Auktion schließen, sobald der Endzeitpunkt erreicht ist
 * Das Ende hängt damit nicht am Countdown im Browser.
 */
export async function GET(request: Request) {
  // Fehlt das Geheimnis, wird abgelehnt statt geöffnet: der Endpunkt ändert
  // Zustand und darf nicht versehentlich für alle erreichbar sein.
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[cron] CRON_SECRET fehlt — Aufruf abgelehnt");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await withTx((c) => expireStale(c, 30));

  const settings = await withTx((c) => getSettings(c));
  const due = new Date(settings.auction_ends_at).getTime() <= Date.now();
  if (settings.closed_at || !due) {
    return NextResponse.json({ expired, closed: false });
  }

  const result = await withTx((c) => closeAuction(c));
  const refunds = await runRefunds(result.refunds);

  console.log("[cron] Auktion geschlossen", { won: result.won, refunds });
  return NextResponse.json({ expired, closed: true, won: result.won, refunds });
}
