# Huddle / Workflow seed deployment package

Versioned, repeat-safe deployment of the Workflow and Huddle **reference/content** data.

- `database/Data_Scripts` is the original, untouched source of the baseline scripts. This
  folder only contains copies of the approved ones. Nothing here edits, renames or moves them.
- Schema stays with EF Core migrations. This package never creates or alters schema (other than
  its own `dbo.SeedScriptHistory` table).

> **Status: not yet validated against SQL Server.** The runner, the package checks and the
> in-memory runner tests have been run (see "Testing"). The T-SQL has **not** been executed
> against a real database yet. Run `tests/integration/run_integration_tests.py` against a
> disposable database before any QA deployment.

## Layout

```
database/seed/
  seed_runner.py                  the runner (Python 3.9+, pyodbc, ODBC Driver 18)
  seed-manifest.json              the explicit approved list: order, versions, sha256, gates
  requirements.txt                pyodbc
  sql/bootstrap/000_Create_SeedScriptHistory.sql   idempotent DDL for the history table
  sql/gates/pre/02_...            read-only: schema ready (stops the deployment on failure)
  sql/gates/post/08_...,20_...    read-only: verification (stops the deployment on failure)
  sql/gates/post/91_...           NEW read-only: minimum row counts (an empty table now fails)
  sql/steps/<script-id>/vNNN__<description>.sql    immutable seed versions
  templates/                      starting points for new versions (never packaged or run)
  tests/                          offline unit tests and a disposable-database integration harness
```

Deliberately **not** included: `01_Schema_All_Migrations`, the reset scripts, `007`/`008`,
`.bak`/temp files, the older "fresh-install" generations, and any personal-data import.

## How a deployment behaves

| Situation | What happens |
|---|---|
| **First deploy** (empty tables, no history table) | Take the deployment lock. Run preflight gates. Create `dbo.SeedScriptHistory`. Run all 17 baseline versions in manifest order, each in one transaction that also records `Succeeded`. Run the post gates. |
| **Second deploy, nothing changed** | Every version has a `Succeeded` row with a matching checksum, so every step logs `[SKIP]` and **no seed script runs**: no inserts, no updates, no `UpdatedAtUtc` change, no contact with user data. Gates still run (read-only). |
| **New approved content** | Add a *new version* (for example `v002`) of the logical script. It has no `Succeeded` row, so it runs; versions already applied are skipped. A new version is never skipped because an earlier version of the same script ran. |
| **An applied file was edited** | Refused with exit code 2 before anything runs. The fix is a new version, or the reviewed migration procedure below. |
| **A step fails** | Its transaction rolls back (data and history together). A `Failed` row with the error is written. The deployment stops (exit 1). Steps that already succeeded stay recorded. Re-running retries only the failed version and everything after it. |

## Ordering

preflight gate (02) → workflow roles, AI tools, buckets, activities, activity↔tool joins →
Huddle reference data → role descriptions → topics → placements → phases → facilitator guides →
agents → resources → activities → prerequisites → topic/agent joins → activity joins → post gates
(08, 20, 91). The order is the manifest order; `requires` lists are checked against it.

## History table: `dbo.SeedScriptHistory`

Created by the runner (bootstrap script), **not** by EF, and unrelated to `__EFMigrationsHistory`.
One row per attempt: `ScriptId`, `ScriptVersion`, `FileName`, `ChecksumSha256`, `Status`
(`Started` / `Succeeded` / `Failed` / `Interrupted`), `StartedAtUtc`, `CompletedAtUtc`,
`AppliedAtUtc`, `DurationMs`, `RunnerVersion`, `RunnerHost`, `BuildId`, `ErrorMessage`.

A filtered unique index allows at most one `Succeeded` row per `(ScriptId, ScriptVersion)`. Only
`Succeeded` means "applied". The runner needs permission to create this table on its first run
(DDL rights once; data rights afterwards).

## Checksums

SHA-256 over the **normalised** text: UTF-8 BOM removed, CRLF/CR converted to LF. The same
normalised text is what is executed. A Windows checkout with CRLF, or a BOM added by an editor,
therefore does not change the checksum. Any other change does. Print one with
`python seed_runner.py checksum <file>`.

## Atomicity, failure and interruption

- Session runs with `SET XACT_ABORT ON`. For each version the runner opens one transaction,
  runs the script batches, updates the history row to `Succeeded`, and commits once. If any
  batch raises, the whole transaction (data **and** history) is rolled back. "Success" is never
  committed for data that rolled back.
- The baseline scripts contain their own `BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`. Inside the
  runner's outer transaction the inner `COMMIT` only lowers `@@TRANCOUNT`; an inner `ROLLBACK`
  rolls back everything. The runner checks that the transaction is still open before it records
  success. *(This behaviour is what the integration harness must confirm on SQL Server.)*
- If the runner process dies mid-step, SQL Server rolls the transaction back when the connection
  drops. The `Started` row is written *before* the transaction and committed on its own; only the
  switch to `Succeeded` is inside the data transaction, so a crash can leave `Started` but never a
  false `Succeeded`. A `Started` row left by an earlier crash is relabelled `Interrupted` on the
  next run (the lock guarantees no other runner is mid-step).
- **Exactly-once is not claimed.** The guarantee is *at-most-once committed per version* plus
  *safe retry*: a version either commits together with its `Succeeded` row or leaves no trace. The
  scripts themselves are also idempotent (insert-if-missing / update-by-key), so even a
  hypothetical double execution does not duplicate rows.
