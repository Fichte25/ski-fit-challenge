// Animierte Strichmännchen für alle Übungen (reines SVG, offline).
// Koordinaten: viewBox 120 x 80, Boden bei y = 72. Seitenansicht schaut nach rechts.

type Pt = [number, number];

interface Pose {
  n: Pt; // Nacken/Schulter
  h: Pt; // Hüfte
  a: Pt[]; // Arme: [Ellbogen, Hand] oder [Ellbogen, Hand, Ellbogen fern, Hand fern]
  l: Pt[]; // Beine: [Knie, Knöchel] oder [Knie, Knöchel, Knie fern, Knöchel fern]
  t: (Pt | undefined)[]; // Zehen (optional)
}

interface Def {
  frames: Pose[];
  front?: boolean;
  dur?: number;
  props?: string;
  lift?: number;
}

const P = (n: Pt, h: Pt, a: Pt[], l: Pt[], t: (Pt | undefined)[] = []): Pose => ({ n, h, a, l, t });

const mir = (p: Pose): Pose => {
  const m = (q: Pt): Pt => [120 - q[0], q[1]];
  return { n: m(p.n), h: m(p.h), a: p.a.map(m), l: p.l.map(m), t: p.t.map((q) => q && m(q)) };
};

const WALL = '<line x1="41" y1="-2" x2="41" y2="72" stroke="#9db3d1" stroke-opacity=".7" stroke-width="3"/>';
const WALL_R = '<line x1="97" y1="-2" x2="97" y2="72" stroke="#9db3d1" stroke-opacity=".7" stroke-width="3"/>';
const PILLOW = '<rect x="44" y="69" width="32" height="4" rx="2" fill="#7aa8d8"/>';
const LINE = '<line x1="60" y1="18" x2="60" y2="72" stroke="#ffd166" stroke-opacity=".6" stroke-width="1.5" stroke-dasharray="3 3"/>';

const SQUAT_TOP = P([60, 20], [60, 42], [[69, 21], [78, 22]], [[60, 57], [60, 72]]);
const SQUAT_LOW = P([62, 37], [56, 57], [[71, 38], [80, 38]], [[70, 62], [58, 72]]);
const SQUAT_JUMP = P([60, 10], [60, 32], [[68, 10], [76, 6]], [[60, 47], [60, 62]]);

const FRONT_LEGS_STAND: Pt[] = [[57, 57], [57, 72], [63, 57], [63, 72]];
const LUNGE_SIDE_A = P([60, 20], [60, 42], [[54, 28], [58, 25], [66, 28], [62, 25]], FRONT_LEGS_STAND);
const LUNGE_SIDE_B = P([72, 28], [75, 50], [[70, 36], [78, 33], [74, 36], [80, 33]], [[63, 61], [52, 72], [88, 61], [92, 72]]);

const PLANK = (hipY: number, far?: Pt[]) =>
  P([36, 52], [66, hipY], [[36, 70], [48, 70]], far ?? [[82, hipY + 5], [98, 70]], [[101, 72]]);

const CLIMB_ARMS: Pt[] = [[37, 60], [36, 72]];
const CLIMB_A = P([38, 48], [68, 56], CLIMB_ARMS, [[84, 63], [100, 70], [53, 60], [64, 70]]);
const CLIMB_B = P([38, 48], [68, 56], CLIMB_ARMS, [[53, 60], [64, 70], [84, 63], [100, 70]]);

const SKATER_A = P([42, 24], [48, 44], [[40, 34], [34, 42], [52, 30], [58, 36]], [[48, 58], [46, 72], [54, 58], [66, 66]]);
const HOP_A = P([40, 32], [40, 52], [[34, 40], [38, 48], [46, 40], [42, 48]], [[36, 62], [38, 72], [44, 62], [42, 72]]);

const hipFrame = (hx: number): Pose => {
  const nx = 60 + (60 - hx) * 0.3;
  return P([nx, 20], [hx, 42], [[nx - 10, 31], [hx - 6, 42], [nx + 10, 31], [hx + 6, 42]], [[(hx + 56) / 2 - 1, 57], [56, 72], [(hx + 64) / 2 + 1, 57], [64, 72]]);
};

