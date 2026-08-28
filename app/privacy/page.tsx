import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Privacy — Brand My Mac" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy">
      <p>
        Platzhalter. Hier gehört die echte Datenschutzerklärung hin: welche Daten beim Bieten und
        beim Eintrag in die Warteliste erhoben werden, wie lange sie gespeichert bleiben, welcher
        Zahlungsdienstleister eingebunden ist und wie sich Auskunft, Berichtigung und Löschung
        anfordern lassen.
      </p>
      <p>
        Für einen Betrieb aus Deutschland heraus kommen Impressumspflicht nach § 5 DDG sowie
        Informationspflichten aus Art. 13 DSGVO dazu.
      </p>
    </LegalPage>
  );
}
