// Optional battle soundscape (off by default, like the simulator's): the swarm's hum, rain, wind
// and eruption rumble, and synthesized shots, explosions, chimes, sirens, thunder, pod entry and
// parachutes. Levels and cues come from battle-sound.mjs. Everything is generated with Web Audio,
// with no sound files. Browsers only start audio after a click or tap.
import { battleMix, soundCues, soundLevels, nextSoundLevel } from "./battle-sound.mjs?v=dev";

const PREF_KEY = "swarmfall-sound";
let level = 0;
try { level = Math.max(0, soundLevels.indexOf(Number(localStorage.getItem(PREF_KEY)))); } catch { /* storage may be unavailable */ }
let audio = null;

function buildAudio() {
  const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Context) return null;
  const ctx = new Context();
  const master = ctx.createGain();
  master.gain.value = soundLevels[level];
  master.connect(ctx.destination);
  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const gain = (value = 0) => { const node = ctx.createGain(); node.gain.value = value; return node; };
  const filter = (type, frequency, q = 0.7) => { const node = ctx.createBiquadFilter(); node.type = type; node.frequency.value = frequency; node.Q.value = q; return node; };
  const loop = (target) => { const source = ctx.createBufferSource(); source.buffer = noise; source.loop = true; source.connect(target); source.start(); };

  // Continuous beds: hum (two detuned saws), rain (high hiss), wind (low noise), rumble (sub noise).
  const humGain = gain(), humFilter = filter("lowpass", 600);
  const hums = [0, 1.013].map(detune => { const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 100 * (detune || 1); osc.connect(humFilter); osc.start(); return osc; });
  humFilter.connect(humGain).connect(master);
  const rainGain = gain();
  const rainFilter = filter("highpass", 2500); loop(rainFilter); rainFilter.connect(rainGain).connect(master);
  const windGain = gain(), windFilter = filter("lowpass", 450); loop(windFilter); windFilter.connect(windGain).connect(master);
  const rumbleGain = gain(), rumbleFilter = filter("lowpass", 110); loop(rumbleFilter); rumbleFilter.connect(rumbleGain).connect(master);

  // One-shots. envelope(node, peak, attack, decay) shapes a gain from now.
  const now = () => ctx.currentTime;
  const envelope = (peak, attack, decay, start = now()) => {
    const node = gain(0);
    node.gain.setValueAtTime(0.0001, start);
    node.gain.exponentialRampToValueAtTime(peak, start + attack);
    node.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
    node.connect(master);
    return node;
  };
  const tone = (type, from, to, peak, decay, start = now()) => {
    const osc = ctx.createOscillator(); osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + decay);
    osc.connect(envelope(peak, 0.005, decay, start));
    osc.start(start); osc.stop(start + decay + 0.05);
  };
  const burst = (type, frequency, peak, decay, q = 0.8, start = now()) => {
    const source = ctx.createBufferSource(); source.buffer = noise;
    source.connect(filter(type, frequency, q)).connect(envelope(peak, 0.004, decay, start));
    source.start(start, Math.random() * 1.5); source.stop(start + decay + 0.05);
  };
  const play = {
    shot({ fx }) {
      if (fx === "laser") tone("sine", 1800, 400, 0.12, 0.12);
      else if (fx === "missile") burst("lowpass", 700, 0.18, 0.45, 0.6);
      else if (fx === "flak") { burst("lowpass", 500, 0.22, 0.12); tone("sine", 140, 60, 0.15, 0.12); }
      else if (fx === "spear") burst("bandpass", 900, 0.08, 0.2, 2);
      else if (fx === "charge") tone("square", 520, 260, 0.06, 0.1);
      else burst("bandpass", 2200, 0.1, 0.05, 1.2);
    },
    boom({ size = 1 }) { tone("sine", 90, 32, 0.5 * size, 0.5 + 0.3 * size); burst("lowpass", 900, 0.35 * size, 0.35 + 0.2 * size); },
    chime() { tone("sine", 660, 660, 0.18, 0.35); tone("sine", 990, 990, 0.14, 0.5, now() + 0.12); },
    loss() { tone("triangle", 440, 330, 0.16, 0.5); },
    siren({ stage = 1 }) { for (let k = 0; k < stage; k += 1) tone("sawtooth", 500, 820, 0.07, 0.45, now() + k * 0.5); },
    thunder({ size = 1 }) { burst("lowpass", 1400, 0.3 * size, 0.15); burst("lowpass", 260, 0.45 * size, 1.6, 0.5, now() + 0.08); },
    entry() { const source = ctx.createBufferSource(); source.buffer = noise; const sweep = filter("lowpass", 250); sweep.frequency.exponentialRampToValueAtTime(1100, now() + 1.2); source.connect(sweep).connect(envelope(0.16, 0.4, 1.0)); source.start(); source.stop(now() + 1.5); },
    chute() { for (let k = 0; k < 5; k += 1) burst("bandpass", 200, 0.08, 0.07, 1.2, now() + k * 0.11); },
  };
  // Each cue type repeats at most this often (s), so steady fire is a rattle, not a roar.
  const spacing = { shot: 0.09, boom: 0.06, chime: 0.3, loss: 0.3, siren: 1, thunder: 0.4, entry: 0.5, chute: 0.3 };
  const last = new Map();

  return {
    ctx,
    setLevel(value) { master.gain.setTargetAtTime(value, now(), 0.05); },
    update(mix, cues) {
      const at = now();
      humGain.gain.setTargetAtTime(mix.humGain, at, 0.2);
      for (const [k, osc] of hums.entries()) osc.frequency.setTargetAtTime(mix.humHz * (k ? 1.013 : 1), at, 0.3);
      rainGain.gain.setTargetAtTime(mix.rainGain, at, 0.6);
      windGain.gain.setTargetAtTime(mix.windGain, at, 0.6);
      rumbleGain.gain.setTargetAtTime(mix.rumbleGain, at, 0.3);
      for (const cue of cues) {
        const key = cue.type === "shot" ? `shot/${cue.fx}` : cue.type;
        if (at - (last.get(key) ?? -1) < (spacing[cue.type] ?? 0.1)) continue;
        last.set(key, at);
        play[cue.type]?.(cue);
      }
    },
  };
}

