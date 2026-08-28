"use client";

import { useEffect, useState } from "react";

function remaining(end: number, now: number): string | null {
  const ms = end - now;
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return d > 0
    ? `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`
    : `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

/**
 * Reine Anzeige. Ob die Auktion wirklich läuft, entscheidet der Server —
 * hier wird nur heruntergezählt.
 */
export function Countdown({ endsAt, closed }: { endsAt: string; closed: boolean }) {
  const end = new Date(endsAt).getTime();
  const [label, setLabel] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tick = () => {
      setLabel(remaining(end, Date.now()));
      setReady(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);

  if (closed) return <span className="tabular-nums">has ended</span>;
  if (!ready) return <span className="tabular-nums">&nbsp;</span>;
  if (!label) return <span className="tabular-nums">has ended</span>;
  return <span className="tabular-nums" suppressHydrationWarning>{`ends in ${label}`}</span>;
}
