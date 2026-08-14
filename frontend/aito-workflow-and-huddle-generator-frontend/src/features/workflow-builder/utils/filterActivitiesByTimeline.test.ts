import { describe, expect, it } from "vitest";
import type { Activity } from "../types/activity.types";
import { filterActivitiesByTimeline } from "./filterActivitiesByTimeline";

const activity = (id: number, frequency: string): Activity => ({
  id,
  externalId: `activity-${id}`,
  title: `Activity ${id}`,
  description: null,
  roleExternalId: "role",
  roleName: "Role",
  roleAbbreviation: "R",
  workflowBucketExternalId: "bucket",
  workflowBucketName: "Bucket",
  category: "Planning",
  frequency,
  priority: "High",
  toolCoverageLevel: "Primary",
  triggerContext: "Scheduled",
  mcemStage: "Stage",
  durationMinutes: 30,
  businessOutcome: null,
  beginnerPrompt: null,
  advancedPrompt: null,
  suggestedOutputs: null,
  sortOrder: id,
  aiTools: [],
});

const activities = [
  activity(1, "Daily"),
  activity(2, "Weekly"),
  activity(3, "Monthly"),
  activity(4, "Quarterly"),
];

describe("filterActivitiesByTimeline", () => {
  it.each([
    ["day", [1]],
    ["week", [1, 2]],
    ["month", [1, 2, 3]],
    ["quarter", [1, 2, 3, 4]],
    ["year", [1, 2, 3, 4]],
  ] as const)("uses the governed frequency mapping for %s", (timeline, expectedIds) => {
    expect(filterActivitiesByTimeline(activities, timeline).map(item => item.id)).toEqual(expectedIds);
  });
});
