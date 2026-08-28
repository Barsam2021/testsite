import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { withTx } from "@/lib/db";
import { getSettings } from "@/lib/auction";
import { allSpots } from "@/lib/admin-data";
import { Shell } from "@/components/admin/Shell";
import { saveSettings, saveSpot } from "../actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[14px] outline-none transition-shadow focus:border-blue focus:ring-4 focus:ring-blue/15";
const label = "block text-[12px] font-medium tracking-[0.06em] text-ink-2 uppercase";

/** Datetime-local braucht lokale Zeit ohne Zeitzone. */
function forInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminSettings() {
  if (!(await isAdmin())) redirect("/admin/login");

  const settings = await withTx((c) => getSettings(c));
  const spots = await allSpots();
  const specs = Array.isArray(settings.device_specs) ? settings.device_specs : [];
  const unit = settings.currency === "eur" ? "€" : "$";

  return (
    <Shell title="Einstellungen" active="settings">
      <form action={saveSettings} className="mt-6 space-y-8">
        <section className="rounded-2xl border border-hairline bg-white p-6">
          <h2 className="text-[15px] font-semibold">Auktion</h2>
          <p className="mt-1 text-[13px] text-ink-2">
            Gilt ab sofort für neue Gebote. Bereits laufende Gebote behalten ihre Anzahlung.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="goal">Ziel ({unit})</label>
              <input id="goal" name="goal" type="number" min="1" defaultValue={Math.round(settings.goal_cents / 100)} className={`mt-1.5 ${field}`} />
            </div>
            <div>
              <label className={label} htmlFor="auction_ends_at">Ende</label>
              <input id="auction_ends_at" name="auction_ends_at" type="datetime-local" defaultValue={forInput(settings.auction_ends_at)} className={`mt-1.5 ${field}`} />
            </div>
            <div>
              <label className={label} htmlFor="min_increment">Mindestschritt ({unit})</label>
              <input id="min_increment" name="min_increment" type="number" min="1" defaultValue={Math.round(settings.min_increment_cents / 100)} className={`mt-1.5 ${field}`} />
            </div>
            <div>
              <label className={label} htmlFor="deposit_percent">Anzahlung (%)</label>
              <input id="deposit_percent" name="deposit_percent" type="number" min="1" max="100" step="0.5" defaultValue={settings.deposit_bps / 100} className={`mt-1.5 ${field}`} />
            </div>
            <div>
              <label className={label} htmlFor="min_deposit">Mindestanzahlung ({unit})</label>
              <input id="min_deposit" name="min_deposit" type="number" min="1" defaultValue={Math.round(settings.min_deposit_cents / 100)} className={`mt-1.5 ${field}`} />
            </div>
          </div>
          {settings.closed_at && (
            <p className="mt-4 rounded-xl bg-surface px-4 py-3 text-[13px]">
              Diese Auktion ist beendet. Ein neues Ende in der Zukunft öffnet sie nicht wieder — dafür
              muss <code className="text-[12px]">closed_at</code> in der Datenbank geleert werden.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-hairline bg-white p-6">
          <h2 className="text-[15px] font-semibold">Texte</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className={label} htmlFor="headline">Überschrift</label>
              <input id="headline" name="headline" defaultValue={settings.headline} className={`mt-1.5 ${field}`} />
            </div>
            <div>
              <label className={label} htmlFor="subheadline">Unterzeile</label>
              <input id="subheadline" name="subheadline" defaultValue={settings.subheadline} className={`mt-1.5 ${field}`} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-hairline bg-white p-6">
          <h2 className="text-[15px] font-semibold">Das Gerät</h2>
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="device_name">Bezeichnung</label>
                <input id="device_name" name="device_name" defaultValue={settings.device_name} className={`mt-1.5 ${field}`} />
              </div>
              <div>
                <label className={label} htmlFor="device_url">Link zum Angebot</label>
                <input id="device_url" name="device_url" defaultValue={settings.device_url ?? ""} placeholder="https://…" className={`mt-1.5 ${field}`} />
              </div>
            </div>
            <div>
              <label className={label} htmlFor="device_note">Hinweistext</label>
              <input id="device_note" name="device_note" defaultValue={settings.device_note} className={`mt-1.5 ${field}`} />
            </div>
            <div>
              <label className={label} htmlFor="device_specs">Datenblatt</label>
              <p className="mt-1 text-[12px] text-ink-2">
                Eine Zeile je Angabe, Bezeichnung und Wert durch <code>|</code> getrennt.
              </p>
              <textarea
                id="device_specs"
                name="device_specs"
                rows={7}
                defaultValue={specs.map(([k, v]) => `${k} | ${v}`).join("\n")}
                className={`mt-1.5 font-mono text-[13px] ${field}`}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-hairline bg-white p-6">
          <h2 className="text-[15px] font-semibold">Über dich</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="owner_name">Name</label>
              <input id="owner_name" name="owner_name" defaultValue={settings.owner_name} className={`mt-1.5 ${field}`} />
            </div>
            <div>
              <label className={label} htmlFor="owner_email">E-Mail</label>
              <input id="owner_email" name="owner_email" type="email" defaultValue={settings.owner_email ?? ""} className={`mt-1.5 ${field}`} />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="owner_x">X-Profil</label>
              <input id="owner_x" name="owner_x" defaultValue={settings.owner_x ?? ""} placeholder="https://x.com/…" className={`mt-1.5 ${field}`} />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="owner_bio">Kurztext</label>
              <textarea id="owner_bio" name="owner_bio" rows={3} defaultValue={settings.owner_bio} className={`mt-1.5 ${field}`} />
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-85"
        >
          Speichern
        </button>
      </form>

      <section className="mt-12">
        <h2 className="text-[15px] font-semibold">Die zehn Plätze</h2>
        <p className="mt-1 max-w-[64ch] text-[13px] leading-relaxed text-ink-2">
          Der Startpreis gilt nur, solange auf einem Platz noch nichts geboten wurde. Sobald ein
          Gebot vorliegt, richtet sich das Mindestgebot nach dem Höchstgebot plus Mindestschritt.
        </p>
        <div className="mt-4 space-y-2">
          {spots.map((s) => (
            <form
              key={s.id}
              action={saveSpot}
              className="flex flex-wrap items-end gap-3 rounded-2xl border border-hairline bg-white p-4"
            >
              <input type="hidden" name="spot_id" value={s.id} />
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hairline/80 text-[13px] font-semibold tabular-nums text-ink-2">
                {s.id}
              </span>
              <div className="min-w-[200px] flex-1">
                <label className={label} htmlFor={`label-${s.id}`}>Lage</label>
                <input id={`label-${s.id}`} name="label" defaultValue={s.label} className={`mt-1.5 ${field}`} />
              </div>
              <div className="w-32">
                <label className={label} htmlFor={`dims-${s.id}`}>Maße</label>
                <input id={`dims-${s.id}`} name="dims" defaultValue={s.dims} className={`mt-1.5 ${field}`} />
              </div>
              <div className="w-32">
                <label className={label} htmlFor={`price-${s.id}`}>Start ({unit})</label>
                <input
                  id={`price-${s.id}`}
                  name="start_price"
                  type="number"
                  min="1"
                  defaultValue={Math.round(s.start_price_cents / 100)}
                  className={`mt-1.5 tabular-nums ${field}`}
                />
              </div>
              <button
                type="submit"
                className="rounded-full border border-hairline px-4 py-2.5 text-[13px] font-medium text-ink-2 transition-colors hover:text-ink"
              >
                Speichern
              </button>
            </form>
          ))}
        </div>
      </section>
    </Shell>
  );
}
