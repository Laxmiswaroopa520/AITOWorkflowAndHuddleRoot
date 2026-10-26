"""Offline tests for seed_runner.py. No SQL Server is needed or used.

Two groups:
  * PackageTests  -- static checks of the shipped database/seed package against the repository.
  * RunnerTests   -- the runner's skip/apply/retry/lock/version-protection logic, driven through an
                     in-memory fake of the database layer.

The fake proves the RUNNER's decisions and ordering. It does not execute T-SQL, so it says nothing
about SQL semantics; those are covered by tests/integration/run_integration_tests.py, which needs a
disposable SQL Server.

Run:  python -m unittest discover -s database/seed/tests -v
"""
import json
import re
import shutil
import sys
import tempfile
import threading
import time
import unittest
from pathlib import Path

SEED_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SEED_DIR))
import seed_runner as sr  # noqa: E402

REPO = SEED_DIR.parent.parent
DATA_SCRIPTS = REPO / "database" / "Data_Scripts"
FRESH = REPO / "database" / "fresh-install-v11.78"


# ---------------------------------------------------------------------------------------------
# helpers to read VALUES lists out of the seed scripts
# ---------------------------------------------------------------------------------------------
def parse_tuples(block: str):
    """Parse top-level (...) tuples of a VALUES list into lists of python values."""
    rows, i, n = [], 0, len(block)
    while i < n:
        if block[i] == ")":      # end of the VALUES list; whatever follows is the alias/column list
            break
        if block[i] != "(":
            i += 1
            continue
        i += 1
        row, token, instr, depth = [], "", False, 0
        while i < n:
            c = block[i]
            if instr:
                if c == "'":
                    if i + 1 < n and block[i + 1] == "'":
                        token += "'"
                        i += 1
                    else:
                        instr = False
                else:
                    token += c
            elif c == "'":
                instr = True
            elif c == "(":
                depth += 1
                token += c
            elif c == ")":
                if depth == 0:
                    row.append(token.strip())
                    break
                depth -= 1
                token += c
            elif c == "," and depth == 0:
                row.append(token.strip())
                token = ""
            elif c in "N" and token == "" and i + 1 < n and block[i + 1] == "'":
                pass
            else:
                token += c
            i += 1
        rows.append(row)
        i += 1
    return rows


def values_before_merge(text: str, table: str):
    m = re.search(r"^MERGE dbo\.%s AS tgt" % table, text, re.M)
    pre = text[: m.start()]
    return parse_tuples(pre[pre.rfind("VALUES") + len("VALUES"):])


def read_norm(path: Path) -> str:
    return sr.normalize_sql(path.read_bytes())


