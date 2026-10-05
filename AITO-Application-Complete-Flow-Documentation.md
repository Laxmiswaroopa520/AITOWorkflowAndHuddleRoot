# AITO Application — Complete Flow Documentation

**How the Frontier Accelerator Huddle Application actually works, traced from the real source code.**

This document explains the whole application — front to back, click to database and back — in plain English. It was written by reading the actual project files (not by guessing from file names), so every claim below is based on real code. Where something could not be fully confirmed by reading the code, it is marked clearly:

> **Could not completely trace from the current source code.**

This document does not modify any code. It is a read-only explanation of what already exists.

---

## Table of Contents

1. App Summary
2. Project Structure
3. Frontend Technologies
4. Backend Technologies
5. Complete Frontend Flow
6. Frontend → Backend Communication (Traced Examples)
7. Important User Flows (Traced End-to-End)
8. Backend Request Flow (Endpoint Table)
9. Database Flow
10. CQRS / MediatR Explained
11. Authentication & Authorization
12. React State Management
13. Important File-by-File Summary
14. File-to-File Flow Maps
15. API Reference
16. Data Flow Explanation (by Data Type)
17. HTML Export Flow
18. Error Handling
19. Configuration
20. Azure / Deployment Flow
21. How the Whole Application Works (Plain Explanation)
22. How to Explain This Application to a Superior
23. Likely Questions from a Superior, and Simple Answers
24. Glossary
25. Final Architecture Diagram

---

## Part 1 — App Summary

**What is it?**
This application is internally called "AITO Workflow" and also "Frontier Accelerator." It is a web application that helps salespeople and other roles do two main things:

1. **Build a "Workflow"** — a personalized daily/weekly schedule made of recommended activities (tasks), grouped into time-of-day buckets, based on the user's job role. Users can save these workflows, favorite them, and push the scheduled activities straight into their Outlook calendar.
2. **Go through "Huddles"** — short guided learning sessions (a "Huddle" is like a structured mini-training topic) that walk a user through phases (for example: Prepare, Explore/Practice, Commit), with facilitator guidance, AI-agent recommendations, and supporting resources. Huddles can be followed as a guided week-by-week "Role Path" (a recommended 7-week learning path for a role) or browsed freely as "All Topics" (the full catalog). Completed Huddles can be exported as a shareable HTML guide or a PowerPoint deck. Managers can also plan and announce a team-wide Huddle rollout ("Launch Planner") and book one-on-one coaching sessions for their team.

**Where is it?**
The whole system lives in one repository, with a `frontend/` folder (the website users see), a `backend/` folder (the .NET server that the website talks to), and a `database/` folder (SQL scripts that set up and seed a fresh SQL Server database).

**Why is it used?**
It exists to make onboarding and skill-building structured and trackable — instead of a new hire guessing what to do first, the app tells them (Workflow) and teaches them (Huddle), while giving managers visibility into rollout and coaching.

**How does it work (high level)?**
A user signs in with their Microsoft work account (Entra ID / Azure AD, via MSAL). The React website then calls a .NET Web API over HTTPS, sending a bearer token with every request. The API validates that token, looks up or saves data in a SQL Server database using Entity Framework Core, and sends JSON back. Some features (booking a coach, creating a calendar event, drafting a launch email) also call Microsoft Graph on the user's behalf, so those actions actually create real Outlook calendar events or draft emails in the signed-in user's own mailbox.

**Example from this application:** When a user clicks a activity checkbox inside a Huddle session, the browser calls `PUT /api/huddles/{externalId}/session/activities/{activityExternalId}`, the backend's `SetHuddleActivityCompletionCommandHandler` updates the database, and the browser's on-screen progress bar updates from the response — no page reload.

---

## Part 2 — Project Structure

At the repository root:

```
AITO-Recovered/
├── frontend/
│   └── aito-workflow-and-huddle-generator-frontend/
│       └── src/
│           ├── app/            (app shell: router, providers, query client)
│           ├── auth/           (MSAL sign-in, tokens, protected routes)
│           ├── api/            (shared fetch client, endpoint URL constants)
│           ├── components/     (shared layout + generic UI building blocks)
│           ├── features/
│           │   ├── home/               (mode selector / landing)
│           │   ├── huddle/             (the entire Huddle experience)
│           │   ├── workflow-builder/   (the entire Workflow builder wizard)
│           │   ├── saved-workflows/    (list/manage saved workflows)
│           │   └── manager/            (manager dashboard)
│           └── lib/             (small shared utilities)
├── backend/
│   └── AitoWorkflowAndHuddleGenerator/
│       ├── AitoWorkflowAndHuddleGenerator.Api/             (controllers, auth wiring, middleware — the "front door")
│       ├── AitoWorkflowAndHuddleGenerator.Application/     (CQRS commands/queries/handlers — the "business logic")
│       ├── AitoWorkflowAndHuddleGenerator.Domain/          (entities — the "nouns" of the system, e.g. HuddleTopic, Role)
│       ├── AitoWorkflowAndHuddleGenerator.Infrastructure/  (EF Core DbContext, Microsoft Graph services, configuration)
│       ├── AitoWorkflowAndHuddleGenerator.Contracts/       (DTOs — the shapes of data sent over the API)
│       └── AitoWorkflowAndHuddleGenerator.IntegrationTests/
└── database/
    └── fresh-install-v11.78/    (the current, client-deliverable set of SQL Server setup/seed scripts)
```

**Why is it structured this way?**
The backend follows a pattern called **Clean Architecture**. The idea is that the "core" of the app (Domain and Application) should not depend on outer, more technical layers (Api, Infrastructure). This makes the business rules easier to test and change without being tangled up with, say, how the database is implemented. The dependency direction is:

```
Api  ──depends on──▶  Application  ──depends on──▶  Domain
Infrastructure ──depends on──▶  Application, Domain
Contracts ──depends on nothing (pure data shapes)
```

The frontend is organized by **feature folders** (`features/huddle`, `features/workflow-builder`, etc.), each with its own `pages/`, `components/`, `hooks/`, `api/`, and sometimes `store/` and `types/` subfolders — so everything related to one part of the product lives together.

---

## Part 3 — Frontend Technologies

| Technology | Version | What it is used for |
|---|---|---|
| **React** | 19.2.7 | The UI library — builds the whole website out of reusable components. |
| **TypeScript** | 6.0.2 | Adds type-checking to JavaScript, so many mistakes are caught before the code even runs. |
| **Vite** | build tool | Compiles and bundles the frontend; provides the fast local dev server. |
| **Tailwind CSS** | 4.3.3 | A utility-first CSS framework — styling is written directly as class names (e.g. `flex items-center gap-3`) instead of separate CSS files. |
| **TanStack React Query** | 5.101.4 | Manages all data fetched from the backend API — caching, background refetching, loading/error states. Configured globally with `staleTime: 30s`, `gcTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`. |
| **Jotai** | 2.20.2 | A small state-management library using "atoms" (individual pieces of shared state) instead of one big global store. Used without an explicit `<Provider>` — it uses Jotai's implicit default store. |
| **react-router** | 8.3.0 | Client-side routing — lets the app switch pages (Huddle, Workflow, Saved Workflows, etc.) without a full page reload. |
| **@azure/msal-browser / msal-react** | 5.x | Handles Microsoft Entra ID (formerly Azure AD) sign-in and token acquisition in the browser. |
| **pptxgenjs** | — | Generates PowerPoint files entirely inside the browser (no server involvement) when a user exports a Huddle. |

**Why these choices matter for understanding the app:** React Query means "data from the server" and "local UI state" are handled very differently in this codebase — anything coming from `/api/...` almost always goes through a React Query hook (`useXyz`), not through Jotai. Jotai is reserved for things like wizard step state, selected role, and UI toggles that don't come from the server.

---

## Part 4 — Backend Technologies

| Technology | What it is used for |
|---|---|
| **.NET 9** | The runtime and framework the backend server is built on. |
| **ASP.NET Core Web API** | Exposes the HTTP endpoints (Controllers) the frontend calls. |
| **MediatR** | Implements the CQRS pattern — every controller action creates a "Command" or "Query" object and hands it to MediatR, which routes it to exactly one matching handler class. |
| **FluentValidation** | Validates incoming Commands/Queries before their handler runs, via a single shared MediatR pipeline behavior (`ValidationBehavior<TRequest,TResponse>`). |
| **Entity Framework Core 9** | The Object-Relational Mapper (ORM) that turns C# code into SQL Server queries, and SQL Server rows back into C# objects. |
| **SQL Server** | The relational database that stores everything — roles, activities, Huddle content, and each user's saved plans/workflows/sessions. |
| **Microsoft.Identity.Web** | Validates the Microsoft Entra ID JWT bearer tokens sent by the frontend, and also helps acquire tokens to call Microsoft Graph on the user's behalf. |
| **Microsoft Graph (REST, hand-rolled HttpClient)** | Used for three things: booking coach meetings, pushing workflow activities to Outlook calendar, and creating draft launch-announcement emails. Notably, the official `Microsoft.Graph` SDK NuGet package is **not** used anywhere — all Graph calls are plain `HttpClient` calls to `https://graph.microsoft.com/v1.0/...`. |
| **Microsoft.Security.AntiSSRF** | Hardens every outbound Graph `HttpClient` against server-side request forgery. |

**Why is CQRS + MediatR used?**
It keeps each unit of backend logic (one command or one query) as its own small, independently testable class, instead of one giant "God" service class handling everything. Part 10 below explains this in detail with a real traced example.

## Part 5 — Complete Frontend Flow

This traces what happens from the moment a browser loads the site to a fully interactive page, using the real files.

**Step 1 — Bootstrap (`src/main.tsx`)**
The app's `bootstrap()` function creates one `PublicClientApplication` (MSAL) instance from the configuration in `src/auth/msalConfig.ts`, calls `msalInstance.initialize()`, then `handleRedirectPromise()` to finish processing any in-flight Microsoft sign-in redirect, and restores the active account **before** React is rendered at all. This ordering matters: if React rendered first, components could briefly render as "signed out" even for an already-signed-in user.

**Step 2 — Providers (`src/app/providers.tsx`, `src/auth/AuthProvider.tsx`)**
The app is wrapped, in order: MSAL's `AuthProvider` (`MsalProvider`) → React Query's `AppProviders` (`QueryClientProvider`, configured in `src/app/queryClient.ts`) → the actual `App`. `AuthProvider.tsx` also registers an MSAL event callback for `EventType.LOGIN_SUCCESS` that calls `instance.setActiveAccount(...)`.

**Step 3 — Routing (`src/app/router.tsx`, `src/app/App.tsx`)**
`App.tsx` renders `RouterProvider` with the router defined in `router.tsx`. Protected routes are wrapped in `src/auth/ProtectedRoute.tsx`, which renders `src/auth/AuthGate.tsx`.

**Step 4 — Auth gate (`src/auth/AuthGate.tsx`)**
If there is no signed-in account, `AuthGate` shows a manual "Sign in with Microsoft" button — it does **not** auto-redirect on page load. Clicking it calls `instance.loginRedirect(loginRequest)`. Only once an account is present does `AuthGate` render its `children` (the actual app shell).

**Step 5 — App shell (`src/components/layout/AppLayout.tsx`, `Header.tsx`)**
`AppLayout` renders the persistent `Header` (logo, mode toggle, global search, help, notifications icon, user menu) plus a routed content area for whichever feature page is active.

**Step 6 — Feature page mounts (example: `src/features/huddle/pages/HuddlePage.tsx`)**
The page calls one or more React Query hooks (e.g. `useHuddleCatalog`, `useMyHuddlePlan`), each of which calls a function in that feature's `api/` folder, which calls the shared `apiClient` (`src/api/apiClient.ts`) to talk to the backend.

**Step 7 — Data arrives and renders**
React Query caches the response, the component receives `data`/`isLoading`/`error`, and renders accordingly (loading spinner → real content, or an error state on failure).

**Step 8 — User interacts**
Clicking a button (voting, saving a plan, generating a schedule) either updates local Jotai/component state instantly (no server involved, e.g. workflow wizard steps) or triggers a React Query **mutation**, which calls the backend, then invalidates/updates the relevant cached query so the UI reflects the change.

---

## Part 6 — Frontend → Backend Communication (Traced Examples)

Each example below follows the same 9-step shape: **React component → function → hook/state → API call → backend controller → application layer → database → response → frontend**.

### Example 1 — Casting a vote on a Huddle topic

1. **React component:** `src/features/huddle/components/catalog/HuddleVoteControls.tsx` — the thumbs-up button's `onClick` calls `onVote(vote?.currentUserVote === 1 ? null : 1)`.
2. **Function:** `src/features/huddle/pages/HuddlePage.tsx`'s `setVote(externalId, value)` (a downvote first opens `HuddleDownvoteDialog.tsx` to collect a reason).
3. **Hook/state:** `voteMutation.mutate({ externalId, request })`, from `src/features/huddle/hooks/useSetHuddleVote.ts` (a React Query `useMutation`).
4. **API call:** `src/features/huddle/api/setHuddleVote.ts` calls `apiClient.put<HuddleVoteResponse, SetHuddleVoteRequest>("/api/huddles/{externalId}/vote", request)`.
5. **Backend controller:** `Controllers/HuddlesController.cs`'s `SetVote` action receives the request (protected by the `AccessAsUser` authorization policy) and sends a `SetHuddleVoteCommand` via MediatR.
6. **Application layer:** `Application/Features/Huddles/Votes/Commands/SetHuddleVote/SetHuddleVoteCommandHandler.cs` looks up the `HuddleTopic`, upserts a `HuddleVote` row (adds it if new), sets its value/reasons/comment.
7. **Database:** `await dbContext.SaveChangesAsync(cancellationToken)` persists the change to the `HuddleVotes` table via EF Core.
8. **Response:** The handler recomputes vote counts and returns a `HuddleVoteResponse`, which flows back up as JSON.
9. **Frontend update:** `onSuccess` calls `queryClient.invalidateQueries({ queryKey: huddleQueryKeys.votes() })`, so every vote badge on screen refreshes with the new counts.

