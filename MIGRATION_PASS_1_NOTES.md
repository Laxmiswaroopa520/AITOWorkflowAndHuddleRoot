# AITO Workflow & Huddle UX Migration, Pass 1

## Implemented

- Added a protected AITO experience selector as the application home page.
- Added clear entry points for **Build My Workflow** and **Run a Huddle**.
- Reworked the global header into a shared Microsoft-inspired application shell.
- Added Home, Workflow, My Workflows, Huddle, and Launch Planner navigation.
- Kept the existing MSAL sign-in/sign-out behavior intact.
- Renamed the Huddle journey navigation to **Onboarding → Role Path → Additional Topics**.
- Added Huddle persona selection for **Team Member, Facilitator, and Manager**.
- Added persona-specific Huddle positioning/copy.
- Added a Manager-only primary action to open Launch Planner.
- Added a new Launch Planner route and responsive UI.
- Added launch configuration for organization/team, cohort, and first Huddle date.
- Added generated **Launch Activities** with calculated dates, owners, completion states, and readiness progress.
- Kept the existing API-backed Huddle catalog, role path, votes, sessions, activity completion, notes, and saved plan behavior.
- Aligned Workflow page background/progress treatment with the Huddle visual system.

## Deliberately not migrated from the prototype architecture

The V5 prototype stores several experiences in localStorage. Those stores were not copied into the integrated app because this application already has an authenticated ASP.NET + Azure SQL architecture.

The Huddle persona selection is currently session-scoped UI state. It should move to the user profile API once the profile/persona contract is approved.

The new Launch Planner is currently frontend state only. Production persistence needs backend support.

## Backend/API work required next

Recommended entities/API areas:

1. `HuddleUserPreference`
   - UserId
   - Persona (`TeamMember`, `Facilitator`, `Manager`)
   - LastSelectedRoleExternalId

2. `LaunchPlan`
   - LaunchPlanId
   - OwnerUserId
   - OrganizationTeamName
   - CohortName
   - StartDate
   - Status
   - CreatedUtc / UpdatedUtc / RowVersion

3. `LaunchPlanActivity`
   - LaunchPlanActivityId
   - LaunchPlanId
   - ActivityDefinitionId
   - DueDate
   - OwnerType
   - Status
   - CompletedUtc

4. `LaunchCommunication`
   - LaunchCommunicationId
   - LaunchPlanId
   - TemplateType
   - Subject
   - Body
   - ScheduledDate
   - DeliveryStatus

5. `LaunchCohortMember`
   - LaunchPlanId
   - User/contact identity
   - Role/persona
   - Membership status

6. Notification endpoints/model for upcoming Launch Activities and Huddles.

## Next UI migration pass

- Workflow day/week/month/quarter/year output views.
- Workflow reorder/swap scheduling interactions.
- Workflow calendar review and calendar integration boundary.
- Huddle workspace visual refinement for facilitator mode.
- Manager adoption/progress dashboard.
- Launch Planner calendar view.
- Communication template preview and send integration.
- Generate Launch Package export backed by persisted data.
- Resources library and contextual resources.
- Global prompt/workflow search.
- Guided tours/help.
