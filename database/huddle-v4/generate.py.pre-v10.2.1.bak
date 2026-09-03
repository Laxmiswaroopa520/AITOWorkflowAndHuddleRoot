"""Generates the huddle-v4 SQL data scripts from the Frontier Accelerator content workbook.

Re-run this whenever the workbook changes. Never hand-edit the generated SQL.

Every script is an ExternalId-keyed MERGE, so re-running is safe and nothing is deleted.
Foreign keys resolve through INNER JOINs rather than scalar subqueries, because SQL Server
does not allow subqueries inside a table value constructor. Each MERGE is followed by a
row-count assertion, so an unresolved key fails the script instead of silently dropping a row.

Usage: python generate.py <workbook.xlsx> <output directory>
"""
import collections
import io
import os
import sys

import openpyxl

XLSX, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
CORRECTIONS = []
wb = openpyxl.load_workbook(XLSX, data_only=True)


def sheet(name):
    ws = wb[name]
    it = ws.iter_rows(values_only=True)
    hdr = [str(h).strip() if h is not None else h for h in next(it)]
    return [dict(zip(hdr, r)) for r in it
            if not all(c is None or str(c).strip() == "" for c in r)]


def txt(v):
    if v is None:
        return "NULL"
    s = str(v).strip()
    return "NULL" if s == "" else "N'" + s.replace("'", "''") + "'"


def num(v):
    return "NULL" if v is None or str(v).strip() == "" else str(int(float(str(v).strip())))


def bit(v):
    return "1" if str(v).strip().upper() in ("Y", "YES", "TRUE", "1") else "0"


def req(rows, key):
    """Reads a column whose header may carry trailing prose, e.g. RequiredContext (...)."""
    return next(v for k, v in rows.items() if k and k.startswith(key))


# Foreign-key joins: (alias, table, raw column holding the external id, target column, matched column)
J_SEG = ("sg", "HuddleSegments", "SegmentExternalId", "HuddleSegmentId", "ExternalId")
J_ROLE = ("rl", "Roles", "RoleExternalId", "RoleId", "ExternalId")
J_ROLE_ABBR = ("rl", "Roles", "RoleAbbreviation", "RoleId", "Abbreviation")
J_FOCUS = ("fa", "HuddleFocusAreas", "FocusAreaExternalId", "HuddleFocusAreaId", "ExternalId")
J_SEGROLE = ("sr", "HuddleSegmentRoles", "SegmentRoleExternalId", "HuddleSegmentRoleId", "ExternalId")
J_TOPIC = ("t", "HuddleTopics", "TopicExternalId", "HuddleTopicId", "ExternalId")
J_PLACE = ("p", "HuddlePlacements", "PlacementExternalId", "HuddlePlacementId", "ExternalId")
J_PHASE = ("ph", "HuddlePhases", "PhaseExternalId", "HuddlePhaseId", "ExternalId")
J_MCEM = ("mc", "HuddleMcemStages", "McemExternalId", "HuddleMcemStageId", "ExternalId")
J_AGENT = ("ag", "HuddleAgents", "AgentExternalId", "HuddleAgentId", "ExternalId")
J_RES = ("rs", "HuddleResources", "ResourceExternalId", "HuddleResourceId", "ExternalId")
J_ACT = ("ac", "HuddleActivities", "ActivityExternalId", "HuddleActivityId", "ExternalId")


