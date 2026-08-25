# AITO SQL scripts generated from SharePoint exports

Run in this order in SSMS:

1. `001-upsert-roles.sql`
2. `002-upsert-ai-tools.sql`
3. `003-upsert-workflow-buckets.sql`
4. `004-upsert-activities.sql`
5. `005-upsert-activity-ai-tools.sql`
6. `006-verify-reference-data.sql`

The first six scripts are the scripts required to load reference data for the next phase.

Optional historical/test-data migration:

7. `007-optional-import-user-workflows.sql`
8. `008-optional-import-workflow-shares.sql`

Do not run 007 and 008 unless you want to preserve the two saved workflows and five share-history rows from SharePoint.

## Required enum changes before the API reads Activities

The uploaded SharePoint values do not match the starter enums in Part 3. Update the Domain enums to contain these persisted names:

- `ActivityCategory`: `Unspecified`, `Admin`, `Engagement`, `Execution`, `Insight`, `Planning`
- `ActivityFrequency`: `Unspecified`, `Daily`, `Weekly`, `Monthly`, `Quarterly`, `AsNeeded`
- `ActivityPriority`: `Unspecified`, `Medium`, `High`
- `ToolCoverageLevel`: `Unspecified`, `Supported`, `FullySupported`, `MultiAgentSupported`
- `TriggerContext`: `Unspecified`, `None`, `AsNeeded`, `PreMeeting`, `PostMeeting`, `Recurring`, `RenewalCycle`
- `McemStage`: `All`, `Stage1`, `Stage2`, `Stage3`

Because EF stores these enums as strings, this is primarily a C# enum correction. A new migration is not normally required unless your generated migration created explicit database check constraints for enum values.

## Source-to-database mapping used

- SharePoint `Role` -> `Roles.ExternalId`
- SharePoint `WorkflowBucket` title -> generated bucket `ExternalId`
- `RecommendedPrompt` -> `Activities.BeginnerPrompt`
- `AIHelp1`, `AIHelp2`, `AIHelp3` -> JSON array in `Activities.SuggestedOutputs`
- `AdvancedPrompt` -> `NULL`
- Missing MCEM stage -> `All`
- First AI-tool mapping for each activity -> `IsPrimary = 1`; later mappings -> secondary
- One exact duplicate activity row (`sm-deal-inspection-with-coaching-summary`) was deduplicated
- Mojibake sequences such as `â€”` were repaired when possible

## Important SharePoint-history note

The SharePoint WorkflowShares export contains multiple shares for the same workflow and recipient, but the SQL model allows only one active share. The optional import preserves the latest row as active and imports earlier rows as revoked.
