import './styles.css';
import {
  PHASES, PROGRAM_START, SESSION_TITLES, TOTAL_SESSIONS, TRIP_END, TRIP_START, WEEKS,
  buildWorkout, weekSessions, type Segment, type Workout,
} from './plan';
import {
  PEOPLE, addCompletion, currentWeek, daysBetween, doneIdx, lastSync, nextIdx, onChange,
  pointsFor, remoteEnabled, save, setRate, state, streakWeeks, sync, syncStatus,
  targetReps, totalPoints, weekCount,
} from './store';
import { beep, buzz, say, unlockAudio } from './audio';

type View = 'home' | 'plan' | 'family' | 'preview' | 'player' | 'finish';
let view: View = 'home';
let tab: 'home' | 'plan' | 'family' = 'home';
let workout: Workout | null = null;
let finishedPoints = 0;

const app = document.getElementById('app')!;
const me = () => PEOPLE.find((p) => p.id === state.me) ?? null;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const dateDe = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

function go(v: View) {
  view = v;
  if (v === 'home' || v === 'plan' || v === 'family') tab = v;
  render();
  window.scrollTo(0, 0);
}

function nav() {
  const t = (id: 'home' | 'plan' | 'family', icon: string, label: string) =>
    `<button class="tab ${tab === id ? 'on' : ''}" data-go="${id}"><span>${icon}</span>${label}</button>`;
  return `<nav class="tabs">${t('home', '🏠', 'Start')}${t('plan', '📅', 'Plan')}${t('family', '🏆', 'Familie')}</nav>`;
}

function profileView() {
  return `<main class="center">
    <h1>⛷️ Ski-Fit Challenge</h1>
    <p class="muted">8 Wochen bis zum Skiurlaub. Wer bist du?</p>
    <div class="grid">${PEOPLE.map((p) => `<button class="person" style="--c:${p.color}" data-me="${p.id}"><span class="em">${p.emoji}</span>${p.name}</button>`).join('')}</div>
  </main>`;
}

function bar(value: number, max: number, color = 'var(--accent)') {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return `<div class="bar"><i style="width:${pct}%;background:${color}"></i></div>`;
}

function homeView() {
  const p = me()!;
  const today = new Date();
  const daysToTrip = daysBetween(today, TRIP_START);
  const toStart = daysBetween(today, PROGRAM_START);
  const week = currentWeek();
  const done = doneIdx(p.id).size;
  const next = nextIdx(p.id);
  const wIdx = week - 1;
  const target = weekSessions(week).length;
  const have = weekCount(p.id, wIdx);
  const all = state.completions.length;
  const goal = PEOPLE.length * TOTAL_SESSIONS;
  const nextW = next !== null ? buildWorkout(next) : null;
  return `<main>
    <header class="top"><div><small>Hallo ${p.name} ${p.emoji}</small><h1>Ski-Fit</h1></div>
      <button class="chip" data-act="switch">Wechseln</button></header>
    <section class="card hero">
      <div class="count"><b>${Math.max(daysToTrip, 0)}</b><span>Tage bis zum Skiurlaub<br><small>${dateDe(TRIP_START)}–${dateDe(TRIP_END)}2027</small></span></div>
      <p class="muted">${toStart > 0 ? `Challenge startet in ${toStart} Tagen (${dateDe(PROGRAM_START)}) – du kannst aber schon loslegen!` : `Woche ${week} von ${WEEKS} · ${PHASES[wIdx]}`}</p>
    </section>
    ${nextW ? `<section class="card">
      <small class="label">Nächste Einheit · ${done + 1} von ${TOTAL_SESSIONS}</small>
      <h2>${nextW.type} · ${nextW.title}</h2>
      <p class="muted">≈ ${Math.round(nextW.totalSec / 60)} Min · ${nextW.exercises.length} Übungen × ${nextW.rounds} Runden · ${nextW.work}s Belastung / ${nextW.rest}s Pause</p>
      <button class="btn" data-preview="${nextW.idx}">Einheit starten</button>
    </section>` : `<section class="card"><h2>🎉 Alle ${TOTAL_SESSIONS} Einheiten geschafft!</h2><p class="muted">Du bist bereit für die Piste. Halte dich bis zur Abreise mit Wiederholungen fit.</p></section>`}
    <section class="card two">
      <div><small class="label">Diese Woche</small><h2>${have} / ${target}</h2>${bar(have, target)}</div>
      <div><small class="label">Streak</small><h2>🔥 ${streakWeeks(p.id)} <small>Wochen</small></h2><small class="muted">≥3 Einheiten/Woche</small></div>
    </section>
    <section class="card"><small class="label">Mein Fortschritt</small><h2>${done} / ${TOTAL_SESSIONS} <small>· ${totalPoints(p.id)} Punkte</small></h2>${bar(done, TOTAL_SESSIONS)}</section>
    <section class="card"><small class="label">Familien-Ziel</small><h2>${all} / ${goal} Einheiten</h2>${bar(all, goal, 'var(--gold)')}<p class="muted">${goalText(all, goal)}</p></section>
  </main>${nav()}`;
}

