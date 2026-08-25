# Huddle source-to-script inventory

- Huddle V3 authored arrays are the temporary content source.
- The revised workbook is the semantic schema authority; its Huddle content sheets are empty.
- Existing dbo.Roles rows are referenced by ExternalId and never duplicated.
- Numeric identities are always resolved in SQL from ExternalId.
- Missing parents are counted and relationship rows are skipped.
- No Workflow ZIP data, node_modules, dist, browser state, votes, progress, or other UI-only state is included.

## Reconciliation

- segments: 2
- roles: 7
- segmentRoles: 7
- focusAreas: 15
- stages: 5
- agents: 11
- resources: 8
- workflowTopics: 44
- topicRoles: 54
- rolePaths: 49
- topicStages: 44
- phases: 132
- activities: 97
- skippedPractices: 10
- guides: 44
- topicAgents: 97
- activityAgents: 96
- topicResources: 62
- activityResources: 0
- agentResources: 0
