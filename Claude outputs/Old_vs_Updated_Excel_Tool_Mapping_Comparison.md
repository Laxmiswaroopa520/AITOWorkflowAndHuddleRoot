# Old vs Updated Excel Workbook: Primary and Secondary Tool Mapping Comparison

Read-only investigation. Neither workbook, no application source, JSON or project file was modified.

| | Old workbook | Updated workbook (source of truth) |
|---|---|---|
| File | `Frontier_Accelerator_Huddle_App_Content_Integration_Model_9.16.2026_CORRECTED.xlsx` | `Frontier_Accelerator_Huddle_App_Content_Integration_Model_10.13.2026 v2.xlsx` |
| Change Summary title | "…Integration Model V11.78" | "Frontier Accelerator Huddle Content - 2026-10-13 r1 (publication candidate)" |
| Sheets | 28 | 47 |

Conventions: "row N" is the Excel row number (header = row 1). "Confirmed" means read directly from a cell. "Possible" means an inference that needs a decision. Agent names are resolved from `Agents`: AGT-001 Sales Agent, AGT-002 ECIF Agent, AGT-003 Microsoft 365 Copilot, AGT-004 Cowork, AGT-005 Scout, AGT-006 Researcher, AGT-007 Analyst, AGT-008 MSXI Assist V2, AGT-009 Agent J.ai, AGT-012 Customer Success Agent, AGT-013 Sales Home, AGT-014 Know Your Partner, AGT-015 GitHub Copilot, AGT-016 Deal Agent.

---

## A. Executive summary

**Is the updated mapping complete?** No, not for Secondary tools, and not for two groups of placements for Primary tools.

1. **Primary and Secondary are explicit, not derived, and they live at two levels.** Every row in `Activity_Agents` and `Topic_Agents` carries a `UsageType` of Primary or Secondary. A placement has no tool columns of its own. It reaches its activities through `Activities.PlacementID` and its topic through `Role_Paths.TopicID` or `Additional_Content.TopicID`. The structure (sheet names, column names) is the same in both workbooks.
2. **Secondary is only reliably defined at topic level, and topic level is role-agnostic.** In the updated workbook only 46 of 980 `Activity_Agents` rows are Secondary, and they sit in 24 of 286 placements. 220 placements belong to a topic with `Topic_Agents` Secondary rows, and 196 of those 220 have no activity-level Secondary. If the application reads activity-level rows only, Secondary comes out empty for most huddles. The same would have happened with the old workbook (old: 18 of 138 placements have activity Secondary), so this is not a regression introduced by the new file.
3. **The extra tools on the AE Week 2 card come from topic-level rows, not from the AE activities.** `PLC-ENT-AE-W02` (Role_Paths row 3, topic `WF-PLAN`) has five activities, all Primary: Sales Agent, Scout, Microsoft 365 Copilot, Cowork and ECIF Agent (surfaced through Sales Agent). That is the four expected products once ECIF is counted under Sales Agent. The additional tools (Sales Home, Researcher, MSXI Assist V2) are the topic-level `WF-PLAN` lists in `Topic_Agents`. The AE activity data is identical in the old and updated workbooks.
4. **The workbook itself documents the intended display rule** (updated `V4_Review_Notes` row 223): Huddle tools resolve from `Activity_Agents` on the selected activities, `Topic_Agents` never proves Huddle use, and topic-only agents must not render as used tools. The note is labelled "EPS runtime audience and agents" but is written generically and says it applies to Role Path and the downloaded Huddle HTML. Under that rule, the extras on AE Week 2 are an application rule problem, and Secondary is not defined by the workbook at all (see item 5). The rule is not in the old workbook (old `V4_Review_Notes` ends at row 221).
5. **The workbook never says what "Secondary" means for a huddle.** It has no placement-level Secondary field, and the typed execution relationship sheets (CURRENT_TOOL etc.) cover SME&C and a few other roles only. That leaves three readings: topic-level Secondary shown for every placement of the topic, activity-level Secondary only, or topic Secondary minus tools already Primary on the placement. This needs a manager or client decision. It cannot be settled from the workbook.
6. **Structural changes between old and updated workbooks that affect tool mapping:**
   - Topics merged from 27 to 23, and 286 placement IDs renamed (`ID_Crosswalk`). ActivityIDs and AgentIDs are stable.
   - SME&C activity tools were reworked. Of the 420 activities present in both workbooks, 370 have the same agent and usage rows and 50 have a different tool (all SME&C). A further 15 of the 370 differ only in label, order or link flag.
   - Sales Home (AGT-013) went from 52 activity-level rows to 3.
   - All 28 Week 9 Transition placements (112 activities) have no tool rows. In the old workbook every activity had at least one tool row (506 of 506).
   - 21 old SME&C placements have no `ID_Crosswalk` entry and no name match in the updated workbook.
   - The old workbook had no Manager role path at all. `SR-ENT-MGR` is new.
7. **Data quality items in the updated workbook:** `ShowAgentAccessLink` uses `Y` in 130 `Activity_Agents` rows and `Yes`/`No` everywhere else (old workbook: `Yes`/`No` only). Sales Home's label was inverted from "Sales Home (Sales Agent)" to "Sales Agent (Sales Home)". Details are in section C.5.

