# Part 21 Coach scheduling configuration

The application contains no built-in Coach identities or calendar slots. Deployment must provide the approved Coach directory and Microsoft Graph confidential-client credential.

## Microsoft Entra requirements

Configure the backend API app registration for On-Behalf-Of token acquisition:

1. Add delegated Microsoft Graph `Calendars.ReadWrite` and grant the required tenant consent.
2. Configure a certificate or client secret for the backend API. Store it in user secrets, Key Vault, or the deployment secret store; never commit it.
3. Ensure the frontend remains authorized to request the existing backend `access_as_user` scope.
4. If the tenant restricts cross-mailbox free/busy, allow the approved Coach mailboxes to be queried through Microsoft Graph `getSchedule`.

For local development, configure the credential using Visual Studio user secrets under `AzureAd:ClientCredentials`. Follow the Microsoft.Identity.Web credential format used by your organization.

## Approved Coach directory

Bind real Coach entries under `CoachScheduling:Coaches`. Required properties are:

- `ExternalId`: stable non-email identifier used by the UI.
- `Email`: real Microsoft 365 mailbox address.
- `DisplayName`: approved display name.
- `TimeZone`: valid IANA or Windows time-zone identifier supported by the backend host.
- `Active`: whether the Coach can be offered.

Optional governance properties include job title, biography, expertise, supported Huddle external IDs, working days, working hours, notice period, and maximum advance days.

Do not use the people or availability from the V3 ZIP: those records are explicitly mock data.

## Runtime behavior

- `GET /api/huddle-coaching/coaches` returns only configured active Coaches.
- `GET /api/huddle-coaching/coaches/{id}/availability` calls Graph `getSchedule` for both the Coach and authenticated user.
- `POST /api/huddle-coaching/bookings` rechecks the slot and creates the real event with a Graph transaction ID.
- The UI shows confirmation only after Graph returns a successful event response.

No database migration or SQL script is required for Part 21.
