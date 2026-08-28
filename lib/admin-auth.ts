import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "bmm_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET fehlt oder ist zu kurz (mindestens 16 Zeichen).");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Cookie-Wert: Ablaufzeitpunkt plus Signatur darüber. Kein Zustand auf dem Server. */
function makeToken(): string {
  const exp = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return `${exp}.${sign(exp)}`;
}

function tokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac) return false;
  if (Number(exp) < Date.now()) return false;

  const expected = Buffer.from(sign(exp), "utf8");
  const given = Buffer.from(mac, "utf8");
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

/** Vergleich in konstanter Zeit, damit das Passwort nicht erratbar wird. */
export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD fehlt.");
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return tokenValid(store.get(COOKIE)?.value);
}
