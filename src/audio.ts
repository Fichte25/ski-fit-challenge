import { state } from './store';

let ctx: AudioContext | null = null;

export function unlockAudio() {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    void ctx.resume();
  } catch { /* ignore */ }
}

export function beep(freq = 880, ms = 120) {
  if (!state.sound || !ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = freq;
  g.gain.value = 0.15;
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + ms / 1000);
}

export function say(text: string) {
  if (!state.sound || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  u.rate = 1;
  window.speechSynthesis.speak(u);
}

export const buzz = (p: number | number[]) => navigator.vibrate?.(p);
