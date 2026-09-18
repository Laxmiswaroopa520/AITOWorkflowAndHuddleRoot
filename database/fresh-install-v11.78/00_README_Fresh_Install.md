# fresh-install-v11.78

A complete build of the AITO database from nothing, for **client deployment onto a clean/new
database that has never run any of this project's scripts before**. It merges two things that,
until now, only existed as separate folders:

- `database/fresh-install-v10.2.1` -- the last complete Workflow + Huddle build.
- `database/huddle-2026.09.15-update` -- new-only Huddle rows generated from the
  `Frontier_Accelerator_Huddle_App_Content_Integration_Model_9.15.2026.xlsx` workbook (which
  self-identifies as **V11.78** on its own "Change Summary" sheet), never executed anywhere except
  the local dev database.

As of **2026-09-17**, it also includes the one genuinely new item from
`database/huddle-2026.09.16-update` -- the Deal Agent (`AGT-016`) and its 2 topic joins -- which
**was** executed against the local dev database (see "Update 2026-09-17" below for the full detail).

Run the scripts in numeric order in SSMS, against a clean/empty database, and you get the full
current Workflow + Huddle dataset in one pass -- you do **not** need to also run
`huddle-2026.09.15-update` or `huddle-2026.09.16-update` afterward. Every script is safe to re-run.
Nothing here deletes existing rows.

`fresh-install-v10.2.1` is unmodified and still exists for comparison/rollback. This folder is new
alongside it, not a replacement of it.

---

## Run order

| # | Script | Writes | Notes |
|---|---|---|---|
| 01 | `01_Schema_All_Migrations.sql` | 33 tables | Unchanged from fresh-install-v10.2.1. |
| 02 | `02_Preflight_Checks.sql` | -- | **Read-only.** Unchanged. |
| | | | |
| 10 | `10_Workflow_Roles.sql` | `Roles` | Unchanged. 8 roles. Must run before script 20. |
| 11 | `11_Workflow_AiTools.sql` | `AiTools` | Unchanged. 14 tools. |
| 12 | `12_Workflow_Buckets.sql` | `WorkflowBuckets` | Unchanged. 9 buckets. |
| 13 | `13_Workflow_Activities.sql` | `Activities` | Unchanged. 186 activities. |
| 14 | `14_Workflow_Activity_AiTools.sql` | `ActivityAiTools` | Unchanged. 215 mappings. |
| 15 | `15_Workflow_Verify.sql` | -- | **Read-only.** Unchanged. |
| | | | |
| 20 | `20_Huddle_Reference_Data.sql` | segments, segment roles, focus areas, MCEM stages, roles | **Merged.** 14 Huddle roles now (was 13) -- adds `ROLE-SMEC-CE`. |
| 20b | `20b_Fix_Huddle_Role_Descriptions.sql` | `Roles.Description` | Carried forward from fresh-install-v10.2.1 (there it was numbered `21_Fix_Huddle_Role_Descriptions.sql`, colliding with the Topics script; renumbered here to sit next to the reference-data step it backfills). Safe, additive, re-runnable -- see its own header. |
| 20c | `20c_OPTIONAL_Backfill_New_Role_Descriptions_DRAFT.sql` | `Roles.Description` | Carried forward unchanged from fresh-install-v10.2.1's `22_Backfill_New_Role_Descriptions_DRAFT.sql`. **Not part of the required run path** -- the description text in it is an unreviewed first draft; review or replace it before running. It also does not yet cover the new `ROLE-SMEC-CE` role, which likewise has no Description anywhere in either source workbook. |
| 21 | `21_Huddle_Topics.sql` | `HuddleTopics`, `HuddleTopicRoles` | **Merged.** 27 topics (was 25), 170 topic-role links (was 118). |
| 22 | `22_Huddle_Placements.sql` | `HuddlePlacements`, `HuddleRolePathItems` | **Merged.** 138 placements (was 103), 100 role-path items (was 74). |
| 23 | `23_Huddle_Phases.sql` | `HuddlePhases` | **Merged.** 414 (was 309), three per placement. |
| 24 | `24_Huddle_Facilitator_Guides.sql` | `HuddleFacilitatorGuides` | **Merged.** 138 (was 103), one per placement. |
| 25 | `25_Huddle_Agents.sql` | `HuddleAgents` | **Merged.** 22 agents (was 18; +1 on 2026-09-17 for `AGT-016` Deal Agent). |
| 26 | `26_Huddle_Resources.sql` | `HuddleResources` | **Merged.** 54 resources (was 51). |
| 27 | `27_Huddle_Activities.sql` | `HuddleActivities` | **Merged.** 506 activities (was 403), 340 Featured / 166 Extended. |
| 28 | `28_Huddle_Activity_Prerequisites.sql` | `HuddleActivities.PrerequisiteHuddleActivityId` | **Merged.** 205 links (was 154). Must run after 27. |
| 29 | `29_Huddle_Topic_And_Agent_Joins.sql` | topic MCEM, topic agents, topic resources, agent resources | **Merged.** TopicAgents 130 (was 63; +2 on 2026-09-17 for `AGT-016` on `WF-X-DEAL-01`/`WF-X-RENEW-01`), AgentResources 28 (was 23); TopicMcemStages and TopicResources unchanged (0 new rows found). |
| 30 | `30_Huddle_Activity_Joins.sql` | activity agents, activity resources | **Merged.** ActivityAgents 648 (was 433), ActivityResources 154 (was 152). |
| | | | |
| 40 | `40_Validate_Everything.sql` | -- | **Read-only.** Counts and 22 integrity assertions, updated for the merged totals. One assertion is deliberately narrowed -- see "Issues requiring attention" below. |

