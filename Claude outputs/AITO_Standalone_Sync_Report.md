# AITO Standalone ↔ Recovered Synchronization — Final Report

**Date:** September 23, 2026
**Scope:** `C:\AITO Standalone` (only application modified). `C:\AITO-Recovered` and `C:\AITO-Recovered\database\fresh-install-v11.78` are read-only sources of truth and were never modified.

## 1. Major functionality synchronized

- **Role selection** — Standalone's shared `Roles.json` (used by both the Workflow builder and the Huddle audience picker) now includes the 5 SME&C roles that exist in the current recovered dataset but were missing from Standalone: Digital Account Executive (DAE), Digital Solution Area Specialist (DSS), Digital Solution Engineer (DSE), Digital Cloud Solution Architect (DCSA), and Partner Solution Sales (PSS). They now appear in both role pickers (`/api/roles`), matching the Enterprise + SME&C segment structure in `fresh-install-v11.78`.
- **Role Path (weekly paths)** — Every role, including the 5 new ones, now has a correct week-by-week Role Path built directly from the corrected `HuddleRolePathItems` + `HuddlePlacements` tables (e.g. the new DAE role gets an 8-week path: Orientation → Territory → Signal → Conversation → Deal → Partner → Renewal → Health).
- **Topics and topic navigation** — grew from 16 to 27 current topics (11 new topics added, including "Earn Customer Satisfaction on Every Delivery" and "Build the Technical Credibility the Role Depends On"), each with correct role eligibility, resources, and MCEM-stage tagging.
- **Huddle generation / Huddle catalog** — the catalog, placement catalog, and per-topic "default" placement (the entry `defaultCatalog`/`defaultDetails` resolve to) are now rebuilt from the corrected placements rather than a stale, separately-generated bundle.
- **Huddle details** (facilitator guide, phases, activities, agents, resources, MCEM stages, WIIFM/today's-objective/desired-outcome narrative fields) — rebuilt per placement from the corrected raw tables, preserving the exact field shapes the UI already expects.
- **Recommended/related content, Additional paths** — rebuilt per role from each role's own `SEC-ADDITIONAL` placements.
- **Agents and resources** — `HuddleAgents` grew 18→22, `HuddleResources` 49→54; both are now correctly embedded wherever they're referenced (topic-level primary/secondary agents, activity-level agents, agent-level and activity-level resource lists).
- **Workflow builder, Saved workflows, Manager functionality, Home/dashboard, export, navigation/routing** — untouched; these did not depend on the stale Huddle data and were already verified correct in prior work on this project. `reference.aiTools`, `reference.workflowBuckets`, and `reference.activities` (all Workflow-only) are unchanged (14 / 9 / 186 entries respectively).

## 2. Major UI/UX changes synchronized

None required. Standalone's existing components, layout, and navigation already matched Recovered's structure from prior work in this project; this pass was a data/data-fetching-logic correction, not a UI change. No component files were touched.

## 3. Data changes made using DB scripts

All changes trace back to `C:\AITO-Recovered\database\fresh-install-v11.78` (read-only), primarily `20_Huddle_Reference_Data.sql`, `21_Huddle_Topics.sql`, `22_Huddle_Placements.sql` through `30_Huddle_Activity_Joins.sql`, `20b_Fix_Huddle_Role_Descriptions.sql`, and `20c_OPTIONAL_Backfill_New_Role_Descriptions_DRAFT.sql`, cross-checked against `00_README_Fresh_Install.md`, `expected_counts.txt`, `DATA_CORRECTIONS.md`, and `SKIPPED_ROWS.md`.

- 20 raw `Huddle*.json` tables in Standalone were corrected to exactly match `expected_counts.txt` (every one of the 20 final row counts matches exactly), including dropping 10 stale/orphaned rows across 4 tables that no longer exist in the current dataset.
- 5 new roles were added to `Roles.json` (SortOrder 9–13, Segment "SME&C", no `Description` — the source workbook has no description text for these 5 roles, same as the pre-existing `ROLE-ALL`).
- `src/data/static-api-data.json` — the actual runtime data bundle `localApiClient.ts` reads from — was fully rebuilt from the corrected raw tables. This was the critical missing step: fixing the raw tables alone does not change what the running app displays, because the app never reads them directly.

## 4. Important relationships/mappings implemented

- **Role → SegmentRole resolution**: each role is matched to its own `HuddleSegmentRoles` row by Segment + Abbreviation (Enterprise roles to `SEG-ENT`, SME&C roles to `SEG-SMEC`), which correctly disambiguates roles like CE and ALL that exist in both segments without merging their placements.
- **Per-topic "default" placement**: for each topic, the Enterprise-segment `SEC-ROLEPATH` placement with the lowest `Sequence` is chosen (falling back to any Enterprise placement, then any placement, when no `SEC-ROLEPATH` candidate exists), with ties broken by row order. This rule was reverse-engineered and empirically confirmed against 15 of the 16 topics in the previous data (the 16th referenced a placement ID that no longer exists post-correction — stale data, not a rule exception).
- **rolePlacements**: own placement for that topic if the role has one, else the first available placement for that topic from any role (used as a display fallback).
- **weeklyPaths**: direct join of a role's `HuddleRolePathItems` rows to its own placements by week.
- **additionalPaths**: a role's own `SEC-ADDITIONAL` placements, using `Sequence` as the week number.
- **`reference.roles`** (backing `/api/roles`, shared unfiltered by both the Workflow and Huddle role pickers) is regenerated 1:1 from `Roles.json` — this was necessary for the 5 new roles to actually reach either picker; `reference.aiTools`/`workflowBuckets`/`activities` were left untouched as pure Workflow content with no dependency on Roles.json rows being added.
- Agents and resources are joined at both the topic level (shared across all placements of a topic) and the activity level (specific to one activity), matching the existing data model.

## 5. Differences remaining

- Two pre-existing gaps, unrelated to this pass, were identified in prior work and are flagged here for awareness rather than fixed (fixing either would go beyond a data/data-fetching-logic correction):
  - `/api/roles` ignores its `module` query parameter and returns the same full role list to both the Workflow builder and the Huddle audience picker (this is how the shared `Roles.json`/`reference.roles` was already architected, not something introduced now).
  - `huddleApi.types.ts` keeps a `placementExternalId` field that Recovered's own type appears to have dropped, and Standalone's empty-state text for "no topics configured" was ported as its evidently-intended fixed wording rather than a literal typo that may exist in Recovered — both are minor, pre-existing items worth a human's attention if exact byte-for-byte parity with Recovered's current source is ever required.
- Some fields the UI type supports have no source column anywhere in the recovered dataset (`useCase`, top-level `stepsToGetStarted`, `reflectionPrompt`, `commitmentPrompt`, `recommendationPriority`, `audienceDescription`) — these are always `null`/empty in both the old and rebuilt data; this is a gap in the source data itself, faithfully preserved rather than invented.
- `contentAvailability` flags and `missingFields` are freshly computed from the corrected data using a straightforward "is this field populated" rule; the previous bundle's values were internally inconsistent (e.g. flagging a populated field as missing) and were not used as a template.

## 6. Files modified inside Standalone (this project, cumulative)

All 21 changed files are under:
`AITO Workflow and Huddle Generator In App\frontend\aito-workflow-and-huddle-generator-frontend\src\data\`

Raw tables corrected to match `fresh-install-v11.78`: `HuddleSegments.json`, `HuddleFocusAreas.json`, `HuddleMcemStages.json`, `HuddleSegmentRoles.json`, `HuddleTopics.json`, `HuddleTopicRoles.json`, `HuddlePlacements.json`, `HuddleRolePathItems.json`, `HuddlePhases.json`, `HuddleFacilitatorGuides.json`, `HuddleAgents.json`, `HuddleResources.json`, `HuddleActivities.json`, `HuddleActivityPrerequisites.json`, `HuddleTopicMcemStages.json`, `HuddleTopicAgents.json`, `HuddleTopicResources.json`, `HuddleAgentResources.json`, `HuddleActivityAgents.json`, `HuddleActivityResources.json`.

Also modified: `Roles.json` (added 5 SME&C roles) and `static-api-data.json` (fully rebuilt `huddle.*` and `reference.roles`; `reference.aiTools`/`workflowBuckets`/`activities` and top-level `meta` left byte-identical).

No other file anywhere in `C:\AITO Standalone` was touched — verified by scanning the entire folder tree for files modified today; only the 21 files above matched.

## 7. Confirmation: `C:\AITO-Recovered` untouched

Verified via `git status`/`git diff` against the repository's own HEAD: every file this project actually read from (`fresh-install-v11.78/21_Huddle_Topics.sql`, `20_Huddle_Reference_Data.sql`, `expected_counts.txt`, etc.) shows **zero** diff from HEAD — byte-identical.

One transparency note: running `git status`/`git diff` as a *read-only check* caused git's own internal index-refresh to touch `.git/index` and momentarily create a `.git/index.lock` file (standard git behavior on any status/diff call, not specific to this repo). This is metadata-only — no tracked file content, blob, or commit changed — but in the interest of full compliance with the "never create/modify any file" rule, the stray `.git/index.lock` was located and deleted immediately after being found. No application file, script, or data file was affected. Going forward, no further git commands will be run against this read-only repository.

Separately, the repository shows pre-existing, unrelated drift across ~730 files (backend C#, `tsconfig`, older `database/huddle/*` and `fresh-install-v10.2.1/*` seed scripts) that is **pure line-ending re-encoding** (insertions exactly equal deletions per file, content identical line-for-line) — not content changes, not something caused by this or any prior session's work, and it does not touch `fresh-install-v11.78` at all.

## 8. Confirmation: `fresh-install-v11.78` untouched

Confirmed clean — zero git diff for the entire `database/fresh-install-v11.78/` folder, and it was only ever read via `cat`/Node `readFileSync`/the SQL parser, never written to.

## 9. Confirmation: no files outside Standalone modified

Confirmed by direct filesystem scan of the whole `C:\AITO Standalone` tree (see §6) and by the git-diff-based check of `C:\AITO-Recovered` (see §7). The only file altered outside the Standalone application folder during this session was the transient, now-deleted `.git/index.lock` described in §7.

## 10. Build / validation results

- **Population script** (raw `Huddle*.json` tables): re-verified — all 20 tables' row counts match `expected_counts.txt` exactly.
- **`static-api-data.json` rebuild**: ran in dry-run then for real; **zero warnings** both times (no missing topic/placement/agent/resource/role references). All 27 topics, 138 placements, and 14 roles produced catalog/detail/path entries.
- **Structural checks**: `defaultCatalog`/`defaultDetails` correctly mirror their chosen `placementCatalog`/`placementDetails` entries; `rolePlacements`/`weeklyPaths`/`additionalPaths` keys exactly match `reference.roles`' 14 external IDs; the new `dae-smec` role resolves a full 8-week path plus 1 additional-path entry; `meta` and the untouched `reference.*` arrays are unchanged in content.
- **TypeScript compile** (`npx tsc -b --force`, full rebuild, not incremental): **0 errors**. This type-checks the entire `src/` tree, including `localApiClient.ts`'s consumption of the rebuilt `static-api-data.json`.
- **Full `npm run build` (`vite build`)**: could not complete in this session — the project's `node_modules` were installed on Windows and only contain the `win32-x64-msvc` native binding for the `rolldown` bundler Vite uses; the shell this session runs commands through is a Linux VM bridged to the Windows folders, which needs a `linux-x64-gnu` (or wasm) binding that isn't installed. This is a pre-existing environment/platform mismatch unrelated to any data change made here — recommend running `npm run build` directly in a terminal on the Windows machine itself to get a full bundle build confirmation.
- **Scope check**: only the 21 files listed in §6 show any modification anywhere in Standalone (confirmed via a full-tree "modified today" filesystem scan).

## 11. Functionality that could not be fully reproduced, and why

- **Full bundled build verification** (`vite build` output) — blocked by the cross-platform native-binding issue in §10, not by anything in this pass's data changes. TypeScript's own full-program type-check did pass, which is the strongest verification available from this environment.
- **Byte-for-byte parity on a few narrow fields** with no source column anywhere in the recovered dataset (`useCase`, `reflectionPrompt`, `commitmentPrompt`, `recommendationPriority`, `audienceDescription`) — these remain `null`/empty because the source data itself has nothing to populate them with, in both Recovered and Standalone.
- The two pre-existing items noted in §5 (`/api/roles` ignoring `module`, the `placementExternalId` type field, the empty-state wording) were left as-is since they predate this data-correction pass and are not part of the Role Path/Topics/Huddle data-freshness problem that was reported.