def merge(target, keys, cols, rows, joins=(), audited=True, label=None):
    if not rows:
        return "-- no rows\n"
    raw = list(rows[0].keys())
    raw_list = ", ".join("[%s]" % c for c in raw)
    values = ",\n        ".join("(" + ", ".join(r[c] for c in raw) + ")" for r in rows)
    join_sql = "".join("\n    INNER JOIN dbo.%s AS %s ON %s.[%s] = raw.[%s]" % (tbl, a, a, m, rc)
                       for a, tbl, rc, _t, m in joins)
    projected = "".join(", %s.Id AS [%s]" % (a, t) for a, _tb, _rc, t, _m in joins)
    on = " AND ".join("tgt.[%s] = src.[%s]" % (k, k) for k in keys)
    sets = [n for n in cols if n not in keys]
    updates = ",\n        ".join("tgt.[%s] = src.[%s]" % (n, n) for n in sets)
    if audited:
        updates += (",\n        " if sets else "") + "tgt.[UpdatedAtUtc] = SYSUTCDATETIME()"
    # A pure junction row has nothing to update, and an empty UPDATE SET is a syntax error,
    # so the WHEN MATCHED clause is omitted and the MERGE only inserts what is missing.
    matched = "WHEN MATCHED THEN UPDATE SET\n        %s\n" % updates if updates else ""
    ins_cols = ", ".join("[%s]" % n for n in cols) + (", [CreatedAtUtc]" if audited else "")
    ins_vals = ", ".join("src.[%s]" % n for n in cols) + (", SYSUTCDATETIME()" if audited else "")
    cte = ";WITH raw AS (\n    SELECT * FROM (VALUES\n        %s\n    ) v(%s)\n)" % (values, raw_list)
    sql = ("%s, src AS (\n    SELECT raw.*%s\n    FROM raw%s\n)\n"
           "MERGE dbo.%s AS tgt\nUSING src ON %s\n%s"
           "WHEN NOT MATCHED BY TARGET THEN INSERT (%s)\n    VALUES (%s);\n"
           % (cte, projected, join_sql, target, on, matched, ins_cols, ins_vals))
    if joins:
        sql += ("%s\nSELECT @unresolved = %d - COUNT(*) FROM raw%s;\n"
                "IF @unresolved <> 0\n    THROW 51000, "
                "'%s: %d source rows were expected to resolve their foreign keys but some did not. "
                "Run the earlier scripts in order and re-check the workbook.', 1;\n"
                % (cte, len(rows), join_sql, (label or target).replace("'", "''"), len(rows)))
    return sql


def write(fname, title, body, note=""):
    head = ("/*\n    %s\n"
            "    Generated from the Frontier Accelerator content workbook by generate.py.\n"
            "    Do not hand-edit. Re-runnable: every statement is an ExternalId-keyed MERGE, nothing is deleted.\n"
            "%s*/\n"
            "SET NOCOUNT ON;\nSET XACT_ABORT ON;\nDECLARE @unresolved INT;\nBEGIN TRANSACTION;\n\n"
            % (title, ("    %s\n" % note) if note else ""))
    path = os.path.join(OUT, fname)
    io.open(path, "w", encoding="utf-8-sig", newline="\r\n").write(head + body + "\nCOMMIT TRANSACTION;\nGO\n")
    print("  %-46s %8d bytes" % (fname, os.path.getsize(path)))


def renumber(rows, owner_key, label):
    """Makes DisplayOrder unique per owner, preserving workbook row order. Logs every change."""
    seen, out = collections.defaultdict(set), []
    for r in rows:
        owner, order = r[owner_key], int(float(str(r["DisplayOrder"])))
        original = order
        while order in seen[owner]:
            order += 1
        if order != original:
            CORRECTIONS.append((label, owner, "DisplayOrder", original, order,
                                "duplicate display order for the same owner; moved to the next free slot in workbook row order"))
        seen[owner].add(order)
        out.append((r, order))
    return out


# ------------------------------------------------------------------ 02 reference data
print("02 reference data")
body = "-- Segments\n" + merge(
    "HuddleSegments", ["ExternalId"], ["ExternalId", "Name"],
    [{"ExternalId": txt(r["SegmentID"]), "Name": txt(r["SegmentName"])} for r in sheet("Segments")])

