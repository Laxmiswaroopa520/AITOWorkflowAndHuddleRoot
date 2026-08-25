import type {
  Activity,
} from "../types/activity.types";

import type {
  WorkflowBucket,
} from "../types/workflowBucket.types";

export interface ActivityBucketGroup {
  id: string;
  name: string;
  sortOrder: number;
  activities: Activity[];
}

export function groupActivitiesByBucket(
  activities: Activity[],
  workflowBuckets:
    WorkflowBucket[],
  preserveActivityOrder = false,
): ActivityBucketGroup[] {
  const bucketsById =
    new Map(
      workflowBuckets.map(
        bucket => [
          bucket.externalId,
          bucket,
        ],
      ),
    );

  const groups =
    new Map<
      string,
      ActivityBucketGroup
    >();

  for (const activity of activities) {
    const bucketId =
      activity
        .workflowBucketExternalId;

    const configuredBucket =
      bucketsById.get(bucketId);

    const existingGroup =
      groups.get(bucketId);

    if (existingGroup) {
      existingGroup.activities.push(
        activity,
      );

      continue;
    }

    groups.set(bucketId, {
      id: bucketId,

      name:
        configuredBucket?.name ??
        activity.workflowBucketName,

      sortOrder:
        configuredBucket
          ?.sortOrder ??
        Number.MAX_SAFE_INTEGER,

      activities: [
        activity,
      ],
    });
  }

  return Array.from(
    groups.values(),
  )
    .map(group => ({
      ...group,

      activities: preserveActivityOrder
        ? [...group.activities]
        : [...group.activities].sort(
            (left, right) =>
              left.sortOrder - right.sortOrder ||
              left.title.localeCompare(right.title),
          ),
    }))
    .sort(
      (left, right) =>
        left.sortOrder -
          right.sortOrder ||
        left.name.localeCompare(
          right.name,
        ),
    );
}