**Direct answer to the final question** is in section G.4.

---

## B. Workbook structure comparison

### B.1 Sheets

| Item | Old | Updated |
|---|---|---|
| Sheet count | 28 | 47 |
| Sheets in both | 28 | 28 |
| Removed sheets | none | n/a |
| Renamed sheets | none | n/a |
| Added sheets | n/a | `Review_Coverage`, `Content_Change_Log`, `Evidence_Sources`, `Execution_Entities`, `Execution_Relationships`, `Placement_MCEM`, `Variant_Definitions`, `Variant_Selectors`, `Variant_Overrides`, `Content_Lineage`, `Placement_Summaries`, `Activity_Execution_Migration`, `Merge_Log1` to `Merge_Log6`, `ID_Crosswalk` |

Variant data is in `Variant_Definitions`, `Variant_Selectors` and `Variant_Overrides` (updated workbook only). Placement and topic data are in `Role_Paths` (role weeks) and `Additional_Content` (support placements), both with the same 11 columns in both workbooks.

### B.2 Columns

Header comparison of every sheet present in both workbooks found no added or removed columns. The only header difference is the title cell in `Change Summary` (row 1). Relevant tool-mapping headers, identical in both:

- `Topic_Agents`: `TopicID`, `AgentID`, `UsageType(Primary /Secondary)`, `DisplayLabel`, `ShowAgentAccessLink`, `DisplayOrder`
- `Activity_Agents`: `ActivityID`, `AgentID`, `UsageType`, `DisplayLabel`, `ShowAgentAccessLink`, `DisplayOrder`
- `Activities`: includes `ActivityID`, `PlacementID`, `TopicID`
- `Role_Paths` / `Additional_Content`: `PlacementID`, `SegmentRoleID`, `Sequence`, `TopicID`, `RoleTopicName`, … `Active`

So the representation of tool assignments did not change. What changed is the content and the identifiers.

### B.3 Identifier changes

| Entity | Old | Updated | Evidence |
|---|---|---|---|
| Topics | 27 rows (`WF-X-PLAN-01` style) | 23 rows (`WF-PLAN` style) | `Topics`; `ID_Crosswalk` rows 2 to 55 (54 TopicID entries, many-to-one); Change Summary row 73 |
| Placements | 138 (104 `Role_Paths` + 34 `Additional_Content`), IDs like `AE-PLAN` | 286 (252 + 34), IDs like `PLC-ENT-AE-W02` | `ID_Crosswalk` has 286 PlacementID entries; 117 of the 138 old placements are listed in it |
| Segment roles | 15 rows (14 referenced by placements) | 30 rows (29 referenced) | `Segment_Roles` |
| Activities | 506 | 1058 | 420 shared, 86 only in old, 638 only in updated |
| Agents | `Agents` 22 rows | same 22 AgentIDs | no ID change |

`ID_Crosswalk` has no ActivityID or AgentID entries. ActivityIDs are stable (change log row 77 in the Change Summary says so for Week 9; the activity comparison confirms it for all 420 shared IDs).

**Old topics without a crosswalk entry (8):** `WF-INVEST-01`, `WF-X-USECASE-01`, `WF-X-TRANSITION-01`, `WF-X-FYPLAN-01`, `WF-X-CLOSE-01`, `WF-X-PARTNER-01`, `WF-X-VSAT-01`, `WF-X-TECHLEAD-01`. Their placements were remapped through the placement crosswalk, and the resulting new topics are listed in C.4. Classification: changed identifier or relationship (the relationship is inferable from placements, not stated for topics).

**Old placements without a crosswalk entry (21), all SME&C:** `DAE-PARTNER` (row 59), `DAE-DEAL` (63), `DAE-HEALTH` (65), `SMEC-CE-HEALTH` (69), `DSS-SIGNAL` (70), `DSS-TERRITORY` (71), `DSS-CONV` (73), `DSS-DEAL` (74), `DSS-VALUE` (75), `DSE-CONV` (80), `DSE-HEALTH` (81), `DCSA-CONV` (85), `PSS-ORCH` (91), `PSS-VALUE` (92), `SMEC-CE-ORCH` (95), `SMEC-CE-DEAL2` (96), `DCSA-ARCH` (97), `DCSA-HEALTH` (98), `DSS-COMP` (102), `DSS-ORCH` (103), `PSS-CONV` (105) (all `Role_Paths`). None has a name match in the updated workbook. 68 of the 86 old activities that no longer exist belonged to these placements, 18 to others. Classification: **ambiguous**. It is consistent with the documented SME&C rebuild (Change Summary row 65: "42 activation placements integrated"), but the workbook does not state that these particular placements were retired.

### B.4 Variants

| VariantID | Dimension | Status | Where |
|---|---|---|---|
| `VAR-SMEC-SALESHOME-NOACCESS` | TOOL_AVAILABILITY | ACTIVE | `Variant_Definitions` row 2 |
| `VAR-SMEC-NONEN-OUTREACH` | LANGUAGE | ACTIVE | row 3 |
| `VAR-DCSA-CASA-EARLY` | COVERAGE_MODEL | ACTIVE | row 4 |
| 12 others | various | DRAFT_NEEDS_VALIDATION | rows 5 to 15 |