body += "\n-- Roles. Segment is denormalised onto Role in this schema and the workbook has one segment.\n"
body += merge("Roles", ["ExternalId"], ["ExternalId", "Name", "Abbreviation", "Segment", "SortOrder", "IsActive"],
              [{"ExternalId": txt(r["RoleID"]), "Name": txt(r["RoleName"]), "Abbreviation": txt(r["RoleCode"]),
                "Segment": txt("Enterprise"), "SortOrder": str(i + 1), "IsActive": "1"}
               for i, r in enumerate(sheet("Roles"))])

body += "\n-- Segment roles\n" + merge(
    "HuddleSegmentRoles", ["ExternalId"], ["ExternalId", "HuddleSegmentId", "RoleId", "DisplayName"],
    [{"ExternalId": txt(r["SegmentRoleID"]), "SegmentExternalId": txt(r["SegmentID"]),
      "RoleExternalId": txt(r["RoleID"]), "DisplayName": txt(r["RoleDisplayName"])}
     for r in sheet("Segment_Roles")], joins=(J_SEG, J_ROLE), label="HuddleSegmentRoles")

body += "\n-- Focus areas\n" + merge(
    "HuddleFocusAreas", ["ExternalId"], ["ExternalId", "Name"],
    [{"ExternalId": txt(r["FocusAreaID"]), "Name": txt(r["FocusAreaName"])} for r in sheet("Focus_Areas")])

body += "\n-- MCEM stages. StageNumber is stored now rather than parsed out of the ExternalId.\n"
body += merge("HuddleMcemStages", ["ExternalId"], ["ExternalId", "Name", "Description", "StageNumber"],
              [{"ExternalId": txt(r["MCEMStageID"]), "Name": txt(r["MCEMStageName"]),
                "Description": txt(r["MCEMStageDescription"]), "StageNumber": num(r["MCEMStageNumber"])}
               for r in sheet("MCEM_Stages")])
write("02_Seed_Reference_Data.sql", "Segments, roles, segment roles, focus areas and MCEM stages", body)

# ------------------------------------------------------------------ 03 topics
print("03 topics")
topics = sheet("Topics")
body = merge("HuddleTopics", ["ExternalId"],
             ["ExternalId", "Name", "Description", "Type", "PublicationStatus", "HuddleFocusAreaId",
              "DurationMinutes", "WhyItMatters", "DesiredOutcome", "KeyTakeaway"],
             [{"ExternalId": txt(r["TopicID"]), "Name": txt(r["TopicName"]),
               "Description": txt(r["TopicDescription"]), "Type": txt("Prescriptive"),
               "PublicationStatus": txt("Published"), "FocusAreaExternalId": txt(r["FocusAreaID"]),
               "DurationMinutes": "30", "WhyItMatters": txt(r["WhyItMatters"]),
               "DesiredOutcome": txt(r["DesiredOutcome"]), "KeyTakeaway": txt(r["KeyTakeaway"])}
              for r in topics], joins=(J_FOCUS,), label="HuddleTopics")

body += "\n-- Aligned roles, split from the semicolon-separated Topics.AlignedRoles column.\n"
tr = [{"TopicExternalId": txt(r["TopicID"]), "RoleAbbreviation": txt(code)}
      for r in topics
      for code in [c.strip() for c in str(r["AlignedRoles"] or "").split(";") if c.strip()]]
body += merge("HuddleTopicRoles", ["HuddleTopicId", "RoleId"], ["HuddleTopicId", "RoleId"],
              tr, joins=(J_TOPIC, J_ROLE_ABBR), audited=False, label="HuddleTopicRoles")
write("03_Seed_Huddle_Topics.sql", "Huddle topics and their aligned roles", body)

