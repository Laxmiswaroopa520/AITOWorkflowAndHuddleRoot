#!/usr/bin/env python3
"""
Integration tests for seed_runner.py against a DISPOSABLE SQL Server / Azure SQL database.

NOT RUN YET. No SQL Server was reachable while this was written, so this harness has only been
exercised in --self-check mode (offline). Run it against a throw-away database before trusting the
runner in a pipeline. It covers the twelve mandatory scenarios (see SCENARIOS at the bottom).

SAFETY -- this harness DROPS EVERY TABLE in the target database before each scenario. It therefore
refuses to run unless ALL of these hold:
  * the connection string names a database whose name contains 'seedtest', 'disposable' or 'scratch'
  * the server name does not look like QA/UAT/PROD/staging
  * you pass --i-confirm-disposable-database <exact database name>

Usage (from the repository root):
  1. Create an EMPTY database, e.g. AitoSeedTest_Disposable_01.
  2. set SEED_TEST_CONNECTION_STRING to an ODBC connection string for it, e.g.
       Driver={ODBC Driver 18 for SQL Server};Server=localhost,1433;Database=AitoSeedTest_Disposable_01;
       UID=sa;PWD=...;TrustServerCertificate=yes
  3. python database/seed/tests/integration/run_integration_tests.py \
         --i-confirm-disposable-database AitoSeedTest_Disposable_01

  python .../run_integration_tests.py --self-check     # offline: builds/validates the test packages only

The schema is created from database/Data_Scripts/01_Schema_All_Migrations.sql (read, never modified).
That script predates the PII-removal migration; the seed scripts do not touch the affected objects.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
SEED_DIR = HERE.parent.parent
REPO = SEED_DIR.parent.parent
sys.path.insert(0, str(SEED_DIR))
import seed_runner as sr  # noqa: E402

SEEDED_TABLES = {
    "Roles": 22, "AiTools": 14, "WorkflowBuckets": 9, "Activities": 186, "ActivityAiTools": 215,
    "HuddleSegments": 2, "HuddleSegmentRoles": 15, "HuddleFocusAreas": 8, "HuddleMcemStages": 5,
    "HuddleTopics": 27, "HuddleTopicRoles": 170, "HuddlePlacements": 138, "HuddleRolePathItems": 100,
    "HuddlePhases": 414, "HuddleFacilitatorGuides": 138, "HuddleAgents": 22, "HuddleResources": 54,
    "HuddleActivities": 506, "HuddleTopicMcemStages": 23, "HuddleTopicAgents": 130,
    "HuddleTopicResources": 21, "HuddleActivityAgents": 648, "HuddleActivityResources": 154,
    "HuddleAgentResources": 28,
}
RUNTIME_TABLES = ["UserHuddlePlans", "UserHuddlePlanItems", "UserHuddleSessions", "UserHuddleActivityProgress",
                  "HuddleVotes", "UserWorkflows", "UserWorkflowActivities"]
EXTERNAL_ID_TABLES = ["Roles", "AiTools", "WorkflowBuckets", "Activities", "HuddleSegments", "HuddleSegmentRoles",
                      "HuddleFocusAreas", "HuddleMcemStages", "HuddleTopics", "HuddlePlacements", "HuddlePhases",
                      "HuddleFacilitatorGuides", "HuddleAgents", "HuddleResources", "HuddleActivities"]

FIX_V2_OK = """/* TEST FIXTURE: a legitimate content update -- one UPDATE of an existing row, one new row. */
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
UPDATE dbo.HuddleAgents SET ShortDescription = N'SEEDTEST v2 updated description', UpdatedAtUtc = SYSDATETIMEOFFSET()
WHERE ExternalId = N'AGT-001';
IF NOT EXISTS (SELECT 1 FROM dbo.HuddleAgents WHERE ExternalId = N'AGT-SEEDTEST-V2')
    INSERT INTO dbo.HuddleAgents (ExternalId, Name, ShortDescription, CreatedAtUtc)
    VALUES (N'AGT-SEEDTEST-V2', N'Seed test agent', N'new in v2', SYSDATETIMEOFFSET());
