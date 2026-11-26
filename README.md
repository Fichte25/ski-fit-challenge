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

## Gemeinsames Leaderboard (Supabase, optional)
1. Kostenloses Projekt auf supabase.com anlegen, `supabase/schema.sql` im SQL Editor ausführen.
2. In `public/config.js` `supabaseUrl` und `supabaseKey` (anon/public key) sowie einen eigenen `familyCode` eintragen.
3. Neu deployen. Ohne diese Werte speichert jedes Handy nur lokal.

Hinweis: Die Tabelle ist ohne Login anonym les-/schreibbar (nur Einheiten-Einträge). Für den Familiengebrauch ausreichend.
