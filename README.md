# Brand My Mac — Nachbau

1:1-Nachbau von [brandmymac.com](https://brandmymac.com/) in Next.js.
Grundlage ist das gespeicherte DOM der Originalseite (Stand 28.08.2026):
Raster, Farbrollen, Typografie, Abstände, Texte und alle Auktionsdaten sind
daraus übernommen.

## Starten

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Inter über `next/font`.
Wie im Original: eine einzige Seite, kein Dark Mode.

## Aufbau

| Datei | Inhalt |
|---|---|
| `app/page.tsx` | Seitenkomposition, hält den Zustand des Gebots-Dialogs |
| `components/Nav.tsx` | Sticky-Leiste mit Ankern, €/$-Umschalter, „Get a spot“ |
| `components/Hero.tsx` | Überschrift, Fortschrittsbalken, Countdown |
| `components/Lid.tsx` | Der Deckel — 6×3-Raster, Aluminium in reinem CSS |
| `components/DarkPitch.tsx` | Schwarzer Zwischenblock |
| `components/Spots.tsx` | Auktionstabelle, Mobil-Karten, Tabs Spots/History |
| `components/HowItWorks.tsx` | Die drei Schritte |
| `components/Specs.tsx` | Gerätedatenblatt |
| `components/Faq.tsx` | Acht Fragen als `<details>`-Akkordeon |
| `components/Waitlist.tsx` | Formular, postet auf `/api/waitlist` |
| `components/BidDialog.tsx` | Gebotsdialog mit Mindestschritt und Anzahlung |
| `lib/spots.ts` | Die zehn Plätze: Lage, Größe, Rasterposition, Gebote |
| `lib/format.ts` | Währungsformatierung |
| `lib/history.ts` | Gebotshistorie |

## Design-Tokens

In `app/globals.css` unter `@theme`, benannt wie im Original:

| Token | Wert | Rolle |
|---|---|---|
| `ink` | `#1d1d1f` | Fließtext |
| `ink-2` | `#6e6e73` | Sekundärtext |
| `hairline` | `#d2d2d7` | Linien |
| `surface` | `#f5f5f7` | Sektionshintergrund |
| `blue` / `blue-hover` | `#0071e3` / `#0077ed` | Aktion, Links |
| `green` / `apple-green` | `#1d8f4b` / `#34c759` | Beträge, Fortschritt |

Der Aluminiumverlauf des Deckels liegt als `--lid-1/2/3` auf `:root`.

## Das Zonenraster

```
grid-template-columns: repeat(6, minmax(0, 1fr));
grid-template-rows:    minmax(0,1fr) minmax(0,0.9fr) minmax(0,1fr);
```

Zeile 1: drei Large-Felder à zwei Spalten. Zeile 2: vier Small-Felder,
das Apple-Logo liegt auf Spalte 3–4 und wird nicht verkauft.
Zeile 3: drei Medium-Felder à zwei Spalten.

## Was noch fehlt

- **Sponsorlogos** in `public/logos/` sind Platzhalter — die Originalbitmaps
  lagen der gespeicherten Seite nicht bei.
- **Kein Backend.** `/api/waitlist` protokolliert nur; der Gebotsdialog rechnet
  Mindestschritt und Anzahlung korrekt, löst aber keine Zahlung aus.
- **Gebotshistorie** in `lib/history.ts` ist aus den Gebotszahlen je Platz
  deterministisch erzeugt, nicht echt.
- **Live-Besucherzähler** des Originals (eingebettetes Widget) ist nicht dabei.
- `privacy` und `terms` sind Platzhalterseiten.

Nicht verbunden mit Apple Inc. oder brandmymac.com.