COMMIT TRANSACTION;
GO
"""
FIX_V2_FAIL_PLAIN = """/* TEST FIXTURE: inserts a row, then fails. The insert must NOT survive. */
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
INSERT INTO dbo.HuddleAgents (ExternalId, Name, ShortDescription, CreatedAtUtc)
VALUES (N'AGT-SEEDTEST-FAIL', N'Seed test failing agent', N'must roll back', SYSDATETIMEOFFSET());
THROW 59001, 'SEEDTEST forced failure after insert', 1;
COMMIT TRANSACTION;
GO
"""
FIX_V2_FAIL_TRYCATCH = """/* TEST FIXTURE: same shape as scripts 03-07 (TRY/CATCH + ROLLBACK + THROW). */
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;
    INSERT INTO dbo.HuddleAgents (ExternalId, Name, ShortDescription, CreatedAtUtc)
    VALUES (N'AGT-SEEDTEST-FAIL', N'Seed test failing agent', N'must roll back', SYSDATETIMEOFFSET());
    THROW 59002, 'SEEDTEST forced failure inside TRY', 1;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
"""
FIX_V2_SLOW = """/* TEST FIXTURE: holds its transaction open for 8 seconds so a second runner must wait on the lock. */
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
WAITFOR DELAY '00:00:08';
IF NOT EXISTS (SELECT 1 FROM dbo.HuddleAgents WHERE ExternalId = N'AGT-SEEDTEST-SLOW')
    INSERT INTO dbo.HuddleAgents (ExternalId, Name, ShortDescription, CreatedAtUtc)
    VALUES (N'AGT-SEEDTEST-SLOW', N'Seed test slow agent', N'slow', SYSDATETIMEOFFSET());
COMMIT TRANSACTION;
GO
"""


# ------------------------------------------------------------------------------------------
# plumbing
# ------------------------------------------------------------------------------------------
class Results:
    def __init__(self):
        self.rows = []

    def check(self, scenario, name, cond, detail=""):
        self.rows.append({"scenario": scenario, "check": name, "passed": bool(cond), "detail": str(detail)[:400]})
        print(("  PASS  " if cond else "  FAIL  ") + f"{scenario}: {name}" + ("" if cond else f"   -> {detail}"), flush=True)
        return bool(cond)


class Sql:
    def __init__(self, conn_str):
        import pyodbc
        self.pyodbc = pyodbc
        self.cn = pyodbc.connect(conn_str, autocommit=True, timeout=60)
        self.cn.timeout = 0

    def batches(self, text):
        cur = self.cn.cursor()
        for b in sr.split_batches(sr.normalize_sql(text.encode("utf-8")) if isinstance(text, str) else text):
            cur.execute(b)
            while cur.nextset():
                pass
        cur.close()

    def rows(self, sql, params=()):
        cur = self.cn.cursor()
        try:
            cur.execute(sql, params) if params else cur.execute(sql)
            try:
                return [tuple(r) for r in cur.fetchall()]
            except self.pyodbc.ProgrammingError:
                return []
        finally:
            cur.close()

    def scalar(self, sql, params=()):
        r = self.rows(sql, params)
        return r[0][0] if r else None

    def fingerprint(self, tables):
        out = {}
        for t in tables:
            out[t] = tuple(self.rows(f"SELECT COUNT(*), CHECKSUM_AGG(CAST(BINARY_CHECKSUM(*) AS int)) FROM dbo.[{t}]")[0])
        return out

    def row_checksums(self, table, key="ExternalId"):
        return dict(self.rows(f"SELECT [{key}], BINARY_CHECKSUM(*) FROM dbo.[{table}]"))

    def reset(self):
        self.batches("""
DECLARE @sql nvarchar(max) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + N'.' + QUOTENAME(OBJECT_NAME(parent_object_id))
             + N' DROP CONSTRAINT ' + QUOTENAME(name) + N';' FROM sys.foreign_keys;