# ------------------------------------------------------------------ 04 placements
print("04 placements")
placements = sheet("Role_Paths") + sheet("Additional_Content")
body = merge("HuddlePlacements", ["ExternalId"],
             ["ExternalId", "HuddleSegmentRoleId", "HuddleTopicId", "PathSection", "Sequence",
              "RoleTopicName", "RoleTopicDescription", "TodayObjective", "Wiifm", "DesiredOutcome", "IsActive"],
             [{"ExternalId": txt(r["PlacementID"]), "SegmentRoleExternalId": txt(r["SegmentRoleID"]),
               "TopicExternalId": txt(r["TopicID"]), "PathSection": txt(r["PathSection"]),
               "Sequence": num(r["Sequence"]), "RoleTopicName": txt(r["RoleTopicName"]),
               "RoleTopicDescription": txt(r["RoleTopicDescription"]), "TodayObjective": txt(r["TodaysObjective"]),
               "Wiifm": txt(r["WIIFM"]), "DesiredOutcome": txt(r["DesiredOutcome"]), "IsActive": bit(r["Active"])}
              for r in placements], joins=(J_SEGROLE, J_TOPIC), label="HuddlePlacements")

body += ("\n-- HuddleRolePathItems kept in step for backward compatibility. Only SEC-ROLEPATH and\n"
         "-- SEC-ORIENTATION placements fit it: its key is (SegmentRole, WeekPosition), and SEC-ADDITIONAL\n"
         "-- reuses sequence numbers that would collide. Those placements live in HuddlePlacements only,\n"
         "-- which is the reason the new table exists.\n")
body += merge("HuddleRolePathItems", ["HuddleSegmentRoleId", "WeekPosition"],
              ["HuddleSegmentRoleId", "WeekPosition", "HuddleTopicId"],
              [{"SegmentRoleExternalId": txt(r["SegmentRoleID"]), "WeekPosition": num(r["Sequence"]),
                "TopicExternalId": txt(r["TopicID"])}
               for r in placements if r["PathSection"] in ("SEC-ROLEPATH", "SEC-ORIENTATION")],
              joins=(J_SEGROLE, J_TOPIC), audited=False, label="HuddleRolePathItems")
write("04_Seed_Huddle_Placements.sql", "Huddle placements, plus the compatible role-path items", body,
      note="%d placements: %d role path, %d orientation, %d additional content."
           % (len(placements),
              sum(1 for r in placements if r["PathSection"] == "SEC-ROLEPATH"),
              sum(1 for r in placements if r["PathSection"] == "SEC-ORIENTATION"),
              sum(1 for r in placements if r["PathSection"] == "SEC-ADDITIONAL")))

# ------------------------------------------------------------------ 05 phases
print("05 phases")
prep, expl, commit = sheet("Preparation"), sheet("Explore_Practice"), sheet("Commit")
phase_rows = [{"ExternalId": txt(r["PhaseID"]), "TopicExternalId": txt(r["TopicID"]),
               "PlacementExternalId": txt(r["PlacementID"]), "DisplayOrder": str(order),
               "Name": txt(r["PhaseName"] or default)}
              for order, (rows, default) in enumerate(
                  [(prep, "Preparation"), (expl, "Explore and Practice"), (commit, "Commit to Action")], start=1)
              for r in rows]
body = merge("HuddlePhases", ["ExternalId"],
             ["ExternalId", "HuddleTopicId", "HuddlePlacementId", "DisplayOrder", "Name"],
             phase_rows, joins=(J_TOPIC, J_PLACE), label="HuddlePhases")
write("05_Seed_Huddle_Phases.sql", "Three phases per placement", body,
      note="%d phases. HuddleTopicId stays populated so topic-scoped queries keep working." % len(phase_rows))

# ------------------------------------------------------------------ 06 facilitator guides
print("06 facilitator guides")
p_by, e_by, c_by = ({r["PlacementID"]: r for r in x} for x in (prep, expl, commit))
guide_cols = ["ExternalId", "HuddleTopicId", "HuddlePlacementId", "SessionIntroduction", "KeyTalkingPoints",
              "DiscussionQuestions", "PreparationChecklist", "FacilitatorQuestions", "ListenFor",
              "SuggestedTransitions", "FallbackGuidance", "WrapUpGuidance", "ReflectPrompt", "CommitPrompt",
              "BringBackEvidence"]
