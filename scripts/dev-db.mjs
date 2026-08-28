/**
 * Startet eine Wegwerf-Postgres-Instanz (PGlite) auf Port 5433 und spielt
 * Schema und Grunddaten ein. Nur für lokale Entwicklung — die Daten liegen
 * unter .pgdata und können jederzeit gelöscht werden.
 *
 *   node scripts/dev-db.mjs
 *   DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5433/postgres" npm run dev
 *
 * Achtung: Der Socket-Server nimmt immer nur EINE Verbindung an. Solange die
 * App läuft, kommt psql nicht daneben — erst die App stoppen, dann psql.
 * In der Produktion steht hier Neon, das ist eine reine Entwicklungshilfe.
 */
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const db = await PGlite.create({ dataDir: process.env.PGDATA_DIR ?? ".pgdata" });
await db.exec(readFileSync("db/schema.sql", "utf8"));
await db.exec(readFileSync("db/seed.sql", "utf8"));

const server = new PGLiteSocketServer({ db, port: 5433, host: "127.0.0.1" });
await server.start();
console.log("Postgres (PGlite) läuft auf 127.0.0.1:5433 — Strg+C beendet ihn.");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await server.stop();
    await db.close();
    process.exit(0);
  });
}
