# Part 9 — Huddle Data Discovery and Canonical Contract

Status: **Proposed for approval**  
Scope: discovery and design input only  
Migration/API/UI implementation: **not started by this phase**

## 1. Source authority and semantic policy

Source priority is:

1. Huddle V3 ZIP for the exact UI, interactions, and temporary content.
2. Revised Excel workbook for the target business schema and client-supplied semantic content.
3. Current repository for architecture, authentication, API conventions, and shared infrastructure.
4. Older documents for historical guidance only.

The canonical contract uses one semantic source per field. Empty workbook fields stay `null`; empty relationships stay `[]`. A value may not be borrowed from a description, key insight, takeaway, phase outcome, or generated sentence merely because the intended field is empty. UI labels and unavailable states are presentation concerns and must not manufacture persistent content.

## 2. Inspected sources

### Current repository

The current application contains the Workflow vertical slices and shared infrastructure, but no Huddle route, Huddle EF entities, Huddle API endpoints, Huddle React Query hooks, or Huddle feature UI. The only EF migration remains `20260730090049_InitialCreate`. Part 9 adds no migration.

### Huddle V3 ZIP

The authored source inspected was:

- `src/data/huddle/`: roles, tools, topics, prompts, MCEM stages, relationships, phases, facilitator guidance, resources, and takeaways.
- `src/data/required-huddles.ts` and `required-huddle.types.ts`: Foundation/required Huddles.
- `src/data/huddle-selection.types.ts`: union of workflow and required selections.
- `src/data/huddle-catalog-metadata.ts`: catalog display adapter and overrides.
- `src/pages/huddle.tsx`: catalog, preview, session, facilitator, vote, progress, and export consumers.
- `src/features/huddle/orientation-page.tsx`: Huddle orientation/onboarding.
- `src/features/huddle/recommended-path.tsx`: role path, week placement, replacement, reset, votes, and plan export.
- `src/utils/exportPowerPoint.ts` and `src/utils/exportHtml.ts`: export projections.

The ZIP contains duplicated declarations in several generated files and multiple legacy compatibility projections. Those are evidence of UI requirements and temporary content, not a database design to copy verbatim.

### Revised workbook

Workbook: `Frontier_Accelerator_App_Content_Integration_Model_V2_Final.xlsx`.

| Sheet | Target purpose | Current populated data |
|---|---|---|
| Segments | audience segments | 0 rows |
| Roles | canonical roles | 1 row: Account Executive |
| Segment_Roles | segment-role display mapping | 1 row; references an absent `SEG-ENT` segment |
| Role_Paths | ordered recommended topics by segment-role | 0 rows |
| Focus_Areas | catalog focus areas | 0 rows |
| MCEM_Stages | MCEM reference data | 0 rows |
| Topics | Huddle identity, catalog, narrative, prompts, takeaway | 0 rows |
| Topic_MCEM | ordered topic-to-MCEM links | 0 rows |
| Workflow_Phases | ordered Huddle Flow phases | 0 rows |
| Activities | ordered phase activities and semantic execution fields | 0 rows |
| Facilitator_Guide | talk track/facilitator content | 0 rows |
| Agents | agent/tool catalog | 0 rows |
| Topic_Agents | topic-level primary/secondary agents | effectively 0 rows; one whitespace-only row is invalid |
| Activity_Agents | activity-level agents | 0 rows |
| Resources | resource catalog | 0 rows |
| Agent_Resources | agent resources | 0 rows |
| Topic_Resources | topic resources | 0 rows |
| Activity_Resources | activity resources | 0 rows |

Conclusion: the workbook confirms the target schema, but it does not yet provide Huddle content. ZIP content may be loaded later only as explicitly marked temporary content and without semantic substitution.

## 3. Huddle feature and state inventory

