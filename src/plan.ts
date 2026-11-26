export type Kind = 'reps' | 'hold';

export interface Variant {
  fromIdx: number;
  id: string;
  name: string;
  cue: string;
}

export interface Exercise {
  id: string;
  name: string;
  kind: Kind;
  icon: string;
  cue: string;
  variants?: Variant[];
}

export interface ResolvedExercise {
  baseId: string;
  variantId: string;
  name: string;
  kind: Kind;
  icon: string;
  cue: string;
}

export type SegKind = 'ready' | 'warm' | 'work' | 'rest' | 'cool';

export interface Segment {
  kind: SegKind;
  dur: number;
  name: string;
  cue: string;
  icon: string;
  fig?: string;
  ex?: ResolvedExercise;
  next?: string;
  round?: number;
  rounds?: number;
}

export interface SessionDef {
  idx: number;
  week: number;
  type: 'A' | 'B' | 'C' | 'D';
}

export const PROGRAM_START = new Date(2026, 11, 7);
export const TRIP_START = new Date(2027, 1, 6);
export const TRIP_END = new Date(2027, 1, 13);
export const WEEKS = 8;
const PER_WEEK = [3, 3, 4, 4, 4, 4, 4, 3];

export const PHASES = ['Basis', 'Basis', 'Kraft-Ausdauer', 'Kraft-Ausdauer', 'Kraft-Ausdauer', 'Skispezifisch', 'Skispezifisch', 'Feinschliff'];

export const SESSION_TITLES: Record<SessionDef['type'], string> = {
  A: 'Beinkraft',
  B: 'Core & Balance',
  C: 'Sprung & Koordination',
  D: 'Mix & Ausdauer',
};

const ROTATION: SessionDef['type'][] = ['A', 'B', 'C', 'D'];

export const SESSIONS: SessionDef[] = (() => {
  const list: SessionDef[] = [];
  PER_WEEK.forEach((n, w) => {
    for (let i = 0; i < n; i++) list.push({ idx: list.length, week: w + 1, type: ROTATION[list.length % 4] });
  });
  return list;
})();

export const TOTAL_SESSIONS = SESSIONS.length;

