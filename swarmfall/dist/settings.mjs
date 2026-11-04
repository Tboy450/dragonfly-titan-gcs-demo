// Player settings (CTRL-10): camera speed, drag direction, UI size and key bindings. They belong
// to this device, apart from the campaign save, and every field is checked when it loads.
export const SETTINGS_KEY = "swarmfall-settings";
export const cameraSpeeds = Object.freeze([0.5, 0.75, 1, 1.5, 2]);
export const uiScales = Object.freeze([0.85, 1, 1.15, 1.3]);

// Actions a key can be bound to, in the order the settings list them. Enter, Escape, Tab, Shift,
// the number keys, the arrow keys, Page Up/Down and + - = stay fixed, so moving, flying, zooming,
// squads, orders and the menu always have a key.
export const keyActions = Object.freeze([
  { id: "forward", group: "Camera", label: "Pan forward", key: "w" },
  { id: "back", group: "Camera", label: "Pan back", key: "s" },
  { id: "left", group: "Camera", label: "Pan left", key: "a" },
  { id: "right", group: "Camera", label: "Pan right", key: "d" },
  { id: "turnLeft", group: "Camera", label: "Turn left", key: "q" },
  { id: "turnRight", group: "Camera", label: "Turn right", key: "e" },
  { id: "tiltUp", group: "Camera", label: "Tilt up (free camera: fly up)", key: "r" },
  { id: "tiltDown", group: "Camera", label: "Tilt down (free camera: fly down)", key: "f" },
  { id: "zoomOut", group: "Camera", label: "Zoom out (free camera: look up)", key: "z" },
  { id: "zoomIn", group: "Camera", label: "Zoom in (free camera: look down)", key: "x" },
  { id: "freeCam", group: "Camera", label: "Free camera", key: "c" },
  { id: "follow", group: "Camera", label: "Follow squads", key: "g" },
  { id: "alert", group: "Camera", label: "Jump to alert", key: "j" },
  { id: "resetView", group: "Camera", label: "Reset view", key: "home" },
  { id: "cleanView", group: "Camera", label: "Clean view", key: "v" },
  { id: "drop", group: "Orders", label: "Drop panel", key: "b" },
  { id: "hold", group: "Orders", label: "Hold position", key: "h" },
  { id: "attackMove", group: "Orders", label: "Attack-move", key: "t" },
  { id: "patrol", group: "Orders", label: "Patrol", key: "p" },
  { id: "formation", group: "Orders", label: "Formation", key: "l" },
  { id: "holdFire", group: "Orders", label: "Hold fire", key: "y" },
  { id: "pause", group: "Mission", label: "Pause", key: " " },
  { id: "sound", group: "Mission", label: "Sound", key: "m" },
]);
const actionIds = new Set(keyActions.map(a => a.id));
const namedKeys = { " ": "Space", home: "Home", end: "End", insert: "Insert", delete: "Delete", backspace: "Backspace" };

// A key can be bound when it is one lower-case character other than a digit, + - or =, or one of
// a few named keys. Event keys are lower-cased before they get here.
export const bindable = (key) => typeof key === "string"
  && (Object.hasOwn(namedKeys, key) || ([...key].length === 1 && !/[0-9+=-]/.test(key) && key === key.toLowerCase()));
export const keyName = (key) => (!key ? "none" : namedKeys[key] ?? key.toUpperCase());
export const defaultKeys = () => Object.fromEntries(keyActions.map(a => [a.id, a.key]));
export const createSettings = () => ({ cameraSpeed: 1, invertDrag: false, uiScale: 1, keys: defaultKeys() });

export function validSettings(raw) {
  const clean = createSettings();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return clean;
  if (cameraSpeeds.includes(raw.cameraSpeed)) clean.cameraSpeed = raw.cameraSpeed;
  if (typeof raw.invertDrag === "boolean") clean.invertDrag = raw.invertDrag;
  if (uiScales.includes(raw.uiScale)) clean.uiScale = raw.uiScale;
  const saved = raw.keys && typeof raw.keys === "object" && !Array.isArray(raw.keys) ? raw.keys : {};
  // Saved choices first, then defaults for the rest. A key is never used twice: an action whose
  // default was taken by a saved choice is left without a key (shown as "none").
  const keys = {}, taken = new Set();
  for (const a of keyActions) {
    const key = Object.hasOwn(saved, a.id) ? saved[a.id] : undefined;
    if (bindable(key) && !taken.has(key)) { keys[a.id] = key; taken.add(key); }
  }
  for (const a of keyActions) {
    if (Object.hasOwn(keys, a.id)) continue;
    keys[a.id] = taken.has(a.key) ? null : a.key;
    taken.add(a.key);
  }
  clean.keys = keys;
  return clean;
}

// Bind a key to an action. A key already in use moves over, and the other action takes this
// one's old key, so nothing is left without one. Returns null for a reserved key.
export function bindKey(settings, id, key) {
  if (!actionIds.has(id) || !bindable(key)) return null;
  const keys = { ...settings.keys };
  const swapped = keyActions.find(a => a.id !== id && keys[a.id] === key)?.id ?? null;
  if (swapped) keys[swapped] = keys[id];
  keys[id] = key;
  return { settings: { ...settings, keys }, swapped };
}
export const resetKeys = (settings) => ({ ...settings, keys: defaultKeys() });
export const actionFor = (settings, key) => keyActions.find(a => settings.keys[a.id] === key)?.id ?? null;
export const nextOf = (list, value) => list[(list.indexOf(value) + 1) % list.length];
export const percent = (scale) => `${Math.round(scale * 100)}%`;
// "{drop}" in a text becomes the name of the drop key as it is bound now.
export const fillKeys = (text, keys = defaultKeys()) => text.replace(/\{(\w+)\}/g, (match, id) => (actionIds.has(id) ? keyName(keys[id]) : match));