---

## How this folder was built (so the merge itself can be audited)

1. **Read-only analysis first**, as instructed: `fresh-install-v10.2.1`'s own README, run order,
   V8.0->V10.2.1 diff table, `DATA_CORRECTIONS.md`, `SKIPPED_ROWS.md` and `expected_counts.txt` were
   read in full, then every one of its 20-30 series Huddle scripts.
2. **Content-equivalence was verified, not assumed.** Every ExternalId in every one of
   fresh-install-v10.2.1's Huddle scripts (segments, roles, segment roles, focus areas, MCEM
   stages, topics, placements, phases, agents, resources, activities) was programmatically
   extracted and compared against the V10.2.1 workbook's own sheets (the same workbook
   `huddle-2026.09.15-update`'s generator used as its "old" baseline). Every set matched exactly --
   fresh-install-v10.2.1's Huddle data is confirmed identical to that workbook, not merely claimed
   to be by its own README.
3. **Two undocumented files were found and diagnosed**: `21_Fix_Huddle_Role_Descriptions.sql` and
   `22_Backfill_New_Role_Descriptions_DRAFT.sql` existed in fresh-install-v10.2.1 but were absent
   from its own README run-order table (later mtimes than the rest of the folder). Reading them
   showed they are unrelated to the SME&C Commercial Executive question below -- they backfill the
   `Roles.Description` column, which the original Huddle-roles MERGE (keyed on ExternalId) never
   populated for the 7 roles that collided by abbreviation with existing Workflow roles, and for 6
   roles that never had description text anywhere. Both are additive, non-destructive, and carried
   forward here (renumbered `20b`/`20c` to remove the numbering collision with the Topics and
   Placements scripts).