### Example 2 — Saving a new Workflow

1. **React component:** `src/features/workflow-builder/components/WorkflowSummary.tsx` opens `src/features/saved-workflows/components/SaveWorkflowDialog.tsx`.
2. **Function:** the dialog's submit handler calls the mutation returned by `useSaveWorkflow()`.
3. **Hook/state:** `src/features/saved-workflows/hooks/useSaveWorkflow.ts` (React Query `useMutation`).
4. **API call:** `src/features/saved-workflows/api/saveWorkflow.ts` calls `apiClient.post<SavedWorkflow, SaveWorkflowInput>("/api/workflows", input)`.
5. **Backend controller:** `Controllers/WorkflowsController.cs`'s `Save` action sends a `SaveWorkflowCommand`.
6. **Application layer:** `Application/Features/Workflows/Commands/SaveWorkflow/SaveWorkflowCommandHandler.cs` checks for a duplicate workflow name for the same owner, resolves the chosen `Role` and `Activity` entities, and builds a new `UserWorkflow` with child `UserWorkflowActivity` rows.
7. **Database:** `dbContext.UserWorkflows.Add(workflow)` then `await dbContext.SaveChangesAsync(cancellationToken)` — a `DbUpdateException` is caught in case two requests race to use the same name.
8. **Response:** The handler reloads the saved workflow with its related Role/Activities included, and returns a `WorkflowResponse` (HTTP 201 Created).
9. **Frontend update:** `onSuccess` calls `queryClient.setQueryData(savedWorkflowKeys.detail(workflow.id), workflow)` and invalidates the saved-workflows list, so the new workflow immediately appears in "Saved Workflows."

### Example 3 — Marking a Huddle activity complete

1. **React component:** `src/features/huddle/components/generated/HuddleWorkspace.tsx` — checking an activity calls its internal `toggleActivity(activityExternalId, isCompleted)`.
2. **Function:** the `onSetActivityCompletion` prop, implemented in `HuddlePage.tsx`'s `setActivityCompletion` (which first creates the session via `saveSessionMutation` if none exists yet).
3. **Hook/state:** `src/features/huddle/hooks/useSetHuddleActivityCompletion.ts`.
4. **API call:** `src/features/huddle/api/setHuddleActivityCompletion.ts` calls `apiClient.put(...)` on `/api/huddles/{externalId}/session/activities/{activityExternalId}`.
5. **Backend controller:** `Controllers/HuddleSessionsController.cs`'s `SetActivityCompletion` action sends a `SetHuddleActivityCompletionCommand`.
6. **Application layer:** `Application/Features/Huddles/Sessions/Commands/SetHuddleActivityCompletion/SetHuddleActivityCompletionCommandHandler.cs` loads the `UserHuddleSession`, checks its `RowVersion` (optimistic concurrency), and updates the activity's completion state.
7. **Database:** EF Core writes the change to the session/activity-progress tables (`UserHuddleSessions`, and — inferred from the entity model rather than directly grep-confirmed — the child `UserHuddleActivityProgress` rows) via `SaveChangesAsync`.
8. **Response:** An updated `HuddleSessionResponse` is returned.
9. **Frontend update:** React Query's cache for `huddleQueryKeys.session(...)` is refreshed; `HuddleWorkspace` shows a "Activity marked complete" toast and the progress bar advances.

### Example 4 — Pushing a Workflow's activities to Outlook calendar

1. **React component:** `src/features/workflow-builder/components/CalendarReviewDialog.tsx` — the "Add to Outlook" button's `onClick` calls `mutation.mutate(selected)`.
2. **Function:** the mutation object comes from `useAddWorkflowCalendarEvents()`.
3. **Hook/state:** `src/features/workflow-builder/hooks/useAddWorkflowCalendarEvents.ts`.
4. **API call:** `src/features/workflow-builder/api/addWorkflowCalendarEvents.ts` calls `apiClient.post(..., "/api/workflows/calendar/events", { events: [...] })`.
5. **Backend controller:** `Controllers/WorkflowCalendarController.cs` sends an `AddWorkflowCalendarEventsCommand`.
6. **Application layer:** `Application/Features/Workflows/Calendar/Commands/AddWorkflowCalendarEvents/AddWorkflowCalendarEventsCommandHandler.cs` delegates to `IWorkflowCalendarService`, implemented by `Infrastructure/Calendar/GraphWorkflowCalendarService.cs`.
7. **Database:** none — this flow does not touch SQL Server at all; instead it calls Microsoft Graph over HTTP to create real events in the signed-in user's Outlook calendar (using a token acquired via `ITokenAcquisition`, on behalf of the user).
8. **Response:** An `AddWorkflowCalendarEventsResponse` (created event confirmations) is returned.
9. **Frontend update:** The dialog shows a success confirmation; a separate, purely client-side "Export .ics" button in the same dialog never touches the backend at all.

### Example 5 — Reading the Huddle catalog ("All Topics")

1. **React component:** `src/features/huddle/pages/HuddlePage.tsx` in `viewMode === "evergreen"`, with filters from `HuddleFilterBar.tsx` and `HuddleAudienceSelect.tsx`.
2. **Function:** `useHuddleCatalog(filters, audienceRoleIds)`.
3. **Hook/state:** `src/features/huddle/hooks/useHuddleCatalog.ts` (a React Query `useQuery`, no mutation — this is a read).
4. **API call:** `src/features/huddle/api/getHuddleCatalog.ts` builds a query string via `buildHuddleCatalogQueryString.ts` and calls `apiClient.get<HuddleCatalogItemResponse[]>("/api/huddles?...")`.
5. **Backend controller:** `Controllers/HuddlesController.cs`'s `GetCatalog` action sends a `GetHuddleCatalogQuery`.
6. **Application layer:** `Application/Features/Huddles/Catalog/Queries/GetHuddleCatalog/GetHuddleCatalogQueryHandler.cs` builds a filtered EF Core query (published topics, matching role/focus/agent/search) using shared helpers like `HuddleTopicGraph` and `HuddleRolePathReader`.
7. **Database:** reads (no writes) from `HuddleTopics`, `HuddleVotes`, `HuddlePlacements`, and `HuddleActivities`, using `AsNoTracking()` since this is read-only.
8. **Response:** Results are mapped to `HuddleCatalogItemResponse` objects and returned as a JSON array.
9. **Frontend update:** `HuddleCatalog.tsx` renders one `HuddleCatalogCard` per result; React Query caches the result for 30 seconds (`staleTime`) so quick re-renders don't re-fetch.

## Part 7 — Important User Flows (Traced End-to-End)

Below are 26 distinct, real flows traced through actual files and function names.

**Flow 1 — Sign in with Microsoft.** `main.tsx` (`bootstrap()`, creates `PublicClientApplication`, `handleRedirectPromise()`) → `auth/AuthProvider.tsx` (`MsalProvider`, `LOGIN_SUCCESS` → `setActiveAccount`) → `auth/ProtectedRoute.tsx` → `auth/AuthGate.tsx` (`loginRedirect(loginRequest)`) → Microsoft Entra sign-in page → redirect back → `AuthGate` renders the app shell.

**Flow 2 — Silent token acquisition on every API call.** Any hook using `useApiClient()` → `auth/useAccessToken.ts` calls `instance.acquireTokenSilent(...)`, falling back to `acquireTokenRedirect` on `InteractionRequiredAuthError` → `api/apiClient.ts` attaches `Authorization: Bearer <token>` → backend's `[Authorize(Policy = Policies.AccessAsUser)]` validates it → `Infrastructure/Identity/CurrentUserService.cs` reads the `oid` claim for ownership checks.

**Flow 3 — Fetch current user profile.** `components/layout/UserMenu.tsx` → `auth/useCurrentUser.ts` → `GET /api/auth/me` → `Controllers/CurrentUserController.cs::GetMe` → `GetCurrentUserQuery` handler reads claims via `ICurrentUserService` → `CurrentUserResponse` → dropdown shows the user's name/email.

**Flow 4 — Sign out.** `UserMenu.tsx`'s "Sign out" button calls `instance.logoutRedirect({ account, postLogoutRedirectUri })` → MSAL clears session and redirects to Entra logout, then back → next load finds no active account → `AuthGate` shows the sign-in screen again.

**Flow 5 — Browse the Huddle catalog ("All Topics").** See Example 5 above in Part 6.

**Flow 6 — Filter the catalog by Audience (multi-select).** `HuddleFilterBar.tsx` renders `<HuddleAudienceSelect mode="multi">` → clicking a role calls `toggle(externalId)` (multi branch) → bubbles to `HuddlePage.tsx`'s `handleAudienceChange` → feeds `useHuddleCatalog`'s `additionalContentRoleExternalId` param → backend narrows via `HuddleRolePathReader`.

**Flow 7 — View a Role Path week (guided view).** `HuddlePage.tsx` (`viewMode === "guided"`) → `useMyHuddlePlan(roleExternalId)` → `GET /api/huddle-plans/me?roleExternalId=...` → `Controllers/HuddlePlansController.cs::GetMine` → `GetMyHuddlePlanQuery` handler (creates the recommended plan on first read) → rendered by `components/progress/RecommendedPath.tsx` as a week-by-week list, with `RolePathWeekMenu.tsx` offering move/replace/reset.

**Flow 8 — Save a customized Role Path.** `RolePathWeekMenu.tsx` action → `RecommendedPath.tsx`'s `onSave` → `HuddlePage.tsx`'s `savePlan` → `useSaveHuddlePlan.ts` → `PUT /api/huddle-plans/me` → `Controllers/HuddlePlansController.cs::SaveMine` → `SaveHuddlePlanCommandHandler` validates `RowVersion` and persists.

**Flow 9 — Start a Huddle session and complete an activity.** "Generate Huddle" opens `components/generated/HuddleWorkspace.tsx` → checking an activity calls its `toggleActivity(...)` → `HuddlePage.tsx`'s `setActivityCompletion` → see Example 3 in Part 6.

**Flow 10 — Complete a Huddle session.** `HuddleWorkspace.tsx`'s `completeHuddle()` → `HuddlePage.tsx`'s `completeSession` → `useCompleteHuddleSession.ts` → `POST /api/huddles/{externalId}/session/complete` → `Controllers/HuddleSessionsController.cs::Complete` → `CompleteHuddleSessionCommandHandler` marks the session complete.

**Flow 11 — Vote (upvote/downvote) a Huddle topic.** See Example 1 in Part 6.

**Flow 12 — Book a coach meeting.** `components/coach/MeetCoachDialog.tsx` (pick coach via `useCoaches`, pick slot via `useCoachAvailability`) → "Book session" calls `booking.mutateAsync(...)` → `useBookCoach.ts` → `POST /api/huddle-coaching/bookings` → `Controllers/HuddleCoachingController.cs::Book` → `BookCoachCommandHandler` verifies the topic then calls `ICoachSchedulingService.BookAsync(...)` (real Graph meeting) → dialog shows a "join Teams meeting" link.

**Flow 13 — "My Huddle Plan" continue-learning resume.** `useIncompleteHuddleSessions.ts` → `GET /api/huddle-sessions/me/incomplete` → `Controllers/HuddleSessionsController.cs::GetIncomplete` → rendered as `components/progress/ContinueLearningCard.tsx` → clicking it reopens `HuddleWorkspace` at the saved phase.

**Flow 14 — Custom Learning Plan (client-only, no backend endpoint).** `components/catalog/CustomLearningPlanDialog.tsx` uses `useCustomLearningPlan.ts`, which stores the user's chosen/ordered topic list purely in `window.localStorage` under `aito-additional-topics-plan:${persona}` — by the hook's own code comment, this is because "the API has no endpoint for an arbitrary, user-ordered topic list." This never reaches the backend.

**Flow 15 — Export a Huddle to HTML.** `HuddlePage.tsx`'s `exportSelectedHuddleHtml()` dynamically imports `exports/html`, calls `exportHuddleHtml(presentationModel)` → `createHuddleHtmlExport` builds the HTML string (styles/interactions/sanitization) → `downloadHtmlFile` triggers a browser download via a `Blob` and a simulated `<a download>` click. Entirely client-side.

**Flow 16 — Export a Huddle to PowerPoint.** `HuddlePage.tsx`'s `exportSelectedHuddlePowerPoint()` → `exports/powerpoint/exportHuddlePowerPoint.ts` builds a `PptxGenJS` presentation and calls `.writeFile(...)`. Entirely client-side.

**Flow 17 — Build a workflow (select role → activities → schedule).** `features/workflow-builder/pages/WorkflowPage.tsx` uses `useWorkflowSelection()` → `RoleSelector.tsx` calls `workflow.selectRole(roleId)` → `ActivitySelectionStep.tsx` + `useActivities({ roleId })` (→ `GET /api/activities?roleId=...` → `Controllers/ActivitiesController.cs::GetActivities`) → user toggles activities → `WorkflowSummary.tsx` calls `useDaySchedule.ts`'s `createInitialSchedule()`, which buckets activities into `morning`/`midday`/`late-day` zones and assigns time slots — entirely client-side; nothing is sent to the backend to "generate" a schedule.

