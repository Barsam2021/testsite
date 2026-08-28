import type { Queryable } from "./db";
import { depositFor } from "./money";

export type Settings = {
  id: number;
  device_name: string;
  device_url: string | null;
  goal_cents: number;
  currency: "eur" | "usd";
  auction_ends_at: string;
  closed_at: string | null;
  min_increment_cents: number;
  deposit_bps: number;
  min_deposit_cents: number;
  headline: string;
  subheadline: string;
  owner_name: string;
  owner_bio: string;
  owner_x: string | null;
  owner_email: string | null;
  /** Datenblatt als Paare [Bezeichnung, Wert] */
  device_specs: [string, string][];
  device_note: string;
};

export type BidStatus =
  | "pending_payment"
  | "review"
  | "leading"
  | "outbid"
  | "rejected"
  | "expired"
  | "won";

export type Bid = {
  id: string;
  spot_id: number;
  amount_cents: number;
  deposit_cents: number;
  status: BidStatus;
  sponsor_name: string;
  sponsor_url: string | null;
  sponsor_email: string;
  logo_url: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  stripe_refund_id: string | null;
  payment_link_url: string | null;
  remainder_paid_at: string | null;
  created_at: string;
  paid_at: string | null;
};

/** Ein Platz mit allem, was die öffentliche Seite über ihn anzeigt. */
export type BoardSpot = {
  id: number;
  label: string;
  size: "S" | "M" | "L";
  dims: string;
  grid_area: string;
  start_price_cents: number;
  /** Der Halter des Platzes — freigegeben und sichtbar. */
  lead: null | {
    id: string;
    amount_cents: number;
    sponsor_name: string;
    sponsor_url: string | null;
    logo_url: string | null;
  };
  /** Höheres Gebot, das noch auf Freigabe wartet ("under review"). */
  review_amount_cents: number | null;
  bid_count: number;
  /** Was das nächste Gebot mindestens bieten muss. */
  min_next_cents: number;
};

/** Rückerstattung, die der Aufrufer nach der Transaktion bei Stripe auslöst. */
export type RefundTask = {
  bid_id: string;
  payment_intent: string | null;
  deposit_cents: number;
  sponsor_email: string;
  reason: "outbid" | "rejected" | "auction_closed";
};

export async function getSettings(c: Queryable): Promise<Settings> {
  const { rows } = await c.query("select * from settings where id = 1");
  if (!rows[0]) throw new Error("settings-Zeile fehlt — Migration und Seed ausgeführt?");
  return rows[0] as Settings;
}

export async function logEvent(
  c: Queryable,
  bidId: string | null,
  kind: string,
  detail: Record<string, unknown> = {},
): Promise<void> {
  await c.query("insert into events (bid_id, kind, detail) values ($1, $2, $3)", [
    bidId,
    kind,
    JSON.stringify(detail),
  ]);
}

const BOARD_SQL = `
  select
    s.id, s.label, s.size, s.dims, s.grid_area, s.start_price_cents,
    lb.id            as lead_id,
    lb.amount_cents  as lead_amount,
    lb.sponsor_name  as lead_name,
    lb.sponsor_url   as lead_url,
    lb.logo_url      as lead_logo,
    rb.amount_cents  as review_amount,
    coalesce(bc.n, 0) as bid_count
  from spots s
  left join lateral (
    select id, amount_cents, sponsor_name, sponsor_url, logo_url
    from bids
    where spot_id = s.id and status in ('leading', 'won')
    order by amount_cents desc, id asc
    limit 1
  ) lb on true
  left join lateral (
    select amount_cents
    from bids
    where spot_id = s.id and status = 'review'
    order by amount_cents desc, id asc
    limit 1
  ) rb on true
  left join lateral (
    -- Gezählt wird, was tatsächlich bezahlt wurde. Abgebrochene
    -- Bezahlvorgänge sind keine Gebote, abgelehnte schon.
    select count(*)::int as n
    from bids
    where spot_id = s.id
      and status in ('review', 'leading', 'outbid', 'won', 'rejected')
  ) bc on true
  order by s.sort_order asc, s.id asc
`;