function goalText(all: number, goal: number) {
  const pct = (all / goal) * 100;
  if (pct >= 100) return '🏔️ Familien-Ziel erreicht – ab auf die Piste!';
  if (pct >= 75) return '🔥 Fast geschafft – noch ein Endspurt!';
  if (pct >= 50) return '💪 Halbzeit überschritten!';
  if (pct >= 25) return '👍 Erstes Viertel geschafft!';
  return 'Gemeinsam schaffen wir das – jede Einheit zählt!';
}

function planView() {
  const p = me()!;
  const done = doneIdx(p.id);
  const next = nextIdx(p.id);
  return `<main><header class="top"><h1>Trainingsplan</h1></header>
    ${Array.from({ length: WEEKS }, (_, i) => {
      const w = i + 1;
      const start = new Date(PROGRAM_START.getTime() + i * 7 * 86400000);
      return `<section class="card"><small class="label">Woche ${w} · ${PHASES[i]} · ab ${dateDe(start)}</small>
        <div class="list">${weekSessions(w).map((s) => {
          const wk = buildWorkout(s.idx);
          const d = done.has(s.idx);
          return `<button class="row ${d ? 'done' : ''} ${s.idx === next ? 'next' : ''}" data-preview="${s.idx}">
            <span class="num">${d ? '✓' : s.idx + 1}</span>
            <span><b>${s.type} · ${SESSION_TITLES[s.type]}</b><br><small class="muted">${wk.work}s/${wk.rest}s · ${Math.round(wk.totalSec / 60)} Min</small></span></button>`;
        }).join('')}</div></section>`;
    }).join('')}
    <p class="muted center-t">Du kannst jede Einheit auswählen – empfohlen ist die Reihenfolge von oben nach unten (2 Tage Pause zwischen intensiven Einheiten).</p>
  </main>${nav()}`;
}