| Area | V3 behavior/state | Data needed | Persistence classification |
|---|---|---|---|
| Orientation | introductory Huddle page/tour and role entry | static UI copy, roles | UI-only plus reference data |
| Audience | role/segment selection | segments, roles, segment-role links | server reference data; selection temporary |
| Foundation | required/Foundation Huddles shown separately | topics of Foundation type, audience, agents, activities | persistent catalog |
| Recommended Path | audience gate; seven placements for Weeks 2–8; role-specific ordered plan | Role_Paths and topic summaries | persistent defaults; user customization persistent when introduced |
| Path editing | move up/down, replace from published catalog, reset week/path, customized indicator | catalog and saved path state | user state; not Topics content |
| Evergreen catalog | Audience, Focus Area, AI Tool, Sort, Search; pagination | topic summaries and relationships | catalog persistent; filters UI-only |
| Recommendation | priority/order and role relevance | Role_Paths, RecommendationPriority | persistent/derived ordering |
| Voting | upvote; downvote with reason(s) and comment; counts/sort | user vote and aggregate | persistent user data in later slice |
| Detail workspace | Overview and Resources tabs | canonical detail and resources | persistent catalog |
| Preview | Overview, activities/flow, reflect, commit, resources | canonical detail projected to slides | derived presentation |
| Huddle session | current phase/activity, completed activities, notes, timestamp | detail plus user progress | persistent user state in later slice |
| Continue Learning | shown when selected Huddle has incomplete progress | progress state | derived from user progress |
| Activity menu | complete/uncomplete, copy prompt, open agent/tool, activity resources | activity and relationships | actions UI-only; completion persistent |
| Facilitator/Talk Track | introduction, talking points, questions, transitions, wrap-up, AI actions | Facilitator_Guide | persistent content |
| Coach | “Meet with Coach”; Coach appears first in sidebar | UI action/integration contract | integration/UI-only until specified |
| Reflection | reflection prompt/content | Topics.ReflectPrompt | persistent content |
| Commitment | commitment prompt/content | Topics.CommitPrompt | persistent content |
| Exports | PowerPoint, full HTML, and learning-plan-only HTML | canonical detail/path projections | derived files, not source data |

### Content inventory by concept

- Roles and audiences: ZIP roles have id, code, name, abbreviation, segment, and description. Workbook normalizes Segment, Role, and Segment_Role.
- Huddle kinds: ZIP uses Foundation/required plus Prescriptive and Self-Service workflow Huddles. Canonical `Type` must normalize workbook `HuddleType`; it must not depend on ZIP display category strings.
- Topics: identity, domain/participant phase, role recommendations, status, narrative, recommendation, duration, and deck compatibility content exist across ZIP files.
- MCEM: ordered reference stages and topic relationships exist in ZIP and workbook.
- Huddle Flow: ordered phases with name, description, duration, and ZIP-only phase outcome.
- Activities/practices: title/JTBD, description, prompt/action, expected output, checkpoint, required context, best-fit job, agent/tool relations, and resource relations.
- Agents/tools: topic-level and activity-level primary/secondary use, display label, access link behavior, descriptive content, benefits, and resources.
- Resources: topic, activity, and agent scopes; order and descriptive/link metadata.
- Takeaways: ZIP `keyInsight`, commitment, and bring-back evidence; workbook has distinct `KeyTakeaway`, `ReflectPrompt`, and `CommitPrompt`.
- Progress: selected item, current phase, completed activities, notes, timestamp, and continue state are currently local-memory/localStorage behaviors in V3.
- Votes: up/down state, reason list, free-text comment, aggregate counts, and most-upvoted sort.
- Weeks: V3 path uses Weeks 2–8. Week is a placement projection from Role_Paths sequence, not a Topic property.

## 4. Field-mapping matrix

Status meanings:

- **Confirmed**: workbook provides an exact semantic column/relationship.
- **Temporary ZIP content**: exact or useful V3 content exists, but client workbook content is not supplied yet.
- **Awaiting client content**: the semantic field exists in the workbook but has no content and must remain null/empty.
- **Derived**: computed from confirmed relationships or state without inventing content.
- **UI-only**: transient presentation/control state; not Huddle content.

### 4.1 Identity, catalog, audience, and narrative