# ---------------------------------------------------------------------------------------------
# PackageTests
# ---------------------------------------------------------------------------------------------
class PackageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest, problems = sr.load_manifest(SEED_DIR / sr.MANIFEST_NAME)
        cls.problems = sr.verify_package(cls.manifest, problems)

    def test_shipped_package_verifies(self):
        self.assertEqual(self.problems, [])

    def test_baseline_steps_are_normalised_copies_of_data_scripts(self):
        if not DATA_SCRIPTS.is_dir():
            self.skipTest("database/Data_Scripts not present")
        raw = json.loads((SEED_DIR / sr.MANIFEST_NAME).read_text(encoding="utf-8"))
        entries = raw["steps"] + raw["preflightGates"] + raw["postflightGates"]
        checked = 0
        for e in entries:
            if "source" not in e:
                continue
            src = REPO / e["source"]
            self.assertTrue(src.is_file(), e["source"])
            self.assertEqual(read_norm(src), read_norm(SEED_DIR / e["file"]), e["file"])
            checked += 1
        self.assertEqual(checked, 17 + 1 + 2)

    def test_excluded_scripts_are_not_in_package(self):
        listed = [s.file for s in self.manifest.steps] + [g.file for g in self.manifest.preflight + self.manifest.postflight]
        for f in listed:
            low = f.lower()
            for bad in ("01_schema", "reset", "007", "008", ".bak", "draft", "optional", "20c_"):
                self.assertNotIn(bad, low, f)
        self.assertEqual(sorted(p.name for p in (SEED_DIR / "sql").rglob("*.bak*")), [])

    def test_manifest_order_and_dependencies(self):
        ids = [s.id for s in self.manifest.steps]
        self.assertEqual(len(ids), len(set(ids)))
        produced = set()
        for s in self.manifest.steps:
            for r in s.requires:
                self.assertIn(r, ids[: ids.index(s.id)], f"{s.id} requires {r}")
            # every table a step reads (other than its own writes) is written by an earlier step
            for table in s.reads:
                self.assertTrue(table in produced or table in s.writes, f"{s.id} reads {table} before it is seeded")
            produced.update(s.writes)

    def test_declared_reads_and_writes_match_script_text(self):
        for s in self.manifest.steps:
            code = sr.strip_noise(read_norm(s.path))
            referenced = set(re.findall(r"\b(?:JOIN|FROM|MERGE|INTO|UPDATE)\s+(?:dbo\.)?\[?(\w+)", code, re.I))
            referenced = {t for t in referenced if t[:1].isupper() and t not in ("SET", "VALUES")}
            declared = set(s.reads) | set(s.writes)
            for table in declared:
                self.assertIn(table, code, f"{s.id}: declared table {table} not found in script")
            tables_in_script = set(re.findall(r"\bdbo\.\[?(\w+)", code))
            self.assertTrue(tables_in_script <= declared | {"HuddleSegmentRoles", "HuddleTopics"} | declared,
                            f"{s.id}: script touches undeclared tables {tables_in_script - declared}")

    def test_no_script_touches_user_runtime_or_bookkeeping_tables(self):
        pattern = sr._STEP_PROTECTED_TABLES
        for s in self.manifest.steps:
            self.assertIsNone(pattern.search(sr.strip_noise(read_norm(s.path))), s.id)

    def test_no_destructive_statements_in_baseline_steps(self):
        for s in self.manifest.steps:
            self.assertEqual(sr.policy_violations("step", read_norm(s.path)), [], s.id)

    def test_gates_write_nothing(self):
        for g in self.manifest.preflight + self.manifest.postflight:
            self.assertEqual(sr.policy_violations("gate", read_norm(g.path)), [], g.id)

    def test_minimum_count_gate_matches_row_counts_in_scripts(self):
        gate = read_norm(SEED_DIR / "sql/gates/post/91_Minimum_Row_Counts.sql")
        minimum = {m[0]: int(m[1]) for m in re.findall(r"\(N'(\w+)', (\d+)\)", gate.split("DECLARE @Actual")[0])}
        expected_from_scripts = {}
        for fname, tables in {
            "09_Huddle_Reference_Data.sql": ["HuddleSegments", "HuddleSegmentRoles", "HuddleFocusAreas", "HuddleMcemStages"],
            "10_Huddle_Topics.sql": ["HuddleTopics", "HuddleTopicRoles"],
            "11_Huddle_Placements.sql": ["HuddlePlacements", "HuddleRolePathItems"],
            "12_Huddle_Phases.sql": ["HuddlePhases"], "13_Huddle_Facilitator_Guides.sql": ["HuddleFacilitatorGuides"],
            "14_Huddle_Agents.sql": ["HuddleAgents"], "15_Huddle_Resources.sql": ["HuddleResources"],
            "16_Huddle_Activities.sql": ["HuddleActivities"],
            "18_Huddle_Topic_And_Agent_Joins.sql": ["HuddleTopicMcemStages", "HuddleTopicAgents",
                                                    "HuddleTopicResources", "HuddleAgentResources"],
            "19_Huddle_Activity_Joins.sql": ["HuddleActivityAgents", "HuddleActivityResources"],
        }.items():
            text = read_norm(next(p for p in (SEED_DIR / "sql/steps").rglob("*.sql") if p.name.endswith(fname)))
            for t in tables:
                expected_from_scripts[t] = len(values_before_merge(text, t))
        for t, n in expected_from_scripts.items():
            self.assertEqual(minimum[t], n, f"{t}: gate minimum {minimum[t]} vs rows in script {n}")
        self.assertEqual(len(minimum), 24)

    # -- text handling -------------------------------------------------------------------
    def test_checksum_ignores_bom_and_line_endings_but_not_content(self):
        base = "SELECT 1;\nGO\nSELECT 'a\nb';\n"
        crlf = ("﻿" + base.replace("\n", "\r\n")).encode("utf-8")
        self.assertEqual(sr.checksum_text(sr.normalize_sql(base.encode())), sr.checksum_text(sr.normalize_sql(crlf)))
        self.assertNotEqual(sr.checksum_text(base), sr.checksum_text(base.replace("SELECT 1", "SELECT 2")))

    def test_split_batches(self):
        text = "SELECT 1;\nGO\nSELECT 'x\nGO\ny';\n  go  -- comment\n/*\nGO\n*/\nSELECT 3;\nGO\n"
        batches = sr.split_batches(text)
        self.assertEqual(len(batches), 3)
        self.assertIn("GO\ny", batches[1])        # GO inside a string literal is not a separator
        self.assertIn("/*\nGO\n*/", batches[2])   # nor inside a block comment
        with self.assertRaises(sr.PackageError):
            sr.split_batches("SELECT 1;\nGO 5\n")

    def test_batch_counts_of_real_scripts_are_sane(self):
        for s in self.manifest.steps:
            batches = sr.split_batches(read_norm(s.path))
            self.assertGreaterEqual(len(batches), 1, s.id)
            self.assertTrue(all(b.strip() for b in batches))

    def test_policy_scanner_flags_what_it_must_and_ignores_text(self):
        bad = {
            "DELETE FROM dbo.Roles WHERE 1=0;": "DELETE",
            "TRUNCATE TABLE dbo.Roles;": "TRUNCATE",
            "MERGE dbo.Roles t USING s ON 1=1 WHEN NOT MATCHED BY SOURCE THEN DELETE;": "NOT MATCHED BY SOURCE",
            "UPDATE dbo.UserHuddlePlans SET x = 1;": "user-owned",
            "SELECT 1 FROM dbo.HuddleVotes;": "user-owned",
            "EXEC('DROP TABLE x');": "dynamic",
            "DROP TABLE dbo.Roles;": "DROP",
            "ALTER TABLE dbo.Roles ADD x int;": "ALTER",
            "INSERT INTO dbo.SeedScriptHistory DEFAULT VALUES;": "user-owned/runtime/bookkeeping",
        }
        for sql, label in bad.items():
            self.assertTrue(sr.policy_violations("step", sql), sql)
        ok = ("MERGE dbo.Roles t USING s ON t.ExternalId = s.ExternalId WHEN MATCHED THEN UPDATE SET Name = 'x';\n"
              "-- DELETE FROM dbo.Roles\n/* TRUNCATE TABLE x */\nSELECT 'please DELETE FROM the list; DROP TABLE';\n")
        self.assertEqual(sr.policy_violations("step", ok), [])
        self.assertEqual(sr.policy_violations("step", "DELETE FROM dbo.Roles WHERE ExternalId = 'X';",
                                              reviewed_destructive=True), [])
        self.assertTrue(sr.policy_violations("gate", "INSERT INTO dbo.Roles(Name) VALUES ('x');"))
        self.assertEqual(sr.policy_violations("gate", "DECLARE @t TABLE(a int); INSERT INTO @t VALUES (1);"), [])

    # -- legacy-to-current content updates (test 12, static part) -------------------------
    def test_legacy_to_current_placements_cannot_violate_unique_index(self):
        legacy = FRESH / "22_Huddle_Placements.sql.bak_taskN_20260925122108"
        if not legacy.is_file():
            self.skipTest("legacy placements backup not present")
        def rows(text):
            return {r[0]: (r[1], r[3], int(r[4])) for r in values_before_merge(text, "HuddlePlacements")}
        cur = rows(read_norm(next((SEED_DIR / "sql/steps/huddle-placements").glob("v001__*.sql"))))
        old = rows(read_norm(legacy))
        self.assertEqual(set(cur), set(old))
        changed = {k for k in cur if cur[k] != old[k]}
        self.assertEqual(changed, {"PSS-PARTNER", "DCSA-CONSUME", "DSE-ARCH", "PSS-JOINTPLAN"})
        # final state keeps (SegmentRole, PathSection, Sequence) unique
        self.assertEqual(len(cur), len(set(cur.values())))
        # no changed row moves into a slot that another row still occupies in the legacy state
        legacy_slots = {v: k for k, v in old.items()}
        for k in changed:
            self.assertNotIn(cur[k], legacy_slots, f"{k} would collide with {legacy_slots.get(cur[k])}")

    def test_legacy_to_current_joins_only_change_labels(self):
        pairs = [
            ("18_Huddle_Topic_And_Agent_Joins", "29_Huddle_Topic_And_Agent_Joins.sql.bak_20260924085803",
             "HuddleTopicAgents", (0, 1, 2), 3, 5, "huddle-topic-agent-joins"),
            ("19_Huddle_Activity_Joins", "30_Huddle_Activity_Joins.sql.bak_20260924085121",
             "HuddleActivityAgents", (0, 1, 2), 3, 5, "huddle-activity-joins"),
        ]
        for _name, legacy_name, table, key_idx, label_idx, order_idx, step_id in pairs:
            legacy = FRESH / legacy_name
            if not legacy.is_file():
                self.skipTest("legacy join backup not present")
            cur_text = read_norm(next((SEED_DIR / "sql/steps" / step_id).glob("v001__*.sql")))
            cur = {tuple(r[i] for i in key_idx): r for r in values_before_merge(cur_text, table)}
            old = {tuple(r[i] for i in key_idx): r for r in values_before_merge(read_norm(legacy), table)}
            self.assertEqual(set(cur), set(old), table)
            for k in cur:  # same primary key, same DisplayOrder, same ShowAgentAccessLink: only the label may differ
                self.assertEqual(cur[k][order_idx], old[k][order_idx], (table, k))
                self.assertEqual(cur[k][4], old[k][4], (table, k))
            # (parent, DisplayOrder) is unique in the current list, so a re-run cannot hit the unique index
            parents = [(k[0], cur[k][order_idx]) for k in cur]
            self.assertEqual(len(parents), len(set(parents)), table)