`Variant_Overrides` row 2 (`VOVR-001`) changes `FallbackToolSummary` for placement summary `PSUM-DAE-SIGNAL`. No variant defines Primary or Secondary assignments. Variants therefore cannot be a source of Secondary tools. They exist only in the updated workbook and only for SME&C.

---

## C. Primary / Secondary mapping comparison

### C.1 The ten questions

| # | Question | Answer (confirmed unless stated) |
|---|---|---|
| 1 | Explicit or derived? | **Explicit.** `UsageType` is a stored value on every `Activity_Agents` and `Topic_Agents` row. There is no derivation formula anywhere in either workbook. |
| 2 | Which sheet and columns? | `Activity_Agents.UsageType` and `Topic_Agents."UsageType(Primary /Secondary)"`, with `AgentID`, `DisplayLabel`, `ShowAgentAccessLink`, `DisplayOrder`. |
| 3 | Which level? | **Multiple.** Topic level (`Topic_Agents`, keyed by `TopicID`, no role or placement columns) and activity level (`Activity_Agents`, keyed by `ActivityID`). Placement is reached only via `Activities.PlacementID`. No placement-level tool field exists. |
| 4 | Same structure old vs new? | Yes. Same sheets, same columns. |
| 5 | Assignments removed/added/renamed/moved? | Yes, see C.2 to C.4. |
| 6 | Topics missing Secondary entirely? | Topic level: `WF-PARTNER` has Primary but no Secondary (5 placements). Placement level: see E. |
| 7 | Activities with no tools? | Updated: **112 activities, all Week 9** (28 `WF-TRANSITION` placements). Old: none (506 of 506 have tool rows). |
| 8 | Tools at topic but not activity, or activity but not topic? | Yes, both directions. See E.2 and E.3. |
| 9 | Duplicate, inconsistent or differently identified names? | No duplicate (activity, agent) or (topic, agent) pairs, and no agent appears as both Primary and Secondary on the same activity or topic. There are label inconsistencies, see C.5. |
| 10 | Enough to compute both Primary and Secondary per huddle independently? | Primary: yes for 230 of 286 placements. Secondary: only for 24 placements at activity level, and for 220 placements only through role-agnostic topic lists. See G.4. |

### C.2 Counts, old vs updated

| Measure | Old | Updated |
|---|---|---|
| `Activity_Agents` rows | 540 (506 Primary, 34 Secondary) | 980 (934 Primary, 46 Secondary) |
| `Topic_Agents` rows | 133 (28 Primary, 102 Secondary, **3 blank usage**) | 117 (32 Primary, 85 Secondary) |
| Activities with at least one tool row | 506 of 506 | 946 of 1058 |
| Placements | 138 | 286 |
| Placements with no activities | 13 (Orientation) | 28 (Orientation, `WF-ORIENT`) |
| Placements with activities but no activity Primary | 0 | 28 (all `WF-TRANSITION` Week 9) |
| Placements with any activity-level Secondary | 18 | 24 |
| Placements whose topic has Secondary rows | 118 | 220 |
| Placements with topic Secondary but no activity Secondary | 100 | 196 |
| Placements with no Secondary anywhere | 20 | 66 |
| Placements whose topic has no tool rows at all | 20 | 61 |

Share of placements with topic Secondary but no activity Secondary: old 100/138 (72%), updated 196/286 (69%). The gap is structural in both.

Updated "no Secondary anywhere" (66) = 28 Orientation + 28 Week 9 Transition + 10 more: `PLC-SMEC-SMEC-CE-W02`, `PLC-SMEC-SMEC-CE-W06` (`WF-COMM`), `PLC-SMEC-PSS-W08`, `PLC-EPS-PTS-W05`, `PLC-EPS-PDM-W06`, `PLC-EPS-PDM-R-W05`, `PLC-EPS-PDM-R-W06` (`WF-PARTNER`), `PLC-ENT-ALL-ADD01` (`WF-IMPROVE`), `PLC-ENT-ALL-ADD06` (`WF-FISCAL-PLAN`), `PLC-ENT-ALL-ADD08` (`WF-FISCAL-CLOSE`). Some of these have Primary only.

### C.3 Activity-level changes (420 shared ActivityIDs)

- 355 identical in every field (agents, usage, label, order, link flag).
- 50 differ in the set of agents (tool substitutions).
- 15 have the same agents and usage but a different label, order or link flag (for example `DSE-ASSET-01`, `PSS-PARTNER-01`, `DSS-VALUE-02`, `DSE-DISC-01`, `DAE-CONV-03`, `DCSA-CONSUME-02`).
- No activity changed only its UsageType (Primary to Secondary or the reverse), and none of the 34 old activity-level Secondary rows was removed (all 34 are still present). The 12 additional Secondary rows in the updated workbook are on new activities.
- The 50 substitutions are all in SME&C placements: DAE 9, DCSA 9, DSE 9, PSS 9, SMEC-CE 9, DSS 5. Main pairs (old agent replaced by new agent): Cowork to Microsoft 365 Copilot 14; Sales Home to Microsoft 365 Copilot 6; Sales Home to Cowork 4; Sales Home to Sales Agent 4; Sales Home to Researcher 3; Sales Agent to Deal Agent 3; and 14 single cases. Examples (old row → updated row): `DAE-SIGNAL-01` Cowork (360) → Sales Home (562); `DAE-SIGNAL-02` Researcher (361) → Sales Home (563); `DAE-SIGNAL-03` Cowork (362) → Microsoft 365 Copilot (564); `DSS-SIGNAL-03` Agent J.ai (366) → Microsoft 365 Copilot (603); `PSS-PARTNER-02` Cowork (373) → Microsoft 365 Copilot (674); `DCSA-CONSUME-01` Cowork (376) → Analyst (649). Label/order-only: `DSE-DISC-01` Sales Home (433) → Sales Home (625).
- All Enterprise, EPS, Leader and USPSI shared activities have unchanged tool rows.

