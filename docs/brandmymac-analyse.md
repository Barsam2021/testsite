# brandmymac.com — Teardown & Aufbauplan

Quelle: gespeichertes DOM von `https://brandmymac.com/`, Stand 28.08.2026.
Alle Zahlen und Klassennamen sind aus dem Markup extrahiert, nicht geschätzt.
Ausführliche Fassung als Dossier: siehe Artifact "Lid Real Estate".

## 1. Was verkauft wird

Solo-Founder (Vincent, FR) finanziert sein erstes MacBook, indem er den Deckel
als Werbefläche versteigert. 10 Klebeplätze, 3 Größen, Live-Auktion ~14 Tage.

| Kennzahl | Wert |
|---|---|
| Eingenommen | 7.018 € |
| Ziel (MacBook Pro 14" M5, 32 GB, 1 TB) | 2.529 € |
| Zielerreichung | 278 % |
| Gebote gesamt | 111 |
| Besucher | 64.728 |
| Restlaufzeit bei Aufnahme | 12d 07h 32m |

Offengelegt: ~21 % der Einnahmen gehen an französische Steuern, das Ziel ist
real erst ab ~3.200 € gedeckt.

## 2. Zonenraster (exakt aus dem Markup)

```
grid-template-columns: repeat(6, minmax(0, 1fr));
grid-template-rows:    minmax(0,1fr) minmax(0,0.9fr) minmax(0,1fr);
```

Das Apple-Logo belegt Zeile 2 / Spalten 3–4 und wird nicht verkauft.

| # | Lage | Größe | Maße | Gebot | Gebote | Sponsor | €/cm² |
|---|---|---|---|---|---|---|---|
| 2 | Marquee — über dem Logo | L | 9,5 × 5,5 | 1.715 € | 3 | frei | 32,80 |
| 1 | Banner oben links | L | 9,5 × 5,5 | 1.200 € | 6 | Postiz | 22,97 |
| 3 | Banner oben rechts | L | 9,5 × 5,5 | 800 € | 17 | PrivateAlps | 15,31 |
| 9 | Unten Mitte — unter dem Logo | M | 9,5 × 4,0 | 700 € | 15 | frei | 18,42 |
| 8 | Streifen unten links | M | 9,5 × 4,0 | 666 € | 13 | frei | 17,53 |
| 10 | Streifen unten rechts | M | 9,5 × 4,0 | 490 € | 13 | PAPERCOAL | 12,89 |
| 5 | Innen links — neben dem Logo | S | 4,5 × 4,5 | 410 € | 12 | frei | 20,25 |
| 4 | Mitte links | S | 4,5 × 4,5 | 350 € | 15 | FILDO.NET | 17,28 |
| 7 | Mitte rechts | S | 4,5 × 4,5 | 350 € | 9 | Thedealsguy | 17,28 |
| 6 | Innen rechts — neben dem Logo | S | 4,5 × 4,5 | 337 € | 8 | Anima Felix | 16,64 |

**Kernerkenntnis:** Auf €/cm² gerechnet schlägt der kleine Platz neben dem Logo
(20,25 €) den großen Banner oben rechts (15,31 €). Lage schlägt Fläche.

## 3. Auktionsmechanik

- Startpreise: **S 125 € · M 200 € · L 400 €**, Aufschlag für Logo-Nähe
- **20 % Anzahlung** (min. 10 €), per Karte sofort belastet
- Überboten → automatische, vollständige Rückerstattung
- Mindestschritt **+10 €**
- Gewonnen → Anzahlung wird angerechnet, Rest per Zahlungslink (manuell:
  *"I'll reach out to arrange payment"*)
- Jeder Sponsor wird **von Hand freigegeben**; eigener UI-Zustand
  `"1 000 € under review"`
- Währungsumschalter €/$, abgerechnet wird in EUR

## 4. Design-System

Stack: **Next.js (App Router, RSC) + Tailwind**, `next/font` Inter Variable,
`next/image`. **Kein Dark Mode** — kein einziges `dark:` im Markup.

Farbtokens (Rollen belegt, Hex = naheliegende Apple-Entsprechung; externes
Stylesheet lag nicht bei):

| Token | Rolle | ca. |
|---|---|---|
| `ink` | Fließtext-Schwarz | #1d1d1f |
| `ink-2` | Sekundärtext (124× verwendet) | #6e6e73 |
| `hairline` | Linien, meist /60–/80 | #d2d2d7 |
| `surface` | Sektions-Grau | #f5f5f7 |
| `blue` / `blue-hover` | Aktion, Links | #0071e3 |
| `apple-green` / `green` | Fortschritt, Beträge | #34c759 |

Typografie:
- H1 `clamp(2rem,5vw,4rem)`, **font-medium**, `leading-[1.05]`,
  `tracking-[-0.06em]` ← die enge Laufweite bei mittlerem Schnitt macht den
  gesamten "teuren" Eindruck
- H2 `text-3xl md:text-4xl`, semibold, `tracking-[-0.015em]`
- Fließtext 13–16 px in `ink-2`, Mikro-Labels 10–12 px
- `tabular-nums` 56× — jede Zahl spaltentreu

Form:
- `rounded-full` 53× (alle Buttons, Badges, Pillen), Karten `rounded-2xl`,
  Deckel `rounded-[18px]` / `sm:rounded-[22px]`
- praktisch **ein** Schatten: `0 1px 3px rgba(0,0,0,0.06)`
- freie Plätze: `border-dashed border-black/25`, Hover `/45`
- Nav: `sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-hairline/70`

Aluminium-Deckel, reines CSS (kein Bild):
```css
aspect-ratio: 1.44; padding: 10px;
background: linear-gradient(172deg, var(--lid-1) 0%, var(--lid-2) 45%, var(--lid-3) 100%);
box-shadow: inset 0 1px 0 rgba(255,255,255,.9),
            inset 0 -1px 0 rgba(0,0,0,.18),
            0 30px 60px -18px rgba(0,0,0,.28);
/* Overlay */
background: radial-gradient(120% 90% at 30% 0%,
            rgba(255,255,255,.55) 0%, rgba(255,255,255,.12) 42%, transparent 70%);
```

## 5. Seitenaufbau (One-Pager, Rhythmus `py-16 md:py-24`)

1. Sticky-Nav — Logo, 4 Anker, €/$-Toggle, "Get a spot"
2. Hero — Live-Besucher-Widget, "Your brand, on my Mac.", Fortschrittsbalken,
   Countdown, interaktiver Deckel (`max-w-[900px]`, `aspect-[1.5]`)
3. Schwarzblock (`bg-ink text-white`) — "Everyone recognises the apple.
   Show your logo right next to it."
4. `#spots` — Tabs "Spots" / "History (111)", Toggle "Live auction" /
   "Final look", volle Tabelle
5. `#how` — 3 Schritte
6. `#specs` — "What the money buys", Gerätedatenblatt, Steuer-Offenlegung
7. `#faq` — 8 Fragen, sehr persönlich
8. `#waitlist` — "Want to do this with your own laptop?" + E-Mail-Feld
9. Über mich + Footer mit Apple-Disclaimer

## 6. Die Lücke

`#waitlist` ist der **einzige Abschnitt ohne Produkt dahinter**. Er sammelt
Adressen für einen Marktplatz, den er erst noch bauen muss — inklusive
Multi-Tenancy, Provisioning, Subdomains und TLS.

Wettbewerb existiert bereits: `travelyourbrand.com`,
`brandmymacmini.online` (10 Plätze auf Mac Mini, Ziel 2.299 $, Polar).

## 7. USPs für den eigenen Nachbau

1. **Marktplatz statt Warteliste** — multitenant-platform liefert Subdomain,
   TLS, Deploy-Pipeline, MinIO-Bucket und Rate-Limiting pro Tenant bereits.
   Creator ist in Minuten live, er bräuchte Wochen.
2. **Beweisbare Sichtbarkeit** — seine FAQ sagt wörtlich *"I can't promise you
   impressions or ROI"*. Sponsor-Dashboard mit datierten Foto-Nachweisen,
   Event-Kalender, Clip-Sekunden, Monatsreport.
3. **QR/NFC pro Sticker** — echte Klicks je Sponsor, gezählt cookielos aus dem
   Traefik-Accesslog. Offline-Werbung mit Klickstatistik, DSGVO-sauber.
4. **Laufzeit statt Ewigkeit** — 6-/12-Monats-Slots mit Verlängerung und
   Kategorie-Exklusivität. Aus One-Shot wird wiederkehrender Umsatz.
5. **Rechnung mit ausgewiesener USt** — verschiebt den Kauf vom Privatvergnügen
   ins Marketingbudget. Sein Checkout ist "I'll reach out to arrange payment".
6. **"Brand My X"** — Lastenrad, Camper, Bandcase, Foodtruck, Messestand.
   Der Laptopdeckel ist SKU 1, nicht das Produkt. Löst nebenbei das Apple-Thema.
7. **Offene Kasse als Feature** — seine Steuer-Offenlegung steckt in einem
   `title`-Tooltip. Als automatische, öffentliche Kampagnenkasse skaliert sie
   über alle Creator.

Zusatz-Taktiken: **Sofortkauf-Preis** neben der Auktion (er hat nur Auktion) und
**Zweitmarkt** für gehaltene Plätze gegen Provision.

## 8. Aufbauplan

| Phase | Zeitraum | Inhalt |
|---|---|---|
| 1 | Woche 1–2 | Eigene Auktion: Zonenraster, Preise nach €/cm² × Lage, Anzahlungslogik, manuelle Freigabe, offene Kasse |
| 2 | Woche 2–4 | Nachweis-Pipeline: Kurzlinks, Foto-Nachweise nach MinIO, Monatsreport, Rechnung + USt |
| 3 | Woche 4–8 | Marktplatz: Self-Service-Onboarding, automatisches Provisioning, Auszahlung, öffentliches Verzeichnis |
| 4 | ab Monat 3 | Generischer Zonen-Editor, Laufzeit-Slots, Zweitmarkt, Sofortkauf |

## 9. Technik-Mapping

| Baustein | Status | Aufwand |
|---|---|---|
| Next.js 15 / React 19 Frontend | vorhanden (gleicher Stack wie Dashboard) | gering |
| Postgres pro Tenant | vorhanden | gering |
| Subdomain + TLS (Traefik, DNS-01) | vorhanden | gering |
| Logo-Uploads (MinIO + IAM) | vorhanden | gering |
| Cookielose Analytics | vorhanden | mittel (pro Sponsor aufschlüsseln) |
| Rate-Limiting | vorhanden | gering |
| **Auktions-Engine** | neu | hoch |
| **Zahlung mit Anzahlung** | neu | hoch |
| **Zonen-Editor** | neu | mittel |
| **Rechnung + USt** | neu | mittel |

Kritisch: Gebote atomar per Zeilensperre auf dem Platz, Gebot und Anzahlung in
**einer** Transaktion, Ablauf per Job. Der Countdown im Frontend ist Dekoration,
die Wahrheit steht in der Datenbank.

## 10. Risiken

- **Apple-Markenrecht** — Disclaimer übernehmen, nie mit dem Logo werben,
  Produkt nicht nach der Marke benennen. USP 6 entschärft strukturell.
- **Widerrufsrecht** — die Versteigerungs-Ausnahme greift bei reinen
  Online-Auktionen i. d. R. nicht; bei Verbrauchern als Bietern ist eine
  Widerrufsbelehrung nötig. Vor dem Start anwaltlich klären.
- **Haftung für Sponsor-Inhalte** — manuelle Freigabe, dokumentierte
  Ablehnungsgründe, Inhaltsrichtlinie als Prozess, nicht als Bauchgefühl.
- **Design 1:1** — Mechanik und Aufbau sind frei, konkrete Gestaltung und Texte
  potenziell nicht. Struktur übernehmen, eigene Handschrift geben.

*Keine Rechts- oder Steuerberatung.*
