import type { ApiClient } from "@/api/apiClient";
import type { AddWorkflowCalendarEventsResponse, WorkflowCalendarItem } from "../types/workflowCalendar.types";
export function addWorkflowCalendarEvents(apiClient: ApiClient, events: WorkflowCalendarItem[]) {
  return apiClient.post<AddWorkflowCalendarEventsResponse, { events: Array<{ requestId: string; subject: string; body: string; startUtc: string; endUtc: string; timeZone: string }> }>(
    "/api/workflows/calendar/events",
    { events: events.map(item => ({ requestId: item.requestId, subject: item.subject, body: item.body, startUtc: new Date(item.start).toISOString(), endUtc: new Date(item.end).toISOString(), timeZone: item.timeZone })) },
  );
}