**Sales Home (AGT-013) at activity level: 52 rows (old) → 3 rows (updated).** Of the 52 old rows, 22 sit on activities still present (1 kept, 21 replaced by another tool) and 30 sit on activities that no longer exist. The 3 updated rows are `DSE-DISC-01` (row 625, kept) and `DAE-SIGNAL-01` (row 562) and `DAE-SIGNAL-02` (row 563), which were Cowork and Researcher in the old workbook.

**Possible data inconsistency (documentation vs data):** `Change Summary` row 57 (present in both workbooks, unchanged) says SME&C practices name Sales Home as the seller surface and that 21 SME&C activities deliberately stay on Sales Agent. That wording implies most other SME&C activities map to Sales Home. In the updated mapping only 3 do. Microsoft 365 Copilot, absent from old SME&C activity rows, now has 46 SME&C activity rows (Cowork 34, Sales Agent 24). Row 68 (V16.3) says generic Copilot mappings were moved away to Top 5 agents. The data point in the opposite direction, so either rows 57/68 are stale or the mappings are. This cannot be resolved from the workbook. Classification: **ambiguous / possible inconsistency, needs owner confirmation.** Only 4 `Activity_Agents` changes are logged in `Content_Change_Log` (rows 618, 619, 620, 621: `SYS-001` to `AGT-003` for rows 766 and 767). The other substitutions are not itemised there.

### C.4 Topic-level changes (old topic to updated topic via placements)

Only differences are shown (old topic list vs the updated topic its placements now point at; "-" means none). The old topic is read from the old workbook's `Topic_Agents`, the new topic from the updated one. "Old topic had no tool rows" means the old topic has no usable `Topic_Agents` rows.

| Old topic (placements) | New topic | Primary: added | Secondary: removed / added | Class |
|---|---|---|---|---|
| `WF-X-PLAN-01` (5) | `WF-PLAN` | Cowork | removed Cowork | Secondary moved to Primary; likely intentional, no per-row note |
| `WF-X-TERRITORY-01` (2) | `WF-PLAN` | Cowork, Sales Home | removed Cowork, Sales Home / added ECIF Agent, Microsoft 365 Copilot, Researcher, MSXI Assist V2 | Changed by merge |
| `WF-X-ARCH-01` (7) | `WF-SOL` | Sales Agent, Researcher, Sales Home | removed Sales Agent, Researcher, Sales Home / added Agent J.ai | Secondary moved to Primary plus one new Secondary |
| `WF-X-DISC-01` (2) | `WF-SOL` | Cowork, Researcher | removed Cowork, Researcher / added Scout, GitHub Copilot | Changed by merge |
| `WF-X-TECHLEAD-01` (1) | `WF-SOL` | Sales Agent, Cowork, Sales Home | removed Cowork / added ECIF Agent, Scout, Agent J.ai, GitHub Copilot | Changed by merge |
| `WF-X-HEALTH-01` (8) | `WF-HEALTH` | Scout | removed Scout | Secondary moved to Primary |
| `WF-X-VSAT-01` (1) | `WF-HEALTH` | Microsoft 365 Copilot | removed Microsoft 365 Copilot / added Sales Agent, MSXI Assist V2, Agent J.ai, Customer Success Agent, Sales Home | Changed by merge |
| `WF-X-PIPE-01` (3) | `WF-PIPE` | Cowork | removed Cowork / added Agent J.ai, Know Your Partner | Secondary moved to Primary plus two new Secondary |
| `WF-X-SIGNAL-01` (1) | `WF-PIPE` | MSXI Assist V2 | added Sales Agent, Microsoft 365 Copilot, Auto-Fix Pipeline Agent, Sales Home, Know Your Partner | Expanded by merge |
| `WF-X-PARTNER-01` (1 + 1) | `WF-PIPE` / `WF-HANDOFF` | MSXI Assist V2 (PIPE only) | added Microsoft 365 Copilot, Researcher (both), Auto-Fix Pipeline Agent (PIPE) | Expanded by merge; the old placements were split across two new topics |
| `WF-INVEST-01` (13) | `WF-INVEST` | Cowork | removed Cowork | Secondary moved to Primary |
| `WF-X-PROOF-01` (1: `DSE-PROOF`, old `Role_Paths` row 79) | `WF-SOL` | Sales Agent, Cowork, Researcher, Sales Home | added ECIF Agent, Microsoft 365 Copilot, Scout, Agent J.ai, GitHub Copilot | Old topic had no tool rows |
| `WF-X-HANDOFF-01`, `WF-X-TRANSITION-01`, `WF-X-SPONSOR-01` (1 each) | `WF-HANDOFF`, `WF-HANDOFF`, `WF-CONV` | Cowork | new Secondary lists of 6 to 7 tools | Old topics had no usable rows (the three `WF-X-TRANSITION-01` rows 65, 66, 68 have blank usage) |
| `WF-X-CONSUME-01`, `-CONV-01`, `-DEAL-01`, `-OPP-01`, `-ORCH-01`, `-POLICY-01`, `-RENEW-01`, `-VALUE-01`, `-ASSET-01` | corresponding `WF-*` | none | none | Identical |
| `WF-ORIENT-01` (13), `WF-X-USECASE-01`, `WF-X-FYPLAN-01`, `WF-X-CLOSE-01` | `WF-ORIENT`, `WF-IMPROVE`, `WF-FISCAL-PLAN`, `WF-FISCAL-CLOSE` | none | none | No tool rows in either workbook |

