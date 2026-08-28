import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

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
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Das Logo darf höchstens 2 MB groß sein." }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Erlaubt sind PNG, JPG, WEBP und SVG." },
      { status: 400 },
    );
  }

  try {
    const blob = await put(`logos/${crypto.randomUUID()}.${ext}`, file, {
      access: "public",
      contentType: file.type,
      // Der Dateiname kommt vom Nutzer; ein fester Zufallsname verhindert,
      // dass jemand fremde Uploads überschreibt.
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload fehlgeschlagen." }, { status: 500 });
  }
}