guide_rows = []
for r in placements:
    pid = r["PlacementID"]
    p, e, c = p_by.get(pid, {}), e_by.get(pid, {}), c_by.get(pid, {})
    guide_rows.append({
        "ExternalId": txt("FG-" + str(pid)), "TopicExternalId": txt(r["TopicID"]),
        "PlacementExternalId": txt(pid),
        "SessionIntroduction": txt(p.get("SessionIntroduction")),
        "KeyTalkingPoints": txt(p.get("KeyTalkingPoints")),
        "DiscussionQuestions": txt(p.get("DiscussionQuestions")),
        "PreparationChecklist": txt(p.get("PreparationChecklist")),
        "FacilitatorQuestions": txt(e.get("FacilitatorQuestions")),
        "ListenFor": txt(e.get("ListenFor")),
        "SuggestedTransitions": txt(e.get("SuggestedTransitions")),
        "FallbackGuidance": txt(e.get("FallbackGuidance")),
        "WrapUpGuidance": txt(c.get("WrapUpGuidance")),
        "ReflectPrompt": txt(c.get("ReflectPrompt")),
        "CommitPrompt": txt(c.get("CommitPrompt")),
        "BringBackEvidence": txt(c.get("BringBackEvidence")),
    })
body = merge("HuddleFacilitatorGuides", ["ExternalId"], guide_cols, guide_rows,
             joins=(J_TOPIC, J_PLACE), label="HuddleFacilitatorGuides")
write("06_Seed_Huddle_Facilitator_Guides.sql", "One facilitator guide per placement", body,
      note="Merged from three sheets: Preparation supplies the intro and checklist, "
           "Explore_Practice the in-flight guidance, Commit the close.")

# ------------------------------------------------------------------ 07 agents, 08 resources
print("07 agents")
body = merge("HuddleAgents", ["ExternalId"],
             ["ExternalId", "Name", "ShortDescription", "WhatItIs", "WhatItHelpsYouDo", "WhenToUseIt",
              "WhenNotToUseIt", "StepsToGetStarted", "KeyBenefits", "AccessUrl", "AccessLinkLabel"],
             [{"ExternalId": txt(r["AgentID"]), "Name": txt(r["AgentName"]),
               "ShortDescription": txt(r["AgentShortDescription"]), "WhatItIs": txt(r["WhatItIs"]),
               "WhatItHelpsYouDo": txt(r["WhatItHelpsYouDo"]), "WhenToUseIt": txt(r["WhenToUseIt"]),
               "WhenNotToUseIt": txt(r["WhenNotToUseIt"]),
               "StepsToGetStarted": txt(r["StepsToGetStarted/HowToPractice"]),
               "KeyBenefits": txt(r["KeyBenefits"]), "AccessUrl": txt(r["AccessURL"]),
               "AccessLinkLabel": txt(r["AccessLinkLabel"])} for r in sheet("Agents")])
write("07_Seed_Huddle_Agents.sql", "AI agents, including the new WhenNotToUseIt and StepsToGetStarted copy", body)

print("08 resources")
body = merge("HuddleResources", ["ExternalId"],
             ["ExternalId", "Title", "Description", "Url", "Type", "LinkLabel", "IsGlobal"],
             [{"ExternalId": txt(r["ResourceID"]), "Title": txt(r["ResourceTitle"]),
               "Description": txt(r["ResourceDescription"]), "Url": txt(r["ResourceURL"]),
               "Type": txt(r["ResourceType"]), "LinkLabel": txt(r["LinkLabel"]),
               "IsGlobal": bit(r["IsGlobal"])} for r in sheet("Resources")])
write("08_Seed_Huddle_Resources.sql", "Resources", body)

# ------------------------------------------------------------------ 09 activities
print("09 activities")
acts = sheet("Activities")


