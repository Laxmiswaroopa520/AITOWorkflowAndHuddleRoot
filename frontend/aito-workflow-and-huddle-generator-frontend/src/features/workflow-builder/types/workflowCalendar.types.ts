export interface WorkflowCalendarItem {
  requestId: string;
  activityExternalId: string;
  subject: string;
  body: string;
  start: string;
  end: string;
  timeZone: string;
}
export interface AddWorkflowCalendarEventsResponse { createdCount: number; eventIds: string[]; }
