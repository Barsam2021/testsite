import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;

/**
 * SVG ist bewusst nicht dabei: eine SVG-Datei darf Skript enthalten und wird
 * beim direkten Aufruf im Ablage-Host ausgeführt. Da der Endpunkt offen sein
 * muss — Bieter haben kein Konto, bevor sie zahlen — wäre das ein offener
 * Skript-Hoster auf einer Domain, die zur Seite gehört.
 */
const ALLOWED = [
  { type: "image/png", ext: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
  { type: "image/jpeg", ext: "jpg", magic: [0xff, 0xd8, 0xff] },
  { type: "image/webp", ext: "webp", magic: [0x52, 0x49, 0x46, 0x46] },
] as const;

function matches(bytes: Uint8Array, magic: readonly number[]): boolean {
  return magic.every((b, i) => bytes[i] === b);
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ungültiger Upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei empfangen." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Das Logo darf höchstens 2 MB groß sein." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  // Nach dem Inhalt gehen, nicht nach der Angabe des Browsers: file.type
  // kommt vom Absender und lässt sich frei setzen.
  const kind = ALLOWED.find((a) => matches(bytes, a.magic));
  if (!kind) {
    return NextResponse.json({ error: "Erlaubt sind PNG, JPG und WEBP." }, { status: 400 });
  }

  try {
    const blob = await put(`logos/${crypto.randomUUID()}.${kind.ext}`, Buffer.from(bytes), {
      access: "public",
      // Der Ausliefer-Typ kommt aus der erkannten Signatur, nicht aus der Anfrage.
      contentType: kind.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload fehlgeschlagen." }, { status: 500 });
  }
}