const KNEE_A = P([60, 20], [60, 42], [[54, 31], [48, 38], [67, 29], [72, 21]], [[75, 44], [75, 58], [60, 57], [60, 72]]);
const KNEE_B = P([60, 20], [60, 42], [[67, 29], [72, 21], [54, 31], [48, 38]], [[60, 57], [60, 72], [75, 44], [75, 58]]);

const TWIST_A = P([60, 20], [60, 42], [[67, 27], [77, 25], [66, 30], [76, 31]], FRONT_LEGS_STAND);

const FIGS: Record<string, Def> = {
  wallsit: {
    props: WALL,
    dur: 2.4,
    frames: [
      P([46, 34], [46, 56], [[50, 44], [57, 53]], [[61, 56], [61, 71]]),
      P([46, 35], [46, 57], [[50, 45], [57, 54]], [[61, 57], [61, 71]]),
    ],
  },
  wallsit2: {
    props: WALL,
    dur: 2.4,
    frames: [
      P([46, 34], [46, 56], [[50, 44], [57, 53]], [[61, 56], [61, 71], [61, 56], [61, 71]]),
      P([46, 34], [46, 56], [[50, 44], [57, 53]], [[61, 56], [61, 71], [61, 56], [76, 56]]),
    ],
  },
  squat: { frames: [SQUAT_TOP, SQUAT_LOW] },
  squat2: { dur: 3, frames: [SQUAT_TOP, SQUAT_LOW] },
  squat3: { dur: 1.4, frames: [SQUAT_LOW, SQUAT_JUMP] },
  sidelunge: { front: true, frames: [LUNGE_SIDE_A, LUNGE_SIDE_B] },
  sidelunge2: { front: true, dur: 3, frames: [LUNGE_SIDE_A, LUNGE_SIDE_B] },
  calf: {
    frames: [
      P([60, 20], [60, 42], [[61, 31], [61, 41]], [[60, 57], [60, 72]]),
      P([60, 14], [60, 36], [[61, 25], [61, 35]], [[60, 51], [60, 66]], [[65, 72]]),
    ],
  },
  calf2: {
    frames: [
      P([60, 20], [60, 42], [[61, 31], [61, 41]], [[60, 57], [60, 72], [62, 55], [49, 62]]),
      P([60, 14], [60, 36], [[61, 25], [61, 35]], [[60, 51], [60, 66], [62, 49], [49, 56]], [[65, 72]]),
    ],
  },
  plank: { dur: 2.4, frames: [PLANK(60), PLANK(58)] },
  plank2: {
    frames: [PLANK(60, [[82, 65], [98, 70], [82, 65], [98, 70]]), PLANK(60, [[82, 65], [98, 70], [82, 60], [106, 56]])],
  },
  sideplank: {
    dur: 2.4,
    frames: [
      P([38, 52], [66, 58], [[38, 70], [48, 70], [36, 42], [34, 32]], [[82, 64], [98, 70], [80, 65], [96, 70]], [[101, 72], [99, 72]]),
      P([38, 52], [66, 62], [[38, 70], [48, 70], [36, 42], [34, 32]], [[82, 66], [98, 70], [80, 67], [96, 71]], [[101, 72], [99, 72]]),
    ],
  },
  balance: {
    dur: 2.2,
    frames: [
      P([60, 20], [60, 42], [[54, 32], [59, 42]], [[60, 57], [60, 72], [58, 56], [53, 67]]),
      P([82, 40], [60, 42], [[82, 50], [82, 58]], [[60, 57], [60, 72], [46, 42], [30, 43]], [undefined, [27, 45]]),
    ],
  },
  balance2: {
    dur: 2.2,
    lift: 3,
    props: PILLOW,
    frames: [
      P([60, 20], [60, 42], [[54, 32], [59, 42]], [[60, 57], [60, 72], [58, 56], [53, 67]]),
      P([82, 40], [60, 42], [[82, 50], [82, 58]], [[60, 57], [60, 72], [46, 42], [30, 43]], [undefined, [27, 45]]),
    ],
  },
  twist: {
    frames: [
      P([38, 46], [50, 66], [[48, 50], [57, 53]], [[64, 56], [79, 62]]),
      P([38, 46], [50, 66], [[38, 54], [31, 58]], [[64, 56], [79, 62]]),
    ],
  },
  skater: { front: true, dur: 1.2, frames: [SKATER_A, mir(SKATER_A)] },
  linehop: { front: true, dur: 1, props: LINE, frames: [HOP_A, mir(HOP_A)] },
  jacks: {
    front: true,
    dur: 1,
    frames: [
      P([60, 20], [60, 42], [[56, 31], [57, 41], [64, 31], [63, 41]], [[58, 57], [58, 72], [62, 57], [62, 72]]),
      P([60, 20], [60, 42], [[70, 13], [78, 5], [50, 13], [42, 5]], [[69, 58], [78, 72], [51, 58], [42, 72]]),
    ],
  },
  jacks2: {
    front: true,
    dur: 1.2,
    frames: [
      P([60, 31], [60, 52], [[55, 41], [56, 50], [65, 41], [64, 50]], [[56, 62], [58, 72], [64, 62], [62, 72]]),
      P([60, 31], [60, 52], [[70, 25], [78, 16], [50, 25], [42, 16]], [[49, 62], [40, 72], [71, 62], [80, 72]]),
    ],
  },
  climber: { dur: 0.8, frames: [CLIMB_A, CLIMB_B] },
  backlunge: {
    frames: [
      P([60, 20], [60, 42], [[53, 32], [59, 42]], [[60, 57], [60, 72]]),
      P([56, 30], [56, 52], [[49, 38], [55, 47]], [[70, 56], [70, 71], [48, 64], [36, 67]], [undefined, [33, 72]]),
    ],
  },
  bridge: {
    frames: [
      P([34, 70], [56, 70], [[45, 70], [54, 70]], [[68, 56], [74, 70]]),
      P([34, 69], [58, 52], [[45, 70], [54, 70]], [[72, 55], [74, 70]]),
    ],
  },
  bridge2: {
    frames: [
      P([34, 70], [56, 70], [[45, 70], [54, 70]], [[68, 56], [74, 70], [67, 60], [79, 52]]),
      P([34, 69], [58, 52], [[45, 70], [54, 70]], [[72, 55], [74, 70], [71, 43], [84, 33]]),
    ],
  },

  'w-arms': {
    front: true,
    dur: 3.2,
    frames: [
      P([60, 20], [60, 42], [[48, 20], [36, 20], [72, 20], [84, 20]], FRONT_LEGS_STAND),
      P([60, 20], [60, 42], [[56, 9], [56, -1], [64, 9], [64, -1]], FRONT_LEGS_STAND),
      P([60, 20], [60, 42], [[48, 20], [36, 20], [72, 20], [84, 20]], FRONT_LEGS_STAND),
      P([60, 20], [60, 42], [[55, 31], [53, 41], [65, 31], [67, 41]], FRONT_LEGS_STAND),
    ],
  },
  'w-hips': { front: true, dur: 3.2, frames: [hipFrame(50), hipFrame(60), hipFrame(70), hipFrame(60)] },
  'w-knees': { dur: 1.2, frames: [KNEE_A, KNEE_B] },
  'w-twist': { front: true, dur: 2, frames: [TWIST_A, mir(TWIST_A)] },
  'c-quad': {
    dur: 2.6,
    frames: [
      P([60, 20], [60, 42], [[54, 33], [49, 47], [68, 26], [76, 24]], [[58, 57], [47, 50], [61, 57], [61, 72]]),
      P([60, 21], [60, 43], [[54, 34], [48, 48], [68, 27], [76, 25]], [[58, 58], [46, 51], [61, 58], [61, 72]]),
    ],
  },
  'c-hip': {
    dur: 2.6,
    frames: [
      P([56, 36], [54, 58], [[48, 46], [53, 57]], [[70, 58], [70, 72], [42, 68], [28, 68]], [undefined, [25, 72]]),
      P([60, 36], [58, 58], [[52, 46], [57, 57]], [[72, 58], [72, 72], [46, 68], [32, 68]], [undefined, [29, 72]]),
    ],
  },
  'c-calf': {
    dur: 2.6,
    props: WALL_R,
    frames: [
      P([80, 26], [66, 46], [[87, 26], [94, 26]], [[78, 58], [80, 72], [56, 59], [46, 72]]),
      P([82, 27], [68, 47], [[88, 27], [94, 27]], [[80, 58], [82, 72], [57, 60], [46, 72]]),
    ],
  },
  'c-cat': {
    dur: 3.6,
    frames: [
      P([46, 46], [78, 48], [[45, 60], [44, 72]], [[80, 70], [96, 70]]),
      P([52, 58], [90, 62], [[42, 66], [30, 70]], [[82, 70], [98, 70]]),
    ],
  },
};

