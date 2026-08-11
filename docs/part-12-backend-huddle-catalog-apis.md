# Part 12 - Backend Huddle Catalog APIs

## Purpose

Part 12 exposes the SQL-backed Huddle catalog through authenticated ASP.NET Core APIs.

The implementation follows the same Clean Architecture and MediatR vertical-slice approach used by the existing Workflow module.

No Workflow functionality, Workflow Sharing functionality, frontend code, or database schema was changed in this phase.

## Architecture

The request flow is:

```text
Authenticated HTTP request
    → HuddlesController
    → MediatR query
    → FluentValidation validator
    → Application query handler
    → IApplicationDbContext
    → EF Core Huddle entities
    → SQL Server
    → HuddleMappings
    → API response contract
```

Responsibilities remain separated:

| Layer | Responsibility |
|---|---|
| API | Routing, authorization, HTTP status metadata, and sending MediatR requests |
| Application | Validation, participant visibility rules, filtering, ordering, database queries, and mapping orchestration |
| Contracts | Public request and response shapes |
| Domain | Huddle entities and relationships |
| Infrastructure | EF Core implementation of `IApplicationDbContext` and SQL Server access |

## Files and folders

### API controller

```text
AitoWorkflowAndHuddleGenerator.Api/
└── Controllers/
    └── HuddlesController.cs
```

### Application vertical slices

```text
AitoWorkflowAndHuddleGenerator.Application/
└── Features/
    └── Huddles/
        └── Catalog/
            ├── Common/
            │   └── HuddleMappings.cs
            └── Queries/
                ├── GetHuddleCatalog/
                │   ├── GetHuddleCatalogQuery.cs
                │   ├── GetHuddleCatalogQueryHandler.cs
                │   └── GetHuddleCatalogQueryValidator.cs
                ├── GetHuddleById/
                │   ├── GetHuddleByIdQuery.cs
                │   ├── GetHuddleByIdQueryHandler.cs
                │   └── GetHuddleByIdQueryValidator.cs
                └── GetRecommendedPath/
                    ├── GetRecommendedPathQuery.cs
                    ├── GetRecommendedPathQueryHandler.cs
                    └── GetRecommendedPathQueryValidator.cs
```

Every query, handler, and validator has its own file.

### API contracts

```text
AitoWorkflowAndHuddleGenerator.Contracts/
└── Huddles/
    ├── HuddleCatalogFilterRequest.cs
    ├── HuddleCatalogItemResponse.cs
    ├── HuddleDetailResponse.cs
    ├── HuddleRoleResponse.cs
    ├── HuddleMcemStageResponse.cs
    ├── HuddlePhaseResponse.cs
    ├── HuddleActivityResponse.cs
    ├── HuddleAgentResponse.cs
    ├── HuddleResourceResponse.cs
    ├── HuddleFacilitatorGuideResponse.cs
    ├── HuddleContentAvailabilityResponse.cs
    ├── RecommendedHuddlePathItemResponse.cs
    └── RecommendedHuddlePathResponse.cs
```

Every contract has its own file.

## Authentication and authorization

The controller uses the existing authenticated API policy:

```csharp
[Authorize(Policy = Policies.AccessAsUser)]
```

This applies to all Huddle catalog endpoints.

Expected authentication responses are:

| Situation | Response |
|---|---:|
| Missing or invalid authentication | 401 |
| Authenticated user without the required policy | 403 |
| Valid authenticated participant | Endpoint-specific response |

No separate Huddle authentication mechanism was introduced.

## Endpoint 1: Huddle catalog

```http
GET /api/huddles
```

### Purpose

Returns participant-visible Huddle catalog cards.

Only topics with this status are returned:

```text
PublicationStatus == "Published"
```

`WorkingDraft`, review, retired, or other non-published topics are not exposed through the normal participant catalog.

### Query parameters

| Parameter | Purpose |
|---|---|
| `roleExternalId` | Returns topics related to the specified Role |
| `focusAreaExternalId` | Filters by Huddle focus area |
| `agentExternalId` | Filters by topic-level or activity-level agent |
| `type` | Filters by Huddle type, including Foundation or Prescriptive values stored in SQL |
| `search` | Searches topic name and description |
| `sort` | Controls catalog ordering |

Example:

```http
GET /api/huddles?roleExternalId=ae-ent&focusAreaExternalId=focus-pipeline&agentExternalId=m365-copilot&type=Prescriptive&search=pipeline&sort=priority
```