| Canonical/API field | ZIP source | Excel source | Proposed database property | UI consumer | Status |
|---|---|---|---|---|---|
| `id` | topic/required `id` | `Topics.TopicID` | `Huddle.Id` internal key; map external separately | selection, routing | Confirmed |
| `externalId` | topic/required `id` | `Topics.TopicID` | `Huddle.ExternalId` unique | integration/export | Confirmed |
| `name` | topic `title`; required `name` | `Topics.TopicName` | `Huddle.Name` | cards, header, exports | Awaiting client content |
| `description` | topic/deck/required description | `Topics.TopicDescription` | `Huddle.Description` nullable | cards, overview | Awaiting client content |
| `type` | category/required kind | `Topics.HuddleType` | `Huddle.Type` enum | Foundation/Recommended/Evergreen grouping | Confirmed schema; awaiting values |
| `publicationStatus` | ZIP topic status/metadata adapter | no workbook column | `Huddle.PublicationStatus` enum | published catalog visibility/badge | Temporary ZIP content; client confirmation required |
| `focusArea.id/name` | workflow domain/category fallback | `Topics.FocusAreaID` → `Focus_Areas` | `Huddle.FocusAreaId` FK | catalog filter/card | Awaiting client content |
| `durationMinutes` | workflow/required duration | `Topics.DurationMinutes` | `Huddle.DurationMinutes` | card/session/export | Awaiting client content |
| `recommendationPriority` | ZIP metadata/override | no workbook column | `Huddle.RecommendationPriority` nullable | default sorting | Temporary ZIP content; client confirmation required |
| `roles[]` | `roleIds`, role codes, placements | Topics through `Role_Paths.SegmentRoleID` and Segment_Roles/Role | no direct HuddleRole required for paths; optional audience link only if separately approved | role relevance/cards | Derived from confirmed path relationships |
| `audienceDescription` | required audience description; topic role text | `Topics.AudienceDescription` | `Huddle.AudienceDescription` nullable | Overview/“Who is it for” | Awaiting client content |
| `todayObjective` | ZIP compatibility value is sometimes synthesized | `Topics.TodaysObjective` | `Huddle.TodayObjective` nullable | Overview/preview/export | Awaiting client content |
| `useCase` | no reliable dedicated ZIP field | `Topics.UseCase` | `Huddle.UseCase` nullable | Overview/export | Awaiting client content |
| `whyItMatters` | ZIP compatibility value may use key insight | `Topics.WhyItMatters` | `Huddle.WhyItMatters` nullable | Overview/preview/export | Awaiting client content |
| `desiredOutcome` | ZIP compatibility value may use phase/scenario outcome | `Topics.DesiredOutcome` | `Huddle.DesiredOutcome` nullable | cards/overview/export | Awaiting client content |
| `stepsToGetStarted[]` | deck `steps` | `Topics.StepsToGetStarted` | structured child rows preferred, or parsed ordered value during import | Overview/export | Awaiting client content |
| `keyTakeaway` | ZIP topic `keyInsight` | `Topics.KeyTakeaway` | `Huddle.KeyTakeaway` nullable | takeaway/preview/export | Awaiting client content |
| `reflectionPrompt` | deck reflect body; required questions | `Topics.ReflectPrompt` | `Huddle.ReflectionPrompt` nullable | Reflection | Awaiting client content |
| `commitmentPrompt` | takeaway/deck/required commitment | `Topics.CommitPrompt` | `Huddle.CommitmentPrompt` nullable | Commitment | Awaiting client content |

### 4.2 Segments, roles, paths, MCEM, phases, and activities