FIGS['w-squat'] = FIGS.squat;
FIGS['w-lunge'] = FIGS.sidelunge;

interface Frame {
  segs: [Pt, Pt][];
  head: Pt;
}

const FAR_DX = -3;
const farOf = (a: Pt[]): Pt[] => (a.length >= 4 ? a : [...a, ...a.map(([x, y]): Pt => [x + FAR_DX, y])]);
const toe = (a: Pt): Pt => (a[1] >= 68 ? [a[0] + 5, Math.min(72, a[1] + 2)] : [a[0] + 4, a[1] + 3]);

function expand(p: Pose, front: boolean): Frame {
  const [eN, wN, eF, wF] = farOf(p.a);
  const [kN, aN, kF, aF] = farOf(p.l);
  const tN = p.t[0] ?? toe(aN);
  const tF = p.t[1] ?? toe(aF);
  const segs: [Pt, Pt][] = [[p.h, kF], [kF, aF]];
  if (!front) segs.push([aF, tF]);
  segs.push([p.n, eF], [eF, wF], [p.h, p.n], [p.h, kN], [kN, aN]);
  if (!front) segs.push([aN, tN]);
  segs.push([p.n, eN], [eN, wN]);
  const dx = p.n[0] - p.h[0];
  const dy = p.n[1] - p.h[1];
  const len = Math.hypot(dx, dy) || 1;
  return { segs, head: [p.n[0] + (dx / len) * 7.5, Math.min(67, p.n[1] + (dy / len) * 7.5)] };
}

