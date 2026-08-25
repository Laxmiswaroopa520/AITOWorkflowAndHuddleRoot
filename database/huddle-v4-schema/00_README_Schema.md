# huddle-v4-schema

Schema changes made **after** the initial `huddle-v4` content load, each generated from an EF Core
migration. These are not content scripts: they change table structure only and delete nothing.

The source of truth is the entity model. Never hand-edit these files — change the entity, add a
migration, and regenerate.

```
Entity model  ->  EF Core migration  ->  generated SQL script (this folder)
```

## Scripts

| Script | Migration | What it does |
|---|---|---|
| `01_AddUserHuddlePlanItemPlacement.sql` | `20260821114851_AddUserHuddlePlanItemPlacement` | Adds `UserHuddlePlanItems.HuddlePlacementId` (int, nullable), its index and its foreign key to `HuddlePlacements`. |

### Why script 01 exists

A role path is a list of **placements**, not topics. The workbook's `Role_Paths` sheet gives each
segment role eight rows with `Sequence` 1 to 8, and a role revisits the same topic in more than one
week: AE weeks 3 and 4 are both `WF-X-PIPE-01` (`AE-PIPE-1` and `AE-PIPE-2`), and ATS uses
`WF-X-CONV-01` three times.

`UserHuddlePlanItems` is keyed `(UserHuddlePlanId, WeekPosition)` and stored only `HuddleTopicId`, so
a saved plan could not say which placement a week meant, and two weeks sharing a topic resolved to
the same content. The column is nullable so plans written before it existed still load; when it is
null the role path's own placement for that week is used.

## Running it

Either one, not both. The SQL is idempotent and writes the `__EFMigrationsHistory` row itself, so
running it and then `database update` is a no-op.

```powershell
# option A, from backend\AitoWorkflowAndHuddleGenerator
dotnet ef database update `
  --project AitoWorkflowAndHuddleGenerator.Infrastructure `
  --startup-project AitoWorkflowAndHuddleGenerator.Api

# option B: run 01_AddUserHuddlePlanItemPlacement.sql against the database
```

## Ordering against the other database folders

| Folder | When |
|---|---|
| `huddle-v4-reset` scripts 01–05 | One-off, before the original content load. Already done. Do not re-run. |
| `huddle-v4` scripts 01–13 | The content load. Already done. Safe to re-run; every statement is a MERGE. |
| `huddle-v4-schema` | This folder. After the content load, in numeric order. |
| `huddle-v4-reset/06` | After script 01 here. Clears saved plans and sessions only; leaves the catalogue and Launch Planner alone. |