| Canonical/API field | ZIP source | Excel source | Proposed database property | UI consumer | Status |
|---|---|---|---|---|---|
| `segment.id/name` | role `segment` text | `Segments.SegmentID/SegmentName` | `Segment.Id/ExternalId/Name` | audience selector | Awaiting client content |
| `role.id/code/name` | role id/code/name | `Roles.RoleID/RoleCode/RoleName` | `Role.Id/ExternalId/Code/Name` | role selector | Confirmed schema; one role supplied |
| `segmentRole.displayName` | abbreviation/segment composition | `Segment_Roles.RoleDisplayName` | `SegmentRole.DisplayName` | audience display | Confirmed schema; orphan segment reference unresolved |
| `recommendedPath[].sequence` | placements/series position; V3 weeks | `Role_Paths.Sequence` | `RolePath.Sequence` | Weeks 2–8 roadmap | Confirmed relationship; rows absent |
| `recommendedPath[].recommendedWeek` | V3 fixed Weeks 2–8 | no dedicated workbook field | derive display week from approved sequence rule; do not store on Huddle | roadmap/export | Derived; rule needs approval |
| `mcemStages[].id/name/description` | MCEM stage data | `MCEM_Stages` columns | `McemStage.*` | detail/filters/export | Awaiting client content |
| `mcemStages[].displayOrder` | ZIP sequence/relation | `Topic_MCEM.DisplayOrder` | `HuddleMcemStage.DisplayOrder` | ordered labels | Confirmed relationship; rows absent |
| `phases[].id` | phase id | `Workflow_Phases.PhaseID` | `HuddlePhase.ExternalId` | session/preview | Awaiting client content |
| `phases[].name` | displayName | `Workflow_Phases.PhaseName` | `HuddlePhase.Name` | Huddle Flow | Awaiting client content |
| `phases[].description` | description | `Workflow_Phases.PhaseDescription` | `HuddlePhase.Description` nullable | Huddle Flow/session | Awaiting client content |
| `phases[].durationMinutes` | estimatedMinutes | `Workflow_Phases.PhaseDurationMinutes` | `HuddlePhase.DurationMinutes` nullable | duration display | Awaiting client content |
| `phases[].displayOrder` | sequence | `Workflow_Phases.PhaseOrder` | `HuddlePhase.DisplayOrder` | component order | Confirmed relationship; rows absent |
| `phases[].outcome` | ZIP phase outcome | no workbook column | nullable only if retained after client confirmation | phase preview | Temporary ZIP content; not a substitute for DesiredOutcome |
| `activities[].id` | practice/scenario/activity id | `Activities.ActivityID` | `HuddleActivity.ExternalId` | actions/progress | Awaiting client content |
| `activities[].name` | title | `Activities.ActivityName_JTBD` | `HuddleActivity.Name` | activity card | Awaiting client content |
| `activities[].description` | scenario/phase description | `Activities.ActivityDescription` | `HuddleActivity.Description` nullable | activity detail | Awaiting client content |
| `activities[].durationMinutes` | not consistently available | `Activities.ActivityDurationMinutes` | `HuddleActivity.DurationMinutes` nullable | session timing | Awaiting client content |
| `activities[].displayOrder` | relation display order | `Activities.ActivityOrder` | `HuddleActivity.DisplayOrder` | activity order | Confirmed relationship; rows absent |
| `activities[].prompt` | promptOrAction/prompt | `Activities.Prompt` | `HuddleActivity.Prompt` nullable | copy prompt/session/export | Awaiting client content |
| `activities[].expectedOutput` | expectedOutput | `Activities.ExpectedOutput` | `HuddleActivity.ExpectedOutput` nullable | session/export | Awaiting client content |
| `activities[].humanCheckpoint` | humanCheckpoint | `Activities.HumanCheckpoint` | `HuddleActivity.HumanCheckpoint` nullable | session/export | Awaiting client content |
| `activities[].requiredContext` | practice requiredContext | `Activities.RequiredContext` | `HuddleActivity.RequiredContext` nullable | activity detail | Awaiting client content |
| `activities[].bestFitJob` | practice bestFitJob | `Activities.BestFitJob` | `HuddleActivity.BestFitJob` nullable | activity detail/filter if required | Awaiting client content |

### 4.3 Agents, resources, and facilitator guide