export async function getBoard(
  c: Queryable,
  settings: Settings,
): Promise<{ spots: BoardSpot[]; raised_cents: number; taken: number }> {
  const { rows } = await c.query(BOARD_SQL);

  const spots: BoardSpot[] = rows.map((r: any) => {
    const highest = Math.max(r.lead_amount ?? 0, r.review_amount ?? 0);
    return {
      id: r.id,
      label: r.label,
      size: r.size,
      dims: r.dims,
      grid_area: r.grid_area,
      start_price_cents: r.start_price_cents,
      lead: r.lead_id
        ? {
            id: String(r.lead_id),
            amount_cents: r.lead_amount,
            sponsor_name: r.lead_name,
            sponsor_url: r.lead_url,
            logo_url: r.lead_logo,
          }
        : null,
      review_amount_cents: r.review_amount ?? null,
      bid_count: r.bid_count,
      min_next_cents:
        highest > 0 ? highest + settings.min_increment_cents : r.start_price_cents,
    };
  });

  return {
    spots,
    // Eingenommen zählt nur, was tatsächlich einen Platz hält.
    raised_cents: spots.reduce((sum, s) => sum + (s.lead?.amount_cents ?? 0), 0),
    taken: spots.filter((s) => s.lead).length,
  };
}

/**
 * Mindestgebot für einen Platz. Sperrt die Platzzeile, damit zwei gleichzeitige
 * Gebote nicht denselben Betrag durchbekommen.
 */
export async function lockSpotAndGetMin(
  c: Queryable,
  spotId: number,
  settings: Settings,
): Promise<{ start_price_cents: number; min_next_cents: number } | null> {
  const { rows: spotRows } = await c.query(
    "select id, start_price_cents from spots where id = $1 for update",
    [spotId],
  );
  if (!spotRows[0]) return null;

  const { rows: bidRows } = await c.query(
    `select max(amount_cents) as highest
       from bids
      where spot_id = $1 and status in ('review', 'leading', 'won')`,
    [spotId],
  );

  const highest: number = bidRows[0]?.highest ?? 0;
  const start: number = spotRows[0].start_price_cents;
  return {
    start_price_cents: start,
    min_next_cents: highest > 0 ? highest + settings.min_increment_cents : start,
  };
}

export type NewBid = {
  spot_id: number;
  amount_cents: number;
  sponsor_name: string;
  sponsor_url: string | null;
  sponsor_email: string;
  logo_url: string | null;
};

export type CreateResult =
  | { ok: true; bid_id: string; deposit_cents: number }
  | { ok: false; error: string; min_next_cents?: number };

/** Legt ein Gebot im Zustand pending_payment an. Zahlung folgt separat. */
export async function createPendingBid(
  c: Queryable,
  settings: Settings,
  input: NewBid,
): Promise<CreateResult> {
  if (settings.closed_at) return { ok: false, error: "Die Auktion ist beendet." };
  if (new Date(settings.auction_ends_at).getTime() <= Date.now()) {
    return { ok: false, error: "Die Auktion ist beendet." };
  }

  const spot = await lockSpotAndGetMin(c, input.spot_id, settings);
  if (!spot) return { ok: false, error: "Diesen Platz gibt es nicht." };

  if (input.amount_cents < spot.min_next_cents) {
    return {
      ok: false,
      error: "Zu niedrig — inzwischen liegt ein höheres Gebot vor.",
      min_next_cents: spot.min_next_cents,
    };
  }

  const deposit = depositFor(
    input.amount_cents,
    settings.deposit_bps,
    settings.min_deposit_cents,
  );

  const { rows } = await c.query(
    `insert into bids
       (spot_id, amount_cents, deposit_cents, status,
        sponsor_name, sponsor_url, sponsor_email, logo_url)
     values ($1, $2, $3, 'pending_payment', $4, $5, $6, $7)
     returning id`,
    [
      input.spot_id,
      input.amount_cents,
      deposit,
      input.sponsor_name,
      input.sponsor_url,
      input.sponsor_email,
      input.logo_url,
    ],
  );

  const bidId = String(rows[0].id);
  await logEvent(c, bidId, "bid_created", {
    spot_id: input.spot_id,
    amount_cents: input.amount_cents,
    deposit_cents: deposit,
  });

  return { ok: true, bid_id: bidId, deposit_cents: deposit };
}

export async function attachSession(
  c: Queryable,
  bidId: string,
  sessionId: string,
): Promise<void> {
  await c.query("update bids set stripe_session_id = $2 where id = $1", [bidId, sessionId]);
}

/**
 * Stripe meldet eine abgeschlossene Zahlung. Das Gebot wandert in die Prüfung.
 * Idempotent — Stripe stellt Webhooks mehrfach zu.
 */
export async function markPaid(
  c: Queryable,
  sessionId: string,
  paymentIntent: string,
): Promise<{ changed: boolean; bid_id: string | null }> {
  const { rows } = await c.query(
    `update bids
        set status = 'review',
            stripe_payment_intent = $2,
            paid_at = now()
      where stripe_session_id = $1
        and status = 'pending_payment'
      returning id`,
    [sessionId, paymentIntent],
  );

  if (!rows[0]) return { changed: false, bid_id: null };
  const bidId = String(rows[0].id);
  await logEvent(c, bidId, "deposit_paid", { session: sessionId, payment_intent: paymentIntent });
  return { changed: true, bid_id: bidId };
}

