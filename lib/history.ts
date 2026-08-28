import { SPOTS } from "./spots";

export type HistoryEntry = {
  spotId: number;
  spotName: string;
  amount: number;
  /** Minuten seit dem Gebot */
  agoMinutes: number;
  bidder: string;
};

/**
 * Platzhalter-Gebotshistorie.
 *
 * Das Original führt eine echte Historie mit 111 Geboten. Hier wird sie
 * deterministisch aus Startpreis, Endgebot und Gebotszahl je Platz
 * rekonstruiert, damit die Ansicht ohne Backend etwas Sinnvolles zeigt.
 */
const START: Record<string, number> = { S: 125, M: 200, L: 400 };
const NAMES = [
  "anon", "m.k", "buildinpublic", "anon", "j.rivera", "anon", "solofounder",
  "anon", "t.n", "shipfast", "anon", "l.dupont", "anon", "indiedev", "anon",
  "k.watson", "anon", "devtools.io", "anon", "s.marchetti",
];

export const HISTORY: HistoryEntry[] = (() => {
  const out: HistoryEntry[] = [];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  for (const spot of SPOTS) {
    const from = START[spot.size];
    const step = (spot.bid - from) / Math.max(1, spot.bids - 1);
    for (let i = 0; i < spot.bids; i += 1) {
      const amount = i === spot.bids - 1 ? spot.bid : Math.round((from + step * i) / 5) * 5;
      out.push({
        spotId: spot.id,
        spotName: spot.name,
        amount,
        agoMinutes: Math.round((spot.bids - i) * (40 + rnd() * 900)),
        bidder: NAMES[Math.floor(rnd() * NAMES.length)],
      });
    }
  }
  return out.sort((a, b) => a.agoMinutes - b.agoMinutes);
})();

export function ago(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}
