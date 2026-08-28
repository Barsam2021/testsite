export type Currency = "EUR" | "USD";

/** Im Original ist EUR die Abrechnungswährung, USD nur indikativ. */
export const USD_RATE = 1.08;

/** 1 715 € — schmales geschütztes Leerzeichen als Tausendertrenner, wie im Original */
export function formatMoney(amountEur: number, currency: Currency): string {
  const value = currency === "USD" ? Math.round(amountEur * USD_RATE) : amountEur;
  const grouped = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return currency === "USD" ? `$${grouped}` : `${grouped} €`;
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}