| Canonical/API field | ZIP source | Excel source | Proposed database property | UI consumer | Status |
|---|---|---|---|---|---|
| `agents[].id/name` | tool id/name, scenario primaryAgent | `Agents.AgentID/AgentName` | `Agent.ExternalId/Name` | cards/session/resources | Awaiting client content |
| `agents[].shortDescription` | tool shortDescription | `Agents.AgentShortDescription` | `Agent.ShortDescription` nullable | agent card | Awaiting client content |
| `agents[].whatItIs` | deck/tool what-it-is | `Agents.WhatItIs` | `Agent.WhatItIs` nullable | Overview/export | Awaiting client content |
| `agents[].whatItHelpsYouDo` | deck/tool content | `Agents.WhatItHelpsYouDo` | `Agent.WhatItHelpsYouDo` nullable | Overview/export | Awaiting client content |
| `agents[].whenToUseIt` | deck/tool when-to-use | `Agents.WhenToUseIt` | `Agent.WhenToUseIt` nullable | Overview/export | Awaiting client content |
| `agents[].keyBenefits[]` | tool/deck benefits | `Agents.KeyBenefits` | child rows or parsed ordered values during import | benefits/export | Awaiting client content |
| `agents[].accessUrl/label` | launchUrl/accessText | `Agents.AccessURL/AccessLinkLabel` | `Agent.AccessUrl/AccessLinkLabel` nullable | Open tool | Awaiting client content |
| `agents.primary[]` | primary agent/tool | `Topic_Agents.UsageType=Primary` | `HuddleAgent.UsageType` | Overview/session | Confirmed relationship; rows absent |
| `agents.secondary[]` | secondary tools | `Topic_Agents.UsageType=Secondary` | `HuddleAgent.UsageType` | Overview/session | Confirmed relationship; rows absent |
| `activities[].agents[]` | scenario/tool compatibility fields | `Activity_Agents` | `HuddleActivityAgent` join | activity menu | Confirmed relationship; rows absent |
| relation display fields | ZIP tool names | DisplayLabel, ShowAgentAccessLink, DisplayOrder | properties on topic/activity agent joins | exact label/order/link visibility | Confirmed schema; rows absent |
| `topicResources[]` | topic resource relations/deck resources | `Topic_Resources` → `Resources` | `HuddleResource` join | Resources tab/export | Confirmed relationship; rows absent |
| `activities[].resources[]` | V3 activity resources | `Activity_Resources` → `Resources` | `HuddleActivityResource` join | activity menu | Confirmed relationship; rows absent |
| `agents[].resources[]` | ZIP support/resource URLs | `Agent_Resources` → `Resources` | `AgentResource` join | agent/resource view | Confirmed relationship; rows absent |
| resource fields | id/title/type/url/description | all `Resources` columns including LinkLabel | `Resource.ExternalId/Title/Description/Url/Type/LinkLabel` | resource cards/export | Awaiting client content |
| facilitator introduction | ZIP openingFrame | `Facilitator_Guide.SessionIntroduction` | `FacilitatorGuide.SessionIntroduction` nullable | Talk Track | Awaiting client content |
| facilitator talking points | ZIP listenFor/derived UI bullets | `Facilitator_Guide.KeyTalkingPoints` | structured child rows or parsed ordered value | Talk Track | Awaiting client content |
| facilitator questions | discussionQuestions | `Facilitator_Guide.DiscussionQuestions` | structured child rows or parsed ordered value | Talk Track | Awaiting client content |
| facilitator transitions | transitionCues | `Facilitator_Guide.SuggestedTransitions` | structured child rows or parsed ordered value | Talk Track | Awaiting client content |
| facilitator wrap-up | wrapUpCue | `Facilitator_Guide.WrapUpGuidance` | nullable scalar | Talk Track | Awaiting client content |

### 4.4 Progress, voting, presentation, and export fields

| API/UI field | ZIP source | Excel source | Proposed persistence | UI consumer | Status |
|---|---|---|---|---|---|
| `contentAvailability.*` | inferred from ZIP presence | none | response projection, not imported content | intentional unavailable states | Derived |
| selected Huddle/role/tab/filter/search/sort/page | Jotai/component state | none | no content table | catalog/navigation | UI-only |
| current phase/activity | localStorage session | none | future `HuddleProgress` | session/Continue Learning | Temporary ZIP behavior; persistence design later |
| completed activity ids | localStorage session | none | future `HuddleActivityProgress` | completion/menu/progress | Temporary ZIP behavior; persistence design later |
| notes and saved timestamp | localStorage session | none | future progress/note entities | Save Progress/export option | Temporary ZIP behavior; persistence design later |
| upvote/downvote | local vote store | none | future `HuddleVote`, one current vote/user/topic | voting/sort/count | Temporary ZIP behavior; persistence design later |
| downvote reasons/comment | local vote store | none | future vote feedback child/value | feedback dialog | Temporary ZIP behavior; taxonomy approval needed |
| vote counts | local aggregate | none | server aggregate projection | cards/sort | Derived |
| customized path/reset state | localStorage by role | none | future user path override | Recommended Path | Temporary ZIP behavior; persistence design later |
| display category labels/colors/icons/card dimensions | V3 components/classes | none | none | exact V3 presentation | UI-only |
| export title/agenda/week labels/section labels | exporter templates | none | none | PPT/HTML | UI-only/Derived |
| export content | legacy `SlideData`/`HuddleActivityData` | canonical fields above | adapter from `HuddleDetail`; never separate source of truth | PPT/HTML/preview | Derived |

## 5. Canonical Huddle contract

The API contract uses camelCase JSON and explicit nullability. Collections are always arrays.

