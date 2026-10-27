# Before The DrACO Side Audit

Archived by Codex (OpenAI), October26-27,2026. Exact baseline a67cb6f;
recovery tag `archive/draco-side-audit-2026-10-26`.

| Saved file | Original path |
|---|---|
| drills.mjs | dist/drills.mjs |
| draco-plumbing.mjs | dist/draco-plumbing.mjs |
| sampling-connections.mjs | dist/sampling-connections.mjs |
| index.html | dist/index.html |
| ui-layers-panel.mjs | dist/ui/layers-panel.mjs |

The audit does not replace physical hardware. Exact before/after mesh, material
and pose tests cover both drills, sample lines and blowers at three feed states.
The existing [drill model/source sheet](../../research/drills-2026-10-13/model-vs-sources.jpg)
therefore remains the hardware before-picture; no duplicate source sheet is made.
The earlier [public app view](../../research/iem-terminal-cleanup-2026-10-26/public-full-iem.png)
records the pre-audit inspector layout. New focus and phone samples are in the
[audit research](../../research/draco-side-audit-2026-10-26/README.md).

To restore this specific audit later, first archive any subsequent edits, then copy
the five files back to their listed paths. Remove only the newly added DrACO
inventory section/targets if restoring selectively. The baseline versions of
`tests/draco-plumbing.test.mjs` and `tests/inspection-layout.test.mjs` are available
from the recovery tag; the new audit test depends on the new targets and media
classification and must be handled with the restored feature, not left falsely passing.
Do not reset the repository or overwrite unrelated work. Run the full suite and
inspect the result before any republish. Nothing is restored automatically.
