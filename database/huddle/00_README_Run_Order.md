# Huddle seed scripts — manual SSMS execution only

These files were generated from the authored Huddle V3 data and have **not** been executed. The revised workbook defines the target semantics but currently supplies no Huddle topic content. Client-only fields remain NULL.

## Prerequisites

- Back up the target database.
- Confirm the Part 10 migration is applied.
- Confirm SSMS is connected to the intended server and database.
- Review every script before execution.
- Stop on the first failure; do not skip dependency scripts.

## Run order

1. `01_Validate_Huddle_Schema.sql`
2. `02_Seed_Huddle_Segments.sql`
3. `03_Map_Huddle_Roles.sql`
4. `04_Seed_Huddle_Segment_Roles.sql`
5. `05_Seed_Huddle_Focus_Areas.sql`
6. `06_Seed_Huddle_Mcem_Stages.sql`
7. `07_Seed_Huddle_Agents.sql`
8. `08_Seed_Huddle_Resources.sql`
9. `09_Seed_Huddle_Topics.sql`
10. `10_Seed_Huddle_Topic_Roles.sql`
11. `11_Seed_Huddle_Role_Path_Items.sql`
12. `12_Seed_Huddle_Topic_Mcem_Stages.sql`
13. `13_Seed_Huddle_Phases.sql`
14. `14_Seed_Huddle_Activities.sql`
15. `15_Seed_Huddle_Facilitator_Guides.sql`
16. `16_Seed_Huddle_Topic_Agents.sql`
17. `17_Seed_Huddle_Activity_Agents.sql`
18. `18_Seed_Huddle_Topic_Resources.sql`
19. `19_Seed_Huddle_Activity_Resources.sql`
20. `20_Seed_Huddle_Agent_Resources.sql`
21. `21_Validate_Huddle_Import.sql`

Run the sequence twice in a non-production database to confirm idempotency. On the second run, inserts should be zero and final counts stable. Save the result sets from script 21.

## Source counts

```json
{
  "segments": 2,
  "roles": 7,
  "segmentRoles": 7,
  "focusAreas": 15,
  "stages": 5,
  "agents": 11,
  "resources": 8,
  "workflowTopics": 44,
  "topicRoles": 54,
  "rolePaths": 49,
  "topicStages": 44,
  "phases": 132,
  "activities": 97,
  "skippedPractices": 10,
  "guides": 44,
  "topicAgents": 97,
  "activityAgents": 96,
  "topicResources": 62,
  "activityResources": 0,
  "agentResources": 0
}
```

## Intentional gaps

- TodayObjective, UseCase, WhyItMatters, DesiredOutcome, BestFitJob, RequiredContext, AudienceDescription, ReflectionPrompt, CommitmentPrompt, KeyTakeaway and unavailable skills remain NULL.
- Activity-resource and agent-resource source relationships are unavailable, so their scripts intentionally contain zero rows.
- All imported topics remain WorkingDraft; publication must be a separate approved decision.
- Role path week positions use the ZIP seriesPosition verbatim; validate business meaning before production.

## Current mock-catalog UI enablement

After scripts 01–21 have completed successfully, run these additive scripts:

22. `23_Publish_Current_Huddle_Catalog.sql`

If the obsolete Required/Foundation rows were imported previously, review and run this cleanup separately after the main import:

23. `24_Remove_Obsolete_Required_Huddles.sql`

After applying the manager-approved activity-placement correction, run:

24. `25_Move_Activities_To_Explore_And_Practice.sql`

Script 25 updates the existing activity-to-phase relationships without deleting
activities or their dependent user progress, agent mappings, or resource mappings.
Rerunning script 14 also enforces this placement rule. Run script 21 afterward;
`ActivityOutsideExploreAndPractice` must return zero rows.

The cleanup is idempotent and stops without deleting anything when a user plan, session, or vote references an obsolete topic.

Script 23 publishes every currently loaded mock/ZIP topic so participant APIs can expose the complete catalog. It does not populate missing semantic fields. Run script 23 again after rerunning script 09, because script 09 intentionally restores imported source records to `WorkingDraft`.
