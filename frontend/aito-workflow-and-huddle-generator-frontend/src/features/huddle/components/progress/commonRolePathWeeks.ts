import commonRolePathWeeks from "@/data/commonRolePathWeeks.json";
import type { HuddlePlanResponse, HuddleUpcomingWeekResponse } from "../../types";

// Hand-maintained weeks shared by every audience (src/data/commonRolePathWeeks.json).
const COMMON_ROLE_PATH_WEEKS = commonRolePathWeeks as HuddleUpcomingWeekResponse[];

/**
 * Coming-soon weeks to show after a plan's real weeks. Uses the API's list when it sends one, and
 * otherwise the shared JSON. A role with no weekly path (All Roles) gets none.
 */
export function upcomingWeeksFor(plan: HuddlePlanResponse): HuddleUpcomingWeekResponse[] {
  if (plan.upcomingWeeks) return plan.upcomingWeeks;
  if (plan.items.length === 0) return [];
  const lastWeek = Math.max(...plan.items.map((item) => item.week));
  return COMMON_ROLE_PATH_WEEKS.filter((entry) => entry.week > lastWeek).sort((a, b) => a.week - b.week);
}
