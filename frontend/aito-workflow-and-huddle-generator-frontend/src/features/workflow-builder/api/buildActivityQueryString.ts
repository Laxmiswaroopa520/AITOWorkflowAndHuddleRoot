//Converts activity filters into a safe query string.
import type {
  ActivityFilters,
} from "../types/activity.types";

export function buildActivityQueryString(
  filters: ActivityFilters,
): string {
  const searchParams =
    new URLSearchParams();

  appendValue(
    searchParams,
    "roleId",
    filters.roleId,
  );

  appendValue(
    searchParams,
    "workflowBucketId",
    filters.workflowBucketId,
  );

  appendValue(
    searchParams,
    "aiToolId",
    filters.aiToolId,
  );

  appendValue(
    searchParams,
    "category",
    filters.category,
  );

  appendValue(
    searchParams,
    "frequency",
    filters.frequency,
  );

  appendValue(
    searchParams,
    "priority",
    filters.priority,
  );

  appendValue(
    searchParams,
    "toolCoverageLevel",
    filters.toolCoverageLevel,
  );

  appendValue(
    searchParams,
    "triggerContext",
    filters.triggerContext,
  );

  appendValue(
    searchParams,
    "mcemStage",
    filters.mcemStage,
  );

  appendValue(
    searchParams,
    "search",
    filters.search,
  );

  if (filters.includeInactive === true) {
    searchParams.set(
      "includeInactive",
      "true",
    );
  }

  const queryString =
    searchParams.toString();

  return queryString
    ? `?${queryString}`
    : "";
}

function appendValue(
  searchParams: URLSearchParams,
  key: string,
  value: string | undefined,
): void {
  const normalizedValue =
    value?.trim();

  if (normalizedValue) {
    searchParams.set(
      key,
      normalizedValue,
    );
  }
}