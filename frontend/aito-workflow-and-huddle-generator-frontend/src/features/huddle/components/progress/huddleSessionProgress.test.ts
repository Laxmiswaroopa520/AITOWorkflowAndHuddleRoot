import { describe, expect, it } from "vitest";
import type { HuddleSessionResponse, IncompleteHuddleSessionResponse } from "../../types";
import { createHuddleSessionProgressSummary, isContinueLearningAvailable } from "./huddleSessionProgress";

function session(overrides: Partial<HuddleSessionResponse> = {}): HuddleSessionResponse {
  return {
    huddleExternalId: "topic-1",
    currentPhaseExternalId: "phase-1",
    facilitatorNotes: null,
    startedAtUtc: "2026-08-11T00:00:00Z",
    lastSavedAtUtc: "2026-08-11T00:00:00Z",
    completedAtUtc: null,
    sessionStatus: "InProgress",
    rowVersion: "AAAAAAAAB9E=",
    activities: [],
    removedActivityExternalIds: [],
    validActivityCount: 3,
    completedActivityCount: 0,
    canContinue: true,
    ...overrides,
  };
}

describe("Huddle session progress UI state", () => {
  it("represents a new session without inventing completed progress", () => {
    const result = createHuddleSessionProgressSummary(null, 4);

    expect(result.totalCount).toBe(4);
    expect(result.completedCount).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.canComplete).toBe(false);
  });

  it("restores existing activity completion and progress", () => {
    const result = createHuddleSessionProgressSummary(session({
      completedActivityCount: 2,
      activities: [
        { activityExternalId: "activity-1", isCompleted: true, completedAtUtc: "2026-08-11T00:01:00Z" },
        { activityExternalId: "activity-2", isCompleted: true, completedAtUtc: "2026-08-11T00:02:00Z" },
      ],
    }), 3);

    expect([...result.completedActivityIds]).toEqual(["activity-1", "activity-2"]);
    expect(result.percentage).toBe(67);
  });

  it("excludes removed catalog activities and leaves newly added activities incomplete", () => {
    const result = createHuddleSessionProgressSummary(session({
      validActivityCount: 3,
      completedActivityCount: 1,
      removedActivityExternalIds: ["removed-activity"],
      activities: [
        { activityExternalId: "current-activity", isCompleted: true, completedAtUtc: "2026-08-11T00:01:00Z" },
        { activityExternalId: "removed-activity", isCompleted: true, completedAtUtc: "2026-08-11T00:01:00Z" },
      ],
    }), 3);

    expect([...result.completedActivityIds]).toEqual(["current-activity"]);
    expect(result.completedCount).toBe(1);
    expect(result.percentage).toBe(33);
    expect(result.canComplete).toBe(false);
  });

  it("allows completion only for a fully completed, still-in-progress server session", () => {
    expect(createHuddleSessionProgressSummary(session({ completedActivityCount: 3 }), 3).canComplete).toBe(true);
    expect(createHuddleSessionProgressSummary(session({ completedActivityCount: 3, sessionStatus: "Completed", completedAtUtc: "2026-08-11T01:00:00Z", canContinue: false }), 3).canComplete).toBe(false);
  });

  it("shows Continue Learning only for an incomplete server-qualified session", () => {
    const item: IncompleteHuddleSessionResponse = { huddleExternalId: "topic-1", huddleName: "Topic", huddleDescription: null, huddleType: "Prescriptive", session: session({ completedActivityCount: 1 }) };

    expect(isContinueLearningAvailable(item)).toBe(true);
    expect(isContinueLearningAvailable({ ...item, session: session({ completedActivityCount: 3, canContinue: false }) })).toBe(false);
    expect(isContinueLearningAvailable(undefined)).toBe(false);
  });
});
