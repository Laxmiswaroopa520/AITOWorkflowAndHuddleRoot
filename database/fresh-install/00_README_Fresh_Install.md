# fresh-install

A complete build of the AITO database from nothing: schema plus all reference and content data for
both the **Workflow** module and the **Huddle** module.

Run the scripts in numeric order in SSMS. Every script is safe to re-run. Nothing here deletes.

Use this folder instead of `huddle/`, `huddle-v4/`, `huddle-v4-reset/`, `huddle-v4-schema/` and the
numbered scripts in `database/`. Those record how this database was built incrementally over time,
including a reset and a repair that only mattered because of the order things happened in. On a new
machine none of that history is needed.

---

## Before you start

**The database name matters.** Scripts 10 to 15 carry `USE [AitoWorkflowAndHuddleGeneratorDb]`
because they came from the original SharePoint import. Either let script 01 create a database with
that name, or edit the `USE` line in those six files to match your database.

Scripts 02, 03 and 20 onward have no `USE` statement, so select the right database in SSMS before
running them.

**Order is not optional.** Two places depend on it:

- Roles must load from the Workflow export (script 10) **before** the Huddle reference data
  (script 20). Script 20 matches roles on `Abbreviation` and only inserts an `ExternalId` when no
  row matches. Load Huddle first and your roles end up with workbook ids (`ROLE-AE`) instead of the
  application's (`ae-ent`), which breaks the audience picker.
- Placements must exist before phases, guides and activities, and every activity must exist before
  the prerequisites in script 28 can link them.

---

## Run order

| # | Script | Writes | Notes |
|---|---|---|---|
| 01 | `01_Create_Database.sql` | — | Creates `AitoWorkflowAndHuddleGeneratorDb` if absent. Skip if the database already exists. |
| 02 | `02_Schema_All_Migrations.sql` | 33 tables | All seven EF Core migrations as one idempotent script. |
| 03 | `03_Preflight_Checks.sql` | — | **Read-only.** Confirms the schema landed and reports current row counts. Stop here if it fails. |
| | | | |
| 10 | `10_Workflow_Roles.sql` | `Roles` | 8 roles. Must run before script 20. |
| 11 | `11_Workflow_AiTools.sql` | `AiTools` | 14 tools. |
| 12 | `12_Workflow_Buckets.sql` | `WorkflowBuckets` | 9 buckets. |
| 13 | `13_Workflow_Activities.sql` | `Activities` | 186 activities. Largest file, roughly 160 KB. |
| 14 | `14_Workflow_Activity_AiTools.sql` | `ActivityAiTools` | 215 mappings. |
| 15 | `15_Workflow_Verify.sql` | — | **Read-only.** Workflow counts and orphan checks. |
| | | | |
| 20 | `20_Huddle_Reference_Data.sql` | segments, segment roles, focus areas, MCEM stages, role `ExternalId` alignment | Run after 10. |
| 21 | `21_Huddle_Topics.sql` | `HuddleTopics`, `HuddleTopicRoles` | 16 topics. |
| 22 | `22_Huddle_Placements.sql` | `HuddlePlacements`, `HuddleRolePathItems` | 70 placements. The core of the Huddle model. |
| 23 | `23_Huddle_Phases.sql` | `HuddlePhases` | 210, three per placement. |
| 24 | `24_Huddle_Facilitator_Guides.sql` | `HuddleFacilitatorGuides` | 70, one per placement. Carries Reflect and Commit. |
| 25 | `25_Huddle_Agents.sql` | `HuddleAgents` | 18 agents. |
| 26 | `26_Huddle_Resources.sql` | `HuddleResources` | 49 resources. |
| 27 | `27_Huddle_Activities.sql` | `HuddleActivities` | 281 activities, 176 Featured and 105 Extended. |
| 28 | `28_Huddle_Activity_Prerequisites.sql` | `HuddleActivities.PrerequisiteHuddleActivityId` | 65 links. Must run after 27. |
| 29 | `29_Huddle_Topic_And_Agent_Joins.sql` | topic MCEM, topic agents, topic resources, agent resources | |
| 30 | `30_Huddle_Activity_Joins.sql` | activity agents, activity resources | |
| | | | |
| 40 | `40_Validate_Everything.sql` | — | **Read-only.** Counts for both modules, role-path shape, tier split, and 13 integrity assertions. |

