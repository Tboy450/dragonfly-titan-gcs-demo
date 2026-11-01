# Save recovery and export — SAVE-02

Implemented October 19, 2026 — **Codex (OpenAI)**.

Open **Save files** on the Swarmfall title screen. It provides:

- **Download this session**: export readable in-memory campaign/mission data as JSON.
- **Download original file**: export the exact saved string, including malformed or future
  formats, without rewriting it. The UI reports a download request, not a confirmed disk save.
- **Preserved browser backups**: select and download earlier originals retained before
  recovery, supported legacy migration or reset. Copies are never automatically deleted.
- **Retry reading saved data**: recheck access without writing. Replacing unsaved session
  data requires confirmation; the player can export it first.

An unsupported/damaged save gets a visible title notice. Mission start/reset stays blocked
until its recovery choice is explicit. If the campaign is readable but the battle is not,
**Recover campaign data** keeps the validated campaign and clears only the unusable battle.
For unsupported campaign formats, **Start fresh with backup** preserves the whole original
before starting over. Cancel leaves the original untouched.

## Preservation and failure behavior

`save-recovery.mjs` separates reading/inspection from writes. Loading never changes storage.
It recognizes progress v1/v2 and mission v1/v2/v3 through the existing migrations and real
previous-version fixtures. Unknown versions are protected rather than silently treated as
a new campaign. Partial campaign recovery is clearly labeled as readable data, not a promise
that every damaged field can be reconstructed. Inherited/non-string unlock definitions are ignored.

Before a protected file is replaced or a supported older save is migrated on disk, the exact
original string is copied to a separate `drone-invasion-progress-recovery-*` key. Contents are
read back; collisions choose another key instead of overwriting an earlier copy. If the
backup fails, replacement stops. If the final primary write fails, the old primary and
backup remain available and the in-memory campaign is not reset prematurely.

Primary data is compared with the inspected original before writing and again after backup.
An observed change in another tab refuses the overwrite and offers session export/reload.
This is a conflict check, not an atomic multi-tab transaction or multiplayer synchronization.
The campaign/checkpoint envelope still commits together in one primary-key write.

Unavailable storage is a distinct state: the player can retry access or play a temporary
campaign. Temporary play cannot overwrite data that could not be read. Browser backups share
the same device/site storage and quota; downloadable files are the external copy. Save import
is not included in this update; unsupported originals remain available for a compatible build.

## Verification

**351/351 repository tests passed.** [Full output](test-results.txt).

Twelve new storage/data tests cover empty/current saves, corrupt JSON, future versions,
recoverable campaign totals, real legacy fixtures and paid cargo, settled mission suppression,
read denial, quota/non-retaining backups, failed final writes/retry, observed cross-tab changes,
backup collisions and invalid session refusal. Seven additional tests run the actual entry-point
wiring with DOM/storage/Blob stand-ins: export contents, confirm/cancel, preserved-backup
selection, blocked-download feedback, failure messages, access retry, failed reset and unsaved-session conflict handling.

**These are Node tests, not real browser automation.** Browser access was previously blocked
and was not retried. Native download behavior, focus/dialog stacking, phone layout, touch and
real storage-fault acceptance remain under SAVE-03/SAVE-06 and the existing release checks.

[Original code and dated picture](../../archive/swarmfall-save-recovery-2026-10-19/README.md)
are preserved under tag `archive/swarmfall-save-recovery-2026-10-19`. No game assets, lab effects,
old checklist IDs or unfinished kit files were removed.
