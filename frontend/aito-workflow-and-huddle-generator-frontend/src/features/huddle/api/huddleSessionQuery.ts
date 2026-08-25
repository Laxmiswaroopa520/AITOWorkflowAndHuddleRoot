/**
 * The placement a session read or write is scoped to. The same topic sits on several role paths
 * with different activities, so a session that does not name one is counted against every role's
 * activities added together.
 */
export function placementQuery(placementExternalId: string | null | undefined): string {
  return placementExternalId
    ? `?placementExternalId=${encodeURIComponent(placementExternalId)}`
    : "";
}
