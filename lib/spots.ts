export type Size = "S" | "M" | "L";

export type Spot = {
  /** Nummer wie auf dem Deckel */
  id: number;
  /** Lage-Bezeichnung */
  name: string;
  size: Size;
  sizeLabel: string;
  dims: string;
  /** CSS grid-area im 6x3-Raster des Deckels */
  area: string;
  /** aktuelles Höchstgebot in Euro */
  bid: number;
  bids: number;
  /** eingegangenes, noch nicht freigegebenes Gebot */
  pending?: number;
  sponsor?: {
    name: string;
    /** true = nur Logo auf dem Deckel, kein Textlabel */
    logoOnly?: boolean;
    url: string;
    logo: string;
  };
};

export const SIZE_LABEL: Record<Size, string> = {
  S: "Small",
  M: "Medium",
  L: "Large",
};

/** Startpreise je Größe */
export const START_PRICE: Record<Size, number> = { S: 125, M: 200, L: 400 };

export const GOAL = 2529;
export const VISITORS = 64728;
/** Auktionsende — im Original ein fester Zeitpunkt, hier relativ zum Build */
export const AUCTION_END = "2026-09-09T09:32:00Z";

export const SPOTS: Spot[] = [
  {
    id: 1,
    name: "Top left banner",
    size: "L",
    sizeLabel: "Large",
    dims: "9.5 × 5.5 cm",
    area: "1 / 1 / auto / span 2",
    bid: 1200,
    bids: 6,
    sponsor: { name: "Postiz", url: "https://postiz.io/", logo: "/logos/postiz.svg" },
  },
  {
    id: 2,
    name: "Marquee — above the logo",
    size: "L",
    sizeLabel: "Large",
    dims: "9.5 × 5.5 cm",
    area: "1 / 3 / auto / span 2",
    bid: 1715,
    bids: 3,
    sponsor: { name: "See.io", logoOnly: true, url: "https://see.io/", logo: "/logos/see-io.svg" },
  },
  {
    id: 3,
    name: "Top right banner",
    size: "L",
    sizeLabel: "Large",
    dims: "9.5 × 5.5 cm",
    area: "1 / 5 / auto / span 2",
    bid: 800,
    bids: 17,
    pending: 1000,
    sponsor: { name: "PrivateAlps", url: "https://privatealps.net/", logo: "/logos/privatealps.svg" },
  },
  {
    id: 4,
    name: "Middle left",
    size: "S",
    sizeLabel: "Small",
    dims: "4.5 × 4.5 cm",
    area: "2 / 1 / auto / span 1",
    bid: 350,
    bids: 15,
    sponsor: { name: "FILDO.NET", url: "https://fildo.net/", logo: "/logos/fildo.svg" },
  },
  {
    id: 5,
    name: "Inner left — beside the logo",
    size: "S",
    sizeLabel: "Small",
    dims: "4.5 × 4.5 cm",
    area: "2 / 2 / auto / span 1",
    bid: 410,
    bids: 12,
    sponsor: { name: "Surf Office", logoOnly: true, url: "https://www.surfoffice.com/", logo: "/logos/surfoffice.svg" },
  },
  {
    id: 6,
    name: "Inner right — beside the logo",
    size: "S",
    sizeLabel: "Small",
    dims: "4.5 × 4.5 cm",
    area: "2 / 5 / auto / span 1",
    bid: 337,
    bids: 8,
    sponsor: { name: "Anima Felix anxiety app", url: "https://animafelix.com/", logo: "/logos/animafelix.svg" },
  },
  {
    id: 7,
    name: "Middle right",
    size: "S",
    sizeLabel: "Small",
    dims: "4.5 × 4.5 cm",
    area: "2 / 6 / auto / span 1",
    bid: 350,
    bids: 9,
    sponsor: { name: "Thedealsguy", url: "https://tdgdeals.com/", logo: "/logos/thedealsguy.svg" },
  },
  {
    id: 8,
    name: "Bottom left strip",
    size: "M",
    sizeLabel: "Medium",
    dims: "9.5 × 4 cm",
    area: "3 / 1 / auto / span 2",
    bid: 666,
    bids: 13,
    sponsor: { name: "VedicAstrology.com", logoOnly: true, url: "https://vedicastrology.com/", logo: "/logos/vedicastrology.svg" },
  },
  {
    id: 9,
    name: "Bottom center — under the logo",
    size: "M",
    sizeLabel: "Medium",
    dims: "9.5 × 4 cm",
    area: "3 / 3 / auto / span 2",
    bid: 700,
    bids: 15,
    sponsor: { name: "Race Code", logoOnly: true, url: "https://race-code.com/", logo: "/logos/racecode.svg" },
  },
  {
    id: 10,
    name: "Bottom right strip",
    size: "M",
    sizeLabel: "Medium",
    dims: "9.5 × 4 cm",
    area: "3 / 5 / auto / span 2",
    bid: 490,
    bids: 13,
    pending: 500,
    sponsor: { name: "PAPERCOAL", url: "https://papercoal.com/", logo: "/logos/papercoal.svg" },
  },
];

export const RAISED = SPOTS.reduce((sum, s) => sum + s.bid, 0);
export const TOTAL_BIDS = SPOTS.reduce((sum, s) => sum + s.bids, 0);
export const TAKEN = SPOTS.filter((s) => s.sponsor).length;

/** Tabellen- und Kartensortierung: höchstes Gebot zuerst */
export const SPOTS_BY_BID = [...SPOTS].sort((a, b) => b.bid - a.bid);