def execution_method(r):
    has_prompt = str(r.get("Prompt") or "").strip() != ""
    has_steps = str(r.get("ActivitySteps") or "").strip() != ""
    derived = "Both" if (has_prompt and has_steps) else ("Prompt" if has_prompt else "Activity")
    declared = str(r.get("ExecutionMethod") or "").strip()
    if declared and declared != derived:
        CORRECTIONS.append(("Activities", r["ActivityID"], "ExecutionMethod", declared, derived,
                            "recomputed from whether Prompt and ActivitySteps are populated, per the workbook's own rule"))
    return derived


act_cols = ["ExternalId", "HuddleTopicId", "HuddlePlacementId", "HuddlePhaseId", "DisplayOrder", "Name",
            "Description", "PracticeTier", "ExecutionMethod", "Prompt", "ActivitySteps", "RequiredContext",
            "ExpectedOutput", "HumanCheckpoint", "BestFitJob", "WhyThisMatters", "LaunchUrl", "LaunchLabel"]
act_rows = []
for r in acts:
    tier = str(r["PracticeTier"]).strip()
    if tier not in ("Featured", "Extended"):
        raise SystemExit("unexpected PracticeTier %r on %s" % (tier, r["ActivityID"]))
    act_rows.append({
        "ExternalId": txt(r["ActivityID"]), "TopicExternalId": txt(r["TopicID"]),
        "PlacementExternalId": txt(r["PlacementID"]), "PhaseExternalId": txt(r["PhaseID"]),
        "DisplayOrder": num(r["ActivityOrder"]), "Name": txt(r["ActivityName_JTBD"]),
        "Description": txt(r["ActivityDescription"]), "PracticeTier": txt(tier),
        "ExecutionMethod": txt(execution_method(r)), "Prompt": txt(r["Prompt"]),
        "ActivitySteps": txt(r["ActivitySteps"]), "RequiredContext": txt(req(r, "RequiredContext")),
        "ExpectedOutput": txt(r["ExpectedOutput"]), "HumanCheckpoint": txt(r["HumanCheckpoint"]),
        "BestFitJob": txt(r["BestFitJob"]), "WhyThisMatters": txt(r["WhyThisMatters"]),
        "LaunchUrl": txt(r["LaunchURL"]), "LaunchLabel": txt(r["LaunchLabel"]),
    })
body = merge("HuddleActivities", ["ExternalId"], act_cols, act_rows,
             joins=(J_TOPIC, J_PLACE, J_PHASE), label="HuddleActivities")
write("09_Seed_Huddle_Activities.sql", "Activities with their practice tier", body,
      note="%d activities: %d Featured, %d Extended. Prerequisites land in script 10, once every row exists."
           % (len(acts), sum(1 for r in acts if str(r["PracticeTier"]).strip() == "Featured"),
              sum(1 for r in acts if str(r["PracticeTier"]).strip() == "Extended")))

# ------------------------------------------------------------------ 10 prerequisites
print("10 prerequisites")
prereq = [r for r in acts if str(r.get("PrerequisiteActivityID") or "").strip()]
values = ",\n        ".join("(%s, %s)" % (txt(r["ActivityID"]), txt(r["PrerequisiteActivityID"])) for r in prereq)
cte = ";WITH raw AS (\n    SELECT * FROM (VALUES\n        %s\n    ) v([ActivityExternalId], [PrerequisiteExternalId])\n)" % values
joins = ("\n    INNER JOIN dbo.HuddleActivities AS a ON a.ExternalId = raw.[ActivityExternalId]"
         "\n    INNER JOIN dbo.HuddleActivities AS pre ON pre.ExternalId = raw.[PrerequisiteExternalId]")
body = ("%s\nUPDATE a SET\n    a.PrerequisiteHuddleActivityId = pre.Id,\n    a.UpdatedAtUtc = SYSUTCDATETIME()\n"
        "FROM raw%s;\n\n"
        "%s\nSELECT @unresolved = %d - COUNT(*) FROM raw%s;\n"
        "IF @unresolved <> 0\n    THROW 51000, 'Activity prerequisites: not every reference resolved. "
        "Run script 09 first.', 1;\n" % (cte, joins, cte, len(prereq), joins))
