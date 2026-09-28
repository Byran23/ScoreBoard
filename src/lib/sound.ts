/**
 * Minimal synthesized SFX engine — no audio assets needed.
 * Quiet, short, game-show style blips generated with WebAudio.
 */

let ctx: AudioContext | null = null;
let lastAt = 0;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  duration = 0.07,
  type: OscillatorType = "triangle",
  gain = 0.04,
  delay = 0,
) {
  const now = performance.now();
  if (now - lastAt < 24) return;
  lastAt = now;

  const ac = ensureCtx();
  if (!ac) return;

  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  enabled: true,
  up() {
    if (!this.enabled) return;
    tone(660, 0.06, "triangle", 0.045);
    tone(990, 0.05, "sine", 0.028, 0.045);
  },
  down() {
    if (!this.enabled) return;
    tone(280, 0.08, "sawtooth", 0.026);
  },
  lead() {
    if (!this.enabled) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, 0.085, "triangle", 0.05, i * 0.06),
    );
  },
  click() {
    if (!this.enabled) return;
    tone(880, 0.03, "sine", 0.02);
  },
};
