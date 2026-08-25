# Workflow regression checklist

Use this checklist before and after every Huddle implementation phase. Record the environment, tester, date and result for each execution.

## Test context

- Date:
- Tester:
- Frontend version/commit:
- Backend version/commit:
- Database/migration version:
- Browser:
- Environment:

## Authentication and navigation

- [ ] An unauthenticated user is directed to Microsoft sign-in for protected routes.
- [ ] A valid user can complete sign-in.
- [ ] `/workflow` loads inside the existing application layout.
- [ ] `/workflows` loads inside the existing application layout.
- [ ] Sign-out behaves as before.
- [ ] Existing Workflow navigation labels, colors, spacing and responsive behavior are unchanged.

## Role and segment selection

- [ ] Active roles load from `GET /api/roles`.
- [ ] Segment tabs display the existing labels and order.
- [ ] Selecting a segment filters the role cards correctly.
- [ ] Selecting a role preserves the selected visual state.
- [ ] Continue advances to activity customization.
- [ ] Returning to role selection retains expected behavior.

## Activity filtering and grouping

- [ ] Activities load for the selected role.
- [ ] Workflow buckets load and display in the existing order.
- [ ] Activities appear under the correct Workflow bucket.
- [ ] Search filters activities correctly.
- [ ] AI tool filtering works.
- [ ] Category filtering works.
- [ ] Frequency filtering works.
- [ ] Priority filtering works.
- [ ] Coverage-level filtering works.
- [ ] Trigger-context filtering works.
- [ ] MCEM-stage filtering works.
- [ ] Clearing filters restores the expected activity set.
- [ ] Loading, empty, error and retry states behave as before.

## Activity selection

- [ ] Selecting an activity adds it to the selected panel.
- [ ] Deselecting an activity removes it.
- [ ] Select-all behavior works where available.
- [ ] Deselect-all behavior works where available.
- [ ] Removing an item from the selected panel updates its card state.
- [ ] Clearing selected activities works.
- [ ] Activity details expand and collapse correctly.
- [ ] AI tool badges and activity metadata remain visually unchanged.

## Duration and summary

- [ ] Total duration equals the sum of selected activity durations.
- [ ] Duration updates after add/remove/clear operations.
- [ ] Build/Generate advances to the Workflow summary.
- [ ] Summary displays the selected role.
- [ ] Summary preserves selected activity ordering.
- [ ] Summary groups and presents activities as before.
- [ ] Back navigation restores selection state.
- [ ] Restart clears the builder to its expected initial state.

## Save Workflow

- [ ] Save dialog opens with the existing UI.
- [ ] Required-name validation works.
- [ ] Description length validation works.
- [ ] Save sends role and ordered activity external IDs through the API client.
- [ ] Successful save returns a persisted Workflow.
- [ ] Duplicate-name conflict is displayed as a 409-class application error rather than a generic 500.
- [ ] Server-calculated duration matches the selection.

## Save As

- [ ] Save As restores the original role and activities.
- [ ] Suggested copy name is populated as before.
- [ ] Saving creates a distinct Workflow.
- [ ] The original Workflow is unchanged.

## Update Workflow

- [ ] Edit restores the saved role and activity order.
- [ ] Updating name, description or activities persists through `PUT`.
- [ ] RowVersion is sent.
- [ ] A stale RowVersion returns a 409 conflict.
- [ ] A successful update refreshes cached list/detail data.

## Delete Workflow

- [ ] Delete confirmation displays the correct Workflow name.
- [ ] Cancel leaves the Workflow unchanged.
- [ ] Confirm sends `DELETE` to the owned Workflow endpoint.
- [ ] Successful deletion removes the Workflow from history.
- [ ] Deleting an unavailable Workflow returns a handled 404.

## Favorite and unfavorite

- [ ] Favorite sends an authenticated `PATCH` request.
- [ ] Unfavorite sends an authenticated `PATCH` request.
- [ ] The updated RowVersion is used after mutation.
- [ ] Favorite state updates in Workflow history.
- [ ] Favorites-only filtering works.
- [ ] Concurrency conflicts return a handled 409.

## Restore saved Workflow

- [ ] Open retrieves Workflow details.
- [ ] Current activity data is matched by stable external ID.
- [ ] Saved activity order is restored.
- [ ] Missing/retired activities produce the existing explicit error state.
- [ ] Open mode does not mark the Workflow as editing.
- [ ] Edit mode retains Workflow ID, name, description and RowVersion.
- [ ] Save As mode does not overwrite the source Workflow.

## Ownership and error behavior

- [ ] A user cannot retrieve another user's private Workflow.
- [ ] A user cannot update another user's Workflow.
- [ ] A user cannot delete another user's Workflow.
- [ ] Missing user identity claims produce 401.
- [ ] Forbidden access produces 403 where applicable.
- [ ] Missing resources produce 404.
- [ ] Duplicate/concurrent changes produce 409.
- [ ] Unexpected failures return a sanitized 500 with a correlation ID.

## Visual freeze confirmation

- [ ] No Workflow component was intentionally redesigned.
- [ ] Workflow card dimensions are unchanged.
- [ ] Workflow colors are unchanged.
- [ ] Workflow spacing is unchanged.
- [ ] Workflow labels are unchanged.
- [ ] Workflow component order is unchanged.
- [ ] Workflow menus and interactions are unchanged.
- [ ] Workflow responsive behavior is unchanged.

## Result

- Overall result: Pass / Fail / Blocked
- Failed checks:
- Evidence/screenshots:
- Follow-up owner:
