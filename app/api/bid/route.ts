import { NextResponse } from "next/server";
import { withTx } from "@/lib/db";
import { attachSession, createPendingBid, getSettings } from "@/lib/auction";
import { createDepositCheckout } from "@/lib/stripe";
import { unitsToCents } from "@/lib/money";
import { isAllowedLogoUrl } from "@/lib/logo-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const spotId = Number(body.spot_id);
  const amountCents = unitsToCents(Number(body.amount));
  const name = clean(body.sponsor_name, 80);
  const email = clean(body.sponsor_email, 160);
  let url = clean(body.sponsor_url, 300);
  const logoUrl = clean(body.logo_url, 500) || null;

  if (!Number.isInteger(spotId) || spotId <= 0) {
    return NextResponse.json({ error: "Kein gültiger Platz." }, { status: 400 });
  }
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: "Kein gültiger Betrag." }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "Bitte einen Markennamen angeben." }, { status: 400 });
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse angeben." }, { status: 400 });
  }
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  if (url && !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(url)) {
    return NextResponse.json({ error: "Die Website-Adresse sieht nicht gültig aus." }, { status: 400 });
  }
  // Nur Adressen aus dem eigenen Upload akzeptieren — der Wert wird später
  // als Bildquelle und im Admin als Link ausgegeben.
  if (logoUrl && !isAllowedLogoUrl(logoUrl)) {
    return NextResponse.json(
      { error: "Bitte das Logo über das Formular hochladen." },
      { status: 400 },
    );
  }

  try {
    const result = await withTx(async (c) => {
      const settings = await getSettings(c);
      const created = await createPendingBid(c, settings, {
        spot_id: spotId,
        amount_cents: amountCents,
        sponsor_name: name,
        sponsor_url: url || null,
        sponsor_email: email,
        logo_url: logoUrl,
      });
      return { created, settings };
    });

    const { created, settings } = result;
    if (!created.ok) {
      return NextResponse.json(
        { error: created.error, min_next_cents: created.min_next_cents },
        { status: 409 },
      );
    }

    const { rows } = await withTx((c) =>
      c.query("select label from spots where id = $1", [spotId]),
    );

    let session;
    try {
      session = await createDepositCheckout({
        bidId: created.bid_id,
        spotLabel: rows[0]?.label ?? `Platz ${spotId}`,
        amountCents,
        depositCents: created.deposit_cents,
        currency: settings.currency,
        email,
      });
    } catch (err) {
      // Ohne Bezahlseite kann aus dem Gebot nie etwas werden — die Zeile
      // sofort entwerten, statt sie bis zum nächsten Aufräumlauf liegen zu lassen.
      console.error("[bid] Stripe-Checkout fehlgeschlagen", err);
      await withTx((c) =>
        c.query("update bids set status = 'expired' where id = $1 and status = 'pending_payment'", [
          created.bid_id,
        ]),
      );
      return NextResponse.json(
        { error: "Die Bezahlseite ließ sich nicht öffnen. Bitte gleich noch einmal versuchen." },
        { status: 502 },
      );
    }

    await withTx((c) => attachSession(c, created.bid_id, session.id));

    return NextResponse.json({ checkout_url: session.url });
  } catch (err) {
    console.error("[bid]", err);
    return NextResponse.json(
      { error: "Das Gebot konnte nicht angelegt werden. Bitte noch einmal versuchen." },
      { status: 500 },
    );
  }
}
