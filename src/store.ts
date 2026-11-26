import { PROGRAM_START, TOTAL_SESSIONS, WEEKS } from './plan';

export interface Person { id: string; name: string; emoji: string; color: string }

export const PEOPLE: Person[] = [
  { id: 'papa', name: 'Papa', emoji: '👨', color: '#4da3ff' },
  { id: 'mama', name: 'Mama', emoji: '👩', color: '#ff7eb6' },
  { id: 'jule', name: 'Jule', emoji: '🧑', color: '#ffd166' },
  { id: 'marie', name: 'Marie', emoji: '👧', color: '#7ee0a0' },
  { id: 'eli', name: 'Eli', emoji: '🧒', color: '#c39bff' },
];

export interface Completion {
  id: string;
  person: string;
  idx: number;
  title: string;
  at: string;
  points: number;
  effort: number;
  synced: boolean;
}

interface State {
  me: string | null;
  completions: Completion[];
  rates: Record<string, Record<string, number>>;
  sound: boolean;
}

declare global {
  interface Window { SKIFIT?: { supabaseUrl?: string; supabaseKey?: string; familyCode?: string } }
}

const KEY = 'skifit-state-v1';
const cfg = window.SKIFIT ?? {};
export const remoteEnabled = !!(cfg.supabaseUrl && cfg.supabaseKey);
const family = cfg.familyCode || 'familie';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { me: null, completions: [], rates: {}, sound: true, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { me: null, completions: [], rates: {}, sound: true };
}

export const state: State = load();
const listeners = new Set<() => void>();
export const onChange = (fn: () => void) => { listeners.add(fn); };
export function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const uuid = () =>
  (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 3) | 8).toString(16);
  });

const DAY = 86400000;
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const daysBetween = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);

export function programWeekIndex(d: Date): number {
  return Math.floor(daysBetween(PROGRAM_START, d) / 7);
}

export const currentWeek = () => Math.min(Math.max(programWeekIndex(new Date()), 0), WEEKS - 1) + 1;

export const completionsOf = (person: string) => state.completions.filter((c) => c.person === person);
export const doneIdx = (person: string) => new Set(completionsOf(person).map((c) => c.idx));

export function nextIdx(person: string): number | null {
  const done = doneIdx(person);
  for (let i = 0; i < TOTAL_SESSIONS; i++) if (!done.has(i)) return i;
  return null;
}

export function weekCount(person: string, weekIndex: number): number {
  return completionsOf(person).filter((c) => Math.max(programWeekIndex(new Date(c.at)), 0) === weekIndex).length;
}

export function streakWeeks(person: string): number {
  const now = Math.max(programWeekIndex(new Date()), 0);
  let w = weekCount(person, now) >= 3 ? now : now - 1;
  let s = 0;
  while (w >= 0 && weekCount(person, w) >= 3) { s++; w--; }
  return s;
}

export const totalPoints = (person: string) => completionsOf(person).reduce((s, c) => s + c.points, 0);

export function pointsFor(person: string, effort: number): number {
  return 100 + effort * 5 + Math.min(streakWeeks(person), 5) * 10;
}

export function addCompletion(c: Omit<Completion, 'id' | 'synced' | 'at'>): Completion {
  const full: Completion = { ...c, id: uuid(), at: new Date().toISOString(), synced: false };
  state.completions.push(full);
  save();
  void sync();
  return full;
}

export function setRate(person: string, variantId: string, rate: number) {
  (state.rates[person] ??= {})[variantId] = rate;
  save();
}

export function targetReps(person: string, variantId: string, work: number): number | null {
  const rate = state.rates[person]?.[variantId];
  return rate ? Math.max(1, Math.ceil(rate * work * 1.05)) : null;
}

const headers = () => ({
  apikey: cfg.supabaseKey!,
  Authorization: `Bearer ${cfg.supabaseKey}`,
  'Content-Type': 'application/json',
});

export let syncStatus: 'off' | 'ok' | 'error' | 'busy' = remoteEnabled ? 'ok' : 'off';
export let lastSync: Date | null = null;

export async function sync(): Promise<void> {
  if (!remoteEnabled) return;
  syncStatus = 'busy';
  listeners.forEach((l) => l());
  try {
    const pending = state.completions.filter((c) => !c.synced);
    if (pending.length) {
      const res = await fetch(`${cfg.supabaseUrl}/rest/v1/completions?on_conflict=id`, {
        method: 'POST',
        headers: { ...headers(), Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify(pending.map((c) => ({ id: c.id, family, person: c.person, session_idx: c.idx, title: c.title, completed_at: c.at, points: c.points, effort: c.effort }))),
      });
      if (!res.ok) throw new Error(`push ${res.status}`);
      pending.forEach((c) => (c.synced = true));
    }
    const res = await fetch(`${cfg.supabaseUrl}/rest/v1/completions?family=eq.${encodeURIComponent(family)}&select=*&order=completed_at.asc&limit=2000`, { headers: headers() });
    if (!res.ok) throw new Error(`pull ${res.status}`);
    const rows: { id: string; person: string; session_idx: number; title: string; completed_at: string; points: number; effort: number }[] = await res.json();
    const known = new Set(state.completions.map((c) => c.id));
    for (const r of rows) {
      if (!known.has(r.id)) state.completions.push({ id: r.id, person: r.person, idx: r.session_idx, title: r.title, at: r.completed_at, points: r.points, effort: r.effort, synced: true });
    }
    syncStatus = 'ok';
    lastSync = new Date();
  } catch {
    syncStatus = 'error';
  }
  save();
}
