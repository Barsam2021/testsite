import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { withTx } from "@/lib/db";
import { markPaid } from "@/lib/auction";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Einzige Stelle, an der eine Zahlung als eingegangen gilt. Der Browser des
 * Käufers wird bewusst nicht geglaubt — nur die signierte Meldung von Stripe.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET fehlt");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.error("[webhook] Signatur ungültig", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        const intent =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? "");
        // markPaid greift nur auf pending_payment — mehrfache Zustellung
        // desselben Ereignisses bleibt dadurch folgenlos.
        const result = await withTx((c) => markPaid(c, session.id, intent));
        console.log("[webhook] Anzahlung verbucht", { session: session.id, ...result });
      }
    }
  } catch (err) {
    // 500 zurückgeben, damit Stripe erneut zustellt.
    console.error("[webhook] Verarbeitung fehlgeschlagen", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