Because several old topics were merged into one, the updated topic list is the union or a re-set of lists that previously varied per topic. A topic list is shared by every placement of that topic across roles, so merging widened the lists that placements inherit. Example: old `WF-X-ARCH-01` had 7 Secondary tools and 1 Primary tool; updated `WF-SOL` has 5 Secondary and 4 Primary tools. The merge is documented (Change Summary row 75: "Topic-level joins were deduplicated"; row 73: topics reduced from 54 to 23), but per-tool consequences are not listed.

**Old workbook blanks, absent in updated:** `Topic_Agents` rows 65, 66, 68 (`WF-X-TRANSITION-01`; AGT-001, AGT-003, AGT-013) had blank usage, label and order, and 38 old `Topic_Agents` rows had blank `DisplayOrder`. The updated workbook has no blank usage or order values. Classification: cleanup, confirmed present in the data (not itemised in the change notes).

### C.5 Names, labels and flags (updated workbook)

| Finding | Evidence | Class |
|---|---|---|
| Sales Home label inverted: old "Sales Home (Sales Agent)" (52 activity rows); updated "Sales Agent (Sales Home)" (3 activity rows) | `Activity_Agents` | Intentional (Change Summary row 67: labels normalised) |
| ECIF Agent shown two ways: "ECIF Agent, surfaced through Sales Agent" (26 rows) and "ECIF Agent" (4 rows) | `Activity_Agents`, `Topic_Agents` | Possible inconsistency. Counting distinct `AgentID` gives a different tool count than counting products, see D. |
| Sales Agent shown as "CX Vitals, surfaced through Sales Agent" (8 rows) | `Activity_Agents` | By design (DisplayLabel carries the distinction), but tool counts by AgentID include these as Sales Agent |
| MSXI Assist V2 also labelled "Proactive Insights in MSXI" (1 row) | `Activity_Agents` | By design |
| `ShowAgentAccessLink` uses `Y` in 130 `Activity_Agents` rows; `Yes`/`No` elsewhere (old workbook: only `Yes`/`No`) | `Activity_Agents` | **Data inconsistency, confirmed.** |
| Blank `DisplayLabel` on 27 of 117 topic rows (old: 38 of 133), for example all 13 Sales Home topic rows (rows 17, 26, 34 …) | `Topic_Agents` | Probably by design (name comes from `Agents`), but differs from activity rows, which carry a label |
| Deal Agent is `AGT-016` (distinct ID) while the notes say it is a skill inside Sales Agent | `Agents`; Change Summary row 62 | By design |

---

## D. Enterprise AE Week 2 investigation

**Placement:** `PLC-ENT-AE-W02` (updated `Role_Paths` row 3, `SR-ENT-AE`, topic `WF-PLAN`). Old equivalent: `AE-PLAN` (old `Role_Paths` row 3, topic `WF-X-PLAN-01`).

### D.1 Expected four tools

The client expects Microsoft 365 Copilot, Cowork, Sales Agent and Scout. **Confirmed**: these four are exactly what the activities map to, provided ECIF Agent is counted as part of Sales Agent.

### D.2 Activity-level Primary tools (updated `Activity_Agents`)

| ActivityID | Tool | UsageType | DisplayLabel | Row |
|---|---|---|---|---|
| `AE-03-P01` | Sales Agent (AGT-001) | Primary | Sales Agent | 110 |
| `AE-03-P02` | Scout (AGT-005) | Primary | Scout | 111 |
| `AE-03-ALT-01` | Microsoft 365 Copilot (AGT-003) | Primary | Microsoft 365 Copilot | 112 |
| `AE-03-ALT-02` | Cowork (AGT-004) | Primary | Cowork | 113 |
| `AE-03-ECIF-01` | ECIF Agent (AGT-002) | Primary | ECIF Agent, surfaced through Sales Agent | 114 |

Five rows, five AgentIDs, four products. There are no activity-level Secondary rows for this placement. Same in the old workbook, same tool sets.

### D.3 Topic-level lists for `WF-PLAN` (updated `Topic_Agents`)

| Level | Tools |
|---|---|
| Primary | Sales Agent (row 77), Cowork (row 80), Sales Home (row 84) |
| Secondary | ECIF Agent (row 78), Microsoft 365 Copilot (row 79), Scout (row 81), Researcher (row 82), MSXI Assist V2 (row 83) |