const r1 = (x: number) => Math.round(x * 10) / 10;

export const hasFigure = (id: string) => id in FIGS;

export function figureSvg(id: string): string {
  const def = FIGS[id];
  if (!def) return '';
  const front = !!def.front;
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fr = def.frames.map((f) => expand(f, front));
  const n = fr.length;
  const dur = def.dur ?? 1.8;
  const keyTimes = Array.from({ length: n + 1 }, (_, i) => (i / n).toFixed(3)).join(';');
  const splines = Array(n).fill('0.45 0 0.55 1').join(';');

  const anim = (attr: string, get: (f: Frame) => number) => {
    const v = fr.map(get);
    if (reduce || v.every((x) => x === v[0])) return '';
    const vals = [...v, v[0]].map(r1).join(';');
    return `<animate attributeName="${attr}" dur="${dur}s" repeatCount="indefinite" calcMode="spline" values="${vals}" keyTimes="${keyTimes}" keySplines="${splines}"/>`;
  };

  const far = front ? '#eef4ff' : '#8fb4e8';
  const torsoIdx = front ? 4 : 5;
  const lines = fr[0].segs
    .map((s, i) => {
      const isTorsoSeg = i === torsoIdx;
      const isFar = i < torsoIdx;
      const color = isTorsoSeg ? '#ffffff' : isFar ? far : '#eef4ff';
      const w = isTorsoSeg ? 5.5 : 3.6;
      const x1 = anim('x1', (f) => f.segs[i][0][0]);
      const y1 = anim('y1', (f) => f.segs[i][0][1]);
      const x2 = anim('x2', (f) => f.segs[i][1][0]);
      const y2 = anim('y2', (f) => f.segs[i][1][1]);
      return `<line x1="${r1(s[0][0])}" y1="${r1(s[0][1])}" x2="${r1(s[1][0])}" y2="${r1(s[1][1])}" stroke="${color}" stroke-width="${w}" stroke-linecap="round">${x1}${y1}${x2}${y2}</line>`;
    })
    .join('');

  const head = `<circle cx="${r1(fr[0].head[0])}" cy="${r1(fr[0].head[1])}" r="5.5" fill="#ffd166">${anim('cx', (f) => f.head[0])}${anim('cy', (f) => f.head[1])}</circle>`;
  const floor = '<line x1="4" y1="72.5" x2="116" y2="72.5" stroke="#9db3d1" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round"/>';
  return `<svg class="fig" viewBox="0 -4 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${floor}${def.props ?? ''}<g transform="translate(0,${-(def.lift ?? 0)})">${lines}${head}</g></svg>`;
}
