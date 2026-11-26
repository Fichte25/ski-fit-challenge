# ⛷️ Ski-Fit Challenge

Familien-App (PWA) für 8 Wochen Skivorbereitung vor dem Urlaub 06.–13.02.2027. 3–4 Einheiten pro Woche à ~17 Min, nur Körpergewicht, steigende Intensität. Profile: Papa, Mama, Jule, Marie, Eli.

## Features
- 29 Einheiten (A Beinkraft, B Core & Balance, C Sprung & Koordination, D Mix), Belastung steigt von 30s/30s auf 45s/15s, Übungsvarianten werden schwerer
- Workout-Player mit Timer, Sprachansage (deutsch), Pieptönen, Vibration, Display bleibt an
- Gleiche Übungen für alle, aber persönliche Wiederholungsziele (+5 % gegenüber letztem Mal)
- Punkte, Wochen-Streak (≥3 Einheiten), Familien-Gesamtziel, Countdown, Ranking, Aktivitäts-Feed
- Offline-fähig, installierbar auf dem Homescreen

## Starten
```
npm install
npm run dev      # lokal
npm run build    # Produktion (dist/)
```
Startdatum und Urlaub: `src/plan.ts` (`PROGRAM_START`, `TRIP_START`).

## Hosting (GitHub Pages)
Repo auf GitHub pushen → Settings → Pages → Source „GitHub Actions". Der Workflow `.github/workflows/deploy.yml` veröffentlicht die App; den Link per WhatsApp an die Familie schicken. Auf dem Handy: „Zum Home-Bildschirm hinzufügen".

## Lokal auf dem NAS (nur Heim-WLAN, ohne Cloud)
Voraussetzung: Docker auf dem NAS (Synology „Container Manager", QNAP „Container Station" o. ä.).
1. Ordner `ski-fit-challenge` auf das NAS kopieren (z. B. `/volume1/docker/ski-fit-challenge`).
2. Per SSH oder im Container Manager (Projekt → Erstellen, Pfad `nas/`): `cd nas && docker compose up -d --build`
3. Handys im WLAN öffnen `http://<NAS-IP>:8080/`. Das NAS sollte eine feste IP haben.
4. Das gemeinsame Ranking wird im Ordner `nas/data/completions.json` gespeichert (Backup = Datei kopieren).

Der Container liefert die App und die Sync-Schnittstelle aus – Supabase wird dann nicht gebraucht. Ohne HTTPS gibt es keinen Offline-Modus/keine App-Installation (nur Lesezeichen) und kein automatisches „Display an": in den Handy-Einstellungen die Bildschirmsperre für das Training auf „Nie"/länger stellen.

## Gemeinsames Leaderboard (Supabase, optional)
1. Kostenloses Projekt auf supabase.com anlegen, `supabase/schema.sql` im SQL Editor ausführen.
2. In `public/config.js` `supabaseUrl` und `supabaseKey` (anon/public key) sowie einen eigenen `familyCode` eintragen.
3. Neu deployen. Ohne diese Werte speichert jedes Handy nur lokal.

Hinweis: Die Tabelle ist ohne Login anonym les-/schreibbar (nur Einheiten-Einträge). Für den Familiengebrauch ausreichend.