function familyView() {
  const rows = PEOPLE.map((p) => ({ p, pts: totalPoints(p.id), n: doneIdx(p.id).size, wk: weekCount(p.id, Math.max(0, Math.min(WEEKS - 1, currentWeek() - 1))), s: streakWeeks(p.id) })).sort((a, b) => b.pts - a.pts);
  const all = state.completions.length;
  const goal = PEOPLE.length * TOTAL_SESSIONS;
  const feed = [...state.completions].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);
  const st = !remoteEnabled ? 'Nur lokal (Supabase nicht eingerichtet – siehe README)' : syncStatus === 'error' ? '⚠️ Sync-Fehler (offline?)' : syncStatus === 'busy' ? 'Synchronisiere …' : `✓ Synchronisiert${lastSync ? ' ' + lastSync.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''}`;
  return `<main><header class="top"><h1>Familie</h1><button class="chip" data-act="sync">Aktualisieren</button></header>
    <section class="card"><small class="label">Familien-Ziel</small><h2>${all} / ${goal}</h2>${bar(all, goal, 'var(--gold)')}<p class="muted">${goalText(all, goal)}</p><small class="muted">${st}</small></section>
    <section class="card"><small class="label">Ranking (Punkte)</small>
      ${rows.map((r, i) => `<div class="rank"><span class="pos">${['🥇', '🥈', '🥉'][i] ?? i + 1}</span><span class="em">${r.p.emoji}</span>
        <div class="grow"><b>${r.p.name}</b><small class="muted"> · ${r.n}/${TOTAL_SESSIONS} Einheiten · diese Woche ${r.wk} · 🔥${r.s}</small>${bar(r.n, TOTAL_SESSIONS, r.p.color)}</div><b>${r.pts}</b></div>`).join('')}
    </section>
    <section class="card"><small class="label">Letzte Aktivitäten</small>
      ${feed.length ? feed.map((c) => { const p = PEOPLE.find((x) => x.id === c.person); return `<div class="feed">${p?.emoji ?? ''} <b>${esc(p?.name ?? c.person)}</b> hat Einheit ${c.idx + 1} (${esc(c.title)}) geschafft · +${c.points} <small class="muted">${new Date(c.at).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}</small></div>`; }).join('') : '<p class="muted">Noch nichts – seid die Ersten!</p>'}
    </section>
    <section class="card"><label class="switch"><input type="checkbox" data-act="sound" ${state.sound ? 'checked' : ''}/> Ton & Sprachansage</label></section>
  </main>${nav()}`;
}

function previewView() {
  const w = workout!;
  const p = me()!;
  return `<main><header class="top"><button class="chip" data-go="${tab}">← Zurück</button><span class="muted">Einheit ${w.idx + 1} · Woche ${w.week}</span></header>
    <section class="card"><h2>${w.type} · ${w.title}</h2>
      <p class="muted">≈ ${Math.round(w.totalSec / 60)} Min: 3 Min Aufwärmen · ${w.rounds} Runden à ${w.exercises.length} Übungen (${w.work}s Belastung, ${w.rest}s Pause) · 2 Min Dehnen</p></section>
    ${w.exercises.map((ex) => {
      const t = ex.kind === 'reps' ? targetReps(p.id, ex.variantId, w.work) : null;
      return `<section class="card ex"><span class="em">${ex.icon}</span><div><b>${ex.name}</b><p class="muted">${ex.cue}</p>
        <small class="goal">${ex.kind === 'hold' ? `Halten: ${w.work}s` : t ? `🎯 Ziel heute: ${t} Wdh. pro Runde` : 'Zähle mit – dein Wert wird die Basis für die nächste Einheit.'}</small></div></section>`;
    }).join('')}
    <button class="btn" data-act="start">Los geht's 🚀</button>
  </main>`;
}

// ---------- Player ----------
let segs: Segment[] = [];
let si = 0;
let endAt = 0;
let paused = false;
let remaining = 0;
let timer: number | undefined;
let wake: { release: () => Promise<void> } | null = null;
let lastWhole = -1;

async function lockScreen() {
  try { wake = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request('screen') ?? null; } catch { wake = null; }
}
const unlock = () => { void wake?.release(); wake = null; };

function startPlayer() {
  unlockAudio();
  void lockScreen();
  segs = workout!.segments;
  si = 0;
  paused = false;
  enterSegment();
  window.clearInterval(timer);
  timer = window.setInterval(tick, 200);
  view = 'player';
  renderPlayer();
}

function announce(s: Segment) {
  const p = me()!;
  if (s.kind === 'work') {
    const t = s.ex!.kind === 'reps' ? targetReps(p.id, s.ex!.variantId, s.dur) : null;
    say(`${s.name}. ${s.ex!.kind === 'hold' ? `Halten, ${s.dur} Sekunden` : t ? `Ziel ${t} Wiederholungen` : `Los, ${s.dur} Sekunden`}`);
    beep(1100, 250); buzz(200);
  } else if (s.kind === 'rest') {
    say(`Pause. Als nächstes: ${s.next}`);
    beep(520, 200); buzz([80, 60, 80]);
  } else if (s.kind === 'ready') {
    say('Gleich geht es los. Mach dich bereit.');
  } else {
    say(s.name);
    beep(700, 120);
  }
}