**Flow 18 — Save a workflow.** See Example 2 in Part 6.

**Flow 19 — Load a saved workflow back into the builder.** `SavedWorkflowsPage.tsx` — clicking "Open" on `WorkflowHistoryCard.tsx` sets `selectedWorkflowId` → `useWorkflowById.ts` (`GET /api/workflows/{id}`) plus `useActivities({})` (current catalog) → matches saved activities against the live catalog → calls `workflow.restoreWorkflow(...)`, which sets the Jotai atoms → navigates to `/workflow`.

**Flow 20 — Toggle a saved workflow's favorite star.** `FavoriteButton.tsx` → `useToggleFavorite.ts` → `PATCH /api/workflows/{id}/favorite` → `Controllers/WorkflowsController.cs::ToggleFavorite` → `ToggleFavoriteCommandHandler` flips `UserWorkflow.IsFavorite` (with `RowVersion` check).

**Flow 21 — Add scheduled activities to Outlook calendar.** See Example 4 in Part 6. (The dialog's separate "Export .ics" button is a fully client-side path that never calls the backend.)

**Flow 22 — GlobalSearch in Huddle mode.** `components/layout/GlobalSearch.tsx`'s `HuddleResults` debounces the query, calls `useHuddleCatalog({ search })` (same endpoint as Flow 5), maps up to 10 results — selecting one sets `huddleViewModeAtom`/`selectedHuddleExternalIdAtom` and navigates to `/huddle`.

**Flow 23 — GlobalSearch in Workflow mode.** `GlobalSearch.tsx`'s `WorkflowResults` combines `useRoles()`, `useActivities({ search })`, and `useAiTools()` client-side into a merged, capped result list — selecting one sets Jotai atoms and navigates to `/workflow`.

**Flow 24 — Launch Planner: save a plan and draft a launch email.** `features/huddle/pages/LaunchPlannerPage.tsx` calls `useSaveHuddleLaunchPlan()` → `PUT /api/huddle-launch-plans/me` → `Controllers/HuddleLaunchPlansController.cs` persists the rollout plan; separately `useCreateHuddleLaunchEmailDraft()` → `POST /api/huddle-launch-plans/me/email-drafts` → the handler creates a real draft email in the manager's own Outlook mailbox via Graph (never auto-sent).

**Flow 25 — Reset a Role Path week back to the recommendation.** `RolePathWeekMenu.tsx`'s "Reset" → `HuddlePage.tsx`'s `resetPlan()` → `useResetHuddlePlan.ts` → `DELETE /api/huddle-plans/me/{roleExternalId}` → `Controllers/HuddlePlansController.cs::ResetMine` → `ResetHuddlePlanCommandHandler` deletes the customization so the next read regenerates the governed recommendation.

**Flow 26 — Toggle Workflow/Huddle mode and dark theme.** `components/layout/ModeToggle.tsx` navigates between `/workflow` and `/huddle`; `ThemeToggle.tsx` toggles a CSS class and saves the preference to `localStorage` (`aito-color-theme`) — purely client UI state, no backend or React Query involvement.

---

## Part 8 — Backend Request Flow (Endpoint Table)

Every one of the 12 controllers uses the same authorization policy (`AccessAsUser`, applied at the controller class level — 11 of 12 via the `Policies.AccessAsUser` constant, and `WorkflowCalendarController` via the equivalent raw string `"AccessAsUser"`, a minor inconsistency but functionally identical). **Every single action goes through MediatR** — there are no bypass/pass-through actions.

| HTTP | Endpoint | Controller | Command/Query | Handler | Service(s) | Database Entities |
|---|---|---|---|---|---|---|
| GET | `/api/activities` | ActivitiesController | GetActivitiesQuery | GetActivitiesQueryHandler | — | `Activities` |
| GET | `/api/activities/{id}` | ActivitiesController | GetActivityByIdQuery | GetActivityByIdQueryHandler | — | `Activities` |
| GET | `/api/activities/by-role/{roleExternalId}` | ActivitiesController | GetActivitiesByRoleQuery | GetActivitiesByRoleQueryHandler | — | `Activities` |
| GET | `/api/ai-tools` | AiToolsController | GetAiToolsQuery | GetAiToolsQueryHandler | — | `AiTools` |
| GET | `/api/auth/me` | CurrentUserController | GetCurrentUserQuery | GetCurrentUserQueryHandler | `ICurrentUserService` | none (claims only) |
| GET | `/api/huddle-coaching/coaches` | HuddleCoachingController | GetCoachesQuery | GetCoachesQueryHandler | `ICoachSchedulingService` (Graph) | none |
| GET | `/api/huddle-coaching/coaches/{coachExternalId}/availability` | HuddleCoachingController | GetCoachAvailabilityQuery | GetCoachAvailabilityQueryHandler | `ICoachSchedulingService` (Graph) | none |
| POST | `/api/huddle-coaching/bookings` | HuddleCoachingController | BookCoachCommand | BookCoachCommandHandler | `ICoachSchedulingService` (Graph) | `HuddleTopics` (lookup) |
| GET | `/api/huddle-launch-plans/me` | HuddleLaunchPlansController | GetMyHuddleLaunchPlanQuery | GetMyHuddleLaunchPlanQueryHandler | `ICurrentUserService` | `UserHuddleLaunchPlans` |
| PUT | `/api/huddle-launch-plans/me` | HuddleLaunchPlansController | SaveHuddleLaunchPlanCommand | SaveHuddleLaunchPlanCommandHandler | `ICurrentUserService` | `UserHuddleLaunchPlans` |
| POST | `/api/huddle-launch-plans/me/email-drafts` | HuddleLaunchPlansController | CreateHuddleLaunchEmailDraftCommand | CreateHuddleLaunchEmailDraftCommandHandler | `IHuddleLaunchMailService` (Graph, draft-only) | none |
| DELETE | `/api/huddle-launch-plans/me` | HuddleLaunchPlansController | ResetHuddleLaunchPlanCommand | ResetHuddleLaunchPlanCommandHandler | `ICurrentUserService` | `UserHuddleLaunchPlans` |
| GET | `/api/huddle-plans/me` | HuddlePlansController | GetMyHuddlePlanQuery | GetMyHuddlePlanQueryHandler | `ICurrentUserService` | `HuddleSegmentRoles`, `HuddlePlacements`, `UserHuddlePlans`, `HuddleTopics`, `HuddleActivities`, `HuddleActivityAgents` |
| PUT | `/api/huddle-plans/me` | HuddlePlansController | SaveHuddlePlanCommand | SaveHuddlePlanCommandHandler | `ICurrentUserService` | `HuddlePlacements`, `HuddleSegmentRoles`, `HuddleTopics`, `UserHuddlePlanItems`, `UserHuddlePlans` |
| DELETE | `/api/huddle-plans/me/{roleExternalId}` | HuddlePlansController | ResetHuddlePlanCommand | ResetHuddlePlanCommandHandler | `ICurrentUserService` | `HuddleSegmentRoles`, `UserHuddlePlans` |
| GET | `/api/huddles/{externalId}/session` | HuddleSessionsController | GetMyHuddleSessionQuery | GetMyHuddleSessionQueryHandler | `ICurrentUserService` | `HuddleTopics`, `UserHuddleSessions`, `HuddleActivities`, `HuddlePlacements` |
| PUT | `/api/huddles/{externalId}/session` | HuddleSessionsController | SaveHuddleSessionCommand | SaveHuddleSessionCommandHandler | `ICurrentUserService` | `HuddlePhases`, `HuddleTopics`, `UserHuddleSessions`, `HuddleActivities`, `HuddlePlacements` |
| PUT | `/api/huddles/{externalId}/session/activities/{activityExternalId}` | HuddleSessionsController | SetHuddleActivityCompletionCommand | SetHuddleActivityCompletionCommandHandler | `ICurrentUserService` | `HuddleActivities`, `UserHuddleSessions`, `HuddlePlacements` |
| POST | `/api/huddles/{externalId}/session/complete` | HuddleSessionsController | CompleteHuddleSessionCommand | CompleteHuddleSessionCommandHandler | `ICurrentUserService` | `UserHuddleSessions` |
| GET | `/api/huddle-sessions/me/incomplete` | HuddleSessionsController | GetMyIncompleteHuddleSessionsQuery | GetMyIncompleteHuddleSessionsQueryHandler | `ICurrentUserService` | `UserHuddleSessions`, `HuddleActivities` |
| GET | `/api/huddles` | HuddlesController | GetHuddleCatalogQuery | GetHuddleCatalogQueryHandler | — | `HuddleTopics`, `HuddleVotes`, `HuddlePlacements`, `HuddleActivities`, `HuddleActivityAgents` |
| GET | `/api/huddles/recommended-path` | HuddlesController | GetRecommendedPathQuery | GetRecommendedPathQueryHandler | — | `Roles`, `HuddlePlacements`, `HuddleTopics`, `HuddleActivities`, `HuddleActivityAgents` |
| GET | `/api/huddles/votes` | HuddlesController | GetHuddleVotesQuery | GetHuddleVotesQueryHandler | `ICurrentUserService` | `HuddleTopics`, `HuddleVotes` |
| PUT | `/api/huddles/{externalId}/vote` | HuddlesController | SetHuddleVoteCommand | SetHuddleVoteCommandHandler | `ICurrentUserService` | `HuddleTopics`, `HuddleVotes` |
| DELETE | `/api/huddles/{externalId}/vote` | HuddlesController | RemoveHuddleVoteCommand | RemoveHuddleVoteCommandHandler | `ICurrentUserService` | `HuddleVotes` |
| GET | `/api/huddles/{externalId}` | HuddlesController | GetHuddleByIdQuery | GetHuddleByIdQueryHandler | — | `HuddleTopics`, `HuddlePlacements`, `HuddleAgentResources` |
| GET | `/api/roles` | RolesController | GetRolesQuery | GetRolesQueryHandler | — | `Roles` |
| GET | `/api/workflow-buckets` | WorkflowBucketsController | GetWorkflowBucketsQuery | GetWorkflowBucketsQueryHandler | — | `WorkflowBuckets` |
| POST | `/api/workflows/calendar/events` | WorkflowCalendarController | AddWorkflowCalendarEventsCommand | AddWorkflowCalendarEventsCommandHandler | `IWorkflowCalendarService` (Graph) | none |
| GET | `/api/workflows` | WorkflowsController | GetMyWorkflowsQuery | GetMyWorkflowsQueryHandler | `ICurrentUserService` | `UserWorkflows`, `Roles`, `Activities` |
| GET | `/api/workflows/favorites` | WorkflowsController | GetFavoriteWorkflowsQuery | GetFavoriteWorkflowsQueryHandler | `ICurrentUserService` | `UserWorkflows` |
| GET | `/api/workflows/{id}` | WorkflowsController | GetWorkflowByIdQuery | GetWorkflowByIdQueryHandler | `ICurrentUserService` | `UserWorkflows` |
| POST | `/api/workflows` | WorkflowsController | SaveWorkflowCommand | SaveWorkflowCommandHandler | `ICurrentUserService` | `UserWorkflows`, `Roles`, `Activities`, `UserWorkflowActivities` |
| PUT | `/api/workflows/{id}` | WorkflowsController | UpdateWorkflowCommand | UpdateWorkflowCommandHandler | `ICurrentUserService` | `UserWorkflows`, `Roles`, `Activities`, `UserWorkflowActivities` |
| DELETE | `/api/workflows/{id}` | WorkflowsController | DeleteWorkflowCommand | DeleteWorkflowCommandHandler | `ICurrentUserService` | `UserWorkflows` |
| PATCH | `/api/workflows/{id}/favorite` | WorkflowsController | ToggleFavoriteCommand | ToggleFavoriteCommandHandler | `ICurrentUserService` | `UserWorkflows` |

For `SetHuddleActivityCompletionCommand`, the direct grep-confirmed database tables are `UserHuddleSessions`, `HuddleActivities`, `HuddlePlacements`; a write to a child `UserHuddleActivityProgress` table is inferred from the entity model rather than independently confirmed with a raw-SQL trace.

## Part 9 — Database Flow

**What is it?**
The database is SQL Server. No handler talks to SQL Server directly — everything goes through Entity Framework Core (EF Core) 9, via one class: `Infrastructure/Persistence/ApplicationDbContext.cs`, which implements the `IApplicationDbContext` interface that the Application layer depends on. There are **no repository classes anywhere** in this codebase — a query handler injects `IApplicationDbContext` and writes LINQ directly against its `DbSet<T>` properties.

**Where is it?**
- `Infrastructure/Persistence/ApplicationDbContext.cs` — the DbContext itself, with one `DbSet<T>` per entity (30 DbSets total).
- `Infrastructure/Persistence/Configurations/*.cs` — one `IEntityTypeConfiguration<T>` class per entity (32 configuration classes, one per Domain entity), all discovered automatically via `modelBuilder.ApplyConfigurationsFromAssembly(...)` in `OnModelCreating`.
- `Infrastructure/Persistence/Migrations/` — the real, generated EF Core migration history (8 migrations, from `InitialCreate` through `AddUserHuddlePlanItemPlacement` and `RemoveStoredUserPIIAndWorkflowShares`).
- `database/fresh-install-v11.78/` — a hand-maintained, separate set of SQL scripts used to stand up and seed a brand-new database for a client delivery. Its schema script, `01_Schema_All_Migrations.sql`, is not written by hand — it is machine-generated straight from the EF migration history using `dotnet ef migrations script --idempotent`, so the two representations of the schema (migrations vs. fresh-install script) are kept in sync by tooling, not by manual duplication.

**Why is it used this way?**
Skipping repository classes and using `IApplicationDbContext` directly keeps the codebase smaller — EF Core's `DbSet<T>` already acts like a repository. Global split-query behavior (`QuerySplittingBehavior.SplitQuery`, set once on the DbContext, not per-query) means EF Core issues multiple simpler SQL queries instead of one large SQL join, which avoids duplicate-row bloat for `.Include()`-heavy queries.

**How does it work — read path:** `Controllers/ActivitiesController.cs::GetActivities` → `GetActivitiesQueryHandler` reads `context.Activities` as an `IQueryable`, filters, and (for read-only queries) usually calls `.AsNoTracking()` for performance → EF Core translates this into a SQL `SELECT` → SQL Server → results are mapped into a `Contracts` DTO → returned as JSON.

**How does it work — write path (example: saving a Workflow):** `SaveWorkflowCommandHandler` resolves the `Role`/`Activity` entities, builds a new `UserWorkflow` object with an in-memory `UserWorkflowActivity` collection attached via a navigation property, calls `dbContext.UserWorkflows.Add(workflow)`, then `await dbContext.SaveChangesAsync(cancellationToken)`. EF Core's change tracker figures out the exact `INSERT` statements needed (including the child rows) and sends them to SQL Server inside a transaction.

**Optimistic concurrency:** Several write paths (saving a Huddle plan, updating a session, updating/toggling a workflow) check a `RowVersion` value passed from the frontend against the current database value before saving, so two people (or two browser tabs) can't silently overwrite each other's changes.

**Legacy table still in active use:** `HuddleRolePathItems` looks like a leftover table, but it is not — it is still actively queried by `GetHuddleCatalogQueryHandler` (for role-relevance sorting) and by the recommended-path logic used in `SaveHuddlePlanCommandHandler`/`GetMyHuddlePlanQueryHandler`, because `HuddlePlacement` alone cannot always disambiguate a topic that legitimately repeats across different weeks of a role path the way `HuddleRolePathItems` can.

**Confirmed removed:** the `WorkflowShares` table and the `UserWorkflows.OwnerEmail`/`OwnerDisplayName` columns were fully dropped by migration `20260921093616_RemoveStoredUserPIIAndWorkflowShares` — this feature (and the personally identifiable columns backing it) genuinely no longer exists in the schema, not merely "unwired" in the UI.

---

## Part 10 — CQRS / MediatR Explained

**What is it?**
CQRS (Command Query Responsibility Segregation) is the idea of splitting every operation into either a **Command** (something that changes data) or a **Query** (something that only reads data), each handled by its own small, single-purpose class. MediatR is the library that wires a Command/Query object to the one handler class that knows how to process it, without the controller needing to know which class that is.

**Where is it?**
Every feature lives in its own folder: `Application/Features/<Area>/[Commands|Queries]/<Name>/`, containing exactly:
- `<Name>Command.cs` or `<Name>Query.cs` — a plain data record describing the request.
- `<Name>CommandHandler.cs` or `<Name>QueryHandler.cs` — the class that actually does the work.
- `<Name>Validator.cs` — a FluentValidation validator for that request (when validation rules exist).

**Why is it used?**
It keeps each unit of logic small and independently testable, and it means a controller action is always the same 2-3 lines: build the request object, `await _sender.Send(request)`, return the result. All cross-cutting behavior (like validation) lives in one place instead of being repeated in every handler.

### A real traced Query: `GetHuddleCatalogQuery`

1. `Controllers/HuddlesController.cs`'s `GetCatalog` action builds a `GetHuddleCatalogQuery` from the incoming filter parameters.
2. `await _sender.Send(query, cancellationToken)` — MediatR looks up the one handler registered for `GetHuddleCatalogQuery`.
3. Before the handler runs, MediatR's pipeline invokes `ValidationBehavior<TRequest,TResponse>` (see below), which runs any registered FluentValidation validator for this query.
4. `Application/Features/Huddles/Catalog/Queries/GetHuddleCatalog/GetHuddleCatalogQueryHandler.cs`'s `Handle` method builds a filtered, `AsNoTracking()` LINQ query against `HuddleTopics` (published only), applying role/focus/agent/search filters, and calling into shared helpers (`HuddleTopicGraph`, `HuddlePlacementLookup`, `HuddleActivityCounts`, `HuddlePlacementActivityAgents`) to attach related placement, activity-count, and agent data.
5. The handler returns a list of `HuddleCatalogItemResponse` DTOs.
6. The controller returns that list as the HTTP 200 JSON response.

### A real traced Command: `SaveWorkflowCommand`

1. `Controllers/WorkflowsController.cs`'s `Save` action builds a `SaveWorkflowCommand` from the request body.
2. `await _sender.Send(command, cancellationToken)`.
3. `ValidationBehavior<TRequest,TResponse>` runs `SaveWorkflowValidator` first — if validation fails, it throws a `FluentValidation.ValidationException`, which never reaches the handler.
4. `Application/Features/Workflows/Commands/SaveWorkflow/SaveWorkflowCommandHandler.cs`'s `Handle` method checks for a duplicate name for this owner (`dbContext.UserWorkflows.AnyAsync(...)`), resolves the chosen `Role` and `Activity` entities, constructs a new `UserWorkflow` (with child `UserWorkflowActivity` rows), calls `dbContext.UserWorkflows.Add(workflow)`, then `await dbContext.SaveChangesAsync(cancellationToken)` (with a caught `DbUpdateException` in case of a naming race), then reloads the workflow with its related data included.
5. The handler returns a `WorkflowResponse`.
6. The controller returns HTTP 201 Created with that response.

### The validation pipeline (`ValidationBehavior<TRequest,TResponse>`)

**Where:** `Application/Common/Behaviors/ValidationBehavior.cs` — this is the **only** MediatR pipeline behavior in the entire codebase.
**How it works:** MediatR runs it around every single Command/Query. It collects all registered `IValidator<TRequest>` instances for the current request type, runs them, and if any produce failures, throws `FluentValidation.ValidationException`. No handler ever calls a validator explicitly — this happens automatically for every request, which is why validation logic never appears mixed into handler bodies.
**Where the exception is caught:** `Api/Middleware/ExceptionHandlingMiddleware.cs` specifically catches `FluentValidation.ValidationException` and converts it into an HTTP 400 response with the validation error details — see Part 18.

---

## Part 11 — Authentication & Authorization

**What is it?**
The app uses Microsoft Entra ID (formerly Azure AD) for sign-in, via the industry-standard OAuth2/OpenID Connect flow, implemented with MSAL on the frontend and `Microsoft.Identity.Web` on the backend.

**Full trace, front to back:**

1. **Sign-in (frontend):** `src/main.tsx` creates a `PublicClientApplication` from `src/auth/msalConfig.ts` and processes any pending redirect before React renders. `src/auth/AuthGate.tsx` shows a manual "Sign in with Microsoft" button; clicking it calls `instance.loginRedirect(loginRequest)`, sending the user to Microsoft's login page.
2. **Redirect back:** Microsoft redirects back to the app's configured `VITE_REDIRECT_URI` with an authorization code; MSAL exchanges it behind the scenes for tokens and fires `EventType.LOGIN_SUCCESS`, which `src/auth/AuthProvider.tsx` uses to call `instance.setActiveAccount(...)`.
3. **Token acquisition per API call:** `src/auth/useAccessToken.ts` calls `instance.acquireTokenSilent(createTokenRequest(account))` to get a fresh access token scoped to the backend API (`VITE_API_SCOPE`, e.g. `api://<clientId>/access_as_user`), falling back to `acquireTokenRedirect` if silent acquisition needs interaction.
4. **Attaching the token:** `src/api/apiClient.ts`'s `request()` function sets `Authorization: Bearer <token>` on every outgoing fetch.
5. **Backend validation:** `Api/Extensions/AuthenticationExtensions.cs` configures `AddMicrosoftIdentityWebApi`, bound to the `AzureAd` configuration section (`Instance`, `TenantId`, `ClientId`, `Audience`), which validates the JWT's signature, issuer, audience, and expiry on every request automatically via ASP.NET Core's authentication middleware.
6. **Authorization policy:** A single policy, `AccessAsUser` (`Api/Authorization/Policies.cs`), requires an authenticated user and the `access_as_user` scope (`RequireAuthenticatedUser()` + `RequireScope("access_as_user")`). All 12 controllers apply this policy at the class level.
7. **Reading the current user server-side:** `Infrastructure/Identity/CurrentUserService.cs` implements `ICurrentUserService`, reading the `oid` claim (object id) plus name/email claims off the validated `ClaimsPrincipal` — this is how handlers know "whose" workflow/plan/session they're reading or writing, since ownership checks compare against this `oid`.
8. **Calling Microsoft Graph on the user's behalf:** For coach booking, calendar events, and launch-email drafts, the backend also calls `EnableTokenAcquisitionToCallDownstreamApi()` + `AddInMemoryTokenCaches()`, letting `ITokenAcquisition.GetAccessTokenForUserAsync(scopes)` mint a Graph-scoped token for the same signed-in user (On-Behalf-Of flow), so these actions genuinely act as that person in Outlook/Teams — not as a generic service account.
9. **Sign-out:** `src/components/layout/UserMenu.tsx` calls `instance.logoutRedirect(...)`, clearing the MSAL session and redirecting through Microsoft's logout endpoint back to the app, where `AuthGate` shows the sign-in screen again.

**Authorization roles:** `Api/Authorization/AppRoles.cs` is currently an empty placeholder — no custom Entra "app roles" (like Admin vs. Manager) are defined or enforced anywhere yet. Every authenticated user with the right token scope can reach every endpoint; there is no role-based access control beyond "is this a valid, authenticated user."

**CORS:** `Api/Extensions/CorsExtensions.cs` builds the `FrontendCorsPolicy` from `Cors:AllowedOrigins` in configuration, and **fails fast at startup** (throws an `InvalidOperationException`) if that list is empty — confirmed the current configured value is a single local development origin only.

---

## Part 12 — React State Management

**What is it?**
The frontend deliberately keeps two different kinds of state in two different tools:

1. **Server state** (anything that came from, or will be sent to, the backend API) — handled by **TanStack React Query**. Every `useXyz` hook that calls into a feature's `api/` folder is a React Query `useQuery` (for reads) or `useMutation` (for writes). Global defaults (`src/app/queryClient.ts`): `staleTime: 30_000` ms, `gcTime: 5 * 60_000` ms, `retry: 1`, `refetchOnWindowFocus: false`.
2. **Local/UI state** — handled by **Jotai atoms** (small independent pieces of state, not one big global store) for state that needs to be shared across sibling/parent components without prop-drilling, and by plain React `useState`/`useReducer` for state local to a single component.

**Where is it?**
- `src/features/workflow-builder/store/workflowAtoms.ts` — the Workflow builder wizard's state (selected role, selected activities, current step, generated schedule).
- `src/features/huddle/store/huddleAtoms.ts` — Huddle view mode, selected Huddle/placement, audience filters.
- No explicit Jotai `<Provider>` is used anywhere — the app relies on Jotai's implicit default store, so atoms are effectively global unless a component explicitly scopes them.

**Why is it used this way?**
Mixing "data the server owns" into a general state manager tends to cause stale/duplicated copies of server data and manual cache-invalidation bugs. Keeping server state exclusively in React Query means there is exactly one cache, with one clear invalidation model (`queryClient.invalidateQueries`), and Jotai is reserved for state React Query was never meant to manage (wizard step, UI toggles).

**Example from this application:** In the Workflow builder, `selectedRoleIdAtom` and `selectedActivitiesAtom` (Jotai, local UI/selection state) drive which activities are shown, while the actual activity catalog data itself comes from `useActivities()` (React Query, server state) — the two are combined in `useWorkflowSelection.ts` but never conflated into one store.

## Part 13 — Important File-by-File Summary

### Frontend — Entry / App Shell

| File | Layer | Responsibility |
|---|---|---|
| `src/main.tsx` | Frontend | Bootstraps MSAL, processes redirect, renders React. |
| `src/app/App.tsx` | Frontend Component | Root component; renders `RouterProvider`. |
| `src/app/router.tsx` | Frontend Component | Defines all routes; wraps protected routes in `ProtectedRoute`/`AppLayout`. |
| `src/app/providers.tsx` | Frontend Component | Wires top-level providers (React Query, etc.) around the app. |
| `src/app/queryClient.ts` | Frontend Hook | Configures the shared TanStack Query `QueryClient`. |

### Frontend — Auth

| File | Layer | Responsibility |
|---|---|---|
| `src/auth/msalConfig.ts` | Frontend Hook | Builds MSAL configuration, login scopes, token-request helper from `VITE_*` env vars. |
| `src/auth/AuthProvider.tsx` | Frontend Component | Wraps the app in MSAL's `MsalProvider`. |
| `src/auth/AuthGate.tsx` | Frontend Component | Shows sign-in button; gates rendering until authenticated. |
| `src/auth/ProtectedRoute.tsx` | Frontend Component | Route guard redirecting unauthenticated users to sign-in. |
| `src/auth/useAccessToken.ts` | Frontend Hook | Acquires a silent access token via MSAL. |
| `src/auth/useCurrentUser.ts` | Frontend Hook | Fetches `/api/auth/me`. |
| `src/auth/auth.types.ts` | Frontend | Shared TypeScript types for auth state. |

### Frontend — API Client Layer

| File | Layer | Responsibility |
|---|---|---|
| `src/api/apiClient.ts` | Frontend API | Centralized fetch wrapper; attaches bearer token, maps failures to `ApiError`. |
| `src/api/apiError.ts` | Frontend API | A separate, more elaborate `ApiError`/`ApiProblemDetails` type — **dead/unused code**, not the class actually used by `apiClient.ts`. |
| `src/api/endpoints.ts` | Frontend API | Single source of truth for backend endpoint URL strings. |
| `src/api/useApiClient.ts` | Frontend Hook | Hook returning an authenticated instance of the API client. |

### Frontend — Shared Layout / UI

| File | Layer | Responsibility |
|---|---|---|
| `src/components/layout/AppLayout.tsx` | Frontend Component | Main authenticated shell (header + routed content). |
| `src/components/layout/Header.tsx` | Frontend Component | Top navigation bar (logo, mode toggle, search, help, notifications, user menu). |
| `src/components/layout/GlobalSearch.tsx` | Frontend Component | App-wide search box (Huddle + Workflow results). |
| `src/components/layout/ModeToggle.tsx` | Frontend Component | Switches between Workflow / Huddle modes. |
| `src/components/layout/ThemeToggle.tsx` | Frontend Component | Light/dark theme switcher. |
| `src/components/layout/UserMenu.tsx` | Frontend Component | Signed-in user dropdown (profile/sign-out). |
| `src/components/layout/LayoutTour.tsx` / `tourSteps.ts` | Frontend Component | Guided product-tour overlay. |
| `src/components/feedback/EmptyState.tsx` / `ErrorState.tsx` / `LoadingSpinner.tsx` | Frontend Component | Shared "nothing here" / error / loading UI. |
| `src/components/ui/*.tsx` | Frontend Component | Shared primitive UI building blocks (button, card, dialog, input, badge, etc.). |
| `src/lib/utils.ts` | Frontend | Shared utility functions. |

### Frontend — Feature: Home

| File | Layer | Responsibility |
|---|---|---|
| `src/features/home/pages/HomePage.tsx` | Frontend Component | Landing page at `/`. |
| `src/features/home/ModeSelectorPage.tsx` | Frontend Component | Lets the user pick Workflow vs. Huddle — **dead code**, not reached by the current router. |

### Frontend — Feature: Huddle

| File | Layer | Responsibility |
|---|---|---|
| `src/features/huddle/pages/HuddlePage.tsx` | Frontend Component | Main Huddle page — catalog, role path, session workspace. |
| `src/features/huddle/pages/LaunchPlannerPage.tsx` | Frontend Component | Manager's team launch-plan builder. |
| `src/features/huddle/store/huddleAtoms.ts` | Frontend Hook | Jotai atoms for Huddle UI/session state. |
| `src/features/huddle/hooks/huddleQueryKeys.ts` | Frontend Hook | Central React Query key factory for Huddle data. |
| `src/features/huddle/hooks/useHuddleCatalog.ts` | Frontend Hook | Query hook for the catalog list. |
| `src/features/huddle/hooks/useHuddleById.ts` | Frontend Hook | Query hook for one Huddle's detail. |
| `src/features/huddle/hooks/useRecommendedHuddlePath.ts` | Frontend Hook | Query hook for the recommended path — **dead code**, superseded by `useMyHuddlePlan`. |
| `src/features/huddle/hooks/useMyHuddlePlan.ts` / `useSaveHuddlePlan.ts` / `useResetHuddlePlan.ts` | Frontend Hook | Query/mutation hooks for the persistent Huddle plan. |
| `src/features/huddle/hooks/useHuddleSession.ts` / `useSaveHuddleSession.ts` / `useCompleteHuddleSession.ts` / `useSetHuddleActivityCompletion.ts` | Frontend Hook | Session + activity-progress query/mutation hooks. |
| `src/features/huddle/hooks/useHuddleVotes.ts` / `useSetHuddleVote.ts` | Frontend Hook | Voting query/mutation hooks. |
| `src/features/huddle/hooks/useCoaches.ts` / `useCoachAvailability.ts` / `useBookCoach.ts` | Frontend Hook | Coach discovery/availability/booking hooks. |
| `src/features/huddle/hooks/useCustomLearningPlan.ts` | Frontend Hook | localStorage-only custom topic ordering (no backend). |
| `src/features/huddle/hooks/useMyHuddleLaunchPlan.ts` / `useSaveHuddleLaunchPlan.ts` / `useCreateHuddleLaunchEmailDraft.ts` | Frontend Hook | Manager launch-plan CRUD + email draft creation. |
| `src/features/huddle/api/*.ts` | Frontend API | One thin fetch function per backend endpoint. |
| `src/features/huddle/components/audience/HuddleAudienceSelect.tsx` | Frontend Component | Role/audience picker (single or multi mode). |
| `src/features/huddle/components/catalog/HuddleCatalog.tsx` / `HuddleCatalogCard.tsx` / `HuddleFilterBar.tsx` | Frontend Component | Catalog browsing/filtering UI. |
| `src/features/huddle/components/catalog/HuddleVoteControls.tsx` | Frontend Component | Up/downvote buttons on a catalog card. |
| `src/features/huddle/components/generated/HuddleWorkspace.tsx` | Frontend Component | Core session workspace. **Contains a genuine code duplication**: two separate `export function HuddleWorkspace(...)` definitions exist in the same file — one active (~150 lines) and one fully commented out (~256 lines), likely a merge/recovery artifact. Only the active one renders. |
| `src/features/huddle/components/progress/RecommendedPath.tsx` / `RolePathWeekMenu.tsx` / `ContinueLearningCard.tsx` | Frontend Component | Role-path visualization and resume widgets. |
| `src/features/huddle/components/coach/MeetCoachDialog.tsx` | Frontend Component | Coach booking dialog. |
| `src/features/huddle/mappers/createHuddlePresentationModel.ts` | Frontend Hook | Maps raw API DTOs into the view-model shape used by `HuddleWorkspace`. |
| `src/features/huddle/exports/html/exportHuddleHtml.ts` | Frontend Component | Builds and downloads the HTML export. |
| `src/features/huddle/exports/html/htmlSanitizer.ts` | Frontend Component | Escapes HTML/URLs/filenames for the export. |
| `src/features/huddle/exports/powerpoint/exportHuddlePowerPoint.ts` | Frontend Component | Builds and downloads the PowerPoint export via `PptxGenJS`. |

### Frontend — Feature: Workflow Builder

| File | Layer | Responsibility |
|---|---|---|
| `src/features/workflow-builder/pages/WorkflowPage.tsx` | Frontend Component | Main multi-step Workflow builder page. |
| `src/features/workflow-builder/store/workflowAtoms.ts` | Frontend Hook | Jotai atoms for wizard state. |
| `src/features/workflow-builder/store/workflowSelectors.ts` | Frontend Hook | Derived-state selectors over the workflow atoms. |
| `src/features/workflow-builder/hooks/useWorkflowSelection.ts` | Frontend Hook | The step-machine driving the wizard (role → activities → generate). |
| `src/features/workflow-builder/hooks/useRoles.ts` / `useActivities.ts` / `useAiTools.ts` / `useWorkflowBuckets.ts` | Frontend Hook | Reference-catalog query hooks. |
| `src/features/workflow-builder/hooks/useDaySchedule.ts` | Frontend Hook | Pure client-side schedule generation (`createInitialSchedule`, bucket/time-slot assignment). |
| `src/features/workflow-builder/hooks/useAddWorkflowCalendarEvents.ts` | Frontend Hook | Mutation to push activities to Outlook calendar. |
| `src/features/workflow-builder/components/RoleSelector.tsx` | Frontend Component | Role selection step. |
| `src/features/workflow-builder/components/ActivitySelectionStep.tsx` | Frontend Component | Activity browsing/selection step. |
| `src/features/workflow-builder/components/DaySchedule.tsx` / `CalendarReviewDialog.tsx` | Frontend Component | Schedule visualization and calendar push review. |
| `src/features/workflow-builder/components/WorkflowSummary.tsx` | Frontend Component | Wizard summary/save entry point. |
| `src/features/workflow-builder/hooks/useWorkflowData.ts` | Frontend Hook | **Dead code** — superseded by `useWorkflowSelection.ts`. |
| `src/features/workflow-builder/utils/roleMappings.ts` | Frontend | **Dead code**, not referenced by any live import. |

### Frontend — Feature: Saved Workflows

| File | Layer | Responsibility |
|---|---|---|
| `src/features/saved-workflows/pages/SavedWorkflowsPage.tsx` | Frontend Component | Lists/restores/manages saved workflows. |
| `src/features/saved-workflows/hooks/useMyWorkflows.ts` / `useWorkflowById.ts` / `useSaveWorkflow.ts` / `useUpdateWorkflow.ts` / `useDeleteWorkflow.ts` / `useToggleFavorite.ts` | Frontend Hook | Saved-workflow CRUD + favoriting hooks. |
| `src/features/saved-workflows/components/WorkflowHistoryCard.tsx` / `SaveWorkflowDialog.tsx` / `DeleteWorkflowDialog.tsx` / `FavoriteButton.tsx` | Frontend Component | List item, save/delete dialogs, favorite control. |

### Frontend — Feature: Manager

| File | Layer | Responsibility |
|---|---|---|
| `src/features/manager/pages/ManagerDashboardPage.tsx` | Frontend Component | Manager-facing dashboard — **orphaned**: not currently wired into the router. |

### Backend — API Layer

| File | Layer | Responsibility |
|---|---|---|
| `Api/Program.cs` | Backend Infrastructure | Composition root: registers all services, auth, and the middleware pipeline in order. |
| `Api/Extensions/ServiceCollectionExtensions.cs` | Backend Infrastructure | Registers controllers and core API services. |
| `Api/Extensions/AuthenticationExtensions.cs` | Backend Infrastructure | Configures Microsoft Entra ID JWT bearer auth + Graph token acquisition. |
| `Api/Extensions/AuthorizationExtensions.cs` | Backend Infrastructure | Registers the `AccessAsUser` authorization policy. |
| `Api/Extensions/CorsExtensions.cs` | Backend Infrastructure | Builds the CORS policy from configured allowed origins; fails fast if empty. |
| `Api/Extensions/SwaggerExtensions.cs` | Backend Infrastructure | Configures OpenAPI/Swagger UI. |
| `Api/Authentication/AzureAdOptions.cs` / `ClaimsExtensions.cs` | Backend Infrastructure | Config binding + claim-reading helpers. |
| `Api/Authorization/AppRoles.cs` (empty placeholder) / `Policies.cs` | Backend Infrastructure | App-role constants (unused) and policy name constants. |
| `Api/Middleware/CorrelationIdMiddleware.cs` | Backend Infrastructure | Adds/propagates a correlation ID per request. |
| `Api/Middleware/ExceptionHandlingMiddleware.cs` | Backend Infrastructure | Converts unhandled exceptions (including `ValidationException`) into consistent error responses. |
| `Api/Middleware/RequestTimingMiddleware.cs` | Backend Infrastructure | Dev-only request timing logs. |

### Backend — Controllers (all 12)

| File | Responsibility |
|---|---|
| `Controllers/ActivitiesController.cs` | Read access to the Workflow activity catalog. |
| `Controllers/AiToolsController.cs` | Read access to the AI tools catalog. |
| `Controllers/CurrentUserController.cs` | Returns the signed-in user's identity (`/me`). |
| `Controllers/HuddleCoachingController.cs` | Coach discovery, availability, booking. |
| `Controllers/HuddleLaunchPlansController.cs` | Manager launch-plan CRUD + email draft creation. |
| `Controllers/HuddlePlansController.cs` | Get/save/reset a user's Huddle plan. |
| `Controllers/HuddleSessionsController.cs` | Session get/save/complete, activity completion, incomplete-session list. |
| `Controllers/HuddlesController.cs` | Catalog, detail, recommended path, voting. |
| `Controllers/RolesController.cs` | Read access to the role catalog. |
| `Controllers/WorkflowBucketsController.cs` | Read access to workflow bucket definitions. |
| `Controllers/WorkflowCalendarController.cs` | Pushes workflow activities to Outlook calendar. |
| `Controllers/WorkflowsController.cs` | Full CRUD + favoriting for saved workflows. |

*(A 13th file, `HuddlesController.cs.bak_taskH_...`, is a stray backup and is not compiled/active.)*

### Backend — Domain Entities (all 32)

| Entity | Responsibility |
|---|---|
| `Activity` | A Workflow-builder task, tied to a `Role` and `WorkflowBucket`. |
| `ActivityAiTool` | Join: links an `Activity` to a recommended `AiTool`. |
| `AiTool` | An AI tool suggested for activities. |
| `HuddleActivity` | A learning activity inside a Huddle topic/placement/phase. |
| `HuddleActivityAgent` | Join: links a `HuddleActivity` to a `HuddleAgent`. |
| `HuddleActivityResource` | Join: links a `HuddleActivity` to a `HuddleResource`. |
| `HuddleAgent` | An AI agent profile recommended in Huddles. |
| `HuddleAgentResource` | Join: links a `HuddleAgent` to a `HuddleResource`. |
| `HuddleFacilitatorGuide` | The facilitator script for one topic/placement. |
| `HuddleFocusArea` | A top-level grouping containing one or more `HuddleTopic`s. |
| `HuddleMcemStage` | A stage in the MCEM competency model referenced by topics. |
| `HuddlePhase` | One session phase (e.g. Prepare/Explore/Commit) of a topic/placement. |
| `HuddlePlacement` | One appearance of a `HuddleTopic` on a role's path (role-path item, orientation, or additional content) — carries `PathSection` and `Sequence`. |
| `HuddleResource` | A supporting resource (link/document). |
| `HuddleRolePathItem` | An ordered weekly item connecting a `HuddleSegmentRole`'s path to a `HuddleTopic` — legacy but still actively read. |
| `HuddleSegment` | A top-level organizational segment grouping `HuddleSegmentRole`s. |
| `HuddleSegmentRole` | A `Role` as it appears within one `HuddleSegment`; the anchor for role-based plans. |
| `HuddleTopic` | A Huddle "topic"/learning unit. |
| `HuddleTopicAgent` | Join: links a `HuddleTopic` to a recommended `HuddleAgent`. |
| `HuddleTopicMcemStage` | Join: links a `HuddleTopic` to an `HuddleMcemStage`. |
| `HuddleTopicResource` | Join: links a `HuddleTopic` to a `HuddleResource`. |
| `HuddleTopicRole` | Join: links a `HuddleTopic` to its aligned `Role`s. |
| `HuddleVote` | A user's upvote/downvote on a `HuddleTopic`. |
| `Role` | A job role/persona, shared by Workflow and Huddle. |
| `UserHuddleActivityProgress` | Tracks completion of one `HuddleActivity` within a `UserHuddleSession`. |
| `UserHuddleLaunchPlan` | A manager's team-launch plan. |
| `UserHuddlePlan` | A user's saved/recommended Huddle plan for a role. |
| `UserHuddlePlanItem` | One week's topic entry within a `UserHuddlePlan`. |
| `UserHuddleSession` | A user's in-progress/completed session for a `HuddleTopic`. |
| `UserWorkflow` | A user's saved Workflow-builder schedule. |
| `UserWorkflowActivity` | One `Activity` added to a `UserWorkflow`, with sort order. |
| `WorkflowBucket` | A category grouping `Activity` items. |

### Backend — Infrastructure

| File | Responsibility |
|---|---|
| `Infrastructure/Persistence/ApplicationDbContext.cs` | EF Core `DbContext`; registers all `DbSet`s and entity configurations. |
| `Infrastructure/Persistence/Configurations/*.cs` | One EF configuration class per entity (32). |
| `Infrastructure/Persistence/Interceptors/AuditableEntityInterceptor.cs` | Auto-populates created/modified audit fields on save. |
| `Infrastructure/Persistence/DesignTimeDbContextFactory.cs` | Enables `dotnet ef` design-time tooling. |
| `Infrastructure/Persistence/Migrations/*.cs` | EF Core migration history (8 migrations). |
| `Infrastructure/DependencyInjection.cs` | Registers the DbContext, Graph-backed services, typed HttpClients (anti-SSRF handler). |
| `Infrastructure/Identity/CurrentUserService.cs` | Reads the current user's object id/claims. |
| `Infrastructure/Mail/GraphHuddleLaunchMailService.cs` | Creates a draft launch email via Microsoft Graph. |
| `Infrastructure/Calendar/GraphWorkflowCalendarService.cs` | Creates Outlook calendar events via Graph. |
| `Infrastructure/Coaching/GraphCoachSchedulingService.cs` | Reads coach availability and books sessions via Graph. |
| `Infrastructure/Http/GraphAntiSsrfPolicyFactory.cs` | Builds the anti-SSRF-protected HTTP handler used by all Graph clients. |
| `Infrastructure/Options/CoachOptions.cs` / `CoachSchedulingOptions.cs` | Strongly-typed binding for the `CoachScheduling` config section. |

### Database — `database/fresh-install-v11.78/`

| Script | Responsibility |
|---|---|
| `00_README_Fresh_Install.md` | Run-order guide and merge report. |
| `01_Schema_All_Migrations.sql` | Full idempotent schema, generated from EF migrations. |
| `02_Preflight_Checks.sql` | Read-only checks that migration history landed and DB is empty. |
| `10_Workflow_Roles.sql` | Upserts Roles. |
| `11_Workflow_AiTools.sql` | Upserts the AI Tools catalog. |
| `12_Workflow_Buckets.sql` | Upserts Workflow Buckets. |
| `13_Workflow_Activities.sql` | Upserts Workflow Activities (largest workflow data file, 186 rows). |
| `14_Workflow_Activity_AiTools.sql` | Upserts Activity-to-AI-Tool mappings (215 rows). |
| `15_Workflow_Verify.sql` | Verifies expected row counts for the Workflow module. |
| `20_Huddle_Reference_Data.sql` | Seeds Segments, Roles, SegmentRoles, FocusAreas, McemStages. |
| `20b_Fix_Huddle_Role_Descriptions.sql` | Safe additive backfill correcting missing role descriptions. |
| `20c_OPTIONAL_Backfill_New_Role_Descriptions_DRAFT.sql` | Optional draft backfill, intended for manual review. |
| `21_Huddle_Topics.sql` | Seeds Huddle Topics and their aligned roles. |
| `22_Huddle_Placements.sql` | Seeds Huddle Placements + compatible role-path items (103 placements: 64 role-path, 10 orientation, 29 additional). |
| `23_Huddle_Phases.sql` | Seeds three phases per placement (309 phases). |
| `24_Huddle_Facilitator_Guides.sql` | Seeds one facilitator guide per placement. |
| `25_Huddle_Agents.sql` | Seeds AI agents. |
| `26_Huddle_Resources.sql` | Seeds supporting resources. |
| `27_Huddle_Activities.sql` | Seeds Huddle Activities (403 total: 264 Featured, 139 Extended). |
| `28_Huddle_Activity_Prerequisites.sql` | Seeds self-referencing activity prerequisites (154 of 403). |
| `29_Huddle_Topic_And_Agent_Joins.sql` | Seeds Topic↔Stage/Agent/Resource and Agent↔Resource joins. |
| `30_Huddle_Activity_Joins.sql` | Seeds Activity↔Agent and Activity↔Resource joins. |
| `40_Validate_Everything.sql` | Read-only, run last: validates both modules against expected counts. |
| `DATA_CORRECTIONS.md` / `SKIPPED_ROWS.md` / `expected_counts.txt` | Documentation of data-cleanup decisions and expected row counts. |

Several `.bak_*` backup files exist alongside some of these scripts and inside the frontend (e.g. `Header.tsx.bak_headerlayout_...`, `22_Huddle_Placements.sql.bak_taskN_...`) — these are dead artifacts from prior edit sessions, not part of the active codebase, and are called out here as repo-hygiene debt rather than active logic.

---

## Part 14 — File-to-File Flow Maps

**Role Path:** `HuddlePage.tsx` (guided view) → `useMyHuddlePlan.ts` → `getMyHuddlePlan.ts` → `HuddlePlansController.cs::GetMine` → `GetMyHuddlePlanQueryHandler` → `IApplicationDbContext` (plan/placement tables) → `RecommendedPath.tsx` → `RolePathWeekMenu.tsx` (move/replace/reset loop back to `useSaveHuddlePlan.ts`/`useResetHuddlePlan.ts` → `HuddlePlansController.cs::SaveMine`/`ResetMine`).

**All Topics (huddle catalog):** `HuddlePage.tsx` (evergreen view) → `HuddleFilterBar.tsx` → `useHuddleCatalog.ts` → `getHuddleCatalog.ts` (+ `buildHuddleCatalogQueryString.ts`) → `HuddlesController.cs::GetCatalog` → `GetHuddleCatalogQueryHandler.cs` → `dbContext.HuddleTopics` (via `HuddleTopicGraph`) → `HuddleMappings.ToCatalogItem` → `HuddleCatalog.tsx` → `HuddleCatalogCard.tsx`.

**Audience filtering:** `HuddleAudienceSelect.tsx` (used by both `HuddleFilterBar.tsx` and `HuddlePage.tsx`) → role list from `useHuddleAudienceRoles.ts` → `GET /api/roles?module=Huddle` → `RolesController.cs::GetRoles` → selection change flows back to `HuddlePage.tsx`'s `handleAudienceChange`/`additionalRoleExternalId` → feeds `useHuddleCatalog`'s `additionalContentRoleExternalId` param → `GetHuddleCatalogQueryHandler.cs`'s `HuddleRolePathReader`.

**Huddle loading (session):** `HuddlePage.tsx`'s `selectedExternalId`/`selectedPlacementExternalId` → `useHuddleById.ts` (detail) + `useHuddleSession.ts` (session) → `getHuddleById.ts` / `getHuddleSession.ts` → `HuddlesController.cs::GetById` + `HuddleSessionsController.cs::GetMine` → their handlers → EF Core reads → `createHuddlePresentationModel.ts` → `HuddleWorkspace.tsx`.

**Workflow (builder):** `WorkflowPage.tsx` → `useWorkflowSelection.ts` (Jotai) + `useRoles.ts`/`useActivities.ts`/`useAiTools.ts`/`useWorkflowBuckets.ts` → each backend controller (`RolesController.cs`, `ActivitiesController.cs`, `AiToolsController.cs`, `WorkflowBucketsController.cs`) → `ActivitySelectionStep.tsx` → `WorkflowSummary.tsx` → `useDaySchedule.ts` (client-side scheduling) → `DaySchedule.tsx`.

**HTML export:** `HuddlePage.tsx`'s `exportSelectedHuddleHtml()` → dynamic `import("../exports/html")` → `exportHuddleHtml.ts` (`createHuddleHtmlExport` + `exportHuddleHtml`) → `htmlTemplate.ts` (`createHtmlDocument`, `downloadHtmlFile`), `htmlSanitizer.ts`, `huddleGuideStyles.ts`, `huddleGuideInteractions.ts`, `huddleGuideAssets.ts`, `fontStack.ts` — no backend hop.

**Authentication:** `main.tsx` → `AuthProvider.tsx` → `ProtectedRoute.tsx` → `AuthGate.tsx` → `useAccessToken.ts` → `useApiClient.ts` → `apiClient.ts` (bearer header) → backend `[Authorize(Policy = Policies.AccessAsUser)]` → `CurrentUserService.cs`.

**Database operations (representative read + write):**
*Read:* `ActivitiesController.cs::GetActivities` → `GetActivitiesQueryHandler` → `IApplicationDbContext.Activities` (`AsNoTracking`) → `ApplicationDbContext.cs` → SQL Server.
*Write:* `WorkflowsController.cs::Save` → `SaveWorkflowCommandHandler::Handle` → builds `UserWorkflow` + `UserWorkflowActivity` graph → `dbContext.UserWorkflows.Add(...)` → `SaveChangesAsync` → `ApplicationDbContext.cs` → SQL Server.

---

## Part 15 — API Reference

All 34 endpoints require authentication under the single `AccessAsUser` policy.

| Endpoint | Purpose | Request | Response |
|---|---|---|---|
| GET `/api/activities` | List workflow activities, filterable by role/bucket/AI tool/category. | `ActivityFilterRequest` (query) | `IReadOnlyList<ActivityResponse>` |
| GET `/api/activities/{id}` | Get one activity by numeric ID. | — | `ActivityResponse` |
| GET `/api/activities/by-role/{roleExternalId}` | List activities available to a role. | — | `IReadOnlyList<ActivityResponse>` |
| GET `/api/ai-tools` | List the AI tool catalog. | `includeInactive` (query) | `IReadOnlyList<AiToolResponse>` |
| GET `/api/auth/me` | Get the signed-in user's profile. | — | `CurrentUserResponse` |
| GET `/api/huddle-coaching/coaches` | List approved coaches, optionally for a Huddle. | `huddleExternalId` (query) | `IReadOnlyList<CoachResponse>` |
| GET `/api/huddle-coaching/coaches/{coachExternalId}/availability` | Get a coach's open slots in a time window. | `startUtc`, `endUtc`, `durationMinutes` | `CoachAvailabilityResponse` |
| POST `/api/huddle-coaching/bookings` | Book a coaching appointment. | `BookCoachRequest` | `CoachBookingResponse` |
| GET `/api/huddle-launch-plans/me` | Get the current user's launch plan. | — | `HuddleLaunchPlanResponse` |
| PUT `/api/huddle-launch-plans/me` | Create/update the launch plan. | `SaveHuddleLaunchPlanRequest` | `HuddleLaunchPlanResponse` |
| POST `/api/huddle-launch-plans/me/email-drafts` | Create a launch-announcement email draft (never sent). | `CreateHuddleLaunchEmailDraftRequest` | `HuddleLaunchEmailDraftResponse` |
| DELETE `/api/huddle-launch-plans/me` | Delete/reset the launch plan. | — | 204 |
| GET `/api/huddle-plans/me` | Get (or auto-recommend) the user's Huddle plan for a role. | `roleExternalId` (query) | `HuddlePlanResponse` |
| PUT `/api/huddle-plans/me` | Save a customized plan (optimistic concurrency). | `SaveHuddlePlanRequest` | `HuddlePlanResponse` |
| DELETE `/api/huddle-plans/me/{roleExternalId}` | Reset the plan to the governed recommendation. | — | 204 |
| GET `/api/huddles/{externalId}/session` | Get the user's session/progress. | `placementExternalId` (optional) | `HuddleSessionResponse` |
| PUT `/api/huddles/{externalId}/session` | Start/update a session. | `SaveHuddleSessionRequest` | `HuddleSessionResponse` |
| PUT `/api/huddles/{externalId}/session/activities/{activityExternalId}` | Mark an activity complete/incomplete. | `SetHuddleActivityCompletionRequest` | `HuddleSessionResponse` |
| POST `/api/huddles/{externalId}/session/complete` | Mark the session complete. | `CompleteHuddleSessionRequest` | `HuddleSessionResponse` |
| GET `/api/huddle-sessions/me/incomplete` | List resumable sessions. | — | `IReadOnlyList<IncompleteHuddleSessionResponse>` |
| GET `/api/huddles` | Browse/search the published catalog. | `HuddleCatalogFilterRequest` (query) | `IReadOnlyList<HuddleCatalogItemResponse>` |
| GET `/api/huddles/recommended-path` | Get the governed 7-week path for a role. | `roleExternalId` (query) | `RecommendedHuddlePathResponse` |
| GET `/api/huddles/votes` | List the user's votes. | — | `IReadOnlyList<HuddleVoteResponse>` |
| PUT `/api/huddles/{externalId}/vote` | Cast/update a vote. | `SetHuddleVoteRequest` | `HuddleVoteResponse` |
| DELETE `/api/huddles/{externalId}/vote` | Remove a vote. | — | 204 |
| GET `/api/huddles/{externalId}` | Get full detail (phases/activities/guide). | `placementExternalId` (optional) | `HuddleDetailResponse` |
| GET `/api/roles` | List the role catalog. | `includeInactive`, `module` | `IReadOnlyList<RoleResponse>` |
| GET `/api/workflow-buckets` | List bucket definitions. | `includeInactive` | `IReadOnlyList<WorkflowBucketResponse>` |
| POST `/api/workflows/calendar/events` | Add activities to Outlook calendar. | `AddWorkflowCalendarEventsRequest` | `AddWorkflowCalendarEventsResponse` |
| GET `/api/workflows` | List saved workflows (search/favorite filters). | `search`, `isFavorite` | `IReadOnlyCollection<WorkflowSummaryResponse>` |
| GET `/api/workflows/favorites` | List favorited workflows. | — | `IReadOnlyCollection<WorkflowSummaryResponse>` |
| GET `/api/workflows/{id}` | Get one owned workflow. | — | `WorkflowResponse` |
| POST `/api/workflows` | Create a new workflow. | `SaveWorkflowRequest` | `WorkflowResponse` (201) |
| PUT `/api/workflows/{id}` | Update a workflow (optimistic concurrency). | `UpdateWorkflowRequest` | `WorkflowResponse` |
| DELETE `/api/workflows/{id}` | Delete a workflow. | — | 204 |
| PATCH `/api/workflows/{id}/favorite` | Toggle favorite. | `ToggleFavoriteRequest` | `WorkflowSummaryResponse` |

## Part 16 — Data Flow Explanation (by Data Type)

**Topic (Huddle content)**
What is it? A `HuddleTopic` is one learning unit — the thing a Huddle is "about." Where is it? `Domain/Entities/HuddleTopic.cs`, seeded by `database/fresh-install-v11.78/21_Huddle_Topics.sql`. How does it flow? Seeded into `HuddleTopics` → read by `GetHuddleCatalogQueryHandler`/`GetHuddleByIdQueryHandler` → mapped to `HuddleCatalogItemResponse`/`HuddleDetailResponse` → rendered by `HuddleCatalog.tsx`/`HuddleWorkspace.tsx`.

**Roles**
What is it? A `Role` (e.g. Account Executive) is shared by both Workflow and Huddle features, and `HuddleSegmentRole` is how a `Role` is anchored inside a Huddle "segment" for path purposes. Where is it? `Domain/Entities/Role.cs`/`HuddleSegmentRole.cs`, seeded by `10_Workflow_Roles.sql` and `20_Huddle_Reference_Data.sql`. How does it flow? Read via `GET /api/roles` (`RolesController.cs` → `GetRolesQueryHandler`) → drives the Workflow builder's `RoleSelector.tsx` and the Huddle `HuddleAudienceSelect.tsx`.

**Huddles (sessions/progress)**
What is it? A `UserHuddleSession` tracks one user's progress through one Huddle topic. Where is it? `Domain/Entities/UserHuddleSession.cs`, `UserHuddleActivityProgress.cs`. How does it flow? Created/updated via `HuddleSessionsController.cs`'s handlers → drives `HuddleWorkspace.tsx`'s phase/activity checklist UI and the "continue learning" resume cards.

**Workflows**
What is it? A `UserWorkflow` is a saved, named schedule of chosen `Activity` rows for a role. Where is it? `Domain/Entities/UserWorkflow.cs`/`UserWorkflowActivity.cs`. How does it flow? Built client-side in the Workflow builder wizard (Jotai state + `useDaySchedule.ts`) → saved via `POST /api/workflows` → listed/restored via `GET /api/workflows`/`GET /api/workflows/{id}` on the Saved Workflows page.

**Audience**
What is it? The set of roles selected to filter the Huddle catalog or scope a launch plan. Where is it? Purely a frontend concept — `HuddleAudienceSelect.tsx`'s `selectedIds`, passed to the backend only as `roleExternalId`/`additionalContentRoleExternalId` query parameters; there is no dedicated "Audience" database table.

**Tools/Agents**
What is it? `AiTool` entities are recommended software tools for Workflow activities; `HuddleAgent` entities are AI-agent personas recommended inside Huddles. Where is it? `Domain/Entities/AiTool.cs`, `ActivityAiTool.cs`, `HuddleAgent.cs`, `HuddleActivityAgent.cs`, `HuddleTopicAgent.cs`. How does it flow? Seeded by `11_Workflow_AiTools.sql`/`25_Huddle_Agents.sql` → read via `GET /api/ai-tools` and embedded directly in Huddle catalog/detail responses via join helpers like `HuddlePlacementActivityAgents`.

**Huddle Activities**
What is it? A `HuddleActivity` is one concrete task/exercise inside a Huddle phase (distinct from Workflow's `Activity` entity — they are two separate concepts that happen to share a similar name). Where is it? `Domain/Entities/HuddleActivity.cs`, seeded by `27_Huddle_Activities.sql` (403 rows: 264 "Featured", 139 "Extended" practice tier), with prerequisites from `28_Huddle_Activity_Prerequisites.sql`. How does it flow? Read as part of Huddle detail/session responses → checkbox-completed in `HuddleWorkspace.tsx` → completion persisted via `SetHuddleActivityCompletionCommand`.

**Export data**
What is it? The combined view-model (`HuddlePresentationModel`) assembled purely in the browser from already-fetched Huddle detail + session data. Where is it? `src/features/huddle/mappers/createHuddlePresentationModel.ts`. How does it flow? Never sent back to the server — it is consumed directly by `exports/html/exportHuddleHtml.ts` and `exports/powerpoint/exportHuddlePowerPoint.ts` to build downloadable files entirely client-side.

---

## Part 17 — HTML Export Flow

**What is it?** A feature that turns a completed (or in-progress) Huddle into a single, self-contained, shareable HTML file — a "guide" — that opens in any browser without needing the app or a login.

**Where is it?** `src/features/huddle/exports/html/` — `exportHuddleHtml.ts`, `htmlTemplate.ts`, `htmlSanitizer.ts`, `htmlStyles.ts`, `huddleGuideStyles.ts` (2,499 lines — some of its CSS layers are unused/dead), `huddleGuideInteractions.ts`, `huddleGuideAssets.ts` (embeds logos as data-URIs so the file needs no external images), `fontStack.ts`.

**Why is it used?** So a learner or manager can keep, print, or forward a record of a Huddle's content and their own completion state without needing backend access.

**How does it work?** `HuddlePage.tsx`'s `exportSelectedHuddleHtml()` dynamically imports the export module (kept out of the main bundle until needed) and calls `exportHuddleHtml(presentationModel, options)`. This calls `createHuddleHtmlExport`, which assembles a full HTML document: inline `<style>` from `huddleGuideStyles.ts`/`htmlStyles.ts`, inline `<script>` interactions from `huddleGuideInteractions.ts`, and content escaped via `htmlSanitizer.ts`'s `escapeHtml`/`safeExternalUrl`/`safeHtmlFileName` (so a Huddle's own text content can never break out of the HTML or inject a script). `downloadHtmlFile()` (`htmlTemplate.ts`) then creates a `Blob`, gets an object URL, and simulates a click on a hidden `<a download>` element to trigger the browser's normal file-save flow.

**Confirmed:** this entire flow is 100% client-side — an exhaustive search of `features/huddle/exports/` found zero `apiClient`/`fetch`/`useQuery`/`useMutation` references anywhere in that folder. The same is true of the PowerPoint export (`exports/powerpoint/`) and the "Custom Learning Plan"/"Launch Package" exports.

**Example from this application:** the "Weekly Pulse" closing panel in the exported HTML includes the line "Rate this week's Huddle before you close." (added directly into the `TEMPLATE` object in `exportHuddleHtml.ts`), demonstrating that all export copy is defined and rendered entirely within this one client-side module.

---

## Part 18 — Error Handling

**What is it?** A consistent way of turning something that goes wrong — bad input, a database conflict, an unexpected exception — into a predictable HTTP response the frontend can understand, plus a consistent way the frontend displays that to the user.

**Where is it (backend)?** `Api/Middleware/ExceptionHandlingMiddleware.cs`, registered early in `Program.cs`'s pipeline. It specifically catches `FluentValidation.ValidationException` (thrown automatically by `ValidationBehavior<TRequest,TResponse>` whenever a request fails its validator) and converts it into an HTTP 400 response carrying the validation failures. Other unhandled exceptions are converted into a generic Problem-Details-shaped error response with an appropriate status code, without leaking internal exception details to the client.

**Where is it (frontend)?** `src/api/apiClient.ts` parses RFC7807-ish `{ title, detail }` error bodies from the backend into its own local `ApiError` class, which calling hooks/components can inspect (e.g. to show a specific validation message). A separate, more elaborate `ApiError`/`ApiProblemDetails` implementation exists in `src/api/apiError.ts`, but it is dead/unused code — `apiClient.ts` does not use it.

**How does it work end-to-end (example: saving an invalid workflow name)?** `SaveWorkflowCommand` fails `SaveWorkflowValidator`'s rules → `ValidationBehavior` throws `ValidationException` before the handler ever runs → `ExceptionHandlingMiddleware` catches it and returns HTTP 400 with the failure messages → `apiClient.ts` parses the body into `ApiError` → the calling mutation's `onError` handler surfaces the message, typically rendered via `components/feedback/ErrorState.tsx` or an inline form error.

**Optimistic-concurrency conflicts:** a stale `RowVersion` sent by the frontend (e.g. two tabs editing the same Huddle plan) causes the corresponding handler to fail the save; this surfaces to the user as a save error rather than silently overwriting the other change.

---

## Part 19 — Configuration

No secret values are reproduced anywhere in this document — where a secret/connection-string/token value exists, this section says only that a configured value is present.

### Backend — `appsettings.json` / `appsettings.Development.json`
(Both files currently contain the same key set and, in this checked-in copy, the same values.)

- `AzureAd:Instance` — Microsoft login authority URL (not secret).
- `AzureAd:TenantId` — the Entra tenant identifier.
- `AzureAd:ClientId` — the app registration identifier.
- `AzureAd:Audience` — the API's audience identifier (`api://<clientId>`).
- `ConnectionStrings:DefaultConnection` — **Secret/configured value exists here; the actual value is intentionally not documented.**
- `Cors:AllowedOrigins` — array of allowed frontend origins (currently a single local development origin).
- `Logging:LogLevel:Default`, `Logging:LogLevel:Microsoft.AspNetCore`, `Logging:LogLevel:Microsoft.EntityFrameworkCore.Database.Command` — standard ASP.NET Core log-level settings.

A commented-out alternate configuration block also references `AzureAd:Audiences`, `AzureAd:Protocols:Bearer:TokenTypes:AccessToken:*`, `MiseVersion`, and `AllowedHosts` — these are present only inside a code comment and are not active configuration.

### Backend — configuration referenced in code but not present in either appsettings file
- `CoachScheduling` section (bound in `Infrastructure/DependencyInjection.cs`), with `CoachScheduling:GraphScopes` and `CoachScheduling:Coaches` (an array of coach profile objects). **This entire section is absent from both checked-in appsettings files** — it must be supplied through an environment not committed to source control (e.g. user secrets, App Service configuration, or environment variables) for coach-booking features to function.

### Frontend — `.env.development`
- `VITE_API_BASE_URL` — the backend API's base URL.
- `VITE_AZURE_TENANT_ID` — the Entra tenant identifier.
- `VITE_AZURE_CLIENT_ID` — the frontend app registration identifier (matches the backend's `AzureAd:ClientId`).
- `VITE_API_SCOPE` — the OAuth scope requested for backend API calls.
- `VITE_REDIRECT_URI` — the post-login redirect URL.

### Frontend — `.env.example`
Same key names as `.env.development`, all left blank as placeholders for a new environment to fill in.

---

## Part 20 — Azure / Deployment Flow

Only what was actually found in the repository is documented here — nothing is assumed.

**Azure-related packages/services actually used:**
- `Microsoft.Identity.Web` (backend) — Entra ID JWT bearer authentication, and delegated ("on-behalf-of") token acquisition for calling Microsoft Graph as the signed-in user.
- `Microsoft.Security.AntiSSRF` (backend) — hardens every outbound Graph `HttpClient`.
- Microsoft Graph, called via plain `HttpClient` REST calls (`https://graph.microsoft.com/v1.0/...`) in `Infrastructure/Mail/GraphHuddleLaunchMailService.cs`, `Infrastructure/Calendar/GraphWorkflowCalendarService.cs`, and `Infrastructure/Coaching/GraphCoachSchedulingService.cs` — notably, the official `Microsoft.Graph` SDK NuGet package is **not** used anywhere in this codebase.
- `@azure/msal-browser` / `@azure/msal-react` (frontend) — Entra ID sign-in and token acquisition in the browser.

**Explicitly searched for and not found anywhere in the repository:**
- Any Azure Key Vault SDK (`Azure.Security.KeyVault.*`).
- Any Application Insights SDK (`Microsoft.ApplicationInsights.*`).
- Any Azure Storage SDK (`Azure.Storage.*`, `BlobServiceClient`).

**Deployment/CI artifacts — confirmed search results:**

| Item | Result |
|---|---|
| `.github/workflows/` | The folder exists but contains **zero files** — no CI/CD pipeline is currently defined. |
| Bicep/ARM (`*.bicep`) | Not found anywhere in the repo. |
| Terraform (`*.tf`) | Not found anywhere in the repo. |
| `Dockerfile*` | Not found anywhere in the repo. |
| `*.yml` / `*.yaml` | Not found anywhere in the repo. |
| Azure Static Web App config | Not found anywhere in the repo. |
| `azure-pipelines*` | Not found anywhere in the repo. |

**Conclusion:** this repository currently ships with **no deployment automation or infrastructure-as-code of any kind.** The only Azure integration present is at the application level: Entra ID authentication (backend + frontend) and outbound Microsoft Graph calls for mail drafts, calendar events, and coach scheduling. How and where the application is actually deployed and hosted today could not be determined from this repository's contents.

> **Could not completely trace from the current source code:** the actual hosting environment (App Service, Container Apps, VM, etc.), the production database provisioning process, and any release/build pipeline — none of this exists in the repository to trace.

## Part 21 — How the Whole Application Works (Plain Explanation)

Imagine the app as three rooms connected by a hallway.

The first room is the **website** the user actually sees in their browser — built with React. When you open it, it first checks with Microsoft "who are you?" using your work Microsoft account. Once it knows who you are, it shows you either the **Workflow** room (build yourself a personalized daily task list) or the **Huddle** room (go through short guided learning sessions).

Whenever the website needs data — a list of roles, a Huddle's content, your saved plan — it walks down the hallway and asks the second room, the **backend server**, for it. Every single question it asks includes a little ID badge (a security token) proving who's asking. The backend checks the badge, then goes into the third room — the **database** — to actually look up or save the answer, using a well-organized system (Entity Framework Core) instead of writing raw database instructions by hand every time.

For a few special actions — like booking a coach or adding something to your Outlook calendar — the backend also makes a phone call to Microsoft itself (Microsoft Graph), on your behalf, using that same badge, so it really does create a real meeting or a real draft email in your own mailbox.

Everything you build — a Workflow, a completed Huddle session, a vote — gets saved in the database so it's still there the next time you sign in. Exporting a Huddle to HTML or PowerPoint, though, doesn't involve the backend at all — the browser builds that file completely on its own, on your machine.

---

## Part 22 — How to Explain This Application to a Superior

### 2–3 minute spoken version

"This is our Frontier Accelerator app — it does two things for our people. First, it helps someone build a personalized daily 'Workflow,' a schedule of the tasks they should be doing, based on their role. They pick a role, pick the recommended activities, the app lays out a day, and they can push it straight into their Outlook calendar with one click. Second, it runs 'Huddles' — short, structured learning sessions with a guided weekly path per role, or a free-browse catalog of every topic. As people work through a Huddle, their progress is saved, they can vote on topics, book time with a coach, and export a finished Huddle as a shareable PDF-like HTML page or a PowerPoint deck. Managers get a separate view to plan and announce a team rollout. Everything is signed in with the same Microsoft account people already use for email, so there's no separate password to manage, and anything the app does in Outlook or Teams — like booking a coach meeting — happens as that actual person, not some generic system account."

### More technical version

"Architecturally, it's a React 19 single-page app talking to a .NET 9 Web API over a REST-ish JSON contract, secured end-to-end with Microsoft Entra ID — MSAL on the frontend, Microsoft.Identity.Web validating bearer tokens on the backend, with a single `AccessAsUser` authorization policy across all 12 controllers. The backend follows Clean Architecture with CQRS via MediatR: every request is a Command or Query handled by exactly one handler class, with a single shared FluentValidation pipeline behavior enforcing input validation before any handler runs. Data access goes straight through EF Core 9's DbContext — no repository layer — against a SQL Server database. For anything that touches the user's Outlook or Teams (coach booking, calendar events, launch email drafts), we call Microsoft Graph on-behalf-of the signed-in user, protected by an anti-SSRF hardened HTTP handler. On the frontend, all server data flows through TanStack React Query for caching and invalidation, while purely local UI/wizard state uses Jotai atoms — so there's a clean separation between 'what the server owns' and 'what the browser owns.' Exports (HTML, PowerPoint) are entirely client-side, no backend round-trip. Right now there's no CI/CD pipeline or infrastructure-as-code checked into the repo, so deployment is currently a manual/undocumented process from the codebase's point of view."

---

## Part 23 — Likely Questions from a Superior, and Simple Answers

**"Is user data secure?"**
Yes — every request requires a valid Microsoft Entra ID token, and the app never stores its own separate passwords. The database connection string and any Graph credentials are configured values that are never checked into source control in plaintext where this documentation could see them.

**"What happens if two people edit the same thing at once?"**
Several key writes (saving a Huddle plan, updating a session, updating a workflow) use "optimistic concurrency" — a version stamp travels with each read, and a save is rejected if that stamp is out of date, rather than silently overwriting someone else's change.

**"Can a manager see who hasn't done their Huddles?"**
There's a Launch Planner for managers to plan and announce a rollout, and a per-user "incomplete sessions" list exists for the signed-in user's own dashboard, but a manager-facing rollup/reporting dashboard specifically was found in the code as an orphaned page (`ManagerDashboardPage.tsx`) not currently wired into the app's navigation — **could not completely trace this as an active, reachable feature from the current source code.**

**"What happens if the Huddle export contains something odd, like special characters?"**
The HTML export runs everything through a sanitizer (`htmlSanitizer.ts`) before inserting it into the page, specifically to prevent broken or unsafe HTML output.

**"Do we have a CI/CD pipeline / automated deployment?"**
No — the repository currently has an empty `.github/workflows/` folder and no Dockerfile, Bicep, Terraform, or other deployment configuration. Deployment today is not automated from what this repository shows.

**"Are there any role-based permissions, like 'Manager' vs. 'Employee'?"**
Not yet enforced — there's a placeholder for Entra app roles (`AppRoles.cs`) but it's currently empty; every authenticated user currently has the same level of access to every endpoint.

**"What about the two coaching/booking and calendar features — do they actually create real meetings, or just log an idea?"**
They create real Microsoft Graph objects — an actual calendar event, an actual draft email — in the signed-in user's own mailbox, using their own delegated permissions, not a shared service account.

**"Is there any dead code or cleanup we should plan for?"**
Yes, a modest amount was found during this review: a duplicated `HuddleWorkspace` function definition in one file, a few unused hooks (`useRecommendedHuddlePath.ts`, `useWorkflowData.ts`), an unused error-handling class (`apiError.ts`'s elaborate implementation), an orphaned manager dashboard page, and several stray `.bak_*` backup files left in both the frontend and the database script folder from prior editing sessions. None of this is causing incorrect behavior today, but it's worth a future cleanup pass.

---

## Part 24 — Glossary

**Activity** — In the Workflow builder, a single recommended task for a role. (Note: `HuddleActivity` is a *different* entity, used inside Huddles — same word, two distinct concepts.)

**AITO / Frontier Accelerator** — The two names used for this application throughout the codebase and this document.

**Bearer token** — A piece of text proving "I am signed in as this user," attached to every API request.

**Bucket (Workflow Bucket)** — A category used to group similar activities together in the Workflow builder (e.g. morning tasks vs. midday tasks).

**Clean Architecture** — A way of organizing backend code so business rules (Application, Domain) don't depend on technical details (Api, Infrastructure), only the other way around.

**Command** — A CQRS request that changes data (create/update/delete).

**CORS (Cross-Origin Resource Sharing)** — A browser security rule; the backend must explicitly allow the frontend's web address before the browser lets them talk to each other.

**CQRS** — Command Query Responsibility Segregation: splitting "read" operations (Queries) from "write" operations (Commands) into separate, focused classes.

**DbContext** — The one class (`ApplicationDbContext`) EF Core uses to talk to the database.

**DTO (Data Transfer Object)** — A simple object shaped just for sending data over the API (in this app, these live in the `Contracts` project).

**Entity** — A class representing one "thing" the app cares about and stores in the database (e.g. `HuddleTopic`, `Role`).

**Entra ID (formerly Azure AD)** — Microsoft's identity service used for sign-in.

**Handler** — The class that actually does the work for one Command or Query.

**Huddle** — A guided, structured learning session on one topic.

**HuddlePlacement** — One "slot" where a Huddle topic appears on a role's path (with a section like Role Path / Orientation / Additional, and a week number).

**MediatR** — The library that routes each Command/Query to its one matching handler.

**MSAL** — Microsoft Authentication Library; the frontend code that handles Microsoft sign-in.

**Optimistic concurrency** — Preventing accidental overwrites by checking a version stamp before saving.

**Query** — A CQRS request that only reads data, never changes it.

**Role** — A job persona (e.g. Account Executive) used to personalize both Workflows and Huddle paths.

**Role Path** — The guided, week-by-week recommended sequence of Huddles for a given role.

**Validator** — A class describing the rules a Command/Query's data must satisfy before its handler is allowed to run.

**Workflow** — A user's saved, personalized schedule of activities.

---

## Part 25 — Final Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              USER'S BROWSER                               │
│                                                                             │
│   React 19 SPA (Vite + TypeScript + Tailwind)                             │
│   ┌───────────────┐   ┌──────────────────┐   ┌─────────────────────────┐  │
│   │  MSAL (auth)  │   │  React Query     │   │  Jotai (local UI state) │  │
│   │  sign-in +    │   │  (server-state   │   │  wizard steps, view     │  │
│   │  token cache  │   │  cache)          │   │  toggles, selections    │  │
│   └───────┬───────┘   └────────┬─────────┘   └─────────────────────────┘  │
│           │                    │                                          │
│           ▼                    ▼                                          │
│   ┌─────────────────────────────────────────────┐                        │
│   │  apiClient.ts — attaches Bearer token,        │                       │
│   │  parses errors, calls backend endpoints       │                       │
│   └───────────────────────┬───────────────────────┘                      │
│                            │                                              │
│   ┌────────────────────────┴───────────────────────┐                     │
│   │ Client-only features (no backend call at all):  │                    │
│   │  • HTML export   • PowerPoint export             │                    │
│   │  • Day-schedule generation  • Custom Learning     │                    │
│   │    Plan (localStorage)      • ICS calendar export │                    │
│   └───────────────────────────────────────────────────┘                  │
└───────────────────────────┬─────────────────────────────────────────────┘
                             │  HTTPS + Bearer JWT
                             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     BACKEND — .NET 9 Web API (Clean Architecture)          │
│                                                                             │
│  Api layer                                                                 │
│   • 12 Controllers, all under one "AccessAsUser" auth policy               │
│   • Microsoft.Identity.Web validates the JWT                               │
│   • ExceptionHandlingMiddleware, CorrelationIdMiddleware                   │
│           │  sends Command/Query via MediatR                              │
│           ▼                                                               │
│  Application layer                                                        │
│   • One folder per Command/Query: Request + Handler + Validator           │
│   • ValidationBehavior<T,R> — the one shared MediatR pipeline behavior     │
│           │  uses IApplicationDbContext directly (no repositories)        │
│           ▼                                                               │
│  Infrastructure layer                                                     │
│   • ApplicationDbContext (EF Core 9) ──────────────┐                      │
│   • GraphWorkflowCalendarService  ─┐                │                      │
│   • GraphCoachSchedulingService   ─┼─► Microsoft     │                     │
│   • GraphHuddleLaunchMailService  ─┘   Graph (Outlook/Teams, on-behalf-of) │
│                                     │                                      │
│  Domain layer                       │                                     │
│   • 32 Entities (Role, HuddleTopic, HuddlePlacement, UserWorkflow, ...)    │
└─────────────────────────────────────┼───────────────────────────────────┘
                                       ▼
                          ┌───────────────────────────┐
                          │   SQL Server database      │
                          │  (schema + seed data from   │
                          │   database/fresh-install-   │
                          │   v11.78/ scripts, kept in   │
                          │   sync with EF migrations)  │
                          └───────────────────────────┘
```

---

*This document was produced through a read-only analysis of the actual repository source code. No application code, configuration, or data was modified while producing it.*

