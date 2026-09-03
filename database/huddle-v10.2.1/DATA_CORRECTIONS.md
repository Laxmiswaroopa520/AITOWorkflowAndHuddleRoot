# Deterministic corrections applied at generation time

Every value the generator changed, so the source workbook can be fixed. No row was dropped.

Display-order collisions are corrected rather than the unique index being relaxed: ordering within
an owner is a real invariant, and two agents claiming position 1 is a content error.

| Sheet | Owner | Field | Workbook value | Written value | Reason |
|---|---|---|---|---|---|
| Topic_MCEM | WF-X-ARCH-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_MCEM | WF-X-CONV-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_MCEM | WF-X-CONV-01 | DisplayOrder | 1 | 3 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_MCEM | WF-X-DEAL-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_MCEM | WF-X-HEALTH-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_MCEM | WF-X-OPP-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_MCEM | WF-X-ORCH-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_MCEM | WF-X-ORCH-01 | DisplayOrder | 1 | 3 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_MCEM | WF-X-PIPE-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_MCEM | WF-X-PLAN-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_Resources | WF-X-CONV-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_Resources | WF-X-PLAN-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_Resources | WF-X-DEAL-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Topic_Resources | WF-X-DEAL-01 | DisplayOrder | 2 | 3 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-001 | DisplayOrder | 1 | 3 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-002 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-004 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-011 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-001 | DisplayOrder | 3 | 4 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-001 | DisplayOrder | 4 | 5 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-001 | DisplayOrder | 5 | 6 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-001 | DisplayOrder | 6 | 7 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-002 | DisplayOrder | 1 | 3 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-005 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Agent_Resources | AGT-001 | DisplayOrder | 3 | 8 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Activity_Agents | WF-X-PLAN-01-P-ATS-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Activity_Agents | WF-X-PLAN-01-P-ATS-02 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Activity_Agents | WF-X-CONV-01-P-ATS-01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Activity_Agents | WF-X-CONV-01-P-ATS-02 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Activity_Resources | ATS-INVEST-01-P01 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Activity_Resources | ATS-INVEST-01-P02 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Activity_Resources | ATS-INVEST-01-P03 | DisplayOrder | 1 | 2 | duplicate display order for the same owner; moved to the next free slot in workbook row order |
| Activity_Resources | ATS-INVEST-01-P03 | DisplayOrder | 2 | 3 | duplicate display order for the same owner; moved to the next free slot in workbook row order |

**Total corrections: 33**
