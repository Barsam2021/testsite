"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { formatMoney, type Currency } from "@/lib/format";

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  money: (amountEur: number) => string;
};

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("EUR");
  const money = useCallback((amount: number) => formatMoney(amount, currency), [currency]);
  const value = useMemo(() => ({ currency, setCurrency, money }), [currency, money]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): Ctx {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency muss innerhalb von CurrencyProvider verwendet werden");
  return ctx;
}