export const EX: Record<string, Exercise> = {
  wallsit: {
    id: 'wallsit', name: 'Wandsitz', kind: 'hold', icon: '🧱',
    cue: 'Rücken an die Wand, Knie 90°, Oberschenkel waagrecht. Gewicht auf den Fersen, Arme locker.',
    variants: [{ fromIdx: 14, id: 'wallsit2', name: 'Wandsitz mit Beinwechsel', cue: 'Wandsitz halten und alle paar Sekunden abwechselnd ein Bein strecken.' }],
  },
  squat: {
    id: 'squat', name: 'Kniebeugen', kind: 'reps', icon: '🏋️',
    cue: 'Füße hüftbreit, Knie über den Zehen, Rücken gerade, Po tief nach hinten unten.',
    variants: [
      { fromIdx: 10, id: 'squat2', name: 'Tempo-Kniebeugen', cue: '3 Sekunden runter, kurz unten halten, kraftvoll hoch.' },
      { fromIdx: 20, id: 'squat3', name: 'Kniebeuge mit Sprung', cue: 'Tief beugen, explosiv hochspringen, weich landen (Knie leicht gebeugt).' },
    ],
  },
  sidelunge: {
    id: 'sidelunge', name: 'Seitliche Ausfallschritte', kind: 'reps', icon: '↔️',
    cue: 'Großer Schritt zur Seite, Po nach hinten, Standbein-Knie über den Zehen, Gegenbein gestreckt.',
    variants: [{ fromIdx: 14, id: 'sidelunge2', name: 'Seitliche Ausfallschritte mit Pause', cue: 'Unten 2 Sekunden halten, dann kraftvoll zurückdrücken.' }],
  },
  calf: {
    id: 'calf', name: 'Wadenheber', kind: 'reps', icon: '🦵',
    cue: 'Auf die Zehenspitzen hoch, oben kurz halten, langsam senken.',
    variants: [{ fromIdx: 12, id: 'calf2', name: 'Einbein-Wadenheber', cue: 'Auf einem Bein, Seite nach der halben Zeit wechseln.' }],
  },
  plank: {
    id: 'plank', name: 'Unterarmstütz', kind: 'hold', icon: '📏',
    cue: 'Körper gerade wie ein Brett, Bauch und Po fest, Blick zum Boden.',
    variants: [{ fromIdx: 12, id: 'plank2', name: 'Unterarmstütz mit Beinheben', cue: 'Plank halten, abwechselnd ein Bein kontrolliert anheben.' }],
  },
  sideplank: {
    id: 'sideplank', name: 'Seitstütz', kind: 'hold', icon: '📐',
    cue: 'Auf einem Unterarm, Hüfte oben, Körper gerade. Nach der halben Zeit Seite wechseln.',
  },
  balance: {
    id: 'balance', name: 'Einbeinstand mit Rumpfbeuge', kind: 'reps', icon: '🧘',
    cue: 'Auf einem Bein stehen, Oberkörper nach vorn neigen, Rücken gerade, wieder aufrichten. Seite nach der halben Zeit wechseln.',
    variants: [{ fromIdx: 14, id: 'balance2', name: 'Einbein-Rumpfbeuge auf Kissen', cue: 'Wie vorher, aber auf einem Kissen oder gefalteten Handtuch (instabil).' }],
  },
  twist: {
    id: 'twist', name: 'Russian Twists', kind: 'reps', icon: '🌀',
    cue: 'Sitzen, Oberkörper leicht zurück, Füße angehoben, Oberkörper rechts/links drehen. Eine Drehung = eine Wdh.',
  },
  skater: {
    id: 'skater', name: 'Skater-Sprünge', kind: 'reps', icon: '⛸️',
    cue: 'Seitlich von Bein zu Bein springen, weich landen, Knie gebeugt, Arme schwingen mit.',
  },
  linehop: {
    id: 'linehop', name: 'Seitliche Linien-Hüpfer', kind: 'reps', icon: '〰️',
    cue: 'Eine Linie (Fußleiste/Seil) – mit geschlossenen Füßen schnell seitlich darüber hüpfen, in der Hocke bleiben.',
  },
  jacks: {
    id: 'jacks', name: 'Hampelmann', kind: 'reps', icon: '⭐',
    cue: 'Aufrecht, locker, gleichmäßiger Rhythmus. Ein Sprung = eine Wdh.',
    variants: [{ fromIdx: 10, id: 'jacks2', name: 'Jump-Jacks in tiefer Hocke', cue: 'Wie Hampelmann, aber die Beine bleiben dabei in einer tiefen Skihocke.' }],
  },
  climber: {
    id: 'climber', name: 'Bergsteiger', kind: 'reps', icon: '🧗',
    cue: 'Stütz auf den Händen, Knie abwechselnd schnell zur Brust ziehen, Hüfte tief. Ein Knie = eine Wdh.',
  },
  backlunge: {
    id: 'backlunge', name: 'Ausfallschritt rückwärts', kind: 'reps', icon: '🚶',
    cue: 'Großer Schritt nach hinten, hinteres Knie fast zum Boden, Oberkörper aufrecht. Beinwechsel jede Wdh.',
  },
  bridge: {
    id: 'bridge', name: 'Glute Bridge', kind: 'reps', icon: '🌉',
    cue: 'Rückenlage, Füße aufgestellt, Hüfte hochdrücken, oben Po anspannen, langsam senken.',
    variants: [{ fromIdx: 8, id: 'bridge2', name: 'Einbeinige Glute Bridge', cue: 'Ein Bein gestreckt in die Luft, mit dem anderen die Hüfte heben. Nach der halben Zeit wechseln.' }],
  },
};

const SESSION_EX: Record<SessionDef['type'], string[]> = {
  A: ['wallsit', 'squat', 'sidelunge', 'calf'],
  B: ['plank', 'sideplank', 'balance', 'twist'],
  C: ['skater', 'linehop', 'jacks', 'climber'],
  D: ['backlunge', 'bridge', 'twist', 'jacks'],
};

const WARMUP: { name: string; cue: string; icon: string; fig: string }[] = [
  { name: 'Armkreisen & Schultern', cue: 'Große Kreise vorwärts und rückwärts.', icon: '🔄', fig: 'w-arms' },
  { name: 'Hüftkreisen', cue: 'Große, langsame Kreise, Richtung nach der halben Zeit wechseln.', icon: '🌀', fig: 'w-hips' },
  { name: 'Hohe Knie marschieren', cue: 'Knie hoch, Arme mitschwingen, Puls hochfahren.', icon: '🚶', fig: 'w-knees' },
  { name: 'Lockere Kniebeugen', cue: 'Locker und mit kleinem Tempo, Rücken gerade.', icon: '🏋️', fig: 'w-squat' },
  { name: 'Seitliche Ausfallschritte (locker)', cue: 'Locker von links nach rechts verlagern.', icon: '↔️', fig: 'w-lunge' },
  { name: 'Rumpfdrehungen', cue: 'Füße fest, Oberkörper im Wechsel drehen.', icon: '🔁', fig: 'w-twist' },
];

