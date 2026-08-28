# Brand My Mac

Auktionsplattform für Werbeflächen auf einem Laptopdeckel. Zehn Zonen, Live-Auktion
mit 20 % Anzahlung, Freigabe jedes Sponsors von Hand, Admin-Bereich für den Betreiber.

Läuft auf **Next.js 15 · Postgres (Neon) · Stripe · Vercel Blob**.

---

## Wie es funktioniert

1. Ein Sponsor klickt einen Platz, gibt Betrag, Markenname, Website und E-Mail ein
   und lädt sein Logo hoch.
2. Der Server prüft gegen das aktuelle Höchstgebot (Datenbanksperre auf dem Platz),
   legt das Gebot als `pending_payment` an und schickt den Sponsor zu Stripe.
3. Stripe zieht die **Anzahlung** ein und meldet das per Webhook zurück. Erst diese
   signierte Meldung setzt das Gebot auf `review` — dem Browser des Käufers wird
   nichts geglaubt.
4. Auf dem Deckel erscheint der Platz als **„under review"**. Der bisherige Halter
   bleibt sichtbar, bis du entschieden hast.
5. Im Admin gibst du frei oder lehnst ab:
   - **Freigeben** → das Gebot übernimmt den Platz, der bisherige Halter wird
     verdrängt und bekommt seine Anzahlung automatisch zurück.
   - **Ablehnen** → Anzahlung zurück, der Platz behält seinen Halter.
6. Am Ende der Auktion (stündlicher Cron) gewinnen alle Halter, offene Prüfungen
   werden erstattet. Für jeden Gewinner erzeugst du im Admin per Knopf einen
   Stripe-Zahlungslink über den Restbetrag.

Zustände eines Gebots:

```
pending_payment ─┬─> review ─┬─> leading ──> won
                 │           ├─> rejected      └─(überboten)─> outbid
                 └─> expired └─(Auktionsende)─> rejected
```

`leading` und `won` halten einen Platz. `review` hält keinen, treibt aber das
Mindestgebot hoch — sonst könnte man eine schwebende Prüfung unterbieten.

---

## Einrichten

### 1. Datenbank (Neon)