# ---------------------------------------------------------------------------------------------
# In-memory fake database
# ---------------------------------------------------------------------------------------------
class World:
    """State shared by every FakeDb connected to the same 'database'."""

    def __init__(self):
        self.history = []        # list of dict rows
        self.next_id = 1
        self.table_exists = False
        self.data = {}
        self.exec_log = []       # (kind, label) in execution order
        self.mutex = threading.Lock()   # the application lock
        self.guard = threading.Lock()   # protects the structures above
        self.lock_owner = None


class FakeDb:
    """Mimics PyodbcSeedDatabase. Script 'SQL' is a tiny language: `SET key value`, `FAIL message`,
    `SLEEP seconds`. A step runs atomically: data is restored if it fails."""

    def __init__(self, world):
        self.w = world
        self.has_lock = False

    def acquire_lock(self, timeout_seconds):
        if not self.w.mutex.acquire(timeout=timeout_seconds):
            raise sr.LockTimeoutError("lock timeout")
        self.has_lock = True

    def release_lock(self):
        if self.has_lock:
            self.has_lock = False
            self.w.mutex.release()

    def history_table_exists(self):
        return self.w.table_exists

    def ensure_history_table(self, batches):
        self.w.table_exists = True
        self.w.exec_log.append(("bootstrap", "history"))

    def load_history(self):
        with self.w.guard:
            return [sr.HistoryRow(r["id"], r["script"], r["version"], r["checksum"], r["status"], r["applied"])
                    for r in self.w.history]

    def mark_interrupted(self):
        n = 0
        for r in self.w.history:
            if r["status"] == "Started":
                r["status"] = "Interrupted"
                n += 1
        return n

    def begin_attempt(self, step, checksum, host, build):
        with self.w.guard:
            row = dict(id=self.w.next_id, script=step.id, version=step.version, checksum=checksum,
                       status="Started", applied=None)
            self.w.next_id += 1
            self.w.history.append(row)
            return row["id"]

    def _exec(self, batches):
        for b in batches:
            for line in b.splitlines():
                parts = line.strip().split(" ", 2)
                if parts[0] == "SET":
                    self.w.data[parts[1]] = parts[2]
                elif parts[0] == "FAIL":
                    raise sr.ScriptExecutionError(parts[1] if len(parts) > 1 else "boom")
                elif parts[0] == "SLEEP":
                    time.sleep(float(parts[1]))

    def run_step_atomically(self, attempt_id, batches, verbose, label):
        snapshot = dict(self.w.data)
        self.w.exec_log.append(("step", label))
        try:
            self._exec(batches)
        except sr.ScriptExecutionError:
            self.w.data.clear()
            self.w.data.update(snapshot)   # rollback
            raise
        with self.w.guard:
            row = next(r for r in self.w.history if r["id"] == attempt_id)
            clash = [r for r in self.w.history if r is not row and r["status"] == "Succeeded"
                     and (r["script"], r["version"]) == (row["script"], row["version"])]
            if clash:   # the filtered unique index UX_SeedScriptHistory_Succeeded
                self.w.data.clear()
                self.w.data.update(snapshot)
                raise sr.ScriptExecutionError("unique index violation: already Succeeded")
            row["status"], row["applied"] = "Succeeded", "now"
        return 1

    def record_failure(self, attempt_id, message):
        for r in self.w.history:
            if r["id"] == attempt_id and r["status"] == "Started":
                r["status"] = "Failed"

    def run_gate(self, batches, verbose, label):
        self.w.exec_log.append(("gate", label))
        self._exec(batches)

    def close(self):
        self.release_lock()