/**
 * Freigabe durch den Betreiber: Das Gebot übernimmt den Platz, der bisherige
 * Halter wird verdrängt und bekommt seine Anzahlung zurück.
 */
export async function approveBid(
  c: Queryable,
  bidId: string,
): Promise<{ ok: boolean; error?: string; refunds: RefundTask[] }> {
  const { rows: bidRows } = await c.query(
    "select * from bids where id = $1 for update",
    [bidId],
  );
  const bid = bidRows[0] as Bid | undefined;
  if (!bid) return { ok: false, error: "Gebot nicht gefunden.", refunds: [] };
  if (bid.status !== "review") {
    return { ok: false, error: `Gebot steht auf "${bid.status}", nicht auf "review".`, refunds: [] };
  }

  await c.query("select id from spots where id = $1 for update", [bid.spot_id]);

  // Bisheriger Halter wird verdrängt.
  const { rows: displaced } = await c.query(
    `update bids
        set status = 'outbid', decided_at = now()
      where spot_id = $1 and status = 'leading' and id <> $2
      returning id, deposit_cents, stripe_payment_intent, sponsor_email`,
    [bid.spot_id, bidId],
  );

  await c.query("update bids set status = 'leading', decided_at = now() where id = $1", [bidId]);
  await logEvent(c, bidId, "approved", { spot_id: bid.spot_id, displaced: displaced.length });

  const refunds: RefundTask[] = displaced.map((d: any) => ({
    bid_id: String(d.id),
    payment_intent: d.stripe_payment_intent,
    deposit_cents: d.deposit_cents,
    sponsor_email: d.sponsor_email,
    reason: "outbid" as const,
  }));

  for (const r of refunds) {
    await logEvent(c, r.bid_id, "outbid", { by_bid: bidId });
  }

  return { ok: true, refunds };
}

/** Ablehnung: Anzahlung zurück, der Platz behält seinen bisherigen Halter. */
export async function rejectBid(
  c: Queryable,
  bidId: string,
  note?: string,
): Promise<{ ok: boolean; error?: string; refunds: RefundTask[] }> {
  const { rows } = await c.query(
    `update bids
        set status = 'rejected', decided_at = now()
      where id = $1 and status = 'review'
      returning id, deposit_cents, stripe_payment_intent, sponsor_email`,
    [bidId],
  );
  if (!rows[0]) return { ok: false, error: "Gebot steht nicht zur Prüfung an.", refunds: [] };

  await logEvent(c, bidId, "rejected", { note: note ?? null });
  return {
    ok: true,
    refunds: [
      {
        bid_id: String(rows[0].id),
        payment_intent: rows[0].stripe_payment_intent,
        deposit_cents: rows[0].deposit_cents,
        sponsor_email: rows[0].sponsor_email,
        reason: "rejected",
      },
    ],
  };
}

/** Hält die Liste sauber: abgebrochene Bezahlvorgänge nach einer Weile verwerfen. */
export async function expireStale(c: Queryable, olderThanMinutes = 30): Promise<number> {
  const { rows } = await c.query(
    `update bids
        set status = 'expired'
      where status = 'pending_payment'
        and created_at < now() - ($1 || ' minutes')::interval
      returning id`,
    [String(olderThanMinutes)],
  );
  return rows.length;
}

/**
 * Auktionsende: Halter gewinnen, offene Prüfungen werden erstattet.
 */
export async function closeAuction(
  c: Queryable,
): Promise<{ won: number; refunds: RefundTask[] }> {
  const { rows: pending } = await c.query(
    `update bids
        set status = 'rejected', decided_at = now()
      where status = 'review'
      returning id, deposit_cents, stripe_payment_intent, sponsor_email`,
  );

  const { rows: won } = await c.query(
    `update bids set status = 'won', decided_at = now() where status = 'leading' returning id`,
  );

  await c.query("update bids set status = 'expired' where status = 'pending_payment'");
  await c.query("update settings set closed_at = now() where id = 1 and closed_at is null");
  await logEvent(c, null, "auction_closed", { won: won.length, refunded: pending.length });

  return {
    won: won.length,
    refunds: pending.map((p: any) => ({
      bid_id: String(p.id),
      payment_intent: p.stripe_payment_intent,
      deposit_cents: p.deposit_cents,
      sponsor_email: p.sponsor_email,
      reason: "auction_closed" as const,
    })),
  };
}

export async function recordRefund(
  c: Queryable,
  bidId: string,
  refundId: string,
): Promise<void> {
  await c.query(
    "update bids set stripe_refund_id = $2, refunded_at = now() where id = $1",
    [bidId, refundId],
  );
  await logEvent(c, bidId, "refunded", { refund_id: refundId });
}