4. **Every new-only row from `huddle-2026.09.15-update` was matched against fresh-install-v10.2.1
   by natural key** (ExternalId for single-entity tables, the real composite key for join tables --
   e.g. `(SegmentRoleExternalId, WeekPosition)` for `HuddleRolePathItems`, not `(SegmentRole, Topic)`,
   since one topic legitimately recurs at more than one week). Zero true duplicates were found
   across all 20 tables checked. The new rows were then spliced into the matching
   fresh-install-v10.2.1 MERGE statement (same VALUES list, same ExternalId-keyed MERGE already in
   that script) using a parenthesis- and quote-aware parser, not naive text concatenation, so that
   long free-text fields (facilitator guide prose, activity prompts) containing literal commas,
   parentheses or line breaks couldn't desynchronize row boundaries. Every resulting count in the
   run-order table above was independently recomputed from the merged files, not carried over from
   either source folder's own claims.

---

## Update 2026-09-17: Deal Agent (`AGT-016`)

The 9.16.2026 Frontier Accelerator workbook (`Frontier_Accelerator_Huddle_App_Content_Integration_Model_9.16.2026.xlsx`)
added one genuinely new catalog agent, Deal Agent, plus 2 topic-discovery joins for it. Both were
already generated, reviewed, and **executed against the local dev database** as
`database/huddle-2026.09.16-update/01_Seed_New_Deal_Agent.sql` and
`02_Seed_New_Deal_Agent_Topic_Joins.sql`. This fresh-install package has now been updated so that a
brand-new database install produces this same end state in one pass, without needing to also run
that update folder afterward:

- **`HuddleAgents`**: +1 row, `AGT-016` ("Deal Agent"), spliced into `25_Huddle_Agents.sql`'s
  existing MERGE VALUES list (same ExternalId-keyed MERGE, same convention as the 2026-09-16 merge
  already in that file). Deal Agent is surfaced through Sales Agent (`AGT-001`), not a standalone
  agent to install or select.
- **`HuddleTopicAgents`**: +2 rows, `(WF-X-DEAL-01, AGT-016)` and `(WF-X-RENEW-01, AGT-016)`,
  spliced into `29_Huddle_Topic_And_Agent_Joins.sql`'s Topic-to-agent MERGE VALUES list.
  `DisplayOrder` is `9` and `10` respectively -- hardcoded (not computed dynamically, since a fresh
  install has no prior rows to compute `MAX` against) at the verified next-free value for each
  topic, confirmed against every other row already in that VALUES list for these two topics.

**Deliberately NOT included:** `database/huddle-2026.09.16-update/03_OPTIONAL_Existing_Data_Corrections.sql`
(10 `HuddleActivityAgents` AgentID reattributions, 4 `HuddleAgentResources` AgentID reattributions,
10 `HuddleActivities.LaunchLabel` changes, and 2 `HuddleAgents` wording edits for `AGT-002`/`AGT-013`).
That script was generated but **never executed** against any database, so its changes are not part
of the confirmed, effective dataset and are not assumed here. It remains available, unmodified, in
that update folder for future review -- exactly the same treatment already given to
`huddle-2026.09.15-update`'s own optional-corrections file (see "Issues requiring attention" below).

No schema, application, or configuration changes were needed or made; `AGT-016` uses the existing
`HuddleAgents`/`HuddleTopicAgents` columns exactly as they already exist.

---

## What's new since fresh-install-v10.2.1 (Huddle content only -- Workflow is untouched)

| Area | V10.2.1 | v11.78 | Diff |
|---|---|---|---|
| Roles (Huddle-owned) | 13 | 14 | +1 (`ROLE-SMEC-CE`, reference data only -- see below) |
| Topics | 25 | 27 | +2 |
| Topic roles | 118 | 170 | +52 |
| Placements | 103 | 138 | +35 |
| Role path items | 74 | 100 | +26 |
| Phases | 309 | 414 | +105 |
| Facilitator guides | 103 | 138 | +35 |
| Agents | 18 | 22 | +4 (includes `AGT-016` Deal Agent, added 2026-09-17) |
| Resources | 51 | 54 | +3 |
| Activities | 403 | 506 | +103 (340 Featured / 166 Extended overall) |
| Activity prerequisites | 154 | 205 | +51 |
| Topic agents | 63 | 130 | +67 (1 more row skipped for a missing UsageType -- see SKIPPED_ROWS.md; +2 for `AGT-016` added 2026-09-17) |
| Agent resources | 23 | 28 | +5 |
| Activity agents | 433 | 648 | +215 |
| Activity resources | 152 | 154 | +2 |

