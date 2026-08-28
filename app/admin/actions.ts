"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { withTx, query } from "@/lib/db";
import {
  approveBid,
  closeAuction,
  getSettings,
  rejectBid,
  recordRefund,
  type RefundTask,
} from "@/lib/auction";
import { runRefunds } from "@/lib/refunds";
import { createRemainderLink, refundDeposit } from "@/lib/stripe";
import { endSession, isAdmin, passwordMatches, startSession } from "@/lib/admin-auth";
import { unitsToCents } from "@/lib/money";

async function guard(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

function refresh(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const password = String(form.get("password") ?? "");
  try {
    if (!passwordMatches(password)) return "Falsches Passwort.";
  } catch (err) {
    return err instanceof Error ? err.message : "Login ist nicht konfiguriert.";
  }
  await startSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

/** Freigabe: Gebot übernimmt den Platz, der bisherige Halter wird erstattet. */
export async function approve(form: FormData): Promise<void> {
  await guard();
  const bidId = String(form.get("bid_id"));
  const result = await withTx((c) => approveBid(c, bidId));
  if (result.ok && result.refunds.length) await runRefunds(result.refunds);
  refresh();
}

export async function reject(form: FormData): Promise<void> {
  await guard();
  const bidId = String(form.get("bid_id"));
  const note = String(form.get("note") ?? "");
  const result = await withTx((c) => rejectBid(c, bidId, note || undefined));
  if (result.ok && result.refunds.length) await runRefunds(result.refunds);
  refresh();
}

/** Zweiter Anlauf, wenn eine Erstattung beim ersten Mal nicht durchging. */
export async function retryRefund(form: FormData): Promise<void> {
  await guard();
  const bidId = String(form.get("bid_id"));
  const rows = await query<{
    deposit_cents: number;
    stripe_payment_intent: string | null;
    sponsor_email: string;
  }>(
    "select deposit_cents, stripe_payment_intent, sponsor_email from bids where id = $1 and refunded_at is null",
    [bidId],
  );
  if (!rows[0]?.stripe_payment_intent) return;

  const task: RefundTask = {
    bid_id: bidId,
    payment_intent: rows[0].stripe_payment_intent,
    deposit_cents: rows[0].deposit_cents,
    sponsor_email: rows[0].sponsor_email,
    reason: "rejected",
  };
  await runRefunds([task]);
  refresh();
}

/** Dauerhafter Zahlungslink über den Restbetrag eines Gewinners. */
export async function makeRemainderLink(form: FormData): Promise<void> {
  await guard();
  const bidId = String(form.get("bid_id"));
  const settings = await withTx((c) => getSettings(c));

  const rows = await query<{ amount_cents: number; deposit_cents: number; label: string }>(
    `select b.amount_cents, b.deposit_cents, s.label
       from bids b join spots s on s.id = b.spot_id
      where b.id = $1 and b.status = 'won'`,
    [bidId],
  );
  const bid = rows[0];
  if (!bid) return;

  const remainder = bid.amount_cents - bid.deposit_cents;
  if (remainder <= 0) return;

  const url = await createRemainderLink({
    spotLabel: bid.label,
    remainderCents: remainder,
    currency: settings.currency,
    bidId,
  });
  await query("update bids set payment_link_url = $2 where id = $1", [bidId, url]);
  refresh();
}

/** Restbetrag ist eingegangen — wird von Hand bestätigt. */
export async function markRemainderPaid(form: FormData): Promise<void> {
  await guard();
  const bidId = String(form.get("bid_id"));
  await query("update bids set remainder_paid_at = now() where id = $1 and status = 'won'", [bidId]);
  refresh();
}

/** Vorzeitig schließen, unabhängig vom Countdown. */
export async function closeNow(): Promise<void> {
  await guard();
  const result = await withTx((c) => closeAuction(c));
  if (result.refunds.length) await runRefunds(result.refunds);
  refresh();
}

export async function saveSettings(form: FormData): Promise<void> {
  await guard();

  // Eine Zeile je Angabe, Bezeichnung und Wert durch "|" getrennt.
  const specsRaw = String(form.get("device_specs") ?? "").trim();
  const specs = specsRaw
    ? specsRaw
        .split("\n")
        .map((line) => line.split("|").map((p) => p.trim()))
        .filter((p) => p.length === 2 && p[0] && p[1])
    : [];

  await query(
    `update settings set
       device_name         = $1,
       device_url          = nullif($2, ''),
       goal_cents          = $3,
       auction_ends_at     = $4,
       min_increment_cents = $5,
       deposit_bps         = $6,
       min_deposit_cents   = $7,
       headline            = $8,
       subheadline         = $9,
       owner_name          = $10,
       owner_bio           = $11,
       owner_x             = nullif($12, ''),
       owner_email         = nullif($13, ''),
       device_specs        = $14::jsonb,
       device_note         = $15
     where id = 1`,
    [
      String(form.get("device_name") ?? ""),
      String(form.get("device_url") ?? ""),
      unitsToCents(Number(form.get("goal") ?? 0)),
      new Date(String(form.get("auction_ends_at"))).toISOString(),
      unitsToCents(Number(form.get("min_increment") ?? 10)),
      Math.round(Number(form.get("deposit_percent") ?? 20) * 100),
      unitsToCents(Number(form.get("min_deposit") ?? 10)),
      String(form.get("headline") ?? ""),
      String(form.get("subheadline") ?? ""),
      String(form.get("owner_name") ?? ""),
      String(form.get("owner_bio") ?? ""),
      String(form.get("owner_x") ?? ""),
      String(form.get("owner_email") ?? ""),
      JSON.stringify(specs),
      String(form.get("device_note") ?? ""),
    ],
  );
  refresh();
}

export async function saveSpot(form: FormData): Promise<void> {
  await guard();
  await query(
    "update spots set label = $2, dims = $3, start_price_cents = $4 where id = $1",
    [
      Number(form.get("spot_id")),
      String(form.get("label") ?? ""),
      String(form.get("dims") ?? ""),
      unitsToCents(Number(form.get("start_price") ?? 0)),
    ],
  );
  refresh();
}

/** Notausgang: Anzahlung eines Halters erstatten und den Platz freigeben. */
export async function releaseSpot(form: FormData): Promise<void> {
  await guard();
  const bidId = String(form.get("bid_id"));
  const rows = await query<{ stripe_payment_intent: string | null; refunded_at: string | null }>(
    "select stripe_payment_intent, refunded_at from bids where id = $1 and status in ('leading','won')",
    [bidId],
  );
  if (!rows[0]) return;

  await query("update bids set status = 'rejected', decided_at = now() where id = $1", [bidId]);
  if (rows[0].stripe_payment_intent && !rows[0].refunded_at) {
    try {
      const refundId = await refundDeposit(rows[0].stripe_payment_intent);
      await withTx((c) => recordRefund(c, bidId, refundId));
    } catch (err) {
      console.error("[releaseSpot] Erstattung fehlgeschlagen", err);
    }
  }
  refresh();
}
