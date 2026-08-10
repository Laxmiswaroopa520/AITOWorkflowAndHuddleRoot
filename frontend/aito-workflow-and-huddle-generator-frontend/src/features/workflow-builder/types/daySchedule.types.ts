import type {
  Activity,
} from "./activity.types";

export type DayZoneId =
  | "morning"
  | "midday"
  | "late-day";

export interface DayZoneDefinition {
  id: DayZoneId;
  title: string;
  timeRange: string;
  description: string;
  capacityMinutes: number;
  timeSlots: string[];
}

export interface ScheduledActivity {
  activity: Activity;
  timeSlot: string;
  zoneId: DayZoneId;
}

export type DaySchedule =
  Record<DayZoneId, ScheduledActivity[]>;

export interface SchedulePosition {
  zoneId: DayZoneId;
  index: number;
}
