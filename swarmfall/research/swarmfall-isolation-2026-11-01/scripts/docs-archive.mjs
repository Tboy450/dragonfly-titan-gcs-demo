import { pathToFileURL } from "node:url";
const { readDoc, writeDoc, relinkBlock, replaceOnce } = await import(pathToFileURL(process.argv[2] + "/docutil.mjs").href);
const { eol, text } = readDoc("archive/README.md");
const lines = text.split("\n");
const moved = lines.filter(line => line.startsWith("| [") && line.includes("](../swarmfall/archive/"));
const kept = lines.filter(line => !moved.includes(line));
const rows = relinkBlock(moved.join("\n"), "archive", "swarmfall/archive");
const index = `# Swarmfall Archive

Earlier versions of the game and the Asset & Environment Lab, kept at the owner's request with
pictures, the original code or files, and steps to bring them back. The rule is the repository's
([archive/README.md](../../archive/README.md)): replaced work is never thrown away; archive it here
in the same change, with a folder, a git tag \`archive/<name>\` on the last commit that used it and
a row in the table below. None of this is published on the website.

These folders moved here from the repository's \`archive/\` with their history on November 1, 2026.
Their git tags are unchanged. Restore steps written before then name the paths of the time:
\`dist/invasion/\` is now \`swarmfall/dist/\`, \`tests/invasion-*\` is \`swarmfall/tests/\` and
\`SWARMFALL-TODO.md\` is \`swarmfall/TODO.md\`.

| Folder | What | Replaced on | Git tag |
|---|---|---|---|
${rows}
`;
writeDoc("swarmfall/archive/README.md", index, eol);
let out = kept.join("\n");
out = replaceOnce(out, "were never committed).\n\n| Folder | What | Replaced on | Git tag |",
  "were never committed).\n\nSwarmfall's archived versions moved with the game to [swarmfall/archive/](../swarmfall/archive/README.md)\non November 1, 2026; archive replaced game and lab work there.\n\n| Folder | What | Replaced on | Git tag |", "pointer");
writeDoc("archive/README.md", out, eol);
console.log(`moved ${moved.length} rows`);
