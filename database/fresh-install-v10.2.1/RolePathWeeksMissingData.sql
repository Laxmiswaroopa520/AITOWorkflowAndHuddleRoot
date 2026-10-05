

-- =============================================================================

-- STEP 3 - THE UPDATE (writes). Run this whole block as ONE batch.

-- It opens a transaction and does NOT commit. On any unexpected condition

-- it rolls back automatically and raises an error, so nothing partial is

-- ever left committed. This step is safe to re-run (idempotent): if a row

-- is already at its target value, it is reported as a no-op instead of an

-- error.

-- =============================================================================

BEGIN TRY

    BEGIN TRANSACTION PatchHuddlePlacements;
 
    DECLARE @RowsAffected INT;
 
    ----------------------------------------------------------------------

    -- 1) DCSA-CONSUME : SEC-ADDITIONAL/1  ->  SEC-ROLEPATH/2

    ----------------------------------------------------------------------

    UPDATE dbo.HuddlePlacements

        SET [PathSection] = N'SEC-ROLEPATH', [Sequence] = 2

        WHERE [ExternalId] = N'DCSA-CONSUME'

          AND [PathSection] = N'SEC-ADDITIONAL' AND [Sequence] = 1;

    SET @RowsAffected = @@ROWCOUNT;
 
    IF @RowsAffected = 0

    BEGIN

        IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements

                   WHERE [ExternalId] = N'DCSA-CONSUME' AND [PathSection] = N'SEC-ROLEPATH' AND [Sequence] = 2)

            PRINT 'DCSA-CONSUME: already at target (SEC-ROLEPATH/2) - no-op, idempotent re-run.';

        ELSE

            THROW 51001, 'DCSA-CONSUME: row not found in the expected current state (SEC-ADDITIONAL/1). Aborting - do not proceed.', 1;

    END

    ELSE IF @RowsAffected > 1

        THROW 51011, 'DCSA-CONSUME: matched more than one row. ExternalId should be unique. Aborting.', 1;

    ELSE

        PRINT 'DCSA-CONSUME: updated SEC-ADDITIONAL/1 -> SEC-ROLEPATH/2';
 
    ----------------------------------------------------------------------

    -- 2) DSE-ARCH : SEC-ADDITIONAL/1  ->  SEC-ROLEPATH/3

    ----------------------------------------------------------------------

    UPDATE dbo.HuddlePlacements

        SET [PathSection] = N'SEC-ROLEPATH', [Sequence] = 3

        WHERE [ExternalId] = N'DSE-ARCH'

          AND [PathSection] = N'SEC-ADDITIONAL' AND [Sequence] = 1;

    SET @RowsAffected = @@ROWCOUNT;
 
    IF @RowsAffected = 0

    BEGIN

        IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements

                   WHERE [ExternalId] = N'DSE-ARCH' AND [PathSection] = N'SEC-ROLEPATH' AND [Sequence] = 3)

            PRINT 'DSE-ARCH: already at target (SEC-ROLEPATH/3) - no-op, idempotent re-run.';

        ELSE

            THROW 51002, 'DSE-ARCH: row not found in the expected current state (SEC-ADDITIONAL/1). Aborting - do not proceed.', 1;

    END

    ELSE IF @RowsAffected > 1

        THROW 51012, 'DSE-ARCH: matched more than one row. ExternalId should be unique. Aborting.', 1;

    ELSE

        PRINT 'DSE-ARCH: updated SEC-ADDITIONAL/1 -> SEC-ROLEPATH/3';
 
    ----------------------------------------------------------------------

    -- 3) PSS-JOINTPLAN : SEC-ADDITIONAL/2  ->  SEC-ROLEPATH/2

    ----------------------------------------------------------------------

    UPDATE dbo.HuddlePlacements

        SET [PathSection] = N'SEC-ROLEPATH', [Sequence] = 2

        WHERE [ExternalId] = N'PSS-JOINTPLAN'

          AND [PathSection] = N'SEC-ADDITIONAL' AND [Sequence] = 2;

    SET @RowsAffected = @@ROWCOUNT;
 
    IF @RowsAffected = 0

    BEGIN

        IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements

                   WHERE [ExternalId] = N'PSS-JOINTPLAN' AND [PathSection] = N'SEC-ROLEPATH' AND [Sequence] = 2)

            PRINT 'PSS-JOINTPLAN: already at target (SEC-ROLEPATH/2) - no-op, idempotent re-run.';

        ELSE

            THROW 51003, 'PSS-JOINTPLAN: row not found in the expected current state (SEC-ADDITIONAL/2). Aborting - do not proceed.', 1;

    END

    ELSE IF @RowsAffected > 1

        THROW 51013, 'PSS-JOINTPLAN: matched more than one row. ExternalId should be unique. Aborting.', 1;

    ELSE

        PRINT 'PSS-JOINTPLAN: updated SEC-ADDITIONAL/2 -> SEC-ROLEPATH/2';
 
    ----------------------------------------------------------------------

    -- 4) PSS-PARTNER : SEC-ADDITIONAL/1  ->  SEC-ROLEPATH/3

    ----------------------------------------------------------------------

    UPDATE dbo.HuddlePlacements

        SET [PathSection] = N'SEC-ROLEPATH', [Sequence] = 3

        WHERE [ExternalId] = N'PSS-PARTNER'

          AND [PathSection] = N'SEC-ADDITIONAL' AND [Sequence] = 1;

    SET @RowsAffected = @@ROWCOUNT;
 
    IF @RowsAffected = 0

    BEGIN

        IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements

                   WHERE [ExternalId] = N'PSS-PARTNER' AND [PathSection] = N'SEC-ROLEPATH' AND [Sequence] = 3)

            PRINT 'PSS-PARTNER: already at target (SEC-ROLEPATH/3) - no-op, idempotent re-run.';

        ELSE

            THROW 51004, 'PSS-PARTNER: row not found in the expected current state (SEC-ADDITIONAL/1). Aborting - do not proceed.', 1;

    END

    ELSE IF @RowsAffected > 1

        THROW 51014, 'PSS-PARTNER: matched more than one row. ExternalId should be unique. Aborting.', 1;

    ELSE

        PRINT 'PSS-PARTNER: updated SEC-ADDITIONAL/1 -> SEC-ROLEPATH/3';
 
    ----------------------------------------------------------------------

    -- Final in-transaction safety net: re-check the unique-index

    -- constraint area (role, section, sequence) has no duplicates among

    -- the rows touched. This should never fire given the pre-check in

    -- Step 2, but costs nothing to assert.

    ----------------------------------------------------------------------

    IF EXISTS (

        SELECT [HuddleSegmentRoleId], [PathSection], [Sequence]

        FROM dbo.HuddlePlacements

        WHERE [ExternalId] IN (N'DCSA-CONSUME', N'DSE-ARCH', N'PSS-JOINTPLAN', N'PSS-PARTNER')

           OR [HuddleSegmentRoleId] IN (

                SELECT [Id] FROM dbo.HuddleSegmentRoles

                WHERE [ExternalId] IN (N'SR-SMEC-DCSA', N'SR-SMEC-DSE', N'SR-SMEC-PSS')

              )

        GROUP BY [HuddleSegmentRoleId], [PathSection], [Sequence]

        HAVING COUNT(*) > 1

    )

        THROW 51099, 'Post-update duplicate (HuddleSegmentRoleId, PathSection, Sequence) detected. Aborting - this should be impossible; investigate.', 1;
 
    PRINT '';

    PRINT 'All 4 rows processed without error. Transaction is OPEN - nothing is committed yet.';

    PRINT 'Now run STEP 4 (below) to review the after-state, then run STEP 5 to COMMIT or ROLLBACK.';
 
END TRY

BEGIN CATCH

    IF @@TRANCOUNT > 0

        ROLLBACK TRANSACTION;
 
    PRINT '*** ERROR - transaction rolled back. No changes were committed. ***';

    THROW;

END CATCH;
 
 






/*step 4*/
SELECT
    p.ExternalId,
    r.ExternalId AS RoleExternalId,
    p.PathSection,
    p.Sequence AS Week,
    p.RoleTopicName,
    p.HuddleTopicId,
    p.IsActive
FROM dbo.HuddlePlacements p
INNER JOIN dbo.HuddleSegmentRoles r
    ON r.Id = p.HuddleSegmentRoleId
WHERE p.ExternalId IN (
    'DCSA-CONSUME',
    'DSE-ARCH',
    'PSS-JOINTPLAN',
    'PSS-PARTNER'
)
ORDER BY p.ExternalId;






/*step 5*/
COMMIT TRANSACTION PatchHuddlePlacements;