# Enterprise > AE > Week 2: where the AI tools are defined and why the card can show a different list

Read-only trace. No workbook, source file or JSON was changed.

**Workbooks examined**

- Old: `Frontier_Accelerator_Huddle_App_Content_Integration_Model_9.16.2026_CORRECTED.xlsx` (Change Summary title "V11.78")
- Updated: `Frontier_Accelerator_Huddle_App_Content_Integration_Model_10.13.2026 v2.xlsx` ("2026-10-13 r1 (publication candidate)")

"Row N" is the Excel row number (header is row 1). Everything marked "confirmed" was read from a cell or from the app's data file. Anything else is marked "possible".

---

## A. Direct answer

**The claim cannot be verified literally, but there is a clear reason the client believes it.**

- The `Activities` sheet has no column that holds a tool or agent, and it has no cell whose value is `Cowork`, `Sales Agent` or `Microsoft 365 Copilot` (confirmed by searching every sheet for exact cell values). The name `Copilot` on its own is never used as a tool name. The only tool name is `Microsoft 365 Copilot`.
- The tool names do appear inside the `Activities` rows for this huddle, in two columns: **`LaunchLabel`** ("Open Microsoft 365 Copilot", "Open Cowork", "Open Sales Agent", "Get started with Scout") and **`LaunchURL`** (the Cowork activity's URL contains `cowork`). A reader scanning the `Activities` tab sees the tool names in those columns, so the client's belief is understandable. These are button labels and links. They do not define the assignment.
- The actual tool assignment is stored in **`Activity_Agents`** (one row per activity and tool, with `UsageType` Primary or Secondary). Readable names come from **`Agents`** (`AgentID` to `AgentName`).
- All five activities of this huddle are explicitly **Primary** in `Activity_Agents`. There is no activity-level Secondary row for this huddle.
- Separately, the shared topic `WF-PLAN` has its own tool list in **`Topic_Agents`** (Primary and Secondary). That list is not specific to AE and is where the additional tools come from.

---

## B. Exact Week 2 mappings

**The record (confirmed in both workbooks)**

| Item | Updated workbook | Old workbook |
|---|---|---|
| Placement | `PLC-ENT-AE-W02`, `Role_Paths` row 3 | `AE-PLAN`, `Role_Paths` row 3 |
| Segment role | `SR-ENT-AE` (`Segment_Roles` row 2: `SEG-ENT`, `ROLE-AE`, Account Executive) | same |
| Sequence | 2 (Week 2), `PathSection` `SEC-ROLEPATH`, `Active` Y | same |
| `RoleTopicName` | "Prioritize Accounts and Build an Actionable Account Plan" | same |
| Topic | `WF-PLAN` ("Prioritize Work and Allocate Capacity", `Topics` row 4) | `WF-X-PLAN-01` ("Prioritize and Plan the Account", `Topics` row 2) |
| ID link | `ID_Crosswalk` row 65: `AE-PLAN` to `PLC-ENT-AE-W02` | n/a |

The title, segment, role, week, placement ID and topic ID you gave are all correct.

**How the activities were found:** `Activities.PlacementID` equals the placement ID. Five rows match in each workbook, all in phase `PH-AE-PLAN-EXPL`, all `Active` Y.

| `Activities` row | ActivityID | Activity name (`ActivityName_JTBD`) | Order | Tier | `LaunchLabel` | `Activity_Agents` row | AgentID / tool | UsageType | `DisplayLabel` |
|---|---|---|---|---|---|---|---|---|---|
| 14 | `AE-03-P01` | Prioritize account action for this week | 1 | Featured | Open Sales Agent | 110 | `AGT-001` Sales Agent | Primary | Sales Agent |
| 15 | `AE-03-P02` | Build or assess the account plan with approval gates | 2 | Featured | Get started with Scout | 111 | `AGT-005` Scout | Primary | Scout |
| 11 | `AE-03-ALT-01` | Pressure-test the account priority list | 3 | Extended | Open Microsoft 365 Copilot | 112 | `AGT-003` Microsoft 365 Copilot | Primary | Microsoft 365 Copilot |
| 12 | `AE-03-ALT-02` | Create the account follow-through plan | 4 | Extended | Open Cowork | 113 | `AGT-004` Cowork | Primary | Cowork |
| 13 | `AE-03-ECIF-01` | Assess ECIF fit and investment momentum | 5 | Extended (old: Featured) | Open Sales Agent | 114 | `AGT-002` ECIF Agent | Primary | ECIF Agent, surfaced through Sales Agent |

Rows in `Activity_Agents` are the same row numbers in both workbooks. `ShowAgentAccessLink` is "No" and `DisplayOrder` is 1 on all five.

Five rows, five AgentIDs, **four products** once ECIF Agent is counted as part of Sales Agent (its own `DisplayLabel` and `LaunchLabel` say so). That gives the client's expected set (Copilot, Cowork, Sales Agent, Scout).

**Topic-level list for the same topic** (separate sheet, not linked to AE activities):

| `Topic_Agents` row (updated) | TopicID | AgentID / tool | UsageType | `DisplayOrder` |
|---|---|---|---|---|
| 77 | `WF-PLAN` | `AGT-001` Sales Agent | Primary | 1 |
| 80 | `WF-PLAN` | `AGT-004` Cowork | Primary | 1 |
| 84 | `WF-PLAN` | `AGT-013` Sales Home | Primary | 1 |
| 81 | `WF-PLAN` | `AGT-005` Scout | Secondary | 1 |
| 82 | `WF-PLAN` | `AGT-006` Researcher | Secondary | 2 |
| 83 | `WF-PLAN` | `AGT-008` MSXI Assist V2 | Secondary | 4 |
| 79 | `WF-PLAN` | `AGT-003` Microsoft 365 Copilot | Secondary | 5 |
| 78 | `WF-PLAN` | `AGT-002` ECIF Agent | Secondary | 7 |

---

## C. Tool relationship table

| Tool name | Exact source sheet | Tool ID | Activity ID | Topic ID | Explicit Primary/Secondary assignment? |
|---|---|---|---|---|---|
| Sales Agent | `Activity_Agents` row 110 (name from `Agents` row 2) | `AGT-001` | `AE-03-P01` | `WF-PLAN` | Yes, Primary (activity level) |
| Sales Agent | `Topic_Agents` row 77 | `AGT-001` | not applicable | `WF-PLAN` | Yes, Primary (topic level) |
| Scout | `Activity_Agents` row 111 (`Agents` row 6) | `AGT-005` | `AE-03-P02` | `WF-PLAN` | Yes, Primary (activity level) |
| Scout | `Topic_Agents` row 81 | `AGT-005` | not applicable | `WF-PLAN` | Yes, Secondary (topic level) |
| Microsoft 365 Copilot ("Copilot") | `Activity_Agents` row 112 (`Agents` row 4) | `AGT-003` | `AE-03-ALT-01` | `WF-PLAN` | Yes, Primary (activity level) |
| Microsoft 365 Copilot | `Topic_Agents` row 79 | `AGT-003` | not applicable | `WF-PLAN` | Yes, Secondary (topic level) |
| Cowork | `Activity_Agents` row 113 (`Agents` row 5) | `AGT-004` | `AE-03-ALT-02` | `WF-PLAN` | Yes, Primary (activity level) |
| Cowork | `Topic_Agents` row 80 | `AGT-004` | not applicable | `WF-PLAN` | Yes, Primary (topic level); in the old workbook it was Secondary (row 48) |
| ECIF Agent (surfaced through Sales Agent) | `Activity_Agents` row 114 (`Agents` row 3) | `AGT-002` | `AE-03-ECIF-01` | `WF-PLAN` | Yes, Primary (activity level) |
| ECIF Agent | `Topic_Agents` row 78 | `AGT-002` | not applicable | `WF-PLAN` | Yes, Secondary (topic level) |
| Sales Home | `Topic_Agents` row 84 only (`Agents` row 20) | `AGT-013` | none | `WF-PLAN` | Yes, Primary, topic level only. **No AE Week 2 activity uses it.** |
| Researcher | `Topic_Agents` row 82 only | `AGT-006` | none | `WF-PLAN` | Yes, Secondary, topic level only |
| MSXI Assist V2 | `Topic_Agents` row 83 only | `AGT-008` | none | `WF-PLAN` | Yes, Secondary, topic level only |

Where the tool names appear as text but do not assign anything: `Activities.LaunchLabel` rows 11 to 15, `Activities.LaunchURL` row 12, and `Agents.AccessLinkLabel`. In other sheets the names appear as `DisplayLabel` values in `Activity_Agents` and `Topic_Agents`, and as names in `Agents` and `Execution_Entities`.

---

## D. Relationship explanation

The workbook is a set of linked tables. Each table stores one kind of fact and points to others by ID.

```
Role_Paths   PlacementID = PLC-ENT-AE-W02   (TopicID = WF-PLAN)
    |
    |  Activities.PlacementID = PLC-ENT-AE-W02          <- confirmed
    v
Activities   ActivityID = AE-03-P01, -P02, -ALT-01, -ALT-02, -ECIF-01
    |
    |  Activity_Agents.ActivityID = ActivityID           <- confirmed
    v
Activity_Agents   AgentID + UsageType (Primary)
    |
    |  Agents.AgentID = AgentID                          <- confirmed
    v
Agents   AgentName (Sales Agent, Scout, Microsoft 365 Copilot, Cowork, ECIF Agent)

Role_Paths.TopicID = WF-PLAN                             <- confirmed
    |
    v
Topic_Agents   TopicID = WF-PLAN, AgentID + UsageType (Primary / Secondary)
    |
    v
Agents   AgentName
```

In plain terms:

- **`Activities`** stores the content of each practice: its ID, name, description, prompt, steps, tier, order, and a launch button (`LaunchLabel`, `LaunchURL`). It does not store which tool is assigned. The button label only happens to name the tool.
- **`Activity_Agents`** stores "this activity uses this tool, as Primary or Secondary", keyed by `ActivityID` and `AgentID`. This is the sheet that ties a tool to one specific huddle.
- **`Topic_Agents`** stores "this tool is relevant to this workflow topic", keyed by `TopicID` and `AgentID`. It has no role, segment or placement column, so every role that uses `WF-PLAN` shares the same list.
- **`Agents`** maps `AgentID` to the readable name and access link.
- **Primary and Secondary are explicit** values in the `UsageType` columns of both assignment sheets. They are not inferred from order or from another field (confirmed: no formula or derived column exists).
- Confirmed: there is no placement-level tool field. A placement reaches tools only through its activities, or through its topic.
- Not stated anywhere in the workbook (so unverified): what "Secondary" should mean for a single huddle. The only workbook rule found is `V4_Review_Notes` row 223 (updated workbook only), which says Huddle tools resolve from `Activity_Agents` on the selected activities, that `Topic_Agents` never proves Huddle use, and that topic-only agents must not render as used tools. It is headed "EPS runtime audience and agents" but is worded generically.

---

## E. Old vs updated workbook

| Item | Old | Updated | Class |
|---|---|---|---|
| Placement ID | `AE-PLAN` | `PLC-ENT-AE-W02` | Renamed, mapped in `ID_Crosswalk` row 65 |
| Topic ID / name | `WF-X-PLAN-01` "Prioritize and Plan the Account" | `WF-PLAN` "Prioritize Work and Allocate Capacity" | Renamed and merged with other topics |
| ActivityIDs | 5 | same 5 | Unchanged |
| `Activity_Agents` rows 110 to 114 | as in section B | identical (same agents, usage, labels, order, rows) | **Unchanged** |
| Activity-level Secondary | none | none | Unchanged |
| `AE-03-ECIF-01` tier | Featured | Extended | **Changed**, not a tool change |
| Topic Primary | Sales Agent (row 47), Sales Home (row 72, no order or label) | Sales Agent (77), Cowork (80), Sales Home (84) | Cowork **moved from Secondary to Primary** |
| Topic Secondary | Cowork (48), Researcher (49), MSXI (50), Copilot (51), Scout (52), ECIF (129) | Scout (81), Researcher (82), MSXI (83), Copilot (79), ECIF (78) | Cowork removed (it is now Primary) |

The activity data for this huddle did not change between the workbooks. The topic list changed in one way (Cowork). Sales Home, Researcher and MSXI Assist V2 are on the topic list in **both** workbooks.

---

## F. Cause of the mismatch

**Confirmed facts**

1. The workbook assigns exactly the expected tools to the AE Week 2 activities, all as Primary, and none as Secondary.
2. Sales Home, Researcher and MSXI Assist V2 are assigned to the topic `WF-PLAN` only. No AE Week 2 activity uses them.
3. The Standalone app's data file (`src/data/static-api-data.json`) carries two projections for this huddle. It still uses the old IDs (`AE-PLAN`, `WF-X-PLAN-01`) but the updated topic name and topic tools:
   - Placement projection (`huddle/placementCatalog/AE-PLAN` and `placementDetails/AE-PLAN`): Primary = Sales Agent, Scout, Microsoft 365 Copilot, Cowork, ECIF Agent; Secondary = empty.
   - Topic projection (`huddle/defaultCatalog/WF-X-PLAN-01` and `defaultDetails/WF-X-PLAN-01`): Primary = Sales Agent, Cowork, Sales Home; Secondary = Scout, Researcher, MSXI Assist V2, Microsoft 365 Copilot, ECIF Agent.
4. The app's local API client reads the placement projection when a placement ID is available and falls back to the topic projection when it is not (`src/api/localApiClient.ts`, for example lines 156 to 162, 315 to 317 and 428 to 437). Primary and Secondary come from explicit classification in the data, and order follows activity order or `DisplayOrder`. Nothing is inferred.
5. The main app reference code (`HuddleMappings.cs`) takes Primary from the placement's own activities, and takes Secondary from **all** the topic's Secondary rows. It only uses the topic's Primary rows when no placement is given. For this huddle that would give Primary = the five activity tools and Secondary = Scout, Researcher, MSXI Assist V2, Microsoft 365 Copilot and ECIF Agent, so three tools appear in both lists. I read this code but did not run it, and I did not check the main app's database contents.

**Possible causes (not confirmed from the evidence I have)**

- The client's list (Sales Agent, Cowork, Sales Home as Primary and the five Secondary tools) is identical to the topic projection. That fits a screen showing the topic-level list, which happens when a huddle is opened or listed without its placement ID, or in the main app's Primary fallback. I could not tell which screen or build produced the client's screenshot.
- The "too many tools" report fits topic Secondary lists being shown for every placement of the topic.

**Overall:** the workbook is not missing mappings for this huddle. The extras are real workbook data, but they sit in the shared topic list. The mismatch comes from topic-level mappings being displayed together with, or instead of, the activity-level mappings, which is an application behaviour, plus the fact that the workbook does not define what Secondary means for a single huddle.

---

## G. Recommended next step (not implemented)

1. **Confirm with the client what Secondary should mean for this card.** Options: no Secondary (activity-level only, which matches the workbook note at `V4_Review_Notes` row 223), the topic Secondary list shown as is, or the topic Secondary list minus tools already Primary. The workbook cannot answer this.
2. **Minimum correction on the application side:** make sure this huddle always uses the placement projection (Primary from the five activities). Do not let the topic Primary (Sales Home, Cowork) or the topic list appear on a placement card unless the decision in step 1 says so. No Excel change is required to get the four expected tools plus ECIF.
3. **Only if the client wants a different Secondary list for AE Week 2:** add explicit `Activity_Agents` Secondary rows for the relevant `AE-03-*` activities, which is a content decision for the workbook owner.
4. **Ask the client to confirm whether ECIF Agent counts as a separate tool.** The workbook labels it "surfaced through Sales Agent", so counting by `AgentID` shows five tools and counting by product shows four.
