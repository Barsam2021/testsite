/** Alle Beträge sind Cent-Integers. Nie Fließkomma für Geld. */

export type Currency = "eur" | "usd";

const SYMBOL: Record<Currency, string> = { eur: "€", usd: "$" };

/** 171500 -> "1 715 €" — schmales Leerzeichen als Tausendertrenner, wie im Original */
export function formatCents(cents: number, currency: Currency = "eur"): string {
  const whole = Math.round(cents / 100);
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return currency === "usd" ? `$${grouped}` : `${grouped} €`;
}

/** Für Eingabefelder: Cent -> ganze Euro */
export function centsToUnits(cents: number): number {
  return Math.round(cents / 100);
}

export function unitsToCents(units: number): number {
  return Math.round(units * 100);
}

/**
 * Anzahlung: Prozentsatz vom Gebot, mindestens der konfigurierte Sockelbetrag.
 * deposit_bps ist in Basispunkten (2000 = 20 %).
 */
export function depositFor(
  amountCents: number,
  depositBps: number,
  minDepositCents: number,
): number {
  return Math.max(minDepositCents, Math.round((amountCents * depositBps) / 10_000));
}
