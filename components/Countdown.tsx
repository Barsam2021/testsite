"use client";

import { useEffect, useState } from "react";
import { AUCTION_END } from "@/lib/spots";

function remaining(end: number, now: number): string {
  const ms = Math.max(0, end - now);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

/**
 * Der Countdown im Original ist reine Anzeige — die Wahrheit steht serverseitig.
 * Bis zur Hydration bleibt das Feld leer, damit Server und Client übereinstimmen.
 */
export function Countdown({ className = "" }: { className?: string }) {
  const end = new Date(AUCTION_END).getTime();
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => setLabel(remaining(end, Date.now()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [end]);

  return (
    <span className={`tabular-nums ${className}`} suppressHydrationWarning>
      {label ? `ends in ${label}` : " "}
    </span>
  );
}