---

## What you should see at the end

Script 40 prints counts for both modules. The ones worth reading closely:

```
Roles                     9      (8 from Workflow + ROLE-ALL from the Huddle workbook)
Activities              186      Workflow
ActivityAiTools         215      Workflow
HuddleTopics             16
HuddlePlacements         70      (56 role path and orientation + 14 additional content)
HuddlePhases            210
HuddleFacilitatorGuides  70
HuddleActivities        281
```

Then the role-path table, which is the single best check that the Huddle model is right:

```
SegmentRole    Weeks  FirstWeek  LastWeek  DistinctTopics  Result
SR-ENT-AE          8          1         8               7  OK
SR-ENT-ATS         8          1         8               5  OK
SR-ENT-CE          8          1         8               6  OK
SR-ENT-CSA         8          1         8               6  OK
SR-ENT-CSAM        8          1         8               7  OK
SR-ENT-SE          8          1         8               6  OK
SR-ENT-SSP         8          1         8               7  OK
```

Seven roles, eight weeks each, always starting at 1. `DistinctTopics` is deliberately fewer than 8:
a role revisits a topic in more than one week, so ATS runs five distinct topics across its eight
weeks. If you see 8 distinct topics, or 7 weeks, or a first week of 2, something is wrong.

A count **higher** than expected is a pass, because every data script is a `MERGE` and a database
that also holds older seed rows will read high. A count **lower** than expected means a script did
not finish.

---

## Sources

| Scripts | Generated from |
|---|---|
| 02 | The EF Core migrations in `AitoWorkflowAndHuddleGenerator.Infrastructure/Persistence/Migrations` |
| 10 to 15 | The original SharePoint CSV exports, via `database/001-*.sql` to `006-*.sql` |
| 20 to 30 | `App Data Final.xlsx`, via `database/huddle-v4/generate.py` |
| 03, 40 | Written for this folder |

To regenerate the Huddle data after a workbook change:

```
cd database/huddle-v4
python generate.py "App Data Final.xlsx" .
```

then copy scripts 02 to 12 over files 20 to 30 here. `DATA_CORRECTIONS.md` in this folder lists the
deterministic corrections the generator applied to duplicate `DisplayOrder` values, so the workbook
can be fixed at source.

To regenerate the schema after a model change:

```
dotnet ef migrations script --idempotent ^
  --project AitoWorkflowAndHuddleGenerator.Infrastructure ^
  --startup-project AitoWorkflowAndHuddleGenerator.Api ^
  --output database/fresh-install/02_Schema_All_Migrations.sql
```

---

## Deliberately not included

- **`database/009-add-launch-planner.sql`** creates `dbo.UserLaunchPlans`. That table is not in the
  EF model and no code references it. The Launch Planner uses `UserHuddleLaunchPlans`, which
  script 02 creates. Including it would add a permanently empty table.
- **`database/007-` and `008-optional-import-*.sql`** import two saved workflows and five share
  rows from SharePoint. Test data, not reference data.
- **`huddle-v4-reset/`** deletes existing content. There is nothing to delete on a new machine.
- **`huddle-v4-reset/00_REPAIR_Remove_Duplicate_Roles.sql`** fixes duplicate roles created by
  loading Huddle reference data before the Workflow roles. Following the order above, the problem
  cannot occur.
- **User data.** No script here writes to `UserHuddlePlans`, `UserHuddleSessions`,
  `UserHuddleActivityProgress`, `UserWorkflows`, `HuddleVotes` or `UserHuddleLaunchPlans`. Those
  fill up as people use the application.

---

## If something fails

Every data script runs inside a single transaction with `SET XACT_ABORT ON`, so a failure rolls the
whole script back. Fix the cause and re-run that one script; you do not need to start over.

The two failures most likely on a new machine:

1. **`Invalid object name 'dbo.Roles'`** in scripts 10 to 15. The `USE` statement is pointing at a
   database where the schema was never applied. Check the database name.
2. **`Cannot insert duplicate key ... IX_...DisplayOrder`.** Two rows in the workbook claim the same
   position within one owner. `DATA_CORRECTIONS.md` lists the ones already corrected; a new one
   means the workbook changed and `generate.py` needs re-running.
