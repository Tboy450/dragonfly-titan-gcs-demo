# Final IEM Columns: Research Checkpoint

**October26 owner approval received:** refit IDs4/13/21 and their tags/supports
to finish IDs22-26. All endpoints and cable sizes must stay fixed. Proceed with
isolated complete-set/fitting validation before production installation/publishing.
The earlier approval-pending narrative below is retained as the research history.

Codex (OpenAI), October 25, 2026. **Not installed, committed or published.**
The application is unchanged at published build00d32be / receipt a2a055c.

The requested last columns are seven (IDs22/23) and eight (IDs24/25/26).
The existing21-route installation, its source imagery and recovery tag are
preserved in `archive/iem-final-columns-2026-10-25/` and tag of the same name
on a2a055c. No game files/data, Git cleanup or app geometry were changed.

## Finding

Existing low returns and their tags/supports create a tight terminal bottleneck.
Coarse2 mm searches could not connect even the first remaining lead. Finer
0.5/1 mm exploration could connect individual leads but subsequent routes closed
the remaining corridors. The original26 endpoint coordinates/radii, bounds,
main-harness checks, free-span2 mm guard, second-column3 mm guard and gathering
definition were not changed. A search failure is not proof of impossibility.

Diagnostic searches with fittings omitted helped identify the bottleneck but
are **not acceptable installed geometry**. Subsequent planning considered a
limited lower-group reflow of IDs4/13/21 plus the five new leads. Serial trials
have reached six of eight candidates, not a complete accepted set. The current
`candidate-routes.json` may be partial and MUST NOT be installed. Trials/settings
are in `search-attempts.json`; the planner logs have exact failures/visit counts.

Automatic review rejected adding application geometry before obtaining a complete
validated set and explicit permission for changing earlier lead4. The owner was
asked whether IDs4/13/21 and their fittings may be refit with unchanged endpoints
and cable sizes. **Await that approval before any production changes.** No part
of the rejected app patch was executed. The search was stopped while awaiting it.

## Continuation

1. Resolve the owner's scope approval. If preserving finished columns exactly,
   retain the existing app and report the unresolved last-column routing honestly.
2. If approved, obtain all eight candidate routes. Consider reserving the long
   low return4 before the shorter new routes instead of always leaving it last.
   Diagnose actual blockers; do not merely increase trials or lower guards.
3. Validate in an isolated research fixture first, including actual fittings and
   tag placement. The fittings-omitted diagnostic is not a collision result.
4. Only then install the static frozen controls and two new column focus groups.
   Preserve all endpoints/radii and unaffected geometry; explicitly fingerprint
   the allowed lower reflow instead of claiming all21 prior paths stayed exact.
5. Restore `final-columns.test-draft.mjs` to `tests/iem-final-columns.test.mjs`,
   reconcile its preservation set/counts with approved reflow (it currently still
   says nineteen, but allowing4/13/21 means eighteen), and run all tests. The draft
   is intentionally outside test discovery while its app imports do not exist.
6. Remove legacy exclusions only after all26 routes and fittings are screened;
   keep terminal convergence and real-flight interfaces explicitly unresolved.
   Update current assumptions/counts, archive notes and checklist. Reuse existing
   NASA/APL/Ed Whitman real photos/CAD evidence; no repeated comparison sheets.
7. Save one complete-model sample, verify desktop/phone/layers, publish with
   command-local Git cleanup disabled, verify Pages/live build and save receipt.

`write-asset.mjs` refuses anything short of all eight unique IDs. Its output is
not present in `dist/`. `audit.mjs` drafts all325 pair and26 swept-surface checks;
the app still uses the existing published builders. No complete acceptance result
has been claimed or saved for this unfinished pass.