function enterSegment() {
  const s = segs[si];
  remaining = s.dur;
  endAt = Date.now() + s.dur * 1000;
  lastWhole = s.dur;
  announce(s);
}

function tick() {
  if (view !== 'player' || paused) return;
  const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  remaining = left;
  if (left !== lastWhole) {
    lastWhole = left;
    const s = segs[si];
    if (left <= 3 && left > 0) { beep(880, 100); buzz(40); }
    if (left === 10 && s.kind === 'work' && s.dur >= 30) say('Noch zehn Sekunden');
    if (left === Math.floor(s.dur / 2) && s.dur >= 30 && (s.kind === 'work' || s.kind === 'cool' || s.kind === 'warm') && /Seit|Bein|dehnen|Wechsel/i.test(s.name + s.cue)) say('Seite wechseln');
  }
  paintTimer();
  if (left <= 0) {
    if (si + 1 >= segs.length) { finishWorkout(); return; }
    si++;
    enterSegment();
    renderPlayer();
  }
}

function finishWorkout() {
  window.clearInterval(timer);
  unlock();
  say('Geschafft! Super gemacht.');
  beep(1300, 400); buzz([200, 100, 200, 100, 400]);
  view = 'finish';
  render();
}

function stopPlayer() {
  window.clearInterval(timer);
  window.speechSynthesis?.cancel();
  unlock();
}

function paintTimer() {
  const t = document.getElementById('t');
  const f = document.getElementById('f');
  if (t) t.textContent = String(remaining);
  if (f) f.style.width = `${(1 - remaining / segs[si].dur) * 100}%`;
  const tt = document.getElementById('tot');
  if (tt) tt.textContent = fmt(Math.max(0, segs.slice(si + 1).reduce((a, s) => a + s.dur, 0) + remaining));
}

function renderPlayer() {
  const s = segs[si];
  const p = me()!;
  const t = s.kind === 'work' && s.ex!.kind === 'reps' ? targetReps(p.id, s.ex!.variantId, s.dur) : null;
  const label = { ready: 'Bereit machen', warm: 'Aufwärmen', work: `Runde ${s.round}/${s.rounds}`, rest: 'Pause', cool: 'Dehnen' }[s.kind];
  app.innerHTML = `<main class="player ${s.kind}">
    <div class="phead"><span class="chip">${label}</span><span class="muted">Rest <b id="tot">${fmt(segs.slice(si + 1).reduce((a, x) => a + x.dur, 0) + remaining)}</b></span></div>
    <div class="big-ico">${s.icon}</div>
    <h1>${esc(s.name)}</h1>
    <div class="timer" id="t">${remaining}</div>
    <div class="bar big"><i id="f" style="width:${(1 - remaining / s.dur) * 100}%"></i></div>
    <p class="cue">${esc(s.cue)}</p>
    ${t ? `<p class="goal">🎯 Ziel: ${t} Wdh.</p>` : s.kind === 'work' && s.ex!.kind === 'reps' ? '<p class="goal">Zähle mit!</p>' : ''}
    ${s.next && s.kind !== 'work' ? `<p class="muted">Als nächstes: <b>${esc(s.next)}</b></p>` : ''}
    <div class="ctl">
      <button class="btn ghost" data-act="pause">${paused ? '▶ Weiter' : '⏸ Pause'}</button>
      <button class="btn ghost" data-act="skip">⏭ Überspringen</button>
      <button class="btn ghost danger" data-act="quit">✕ Abbrechen</button>
    </div></main>`;
}