const COOLDOWN: { name: string; cue: string; icon: string; fig: string }[] = [
  { name: 'Oberschenkel dehnen', cue: 'Ferse zum Po, Knie zeigt nach unten. Nach der halben Zeit Seite wechseln.', icon: '🧎', fig: 'c-quad' },
  { name: 'Hüftbeuger dehnen', cue: 'Ausfallschritt, Hüfte nach vorn schieben. Nach der halben Zeit Seite wechseln.', icon: '🧎', fig: 'c-hip' },
  { name: 'Waden dehnen', cue: 'Ferse am Boden, Bein hinten gestreckt. Nach der halben Zeit Seite wechseln.', icon: '🦶', fig: 'c-calf' },
  { name: 'Katzenbuckel & Kindhaltung', cue: 'Ruhig atmen, Rücken lang machen, Schultern lockern.', icon: '🐱', fig: 'c-cat' },
];

function resolve(baseId: string, idx: number): ResolvedExercise {
  const ex = EX[baseId];
  let name = ex.name, cue = ex.cue, variantId = ex.id;
  for (const v of ex.variants ?? []) {
    if (idx >= v.fromIdx) { name = v.name; cue = v.cue; variantId = v.id; }
  }
  return { baseId, variantId, name, cue, kind: ex.kind, icon: ex.icon };
}

const round5 = (n: number) => Math.round(n / 5) * 5;

export function intensity(idx: number): { work: number; rest: number; rounds: number } {
  const peak = TOTAL_SESSIONS - 4;
  const t = Math.min(idx, peak) / peak;
  const taper = SESSIONS[idx].week === WEEKS ? 0.75 : 1;
  const u = t * taper;
  return { work: round5(30 + u * 15), rest: round5(30 - u * 15), rounds: 3 };
}

export interface Workout {
  idx: number;
  title: string;
  type: SessionDef['type'];
  week: number;
  segments: Segment[];
  exercises: ResolvedExercise[];
  work: number;
  rest: number;
  rounds: number;
  totalSec: number;
}

export function buildWorkout(idx: number): Workout {
  const def = SESSIONS[idx];
  const { work, rest, rounds } = intensity(idx);
  const exercises = SESSION_EX[def.type].map((id) => resolve(id, idx));
  const segs: Segment[] = [];
  segs.push({ kind: 'ready', dur: 5, name: 'Mach dich bereit', cue: 'Platz schaffen, Handy in Sichtweite stellen.', icon: '📱', next: WARMUP[0].name });
  WARMUP.forEach((w, i) => segs.push({ kind: 'warm', dur: 30, name: w.name, cue: w.cue, icon: w.icon, fig: w.fig, next: WARMUP[i + 1]?.name ?? exercises[0].name }));
  for (let r = 1; r <= rounds; r++) {
    exercises.forEach((ex, i) => {
      segs.push({ kind: 'work', dur: work, name: ex.name, cue: ex.cue, icon: ex.icon, fig: ex.variantId, ex, round: r, rounds });
      const last = r === rounds && i === exercises.length - 1;
      if (!last) {
        const nextEx = exercises[(i + 1) % exercises.length];
        segs.push({ kind: 'rest', dur: rest, name: 'Pause', cue: 'Locker bewegen, durchatmen, Wasser trinken.', icon: '💧', fig: nextEx.variantId, next: nextEx.name, round: i === exercises.length - 1 ? r + 1 : r, rounds });
      }
    });
  }
  COOLDOWN.forEach((c, i) => segs.push({ kind: 'cool', dur: 30, name: c.name, cue: c.cue, icon: c.icon, fig: c.fig, next: COOLDOWN[i + 1]?.name }));
  return {
    idx, title: SESSION_TITLES[def.type], type: def.type, week: def.week,
    segments: segs, exercises, work, rest, rounds,
    totalSec: segs.reduce((s, x) => s + x.dur, 0),
  };
}

export const weekSessions = (week: number) => SESSIONS.filter((s) => s.week === week);
