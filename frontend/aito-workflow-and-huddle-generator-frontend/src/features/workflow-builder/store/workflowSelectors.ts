import {
  atom,
} from "jotai";

import {
  selectedActivitiesAtom,
} from "./workflowAtoms";

export const selectedActivityIdsAtom =
  atom(get => {
    const selected =
      get(selectedActivitiesAtom);

    return new Set(
      selected.map(
        activity => activity.id,
      ),
    );
  });

export const selectedActivityCountAtom =
  atom(get =>
    get(selectedActivitiesAtom).length,
  );

export const totalDurationAtom =
  atom(get =>
    get(selectedActivitiesAtom).reduce(
      (total, activity) =>
        total +
        activity.durationMinutes,
      0,
    ),
  );

export const selectedActivitiesByBucketAtom =
  atom(get => {
    const activities =
      get(selectedActivitiesAtom);

    return activities.reduce<
      Record<string, typeof activities>
    >((result, activity) => {
      const bucket =
        activity.workflowBucketName;

      result[bucket] ??= [];
      result[bucket].push(activity);

      return result;
    }, {});
  });