// What the optional soundscape should sound like for the current state: levels (0-1) and
// frequencies (Hz). Pure, so it can be tested without audio; ui/sound.mjs turns it into sound.
// Rotor blade-pass frequency = rpm / 60 x 3 blades (35 Hz at 700 rpm). The motor whine assumes
// 7 pole pairs. Levels, filters and the arrival sounds are artistic [EST]. Titan's thick, cold
// nitrogen air carries sound well, so nothing is muffled the way it would be on Mars.
const clamp01 = (value) => Math.min(1, Math.max(0, value));
export const bladesPerRotor = 3;

export function soundMix(state) {
  const rpms = state.rotorRpm || [];
  const rpm = rpms.length ? rpms.reduce((sum, value) => sum + value, 0) / rpms.length : 0;
  const spin = clamp01(rpm / 700);
  const e = state.edl;
  // Wind: the ambient wind plus the air the vehicle is moving through.
  const airflow = Math.abs(state.wind || 0) + Math.abs(state.speed || 0) * 0.6 + Math.abs(state.verticalSpeed || 0) * 0.5;
  const windiness = clamp01(airflow / 12);
  const drogue = e?.chute === "drogue" ? e.chuteOpen : 0, main = e?.chute === "main" && !e.released ? e.chuteOpen : 0;
  return {
    rotorHz: rpm / 60 * bladesPerRotor,
    motorHz: rpm / 60 * 7,
    rotorGain: 0.22 * spin ** 1.5,
    motorGain: 0.03 * spin,
    windGain: 0.015 + 0.11 * windiness,
    windCutoffHz: 250 + 1100 * windiness,
    // Arrival: the roar of entry heating, canopy flutter, and a thump for each pyrotechnic event.
    roarGain: e ? 0.4 * (e.glow || 0) + 0.12 * (e.speedCue || 0) * (e.t < 10 ? 1 : 0) : 0,
    flutterGain: 0.16 * drogue + 0.07 * main,
    flutterHz: drogue ? 9 : 4.5,
    thump: e?.pyro && e.pyro.age < 0.15 ? e.pyro.kind : null,
  };
}
