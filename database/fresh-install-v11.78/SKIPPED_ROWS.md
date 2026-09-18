# Rows skipped at generation time (not loaded)

These source rows are missing a required field (UsageType and/or DisplayOrder) and were left out
of the generated SQL entirely -- nothing was guessed. Complete these rows in the source workbook
and re-run the generator to bring them in.

The first two rows below came from the original V10.2.1 build (`database/huddle-v4/generate.py`
against the V10.2.1 workbook). The third came from the 9.15.2026 update
(`database/huddle-2026.09.15-update`, built by a separate comparison script,
`database/huddle-2026.09.15-update`'s own generator) against the same rule. All three are for the
same topic and were carried forward into this merged fresh-install-v11.78 folder unresolved.

| Sheet | Owner | Row | Source |
|---|---|---|---|
| Topic_Agents | WF-X-TRANSITION-01 | {'TopicID': 'WF-X-TRANSITION-01', 'AgentID': 'AGT-001', 'UsageType(Primary /Secondary)': None, 'DisplayLabel': None, 'ShowAgentAccessLink': None, 'DisplayOrder': None} | V10.2.1 build |
| Topic_Agents | WF-X-TRANSITION-01 | {'TopicID': 'WF-X-TRANSITION-01', 'AgentID': 'AGT-003', 'UsageType(Primary /Secondary)': None, 'DisplayLabel': None, 'ShowAgentAccessLink': None, 'DisplayOrder': None} | V10.2.1 build |
| Topic_Agents | WF-X-TRANSITION-01 | {'TopicID': 'WF-X-TRANSITION-01', 'AgentID': 'AGT-013', 'UsageType(Primary /Secondary)': None, 'DisplayLabel': None, 'ShowAgentAccessLink': None, 'DisplayOrder': None} | 9.15.2026 update |

**Total skipped: 3** (all on the same topic, `WF-X-TRANSITION-01`). `HuddleTopicAgents` loads 128
rows in this folder, not the 131 physically present across both source workbooks combined.
