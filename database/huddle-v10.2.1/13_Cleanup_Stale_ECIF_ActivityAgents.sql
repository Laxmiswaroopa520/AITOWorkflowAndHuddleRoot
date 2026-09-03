/*
    MOVED. This script has been renamed and repositioned in the run order.

    Use 11c_Cleanup_Stale_ECIF_ActivityAgents.sql instead, which runs AFTER
    11_Seed_Topic_And_Agent_Joins.sql and BEFORE 12_Seed_Activity_Joins.sql (not after 12, as
    this file originally said).

    Why: script 12's HuddleActivityAgents MERGE tries to insert the 6 corrected ECIF rows with a
    UsageType that differs from the stale rows already in the table (Primary vs. Surfaced), so
    MERGE can't recognize them as updates and attempts a fresh INSERT -- which collides with the
    stale rows still occupying position 1 for those activities. The cleanup has to happen first
    to clear the way. See 11c's own header for the full explanation.

    This file is intentionally left as a no-op (nothing below this comment) so that running it by
    habit does nothing, rather than silently re-deleting rows that are already gone.
*/
