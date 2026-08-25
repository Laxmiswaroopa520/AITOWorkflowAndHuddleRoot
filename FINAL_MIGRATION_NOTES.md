# AITO Workflow & Huddle Generator - Full UI Migration

## Completed product experience

### Shared AITO shell
- Unified AITO entry page with Build My Workflow and Run a Huddle experiences.
- Microsoft-inspired visual system retained across Workflow, Huddle, Launch Planner, and Manager experience.
- Responsive application header and navigation.

### Workflow
- Role-based discovery experience.
- Activity filtering and selection.
- AI tool and business outcome context.
- Save, Save As, update, history, favorites, and backend-backed saved workflows retained.
- Day scheduling retained.
- Swap/reorder behavior retained.
- Added Day, Week, Month, Quarter, and Year planning views.
- Existing workflow persistence remains SQL/API backed.

### Huddle
- Dedicated Frontier Accelerator onboarding/landing experience.
- Personas: Team Member, Facilitator, Manager.
- Navigation: Onboarding -> Role Path -> Additional Topics.
- Role Path supports reorder, replace, reset, and Learning Plan export.
- Additional Topics catalog retains filters, search, voting, and detail experience.
- Continue Learning uses backend Huddle session state.
- Huddle workspace now includes Overview, Activities, Prompts & Discussion, Microsoft Tools, Reflection & Commitment, Resources, facilitator notes, Talk Track, progress, and completion.

### Manager
- Dedicated Manager dashboard route at `/manager`.
- Learning inventory summary.
- In-progress Huddle and activity progress visibility.
- Manager next-action guidance.
- Direct Launch Planner access.

### Launch Planner
- Organization/team, cohort, and first-Huddle setup.
- Launch Activity plan generated relative to the first Huddle date.
- Readiness completion tracking.
- Calendar and Launch Activities views.
- Email templates for announcement, reminder, and follow-up.
- Email handoff through the user's configured mail client.
- `.ics` calendar export for Outlook/Calendar import.
- Generate Launch Package HTML export with launch activities and communications.
- New authenticated `/api/launch-plans/me` persistence endpoint and `UserLaunchPlans` SQL model.
- Local persistence fallback when the backend migration is not yet deployed.

## Database deployment
Run `database/009-add-launch-planner.sql` after the existing workflow/Huddle database scripts. This creates the per-user launch-plan persistence table.

## Tenant-specific Microsoft Graph integration
The app provides working calendar export and email handoff without requiring new tenant permissions. Direct server-side Outlook send and automatic calendar synchronization require Microsoft Graph permissions and tenant administrator consent. Those credentials and permissions are environment-specific and are intentionally not hard-coded into the repository.

## Validation
- Changed TSX files were syntax-checked with the available TypeScript compiler. No TSX parse errors were found.
- A complete frontend dependency build could not be run in this environment because the supplied node_modules directory is incomplete and npm dependency installation timed out.
- .NET SDK is not installed in this execution environment, so the backend build could not be run here.
