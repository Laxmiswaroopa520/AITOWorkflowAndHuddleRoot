# Part 8 baseline and Huddle scope freeze

## Scope

Part 8 establishes the safe baseline for the future Huddle implementation. It does not implement Huddle features and does not authorize Workflow Sharing.

## Repository baseline

### Backend

- .NET 9 solution with API, Application, Contracts, Domain, Infrastructure, UnitTests and IntegrationTests projects.
- ASP.NET Core controllers dispatch MediatR commands and queries.
- FluentValidation runs through a MediatR pipeline behavior.
- EF Core uses SQL Server through `ApplicationDbContext`.
- The current schema is represented by the single `InitialCreate` migration.
- Entra JWT bearer authentication and the delegated `access_as_user` scope protect application APIs.
- Workflow ownership is derived from the authenticated `oid` claim.

### Frontend

- React 19, TypeScript and Vite.
- React Query owns API/server state.
- Jotai owns temporary Workflow Builder state.
- MSAL handles sign-in and access-token acquisition.
- The centralized API client attaches the bearer token.
- Protected routes are `/workflow` and `/workflows`.
- `/diagnostics` is public and `/reference-data-diagnostics` is protected.

### Existing APIs

- `GET /api/auth/me`
- `GET /api/roles`
- `GET /api/ai-tools`
- `GET /api/workflow-buckets`
- `GET /api/activities`
- `GET /api/activities/{id}`
- `GET /api/activities/by-role/{roleExternalId}`
- `GET /api/workflows`
- `GET /api/workflows/favorites`
- `GET /api/workflows/{id}`
- `POST /api/workflows`
- `PUT /api/workflows/{id}`
- `DELETE /api/workflows/{id}`
- `PATCH /api/workflows/{id}/favorite`

## Shared-infrastructure stabilization

Part 8 makes only these shared changes:

1. The frontend `ApiClient` supports authenticated `PATCH` requests.
2. `post`, `put` and `patch` use the same response-first generic convention used by the feature API functions.
3. Backend exception middleware maps expected exceptions to HTTP Problem Details:
   - validation → 400
   - missing authentication/user claims → 401
   - forbidden access → 403
   - missing resources → 404
   - application or EF concurrency conflicts → 409
   - unexpected exceptions → sanitized 500
4. Integration tests protect this status-code behavior.

These changes are transport/error-handling corrections. They do not alter Workflow presentation or business behavior.

## Huddle source priority

Use this order whenever Huddle sources conflict:

1. `AITO_Huddle_Enhancements_V3.zip` — exact UI, labels, colors, dimensions, component order, menus, interactions, responsive behavior and current temporary content.
2. `Frontier_Accelerator_App_Content_Integration_Model_V2_Final.xlsx` — target normalized data schema and future client-supplied content.
3. Current repository — application architecture, authentication, API client, SQL/EF conventions and shared infrastructure.
4. Previous project documents — historical guidance only.

Generated `node_modules` and `dist` content from the ZIP are never implementation sources. The ZIP's Workflow implementation must not be copied.

## Missing-content rule

Fields awaiting client content remain `null` or empty. A UI slot may consume only its matching semantic field. In particular, Outcome, Objective, BestFitJob and RequiredContext must not be populated from KeyInsight, KeyTakeaway, descriptions or another unrelated field.

## Exact Huddle V3 screen and state inventory

### Huddle orientation and navigation

- Huddle orientation/onboarding page.
- Recommended Path entry.
- Huddle navigation mode indicator using Microsoft blue.
- Audience/persona selection and completed selection state.

### Foundation/Required Huddles

- Foundation card collection.
- Required Researcher Huddle.
- Required Sales Agent Huddle.
- Required Cowork Huddle.
- Required Scout Huddle.
- Required Agent J Huddle.
- Cards display primary and secondary AI tools separately.
- Required labels, duration, activity count, role/audience and access information.

### Recommended Path

- Audience selector shown before the roadmap.
- Compact path summary.
- Seven roadmap cards for Weeks 6–12.
- Default and customized states.
- Hover and selected states.
- Upvote and downvote states.
- Three-dot management menu.
- Move Up, Move Down and direct Move to Week actions.
- Replace Huddle selection.
- Reset a week and Reset to Recommended.
- Standalone Learning Plan HTML export.

### Evergreen Library

- Filter order: Audience, Focus Area, AI Tool, Sort and Search.
- Default, hover, selected/radio and details states.
- Upvote and downvote states.
- Primary and secondary tools always visible.
- Continue Learning card when incomplete saved progress exists.

### Generated Huddle

- Thirty-minute Huddle header.
- Talk Track action and right-side modal.
- Save Progress action.
- Meet with a Coach first in the right sidebar.
- Overview workspace.
- Resources workspace.
- Huddle Flow with ordered phases and activities.
- Activity default, complete and incomplete states.
- Activity three-dot menu: complete/incomplete, copy prompt, open AI tool and view resources.
- Central categorized resources and activity-specific resources.
- Reflection and commitment content.

### Talk Track

- Session introduction.
- Talking points.
- Discussion questions.
- Suggested transitions.
- Wrap-up guidance.
- AI-assistance actions.

### Progress and continuation

- Saved completed activities.
- Facilitator notes.
- Current phase.
- Last-saved timestamp.
- Restored incomplete session.
- Continue Learning state.

### Coach flow

- Coach list/cards.
- Availability step.
- Time-zone selection.
- Booking review.
- Booking confirmation presentation.

Mock availability is not approved production data.

### Preview and exports

- Preview slides.
- PowerPoint export.
- Full interactive Huddle HTML export.
- Standalone Learning Plan HTML export.
- Copy-prompt and collapsible HTML interactions.

## Scope freeze

- No Huddle database entity, API, route or frontend feature is introduced in Part 8.
- No Workflow Sharing implementation is introduced.
- Workflow UI files must not be visually modified.
- Future Huddle changes must be additive vertical slices.

## Verification results

Executed on 2026-08-09:

- Backend solution build: passed with 0 errors and 2 existing NuGet pruning warnings.
- Backend unit tests: 6 passed, 0 failed.
- Backend integration tests: 7 passed, 0 failed.
- Frontend TypeScript and production build: passed.
- Frontend production bundle: generated successfully with one bundle-size warning.
- Frontend lint: 7 existing rule violations remain in authentication/shared UI and Workflow state-effect code. They do not block the production build and were not broadly refactored in Part 8 because of the Workflow scope freeze.
- Git whitespace validation: passed after Part 8 cleanup.

The build created normal ignored `bin`, `obj` and `dist` artifacts. No database migration or Huddle implementation artifact was created.