### D.4 Extras and their source

Tools shown beyond the expected four: **Sales Home** (topic-level Primary, row 84), **Researcher** and **MSXI Assist V2** (topic-level Secondary, rows 82, 83). They are not mapped to any AE Week 2 activity. They are workbook data at the topic level, shown for every placement of `WF-PLAN` (Enterprise AE, Manager, Territory Strategists and others). Whether they appear on the card is an **application rule** (topic lists displayed, or not) rather than a workbook error. The workbook rule at `V4_Review_Notes` row 223 says topic-only agents must not render as used tools.

Related: Change Summary row 57 states Sales Home is in preview for individual contributors only and that "any manager-facing activity must stay on Sales Agent". `WF-PLAN` topic Primary includes Sales Home (row 84), and `PLC-ENT-MGR-W02` and `PLC-ENT-MGR-W07` (Manager, rows 66 and 71) inherit it. This is a conflict between the topic list and the documented Manager rule.

### D.5 Old vs updated for this case

| Item | Old | Updated |
|---|---|---|
| AE activity Primary | Sales Agent, ECIF, Copilot, Cowork, Scout | identical |
| AE activity Secondary | none | none |
| Topic Primary (`WF-X-PLAN-01` → `WF-PLAN`) | Sales Agent, Sales Home (Sales Home row 72, order blank) | Sales Agent, Cowork, Sales Home |
| Topic Secondary | ECIF, Copilot, Cowork (row 48), Scout, Researcher, MSXI | ECIF, Copilot, Scout, Researcher, MSXI |

The only change is that Cowork moved from topic Secondary to topic Primary. The extras (Sales Home, Researcher, MSXI Assist V2) are in both workbooks, so the "too many tools" behaviour for this card is not caused by the new workbook.

### D.6 If Secondary were taken from topic lists minus the placement's own Primary tools

For information only, not a recommendation: topic Secondary minus activity Primary would leave Researcher and MSXI Assist V2 for AE Week 2.

---

## E. Topic-level vs activity-level gaps

### E.1 Placements with no tools or no Primary

- **28 `WF-ORIENT` placements** (every Week 1): no activities, no topic tool rows. Old: 13 Orientation placements, same.
- **28 `WF-TRANSITION` placements** (every Week 9, for example `PLC-ENT-AE-W09`, `PLC-ENT-ATS-W09`, `PLC-ENT-SSP-W09`, `PLC-ENT-MGR-W09` row 73): 4 activities each (112 total), none with a tool row, and `WF-TRANSITION` has no `Topic_Agents` rows. Change Summary row 77 describes a shared Week 9 with "team/project tool restrictions", and `Content_Change_Log` row 626 records that an earlier wording "Activity_Agents mappings remain unchanged" was replaced by that text. Together they suggest a tool-free Week 9 is intended, but no note says so for tool cards. **Possible**, needs confirmation. The old workbook had a different transition topic (`WF-X-TRANSITION-01`, 1 placement `ALL-TRANSITION`) whose three topic rows had blank usage.
- **Other placements with no topic tools:** `WF-COMM` 2, `WF-IMPROVE` 1, `WF-FISCAL-PLAN` 1, `WF-FISCAL-CLOSE` 1. Their activities do have tool rows.

### E.2 Activity Primary tools missing from the topic lists (37 placements)

Updated workbook, tool is Primary on an activity of the placement but appears neither in topic Primary nor topic Secondary for its topic. Old workbook: 13 placements. Examples:

| Placement (row) | Topic | Missing from topic lists |
|---|---|---|
| `PLC-ENT-MGR-W04` (Role_Paths 68) | `WF-COACH` | Researcher, Agent J.ai |
| `PLC-ENT-MGR-W08` (72) | `WF-ASSET` | Agent J.ai |
| `PLC-SMEC-DAE-W06` (79) | `WF-CONSUME` | ECIF Agent, Copilot |
| `PLC-SMEC-SMEC-CE-W06` (88) | `WF-COMM` | Copilot, Cowork, Deal Agent |
| `PLC-SMEC-PSS-W08` (126) | `WF-PARTNER` | Sales Agent, Copilot, Know Your Partner |
| Leader: `PLC-LDR-LDR-W02` (183), `-W04` (185), `-W05` (186) | `WF-PLAN`, `WF-COACH` | Agent J.ai |
| `PLC-ENT-ALL-ADD07` (Additional_Content 27) | `WF-ASSET` | Sales Agent, Copilot |
| `PLC-ENT-ATS-ADD01` (Additional_Content 6) | `WF-INVEST` | Copilot, ECIF Central (SYS-002) |

Full list: 25 `Role_Paths` placements and 12 `Additional_Content` placements. If the application ever fell back to topic lists when activity rows exist, these would show the wrong set. Classification: **expected**, since topic lists are role-agnostic and activities are role-specific.

### E.3 Activity-level Secondary (24 placements) and topic-level subset check

