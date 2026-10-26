#!/usr/bin/env python3
"""
seed_runner.py -- history-aware runner for the versioned Huddle seed scripts.

What it does
------------
* Reads seed-manifest.json: an explicit, ordered list of approved, immutable seed script versions
  plus read-only validation gates.
* Runs each pending seed version inside ONE SQL Server transaction that also records
  dbo.SeedScriptHistory.Status = 'Succeeded', so the data changes and the "applied" record commit
  or roll back together.
* Skips a version only when a 'Succeeded' history row exists for it AND the checksum matches.
* Refuses to run (exit 2) when an applied version's file content has changed, when a file does not
  match the manifest, or when history and manifest disagree.
* Serialises deployments with a session-scoped SQL Server application lock.

Commands
--------
  verify    offline package check (manifest, checksums, policy). No database needed.
  plan      show what `apply` would do. Read-only; connects to the database.
  apply     run preflight gates, pending seed versions, then post gates.
  package   copy exactly the approved files into an output folder (e.g. db-drop/seed).
  checksum  print the normalised SHA-256 of files (helper for authoring a new version).

Connection string: ODBC connection string in the environment variable named by
--connection-string-env (default SEED_SQL_CONNECTION_STRING). It is never printed.

Exit codes: 0 ok | 1 a script or gate failed | 2 package/manifest/checksum/history problem
            3 could not obtain the deployment lock in time | 4 usage or connection problem
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import time
from collections import namedtuple
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

RUNNER_VERSION = "1.0.0"
MANIFEST_NAME = "seed-manifest.json"
LOCK_RESOURCE = "AITO.Huddle.SeedDeployment"
DEFAULT_CONNECTION_ENV = "SEED_SQL_CONNECTION_STRING"

EXIT_OK = 0
EXIT_SCRIPT_FAILED = 1
EXIT_PACKAGE_PROBLEM = 2
EXIT_LOCK_TIMEOUT = 3
EXIT_USAGE = 4


# --------------------------------------------------------------------------------------------
# Errors
# --------------------------------------------------------------------------------------------
class SeedError(Exception):
    exit_code = EXIT_SCRIPT_FAILED


class PackageError(SeedError):
    """Manifest, checksum, policy or history-consistency problem. Nothing was executed."""
    exit_code = EXIT_PACKAGE_PROBLEM


class ScriptExecutionError(SeedError):
    """A seed script or gate raised an error."""
    exit_code = EXIT_SCRIPT_FAILED


class LockTimeoutError(SeedError):
    exit_code = EXIT_LOCK_TIMEOUT


class UsageError(SeedError):
    exit_code = EXIT_USAGE


# --------------------------------------------------------------------------------------------
# Logging
# --------------------------------------------------------------------------------------------
def log(tag: str, message: str) -> None:
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"{stamp} [{tag:<9}] {message}", flush=True)


# --------------------------------------------------------------------------------------------
# Script text handling: normalisation, checksum, GO splitting, policy scan
# --------------------------------------------------------------------------------------------
def normalize_sql(raw: bytes) -> str:
    """Decode UTF-8 (BOM tolerated) and normalise line endings to LF.

    The checksum and the text sent to SQL Server are both derived from this, so a script hashes
    and executes identically whether it was checked out with CRLF (Windows autocrlf) or LF, with
    or without a byte-order mark.
    """
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise PackageError(f"file is not valid UTF-8: {exc}") from exc
    return text.replace("\r\n", "\n").replace("\r", "\n")


def checksum_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def checksum_file(path: Path) -> str:
    return checksum_text(normalize_sql(path.read_bytes()))


# Tokens that must be skipped when looking for GO or for forbidden statements:
# string literals, block comments, line comments. GO is only a separator on a line of its own.
_TOKENS = re.compile(
    r"""
      (?P<str>'[^']*(?:''[^']*)*')
    | (?P<blk>/\*.*?\*/)
    | (?P<lc>--[^\n]*)
    | (?P<go>^[ \t]*GO(?:[ \t]+(?P<n>\d+))?[ \t]*(?:--[^\n]*)?$)
    """,
    re.IGNORECASE | re.DOTALL | re.MULTILINE | re.VERBOSE,
)


def split_batches(text: str) -> List[str]:
    """Split a normalised script into batches on GO lines (sqlcmd/SSMS semantics)."""
    batches: List[str] = []
    pos = 0
    for m in _TOKENS.finditer(text):
        if m.group("go") is None:
            continue
        if m.group("n") and int(m.group("n")) != 1:
            raise PackageError("'GO <count>' is not supported in seed scripts")
        chunk = text[pos:m.start()]
        if chunk.strip():
            batches.append(chunk)
        pos = m.end()
    tail = text[pos:]
    if tail.strip():
        batches.append(tail)
    return batches


def strip_noise(text: str) -> str:
    """Blank out string literals and comments so policy checks see only executable SQL."""

    def _blank(m: "re.Match[str]") -> str:
        return " " if m.group("go") is None else m.group(0)

    return _TOKENS.sub(_blank, text)


# Statements a seed STEP must never contain. Schema belongs to EF Core migrations; seed steps
# only insert/update reference content.
_STEP_ALWAYS_FORBIDDEN = [
    (r"\bTRUNCATE\s+TABLE\b", "TRUNCATE TABLE"),
    (r"\bDROP\s+(TABLE|DATABASE|SCHEMA|VIEW|PROCEDURE|FUNCTION|TRIGGER)\b", "DROP <object>"),
    (r"\bALTER\s+(TABLE|DATABASE)\b", "ALTER TABLE/DATABASE"),
    (r"\bCREATE\s+(TABLE|DATABASE|INDEX|UNIQUE|SCHEMA)\b", "CREATE TABLE/DATABASE/INDEX"),
    (r"\bNOT\s+MATCHED\s+BY\s+SOURCE\b", "WHEN NOT MATCHED BY SOURCE"),
    (r"\bTHEN\s+DELETE\b", "MERGE ... THEN DELETE"),
    (r"\bxp_cmdshell\b", "xp_cmdshell"),
    (r"\bDBCC\b", "DBCC"),
    (r"\bsp_executesql\b", "dynamic SQL (sp_executesql)"),
    (r"\bEXEC(?:UTE)?\s*\(", "dynamic SQL (EXEC(...))"),
    (r"\bSET\s+IDENTITY_INSERT\b", "SET IDENTITY_INSERT (stable IDs must not be rewritten)"),
    (r"\bNOCHECK\b", "NOCHECK constraint"),
    (r"\bSHUTDOWN\b", "SHUTDOWN"),
]
# User-owned / runtime / bookkeeping tables a seed step must not even reference.
_STEP_PROTECTED_TABLES = re.compile(
    r"\bdbo\.\[?(UserHuddle\w*|HuddleVotes|UserWorkflow\w*|WorkflowShares|UserLaunchPlans|"
    r"SeedScriptHistory|__EFMigrationsHistory)\b",
    re.IGNORECASE,
)
_STEP_DELETE = re.compile(r"(?<!\bON\s)\bDELETE\b", re.IGNORECASE)
_STEP_ON_DELETE = re.compile(r"\bON\s+DELETE\b", re.IGNORECASE)

# A gate (read-only validation) must not change any real table or schema.
_GATE_FORBIDDEN = [
    (r"\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|MERGE(?:\s+INTO)?)\s+\[?dbo\]?\.", "write to a dbo table"),
    (r"\bTRUNCATE\s+TABLE\b", "TRUNCATE TABLE"),
    (r"\bDROP\s+(TABLE|DATABASE|SCHEMA|INDEX)\b", "DROP <object>"),
    (r"\bALTER\s+(TABLE|DATABASE)\b", "ALTER TABLE/DATABASE"),
    (r"\bCREATE\s+(TABLE|DATABASE|INDEX|UNIQUE)\b", "CREATE TABLE/DATABASE/INDEX"),
    (r"\bxp_cmdshell\b", "xp_cmdshell"),
]
_FORBIDDEN_FILE_NAME = re.compile(r"(\.bak|_bak|\.tmp|\.orig|~$|reset|backup|optional|draft)", re.IGNORECASE)


def policy_violations(kind: str, text: str, *, reviewed_destructive: bool = False) -> List[str]:
    """Return human-readable policy violations for a step ('step') or gate ('gate') script."""
    code = strip_noise(text)
    found: List[str] = []
    if kind == "gate":
        for pattern, label in _GATE_FORBIDDEN:
            if re.search(pattern, code, re.IGNORECASE):
                found.append(label)
        return found
    for pattern, label in _STEP_ALWAYS_FORBIDDEN:
        if re.search(pattern, code, re.IGNORECASE):
            found.append(label)
    if _STEP_PROTECTED_TABLES.search(code):
        found.append("reference to a user-owned/runtime/bookkeeping table")
    without_ddl_delete = _STEP_ON_DELETE.sub(" ", code)
    if _STEP_DELETE.search(without_ddl_delete) and not reviewed_destructive:
        found.append("DELETE (allowed only with a non-empty 'reviewedDestructive' manifest field)")
    return found


# --------------------------------------------------------------------------------------------
# Manifest
# --------------------------------------------------------------------------------------------
Step = namedtuple("Step", "id version file sha256 description requires reads writes reviewed_destructive path")
Gate = namedtuple("Gate", "id file sha256 description path")
Manifest = namedtuple("Manifest", "name bootstrap preflight steps postflight base_dir")
Bootstrap = namedtuple("Bootstrap", "file sha256 path")

_ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,98}$")
_SHA_RE = re.compile(r"^[0-9a-f]{64}$")


def _safe_path(base: Path, rel: str, problems: List[str], what: str) -> Optional[Path]:
    if not isinstance(rel, str) or not rel or rel.startswith(("/", "\\")) or ".." in Path(rel).parts or ":" in rel:
        problems.append(f"{what}: unsafe or empty path {rel!r}")
        return None
    p = (base / rel).resolve()
    try:
        p.relative_to(base.resolve())
    except ValueError:
        problems.append(f"{what}: path escapes the package folder: {rel!r}")
        return None
    return p


def load_manifest(manifest_path: Path) -> Tuple[Manifest, List[str]]:
    """Parse and fully validate the manifest. Returns (manifest, problems); problems is empty
    when the package is sound. Never executes anything."""
    problems: List[str] = []
    base = manifest_path.parent
    try:
        doc = json.loads(manifest_path.read_text(encoding="utf-8-sig"))
    except (OSError, ValueError) as exc:
        raise PackageError(f"cannot read manifest {manifest_path}: {exc}") from exc

    if doc.get("manifestVersion") != 1:
        problems.append("manifestVersion must be 1")

    def read_gate(entry: dict, section: str) -> Optional[Gate]:
        gid, rel, sha = entry.get("id"), entry.get("file"), entry.get("sha256")
        what = f"{section} gate {gid!r}"
        if not isinstance(gid, str) or not _ID_RE.match(gid):
            problems.append(f"{section}: invalid gate id {gid!r}")
            return None
        p = _safe_path(base, rel, problems, what)
        if p is None:
            return None
        if not (isinstance(sha, str) and _SHA_RE.match(sha)):
            problems.append(f"{what}: sha256 must be 64 lowercase hex characters")
        return Gate(gid, rel, sha, entry.get("description", ""), p)

    bootstrap_doc = doc.get("bootstrap") or {}
    bp = _safe_path(base, bootstrap_doc.get("file"), problems, "bootstrap")
    bootstrap = Bootstrap(bootstrap_doc.get("file"), bootstrap_doc.get("sha256"), bp)

    preflight = [g for g in (read_gate(e, "preflight") for e in doc.get("preflightGates", [])) if g]
    postflight = [g for g in (read_gate(e, "postflight") for e in doc.get("postflightGates", [])) if g]

    steps: List[Step] = []
    seen_pairs = set()
    last_version: Dict[str, int] = {}
    first_index: Dict[str, int] = {}
    for idx, e in enumerate(doc.get("steps", [])):
        sid, ver, rel, sha = e.get("id"), e.get("version"), e.get("file"), e.get("sha256")
        what = f"step {sid!r} v{ver}"
        if not isinstance(sid, str) or not _ID_RE.match(sid):
            problems.append(f"steps[{idx}]: invalid id {sid!r}")
            continue
        if not isinstance(ver, int) or isinstance(ver, bool) or ver < 1:
            problems.append(f"{what}: version must be an integer >= 1")
            continue
        if (sid, ver) in seen_pairs:
            problems.append(f"{what}: duplicate (id, version)")
            continue
        seen_pairs.add((sid, ver))
        expected_prev = last_version.get(sid, 0)
        if ver != expected_prev + 1:
            problems.append(f"{what}: versions of one script must be listed in order with no gaps "
                            f"(expected v{expected_prev + 1})")
        last_version[sid] = ver
        first_index.setdefault(sid, idx)
        p = _safe_path(base, rel, problems, what)
        if p is not None:
            expected_prefix = f"sql/steps/{sid}/v{ver:03d}"
            if not rel.replace("\\", "/").startswith(expected_prefix):
                problems.append(f"{what}: file must live at {expected_prefix}*.sql")
            if not rel.lower().endswith(".sql"):
                problems.append(f"{what}: file must end in .sql")
            if _FORBIDDEN_FILE_NAME.search(Path(rel).name):
                problems.append(f"{what}: file name looks like a backup/reset/optional/draft file: {rel}")
        if not (isinstance(sha, str) and _SHA_RE.match(sha)):
            problems.append(f"{what}: sha256 must be 64 lowercase hex characters")
        requires = list(e.get("requires", []))
        for req in requires:
            if req not in first_index or first_index[req] >= idx:
                problems.append(f"{what}: requires {req!r}, which is not listed earlier in steps")
        steps.append(Step(sid, ver, rel, sha, e.get("description", ""), requires,
                          list(e.get("reads", [])), list(e.get("writes", [])),
                          bool(str(e.get("reviewedDestructive", "")).strip()), p))

    if not steps:
        problems.append("manifest lists no steps")
    gate_ids = [g.id for g in preflight + postflight]
    if len(gate_ids) != len(set(gate_ids)):
        problems.append("gate ids must be unique")

    return Manifest(doc.get("name", ""), bootstrap, preflight, steps, postflight, base), problems


def verify_package(manifest: Manifest, problems: List[str]) -> List[str]:
    """Checksum, policy and completeness checks against the files on disk."""
    base = manifest.base_dir

    # bootstrap
    b = manifest.bootstrap
    if b.path is None or not b.path.is_file():
        problems.append(f"bootstrap file missing: {b.file}")
    elif checksum_file(b.path) != b.sha256:
        problems.append(f"bootstrap checksum mismatch: {b.file}")

    listed: set = set()
    if b.path is not None:
        listed.add(b.path.resolve())

    for kind, items in (("gate", manifest.preflight + manifest.postflight),):
        for g in items:
            if g.path is None:
                continue
            listed.add(g.path.resolve())
            if not g.path.is_file():
                problems.append(f"gate file missing: {g.file}")
                continue
            text = normalize_sql(g.path.read_bytes())
            if checksum_text(text) != g.sha256:
                problems.append(f"gate {g.id}: checksum mismatch for {g.file} (expected {g.sha256[:12]}..., "
                                f"actual {checksum_text(text)[:12]}...). "
                                f"Update the manifest in the same reviewed change.")
            for v in policy_violations("gate", text):
                problems.append(f"gate {g.id}: policy violation: {v}")
            try:
                split_batches(text)
            except PackageError as exc:
                problems.append(f"gate {g.id}: {exc}")

    for s in manifest.steps:
        if s.path is None:
            continue
        listed.add(s.path.resolve())
        if not s.path.is_file():
            problems.append(f"step {s.id} v{s.version}: file missing: {s.file}")
            continue
        text = normalize_sql(s.path.read_bytes())
        actual = checksum_text(text)
        if actual != s.sha256:
            problems.append(f"step {s.id} v{s.version}: checksum mismatch for {s.file} (manifest "
                            f"{s.sha256[:12]}..., file {actual[:12]}...). Versions are immutable: restore the file, "
                            f"or add a NEW version instead of editing this one.")
        for v in policy_violations("step", text, reviewed_destructive=s.reviewed_destructive):
            problems.append(f"step {s.id} v{s.version}: policy violation: {v}")
        try:
            if not split_batches(text):
                problems.append(f"step {s.id} v{s.version}: script is empty")
        except PackageError as exc:
            problems.append(f"step {s.id} v{s.version}: {exc}")

    # Every .sql file under sql/ must be listed: no stray, unreviewed script can sit in the package.
    sql_root = base / "sql"
    if sql_root.is_dir():
        for p in sorted(sql_root.rglob("*")):
            if p.is_file() and p.resolve() not in listed:
                problems.append(f"unlisted file under sql/: {p.relative_to(base).as_posix()} "
                                f"(every file must be in the manifest or be removed)")
    return problems


# --------------------------------------------------------------------------------------------
# History model and plan
# --------------------------------------------------------------------------------------------
HistoryRow = namedtuple("HistoryRow", "attempt_id script_id version checksum status applied_at")
PlanItem = namedtuple("PlanItem", "action step detail")  # action: SKIP | RUN


def compute_plan(steps: Sequence[Step], history: Sequence[HistoryRow]) -> List[PlanItem]:
    """Decide SKIP/RUN per step, or raise PackageError listing every history/manifest conflict."""
    problems: List[str] = []
    succeeded: Dict[Tuple[str, int], HistoryRow] = {}
    for h in history:
        if h.status == "Succeeded":
            succeeded[(h.script_id, h.version)] = h

    manifest_pairs = {(s.id, s.version) for s in steps}
    for (sid, ver), h in sorted(succeeded.items()):
        if (sid, ver) not in manifest_pairs:
            problems.append(f"history says {sid} v{ver} was applied ({h.applied_at}) but the manifest "
                            f"no longer lists it. Applied versions must never be removed or renamed.")

    plan: List[PlanItem] = []
    for s in steps:
        hit = succeeded.get((s.id, s.version))
        if hit is not None:
            if hit.checksum != s.sha256:
                problems.append(
                    f"{s.id} v{s.version} was applied on {hit.applied_at} with checksum {hit.checksum[:12]}..., "
                    f"but the package now contains checksum {s.sha256[:12]}.... An applied version is immutable. "
                    f"Restore the original file and put the change in a new version "
                    f"(v{s.version + 1}), or follow the reviewed migration procedure in README.md.")
            plan.append(PlanItem("SKIP", s, f"already applied {hit.applied_at}"))
            continue
        later = [v for (sid, v) in succeeded if sid == s.id and v > s.version]
        if later:
            problems.append(f"{s.id} v{s.version} has not been applied but a later version (v{max(later)}) has. "
                            f"Versions must be applied in order; refusing to apply out of order.")
        plan.append(PlanItem("RUN", s, "not applied yet"))
    if problems:
        raise PackageError("seed history conflicts with the package:\n  - " + "\n  - ".join(problems))
    return plan


# --------------------------------------------------------------------------------------------
# Database access
# --------------------------------------------------------------------------------------------
def _trim(msg: str, limit: int = 3900) -> str:
    msg = " ".join(str(msg).split())
    return msg if len(msg) <= limit else msg[: limit - 3] + "..."


class PyodbcSeedDatabase:
    """SQL Server access through pyodbc. One autocommit connection; transactions are explicit
    T-SQL so nested BEGIN/COMMIT inside seed scripts behave exactly as in SSMS."""

    def __init__(self, connection_string: str, command_timeout: int = 1800, login_timeout: int = 60):
        try:
            import pyodbc  # type: ignore
        except ImportError as exc:  # pragma: no cover
            raise UsageError("pyodbc is not installed. Run: pip install -r requirements.txt "
                             "(and install 'ODBC Driver 18 for SQL Server').") from exc
        self._pyodbc = pyodbc
        try:
            self.cn = pyodbc.connect(connection_string, autocommit=True, timeout=login_timeout)
        except pyodbc.Error as exc:
            raise UsageError(f"cannot connect to the database: {_trim(exc)}") from exc
        self.cn.timeout = command_timeout
        self._lock_held = False

    # -- generic -------------------------------------------------------------------------
    def _run_batches(self, batches: Sequence[str], verbose: bool, label: str) -> None:
        cur = self.cn.cursor()
        try:
            for batch in batches:
                cur.execute(batch)
                while True:
                    if verbose:
                        for _state, text in list(getattr(cur, "messages", None) or [])[:50]:
                            log("SQL", f"{label}: {_trim(text, 300)}")
                    # nextset() surfaces errors raised by later statements (THROW/RAISERROR).
                    if not cur.nextset():
                        break
        except self._pyodbc.Error as exc:
            raise ScriptExecutionError(_trim(exc)) from exc
        finally:
            try:
                cur.close()
            except Exception:  # noqa: BLE001
                pass

    def _scalar(self, sql: str, params: Sequence = ()) -> object:
        cur = self.cn.cursor()
        try:
            cur.execute(sql, params) if params else cur.execute(sql)
            row = cur.fetchone()
            return row[0] if row else None
        finally:
            cur.close()

    # -- lock ----------------------------------------------------------------------------
    def acquire_lock(self, timeout_seconds: int) -> None:
        rc = self._scalar(
            "SET NOCOUNT ON; DECLARE @r int; "
            "EXEC @r = sys.sp_getapplock @Resource = ?, @LockMode = N'Exclusive', "
            "@LockOwner = N'Session', @LockTimeout = ?; SELECT @r;",
            (LOCK_RESOURCE, int(timeout_seconds) * 1000),
        )
        if rc is None or int(rc) < 0:
            raise LockTimeoutError(
                f"could not obtain the seed deployment lock within {timeout_seconds}s (sp_getapplock returned {rc}). "
                f"Another seed deployment is probably running; retry after it finishes.")
        self._lock_held = True

    def release_lock(self) -> None:
        if self._lock_held:
            try:
                self._scalar("SET NOCOUNT ON; DECLARE @r int; EXEC @r = sys.sp_releaseapplock "
                             "@Resource = ?, @LockOwner = N'Session'; SELECT @r;", (LOCK_RESOURCE,))
            except Exception:  # noqa: BLE001 -- the lock is released when the connection closes anyway
                pass
            self._lock_held = False

    # -- history -------------------------------------------------------------------------
    def history_table_exists(self) -> bool:
        return self._scalar("SELECT OBJECT_ID(N'dbo.SeedScriptHistory', N'U');") is not None

    def ensure_history_table(self, bootstrap_batches: Sequence[str]) -> None:
        self._run_batches(bootstrap_batches, False, "bootstrap")

    def load_history(self) -> List[HistoryRow]:
        if not self.history_table_exists():
            return []
        cur = self.cn.cursor()
        try:
            cur.execute("SELECT SeedScriptHistoryId, ScriptId, ScriptVersion, ChecksumSha256, [Status], AppliedAtUtc "
                        "FROM dbo.SeedScriptHistory;")
            return [HistoryRow(r[0], r[1], r[2], r[3], r[4], r[5]) for r in cur.fetchall()]
        finally:
            cur.close()

    def mark_interrupted(self) -> int:
        n = self._scalar(
            "SET NOCOUNT ON; UPDATE dbo.SeedScriptHistory SET [Status] = 'Interrupted', "
            "CompletedAtUtc = SYSUTCDATETIME(), "
            "ErrorMessage = N'Runner stopped before completion. No success was recorded and SQL Server rolled the "
            "script''s transaction back when the connection ended.' WHERE [Status] = 'Started'; SELECT @@ROWCOUNT;")
        return int(n or 0)

    def begin_attempt(self, step: Step, checksum: str, runner_host: str, build_id: Optional[str]) -> int:
        new_id = self._scalar(
            "SET NOCOUNT ON; INSERT INTO dbo.SeedScriptHistory (ScriptId, ScriptVersion, FileName, ChecksumSha256, "
            "[Status], RunnerVersion, RunnerHost, BuildId) VALUES (?, ?, ?, ?, 'Started', ?, ?, ?); "
            "SELECT CAST(SCOPE_IDENTITY() AS bigint);",
            (step.id, step.version, step.file, checksum, RUNNER_VERSION, runner_host[:128], (build_id or None)),
        )
        return int(new_id)

    def run_step_atomically(self, attempt_id: int, batches: Sequence[str], verbose: bool, label: str) -> int:
        """Run the script and mark the history row 'Succeeded' inside ONE transaction.
        Returns duration in ms. On any error the transaction is rolled back and
        ScriptExecutionError is raised; the caller then records the failure."""
        started = time.monotonic()
        self._run_batches(["SET XACT_ABORT ON; SET NOCOUNT ON; BEGIN TRANSACTION;"], False, label)
        try:
            self._run_batches(batches, verbose, label)
            depth = self._scalar("SELECT @@TRANCOUNT;")
            if depth != 1:
                raise ScriptExecutionError(
                    f"the script left the transaction depth at {depth} instead of 1 "
                    f"(it committed or rolled back more than it started); refusing to record success")
            duration = int((time.monotonic() - started) * 1000)
            updated = self._scalar(
                "SET NOCOUNT ON; UPDATE dbo.SeedScriptHistory SET [Status] = 'Succeeded', "
                "CompletedAtUtc = SYSUTCDATETIME(), AppliedAtUtc = SYSUTCDATETIME(), DurationMs = ?, "
                "ErrorMessage = NULL WHERE SeedScriptHistoryId = ? AND [Status] = 'Started'; SELECT @@ROWCOUNT;",
                (duration, attempt_id))
            if updated != 1:
                raise ScriptExecutionError("could not record success in dbo.SeedScriptHistory (row not in 'Started')")
            self._run_batches(["COMMIT TRANSACTION;"], False, label)
            return duration
        except Exception:
            self._rollback_quietly()
            raise

    def _rollback_quietly(self) -> None:
        try:
            cur = self.cn.cursor()
            cur.execute("IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;")
            cur.close()
        except Exception:  # noqa: BLE001 -- a dead connection already rolled everything back
            pass

    def record_failure(self, attempt_id: int, message: str) -> None:
        self._scalar(
            "SET NOCOUNT ON; UPDATE dbo.SeedScriptHistory SET [Status] = 'Failed', CompletedAtUtc = SYSUTCDATETIME(), "
            "ErrorMessage = ? WHERE SeedScriptHistoryId = ? AND [Status] = 'Started'; SELECT @@ROWCOUNT;",
            (_trim(message, 3900), attempt_id))

    # -- gates ---------------------------------------------------------------------------
    def run_gate(self, batches: Sequence[str], verbose: bool, label: str) -> None:
        self._run_batches(batches, verbose, label)

    def close(self) -> None:
        self.release_lock()
        try:
            self.cn.close()
        except Exception:  # noqa: BLE001
            pass


# --------------------------------------------------------------------------------------------
# Orchestration
# --------------------------------------------------------------------------------------------
def _batches_for(path: Path) -> List[str]:
    return split_batches(normalize_sql(path.read_bytes()))


class SeedRunner:
    def __init__(self, db, manifest: Manifest, *, verbose: bool = False, build_id: Optional[str] = None,
                 lock_timeout_seconds: int = 900):
        self.db = db
        self.manifest = manifest
        self.verbose = verbose
        self.build_id = build_id
        self.lock_timeout_seconds = lock_timeout_seconds
        self.host = f"{socket.gethostname()}:{os.getpid()}"

    def _run_gates(self, gates: Iterable[Gate], phase: str) -> None:
        for g in gates:
            log("GATE", f"{phase} {g.id} ({g.file}) starting")
            try:
                self.db.run_gate(_batches_for(g.path), self.verbose, g.id)
            except ScriptExecutionError as exc:
                log("GATE-FAIL", f"{g.id}: {exc}")
                raise
            log("GATE-OK", f"{g.id}")

    def apply(self) -> Dict[str, int]:
        counts = {"applied": 0, "skipped": 0, "gates": 0}
        log("LOCK", f"requesting deployment lock (timeout {self.lock_timeout_seconds}s)")
        self.db.acquire_lock(self.lock_timeout_seconds)
        log("LOCK", "lock acquired")
        try:
            self._run_gates(self.manifest.preflight, "preflight")
            self.db.ensure_history_table(_batches_for(self.manifest.bootstrap.path))
            # History is read only AFTER the lock is held, so a runner that waited for another
            # deployment sees that deployment's results and skips what it already applied.
            stale = self.db.mark_interrupted()
            if stale:
                log("RECOVER", f"{stale} earlier attempt(s) never finished; marked 'Interrupted' "
                               f"(their transactions were rolled back, no partial data)")
            plan = compute_plan(self.manifest.steps, self.db.load_history())
            for item in plan:
                s = item.step
                if item.action == "SKIP":
                    counts["skipped"] += 1
                    log("SKIP", f"{s.id} v{s.version}: {item.detail}; checksum matches ({s.sha256[:12]}...)")
                    continue
                attempt = self.db.begin_attempt(s, s.sha256, self.host, self.build_id)
                log("START", f"{s.id} v{s.version} ({s.file}) attempt #{attempt}")
                try:
                    ms = self.db.run_step_atomically(attempt, _batches_for(s.path), self.verbose,
                                                     f"{s.id} v{s.version}")
                except ScriptExecutionError as exc:
                    try:
                        self.db.record_failure(attempt, str(exc))
                    except Exception as rec_exc:  # noqa: BLE001
                        log("WARN", f"could not record the failure ({rec_exc}); the row stays 'Started' and will be "
                                    f"marked 'Interrupted' on the next run")
                    log("FAIL", f"{s.id} v{s.version}: {exc}")
                    log("FAIL", "transaction rolled back; no success recorded; later steps NOT run. Safe to retry.")
                    raise
                counts["applied"] += 1
                log("OK", f"{s.id} v{s.version} applied in {ms} ms and recorded as Succeeded")
            self._run_gates(self.manifest.postflight, "postflight")
            counts["gates"] = len(self.manifest.preflight) + len(self.manifest.postflight)
            log("DONE", f"applied={counts['applied']} skipped={counts['skipped']} gates={counts['gates']}")
            return counts
        finally:
            self.db.release_lock()


# --------------------------------------------------------------------------------------------
# Commands
# --------------------------------------------------------------------------------------------
def _find_manifest(arg: Optional[str]) -> Path:
    path = Path(arg) if arg else Path(__file__).resolve().parent / MANIFEST_NAME
    if not path.is_file():
        raise UsageError(f"manifest not found: {path}")
    return path


def _load_verified(manifest_arg: Optional[str]) -> Manifest:
    manifest, problems = load_manifest(_find_manifest(manifest_arg))
    problems = verify_package(manifest, problems)
    if problems:
        raise PackageError("package verification failed:\n  - " + "\n  - ".join(problems))
    return manifest


def cmd_verify(args) -> int:
    manifest = _load_verified(args.manifest)
    log("VERIFY", f"OK: {len(manifest.steps)} seed versions, {len(manifest.preflight)} preflight and "
                  f"{len(manifest.postflight)} postflight gates; checksums, policy and file list verified")
    return EXIT_OK


def _connect(args):
    conn = os.environ.get(args.connection_string_env, "")
    if not conn.strip():
        raise UsageError(f"environment variable {args.connection_string_env} is empty or not set")
    return PyodbcSeedDatabase(conn, command_timeout=args.command_timeout_seconds)


def cmd_plan(args) -> int:
    manifest = _load_verified(args.manifest)
    db = _connect(args)
    try:
        history = db.load_history()
        for item in compute_plan(manifest.steps, history):
            log("PLAN", f"{item.action:<4} {item.step.id} v{item.step.version}: {item.detail}")
        if not db.history_table_exists():
            log("PLAN", "dbo.SeedScriptHistory does not exist yet; 'apply' will create it")
    finally:
        db.close()
    return EXIT_OK


def cmd_apply(args) -> int:
    manifest = _load_verified(args.manifest)
    build_id = args.build_id or os.environ.get("BUILD_BUILDID") or os.environ.get("GITHUB_RUN_ID")
    db = _connect(args)
    try:
        SeedRunner(db, manifest, verbose=args.verbose, build_id=build_id,
                   lock_timeout_seconds=args.lock_timeout_seconds).apply()
    finally:
        db.close()
    return EXIT_OK


def cmd_checksum(args) -> int:
    for f in args.files:
        print(f"{checksum_file(Path(f))}  {f}")
    return EXIT_OK


def cmd_package(args) -> int:
    manifest = _load_verified(args.manifest)
    src = manifest.base_dir
    out = Path(args.output).resolve()
    if out == src or src in out.parents:
        raise UsageError("output folder must be outside database/seed")
    if out.exists() and any(out.iterdir()):
        if not args.force:
            raise UsageError(f"output folder {out} is not empty (use --force to replace its contents)")
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)

    files = [Path(__file__).resolve(), src / MANIFEST_NAME, src / "requirements.txt", src / "README.md"]
    files += [manifest.bootstrap.path] + [g.path for g in manifest.preflight + manifest.postflight]
    files += [s.path for s in manifest.steps]
    listing = []
    for f in files:
        if f is None or not f.is_file():
            raise PackageError(f"cannot package missing file: {f}")
        rel = f.resolve().relative_to(src.resolve()) if f.resolve().is_relative_to(src.resolve()) else Path(f.name)
        dest = out / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(f, dest)  # byte-for-byte; checksums are re-verified below
        listing.append({"file": rel.as_posix(), "bytes": dest.stat().st_size,
                        "sha256": hashlib.sha256(dest.read_bytes()).hexdigest()})
    commit = None
    try:
        commit = subprocess.run(["git", "rev-parse", "HEAD"], cwd=src, capture_output=True, text=True,
                                timeout=10).stdout.strip() or None
    except Exception:  # noqa: BLE001
        pass
    (out / "package-info.json").write_text(json.dumps({
        "runnerVersion": RUNNER_VERSION, "gitCommit": commit,
        "createdUtc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "files": listing}, indent=2) + "\n",
        encoding="utf-8")
    _load_verified(str(out / MANIFEST_NAME))  # the packaged copy must itself verify
    log("PACKAGE", f"{len(listing)} files written to {out}; package re-verified")
    return EXIT_OK


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="seed_runner.py", description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="command", required=True)

    def common(sp, db=False):
        sp.add_argument("--manifest", help=f"path to {MANIFEST_NAME} (default: next to this script)")
        if db:
            sp.add_argument("--connection-string-env", default=DEFAULT_CONNECTION_ENV)
            sp.add_argument("--command-timeout-seconds", type=int, default=1800)

    sp = sub.add_parser("verify", help="offline package verification")
    common(sp)
    sp.set_defaults(fn=cmd_verify)
    sp = sub.add_parser("plan", help="show what apply would do (read-only)")
    common(sp, True)
    sp.set_defaults(fn=cmd_plan)
    sp = sub.add_parser("apply", help="run gates and pending seed versions")
    common(sp, True)
    sp.add_argument("--lock-timeout-seconds", type=int, default=900)
    sp.add_argument("--build-id", help="recorded in history (default: BUILD_BUILDID or GITHUB_RUN_ID)")
    sp.add_argument("--verbose", action="store_true", help="echo SQL PRINT messages")
    sp.set_defaults(fn=cmd_apply)
    sp = sub.add_parser("package", help="copy only the approved files to an output folder"); common(sp)
    sp.add_argument("--output", default="db-drop/seed"); sp.add_argument("--force", action="store_true")
    sp.set_defaults(fn=cmd_package)
    sp = sub.add_parser("checksum", help="print normalised SHA-256 of files")
    sp.add_argument("files", nargs="+"); sp.set_defaults(fn=cmd_checksum)
    return p


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.fn(args)
    except SeedError as exc:
        log("ERROR", str(exc))
        return exc.exit_code


if __name__ == "__main__":
    sys.exit(main())