EXEC sys.sp_executesql @sql;
SET @sql = N'';
SELECT @sql += N'DROP TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + N'.' + QUOTENAME(name) + N';' FROM sys.tables;
EXEC sys.sp_executesql @sql;
""")

    def apply_schema(self):
        schema = REPO / "database" / "Data_Scripts" / "01_Schema_All_Migrations.sql"
        self.batches(schema.read_bytes().decode("utf-8-sig"))

    def history(self):
        if self.scalar("SELECT OBJECT_ID(N'dbo.SeedScriptHistory', N'U')") is None:
            return []
        return self.rows("SELECT ScriptId, ScriptVersion, [Status] FROM dbo.SeedScriptHistory ORDER BY SeedScriptHistoryId")


class Ctx:
    def __init__(self, args, conn_str, work):
        self.args, self.conn_str, self.work = args, conn_str, work
        self.sql = Sql(conn_str) if conn_str else None
        self.r = Results()
        self.n = 0

    def package(self, name=None, with_post_gates=True):
        """A fresh copy of the shipped package, built with the real `package` command."""
        self.n += 1
        out = self.work / (name or f"pkg{self.n}")
        rc = sr.main(["package", "--manifest", str(SEED_DIR / sr.MANIFEST_NAME), "--output", str(out), "--force"])
        assert rc == 0
        if not with_post_gates:
            doc = json.loads((out / sr.MANIFEST_NAME).read_text())
            doc["postflightGates"] = []
            (out / sr.MANIFEST_NAME).write_text(json.dumps(doc, indent=2))
        return out

    def run(self, pkg, *extra, timeout=1800):
        env = dict(os.environ, SEED_SQL_CONNECTION_STRING=self.conn_str)
        p = subprocess.run([sys.executable, str(pkg / "seed_runner.py"), "apply", "--manifest",
                            str(pkg / sr.MANIFEST_NAME), *extra], env=env, capture_output=True, text=True, timeout=timeout)
        return p.returncode, p.stdout + p.stderr

    def popen(self, pkg, *extra):
        env = dict(os.environ, SEED_SQL_CONNECTION_STRING=self.conn_str)
        return subprocess.Popen([sys.executable, str(pkg / "seed_runner.py"), "apply", "--manifest",
                                 str(pkg / sr.MANIFEST_NAME), *extra], env=env, stdout=subprocess.PIPE,
                                stderr=subprocess.STDOUT, text=True)


def add_version(pkg, step_id, version, sql_text, name="test"):
    """Append an immutable version of an existing step to a package copy and re-hash it."""
    doc = json.loads((pkg / sr.MANIFEST_NAME).read_text())
    rel = f"sql/steps/{step_id}/v{version:03d}__{name}.sql"
    p = pkg / rel
    p.write_bytes(sql_text.encode("utf-8"))
    doc["steps"].append({"id": step_id, "version": version, "file": rel,
                         "sha256": sr.checksum_text(sr.normalize_sql(p.read_bytes())),
                         "description": f"test fixture {name}", "requires": [], "reads": [], "writes": []})
    (pkg / sr.MANIFEST_NAME).write_text(json.dumps(doc, indent=2))
    return rel


def replace_step_file(pkg, step_id, version, new_text, update_manifest):
    doc = json.loads((pkg / sr.MANIFEST_NAME).read_text())
    e = next(s for s in doc["steps"] if s["id"] == step_id and s["version"] == version)
    (pkg / e["file"]).write_bytes(new_text.encode("utf-8"))
    if update_manifest:
        e["sha256"] = sr.checksum_file(pkg / e["file"])
        (pkg / sr.MANIFEST_NAME).write_text(json.dumps(doc, indent=2))


def fresh_database(ctx):
    ctx.sql.reset()
    ctx.sql.apply_schema()


def started(output, step_id=None, version=None):
    pat = r"\[START\s*\]" + (rf" {re.escape(step_id)} v{version}\b" if step_id else "")
    return len(re.findall(pat, output))


def insert_runtime_rows(sql):
    q = sql.rows
    sr_id = sql.scalar("SELECT TOP 1 Id FROM dbo.HuddleSegmentRoles ORDER BY Id")
    topic = sql.scalar("SELECT TOP 1 Id FROM dbo.HuddleTopics ORDER BY Id")
    act = sql.scalar("SELECT TOP 1 Id FROM dbo.HuddleActivities ORDER BY Id")
    role = sql.scalar("SELECT TOP 1 Id FROM dbo.Roles ORDER BY Id")
    wact = sql.scalar("SELECT TOP 1 Id FROM dbo.Activities ORDER BY Id")
    has_pii_cols = sql.scalar("SELECT COL_LENGTH('dbo.UserWorkflows','OwnerEmail')") is not None
    wf_cols = ("Id, Name, OwnerObjectId, " + ("OwnerEmail, OwnerDisplayName, " if has_pii_cols else "") +
               "RoleId, TotalDurationMinutes, IsFavorite, CreatedAtUtc")
    wf_vals = ("@wf, N'Sample workflow', N'seedtest-owner-1', " + ("N'seedtest@example.invalid', N'Seed Test', " if has_pii_cols else "") +
               f"{role}, 30, 0, SYSDATETIMEOFFSET()")
    sql.batches(f"""
DECLARE @plan uniqueidentifier = NEWID(), @sess uniqueidentifier = NEWID(), @wf uniqueidentifier = NEWID();
INSERT dbo.UserHuddlePlans (Id, OwnerObjectId, HuddleSegmentRoleId, Name, CreatedAtUtc)
    VALUES (@plan, N'seedtest-owner-1', {sr_id}, N'Sample plan', SYSDATETIMEOFFSET());