function start() {
  if (!audio) audio = buildAudio();
  if (audio && audio.ctx.state !== "running" && document.visibilityState === "visible") audio.ctx.resume();
}

export const soundLabel = () => (level ? `♪ ${level}` : "♪ Off");

// Off → quiet → medium → loud → off; remembered on this device.
export function cycleSound() {
  level = nextSoundLevel(level);
  try { localStorage.setItem(PREF_KEY, String(soundLevels[level])); } catch { /* optional */ }
  if (level) { start(); audio?.setLevel(soundLevels[level]); } else audio?.ctx.suspend();
  return soundLabel();
}

// A remembered level can only start after the next click or tap on the page.
// (Guarded: the page's tests load this module without a browser window.)
const resumeOnGesture = () => { if (level) start(); };
globalThis.window?.addEventListener?.("pointerdown", resumeOnGesture);
globalThis.window?.addEventListener?.("keydown", resumeOnGesture);
globalThis.document?.addEventListener?.("visibilitychange", () => {
  if (!audio) return;
  if (document.visibilityState === "hidden") audio.ctx.suspend();
  else if (level) audio.ctx.resume();
});

// Called every frame during a mission with the view and this frame's battle events.
export function updateBattleSound(b, view, events) {
  if (!level || !audio || audio.ctx.state !== "running") return;
  audio.update(battleMix(b, view), soundCues(events, view));
}

// Silence the beds between missions.
export function quietSound() {
  if (audio) audio.update({ humGain: 0, humHz: 90, rainGain: 0, windGain: 0, rumbleGain: 0 }, []);
}