# ---------------------------------------------------------------------------------------------
# package builder for runner tests
# ---------------------------------------------------------------------------------------------
class Pkg:
    def __init__(self, root: Path):
        self.root = root
        self.steps = []      # dicts
        self.pre = []
        self.post = []
        (root / "sql/bootstrap").mkdir(parents=True, exist_ok=True)
        (root / "sql/bootstrap/000.sql").write_text("-- bootstrap\n", encoding="utf-8")

    def _write(self, rel, text, crlf=False):
        p = self.root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        data = text.replace("\n", "\r\n") if crlf else text
        p.write_bytes(data.encode("utf-8"))
        return sr.checksum_text(sr.normalize_sql(p.read_bytes()))

    def step(self, sid, version, text, requires=()):
        rel = f"sql/steps/{sid}/v{version:03d}__t.sql"
        self.steps.append({"id": sid, "version": version, "file": rel, "sha256": self._write(rel, text),
                           "requires": list(requires)})
        return rel

    def gate(self, phase, gid, text):
        rel = f"sql/gates/{phase}/{gid}.sql"
        entry = {"id": gid, "file": rel, "sha256": self._write(rel, text)}
        (self.pre if phase == "pre" else self.post).append(entry)

    def save(self):
        b = sr.checksum_text("-- bootstrap\n")
        doc = {"manifestVersion": 1, "name": "t", "bootstrap": {"file": "sql/bootstrap/000.sql", "sha256": b},
               "preflightGates": self.pre, "steps": self.steps, "postflightGates": self.post}
        (self.root / sr.MANIFEST_NAME).write_text(json.dumps(doc), encoding="utf-8")
        return self.root / sr.MANIFEST_NAME

    def load(self):
        m, problems = sr.load_manifest(self.root / sr.MANIFEST_NAME)
        problems = sr.verify_package(m, problems)
        if problems:
            raise sr.PackageError("; ".join(problems))
        return m


