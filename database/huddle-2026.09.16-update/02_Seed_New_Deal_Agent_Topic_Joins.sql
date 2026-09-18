/*
    New Topic-Agent discovery joins for Deal Agent (AGT-016) on the two topics the 9.16.2026
    Frontier Accelerator workbook adds it to: WF-X-DEAL-01 (Advance and Structure the Deal) and
    WF-X-RENEW-01 (Renewals). Generic Sales Agent (AGT-001) joins on these topics are retained
    unchanged, per the workbook's own Change Summary row 60 ("Add two topic discovery joins while
    retaining generic Sales Agent joins").
    Compared against fresh-install-v11.78/29_Huddle_Topic_And_Agent_Joins.sql: neither
    (WF-X-DEAL-01, AGT-016) nor (WF-X-RENEW-01, AGT-016) exists there. Genuinely new rows.
    Must run AFTER 01_Seed_New_Deal_Agent.sql (needs AGT-016 to exist in HuddleAgents).

    DisplayOrder note: the workbook's own Topic_Agents sheet lists DisplayOrder=8 for both new
    rows, but that column does not reliably reflect what actually ends up in the database --
    several already-loaded rows for these same two topics have a blank DisplayOrder in the
    workbook (e.g. AGT-013, AGT-006) yet a real value in HuddleTopicAgents (7 and 6
    respectively), so the workbook value cannot be trusted at face value. HuddleTopicAgents also
    carries a unique index on (HuddleTopicId, DisplayOrder) -- confirmed against
    29_Huddle_Topic_And_Agent_Joins.sql, WF-X-DEAL-01 already occupies DisplayOrder 1-8 (AGT-005
    "Scout" holds 8) and WF-X-RENEW-01 already occupies 1-9 (AGT-007 "Analyst" holds 9). Using the
    workbook's literal 8 for both, as the first version of this script did, collides with those
    existing rows and throws "Cannot insert duplicate key row ... (1023, 8)". This version instead
    computes the next free DisplayOrder per topic at run time (MAX existing + 1, excluding AGT-016's
    own row so a re-run does not keep incrementing it), which appends Deal Agent to the end of each
    topic's agent list rather than reusing a taken slot: WF-X-DEAL-01 -> 9, WF-X-RENEW-01 -> 10 as
    of this baseline.

    Do not hand-edit. Re-runnable: same ExternalId-keyed MERGE pattern already used in
    29_Huddle_Topic_And_Agent_Joins.sql (Topic_Agents/Agent_Resources sections), scoped to only
    these new rows.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-DEAL-01', N'AGT-016', N'Primary', N'Deal Agent, surfaced through Sales Agent', 0),
        (N'WF-X-RENEW-01', N'AGT-016', N'Primary', N'Deal Agent, surfaced through Sales Agent', 0)
    ) v([TopicExternalId], [AgentExternalId], [UsageType], [DisplayLabel], [ShowAgentAccessLink])
), src AS (
    SELECT
        raw.*,
        t.Id AS [HuddleTopicId],
        ag.Id AS [HuddleAgentId],
        (SELECT ISNULL(MAX(x.[DisplayOrder]), 0) + 1
           FROM dbo.HuddleTopicAgents x
           WHERE x.[HuddleTopicId] = t.Id AND x.[HuddleAgentId] <> ag.Id) AS [DisplayOrder]
    FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.HuddleAgents AS ag ON ag.[ExternalId] = raw.[AgentExternalId]
)
MERGE dbo.HuddleTopicAgents AS tgt
USING src ON tgt.[HuddleTopicId] = src.[HuddleTopicId] AND tgt.[HuddleAgentId] = src.[HuddleAgentId] AND tgt.[UsageType] = src.[UsageType]
WHEN MATCHED THEN UPDATE SET
        tgt.[DisplayLabel] = src.[DisplayLabel],
        tgt.[ShowAgentAccessLink] = src.[ShowAgentAccessLink]
WHEN NOT MATCHED BY TARGET THEN INSERT ([HuddleTopicId], [HuddleAgentId], [UsageType], [DisplayLabel], [ShowAgentAccessLink], [DisplayOrder])
    VALUES (src.[HuddleTopicId], src.[HuddleAgentId], src.[UsageType], src.[DisplayLabel], src.[ShowAgentAccessLink], src.[DisplayOrder]);

COMMIT TRANSACTION;
GO
