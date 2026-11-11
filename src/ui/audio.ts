// audio.ts — 100% procedural Web Audio: paper scratch, static, click.
// Zero audio files, zero copyrighted material. Master mute honored.
let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function setMuted(m: boolean): void { muted = m; }
export function isMuted(): boolean { return muted; }

function noiseBuffer(seconds: number): AudioBuffer {
  const a = ac();
  const buf = a.createBuffer(1, a.sampleRate * seconds, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** pencil scratch during automatic writing */
export function scratch(durationMs = 90): void {
  if (muted) return;
  const a = ac();
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(durationMs / 1000);
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2400 + Math.random() * 600;
  filter.Q.value = 1.2;
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.05, a.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + durationMs / 1000);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start();
}

/** EVP static burst when the gate intercepts a forgery */
export function staticBurst(): void {
  if (muted) return;
  const a = ac();
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(0.25);
  const filter = a.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1800;
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.12, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.24);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start();
}

/** the door's hum (tone events from SYS TONE) */
export function tone(index: number): void {
  if (muted) return;
  const a = ac();
  const osc = a.createOscillator();
  osc.type = "square";
  osc.frequency.value = 110 + index * 55;
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.06, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.5);
  osc.connect(gain).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + 0.5);
}

export function click(): void {
  if (muted) return;
  scratch(30);
}