```ts
type HuddleType = 'foundation' | 'prescriptive' | 'selfService';
type PublicationStatus =
  | 'workingDraft' | 'inReview' | 'smeReviewed'
  | 'productValidated' | 'published' | 'retired';

interface HuddleDetail {
  identity: {
    id: string;
    externalId: string;
    name: string;
    description: string | null;
    type: HuddleType;
    publicationStatus: PublicationStatus;
  };
  catalog: {
    focusArea: ReferenceItem | null;
    durationMinutes: number | null;
    recommendationPriority: number | null;
  };
  audience: {
    roles: AudienceRole[];
    audienceDescription: string | null;
  };
  narrative: {
    todayObjective: string | null;
    useCase: string | null;
    whyItMatters: string | null;
    desiredOutcome: string | null;
    stepsToGetStarted: string[];
  };
  mcemStages: OrderedReferenceItem[];
  agents: {
    primary: HuddleAgent[];
    secondary: HuddleAgent[];
  };
  phases: HuddlePhase[];
  facilitatorGuide: FacilitatorGuide | null;
  topicResources: HuddleResource[];
  reflectionPrompt: string | null;
  commitmentPrompt: string | null;
  keyTakeaway: string | null;
  contentAvailability: ContentAvailability;
}

interface HuddlePhase {
  id: string;
  externalId: string;
  name: string;
  description: string | null;
  durationMinutes: number | null;
  displayOrder: number;
  activities: HuddleActivity[];
}

interface HuddleActivity {
  id: string;
  externalId: string;
  name: string;
  description: string | null;
  durationMinutes: number | null;
  displayOrder: number;
  prompt: string | null;
  expectedOutput: string | null;
  humanCheckpoint: string | null;
  requiredContext: string | null;
  bestFitJob: string | null;
  agents: HuddleAgent[];
  resources: HuddleResource[];
}

interface HuddleAgent {
  id: string;
  externalId: string;
  name: string;
  shortDescription: string | null;
  whatItIs: string | null;
  whatItHelpsYouDo: string | null;
  whenToUseIt: string | null;
  keyBenefits: string[];
  displayLabel: string | null;
  showAccessLink: boolean;
  accessUrl: string | null;
  accessLinkLabel: string | null;
  displayOrder: number;
  resources: HuddleResource[];
}

interface HuddleResource {
  id: string;
  externalId: string;
  title: string;
  description: string | null;
  url: string | null;
  type: string | null;
  linkLabel: string | null;
  displayOrder: number;
}

interface FacilitatorGuide {
  sessionIntroduction: string | null;
  keyTalkingPoints: string[];
  discussionQuestions: string[];
  suggestedTransitions: string[];
  wrapUpGuidance: string | null;
}

interface ContentAvailability {
  narrativeComplete: boolean;
  facilitatorGuideAvailable: boolean;
  phasesAvailable: boolean;
  activitiesAvailable: boolean;
  agentsAvailable: boolean;
  resourcesAvailable: boolean;
  reflectionAvailable: boolean;
  commitmentAvailable: boolean;
  missingFields: string[];
}
```

`ReferenceItem`, `OrderedReferenceItem`, and `AudienceRole` contain stable ids and display names; ordered items additionally contain `displayOrder`. The contract deliberately excludes votes, progress, path customization, filters, tabs, and exports because those are separate user-state or presentation contracts.

### Required response rules

- Optional scalar content: `null`, never an invented fallback.
- Missing relationship/content list: `[]`, never `null`.
- `contentAvailability.missingFields` uses canonical paths such as `narrative.desiredOutcome`.
- Empty optional sections render the V3 component’s intentional unavailable/empty state.
- API mapping may normalize whitespace-only workbook cells to null; whitespace-only relationship rows are rejected.
- `type` and `publicationStatus` must be validated enums, not arbitrary display labels.

## 6. Semantic prohibitions

The following V3 compatibility behavior must not survive into persistent mapping:

- Do not populate `todayObjective` from facilitator opening text, a phase description, or generated copy.
- Do not populate `whyItMatters` from `KeyInsight`, `KeyTakeaway`, description, or generated copy.
- Do not populate `desiredOutcome` from a phase outcome, expected output, bring-back evidence, or description.
- Do not populate `useCase` from “when to use it” or another agent field.
- Do not populate `stepsToGetStarted` from arbitrary activities unless the client explicitly changes the schema.
- Do not populate activity `bestFitJob` from the activity title/JTBD.
- Do not populate activity `requiredContext` from its description, prompt, or checkpoint.
- Do not populate `keyTakeaway` from `whyItMatters` or vice versa.
- Do not use deck `resource1/2` fields as canonical storage; map resources through the Resource joins.
- Do not treat recommended week as a Topic attribute.

