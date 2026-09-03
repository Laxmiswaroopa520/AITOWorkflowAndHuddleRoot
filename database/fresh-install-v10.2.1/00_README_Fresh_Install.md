# fresh-install-v10.2.1

A complete build of the AITO database from nothing: schema plus all reference and content data for
both the **Workflow** module and the **Huddle** module, with the Huddle content updated to
**V10.2.1** (full SME&C segment support, 5 new roles, 3 new topics, 73 new activities, and every
content correction that came with it).

Run the scripts in numeric order in SSMS. Every script is safe to re-run. Nothing here deletes.

This supersedes `database/fresh-install/`, which still has V8.0 Huddle content. Use this folder
for any new environment going forward.

---

## Before you start

**No database name is assumed anywhere in this folder.** Earlier versions of these scripts
hardcoded `USE [AitoWorkflowAndHuddleGeneratorDb]` in a few files; that line has been removed
here. Every script in this folder runs against whatever database you already have selected in
SSMS -- there is no `01_Create_Database.sql` step. Create your database (or use the one you
already have) and make sure it is the active database in SSMS before running script 01.

**Order is not optional.** Two places depend on it:

- Roles must load from the Workflow export (script 10) **before** the Huddle reference data
  (script 20). Both scripts write to the same `dbo.Roles` table, keyed on their own separate
  `ExternalId`s (`ae-ent`, `ce-ent`, ... for Workflow Builder; `ROLE-AE`, `ROLE-DAE`, ... for
  Huddle) -- so the order doesn't avoid a collision, but the rest of the run order (in particular
  script 40's validation) assumes both have already loaded.
- Placements must exist before phases, guides and activities, and every activity must exist before
  the prerequisites in script 28 can link them.

---

## Run order

| # | Script | Writes | Notes |
|---|---|---|---|
| 01 | `01_Schema_All_Migrations.sql` | 33 tables | All seven EF Core migrations as one idempotent script. |
| 02 | `02_Preflight_Checks.sql` | -- | **Read-only.** Confirms the schema landed and reports current row counts. Stop here if it fails. |
| | | | |
| 10 | `10_Workflow_Roles.sql` | `Roles` | 8 roles. Must run before script 20. |
| 11 | `11_Workflow_AiTools.sql` | `AiTools` | 14 tools. |
| 12 | `12_Workflow_Buckets.sql` | `WorkflowBuckets` | 9 buckets. |
| 13 | `13_Workflow_Activities.sql` | `Activities` | 186 activities. Largest Workflow file, roughly 160 KB. |
| 14 | `14_Workflow_Activity_AiTools.sql` | `ActivityAiTools` | 215 mappings. |
| 15 | `15_Workflow_Verify.sql` | -- | **Read-only.** Workflow counts and orphan checks. |
| | | | |
| 20 | `20_Huddle_Reference_Data.sql` | segments, segment roles, focus areas, MCEM stages, roles | Run after 10. Writes 13 Huddle roles: 8 Enterprise + 5 new SME&C (DAE, DSS, DSE, DCSA, PSS). |
| 21 | `21_Huddle_Topics.sql` | `HuddleTopics`, `HuddleTopicRoles` | 25 topics. |
| 22 | `22_Huddle_Placements.sql` | `HuddlePlacements`, `HuddleRolePathItems` | 103 placements. The core of the Huddle model. |
| 23 | `23_Huddle_Phases.sql` | `HuddlePhases` | 309, three per placement. |
| 24 | `24_Huddle_Facilitator_Guides.sql` | `HuddleFacilitatorGuides` | 103, one per placement. Carries Reflect and Commit. |
| 25 | `25_Huddle_Agents.sql` | `HuddleAgents` | 18 agents. |
| 26 | `26_Huddle_Resources.sql` | `HuddleResources` | 51 resources. |
| 27 | `27_Huddle_Activities.sql` | `HuddleActivities` | 403 activities, 264 Featured and 139 Extended. |
| 28 | `28_Huddle_Activity_Prerequisites.sql` | `HuddleActivities.PrerequisiteHuddleActivityId` | 154 links. Must run after 27. |
| 29 | `29_Huddle_Topic_And_Agent_Joins.sql` | topic MCEM, topic agents, topic resources, agent resources | |
| 30 | `30_Huddle_Activity_Joins.sql` | activity agents, activity resources | |
| | | | |
| 40 | `40_Validate_Everything.sql` | -- | **Read-only.** Counts for both modules, role-path shape, tier split, roles-by-segment, and 22 integrity assertions. |

