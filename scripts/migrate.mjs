/**
 * Legt Tabellen an und füllt Grunddaten. Beides ist wiederholbar:
 * schema.sql nutzt "if not exists", seed.sql "on conflict do nothing".
 * Lauf: npm run db:migrate
 */
import { readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL fehlt. Beispiel:\n  DATABASE_URL='postgres://…' npm run db:migrate");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: true } });
await client.connect();

try {
  await client.query(readFileSync("db/schema.sql", "utf8"));
  console.log("✓ Schema angelegt");
  await client.query(readFileSync("db/seed.sql", "utf8"));
  console.log("✓ Grunddaten eingespielt");

  const { rows } = await client.query(
    "select (select count(*) from spots)::int as spots, (select count(*) from bids)::int as bids",
  );
  console.log(`  ${rows[0].spots} Plätze, ${rows[0].bids} Gebote in der Datenbank.`);
} catch (err) {
  console.error("Migration fehlgeschlagen:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
