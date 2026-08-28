/**
 * Testet Schema und Auktionslogik gegen echtes Postgres (PGlite/WASM).
 * Lauf: npm run test:auction
 */
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const A = await import("../.tmp-test/auction.js");
const M = await import("../.tmp-test/money.js");

const db = new PGlite();
const c = { query: (text, params) => db.query(text, params ?? []) };

let passed = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { passed += 1; console.log(`  ✓ ${name}`); }
  else { failures.push(name); console.log(`  ✗ ${name}${extra ? ` — ${extra}` : ""}`); }
}
function eq(name, actual, expected) {
  check(name, Object.is(actual, expected), `erwartet ${expected}, war ${actual}`);
}

console.log("\nSchema und Seed");
await db.exec(readFileSync("db/schema.sql", "utf8"));
await db.exec(readFileSync("db/seed.sql", "utf8"));
const settings = await A.getSettings(c);
eq("zehn Plätze angelegt", (await c.query("select count(*)::int n from spots")).rows[0].n, 10);
eq("Mindestschritt 10 €", settings.min_increment_cents, 1000);
eq("Anzahlung 20 %", settings.deposit_bps, 2000);

console.log("\nLeeres Brett");
let board = await A.getBoard(c, settings);
eq("nichts eingenommen", board.raised_cents, 0);
eq("kein Platz vergeben", board.taken, 0);
eq("Mindestgebot Platz 2 = Startpreis", board.spots.find((s) => s.id === 2).min_next_cents, 60000);

console.log("\nAnzahlung");
eq("20 % von 500 €", M.depositFor(50000, 2000, 1000), 10000);
eq("Sockelbetrag greift bei 20 €", M.depositFor(2000, 2000, 1000), 1000);

console.log("\nGebot unter Startpreis");
const tooLow = await A.createPendingBid(c, settings, {
  spot_id: 2, amount_cents: 50000, sponsor_name: "Zu billig",
  sponsor_url: null, sponsor_email: "a@b.de", logo_url: null,
});
check("wird abgelehnt", tooLow.ok === false);
eq("nennt das Mindestgebot", tooLow.min_next_cents, 60000);

console.log("\nErstes gültiges Gebot");
const first = await A.createPendingBid(c, settings, {
  spot_id: 2, amount_cents: 60000, sponsor_name: "Alpha",
  sponsor_url: "https://alpha.test", sponsor_email: "alpha@test.de", logo_url: "/l/a.svg",
});
check("angenommen", first.ok === true);
eq("Anzahlung 120 €", first.deposit_cents, 12000);
board = await A.getBoard(c, settings);
eq("unbezahlt zählt nicht", board.raised_cents, 0);

console.log("\nZahlungseingang");
await A.attachSession(c, first.bid_id, "cs_alpha");
const paid = await A.markPaid(c, "cs_alpha", "pi_alpha");
check("Gebot geht in Prüfung", paid.changed === true);
const again = await A.markPaid(c, "cs_alpha", "pi_alpha");
check("zweiter Webhook ändert nichts (idempotent)", again.changed === false);
board = await A.getBoard(c, settings);
const s2 = board.spots.find((s) => s.id === 2);
eq("zeigt sich als 'under review'", s2.review_amount_cents, 60000);
check("Platz noch ohne Halter", s2.lead === null);
eq("noch nichts eingenommen", board.raised_cents, 0);
eq("Mindestgebot steigt trotzdem", s2.min_next_cents, 61000);

console.log("\nFreigabe");
const approved = await A.approveBid(c, first.bid_id);
check("Freigabe klappt", approved.ok === true);
eq("keine Rückerstattung nötig", approved.refunds.length, 0);
board = await A.getBoard(c, settings);
const s2b = board.spots.find((s) => s.id === 2);
eq("Alpha hält den Platz", s2b.lead?.sponsor_name, "Alpha");
eq("600 € eingenommen", board.raised_cents, 60000);
eq("ein Platz vergeben", board.taken, 1);
const doubleApprove = await A.approveBid(c, first.bid_id);
check("zweite Freigabe wird verweigert", doubleApprove.ok === false);

console.log("\nÜberbieten");
const tooSmallStep = await A.createPendingBid(c, settings, {
  spot_id: 2, amount_cents: 60500, sponsor_name: "Knauser",
  sponsor_url: null, sponsor_email: "k@test.de", logo_url: null,
});
check("5 € Schritt reicht nicht", tooSmallStep.ok === false);

const second = await A.createPendingBid(c, settings, {
  spot_id: 2, amount_cents: 61000, sponsor_name: "Beta",
  sponsor_url: null, sponsor_email: "beta@test.de", logo_url: "/l/b.svg",
});
check("10 € Schritt reicht", second.ok === true);
await A.attachSession(c, second.bid_id, "cs_beta");
await A.markPaid(c, "cs_beta", "pi_beta");

