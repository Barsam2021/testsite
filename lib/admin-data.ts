import { query, one } from "./db";
import type { BidStatus } from "./auction";

export type AdminBid = {
  id: string;
  spot_id: number;
  spot_label: string;
  spot_size: string;
  amount_cents: number;
  deposit_cents: number;
  status: BidStatus;
  sponsor_name: string;
  sponsor_url: string | null;
  sponsor_email: string;
  logo_url: string | null;
  stripe_payment_intent: string | null;
  stripe_refund_id: string | null;
  payment_link_url: string | null;
  remainder_paid_at: string | null;
  created_at: string;
  paid_at: string | null;
  refunded_at: string | null;
};

const SELECT = `
  select b.id::text, b.spot_id, s.label as spot_label, s.size as spot_size,
         b.amount_cents, b.deposit_cents, b.status,
         b.sponsor_name, b.sponsor_url, b.sponsor_email, b.logo_url,
         b.stripe_payment_intent, b.stripe_refund_id,
         b.payment_link_url, b.remainder_paid_at,
         b.created_at, b.paid_at, b.refunded_at
    from bids b
    join spots s on s.id = b.spot_id
`;

export function bidsByStatus(status: BidStatus): Promise<AdminBid[]> {
  return query<AdminBid>(
    `${SELECT} where b.status = $1 order by b.amount_cents desc, b.id asc`,
    [status],
  );
}

export function recentBids(limit = 60): Promise<AdminBid[]> {
  return query<AdminBid>(`${SELECT} order by b.created_at desc limit $1`, [limit]);
}

export type Totals = {
  raised_cents: number;
  deposits_held_cents: number;
  deposits_refunded_cents: number;
  remainder_due_cents: number;
  in_review: number;
  spots_taken: number;
  refunds_pending: number;
};

export async function totals(): Promise<Totals> {
  const row = await one<Totals>(`
    select
      coalesce(sum(amount_cents)  filter (where status in ('leading','won')), 0)::int as raised_cents,
      coalesce(sum(deposit_cents) filter (where status in ('review','leading','won')), 0)::int as deposits_held_cents,
      coalesce(sum(deposit_cents) filter (where refunded_at is not null), 0)::int as deposits_refunded_cents,
      coalesce(sum(amount_cents - deposit_cents) filter (where status = 'won' and remainder_paid_at is null), 0)::int as remainder_due_cents,
      count(*) filter (where status = 'review')::int as in_review,
      count(*) filter (where status in ('leading','won'))::int as spots_taken,
      -- Erstattung fällig, aber noch nicht ausgeführt: braucht einen manuellen Anstoß.
      count(*) filter (where status in ('outbid','rejected') and refunded_at is null)::int as refunds_pending
    from bids
  `);
  return (
    row ?? {
      raised_cents: 0,
      deposits_held_cents: 0,
      deposits_refunded_cents: 0,
      remainder_due_cents: 0,
      in_review: 0,
      spots_taken: 0,
      refunds_pending: 0,
    }
  );
}

export type SpotRow = {
  id: number;
  label: string;
  size: string;
  dims: string;
  grid_area: string;
  start_price_cents: number;
  sort_order: number;
};

export function allSpots(): Promise<SpotRow[]> {
  return query<SpotRow>("select * from spots order by sort_order asc, id asc");
}

export type EventRow = {
  id: string;
  bid_id: string | null;
  kind: string;
  detail: Record<string, unknown>;
  created_at: string;
};

export function recentEvents(limit = 40): Promise<EventRow[]> {
  return query<EventRow>(
    "select id::text, bid_id::text, kind, detail, created_at from events order by created_at desc limit $1",
    [limit],
  );
}