def runner(world, manifest, **kw):
    return sr.SeedRunner(FakeDb(world), manifest, lock_timeout_seconds=kw.pop("lock_timeout_seconds", 5), **kw)


def step_runs(world):
    return [label for kind, label in world.exec_log if kind == "step"]


class RunnerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.pkg = Pkg(self.tmp)
        self.pkg.gate("pre", "pre1", "SET pre ok")
        self.pkg.step("alpha", 1, "SET a 1")
        self.pkg.step("beta", 1, "SET b 1", requires=["alpha"])
        self.pkg.gate("post", "post1", "SET post ok")
        self.pkg.save()
        self.world = World()

    # 1 + 2 + 11
    def test_first_run_applies_everything_in_order_then_replay_skips_everything(self):
        m = self.pkg.load()
        out = runner(self.world, m).apply()
        self.assertEqual((out["applied"], out["skipped"]), (2, 0))
        self.assertEqual(step_runs(self.world), ["alpha v1", "beta v1"])
        self.assertEqual(self.world.data, {"a": "1", "b": "1", "pre": "ok", "post": "ok"})
        history_before = [dict(r) for r in self.world.history]
        self.world.exec_log.clear()
        out = runner(self.world, m).apply()                       # second deployment, nothing changed
        self.assertEqual((out["applied"], out["skipped"]), (0, 2))
        self.assertEqual(step_runs(self.world), [])               # no seed script was executed
        self.assertEqual(self.world.history, history_before)      # history untouched
        out = runner(self.world, m).apply()                       # third deployment
        self.assertEqual(out["skipped"], 2)
        self.assertEqual(step_runs(self.world), [])
        self.assertEqual([k for k, _ in self.world.exec_log if k == "gate"], ["gate"] * 4)  # gates run each time

    # 4: new version
    def test_new_version_runs_only_the_new_version(self):
        runner(self.world, self.pkg.load()).apply()
        self.world.exec_log.clear()
        self.pkg.step("alpha", 2, "SET a 2\nSET new row", requires=["alpha"])
        self.pkg.save()
        out = runner(self.world, self.pkg.load()).apply()
        self.assertEqual((out["applied"], out["skipped"]), (1, 2))
        self.assertEqual(step_runs(self.world), ["alpha v2"])
        self.assertEqual(self.world.data["a"], "2")
        self.assertEqual(self.world.data["new"], "row")
        succ = [(r["script"], r["version"]) for r in self.world.history if r["status"] == "Succeeded"]
        self.assertEqual(sorted(succ), [("alpha", 1), ("alpha", 2), ("beta", 1)])

    # 5: version protection (two layers)
    def test_modified_applied_file_is_rejected_at_package_verification(self):
        runner(self.world, self.pkg.load()).apply()
        (self.tmp / "sql/steps/alpha/v001__t.sql").write_text("SET a 999", encoding="utf-8")  # edit, manifest untouched
        with self.assertRaises(sr.PackageError) as cm:
            self.pkg.load()
        self.assertIn("checksum mismatch", str(cm.exception))

    def test_modified_applied_file_with_updated_manifest_is_rejected_against_history(self):
        runner(self.world, self.pkg.load()).apply()
        self.world.exec_log.clear()
        self.pkg.steps[0]["sha256"] = self.pkg._write(self.pkg.steps[0]["file"], "SET a 999")  # edit AND re-hash
        self.pkg.save()
        with self.assertRaises(sr.PackageError) as cm:
            runner(self.world, self.pkg.load()).apply()
        self.assertEqual(cm.exception.exit_code, 2)
        self.assertIn("immutable", str(cm.exception))
        self.assertEqual(step_runs(self.world), [])               # nothing ran, not even later steps
        self.assertEqual(self.world.data["a"], "1")

    def test_removed_applied_version_is_rejected(self):
        runner(self.world, self.pkg.load()).apply()
        self.pkg.steps = [s for s in self.pkg.steps if s["id"] != "beta"]
        (self.tmp / "sql/steps/beta/v001__t.sql").unlink()
        self.pkg.save()
        with self.assertRaises(sr.PackageError) as cm:
            runner(self.world, self.pkg.load()).apply()
        self.assertIn("no longer lists", str(cm.exception))

    def test_out_of_order_version_is_rejected(self):
        runner(self.world, self.pkg.load()).apply()
        self.world.history = [r for r in self.world.history if not (r["script"] == "alpha")]
        self.world.history.append(dict(id=99, script="alpha", version=2, checksum="x" * 64, status="Succeeded",
                                       applied="t"))
        with self.assertRaises(sr.PackageError):
            sr.compute_plan(self.pkg.load().steps + [], runner(self.world, self.pkg.load()).db.load_history())

    # 6: failure and retry
    def test_failure_rolls_back_records_failure_stops_and_is_retryable(self):
        self.pkg.step("gamma", 1, "SET g partial\nFAIL kaboom", requires=["beta"])
        self.pkg.step("delta", 1, "SET d 1", requires=["gamma"])
        self.pkg.save()
        w = self.world
        with self.assertRaises(sr.ScriptExecutionError):
            runner(w, self.pkg.load()).apply()
        self.assertNotIn("g", w.data)                              # partial change rolled back
        self.assertNotIn("d", w.data)                              # later step never ran
        self.assertNotIn("post", w.data)                           # post gates skipped
        status = {(r["script"], r["version"]): r["status"] for r in w.history}
        self.assertEqual(status[("gamma", 1)], "Failed")
        self.assertNotIn(("delta", 1), status)
        # fix the (never-applied) script and retry
        self.pkg.steps[2]["sha256"] = self.pkg._write(self.pkg.steps[2]["file"], "SET g fixed")
        self.pkg.save()
        w.exec_log.clear()
        out = runner(w, self.pkg.load()).apply()
        self.assertEqual((out["applied"], out["skipped"]), (2, 2))
        self.assertEqual(step_runs(w), ["gamma v1", "delta v1"])
        self.assertEqual(w.data["g"], "fixed")
        succ = [r for r in w.history if r["status"] == "Succeeded" and r["script"] == "gamma"]
        self.assertEqual(len(succ), 1)
        self.assertEqual([r["status"] for r in w.history if r["script"] == "gamma"], ["Failed", "Succeeded"])

    def test_interrupted_attempt_never_counts_as_applied(self):
        w = self.world
        w.table_exists = True
        w.history.append(dict(id=1, script="alpha", version=1, checksum=self.pkg.steps[0]["sha256"],
                              status="Started", applied=None))       # a runner died mid-script
        w.next_id = 2
        out = runner(w, self.pkg.load()).apply()
        self.assertEqual(out["applied"], 2)
        self.assertEqual(w.history[0]["status"], "Interrupted")
        self.assertEqual(len([r for r in w.history if r["status"] == "Succeeded" and r["script"] == "alpha"]), 1)

    # gates
    def test_preflight_failure_stops_everything_and_creates_nothing(self):
        self.pkg.pre[0]["sha256"] = self.pkg._write(self.pkg.pre[0]["file"], "FAIL schema-not-ready")
        self.pkg.save()
        with self.assertRaises(sr.ScriptExecutionError):
            runner(self.world, self.pkg.load()).apply()
        self.assertEqual(step_runs(self.world), [])
        self.assertFalse(self.world.table_exists)
        self.assertEqual(self.world.history, [])

    def test_post_gate_failure_fails_the_run_but_keeps_applied_versions(self):
        self.pkg.post[0]["sha256"] = self.pkg._write(self.pkg.post[0]["file"], "FAIL too-few-rows")
        self.pkg.save()
        with self.assertRaises(sr.ScriptExecutionError):
            runner(self.world, self.pkg.load()).apply()
        self.assertEqual(sorted(r["script"] for r in self.world.history if r["status"] == "Succeeded"),
                         ["alpha", "beta"])
        # next run: steps are skipped, the gate is evaluated again
        self.world.exec_log.clear()
        with self.assertRaises(sr.ScriptExecutionError):
            runner(self.world, self.pkg.load()).apply()
        self.assertEqual(step_runs(self.world), [])

    # 7: concurrency
    def test_two_concurrent_runners_apply_each_version_once(self):
        self.pkg.step("slow", 1, "SLEEP 0.4\nSET s 1", requires=["beta"])
        self.pkg.save()
        m = self.pkg.load()
        results, errors = [], []

        def go():
            try:
                results.append(runner(self.world, m, lock_timeout_seconds=10).apply())
            except sr.SeedError as exc:   # pragma: no cover
                errors.append(exc)

        threads = [threading.Thread(target=go) for _ in range(2)]
        [t.start() for t in threads]
        [t.join() for t in threads]
        self.assertEqual(errors, [])
        self.assertEqual(sorted(step_runs(self.world)), ["alpha v1", "beta v1", "slow v1"])   # each exactly once
        self.assertEqual(sorted((r["applied"], r["skipped"]) for r in results), [(0, 3), (3, 0)])
        self.assertEqual(len([r for r in self.world.history if r["status"] == "Succeeded"]), 3)

    def test_runner_that_cannot_get_the_lock_runs_nothing_and_exits_3(self):
        self.world.mutex.acquire()                 # someone else holds the deployment lock
        self.addCleanup(self.world.mutex.release)
        with self.assertRaises(sr.LockTimeoutError) as cm:
            runner(self.world, self.pkg.load(), lock_timeout_seconds=0.2).apply()
        self.assertEqual(cm.exception.exit_code, 3)
        self.assertEqual(self.world.exec_log, [])

    def test_history_unique_index_blocks_second_success_for_same_version(self):
        runner(self.world, self.pkg.load()).apply()
        db = FakeDb(self.world)
        step = self.pkg.load().steps[0]
        attempt = db.begin_attempt(step, step.sha256, "h", None)
        with self.assertRaises(sr.ScriptExecutionError):
            db.run_step_atomically(attempt, ["SET a changed"], False, "dup")
        self.assertEqual(self.world.data["a"], "1")

    # checkout differences
    def test_crlf_checkout_of_applied_scripts_is_still_skipped(self):
        runner(self.world, self.pkg.load()).apply()
        self.world.exec_log.clear()
        for s in self.pkg.steps:
            self.pkg._write(s["file"], "SET a 1" if s["id"] == "alpha" else "SET b 1", crlf=True)
        out = runner(self.world, self.pkg.load()).apply()
        self.assertEqual(out["skipped"], 2)
        self.assertEqual(step_runs(self.world), [])

    # CLI behaviour
    def test_cli_exit_codes_and_package_command(self):
        manifest = str(self.tmp / sr.MANIFEST_NAME)
        self.assertEqual(sr.main(["verify", "--manifest", manifest]), 0)
        (self.tmp / "sql/steps/alpha/v001__t.sql").write_text("SET a 5", encoding="utf-8")
        self.assertEqual(sr.main(["verify", "--manifest", manifest]), 2)

    def test_manifest_negative_cases(self):
        def mutate(fn):
            doc = json.loads((self.tmp / sr.MANIFEST_NAME).read_text())
            fn(doc)
            p = self.tmp / "m2.json"
            p.write_text(json.dumps(doc))
            m, problems = sr.load_manifest(p)
            return sr.verify_package(m, problems)

        self.assertTrue(mutate(lambda d: d["steps"][1].update(version=3)))                    # version gap
        self.assertTrue(mutate(lambda d: d["steps"][0].update(requires=["beta"])))            # requires later step
        self.assertTrue(mutate(lambda d: d["steps"][0].update(file="../evil.sql")))           # path escape
        self.assertTrue(mutate(lambda d: d["steps"].append(dict(d["steps"][0]))))             # duplicate
        self.assertTrue(mutate(lambda d: d["steps"][0].update(file="sql/steps/alpha/v001__x.bak.sql")))
        (self.tmp / "sql/steps/stray.sql").write_text("SET z 1", encoding="utf-8")            # unlisted file
        self.assertTrue(any("unlisted" in p for p in mutate(lambda d: None)))

    def test_package_command_copies_only_approved_files(self):
        (self.tmp / "README.md").write_text("r", encoding="utf-8")
        (self.tmp / "requirements.txt").write_text("pyodbc\n", encoding="utf-8")
        shutil.copy(SEED_DIR / "seed_runner.py", self.tmp / "seed_runner.py")
        out = self.tmp.parent / (self.tmp.name + "_out")
        self.addCleanup(shutil.rmtree, out, True)
        self.assertEqual(sr.main(["package", "--manifest", str(self.tmp / sr.MANIFEST_NAME), "--output", str(out)]), 0)
        names = sorted(p.relative_to(out).as_posix() for p in out.rglob("*") if p.is_file())
        self.assertIn("seed_runner.py", names)
        self.assertIn("package-info.json", names)
        self.assertEqual([n for n in names if n.startswith("tests") or n.startswith("templates")], [])
        self.assertEqual(sr.main(["package", "--manifest", str(self.tmp / sr.MANIFEST_NAME), "--output", str(out)]), 4)


if __name__ == "__main__":
    unittest.main()
