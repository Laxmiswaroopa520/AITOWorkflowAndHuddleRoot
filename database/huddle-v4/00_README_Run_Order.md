# huddle-v4 data load

Generated from `App Data Final.xlsx` (V3.1 content model, V4 review pass) by `generate.py`.
Everything in this folder except this file and `generate.py` is generated output. Do not hand-edit
the SQL: change the workbook, then re-run the generator.

```
python generate.py "App Data Final.xlsx" .
```

## What this loads

| | Count |
|---|---|
| Segments | 1 |
| Roles | 8 (7 real plus All Roles) |
| Segment roles | 8 |
| Focus areas | 8 |
| MCEM stages | 5 |
| Topics | 16 |
| **Placements** | **70** (49 role path, 7 orientation, 14 additional content) |
| Phases | 210 (three per placement) |
| Facilitator guides | 70 (one per placement) |
| Agents | 18 |
| Resources | 49 |
| **Activities** | **281** (176 Featured, 105 Extended) |
| Activity prerequisites | 65 |
| Activity to agent | 317 |
| Activity to resource | 152 |
| Topic joins | 23 MCEM, 63 agent, 19 resource |
| Agent to resource | 22 |

## Run order

Run in numeric order. Each script wraps itself in a transaction and aborts on the first error,
so a failure leaves nothing half-applied.

| Step | Script | Notes |
|---|---|---|
| 0 | *Apply the EF Core migration* | Must happen first. Script 01 fails if it has not. |
| 1 | `01_Preflight_Checks.sql` | Read-only. Confirms the migration landed. Stop here if it fails. |
| 2 | `02_Seed_Reference_Data.sql` | Segments, roles, segment roles, focus areas, MCEM stages. |
| 3 | `03_Seed_Huddle_Topics.sql` | Topics and aligned roles. |
| 4 | `04_Seed_Huddle_Placements.sql` | Placements, plus the role-path items that still fit the old table. |
| 5 | `05_Seed_Huddle_Phases.sql` | Needs placements and topics. |
| 6 | `06_Seed_Huddle_Facilitator_Guides.sql` | Needs placements. |
| 7 | `07_Seed_Huddle_Agents.sql` | Independent. |
| 8 | `08_Seed_Huddle_Resources.sql` | Independent. |
| 9 | `09_Seed_Huddle_Activities.sql` | Needs topics, placements and phases. |
| 10 | `10_Seed_Huddle_Activity_Prerequisites.sql` | Needs every activity to exist, so it runs after 09. |
| 11 | `11_Seed_Topic_And_Agent_Joins.sql` | Needs topics, MCEM stages, agents, resources. |
| 12 | `12_Seed_Activity_Joins.sql` | Needs activities, agents, resources. |
| 13 | `13_Validate_Import.sql` | Read-only. Row counts, the Featured and Extended split per placement, and eleven integrity assertions. |

## Properties worth knowing

**Nothing is deleted.** Every statement is a `MERGE` keyed on `ExternalId`, so re-running is safe
and existing rows are updated rather than replaced. Pre-V4 seed rows from `database/huddle/` are
left alone, which is why `13_Validate_Import.sql` treats an actual count above the expected count
as a pass. Retire the old rows through `HuddleTopics.PublicationStatus` when you are ready, not
with a delete.

**Foreign keys are resolved by join, not by subquery**, because SQL Server does not allow
subqueries inside a `VALUES` constructor. Each `MERGE` is followed by a row-count assertion, so an
unresolved key raises rather than silently dropping the row.

**Both scopings stay populated.** Phases, activities and facilitator guides carry their
`HuddleTopicId` as well as the new `HuddlePlacementId`, so topic-scoped queries keep working while
the API moves across.

**Additional content lives only in `HuddlePlacements`.** `HuddleRolePathItems` is keyed on
`(HuddleSegmentRoleId, WeekPosition)`, and the 14 `SEC-ADDITIONAL` placements reuse sequence
numbers that already belong to role-path or orientation placements, so they cannot be represented
there. Script 04 loads the 56 that fit and leaves the rest to the new table. This is the reason
the new table exists.

## Corrections applied

`DATA_CORRECTIONS.md` lists all 22 deterministic changes the generator made, so the workbook can
be fixed at source. All of them are duplicate `DisplayOrder` values within a single owner, which
the unique indexes rightly reject. The generator moves the later row to the next free slot in
workbook order rather than relaxing the index, because ordering within an owner is a real
invariant and two agents both claiming position 1 is a content error.

## Out of scope

`Huddle_In_A_Box`, `HIB_Checks` and `HIB_Generator` are not loaded. They are facilitator programme
content with no link to any placement, topic or activity, and no matching entity. They need a
product decision before a schema exists for them.

`V4_Review_Notes`, `V4_Change_Log` and `Merge_Log` are provenance and are deliberately not loaded.
