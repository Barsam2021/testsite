import { NextResponse } from "next/server";

/**
 * Stub. Hier gehört die echte Anbindung hin (Datenbank, Mailversand).
 * Nimmt die Eingabe entgegen, validiert sie und bestätigt.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, handle } = (body ?? {}) as { email?: string; handle?: string };
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  console.log("[waitlist]", { email, handle: handle || null });
  return NextResponse.json({ ok: true });
}
