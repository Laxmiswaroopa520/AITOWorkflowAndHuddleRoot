# Static validation results

No SQL script was executed and no database connection was opened.

- Ordered SQL files: 21
- Data scripts with XACT_ABORT, TRY/CATCH, and a transaction: 19
- Hardcoded generated numeric foreign keys: 0
- TRUNCATE, DROP TABLE, and DELETE statements: 0
- Client-only semantic fields are emitted as NULL.
- Workflow files modified by generation: 0

## Source diagnostics

```json
{
  "duplicateExternalIds": {
    "roles": 0,
    "topics": 0,
    "stages": 0,
    "agents": 0,
    "resources": 0,
    "phases": 0,
    "activities": 0
  },
  "missingRelationships": {
    "topicRoles": 5,
    "rolePaths": 0,
    "topicStages": 0,
    "phases": 0,
    "activities": 0,
    "guides": 0,
    "topicAgents": 0,
    "activityAgents": 0,
    "topicResources": 0
  },
  "invalidUrls": 0
}
```

The five missing topic-role relationships are the Foundation source value `roleIds: ['all']`. No matching dbo.Roles ExternalId is assumed or invented. The ten skipped practices have no exact phase relationship in the ZIP.
