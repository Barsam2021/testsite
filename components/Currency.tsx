"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { formatCents, type Currency } from "@/lib/money";

/** Nur Anzeige. Abgerechnet wird immer in der Währung aus den Einstellungen. */
export const USD_RATE = 1.08;

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  money: (cents: number) => string;
};

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({
  base,
  children,
}: {
  base: Currency;
  children: React.ReactNode;
}) {
  const [currency, setCurrency] = useState<Currency>(base);

  const money = useCallback(
    (cents: number) =>
      currency === base ? formatCents(cents, base) : formatCents(Math.round(cents * USD_RATE), currency),
    [currency, base],
  );

  const value = useMemo(() => ({ currency, setCurrency, money }), [currency, money]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): Ctx {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency braucht einen CurrencyProvider.");
  return ctx;
}
