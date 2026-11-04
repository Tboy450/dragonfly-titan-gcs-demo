// Shared helpers for moving doc text between folders.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { posix } from "node:path";
export const readDoc = (file) => { const raw = readFileSync(file, "utf8"); return { eol: raw.includes("\r\n") ? "\r\n" : "\n", text: raw.replace(/\r\n/g, "\n") }; };
export const writeDoc = (file, text, eol = "\r\n") => writeFileSync(file, text.replace(/\r?\n/g, eol));
// Re-points relative links in a block of Markdown moved from fromDir to toDir (repo-relative dirs).
export function relinkBlock(text, fromDir, toDir) {
  const swap = (target) => {
    if (!target || /^([a-z][a-z0-9+.-]*:|#|\/)/i.test(target)) return target;
    const [, raw, suffix] = target.match(/^([^?#]*)(.*)$/);
    if (!raw) return target;
    const abs = posix.normalize(posix.join(fromDir || ".", decodeURI(raw)));
    if (!existsSync(abs)) throw new Error(`relinkBlock: ${target} (from ${fromDir || "."}) does not exist as ${abs}`);
    let rel = posix.relative(toDir || ".", abs) || ".";
    if (raw.endsWith("/") && !rel.endsWith("/")) rel += "/";
    return (raw.includes("%20") ? encodeURI(rel) : rel) + suffix;
  };
  return text
    .replace(/(\]\(\s*<?)([^)\s>]+)/g, (w, pre, t) => pre + swap(t))
    .replace(/^(\s{0,3}\[[^\]]+\]:\s*<?)([^\s>]+)/gm, (w, pre, t) => pre + swap(t))
    .replace(/(\b(?:href|src)\s*=\s*["'])([^"']+)(["'])/g, (w, pre, t, post) => pre + swap(t) + post);
}
export function replaceOnce(text, from, to, label) {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one match, found ${count}: ${from.slice(0, 80)}`);
  return text.replace(from, () => to);
}
