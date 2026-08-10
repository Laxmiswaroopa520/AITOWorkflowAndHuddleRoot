import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  Activity,
} from "../types/activity.types";

import type {
  DaySchedule,
  DayZoneDefinition,
  DayZoneId,
  ScheduledActivity,
  SchedulePosition,
} from "../types/daySchedule.types";

export const DAY_ZONES: DayZoneDefinition[] = [
  {
    id: "morning",
    title: "Morning",
    timeRange: "8:30 AM – 11:30 AM",
    description:
      "Start your day with high-impact planning and strategic thinking.",
    capacityMinutes: 180,
    timeSlots: [
      "8:30 AM",
      "9:00 AM",
      "9:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
    ],
  },
  {
    id: "midday",
    title: "Midday",
    timeRange: "11:30 AM – 3:30 PM",
    description:
      "Execute deals and engage with customers during peak hours.",
    capacityMinutes: 240,
    timeSlots: [
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "1:00 PM",
      "1:30 PM",
      "2:00 PM",
      "2:30 PM",
      "3:00 PM",
    ],
  },
  {
    id: "late-day",
    title: "Late Day",
    timeRange: "3:30 PM – 5:30 PM",
    description:
      "Wrap up with administrative tasks and prepare for tomorrow.",
    capacityMinutes: 120,
    timeSlots: [
      "3:30 PM",
      "4:00 PM",
      "4:30 PM",
      "5:00 PM",
    ],
  },
];

const FREQUENCY_ORDER = new Map([
  ["Daily", 1],
  ["Weekly", 2],
  ["Monthly", 3],
  ["Quarterly", 4],
]);

function getDefaultZone(
  category: string,
): DayZoneId {
  const normalized =
    category.trim().toLowerCase();

  if (
    normalized === "planning" ||
    normalized === "insight"
  ) {
    return "morning";
  }

  if (normalized === "admin") {
    return "late-day";
  }

  return "midday";
}

function getZoneDefinition(
  zoneId: DayZoneId,
): DayZoneDefinition {
  return DAY_ZONES.find(
    zone => zone.id === zoneId,
  ) as DayZoneDefinition;
}

function assignTimeSlots(
  zoneId: DayZoneId,
  items: ScheduledActivity[],
): ScheduledActivity[] {
  const definition =
    getZoneDefinition(zoneId);

  return items.map((item, index) => ({
    ...item,
    zoneId,
    timeSlot:
      definition.timeSlots[
        Math.min(
          index,
          definition.timeSlots.length - 1,
        )
      ],
  }));
}

function createInitialSchedule(
  activities: Activity[],
): DaySchedule {
  const schedule: DaySchedule = {
    morning: [],
    midday: [],
    "late-day": [],
  };

  const orderedActivities =
    [...activities].sort((left, right) => {
      const priorityDifference =
        Number(right.priority === "High") -
        Number(left.priority === "High");

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return (
        (FREQUENCY_ORDER.get(left.frequency) ?? 5) -
          (FREQUENCY_ORDER.get(right.frequency) ?? 5) ||
        left.sortOrder - right.sortOrder
      );
    });

  for (const activity of orderedActivities) {
    const zoneId =
      getDefaultZone(activity.category);

    schedule[zoneId].push({
      activity,
      zoneId,
      timeSlot: "",
    });
  }

  for (const zone of DAY_ZONES) {
    schedule[zone.id] =
      assignTimeSlots(
        zone.id,
        schedule[zone.id],
      );
  }

  return schedule;
}

export function getUsedMinutes(
  items: ScheduledActivity[],
): number {
  return items.reduce(
    (total, item) =>
      total + item.activity.durationMinutes,
    0,
  );
}

export function useDaySchedule(
  activities: Activity[],
) {
  const [schedule, setSchedule] =
    useState<DaySchedule>(() =>
      createInitialSchedule(activities),
    );

  const swap = useCallback((
    source: SchedulePosition,
    target: SchedulePosition,
  ): void => {
    setSchedule(current => {
      const next: DaySchedule = {
        morning: [...current.morning],
        midday: [...current.midday],
        "late-day": [...current["late-day"]],
      };

      const sourceItem =
        next[source.zoneId][source.index];
      const targetItem =
        next[target.zoneId][target.index];

      if (!sourceItem || !targetItem) {
        return current;
      }

      next[source.zoneId][source.index] =
        targetItem;
      next[target.zoneId][target.index] =
        sourceItem;

      next[source.zoneId] = assignTimeSlots(
        source.zoneId,
        next[source.zoneId],
      );
      next[target.zoneId] = assignTimeSlots(
        target.zoneId,
        next[target.zoneId],
      );

      return next;
    });
  }, []);

  const move = useCallback((
    source: SchedulePosition,
    targetZoneId: DayZoneId,
  ): "ok" | "capacity-exceeded" => {
    const sourceItem =
      schedule[source.zoneId][source.index];

    if (!sourceItem) {
      return "ok";
    }

    const targetZone =
      getZoneDefinition(targetZoneId);
    const targetMinutes =
      getUsedMinutes(schedule[targetZoneId]);

    if (
      source.zoneId !== targetZoneId &&
      targetMinutes +
        sourceItem.activity.durationMinutes >
        targetZone.capacityMinutes
    ) {
      return "capacity-exceeded";
    }

    setSchedule(current => {
      const next: DaySchedule = {
        morning: [...current.morning],
        midday: [...current.midday],
        "late-day": [...current["late-day"]],
      };

      const [movedItem] =
        next[source.zoneId].splice(
          source.index,
          1,
        );

      if (!movedItem) {
        return current;
      }

      next[targetZoneId].push(movedItem);
      next[source.zoneId] = assignTimeSlots(
        source.zoneId,
        next[source.zoneId],
      );
      next[targetZoneId] = assignTimeSlots(
        targetZoneId,
        next[targetZoneId],
      );

      return next;
    });

    return "ok";
  }, [schedule]);

  const totalDuration = useMemo(
    () =>
      DAY_ZONES.reduce(
        (total, zone) =>
          total +
          getUsedMinutes(schedule[zone.id]),
        0,
      ),
    [schedule],
  );

  return {
    schedule,
    totalDuration,
    swap,
    move,
  };
}