Full row-by-row detail for the V8.0->V10.2.1 corrections is in `DATA_CORRECTIONS.md`, which now
also documents the 3 placement-Sequence corrections made while merging in this update (see that
file). `SKIPPED_ROWS.md` documents all 3 skipped Topic_Agents rows (2 from V10.2.1, 1 new).

---

## Issues requiring attention (deliberately NOT applied automatically)

These came from `huddle-2026.09.15-update`'s own `13_OPTIONAL_Existing_Data_Corrections.sql` (never
executed anywhere) or were newly identified while merging. Every item below is an **UPDATE to a row
that already exists in fresh-install-v10.2.1**, not a new-row insert, so none of it was applied to
the required scripts in this folder. All of it is still available, unmodified, in
`database/huddle-2026.09.15-update/13_OPTIONAL_Existing_Data_Corrections.sql` for review.

1. **`ROLE-SMEC-CE` / `SR-SMEC-CE` -- Commercial Executive split for SME&C (causes the role-path gaps below).**
   The 9.15.2026 workbook's own "Change Summary" sheet documents this as an intentional, required
   change (dated V11.76): SME&C's Commercial Executive gets its own role code, `SMEC-CE`, distinct
   from Enterprise's `CE`, because the two share a job title but zero activities (35 Enterprise vs.
   27 SME&C) and the shared code previously made it impossible to say a topic serves one CE but not
   the other. This folder includes the new `ROLE-SMEC-CE` row itself (script 20) as plain reference
   data -- a pure insert, harmless either way. It does **not** repoint
   `HuddleSegmentRoles.SR-SMEC-CE` from `ROLE-CE` to `ROLE-SMEC-CE`, because that is an UPDATE to an
   already-loaded row. Until that repoint is applied, `SR-SMEC-CE` continues to resolve to the
   shared `ROLE-CE`, exactly as in fresh-install-v10.2.1, and `ROLE-SMEC-CE` sits unreferenced.

2. **Consequence: SME&C's DCSA, DSE and PSS role paths have gaps.** The 9.15.2026 workbook fills
   weeks 2-3 of these three role paths by reclassifying 4 placements that already exist in this
   database as Additional Content (`DCSA-CONSUME`, `DSE-ARCH`, `PSS-PARTNER`, `PSS-JOINTPLAN`) into
   the role path, at new sequence numbers, from their current `SEC-ADDITIONAL` classification. That
   is also an UPDATE to already-loaded rows (`PathSection` and `Sequence` on 4 existing
   `HuddlePlacements` rows), so it was left out here for the same reason. Left as-is:
   - `SR-SMEC-DCSA`: role path has weeks 1, 3-8 (gap at week 2; `DCSA-CONSUME` would fill it)
   - `SR-SMEC-DSE`: role path has weeks 1-2, 4-8 (gap at week 3; `DSE-ARCH` would fill it)
   - `SR-SMEC-PSS`: role path has weeks 1, 4-8 (gap at weeks 2-3; `PSS-PARTNER` and `PSS-JOINTPLAN`
     would fill them)

   `40_Validate_Everything.sql`'s role-path contiguity assertion has been narrowed to exclude these
   3 segment-roles by name so the rest of the validation script still runs to completion -- they
   still print as `BROKEN` in that script's own report, on purpose, so the gap stays visible. **This
   is the single most important open item in this package**: decide whether to apply the
   `SR-SMEC-CE` repoint and the 4 placement reclassifications (both already drafted in
   `huddle-2026.09.15-update/13_OPTIONAL_Existing_Data_Corrections.sql`) before or shortly after
   going live with the client database.

