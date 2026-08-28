import { Pool } from "pg";

/**
 * Minimale Schnittstelle, die sowohl ein pg-Client als auch der PGlite-Adapter
 * aus den Tests erfüllt. Die Auktionslogik hängt nur hiervon ab.
 */
export type Queryable = {
  query(text: string, params?: unknown[]): Promise<{ rows: any[] }>;
};

declare global {
  // eslint-disable-next-line no-var
  var __bmmPool: Pool | undefined;
}

function makePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL fehlt. Neon-Verbindung (die -pooler-Variante) in die Umgebung legen.",
    );
  }
  // Gegen eine lokale Datenbank gibt es kein TLS. Überall sonst ist es Pflicht.
  const host = (() => {
    try {
      return new URL(connectionString).hostname;
    } catch {
      return "";
    }
  })();
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "::1";

  return new Pool({
    connectionString,
    // Auf Vercel läuft jede Anfrage in einer eigenen Lambda-Instanz; der
    // Neon-Pooler übernimmt das Bündeln, hier reicht eine Verbindung.
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ssl: isLocal ? false : { rejectUnauthorized: true },
  });
}

export function pool(): Pool {
  if (!global.__bmmPool) global.__bmmPool = makePool();
  return global.__bmmPool;
}

export async function query<T = any>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await pool().query(text, params);
  return res.rows as T[];
}

export async function one<T = any>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Führt fn in einer Transaktion aus. Wirft fn, wird zurückgerollt.
 * Wird für jede Zustandsänderung an Geboten benutzt.
 */
export async function withTx<T>(fn: (c: Queryable) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
