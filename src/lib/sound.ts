"use client";

// All sound effects are synthesized with the Web Audio API — no external
// audio assets to license or download.

let ctx: AudioContext | null = null;
let enabled = true;
let initialized = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function initSoundPreference(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  enabled = localStorage.getItem("soundEnabled") !== "0";
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  if (typeof window !== "undefined") {
    localStorage.setItem("soundEnabled", value ? "1" : "0");
  }
  if (value) getContext();
}

function tone(freq: number, startOffset: number, duration: number, type: OscillatorType = "sine", peak = 0.15): void {
  if (!enabled) return;
  const ac = getContext();
  if (!ac) return;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ac.destination);

  const t0 = ac.currentTime + startOffset;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Soft rising arpeggio — played once when a visitor first interacts with the site. */
export function playWelcome(): void {
  tone(523.25, 0, 0.16, "sine", 0.1);
  tone(659.25, 0.1, 0.18, "sine", 0.1);
  tone(783.99, 0.2, 0.26, "sine", 0.1);
}

/** Quick two-note "snap" for laying a card down. */
export function playCardPlay(): void {
  tone(220, 0, 0.05, "triangle", 0.12);
  tone(330, 0.03, 0.08, "triangle", 0.1);
}

/** Light tick for picking up/selecting a card. */
export function playSelect(): void {
  tone(880, 0, 0.04, "square", 0.05);
}

/** Low dull thud for passing a turn. */
export function playPass(): void {
  tone(260, 0, 0.1, "sine", 0.08);
}

/** Buzz for an invalid move or error. */
export function playError(): void {
  tone(180, 0, 0.16, "sawtooth", 0.12);
  tone(140, 0.08, 0.16, "sawtooth", 0.1);
}

/** Triumphant ascending chime for a finished game. */
export function playWin(): void {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => tone(freq, i * 0.12, 0.32, "triangle", 0.13));
}

/** Soft pop for an incoming chat message. */
export function playChat(): void {
  tone(1100, 0, 0.05, "sine", 0.04);
}