You will not find cleanup scripts numbered `10b` or `11c` here, and that is intentional --
those existed only in the incremental `huddle-v10.2.1/` update folder, to delete stale rows left
behind by upgrading a database that already held V8.0 content. On a fresh, empty database there is
nothing stale to clean up: every MERGE inserts cleanly the first time.

---

## What changed since the last fresh-install (V8.0 -> V10.2.1 Huddle content)

| Area | V8.0 | V10.2.1 | Diff |
|---|---|---|---|
| Segments | 1 | 2 | +1 (SME&C) |
| Roles (Huddle-owned) | 8 | 13 | +5 (DAE, DSS, DSE, DCSA, PSS) |
| Segment roles | 8 | 15 | +7 |
| Topics | 22 | 25 | +3 (Signal, Partner, Territory workflows) |
| Role path items | 56 | 74 | +18 |
| Placements | 70 | 103 | +33 |
| Additional content placements | 14 | 29 | +15 |
| Activities | 330 | 403 | +73 new; 164 of the existing 330 also changed content |
| Resources | 49 | 51 | +2 (including the new MCAPS Marketplace resource) |
| Activity agents | 366 | 433 | +67 net (79 new, 12 stale rows retired -- the ECIF attribution correction, folded straight into script 30 here since there's no prior state to retire it from) |

Full row-by-row detail (every deterministic correction, every skipped row) is in
`DATA_CORRECTIONS.md` and `SKIPPED_ROWS.md` in this folder.

---

## Two things worth reading

**1. `Roles.Segment` is denormalised, and Commercial Executive genuinely spans two segments.**
`dbo.Roles` has a single `Segment` column, but the real relationship lives in
`HuddleSegmentRoles`. Commercial Executive (`ROLE-CE`) is linked to both Enterprise and SME&C
(`SR-ENT-CE` and `SR-SMEC-CE`); its denormalised `Segment` column carries whichever segment it
first appears under (Enterprise), which is expected, not a data gap.

**2. Two `Topic_Agents` rows are still incomplete and were skipped, not guessed at.**
Both are for `WF-X-TRANSITION-01` (agents `AGT-001` and `AGT-003`), missing `UsageType` and
`DisplayOrder` in the source workbook. `HuddleTopicAgents` will load 63 rows, not the 65 physically
in the sheet, until those two rows are completed and the generator re-run. See `SKIPPED_ROWS.md`.

---

## What you should see at the end

Script 40 prints counts for both modules -- see `expected_counts.txt` in this folder for the full
list, or just run 40 itself, which is the authoritative version. The shape worth understanding,
beyond the raw counts: role paths no longer come in one uniform 8-week shape. Enterprise's 7 roles
and SME&C's DAE run the full 8 weeks; SME&C's DSS runs 6; SME&C's second Commercial Executive path
runs 4; and SME&C's DCSA, DSE and PSS have Additional Content only, with no weekly path at all yet.
Script 40's role-path check reports this shape rather than asserting one fixed week count -- what
it does assert is that every segment-role's weeks are contiguous, starting at 1, however many
there are.

A count **higher** than expected in the row-count tables is a pass, because every data script is a
`MERGE` and a database that also holds other seed rows will read high. A count **lower** than
expected means a script did not finish.

---

## Sources

| Scripts | Generated from |
|---|---|
| 01 | The EF Core migrations in `AitoWorkflowAndHuddleGenerator.Infrastructure/Persistence/Migrations` |
| 10 to 15 | The original SharePoint CSV exports, via `database/001-*.sql` to `006-*.sql` (unchanged by this update) |
| 20 to 30 | `Frontier_Accelerator_Huddle_App_Content_Integration_Model_V10.2.1.xlsx`, via `database/huddle-v4/generate.py` (current version, with all fixes below already applied) |
| 02, 40 | Written for this folder, carried forward from `database/fresh-install/` with updated counts and checks |

To regenerate the Huddle data after a future workbook change:

```
cd database/huddle-v4
python generate.py "Frontier_Accelerator_Huddle_App_Content_Integration_Model_VX.Y.Z.xlsx" .
```

then copy scripts 02 to 12 over files 20 to 30 here (see the run-order table above for the exact
mapping), and re-check `DATA_CORRECTIONS.md`/`SKIPPED_ROWS.md`/`expected_counts.txt` and script 40
against the new totals. If you're instead updating a database that already has content loaded
(not a fresh install), you may also need targeted cleanup scripts for anything the workbook
reassigned rather than just added -- see `database/huddle-v10.2.1/`'s own README for two worked
examples (`10b_Cleanup_Stale_TopicMcemStages.sql`, `11c_Cleanup_Stale_ECIF_ActivityAgents.sql`) and
why they were needed there but aren't needed here.

`generate.py` itself picked up five fixes across the V8.0 -> V10.2.1 work, all already reflected
in the scripts in this folder:

1. A role's `Segment` is derived from the segment it first appears under in `Segment_Roles`,
   instead of being hardcoded to `'Enterprise'` -- needed once a role (or a whole new segment)
   could be anything else.
2. An incomplete source row (missing a required field) is skipped and logged to
   `SKIPPED_ROWS.md`, instead of crashing the entire generator run.
3. `HuddleTopicRoles` resolves role links by `ExternalId`, not `Abbreviation` -- `dbo.Roles` is
   shared with the Workflow Builder module, and 7 abbreviations collide between the two.
4. The activity-prerequisite guard matches on topic + segment-role, not exact placement, so a
   prerequisite chain legitimately spanning two placements for the same topic and role (as the CSA
   architecture Huddle does) isn't rejected.
5. `Topic_MCEM`'s `DisplayOrder` gets the same per-owner de-duplication (`renumber()`) that several
   other sheets already used, for workbook rows that list more than one MCEM stage at the same
   position.

To regenerate the schema after a model change:

```
dotnet ef migrations script --idempotent ^
  --project AitoWorkflowAndHuddleGenerator.Infrastructure ^
  --startup-project AitoWorkflowAndHuddleGenerator.Api ^
  --output database/fresh-install-v10.2.1/01_Schema_All_Migrations.sql
```

---

## Deliberately not included

- **`database/009-add-launch-planner.sql`** creates `dbo.UserLaunchPlans`. That table is not in the
  EF model and no code references it. The Launch Planner uses `UserHuddleLaunchPlans`, which
  script 01 creates. Including it would add a permanently empty table.
- **`database/007-` and `008-optional-import-*.sql`** import two saved workflows and five share
  rows from SharePoint. Test data, not reference data.
- **`huddle/`, `huddle-v4/`, `huddle-v4-reset/`, `huddle-v4-schema/`, `huddle-v10.2.1/`, and the
  numbered scripts in `database/`.** Those record how this database was built and updated
  incrementally over time, including a reset, a repair, and cleanup scripts that only mattered
  because of the order things happened in. On a new machine none of that history is needed --
  this folder is the complete, current result of all of it.
- **User data.** No script here writes to `UserHuddlePlans`, `UserHuddleSessions`,
  `UserHuddleActivityProgress`, `UserWorkflows`, `HuddleVotes` or `UserHuddleLaunchPlans`. Those
  fill up as people use the application.

---

## If something fails

Every data script runs inside a single transaction with `SET XACT_ABORT ON`, so a failure rolls the
whole script back. Fix the cause and re-run that one script; you do not need to start over.

The two failures most likely on a new machine:

1. **`Invalid object name 'dbo.Roles'`** in scripts 10 to 15 or 20 to 30. No database was selected
   in SSMS, or the schema script (01) has not been run against it yet.
2. **`Cannot insert duplicate key ... IX_...DisplayOrder`.** Two rows in the workbook claim the
   same position within one owner. `DATA_CORRECTIONS.md` lists the ones already corrected; a new
   one means the workbook changed and `generate.py` needs re-running (see Sources, above).