INSERT dbo.UserHuddlePlanItems (UserHuddlePlanId, WeekPosition, HuddleTopicId) VALUES (@plan, 1, {topic});
INSERT dbo.UserHuddleSessions (Id, OwnerObjectId, HuddleTopicId, Notes, CreatedAtUtc)
    VALUES (@sess, N'seedtest-owner-1', {topic}, N'sample notes', SYSDATETIMEOFFSET());
INSERT dbo.UserHuddleActivityProgress (UserHuddleSessionId, HuddleActivityId, IsCompleted) VALUES (@sess, {act}, 0);
INSERT dbo.HuddleVotes (Id, OwnerObjectId, HuddleTopicId, [Value], CreatedAtUtc)
    VALUES (NEWID(), N'seedtest-owner-1', {topic}, 1, SYSDATETIMEOFFSET());
INSERT dbo.UserWorkflows ({wf_cols}) VALUES ({wf_vals});
INSERT dbo.UserWorkflowActivities (UserWorkflowId, ActivityId, SortOrder, AddedAtUtc)
    VALUES (@wf, {wact}, 1, SYSDATETIMEOFFSET());
""")


# ------------------------------------------------------------------------------------------
# scenarios
# ------------------------------------------------------------------------------------------
def scenario_first_second_replay(ctx):
    """Tests 1, 2, 3, 9, 10, 11."""
    S, r, sql = "first/second/replay", ctx.r, ctx.sql
    fresh_database(ctx)
    pkg = ctx.package()
    rc, out = ctx.run(pkg)
    r.check(S, "T1 first run exits 0", rc == 0, out[-600:])
    r.check(S, "T1 all 17 seed versions started and applied", started(out) == 17 and out.count("[OK ") >= 17, out[-300:])
    counts = {t: sql.scalar(f"SELECT COUNT(*) FROM dbo.[{t}]") for t in SEEDED_TABLES}
    r.check(S, "T1 every table holds exactly the expected baseline count", counts == SEEDED_TABLES,
            {t: (counts[t], SEEDED_TABLES[t]) for t in counts if counts[t] != SEEDED_TABLES[t]})
    hist = sql.history()
    r.check(S, "T1 history: 17 Succeeded, none Failed", sum(1 for h in hist if h[2] == "Succeeded") == 17
            and not any(h[2] == "Failed" for h in hist), hist)
    r.check(S, "T10 all four gates passed", out.count("[GATE-OK ") == 4, out[-400:])

    before = sql.fingerprint(list(SEEDED_TABLES))          # includes UpdatedAtUtc in the checksum
    hist_before = sql.rows("SELECT * FROM dbo.SeedScriptHistory ORDER BY SeedScriptHistoryId")
    rc, out2 = ctx.run(pkg)
    r.check(S, "T2 second run exits 0", rc == 0, out2[-400:])
    r.check(S, "T2 second run skips all 17 and starts none", out2.count("[SKIP ") == 17 and started(out2) == 0, out2[-500:])
    r.check(S, "T2/T11 no seeded row changed, UpdatedAtUtc untouched", sql.fingerprint(list(SEEDED_TABLES)) == before)
    r.check(S, "T2/T11 history unchanged (no new attempt rows)",
            sql.rows("SELECT * FROM dbo.SeedScriptHistory ORDER BY SeedScriptHistoryId") == hist_before)

    # replay the packaged artifact once more, from a different copy of the same package
    rc, out3 = ctx.run(ctx.package("pkg_replay"))
    r.check(S, "T11 replay of a re-built identical package skips everything", rc == 0 and started(out3) == 0, out3[-300:])

    dupes = {t: sql.scalar(f"SELECT COUNT(*) FROM (SELECT ExternalId FROM dbo.[{t}] GROUP BY ExternalId HAVING COUNT(*) > 1) d")
             for t in EXTERNAL_ID_TABLES}
    r.check(S, "T3 no duplicate ExternalId in any seeded table", all(v == 0 for v in dupes.values()), dupes)
    # T3b: execute every step script again directly (an unguarded re-run); the MERGEs must not add rows
    doc = json.loads((pkg / sr.MANIFEST_NAME).read_text())
    for s in doc["steps"]:
        sql.batches("SET XACT_ABORT ON;\n" + sr.normalize_sql((pkg / s["file"]).read_bytes()))
    after = {t: sql.scalar(f"SELECT COUNT(*) FROM dbo.[{t}]") for t in SEEDED_TABLES}
    r.check(S, "T3 raw re-execution of every seed script adds no rows (idempotent MERGEs)", after == SEEDED_TABLES,
            {t: (after[t], SEEDED_TABLES[t]) for t in after if after[t] != SEEDED_TABLES[t]})

    bad = sql.rows("DBCC CHECKCONSTRAINTS WITH ALL_CONSTRAINTS")
    r.check(S, "T9 DBCC CHECKCONSTRAINTS reports no violation", bad == [], bad[:3])
    orphans = sql.scalar("""SELECT COUNT(*) FROM dbo.HuddleActivities a
        WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddlePlacements p WHERE p.Id = a.HuddlePlacementId)""")
    r.check(S, "T9 every activity resolves to a placement", orphans == 0, orphans)


def scenario_new_version(ctx):
    """Tests 4, 8 (runtime data) and 5-style skip of v1."""
    S, r, sql = "new version", ctx.r, ctx.sql
    fresh_database(ctx)
    pkg = ctx.package()
    assert ctx.run(pkg)[0] == 0
    insert_runtime_rows(sql)
    runtime_before = sql.fingerprint(RUNTIME_TABLES)
    agents_before = sql.row_checksums("HuddleAgents")
    add_version(pkg, "huddle-agents", 2, FIX_V2_OK, "update-agent-and-add-agent")
    rc, out = ctx.run(pkg)
    r.check(S, "T4 package with a new version exits 0", rc == 0, out[-500:])
    r.check(S, "T4 only the new version started; the 17 earlier versions skipped",
            started(out) == 1 and started(out, "huddle-agents", 2) == 1 and out.count("[SKIP ") == 17, out[-600:])
    r.check(S, "T4 existing row updated", sql.scalar(
        "SELECT ShortDescription FROM dbo.HuddleAgents WHERE ExternalId = N'AGT-001'") == "SEEDTEST v2 updated description")
    r.check(S, "T4 genuinely new row inserted exactly once",
            sql.scalar("SELECT COUNT(*) FROM dbo.HuddleAgents WHERE ExternalId = N'AGT-SEEDTEST-V2'") == 1)
    after = sql.row_checksums("HuddleAgents")
    changed = {k for k in after if k in agents_before and after[k] != agents_before[k]}
    r.check(S, "T4 no other agent row was touched", changed == {"AGT-001"}, changed)
    r.check(S, "T4 history records v2 as Succeeded", ("huddle-agents", 2, "Succeeded") in sql.history())
    r.check(S, "T8 user-owned/runtime rows unchanged by the content update", sql.fingerprint(RUNTIME_TABLES) == runtime_before)
    rc, out2 = ctx.run(pkg)
    r.check(S, "T4/T8 re-deploy of the updated package skips everything and leaves runtime rows alone",
            rc == 0 and started(out2) == 0 and sql.fingerprint(RUNTIME_TABLES) == runtime_before, out2[-300:])


def scenario_version_protection(ctx):
    """Test 5."""
    S, r, sql = "version protection", ctx.r, ctx.sql
    fresh_database(ctx)
    pkg = ctx.package()
    assert ctx.run(pkg)[0] == 0
    snap = sql.fingerprint(list(SEEDED_TABLES))
    hist_snap = sql.history()
    s1 = next(s for s in json.loads((pkg / sr.MANIFEST_NAME).read_text())["steps"] if s["id"] == "huddle-agents")
    original = (pkg / s1["file"]).read_text(encoding="utf-8")

    replace_step_file(pkg, "huddle-agents", 1, original + "\n-- edited after it was applied\n", update_manifest=False)
    rc, out = ctx.run(pkg)
    r.check(S, "T5a edited file with stale manifest checksum: exit 2, nothing started",
            rc == 2 and started(out) == 0 and "checksum mismatch" in out, out[-400:])

    replace_step_file(pkg, "huddle-agents", 1, original + "\n-- edited after it was applied\n", update_manifest=True)
    rc, out = ctx.run(pkg)
    r.check(S, "T5b edited file with re-hashed manifest: exit 2 against recorded history, nothing started",
            rc == 2 and started(out) == 0 and "immutable" in out, out[-500:])
    r.check(S, "T5 database untouched", sql.fingerprint(list(SEEDED_TABLES)) == snap and sql.history() == hist_snap)


def scenario_failure_retry(ctx):
    """Test 6, for both script shapes (plain THROW and TRY/CATCH+ROLLBACK)."""
    S, r, sql = "failure/retry", ctx.r, ctx.sql
    for label, fixture in (("plain THROW", FIX_V2_FAIL_PLAIN), ("TRY/CATCH+ROLLBACK", FIX_V2_FAIL_TRYCATCH)):
        fresh_database(ctx)
        pkg = ctx.package()
        assert ctx.run(pkg)[0] == 0
        add_version(pkg, "huddle-agents", 2, fixture, "failing")
        rc, out = ctx.run(pkg)
        r.check(S, f"T6 [{label}] failing version exits 1", rc == 1 and "[FAIL" in out, out[-500:])
        r.check(S, f"T6 [{label}] its insert was rolled back",
                sql.scalar("SELECT COUNT(*) FROM dbo.HuddleAgents WHERE ExternalId = N'AGT-SEEDTEST-FAIL'") == 0)
        h = [x for x in sql.history() if x[0] == "huddle-agents" and x[1] == 2]
        r.check(S, f"T6 [{label}] history shows Failed and no Succeeded", [x[2] for x in h] == ["Failed"], h)
        # fix the never-applied version and retry
        replace_step_file(pkg, "huddle-agents", 2, FIX_V2_OK, update_manifest=True)
        rc, out = ctx.run(pkg)
        r.check(S, f"T6 [{label}] retry after fixing succeeds", rc == 0 and started(out, "huddle-agents", 2) == 1, out[-400:])
        h = [x[2] for x in sql.history() if x[0] == "huddle-agents" and x[1] == 2]
        r.check(S, f"T6 [{label}] history: Failed then Succeeded, exactly one Succeeded", h == ["Failed", "Succeeded"], h)
        r.check(S, f"T6 [{label}] new row present exactly once",
                sql.scalar("SELECT COUNT(*) FROM dbo.HuddleAgents WHERE ExternalId = N'AGT-SEEDTEST-V2'") == 1)


def scenario_concurrency(ctx):
    """Test 7."""
    S, r, sql = "concurrency", ctx.r, ctx.sql
    fresh_database(ctx)
    pkg = ctx.package()
    assert ctx.run(pkg)[0] == 0
    add_version(pkg, "huddle-agents", 2, FIX_V2_SLOW, "slow")
    a, b = ctx.popen(pkg), ctx.popen(pkg)
    out_a, out_b = a.communicate(timeout=600)[0], b.communicate(timeout=600)[0]
    r.check(S, "T7 both concurrent runners exit 0", a.returncode == 0 and b.returncode == 0, (a.returncode, b.returncode, out_a[-200:], out_b[-200:]))
    r.check(S, "T7 the slow version was started exactly once across both runners",
            started(out_a, "huddle-agents", 2) + started(out_b, "huddle-agents", 2) == 1)
    h = [x for x in sql.history() if x[0] == "huddle-agents" and x[1] == 2]
    r.check(S, "T7 exactly one history row for the version, Succeeded", h == [("huddle-agents", 2, "Succeeded")], h)
    r.check(S, "T7 row inserted exactly once",
            sql.scalar("SELECT COUNT(*) FROM dbo.HuddleAgents WHERE ExternalId = N'AGT-SEEDTEST-SLOW'") == 1)

    # lock held by someone else -> runner times out with exit 3 and starts nothing
    add_version(pkg, "huddle-resources", 2, "SET NOCOUNT ON;\nSELECT 1;\nGO\n", "noop")
    holder = Sql(ctx.conn_str)
    rc_hold = holder.scalar("DECLARE @r int; EXEC @r = sys.sp_getapplock @Resource = N'%s', @LockMode = N'Exclusive', "
                            "@LockOwner = N'Session', @LockTimeout = 0; SELECT @r;" % sr.LOCK_RESOURCE)
    r.check(S, "T7 test connection obtained the deployment lock", rc_hold is not None and rc_hold >= 0, rc_hold)
    t0 = time.time()
    rc, out = ctx.run(pkg, "--lock-timeout-seconds", "3")
    r.check(S, "T7 runner without the lock exits 3 and starts nothing", rc == 3 and started(out) == 0, out[-300:])
    r.check(S, "T7 it waited roughly the lock timeout", time.time() - t0 >= 2.5, time.time() - t0)
    holder.cn.close()                                           # releases the session lock
    rc, out = ctx.run(pkg)
    r.check(S, "T7 once the lock is free the runner proceeds", rc == 0 and started(out, "huddle-resources", 2) == 1, out[-300:])


def scenario_gate_failure(ctx):
    """Test 10 (negative): a short table fails the deployment even though every seed version is 'applied'."""
    S, r, sql = "validation gates", ctx.r, ctx.sql
    fresh_database(ctx)
    pkg = ctx.package()
    assert ctx.run(pkg)[0] == 0
    sql.batches("DELETE TOP (1) FROM dbo.HuddleAgentResources;")      # disposable database only
    rc, out = ctx.run(pkg)
    r.check(S, "T10 a table below its minimum fails the run (exit 1)", rc == 1 and "minimum" in out.lower(), out[-500:])
    r.check(S, "T10 no seed version was re-run to 'repair' it", started(out) == 0)


def scenario_legacy_to_current(ctx):
    """Test 12: legacy placement/join data upgraded by a new version (unique-index edge cases)."""
    S, r, sql = "legacy -> current", ctx.r, ctx.sql
    legacy = {
        "huddle-placements": REPO / "database/fresh-install-v11.78/22_Huddle_Placements.sql.bak_taskN_20260925122108",
        "huddle-topic-agent-joins": REPO / "database/fresh-install-v11.78/29_Huddle_Topic_And_Agent_Joins.sql.bak_20260924085803",
        "huddle-activity-joins": REPO / "database/fresh-install-v11.78/30_Huddle_Activity_Joins.sql.bak_20260924085121",
    }
    if not all(p.is_file() for p in legacy.values()):
        r.check(S, "legacy backup files available", False, "missing .bak files under database/fresh-install-v11.78")
        return
    fresh_database(ctx)
    pkg = ctx.package(with_post_gates=False)     # the legacy data has the known role-path gap that gate 20 rejects
    current = {sid: next(pkg.glob(f"sql/steps/{sid}/v001__*.sql")).read_text(encoding="utf-8") for sid in legacy}
    for sid, path in legacy.items():
        replace_step_file(pkg, sid, 1, path.read_bytes().decode("utf-8-sig"), update_manifest=True)
    rc, out = ctx.run(pkg)
    r.check(S, "T12 legacy baseline applies", rc == 0, out[-500:])
    r.check(S, "T12 legacy state: the 4 placements are still Additional Content", sql.scalar(
        "SELECT COUNT(*) FROM dbo.HuddlePlacements WHERE ExternalId IN (N'PSS-PARTNER', N'DCSA-CONSUME', N'DSE-ARCH', "
        "N'PSS-JOINTPLAN') AND PathSection = N'SEC-ADDITIONAL'") == 4)
    r.check(S, "T12 legacy state: join labels carry the old wording", sql.scalar(
        "SELECT COUNT(*) FROM dbo.HuddleActivityAgents WHERE DisplayLabel LIKE N'%surfaced through Sales Agent'") > 0)
    counts_before = {t: sql.scalar(f"SELECT COUNT(*) FROM dbo.[{t}]") for t in SEEDED_TABLES}
    for sid, text in current.items():                         # the corrected content arrives as version 2
        add_version(pkg, sid, 2, text, "current")
    rc, out = ctx.run(pkg)
    r.check(S, "T12 upgrading legacy -> current as new versions exits 0 (no unique-index violation)", rc == 0, out[-700:])
    r.check(S, "T12 the 4 reclassified placements are now role-path items at the corrected sequence", sql.rows(
        "SELECT ExternalId, PathSection, [Sequence] FROM dbo.HuddlePlacements WHERE ExternalId IN (N'PSS-PARTNER', "
        "N'DCSA-CONSUME', N'DSE-ARCH', N'PSS-JOINTPLAN') ORDER BY ExternalId") == [
        ("DCSA-CONSUME", "SEC-ROLEPATH", 2), ("DSE-ARCH", "SEC-ROLEPATH", 3),
        ("PSS-JOINTPLAN", "SEC-ROLEPATH", 2), ("PSS-PARTNER", "SEC-ROLEPATH", 3)])
    r.check(S, "T12 old join-label wording replaced", sql.scalar(
        "SELECT COUNT(*) FROM dbo.HuddleActivityAgents WHERE DisplayLabel LIKE N'%surfaced through Sales Agent'") == 0)
    r.check(S, "T12 row counts unchanged by the upgrade (no duplicates, nothing lost)",
            {t: sql.scalar(f"SELECT COUNT(*) FROM dbo.[{t}]") for t in SEEDED_TABLES} == counts_before)
    # with the corrected data the full gate set must now pass
    rc, out = ctx.run(ctx.package("pkg_after_legacy"))
    r.check(S, "T12 full package (with gate 20) passes on the upgraded database", rc == 0, out[-500:])


SCENARIOS = [scenario_first_second_replay, scenario_new_version, scenario_version_protection, scenario_failure_retry,
             scenario_concurrency, scenario_gate_failure, scenario_legacy_to_current]


# ------------------------------------------------------------------------------------------
def guard(args, conn_str):
    db = re.search(r"(?:^|;)\s*(?:Database|Initial Catalog)\s*=\s*([^;]+)", conn_str, re.I)
    server = re.search(r"(?:^|;)\s*Server\s*=\s*([^;]+)", conn_str, re.I)
    name = db.group(1).strip() if db else ""
    problems = []
    if not re.search(r"(seedtest|disposable|scratch)", name, re.I):
        problems.append(f"database name {name!r} must contain 'seedtest', 'disposable' or 'scratch'")
    if server and re.search(r"\b(qa|uat|prod|production|stg|staging)\b", server.group(1), re.I):
        problems.append(f"server {server.group(1)!r} looks like a shared environment")
    if args.i_confirm_disposable_database != name:
        problems.append("pass --i-confirm-disposable-database with the exact database name")
    if problems:
        sys.exit("REFUSING TO RUN (this harness drops every table):\n  - " + "\n  - ".join(problems))


def self_check(work):
    """Offline: build every fixture package and make sure the runner's own verification accepts it."""
    ctx = Ctx(argparse.Namespace(), None, work)
    pkg = ctx.package("selfcheck")
    ok = True
    for step, text, name in (("huddle-agents", FIX_V2_OK, "ok"), ("huddle-resources", FIX_V2_FAIL_PLAIN, "plain"),
                             ("huddle-topics", FIX_V2_FAIL_TRYCATCH, "trycatch"), ("huddle-phases", FIX_V2_SLOW, "slow")):
        add_version(pkg, step, 2, text, name)
    m, problems = sr.load_manifest(pkg / sr.MANIFEST_NAME)
    problems = sr.verify_package(m, problems)
    print("fixture package verifies:", not problems, problems)
    ok &= not problems
    for name, text in (("ok", FIX_V2_OK), ("plain", FIX_V2_FAIL_PLAIN), ("trycatch", FIX_V2_FAIL_TRYCATCH), ("slow", FIX_V2_SLOW)):
        batches = sr.split_batches(sr.normalize_sql(text.encode()))
        print(f"fixture {name}: {len(batches)} batch(es), policy={sr.policy_violations('step', text)}")
        ok &= len(batches) >= 1 and not sr.policy_violations("step", text)
    legacy_ok = all((REPO / "database/fresh-install-v11.78" / f).is_file() for f in (
        "22_Huddle_Placements.sql.bak_taskN_20260925122108", "29_Huddle_Topic_And_Agent_Joins.sql.bak_20260924085803",
        "30_Huddle_Activity_Joins.sql.bak_20260924085121"))
    print("legacy backup files present:", legacy_ok)
    for p in (REPO / "database/fresh-install-v11.78").glob("*.bak*"):
        t = sr.normalize_sql(p.read_bytes())
        v = sr.policy_violations("step", t)
        print(f"  legacy {p.name}: batches={len(sr.split_batches(t))} policy={v}")
        ok &= not v
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--self-check", action="store_true")
    ap.add_argument("--i-confirm-disposable-database")
    ap.add_argument("--only", help="comma-separated scenario function names")
    ap.add_argument("--results", default=str(HERE / "integration-results.json"))
    args = ap.parse_args()
    work = Path(tempfile.mkdtemp(prefix="seedtest_"))
    try:
        if args.self_check:
            sys.exit(self_check(work))
        conn_str = os.environ.get("SEED_TEST_CONNECTION_STRING", "")
        if not conn_str:
            sys.exit("set SEED_TEST_CONNECTION_STRING (ODBC connection string for a disposable database)")
        guard(args, conn_str)
        ctx = Ctx(args, conn_str, work)
        wanted = set(args.only.split(",")) if args.only else None
        for fn in SCENARIOS:
            if wanted and fn.__name__ not in wanted:
                continue
            print(f"\n== {fn.__name__}: {fn.__doc__.strip().splitlines()[0]}", flush=True)
            try:
                fn(ctx)
            except Exception as exc:  # noqa: BLE001 -- a crashed scenario is a failed scenario
                ctx.r.check(fn.__name__, "scenario ran to completion", False, repr(exc))
        Path(args.results).write_text(json.dumps(ctx.r.rows, indent=2))
        failed = [x for x in ctx.r.rows if not x["passed"]]
        print(f"\n{len(ctx.r.rows) - len(failed)} passed, {len(failed)} failed. Results: {args.results}")
        sys.exit(1 if failed else 0)
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()
