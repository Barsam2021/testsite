import { recordRefund, type RefundTask } from "./auction";
import { withTx } from "./db";
import { refundDeposit } from "./stripe";

/**
 * Führt Rückerstattungen aus. Läuft bewusst NACH der Transaktion: ein Aufruf
 * bei Stripe darf keine Datenbanksperre halten. Fehlschläge werden gesammelt
 * zurückgegeben, statt den ganzen Vorgang scheitern zu lassen — der Zustand in
 * der Datenbank stimmt dann bereits, nur das Geld hängt noch.
 */
export async function runRefunds(
  tasks: RefundTask[],
): Promise<{ done: number; failed: { bid_id: string; error: string }[] }> {
  const failed: { bid_id: string; error: string }[] = [];
  let done = 0;

  for (const task of tasks) {
    if (!task.payment_intent) {
      failed.push({ bid_id: task.bid_id, error: "Keine Zahlung hinterlegt." });
      continue;
    }
    try {
      const refundId = await refundDeposit(task.payment_intent);
      await withTx((c) => recordRefund(c, task.bid_id, refundId));
      done += 1;
    } catch (err) {
      failed.push({
        bid_id: task.bid_id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { done, failed };
}