### Supported sort values

| Value | Behavior |
|---|---|
| `default` | Recommendation priority, then name |
| `name` | Alphabetical by topic name |
| `priority` | Recommendation priority, then name |
| `most-upvoted` | Net upvotes descending, then name |
| `role-relevance` | Governed Role Path position for the supplied role, then name |

Unknown sort values fail FluentValidation and return HTTP 400 through the existing exception middleware.

### Agent filtering

Agent filtering considers both:

- `HuddleTopicAgents`
- `HuddleActivityAgents`

This allows a Huddle to match when an agent is attached directly to the topic or used by one of its activities.

### Catalog response

Each `HuddleCatalogItemResponse` includes:

- External ID
- Name
- Description
- Huddle type
- Focus-area identity and name
- Duration
- Recommendation priority
- Desired outcome
- Audience Roles
- Primary agents
- Secondary agents

Missing optional content remains `null` or an empty collection.

## Endpoint 2: Huddle detail

```http
GET /api/huddles/{externalId}
```

Example:

```http
GET /api/huddles/WF-PIPE-01
```

### Purpose

Returns all persistent content required to reconstruct a generated Huddle experience.

The handler loads the topic through its stable external ID. Generated numeric database IDs are not exposed as the lookup contract.

The endpoint returns only published topics. A missing or non-published topic produces HTTP 404.

### Detail response contents

`HuddleDetailResponse` includes:

```text
Huddle detail
├── Identity
│   ├── External ID
│   ├── Name
│   ├── Description
│   ├── Type
│   └── Publication status
├── Catalog
│   ├── Focus area
│   ├── Duration
│   └── Recommendation priority
├── Audience Roles
├── Audience description
├── Narrative
│   ├── Today objective
│   ├── Use case
│   ├── Why it matters
│   ├── Desired outcome
│   └── Steps to get started
├── MCEM stages
├── Primary agents
├── Secondary agents
├── Huddle Flow phases
│   └── Activities
│       ├── Prompt
│       ├── Expected output
│       ├── Human checkpoint
│       ├── Required context
│       ├── Best-fit job
│       ├── Agents
│       └── Resources
├── Facilitator guide
├── Topic resources
├── Agent resources
├── Reflection prompt
├── Commitment prompt
├── Key takeaway
└── Content availability
```

### Relationship loading

The handler reconstructs relationships from:

- `HuddleTopicRoles`
- `HuddleTopicMcemStages`
- `HuddleTopicAgents`
- `HuddlePhases`
- `HuddleActivities`
- `HuddleActivityAgents`
- `HuddleTopicResources`
- `HuddleActivityResources`
- `HuddleAgentResources`
- `HuddleFacilitatorGuides`

The API does not depend on frontend in-memory Huddle data.

## Semantic null handling

No compatibility fallback is used for missing semantic fields.

Examples:

- `TodayObjective` is not populated from facilitator guidance.
- `WhyItMatters` is not populated from Key Insight or Key Takeaway.
- `DesiredOutcome` is not populated from phase outcome or activity expected output.
- `BestFitJob` is not populated from activity name.
- `RequiredContext` is not populated from activity description or prompt.

Missing scalar content remains `null`.

Missing relationships and list content return `[]`.

## Content availability

The detail response contains `HuddleContentAvailabilityResponse`.

It reports:

- Whether the narrative is complete
- Whether facilitator guidance exists
- Whether phases exist
- Whether activities exist
- Whether agents exist
- Whether resources exist
- Whether reflection exists
- Whether commitment exists
- Canonical missing-field paths

Example missing-field paths:

```json
[
  "narrative.todayObjective",
  "narrative.useCase",
  "narrative.whyItMatters",
  "narrative.desiredOutcome",
  "reflectionPrompt",
  "commitmentPrompt",
  "keyTakeaway"
]
```

The frontend can use this metadata to display an intentional unavailable state without substituting unrelated content.

## Stored list parsing

Some Part 10 fields currently store ordered list content as strings, including:

- Agent key benefits
- Steps to get started
- Facilitator talking points
- Facilitator discussion questions
- Facilitator transitions

`HuddleMappings` converts valid JSON arrays into API arrays.

If a stored value is not JSON, it is treated as newline-separated content. Empty values return `[]`.

This parsing does not create or infer semantic content.

## Endpoint 3: Recommended Path

```http
GET /api/huddles/recommended-path?roleExternalId={role}
```

Example:

```http
GET /api/huddles/recommended-path?roleExternalId=ae-ent
```