Placements with activity Secondary (updated): `PLC-ENT-ATS-W04` (Role_Paths 14), `-W06` (16), `-W07` (17), `PLC-ENT-SSP-W03` (22), `PLC-ENT-SE-W03` (31), `-W04` (32), `-W05` (33), `-W08` (36), `PLC-ENT-CSA-W04` (50), `PLC-ENT-CSAM-W02` to `-W06` (57 to 61), `PLC-USPSI-ATS-W07` (206), `PLC-USPSI-CSAM-W02` to `-W06` (246 to 250), plus 4 `Additional_Content` placements (`PLC-ENT-AE-ADD02`, `PLC-ENT-AE-ADD03`, `PLC-ENT-SSP-ADD01`, `PLC-ENT-CE-ADD01`). All are in the Enterprise and USPSI segments. **No SME&C, EPS, Leader or Manager placement has activity-level Secondary.** Old workbook: 18 placements, all Enterprise.

For 8 of the 24, an activity Secondary tool is not on the topic's Secondary list (old: 5 of 18):

| Placement | Topic | Tool only at activity level |
|---|---|---|
| `PLC-ENT-ATS-W06` (row 16) | `WF-CONV` | Cowork |
| `PLC-ENT-CSAM-W02` (57) | `WF-PLAN` | Cowork |
| `PLC-ENT-CSAM-W03` (58), `PLC-USPSI-CSAM-W03` (247) | `WF-HEALTH` | Microsoft 365 Copilot |
| `PLC-ENT-CSAM-W05` (60), `PLC-USPSI-CSAM-W05` (249) | `WF-ORCH` | Microsoft 365 Copilot |
| `PLC-ENT-SSP-ADD01`, `PLC-ENT-CE-ADD01` (Additional_Content rows 11, 15) | `WF-INVEST` | ECIF Agent |

**Possible data inconsistency** (activity Secondary names a tool the topic does not). Probably benign, but the workbook gives no rule that says the activity list may extend the topic list.

### E.4 Topic Secondary missing entirely

- `WF-PARTNER`: topic Primary only (5 placements: `PLC-SMEC-PSS-W08`, `PLC-EPS-PTS-W05`, `PLC-EPS-PDM-W06`, `PLC-EPS-PDM-R-W05`, `PLC-EPS-PDM-R-W06`). Old: no equivalent gap.
- 196 placements have topic Secondary rows but no activity Secondary (see C.2).

---

## F. Other affected roles and placements

| Segment / role | Placements affected | Notes |
|---|---|---|
| Enterprise Manager (`SR-ENT-MGR`) | W01 to W09 (rows 65 to 73) | **New in the updated workbook, no old comparison.** No activity Secondary anywhere. Topic Secondary exists for W02 to W08. Topic Primary for `WF-PLAN` shows Sales Home, which conflicts with Change Summary row 57 for managers. W01 and W09 have no tools. |
| SME&C (`SR-SMEC-*`, 60 placements) | 51 activities changed tools. 21 old placements without crosswalk entry. No activity Secondary. | Rebuilt under V16.x. Sales Home activity rows fell from 52 to 3 while Change Summary row 57 still describes Sales Home as the seller surface. Primary sets of exactly Sales Agent, Copilot, Deal Agent occur at `PLC-SMEC-DAE-W07` (row 80) and `PLC-SMEC-SMEC-CE-W08` (row 90), where `WF-RENEW` has 7 topic Secondary tools but the activities have none. |
| Enterprise other roles (AE, ATS, SSP, SE, CSA, CSAM, CE) | Unchanged tool mappings. Activity Secondary in 14 Role_Paths placements (updated) | Most affected by the topic-vs-activity Secondary gap. |
| USPSI (`SR-USPSI-*`) | Same structure as Enterprise | `PLC-USPSI-CSAM-W02` to `-W06` have activity Secondary (Copilot) |
| EPS (`SR-EPS-*`) | Several `WF-PARTNER` placements with no Secondary | Not in old workbook |
| Leader (`SR-LDR-LDR`) | `PLC-LDR-LDR-W02`, `-W04`, `-W05` use Agent J.ai at activity level, not on topic list | Not in old workbook |
| Additional_Content (34 placements) | 12 have activity Primary not on topic lists; 3 have no topic tools | Old workbook has the same pattern (12 of its 13 gaps are Additional_Content) |

---

## G. Recommended corrections

Nothing below has been applied. These are recommendations for review.

### G.1 Excel data issues (smallest changes first)

1. **Normalise `ShowAgentAccessLink`:** 130 `Activity_Agents` rows use `Y`; every other row uses `Yes` or `No`. Make them consistent. Confirmed inconsistency.
2. **Decide and record whether Week 9 (`WF-TRANSITION`) intentionally has no tools.** If yes, add a note in `V4_Review_Notes` so a blank card is clearly by design. If no, add `Activity_Agents` rows for the 112 activities.
3. **Refresh the SME&C Sales Home narrative or the mappings.** Change Summary rows 57 and 68 do not match the current rows (Sales Home 3 activity rows, Copilot 46). One of the two is stale.
4. **Document the 21 old SME&C placements that have no `ID_Crosswalk` entry** (list in B.3) as retired, if that is what happened.
5. **Document the `WF-PLAN` Sales Home topic Primary against the "manager-facing activity must stay on Sales Agent" rule** (row 57), or move Sales Home out of the topic Primary list for placements used by managers.
6. **Optionally add explicit placement-level Secondary data** (new sheet or new `Activity_Agents` Secondary rows). This is only needed if the client wants Secondary that differs by role. It is not a minimum change, and it is a schema or content decision for the workbook owner.