- Recovery if the history table is lost or damaged: do not hand-edit it. Re-running is safe
  because the baseline scripts are idempotent; a re-applied v1 would re-write the baseline
  columns of the seeded rows and refresh `UpdatedAtUtc` for them. Prefer restoring the history
  table from backup.

## Concurrency

The runner takes a session-scoped `sp_getapplock` (`AITO.Huddle.SeedDeployment`) before it reads
history, so two deployments cannot interleave. The second waits (`--lock-timeout-seconds`) and
then, after the first finishes, sees everything as applied and skips. If the lock cannot be
obtained in time it exits 3 without touching data.

## Adding a new version

1. Copy `templates/new-version-upsert.template.sql` to
   `sql/steps/<script-id>/v00N__<description>.sql`. Put only the **delta** in it, keyed on the
   stable business key, and write only when something differs.
2. `python seed_runner.py checksum <file>`.
3. Add a step to `seed-manifest.json` with the same `id`, `version: N`, the file and the checksum.
   Keep all earlier versions listed and on disk.
4. Raise the minimum in `sql/gates/post/91_Minimum_Row_Counts.sql` if counts grow, and update that
   gate's checksum in the manifest.
5. `python seed_runner.py verify`, validate on a disposable database, then review.

Never edit an applied version. Version numbers must be contiguous and in order.

## Retiring or removing content

Default: **deactivate, do not delete** (`templates/retire-content.template.sql`). Seeded rows may
be referenced by user data. `IsActive = 0` keeps every key valid, keeps identity values stable and
is reversible by a later version.

Hard deletion is refused by the policy scan unless the manifest step has a non-empty
`reviewedDestructive` field (reviewer and ticket). Before such a step, show with a read-only query
on a copy of production data that nothing references the rows. `TRUNCATE`, `DROP`, schema changes
and `WHEN NOT MATCHED BY SOURCE` are never allowed.

## What the runner refuses

Exit 2 (nothing is run): a file whose checksum does not match the manifest; a file in `sql/` that
the manifest does not list; a removed or out-of-order version; an applied version whose content
changed; a version with a `Succeeded` row but a different checksum; a step containing a forbidden
statement (see `policy_violations` in `seed_runner.py`) or a reference to user, vote, share,
launch-plan, history or EF-history tables; a gate that writes to a table.

## Running it

```
pip install -r requirements.txt            # needs ODBC Driver 18 for SQL Server
python seed_runner.py verify               # offline, no database
python seed_runner.py package --output <folder-outside-database/seed>   # e.g. db-drop/seed
set SEED_SQL_CONNECTION_STRING=...         # never printed by the runner
python seed_runner.py plan                 # read-only: shows SKIP / RUN per version
python seed_runner.py apply --build-id <id>
```

Exit codes: 0 ok · 1 a script or gate failed · 2 package/manifest/checksum/history problem ·
3 lock timeout · 4 usage or connection problem. Log tags: `[SKIP] [START] [OK] [FAIL] [GATE]
[GATE-OK] [GATE-FAIL] [LOCK] [RECOVER] [DONE]`.

Gates (02, 08, 20, 91) are read-only checks. They run on **every** deployment, are not recorded in
the history table, and a failure stops the deployment.

## CI/CD integration: what is in the repo and what is not

The repository contains **no pipeline definition** (no YAML or build logs were found), so the CD
step that consumes `db-drop/seed` is external and has **not** been inspected, changed or tested.
Nothing here claims pipeline integration. Still required outside this repo:

1. The **build** step must produce `db-drop/seed` with
   `python database/seed/seed_runner.py package --output db-drop/seed`.
2. The **CD** step must run `python seed_runner.py apply` from that folder, with Python, `pyodbc`
   and ODBC Driver 18 on the agent, and the connection string in the environment variable
   `SEED_SQL_CONNECTION_STRING` (from a secret store).
3. The CD step must **not** glob-execute `*.sql` in `db-drop/seed`. If an existing task does,
   it bypasses history and checksums and must be replaced.
4. The deployment identity needs DDL rights for the first run (history table), then data rights on
   the seeded tables. It needs no rights on user tables.
5. Gate each environment: run against a disposable database first, then QA, and only then higher
   environments.

## Testing

- `python -m unittest discover -s tests` (offline): package/manifest/policy checks and runner
  behaviour against an in-memory fake database. It proves the runner's decision logic (skip, run,
  refuse, retry, lock, exit codes); it does **not** prove T-SQL behaviour.
- `tests/integration/run_integration_tests.py` runs the 12 required scenarios against a
  **disposable** SQL Server database. It refuses any database whose name does not contain
  `seedtest`, `disposable` or `scratch`, any server name that looks like qa/uat/prod/stg, and
  requires `--i-confirm-disposable-database <name>`. It drops all tables in that database.

## Known limitations

- T-SQL execution (nested transactions inside the baseline scripts, applock behaviour, bootstrap
  DDL, filtered unique index) is unverified until the integration harness has run.
- The minimums in gate `91` are the V11.78 baseline counts taken from the scripts; a wrong value
  fails closed on the first run.
- The baseline v1 scripts update matching rows unconditionally (and set `UpdatedAtUtc`) the one
  time they run. If QA already holds manually edited seed rows, the first run will overwrite the
  seeded columns of those rows. Review that before the first QA run.
- Retiring content is by convention (`IsActive = 0`); there is no automated detection of rows that
  are no longer in the approved content.