// ---------- Finish ----------
function finishView() {
  const w = workout!;
  const p = me()!;
  const repEx = w.exercises.filter((e) => e.kind === 'reps');
  return `<main><header class="top"><h1>Geschafft! 🎉</h1></header>
    <section class="card"><h2>${w.type} · ${w.title}</h2><p class="muted">Wie anstrengend war es?</p>
      <div class="effort">${[1, 2, 3, 4, 5].map((n) => `<label><input type="radio" name="effort" value="${n}" ${n === 3 ? 'checked' : ''}/><span>${['😌', '🙂', '😅', '😤', '🥵'][n - 1]}<small>${n}</small></span></label>`).join('')}</div></section>
    ${repEx.length ? `<section class="card"><small class="label">Deine Wiederholungen (Ø pro ${w.work}s-Runde)</small><p class="muted">Trag ein, wie viele du ungefähr geschafft hast – daraus berechnet die App dein Ziel für nächstes Mal.</p>
      ${repEx.map((e) => { const t = targetReps(p.id, e.variantId, w.work); return `<div class="field"><label>${e.icon} ${e.name}</label><input type="number" inputmode="numeric" min="0" max="200" data-rep="${e.variantId}" placeholder="${t ?? '–'}"/></div>`; }).join('')}</section>` : ''}
    <button class="btn" data-act="save">Speichern & Punkte holen</button>
  </main>`;
}

function savedView() {
  return `<main class="center"><div class="big-ico">🏅</div><h1>+${finishedPoints} Punkte</h1>
    <p class="muted">Gespeichert. Stark, ${me()!.name}!</p><button class="btn" data-go="home">Weiter</button></main>`;
}

let saved = false;

function render() {
  if (view === 'player') return;
  if (!state.me) { app.innerHTML = profileView(); return; }
  if (saved) { app.innerHTML = savedView(); return; }
  app.innerHTML = { home: homeView, plan: planView, family: familyView, preview: previewView, finish: finishView, player: () => '' }[view]();
}

app.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-me],[data-go],[data-preview],[data-act]');
  if (!el) return;
  const d = el.dataset;
  if (d.me) { state.me = d.me; save(); go('home'); void sync(); return; }
  if (d.go) { saved = false; go(d.go as View); return; }
  if (d.preview) { workout = buildWorkout(Number(d.preview)); go('preview'); return; }
  switch (d.act) {
    case 'switch': state.me = null; save(); render(); break;
    case 'sync': void sync(); break;
    case 'start': startPlayer(); break;
    case 'pause':
      paused = !paused;
      if (paused) remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); else endAt = Date.now() + remaining * 1000;
      window.speechSynthesis?.cancel();
      renderPlayer();
      break;
    case 'skip':
      if (si + 1 >= segs.length) finishWorkout(); else { si++; paused = false; enterSegment(); renderPlayer(); }
      break;
    case 'quit':
      if (confirm('Einheit wirklich abbrechen?')) { stopPlayer(); go(tab); }
      break;
    case 'save': saveWorkout(); break;
  }
});

app.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.act === 'sound') { state.sound = el.checked; save(); }
});

function saveWorkout() {
  const w = workout!;
  const p = me()!;
  const effort = Number((document.querySelector<HTMLInputElement>('input[name=effort]:checked'))?.value ?? 3);
  document.querySelectorAll<HTMLInputElement>('[data-rep]').forEach((inp) => {
    const n = Number(inp.value);
    if (n > 0) setRate(p.id, inp.dataset.rep!, n / w.work);
  });
  const points = pointsFor(p.id, effort);
  addCompletion({ person: p.id, idx: w.idx, title: `${w.type} · ${w.title}`, points, effort });
  finishedPoints = points;
  saved = true;
  view = 'home';
  tab = 'home';
  render();
}

onChange(() => { if (view !== 'player' && view !== 'finish' && view !== 'preview') render(); });

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (view === 'player' && !paused) void lockScreen();
    void sync();
  }
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !import.meta.env.DEV) {
  navigator.serviceWorker.register('./sw.js').catch(() => undefined);
}

render();
void sync();

