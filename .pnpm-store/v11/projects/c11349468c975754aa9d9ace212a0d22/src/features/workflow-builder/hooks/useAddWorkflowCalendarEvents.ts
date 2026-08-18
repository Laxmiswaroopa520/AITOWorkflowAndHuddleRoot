import { useMutation } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { addWorkflowCalendarEvents } from "../api/addWorkflowCalendarEvents";
import type { WorkflowCalendarItem } from "../types/workflowCalendar.types";
export function useAddWorkflowCalendarEvents() {
  const apiClient = useApiClient();
  return useMutation({ mutationFn: (events: WorkflowCalendarItem[]) => addWorkflowCalendarEvents(apiClient, events) });
}
