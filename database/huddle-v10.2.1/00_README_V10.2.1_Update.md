# huddle-v10.2.1 — updating the Huddle content from V8.0 to V10.2.1

Generated from `Frontier_Accelerator_Huddle_App_Content_Integration_Model_V10.2.1.xlsx` (the
workbook your manager shared) by the same `database/huddle-v4/generate.py` generator that loaded
V8.0, re-run against the new workbook. **Nothing here has been run against SQL Server** — these
are scripts for you to review and run yourself, exactly as asked.

## What changed, V8.0 → V10.2.1 (verified directly against both workbooks)

| Area | V8.0 | V10.2.1 | Diff |
|---|---|---|---|
| Segments | 1 | 2 | +1 (SME&C) |
| Roles | 8 | 13 | +5 (DAE, DSS, DSE, DCSA, PSS) |
| Segment_Roles | 8 | 15 | +7 |
| Topics | 22 | 25 | +3 (WF-X-SIGNAL-01, WF-X-PARTNER-01, WF-X-TERRITORY-01) |
| Role_Paths | 56 | 74 | +18 |
| Additional_Content | 25 | 29 | +4 |
| Preparation / Explore_Practice / Commit | 81 each | 103 each | +22 each |
| Activities | 330 | 403 | +73 new; 164 of the 330 existing activities also changed content (162 of those are HumanCheckpoint text) |
| Resources | 49 | 51 | +2 |
| Activity_Agents | 366 | 433 | +67 net (79 new rows, 12 stale rows retired — see script 13) |

No row that exists in the V8.0 workbook is missing from V10.2.1 anywhere else — every other sheet
(Topic_MCEM, Topic_Agents, Topic_Resources, Agent_Resources, Activity_Resources, Agents) is a pure
superset or in-place edit of what was already there. This was checked exhaustively, sheet by
sheet, not sampled.

## Run order

Everything is MERGE-based and keyed on ExternalId (or the natural key for junction tables), so
re-running any script is safe. Nothing in scripts 01–12 deletes a row.

| Step | Script | Notes |
|---|---|---|
| 1 | `01_Preflight_Checks.sql` | Unchanged from huddle-v4. Read-only. Stop here if it fails. |
| 2–10 | `02_Seed_Reference_Data.sql` … `10_Seed_Huddle_Activity_Prerequisites.sql` | Same run order and dependencies as huddle-v4 (see that folder's own README for the dependency reasons — they're unchanged). This is the actual V10.2.1 content: new segment, new roles, new role paths, new activities, and every content correction the workbook carries (HumanCheckpoint rewrites, Sales Agent mobile/MSX copy, the new MCAPS Marketplace resource, agent name normalization, etc.) — all handled automatically by the MERGE, since it updates every non-key column on a row it already recognizes. |
| 10b | `10b_Cleanup_Stale_TopicMcemStages.sql` | **Deletes one row.** `WF-X-RENEW-01` moved from MCEM-04 to MCEM-05 between what you already loaded and V10.2.1 — MERGE can insert the corrected row in script 11 but can't remove the old one, and the leftover row collides on a UNIQUE index. Read the header comment; it previews the row first, and is safe to re-run (0 rows deleted the second time is expected, not an error). Run this before script 11. |
| 11 | `11_Seed_Topic_And_Agent_Joins.sql` | Continues the same MERGE-based content load. |
| 11c | `11c_Cleanup_Stale_ECIF_ActivityAgents.sql` | **Deletes 12 rows, once.** Removes the stale HuddleActivityAgents rows the ECIF attribution correction leaves behind, for the same reason as 10b: script 12's MERGE would otherwise try to insert the corrected row under a UsageType that doesn't match the stale row, collide on a UNIQUE index, and fail. Read the header before running it — it previews what it's about to delete first. **Run this before script 12** — do not use the old `13_Cleanup_Stale_ECIF_ActivityAgents.sql` file, which has been left as a no-op with a pointer to this one. |
| 12 | `12_Seed_Activity_Joins.sql` | Continues the same MERGE-based content load. |
| 14 | `14_Validate_Import.sql` | Read-only. Row counts against the real V10.2.1 totals, the same Featured/Extended and integrity checks as huddle-v4's validator, plus two new checks specific to this update (every Huddle role has a Segment value; the 6 ECIF activities have exactly one agent row after cleanup). |