## 7. Missing-data report

### Blocking content gaps

1. Topics is empty, so no canonical Huddle can currently be imported from the workbook.
2. Segments is empty, and the supplied Segment_Role references `SEG-ENT`, which does not exist.
3. Role_Paths is empty, so the role-specific seven-week Recommended Path has no client-confirmed source.
4. Focus areas, MCEM stages/links, phases, activities, facilitator guides, agents/links, and resources/links are empty.
5. Every newly requested semantic field—objective, use case, why it matters, desired outcome, steps, reflection, commitment, takeaway, best-fit job, and required context—has a schema column but no client content.

### Schema decisions still missing

- `PublicationStatus` and `RecommendationPriority` are used by V3 but absent from the workbook.
- V3 uses a seven-item Weeks 2–8 path; workbook has `Sequence` but no week. Confirm whether `recommendedWeek = sequence + 1` is universally valid.
- Confirm allowed `HuddleType` values/casing and whether “Self-Service” means Evergreen.
- Confirm whether a Huddle can have audience roles outside Role_Paths and, if so, add a dedicated Topic_Roles sheet/relationship.
- Confirm delimiter/format for workbook list cells (`StepsToGetStarted`, benefits, facilitator lists). Preferred target is normalized ordered child rows.
- Confirm whether ZIP phase `Outcome` remains a distinct field; it cannot replace topic DesiredOutcome.
- Confirm publication/recommendation values for the temporary ZIP content before it is exposed as published.
- Confirm persistent scope and retention rules for progress, notes, votes, feedback, and path customization.

### Temporary ZIP content allowed after approval

ZIP values can seed exact matching fields only, marked with source/provenance and temporary status. Any ZIP record lacking an exact semantic value imports null/empty for that field. A later client import must be able to replace temporary values by stable ExternalId without changing UI contracts.

## 8. Proposed database design input

This is design input, not authorization to create a migration.

### Catalog/content tables

- `Huddles`: identity, type, publication state, focus area FK, duration, priority, audience/narrative/takeaway/reflection/commitment scalars, source/provenance.
- `Segments`, `Roles`, `SegmentRoles`, `RolePaths`.
- `FocusAreas`, `McemStages`, `HuddleMcemStages`.
- `HuddlePhases`, `HuddleActivities`.
- `FacilitatorGuides` plus ordered child tables for talking points, questions, and transitions if workbook import format supports it.
- `Agents`, `HuddleAgents`, `HuddleActivityAgents`.
- `Resources`, `AgentResources`, `HuddleResources`, `HuddleActivityResources`.
- Ordered child table for `StepsToGetStarted`; optionally for agent benefits.

All imported business entities need a unique stable `ExternalId`. Join tables need unique composite constraints and positive display-order constraints. Deleting reference content should be restricted where it would orphan published Huddles. SQL names and audit fields must follow existing repository conventions when implementation begins.

### Separate future user-state tables

Progress, notes, votes/feedback, and path overrides must not be columns on Huddles. They belong to authenticated user-scoped aggregates and require separate approval/vertical slices.

### Import validation gates

- Reject duplicate external ids, dangling foreign keys, duplicate order values within a parent, invalid enum text, non-positive durations, and whitespace-only ids.
- Report missing optional semantic content; do not fail solely because an optional field is null.
- Require name/type/external id and valid parent relationships for importable Huddles.
- Preserve source and import batch/version so temporary ZIP content is distinguishable from client-confirmed workbook content.

## 9. Approval checklist

Before a database migration is created, approve:

- [ ] Canonical `HuddleDetail` shape and null/empty rules.
- [ ] Huddle type vocabulary and publication workflow.
- [ ] Recommended week derivation and path semantics.
- [ ] Role audience semantics beyond recommended paths.
- [ ] Ordered-list import representation.
- [ ] Treatment of ZIP phase outcome and other ZIP-only content.
- [ ] Temporary ZIP seeding/provenance policy.
- [ ] Progress, vote, and path customization boundaries for later phases.
- [ ] Client supplies or explicitly waives the workbook content gaps listed above.

Part 9 is complete when this matrix is approved and each visible Huddle field is either mapped to its exact semantic source or intentionally represented as unavailable. Approval permits database design implementation; it does not authorize Workflow changes or Workflow Sharing.
