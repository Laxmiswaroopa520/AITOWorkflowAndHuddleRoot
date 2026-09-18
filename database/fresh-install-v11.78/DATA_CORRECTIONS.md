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

**Total corrections: 33** (V10.2.1 baseline, above this line)

---

## Corrections applied when merging the 9.15.2026 update into fresh-install-v11.78

The 9.15.2026 workbook added 3 new "-INVEST" placements (PSS-INVEST, DSE-INVEST, DCSA-INVEST) whose
source `Sequence` value collided with an already-loaded placement's `Sequence` under the same
`(HuddleSegmentRoleId, PathSection)` -- a natural-key collision on `HuddlePlacements`'
`IX_HuddlePlacements_HuddleSegmentRoleId_PathSection_Sequence` unique index (`SEC-ADDITIONAL`,
`Sequence = 1` for all three roles, same as an existing placement). Each was moved to the next free
`Sequence` within its own `(SegmentRoleId, PathSection)` rather than the workbook's original value:

| Sheet | Owner (Placement) | Field | Workbook value | Written value | Reason |
|---|---|---|---|---|---|
| Additional_Content | PSS-INVEST | Sequence | 1 | 3 | duplicate `(SR-SMEC-PSS, SEC-ADDITIONAL, 1)`; moved to next free slot |
| Additional_Content | DSE-INVEST | Sequence | 1 | 2 | duplicate `(SR-SMEC-DSE, SEC-ADDITIONAL, 1)`; moved to next free slot |
| Additional_Content | DCSA-INVEST | Sequence | 1 | 2 | duplicate `(SR-SMEC-DCSA, SEC-ADDITIONAL, 1)`; moved to next free slot |

**Total corrections in this section: 3.** These 3 rows are included in the required data scripts in
this folder (they are genuinely new placements, not modifications to existing ones); only their
`Sequence` value was adjusted to avoid a duplicate-key error on a clean database. See
00_README_Fresh_Install.md for the related, NOT-included, existing-placement reclassifications
that would resolve the DCSA/DSE/PSS role-path gaps flagged in that README and in
40_Validate_Everything.sql.
