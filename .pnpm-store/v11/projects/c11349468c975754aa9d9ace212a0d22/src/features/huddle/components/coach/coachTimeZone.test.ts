import { describe, expect, it } from "vitest";
import { dateKey, formatCoachDateTime } from "./coachTimeZone";

describe("Coach time-zone conversion", () => {
  it("moves a UTC instant across the India date boundary", () => {
    expect(dateKey("2026-08-11T20:00:00Z", "Asia/Kolkata")).toBe("2026-08-12");
  });

  it("uses daylight-saving-aware names for the meeting instant", () => {
    expect(formatCoachDateTime("2026-01-15T15:00:00Z", "America/New_York")).toContain("10:00 AM");
    expect(formatCoachDateTime("2026-07-15T15:00:00Z", "America/New_York")).toContain("11:00 AM");
  });

  it("does not change the stored UTC instant when the display zone changes", () => {
    const instant = "2026-08-11T15:00:00Z";
    expect(new Date(instant).toISOString()).toBe("2026-08-11T15:00:00.000Z");
    expect(formatCoachDateTime(instant, "Asia/Kolkata")).not.toBe(formatCoachDateTime(instant, "America/Los_Angeles"));
  });
});