### G.2 Application logic issues (do not change the workbook for these)

1. Choose one source for Primary per placement and apply it consistently: activity-level Primary on the placement's own activities (the rule written at `V4_Review_Notes` row 223). Do not fall back to topic lists.
2. Decide what "Secondary" means (G.3) and implement exactly that. With the current data an activity-only reading yields empty Secondary for 262 of 286 placements, 196 of which have topic-level Secondary defined.
3. If topic lists are displayed at all, they must not add tools to a "used tools" or Primary area. The extra tools on AE Week 2 are topic-level rows being shown on the card.
4. Count tools by product, not by `AgentID`, when the client expects four tools. ECIF Agent (AGT-002) and CX Vitals are surfaced through Sales Agent.
5. Tolerate `Y`/`Yes` until the workbook is normalised.

### G.3 Decisions that need manager or client confirmation

1. **What is Secondary?** Options: (a) topic-level Secondary list shown on every placement of the topic; (b) activity-level Secondary only (empty for most huddles); (c) topic Secondary minus the placement's own Primary tools; (d) a new explicit placement-level assignment. The workbook supports (a), (b), (c) mechanically and (d) only with new data.
2. **Is ECIF Agent counted as a separate tool on AE Week 2?** If yes, the card shows five Primary tools, not four.
3. **Should Sales Home appear for Manager and Enterprise placements?** The workbook says it is individual-contributor-only and SME&C-only, but it is a topic-level Primary on `WF-PLAN` and other topics.
4. **Is a tool-free Week 9 and Orientation correct?**
5. **Are the SME&C tool substitutions (Sales Home to Copilot, Cowork and others) intentional?** Narrative rows 57 and 68 disagree with the data.

### G.4 Final question

**Does the updated Excel workbook contain enough correct information to determine Primary and Secondary tools for each huddle independently?**

**Primary: mostly yes.** For 230 of 286 placements, the placement's own activities carry explicit Primary rows, and the data is identical to the old workbook for all Enterprise, EPS, Leader and USPSI shared activities. The 56 placements with no Primary are Orientation (28, no activities) and Week 9 Transition (28, activities with no tool rows). Those look intentional but are not stated as such for tools.

**Secondary: no, not independently per huddle.** What the workbook contains is:

- explicit activity-level Secondary for only 24 placements (all Enterprise or USPSI), carried over from 18 in the old workbook; and
- topic-level Secondary for 220 placements, but those lists are shared by every role and placement of a topic. They cannot be tied to one huddle without relying on other roles' placements of the same topic.

**What is missing or inconsistent compared with the old workbook:**

1. The structure is unchanged, so no sheet or column was lost. The Secondary gap exists in the old workbook too (100 of 138 placements: topic Secondary but no activity Secondary).
2. New gaps in the updated workbook: 28 Week 9 placements have no tool rows at all (old: none), the Manager role path is new with no activity Secondary, and `WF-PARTNER` has no Secondary.
3. Topic lists changed with the merge to 23 topics (Cowork moved to Primary on several topics, lists widened). This changes what topic-based displays show, but not activity-based ones.
4. SME&C activity tools were substantially replaced (Sales Home 52 rows to 3), and the workbook's own notes (Change Summary rows 57 and 68) disagree with the data.
5. 21 old SME&C placements have no crosswalk entry, and 130 `ShowAgentAccessLink` values use `Y`.
6. The workbook does not state the meaning of Secondary, so no workbook-only answer exists. The mapping exists, the rule does not.

**Likely cause of the "too many tools" and "Secondary: None" reports** (from workbook evidence, with the five possibilities asked about):

| Possibility | Evidence |
|---|---|
| Topic-level Secondary defined but ignored | **Supported.** 196 placements have topic Secondary and no activity Secondary. An activity-only reading shows "None" for them. Placements with Primary of Sales Agent, Copilot, Deal Agent only (for example `PLC-SMEC-DAE-W07`) have 7 topic Secondary tools but no activity Secondary. I could not tie the two screenshots to a placement ID from the images alone, so this match is possible, not confirmed. |
| Secondary at activity level but wrong source read | Not supported for AE Week 2 (no activity Secondary exists). Supported only for the 24 placements in E.3. |
| Secondary removed or changed in the updated workbook | **Not supported.** Activity Secondary went from 34 rows to 46; all 34 old rows are still present and the 12 added rows are on new activities. Topic Secondary changed only by the merge (C.4). |
| Workbook has one structure, app assumes both | **Supported.** Two levels exist, and the rule at row 223 says to use activity-level only for used tools. Nothing defines Secondary. |
| Incomplete or ambiguous records | **Partly.** Week 9 has no tool rows, `WF-PARTNER` has no Secondary, SME&C narrative disagrees with data, and the 21 unmapped SME&C placements. |

Overall: a **combination**. The extras on AE Week 2 are workbook topic data displayed by an application rule. The empty Secondary is the application reading only the level where Secondary is sparse. The workbook did not remove anything, but it does not define Secondary, and some SME&C, Week 9 and Manager records need a decision.
