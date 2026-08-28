/**
 * Logo-Adressen kommen aus dem Browser des Bieters und landen später in einem
 * <img src> auf der öffentlichen Seite und in einem <a href> im Admin.
 * Ein <a href="javascript:…"> wäre damit gespeichertes XSS gegen den Betreiber,
 * sobald er die Logo-Vorschau anklickt. Deshalb wird die Adresse serverseitig
 * geprüft und nicht bloß im Formular.
 *
 * Erlaubt sind nur:
 *   - eigene Pfade wie /logos/x.png (kein //, das wäre protokollrelativ)
 *   - https-Adressen auf einem ausdrücklich erlaubten Host
 */

/** Vercel Blob liefert Dateien unter dieser Domain aus. */
const DEFAULT_HOSTS = [".public.blob.vercel-storage.com"];

function allowedHosts(): string[] {
  const extra = (process.env.LOGO_HOST_ALLOWLIST ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return [...DEFAULT_HOSTS, ...extra];
}

export function isAllowedLogoUrl(value: string): boolean {
  if (!value) return false;

  // Eigener Pfad. "//host" wäre protokollrelativ und damit fremd.
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;

  const host = parsed.hostname.toLowerCase();
  return allowedHosts().some((allowed) =>
    allowed.startsWith(".") ? host.endsWith(allowed) : host === allowed,
  );
}
