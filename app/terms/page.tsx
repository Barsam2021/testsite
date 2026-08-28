import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Terms — Brand My Mac" };

export default function Terms() {
  return (
    <LegalPage title="Terms">
      <p>
        Platzhalter. Hier gehören die Auktionsbedingungen hin: Mindestgebot und Mindestschritt,
        Höhe und Rückerstattung der Anzahlung, Zuschlag bei Ablauf, Vorbehalt der Freigabe jedes
        Sponsors, Laufzeit des Aufklebers und Haftungsausschluss zu Reichweite und Wirkung.
      </p>
      <p>
        Bei Verbrauchern als Bietern ist zusätzlich zu prüfen, ob ein Widerrufsrecht besteht — die
        Ausnahme für Versteigerungen greift bei reinen Online-Auktionen in der Regel nicht.
      </p>
    </LegalPage>
  );
}
