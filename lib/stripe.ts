import Stripe from "stripe";

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY fehlt.");
    client = new Stripe(key);
  }
  return client;
}

export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return raw.replace(/\/$/, "");
}

/** Bezahlseite für die Anzahlung eines Gebots. */
export async function createDepositCheckout(args: {
  bidId: string;
  spotLabel: string;
  amountCents: number;
  depositCents: number;
  currency: string;
  email: string;
}): Promise<{ id: string; url: string }> {
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: args.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: args.currency,
          unit_amount: args.depositCents,
          product_data: {
            name: `Anzahlung — ${args.spotLabel}`,
            description: `20 % Anzahlung auf ein Gebot von ${(args.amountCents / 100).toFixed(0)} ${args.currency.toUpperCase()}. Wird bei Zuschlag angerechnet, sonst vollständig erstattet.`,
          },
        },
      },
    ],
    // Der Webhook braucht die Zuordnung; die Session-ID allein reicht,
    // die Metadaten erleichtern die Fehlersuche im Stripe-Dashboard.
    metadata: { bid_id: args.bidId },
    payment_intent_data: { metadata: { bid_id: args.bidId } },
    success_url: `${siteUrl()}/success?bid=${args.bidId}`,
    cancel_url: `${siteUrl()}/?cancelled=1`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  if (!session.url) throw new Error("Stripe hat keine Bezahl-URL geliefert.");
  return { id: session.id, url: session.url };
}

/** Anzahlung zurückerstatten (überboten, abgelehnt oder Auktion beendet). */
export async function refundDeposit(paymentIntent: string): Promise<string> {
  const refund = await stripe().refunds.create({ payment_intent: paymentIntent });
  return refund.id;
}

/** Dauerhafter Zahlungslink über den Restbetrag eines Gewinners. */
export async function createRemainderLink(args: {
  spotLabel: string;
  remainderCents: number;
  currency: string;
  bidId: string;
}): Promise<string> {
  const price = await stripe().prices.create({
    currency: args.currency,
    unit_amount: args.remainderCents,
    product_data: { name: `Restbetrag — ${args.spotLabel}` },
  });

  const link = await stripe().paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { bid_id: args.bidId, kind: "remainder" },
  });

  return link.url;
}