body += ("\n-- Guard: the workbook keeps prerequisites inside one placement. Enforced here rather than\n"
         "-- as a constraint, because a cross-placement prerequisite is a content error, not a schema rule.\n"
         "IF EXISTS (SELECT 1 FROM dbo.HuddleActivities a\n"
         "    INNER JOIN dbo.HuddleActivities pre ON pre.Id = a.PrerequisiteHuddleActivityId\n"
         "    WHERE a.HuddlePlacementId IS NOT NULL AND pre.HuddlePlacementId <> a.HuddlePlacementId)\n"
         "    THROW 51000, 'An activity prerequisite points outside its own placement. Check the workbook.', 1;\n")
write("10_Seed_Huddle_Activity_Prerequisites.sql", "Self-referencing activity prerequisites", body,
      note="%d of %d activities consume another activity's output. Run after script 09." % (len(prereq), len(acts)))

# ------------------------------------------------------------------ 11 topic and agent joins
print("11 topic and agent joins")
body = "-- Topic to MCEM stage\n" + merge(
    "HuddleTopicMcemStages", ["HuddleTopicId", "HuddleMcemStageId"],
    ["HuddleTopicId", "HuddleMcemStageId", "DisplayOrder"],
    [{"TopicExternalId": txt(r["TopicID"]), "McemExternalId": txt(r["MCEMStageID"]),
      "DisplayOrder": num(r["DisplayOrder"])} for r in sheet("Topic_MCEM")],
    joins=(J_TOPIC, J_MCEM), audited=False, label="HuddleTopicMcemStages")

body += "\n-- Topic to agent\n" + merge(
    "HuddleTopicAgents", ["HuddleTopicId", "HuddleAgentId", "UsageType"],
    ["HuddleTopicId", "HuddleAgentId", "UsageType", "DisplayLabel", "ShowAgentAccessLink", "DisplayOrder"],
    [{"TopicExternalId": txt(r["TopicID"]), "AgentExternalId": txt(r["AgentID"]),
      "UsageType": txt(r["UsageType(Primary /Secondary)"]), "DisplayLabel": txt(r["DisplayLabel"]),
      "ShowAgentAccessLink": bit(r["ShowAgentAccessLink"]), "DisplayOrder": str(order)}
     for r, order in renumber(sheet("Topic_Agents"), "TopicID", "Topic_Agents")],
    joins=(J_TOPIC, J_AGENT), audited=False, label="HuddleTopicAgents")

body += "\n-- Topic to resource\n" + merge(
    "HuddleTopicResources", ["HuddleTopicId", "HuddleResourceId"],
    ["HuddleTopicId", "HuddleResourceId", "DisplayOrder"],
    [{"TopicExternalId": txt(r["TopicID"]), "ResourceExternalId": txt(r["ResourceID"]),
      "DisplayOrder": str(order)}
     for r, order in renumber(sheet("Topic_Resources"), "TopicID", "Topic_Resources")],
    joins=(J_TOPIC, J_RES), audited=False, label="HuddleTopicResources")

body += "\n-- Agent to resource\n" + merge(
    "HuddleAgentResources", ["HuddleAgentId", "HuddleResourceId"],
    ["HuddleAgentId", "HuddleResourceId", "DisplayOrder"],
    [{"AgentExternalId": txt(r["AgentID"]), "ResourceExternalId": txt(r["ResourceID"]),
      "DisplayOrder": str(order)}
     for r, order in renumber(sheet("Agent_Resources"), "AgentID", "Agent_Resources")],
    joins=(J_AGENT, J_RES), audited=False, label="HuddleAgentResources")
write("11_Seed_Topic_And_Agent_Joins.sql",
      "Topic to MCEM stage, topic to agent, topic to resource, agent to resource", body)