### Role validation

The handler resolves the Role through `Roles.ExternalId` and requires it to be active.

Unknown or inactive Roles produce HTTP 404.

The endpoint does not guess using Role name or abbreviation.

### Path source

The endpoint reads governed ordering from:

```text
HuddleRolePathItems
    → HuddleSegmentRole
    → existing Role
    → HuddleTopic
```

Only published topics are eligible.

### Seven-Huddle rule

The handler:

1. Orders path records by stored `WeekPosition`.
2. Removes duplicate Huddle topics while preserving the first governed occurrence.
3. Selects the first seven unique published topics.
4. Maps them to displayed Weeks 6 through 12.
5. Includes primary and secondary topic agents.

When seven topics exist:

```json
{
  "isComplete": true,
  "configurationMessage": null,
  "items": [
    { "week": 6, "pathOrder": 1 },
    { "week": 7, "pathOrder": 2 },
    { "week": 8, "pathOrder": 3 },
    { "week": 9, "pathOrder": 4 },
    { "week": 10, "pathOrder": 5 },
    { "week": 11, "pathOrder": 6 },
    { "week": 12, "pathOrder": 7 }
  ]
}
```

When fewer than seven eligible topics exist, the endpoint still returns HTTP 200 with the available ordered items:

```json
{
  "isComplete": false,
  "configurationMessage": "Recommended Path requires seven unique published Huddles, but only 3 eligible Huddles are configured for role 'ae-ent'."
}
```

This is treated as a catalog-configuration condition, not an unexpected server failure.

## FluentValidation rules

Validators enforce:

- Required external IDs where applicable
- Maximum external-ID length of 100 characters
- Maximum search length of 250 characters
- Maximum Huddle type length of 50 characters
- Supported catalog sort values

Validation failures flow through the existing validation behavior and exception middleware.

## Error behavior

| Condition | Expected status |
|---|---:|
| Invalid query input | 400 |
| Missing authentication | 401 |
| Forbidden access | 403 |
| Unknown/non-published Huddle | 404 |
| Unknown/inactive Recommended Path Role | 404 |
| Fewer than seven path topics | 200 with `IsComplete = false` |
| Unexpected server/database failure | 500 |

## Tests

An EF Core InMemory provider was added to the integration-test project. It allows handlers and relationship mappings to be tested without connecting to the development SQL Server.

Tests cover:

- Controller authorization policy
- Role filtering
- Focus-area filtering
- Agent filtering
- Huddle type filtering
- Search
- Published-only filtering
- Missing optional semantic content
- Content-availability reporting
- Draft and missing Huddle behavior
- Phase and activity reconstruction
- Activity-resource relationships
- Agent-resource relationships
- Active Role validation
- Recommended Path ordering
- Recommended Path uniqueness
- Weeks 6–12 mapping
- Seven-item completeness
- Incomplete configuration messages

Current results:

```text
Backend build: passed
Unit tests: 10 passed
Integration tests: 22 passed
```

## Database changes

Part 12 creates no new database migration and makes no database schema changes.

It reads the Huddle tables introduced in Part 10.

Before manually testing the APIs:

1. Apply the Part 10 Huddle migration.
2. Run the Part 11 scripts in the documented order.
3. Review the imported data.
4. Change approved topics from `WorkingDraft` to `Published`.
5. Start the API with valid authentication configuration.

## Important publication behavior

Part 11 currently seeds topics as `WorkingDraft`.

Therefore, these participant endpoints return no seeded topics until approved records are published:

```http
GET /api/huddles
GET /api/huddles/{externalId}
GET /api/huddles/recommended-path
```

This behavior is intentional and prevents incomplete or unapproved content from appearing to participants.

## Existing work preserved

Part 12 did not modify:

- Workflow Builder
- Saved Workflows
- Workflow APIs
- Workflow entities
- Workflow Sharing
- Frontend UI
- Huddle V3 styling
- Part 10 schema
- Part 11 seed scripts
- Existing authentication architecture

## Remaining work

- Execute the Part 10 migration in the intended SQL Server environment.
- Execute and verify Part 11 scripts manually in SSMS.
- Resolve Foundation audience value `roleIds: ['all']` with an approved Role/audience rule.
- Supply missing client semantic content.
- Approve and publish participant-visible topics.
- Perform an authenticated API smoke test against the migrated SQL Server database.
- Implement frontend Huddle API functions and React Query hooks in a later vertical slice.