Projekt auf [neon.tech](https://neon.tech) anlegen und die **`-pooler`-Verbindung**
kopieren (nicht die direkte): auf Vercel startet jede Anfrage eine eigene Instanz,
der Pooler bündelt das.

```bash
cp .env.example .env.local        # ausfüllen
npm install
npm run db:migrate                # Tabellen + die zehn Plätze
```

`db:migrate` ist wiederholbar und überschreibt nichts.

### 2. Stripe

1. Testschlüssel aus dem [Dashboard](https://dashboard.stripe.com/apikeys) → `STRIPE_SECRET_KEY`
2. Webhook-Endpoint anlegen:
   - URL `https://DEINE-DOMAIN/api/stripe/webhook`
   - Ereignis **`checkout.session.completed`**
   - Signing secret → `STRIPE_WEBHOOK_SECRET`
3. Lokal testen:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Das gibt ein **eigenes** Signing secret aus — nicht das aus dem Dashboard.

Erst live gehen, wenn du mit Testkarte `4242 4242 4242 4242` einmal durchgespielt
hast: bieten → zahlen → im Admin freigeben → überbieten lassen → Erstattung in
Stripe kontrollieren.

### 3. Logo-Uploads (Vercel Blob)

Im Vercel-Projekt unter *Storage* einen Blob-Store anlegen. `BLOB_READ_WRITE_TOKEN`
setzt Vercel selbst. Erlaubt sind **PNG, JPG und WEBP** bis 2 MB — erkannt an der
Dateisignatur, nicht an der Angabe des Browsers.

SVG ist bewusst ausgeschlossen: eine SVG-Datei darf Skript enthalten, das beim
direkten Aufruf im Ablage-Host ausgeführt wird. Da der Upload offen sein muss
(Bieter haben kein Konto, bevor sie zahlen), wäre das ein offener Skript-Hoster
auf einer Domain, die zur Seite gehört.

Die Adresse eines Logos wird beim Gebot noch einmal serverseitig geprüft: erlaubt
sind nur eigene Pfade und https-Adressen auf dem Blob-Host (erweiterbar über
`LOGO_HOST_ALLOWLIST`). Sie landet sonst als Linkziel im Admin.

### 4. Admin

```bash
ADMIN_PASSWORD="etwas-langes-und-eigenes"
AUTH_SECRET="$(openssl rand -hex 32)"
```

Ein Passwort, ein signiertes Cookie, kein Nutzersystem. `AUTH_SECRET` ändern meldet
alle Sitzungen ab.

### 5. Auktionsende

`vercel.json` meldet einen stündlichen Cron auf `/api/cron/close` an. Der lässt
abgebrochene Bezahlvorgänge verfallen und schließt die Auktion, sobald der
Endzeitpunkt erreicht ist.

`CRON_SECRET` ist **Pflicht**: fehlt es, lehnt der Endpunkt jeden Aufruf mit 503
ab, statt für alle offen zu stehen — und die Auktion schließt sich dann nicht von
selbst.

Das Ende hängt damit am Server, nicht am Countdown im Browser.

---

## Lokal entwickeln

Ohne Neon-Zugang läuft eine Wegwerf-Datenbank im Projekt (PGlite, echtes Postgres
als WebAssembly):

```bash
node scripts/dev-db.mjs           # Terminal 1 — Postgres auf :5433
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5433/postgres" npm run dev
```

Der Socket-Server nimmt immer nur **eine** Verbindung an: solange die App läuft,
kommt `psql` nicht daneben. Daten liegen in `.pgdata/` und können gelöscht werden.

---

## Tests

```bash
npm run test:auction    # Auktionslogik gegen echtes Postgres (PGlite)
npm run typecheck
```

`scripts/test-auction.mjs` fährt den kompletten Lebenslauf durch: Mindestgebot,
Anzahlungsberechnung, doppelte Webhooks, Freigabe mit Verdrängung, Ablehnung,
verfallene Bezahlvorgänge und Auktionsende.

---

## Aufbau

| Datei | Zweck |
|---|---|
| `db/schema.sql`, `db/seed.sql` | Tabellen und die zehn Plätze |
| `lib/auction.ts` | **Der Kern.** Mindestgebot, Freigabe, Ablehnung, Auktionsende |
| `lib/db.ts` | Verbindungspool und Transaktionen |
| `lib/money.ts` | Cent-Rechnung und Formatierung |
| `lib/stripe.ts` | Bezahlseite, Erstattung, Zahlungslink |
| `lib/refunds.ts` | Erstattungen ausführen (nach der Transaktion) |
| `lib/admin-auth.ts` | Passwort und signiertes Cookie |
| `app/api/bid` | Gebot annehmen, prüfen, zu Stripe schicken |
| `app/api/stripe/webhook` | Einzige Stelle, an der eine Zahlung als eingegangen gilt |
| `app/api/cron/close` | Aufräumen und Auktionsende |
| `app/admin` | Übersicht, Freigaben, Einstellungen |
| `components/Lid.tsx` | Der Deckel — 6×3-Raster, Aluminium in reinem CSS |

### Grundsätze im Code

- **Geld ist immer `int` in Cent.** Nie Fließkomma.
- **Jede Zustandsänderung läuft in einer Transaktion** mit `select … for update`
  auf der Platzzeile. Zwei gleichzeitige Gebote können sich nicht überholen.
- **Stripe-Aufrufe passieren nie innerhalb einer Transaktion.** Erstattungen
  liefern die Funktionen als Auftragsliste zurück, `runRefunds` führt sie danach
  aus. Scheitert eine, steht der Zustand trotzdem richtig — der Admin zeigt sie
  unter „Rückerstattungen offen" mit einem Knopf zum erneuten Anstoßen.
- **Der Webhook ist idempotent.** `markPaid` greift nur auf `pending_payment`;
  Mehrfachzustellung bleibt folgenlos.
- **Das `events`-Protokoll** hält jede Änderung fest und ist im Admin einsehbar.

---

## Was noch fehlt

- **Keine E-Mails.** Sponsoren erfahren von Freigabe, Ablehnung oder Erstattung
  nur, wenn du sie anschreibst. Ein Anbieter wie Resend wäre der nächste Schritt.
- **Rechnungen.** Stripe verschickt Belege, aber keine Rechnung mit ausgewiesener
  Umsatzsteuer. Für Firmenkunden in Deutschland ist das früher oder später nötig.
- **Impressum, Datenschutzerklärung und AGB.** `/privacy` und `/terms` sind
  Platzhalter. Bei Verbrauchern als Bietern ist zu prüfen, ob ein Widerrufsrecht
  besteht — die Ausnahme für Versteigerungen greift bei reinen Online-Auktionen
  in der Regel nicht.
- **Erstattungsgebühren.** Stripe erstattet die Transaktionsgebühr nicht. Jedes
  Überbieten kostet dich also etwas — bei vielen kleinen Geboten summiert sich das.

Nicht verbunden mit Apple Inc. MacBook Pro und Mac sind Marken von Apple Inc.