# ------------------------------------------------------------------ 12 activity joins
print("12 activity joins")
body = "-- Activity to agent\n" + merge(
    "HuddleActivityAgents", ["HuddleActivityId", "HuddleAgentId", "UsageType"],
    ["HuddleActivityId", "HuddleAgentId", "UsageType", "DisplayLabel", "ShowAgentAccessLink", "DisplayOrder"],
    [{"ActivityExternalId": txt(r["ActivityID"]), "AgentExternalId": txt(r["AgentID"]),
      "UsageType": txt(r["UsageType"]), "DisplayLabel": txt(r["DisplayLabel"]),
      "ShowAgentAccessLink": bit(r["ShowAgentAccessLink"]), "DisplayOrder": str(order)}
     for r, order in renumber(sheet("Activity_Agents"), "ActivityID", "Activity_Agents")],
    joins=(J_ACT, J_AGENT), audited=False, label="HuddleActivityAgents")

body += "\n-- Activity to resource\n" + merge(
    "HuddleActivityResources", ["HuddleActivityId", "HuddleResourceId"],
    ["HuddleActivityId", "HuddleResourceId", "DisplayOrder"],
    [{"ActivityExternalId": txt(r["ActivityID"]), "ResourceExternalId": txt(r["ResourceID"]),
      "DisplayOrder": str(order)}
     for r, order in renumber(sheet("Activity_Resources"), "ActivityID", "Activity_Resources")],
    joins=(J_ACT, J_RES), audited=False, label="HuddleActivityResources")
write("12_Seed_Activity_Joins.sql", "Activity to agent and activity to resource", body)

# ------------------------------------------------------------------ counts for validation and readme
COUNTS = {
    "HuddleSegments": len(sheet("Segments")), "Roles": len(sheet("Roles")),
    "HuddleSegmentRoles": len(sheet("Segment_Roles")), "HuddleFocusAreas": len(sheet("Focus_Areas")),
    "HuddleMcemStages": len(sheet("MCEM_Stages")), "HuddleTopics": len(topics),
    "HuddlePlacements": len(placements), "HuddlePhases": len(phase_rows),
    "HuddleFacilitatorGuides": len(guide_rows), "HuddleAgents": len(sheet("Agents")),
    "HuddleResources": len(sheet("Resources")), "HuddleActivities": len(acts),
    "HuddleTopicMcemStages": len(sheet("Topic_MCEM")), "HuddleTopicAgents": len(sheet("Topic_Agents")),
    "HuddleTopicResources": len(sheet("Topic_Resources")), "HuddleAgentResources": len(sheet("Agent_Resources")),
    "HuddleActivityAgents": len(sheet("Activity_Agents")), "HuddleActivityResources": len(sheet("Activity_Resources")),
}
io.open(os.path.join(OUT, "expected_counts.txt"), "w", encoding="utf-8", newline="\n").write(
    "".join("%s=%d\n" % kv for kv in sorted(COUNTS.items())))

# ------------------------------------------------------------------ corrections log
io.open(os.path.join(OUT, "DATA_CORRECTIONS.md"), "w", encoding="utf-8", newline="\r\n").write(
    "# Deterministic corrections applied at generation time\n\n"
    "Every value the generator changed, so the source workbook can be fixed. No row was dropped.\n\n"
    "Display-order collisions are corrected rather than the unique index being relaxed: ordering within\n"
    "an owner is a real invariant, and two agents claiming position 1 is a content error.\n\n"
    "| Sheet | Owner | Field | Workbook value | Written value | Reason |\n|---|---|---|---|---|---|\n"
    + "".join("| %s | %s | %s | %s | %s | %s |\n" % c for c in CORRECTIONS)
    + "\n**Total corrections: %d**\n" % len(CORRECTIONS))
print("\ncorrections: %d (see DATA_CORRECTIONS.md)" % len(CORRECTIONS))
print("counts:", ", ".join("%s=%d" % kv for kv in sorted(COUNTS.items())))