board = await A.getBoard(c, settings);
const s2c = board.spots.find((s) => s.id === 2);
eq("Alpha hält weiter, bis freigegeben wird", s2c.lead?.sponsor_name, "Alpha");
eq("Beta steht in Prüfung", s2c.review_amount_cents, 61000);
eq("eingenommen bleibt bei Alpha", board.raised_cents, 60000);

const approved2 = await A.approveBid(c, second.bid_id);
eq("verdrängt genau einen Halter", approved2.refunds.length, 1);
eq("Rückerstattung geht an Alpha", approved2.refunds[0].sponsor_email, "alpha@test.de");
eq("erstattet die volle Anzahlung", approved2.refunds[0].deposit_cents, 12000);
eq("Grund: überboten", approved2.refunds[0].reason, "outbid");
board = await A.getBoard(c, settings);
eq("Beta hält jetzt den Platz", board.spots.find((s) => s.id === 2).lead?.sponsor_name, "Beta");
eq("eingenommen jetzt 610 €", board.raised_cents, 61000);

console.log("\nAblehnung");
const third = await A.createPendingBid(c, settings, {
  spot_id: 2, amount_cents: 70000, sponsor_name: "Zwielichtig",
  sponsor_url: null, sponsor_email: "z@test.de", logo_url: null,
});
await A.attachSession(c, third.bid_id, "cs_gamma");
await A.markPaid(c, "cs_gamma", "pi_gamma");
const rejected = await A.rejectBid(c, third.bid_id, "Logo passt nicht");
check("Ablehnung klappt", rejected.ok === true);
eq("erstattet die Anzahlung", rejected.refunds[0].deposit_cents, 14000);
board = await A.getBoard(c, settings);
eq("Beta hält den Platz weiterhin", board.spots.find((s) => s.id === 2).lead?.sponsor_name, "Beta");
eq("Mindestgebot fällt zurück auf Beta + 10 €", board.spots.find((s) => s.id === 2).min_next_cents, 62000);

console.log("\nAbgebrochene Bezahlvorgänge");
await A.createPendingBid(c, settings, {
  spot_id: 5, amount_cents: 20000, sponsor_name: "Abbrecher",
  sponsor_url: null, sponsor_email: "x@test.de", logo_url: null,
});
eq("frische Vorgänge bleiben stehen", await A.expireStale(c, 30), 0);
await c.query("update bids set created_at = now() - interval '2 hours' where status = 'pending_payment'");
eq("alte Vorgänge verfallen", await A.expireStale(c, 30), 1);
board = await A.getBoard(c, settings);
eq("Platz 5 wieder zum Startpreis", board.spots.find((s) => s.id === 5).min_next_cents, 20000);

console.log("\nGebotszähler");
// Alpha (überboten), Beta (Halter), Zwielichtig (abgelehnt) — alle drei haben gezahlt.
eq("Platz 2 zählt drei bezahlte Gebote", board.spots.find((s) => s.id === 2).bid_count, 3);
eq("verfallener Vorgang auf Platz 5 zählt nicht", board.spots.find((s) => s.id === 5).bid_count, 0);

console.log("\nAuktionsende");
const fourth = await A.createPendingBid(c, settings, {
  spot_id: 9, amount_cents: 30000, sponsor_name: "Späteinsteiger",
  sponsor_url: null, sponsor_email: "s@test.de", logo_url: null,
});
await A.attachSession(c, fourth.bid_id, "cs_delta");
await A.markPaid(c, "cs_delta", "pi_delta");
const closed = await A.closeAuction(c);
eq("ein Gewinner", closed.won, 1);
eq("offene Prüfung wird erstattet", closed.refunds.length, 1);
eq("Grund: Auktion beendet", closed.refunds[0].reason, "auction_closed");
const after = await A.getSettings(c);
check("Auktion ist als beendet markiert", after.closed_at !== null);
board = await A.getBoard(c, settings);
eq("Gewinner bleibt sichtbar", board.spots.find((s) => s.id === 2).lead?.sponsor_name, "Beta");
eq("eingenommen bleibt 610 €", board.raised_cents, 61000);

const blocked = await A.createPendingBid(c, after, {
  spot_id: 1, amount_cents: 99999, sponsor_name: "Zu spät",
  sponsor_url: null, sponsor_email: "l@test.de", logo_url: null,
});
check("nach Ende sind keine Gebote mehr möglich", blocked.ok === false);

console.log("\nProtokoll");
const events = (await c.query("select kind, count(*)::int n from events group by kind order by kind")).rows;
check("jede Zustandsänderung ist protokolliert", events.length >= 5, JSON.stringify(events));

console.log(`\n${passed} bestanden, ${failures.length} fehlgeschlagen`);
if (failures.length) { console.log("Fehlgeschlagen:\n  " + failures.join("\n  ")); process.exit(1); }
await db.close();