## Two things worth reading before you run this

**1. `Roles.Segment` is denormalised, and now one role genuinely spans two segments.**
`dbo.Roles` has a single `Segment` nvarchar column, but the real relationship lives in
`HuddleSegmentRoles` — and V10.2.1 makes that matter for the first time, because Commercial
Executive (`ROLE-CE`) is now linked to **both** Enterprise and SME&C (`SR-ENT-CE` and
`SR-SMEC-CE`), rather than being a role with one obvious segment. The original generator hardcoded
`Segment = 'Enterprise'` for every role, which was harmless while there was only one segment but
would have mislabeled all 5 new SME&C-only roles as "Enterprise" once run against this workbook.

I fixed this in `database/huddle-v4/generate.py` (the generator itself, so any future re-run stays
correct) rather than working around it in the SQL: a role's `Segment` is now the segment it first
appears under in `Segment_Roles`, in workbook row order. Every pre-existing role keeps
`Segment = 'Enterprise'` exactly as before (no behavior change for the 8 you already have); the 5
new roles correctly get `Segment = 'SME&C'`. You can see the diff by comparing
`database/huddle-v4/generate.py` against `database/huddle-v4/generate.py.pre-v10.2.1.bak`, which I
left in place. `02_Seed_Reference_Data.sql` in this folder reflects the fix already applied.

**2. Two `Topic_Agents` rows are still incomplete and were skipped, not guessed at.**
Both are for `WF-X-TRANSITION-01` (agents `AGT-001` and `AGT-003`) — the same two rows flagged
back when V8.0 was loaded (they're in this project's notes from that pass too), still missing
`UsageType` and `DisplayOrder` in this workbook. The generator now skips a row like this rather
than crashing the whole run (previously one bad row would have blocked all 400+ good ones) — see
`SKIPPED_ROWS.md` in this folder. `HuddleTopicAgents` will load 63 rows, not the 65 physically in
the sheet, until your manager fills those two in and you re-run the generator.

## Files in this folder

- `Frontier_Accelerator_Huddle_App_Content_Integration_Model_V10.2.1.xlsx` — the source workbook, copied in for provenance.
- `01_Preflight_Checks.sql` — copied unchanged from `database/huddle-v4/`.
- `02_Seed_Reference_Data.sql` … `12_Seed_Activity_Joins.sql` — generated fresh from the V10.2.1 workbook.
- `10b_Cleanup_Stale_TopicMcemStages.sql` — hand-written, deletes the one stale `HuddleTopicMcemStages` row (`WF-X-RENEW-01` / MCEM-04) left behind when that topic's MCEM stage was corrected to MCEM-05. Run before script 11; read it first.
- `11c_Cleanup_Stale_ECIF_ActivityAgents.sql` — hand-written, deletes the 12 stale `HuddleActivityAgents` rows the ECIF attribution correction leaves behind. Run before script 12; read it first.
- `13_Cleanup_Stale_ECIF_ActivityAgents.sql` — superseded by `11c_...` above (same fix, wrong position in the run order). Left in place as a no-op with a pointer, not deleted, so nothing that already references the old filename breaks.
- `14_Validate_Import.sql` — run last.
- `expected_counts.txt` — raw sheet row counts the generator computed (note: `HuddleTopicAgents` here reads 65; the real expected load count is 63, see above and script 14's own header).
- `DATA_CORRECTIONS.md` — 23 deterministic DisplayOrder collisions the generator resolved automatically (duplicate display-order values within one owner; same class of fix as V8.0's load, just a fresh list for this workbook).
- `SKIPPED_ROWS.md` — the 2 rows above that were left out rather than guessed at.

## What I did not touch

`dbo.Roles`' pre-existing rows from the Workflow Builder module (`database/fresh-install/10_Workflow_Roles.sql` / `database/001-upsert-roles.sql`) are untouched — this update only adds/updates the Huddle-namespaced `ROLE-*` rows, exactly as V8.0's load already did. No SQL Server connection was used at any point; every script above is generated text waiting for you to run it.
