import { query, one } from "./db";
import { getBoard, getSettings, type BoardSpot, type Settings } from "./auction";
import type { Queryable } from "./db";

/** Ein Eintrag der öffentlichen Gebotshistorie. */
export type HistoryRow = {
  id: string;
  spot_id: number;
  spot_label: string;
  sponsor_name: string;
  amount_cents: number;
  status: string;
  created_at: string;
};

const readOnly: Queryable = { query: async (t, p) => ({ rows: await query(t, p) }) };

export type PageData = {
  settings: Settings;
  spots: BoardSpot[];
  raised_cents: number;
  taken: number;
  history: HistoryRow[];
  total_bids: number;
};

export async function loadPageData(): Promise<PageData> {
  const settings = await getSettings(readOnly);
  const board = await getBoard(readOnly, settings);

  // Nur bezahlte Gebote sind öffentlich. Abgebrochene Bezahlvorgänge
  // würden sonst als echte Gebote erscheinen.
  const history = await query<HistoryRow>(
    `select b.id::text, b.spot_id, s.label as spot_label,
            b.sponsor_name, b.amount_cents, b.status,
            b.created_at
       from bids b
       join spots s on s.id = b.spot_id
      where b.status in ('review','leading','outbid','won','rejected')
      order by b.created_at desc
      limit 100`,
  );

  const counted = await one<{ n: number }>(
    `select count(*)::int as n from bids
      where status in ('review','leading','outbid','won','rejected')`,
  );

  return {
    settings,
    spots: board.spots,
    raised_cents: board.raised_cents,
    taken: board.taken,
    history,
    total_bids: counted?.n ?? 0,
  };
}
