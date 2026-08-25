# huddle-v4-reset

Clears the old mock content so the `database/huddle-v4` scripts load into an empty catalogue.

Run this **after** the EF Core migration and **before** `huddle-v4/01_Preflight_Checks.sql`.

## Safety

Every destructive script starts with a flag set to `0` and does nothing until you change it to `1`.
Pressing F5 by accident deletes nothing. Each one runs in a single transaction with
`SET XACT_ABORT ON`, so a failure rolls the whole thing back rather than leaving a half-cleared
catalogue.

## Order

| Step | Script | Destructive | Notes |
|---|---|---|---|
| 1 | `01_Report_Existing_Data.sql` | No | Inventory of what is there now. Save the output. |
| 2 | `02_Delete_User_Progress.sql` | **Yes** | Required. Read the warning below. |
| 3 | `03_Delete_Huddle_Content.sql` | **Yes** | The main clear-out. |
| 4 | `04_Delete_Reference_Data_Optional.sql` | **Yes** | Optional. You probably do not need it. |
| 5 | `05_Verify_Reset.sql` | No | Confirms the catalogue is empty. |

Then run `huddle-v4/01` through `huddle-v4/13`.

## Read this before step 2

Step 2 deletes saved progress, completed activities, saved Role Paths and votes. It is not
optional, and here is why: every foreign key from the user tables into the catalogue is
`Restrict`, so nothing cascades and the content delete simply fails while those rows exist.

```
UserHuddlePlanItems.HuddleTopicId            -> HuddleTopics
UserHuddleSessions.HuddleTopicId             -> HuddleTopics
UserHuddleSessions.CurrentHuddlePhaseId      -> HuddlePhases
UserHuddleActivityProgress.HuddleActivityId  -> HuddleActivities
HuddleVotes.HuddleTopicId                    -> HuddleTopics
```

Remapping instead of deleting is not possible here: none of the 281 new activity names match the
current seed, so there is nothing for the old progress rows to point at.

`UserHuddleLaunchPlans` has no foreign key into the catalogue, so Launch Planner records survive
untouched.

If any of that progress data is real rather than test data, stop and tell me before you run step 2.

## What step 3 keeps, and why

| Kept | Reason |
|---|---|
| `Roles` | The Workflow feature references it through `Activity.RoleId`. Deleting it would break Workflow. The v4 scripts update the eight workbook roles in place by `ExternalId`. |
| `HuddleSegments` | Reference data, re-merged in place. |
| `HuddleSegmentRoles` | Reference data, and `UserHuddlePlans.HuddleSegmentRoleId` points at it. |
| `HuddleFocusAreas` | Reference data, re-merged in place. |
| `HuddleMcemStages` | Reference data, re-merged in place, and `huddle-v4/02` adds the new `StageNumber`. |
| `UserHuddleLaunchPlans` | No catalogue foreign key. |

Step 4 exists only if you want those reference tables emptied too. It still refuses to touch
`Roles` even with the flag set, for the reason above.

## One detail worth knowing

`HuddleActivities.PrerequisiteHuddleActivityId` is a self reference configured `NoAction`, because
SQL Server will not accept a cascade path on a self-referencing key. Step 3 therefore nulls that
column before deleting the rows. Without that, the delete fails on rows that point at each other.

## After the reset

Once `05_Verify_Reset.sql` reports every content table empty, the `huddle-v4` scripts behave as a
straight insert rather than an update, so the row counts in `huddle-v4/13_Validate_Import.sql`
should match `expected_counts.txt` exactly rather than exceeding it.