3. **5 existing-activity `PrerequisiteActivityID` changes** and **11 existing `HuddleActivityAgents`
   field changes** (UsageType/DisplayLabel/ShowAgentAccessLink) -- also in the same optional-
   corrections file, also UPDATEs to already-loaded rows, also not applied here.

4. **The SSP-PLAN / SSP-VALUE / SSP-CONV 3-way Sequence rotation** was flagged in the original
   analysis as too risky to automate (a cyclic swap under a unique index) and was excluded even from
   the optional-corrections script. Still excluded here.

5. **`RES-004`** no longer appears in the 9.15.2026 workbook's Resources sheet. It has **not** been
   removed or deactivated from this database -- deletion was out of scope for this task. It remains
   exactly as in fresh-install-v10.2.1.

6. **Schema gaps, not resolved (schema redesign was explicitly out of scope):**
   - `Huddle_In_A_Box`, `HIB_Checks`, `HIB_Generator` -- an entirely new feature area in the 9.15.2026
     workbook (25 rows across 3 sheets) with no corresponding tables anywhere in the 7 EF Core
     migrations. Not created.
   - `SeasonalTag` (Activities) and `Active` (Activities) -- workbook columns with no matching
     `HuddleActivities` column. 0 of the 103 new activities populate `SeasonalTag` anyway, and all
     506 activities (403 existing + 103 new) are `Active = Y` in the workbook, so there is no
     functional gap today, but the columns don't exist if that changes.

7. **`20c_OPTIONAL_Backfill_New_Role_Descriptions_DRAFT.sql` is unreviewed.** It was already marked
   DRAFT in fresh-install-v10.2.1 and still is -- the description text for `ROLE-ALL` and the 5
   original SME&C roles was hand-drafted for review, never confirmed. It also predates
   `ROLE-SMEC-CE`, which likewise has no description anywhere in either workbook.

---

## What you should see at the end

Run `40_Validate_Everything.sql` last -- see `expected_counts.txt` in this folder for the full list.
A count **higher** than expected is a pass (every data script is a MERGE). A count **lower** means a
script did not finish. The one exception to "everything should pass cleanly" is the documented,
carved-out role-path gap on `SR-SMEC-DCSA`/`SR-SMEC-DSE`/`SR-SMEC-PSS` above -- expected, not a
failure of this package.

---

## Sources

| Scripts | Generated from |
|---|---|
| 01, 02, 10-15 | Unchanged from `database/fresh-install-v10.2.1` |
| 20b, 20c | Unchanged from `database/fresh-install-v10.2.1` (renumbered from `21_`/`22_` to remove a numbering collision) |
| 20-30 (Huddle data) | `database/fresh-install-v10.2.1`'s own 20-30 scripts, merged with the new-only rows from `database/huddle-2026.09.15-update`'s 02-12 scripts, which were generated by comparing `Frontier_Accelerator_Huddle_App_Content_Integration_Model_9.15.2026.xlsx` against `Frontier_Accelerator_Huddle_App_Content_Integration_Model_V10.2.1.xlsx` |
| 25, 29 (2026-09-17 addendum) | Further merged with the one new-only agent and its 2 topic joins from `database/huddle-2026.09.16-update`'s `01_Seed_New_Deal_Agent.sql`/`02_Seed_New_Deal_Agent_Topic_Joins.sql`, generated by comparing `Frontier_Accelerator_Huddle_App_Content_Integration_Model_9.16.2026.xlsx` against the then-effective database dataset. That update folder's `03_OPTIONAL_Existing_Data_Corrections.sql` was deliberately NOT merged in -- never executed, not part of the confirmed dataset. |
| 40, expected_counts.txt | Carried forward from `database/fresh-install-v10.2.1`, counts updated for both merges |

**Never touched:** SSMS, any live database, `database/fresh-install-v10.2.1` (still present,
unmodified, for comparison/rollback), any file outside this new folder, and GitHub.
