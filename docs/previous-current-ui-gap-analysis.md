# Previous-to-current UI and feature gap analysis

## Reference and implementation rule

The July 31 `AITO_Workflow_Huddle_AzureSQL_Integrated.zip` application is the behavioral and visual reference. The current React/TypeScript frontend and ASP.NET Core Clean Architecture solution remain the implementation foundation. Reference code, hard-coded data, SharePoint persistence, and frontend-only business rules must not be copied into production.

## Capability comparison

| Area | Previous application | Current application | Required implementation |
| --- | --- | --- | --- |
| Application entry | Workflow/Huddle mode selector | Redirects directly to Workflow | Recreate the mode-selection journey after Huddle read APIs exist. |
| Global shell | AITO logo, mode toggle, contextual role selector, global search, prompts, help/tours, theme, notifications, user menu | Basic top navigation and account controls | Rebuild as reusable responsive shell while preserving MSAL. |
| Workflow discovery | Contextual role selection and guided flow | Role cards, segment filters, three-step progress | Restyle and align interactions without replacing API-backed role data. |
| Activity selection | Search, filters, grouped recommendations, selections and history access | API-backed filters, buckets, cards and selected panel | Retain current data access; align layout, details and responsive behavior. |
| Generated workflow | Day/week/month/quarter/year schedule views | Bucket-grouped summary | Introduce a schedule model and views incrementally. |
| Reordering | Swap and move interactions between schedule positions/zones | No reorder/swap capability | First add order mutation to current selection; later map it to schedule zones. |
| Saved workflows | History dialog, owned/shared tabs, rename, favorite, share and delete | Dedicated page with save, edit, save-as, favorite and delete | Preserve SQL-backed flow; add sharing endpoints/UI rather than SharePoint code. |
| Export | HTML and PowerPoint | Not present | Add export application services or safe client adapters after output contracts stabilize. |
| Calendar | Calendar review/sync | Not present | Requires Microsoft Graph integration and explicit permissions. |
| Prompt library | Global searchable prompt palette | Prompt data exists on activities but no global palette | Build from current activity API contracts. |
| Guided help | Page/layout tours and contextual help | Not present | Add reusable tour configuration after the shell stabilizes. |
| Huddle catalog | Full catalog, roles, focus areas, MCEM stages, phases and recommendations | Domain entities and EF mappings exist | Add Contracts, Application queries and protected API controllers. |
| Huddle planning | Selection, generation, voting, progress and session state | Database entities exist but no application/API surface | Implement commands/queries and API persistence before frontend pages. |
| Specialist booking | Specialist discovery and calendar availability | Not present | Requires product confirmation, Graph contracts and backend integration. |
| Responsive behavior | Desktop/mobile header and overlays | Partial responsive workflow pages | Establish shell and component breakpoints; remove overflow and fixed-width assumptions. |

## Existing backend reuse

The current endpoints for roles, activities, AI tools, workflow buckets, current user and saved workflows should remain the source of truth for Workflow functionality. The existing Huddle domain model and migration should be extended through the Application, Contracts and API layers; it must not be bypassed with frontend mock data.

## Phased implementation

1. **Foundation and Workflow parity**: responsive application shell, design tokens, workflow page layout alignment, activity details, selection behavior, and activity swap/reorder.
2. **Workflow schedule and outputs**: explicit schedule/order contract, day and longer-range views, move/swap zones, preview, HTML/PowerPoint export.
3. **Saved workflow parity**: owned/favorites/shared presentation, rename/share workflows, and SQL-backed share endpoints.
4. **Huddle read experience**: Huddle contracts, queries, endpoints, mode selector, catalog, filters, role paths and topic detail.
5. **Huddle state and generation**: plans, sessions, votes, progress, generation, preview and export.
6. **Connected experiences**: prompt palette, tours, notifications, Microsoft Graph calendar and specialist booking where approved.

Each phase must pass frontend build/lint plus relevant backend unit and integration tests before the next phase begins.
