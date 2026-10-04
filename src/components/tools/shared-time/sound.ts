/**
 * Alarm and chime sounds synthesised with the Web Audio API (no audio files). Browsers only allow
 * sound after a user gesture, so call unlockAudio() from a click handler (e.g. Start); sounds played
 * later (when a timer ends, even in a background tab) then work. Client only.
 */

type AudioContextCtor = typeof AudioContext;
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor: AudioContextCtor | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

/** Creates/resumes the shared AudioContext. Call inside a user gesture (click/keydown). */
export function unlockAudio() {
  getContext();
}

type Note = { at: number; freq: number; dur: number; gain: number; type?: OscillatorType; decay?: boolean };

/** Schedules notes on a private gain bus; returns a function that silences them immediately. */
function schedule(notes: Note[]): () => void {
  const audio = getContext();
  if (!audio) return () => {};
  const bus = audio.createGain();
  bus.gain.value = 1;
  bus.connect(audio.destination);
  const start = audio.currentTime + 0.03;
  const oscillators: OscillatorNode[] = [];

  for (const n of notes) {
    const t = start + n.at;
    const osc = audio.createOscillator();
    const env = audio.createGain();
    osc.type = n.type ?? "sine";
    osc.frequency.setValueAtTime(n.freq, t);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(n.gain, t + 0.012);
    if (n.decay) {
      env.gain.exponentialRampToValueAtTime(0.0001, t + n.dur);
    } else {
      env.gain.setValueAtTime(n.gain, t + Math.max(0.013, n.dur - 0.03));
      env.gain.exponentialRampToValueAtTime(0.0001, t + n.dur);
    }
    osc.connect(env);
    env.connect(bus);
    osc.start(t);
    osc.stop(t + n.dur + 0.05);
    oscillators.push(osc);
  }

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    const now = audio.currentTime;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setValueAtTime(bus.gain.value, now);
    bus.gain.linearRampToValueAtTime(0, now + 0.04);
    for (const osc of oscillators) {
      try {
        osc.stop(now + 0.05);
      } catch {
        // Already stopped.
      }
    }
    window.setTimeout(() => bus.disconnect(), 120);
  };
}

/**
 * Classic alarm clock: groups of four short beeps, repeated for `seconds` (default 30).
 * Returns a stop function.
 */
export function playAlarm(seconds = 30): () => void {
  const notes: Note[] = [];
  const cycle = 1.2;
  for (let c = 0; c * cycle < seconds; c++) {
    for (let b = 0; b < 4; b++) {
      const at = c * cycle + b * 0.16;
      notes.push({ at, freq: 880, dur: 0.1, gain: 0.12, type: "square" });
      notes.push({ at, freq: 1760, dur: 0.1, gain: 0.06 });
    }
  }
  return schedule(notes);
}

/** One short beep, for "test sound". */
export function playBeep(): () => void {
  return schedule([
    { at: 0, freq: 880, dur: 0.12, gain: 0.12, type: "square" },
    { at: 0, freq: 1760, dur: 0.12, gain: 0.06 },
  ]);
}

/**
 * Soft bell arpeggio for Pomodoro phase changes: rising = back to focus, falling = break time.
 * Played twice. Returns a stop function.
 */
export function playChime(direction: "up" | "down"): () => void {
  const scale = [659.25, 783.99, 1046.5];
  const seq = direction === "up" ? scale : [...scale].reverse();
  const notes: Note[] = [];
  for (let rep = 0; rep < 2; rep++) {
    seq.forEach((freq, i) => {
      const at = rep * 1.5 + i * 0.2;
      notes.push({ at, freq, dur: 1.1, gain: 0.3, decay: true });
      notes.push({ at, freq: freq * 2, dur: 0.6, gain: 0.05, decay: true });
    });
  }
  return schedule(notes);
}
